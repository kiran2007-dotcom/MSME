import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '../firebase/config.ts';
import { handleFirestoreError, OperationType } from '../firebase/errors.ts';
import {
  FIELD_LIMITS,
  type BusinessDocument,
  type ComplianceReminder,
  type DocumentCategory,
  type Invoice,
  type InvoiceInput,
  type InvoiceStatus,
  type ReminderInput,
  type ReminderStatus,
  type Transaction,
  type TransactionInput,
  type TransactionStatus,
} from '../types/index.ts';

function generateRecordId(prefix: string): string {
  const rand =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().replace(/-/g, '').slice(0, 14)
      : `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  return `${prefix}_${rand}`;
}

// --- Transactions ---

export function subscribeToTransactions(
  businessId: string,
  onData: (items: Transaction[]) => void
): Unsubscribe {
  const path = `businesses/${businessId}/transactions`;
  const q = query(collection(db, 'businesses', businessId, 'transactions'), orderBy('date', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      onData(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Transaction, 'id'>) })));
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function createTransaction(
  businessId: string,
  uid: string,
  input: TransactionInput
): Promise<string> {
  const txId = generateRecordId('tx');
  const path = `businesses/${businessId}/transactions/${txId}`;
  try {
    await setDoc(doc(db, 'businesses', businessId, 'transactions', txId), {
      businessId,
      type: input.type,
      category: input.category.trim().slice(0, FIELD_LIMITS.TX_CATEGORY_MAX),
      description: input.description.trim().slice(0, FIELD_LIMITS.TX_DESC_MAX),
      counterparty: input.counterparty.trim().slice(0, FIELD_LIMITS.COUNTERPARTY_MAX),
      amount: Number(input.amount),
      gstAmount: Number(input.gstAmount) || 0,
      date: input.date,
      status: input.status,
      paymentMethod: input.paymentMethod,
      createdByUid: uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return txId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateTransactionStatus(
  businessId: string,
  transactionId: string,
  status: TransactionStatus
): Promise<void> {
  const path = `businesses/${businessId}/transactions/${transactionId}`;
  try {
    await updateDoc(doc(db, 'businesses', businessId, 'transactions', transactionId), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteTransaction(businessId: string, transactionId: string): Promise<void> {
  const path = `businesses/${businessId}/transactions/${transactionId}`;
  try {
    await deleteDoc(doc(db, 'businesses', businessId, 'transactions', transactionId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- Invoices ---

export function subscribeToInvoices(
  businessId: string,
  onData: (items: Invoice[]) => void
): Unsubscribe {
  const path = `businesses/${businessId}/invoices`;
  const q = query(collection(db, 'businesses', businessId, 'invoices'), orderBy('issueDate', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      onData(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Invoice, 'id'>) })));
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function createInvoice(
  businessId: string,
  uid: string,
  input: InvoiceInput
): Promise<string> {
  const invId = generateRecordId('inv');
  const path = `businesses/${businessId}/invoices/${invId}`;
  const subtotal = Number(input.subtotal);
  const gstAmount = Number(input.gstAmount) || 0;
  try {
    await setDoc(doc(db, 'businesses', businessId, 'invoices', invId), {
      businessId,
      invoiceNumber: input.invoiceNumber.trim().slice(0, FIELD_LIMITS.INVOICE_NUM_MAX),
      customerName: input.customerName.trim().slice(0, FIELD_LIMITS.COUNTERPARTY_MAX),
      customerGstin: input.customerGstin.trim().toUpperCase().slice(0, FIELD_LIMITS.GSTIN_MAX),
      issueDate: input.issueDate,
      dueDate: input.dueDate,
      subtotal,
      gstAmount,
      totalAmount: subtotal + gstAmount,
      status: input.status,
      notes: input.notes.trim().slice(0, FIELD_LIMITS.NOTES_MAX),
      createdByUid: uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return invId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateInvoiceStatus(
  businessId: string,
  invoiceId: string,
  status: InvoiceStatus
): Promise<void> {
  const path = `businesses/${businessId}/invoices/${invoiceId}`;
  try {
    await updateDoc(doc(db, 'businesses', businessId, 'invoices', invoiceId), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteInvoice(businessId: string, invoiceId: string): Promise<void> {
  const path = `businesses/${businessId}/invoices/${invoiceId}`;
  try {
    await deleteDoc(doc(db, 'businesses', businessId, 'invoices', invoiceId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- Compliance Reminders ---

export function subscribeToReminders(
  businessId: string,
  onData: (items: ComplianceReminder[]) => void
): Unsubscribe {
  const path = `businesses/${businessId}/reminders`;
  const q = query(collection(db, 'businesses', businessId, 'reminders'), orderBy('dueDate', 'asc'));
  return onSnapshot(
    q,
    (snap) => {
      onData(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ComplianceReminder, 'id'>) }))
      );
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function createReminder(
  businessId: string,
  uid: string,
  input: ReminderInput
): Promise<string> {
  const remId = generateRecordId('rem');
  const path = `businesses/${businessId}/reminders/${remId}`;
  try {
    await setDoc(doc(db, 'businesses', businessId, 'reminders', remId), {
      businessId,
      title: input.title.trim().slice(0, FIELD_LIMITS.REMINDER_TITLE_MAX),
      category: input.category,
      dueDate: input.dueDate,
      status: input.status,
      notes: input.notes.trim().slice(0, FIELD_LIMITS.NOTES_MAX),
      createdByUid: uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return remId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function toggleReminderStatus(
  businessId: string,
  reminderId: string,
  status: ReminderStatus
): Promise<void> {
  const path = `businesses/${businessId}/reminders/${reminderId}`;
  try {
    await updateDoc(doc(db, 'businesses', businessId, 'reminders', reminderId), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteReminder(businessId: string, reminderId: string): Promise<void> {
  const path = `businesses/${businessId}/reminders/${reminderId}`;
  try {
    await deleteDoc(doc(db, 'businesses', businessId, 'reminders', reminderId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- Documents Vault (Firebase Cloud Storage + Firestore) ---

export function subscribeToDocuments(
  businessId: string,
  onData: (items: BusinessDocument[]) => void
): Unsubscribe {
  const path = `businesses/${businessId}/documents`;
  const q = query(
    collection(db, 'businesses', businessId, 'documents'),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(
    q,
    (snap) => {
      onData(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<BusinessDocument, 'id'>) }))
      );
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function uploadBusinessDocument(
  businessId: string,
  uid: string,
  file: File,
  category: DocumentCategory,
  displayName?: string
): Promise<string> {
  const docId = generateRecordId('doc');
  const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120);
  const storagePath = `businesses/${businessId}/documents/${docId}/${safeFileName}`;
  const storageRef = ref(storage, storagePath);

  await uploadBytes(storageRef, file, { contentType: file.type || 'application/octet-stream' });
  const downloadUrl = await getDownloadURL(storageRef);

  const firestorePath = `businesses/${businessId}/documents/${docId}`;
  try {
    await setDoc(doc(db, 'businesses', businessId, 'documents', docId), {
      businessId,
      name: (displayName?.trim() || file.name).slice(0, FIELD_LIMITS.DOC_NAME_MAX),
      category,
      storagePath: storagePath.slice(0, 500),
      downloadUrl: downloadUrl.slice(0, 1500),
      mimeType: (file.type || 'application/octet-stream').slice(0, 120),
      sizeBytes: file.size,
      uploadedByUid: uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, firestorePath);
  }
}

export async function deleteBusinessDocument(
  businessId: string,
  docItem: BusinessDocument
): Promise<void> {
  const firestorePath = `businesses/${businessId}/documents/${docItem.id}`;
  try {
    if (docItem.storagePath) {
      await deleteObject(ref(storage, docItem.storagePath)).catch(() => {
        // Proceed to clean metadata if object was already removed
      });
    }
    await deleteDoc(doc(db, 'businesses', businessId, 'documents', docItem.id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, firestorePath);
  }
}
