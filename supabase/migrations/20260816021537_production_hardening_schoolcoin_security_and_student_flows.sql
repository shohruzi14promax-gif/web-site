begin;

drop policy if exists "schoolcoin_public_active_activities" on public.schoolcoin_activities;
create policy "schoolcoin_public_active_activities" on public.schoolcoin_activities for select to anon, authenticated using (active = true);

drop policy if exists "schoolcoin_admin_requests" on public.schoolcoin_requests;
create policy "schoolcoin_admin_requests_select" on public.schoolcoin_requests for select to authenticated using ((select is_admin()));
drop policy if exists "schoolcoin_admin_orders" on public.schoolcoin_orders;
create policy "schoolcoin_admin_orders_select" on public.schoolcoin_orders for select to authenticated using ((select is_admin()));
drop policy if exists "schoolcoin_admin_transactions" on public.schoolcoin_transactions;
create policy "schoolcoin_admin_transactions_select" on public.schoolcoin_transactions for select to authenticated using ((select is_admin()));
create policy "schoolcoin_admin_transactions_insert" on public.schoolcoin_transactions for insert to authenticated with check ((select is_admin()));
drop policy if exists "schoolcoin_admin_students" on public.schoolcoin_students;
create policy "schoolcoin_admin_students_select" on public.schoolcoin_students for select to authenticated using ((select is_admin()));
create policy "schoolcoin_admin_students_insert" on public.schoolcoin_students for insert to authenticated with check ((select is_admin()));
create policy "schoolcoin_admin_students_update" on public.schoolcoin_students for update to authenticated using ((select is_admin())) with check ((select is_admin()));

alter table public.schoolcoin_transactions drop constraint if exists schoolcoin_transactions_student_id_fkey;
alter table public.schoolcoin_transactions add constraint schoolcoin_transactions_student_id_fkey foreign key (student_id) references public.schoolcoin_students(id) on delete restrict;
alter table public.schoolcoin_orders drop constraint if exists schoolcoin_orders_student_id_fkey;
alter table public.schoolcoin_orders add constraint schoolcoin_orders_student_id_fkey foreign key (student_id) references public.schoolcoin_students(id) on delete restrict;
alter table public.schoolcoin_requests drop constraint if exists schoolcoin_requests_student_id_fkey;
alter table public.schoolcoin_requests add constraint schoolcoin_requests_student_id_fkey foreign key (student_id) references public.schoolcoin_students(id) on delete restrict;
alter table public.schoolcoin_redemptions drop constraint if exists schoolcoin_redemptions_student_id_fkey;
alter table public.schoolcoin_redemptions add constraint schoolcoin_redemptions_student_id_fkey foreign key (student_id) references public.schoolcoin_students(id) on delete restrict;

create index if not exists idx_schoolcoin_transactions_student_created on public.schoolcoin_transactions(student_id, created_at desc);
create index if not exists idx_schoolcoin_requests_student_created on public.schoolcoin_requests(student_id, created_at desc);
create index if not exists idx_schoolcoin_requests_student_activity_status_created on public.schoolcoin_requests(student_id, activity_id, status, created_at desc);
create index if not exists idx_schoolcoin_orders_student_created on public.schoolcoin_orders(student_id, created_at desc);
create index if not exists idx_schoolcoin_auth_bindings_student on public.schoolcoin_student_auth_bindings(student_id);

create table if not exists public.schoolcoin_audit_log (
  id uuid primary key default gen_random_uuid(), actor_id uuid, action text not null, target_type text not null,
  target_id uuid, student_id uuid, old_data jsonb, new_data jsonb, reason text, created_at timestamptz not null default now()
);
alter table public.schoolcoin_audit_log enable row level security;
drop policy if exists "schoolcoin_admin_audit_select" on public.schoolcoin_audit_log;
create policy "schoolcoin_admin_audit_select" on public.schoolcoin_audit_log for select to authenticated using ((select is_admin()));
create index if not exists idx_schoolcoin_audit_created on public.schoolcoin_audit_log(created_at desc);
create index if not exists idx_schoolcoin_audit_target on public.schoolcoin_audit_log(target_type, target_id);

