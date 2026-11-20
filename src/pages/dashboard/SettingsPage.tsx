import { useState } from 'react';
import { CheckCircle2, Plus } from 'lucide-react';
import { DashboardLayout } from '../../layouts/DashboardLayout.tsx';
import { BusinessProfileForm } from '../../components/BusinessProfileForm.tsx';
import { Modal, PageHeader, ThemeToggle } from '../../components/ui/Primitives.tsx';
import { useAuth } from '../../hooks/useAuth.tsx';
import { useBusiness } from '../../hooks/useBusiness.tsx';
import { resendVerificationEmail } from '../../services/authService.ts';
import {
  createBusinessWorkspace,
  updateBusinessProfile,
} from '../../services/businessService.ts';
import { INDUSTRY_CATEGORIES, type BusinessInput } from '../../types/index.ts';

export function SettingsPage() {
  const { firebaseUser } = useAuth();
  const { activeBusiness } = useBusiness();
  const [savedMessage, setSavedMessage] = useState('');
  const [verificationNotice, setVerificationNotice] = useState('');
  const [newBizModalOpen, setNewBizModalOpen] = useState(false);

  const handleUpdateBusiness = async (values: BusinessInput) => {
    if (!firebaseUser || !activeBusiness) return;
    setSavedMessage('');
    await updateBusinessProfile(firebaseUser.uid, activeBusiness.id, values);
    setSavedMessage('Business profile updated in Cloud Firestore.');
  };

  const handleCreateAdditionalBusiness = async (values: BusinessInput) => {
    if (!firebaseUser) return;
    await createBusinessWorkspace(firebaseUser.uid, values, firebaseUser.email ?? undefined);
    setNewBizModalOpen(false);
    setSavedMessage('New business workspace created and activated.');
  };

  const handleResendVerification = async () => {
    if (!firebaseUser) return;
    try {
      await resendVerificationEmail(firebaseUser);
      setVerificationNotice(`Verification link sent to ${firebaseUser.email}.`);
    } catch (err) {
      setVerificationNotice(
        err instanceof Error ? err.message : 'Could not send verification email right now.'
      );
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Business & Account Settings"
          description="Edit your MSME profile, manage appearance, or add another business entity."
          actions={
            <button
              type="button"
              onClick={() => setNewBizModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162036] text-xs font-semibold text-[#25334B] dark:text-slate-100 hover:bg-[#F6F8FC] dark:hover:bg-slate-800 cursor-pointer whitespace-nowrap shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4 text-[#3768D9]" />
              <span>Add Business</span>
            </button>
          }
        />

        {savedMessage ? (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-[#22A58B]/15 border border-[#22A58B]/30 flex items-center gap-2 text-xs font-medium text-[#187D69] dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{savedMessage}</span>
          </div>
        ) : null}

        {/* Account & Appearance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#162036] border border-slate-200/90 dark:border-slate-800 rounded-xl p-6 shadow-fintech">
            <h2 className="text-sm font-semibold text-[#25334B] dark:text-white">
              Account Identity
            </h2>
            <dl className="mt-4 space-y-2.5 text-xs">
              <div className="flex justify-between gap-2 py-1 border-b border-slate-100 dark:border-slate-800">
                <dt className="text-[#718096] dark:text-slate-400">Signed-in Email</dt>
                <dd className="font-semibold text-[#25334B] dark:text-slate-100">
                  {firebaseUser?.email}
                </dd>
              </div>
              <div className="flex justify-between gap-2 py-1">
                <dt className="text-[#718096] dark:text-slate-400">Email Verification</dt>
                <dd className="font-semibold text-[#25334B] dark:text-slate-100">
                  {firebaseUser?.emailVerified ? (
                    <span className="text-[#22A58B]">Verified</span>
                  ) : (
                    <span className="text-[#D49218]">Pending verification</span>
                  )}
                </dd>
              </div>
            </dl>

            {firebaseUser && !firebaseUser.emailVerified ? (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => void handleResendVerification()}
                  className="text-xs font-semibold text-[#3768D9] dark:text-[#55A9D8] hover:underline cursor-pointer"
                >
                  Send verification email
                </button>
                {verificationNotice ? (
                  <p className="mt-1.5 text-xs text-[#718096] dark:text-slate-400">
                    {verificationNotice}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="bg-white dark:bg-[#162036] border border-slate-200/90 dark:border-slate-800 rounded-xl p-6 shadow-fintech flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-[#25334B] dark:text-white">
                Interface Theme
              </h2>
              <p className="mt-1 text-xs text-[#718096] dark:text-slate-400">
                Light mode is active by default. Switch anytime to low-glare dark mode.
              </p>
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Edit Business Profile */}
        {activeBusiness ? (
          <div className="bg-white dark:bg-[#162036] border border-slate-200/90 dark:border-slate-800 rounded-xl p-6 sm:p-8 shadow-fintech">
            <div className="pb-5 mb-6 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-semibold text-[#25334B] dark:text-white">
                Edit Business Profile
              </h2>
              <p className="mt-1 text-xs text-[#718096] dark:text-slate-400">
                Keep your entity classification, location, GSTIN, and Udyam registration up to date.
              </p>
            </div>

            <BusinessProfileForm
              key={activeBusiness.id}
              initialValues={{
                ownerName: activeBusiness.ownerName,
                businessName: activeBusiness.businessName,
                businessType: activeBusiness.businessType,
                industryCategory: activeBusiness.industryCategory,
                city: activeBusiness.city,
                state: activeBusiness.state,
                pincode: activeBusiness.pincode,
                businessSize: activeBusiness.businessSize,
                registrationStatus: activeBusiness.registrationStatus,
                gstin: activeBusiness.gstin,
                udyamNumber: activeBusiness.udyamNumber,
              }}
              submitLabel="Save Changes"
              onSubmit={handleUpdateBusiness}
            />
          </div>
        ) : null}
      </div>

      <Modal
        open={newBizModalOpen}
        onClose={() => setNewBizModalOpen(false)}
        title="Add Another Business Workspace"
      >
        <BusinessProfileForm
          initialValues={{
            ownerName: activeBusiness?.ownerName || firebaseUser?.displayName || '',
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
          }}
          submitLabel="Create Workspace"
          onSubmit={handleCreateAdditionalBusiness}
        />
      </Modal>
    </DashboardLayout>
  );
}
