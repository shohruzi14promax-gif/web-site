-- Remove the legacy PIN-based submit overload that bypassed the anonymous Auth binding.
-- The frontend uses the authenticated, bound-student overload only.
DROP FUNCTION IF EXISTS public.schoolcoin_submit_request(text, text, uuid, text, text);
