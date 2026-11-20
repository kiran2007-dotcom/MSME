import { useEffect, useState, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { Moon, Sun, X } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme.tsx';
import { formatINR } from '../../utils/formatters.ts';

export function BrandMark({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 'w-7 h-7' : 'w-8 h-8';
  return (
    <span
      className={`inline-flex items-center justify-center rounded-lg bg-[#3768D9] text-white shadow-xs shrink-0 ${dim}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
        <path
          d="M4 16.5L9.5 11L13.5 14.5L20 7.5"
          stroke="#FFFFFF"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15.5 7.5H20V12"
          stroke="#6EE7B7"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="4" y="18.5" width="16" height="2" rx="1" fill="#93C5FD" />
      </svg>
    </span>
  );
}

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedINR({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const startValue = displayValue;
    const target = Number.isFinite(value) ? value : 0;
    if (startValue === target) return;

    const duration = 380;
    const startTime = performance.now();
    let frameId = 0;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(startValue + (target - startValue) * eased);
      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      } else {
        setDisplayValue(target);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [value]);

  return <span className="font-mono tabular-nums">{formatINR(Math.round(displayValue))}</span>;
}

export function FullPageLoader({ label = 'Loading workspace...' }: { label?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F6F8FC] dark:bg-[#0F172A] px-6">
      <div className="mb-4">
        <BrandMark />
      </div>
      <div className="w-8 h-8 border-2 border-slate-200 dark:border-slate-700 border-t-[#3768D9] dark:border-t-[#55A9D8] rounded-full animate-spin mb-3" />
      <p className="text-sm font-medium text-[#718096] dark:text-slate-400">{label}</p>
    </div>
  );
}

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162036] text-[#25334B] dark:text-slate-200 hover:bg-[#F6F8FC] dark:hover:bg-slate-800 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${className}`}
    >
      {theme === 'dark' ? (
        <Sun className="w-3.5 h-3.5 text-[#F4B544]" />
      ) : (
        <Moon className="w-3.5 h-3.5 text-[#3768D9]" />
      )}
      <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
    </button>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800">
      <div>
        <h1 className="text-2xl sm:text-[26px] font-bold tracking-tight text-[#25334B] dark:text-white">
          {title}
        </h1>
        <p className="mt-1 text-sm text-[#718096] dark:text-slate-400">{description}</p>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3 shrink-0">{actions}</div> : null}
    </div>
  );
}

export type StatColorVariant = 'blue' | 'emerald' | 'coral' | 'amber' | 'lavender' | 'sky';

const STAT_PALETTE: Record<
  StatColorVariant,
  {
    iconBg: string;
    iconText: string;
    accentText: string;
    sparkColor: string;
    surfaceTint: string;
  }
> = {
  blue: {
    iconBg: 'bg-[#EDF4FF] dark:bg-[#3768D9]/20',
    iconText: 'text-[#3768D9] dark:text-[#55A9D8]',
    accentText: 'text-[#254EAA] dark:text-[#7FB3FF]',
    sparkColor: '#3768D9',
    surfaceTint: 'hover:border-[#3768D9]/40',
  },
  emerald: {
    iconBg: 'bg-emerald-50 dark:bg-[#22A58B]/20',
    iconText: 'text-[#22A58B] dark:text-emerald-300',
    accentText: 'text-[#187D69] dark:text-emerald-300',
    sparkColor: '#22A58B',
    surfaceTint: 'hover:border-[#22A58B]/40',
  },
  coral: {
    iconBg: 'bg-orange-50 dark:bg-[#EE806B]/20',
    iconText: 'text-[#EE806B] dark:text-[#F49D8B]',
    accentText: 'text-[#C85641] dark:text-[#F49D8B]',
    sparkColor: '#EE806B',
    surfaceTint: 'hover:border-[#EE806B]/40',
  },
  amber: {
    iconBg: 'bg-amber-50 dark:bg-[#F4B544]/20',
    iconText: 'text-[#D49218] dark:text-[#F4B544]',
    accentText: 'text-[#B2760B] dark:text-[#F4B544]',
    sparkColor: '#F4B544',
    surfaceTint: 'hover:border-[#F4B544]/40',
  },
  lavender: {
    iconBg: 'bg-indigo-50 dark:bg-[#8A76D6]/20',
    iconText: 'text-[#8A76D6] dark:text-[#ABA0E6]',
    accentText: 'text-[#6A56B8] dark:text-[#ABA0E6]',
    sparkColor: '#8A76D6',
    surfaceTint: 'hover:border-[#8A76D6]/40',
  },
  sky: {
    iconBg: 'bg-sky-50 dark:bg-[#55A9D8]/20',
    iconText: 'text-[#55A9D8] dark:text-sky-300',
    accentText: 'text-[#2B7FA8] dark:text-sky-300',
    sparkColor: '#55A9D8',
    surfaceTint: 'hover:border-[#55A9D8]/40',
  },
};

function MiniSparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const width = 76;
  const height = 26;

  const points = values
    .map((v, idx) => {
      const x = (idx / (values.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible shrink-0" aria-hidden="true">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export function StatCard({
  label,
  value,
  numericValue,
  subtext,
  icon,
  variant = 'blue',
  deltaText,
  trendPoints,
}: {
  label: string;
  value: string;
  numericValue?: number;
  subtext: string;
  icon?: ReactNode;
  variant?: StatColorVariant;
  deltaText?: string;
  trendPoints?: number[];
}) {
  const palette = STAT_PALETTE[variant];

  return (
    <div
      className={`bg-white dark:bg-[#162036] border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-fintech transition-all duration-200 ${palette.surfaceTint}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-[#718096] dark:text-slate-400 truncate">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-[#25334B] dark:text-white font-mono tabular-nums">
            {typeof numericValue === 'number' ? <AnimatedINR value={numericValue} /> : value}
          </p>
        </div>
        {icon ? (
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${palette.iconBg} ${palette.iconText}`}
          >
            {icon}
          </div>
        ) : null}
      </div>

      <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 min-h-[28px]">
        <div className="min-w-0">
          {deltaText ? (
            <p className={`text-xs font-semibold truncate ${palette.accentText}`}>{deltaText}</p>
          ) : (
            <p className="text-xs text-[#718096] dark:text-slate-400 truncate">{subtext}</p>
          )}
        </div>
        {trendPoints && trendPoints.length >= 2 ? (
          <MiniSparkline values={trendPoints} color={palette.sparkColor} />
        ) : null}
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-[#162036] border border-slate-200 dark:border-slate-800 rounded-xl px-6 py-12 text-center shadow-fintech">
      <div className="mx-auto w-12 h-12 rounded-xl bg-[#EDF4FF] dark:bg-[#3768D9]/20 text-[#3768D9] dark:text-[#55A9D8] flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-[#25334B] dark:text-white">{title}</h3>
      <p className="mt-1.5 text-sm text-[#718096] dark:text-slate-400 max-w-md mx-auto">
        {description}
      </p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#25334B]/45 dark:bg-slate-950/70 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg bg-white dark:bg-[#162036] border border-slate-200 dark:border-slate-800 rounded-xl shadow-fintech-lg overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-[#F6F8FC] dark:bg-[#131C31]">
          <h2 className="text-base font-semibold text-[#25334B] dark:text-white">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-[#718096] hover:text-[#25334B] dark:text-slate-400 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </motion.div>
    </div>
  );
}

export function TableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="bg-white dark:bg-[#162036] border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 shadow-fintech">
      {Array.from({ length: rows }).map((_, idx) => (
        <div
          key={idx}
          className="h-11 rounded-lg bg-[#F6F8FC] dark:bg-slate-800/80 animate-pulse"
        />
      ))}
    </div>
  );
}
