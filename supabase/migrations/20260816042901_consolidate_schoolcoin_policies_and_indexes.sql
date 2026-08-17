begin;

drop policy if exists schoolcoin_admin_activities on public.schoolcoin_activities;
drop policy if exists schoolcoin_public_active_activities on public.schoolcoin_activities;
create policy schoolcoin_activities_select on public.schoolcoin_activities
for select to anon, authenticated
using (active = true or (select is_admin()));

drop index if exists public.idx_schoolcoin_auth_bindings_student;
drop index if exists public.idx_schoolcoin_transactions_student_created;

commit;
