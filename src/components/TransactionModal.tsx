import { useState, type FormEvent } from 'react';
import { AlertCircle } from 'lucide-react';
import { Modal } from './ui/Primitives.tsx';
import {
  FIELD_LIMITS,
  type PaymentMethod,
  type TransactionInput,
  type TransactionStatus,
  type TransactionType,
} from '../types/index.ts';
import { getTodayISO } from '../utils/formatters.ts';

const INCOME_CATEGORIES = ['Product Sales', 'Service Revenue', 'Consulting', 'Other Income'];
const EXPENSE_CATEGORIES = [
  'Raw Materials & Inventory',
  'Payroll & Wages',
  'Rent & Utilities',
  'Logistics & Freight',
  'Marketing & Sales',
  'Professional Fees',
  'GST / Statutory Tax',
  'Other Expense',
];
const PAYMENT_METHODS: PaymentMethod[] = ['UPI', 'NEFT/RTGS', 'Card', 'Cash', 'Cheque', 'Other'];

export function TransactionModal({
  open,
  onClose,
  defaultType = 'income',
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  defaultType?: TransactionType;
  onSubmit: (values: TransactionInput) => Promise<void>;
}) {
  const [type, setType] = useState<TransactionType>(defaultType);
  const [category, setCategory] = useState(
    defaultType === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]
  );
  const [description, setDescription] = useState('');
  const [counterparty, setCounterparty] = useState('');
  const [amount, setAmount] = useState('');
  const [gstAmount, setGstAmount] = useState('0');
  const [date, setDate] = useState(getTodayISO());
  const [status, setStatus] = useState<TransactionStatus>('completed');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('NEFT/RTGS');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleTypeSwitch = (nextType: TransactionType) => {
    setType(nextType);
    setCategory(nextType === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedAmount = Number(amount);
    const parsedGst = Number(gstAmount || 0);

    if (!description.trim()) {
      setError('Please enter a transaction description.');
      return;
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError('Amount must be greater than ₹0.');
      return;
    }
    if (!Number.isFinite(parsedGst) || parsedGst < 0) {
      setError('GST amount cannot be negative.');
      return;
    }
    if (!date) {
      setError('Please choose a transaction date.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        type,
        category,
        description: description.trim(),
        counterparty: counterparty.trim(),
        amount: parsedAmount,
        gstAmount: parsedGst,
        date,
        status,
        paymentMethod,
      });
      setDescription('');
      setCounterparty('');
      setAmount('');
      setGstAmount('0');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save transaction.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Record Financial Transaction">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error ? (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 flex items-start gap-2 text-xs text-red-800 dark:text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-2 p-1 rounded-lg bg-[#F6F8FC] dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
          <button
            type="button"
            onClick={() => handleTypeSwitch('income')}
            className={`py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              type === 'income'
                ? 'bg-white dark:bg-[#162036] text-[#22A58B] shadow-xs'
                : 'text-[#718096] dark:text-slate-400'
            }`}
          >
            Income / Inflow
          </button>
          <button
            type="button"
            onClick={() => handleTypeSwitch('expense')}
            className={`py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              type === 'expense'
                ? 'bg-white dark:bg-[#162036] text-[#EE806B] shadow-xs'
                : 'text-[#718096] dark:text-slate-400'
            }`}
          >
            Expense / Outflow
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#25334B] dark:text-slate-300 mb-1">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-sm"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#25334B] dark:text-slate-300 mb-1">
              Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#25334B] dark:text-slate-300 mb-1">
            Description *
          </label>
          <input
            type="text"
            maxLength={FIELD_LIMITS.TX_DESC_MAX}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={
              type === 'income' ? 'Batch delivery to textile buyer' : 'Raw cotton yarn procurement'
            }
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#25334B] dark:text-slate-300 mb-1">
            {type === 'income' ? 'Customer / Payer Name' : 'Vendor / Payee Name'}
          </label>
          <input
            type="text"
            maxLength={FIELD_LIMITS.COUNTERPARTY_MAX}
            value={counterparty}
            onChange={(e) => setCounterparty(e.target.value)}
            placeholder="Optional party name"
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#25334B] dark:text-slate-300 mb-1">
              Total Amount (₹) *
            </label>
            <input
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="25000"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#25334B] dark:text-slate-300 mb-1">
              Included GST (₹)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={gstAmount}
              onChange={(e) => setGstAmount(e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-sm font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#25334B] dark:text-slate-300 mb-1">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-sm"
            >
              {PAYMENT_METHODS.map((pm) => (
                <option key={pm} value={pm}>
                  {pm}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#25334B] dark:text-slate-300 mb-1">
              Settlement Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TransactionStatus)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-sm"
            >
              <option value="completed">Completed (Settled)</option>
              <option value="pending">Pending (Receivable / Payable)</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium text-[#25334B] dark:text-slate-200 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 rounded-lg bg-[#3768D9] hover:bg-[#254EAA] text-white text-xs font-semibold cursor-pointer disabled:opacity-60"
          >
            {submitting ? 'Saving...' : 'Save Transaction'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
