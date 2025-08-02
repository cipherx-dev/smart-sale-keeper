-- Remove the broken trigger and function first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Simplify the authentication approach by removing the trigger dependency
-- Instead, we'll handle user profile creation directly in the application

-- Make sure user_profiles table is clean and simple
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

-- Simple RLS policy
CREATE POLICY "Allow all operations for now" 
  ON public.user_profiles 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Create the default admin and staff users for immediate login
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    phone,
    phone_confirmed_at,
    phone_change,
    phone_change_token,
    phone_change_sent_at,
    confirmed_at,
    email_change_token_current,
    email_change_confirm_status,
    banned_until,
    reauthentication_token,
    reauthentication_sent_at,
    is_sso_user,
    deleted_at
) VALUES 
-- Admin user with email admin@pos.local and password cisco@123
(
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@pos.local',
    crypt('cisco@123', gen_salt('bf')),
    now(),
    '',
    '',
    '',
    '',
    null,
    '{"provider": "email", "providers": ["email"]}',
    '{"username": "admin", "role": "admin"}',
    false,
    now(),
    now(),
    null,
    null,
    '',
    '',
    null,
    now(),
    '',
    0,
    null,
    '',
    null,
    false,
    null
),
-- Staff user with email staff@pos.local and password staff123
(
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'staff@pos.local',
    crypt('staff123', gen_salt('bf')),
    now(),
    '',
    '',
    '',
    '',
    null,
    '{"provider": "email", "providers": ["email"]}',
    '{"username": "staff", "role": "staff"}',
    false,
    now(),
    now(),
    null,
    null,
    '',
    '',
    null,
    now(),
    '',
    0,
    null,
    '',
    null,
    false,
    null
)
ON CONFLICT (email) DO NOTHING;

-- Create corresponding profiles for these users
WITH auth_users AS (
    SELECT id, email, raw_user_meta_data->>'username' as username, raw_user_meta_data->>'role' as role
    FROM auth.users 
    WHERE email IN ('admin@pos.local', 'staff@pos.local')
)
INSERT INTO public.user_profiles (user_id, username, role)
SELECT 
    id,
    username,
    role::user_role
FROM auth_users
ON CONFLICT (username) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    role = EXCLUDED.role;