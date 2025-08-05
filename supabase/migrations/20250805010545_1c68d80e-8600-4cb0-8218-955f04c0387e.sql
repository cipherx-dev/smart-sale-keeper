-- Fix search path for security functions
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT COALESCE((SELECT role::text FROM public.user_profiles WHERE user_id = auth.uid()), 'staff'::text);
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT public.get_current_user_role() = 'admin';
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- The anonymous access warnings are false positives since we're using TO authenticated
-- But let's be extra explicit by removing any possibility of anonymous access

-- Disable anonymous access globally for these tables by creating deny policies for anon role
CREATE POLICY "Deny anonymous access" ON public.products TO anon USING (false);
CREATE POLICY "Deny anonymous access" ON public.categories TO anon USING (false);
CREATE POLICY "Deny anonymous access" ON public.sales TO anon USING (false);
CREATE POLICY "Deny anonymous access" ON public.sale_items TO anon USING (false);
CREATE POLICY "Deny anonymous access" ON public.user_profiles TO anon USING (false);