create or replace function public.schoolcoin_audit_row_change()
returns trigger language plpgsql security definer set search_path to public, pg_temp as $$
declare old_payload jsonb; new_payload jsonb; v_student_id uuid; v_target_id uuid;
begin
  if tg_op in ('UPDATE','DELETE') then old_payload := to_jsonb(old); if tg_table_name='schoolcoin_students' then old_payload := old_payload - 'pin_hash'; end if; end if;
  if tg_op in ('INSERT','UPDATE') then new_payload := to_jsonb(new); if tg_table_name='schoolcoin_students' then new_payload := new_payload - 'pin_hash'; end if; end if;
  if tg_op='DELETE' then v_target_id := old.id; else v_target_id := new.id; end if;
  if tg_table_name='schoolcoin_students' then if tg_op='DELETE' then v_student_id := old.id; else v_student_id := new.id; end if;
  elsif tg_table_name in ('schoolcoin_transactions','schoolcoin_orders','schoolcoin_requests','schoolcoin_redemptions') then if tg_op='DELETE' then v_student_id := old.student_id; else v_student_id := new.student_id; end if; end if;
  insert into public.schoolcoin_audit_log(actor_id,action,target_type,target_id,student_id,old_data,new_data) values(auth.uid(),lower(tg_op),tg_table_name,v_target_id,v_student_id,old_payload,new_payload);
  return coalesce(new, old);
end; $$;

drop trigger if exists trg_schoolcoin_audit_activities on public.schoolcoin_activities;
create trigger trg_schoolcoin_audit_activities after insert or update or delete on public.schoolcoin_activities for each row execute function public.schoolcoin_audit_row_change();
drop trigger if exists trg_schoolcoin_audit_rewards on public.schoolcoin_market_rewards;
create trigger trg_schoolcoin_audit_rewards after insert or update or delete on public.schoolcoin_market_rewards for each row execute function public.schoolcoin_audit_row_change();
drop trigger if exists trg_schoolcoin_audit_orders on public.schoolcoin_orders;
create trigger trg_schoolcoin_audit_orders after insert or update or delete on public.schoolcoin_orders for each row execute function public.schoolcoin_audit_row_change();
drop trigger if exists trg_schoolcoin_audit_requests on public.schoolcoin_requests;
create trigger trg_schoolcoin_audit_requests after insert or update or delete on public.schoolcoin_requests for each row execute function public.schoolcoin_audit_row_change();
drop trigger if exists trg_schoolcoin_audit_transactions on public.schoolcoin_transactions;
create trigger trg_schoolcoin_audit_transactions after insert or update or delete on public.schoolcoin_transactions for each row execute function public.schoolcoin_audit_row_change();
drop trigger if exists trg_schoolcoin_audit_students on public.schoolcoin_students;
create trigger trg_schoolcoin_audit_students after insert or update or delete on public.schoolcoin_students for each row execute function public.schoolcoin_audit_row_change();

create or replace function public.schoolcoin_admin_student_balances()
returns table(id uuid, student_code text, full_name text, class_name text, active boolean, balance integer)
language sql stable security definer set search_path to public, pg_temp as $$
  select s.id,s.student_code,s.full_name,s.class_name,s.active,coalesce(sum(t.amount),0)::integer
  from public.schoolcoin_students s left join public.schoolcoin_transactions t on t.student_id=s.id
  where (select is_admin()) group by s.id,s.student_code,s.full_name,s.class_name,s.active order by s.class_name,s.full_name;
$$;
revoke all on function public.schoolcoin_admin_student_balances() from public, anon;
grant execute on function public.schoolcoin_admin_student_balances() to authenticated;

