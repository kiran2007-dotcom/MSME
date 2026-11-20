import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ExternalLink, Landmark, Search } from 'lucide-react';
import { DashboardLayout } from '../../layouts/DashboardLayout.tsx';
import { PageHeader, TableSkeleton } from '../../components/ui/Primitives.tsx';
import { useBusiness } from '../../hooks/useBusiness.tsx';
import { fetchGovernmentSchemes } from '../../services/apiService.ts';
import type { SchemeInfo } from '../../types/index.ts';

const CATEGORIES = [
  'All',
  'Credit & Collateral',
  'Subsidy & Grant',
  'Receivables & Liquidity',
  'Certification & Tech',
] as const;

const SCHEME_CATEGORY_BADGE: Record<string, string> = {
  'Credit & Collateral': 'bg-[#EDF4FF] dark:bg-[#3768D9]/20 text-[#254EAA] dark:text-[#7FB3FF]',
  'Subsidy & Grant': 'bg-emerald-50 dark:bg-[#22A58B]/20 text-[#187D69] dark:text-emerald-300',
  'Receivables & Liquidity': 'bg-amber-50 dark:bg-[#F4B544]/20 text-[#B2760B] dark:text-[#F4B544]',
  'Certification & Tech': 'bg-indigo-50 dark:bg-[#8A76D6]/20 text-[#6A56B8] dark:text-[#ABA0E6]',
};

export function SchemesPage() {
  const { activeBusiness } = useBusiness();
  const [sizeFilter, setSizeFilter] = useState<'my' | 'All'>('my');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [schemes, setSchemes] = useState<SchemeInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    const targetSize =
      sizeFilter === 'my' && activeBusiness ? activeBusiness.businessSize : 'All';

    fetchGovernmentSchemes(targetSize, categoryFilter)
      .then((items) => {
        if (active) setSchemes(items);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Unable to load schemes.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [sizeFilter, categoryFilter, activeBusiness]);

  const filteredSchemes = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return schemes;
    return schemes.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.summary.toLowerCase().includes(query) ||
        s.ministry.toLowerCase().includes(query)
    );
  }, [schemes, search]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Government Schemes for Indian MSMEs"
          description="Explore central credit guarantee, subsidy, receivables financing, and certification schemes."
        />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-[#F6F8FC] dark:bg-[#131C31] border border-slate-200 dark:border-slate-800 w-fit">
            <button
              type="button"
              onClick={() => setSizeFilter('my')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                sizeFilter === 'my'
                  ? 'bg-white dark:bg-[#162036] text-[#3768D9] dark:text-white shadow-xs'
                  : 'text-[#718096] dark:text-slate-400 hover:text-[#25334B]'
              }`}
            >
              Eligible for {activeBusiness?.businessSize || 'My'} Size
            </button>
            <button
              type="button"
              onClick={() => setSizeFilter('All')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                sizeFilter === 'All'
                  ? 'bg-white dark:bg-[#162036] text-[#3768D9] dark:text-white shadow-xs'
                  : 'text-[#718096] dark:text-slate-400 hover:text-[#25334B]'
              }`}
            >
              All MSME Sizes
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative sm:w-64">
              <Search className="w-4 h-4 text-[#718096] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search schemes or ministry..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162036] text-xs text-[#25334B] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#3768D9]"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter schemes by category"
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162036] text-xs font-medium text-[#25334B] dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3768D9]"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error ? (
          <div className="p-4 rounded-xl bg-orange-50 dark:bg-red-950/60 border border-[#EE806B]/40 flex items-start gap-2.5 text-xs text-[#C85641] dark:text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        ) : loading ? (
          <TableSkeleton rows={4} />
        ) : filteredSchemes.length === 0 ? (
          <div className="bg-white dark:bg-[#162036] border border-slate-200 dark:border-slate-800 rounded-xl p-10 text-center shadow-fintech">
            <Landmark className="w-7 h-7 text-[#3768D9] dark:text-[#55A9D8] mx-auto mb-2" />
            <p className="text-sm font-semibold text-[#25334B] dark:text-white">
              No schemes match the selected filters
            </p>
            <p className="mt-1 text-xs text-[#718096] dark:text-slate-400">
              Try clearing your search or switching to All MSME Sizes.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredSchemes.map((scheme) => (
              <div
                key={scheme.id}
                className="bg-white dark:bg-[#162036] border border-slate-200/90 dark:border-slate-800 rounded-xl p-6 shadow-fintech flex flex-col justify-between hover:border-[#3768D9]/40 transition-colors"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                        SCHEME_CATEGORY_BADGE[scheme.category] ??
                        'bg-[#EDF4FF] text-[#254EAA]'
                      }`}
                    >
                      {scheme.category}
                    </span>
                    <span className="text-[11px] font-medium text-[#718096] dark:text-slate-400">
                      {scheme.ministry}
                    </span>
                  </div>

                  <h2 className="mt-3 text-base font-bold text-[#25334B] dark:text-white leading-snug">
                    {scheme.name}
                  </h2>

                  <div className="mt-2.5 inline-block px-2.5 py-1 rounded-md bg-[#F6F8FC] dark:bg-[#131C31] border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-[#25334B] dark:text-slate-200">
                    Support: {scheme.maxSupport}
                  </div>

                  <p className="mt-3 text-xs text-[#718096] dark:text-slate-400 leading-relaxed">
                    {scheme.summary}
                  </p>
                  <p className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-[#25334B] dark:text-slate-300">
                    <span className="text-[#718096] dark:text-slate-400">Eligibility:</span>{' '}
                    {scheme.eligibilityNotes}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[#718096] dark:text-slate-400">
                    Sizes: {scheme.eligibleSizes.join(', ')}
                  </span>
                  <a
                    href={scheme.officialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-[#3768D9] dark:text-[#55A9D8] hover:underline"
                  >
                    <span>Official Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
