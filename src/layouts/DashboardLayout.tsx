import { useMemo, useState, type ReactNode } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Bell,
  Bot,
  Building2,
  CalendarCheck,
  ChevronDown,
  FileSpreadsheet,
  FileText,
  FolderLock,
  Landmark,
  LayoutDashboard,
  LogOut,
  Menu,
  ReceiptIndianRupee,
  Settings,
  ShieldCheck,
  Wallet,
  X,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.tsx';
import { useBusiness } from '../hooks/useBusiness.tsx';
import { logoutUser } from '../services/authService.ts';
import { BrandMark, PageTransition, ThemeToggle } from '../components/ui/Primitives.tsx';
import { formatDateDisplay, formatINR } from '../utils/formatters.ts';

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  end?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/app', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, end: true },
  { to: '/app/assistant', label: 'AI Assistant', icon: <Bot className="w-4 h-4" /> },
  { to: '/app/finance', label: 'Finance', icon: <Wallet className="w-4 h-4" /> },
  { to: '/app/invoices', label: 'Invoices', icon: <FileText className="w-4 h-4" /> },
  { to: '/app/expenses', label: 'Expenses', icon: <ReceiptIndianRupee className="w-4 h-4" /> },
  { to: '/app/compliance', label: 'Compliance', icon: <CalendarCheck className="w-4 h-4" /> },
  { to: '/app/loan-readiness', label: 'Loan Readiness', icon: <ShieldCheck className="w-4 h-4" /> },
  { to: '/app/schemes', label: 'Government Schemes', icon: <Landmark className="w-4 h-4" /> },
  { to: '/app/documents', label: 'Documents', icon: <FolderLock className="w-4 h-4" /> },
  { to: '/app/reports', label: 'Reports', icon: <FileSpreadsheet className="w-4 h-4" /> },
  { to: '/app/settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
];

