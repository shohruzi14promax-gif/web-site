-- Serialize SchoolCoin market redemptions per student to prevent concurrent double spending.
create or replace function public.schoolcoin_market_redeem(p_code text, p_pin text, p_reward_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  s public.schoolcoin_students%rowtype;
  r public.schoolcoin_market_rewards%rowtype;
  bal integer;
  oid uuid;
begin
  select * into s
  from public.schoolcoin_students
  where student_code = upper(trim(p_code)) and active = true
  for update;

  if not found or extensions.crypt(p_pin, s.pin_hash) <> s.pin_hash then
    raise exception 'Kod yoki PIN noto‘g‘ri';
  end if;

  select * into r
  from public.schoolcoin_market_rewards
  where id = p_reward_id and active = true
  for update;

  if not found then raise exception 'Reward topilmadi'; end if;
  if r.stock <= 0 then raise exception 'Reward tugagan'; end if;

  select coalesce(sum(amount), 0)::integer into bal
  from public.schoolcoin_transactions
  where student_id = s.id;

  if bal < r.price then raise exception 'Coin yetarli emas'; end if;

  insert into public.schoolcoin_transactions(student_id, amount, transaction_type, note)
    values(s.id, -r.price, 'reward_redeem', 'Market: ' || r.title);

  update public.schoolcoin_market_rewards
    set stock = stock - 1
    where id = r.id;

  insert into public.schoolcoin_orders(student_id, reward_id, price, status)
    values(s.id, r.id, r.price, 'pending')
    returning id into oid;

  return jsonb_build_object('order_id', oid, 'new_balance', bal - r.price);
end;
$$;
