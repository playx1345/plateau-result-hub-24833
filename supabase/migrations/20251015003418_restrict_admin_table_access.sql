-- Migration to add restrictive RLS policy for admins table
-- This prevents non-admin users (like students) from accessing admin records

-- Drop any existing overly permissive policies on admins table
-- that might allow non-admins to view admin data
DROP POLICY IF EXISTS "Admins can view their own profile" ON public.admins;
DROP POLICY IF EXISTS "Admins can view their own data" ON public.admins;

-- Create a restrictive policy that only allows users who are admins to view admin records
-- This policy checks if the current user's auth.uid() exists in the admins table
CREATE POLICY "Only admins can view admin records"
ON public.admins FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admins WHERE user_id = auth.uid()
  )
);

-- Keep the update policy but make it more restrictive
DROP POLICY IF EXISTS "Admins can update their own profile" ON public.admins;
DROP POLICY IF EXISTS "Admins can update their own data" ON public.admins;

CREATE POLICY "Admins can update their own profile"
ON public.admins FOR UPDATE
USING (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.admins WHERE user_id = auth.uid()
  )
);

-- Add explicit denial for INSERT and DELETE operations by non-admins
-- Note: Service role key bypasses RLS policies, so admin creation via
-- scripts/create-admin.js will still work. This policy only affects
-- regular authenticated users (students, etc.) who should never be able
-- to create or delete admin records.

CREATE POLICY "Deny admin insert for regular users"
ON public.admins FOR INSERT
WITH CHECK (false); -- No regular users should be able to insert admins
                    -- Service role bypasses this policy

CREATE POLICY "Deny admin deletion for regular users"
ON public.admins FOR DELETE
USING (false); -- No regular users should be able to delete admins
               -- Service role bypasses this policy
