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
- Vercel project, domain records, preview deployment and build output

## Verified architecture
- Frontend: React 18 + TypeScript + Vite
- Styling: Tailwind CSS
- Backend client: Supabase JS
- Major modules include school information pages, admin dashboard, SchoolCoin student/admin interface, analytics, and school content data.
- The repository includes Supabase SQL migrations and migration-drift documentation.

## Deployment verification
- Vercel project: `web-site`
- Production aliases include `web-site-rosy-pi.vercel.app`, `jizzax1imi.uz`, and `www.jizzax1imi.uz`.
- Both custom domains are marked verified in Vercel; apex domain redirects to `www`.
- Existing production deployment inspected: `READY`.
- Audit branch preview deployment: `READY`, URL `web-site-git-audit-school-website-schoolcoin-2026-11-23-aha7.vercel.app`.
- The preview build transformed 1,566 modules and completed successfully.
- Build warning: JavaScript chunk is 503.69 kB after minification (over Vite's 500 kB warning threshold); code splitting/manual chunks are recommended.
- Build also reported outdated Browserslist data and an npm install-script approval warning for esbuild.
- This preview build verifies the Vite production build only; it does not prove browser workflows, Supabase connectivity, RLS, or typecheck/lint success.

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
The package scripts currently include `build`, `lint`, and `typecheck`, but no dedicated test script was found in `package.json`.

Action:
- Run install, typecheck, lint, and production build in a controlled local environment.
- Add focused tests for student authentication, balance/transaction integrity, request approval, market redemption, order access, and admin authorization.
- Verify RLS and RPC behavior against a safe development database.

### P2 — Performance and deployment polish
- Split large JavaScript chunks and lazy-load major sections where appropriate.
- Refresh Browserslist data after reviewing lockfile impact.
- Review the esbuild install-script approval warning and dependency supply-chain policy.
- Verify mobile layouts and the main user flows.

## Audit limitations
- This was a source review using the connected GitHub integration plus Vercel metadata/build logs.
- No local dependency installation, standalone lint, typecheck, browser test, or mobile-device test was run.
- No live Supabase schema, data, or logs were inspected because the referenced project was not present in the connected Supabase project list.
- No production code or database data was modified. Only this audit document was committed to a separate Git branch.

## Next execution order
1. Confirm access to the referenced Supabase project.
2. Run local lint and typecheck; add focused tests.
3. Inspect remaining SchoolCoin flows and all migration SQL.
4. Reconcile schema/migration history safely.
5. Implement fixes on the non-production branch.
6. Validate preview workflows, then review production readiness.
