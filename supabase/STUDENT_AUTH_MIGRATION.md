# SchoolCoin Student Auth Migration

## Status

Design and additive schema layer only. Production cutover is intentionally not performed by this audit.

## Existing architecture

`student_code + PIN -> schoolcoin_student_login -> anon`

Sensitive RPCs currently accept the legacy student credentials. Existing student, balance, order, and transaction rows must remain unchanged.

## Target architecture

`student_code + PIN`
-> create/obtain a Supabase Auth anonymous session
-> authenticated binding RPC validates the legacy credential once
-> `auth.uid()` is inserted into `schoolcoin_student_auth_bindings`
-> sensitive operations resolve the student only from `auth.uid()`

A binding table is used instead of a single `schoolcoin_students.auth_user_id` column because Supabase anonymous users cannot sign back into the same Auth account after sign-out, cleared browser storage, or on another device. Supabase documents anonymous users as authenticated-role users but without a reusable identity. Multiple authenticated bindings therefore allow the existing student code/PIN login to work across devices without duplicating student rows.

## Binding invariants

- `auth_user_id` is the primary key of the binding table: one Auth user maps to one student.
- `student_id` references the existing `schoolcoin_students.id`.
- Multiple Auth users may map to the same existing student.
- No existing student row is rewritten during onboarding.
- No balances, orders, or transactions are migrated.
- Binding must require a valid existing student code/PIN and an active student.
- Binding must require `auth.uid()`.
- Binding must reject reassignment of an existing Auth user to another student.
- Binding table has no direct `anon` or `authenticated` table grants.

## Required RPC sequence

### 1. `schoolcoin_bind_student(text,text)`

`SECURITY DEFINER`, explicit `SET search_path = public, pg_temp`.

Requirements:

1. Require `auth.uid()`.
2. Require an authenticated Supabase session.
3. Validate the existing student code/PIN using the already deployed login verification path rather than inventing a new PIN hashing scheme.
4. Resolve the existing student row server-side.
5. Require `active = true`.
6. Insert `(auth.uid(), student_id)` into the binding table.
7. If `auth.uid()` is already bound, return the same student only; never reassign it.
8. If the Auth user is already bound to another student, reject.
9. Do not accept a browser-supplied student UUID as an authorization input.

The RPC should initially be callable only by `authenticated`, not `anon`.

### 2. `schoolcoin_current_student()`

`SECURITY DEFINER`, explicit search path.

Returns the existing student row associated with `auth.uid()` through the binding table. It must never accept a student ID.

### 3. `schoolcoin_student_orders()`

After the authenticated path is proven, resolve student identity from `auth.uid()` and remove the authorization dependency on browser-supplied student code/PIN.

### 4. `schoolcoin_submit_request()`

Resolve student identity from `auth.uid()` and reject requests where no binding exists.

### 5. `schoolcoin_market_redeem()`

Preserve the existing transaction logic:

- student row lock
- reward row lock
- balance validation
- stock validation
- transaction creation
- order creation
- stock decrement
- atomic rollback

Only change identity resolution: the server must derive `student_id` from `auth.uid()` and the binding table.

## Grant cutover

Do not revoke `schoolcoin_student_login` from `anon` until the replacement onboarding flow is deployed and tested.

After authenticated onboarding is proven:

- revoke `anon` EXECUTE on `schoolcoin_market_redeem`
- revoke `anon` EXECUTE on `schoolcoin_student_orders`
- revoke `anon` EXECUTE on `schoolcoin_submit_request`
- retain only the minimum required authenticated/admin EXECUTE grants
- retire `schoolcoin_student_login` only after all existing students can authenticate through the replacement path

## RLS

Existing admin policies remain unchanged.

Student-facing RLS should use the binding table and `auth.uid()` only. Direct table grants remain disabled for the binding table.

Because Supabase anonymous Auth users use the `authenticated` Postgres role, student authorization must require an existing binding rather than treating the `authenticated` role alone as proof of student identity.

## Frontend sequence

1. Preserve the existing student code/PIN form.
2. Call `supabase.auth.signInAnonymously()` to establish an Auth session.
3. Call `schoolcoin_bind_student(code, pin)` once.
4. Fetch the student identity with `schoolcoin_current_student()`.
5. Stop sending student ID/code/PIN to sensitive SchoolCoin operations.
6. Keep the existing UI and server-authoritative balance refresh.
7. On another device, repeat anonymous sign-in + binding using the existing student code/PIN; this creates another binding for the same existing student rather than another student row.

## Safety tests before cutover

Do not perform real destructive redemptions against production balances.

- unauthenticated `anon`: cannot execute sensitive RPCs after cutover
- authenticated but unbound: cannot read private student data or redeem
- bound Student A: can read only Student A data
- bound Student A: cannot operate as Student B
- bound Student B: isolated from Student A
- admin: existing dashboard and CRUD continue working
- invalid code/PIN: binding rejected
- inactive student: binding rejected
- insufficient balance: redeem rejected
- inactive reward: redeem rejected
- insufficient stock: redeem rejected
- concurrent redeem: no double spend
- duplicate request: no duplicate economic effect

## Production safety

This migration file is non-destructive and is not applied by the audit. No production student, balance, order, transaction, or Auth user is created or modified by the audit.
