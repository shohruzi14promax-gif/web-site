grant select on table public.schoolcoin_students to postgres;
grant select on table public.schoolcoin_orders to postgres;
grant select on table public.schoolcoin_market_rewards to postgres;
grant execute on function public.schoolcoin_student_orders(text, text) to anon, authenticated;

create or replace function public.schoolcoin_student_orders(p_code text, p_pin text)
returns table(id uuid, status text, price integer, created_at timestamptz, reward_title text)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  s public.schoolcoin_students;
begin
  select * into s
  from public.schoolcoin_students
  where student_code = upper(trim(p_code)) and active = true;

  if not found or extensions.crypt(p_pin, s.pin_hash) <> s.pin_hash then
    raise exception 'Kod yoki PIN noto‘g‘ri';
  end if;

  return query
  select o.id, o.status, o.price, o.created_at, r.title
  from public.schoolcoin_orders o
  join public.schoolcoin_market_rewards r on r.id = o.reward_id
  where o.student_id = s.id
  order by o.created_at desc;
end;
$$;

revoke select on table public.schoolcoin_students from anon, authenticated;
revoke select on table public.schoolcoin_orders from anon, authenticated;
revoke select on table public.schoolcoin_market_rewards from anon;
