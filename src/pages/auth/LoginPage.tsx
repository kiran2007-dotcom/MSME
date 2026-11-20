import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { loginWithEmail, loginWithGoogle, mapAuthError } from '../../services/authService.ts';
import { BrandMark, ThemeToggle } from '../../components/ui/Primitives.tsx';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Please enter your password (at least 6 characters).');
      return;
    }

    setSubmitting(true);
    try {
      await loginWithEmail(email, password);
      navigate('/app', { replace: true });
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setSubmitting(true);
    try {
      await loginWithGoogle();
      navigate('/app', { replace: true });
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
          Sign in to your workspace
        </h1>
        <p className="mt-1.5 text-sm text-[#718096] dark:text-slate-400">
          Access your business finances, GST invoices, compliance calendar, and vault.
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

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          <div>
            <label
              htmlFor="login-email"
              className="block text-xs font-medium text-[#25334B] dark:text-slate-300 mb-1.5"
            >
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@enterprise.in"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-sm text-[#25334B] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#3768D9]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="login-password"
                className="block text-xs font-medium text-[#25334B] dark:text-slate-300"
              >
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-[#3768D9] dark:text-[#55A9D8] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-sm text-[#25334B] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#3768D9]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#718096] hover:text-[#25334B] dark:hover:text-slate-200 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#3768D9] hover:bg-[#254EAA] text-white text-sm font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-60"
          >
            <span>{submitting ? 'Signing in...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          <span className="text-xs text-[#718096] dark:text-slate-400">or</span>
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
        </div>

        <button
          type="button"
          onClick={() => void handleGoogleLogin()}
          disabled={submitting}
          className="w-full inline-flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0F172A] hover:bg-[#F6F8FC] dark:hover:bg-slate-800 text-sm font-medium text-[#25334B] dark:text-slate-200 transition-colors cursor-pointer disabled:opacity-60"
        >
          <span>Continue with Google</span>
        </button>

        <p className="mt-6 text-center text-xs text-[#718096] dark:text-slate-400">
          New to MSME SAATHI?{' '}
          <Link
            to="/register"
            className="font-semibold text-[#3768D9] dark:text-[#55A9D8] hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>

      <p className="text-center text-xs text-[#718096] dark:text-slate-500">
        Smarter Finance. Simpler Compliance. Stronger Businesses.
      </p>
    </div>
  );
}
