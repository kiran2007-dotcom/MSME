import { useState, type FormEvent } from 'react';
import {
  AlertCircle,
  Check,
  Copy,
  Send,
  Sparkles,
  User,
} from 'lucide-react';
import { DashboardLayout } from '../../layouts/DashboardLayout.tsx';
import { BrandMark, PageHeader } from '../../components/ui/Primitives.tsx';
import { useBusiness } from '../../hooks/useBusiness.tsx';
import { sendAssistantMessage } from '../../services/apiService.ts';
import type { ChatMessage } from '../../types/index.ts';
import { formatINR } from '../../utils/formatters.ts';

const STARTER_PROMPTS = [
  'Which GST returns and due dates apply to my business profile?',
  'Explain the MSME 45-day payment rule and how to manage receivables.',
  'Review my current revenue, expenses, and net profit summary.',
  'What documents should I keep ready before applying for a CGTMSE loan?',
];

export function AIAssistantPage() {
  const { activeBusiness, metrics } = useBusiness();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSend = async (promptText: string) => {
    const trimmed = promptText.trim();
    if (!trimmed || loading) return;

    setError('');
    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const reply = await sendAssistantMessage({
        message: trimmed,
        history: messages.map((m) => ({ role: m.role, text: m.text })),
        business: activeBusiness,
        metrics,
      });

      const modelMsg: ChatMessage = {
        id: `m_${Date.now()}`,
        role: 'model',
        text: reply,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, modelMsg]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reach AI Assistant.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void handleSend(input);
  };

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // Clipboard unavailable
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="MSME SAATHI AI Assistant"
          description="Ask finance, GST, compliance, and scheme questions grounded in your active business profile."
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Context Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white dark:bg-[#162036] border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-fintech">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#EDF4FF] dark:bg-[#3768D9]/20 text-[#3768D9] dark:text-[#55A9D8] flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-[#25334B] dark:text-white">
                    Workspace Context
                  </h2>
                  <p className="text-[11px] text-[#718096] dark:text-slate-400">
                    Live figures shared securely on request
                  </p>
                </div>
              </div>

              <dl className="mt-4 space-y-2.5 text-xs">
                <div className="flex justify-between gap-2 py-1 border-b border-slate-100 dark:border-slate-800">
                  <dt className="text-[#718096] dark:text-slate-400">Business</dt>
                  <dd className="font-semibold text-[#25334B] dark:text-slate-100 text-right">
                    {activeBusiness?.businessName || '—'}
                  </dd>
                </div>
                <div className="flex justify-between gap-2 py-1 border-b border-slate-100 dark:border-slate-800">
                  <dt className="text-[#718096] dark:text-slate-400">Classification</dt>
                  <dd className="font-medium text-[#25334B] dark:text-slate-100">
                    {activeBusiness?.businessSize || '—'}
                  </dd>
                </div>
                <div className="flex justify-between gap-2 py-1 border-b border-slate-100 dark:border-slate-800">
                  <dt className="text-[#718096] dark:text-slate-400">Revenue</dt>
                  <dd className="font-mono font-semibold tabular-nums text-[#3768D9] dark:text-[#55A9D8]">
                    {formatINR(metrics.totalRevenue)}
                  </dd>
                </div>
                <div className="flex justify-between gap-2 py-1 border-b border-slate-100 dark:border-slate-800">
                  <dt className="text-[#718096] dark:text-slate-400">Expenses</dt>
                  <dd className="font-mono font-semibold tabular-nums text-[#C85641] dark:text-[#F49D8B]">
                    {formatINR(metrics.totalExpenses)}
                  </dd>
                </div>
                <div className="flex justify-between gap-2 py-1">
                  <dt className="text-[#718096] dark:text-slate-400">Outstanding</dt>
                  <dd className="font-mono font-semibold tabular-nums text-[#B2760B] dark:text-[#F4B544]">
                    {formatINR(metrics.outstandingPayments)}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="bg-white dark:bg-[#162036] border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-fintech">
              <h2 className="text-sm font-semibold text-[#25334B] dark:text-white mb-3">
                Suggested Questions
              </h2>
              <div className="space-y-2">
                {STARTER_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    disabled={loading}
                    onClick={() => void handleSend(prompt)}
                    className="w-full text-left p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-[#F6F8FC] dark:bg-[#131C31] hover:bg-[#EDF4FF] dark:hover:bg-slate-800 hover:border-[#3768D9]/40 text-xs font-medium text-[#25334B] dark:text-slate-200 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chat Thread */}
          <div className="lg:col-span-8 bg-white dark:bg-[#162036] border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-fintech flex flex-col min-h-[520px] max-h-[700px] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-[#F6F8FC] dark:bg-[#131C31] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <BrandMark size="sm" />
                <div>
                  <p className="text-xs font-semibold text-[#25334B] dark:text-white">
                    SAATHI Financial & Compliance Advisor
                  </p>
                  <p className="text-[11px] text-[#718096] dark:text-slate-400">
                    Indian MSME, GST, and Working Capital Guidance
                  </p>
                </div>
              </div>
              {messages.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setMessages([])}
                  className="text-xs font-medium text-[#718096] hover:text-[#25334B] dark:hover:text-white cursor-pointer"
                >
                  Clear thread
                </button>
              ) : null}
            </div>

            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-6 py-12">
                  <div className="w-12 h-12 rounded-xl bg-[#EDF4FF] dark:bg-[#3768D9]/20 text-[#3768D9] dark:text-[#55A9D8] flex items-center justify-center mb-3">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-[#25334B] dark:text-white">
                    Ask a financial or compliance question
                  </h3>
                  <p className="mt-1.5 text-xs text-[#718096] dark:text-slate-400 max-w-md leading-relaxed">
                    Choose a suggested question on the left or type your query below regarding GST
                    filings, cash flow ratios, Udyam benefits, or CGTMSE loan readiness.
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'model' ? <BrandMark size="sm" /> : null}
                    <div
                      className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-[#3768D9] text-white shadow-xs'
                          : 'bg-[#F6F8FC] dark:bg-[#131C31] border border-slate-200/80 dark:border-slate-800 text-[#25334B] dark:text-slate-100'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                      <div
                        className={`mt-2 flex items-center justify-between gap-4 text-[10px] ${
                          msg.role === 'user' ? 'text-blue-100' : 'text-[#718096] dark:text-slate-400'
                        }`}
                      >
                        <span>{msg.timestamp}</span>
                        {msg.role === 'model' ? (
                          <button
                            type="button"
                            onClick={() => void handleCopy(msg.id, msg.text)}
                            className="inline-flex items-center gap-1 hover:text-[#3768D9] dark:hover:text-[#55A9D8] cursor-pointer"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-[#22A58B]" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        ) : null}
                      </div>
                    </div>
                    {msg.role === 'user' ? (
                      <div className="w-7 h-7 rounded-lg bg-[#EDF4FF] dark:bg-slate-800 text-[#3768D9] dark:text-slate-200 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                    ) : null}
                  </div>
                ))
              )}

              {loading ? (
                <div className="flex items-center gap-3 text-xs text-[#718096] dark:text-slate-400">
                  <div className="w-4 h-4 border-2 border-slate-200 border-t-[#3768D9] rounded-full animate-spin" />
                  <span>Analyzing your workspace context...</span>
                </div>
              ) : null}
            </div>

            {error ? (
              <div className="mx-5 mb-3 p-3 rounded-lg bg-orange-50 dark:bg-red-950/60 border border-[#EE806B]/40 flex items-start gap-2 text-xs text-[#C85641] dark:text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            ) : null}

            <form
              onSubmit={handleSubmit}
              className="p-4 border-t border-slate-200 dark:border-slate-800 bg-[#F6F8FC]/60 dark:bg-[#131C31] flex items-center gap-3"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about GST, cash flow, Udyam, or loan preparation..."
                disabled={loading}
                className="flex-1 px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-sm text-[#25334B] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#3768D9]"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#3768D9] hover:bg-[#254EAA] text-white text-xs font-semibold cursor-pointer disabled:opacity-50 shadow-xs transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
