-- SchoolCoin authenticated student authorization layer.
-- NON-DESTRUCTIVE: existing students, balances, orders and transactions are not rewritten.
-- IMPORTANT: apply only after the authenticated frontend flow has been verified.
-- Historical migration drift is not reconstructed by this migration.

CREATE OR REPLACE FUNCTION public.schoolcoin_bind_student(p_code text, p_pin text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $function$
declare
  v_auth_user_id uuid := auth.uid();
  v_student public.schoolcoin_students%rowtype;
begin
  IF v_auth_user_id IS NULL OR auth.role() <> 'authenticated' THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) IS NOT TRUE THEN
    RAISE EXCEPTION 'Student binding requires an anonymous Auth session';
  END IF;

  IF NULLIF(trim(p_code), '') IS NULL OR NULLIF(trim(p_pin), '') IS NULL THEN
    RAISE EXCEPTION 'Kod va PIN talab qilinadi';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.schoolcoin_student_auth_bindings
    WHERE auth_user_id = v_auth_user_id
  ) THEN
    RAISE EXCEPTION 'Bu Auth sessiyasi allaqachon bog‘langan';
  END IF;

  SELECT * INTO v_student
  FROM public.schoolcoin_students
  WHERE student_code = upper(trim(p_code))
    AND active = true
  FOR UPDATE;

  IF NOT FOUND OR extensions.crypt(p_pin, v_student.pin_hash) <> v_student.pin_hash THEN
    RAISE EXCEPTION 'Kod yoki PIN noto‘g‘ri';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.schoolcoin_student_auth_bindings
    WHERE student_id = v_student.id
  ) THEN
    RAISE EXCEPTION 'Bu student allaqachon Auth hisobiga bog‘langan';
  END IF;

  INSERT INTO public.schoolcoin_student_auth_bindings(auth_user_id, student_id)
  VALUES (v_auth_user_id, v_student.id);

  RETURN jsonb_build_object(
    'id', v_student.id,
    'student_code', v_student.student_code,
    'full_name', v_student.full_name,
    'class_name', v_student.class_name
  );
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'Student yoki Auth sessiyasi allaqachon bog‘langan';
end;
$function$;

CREATE OR REPLACE FUNCTION public.schoolcoin_current_student()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $function$
declare
  v_student public.schoolcoin_students%rowtype;
  v_balance integer;
begin
  IF auth.uid() IS NULL OR auth.role() <> 'authenticated' THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT s.* INTO v_student
  FROM public.schoolcoin_student_auth_bindings b
  JOIN public.schoolcoin_students s ON s.id = b.student_id
  WHERE b.auth_user_id = auth.uid()
    AND s.active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Student identity is not bound';
  END IF;

  SELECT COALESCE(sum(amount), 0)::integer INTO v_balance
  FROM public.schoolcoin_transactions
  WHERE student_id = v_student.id;

  RETURN jsonb_build_object(
    'id', v_student.id,
    'student_code', v_student.student_code,
    'full_name', v_student.full_name,
    'class_name', v_student.class_name,
    'balance', v_balance
  );
end;
$function$;

CREATE OR REPLACE FUNCTION public.schoolcoin_student_orders()
RETURNS TABLE(id uuid, status text, price integer, created_at timestamptz, reward_title text)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $function$
declare
  v_student_id uuid;
begin
  IF auth.uid() IS NULL OR auth.role() <> 'authenticated' THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT b.student_id INTO v_student_id
  FROM public.schoolcoin_student_auth_bindings b
  JOIN public.schoolcoin_students s ON s.id = b.student_id
  WHERE b.auth_user_id = auth.uid() AND s.active = true;

  IF v_student_id IS NULL THEN
    RAISE EXCEPTION 'Student identity is not bound';
  END IF;

  RETURN QUERY
  SELECT o.id, o.status, o.price, o.created_at, r.title
  FROM public.schoolcoin_orders o
  JOIN public.schoolcoin_market_rewards r ON r.id = o.reward_id
  WHERE o.student_id = v_student_id
  ORDER BY o.created_at DESC;
end;
$function$;

