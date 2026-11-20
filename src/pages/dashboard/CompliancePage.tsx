import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  AlertCircle,
  CalendarCheck,
  CheckCircle2,
  Clock,
  FileCheck2,
  Plus,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { DashboardLayout } from '../../layouts/DashboardLayout.tsx';
import {
  EmptyState,
  Modal,
  PageHeader,
  StatCard,
  TableSkeleton,
} from '../../components/ui/Primitives.tsx';
import { useAuth } from '../../hooks/useAuth.tsx';
import { useBusiness } from '../../hooks/useBusiness.tsx';
import { fetchComplianceCalendar } from '../../services/apiService.ts';
import {
  createReminder,
  deleteReminder,
  toggleReminderStatus,
} from '../../services/financeService.ts';
import {
  FIELD_LIMITS,
  type ComplianceCalendarTemplate,
  type ReminderCategory,
} from '../../types/index.ts';
import { formatDateDisplay, getTodayISO } from '../../utils/formatters.ts';

const CATEGORIES: ReminderCategory[] = ['GST', 'Income Tax', 'ROC', 'MSME', 'Payment', 'Other'];

const CATEGORY_STYLE: Record<string, string> = {
  GST: 'bg-[#EDF4FF] dark:bg-[#3768D9]/20 text-[#254EAA] dark:text-[#7FB3FF]',
  'Income Tax': 'bg-indigo-50 dark:bg-[#8A76D6]/20 text-[#6A56B8] dark:text-[#ABA0E6]',
  TDS: 'bg-indigo-50 dark:bg-[#8A76D6]/20 text-[#6A56B8] dark:text-[#ABA0E6]',
  ROC: 'bg-amber-50 dark:bg-[#F4B544]/20 text-[#B2760B] dark:text-[#F4B544]',
  MSME: 'bg-emerald-50 dark:bg-[#22A58B]/20 text-[#187D69] dark:text-emerald-300',
  Payment: 'bg-orange-50 dark:bg-[#EE806B]/20 text-[#C85641] dark:text-[#F49D8B]',
  Other: 'bg-sky-50 dark:bg-[#55A9D8]/20 text-[#2B7FA8] dark:text-sky-300',
};

