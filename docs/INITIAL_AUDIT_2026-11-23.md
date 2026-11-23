# School Website + SchoolCoin — Initial Audit
Date: 2026-11-23
Branch: `audit/school-website-schoolcoin-2026-11-23`
Base: `main`

## Scope inspected
- Repository metadata and root structure
- `package.json`
- `src/App.tsx`
- `src/lib/supabase.ts`
- `src/components/SchoolCoinSecure.tsx`
- Supabase migration directory and `supabase/MIGRATION_DRIFT.md`
- Recent commit history

## Verified architecture
- Frontend: React 18 + TypeScript + Vite
- Styling: Tailwind CSS
- Backend client: Supabase JS
- Major application modules include school information pages, admin dashboard, SchoolCoin student/admin interface, analytics, and school content data.
- The repository includes Supabase SQL migrations and migration-drift documentation.

## Findings

### P0 — Resolve production migration drift before database changes
`supabase/MIGRATION_DRIFT.md` records 29 migrations in the live project's migration history (verified there as of 2026-08-16), while the repository currently tracks 6 SQL migration files. The document explicitly warns against fabricating missing historical migrations or resetting/truncating production data.

Action:
1. Identify the authoritative live Supabase project.
2. Read-only inspect its migration history, schema, policies, functions, triggers, indexes, and grants.
3. Reconcile using exact recoverable history or a documented baseline strategy.
4. Do not apply migrations, reset, drop, truncate, or rewrite production data during this audit.

### P0 — Confirm the correct Supabase project connection
The frontend source references Supabase project ref `tljecpmgfwpwajwkkock`. The Supabase projects visible through the currently connected account did not include that ref. No live database inspection has therefore been performed.

Action: connect the account that owns the referenced project, or confirm the correct project ref before any database work.

### P1 — Remove user-specific data from shared application code
The SchoolCoin frontend contains a hard-coded, user-specific personal message and a transaction-history filter based on a literal note string. These should not be embedded in a shared student-facing component.

Action:
- Remove the special-case personal message from the shared frontend.
- Replace literal-string transaction filtering with a documented, role-appropriate data rule or remove the filter.
- Check repository history and production data exposure before deciding whether any further remediation is needed.

### P1 — Make Supabase configuration status truthful
`src/lib/supabase.ts` falls back to a project URL and publishable client key, then derives `supabaseConfigured` from the resolved key. Because the fallback key is always present, this boolean does not indicate whether environment variables were configured. This can hide deployment misconfiguration.

Action:
- Separate client initialization from explicit environment-configuration status.
- Validate URL/key pairing and show a clear configuration diagnostic.
- Keep only publishable client keys in browser code; never place service-role keys in frontend code.

### P1 — Add automated verification
The package scripts currently include `build`, `lint`, and `typecheck`, but no dedicated test script was found in `package.json`. These checks have not yet been executed in a local runtime.

Action:
- Run install, typecheck, lint, and production build in a controlled local environment.
- Add focused tests for student authentication, balance/transaction integrity, request approval, market redemption, order access, and admin authorization.
- Verify RLS and RPC behavior against a safe development database.

### P2 — Verify deployment and domain
A Vercel deployment URL and custom domain were recorded in earlier project notes, but current deployment status and DNS resolution have not been verified in this audit.

Action:
- Inspect Vercel project linkage, latest deployment, build logs, environment variables, and domain configuration.
- Validate mobile layouts and the main user flows after deployment.

## Audit limitations
- This was a read-only source review using the connected GitHub integration.
- No local dependency installation, build, lint, typecheck, browser test, or video/device test was run.
- No live Supabase schema, data, or logs were inspected because the referenced project was not present in the connected Supabase project list.
- No production code or database data was modified.

## Next execution order
1. Confirm access to the referenced Supabase project.
2. Run local build, lint, and typecheck.
3. Inspect the remaining SchoolCoin component flows and all migration SQL.
4. Reconcile schema/migration history safely.
5. Implement and test fixes on a non-production branch.
6. Review Vercel deployment and production readiness.
