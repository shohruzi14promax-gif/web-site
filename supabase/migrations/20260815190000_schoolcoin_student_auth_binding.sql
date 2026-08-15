-- SchoolCoin student authentication binding (non-destructive)
--
-- This migration is intentionally additive. It does not recreate, delete, or
-- rewrite existing students, balances, orders, or transactions.
-- Historical migration drift is documented separately; this is NOT a
-- reconstruction of missing historical migrations.
--
-- A separate binding table is used instead of a single auth_user_id column so
-- a student can securely establish an authenticated session on more than one
-- device without duplicating the student row. Each Auth user maps to at most
-- one SchoolCoin student.

CREATE TABLE IF NOT EXISTS public.schoolcoin_student_auth_bindings (
  auth_user_id uuid PRIMARY KEY
    REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id uuid NOT NULL
    REFERENCES public.schoolcoin_students(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS schoolcoin_student_auth_bindings_student_id_idx
  ON public.schoolcoin_student_auth_bindings(student_id);

ALTER TABLE public.schoolcoin_student_auth_bindings ENABLE ROW LEVEL SECURITY;

-- No direct client table access is granted. Authenticated student operations
-- must resolve identity through server-side SECURITY DEFINER RPCs using
-- auth.uid(). Admins continue to use their existing admin RPC/table paths.
REVOKE ALL ON TABLE public.schoolcoin_student_auth_bindings FROM anon, authenticated;

COMMENT ON TABLE public.schoolcoin_student_auth_bindings IS
  'Maps an authenticated Supabase Auth user to an existing SchoolCoin student. Existing student records remain unchanged. Sensitive operations must resolve student_id from auth.uid() server-side.';
COMMENT ON COLUMN public.schoolcoin_student_auth_bindings.auth_user_id IS
  'Supabase Auth user id. One Auth user can belong to only one SchoolCoin student.';
COMMENT ON COLUMN public.schoolcoin_student_auth_bindings.student_id IS
  'Existing SchoolCoin student id. Multiple authenticated sessions/devices may map to the same student.';