export function CompliancePage() {
  const { firebaseUser } = useAuth();
  const { activeBusiness, reminders, dataLoaded } = useBusiness();

  const [calendar, setCalendar] = useState<ComplianceCalendarTemplate[]>([]);
  const [calendarError, setCalendarError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ReminderCategory>('GST');
  const [dueDate, setDueDate] = useState(getTodayISO());
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    fetchComplianceCalendar()
      .then((items) => {
        if (active) setCalendar(items);
      })
      .catch((err) => {
        if (active) setCalendarError(err instanceof Error ? err.message : 'Unable to load calendar.');
      });
    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    const total = reminders.length;
    const upcoming = reminders.filter((r) => r.status === 'upcoming').length;
    const completed = reminders.filter((r) => r.status === 'completed').length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, upcoming, completed, pct };
  }, [reminders]);

  const openFromCalendar = (item: ComplianceCalendarTemplate) => {
    const matchedCat: ReminderCategory = CATEGORIES.includes(item.category as ReminderCategory)
      ? (item.category as ReminderCategory)
      : item.category === 'TDS'
      ? 'Income Tax'
      : 'Other';
    setTitle(item.title);
    setCategory(matchedCat);
    setNotes(`${item.typicalDueRule} (${item.applicability})`);
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!title.trim()) {
      setFormError('Please enter a reminder title.');
      return;
    }
    if (!dueDate) {
      setFormError('Please pick a due date.');
      return;
    }
    if (!activeBusiness || !firebaseUser) return;

    setSubmitting(true);
    try {
      await createReminder(activeBusiness.id, firebaseUser.uid, {
        title: title.trim(),
        category,
        dueDate,
        status: 'upcoming',
        notes: notes.trim(),
      });
      setTitle('');
      setNotes('');
      setModalOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to save reminder.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Compliance & Statutory Reminders"
          description="Schedule GST, Income Tax, TDS, ROC, and MSME compliance deadlines."
          actions={
            <button
              type="button"
              onClick={() => {
                setTitle('');
                setNotes('');
                setFormError('');
                setModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#3768D9] hover:bg-[#254EAA] text-white text-xs font-semibold cursor-pointer whitespace-nowrap shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Reminder</span>
            </button>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Scheduled Reminders"
            value={`${stats.total}`}
            subtext="Total tracked obligations"
            variant="blue"
            icon={<CalendarCheck className="w-5 h-5" />}
          />
          <StatCard
            label="Upcoming Deadlines"
            value={`${stats.upcoming}`}
            subtext="Pending action"
            variant="amber"
            icon={<Clock className="w-5 h-5" />}
          />
          <StatCard
            label="Completed Tasks"
            value={`${stats.completed}`}
            subtext={stats.total > 0 ? `${stats.pct}% completion rate` : 'No reminders scheduled'}
            variant="emerald"
            icon={<FileCheck2 className="w-5 h-5" />}
          />
        </div>

        {/* Completion Progress Bar when reminders exist */}
        {reminders.length > 0 ? (
          <div className="bg-white dark:bg-[#162036] border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-fintech">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-[#25334B] dark:text-white">
                Compliance Task Completion
              </span>
              <span className="font-mono font-semibold text-[#22A58B] tabular-nums">
                {stats.completed} of {stats.total} completed ({stats.pct}%)
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-[#F6F8FC] dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#22A58B] transition-all duration-300"
                style={{ width: `${stats.pct}%` }}
              />
            </div>
          </div>
        ) : null}

        {/* User Reminders */}
        <section>
          <h2 className="text-base font-semibold text-[#25334B] dark:text-white mb-3">
            Your Business Reminders
          </h2>
          {!dataLoaded ? (
            <TableSkeleton rows={3} />
          ) : reminders.length === 0 ? (
            <EmptyState
              icon={<CalendarCheck className="w-5 h-5" />}
              title="No compliance reminders scheduled"
              description="Add reminders for GSTR-1, GSTR-3B, advance tax, or vendor MSME 45-day payment deadlines."
              action={
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#3768D9] hover:bg-[#254EAA] text-white text-xs font-semibold cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Schedule First Reminder</span>
                </button>
              }
            />
          ) : (
            <div className="bg-white dark:bg-[#162036] border border-slate-200/90 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 shadow-fintech">
              {reminders.map((rem) => (
                <div
                  key={rem.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F6F8FC]/60 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                          CATEGORY_STYLE[rem.category] ?? CATEGORY_STYLE.Other
                        }`}
                      >
                        {rem.category}
                      </span>
                      <span className="text-xs font-mono text-[#718096] dark:text-slate-400">
                        Due {formatDateDisplay(rem.dueDate)}
                      </span>
                    </div>
                    <p
                      className={`mt-1.5 text-sm font-semibold ${
                        rem.status === 'completed'
                          ? 'line-through text-[#718096] dark:text-slate-500'
                          : 'text-[#25334B] dark:text-slate-100'
                      }`}
                    >
                      {rem.title}
                    </p>
                    {rem.notes ? (
                      <p className="mt-1 text-xs text-[#718096] dark:text-slate-400">{rem.notes}</p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {activeBusiness ? (
                      <button
                        type="button"
                        onClick={() =>
                          void toggleReminderStatus(
                            activeBusiness.id,
                            rem.id,
                            rem.status === 'upcoming' ? 'completed' : 'upcoming'
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131C31] text-xs font-semibold text-[#25334B] dark:text-slate-200 hover:bg-[#F6F8FC] dark:hover:bg-slate-800 cursor-pointer transition-colors"
                      >
                        {rem.status === 'upcoming' ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#22A58B]" />
                            <span>Mark Done</span>
                          </>
                        ) : (
                          <>
                            <RotateCcw className="w-3.5 h-3.5 text-[#3768D9]" />
                            <span>Reopen</span>
                          </>
                        )}
                      </button>
                    ) : null}
                    {activeBusiness ? (
                      <button
                        type="button"
                        onClick={() => void deleteReminder(activeBusiness.id, rem.id)}
                        aria-label="Delete reminder"
                        className="p-1.5 rounded-lg text-[#718096] hover:text-[#EE806B] hover:bg-orange-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Indian Statutory Reference Calendar */}
        <section>
          <div className="flex items-center justify-between gap-4 mb-3">
            <h2 className="text-base font-semibold text-[#25334B] dark:text-white">
              Indian MSME Statutory Reference Calendar
            </h2>
            <span className="text-xs text-[#718096] dark:text-slate-400">
              Click any item to schedule a reminder
            </span>
          </div>
          {calendarError ? (
            <div className="p-4 rounded-xl bg-orange-50 dark:bg-red-950/60 border border-[#EE806B]/40 text-xs text-[#C85641] dark:text-red-300">
              {calendarError}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {calendar.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-[#162036] border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-fintech flex flex-col justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                          CATEGORY_STYLE[item.category] ?? CATEGORY_STYLE.Other
                        }`}
                      >
                        {item.category}
                      </span>
                      <span className="text-[11px] font-medium text-[#718096] dark:text-slate-400">
                        {item.frequency}
                      </span>
                    </div>
                    <h3 className="mt-2.5 text-sm font-semibold text-[#25334B] dark:text-white">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-xs text-[#25334B] dark:text-slate-300">
                      <span className="text-[#718096] dark:text-slate-400">Due rule:</span>{' '}
                      {item.typicalDueRule}
                    </p>
                    <p className="mt-1 text-xs text-[#718096] dark:text-slate-400">
                      Applies to: {item.applicability}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button
                      type="button"
                      onClick={() => openFromCalendar(item)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#3768D9] dark:text-[#55A9D8] hover:underline cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Schedule Reminder</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Compliance Reminder">
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {formError ? (
            <div className="p-3 rounded-lg bg-orange-50 dark:bg-red-950/60 border border-[#EE806B]/40 flex items-start gap-2 text-xs text-[#C85641] dark:text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          ) : null}

          <div>
            <label className="block text-xs font-medium text-[#25334B] dark:text-slate-300 mb-1">
              Reminder Title *
            </label>
            <input
              type="text"
              maxLength={FIELD_LIMITS.REMINDER_TITLE_MAX}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="File monthly GSTR-3B return"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-sm focus:outline-none focus:ring-2 focus:ring-[#3768D9]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#25334B] dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ReminderCategory)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-sm focus:outline-none focus:ring-2 focus:ring-[#3768D9]"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#25334B] dark:text-slate-300 mb-1">
                Due Date *
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-sm focus:outline-none focus:ring-2 focus:ring-[#3768D9]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#25334B] dark:text-slate-300 mb-1">
              Notes
            </label>
            <textarea
              rows={2}
              maxLength={FIELD_LIMITS.NOTES_MAX}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Reconcile purchase invoices with GSTR-2B before filing"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-sm focus:outline-none focus:ring-2 focus:ring-[#3768D9]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-[#25334B] dark:text-slate-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-lg bg-[#3768D9] hover:bg-[#254EAA] text-white text-xs font-semibold cursor-pointer disabled:opacity-60 transition-colors"
            >
              {submitting ? 'Saving...' : 'Save Reminder'}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
