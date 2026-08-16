begin;
create or replace function public.schoolcoin_admin_approve_request(p_request_id uuid,p_approve boolean)
returns boolean
language plpgsql
security definer
set search_path to public, pg_temp
as $$
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
revoke all on function public.schoolcoin_admin_approve_request(uuid,boolean) from public,anon;
grant execute on function public.schoolcoin_admin_approve_request(uuid,boolean) to authenticated;
commit;
