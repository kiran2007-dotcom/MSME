import { useMemo, useState, type FormEvent } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  IndianRupee,
  Plus,
  Printer,
  Search,
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
import {
  createInvoice,
  deleteInvoice,
  updateInvoiceStatus,
} from '../../services/financeService.ts';
import { FIELD_LIMITS, type Invoice, type InvoiceStatus } from '../../types/index.ts';
import {
  formatDateDisplay,
  formatINR,
  getTodayISO,
  isValidGSTIN,
} from '../../utils/formatters.ts';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function printInvoiceDocument(
  inv: Invoice,
  businessName: string,
  businessCity: string,
  businessState: string,
  businessGstin: string,
  businessUdyam: string
) {
  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Invoice ${escapeHtml(inv.invoiceNumber)}</title>
  <style>
    body { font-family: Inter, system-ui, -apple-system, sans-serif; color: #25334B; margin: 40px; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #3768D9; padding-bottom: 20px; margin-bottom: 24px; }
    .brand { font-size: 20px; font-weight: 700; color: #254EAA; }
    .meta { font-size: 12px; color: #718096; margin-top: 4px; }
    .inv-title { text-align: right; }
    .inv-title h1 { margin: 0; font-size: 22px; color: #25334B; }
    .grid { display: flex; justify-content: space-between; margin-bottom: 28px; font-size: 13px; }
    .box { width: 46%; background: #F6F8FC; padding: 14px; border-radius: 8px; }
    .label { font-size: 11px; text-transform: uppercase; color: #718096; font-weight: 600; margin-bottom: 6px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    th { background: #EDF4FF; color: #25334B; text-align: left; padding: 10px 12px; font-size: 12px; }
    td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
    .right { text-align: right; font-variant-numeric: tabular-nums; }
    .totals { width: 320px; margin-left: auto; font-size: 13px; }
    .totals-row { display: flex; justify-content: space-between; padding: 6px 0; }
    .totals-final { border-top: 2px solid #25334B; font-weight: 700; font-size: 15px; padding-top: 10px; margin-top: 6px; }
    .notes { margin-top: 28px; font-size: 12px; color: #718096; border-top: 1px solid #e2e8f0; padding-top: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">${escapeHtml(businessName)}</div>
      <div class="meta">${escapeHtml(businessCity)}, ${escapeHtml(businessState)}</div>
      ${businessGstin ? `<div class="meta">GSTIN: ${escapeHtml(businessGstin)}</div>` : ''}
      ${businessUdyam ? `<div class="meta">Udyam: ${escapeHtml(businessUdyam)}</div>` : ''}
    </div>
    <div class="inv-title">
      <h1>TAX INVOICE</h1>
      <div class="meta">Invoice #: ${escapeHtml(inv.invoiceNumber)}</div>
      <div class="meta">Status: ${escapeHtml(inv.status.toUpperCase())}</div>
    </div>
  </div>
  <div class="grid">
    <div class="box">
      <div class="label">Billed To</div>
      <div><strong>${escapeHtml(inv.customerName)}</strong></div>
      ${inv.customerGstin ? `<div class="meta">GSTIN: ${escapeHtml(inv.customerGstin)}</div>` : ''}
    </div>
    <div class="box">
      <div class="label">Invoice Dates</div>
      <div>Issue Date: ${escapeHtml(formatDateDisplay(inv.issueDate))}</div>
      <div style="margin-top:4px;">Due Date: ${escapeHtml(formatDateDisplay(inv.dueDate))}</div>
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th class="right">Taxable Value</th>
        <th class="right">GST</th>
        <th class="right">Line Total</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Business Goods / Services Supply (${escapeHtml(inv.invoiceNumber)})</td>
        <td class="right">${escapeHtml(formatINR(inv.subtotal))}</td>
        <td class="right">${escapeHtml(formatINR(inv.gstAmount))}</td>
        <td class="right">${escapeHtml(formatINR(inv.totalAmount))}</td>
      </tr>
    </tbody>
  </table>
  <div class="totals">
    <div class="totals-row"><span>Taxable Subtotal</span><span>${escapeHtml(formatINR(inv.subtotal))}</span></div>
    <div class="totals-row"><span>Total GST</span><span>${escapeHtml(formatINR(inv.gstAmount))}</span></div>
    <div class="totals-row totals-final"><span>Invoice Total</span><span>${escapeHtml(formatINR(inv.totalAmount))}</span></div>
  </div>
  ${inv.notes ? `<div class="notes"><strong>Notes / Terms:</strong> ${escapeHtml(inv.notes)}</div>` : ''}
</body>
</html>`;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(html);
    doc.close();
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        iframe.remove();
      }, 1500);
    }, 200);
  } else {
    iframe.remove();
  }
}

const STATUS_BADGE: Record<InvoiceStatus, string> = {
  draft: 'bg-slate-100 dark:bg-slate-800 text-[#718096] dark:text-slate-300',
  sent: 'bg-[#EDF4FF] dark:bg-[#3768D9]/20 text-[#254EAA] dark:text-[#7FB3FF]',
  paid: 'bg-emerald-50 dark:bg-[#22A58B]/20 text-[#187D69] dark:text-emerald-300',
  overdue: 'bg-orange-50 dark:bg-[#EE806B]/20 text-[#C85641] dark:text-[#F49D8B]',
};

export function InvoicesPage() {
  const { firebaseUser } = useAuth();
  const { activeBusiness, invoices, dataLoaded } = useBusiness();

  const [modalOpen, setModalOpen] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | InvoiceStatus>('all');
  const [search, setSearch] = useState('');

  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerGstin, setCustomerGstin] = useState('');
  const [issueDate, setIssueDate] = useState(getTodayISO());
  const [dueDate, setDueDate] = useState(getTodayISO());
  const [subtotal, setSubtotal] = useState('');
  const [gstAmount, setGstAmount] = useState('0');
  const [status, setStatus] = useState<InvoiceStatus>('sent');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return invoices.filter((inv) => {
      if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
      if (!query) return true;
      return (
        inv.invoiceNumber.toLowerCase().includes(query) ||
        inv.customerName.toLowerCase().includes(query) ||
        inv.customerGstin.toLowerCase().includes(query)
      );
    });
  }, [invoices, statusFilter, search]);

  const summary = useMemo(() => {
    let totalInvoiced = 0;
    let totalPaid = 0;
    let totalOutstanding = 0;
    for (const inv of invoices) {
      totalInvoiced += inv.totalAmount;
      if (inv.status === 'paid') totalPaid += inv.totalAmount;
      if (inv.status === 'sent' || inv.status === 'overdue') totalOutstanding += inv.totalAmount;
    }
    return { totalInvoiced, totalPaid, totalOutstanding };
  }, [invoices]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedSub = Number(subtotal);
    const parsedGst = Number(gstAmount || 0);

    if (!invoiceNumber.trim()) {
      setError('Please enter an invoice number (e.g. INV-2026-001).');
      return;
    }
    if (!customerName.trim()) {
      setError('Please enter the customer or buyer name.');
      return;
    }
    if (!isValidGSTIN(customerGstin)) {
      setError('Customer GSTIN format is invalid (15 characters) or leave blank.');
      return;
    }
    if (!Number.isFinite(parsedSub) || parsedSub <= 0) {
      setError('Subtotal must be greater than ₹0.');
      return;
    }
    if (!Number.isFinite(parsedGst) || parsedGst < 0) {
      setError('GST amount cannot be negative.');
      return;
    }
    if (!activeBusiness || !firebaseUser) return;

    setSubmitting(true);
    try {
      await createInvoice(activeBusiness.id, firebaseUser.uid, {
        invoiceNumber: invoiceNumber.trim(),
        customerName: customerName.trim(),
        customerGstin: customerGstin.trim().toUpperCase(),
        issueDate,
        dueDate,
        subtotal: parsedSub,
        gstAmount: parsedGst,
        status,
        notes: notes.trim(),
      });
      setInvoiceNumber('');
      setCustomerName('');
      setCustomerGstin('');
      setSubtotal('');
      setGstAmount('0');
      setNotes('');
      setModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save invoice.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Invoices & Receivables"
          description="Create GST or non-GST invoices, preview tax breakdowns, print PDFs, and track receivables."
          actions={
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#3768D9] hover:bg-[#254EAA] text-white text-xs font-semibold cursor-pointer whitespace-nowrap shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Invoice</span>
            </button>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Total Invoiced Value"
            value={formatINR(summary.totalInvoiced)}
            numericValue={summary.totalInvoiced}
            subtext={`${invoices.length} invoice records`}
            variant="blue"
            icon={<FileText className="w-5 h-5" />}
          />
          <StatCard
            label="Paid Invoices"
            value={formatINR(summary.totalPaid)}
            numericValue={summary.totalPaid}
            subtext="Collected invoice value"
            variant="emerald"
            icon={<IndianRupee className="w-5 h-5" />}
          />
          <StatCard
            label="Unpaid Receivables"
            value={formatINR(summary.totalOutstanding)}
            numericValue={summary.totalOutstanding}
            subtext="Sent & overdue invoices"
            variant="amber"
            icon={<Clock className="w-5 h-5" />}
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="inline-flex flex-wrap items-center gap-1 p-1 rounded-lg bg-[#F6F8FC] dark:bg-[#131C31] border border-slate-200 dark:border-slate-800 w-fit">
            {(['all', 'draft', 'sent', 'paid', 'overdue'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-colors cursor-pointer ${
                  statusFilter === tab
                    ? 'bg-white dark:bg-[#162036] text-[#3768D9] dark:text-white shadow-xs'
                    : 'text-[#718096] dark:text-slate-400 hover:text-[#25334B]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#718096] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search invoice #, buyer, GSTIN..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162036] text-xs text-[#25334B] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#3768D9]"
            />
          </div>
        </div>

        {!dataLoaded ? (
          <TableSkeleton rows={4} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<FileText className="w-5 h-5" />}
            title={invoices.length === 0 ? 'No invoices created yet' : 'No matching invoices'}
            description="Create structured invoices with optional customer GSTIN to automatically track outstanding payments and print PDF tax invoices."
            action={
              invoices.length === 0 ? (
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#3768D9] hover:bg-[#254EAA] text-white text-xs font-semibold cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create First Invoice</span>
                </button>
              ) : undefined
            }
          />
        ) : (
          <div className="bg-white dark:bg-[#162036] border border-slate-200/90 dark:border-slate-800 rounded-xl overflow-hidden shadow-fintech">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-[#F6F8FC] dark:bg-[#131C31] text-xs text-[#718096] dark:text-slate-400">
                    <th className="py-3 px-4 font-semibold">Invoice #</th>
                    <th className="py-3 px-4 font-semibold">Customer</th>
                    <th className="py-3 px-4 font-semibold">Issue / Due</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Total (incl. GST)</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {filtered.map((inv) => (
                    <tr
                      key={inv.id}
                      className="hover:bg-[#F6F8FC]/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-xs font-semibold text-[#3768D9] dark:text-[#55A9D8]">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm font-medium text-[#25334B] dark:text-slate-100">
                          {inv.customerName}
                        </p>
                        {inv.customerGstin ? (
                          <p className="text-xs font-mono text-[#718096] dark:text-slate-400">
                            GSTIN: {inv.customerGstin}
                          </p>
                        ) : null}
                      </td>
                      <td className="py-3 px-4 text-xs text-[#718096] dark:text-slate-300 font-mono whitespace-nowrap">
                        {formatDateDisplay(inv.issueDate)} → {formatDateDisplay(inv.dueDate)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold capitalize ${
                            STATUS_BADGE[inv.status]
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums text-[#25334B] dark:text-slate-100 whitespace-nowrap">
                        {formatINR(inv.totalAmount)}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setPreviewInvoice(inv)}
                            title="Preview invoice"
                            className="p-1.5 rounded-lg text-[#718096] hover:text-[#3768D9] hover:bg-[#EDF4FF] dark:hover:bg-slate-800 cursor-pointer transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              printInvoiceDocument(
                                inv,
                                activeBusiness?.businessName || 'MSME SAATHI Business',
                                activeBusiness?.city || '',
                                activeBusiness?.state || '',
                                activeBusiness?.gstin || '',
                                activeBusiness?.udyamNumber || ''
                              )
                            }
                            title="Print / Save PDF"
                            className="p-1.5 rounded-lg text-[#718096] hover:text-[#3768D9] hover:bg-[#EDF4FF] dark:hover:bg-slate-800 cursor-pointer transition-colors"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          {inv.status !== 'paid' && activeBusiness ? (
                            <button
                              type="button"
                              onClick={() =>
                                void updateInvoiceStatus(activeBusiness.id, inv.id, 'paid')
                              }
                              title="Mark as Paid"
                              className="p-1.5 rounded-lg text-[#718096] hover:text-[#22A58B] hover:bg-emerald-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          ) : null}
                          {activeBusiness ? (
                            <button
                              type="button"
                              onClick={() => void deleteInvoice(activeBusiness.id, inv.id)}
                              title="Delete invoice"
                              className="p-1.5 rounded-lg text-[#718096] hover:text-[#EE806B] hover:bg-orange-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Invoice Preview Modal */}
      <Modal
        open={Boolean(previewInvoice)}
        onClose={() => setPreviewInvoice(null)}
        title={previewInvoice ? `Invoice ${previewInvoice.invoiceNumber}` : 'Invoice Preview'}
      >
        {previewInvoice ? (
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <p className="text-sm font-bold text-[#25334B] dark:text-white">
                  {activeBusiness?.businessName}
                </p>
                {activeBusiness?.gstin ? (
                  <p className="text-xs font-mono text-[#718096] dark:text-slate-400">
                    GSTIN: {activeBusiness.gstin}
                  </p>
                ) : null}
                <p className="text-xs text-[#718096] dark:text-slate-400">
                  {activeBusiness?.city}, {activeBusiness?.state}
                </p>
              </div>
              <span
                className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize ${
                  STATUS_BADGE[previewInvoice.status]
                }`}
              >
                {previewInvoice.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-[#F6F8FC] dark:bg-[#131C31] rounded-lg p-4 text-xs">
              <div>
                <p className="text-[#718096] dark:text-slate-400 font-medium">Billed To</p>
                <p className="mt-1 font-semibold text-[#25334B] dark:text-white">
                  {previewInvoice.customerName}
                </p>
                {previewInvoice.customerGstin ? (
                  <p className="mt-0.5 font-mono text-[#718096] dark:text-slate-400">
                    {previewInvoice.customerGstin}
                  </p>
                ) : null}
              </div>
              <div className="text-right">
                <p className="text-[#718096] dark:text-slate-400 font-medium">Dates</p>
                <p className="mt-1 text-[#25334B] dark:text-slate-200 font-mono">
                  Issued: {formatDateDisplay(previewInvoice.issueDate)}
                </p>
                <p className="mt-0.5 text-[#25334B] dark:text-slate-200 font-mono">
                  Due: {formatDateDisplay(previewInvoice.dueDate)}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs border-t border-b border-slate-200 dark:border-slate-800 py-4">
              <div className="flex justify-between">
                <span className="text-[#718096] dark:text-slate-400">Taxable Subtotal</span>
                <span className="font-mono font-medium text-[#25334B] dark:text-slate-100 tabular-nums">
                  {formatINR(previewInvoice.subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#718096] dark:text-slate-400">GST Amount</span>
                <span className="font-mono font-medium text-[#25334B] dark:text-slate-100 tabular-nums">
                  {formatINR(previewInvoice.gstAmount)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-sm font-bold text-[#25334B] dark:text-white">
                <span>Total Amount</span>
                <span className="font-mono tabular-nums text-[#3768D9] dark:text-[#55A9D8]">
                  {formatINR(previewInvoice.totalAmount)}
                </span>
              </div>
            </div>

            {previewInvoice.notes ? (
              <p className="text-xs text-[#718096] dark:text-slate-400 bg-[#F6F8FC] dark:bg-[#131C31] rounded-lg p-3">
                <strong className="text-[#25334B] dark:text-slate-200">Notes:</strong>{' '}
                {previewInvoice.notes}
              </p>
            ) : null}

            <div className="flex justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => setPreviewInvoice(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-[#25334B] dark:text-slate-200 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() =>
                  printInvoiceDocument(
                    previewInvoice,
                    activeBusiness?.businessName || 'MSME SAATHI Business',
                    activeBusiness?.city || '',
                    activeBusiness?.state || '',
                    activeBusiness?.gstin || '',
                    activeBusiness?.udyamNumber || ''
                  )
                }
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#3768D9] hover:bg-[#254EAA] text-white text-xs font-semibold cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Create Invoice Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create Sales Invoice">
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {error ? (
            <div className="p-3 rounded-lg bg-orange-50 dark:bg-red-950/60 border border-[#EE806B]/40 flex items-start gap-2 text-xs text-[#C85641] dark:text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          ) : null}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#25334B] dark:text-slate-300 mb-1">
                Invoice Number *
              </label>
              <input
                type="text"
                maxLength={FIELD_LIMITS.INVOICE_NUM_MAX}
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="INV-2026-001"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#3768D9]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#25334B] dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-sm focus:outline-none focus:ring-2 focus:ring-[#3768D9]"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent (Awaiting Payment)</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#25334B] dark:text-slate-300 mb-1">
                Customer / Buyer Name *
              </label>
              <input
                type="text"
                maxLength={FIELD_LIMITS.COUNTERPARTY_MAX}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Kaveri Retail Distributors"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-sm focus:outline-none focus:ring-2 focus:ring-[#3768D9]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#25334B] dark:text-slate-300 mb-1">
                Customer GSTIN (optional)
              </label>
              <input
                type="text"
                maxLength={15}
                value={customerGstin}
                onChange={(e) => setCustomerGstin(e.target.value.toUpperCase().slice(0, 15))}
                placeholder="29ABCDE1234F1Z5"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#3768D9]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#25334B] dark:text-slate-300 mb-1">
                Issue Date *
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-sm focus:outline-none focus:ring-2 focus:ring-[#3768D9]"
              />
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#25334B] dark:text-slate-300 mb-1">
                Taxable Subtotal (₹) *
              </label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={subtotal}
                onChange={(e) => setSubtotal(e.target.value)}
                placeholder="50000"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#3768D9]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#25334B] dark:text-slate-300 mb-1">
                GST Amount (₹)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={gstAmount}
                onChange={(e) => setGstAmount(e.target.value)}
                placeholder="9000"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#3768D9]"
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
              placeholder="Payment terms (e.g. Net 30 days under MSMED Act)"
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
              {submitting ? 'Saving...' : 'Save Invoice'}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
