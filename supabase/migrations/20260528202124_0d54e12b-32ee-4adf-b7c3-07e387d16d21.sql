
-- Add owner_id columns
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS owner_id uuid;
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS owner_id uuid;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS owner_id uuid;

CREATE INDEX IF NOT EXISTS idx_customers_owner_id ON public.customers(owner_id);
CREATE INDEX IF NOT EXISTS idx_calls_owner_id ON public.calls(owner_id);
CREATE INDEX IF NOT EXISTS idx_appointments_owner_id ON public.appointments(owner_id);

-- Drop permissive policies
DROP POLICY IF EXISTS "Authenticated can read customers" ON public.customers;
DROP POLICY IF EXISTS "Authenticated can insert customers" ON public.customers;
DROP POLICY IF EXISTS "Authenticated can update customers" ON public.customers;

DROP POLICY IF EXISTS "Authenticated can read calls" ON public.calls;
DROP POLICY IF EXISTS "Authenticated can insert calls" ON public.calls;

DROP POLICY IF EXISTS "Authenticated can read appointments" ON public.appointments;
DROP POLICY IF EXISTS "Authenticated can insert appointments" ON public.appointments;
DROP POLICY IF EXISTS "Authenticated can update appointments" ON public.appointments;

-- customers: owner-scoped
CREATE POLICY "Users can view their own customers"
ON public.customers FOR SELECT TO authenticated
USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own customers"
ON public.customers FOR INSERT TO authenticated
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own customers"
ON public.customers FOR UPDATE TO authenticated
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own customers"
ON public.customers FOR DELETE TO authenticated
USING (auth.uid() = owner_id);

-- calls: owner-scoped
CREATE POLICY "Users can view their own calls"
ON public.calls FOR SELECT TO authenticated
USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own calls"
ON public.calls FOR INSERT TO authenticated
WITH CHECK (auth.uid() = owner_id);

-- appointments: owner-scoped
CREATE POLICY "Users can view their own appointments"
ON public.appointments FOR SELECT TO authenticated
USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own appointments"
ON public.appointments FOR INSERT TO authenticated
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own appointments"
ON public.appointments FOR UPDATE TO authenticated
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own appointments"
ON public.appointments FOR DELETE TO authenticated
USING (auth.uid() = owner_id);
