import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

interface SchemeRecord {
  id: string;
  name: string;
  ministry: string;
  category: 'Credit & Collateral' | 'Subsidy & Grant' | 'Receivables & Liquidity' | 'Certification & Tech';
  eligibleSizes: Array<'Micro' | 'Small' | 'Medium'>;
  maxSupport: string;
  summary: string;
  eligibilityNotes: string;
  officialUrl: string;
}

const GOVERNMENT_SCHEMES: SchemeRecord[] = [
  {
    id: 'cgtmse',
    name: 'Credit Guarantee Fund Trust for Micro and Small Enterprises (CGTMSE)',
    ministry: 'Ministry of MSME & SIDBI',
    category: 'Credit & Collateral',
    eligibleSizes: ['Micro', 'Small'],
    maxSupport: 'Up to ₹5 Crore collateral-free credit guarantee',
    summary: 'Enables Micro and Small Enterprises to access term loans and working capital from scheduled banks and NBFCs without third-party collateral or guarantees.',
    eligibilityNotes: 'New and existing Micro & Small Enterprises in manufacturing or services with valid Udyam registration.',
    officialUrl: 'https://www.cgtmse.in/',
  },
  {
    id: 'mudra-pmmy',
    name: 'Pradhan Mantri MUDRA Yojana (PMMY)',
    ministry: 'Department of Financial Services, Ministry of Finance',
    category: 'Credit & Collateral',
    eligibleSizes: ['Micro', 'Small'],
    maxSupport: 'Shishu up to ₹50,000 · Kishor up to ₹5 Lakh · Tarun up to ₹10 Lakh',
    summary: 'Non-corporate, non-farm small and micro enterprise loans for income-generating manufacturing, trading, and service activities.',
    eligibilityNotes: 'Proprietorships, partnerships, and small service/manufacturing units seeking working capital or equipment finance.',
    officialUrl: 'https://www.mudra.org.in/',
  },
  {
    id: 'pmegp',
    name: 'Prime Minister’s Employment Generation Programme (PMEGP)',
    ministry: 'Ministry of MSME (KVIC)',
    category: 'Subsidy & Grant',
    eligibleSizes: ['Micro'],
    maxSupport: 'Margin money subsidy 15%–35% (Project cost up to ₹50L Mfg / ₹20L Service)',
    summary: 'Credit-linked subsidy scheme for setting up new self-employment micro enterprises in manufacturing and service sectors.',
    eligibilityNotes: 'New enterprise projects only; applicant must be 18+ years old with at least 8th pass for projects above ₹10L (Mfg) / ₹5L (Service).',
    officialUrl: 'https://www.kviconline.gov.in/pmegpeportal/',
  },
  {
    id: 'treds',
    name: 'Trade Receivables Discounting System (TReDS)',
    ministry: 'Reserve Bank of India (RBI)',
    category: 'Receivables & Liquidity',
    eligibleSizes: ['Micro', 'Small', 'Medium'],
    maxSupport: 'Invoice discounting against corporate & PSU buyers',
    summary: 'Electronic platform facilitating financing of trade receivables of MSMEs from corporate buyers, PSUs, and government departments through multiple financiers.',
    eligibilityNotes: 'MSME sellers with Udyam Registration invoicing corporate buyers registered on RXIL, M1xchange, or Invoicemart.',
    officialUrl: 'https://www.rbi.org.in/',
  },
  {
    id: 'zed-certification',
    name: 'MSME Sustainable (ZED) Certification Scheme',
    ministry: 'Ministry of MSME',
    category: 'Certification & Tech',
    eligibleSizes: ['Micro', 'Small', 'Medium'],
    maxSupport: 'Up to 80% subsidy for Micro, 60% Small, 50% Medium on certification cost',
    summary: 'Supports MSMEs in adopting Zero Defect Zero Effect manufacturing practices, improving quality standards and lender credibility.',
    eligibilityNotes: 'Registered MSMEs with active Udyam Registration in the manufacturing sector.',
    officialUrl: 'https://zed.msme.gov.in/',
  },
  {
    id: 'stand-up-india',
    name: 'Stand-Up India Scheme',
    ministry: 'Department of Financial Services & SIDBI',
    category: 'Credit & Collateral',
    eligibleSizes: ['Micro', 'Small'],
    maxSupport: 'Composite bank loans between ₹10 Lakh and ₹1 Crore',
    summary: 'Facilitates bank loans for greenfield enterprises in manufacturing, services, agri-allied activities, or trading.',
    eligibilityNotes: 'At least one Woman or SC/ST entrepreneur holding 51%+ shareholding and controlling stake in a greenfield enterprise.',
    officialUrl: 'https://www.standupmitra.in/',
  },
];

interface ComplianceCalendarTemplate {
  id: string;
  title: string;
  category: 'GST' | 'Income Tax' | 'ROC' | 'MSME';
  frequency: 'Monthly' | 'Quarterly' | 'Annual';
  typicalDueRule: string;
  applicability: string;
}

