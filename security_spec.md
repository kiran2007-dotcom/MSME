# MSME SAATHI Security Specification (Phase 0)

## 1. Data Invariants
1. **User PII Isolation**: `/users/{userId}` and `/users/{userId}/memberships/{businessId}` are readable and writable strictly by `request.auth.uid == userId`. No cross-user reads or list queries are permitted.
2. **Business Ownership & Member RBAC**: `/businesses/{businessId}` is readable only by authenticated users who are listed in `/businesses/{businessId}/members/{request.auth.uid}` (or `resource.data.ownerUid == request.auth.uid` for single-owner list queries). Only the `ownerUid` or `owner`/`admin` member may modify business profile fields. `ownerUid`, `id`, and `createdAt` are immutable after creation.
3. **Atomic Workspace Bootstrap**: Creating a business atomically creates `/businesses/{businessId}`, `/businesses/{businessId}/members/{ownerUid}` (`role == 'owner'`), and `/users/{ownerUid}/memberships/{businessId}` (`role == 'owner'`). Security rules enforce `existsAfter(...)` on the owner member record during business creation and prevent non-owners from creating arbitrary member records.
4. **Master Gate on Business Subcollections**: Every subcollection (`/transactions`, `/invoices`, `/reminders`, `/documents`) enforces `isBusinessMember(businessId)` (and write-role gating `canWriteBusinessData(businessId)` for `owner`, `admin`, `accountant`) via `get()` on `/businesses/{businessId}/members/{request.auth.uid}`.
5. **Temporal & Volumetric Integrity**: All `createdAt` on create and `updatedAt` on update must equal `request.time`. Every string field has strict `.size()` bounds and IDs match `^[a-zA-Z0-9_\-]+$`.
6. **Terminal & Immutable Fields**: `businessId`, `createdByUid` / `uploadedByUid`, `createdAt`, `ownerUid` cannot be changed on update.

## 2. The "Dirty Dozen" Attack Payloads (All Must Result in PERMISSION_DENIED)
1. **Unauthenticated Business Read**: Unauthenticated client reads `/businesses/biz_1`.
2. **Cross-User PII Read**: User B reads `/users/user_A`.
3. **Cross-Business Subcollection Read**: User B reads `/businesses/biz_A/transactions/tx_1` when not in `members`.
4. **Owner Spoofing on Business Create**: User B creates `/businesses/biz_B` with `ownerUid: "user_A"`.
5. **Shadow Field Injection**: User A creates `/businesses/biz_A/transactions/tx_1` with extra ghost field `isVerified: true`.
6. **Self-Privilege Escalation on Membership**: User B with `viewer` role updates `/businesses/biz_A/members/user_B` to `role: "owner"`.
7. **Orphaned Business Without Owner Member**: User A creates `/businesses/biz_A` without batch-creating `/businesses/biz_A/members/user_A`.
8. **ID Poisoning**: User A writes to `/businesses/../../etc/passwd` or a 500-character document ID.
9. **Oversized String Exhaustion**: User A creates a transaction with a 5,000-character `description`.
10. **Client-Forged Timestamp**: User A creates a transaction with `createdAt` set to a backdated client timestamp instead of `request.time`.
11. **Immutable Field Mutation**: User A updates a transaction and changes `businessId` or `createdByUid`.
12. **Blanket List Query Scraping**: User B queries `collection(db, 'businesses')` without filtering by `ownerUid == request.auth.uid`.
