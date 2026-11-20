import type { User } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase/config.ts';
import { handleFirestoreError, OperationType } from '../firebase/errors.ts';
import {
  FIELD_LIMITS,
  type Business,
  type BusinessInput,
  type ThemePreference,
  type UserMembership,
  type UserProfile,
} from '../types/index.ts';

function sanitizeBusinessInput(input: BusinessInput): BusinessInput {
  return {
    ownerName: input.ownerName.trim().slice(0, FIELD_LIMITS.DISPLAY_NAME_MAX),
    businessName: input.businessName.trim().slice(0, FIELD_LIMITS.BUSINESS_NAME_MAX),
    businessType: input.businessType,
    industryCategory: input.industryCategory.trim().slice(0, FIELD_LIMITS.INDUSTRY_MAX),
    city: input.city.trim().slice(0, FIELD_LIMITS.CITY_MAX),
    state: input.state.trim().slice(0, FIELD_LIMITS.STATE_MAX),
    pincode: input.pincode.trim().slice(0, FIELD_LIMITS.PINCODE_LEN),
    businessSize: input.businessSize,
    registrationStatus: input.registrationStatus,
    gstin: input.gstin.trim().toUpperCase().slice(0, FIELD_LIMITS.GSTIN_MAX),
    udyamNumber: input.udyamNumber.trim().toUpperCase().slice(0, FIELD_LIMITS.UDYAM_MAX),
  };
}

export async function ensureUserProfile(user: User, fallbackName?: string): Promise<void> {
  const userPath = `users/${user.uid}`;
  const userRef = doc(db, 'users', user.uid);
  try {
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      const displayName = (fallbackName || user.displayName || user.email?.split('@')[0] || 'Business Owner')
        .trim()
        .slice(0, FIELD_LIMITS.DISPLAY_NAME_MAX);
      await setDoc(userRef, {
        uid: user.uid,
        email: (user.email || 'owner@msmesaathi.in').slice(0, 320),
        displayName,
        activeBusinessId: '',
        themePreference: 'light',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, userPath);
  }
}

export async function updateUserTheme(uid: string, themePreference: ThemePreference): Promise<void> {
  const userPath = `users/${uid}`;
  try {
    await updateDoc(doc(db, 'users', uid), {
      themePreference,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, userPath);
  }
}

export async function updateActiveBusiness(uid: string, businessId: string): Promise<void> {
  const userPath = `users/${uid}`;
  try {
    await updateDoc(doc(db, 'users', uid), {
      activeBusinessId: businessId,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, userPath);
  }
}

export async function createBusinessWorkspace(
  uid: string,
  input: BusinessInput,
  fallbackEmail?: string
): Promise<string> {
  const clean = sanitizeBusinessInput(input);
  const randomSuffix =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().replace(/-/g, '').slice(0, 16)
      : `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  const businessId = `biz_${randomSuffix}`;

  const businessRef = doc(db, 'businesses', businessId);
  const memberRef = doc(db, 'businesses', businessId, 'members', uid);
  const membershipRef = doc(db, 'users', uid, 'memberships', businessId);
  const userRef = doc(db, 'users', uid);

  const existingUserSnap = await getDoc(userRef).catch(() => null);

  const batch = writeBatch(db);
  batch.set(businessRef, {
    id: businessId,
    ownerUid: uid,
    ownerName: clean.ownerName,
    businessName: clean.businessName,
    businessType: clean.businessType,
    industryCategory: clean.industryCategory,
    city: clean.city,
    state: clean.state,
    pincode: clean.pincode,
    businessSize: clean.businessSize,
    registrationStatus: clean.registrationStatus,
    gstin: clean.gstin,
    udyamNumber: clean.udyamNumber,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  batch.set(memberRef, {
    userId: uid,
    role: 'owner',
    displayName: clean.ownerName,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  batch.set(membershipRef, {
    businessId,
    businessName: clean.businessName,
    role: 'owner',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  if (existingUserSnap && existingUserSnap.exists()) {
    batch.update(userRef, {
      displayName: clean.ownerName,
      activeBusinessId: businessId,
      updatedAt: serverTimestamp(),
    });
  } else {
    batch.set(userRef, {
      uid,
      email: (fallbackEmail || 'owner@msmesaathi.in').slice(0, 320),
      displayName: clean.ownerName,
      activeBusinessId: businessId,
      themePreference: 'light',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  try {
    await batch.commit();
    return businessId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `businesses/${businessId}`);
  }
}

export async function updateBusinessProfile(
  uid: string,
  businessId: string,
  input: BusinessInput
): Promise<void> {
  const clean = sanitizeBusinessInput(input);
  const batch = writeBatch(db);

  batch.update(doc(db, 'businesses', businessId), {
    ownerName: clean.ownerName,
    businessName: clean.businessName,
    businessType: clean.businessType,
    industryCategory: clean.industryCategory,
    city: clean.city,
    state: clean.state,
    pincode: clean.pincode,
    businessSize: clean.businessSize,
    registrationStatus: clean.registrationStatus,
    gstin: clean.gstin,
    udyamNumber: clean.udyamNumber,
    updatedAt: serverTimestamp(),
  });

  batch.update(doc(db, 'users', uid, 'memberships', businessId), {
    businessName: clean.businessName,
    updatedAt: serverTimestamp(),
  });

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `businesses/${businessId}`);
  }
}

export function subscribeToUserProfile(
  uid: string,
  onData: (profile: UserProfile | null) => void
): Unsubscribe {
  const path = `users/${uid}`;
  return onSnapshot(
    doc(db, 'users', uid),
    (snap) => {
      onData(snap.exists() ? (snap.data() as UserProfile) : null);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export function subscribeToUserMemberships(
  uid: string,
  onData: (memberships: UserMembership[]) => void
): Unsubscribe {
  const path = `users/${uid}/memberships`;
  return onSnapshot(
    collection(db, 'users', uid, 'memberships'),
    (snap) => {
      const items = snap.docs.map((d) => d.data() as UserMembership);
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeToBusiness(
  businessId: string,
  onData: (business: Business | null) => void
): Unsubscribe {
  const path = `businesses/${businessId}`;
  return onSnapshot(
    doc(db, 'businesses', businessId),
    (snap) => {
      onData(snap.exists() ? (snap.data() as Business) : null);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}
