DROP POLICY IF EXISTS payments_owner_select ON public.payments;

CREATE POLICY payments_owner_select
ON public.payments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id = payments.business_id
      AND b.owner_id = auth.uid()
  )
);

REVOKE SELECT ON public.payments FROM anon;