create or replace function public.schoolcoin_student_transactions()
returns table(amount integer, transaction_type text, note text, created_at timestamptz)
language sql stable security definer set search_path to public, pg_temp as $$
  select t.amount,t.transaction_type,t.note,t.created_at from public.schoolcoin_transactions t
  join public.schoolcoin_student_auth_bindings b on b.student_id=t.student_id join public.schoolcoin_students s on s.id=t.student_id and s.active=true
  where b.auth_user_id=auth.uid() and auth.role()='authenticated' order by t.created_at desc;
$$;
revoke all on function public.schoolcoin_student_transactions() from public, anon;
grant execute on function public.schoolcoin_student_transactions() to authenticated;

create or replace function public.schoolcoin_student_requests()
returns table(activity_name text, status text, created_at timestamptz, evidence_url text, note text, reviewed_at timestamptz)
language sql stable security definer set search_path to public, pg_temp as $$
  select a.name,q.status,q.created_at,q.evidence_url,q.note,q.reviewed_at from public.schoolcoin_requests q
  join public.schoolcoin_activities a on a.id=q.activity_id join public.schoolcoin_student_auth_bindings b on b.student_id=q.student_id join public.schoolcoin_students s on s.id=q.student_id and s.active=true
  where b.auth_user_id=auth.uid() and auth.role()='authenticated' order by q.created_at desc;
$$;
revoke all on function public.schoolcoin_student_requests() from public, anon;
grant execute on function public.schoolcoin_student_requests() to authenticated;

create or replace function public.schoolcoin_student_activity_progress()
returns table(activity_id uuid, approved_count integer, pending_count integer, max_per_month integer)
language sql stable security definer set search_path to public, pg_temp as $$
  select a.id,
    count(*) filter (where q.status='approved' and q.created_at>=date_trunc('month',now()))::integer,
    count(*) filter (where q.status='pending')::integer,
    a.max_per_month
  from public.schoolcoin_activities a
  left join public.schoolcoin_student_auth_bindings b on b.auth_user_id=auth.uid()
  left join public.schoolcoin_requests q on q.activity_id=a.id and q.student_id=b.student_id
  where a.active=true and auth.uid() is not null and auth.role()='authenticated'
  group by a.id,a.max_per_month;
$$;
revoke all on function public.schoolcoin_student_activity_progress() from public, anon;
grant execute on function public.schoolcoin_student_activity_progress() to authenticated;

create or replace function public.schoolcoin_admin_update_order_status(p_order_id uuid,p_status text,p_reason text default null)
returns boolean language plpgsql security definer set search_path to public, pg_temp as $$
declare v_old public.schoolcoin_orders; v_new public.schoolcoin_orders; v_status text:=lower(trim(p_status));
begin
  if not (select is_admin()) then raise exception 'Admin huquqi kerak'; end if;
  if v_status not in ('pending','approved','ready','delivered','rejected') then raise exception 'Noto‘g‘ri order status'; end if;
  select * into v_old from public.schoolcoin_orders where id=p_order_id for update;
  if not found then raise exception 'Order topilmadi'; end if;
  update public.schoolcoin_orders set status=v_status,updated_at=now() where id=p_order_id returning * into v_new;
  insert into public.schoolcoin_audit_log(actor_id,action,target_type,target_id,student_id,old_data,new_data,reason) values(auth.uid(),'status_change','schoolcoin_orders',v_old.id,v_old.student_id,to_jsonb(v_old),to_jsonb(v_new),nullif(trim(p_reason),''));
  return true;
end; $$;
revoke all on function public.schoolcoin_admin_update_order_status(uuid,text,text) from public, anon;
grant execute on function public.schoolcoin_admin_update_order_status(uuid,text,text) to authenticated;

