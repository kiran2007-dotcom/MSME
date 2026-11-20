import { PublicLayout } from '../../layouts/PublicLayout.tsx';

export function TermsPage() {
  return (
    <PublicLayout>
      <div className="bg-[#F6F8FC] dark:bg-[#0F172A] py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-[#162036] border border-slate-200 dark:border-slate-800 rounded-2xl p-8 sm:p-10 shadow-fintech">
            <h1 className="text-3xl font-bold tracking-tight text-[#25334B] dark:text-white">
              Terms of Service
            </h1>
            <p className="mt-2 text-sm text-[#718096] dark:text-slate-400">
              Effective Date: November 2026
            </p>

            <div className="mt-8 space-y-6 text-sm text-[#25334B] dark:text-slate-300 leading-relaxed">
              <section>
                <h2 className="text-lg font-semibold text-[#25334B] dark:text-white">
                  1. Acceptance of Terms
                </h2>
                <p className="mt-2 text-[#718096] dark:text-slate-300">
                  By creating an account or accessing MSME SAATHI, you agree to use the platform for
                  lawful business financial management, compliance tracking, and document
                  organization.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-[#25334B] dark:text-white">
                  2. Advisory & Compliance Disclaimer
                </h2>
                <p className="mt-2 text-[#718096] dark:text-slate-300">
                  MSME SAATHI provides financial tracking tools, statutory reference calendars, and
                  AI-assisted informational guidance. Statutory filings (GST, Income Tax, TDS, ROC)
                  should be verified with a qualified Chartered Accountant or tax practitioner.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-[#25334B] dark:text-white">
                  3. Account Security
                </h2>
                <p className="mt-2 text-[#718096] dark:text-slate-300">
                  You are responsible for safeguarding your login credentials and verifying the
                  accuracy of GSTIN, Udyam, and transaction entries recorded in your workspace.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
