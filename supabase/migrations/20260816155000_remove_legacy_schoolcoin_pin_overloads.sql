-- Remove legacy PIN-only overloads that bypass the bound anonymous Auth session.
-- Active frontend flows use Auth-bound RPCs instead.
DROP FUNCTION IF EXISTS public.schoolcoin_market_redeem(text, text, uuid);
DROP FUNCTION IF EXISTS public.schoolcoin_student_orders(text, text);
DROP FUNCTION IF EXISTS public.schoolcoin_redeem(text, text, uuid);
DROP FUNCTION IF EXISTS public.schoolcoin_student_login(text, text);