create or replace function public.schoolcoin_admin_adjust_balance(p_student_id uuid,p_amount integer,p_reason text)
returns uuid language plpgsql security definer set search_path to public, pg_temp as $$
declare v_tx uuid; v_student public.schoolcoin_students;
begin
  if not (select is_admin()) then raise exception 'Admin huquqi kerak'; end if;
  if p_amount=0 then raise exception 'Adjustment 0 bo‘lishi mumkin emas'; end if;
  if nullif(trim(p_reason),'') is null then raise exception 'Adjustment sababi talab qilinadi'; end if;
  select * into v_student from public.schoolcoin_students where id=p_student_id for update;
  if not found then raise exception 'Student topilmadi'; end if;
  insert into public.schoolcoin_transactions(student_id,amount,transaction_type,note,created_by) values(v_student.id,p_amount,'adjustment',trim(p_reason),auth.uid()) returning id into v_tx;
  return v_tx;
end; $$;
revoke all on function public.schoolcoin_admin_adjust_balance(uuid,integer,text) from public, anon;
grant execute on function public.schoolcoin_admin_adjust_balance(uuid,integer,text) to authenticated;

create or replace function public.schoolcoin_admin_approve_request(p_request_id uuid,p_approve boolean)
returns boolean language plpgsql set search_path to public, pg_temp as $$
declare q public.schoolcoin_requests; a public.schoolcoin_activities; s public.schoolcoin_students; v_prior_approved integer; v_month_approved integer; v_balance integer; v_repeat_cost integer;
begin
  if not (select is_admin()) then raise exception 'Admin huquqi kerak'; end if;
  select * into q from public.schoolcoin_requests where id=p_request_id for update;
  if not found or q.status<>'pending' then raise exception 'So‘rov topilmadi yoki allaqachon ko‘rib chiqilgan'; end if;
  if p_approve then
    select * into s from public.schoolcoin_students where id=q.student_id and active=true for update;
    if not found then raise exception 'Student topilmadi yoki faol emas'; end if;
    select * into a from public.schoolcoin_activities where id=q.activity_id for update;
    if not found or not a.active then raise exception 'Faoliyat topilmadi yoki faol emas'; end if;
    if a.requires_evidence and nullif(trim(coalesce(q.evidence_url,'')),'') is null then raise exception 'Bu faoliyat uchun dalil (evidence) majburiy'; end if;
    select count(*)::integer into v_month_approved from public.schoolcoin_requests where student_id=q.student_id and activity_id=q.activity_id and status='approved' and created_at>=date_trunc('month',now());
    if a.max_per_month is not null and v_month_approved>=a.max_per_month then raise exception 'Bu faoliyat uchun oylik limit tugagan (% ta)',a.max_per_month; end if;
    select count(*)::integer into v_prior_approved from public.schoolcoin_requests where student_id=q.student_id and activity_id=q.activity_id and status='approved' and id<>q.id;
    v_repeat_cost:=case when v_prior_approved=0 and a.first_completion_free then 0 else a.repeat_cost end;
    if v_repeat_cost>0 then
      select coalesce(sum(amount),0)::integer into v_balance from public.schoolcoin_transactions where student_id=q.student_id;
      if v_balance<v_repeat_cost then raise exception 'Qayta activity uchun % SchoolCoin kerak. Hozirgi balans: %',v_repeat_cost,v_balance; end if;
      insert into public.schoolcoin_transactions(student_id,amount,transaction_type,reference_id,note,created_by) values(q.student_id,-v_repeat_cost,'spend',q.id,'Activity qayta bajarish to‘lovi: '||a.name,auth.uid());
    end if;
    insert into public.schoolcoin_transactions(student_id,amount,transaction_type,reference_id,note,created_by) values(q.student_id,a.coin_reward,'earn',q.id,a.name,auth.uid());
    update public.schoolcoin_requests set status='approved',reviewed_by=auth.uid(),reviewed_at=now() where id=q.id;
  else
    update public.schoolcoin_requests set status='rejected',reviewed_by=auth.uid(),reviewed_at=now() where id=q.id;
  end if;
  return true;
