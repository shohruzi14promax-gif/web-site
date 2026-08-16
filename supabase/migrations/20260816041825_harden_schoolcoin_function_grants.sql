-- Tighten function execution privileges after the production SchoolCoin audit.
-- Admin activity creation is an authenticated/admin-only RPC; the audit helper is trigger-only.
revoke execute on function public.schoolcoin_admin_create_activity(text, text, integer, integer, boolean) from anon;
revoke execute on function public.schoolcoin_audit_row_change() from public, anon, authenticated;
