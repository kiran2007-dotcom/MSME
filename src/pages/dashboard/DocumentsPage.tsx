import { useMemo, useState, type FormEvent } from 'react';
import {
  AlertCircle,
  Download,
  Eye,
  FileText,
  FolderLock,
  HardDrive,
  Plus,
  Search,
  Trash2,
  Upload,
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
  deleteBusinessDocument,
  uploadBusinessDocument,
} from '../../services/financeService.ts';
import {
  FIELD_LIMITS,
  type BusinessDocument,
  type DocumentCategory,
} from '../../types/index.ts';
import { formatFileSize } from '../../utils/formatters.ts';

const DOC_CATEGORIES: DocumentCategory[] = [
  'GST',
  'Udyam',
  'Invoice',
  'Bank Statement',
  'License',
  'Tax',
  'Other',
];

const DOC_BADGE: Record<DocumentCategory, string> = {
  GST: 'bg-[#EDF4FF] dark:bg-[#3768D9]/20 text-[#254EAA] dark:text-[#7FB3FF]',
  Udyam: 'bg-emerald-50 dark:bg-[#22A58B]/20 text-[#187D69] dark:text-emerald-300',
  Invoice: 'bg-sky-50 dark:bg-[#55A9D8]/20 text-[#2B7FA8] dark:text-sky-300',
  'Bank Statement': 'bg-indigo-50 dark:bg-[#8A76D6]/20 text-[#6A56B8] dark:text-[#ABA0E6]',
  License: 'bg-amber-50 dark:bg-[#F4B544]/20 text-[#B2760B] dark:text-[#F4B544]',
  Tax: 'bg-orange-50 dark:bg-[#EE806B]/20 text-[#C85641] dark:text-[#F49D8B]',
  Other: 'bg-slate-100 dark:bg-slate-800 text-[#718096] dark:text-slate-300',
};

