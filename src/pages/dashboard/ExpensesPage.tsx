import { useMemo, useState } from 'react';
import {
  Clock,
  Download,
  Plus,
  ReceiptIndianRupee,
  Search,
  Trash2,
  TrendingDown,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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
import { createTransaction, deleteTransaction } from '../../services/financeService.ts';
import type { TransactionInput } from '../../types/index.ts';
import { downloadCSV, formatDateDisplay, formatINR } from '../../utils/formatters.ts';

const BAR_COLORS = ['#EE806B', '#F4B544', '#8A76D6', '#55A9D8', '#22A58B', '#3768D9'];

export function ExpensesPage() {
  const { firebaseUser } = useAuth();
  const { activeBusiness, transactions, dataLoaded, metrics, monthlySeries } = useBusiness();
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const expenses = useMemo(
    () => transactions.filter((tx) => tx.type === 'expense'),
    [transactions]
  );

  const categoryTotals = useMemo(() => {
    const map = new Map<string, number>();
    for (const exp of expenses) {
      map.set(exp.category, (map.get(exp.category) ?? 0) + exp.amount);
    }
    return Array.from(map.entries())
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    const query = search.trim().toLowerCase();
    return expenses.filter((exp) => {
      if (selectedCategory !== 'All' && exp.category !== selectedCategory) return false;
      if (!query) return true;
      return (
        exp.description.toLowerCase().includes(query) ||
        exp.category.toLowerCase().includes(query) ||
        exp.counterparty.toLowerCase().includes(query)
      );
    });
  }, [expenses, selectedCategory, search]);

  const expensePoints = useMemo(() => monthlySeries.map((m) => m.expenses), [monthlySeries]);

  const handleCreate = async (values: TransactionInput) => {
    if (!activeBusiness || !firebaseUser) return;
    await createTransaction(activeBusiness.id, firebaseUser.uid, values);
  };

  const handleExportExpenses = () => {
    if (!activeBusiness || filteredExpenses.length === 0) return;
    downloadCSV(
      `${activeBusiness.businessName.replace(/\s+/g, '_')}_expenses.csv`,
      ['Date', 'Category', 'Description', 'Vendor', 'Method', 'Status', 'Amount (INR)', 'Input GST (INR)'],
      filteredExpenses.map((e) => [
        e.date,
        e.category,
        e.description,
        e.counterparty,
        e.paymentMethod,
        e.status,
        e.amount,
        e.gstAmount,
      ])
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Expenses & Input GST"
          description="Monitor operating expenses, vendor bills, category spend, and input GST credits."
          actions={
            <>
              {filteredExpenses.length > 0 ? (
                <button
                  type="button"
                  onClick={handleExportExpenses}
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
                <span>Log Expense</span>
              </button>
            </>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Settled Expenses"
            value={formatINR(metrics.totalExpenses)}
            numericValue={metrics.totalExpenses}
            subtext="Completed expense entries"
            variant="coral"
            icon={<TrendingDown className="w-5 h-5" />}
            trendPoints={expensePoints}
          />
          <StatCard
            label="Pending Payables"
            value={formatINR(metrics.pendingExpenses)}
            numericValue={metrics.pendingExpenses}
            subtext="Unpaid expense obligations"
            variant="amber"
            icon={<Clock className="w-5 h-5" />}
          />
          <StatCard
            label="GST Input Recorded"
            value={formatINR(metrics.totalGstInput)}
            numericValue={metrics.totalGstInput}
            subtext="Eligible input tax recorded"
            variant="lavender"
            icon={<ReceiptIndianRupee className="w-5 h-5" />}
          />
        </div>

        {!dataLoaded ? (
          <TableSkeleton rows={4} />
        ) : expenses.length === 0 ? (
          <EmptyState
            icon={<ReceiptIndianRupee className="w-5 h-5" />}
            title="No expenses logged yet"
            description="Record raw material purchases, rent, payroll, and vendor payments to visualize category-wise spending."
            action={
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#3768D9] hover:bg-[#254EAA] text-white text-xs font-semibold cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log First Expense</span>
              </button>
            }
          />
        ) : (
          <div className="space-y-6">
            {/* Category Visualization + Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 bg-white dark:bg-[#162036] border border-slate-200/90 dark:border-slate-800 rounded-xl p-6 shadow-fintech">
                <h2 className="text-sm font-semibold text-[#25334B] dark:text-white mb-1">
                  Spend by Category
                </h2>
                <p className="text-xs text-[#718096] dark:text-slate-400 mb-4">
                  Visual comparison across your recorded expense categories
                </p>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={categoryTotals.slice(0, 6)}
                      margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.18} vertical={false} />
                      <XAxis
                        dataKey="category"
                        tick={{ fontSize: 11, fill: '#718096' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: '#718096' }}
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
                      <Bar dataKey="total" name="Spend" radius={[5, 5, 0, 0]} maxBarSize={42}>
                        {categoryTotals.slice(0, 6).map((entry, idx) => (
                          <Cell key={entry.category} fill={BAR_COLORS[idx % BAR_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="lg:col-span-5 bg-white dark:bg-[#162036] border border-slate-200/90 dark:border-slate-800 rounded-xl p-6 shadow-fintech">
                <h2 className="text-sm font-semibold text-[#25334B] dark:text-white mb-4">
                  Category Totals
                </h2>
                <div className="space-y-3">
                  {categoryTotals.map((item, idx) => (
                    <div
                      key={item.category}
                      className="flex items-center justify-between text-xs py-2 border-b border-slate-100 dark:border-slate-800 last:border-0"
                    >
                      <span className="flex items-center gap-2 text-[#25334B] dark:text-slate-200 truncate pr-3 font-medium">
                        <span
                          className="w-2.5 h-2.5 rounded-xs shrink-0"
                          style={{ backgroundColor: BAR_COLORS[idx % BAR_COLORS.length] }}
                        />
                        <span className="truncate">{item.category}</span>
                      </span>
                      <span className="font-mono font-semibold tabular-nums text-[#25334B] dark:text-slate-100">
                        {formatINR(item.total)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Search & Category Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Filter expenses by category"
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162036] text-xs font-medium text-[#25334B] dark:text-slate-200 w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-[#3768D9]"
              >
                <option value="All">All Expense Categories</option>
                {categoryTotals.map((c) => (
                  <option key={c.category} value={c.category}>
                    {c.category}
                  </option>
                ))}
              </select>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-[#718096] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search description, vendor..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162036] text-xs text-[#25334B] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#3768D9]"
                />
              </div>
            </div>

            <div className="bg-white dark:bg-[#162036] border border-slate-200/90 dark:border-slate-800 rounded-xl overflow-hidden shadow-fintech">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-[#F6F8FC] dark:bg-[#131C31] text-xs text-[#718096] dark:text-slate-400">
                      <th className="py-3 px-4 font-semibold">Date</th>
                      <th className="py-3 px-4 font-semibold">Expense</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold text-right">Amount</th>
                      <th className="py-3 px-4 font-semibold text-right">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                    {filteredExpenses.map((exp) => (
                      <tr
                        key={exp.id}
                        className="hover:bg-[#F6F8FC]/70 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3 px-4 text-xs font-mono text-[#718096] dark:text-slate-400 whitespace-nowrap">
                          {formatDateDisplay(exp.date)}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium text-[#25334B] dark:text-slate-100">
                            {exp.description}
                          </p>
                          <p className="text-xs text-[#718096] dark:text-slate-400">
                            {exp.category}
                            {exp.counterparty ? ` · ${exp.counterparty}` : ''}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-medium capitalize ${
                              exp.status === 'completed'
                                ? 'bg-emerald-50 dark:bg-[#22A58B]/20 text-[#187D69] dark:text-emerald-300'
                                : 'bg-amber-50 dark:bg-[#F4B544]/20 text-[#B2760B] dark:text-[#F4B544]'
                            }`}
                          >
                            {exp.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums text-[#25334B] dark:text-slate-100 whitespace-nowrap">
                          {formatINR(exp.amount)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {activeBusiness ? (
                            <button
                              type="button"
                              onClick={() => void deleteTransaction(activeBusiness.id, exp.id)}
                              aria-label="Delete expense"
                              className="p-1.5 rounded-lg text-[#718096] hover:text-[#EE806B] hover:bg-orange-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      <TransactionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultType="expense"
        onSubmit={handleCreate}
      />
    </DashboardLayout>
  );
}
