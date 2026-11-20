import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { BusinessProfileForm } from '../../components/BusinessProfileForm.tsx';
import { BrandMark, ThemeToggle } from '../../components/ui/Primitives.tsx';
import { useAuth } from '../../hooks/useAuth.tsx';
import { logoutUser } from '../../services/authService.ts';
import { createBusinessWorkspace } from '../../services/businessService.ts';
import { INDUSTRY_CATEGORIES, type BusinessInput } from '../../types/index.ts';

export function OnboardingPage() {
  const { firebaseUser, userProfile } = useAuth();
  const navigate = useNavigate();

  const initialValues: BusinessInput = {
    ownerName: userProfile?.displayName || firebaseUser?.displayName || '',
    businessName: '',
    businessType: 'Proprietorship',
    industryCategory: INDUSTRY_CATEGORIES[0],
    city: '',
    state: 'Karnataka',
    pincode: '',
    businessSize: 'Micro',
    registrationStatus: 'Registered',
    gstin: '',
    udyamNumber: '',
  };

  const handleSave = async (values: BusinessInput) => {
    if (!firebaseUser) return;
    await createBusinessWorkspace(firebaseUser.uid, values, firebaseUser.email ?? undefined);
    navigate('/app', { replace: true });
  };

  const handleSignOut = async () => {
    await logoutUser();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EDF4FF]/65 via-[#F6F8FC] to-[#F6F8FC] dark:from-[#162036] dark:via-[#0F172A] dark:to-[#0F172A] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between gap-4 pb-6">
          <div className="flex items-center gap-2.5">
            <BrandMark size="sm" />
            <div>
              <p className="text-base font-bold tracking-tight text-[#25334B] dark:text-white">
                MSME SAATHI
              </p>
              <p className="text-xs text-[#718096] dark:text-slate-400">
                Signed in as {firebaseUser?.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => void handleSignOut()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162036] text-xs font-medium text-[#25334B] dark:text-slate-200 hover:bg-[#F6F8FC] dark:hover:bg-slate-800 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-[#162036] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-fintech-lg">
          <div className="pb-6 border-b border-slate-200 dark:border-slate-800">
            <p className="text-xs font-semibold text-[#3768D9] dark:text-[#55A9D8]">
              Step 2 of 2 · Business Onboarding
            </p>
            <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-[#25334B] dark:text-white">
              Set up your MSME business profile
            </h1>
            <p className="mt-1.5 text-sm text-[#718096] dark:text-slate-400">
              Provide your enterprise details to personalize your dashboard, compliance calendar,
              and scheme eligibility. You can edit these anytime in Settings.
            </p>
          </div>

          <div className="mt-6">
            <BusinessProfileForm
              initialValues={initialValues}
              submitLabel="Save Business & Open Dashboard"
              onSubmit={handleSave}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
