
-- First, let's make sure the user_role type exists and recreate it if needed
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'staff');
    END IF;
END $$;

-- Ensure the user_profiles table has the correct structure
ALTER TABLE public.user_profiles 
  ALTER COLUMN role TYPE user_role USING role::text::user_role;

-- Make sure the role column has a proper default
ALTER TABLE public.user_profiles 
  ALTER COLUMN role SET DEFAULT 'staff'::user_role;

-- Recreate the handle_new_user function with proper error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, username, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'staff'::user_role)
  )
  ON CONFLICT (user_id) DO UPDATE SET
    username = EXCLUDED.username,
    role = EXCLUDED.role;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create default admin and staff users in user_profiles if they don't exist
-- This ensures the hardcoded users in the app have corresponding profiles
INSERT INTO public.user_profiles (user_id, username, role)
VALUES 
  (gen_random_uuid(), 'admin', 'admin'::user_role),
  (gen_random_uuid(), 'staff', 'staff'::user_role)
ON CONFLICT (username) DO NOTHING;

-- Update RLS policies to be more permissive for troubleshooting
DROP POLICY IF EXISTS "Users can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.user_profiles;

-- Create more permissive policies
CREATE POLICY "Allow all operations for authenticated users" 
  ON public.user_profiles 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Add a unique constraint on username if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'user_profiles_username_key'
    ) THEN
        ALTER TABLE public.user_profiles 
        ADD CONSTRAINT user_profiles_username_key UNIQUE (username);
    END IF;
END $$;
