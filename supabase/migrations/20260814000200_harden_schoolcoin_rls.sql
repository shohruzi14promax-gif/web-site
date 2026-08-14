-- Keep the SchoolCoin data model intact while removing unnecessary SECURITY DEFINER exposure.
-- Admin table policies run only for authenticated admins and cache the JWT check per statement.

create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select coalesce((auth.jwt()->'app_metadata'->>'role') = 'admin', false);
$$;

alter policy "schoolcoin_admin_activities" on public.schoolcoin_activities
  to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
alter policy "schoolcoin_admin_redemptions" on public.schoolcoin_redemptions
  to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
alter policy "schoolcoin_admin_requests" on public.schoolcoin_requests
  to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
alter policy "schoolcoin_admin_rewards" on public.schoolcoin_rewards
  to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
alter policy "schoolcoin_admin_students" on public.schoolcoin_students
  to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
alter policy "schoolcoin_admin_transactions" on public.schoolcoin_transactions
  to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
alter policy "schoolcoin admin orders" on public.schoolcoin_orders
  to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

revoke execute on function public.schoolcoin_admin_approve_request(uuid, boolean) from public;
grant execute on function public.schoolcoin_admin_approve_request(uuid, boolean) to authenticated;
revoke execute on function public.schoolcoin_admin_create_student(text, text, text, text) from public;
grant execute on function public.schoolcoin_admin_create_student(text, text, text, text) to authenticated;

create or replace function public.schoolcoin_admin_approve_request(p_request_id uuid, p_approve boolean)
returns boolean
language plpgsql
security invoker
set search_path = public, extensions
as $$
declare
  q public.schoolcoin_requests;
  a public.schoolcoin_activities;
begin
  if not public.is_admin() then raise exception 'Admin huquqi kerak'; end if;
  select * into q from public.schoolcoin_requests where id=p_request_id for update;
  if not found or q.status <> 'pending' then raise exception 'So‘rov topilmadi yoki allaqachon ko‘rib chiqilgan'; end if;
  if p_approve then
    select * into a from public.schoolcoin_activities where id=q.activity_id;
    insert into public.schoolcoin_transactions(student_id,amount,transaction_type,reference_id,note,created_by)
      values(q.student_id,a.coin_reward,'earn',q.id,a.name,auth.uid());
    update public.schoolcoin_requests
      set status='approved', reviewed_by=auth.uid(), reviewed_at=now()
      where id=q.id;
  else
    update public.schoolcoin_requests
      set status='rejected', reviewed_by=auth.uid(), reviewed_at=now()
      where id=q.id;
  end if;
  return true;
end;
$$;

create or replace function public.schoolcoin_admin_create_student(p_code text, p_full_name text, p_class text, p_pin text)
returns uuid
language plpgsql
security invoker
set search_path = public, extensions
as $$
declare
  sid uuid;
begin
  if not public.is_admin() then raise exception 'Admin huquqi kerak'; end if;
  insert into public.schoolcoin_students(student_code,full_name,class_name,pin_hash)
    values(upper(trim(p_code)),trim(p_full_name),trim(p_class),extensions.crypt(p_pin,extensions.gen_salt('bf')))
    returning id into sid;
  return sid;
end;
$$;
