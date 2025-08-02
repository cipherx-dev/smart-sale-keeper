-- Clean slate approach - fix the database completely
-- First drop the trigger and function to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recreate user_profiles table with proper structure
DROP TABLE IF EXISTS public.user_profiles CASCADE;

CREATE TABLE public.user_profiles (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid UNIQUE,
    username text NOT NULL UNIQUE,
    role user_role NOT NULL DEFAULT 'staff'::user_role,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create simple policies for now
CREATE POLICY "Enable all operations for authenticated users" 
  ON public.user_profiles 
  FOR ALL 
  TO authenticated
  USING (true) 
  WITH CHECK (true);

-- Insert default profiles for our hardcoded users
-- These will be linked to auth users when they sign in through the app
INSERT INTO public.user_profiles (user_id, username, role)
VALUES 
  (NULL, 'admin', 'admin'::user_role),
  (NULL, 'staff', 'staff'::user_role)
ON CONFLICT (username) DO NOTHING;