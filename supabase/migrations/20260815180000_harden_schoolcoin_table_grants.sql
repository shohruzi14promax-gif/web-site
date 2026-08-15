-- Defense-in-depth grant hardening for the existing SchoolCoin RLS model.
-- This migration changes privileges only; it does not alter or delete data.
-- Student-facing reads/writes continue through the existing RPC surface.

-- Private SchoolCoin tables are never directly accessible to anon.
revoke all privileges on table public.schoolcoin_students from anon;
revoke all privileges on table public.schoolcoin_requests from anon;
revoke all privileges on table public.schoolcoin_transactions from anon;
revoke all privileges on table public.schoolcoin_rewards from anon;
revoke all privileges on table public.schoolcoin_redemptions from anon;
revoke all privileges on table public.schoolcoin_orders from anon;

-- Public catalog tables keep read-only access for the student UI.
revoke insert, update, delete, truncate, references, trigger on table public.schoolcoin_activities from anon;
revoke insert, update, delete, truncate, references, trigger on table public.schoolcoin_market_rewards from anon;

-- Browser clients do not need schema-management privileges on SchoolCoin tables.
revoke references, trigger, truncate on table public.schoolcoin_students from authenticated;
revoke references, trigger, truncate on table public.schoolcoin_requests from authenticated;
revoke references, trigger, truncate on table public.schoolcoin_transactions from authenticated;
revoke references, trigger, truncate on table public.schoolcoin_rewards from authenticated;
revoke references, trigger, truncate on table public.schoolcoin_redemptions from authenticated;
revoke references, trigger, truncate on table public.schoolcoin_orders from authenticated;
revoke references, trigger, truncate on table public.schoolcoin_activities from authenticated;
revoke references, trigger, truncate on table public.schoolcoin_market_rewards from authenticated;
