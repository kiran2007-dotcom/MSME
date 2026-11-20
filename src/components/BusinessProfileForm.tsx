import { useState, type FormEvent } from 'react';
import { AlertCircle } from 'lucide-react';
import {
  FIELD_LIMITS,
  INDIAN_STATES,
  INDUSTRY_CATEGORIES,
  type BusinessInput,
  type BusinessSize,
  type BusinessType,
  type RegistrationStatus,
} from '../types/index.ts';
import { isValidGSTIN, isValidPincode, isValidUdyam } from '../utils/formatters.ts';

const BUSINESS_TYPES: BusinessType[] = [
  'Proprietorship',
  'Partnership',
  'LLP',
  'Private Limited',
  'One Person Company',
  'Other',
];

const BUSINESS_SIZES: Array<{ value: BusinessSize; detail: string }> = [
  { value: 'Micro', detail: 'Investment <= ₹1 Cr & Turnover <= ₹5 Cr' },
  { value: 'Small', detail: 'Investment <= ₹10 Cr & Turnover <= ₹50 Cr' },
  { value: 'Medium', detail: 'Investment <= ₹50 Cr & Turnover <= ₹250 Cr' },
];

const REGISTRATION_STATUSES: RegistrationStatus[] = [
  'Registered',
  'In Progress',
  'Unregistered',
];

export function BusinessProfileForm({
  initialValues,
  submitLabel,
  onSubmit,
}: {
  initialValues: BusinessInput;
  submitLabel: string;
  onSubmit: (values: BusinessInput) => Promise<void>;
}) {
  const [form, setForm] = useState<BusinessInput>(initialValues);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.ownerName.trim().length < 2) {
      setError('Owner name must be at least 2 characters.');
      return;
    }
    if (form.businessName.trim().length < 2) {
      setError('Business name must be at least 2 characters.');
      return;
    }
    if (form.city.trim().length < 2) {
      setError('Please enter your business city or town.');
      return;
    }
    if (!form.state) {
      setError('Please select a state.');
      return;
    }
    if (!isValidPincode(form.pincode)) {
      setError('Please enter a valid 6-digit Indian PIN code.');
      return;
    }
    if (!isValidGSTIN(form.gstin)) {
      setError(
        'GSTIN format is invalid (expected 15 characters like 29ABCDE1234F1Z5) or leave blank.'
      );
      return;
    }
    if (!isValidUdyam(form.udyamNumber)) {
      setError('Udyam number format must match UDYAM-XX-00-0000000 or leave blank.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        ...form,
        gstin: form.gstin.trim().toUpperCase(),
        udyamNumber: form.udyamNumber.trim().toUpperCase(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save business profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {error ? (
        <div
          role="alert"
          className="p-3.5 rounded-lg bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 flex items-start gap-2.5 text-xs text-red-800 dark:text-red-300"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-[#25334B] dark:text-slate-300 mb-1.5">
            Owner / Authorized Signatory Name *
          </label>
          <input
            type="text"
            required
            maxLength={FIELD_LIMITS.DISPLAY_NAME_MAX}
            value={form.ownerName}
            onChange={(e) => setForm((p) => ({ ...p, ownerName: e.target.value }))}
            placeholder="Rajeshwari Rao"
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-sm text-[#25334B] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#3768D9]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#25334B] dark:text-slate-300 mb-1.5">
            Legal / Trade Business Name *
          </label>
          <input
            type="text"
            required
            maxLength={FIELD_LIMITS.BUSINESS_NAME_MAX}
            value={form.businessName}
            onChange={(e) => setForm((p) => ({ ...p, businessName: e.target.value }))}
            placeholder="Bengaluru Precision Textiles Pvt Ltd"
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-sm text-[#25334B] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#3768D9]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#25334B] dark:text-slate-300 mb-1.5">
            Business Constitution / Type *
          </label>
          <select
            value={form.businessType}
            onChange={(e) =>
              setForm((p) => ({ ...p, businessType: e.target.value as BusinessType }))
            }
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-sm text-[#25334B] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#3768D9]"
          >
            {BUSINESS_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#25334B] dark:text-slate-300 mb-1.5">
            Industry / Category *
          </label>
          <select
            value={form.industryCategory}
            onChange={(e) => setForm((p) => ({ ...p, industryCategory: e.target.value }))}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-sm text-[#25334B] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#3768D9]"
          >
            {INDUSTRY_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Location */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-[#25334B] dark:text-slate-300 mb-1.5">
            City / District *
          </label>
          <input
            type="text"
            required
            maxLength={FIELD_LIMITS.CITY_MAX}
            value={form.city}
            onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
            placeholder="Bengaluru"
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-sm text-[#25334B] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#3768D9]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#25334B] dark:text-slate-300 mb-1.5">
            State / UT *
          </label>
          <select
            value={form.state}
            onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-sm text-[#25334B] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#3768D9]"
          >
            {INDIAN_STATES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#25334B] dark:text-slate-300 mb-1.5">
            PIN Code *
          </label>
          <input
            type="text"
            required
            maxLength={6}
            inputMode="numeric"
            value={form.pincode}
            onChange={(e) =>
              setForm((p) => ({ ...p, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))
            }
            placeholder="560001"
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-sm font-mono text-[#25334B] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#3768D9]"
          />
        </div>
      </div>

      {/* Business Size */}
      <div>
        <label className="block text-xs font-medium text-[#25334B] dark:text-slate-300 mb-2">
          MSME Size Classification *
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {BUSINESS_SIZES.map((item) => {
            const active = form.businessSize === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setForm((p) => ({ ...p, businessSize: item.value }))}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  active
                    ? 'border-[#3768D9] bg-[#EDF4FF] dark:border-[#55A9D8] dark:bg-[#3768D9]/20'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-[#F6F8FC] dark:hover:bg-slate-800/50'
                }`}
              >
                <p className="text-sm font-semibold text-[#25334B] dark:text-white">{item.value}</p>
                <p className="mt-1 text-xs text-[#718096] dark:text-slate-400">{item.detail}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Registration Status & Statutory IDs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-[#25334B] dark:text-slate-300 mb-1.5">
            Registration Status *
          </label>
          <select
            value={form.registrationStatus}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                registrationStatus: e.target.value as RegistrationStatus,
              }))
            }
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-sm text-[#25334B] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#3768D9]"
          >
            {REGISTRATION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#25334B] dark:text-slate-300 mb-1.5">
            GSTIN (if applicable)
          </label>
          <input
            type="text"
            maxLength={15}
            value={form.gstin}
            onChange={(e) =>
              setForm((p) => ({ ...p, gstin: e.target.value.toUpperCase().slice(0, 15) }))
            }
            placeholder="29ABCDE1234F1Z5"
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-sm font-mono uppercase text-[#25334B] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#3768D9]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#25334B] dark:text-slate-300 mb-1.5">
            Udyam Number (if applicable)
          </label>
          <input
            type="text"
            maxLength={25}
            value={form.udyamNumber}
            onChange={(e) =>
              setForm((p) => ({ ...p, udyamNumber: e.target.value.toUpperCase().slice(0, 25) }))
            }
            placeholder="UDYAM-KA-01-0012345"
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-sm font-mono uppercase text-[#25334B] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#3768D9]"
          />
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2.5 rounded-lg bg-[#3768D9] hover:bg-[#254EAA] text-white text-sm font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-60"
        >
          {submitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
