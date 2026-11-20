import type {
  Business,
  ComplianceCalendarTemplate,
  DashboardMetrics,
  SchemeInfo,
} from '../types/index.ts';

export async function fetchGovernmentSchemes(
  size = 'All',
  category = 'All'
): Promise<SchemeInfo[]> {
  const params = new URLSearchParams();
  if (size && size !== 'All') params.set('size', size);
  if (category && category !== 'All') params.set('category', category);

  const response = await fetch(`/api/schemes?${params.toString()}`);
  const data = (await response.json()) as { schemes?: SchemeInfo[]; error?: string };
  if (!response.ok) {
    throw new Error(data.error || 'Failed to load government schemes.');
  }
  return data.schemes ?? [];
}

export async function fetchComplianceCalendar(): Promise<ComplianceCalendarTemplate[]> {
  const response = await fetch('/api/compliance/calendar');
  const data = (await response.json()) as {
    calendar?: ComplianceCalendarTemplate[];
    error?: string;
  };
  if (!response.ok) {
    throw new Error(data.error || 'Failed to load compliance calendar.');
  }
  return data.calendar ?? [];
}

export async function sendAssistantMessage(params: {
  message: string;
  history: Array<{ role: 'user' | 'model'; text: string }>;
  business: Business | null;
  metrics: DashboardMetrics;
}): Promise<string> {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: params.message,
      history: params.history,
      businessContext: params.business
        ? {
            businessName: params.business.businessName,
            businessType: params.business.businessType,
            industryCategory: params.business.industryCategory,
            city: params.business.city,
            state: params.business.state,
            businessSize: params.business.businessSize,
            registrationStatus: params.business.registrationStatus,
            hasGstin: Boolean(params.business.gstin),
            hasUdyam: Boolean(params.business.udyamNumber),
          }
        : {},
      financialSummary: params.metrics,
    }),
  });

  const data = (await response.json()) as { reply?: string; error?: string };
  if (!response.ok) {
    throw new Error(data.error || 'AI Assistant could not respond.');
  }
  return data.reply || '';
}
