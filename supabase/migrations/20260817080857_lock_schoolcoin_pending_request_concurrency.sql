CREATE UNIQUE INDEX IF NOT EXISTS schoolcoin_requests_one_pending_per_student_activity_idx
ON public.schoolcoin_requests (student_id, activity_id)
WHERE status = 'pending';