CREATE OR REPLACE FUNCTION public.schoolcoin_submit_request(
  p_activity_id uuid,
  p_evidence_url text DEFAULT NULL,
  p_note text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $function$
declare
  v_student_id uuid;
  v_request_id uuid;
begin
  IF auth.uid() IS NULL OR auth.role() <> 'authenticated' THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT b.student_id INTO v_student_id
  FROM public.schoolcoin_student_auth_bindings b
  JOIN public.schoolcoin_students s ON s.id = b.student_id
  WHERE b.auth_user_id = auth.uid() AND s.active = true;

  IF v_student_id IS NULL THEN
    RAISE EXCEPTION 'Student identity is not bound';
  END IF;

  IF p_activity_id IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.schoolcoin_activities
    WHERE id = p_activity_id AND active = true
  ) THEN
    RAISE EXCEPTION 'Faoliyat topilmadi';
  END IF;

  INSERT INTO public.schoolcoin_requests(student_id, activity_id, evidence_url, note)
  VALUES (v_student_id, p_activity_id, p_evidence_url, p_note)
  RETURNING id INTO v_request_id;

  RETURN v_request_id;
end;
$function$;

CREATE OR REPLACE FUNCTION public.schoolcoin_market_redeem(p_reward_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $function$
declare
  v_student_id uuid;
  v_student public.schoolcoin_students%rowtype;
  v_reward public.schoolcoin_market_rewards%rowtype;
  v_balance integer;
  v_order_id uuid;
begin
  IF auth.uid() IS NULL OR auth.role() <> 'authenticated' THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT b.student_id INTO v_student_id
  FROM public.schoolcoin_student_auth_bindings b
  JOIN public.schoolcoin_students s ON s.id = b.student_id
  WHERE b.auth_user_id = auth.uid() AND s.active = true;

  IF v_student_id IS NULL THEN
    RAISE EXCEPTION 'Student identity is not bound';
  END IF;

  SELECT * INTO v_student
  FROM public.schoolcoin_students
  WHERE id = v_student_id AND active = true
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Student not found';
  END IF;

  SELECT * INTO v_reward
  FROM public.schoolcoin_market_rewards
  WHERE id = p_reward_id AND active = true
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reward topilmadi';
  END IF;

  IF v_reward.stock <= 0 THEN
    RAISE EXCEPTION 'Reward tugagan';
  END IF;

  SELECT COALESCE(sum(amount), 0)::integer INTO v_balance
  FROM public.schoolcoin_transactions
  WHERE student_id = v_student_id;

  IF v_balance < v_reward.price THEN
    RAISE EXCEPTION 'Coin yetarli emas';
  END IF;

  INSERT INTO public.schoolcoin_transactions(student_id, amount, transaction_type, note)
  VALUES (v_student_id, -v_reward.price, 'reward_redeem', 'Market: ' || v_reward.title);

  UPDATE public.schoolcoin_market_rewards
  SET stock = stock - 1
  WHERE id = v_reward.id;

  INSERT INTO public.schoolcoin_orders(student_id, reward_id, price, status)
  VALUES (v_student_id, v_reward.id, v_reward.price, 'pending')
  RETURNING id INTO v_order_id;

  RETURN jsonb_build_object('order_id', v_order_id, 'new_balance', v_balance - v_reward.price);
end;
$function$;

REVOKE ALL ON FUNCTION public.schoolcoin_bind_student(text,text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.schoolcoin_current_student() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.schoolcoin_student_orders() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.schoolcoin_submit_request(uuid,text,text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.schoolcoin_market_redeem(uuid) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.schoolcoin_bind_student(text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.schoolcoin_current_student() TO authenticated;
GRANT EXECUTE ON FUNCTION public.schoolcoin_student_orders() TO authenticated;
GRANT EXECUTE ON FUNCTION public.schoolcoin_submit_request(uuid,text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.schoolcoin_market_redeem(uuid) TO authenticated;

COMMENT ON FUNCTION public.schoolcoin_bind_student(text,text) IS 'One-time binding of an existing SchoolCoin student to the caller Supabase Auth user. PIN is enrollment-only.';
COMMENT ON FUNCTION public.schoolcoin_current_student() IS 'Returns only the student identity bound to auth.uid().';
COMMENT ON FUNCTION public.schoolcoin_student_orders() IS 'Returns orders only for the student bound to auth.uid().';
COMMENT ON FUNCTION public.schoolcoin_submit_request(uuid,text,text) IS 'Creates a request only for the student bound to auth.uid().';
COMMENT ON FUNCTION public.schoolcoin_market_redeem(uuid) IS 'Atomically redeems a reward for the student bound to auth.uid().';
