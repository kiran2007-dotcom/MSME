import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  FolderLock,
  IndianRupee,
  Landmark,
  ShieldCheck,
} from 'lucide-react';
import { DashboardLayout } from '../../layouts/DashboardLayout.tsx';
import { PageHeader, StatCard } from '../../components/ui/Primitives.tsx';
import { useBusiness } from '../../hooks/useBusiness.tsx';
import { formatINR } from '../../utils/formatters.ts';

interface ReadinessCheck {
  id: string;
  title: string;
  detail: string;
  met: boolean;
  actionLabel: string;
  actionTo: string;
}

export function LoanReadinessPage() {
  const { activeBusiness, transactions, invoices, documents, metrics } = useBusiness();

  const checks: ReadinessCheck[] = [
    {
      id: 'udyam',
      title: 'Udyam Registration Number Recorded',
      detail: 'Required for priority sector MSME lending, CGTMSE guarantee, and TReDS onboarding.',
      met: Boolean(activeBusiness?.udyamNumber),
      actionLabel: 'Update Business Profile',
      actionTo: '/app/settings',
    },
    {
      id: 'gstin',
      title: 'GSTIN Profile Linked',
      detail: 'Lenders verify GST turnover consistency when assessing working capital limits.',
      met: Boolean(activeBusiness?.gstin),
      actionLabel: 'Add GSTIN in Settings',
      actionTo: '/app/settings',
    },
    {
      id: 'ledger',
      title: 'Financial Transactions Logged',
      detail: 'Maintain settled transactions in your ledger to establish verifiable cash flow history.',
      met: transactions.length > 0,
      actionLabel: 'Record Transaction',
      actionTo: '/app/finance',
    },
    {
      id: 'profitability',
      title: 'Positive Operating Net Profit',
      detail: 'Demonstrating positive revenue-to-expense margin strengthens loan underwriting.',
      met: metrics.totalRevenue > 0 && metrics.netProfit > 0,
      actionLabel: 'Review Cash Flow',
      actionTo: '/app/finance',
    },
    {
      id: 'invoicing',
      title: 'Structured Sales Invoicing',
      detail: 'Clean receivables records support bill discounting and working capital facilities.',
      met: invoices.length > 0,
      actionLabel: 'Create Invoice',
      actionTo: '/app/invoices',
    },
    {
      id: 'documents',
      title: 'Supporting KYC & Statutory Documents Uploaded',
      detail: 'Store registration certificates and bank statements in your Document Vault.',
      met: documents.length > 0,
      actionLabel: 'Upload Documents',
      actionTo: '/app/documents',
    },
  ];

  const completedCount = checks.filter((c) => c.met).length;
  const pct = Math.round((completedCount / checks.length) * 100);
  const operatingMargin =
    metrics.totalRevenue > 0 ? Math.round((metrics.netProfit / metrics.totalRevenue) * 100) : null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Loan Readiness Checklist"
          description="Honest assessment derived strictly from your verified business profile, ledger records, and uploaded documents."
          actions={
            <Link
              to="/app/schemes"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#3768D9] hover:bg-[#254EAA] text-white text-xs font-semibold whitespace-nowrap shadow-xs transition-colors"
            >
              <Landmark className="w-4 h-4" />
              <span>Explore Credit Schemes</span>
            </Link>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Criteria Verified"
            value={`${completedCount} / ${checks.length}`}
            subtext={`${pct}% checklist readiness`}
            variant="blue"
            icon={<ShieldCheck className="w-5 h-5" />}
          />
          <StatCard
            label="Recorded Revenue"
            value={formatINR(metrics.totalRevenue)}
            numericValue={metrics.totalRevenue}
            subtext={
              operatingMargin !== null
                ? `Operating margin: ${operatingMargin}%`
                : 'No completed inflows yet'
            }
            variant="emerald"
            icon={<IndianRupee className="w-5 h-5" />}
          />
          <StatCard
            label="Vault Documents"
            value={`${documents.length}`}
            subtext="Stored supporting files"
            variant="lavender"
            icon={<FolderLock className="w-5 h-5" />}
          />
        </div>

        {/* Readiness Progress Meter */}
        <div className="bg-white dark:bg-[#162036] border border-slate-200/90 dark:border-slate-800 rounded-xl p-6 shadow-fintech">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <h2 className="text-sm font-semibold text-[#25334B] dark:text-white">
                Credit Documentation & Profile Completeness
              </h2>
              <p className="text-xs text-[#718096] dark:text-slate-400">
                Complete all 6 criteria to strengthen working capital or CGTMSE loan applications.
              </p>
            </div>
            <span className="font-mono text-lg font-bold text-[#3768D9] dark:text-[#55A9D8] tabular-nums">
              {pct}%
            </span>
          </div>
          <div className="h-3 rounded-full bg-[#F6F8FC] dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#22A58B] transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Checklist Items */}
        <div className="bg-white dark:bg-[#162036] border border-slate-200/90 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 shadow-fintech">
          {checks.map((item) => (
            <div
              key={item.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F6F8FC]/60 dark:hover:bg-slate-800/30 transition-colors"
            >
              <div className="flex items-start gap-3.5">
                {item.met ? (
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-[#22A58B]/20 text-[#22A58B] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-[#F6F8FC] dark:bg-slate-800 text-[#718096] flex items-center justify-center shrink-0 mt-0.5">
                    <Circle className="w-4 h-4" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-[#25334B] dark:text-white">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-xs text-[#718096] dark:text-slate-400">
                    {item.detail}
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                {item.met ? (
                  <span className="inline-block px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-[#22A58B]/20 text-xs font-semibold text-[#187D69] dark:text-emerald-300">
                    Verified
                  </span>
                ) : (
                  <Link
                    to={item.actionTo}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131C31] hover:bg-[#EDF4FF] dark:hover:bg-slate-800 text-xs font-semibold text-[#3768D9] dark:text-[#55A9D8] whitespace-nowrap transition-colors"
                  >
                    <span>{item.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#EDF4FF] dark:bg-[#131C31] border border-[#3768D9]/20 dark:border-slate-800 rounded-xl p-5 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#3768D9] dark:text-[#55A9D8] shrink-0 mt-0.5" />
          <div className="text-xs text-[#25334B] dark:text-slate-300 leading-relaxed">
            This checklist tracks foundational hygiene required by Indian banks and NBFCs. Final
            credit underwriting depends on bank statements, CIBIL/CMR score, GST returns, and ITR
            filings reviewed by the lender.
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
