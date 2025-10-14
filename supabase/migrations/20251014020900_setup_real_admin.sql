-- Migration to set up real admin accounts in Supabase Cloud
-- This migration adds missing columns to the admins table and prepares it for real auth users

-- Add missing columns to admins table if they don't exist
DO $$ 
BEGIN
  -- Add staff_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'admins' 
    AND column_name = 'staff_id'
  ) THEN
    ALTER TABLE public.admins ADD COLUMN staff_id TEXT;
  END IF;

  -- Add department column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'admins' 
    AND column_name = 'department'
  ) THEN
    ALTER TABLE public.admins ADD COLUMN department TEXT DEFAULT 'Computer Science';
  END IF;

  -- Add role column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'admins' 
    AND column_name = 'role'
  ) THEN
    ALTER TABLE public.admins ADD COLUMN role TEXT DEFAULT 'Admin';
  END IF;
END $$;

-- Make user_id nullable to support initial setup
ALTER TABLE public.admins ALTER COLUMN user_id DROP NOT NULL;

-- Add unique constraint to staff_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'admins_staff_id_key'
  ) THEN
    ALTER TABLE public.admins ADD CONSTRAINT admins_staff_id_key UNIQUE (staff_id);
  END IF;
END $$;

-- Update the verify_admin_login function to check against real auth users
CREATE OR REPLACE FUNCTION public.verify_admin_login(
  admin_email TEXT,
  admin_password TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if admin exists in admins table
  -- The actual password verification is done by Supabase Auth
  -- This function just verifies the user is an admin
  RETURN EXISTS(
    SELECT 1 FROM public.admins WHERE email = admin_email
  );
END;
$$;

-- Add policy to allow admins to manage all tables
CREATE POLICY IF NOT EXISTS "Admins can view all students"
ON public.students FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admins WHERE user_id = auth.uid()
  )
);

CREATE POLICY IF NOT EXISTS "Admins can insert students"
ON public.students FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admins WHERE user_id = auth.uid()
  )
);

CREATE POLICY IF NOT EXISTS "Admins can update all students"
ON public.students FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.admins WHERE user_id = auth.uid()
  )
);

CREATE POLICY IF NOT EXISTS "Admins can delete students"
ON public.students FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.admins WHERE user_id = auth.uid()
  )
);

-- Grant admins full access to results
CREATE POLICY IF NOT EXISTS "Admins can view all results"
ON public.results FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admins WHERE user_id = auth.uid()
  )
);

CREATE POLICY IF NOT EXISTS "Admins can insert results"
ON public.results FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admins WHERE user_id = auth.uid()
  )
);

CREATE POLICY IF NOT EXISTS "Admins can update results"
ON public.results FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.admins WHERE user_id = auth.uid()
  )
);

CREATE POLICY IF NOT EXISTS "Admins can delete results"
ON public.results FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.admins WHERE user_id = auth.uid()
  )
);

-- Grant admins access to fee payments
CREATE POLICY IF NOT EXISTS "Admins can view all fee payments"
ON public.fee_payments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admins WHERE user_id = auth.uid()
  )
);

CREATE POLICY IF NOT EXISTS "Admins can insert fee payments"
ON public.fee_payments FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admins WHERE user_id = auth.uid()
  )
);

CREATE POLICY IF NOT EXISTS "Admins can update fee payments"
ON public.fee_payments FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.admins WHERE user_id = auth.uid()
  )
);

-- Grant admins access to courses
CREATE POLICY IF NOT EXISTS "Admins can insert courses"
ON public.courses FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admins WHERE user_id = auth.uid()
  )
);

CREATE POLICY IF NOT EXISTS "Admins can update courses"
ON public.courses FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.admins WHERE user_id = auth.uid()
  )
);

CREATE POLICY IF NOT EXISTS "Admins can delete courses"
ON public.courses FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.admins WHERE user_id = auth.uid()
  )
);

-- Grant admins access to announcements
CREATE POLICY IF NOT EXISTS "Admins can view all announcements"
ON public.announcements FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admins WHERE user_id = auth.uid()
  )
);

CREATE POLICY IF NOT EXISTS "Admins can insert announcements"
ON public.announcements FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admins WHERE user_id = auth.uid()
  )
);

CREATE POLICY IF NOT EXISTS "Admins can update announcements"
ON public.announcements FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.admins WHERE user_id = auth.uid()
  )
);

CREATE POLICY IF NOT EXISTS "Admins can delete announcements"
ON public.announcements FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.admins WHERE user_id = auth.uid()
  )
);