const MOBILE_QUICK_TABS = [
  { to: '/app', label: 'Home', icon: <LayoutDashboard className="w-4 h-4" />, end: true },
  { to: '/app/finance', label: 'Finance', icon: <Wallet className="w-4 h-4" /> },
  { to: '/app/invoices', label: 'Invoices', icon: <FileText className="w-4 h-4" /> },
  { to: '/app/assistant', label: 'AI', icon: <Bot className="w-4 h-4" /> },
  { to: '/app/compliance', label: 'Compliance', icon: <CalendarCheck className="w-4 h-4" /> },
];

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { firebaseUser, userProfile } = useAuth();
  const { memberships, activeBusiness, reminders, invoices, switchBusiness } = useBusiness();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const displayName = userProfile?.displayName || firebaseUser?.displayName || 'Business Owner';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('') || 'MS';

  const notifications = useMemo(() => {
    const items: Array<{ id: string; title: string; meta: string; to: string }> = [];
    for (const rem of reminders.filter((r) => r.status === 'upcoming').slice(0, 3)) {
      items.push({
        id: `rem_${rem.id}`,
        title: rem.title,
        meta: `${rem.category} due ${formatDateDisplay(rem.dueDate)}`,
        to: '/app/compliance',
      });
    }
    for (const inv of invoices.filter((i) => i.status === 'overdue').slice(0, 2)) {
      items.push({
        id: `inv_${inv.id}`,
        title: `Overdue invoice ${inv.invoiceNumber}`,
        meta: `${inv.customerName} · ${formatINR(inv.totalAmount)}`,
        to: '/app/invoices',
      });
    }
    return items;
  }, [reminders, invoices]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutUser();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoggingOut(false);
    }
  };

  const renderSidebarLinks = (onSelect?: () => void) => (
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Workspace Navigation">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onSelect}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap ${
              isActive
                ? 'bg-[#EDF4FF] text-[#254EAA] dark:bg-[#3768D9]/20 dark:text-[#7FB3FF] font-semibold'
                : 'text-[#718096] dark:text-slate-300 hover:bg-[#F6F8FC] dark:hover:bg-slate-800/70 hover:text-[#25334B] dark:hover:text-white'
            }`
          }
        >
          {item.icon}
          <span className="truncate">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen flex bg-[#F6F8FC] text-[#25334B] dark:bg-[#0F172A] dark:text-slate-100 pb-16 lg:pb-0">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 border-r border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#131C31]">
        <div className="h-16 px-5 flex items-center gap-2.5 border-b border-slate-200/80 dark:border-slate-800">
          <Link to="/app" className="inline-flex items-center gap-2.5">
            <BrandMark size="sm" />
            <span className="text-base font-bold tracking-tight text-[#25334B] dark:text-white whitespace-nowrap">
              MSME SAATHI
            </span>
          </Link>
        </div>

        {activeBusiness ? (
          <div className="mx-3 mt-4 p-3 rounded-xl bg-[#F6F8FC] dark:bg-[#162036] border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#718096] dark:text-slate-400">
              <Building2 className="w-3.5 h-3.5 text-[#3768D9] dark:text-[#55A9D8] shrink-0" />
              <span className="truncate">Active Workspace</span>
            </div>
            {memberships.length > 1 ? (
              <select
                value={activeBusiness.id}
                onChange={(e) => void switchBusiness(e.target.value)}
                aria-label="Switch active business"
                className="mt-1.5 w-full px-2.5 py-1.5 text-xs font-semibold rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-[#25334B] dark:text-slate-100"
              >
                {memberships.map((m) => (
                  <option key={m.businessId} value={m.businessId}>
                    {m.businessName}
                  </option>
                ))}
              </select>
            ) : (
              <p className="mt-1 text-sm font-semibold text-[#25334B] dark:text-white truncate">
                {activeBusiness.businessName}
              </p>
            )}
            <p className="mt-0.5 text-xs text-[#718096] dark:text-slate-400 truncate">
              {activeBusiness.businessSize} · {activeBusiness.city}
            </p>
          </div>
        ) : null}

        {renderSidebarLinks()}

        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EDF4FF] dark:bg-[#3768D9]/25 text-[#254EAA] dark:text-[#7FB3FF] flex items-center justify-center text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#25334B] dark:text-slate-100 truncate">
                {displayName}
              </p>
              <p className="text-[11px] text-[#718096] dark:text-slate-400 truncate">
                {firebaseUser?.email}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void handleLogout()}
            disabled={loggingOut}
            className="mt-3 w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162036] text-xs font-medium text-[#25334B] dark:text-slate-200 hover:bg-[#F6F8FC] dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{loggingOut ? 'Signing out...' : 'Sign Out'}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {sidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#25334B]/40 backdrop-blur-xs"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative w-72 max-w-[85vw] flex flex-col bg-white dark:bg-[#131C31] border-r border-slate-200 dark:border-slate-800 z-10">
            <div className="h-16 px-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
              <div className="inline-flex items-center gap-2.5">
                <BrandMark size="sm" />
                <span className="text-base font-bold tracking-tight text-[#25334B] dark:text-white">
                  MSME SAATHI
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close sidebar"
                className="p-1.5 rounded-lg text-[#718096] dark:text-slate-300 hover:bg-[#F6F8FC] dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {renderSidebarLinks(() => setSidebarOpen(false))}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => void handleLogout()}
                disabled={loggingOut}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-[#25334B] dark:text-slate-200"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{loggingOut ? 'Signing out...' : 'Sign Out'}</span>
              </button>
            </div>
          </aside>
        </div>
      ) : null}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-16 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-[#131C31]/95 backdrop-blur-md flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden p-2 rounded-lg text-[#25334B] dark:text-slate-200 hover:bg-[#F6F8FC] dark:hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#25334B] dark:text-white truncate">
                {activeBusiness?.businessName || 'MSME Workspace'}
              </p>
              <p className="text-xs text-[#718096] dark:text-slate-400 truncate hidden sm:block">
                {activeBusiness
                  ? `${activeBusiness.businessType} · ${activeBusiness.industryCategory}`
                  : 'Financial & Compliance Console'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 relative">
            <ThemeToggle />

            {/* Notification Popover Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotifOpen((prev) => !prev);
                  setProfileOpen(false);
                }}
                aria-label="Workspace alerts and reminders"
                className="relative p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162036] text-[#25334B] dark:text-slate-200 hover:bg-[#F6F8FC] dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {notifications.length > 0 ? (
                  <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-md bg-[#EE806B] text-white text-[10px] font-bold flex items-center justify-center font-mono">
                    {notifications.length}
                  </span>
                ) : null}
              </button>

              {notifOpen ? (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#162036] border border-slate-200 dark:border-slate-800 rounded-xl shadow-fintech-lg z-40 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#25334B] dark:text-white">
                      Active Alerts
                    </span>
                    <span className="text-[11px] text-[#718096] dark:text-slate-400">
                      {notifications.length} items
                    </span>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="p-4 text-xs text-[#718096] dark:text-slate-400">
                      No overdue invoices or pending compliance deadlines right now.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-64 overflow-y-auto">
                      {notifications.map((item) => (
                        <Link
                          key={item.id}
                          to={item.to}
                          onClick={() => setNotifOpen(false)}
                          className="block px-4 py-3 hover:bg-[#F6F8FC] dark:hover:bg-slate-800/70"
                        >
                          <p className="text-xs font-medium text-[#25334B] dark:text-slate-100 truncate">
                            {item.title}
                          </p>
                          <p className="mt-0.5 text-[11px] text-[#718096] dark:text-slate-400">
                            {item.meta}
                          </p>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Profile Avatar Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setProfileOpen((prev) => !prev);
                  setNotifOpen(false);
                }}
                aria-label="Open account menu"
                className="inline-flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162036] hover:bg-[#F6F8FC] dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <span className="w-6 h-6 rounded-md bg-[#3768D9] text-white text-[11px] font-bold flex items-center justify-center">
                  {initials}
                </span>
                <span className="hidden sm:inline text-xs font-medium text-[#25334B] dark:text-slate-200 max-w-[110px] truncate">
                  {displayName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#718096]" />
              </button>

              {profileOpen ? (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#162036] border border-slate-200 dark:border-slate-800 rounded-xl shadow-fintech-lg z-40 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-semibold text-[#25334B] dark:text-white truncate">
                      {displayName}
                    </p>
                    <p className="text-[11px] text-[#718096] dark:text-slate-400 truncate">
                      {firebaseUser?.email}
                    </p>
                  </div>
                  <div className="p-1.5 space-y-0.5">
                    <Link
                      to="/app/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-[#25334B] dark:text-slate-200 hover:bg-[#F6F8FC] dark:hover:bg-slate-800"
                    >
                      <Settings className="w-3.5 h-3.5 text-[#718096]" />
                      <span>Business Settings</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => void handleLogout()}
                      disabled={loggingOut}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-[#C85641] dark:text-[#F49D8B] hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{loggingOut ? 'Signing out...' : 'Sign Out'}</span>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>

      {/* Dedicated Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Quick Navigation"
        className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 dark:bg-[#131C31]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 grid grid-cols-5 h-16 px-1"
      >
        {MOBILE_QUICK_TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 text-[11px] font-medium ${
                isActive
                  ? 'text-[#3768D9] dark:text-[#7FB3FF] font-semibold'
                  : 'text-[#718096] dark:text-slate-400'
              }`
            }
          >
            {tab.icon}
            <span className="truncate max-w-full px-1">{tab.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