export function DocumentsPage() {
  const { firebaseUser } = useAuth();
  const { activeBusiness, documents, dataLoaded } = useBusiness();

  const [modalOpen, setModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<BusinessDocument | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<'All' | DocumentCategory>('All');
  const [search, setSearch] = useState('');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docName, setDocName] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('GST');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const filteredDocs = useMemo(() => {
    const query = search.trim().toLowerCase();
    return documents.filter((d) => {
      if (categoryFilter !== 'All' && d.category !== categoryFilter) return false;
      if (!query) return true;
      return d.name.toLowerCase().includes(query) || d.category.toLowerCase().includes(query);
    });
  }, [documents, categoryFilter, search]);

  const vaultStats = useMemo(() => {
    const totalBytes = documents.reduce((acc, d) => acc + (d.sizeBytes || 0), 0);
    const categoriesUsed = new Set(documents.map((d) => d.category)).size;
    return {
      count: documents.length,
      categoriesUsed,
      totalSize: formatFileSize(totalBytes),
    };
  }, [documents]);

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedFile) {
      setError('Please select a file to upload.');
      return;
    }
    if (selectedFile.size > 50 * 1024 * 1024) {
      setError('File size must be under 50 MB.');
      return;
    }
    if (!activeBusiness || !firebaseUser) return;

    setUploading(true);
    try {
      await uploadBusinessDocument(
        activeBusiness.id,
        firebaseUser.uid,
        selectedFile,
        category,
        docName
      );
      setSelectedFile(null);
      setDocName('');
      setModalOpen(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to upload document. Ensure Firebase Storage is enabled for this project.'
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Document Vault"
          description="Securely store Udyam certificates, GST filings, bank statements, and trade licenses."
          actions={
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#3768D9] hover:bg-[#254EAA] text-white text-xs font-semibold cursor-pointer whitespace-nowrap shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Document</span>
            </button>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Stored Documents"
            value={`${vaultStats.count}`}
            subtext="Files in Cloud Storage"
            variant="blue"
            icon={<FolderLock className="w-5 h-5" />}
          />
          <StatCard
            label="Categories Covered"
            value={`${vaultStats.categoriesUsed} / ${DOC_CATEGORIES.length}`}
            subtext="KYC & statutory groups"
            variant="lavender"
            icon={<FileText className="w-5 h-5" />}
          />
          <StatCard
            label="Vault Storage Used"
            value={vaultStats.totalSize}
            subtext="Encrypted at rest"
            variant="emerald"
            icon={<HardDrive className="w-5 h-5" />}
          />
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="inline-flex flex-wrap items-center gap-1 p-1 rounded-lg bg-[#F6F8FC] dark:bg-[#131C31] border border-slate-200 dark:border-slate-800 w-fit">
            {(['All', ...DOC_CATEGORIES] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-white dark:bg-[#162036] text-[#3768D9] dark:text-white shadow-xs'
                    : 'text-[#718096] dark:text-slate-400 hover:text-[#25334B]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-[#718096] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search document name..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162036] text-xs text-[#25334B] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#3768D9]"
            />
          </div>
        </div>

        {!dataLoaded ? (
          <TableSkeleton rows={4} />
        ) : filteredDocs.length === 0 ? (
          <EmptyState
            icon={<FolderLock className="w-5 h-5" />}
            title={documents.length === 0 ? 'No documents uploaded yet' : 'No matching documents'}
            description={
              documents.length === 0
                ? 'Upload your Udyam registration certificate, GST certificate, or bank statements to keep your MSME records audit-ready.'
                : 'Try selecting a different category or clearing your search query.'
            }
            action={
              documents.length === 0 ? (
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#3768D9] hover:bg-[#254EAA] text-white text-xs font-semibold cursor-pointer transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload First Document</span>
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
                    <th className="py-3 px-4 font-semibold">Document Name</th>
                    <th className="py-3 px-4 font-semibold">Category</th>
                    <th className="py-3 px-4 font-semibold">Size</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {filteredDocs.map((docItem) => (
                    <tr
                      key={docItem.id}
                      className="hover:bg-[#F6F8FC]/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium text-[#25334B] dark:text-slate-100">
                        {docItem.name}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                            DOC_BADGE[docItem.category] ?? DOC_BADGE.Other
                          }`}
                        >
                          {docItem.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs font-mono text-[#718096] dark:text-slate-400">
                        {formatFileSize(docItem.sizeBytes)}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setPreviewDoc(docItem)}
                            title="Preview document"
                            className="p-1.5 rounded-lg text-[#718096] hover:text-[#3768D9] hover:bg-[#EDF4FF] dark:hover:bg-slate-800 cursor-pointer transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <a
                            href={docItem.downloadUrl}
                            target="_blank"
                            rel="noreferrer"
                            title="Download document"
                            className="p-1.5 rounded-lg text-[#718096] hover:text-[#3768D9] hover:bg-[#EDF4FF] dark:hover:bg-slate-800 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                          {activeBusiness ? (
                            <button
                              type="button"
                              onClick={() => void deleteBusinessDocument(activeBusiness.id, docItem)}
                              title="Delete document"
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

      {/* Document Preview Modal */}
      <Modal
        open={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
        title={previewDoc ? previewDoc.name : 'Document Preview'}
      >
        {previewDoc ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-[#718096] dark:text-slate-400">
              <span>Category: {previewDoc.category}</span>
              <span className="font-mono">{formatFileSize(previewDoc.sizeBytes)}</span>
            </div>

            {previewDoc.mimeType.startsWith('image/') ? (
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden bg-[#F6F8FC] dark:bg-[#131C31]">
                <img
                  src={previewDoc.downloadUrl}
                  alt={previewDoc.name}
                  className="w-full max-h-80 object-contain"
                />
              </div>
            ) : previewDoc.mimeType === 'application/pdf' ? (
              <iframe
                src={previewDoc.downloadUrl}
                title={previewDoc.name}
                className="w-full h-80 rounded-lg border border-slate-200 dark:border-slate-800 bg-white"
              />
            ) : (
              <div className="p-6 rounded-lg bg-[#F6F8FC] dark:bg-[#131C31] border border-slate-200 dark:border-slate-800 text-center">
                <FileText className="w-8 h-8 text-[#3768D9] mx-auto mb-2" />
                <p className="text-xs font-medium text-[#25334B] dark:text-slate-200">
                  Preview is not supported in-browser for {previewDoc.mimeType}.
                </p>
                <p className="mt-1 text-[11px] text-[#718096] dark:text-slate-400">
                  Download the file below to view it locally.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-[#25334B] dark:text-slate-200 cursor-pointer"
              >
                Close
              </button>
              <a
                href={previewDoc.downloadUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#3768D9] hover:bg-[#254EAA] text-white text-xs font-semibold"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download File</span>
              </a>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Upload Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Upload Business Document">
        <form onSubmit={handleUpload} className="space-y-4" noValidate>
          {error ? (
            <div className="p-3 rounded-lg bg-orange-50 dark:bg-red-950/60 border border-[#EE806B]/40 flex items-start gap-2 text-xs text-[#C85641] dark:text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          ) : null}

          <div>
            <label className="block text-xs font-medium text-[#25334B] dark:text-slate-300 mb-1">
              Document Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as DocumentCategory)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-sm focus:outline-none focus:ring-2 focus:ring-[#3768D9]"
            >
              {DOC_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#25334B] dark:text-slate-300 mb-1">
              Display Label (optional)
            </label>
            <input
              type="text"
              maxLength={FIELD_LIMITS.DOC_NAME_MAX}
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              placeholder="Udyam Registration Certificate FY26"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-sm focus:outline-none focus:ring-2 focus:ring-[#3768D9]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#25334B] dark:text-slate-300 mb-1">
              Select File (PDF, PNG, JPG, CSV, XLSX — max 50 MB) *
            </label>
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              className="w-full text-xs text-[#718096] dark:text-slate-300 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#EDF4FF] file:text-[#3768D9] dark:file:bg-[#3768D9]/20 dark:file:text-[#55A9D8] cursor-pointer"
            />
          </div>

          {uploading ? (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-[#3768D9] font-medium">
                <span>Encrypting and uploading to Firebase Storage...</span>
              </div>
              <div className="h-1.5 rounded-full bg-[#EDF4FF] overflow-hidden">
                <div className="h-full w-2/3 bg-[#3768D9] rounded-full animate-pulse" />
              </div>
            </div>
          ) : null}

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
              disabled={uploading}
              className="px-5 py-2 rounded-lg bg-[#3768D9] hover:bg-[#254EAA] text-white text-xs font-semibold cursor-pointer disabled:opacity-60 transition-colors"
            >
              {uploading ? 'Uploading...' : 'Upload to Vault'}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
