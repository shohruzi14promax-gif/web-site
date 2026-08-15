-- SchoolCoin student authentication binding (non-destructive)
--
-- This migration is intentionally additive. It does not recreate, delete, or
-- rewrite existing students, balances, orders, or transactions.
-- Historical migration drift is documented separately; this is NOT a
-- reconstruction of missing historical migrations.

ALTER TABLE public.schoolcoin_students
  ADD COLUMN IF NOT EXISTS auth_user_id uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.schoolcoin_students'::regclass
      AND conname = 'schoolcoin_students_auth_user_id_key'
  ) THEN
    ALTER TABLE public.schoolcoin_students
      ADD CONSTRAINT schoolcoin_students_auth_user_id_key UNIQUE (auth_user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.schoolcoin_students'::regclass
      AND conname = 'schoolcoin_students_auth_user_id_fkey'
  ) THEN
    ALTER TABLE public.schoolcoin_students
      ADD CONSTRAINT schoolcoin_students_auth_user_id_fkey
      FOREIGN KEY (auth_user_id)
      REFERENCES auth.users(id)
      ON DELETE SET NULL;
  END IF;
END $$;

COMMENT ON COLUMN public.schoolcoin_students.auth_user_id IS
  'Nullable Supabase Auth user binding. NULL means the student has not completed authenticated enrollment. Authorization must resolve through auth.uid(), never a browser-supplied student id.';
