# Supabase migration drift

This repository intentionally does not fabricate historical migrations that cannot be recovered exactly.

## Verified live history

The live Supabase project currently records these migrations in `supabase_migrations.schema_migrations`:

- 20260814052749 — `secure_site_data_and_proposals`
- 20260814134055 — `schoolcoin_core`
- 20260814141423 — `enable_pgcrypto_for_schoolcoin_students`
- 20260814141545 — `enable_pgcrypto_for_schoolcoin`
- 20260814141709 — `fix_schoolcoin_crypto_search_path`
- 20260814142240 — `schoolcoin_market_rewards_and_orders`
- 20260814142511 — `schoolcoin_market_redeem_rpc`
- 20260814142736 — `allow_market_transaction_types`
- 20260814142857 — `seed_105_schoolcoin_activities`
- 20260814145445 — `harden_site_rls_and_indexes`
- 20260814154534 — `harden_schoolcoin_orders_access`
- 20260814163852 — `fix_schoolcoin_student_orders_rpc_access`
- 20260815052426 — `prevent_schoolcoin_market_double_spend`
- 20260815052741 — `schoolcoin_security_hardening`
- 20260815053755 — `harden_schoolcoin_function_search_paths`
- 20260815061745 — `schoolcoin_admin_data_api_grants`

## Repository state

The repository contains the currently tracked migrations under `supabase/migrations/`. They are not assumed to be historical equivalents of the live migration records merely because they modify related objects.

## Reconciliation rule

Do not recreate the ten missing historical migrations from memory or inferred schema.

Before future migration work:

1. Compare live object definitions against repository migrations.
2. Recover exact historical migration files from an authoritative Git history/backup if available.
3. If exact history cannot be recovered, establish a separately documented baseline/snapshot strategy before enabling automated migration application against this project.
4. Any new migration must be additive/idempotent where appropriate and must first verify object existence, policies, functions, indexes, triggers and grants.
5. Never drop, truncate, reset or recreate existing production data merely to reconcile migration history.

This file is documentation only. It does not modify the database or migration history.
