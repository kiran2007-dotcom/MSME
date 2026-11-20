// Dirty Dozen Security Rule Verification Specification for MSME SAATHI
// Run against Firebase Emulator Suite (@firebase/rules-unit-testing) when testing locally.

export interface SecurityTestCase {
  id: number;
  name: string;
  actorUid: string | null;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  path: string;
  payload?: Record<string, unknown>;
  expected: 'PERMISSION_DENIED';
}

export const dirtyDozenPayloads: SecurityTestCase[] = [
  {
    id: 1,
    name: 'Unauthenticated business read',
    actorUid: null,
    operation: 'get',
    path: 'businesses/biz_alpha',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Cross-user PII read',
    actorUid: 'user_bob',
    operation: 'get',
    path: 'users/user_alice',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Cross-business transaction read',
    actorUid: 'user_bob',
    operation: 'get',
    path: 'businesses/biz_alpha/transactions/tx_1',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Owner spoofing on business creation',
    actorUid: 'user_bob',
    operation: 'create',
    path: 'businesses/biz_spoof',
    payload: { id: 'biz_spoof', ownerUid: 'user_alice', businessName: 'Spoof Co' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Shadow field injection on transaction creation',
    actorUid: 'user_alice',
    operation: 'create',
    path: 'businesses/biz_alpha/transactions/tx_shadow',
    payload: { businessId: 'biz_alpha', amount: 1000, isVerified: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Self-privilege escalation on member role',
    actorUid: 'user_viewer',
    operation: 'update',
    path: 'businesses/biz_alpha/members/user_viewer',
    payload: { role: 'owner' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Orphaned business created without atomic owner member doc',
    actorUid: 'user_alice',
    operation: 'create',
    path: 'businesses/biz_orphan',
    payload: { id: 'biz_orphan', ownerUid: 'user_alice' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'ID poisoning with oversized or invalid path ID',
    actorUid: 'user_alice',
    operation: 'create',
    path: `businesses/${'a'.repeat(200)}`,
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Oversized string exhaustion in transaction description',
    actorUid: 'user_alice',
    operation: 'create',
    path: 'businesses/biz_alpha/transactions/tx_huge',
    payload: { description: 'x'.repeat(5000) },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Client-forged backdated createdAt timestamp',
    actorUid: 'user_alice',
    operation: 'create',
    path: 'businesses/biz_alpha/transactions/tx_backdate',
    payload: { createdAt: '2020-01-01T00:00:00Z' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Immutable field mutation on transaction update',
    actorUid: 'user_alice',
    operation: 'update',
    path: 'businesses/biz_alpha/transactions/tx_1',
    payload: { businessId: 'biz_other', createdByUid: 'user_bob' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Blanket list query scraping on businesses collection',
    actorUid: 'user_bob',
    operation: 'list',
    path: 'businesses',
    expected: 'PERMISSION_DENIED',
  },
];
