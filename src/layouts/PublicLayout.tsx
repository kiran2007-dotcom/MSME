import { useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.tsx';
import { BrandMark, ThemeToggle } from '../components/ui/Primitives.tsx';

export function PublicLayout({ children }: { children: ReactNode }) {
  const { firebaseUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleSectionLink = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 120);
      return;
    }
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF] text-[#25334B] dark:bg-[#0F172A] dark:text-slate-100">
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 text-lg font-bold tracking-tight text-[#25334B] dark:text-white whitespace-nowrap shrink-0"
          >
            <BrandMark size="sm" />
            <span>MSME SAATHI</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#718096] dark:text-slate-300">
            <button
              type="button"
              onClick={() => handleSectionLink('features')}
              className="hover:text-[#3768D9] dark:hover:text-[#55A9D8] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => handleSectionLink('intelligence')}
              className="hover:text-[#3768D9] dark:hover:text-[#55A9D8] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Intelligence
            </button>
            <button
              type="button"
              onClick={() => handleSectionLink('compliance')}
              className="hover:text-[#3768D9] dark:hover:text-[#55A9D8] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Compliance
            </button>
            <button
              type="button"
              onClick={() => handleSectionLink('how-it-works')}
              className="hover:text-[#3768D9] dark:hover:text-[#55A9D8] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              How It Works
            </button>
            {!firebaseUser ? (
              <Link
                to="/login"
                className="hover:text-[#3768D9] dark:hover:text-[#55A9D8] transition-colors whitespace-nowrap shrink-0"
              >
                Sign In
              </Link>
            ) : null}
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to={firebaseUser ? '/app' : '/register'}
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#3768D9] hover:bg-[#254EAA] shadow-xs transition-colors whitespace-nowrap shrink-0"
            >
              {firebaseUser ? 'Open Workspace' : 'Get Started'}
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
              className="md:hidden p-2 rounded-lg text-[#25334B] dark:text-slate-200 hover:bg-[#F6F8FC] dark:hover:bg-slate-800 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen ? (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] px-4 py-4 space-y-2">
            <button
              type="button"
              onClick={() => handleSectionLink('features')}
              className="block w-full text-left py-2 text-sm font-medium text-[#25334B] dark:text-slate-200"
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => handleSectionLink('intelligence')}
              className="block w-full text-left py-2 text-sm font-medium text-[#25334B] dark:text-slate-200"
            >
              Intelligence
            </button>
            <button
              type="button"
              onClick={() => handleSectionLink('compliance')}
              className="block w-full text-left py-2 text-sm font-medium text-[#25334B] dark:text-slate-200"
            >
              Compliance
            </button>
            <button
              type="button"
              onClick={() => handleSectionLink('how-it-works')}
              className="block w-full text-left py-2 text-sm font-medium text-[#25334B] dark:text-slate-200"
            >
              How It Works
            </button>
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
              {!firebaseUser ? (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-medium text-[#25334B] dark:text-slate-200"
                >
                  Sign In
                </Link>
              ) : null}
              <Link
                to={firebaseUser ? '/app' : '/register'}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center rounded-lg bg-[#3768D9] text-white text-sm font-semibold"
              >
                {firebaseUser ? 'Open Workspace' : 'Get Started'}
              </Link>
            </div>
          </div>
        ) : null}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-slate-200 dark:border-slate-800 bg-[#F6F8FC] dark:bg-[#0B1221]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="md:col-span-2">
              <div className="inline-flex items-center gap-2.5">
                <BrandMark size="sm" />
                <span className="text-base font-bold text-[#25334B] dark:text-white">
                  MSME SAATHI
                </span>
              </div>
              <p className="mt-3 text-sm text-[#718096] dark:text-slate-400 max-w-md leading-relaxed">
                Smarter Finance. Simpler Compliance. Stronger Businesses. Unified financial
                intelligence, GST invoicing, compliance tracking, and credit readiness for Indian
                MSMEs.
              </p>
              <div className="mt-5">
                <ThemeToggle />
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-[#25334B] dark:text-white">Platform</p>
              <ul className="mt-3 space-y-2.5 text-sm text-[#718096] dark:text-slate-400">
                <li>
                  <button
                    type="button"
                    onClick={() => handleSectionLink('features')}
                    className="hover:text-[#3768D9] dark:hover:text-[#55A9D8] cursor-pointer"
                  >
                    Overview
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleSectionLink('intelligence')}
                    className="hover:text-[#3768D9] dark:hover:text-[#55A9D8] cursor-pointer"
                  >
                    Cash Flow & Invoicing
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleSectionLink('compliance')}
                    className="hover:text-[#3768D9] dark:hover:text-[#55A9D8] cursor-pointer"
                  >
                    Compliance Calendar
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleSectionLink('loan-readiness')}
                    className="hover:text-[#3768D9] dark:hover:text-[#55A9D8] cursor-pointer"
                  >
                    Loan Readiness
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-sm font-semibold text-[#25334B] dark:text-white">
                Contact & Legal
              </p>
              <ul className="mt-3 space-y-2.5 text-sm text-[#718096] dark:text-slate-400">
                <li>
                  <a
                    href="mailto:support@msmesaathi.in"
                    className="hover:text-[#3768D9] dark:hover:text-[#55A9D8]"
                  >
                    support@msmesaathi.in
                  </a>
                </li>
                <li>Bengaluru, Karnataka, India</li>
                <li>
                  <Link to="/privacy" className="hover:text-[#3768D9] dark:hover:text-[#55A9D8]">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-[#3768D9] dark:hover:text-[#55A9D8]">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#718096] dark:text-slate-400">
            <p>© {new Date().getFullYear()} MSME SAATHI. Crafted for Indian Enterprises.</p>
            <div className="flex items-center gap-6">
              <Link to="/privacy" className="hover:text-[#25334B] dark:hover:text-slate-200">
                Privacy
              </Link>
              <Link to="/terms" className="hover:text-[#25334B] dark:hover:text-slate-200">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
