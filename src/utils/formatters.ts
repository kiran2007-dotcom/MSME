import type {
  DashboardMetrics,
  Invoice,
  MonthlyChartPoint,
  Transaction,
} from '../types/index.ts';
import { PATTERNS } from '../types/index.ts';

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const inrDetailedFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatINR(amount: number, showDecimals = false): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  return showDecimals ? inrDetailedFormatter.format(safe) : inrFormatter.format(safe);
}

export function formatDateDisplay(isoDate: string): string {
  if (!isoDate || !PATTERNS.ISO_DATE.test(isoDate)) {
    return isoDate || '—';
  }
  const [year, month, day] = isoDate.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  return dateObj.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function getTodayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isValidGSTIN(value: string): boolean {
  if (!value.trim()) return true;
  return PATTERNS.GSTIN.test(value.trim().toUpperCase());
}

export function isValidUdyam(value: string): boolean {
  if (!value.trim()) return true;
  return PATTERNS.UDYAM.test(value.trim().toUpperCase());
}

export function isValidPincode(value: string): boolean {
  return PATTERNS.PINCODE.test(value.trim());
}

export function computeDashboardMetrics(
  transactions: Transaction[],
  invoices: Invoice[]
): DashboardMetrics {
  let totalRevenue = 0;
  let totalExpenses = 0;
  let pendingIncome = 0;
  let pendingExpenses = 0;
  let totalGstCollected = 0;
  let totalGstInput = 0;
  let completedTransactionsCount = 0;

  for (const tx of transactions) {
    if (tx.status === 'completed') {
      completedTransactionsCount += 1;
      if (tx.type === 'income') {
        totalRevenue += tx.amount;
        totalGstCollected += tx.gstAmount;
      } else {
        totalExpenses += tx.amount;
        totalGstInput += tx.gstAmount;
      }
    } else {
      if (tx.type === 'income') {
        pendingIncome += tx.amount;
      } else {
        pendingExpenses += tx.amount;
      }
    }
  }

  let unpaidInvoicesTotal = 0;
  for (const inv of invoices) {
    if (inv.status === 'sent' || inv.status === 'overdue') {
      unpaidInvoicesTotal += inv.totalAmount;
    }
  }

  return {
    totalRevenue,
    totalExpenses,
    netProfit: totalRevenue - totalExpenses,
    outstandingPayments: unpaidInvoicesTotal + pendingIncome,
    pendingExpenses,
    totalGstCollected,
    totalGstInput,
    completedTransactionsCount,
  };
}

export function computeMonthlySeries(transactions: Transaction[]): MonthlyChartPoint[] {
  const buckets = new Map<string, { revenue: number; expenses: number }>();

  for (const tx of transactions) {
    if (tx.status !== 'completed' || !tx.date || tx.date.length < 7) {
      continue;
    }
    const monthKey = tx.date.slice(0, 7);
    const current = buckets.get(monthKey) ?? { revenue: 0, expenses: 0 };
    if (tx.type === 'income') {
      current.revenue += tx.amount;
    } else {
      current.expenses += tx.amount;
    }
    buckets.set(monthKey, current);
  }

  const sortedKeys = Array.from(buckets.keys()).sort();
  return sortedKeys.map((key) => {
    const [year, month] = key.split('-').map(Number);
    const label = new Date(year, month - 1, 1).toLocaleDateString('en-IN', {
      month: 'short',
      year: '2-digit',
    });
    const entry = buckets.get(key)!;
    return {
      monthKey: key,
      label,
      revenue: entry.revenue,
      expenses: entry.expenses,
      netCashFlow: entry.revenue - entry.expenses,
    };
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function downloadCSV(filename: string, headers: string[], rows: Array<Array<string | number>>): void {
  const escapeCell = (cell: string | number): string => {
    const str = String(cell ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvContent = [
    headers.map(escapeCell).join(','),
    ...rows.map((row) => row.map(escapeCell).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
