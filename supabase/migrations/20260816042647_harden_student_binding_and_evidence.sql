begin;

create or replace function public.schoolcoin_bind_student(p_code text,p_pin text)
returns jsonb
language plpgsql
security definer
set search_path to public, extensions, pg_temp
as $$
declare
  v_auth_user_id uuid := auth.uid();
  v_student public.schoolcoin_students%rowtype;
  v_existing_auth uuid;
begin
  if v_auth_user_id is null or auth.role() <> 'authenticated' then raise exception 'Authentication required'; end if;
  if coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) is not true then raise exception 'Student binding requires an anonymous Auth session'; end if;
  if nullif(trim(p_code), '') is null or nullif(trim(p_pin), '') is null then raise exception 'Kod va PIN talab qilinadi'; end if;
  select * into v_student from public.schoolcoin_students where student_code = upper(trim(p_code)) and active = true for update;
  if not found or extensions.crypt(p_pin, v_student.pin_hash) <> v_student.pin_hash then raise exception 'Kod yoki PIN noto‘g‘ri'; end if;
  select auth_user_id into v_existing_auth from public.schoolcoin_student_auth_bindings where student_id = v_student.id;
  if v_existing_auth is not null and v_existing_auth <> v_auth_user_id then raise exception 'Bu student allaqachon boshqa Auth sessiyasiga bog‘langan'; end if;
  if exists (select 1 from public.schoolcoin_student_auth_bindings where auth_user_id = v_auth_user_id and student_id <> v_student.id) then raise exception 'Bu Auth sessiyasi boshqa studentga bog‘langan'; end if;
  insert into public.schoolcoin_student_auth_bindings(auth_user_id, student_id) values (v_auth_user_id, v_student.id)
  on conflict (auth_user_id) do update set student_id = excluded.student_id;
  return jsonb_build_object('id', v_student.id, 'student_code', v_student.student_code, 'full_name', v_student.full_name, 'class_name', v_student.class_name);
end;
$$;

revoke all on function public.schoolcoin_bind_student(text,text) from public, anon;
grant execute on function public.schoolcoin_bind_student(text,text) to authenticated;

create or replace function public.schoolcoin_submit_request(p_activity_id uuid,p_evidence_url text default null,p_note text default null)
returns uuid
language plpgsql
security definer
set search_path to public, extensions, pg_temp
as $$
declare
  v_student_id uuid;
  v_request_id uuid;
  v_requires_evidence boolean;
  v_evidence_path text := nullif(trim(p_evidence_url),'');
begin
  if auth.uid() is null or auth.role() <> 'authenticated' then raise exception 'Authentication required'; end if;
  select b.student_id into v_student_id from public.schoolcoin_student_auth_bindings b join public.schoolcoin_students s on s.id=b.student_id and s.active=true where b.auth_user_id=auth.uid();
  if v_student_id is null then raise exception 'Student identity is not bound'; end if;
  select requires_evidence into v_requires_evidence from public.schoolcoin_activities where id=p_activity_id and active=true;
  if not found then raise exception 'Faoliyat topilmadi'; end if;
  if v_requires_evidence then
    if v_evidence_path is null or position((auth.uid()::text || '/') in v_evidence_path) <> 1 then raise exception 'Bu faoliyat uchun haqiqiy evidence talab qilinadi'; end if;
    if not exists (select 1 from storage.objects o where o.bucket_id='schoolcoin-evidence' and o.name=v_evidence_path and o.owner_id=auth.uid()) then raise exception 'Evidence fayli topilmadi yoki bu studentga tegishli emas'; end if;
  end if;
  insert into public.schoolcoin_requests(student_id,activity_id,evidence_url,note) values(v_student_id,p_activity_id,v_evidence_path,nullif(trim(p_note),'')) returning id into v_request_id;
  return v_request_id;
end;
$$;

revoke all on function public.schoolcoin_submit_request(uuid,text,text) from public, anon;
grant execute on function public.schoolcoin_submit_request(uuid,text,text) to authenticated;

commit;
