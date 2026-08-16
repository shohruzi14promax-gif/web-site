begin;

-- Repair the student dashboard RPC surface used by the hardened frontend.
create or replace function public.schoolcoin_student_activity_progress()
returns table(activity_id uuid, approved_count integer, pending_count integer, max_per_month integer)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  with identity as (
    select b.student_id
    from public.schoolcoin_student_auth_bindings b
    join public.schoolcoin_students s on s.id = b.student_id and s.active = true
    where b.auth_user_id = auth.uid()
      and auth.role() = 'authenticated'
      and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) is true
  )
  select
    a.id,
    count(*) filter (where q.status = 'approved' and q.created_at >= date_trunc('month', now()))::integer as approved_count,
    count(*) filter (where q.status = 'pending')::integer as pending_count,
    a.max_per_month
  from public.schoolcoin_activities a
  cross join identity i
  left join public.schoolcoin_requests q on q.activity_id = a.id and q.student_id = i.student_id
  where a.active = true
  group by a.id, a.max_per_month
  order by a.category, a.name;
$$;

revoke execute on function public.schoolcoin_student_activity_progress() from public, anon;
grant execute on function public.schoolcoin_student_activity_progress() to authenticated;

-- Harden request creation: prevent duplicate pending submissions and stop new
-- submissions once the monthly approved/pending cap is already occupied.
create or replace function public.schoolcoin_submit_request(
  p_activity_id uuid,
  p_evidence_url text default null,
  p_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_student_id uuid;
  v_request_id uuid;
  v_requires_evidence boolean;
  v_max_per_month integer;
  v_month_count integer;
  v_pending_exists boolean;
  v_evidence_path text := nullif(trim(p_evidence_url), '');
begin
  if auth.uid() is null or auth.role() <> 'authenticated' then raise exception 'Authentication required'; end if;
  if coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) is not true then raise exception 'Student authentication required'; end if;

  select b.student_id into v_student_id
  from public.schoolcoin_student_auth_bindings b
  join public.schoolcoin_students s on s.id = b.student_id and s.active = true
  where b.auth_user_id = auth.uid();
  if v_student_id is null then raise exception 'Student identity is not bound'; end if;

  select requires_evidence, max_per_month into v_requires_evidence, v_max_per_month
  from public.schoolcoin_activities where id = p_activity_id and active = true;
  if not found then raise exception 'Faoliyat topilmadi'; end if;

  select exists (
    select 1 from public.schoolcoin_requests q
    where q.student_id = v_student_id and q.activity_id = p_activity_id and q.status = 'pending'
  ) into v_pending_exists;
  if v_pending_exists then raise exception 'Bu faoliyat uchun kutayotgan so‘rovingiz allaqachon mavjud'; end if;

  if v_max_per_month is not null then
    select count(*)::integer into v_month_count
    from public.schoolcoin_requests q
    where q.student_id = v_student_id and q.activity_id = p_activity_id
      and q.status in ('approved','pending')
      and q.created_at >= date_trunc('month', now());
    if v_month_count >= v_max_per_month then raise exception 'Bu faoliyat uchun oylik limit tugagan (% ta)', v_max_per_month; end if;
  end if;

  if v_requires_evidence then
    if v_evidence_path is null or position((auth.uid()::text || '/') in v_evidence_path) <> 1 then
      raise exception 'Bu faoliyat uchun haqiqiy evidence talab qilinadi';
    end if;
    if not exists (
      select 1 from storage.objects o
      where o.bucket_id = 'schoolcoin-evidence' and o.name = v_evidence_path and o.owner_id = auth.uid()
    ) then
      raise exception 'Evidence fayli topilmadi yoki bu studentga tegishli emas';
    end if;
  end if;

  insert into public.schoolcoin_requests(student_id, activity_id, evidence_url, note)
  values (v_student_id, p_activity_id, v_evidence_path, nullif(trim(p_note), ''))
  returning id into v_request_id;
  return v_request_id;
end;
$$;

revoke execute on function public.schoolcoin_submit_request(uuid,text,text) from public, anon;
grant execute on function public.schoolcoin_submit_request(uuid,text,text) to authenticated;

-- Anonymous/authenticated clients never need structural table privileges such
-- as TRUNCATE, TRIGGER or REFERENCES, and must not receive direct financial
-- mutation privileges. Privileged changes go through SECURITY DEFINER RPCs.
revoke insert, update, delete, truncate, references, trigger on table public.schoolcoin_activities from anon, authenticated;
revoke insert, update, delete, truncate, references, trigger on table public.schoolcoin_market_rewards from anon, authenticated;
revoke insert, update, delete, truncate, references, trigger on table public.schoolcoin_orders from anon, authenticated;
revoke insert, update, delete, truncate, references, trigger on table public.schoolcoin_requests from anon, authenticated;
revoke insert, update, delete, truncate, references, trigger on table public.schoolcoin_transactions from anon, authenticated;
revoke insert, update, delete, truncate, references, trigger on table public.schoolcoin_students from anon, authenticated;
revoke all on table public.schoolcoin_redemptions from anon, authenticated;
revoke all on table public.schoolcoin_rewards from anon, authenticated;
revoke all on table public.schoolcoin_student_auth_bindings from anon, authenticated;
revoke all on table public.schoolcoin_audit_log from anon, authenticated;

grant select on table public.schoolcoin_activities to anon, authenticated;
grant select on table public.schoolcoin_market_rewards to anon, authenticated;
grant select on table public.schoolcoin_orders to authenticated;
grant select on table public.schoolcoin_requests to authenticated;
grant select on table public.schoolcoin_transactions to authenticated;
grant select on table public.schoolcoin_students to authenticated;

commit;
