import {
  Download,
  FileSpreadsheet,
  IndianRupee,
  Printer,
  ReceiptIndianRupee,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DashboardLayout } from '../../layouts/DashboardLayout.tsx';
import { EmptyState, PageHeader, StatCard } from '../../components/ui/Primitives.tsx';
import { useBusiness } from '../../hooks/useBusiness.tsx';
import { downloadCSV, formatINR } from '../../utils/formatters.ts';

export function ReportsPage() {
  const { activeBusiness, transactions, invoices, metrics, monthlySeries } = useBusiness();

  const handleExportTransactions = () => {
    if (!activeBusiness || transactions.length === 0) return;
    downloadCSV(
      `${activeBusiness.businessName.replace(/\s+/g, '_')}_transactions.csv`,
      ['Date', 'Type', 'Category', 'Description', 'Counterparty', 'Method', 'Status', 'Amount (INR)', 'GST (INR)'],
      transactions.map((t) => [
        t.date,
        t.type,
        t.category,
        t.description,
        t.counterparty,
        t.paymentMethod,
        t.status,
        t.amount,
        t.gstAmount,
      ])
    );
  };

  const handleExportInvoices = () => {
    if (!activeBusiness || invoices.length === 0) return;
    downloadCSV(
      `${activeBusiness.businessName.replace(/\s+/g, '_')}_invoices.csv`,
      ['Invoice Number', 'Customer', 'Customer GSTIN', 'Issue Date', 'Due Date', 'Status', 'Subtotal (INR)', 'GST (INR)', 'Total (INR)'],
      invoices.map((inv) => [
        inv.invoiceNumber,
        inv.customerName,
        inv.customerGstin,
        inv.issueDate,
        inv.dueDate,
        inv.status,
        inv.subtotal,
        inv.gstAmount,
        inv.totalAmount,
      ])
    );
  };

  const handlePrintSummary = () => {
    if (!activeBusiness) return;
    const rowsHtml = monthlySeries
      .map(
        (r) =>
          `<tr><td>${r.label}</td><td class="r">${formatINR(r.revenue)}</td><td class="r">${formatINR(
            r.expenses
          )}</td><td class="r">${formatINR(r.netCashFlow)}</td></tr>`
      )
      .join('');
    const html = `<!doctype html><html><head><meta charset="utf-8"/><title>Financial Report - ${
      activeBusiness.businessName
    }</title><style>body{font-family:Inter,system-ui,sans-serif;margin:40px;color:#25334B;}h1{color:#254EAA;margin-bottom:4px;}.sub{color:#718096;font-size:13px;margin-bottom:24px;}.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px;}.kpi{background:#F6F8FC;padding:12px;border-radius:8px;border:1px solid #e2e8f0;}.klabel{font-size:11px;color:#718096;}.kval{font-size:16px;font-weight:700;margin-top:4px;}table{width:100%;border-collapse:collapse;}th{background:#EDF4FF;text-align:left;padding:10px;font-size:12px;}td{padding:10px;border-bottom:1px solid #e2e8f0;font-size:13px;}.r{text-align:right;}</style></head><body><h1>${
      activeBusiness.businessName
    } — Financial Summary</h1><div class="sub">${activeBusiness.city}, ${
      activeBusiness.state
    } ${
      activeBusiness.gstin ? `· GSTIN: ${activeBusiness.gstin}` : ''
    }</div><div class="kpis"><div class="kpi"><div class="klabel">Settled Revenue</div><div class="kval">${formatINR(
      metrics.totalRevenue
    )}</div></div><div class="kpi"><div class="klabel">Settled Expenses</div><div class="kval">${formatINR(
      metrics.totalExpenses
    )}</div></div><div class="kpi"><div class="klabel">Net Profit</div><div class="kval">${formatINR(
      metrics.netProfit
    )}</div></div><div class="kpi"><div class="klabel">Net GST Liability</div><div class="kval">${formatINR(
      metrics.totalGstCollected - metrics.totalGstInput
    )}</div></div></div><table><thead><tr><th>Month</th><th class="r">Revenue</th><th class="r">Expenses</th><th class="r">Net Cash Flow</th></tr></thead><tbody>${rowsHtml}</tbody></table></body></html>`;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => iframe.remove(), 1500);
      }, 200);
    } else {
      iframe.remove();
    }
  };

  const hasData = transactions.length > 0 || invoices.length > 0;
  const netGst = metrics.totalGstCollected - metrics.totalGstInput;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Financial Reports & Exports"
          description="Profit & loss summary and GST ledger totals derived directly from your Firestore records."
          actions={
            hasData ? (
              <>
                <button
                  type="button"
                  onClick={handlePrintSummary}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162036] text-xs font-semibold text-[#25334B] dark:text-slate-200 hover:bg-[#F6F8FC] dark:hover:bg-slate-800 cursor-pointer whitespace-nowrap transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / PDF Summary</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportTransactions}
                  disabled={transactions.length === 0}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162036] text-xs font-semibold text-[#25334B] dark:text-slate-200 hover:bg-[#F6F8FC] dark:hover:bg-slate-800 cursor-pointer disabled:opacity-40 whitespace-nowrap transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Transactions CSV</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportInvoices}
                  disabled={invoices.length === 0}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-[#3768D9] hover:bg-[#254EAA] text-white text-xs font-semibold cursor-pointer disabled:opacity-40 whitespace-nowrap shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Invoices CSV</span>
                </button>
              </>
            ) : undefined
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Settled Revenue"
            value={formatINR(metrics.totalRevenue)}
            numericValue={metrics.totalRevenue}
            subtext="Total completed inflows"
            variant="blue"
            icon={<TrendingUp className="w-5 h-5" />}
          />
          <StatCard
            label="Settled Expenses"
            value={formatINR(metrics.totalExpenses)}
            numericValue={metrics.totalExpenses}
            subtext="Total completed outflows"
            variant="coral"
            icon={<TrendingDown className="w-5 h-5" />}
          />
          <StatCard
            label="Net Profit"
            value={formatINR(metrics.netProfit)}
            numericValue={metrics.netProfit}
            subtext="Operating surplus / deficit"
            variant="emerald"
            icon={<IndianRupee className="w-5 h-5" />}
          />
          <StatCard
            label="Net GST Liability"
            value={formatINR(netGst)}
            numericValue={netGst}
            subtext="Output GST minus Input GST"
            variant="lavender"
            icon={<ReceiptIndianRupee className="w-5 h-5" />}
          />
        </div>

        {!hasData ? (
          <EmptyState
            icon={<FileSpreadsheet className="w-5 h-5" />}
            title="No financial report data available yet"
            description="Record transactions or issue invoices first. Monthly Profit & Loss statements, visual charts, and CSV exports will populate automatically from your real records."
          />
        ) : (
          <div className="space-y-6">
            {monthlySeries.length > 0 ? (
              <div className="bg-white dark:bg-[#162036] border border-slate-200/90 dark:border-slate-800 rounded-xl p-6 shadow-fintech">
                <h2 className="text-sm font-semibold text-[#25334B] dark:text-white mb-1">
                  Monthly P&L Performance
                </h2>
                <p className="text-xs text-[#718096] dark:text-slate-400 mb-4">
                  Revenue, Expenses, and Net Cash Flow per period
                </p>
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlySeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.18} vertical={false} />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 12, fill: '#718096' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: '#718096' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v: number) =>
                          v >= 1000 ? `₹${Math.round(v / 1000)}k` : `₹${v}`
                        }
                      />
                      <Tooltip
                        formatter={(value) => formatINR(Number(value ?? 0))}
                        contentStyle={{
                          backgroundColor: '#25334B',
                          border: '1px solid #334155',
                          borderRadius: '10px',
                          color: '#FFFFFF',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="revenue" name="Revenue" fill="#3768D9" radius={[4, 4, 0, 0]} maxBarSize={32} />
                      <Bar dataKey="expenses" name="Expenses" fill="#EE806B" radius={[4, 4, 0, 0]} maxBarSize={32} />
                      <Bar dataKey="netCashFlow" name="Net Cash Flow" fill="#22A58B" radius={[4, 4, 0, 0]} maxBarSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : null}

            <div className="bg-white dark:bg-[#162036] border border-slate-200/90 dark:border-slate-800 rounded-xl overflow-hidden shadow-fintech">
              <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-[#F6F8FC] dark:bg-[#131C31]">
                <h2 className="text-sm font-semibold text-[#25334B] dark:text-white">
                  Monthly Profit & Cash Flow Breakdown
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-[#718096] dark:text-slate-400">
                      <th className="py-3 px-4 font-semibold">Month</th>
                      <th className="py-3 px-4 font-semibold text-right">Revenue</th>
                      <th className="py-3 px-4 font-semibold text-right">Expenses</th>
                      <th className="py-3 px-4 font-semibold text-right">Net Cash Flow</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                    {monthlySeries.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-6 px-4 text-center text-xs text-[#718096]">
                          No completed transactions recorded yet. Pending transactions appear once
                          settled.
                        </td>
                      </tr>
                    ) : (
                      monthlySeries.map((row) => (
                        <tr
                          key={row.monthKey}
                          className="hover:bg-[#F6F8FC]/70 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-3 px-4 font-semibold text-[#25334B] dark:text-slate-100">
                            {row.label}
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums text-[#3768D9] dark:text-[#55A9D8]">
                            {formatINR(row.revenue)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums text-[#25334B] dark:text-slate-100">
                            {formatINR(row.expenses)}
                          </td>
                          <td
                            className={`py-3 px-4 text-right font-mono font-semibold tabular-nums ${
                              row.netCashFlow >= 0
                                ? 'text-[#22A58B] dark:text-emerald-300'
                                : 'text-[#C85641] dark:text-[#F49D8B]'
                            }`}
                          >
                            {formatINR(row.netCashFlow)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
