import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  subscribeToBusiness,
  subscribeToUserMemberships,
  updateActiveBusiness,
} from '../services/businessService.ts';
import {
  subscribeToDocuments,
  subscribeToInvoices,
  subscribeToReminders,
  subscribeToTransactions,
} from '../services/financeService.ts';
import type {
  Business,
  BusinessDocument,
  ComplianceReminder,
  DashboardMetrics,
  Invoice,
  MonthlyChartPoint,
  Transaction,
  UserMembership,
} from '../types/index.ts';
import { computeDashboardMetrics, computeMonthlySeries } from '../utils/formatters.ts';
import { useAuth } from './useAuth.tsx';

interface BusinessContextValue {
  memberships: UserMembership[];
  membershipsLoaded: boolean;
  activeBusiness: Business | null;
  businessLoaded: boolean;
  transactions: Transaction[];
  invoices: Invoice[];
  reminders: ComplianceReminder[];
  documents: BusinessDocument[];
  dataLoaded: boolean;
  metrics: DashboardMetrics;
  monthlySeries: MonthlyChartPoint[];
  switchBusiness: (businessId: string) => Promise<void>;
}

const BusinessContext = createContext<BusinessContextValue | undefined>(undefined);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const { firebaseUser, userProfile, authReady } = useAuth();

  const [memberships, setMemberships] = useState<UserMembership[]>([]);
  const [membershipsLoaded, setMembershipsLoaded] = useState(false);

  const [activeBusiness, setActiveBusiness] = useState<Business | null>(null);
  const [businessLoaded, setBusinessLoaded] = useState(false);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [reminders, setReminders] = useState<ComplianceReminder[]>([]);
  const [documents, setDocuments] = useState<BusinessDocument[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (!authReady || !firebaseUser) {
      setMemberships([]);
      setMembershipsLoaded(true);
      setActiveBusiness(null);
      setBusinessLoaded(true);
      return;
    }

    setMembershipsLoaded(false);
    const unsub = subscribeToUserMemberships(firebaseUser.uid, (items) => {
      setMemberships(items);
      setMembershipsLoaded(true);
    });

    return () => unsub();
  }, [authReady, firebaseUser]);

  const resolvedBusinessId = useMemo(() => {
    if (!firebaseUser || memberships.length === 0) return '';
    const preferred = userProfile?.activeBusinessId;
    if (preferred && memberships.some((m) => m.businessId === preferred)) {
      return preferred;
    }
    return memberships[0].businessId;
  }, [firebaseUser, memberships, userProfile?.activeBusinessId]);

  useEffect(() => {
    if (!authReady || !firebaseUser || !resolvedBusinessId) {
      setActiveBusiness(null);
      setBusinessLoaded(true);
      setTransactions([]);
      setInvoices([]);
      setReminders([]);
      setDocuments([]);
      setDataLoaded(true);
      return;
    }

    setBusinessLoaded(false);
    setDataLoaded(false);

    let txReady = false;
    let invReady = false;
    let remReady = false;
    let docReady = false;

    const markDataReady = () => {
      if (txReady && invReady && remReady && docReady) {
        setDataLoaded(true);
      }
    };

    const unsubBiz = subscribeToBusiness(resolvedBusinessId, (biz) => {
      setActiveBusiness(biz);
      setBusinessLoaded(true);
    });

    const unsubTx = subscribeToTransactions(resolvedBusinessId, (items) => {
      setTransactions(items);
      txReady = true;
      markDataReady();
    });

    const unsubInv = subscribeToInvoices(resolvedBusinessId, (items) => {
      setInvoices(items);
      invReady = true;
      markDataReady();
    });

    const unsubRem = subscribeToReminders(resolvedBusinessId, (items) => {
      setReminders(items);
      remReady = true;
      markDataReady();
    });

    const unsubDoc = subscribeToDocuments(resolvedBusinessId, (items) => {
      setDocuments(items);
      docReady = true;
      markDataReady();
    });

    return () => {
      unsubBiz();
      unsubTx();
      unsubInv();
      unsubRem();
      unsubDoc();
    };
  }, [authReady, firebaseUser, resolvedBusinessId]);

  const switchBusiness = useCallback(
    async (businessId: string) => {
      if (!firebaseUser) return;
      await updateActiveBusiness(firebaseUser.uid, businessId);
    },
    [firebaseUser]
  );

  const metrics = useMemo(
    () => computeDashboardMetrics(transactions, invoices),
    [transactions, invoices]
  );

  const monthlySeries = useMemo(() => computeMonthlySeries(transactions), [transactions]);

  return (
    <BusinessContext.Provider
      value={{
        memberships,
        membershipsLoaded,
        activeBusiness,
        businessLoaded,
        transactions,
        invoices,
        reminders,
        documents,
        dataLoaded,
        metrics,
        monthlySeries,
        switchBusiness,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness(): BusinessContextValue {
  const ctx = useContext(BusinessContext);
  if (!ctx) {
    throw new Error('useBusiness must be used within BusinessProvider');
  }
  return ctx;
}