end; $$;

create or replace function public.schoolcoin_submit_request(p_activity_id uuid,p_evidence_url text default null,p_note text default null)
returns uuid language plpgsql security definer set search_path to public, extensions, pg_temp as $$
declare v_student_id uuid; v_request_id uuid; v_requires_evidence boolean;
begin
  if auth.uid() is null or auth.role()<>'authenticated' then raise exception 'Authentication required'; end if;
  select b.student_id into v_student_id from public.schoolcoin_student_auth_bindings b join public.schoolcoin_students s on s.id=b.student_id and s.active=true where b.auth_user_id=auth.uid();
  if v_student_id is null then raise exception 'Student identity is not bound'; end if;
  select requires_evidence into v_requires_evidence from public.schoolcoin_activities where id=p_activity_id and active=true;
  if not found then raise exception 'Faoliyat topilmadi'; end if;
  if v_requires_evidence and nullif(trim(coalesce(p_evidence_url,'')),'') is null then raise exception 'Bu faoliyat uchun dalil (evidence) majburiy'; end if;
  insert into public.schoolcoin_requests(student_id,activity_id,evidence_url,note) values(v_student_id,p_activity_id,nullif(trim(p_evidence_url),''),nullif(trim(p_note),'')) returning id into v_request_id;
  return v_request_id;
end; $$;

revoke execute on function public.schoolcoin_student_login(text,text) from anon, authenticated;
revoke execute on function public.schoolcoin_student_orders(text,text) from anon, authenticated;
revoke execute on function public.schoolcoin_submit_request(text,text,uuid,text,text) from anon, authenticated;
revoke execute on function public.schoolcoin_market_redeem(text,text,uuid) from anon, authenticated;
revoke execute on function public.schoolcoin_student_orders() from public, anon;
grant execute on function public.schoolcoin_student_orders() to authenticated;
revoke execute on function public.schoolcoin_market_redeem(uuid) from public, anon;
grant execute on function public.schoolcoin_market_redeem(uuid) to authenticated;
revoke execute on function public.schoolcoin_current_student() from public, anon;
grant execute on function public.schoolcoin_current_student() to authenticated;
revoke execute on function public.schoolcoin_bind_student(text,text) from public, anon;
grant execute on function public.schoolcoin_bind_student(text,text) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('schoolcoin-evidence','schoolcoin-evidence',false,5242880,array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict(id) do nothing;

drop policy if exists "schoolcoin_evidence_upload_own_folder" on storage.objects;
create policy "schoolcoin_evidence_upload_own_folder" on storage.objects for insert to authenticated with check (bucket_id='schoolcoin-evidence' and (select (auth.jwt()->>'is_anonymous')::boolean)=true and (storage.foldername(name))[1]=(select auth.uid()::text));
drop policy if exists "schoolcoin_evidence_read_own_or_admin" on storage.objects;
create policy "schoolcoin_evidence_read_own_or_admin" on storage.objects for select to authenticated using (bucket_id='schoolcoin-evidence' and ((select is_admin()) or (storage.foldername(name))[1]=(select auth.uid()::text)));
drop policy if exists "schoolcoin_evidence_update_own_or_admin" on storage.objects;
create policy "schoolcoin_evidence_update_own_or_admin" on storage.objects for update to authenticated using (bucket_id='schoolcoin-evidence' and ((select is_admin()) or (storage.foldername(name))[1]=(select auth.uid()::text))) with check (bucket_id='schoolcoin-evidence' and ((select is_admin()) or (storage.foldername(name))[1]=(select auth.uid()::text)));
drop policy if exists "schoolcoin_evidence_delete_own_or_admin" on storage.objects;
create policy "schoolcoin_evidence_delete_own_or_admin" on storage.objects for delete to authenticated using (bucket_id='schoolcoin-evidence' and ((select is_admin()) or (storage.foldername(name))[1]=(select auth.uid()::text)));

commit;
