import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { mapAuthError, sendPasswordReset } from '../../services/authService.ts';
import { BrandMark, ThemeToggle } from '../../components/ui/Primitives.tsx';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid registered email address.');
      return;
    }

    setSubmitting(true);
    try {
      await sendPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-[#EDF4FF]/70 via-[#F6F8FC] to-[#F6F8FC] dark:from-[#162036] dark:via-[#0F172A] dark:to-[#0F172A] px-4 py-8">
      <div className="max-w-md w-full mx-auto flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2.5 text-base font-bold tracking-tight text-[#25334B] dark:text-white"
        >
          <BrandMark size="sm" />
          <span>MSME SAATHI</span>
        </Link>
        <ThemeToggle />
      </div>

      <div className="max-w-md w-full mx-auto my-8 bg-white dark:bg-[#162036] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-8 shadow-fintech-lg">
        <h1 className="text-2xl font-bold tracking-tight text-[#25334B] dark:text-white">
          Reset your password
        </h1>
        <p className="mt-1.5 text-sm text-[#718096] dark:text-slate-400">
          Enter your registered email address and we will send you a password reset link.
        </p>

        {error ? (
          <div
            role="alert"
            className="mt-5 p-3.5 rounded-lg bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 flex items-start gap-2.5 text-xs text-red-800 dark:text-red-300"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        ) : null}

        {sent ? (
          <div className="mt-6 p-4 rounded-xl bg-emerald-50 dark:bg-[#22A58B]/15 border border-[#22A58B]/30">
            <div className="flex items-start gap-2.5 text-sm text-[#187D69] dark:text-emerald-300">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Password reset email sent</p>
                <p className="mt-1 text-xs">
                  Check the inbox for <span className="font-medium">{email}</span> and follow the
                  link to set a new password.
                </p>
              </div>
            </div>
            <Link
              to="/login"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#3768D9] dark:text-[#55A9D8] hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            <div>
              <label
                htmlFor="reset-email"
                className="block text-xs font-medium text-[#25334B] dark:text-slate-300 mb-1.5"
              >
                Email Address
              </label>
              <input
                id="reset-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@enterprise.in"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-sm text-[#25334B] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#3768D9]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 rounded-lg bg-[#3768D9] hover:bg-[#254EAA] text-white text-sm font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-60"
            >
              {submitting ? 'Sending link...' : 'Send Reset Link'}
            </button>

            <div className="pt-2 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#718096] dark:text-slate-400 hover:text-[#25334B] dark:hover:text-white"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>

      <p className="text-center text-xs text-[#718096]">MSME SAATHI Account Recovery</p>
    </div>
  );
}
