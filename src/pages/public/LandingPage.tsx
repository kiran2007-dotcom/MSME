import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Bot,
  CalendarCheck,
  CheckCircle2,
  FileText,
  FolderLock,
  Landmark,
  ReceiptIndianRupee,
  ShieldCheck,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { PublicLayout } from '../../layouts/PublicLayout.tsx';
import { useAuth } from '../../hooks/useAuth.tsx';
import { BrandMark } from '../../components/ui/Primitives.tsx';

function SafeImage({
  src,
  alt,
  fallbackTitle,
  className = '',
}: {
  src: string;
  alt: string;
  fallbackTitle: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center bg-[#EDF4FF] dark:bg-[#162036] text-[#25334B] dark:text-slate-200 p-8 rounded-xl border border-slate-200 dark:border-slate-800 ${className}`}
      >
        <div className="text-center">
          <Landmark className="w-8 h-8 text-[#3768D9] mx-auto mb-2" />
          <p className="text-sm font-medium">{fallbackTitle}</p>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

const PREVIEW_BARS = [
  { month: 'Jun', rev: 62, exp: 38 },
  { month: 'Jul', rev: 74, exp: 42 },
  { month: 'Aug', rev: 68, exp: 45 },
  { month: 'Sep', rev: 86, exp: 48 },
  { month: 'Oct', rev: 92, exp: 51 },
  { month: 'Nov', rev: 100, exp: 54 },
];

function ProductDashboardPreview() {
  return (
    <div className="relative">
      {/* Subtle Layered Ambient Canvas */}
      <div
        aria-hidden="true"
        className="absolute -inset-3 rounded-2xl bg-gradient-to-br from-[#EDF4FF] via-[#F6F8FC] to-emerald-50/70 dark:from-[#3768D9]/15 dark:via-[#162036] dark:to-[#22A58B]/10 -z-10"
      />

      <div className="bg-white dark:bg-[#162036] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-fintech-lg overflow-hidden">
        {/* Window Chrome */}
        <div className="px-5 py-3.5 border-b border-slate-200/80 dark:border-slate-800 bg-[#F6F8FC] dark:bg-[#131C31] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <BrandMark size="sm" />
            <div>
              <p className="text-xs font-bold text-[#25334B] dark:text-white">
                Workspace Preview
              </p>
              <p className="text-[11px] text-[#718096] dark:text-slate-400">
                Illustrative MSME ledger layout (live accounts start at ₹0)
              </p>
            </div>
          </div>
          <span className="text-[11px] font-medium text-[#3768D9] dark:text-[#7FB3FF]">
            FY 2026–27
          </span>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {/* 4 Signature Colour KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-[#EDF4FF]/70 dark:bg-[#3768D9]/15 border border-[#3768D9]/20">
              <p className="text-[11px] font-medium text-[#254EAA] dark:text-[#7FB3FF]">Revenue</p>
              <p className="mt-1 text-base font-bold font-mono tabular-nums text-[#25334B] dark:text-white">
                ₹14,80,000
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-[#22A58B]/15 border border-[#22A58B]/20">
              <p className="text-[11px] font-medium text-[#187D69] dark:text-emerald-300">
                Net Profit
              </p>
              <p className="mt-1 text-base font-bold font-mono tabular-nums text-[#25334B] dark:text-white">
                ₹5,12,000
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-orange-50/80 dark:bg-[#EE806B]/15 border border-[#EE806B]/20">
              <p className="text-[11px] font-medium text-[#C85641] dark:text-[#F49D8B]">Expenses</p>
              <p className="mt-1 text-base font-bold font-mono tabular-nums text-[#25334B] dark:text-white">
                ₹9,68,000
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-[#F4B544]/15 border border-[#F4B544]/25">
              <p className="text-[11px] font-medium text-[#B2760B] dark:text-[#F4B544]">
                Outstanding
              </p>
              <p className="mt-1 text-base font-bold font-mono tabular-nums text-[#25334B] dark:text-white">
                ₹1,95,000
              </p>
            </div>
          </div>

          {/* Chart + Compliance Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-7 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-[#F6F8FC]/60 dark:bg-[#0F172A]/60">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold text-[#25334B] dark:text-white">
                  Monthly Revenue vs. Expenses
                </p>
                <div className="flex items-center gap-3 text-[11px] text-[#718096] dark:text-slate-400">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#3768D9]" />
                    Revenue
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#22A58B]" />
                    Expenses
                  </span>
                </div>
              </div>
              <div className="h-36 flex items-end justify-between gap-3 pt-2">
                {PREVIEW_BARS.map((bar) => (
                  <div key={bar.month} className="flex-1 flex flex-col items-center gap-1.5 h-full">
                    <div className="w-full flex-1 flex items-end justify-center gap-1">
                      <div
                        className="w-3 sm:w-4 rounded-t bg-[#3768D9]"
                        style={{ height: `${bar.rev}%` }}
                      />
                      <div
                        className="w-3 sm:w-4 rounded-t bg-[#22A58B]"
                        style={{ height: `${bar.exp}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-[#718096] dark:text-slate-400">
                      {bar.month}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#131C31] space-y-3">
              <p className="text-xs font-semibold text-[#25334B] dark:text-white">
                Statutory Compliance Queue
              </p>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <p className="font-medium text-[#25334B] dark:text-slate-200">
                      GSTR-1 Outward Return
                    </p>
                    <p className="text-[11px] text-[#718096]">Monthly · 11th due rule</p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-[#22A58B] shrink-0" />
                </div>
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <p className="font-medium text-[#25334B] dark:text-slate-200">
                      GSTR-3B Summary Return
                    </p>
                    <p className="text-[11px] text-[#718096]">Monthly · 20th due rule</p>
                  </div>
                  <span className="text-[11px] font-semibold text-[#D49218]">Upcoming</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-[#25334B] dark:text-slate-200">
                      TDS Deposit (ITNS 281)
                    </p>
                    <p className="text-[11px] text-[#718096]">Monthly · 7th due rule</p>
                  </div>
                  <span className="text-[11px] font-semibold text-[#3768D9] dark:text-[#7FB3FF]">
                    Scheduled
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LandingPage() {
  const { firebaseUser } = useAuth();

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#EDF4FF]/80 via-[#FFFFFF] to-[#FFFFFF] dark:from-[#162036] dark:via-[#0F172A] dark:to-[#0F172A] border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-16 lg:pt-20 lg:pb-24">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-semibold tracking-wide text-[#3768D9] dark:text-[#55A9D8]">
              MSME SAATHI · Financial & Compliance Operating System for Indian MSMEs
            </p>
            <h1 className="mt-4 text-4xl sm:text-5xl lg:text-[56px] font-extrabold tracking-tight text-[#25334B] dark:text-white leading-[1.1] [text-wrap:balance]">
              Your Business Deserves Smarter Finance.
            </h1>
            <p className="mt-5 text-base sm:text-lg text-[#718096] dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Manage INR cash flow, issue GST-ready invoices, track statutory deadlines, organize
              documents, and unlock AI-guided clarity in one elegant workspace.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                to={firebaseUser ? '/app' : '/register'}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#3768D9] hover:bg-[#254EAA] text-white text-sm font-semibold shadow-sm transition-colors whitespace-nowrap"
              >
                <span>{firebaseUser ? 'Open Workspace' : 'Get Started'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#162036] text-[#25334B] dark:text-slate-100 hover:bg-[#F6F8FC] dark:hover:bg-slate-800 text-sm font-medium transition-colors whitespace-nowrap"
              >
                Explore Platform
              </a>
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-[#718096] dark:text-slate-400">
              <span>Udyam & GSTIN Ready</span>
              <span aria-hidden="true">·</span>
              <span>Real-Time Ledger & Reports</span>
              <span aria-hidden="true">·</span>
              <span>Business-Isolated Cloud Security</span>
            </div>
          </div>

          <div className="mt-12 lg:mt-14 max-w-5xl mx-auto">
            <ProductDashboardPreview />
          </div>
        </div>
      </section>

      {/* Product Feature Showcase (Colourful Fintech Bento Grid) */}
      <section id="features" className="py-16 lg:py-24 bg-[#F6F8FC] dark:bg-[#0B1221]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold text-[#3768D9] dark:text-[#55A9D8]">
              Platform Architecture
            </p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-[#25334B] dark:text-white [text-wrap:balance]">
              Built for everyday financial clarity and statutory discipline
            </h2>
            <p className="mt-3 text-base text-[#718096] dark:text-slate-400">
              Every module connects to your verified MSME workspace so your books, invoices,
              deadlines, and documents stay synchronized.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white dark:bg-[#162036] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-7 shadow-fintech">
              <div className="w-11 h-11 rounded-xl bg-[#EDF4FF] dark:bg-[#3768D9]/20 text-[#3768D9] dark:text-[#55A9D8] flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-[#25334B] dark:text-white">
                01. Cash Flow & Multi-Mode Ledger
              </h3>
              <p className="mt-2 text-sm text-[#718096] dark:text-slate-400 leading-relaxed max-w-xl">
                Record UPI, NEFT/RTGS, cash, and cheque settlements with included GST breakdowns.
                Monitor net operating profit and pending payables at a glance.
              </p>
            </div>

            <div className="bg-white dark:bg-[#162036] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-7 shadow-fintech">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-[#22A58B]/20 text-[#22A58B] dark:text-emerald-300 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-[#25334B] dark:text-white">
                02. GST Invoicing & PDF Export
              </h3>
              <p className="mt-2 text-sm text-[#718096] dark:text-slate-400 leading-relaxed">
                Generate structured customer invoices with validated GSTIN, preview printable PDF
                layouts, and track overdue receivables.
              </p>
            </div>

            <div className="bg-white dark:bg-[#162036] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-7 shadow-fintech">
              <div className="w-11 h-11 rounded-xl bg-orange-50 dark:bg-[#EE806B]/20 text-[#EE806B] dark:text-[#F49D8B] flex items-center justify-center">
                <ReceiptIndianRupee className="w-5 h-5" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-[#25334B] dark:text-white">
                03. Category Expense Analytics
              </h3>
              <p className="mt-2 text-sm text-[#718096] dark:text-slate-400 leading-relaxed">
                Visualize raw material, payroll, freight, and utility spend alongside eligible
                input GST credits.
              </p>
            </div>

            <div className="bg-white dark:bg-[#162036] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-7 shadow-fintech">
              <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-[#F4B544]/20 text-[#D49218] dark:text-[#F4B544] flex items-center justify-center">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-[#25334B] dark:text-white">
                04. Compliance Reminders
              </h3>
              <p className="mt-2 text-sm text-[#718096] dark:text-slate-400 leading-relaxed">
                Stay on schedule for GSTR-1, GSTR-3B, TDS deposits, advance tax, and MSME Form 1
                filings.
              </p>
            </div>

            <div className="bg-white dark:bg-[#162036] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-7 shadow-fintech">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-[#8A76D6]/20 text-[#8A76D6] dark:text-[#ABA0E6] flex items-center justify-center">
                <FolderLock className="w-5 h-5" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-[#25334B] dark:text-white">
                05. Cloud Document Vault
              </h3>
              <p className="mt-2 text-sm text-[#718096] dark:text-slate-400 leading-relaxed">
                Keep Udyam certificates, GST registration, and bank statements organized for audits
                and loan applications.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Financial Intelligence + AI Assistant Showcase */}
      <section
        id="intelligence"
        className="py-16 lg:py-24 bg-white dark:bg-[#0F172A] border-y border-slate-200/80 dark:border-slate-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          {/* Row 1: Financial Intelligence with Retail Photography */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <div className="lg:col-span-6">
              <p className="text-xs font-semibold text-[#22A58B] dark:text-emerald-300">
                Financial Intelligence
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#25334B] dark:text-white [text-wrap:balance]">
                From daily store settlements to monthly P&L clarity
              </h2>
              <p className="mt-4 text-sm sm:text-base text-[#718096] dark:text-slate-300 leading-relaxed">
                Whether you run a precision workshop, wholesale distribution house, or retail
                enterprise, every dashboard metric derives strictly from your real recorded entries
                in Indian Rupees.
              </p>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#F6F8FC] dark:bg-[#162036] border border-slate-200/80 dark:border-slate-800">
                  <TrendingUp className="w-4 h-4 text-[#3768D9] dark:text-[#55A9D8] mb-2" />
                  <p className="text-sm font-semibold text-[#25334B] dark:text-white">
                    Monthly Trend Charts
                  </p>
                  <p className="mt-1 text-xs text-[#718096] dark:text-slate-400">
                    Compare inflows against outflows month by month.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#F6F8FC] dark:bg-[#162036] border border-slate-200/80 dark:border-slate-800">
                  <FileText className="w-4 h-4 text-[#22A58B] mb-2" />
                  <p className="text-sm font-semibold text-[#25334B] dark:text-white">
                    CA-Ready CSV Exports
                  </p>
                  <p className="mt-1 text-xs text-[#718096] dark:text-slate-400">
                    Export transactions and invoices cleanly anytime.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-fintech-lg aspect-[4/3]">
                <SafeImage
                  src="/src/assets/images/msme_retail_commerce_1795169265340.jpg"
                  alt="Indian retail business owner reconciling digital payments and invoices"
                  fallbackTitle="Indian MSME Retail Finance"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Row 2: AI Business Assistant */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="rounded-2xl bg-[#EDF4FF]/65 dark:bg-[#162036] border border-[#3768D9]/20 dark:border-slate-800 p-6 sm:p-8 shadow-fintech">
                <div className="flex items-center gap-3 pb-4 border-b border-[#3768D9]/15 dark:border-slate-800">
                  <div className="w-10 h-10 rounded-xl bg-[#3768D9] text-white flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#25334B] dark:text-white">
                      MSME SAATHI AI Assistant
                    </p>
                    <p className="text-xs text-[#718096] dark:text-slate-400">
                      Grounded in your business size, GSTIN & live ledger
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="ml-auto max-w-[85%] rounded-xl bg-[#3768D9] text-white px-4 py-2.5 text-xs sm:text-sm">
                    How does the MSME 45-day payment rule protect my receivables?
                  </div>
                  <div className="mr-auto max-w-[92%] rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-[#25334B] dark:text-slate-200 px-4 py-3 text-xs sm:text-sm leading-relaxed">
                    Under Section 15 of the MSMED Act and Section 43B(h) of the Income Tax Act,
                    buyers purchasing from Udyam-registered Micro and Small enterprises must settle
                    dues within 15 days (or max 45 days with written agreement). Mentioning your
                    Udyam number on invoices strengthens timely collection.
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 order-1 lg:order-2">
              <p className="text-xs font-semibold text-[#8A76D6] dark:text-[#ABA0E6]">
                AI Business Assistant
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#25334B] dark:text-white [text-wrap:balance]">
                Practical GST, cash flow, and scheme answers on demand
              </h2>
              <p className="mt-4 text-sm sm:text-base text-[#718096] dark:text-slate-300 leading-relaxed">
                Ask questions in plain English about input tax credit, advance tax dates, working
                capital hygiene, or CGTMSE eligibility. The assistant reads your active workspace
                profile and ledger totals without ever exposing API keys in the browser.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance Management & Loan Readiness */}
      <section id="compliance" className="py-16 lg:py-24 bg-[#F6F8FC] dark:bg-[#0B1221]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5">
              <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-fintech aspect-[4/3]">
                <SafeImage
                  src="/src/assets/images/msme_advisory_desk_1795167566451.jpg"
                  alt="Organized Indian corporate finance desk with GST ledger binder"
                  fallbackTitle="Compliance Desk"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="lg:col-span-7">
              <p className="text-xs font-semibold text-[#D49218] dark:text-[#F4B544]">
                Compliance Management
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#25334B] dark:text-white [text-wrap:balance]">
                Stay ahead of GST, TDS, and Udyam obligations
              </h2>
              <p className="mt-4 text-sm sm:text-base text-[#718096] dark:text-slate-300 leading-relaxed">
                Avoid penalties and late fees with a built-in Indian MSME statutory reference
                calendar paired with custom business due-date reminders and document checklists.
              </p>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-white dark:bg-[#162036] border border-slate-200/90 dark:border-slate-800">
                  <p className="text-sm font-semibold text-[#25334B] dark:text-white">
                    Colour-Coded Deadlines
                  </p>
                  <p className="mt-1 text-xs text-[#718096] dark:text-slate-400">
                    Distinguish GST, Income Tax, ROC, and MSME tasks at a glance.
                  </p>
                </div>
                <div className="p-5 rounded-xl bg-white dark:bg-[#162036] border border-slate-200/90 dark:border-slate-800">
                  <p className="text-sm font-semibold text-[#25334B] dark:text-white">
                    Progress Tracking
                  </p>
                  <p className="mt-1 text-xs text-[#718096] dark:text-slate-400">
                    Surface upcoming deadlines right in your workspace alerts menu.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div
            id="loan-readiness"
            className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center"
          >
            <div className="lg:col-span-7">
              <p className="text-xs font-semibold text-[#3768D9] dark:text-[#55A9D8]">
                Loan Readiness & Government Schemes
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#25334B] dark:text-white [text-wrap:balance]">
                Build bank-ready financial hygiene and discover matching schemes
              </h2>
              <p className="mt-4 text-sm sm:text-base text-[#718096] dark:text-slate-300 leading-relaxed">
                Review an honest readiness checklist grounded in your Udyam registration, GSTIN,
                documented cash flow, and uploaded KYC files — plus browse CGTMSE, MUDRA, PMEGP,
                and TReDS programs matched to your enterprise size.
              </p>
              <div className="mt-5 flex items-center gap-2.5 text-sm font-medium text-[#25334B] dark:text-slate-200">
                <ShieldCheck className="w-5 h-5 text-[#22A58B] shrink-0" />
                <span>Zero fabricated credit scores — clear, actionable readiness criteria.</span>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-fintech aspect-[4/3]">
                <SafeImage
                  src="/src/assets/images/msme_operations_hub_1795167566481.jpg"
                  alt="Indian SME logistics and packaging facility"
                  fallbackTitle="MSME Operations & Growth"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works + Final CTA */}
      <section id="how-it-works" className="py-16 lg:py-24 bg-white dark:bg-[#0F172A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold text-[#3768D9] dark:text-[#55A9D8]">
              Getting Started
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#25334B] dark:text-white">
              Three steps to a clearer business workspace
            </h2>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#F6F8FC] dark:bg-[#162036] border border-slate-200/90 dark:border-slate-800">
              <p className="text-xs font-mono font-bold text-[#3768D9] dark:text-[#55A9D8]">
                01. Register
              </p>
              <h3 className="mt-2 text-base font-bold text-[#25334B] dark:text-white">
                Create Your Owner Account
              </h3>
              <p className="mt-2 text-sm text-[#718096] dark:text-slate-400">
                Sign up securely with Email & Password or Google Sign-In.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F6F8FC] dark:bg-[#162036] border border-slate-200/90 dark:border-slate-800">
              <p className="text-xs font-mono font-bold text-[#22A58B]">02. Onboard</p>
              <h3 className="mt-2 text-base font-bold text-[#25334B] dark:text-white">
                Add Business Details
              </h3>
              <p className="mt-2 text-sm text-[#718096] dark:text-slate-400">
                Configure entity type, industry, Micro/Small/Medium tier, GSTIN, and Udyam ID.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F6F8FC] dark:bg-[#162036] border border-slate-200/90 dark:border-slate-800">
              <p className="text-xs font-mono font-bold text-[#8A76D6] dark:text-[#ABA0E6]">
                03. Operate
              </p>
              <h3 className="mt-2 text-base font-bold text-[#25334B] dark:text-white">
                Track Books & Compliance
              </h3>
              <p className="mt-2 text-sm text-[#718096] dark:text-slate-400">
                Record real transactions, issue invoices, manage reminders, and consult the AI
                assistant.
              </p>
            </div>
          </div>

          <div className="mt-14 rounded-2xl bg-[#254EAA] dark:bg-[#1E3A8A] p-8 sm:p-10 text-white shadow-fintech-lg flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold tracking-tight">
                Ready to bring clarity to your MSME finances?
              </h3>
              <p className="mt-2 text-sm text-blue-100 max-w-xl">
                Create your MSME SAATHI workspace in under two minutes and manage every rupee and
                deadline in one place.
              </p>
            </div>
            <Link
              to={firebaseUser ? '/app' : '/register'}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white hover:bg-[#EDF4FF] text-[#254EAA] text-sm font-bold transition-colors whitespace-nowrap shrink-0"
            >
              <span>{firebaseUser ? 'Open Dashboard' : 'Get Started Free'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
