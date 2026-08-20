# Supabase migration drift

This repository intentionally does not fabricate historical migrations that cannot be recovered exactly.

## Verified live history — 2026-08-16

The live project records 29 migrations in `supabase_migrations.schema_migrations`:

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
- 20260815133625 — `schoolcoin_student_auth_binding_20260815190000`
- 20260815133654 — `schoolcoin_student_auth_rpc_20260815203000`
- 20260815143934 — `fix_schoolcoin_cross_domain_student_binding`
- 20260815145052 — `add_schoolcoin_admin_create_activity`
- 20260815185052 — `add_activity_repeat_cost`
- 20260816021537 — `production_hardening_schoolcoin_security_and_student_flows`
- 20260816021832 — `enable_realtime_for_site_data`
- 20260816021925 — `restrict_schoolcoin_order_table_writes`
- 20260816022026 — `fix_schoolcoin_approval_security_context`
- 20260816040032 — `harden_schoolcoin_function_grants`
- 20260816040047 — `remove_public_audit_trigger_execute`
- 20260816040705 — `tighten_schoolcoin_direct_table_grants`
- 20260816041825 — `harden_schoolcoin_function_grants`

## Repository state

The Git repository contains only the migrations that are recoverable/tracked in Git plus the new hardening migrations added by this branch. It is **not** safe to fabricate the missing historical SQL from the live schema alone.

## Safe reconciliation rule

1. Recover exact historical migration files from authoritative Git history, backup, or migration artifacts if available.
2. Compare live object definitions against those exact files.
3. If exact history cannot be recovered, establish a documented baseline/snapshot strategy before using automated fresh-environment migration as a production parity guarantee.
4. New migrations must be additive/idempotent where appropriate and must verify objects, policies, functions, indexes, triggers and grants first.
5. Never drop, truncate, reset or recreate production data to reconcile migration history.

This file is documentation only; it does not modify database state.
