-- Enable RLS on all tables that don't have it enabled
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Fix policies to restrict to authenticated users only (no anonymous access)
DROP POLICY IF EXISTS "Authenticated users can view products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can manage products" ON public.products;

CREATE POLICY "Authenticated users can view products" 
ON public.products 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage products" 
ON public.products 
FOR ALL 
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Categories policies
DROP POLICY IF EXISTS "Authenticated users can view categories" ON public.categories;
DROP POLICY IF EXISTS "Authenticated users can manage categories" ON public.categories;

CREATE POLICY "Authenticated users can view categories" 
ON public.categories 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage categories" 
ON public.categories 
FOR ALL 
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Sales policies
DROP POLICY IF EXISTS "Authenticated users can view sales" ON public.sales;
DROP POLICY IF EXISTS "Authenticated users can manage sales" ON public.sales;

CREATE POLICY "Authenticated users can view sales" 
ON public.sales 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage sales" 
ON public.sales 
FOR ALL 
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Sale items policies
DROP POLICY IF EXISTS "Authenticated users can view sale items" ON public.sale_items;
DROP POLICY IF EXISTS "Authenticated users can manage sale items" ON public.sale_items;

CREATE POLICY "Authenticated users can view sale items" 
ON public.sale_items 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage sale items" 
ON public.sale_items 
FOR ALL 
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- User profiles policies - restrict to own profile only
DROP POLICY IF EXISTS "Allow all operations" ON public.user_profiles;

CREATE POLICY "Users can view their own profile" 
ON public.user_profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.user_profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.user_profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow admins to view and manage all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.user_profiles 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up 
    WHERE up.user_id = auth.uid() AND up.role = 'admin'
  )
);

CREATE POLICY "Admins can manage all profiles" 
ON public.user_profiles 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up 
    WHERE up.user_id = auth.uid() AND up.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles up 
    WHERE up.user_id = auth.uid() AND up.role = 'admin'
  )
);