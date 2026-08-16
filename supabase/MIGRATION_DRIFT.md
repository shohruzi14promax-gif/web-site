# Supabase migration drift

This repository intentionally does not fabricate historical migrations that cannot be recovered exactly.

## Verified live history — 2026-08-16

The live project records 30 migrations in `supabase_migrations.schema_migrations`.

The historical sequence through `20260816022026` is preserved as previously documented. The additional live hardening migrations verified after that point are:

- 20260816040032 — `harden_schoolcoin_function_grants`
- 20260816040047 — `remove_public_audit_trigger_execute`
- 20260816040705 — `tighten_schoolcoin_direct_table_grants`
- 20260816041825 — `harden_schoolcoin_function_grants`
- 20260816042647 — `harden_student_binding_and_evidence`

## Current verification

The live migration history and the branch now contain the newly applied `20260816042647_harden_student_binding_and_evidence.sql` migration with the same version/name. No production reset or data recreation was used.

## Historical repository drift

The repository still does not contain exact SQL for every older live migration. It is **not** safe to fabricate missing historical SQL from the current schema alone.

## Safe reconciliation rule

1. Recover exact historical migration files from authoritative Git history, backup, or migration artifacts if available.
2. Compare live object definitions against those exact files.
3. If exact history cannot be recovered, establish a documented baseline/snapshot strategy before using automated fresh-environment migration as a production parity guarantee.
4. New migrations must be additive/idempotent where appropriate and must verify objects, policies, functions, indexes, triggers and grants first.
5. Never drop, truncate, reset or recreate production data to reconcile migration history.

This file is documentation only; it does not modify database state.
