ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS business_id uuid;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS business_id uuid;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS business_id uuid;

CREATE INDEX IF NOT EXISTS idx_calls_business_id ON public.calls(business_id);
CREATE INDEX IF NOT EXISTS idx_customers_business_id ON public.customers(business_id);
CREATE INDEX IF NOT EXISTS idx_appointments_business_id ON public.appointments(business_id);