begin;

revoke insert, update, delete on table public.schoolcoin_activities from authenticated;
revoke insert, update, delete on table public.schoolcoin_market_rewards from authenticated;
revoke insert, update, delete on table public.schoolcoin_orders from authenticated;
revoke insert, update, delete on table public.schoolcoin_requests from authenticated;
revoke insert, update, delete on table public.schoolcoin_transactions from authenticated;
revoke insert, update, delete on table public.schoolcoin_students from authenticated;
revoke all on table public.schoolcoin_redemptions from anon, authenticated;
revoke all on table public.schoolcoin_rewards from anon, authenticated;
revoke all on table public.schoolcoin_student_auth_bindings from anon, authenticated;
revoke all on table public.schoolcoin_audit_log from anon, authenticated;

alter function public.schoolcoin_admin_create_student(text,text,text,text) security definer;
alter function public.schoolcoin_admin_create_student(text,text,text,text) set search_path = public, pg_temp;
revoke execute on function public.schoolcoin_admin_create_student(text,text,text,text) from public, anon;
grant execute on function public.schoolcoin_admin_create_student(text,text,text,text) to authenticated;

grant select on table public.schoolcoin_activities to anon, authenticated;
grant select on table public.schoolcoin_market_rewards to anon, authenticated;
grant select on table public.schoolcoin_orders to authenticated;
grant select on table public.schoolcoin_requests to authenticated;
grant select on table public.schoolcoin_transactions to authenticated;

commit;
