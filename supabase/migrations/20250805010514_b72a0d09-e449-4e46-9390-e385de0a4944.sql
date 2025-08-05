-- Create security definer function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT COALESCE((SELECT role::text FROM public.user_profiles WHERE user_id = auth.uid()), 'staff'::text);
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT public.get_current_user_role() = 'admin';
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Remove all existing policies first
DROP POLICY IF EXISTS "Authenticated users can view products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can manage products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can view categories" ON public.categories;
DROP POLICY IF EXISTS "Authenticated users can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Authenticated users can view sales" ON public.sales;
DROP POLICY IF EXISTS "Authenticated users can manage sales" ON public.sales;
DROP POLICY IF EXISTS "Authenticated users can view sale items" ON public.sale_items;
DROP POLICY IF EXISTS "Authenticated users can manage sale items" ON public.sale_items;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.user_profiles;

-- Products policies - only authenticated users
CREATE POLICY "Enable read for authenticated users only" 
ON public.products 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Enable insert for authenticated users only" 
ON public.products 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only" 
ON public.products 
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users only" 
ON public.products 
FOR DELETE 
TO authenticated
USING (true);

-- Categories policies - only authenticated users
CREATE POLICY "Enable read for authenticated users only" 
ON public.categories 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Enable insert for authenticated users only" 
ON public.categories 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only" 
ON public.categories 
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users only" 
ON public.categories 
FOR DELETE 
TO authenticated
USING (true);

-- Sales policies - only authenticated users
CREATE POLICY "Enable read for authenticated users only" 
ON public.sales 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Enable insert for authenticated users only" 
ON public.sales 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only" 
ON public.sales 
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users only" 
ON public.sales 
FOR DELETE 
TO authenticated
USING (true);

-- Sale items policies - only authenticated users
CREATE POLICY "Enable read for authenticated users only" 
ON public.sale_items 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Enable insert for authenticated users only" 
ON public.sale_items 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only" 
ON public.sale_items 
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users only" 
ON public.sale_items 
FOR DELETE 
TO authenticated
USING (true);

-- User profiles policies - users can manage own profile, admins can manage all
CREATE POLICY "Users can view own profile or admin can view all" 
ON public.user_profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert own profile only" 
ON public.user_profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile or admin can update all" 
ON public.user_profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id OR public.is_admin())
WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Admin can delete profiles" 
ON public.user_profiles 
FOR DELETE 
TO authenticated
USING (public.is_admin());