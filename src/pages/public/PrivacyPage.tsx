import { PublicLayout } from '../../layouts/PublicLayout.tsx';

export function PrivacyPage() {
  return (
    <PublicLayout>
      <div className="bg-[#F6F8FC] dark:bg-[#0F172A] py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-[#162036] border border-slate-200 dark:border-slate-800 rounded-2xl p-8 sm:p-10 shadow-fintech">
            <h1 className="text-3xl font-bold tracking-tight text-[#25334B] dark:text-white">
              Privacy Policy
            </h1>
            <p className="mt-2 text-sm text-[#718096] dark:text-slate-400">
              Effective Date: November 2026
            </p>

            <div className="mt-8 space-y-6 text-sm text-[#25334B] dark:text-slate-300 leading-relaxed">
              <section>
                <h2 className="text-lg font-semibold text-[#25334B] dark:text-white">
                  1. Information We Collect
                </h2>
                <p className="mt-2 text-[#718096] dark:text-slate-300">
                  MSME SAATHI collects account registration details (name and email address) via
                  Firebase Authentication, and business profile, ledger, invoice, reminder, and
                  document records that you explicitly submit into your workspace.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-[#25334B] dark:text-white">
                  2. Data Ownership & Business Isolation
                </h2>
                <p className="mt-2 text-[#718096] dark:text-slate-300">
                  Your financial and compliance records are strictly isolated per business workspace
                  using Firebase Security Rules. Only authenticated, authorized members of a
                  business can read or modify its records.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-[#25334B] dark:text-white">
                  3. AI Assistant Processing
                </h2>
                <p className="mt-2 text-[#718096] dark:text-slate-300">
                  When you ask a question in the AI Assistant section, your prompt and summarized
                  workspace context are transmitted securely to our server-side endpoint to generate
                  a response. We do not sell your business data to third parties.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-[#25334B] dark:text-white">
                  4. Contact
                </h2>
                <p className="mt-2 text-[#718096] dark:text-slate-300">
                  For privacy inquiries or account deletion requests, email{' '}
                  <a
                    href="mailto:support@msmesaathi.in"
                    className="text-[#3768D9] dark:text-[#55A9D8] font-medium underline"
                  >
                    support@msmesaathi.in
                  </a>
                  .
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
