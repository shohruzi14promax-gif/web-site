-- SchoolCoin security hardening: retire the legacy redemption RPC and align
-- the transaction-type constraint with the production market redemption flow.

revoke execute on function public.schoolcoin_redeem(text, text, uuid) from public, anon, authenticated;

alter table public.schoolcoin_transactions
  drop constraint if exists schoolcoin_transactions_transaction_type_check;

alter table public.schoolcoin_transactions
  add constraint schoolcoin_transactions_transaction_type_check
  check (transaction_type = any (array[
    'earn'::text,
    'spend'::text,
    'adjustment'::text,
    'reward'::text,
    'purchase'::text,
    'reward_redeem'::text
  ]));

-- Keep the active market RPC explicitly callable by the student flows only.
revoke execute on function public.schoolcoin_market_redeem(text, text, uuid) from public;
grant execute on function public.schoolcoin_market_redeem(text, text, uuid) to anon, authenticated;

-- Make the intended student RPC surface explicit rather than relying on PUBLIC defaults.
revoke execute on function public.schoolcoin_student_login(text, text) from public;
grant execute on function public.schoolcoin_student_login(text, text) to anon, authenticated;

revoke execute on function public.schoolcoin_student_orders(text, text) from public;
grant execute on function public.schoolcoin_student_orders(text, text) to anon, authenticated;

revoke execute on function public.schoolcoin_submit_request(text, text, uuid, text, text) from public;
grant execute on function public.schoolcoin_submit_request(text, text, uuid, text, text) to anon, authenticated;
