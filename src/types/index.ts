import type { Timestamp } from 'firebase/firestore';

export type ThemePreference = 'light' | 'dark' | 'system';

export type BusinessType =
  | 'Proprietorship'
  | 'Partnership'
  | 'LLP'
  | 'Private Limited'
  | 'One Person Company'
  | 'Other';

export type BusinessSize = 'Micro' | 'Small' | 'Medium';

export type RegistrationStatus = 'Registered' | 'In Progress' | 'Unregistered';

export type MemberRole = 'owner' | 'admin' | 'accountant' | 'viewer';

export type TransactionType = 'income' | 'expense';
export type TransactionStatus = 'completed' | 'pending';
export type PaymentMethod = 'UPI' | 'NEFT/RTGS' | 'Card' | 'Cash' | 'Cheque' | 'Other';

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';

export type ReminderCategory = 'GST' | 'Income Tax' | 'ROC' | 'MSME' | 'Payment' | 'Other';
export type ReminderStatus = 'upcoming' | 'completed';

export type DocumentCategory =
  | 'GST'
  | 'Udyam'
  | 'Invoice'
  | 'Bank Statement'
  | 'License'
  | 'Tax'
  | 'Other';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  activeBusinessId: string;
  themePreference: ThemePreference;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface UserMembership {
  businessId: string;
  businessName: string;
  role: MemberRole;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Business {
  id: string;
  ownerUid: string;
  ownerName: string;
  businessName: string;
  businessType: BusinessType;
  industryCategory: string;
  city: string;
  state: string;
  pincode: string;
  businessSize: BusinessSize;
  registrationStatus: RegistrationStatus;
  gstin: string;
  udyamNumber: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface BusinessInput {
  ownerName: string;
  businessName: string;
  businessType: BusinessType;
  industryCategory: string;
  city: string;
  state: string;
  pincode: string;
  businessSize: BusinessSize;
  registrationStatus: RegistrationStatus;
  gstin: string;
  udyamNumber: string;
}

export interface Transaction {
  id: string;
  businessId: string;
  type: TransactionType;
  category: string;
  description: string;
  counterparty: string;
  amount: number;
  gstAmount: number;
  date: string;
  status: TransactionStatus;
  paymentMethod: PaymentMethod;
  createdByUid: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface TransactionInput {
  type: TransactionType;
  category: string;
  description: string;
  counterparty: string;
  amount: number;
  gstAmount: number;
  date: string;
  status: TransactionStatus;
  paymentMethod: PaymentMethod;
}

export interface Invoice {
  id: string;
  businessId: string;
  invoiceNumber: string;
  customerName: string;
  customerGstin: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  gstAmount: number;
  totalAmount: number;
  status: InvoiceStatus;
  notes: string;
  createdByUid: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface InvoiceInput {
  invoiceNumber: string;
  customerName: string;
  customerGstin: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  gstAmount: number;
  status: InvoiceStatus;
  notes: string;
}

export interface ComplianceReminder {
  id: string;
  businessId: string;
  title: string;
  category: ReminderCategory;
  dueDate: string;
  status: ReminderStatus;
  notes: string;
  createdByUid: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface ReminderInput {
  title: string;
  category: ReminderCategory;
  dueDate: string;
  status: ReminderStatus;
  notes: string;
}

export interface BusinessDocument {
  id: string;
  businessId: string;
  name: string;
  category: DocumentCategory;
  storagePath: string;
  downloadUrl: string;
  mimeType: string;
  sizeBytes: number;
  uploadedByUid: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface SchemeInfo {
  id: string;
  name: string;
  ministry: string;
  category: string;
  eligibleSizes: BusinessSize[];
  maxSupport: string;
  summary: string;
  eligibilityNotes: string;
  officialUrl: string;
}

export interface ComplianceCalendarTemplate {
  id: string;
  title: string;
  category: string;
  frequency: string;
  typicalDueRule: string;
  applicability: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface DashboardMetrics {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  outstandingPayments: number;
  pendingExpenses: number;
  totalGstCollected: number;
  totalGstInput: number;
  completedTransactionsCount: number;
}

export interface MonthlyChartPoint {
  monthKey: string;
  label: string;
  revenue: number;
  expenses: number;
  netCashFlow: number;
}

export const FIELD_LIMITS = {
  DISPLAY_NAME_MAX: 120,
  BUSINESS_NAME_MAX: 160,
  INDUSTRY_MAX: 100,
  CITY_MAX: 100,
  STATE_MAX: 100,
  PINCODE_LEN: 6,
  GSTIN_MAX: 15,
  UDYAM_MAX: 25,
  TX_CATEGORY_MAX: 80,
  TX_DESC_MAX: 300,
  COUNTERPARTY_MAX: 160,
  INVOICE_NUM_MAX: 60,
  NOTES_MAX: 500,
  REMINDER_TITLE_MAX: 180,
  DOC_NAME_MAX: 200,
} as const;

export const PATTERNS = {
  ID: /^[a-zA-Z0-9_-]+$/,
  PINCODE: /^[0-9]{6}$/,
  GSTIN: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
  UDYAM: /^UDYAM-[A-Z]{2}-[0-9]{2}-[0-9]{7}$/,
  ISO_DATE: /^\d{4}-\d{2}-\d{2}$/,
} as const;

export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
] as const;

export const INDUSTRY_CATEGORIES = [
  'Manufacturing & Engineering',
  'Textiles & Apparel',
  'Wholesale & Retail Trading',
  'Food Processing & Beverages',
  'IT, Software & Digital Services',
  'Logistics, Packaging & Warehousing',
  'Healthcare & Pharmaceuticals',
  'Construction & Infrastructure',
  'Agriculture & Allied',
  'Professional & Business Services',
  'Other',
] as const;
