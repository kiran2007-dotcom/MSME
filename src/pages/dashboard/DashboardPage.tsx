import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  CalendarCheck,
  CheckCircle2,
  Clock,
  FileText,
  IndianRupee,
  Plus,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet,
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
import {
  AnimatedINR,
  EmptyState,
  StatCard,
  TableSkeleton,
} from '../../components/ui/Primitives.tsx';
import { TransactionModal } from '../../components/TransactionModal.tsx';
import { useAuth } from '../../hooks/useAuth.tsx';
import { useBusiness } from '../../hooks/useBusiness.tsx';
import { createTransaction, toggleReminderStatus } from '../../services/financeService.ts';
import type { TransactionInput } from '../../types/index.ts';
import { formatDateDisplay, formatINR } from '../../utils/formatters.ts';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getFormattedToday(): string {
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());
}

function computeMonthDelta(values: number[]): string | undefined {
  if (values.length < 2) return undefined;
  const prev = values[values.length - 2];
  const curr = values[values.length - 1];
  if (prev === 0 && curr === 0) return undefined;
  if (prev === 0) return 'Active this month';
  const pct = Math.round(((curr - prev) / Math.abs(prev)) * 100);
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct}% vs prior month`;
}

export function DashboardPage() {
  const { firebaseUser } = useAuth();
  const {
    activeBusiness,
    transactions,
    invoices,
    reminders,
    dataLoaded,
    metrics,
    monthlySeries,
  } = useBusiness();
  const [txModalOpen, setTxModalOpen] = useState(false);

  const firstName = useMemo(() => {
    const raw =
      activeBusiness?.ownerName ||
      firebaseUser?.displayName ||
      firebaseUser?.email?.split('@')[0] ||
      'Founder';
    return raw.trim().split(/\s+/)[0];
  }, [activeBusiness?.ownerName, firebaseUser?.displayName, firebaseUser?.email]);

  const recentTransactions = transactions.slice(0, 6);
  const upcomingReminders = reminders.filter((r) => r.status === 'upcoming').slice(0, 4);
  const outstandingInvoices = useMemo(
    () => invoices.filter((inv) => inv.status === 'sent' || inv.status === 'overdue').slice(0, 4),
    [invoices]
  );

  const revenuePoints = useMemo(() => monthlySeries.map((m) => m.revenue), [monthlySeries]);
  const expensePoints = useMemo(() => monthlySeries.map((m) => m.expenses), [monthlySeries]);
  const profitPoints = useMemo(() => monthlySeries.map((m) => m.netCashFlow), [monthlySeries]);

  const healthIndicators = useMemo(() => {
    const hasLedger = metrics.totalRevenue > 0 || metrics.totalExpenses > 0;
    const operatingMargin =
      metrics.totalRevenue > 0
        ? Math.round((metrics.netProfit / metrics.totalRevenue) * 100)
        : null;

    const settledInvoicesCount = invoices.filter((i) => i.status === 'paid').length;
    const invoiceCollectionRate =
      invoices.length > 0 ? Math.round((settledInvoicesCount / invoices.length) * 100) : null;

    const completedRemindersCount = reminders.filter((r) => r.status === 'completed').length;
    const complianceProgress =
      reminders.length > 0
        ? Math.round((completedRemindersCount / reminders.length) * 100)
        : null;

    return {
      hasLedger,
      operatingMargin,
      invoiceCollectionRate,
      complianceProgress,
    };
  }, [metrics.totalRevenue, metrics.totalExpenses, metrics.netProfit, invoices, reminders]);

  const handleCreateTransaction = async (values: TransactionInput) => {
    if (!activeBusiness || !firebaseUser) return;
    await createTransaction(activeBusiness.id, firebaseUser.uid, values);
  };

  const handleCompleteReminder = async (reminderId: string) => {
    if (!activeBusiness) return;
    await toggleReminderStatus(activeBusiness.id, reminderId, 'completed');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Personalized Top Banner */}
        <section className="bg-white dark:bg-[#162036] border border-slate-200/90 dark:border-slate-800 rounded-xl p-6 shadow-fintech">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div>
              <p className="text-xs font-medium text-[#718096] dark:text-slate-400">
                {getFormattedToday()}
                {activeBusiness ? ` · ${activeBusiness.city}, ${activeBusiness.state}` : ''}
              </p>
              <h1 className="mt-1 text-2xl sm:text-[28px] font-bold tracking-tight text-[#25334B] dark:text-white">
                {getGreeting()}, {firstName}
              </h1>
              <p className="mt-1 text-sm text-[#718096] dark:text-slate-400">
                {activeBusiness
                  ? `Here is the live financial and compliance position for ${activeBusiness.businessName}.`
                  : 'Your real-time MSME financial and compliance workspace.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Link
                to="/app/assistant"
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-[#F6F8FC] dark:bg-[#131C31] hover:bg-[#EDF4FF] dark:hover:bg-slate-800 text-xs font-semibold text-[#25334B] dark:text-slate-200 transition-colors whitespace-nowrap"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#8A76D6]" />
                <span>Ask AI Advisor</span>
              </Link>
              <Link
                to="/app/invoices"
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162036] hover:bg-[#F6F8FC] dark:hover:bg-slate-800 text-xs font-semibold text-[#25334B] dark:text-slate-200 transition-colors whitespace-nowrap"
              >
                <FileText className="w-3.5 h-3.5 text-[#3768D9]" />
                <span>New Invoice</span>
              </Link>
              <button
                type="button"
                onClick={() => setTxModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#3768D9] hover:bg-[#254EAA] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Log Transaction</span>
              </button>
            </div>
          </div>
        </section>

        {/* Signature Colour-Coded KPI Grid */}
        <section
          aria-label="Financial KPIs"
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
        >
          <StatCard
            label="Total Revenue"
            value={formatINR(metrics.totalRevenue)}
            numericValue={metrics.totalRevenue}
            subtext="Completed income records"
            variant="blue"
            icon={<TrendingUp className="w-5 h-5" />}
            deltaText={computeMonthDelta(revenuePoints)}
            trendPoints={revenuePoints}
          />
          <StatCard
            label="Net Profit"
            value={formatINR(metrics.netProfit)}
            numericValue={metrics.netProfit}
            subtext="Revenue minus expenses"
            variant="emerald"
            icon={<IndianRupee className="w-5 h-5" />}
            deltaText={computeMonthDelta(profitPoints)}
            trendPoints={profitPoints}
          />
          <StatCard
            label="Total Expenses"
            value={formatINR(metrics.totalExpenses)}
            numericValue={metrics.totalExpenses}
            subtext="Completed expense records"
            variant="coral"
            icon={<TrendingDown className="w-5 h-5" />}
            deltaText={computeMonthDelta(expensePoints)}
            trendPoints={expensePoints}
          />
          <StatCard
            label="Outstanding Payments"
            value={formatINR(metrics.outstandingPayments)}
            numericValue={metrics.outstandingPayments}
            subtext="Sent/overdue invoices & pending inflows"
            variant="amber"
            icon={<Clock className="w-5 h-5" />}
          />
        </section>

        {/* Chart + Cash Flow & Health Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white dark:bg-[#162036] border border-slate-200/90 dark:border-slate-800 rounded-xl p-6 shadow-fintech">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="text-base font-semibold text-[#25334B] dark:text-white">
                  Monthly Revenue vs Expenses
                </h2>
                <p className="text-xs text-[#718096] dark:text-slate-400">
                  Derived directly from settled ledger records in Cloud Firestore
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="inline-flex items-center gap-1.5 text-[#25334B] dark:text-slate-300 font-medium">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#3768D9]" />
                  Revenue
                </span>
                <span className="inline-flex items-center gap-1.5 text-[#25334B] dark:text-slate-300 font-medium">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#EE806B]" />
                  Expenses
                </span>
                <Link
                  to="/app/finance"
                  className="font-semibold text-[#3768D9] dark:text-[#55A9D8] hover:underline whitespace-nowrap"
                >
                  Open Ledger
                </Link>
              </div>
            </div>

            {!dataLoaded ? (
              <div className="h-68 rounded-lg bg-[#F6F8FC] dark:bg-slate-800 animate-pulse" />
            ) : monthlySeries.length === 0 ? (
              <div className="h-68 flex flex-col items-center justify-center text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-[#F6F8FC]/60 dark:bg-[#131C31] px-4">
                <div className="w-11 h-11 rounded-xl bg-[#EDF4FF] dark:bg-[#3768D9]/20 text-[#3768D9] dark:text-[#55A9D8] flex items-center justify-center mb-3">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-[#25334B] dark:text-slate-100">
                  No monthly financial activity recorded yet
                </p>
                <p className="mt-1 text-xs text-[#718096] dark:text-slate-400 max-w-sm">
                  Log your first settled income or expense entry to visualize real monthly cash flow.
                </p>
                <button
                  type="button"
                  onClick={() => setTxModalOpen(true)}
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#3768D9] hover:bg-[#254EAA] text-white text-xs font-semibold cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Record First Transaction</span>
                </button>
              </div>
            ) : (
              <div className="h-68 w-full">
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
                        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)',
                      }}
                    />
                    <Bar dataKey="revenue" name="Revenue" fill="#3768D9" radius={[5, 5, 0, 0]} maxBarSize={36} />
                    <Bar dataKey="expenses" name="Expenses" fill="#EE806B" radius={[5, 5, 0, 0]} maxBarSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 bg-white dark:bg-[#162036] border border-slate-200/90 dark:border-slate-800 rounded-xl p-6 shadow-fintech flex flex-col justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#25334B] dark:text-white">
                Cash Flow & GST Position
              </h2>
              <p className="text-xs text-[#718096] dark:text-slate-400">
                Real-time settlement and GST breakdown
              </p>

              <dl className="mt-5 space-y-3.5">
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <dt className="text-xs text-[#718096] dark:text-slate-400">Settled Inflows</dt>
                  <dd className="text-sm font-semibold text-[#22A58B] dark:text-emerald-300">
                    <AnimatedINR value={metrics.totalRevenue} />
                  </dd>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <dt className="text-xs text-[#718096] dark:text-slate-400">Settled Outflows</dt>
                  <dd className="text-sm font-semibold text-[#25334B] dark:text-slate-100">
                    <AnimatedINR value={metrics.totalExpenses} />
                  </dd>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <dt className="text-xs text-[#718096] dark:text-slate-400">Pending Payables</dt>
                  <dd className="text-sm font-semibold text-[#D49218] dark:text-[#F4B544]">
                    <AnimatedINR value={metrics.pendingExpenses} />
                  </dd>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <dt className="text-xs text-[#718096] dark:text-slate-400">GST Output Collected</dt>
                  <dd className="text-sm font-semibold text-[#3768D9] dark:text-[#55A9D8]">
                    <AnimatedINR value={metrics.totalGstCollected} />
                  </dd>
                </div>
                <div className="flex items-center justify-between py-2">
                  <dt className="text-xs text-[#718096] dark:text-slate-400">GST Input Credit</dt>
                  <dd className="text-sm font-semibold text-[#25334B] dark:text-slate-100">
                    <AnimatedINR value={metrics.totalGstInput} />
                  </dd>
                </div>
              </dl>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-[#718096] dark:text-slate-400">
              <span>Settled Ledger Entries</span>
              <span className="font-mono font-semibold text-[#25334B] dark:text-slate-100 tabular-nums">
                {metrics.completedTransactionsCount}
              </span>
            </div>
          </div>
        </div>

        {/* Business Health + AI Insights + Outstanding Invoices */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Business Health Overview */}
          <div className="lg:col-span-4 bg-white dark:bg-[#162036] border border-slate-200/90 dark:border-slate-800 rounded-xl p-6 shadow-fintech">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-[#22A58B]/20 text-[#22A58B] flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-[#25334B] dark:text-white">
                    Business Health Indicators
                  </h2>
                  <p className="text-[11px] text-[#718096] dark:text-slate-400">
                    Calculated from live workspace data
                  </p>
                </div>
              </div>
              <Link
                to="/app/loan-readiness"
                className="text-xs font-semibold text-[#3768D9] dark:text-[#55A9D8] hover:underline"
              >
                Readiness
              </Link>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[#718096] dark:text-slate-400">Operating Margin</span>
                  <span className="font-mono font-semibold text-[#25334B] dark:text-slate-100 tabular-nums">
                    {healthIndicators.operatingMargin !== null
                      ? `${healthIndicators.operatingMargin}%`
                      : 'No revenue yet'}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[#F6F8FC] dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#22A58B] transition-all duration-300"
                    style={{
                      width: `${Math.max(0, Math.min(100, healthIndicators.operatingMargin ?? 0))}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[#718096] dark:text-slate-400">Invoice Collection Rate</span>
                  <span className="font-mono font-semibold text-[#25334B] dark:text-slate-100 tabular-nums">
                    {healthIndicators.invoiceCollectionRate !== null
                      ? `${healthIndicators.invoiceCollectionRate}%`
                      : 'No invoices yet'}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[#F6F8FC] dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#3768D9] transition-all duration-300"
                    style={{
                      width: `${healthIndicators.invoiceCollectionRate ?? 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[#718096] dark:text-slate-400">Compliance Completion</span>
                  <span className="font-mono font-semibold text-[#25334B] dark:text-slate-100 tabular-nums">
                    {healthIndicators.complianceProgress !== null
                      ? `${healthIndicators.complianceProgress}%`
                      : 'No reminders yet'}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[#F6F8FC] dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#8A76D6] transition-all duration-300"
                    style={{
                      width: `${healthIndicators.complianceProgress ?? 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 p-3.5 rounded-lg bg-[#EDF4FF] dark:bg-[#3768D9]/15 border border-[#3768D9]/20 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-[#3768D9] dark:text-[#55A9D8] shrink-0 mt-0.5" />
              <div className="text-xs text-[#25334B] dark:text-slate-200 leading-relaxed">
                {metrics.outstandingPayments > 0 ? (
                  <span>
                    You have{' '}
                    <strong className="font-mono tabular-nums">
                      {formatINR(metrics.outstandingPayments)}
                    </strong>{' '}
                    in pending receivables. Ask SAATHI AI for MSME 45-day follow-up templates.
                  </span>
                ) : (
                  <span>
                    Ask MSME SAATHI AI to review your GST obligations or prepare a CGTMSE credit
                    checklist.
                  </span>
                )}
                <Link
                  to="/app/assistant"
                  className="mt-1.5 inline-flex items-center gap-1 font-semibold text-[#3768D9] dark:text-[#55A9D8] hover:underline"
                >
                  <span>Open AI Assistant</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Outstanding Invoices */}
          <div className="lg:col-span-4 bg-white dark:bg-[#162036] border border-slate-200/90 dark:border-slate-800 rounded-xl p-6 shadow-fintech flex flex-col">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="text-sm font-semibold text-[#25334B] dark:text-white">
                  Pending Invoices
                </h2>
                <p className="text-[11px] text-[#718096] dark:text-slate-400">
                  Sent & overdue receivables
                </p>
              </div>
              <Link
                to="/app/invoices"
                className="text-xs font-semibold text-[#3768D9] dark:text-[#55A9D8] hover:underline"
              >
                Manage
              </Link>
            </div>

            {!dataLoaded ? (
              <TableSkeleton rows={3} />
            ) : outstandingInvoices.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-8 px-4 rounded-lg bg-[#F6F8FC] dark:bg-[#131C31] border border-dashed border-slate-200 dark:border-slate-800">
                <FileText className="w-6 h-6 text-[#3768D9] dark:text-[#55A9D8] mb-2" />
                <p className="text-xs font-semibold text-[#25334B] dark:text-slate-200">
                  No unpaid invoices
                </p>
                <p className="mt-1 text-[11px] text-[#718096] dark:text-slate-400">
                  Issued invoices awaiting payment will appear here.
                </p>
                <Link
                  to="/app/invoices"
                  className="mt-3 text-xs font-semibold text-[#3768D9] dark:text-[#55A9D8] hover:underline"
                >
                  Create Invoice
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {outstandingInvoices.map((inv) => (
                  <div key={inv.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#25334B] dark:text-slate-100 truncate">
                        {inv.customerName}
                      </p>
                      <p className="text-[11px] text-[#718096] dark:text-slate-400 font-mono">
                        {inv.invoiceNumber} · Due {formatDateDisplay(inv.dueDate)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-mono font-semibold text-[#25334B] dark:text-slate-100 tabular-nums">
                        {formatINR(inv.totalAmount)}
                      </p>
                      <span
                        className={`inline-block mt-0.5 px-1.5 py-0.5 rounded-sm text-[10px] font-semibold uppercase ${
                          inv.status === 'overdue'
                            ? 'bg-orange-50 dark:bg-[#EE806B]/20 text-[#C85641] dark:text-[#F49D8B]'
                            : 'bg-amber-50 dark:bg-[#F4B544]/20 text-[#B2760B] dark:text-[#F4B544]'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Compliance Reminders */}
          <div className="lg:col-span-4 bg-white dark:bg-[#162036] border border-slate-200/90 dark:border-slate-800 rounded-xl p-6 shadow-fintech flex flex-col">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="text-sm font-semibold text-[#25334B] dark:text-white">
                  Compliance Reminders
                </h2>
                <p className="text-[11px] text-[#718096] dark:text-slate-400">
                  Upcoming statutory deadlines
                </p>
              </div>
              <Link
                to="/app/compliance"
                className="text-xs font-semibold text-[#3768D9] dark:text-[#55A9D8] hover:underline"
              >
                View all
              </Link>
            </div>

            {!dataLoaded ? (
              <TableSkeleton rows={3} />
            ) : upcomingReminders.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-8 px-4 rounded-lg bg-[#F6F8FC] dark:bg-[#131C31] border border-dashed border-slate-200 dark:border-slate-800">
                <CalendarCheck className="w-6 h-6 text-[#22A58B] mb-2" />
                <p className="text-xs font-semibold text-[#25334B] dark:text-slate-200">
                  No upcoming reminders
                </p>
                <p className="mt-1 text-[11px] text-[#718096] dark:text-slate-400">
                  Schedule GST, TDS, or vendor payment reminders in Compliance.
                </p>
                <Link
                  to="/app/compliance"
                  className="mt-3 text-xs font-semibold text-[#3768D9] dark:text-[#55A9D8] hover:underline"
                >
                  Add Reminder
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {upcomingReminders.map((rem) => (
                  <div key={rem.id} className="py-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#25334B] dark:text-slate-100 truncate">
                        {rem.title}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#718096] dark:text-slate-400">
                        {rem.category} · Due {formatDateDisplay(rem.dueDate)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleCompleteReminder(rem.id)}
                      title="Mark completed"
                      className="p-1.5 rounded-lg text-[#718096] hover:text-[#22A58B] hover:bg-[#F6F8FC] dark:hover:bg-slate-800 cursor-pointer shrink-0 transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions + Business Profile Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-[#25334B] dark:text-white">
                Recent Transactions
              </h2>
              <Link
                to="/app/finance"
                className="text-xs font-semibold text-[#3768D9] dark:text-[#55A9D8] hover:underline"
              >
                See full ledger
              </Link>
            </div>

            {!dataLoaded ? (
              <TableSkeleton rows={4} />
            ) : recentTransactions.length === 0 ? (
              <EmptyState
                icon={<Wallet className="w-5 h-5" />}
                title="No transactions recorded yet"
                description="Add your sales receipts, client payments, or vendor expenses to build your live financial ledger."
                action={
                  <button
                    type="button"
                    onClick={() => setTxModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#3768D9] hover:bg-[#254EAA] text-white text-xs font-semibold cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Log Transaction</span>
                  </button>
                }
              />
            ) : (
              <div className="bg-white dark:bg-[#162036] border border-slate-200/90 dark:border-slate-800 rounded-xl overflow-hidden shadow-fintech">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-[#F6F8FC] dark:bg-[#131C31] text-xs text-[#718096] dark:text-slate-400">
                        <th className="py-3 px-4 font-semibold">Date</th>
                        <th className="py-3 px-4 font-semibold">Details</th>
                        <th className="py-3 px-4 font-semibold">Status</th>
                        <th className="py-3 px-4 font-semibold text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                      {recentTransactions.map((tx) => (
                        <tr
                          key={tx.id}
                          className="hover:bg-[#F6F8FC]/70 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-3 px-4 text-xs text-[#718096] dark:text-slate-400 whitespace-nowrap font-mono">
                            {formatDateDisplay(tx.date)}
                          </td>
                          <td className="py-3 px-4 min-w-[180px]">
                            <p className="text-sm font-medium text-[#25334B] dark:text-slate-100 truncate max-w-[240px]">
                              {tx.description}
                            </p>
                            <p className="text-xs text-[#718096] dark:text-slate-400">
                              {tx.category}
                              {tx.counterparty ? ` · ${tx.counterparty}` : ''}
                            </p>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-medium capitalize ${
                                tx.status === 'completed'
                                  ? 'bg-emerald-50 dark:bg-[#22A58B]/20 text-[#187D69] dark:text-emerald-300'
                                  : 'bg-amber-50 dark:bg-[#F4B544]/20 text-[#B2760B] dark:text-[#F4B544]'
                              }`}
                            >
                              {tx.status}
                            </span>
                          </td>
                          <td
                            className={`py-3 px-4 text-right font-mono font-semibold tabular-nums whitespace-nowrap ${
                              tx.type === 'income'
                                ? 'text-[#22A58B] dark:text-emerald-300'
                                : 'text-[#25334B] dark:text-slate-100'
                            }`}
                          >
                            {tx.type === 'income' ? '+' : '-'}
                            {formatINR(tx.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Business Profile Summary */}
          <div className="lg:col-span-4 bg-white dark:bg-[#162036] border border-slate-200/90 dark:border-slate-800 rounded-xl p-6 shadow-fintech h-fit">
            <div className="flex items-center justify-between gap-2 pb-3.5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#EDF4FF] dark:bg-[#3768D9]/20 text-[#3768D9] dark:text-[#55A9D8] flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-semibold text-[#25334B] dark:text-white">
                  Business Profile
                </h2>
              </div>
              <Link
                to="/app/settings"
                className="text-xs font-semibold text-[#3768D9] dark:text-[#55A9D8] hover:underline"
              >
                Edit Profile
              </Link>
            </div>

            {activeBusiness ? (
              <dl className="mt-4 space-y-2.5 text-xs">
                <div className="flex justify-between gap-3">
                  <dt className="text-[#718096] dark:text-slate-400">Business Name</dt>
                  <dd className="font-semibold text-[#25334B] dark:text-slate-100 text-right">
                    {activeBusiness.businessName}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[#718096] dark:text-slate-400">Owner</dt>
                  <dd className="font-medium text-[#25334B] dark:text-slate-100 text-right">
                    {activeBusiness.ownerName}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[#718096] dark:text-slate-400">Entity & Size</dt>
                  <dd className="font-medium text-[#25334B] dark:text-slate-100 text-right">
                    {activeBusiness.businessType} · {activeBusiness.businessSize}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[#718096] dark:text-slate-400">Location</dt>
                  <dd className="font-medium text-[#25334B] dark:text-slate-100 text-right">
                    {activeBusiness.city}, {activeBusiness.state} ({activeBusiness.pincode})
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[#718096] dark:text-slate-400">Registration</dt>
                  <dd className="font-medium text-[#25334B] dark:text-slate-100 text-right">
                    {activeBusiness.registrationStatus}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[#718096] dark:text-slate-400">GSTIN</dt>
                  <dd className="font-mono text-[#25334B] dark:text-slate-100 text-right">
                    {activeBusiness.gstin || 'Not provided'}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[#718096] dark:text-slate-400">Udyam Number</dt>
                  <dd className="font-mono text-[#25334B] dark:text-slate-100 text-right">
                    {activeBusiness.udyamNumber || 'Not provided'}
                  </dd>
                </div>
              </dl>
            ) : (
              <div className="py-6 text-xs text-[#718096] flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>Loading business profile...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <TransactionModal
        open={txModalOpen}
        onClose={() => setTxModalOpen(false)}
        onSubmit={handleCreateTransaction}
      />
    </DashboardLayout>
  );
}
