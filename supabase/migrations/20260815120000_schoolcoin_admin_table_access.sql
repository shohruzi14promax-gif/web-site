-- SchoolCoin admin access: explicit table grants + RLS for authenticated admins.
-- No existing data is modified or deleted.

grant select, insert, update, delete on public.schoolcoin_activities to authenticated;
grant select, insert, update, delete on public.schoolcoin_market_rewards to authenticated;
grant select, insert, update, delete on public.schoolcoin_students to authenticated;
grant select, insert, update, delete on public.schoolcoin_requests to authenticated;
grant select, insert, update, delete on public.schoolcoin_orders to authenticated;
grant select, insert, update, delete on public.schoolcoin_transactions to authenticated;

alter table public.schoolcoin_activities enable row level security;
alter table public.schoolcoin_market_rewards enable row level security;
alter table public.schoolcoin_students enable row level security;
alter table public.schoolcoin_requests enable row level security;
alter table public.schoolcoin_orders enable row level security;
alter table public.schoolcoin_transactions enable row level security;

-- Replace only admin policies; student-facing RPCs remain the controlled public interface.
drop policy if exists schoolcoin_admin_activities on public.schoolcoin_activities;
create policy schoolcoin_admin_activities on public.schoolcoin_activities
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists schoolcoin_admin_market_rewards on public.schoolcoin_market_rewards;
create policy schoolcoin_admin_market_rewards on public.schoolcoin_market_rewards
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists schoolcoin_admin_students on public.schoolcoin_students;
create policy schoolcoin_admin_students on public.schoolcoin_students
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists schoolcoin_admin_requests on public.schoolcoin_requests;
create policy schoolcoin_admin_requests on public.schoolcoin_requests
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists schoolcoin_admin_orders on public.schoolcoin_orders;
create policy schoolcoin_admin_orders on public.schoolcoin_orders
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists schoolcoin_admin_transactions on public.schoolcoin_transactions;
create policy schoolcoin_admin_transactions on public.schoolcoin_transactions
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