const COMPLIANCE_CALENDAR: ComplianceCalendarTemplate[] = [
  {
    id: 'gstr-1',
    title: 'GSTR-1 Outward Supplies Return',
    category: 'GST',
    frequency: 'Monthly',
    typicalDueRule: '11th of the following month (13th following quarter under QRMP)',
    applicability: 'Regular GST-registered businesses',
  },
  {
    id: 'gstr-3b',
    title: 'GSTR-3B Summary Return & Tax Payment',
    category: 'GST',
    frequency: 'Monthly',
    typicalDueRule: '20th of the following month (22nd/24th following quarter under QRMP)',
    applicability: 'Regular GST-registered businesses',
  },
  {
    id: 'tds-deposit',
    title: 'Monthly TDS / TCS Challan Deposit (ITNS 281)',
    category: 'Income Tax',
    frequency: 'Monthly',
    typicalDueRule: '7th of the following month (30th April for March deductions)',
    applicability: 'Businesses liable for tax deduction at source',
  },
  {
    id: 'advance-tax',
    title: 'Quarterly Advance Tax Installment',
    category: 'Income Tax',
    frequency: 'Quarterly',
    typicalDueRule: '15th June (15%), 15th Sept (45%), 15th Dec (75%), 15th Mar (100%)',
    applicability: 'Enterprises with estimated annual tax liability >= ₹10,000',
  },
  {
    id: 'msme-1',
    title: 'MSME Form 1 (Half-Yearly Delayed Payment Return)',
    category: 'ROC',
    frequency: 'Annual',
    typicalDueRule: '30th April (Oct–Mar) and 31st October (Apr–Sept)',
    applicability: 'Companies with outstanding dues > 45 days to Micro/Small suppliers',
  },
  {
    id: 'udyam-update',
    title: 'Udyam Registration & ITR/GST Sync Verification',
    category: 'MSME',
    frequency: 'Annual',
    typicalDueRule: 'Annually post ITR/GSTR filing',
    applicability: 'All Udyam-registered Micro, Small & Medium Enterprises',
  },
];

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer(): Promise<void> {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'msme-saathi-api',
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/api/schemes', (req: Request, res: Response) => {
    const size = typeof req.query.size === 'string' ? req.query.size : '';
    const category = typeof req.query.category === 'string' ? req.query.category : '';

    const filtered = GOVERNMENT_SCHEMES.filter((scheme) => {
      const sizeMatch =
        !size ||
        size === 'All' ||
        scheme.eligibleSizes.includes(size as 'Micro' | 'Small' | 'Medium');
      const categoryMatch = !category || category === 'All' || scheme.category === category;
      return sizeMatch && categoryMatch;
    });

    res.json({ schemes: filtered });
  });

  app.get('/api/compliance/calendar', (_req: Request, res: Response) => {
    res.json({ calendar: COMPLIANCE_CALENDAR });
  });

  app.post('/api/ai/chat', async (req: Request, res: Response) => {
    try {
      const { message, history, businessContext, financialSummary } = req.body as {
        message?: string;
        history?: Array<{ role: 'user' | 'model'; text: string }>;
        businessContext?: Record<string, unknown>;
        financialSummary?: Record<string, unknown>;
      };

      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        res.status(400).json({ error: 'Please enter a valid question for MSME SAATHI Assistant.' });
        return;
      }

      if (message.length > 2500) {
        res.status(400).json({ error: 'Prompt is too long. Please keep questions under 2,500 characters.' });
        return;
      }

      const ai = getGeminiClient();
      if (!ai) {
        res.status(503).json({
          error:
            'AI Assistant service is currently unconfigured on the server (GEMINI_API_KEY not set in Secrets). Add GEMINI_API_KEY in Settings > Secrets to activate live responses.',
        });
        return;
      }

      const contextSnippet = JSON.stringify({
        business: businessContext ?? {},
        financials: financialSummary ?? {},
      });

      const conversationHistory = Array.isArray(history)
        ? history
            .slice(-6)
            .map((item) => `${item.role === 'user' ? 'User' : 'Assistant'}: ${item.text}`)
            .join('\n')
        : '';

      const systemInstruction = [
        'You are the MSME SAATHI Financial & Compliance Assistant for Indian Micro, Small, and Medium Enterprises.',
        'Ground every answer in Indian MSME regulations (GST, Udyam, RBI MSMED Act 45-day rule, TDS, CGTMSE, MUDRA, TReDS, cash flow management).',
        'Use Indian Rupee formatting (₹) and lakhs/crores where appropriate.',
        'Only cite numbers present in the supplied business & financial JSON context; if financials are zero or empty, honestly state that no transactions/invoices are recorded yet and explain what the owner should log next.',
        'Never invent fake numbers, fake filings, or pretend to be a chartered accountant filing on their behalf; recommend CA verification for statutory filings.',
        'Keep responses structured, concise (under 250 words unless detailed breakdown is requested), and practical.',
      ].join(' ');

      const prompt = [
        `Active MSME Workspace Context: ${contextSnippet}`,
        conversationHistory ? `Recent conversation:\n${conversationHistory}` : '',
        `Current User Question: ${message.trim()}`,
      ]
        .filter(Boolean)
        .join('\n\n');

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction,
        },
      });

      const reply = response.text?.trim();
      if (!reply) {
        res.status(502).json({ error: 'Empty response received from the AI model. Please retry.' });
        return;
      }

      res.json({ reply });
    } catch (error) {
      console.error('AI chat endpoint error:', error);
      const errMessage = error instanceof Error ? error.message : 'Unable to process AI request.';
      res.status(500).json({ error: errMessage });
    }
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MSME SAATHI server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start MSME SAATHI server:', err);
  process.exit(1);
});
