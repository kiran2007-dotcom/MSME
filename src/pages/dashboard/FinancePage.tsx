import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Download,
  IndianRupee,
  Plus,
  Search,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DashboardLayout } from '../../layouts/DashboardLayout.tsx';
import {
  EmptyState,
  PageHeader,
  StatCard,
  TableSkeleton,
} from '../../components/ui/Primitives.tsx';
import { TransactionModal } from '../../components/TransactionModal.tsx';
import { useAuth } from '../../hooks/useAuth.tsx';
import { useBusiness } from '../../hooks/useBusiness.tsx';
import {
  createTransaction,
  deleteTransaction,
  updateTransactionStatus,
} from '../../services/financeService.ts';
import type { TransactionInput, TransactionType } from '../../types/index.ts';
import { downloadCSV, formatDateDisplay, formatINR } from '../../utils/formatters.ts';

export function FinancePage() {
  const { firebaseUser } = useAuth();
  const { activeBusiness, transactions, dataLoaded, metrics, monthlySeries } = useBusiness();
  const [modalOpen, setModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return transactions.filter((tx) => {
      if (filterType !== 'all' && tx.type !== filterType) return false;
      if (!query) return true;
      return (
        tx.description.toLowerCase().includes(query) ||
        tx.category.toLowerCase().includes(query) ||
        tx.counterparty.toLowerCase().includes(query)
      );
    });
  }, [transactions, filterType, search]);

  const handleCreate = async (values: TransactionInput) => {
    if (!activeBusiness || !firebaseUser) return;
    await createTransaction(activeBusiness.id, firebaseUser.uid, values);
  };

  const handleExportCSV = () => {
    if (!activeBusiness || filtered.length === 0) return;
    downloadCSV(
      `${activeBusiness.businessName.replace(/\s+/g, '_')}_ledger.csv`,
      ['Date', 'Type', 'Category', 'Description', 'Counterparty', 'Method', 'Status', 'Amount (INR)', 'GST (INR)'],
      filtered.map((t) => [
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

  const revenuePoints = useMemo(() => monthlySeries.map((m) => m.revenue), [monthlySeries]);
  const expensePoints = useMemo(() => monthlySeries.map((m) => m.expenses), [monthlySeries]);
  const netPoints = useMemo(() => monthlySeries.map((m) => m.netCashFlow), [monthlySeries]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Finance & Cash Flow Ledger"
          description="Track all settled and pending inflows and outflows in Indian Rupees."
          actions={
            <>
              {filtered.length > 0 ? (
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162036] hover:bg-[#F6F8FC] dark:hover:bg-slate-800 text-xs font-semibold text-[#25334B] dark:text-slate-200 cursor-pointer whitespace-nowrap transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#3768D9] hover:bg-[#254EAA] text-white text-xs font-semibold cursor-pointer whitespace-nowrap shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Record Transaction</span>
              </button>
            </>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Completed Revenue"
            value={formatINR(metrics.totalRevenue)}
            numericValue={metrics.totalRevenue}
            subtext="Settled income entries"
            variant="blue"
            icon={<TrendingUp className="w-5 h-5" />}
            trendPoints={revenuePoints}
          />
          <StatCard
            label="Completed Expenses"
            value={formatINR(metrics.totalExpenses)}
            numericValue={metrics.totalExpenses}
            subtext="Settled expense entries"
            variant="coral"
            icon={<TrendingDown className="w-5 h-5" />}
            trendPoints={expensePoints}
          />
          <StatCard
            label="Net Operating Profit"
            value={formatINR(metrics.netProfit)}
            numericValue={metrics.netProfit}
            subtext="Derived from ledger"
            variant="emerald"
            icon={<IndianRupee className="w-5 h-5" />}
            trendPoints={netPoints}
          />
        </div>

        {/* Monthly Net Cash Flow Area Chart (shown only when real records exist) */}
        {monthlySeries.length > 0 ? (
          <div className="bg-white dark:bg-[#162036] border border-slate-200/90 dark:border-slate-800 rounded-xl p-6 shadow-fintech">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-sm font-semibold text-[#25334B] dark:text-white">
                  Monthly Net Cash Flow Trend
                </h2>
                <p className="text-xs text-[#718096] dark:text-slate-400">
                  Net operating surplus or deficit per month
                </p>
              </div>
              <span className="text-xs font-mono font-semibold text-[#3768D9] dark:text-[#55A9D8] tabular-nums">
                {monthlySeries.length} {monthlySeries.length === 1 ? 'month' : 'months'} tracked
              </span>
            </div>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlySeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="cashFlowFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3768D9" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="#3768D9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
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
                      Math.abs(v) >= 1000 ? `₹${Math.round(v / 1000)}k` : `₹${v}`
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
                  <Area
                    type="monotone"
                    dataKey="netCashFlow"
                    name="Net Cash Flow"
                    stroke="#3768D9"
                    strokeWidth={2.2}
                    fillOpacity={1}
                    fill="url(#cashFlowFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-[#F6F8FC] dark:bg-[#131C31] border border-slate-200 dark:border-slate-800 w-fit">
            {(['all', 'income', 'expense'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilterType(tab)}
                className={`px-3.5 py-1.5 rounded-md text-xs font-semibold capitalize transition-colors cursor-pointer ${
                  filterType === tab
                    ? 'bg-white dark:bg-[#162036] text-[#3768D9] dark:text-white shadow-xs'
                    : 'text-[#718096] dark:text-slate-400 hover:text-[#25334B]'
                }`}
              >
                {tab === 'all' ? 'All Entries' : tab}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#718096] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search description, category, counterparty..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162036] text-xs text-[#25334B] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#3768D9]"
            />
          </div>
        </div>

        {!dataLoaded ? (
          <TableSkeleton rows={5} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Wallet className="w-5 h-5" />}
            title={transactions.length === 0 ? 'Your ledger is empty' : 'No matching entries'}
            description={
              transactions.length === 0
                ? 'Start recording sales receipts, bank transfers, and operating expenses to calculate live cash flow.'
                : 'Try clearing your search or switching the transaction type filter.'
            }
            action={
              transactions.length === 0 ? (
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#3768D9] hover:bg-[#254EAA] text-white text-xs font-semibold cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Record First Transaction</span>
                </button>
              ) : undefined
            }
          />
        ) : (
          <div className="bg-white dark:bg-[#162036] border border-slate-200/90 dark:border-slate-800 rounded-xl overflow-hidden shadow-fintech">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-[#F6F8FC] dark:bg-[#131C31] text-xs text-[#718096] dark:text-slate-400">
                    <th className="py-3 px-4 font-semibold">Date</th>
                    <th className="py-3 px-4 font-semibold">Description</th>
                    <th className="py-3 px-4 font-semibold">Category</th>
                    <th className="py-3 px-4 font-semibold">Method</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Amount</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {filtered.map((tx) => (
                    <tr
                      key={tx.id}
                      className="hover:bg-[#F6F8FC]/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 text-xs font-mono text-[#718096] dark:text-slate-400 whitespace-nowrap">
                        {formatDateDisplay(tx.date)}
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm font-medium text-[#25334B] dark:text-slate-100">
                          {tx.description}
                        </p>
                        {tx.counterparty ? (
                          <p className="text-xs text-[#718096] dark:text-slate-400">
                            {tx.counterparty}
                          </p>
                        ) : null}
                      </td>
                      <td className="py-3 px-4 text-xs text-[#25334B] dark:text-slate-300">
                        {tx.category}
                      </td>
                      <td className="py-3 px-4 text-xs text-[#718096] dark:text-slate-300">
                        {tx.paymentMethod}
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
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          {tx.status === 'pending' && activeBusiness ? (
                            <button
                              type="button"
                              onClick={() =>
                                void updateTransactionStatus(activeBusiness.id, tx.id, 'completed')
                              }
                              title="Mark settled"
                              className="p-1.5 rounded-lg text-[#718096] hover:text-[#22A58B] hover:bg-[#F6F8FC] dark:hover:bg-slate-800 cursor-pointer transition-colors"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          ) : null}
                          {activeBusiness ? (
                            <button
                              type="button"
                              onClick={() => void deleteTransaction(activeBusiness.id, tx.id)}
                              title="Delete entry"
                              className="p-1.5 rounded-lg text-[#718096] hover:text-[#EE806B] hover:bg-[#F6F8FC] dark:hover:bg-slate-800 cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <TransactionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
      />
    </DashboardLayout>
  );
}
