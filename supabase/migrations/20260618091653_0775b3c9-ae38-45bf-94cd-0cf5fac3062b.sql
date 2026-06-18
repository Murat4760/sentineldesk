-- Calls: add owner-scoped UPDATE and DELETE policies
CREATE POLICY "Users can update their own calls"
ON public.calls
FOR UPDATE
TO authenticated
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own calls"
ON public.calls
FOR DELETE
TO authenticated
USING (auth.uid() = owner_id);

-- Payments: add write policies scoped to business ownership
CREATE POLICY "payments_owner_insert"
ON public.payments
FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.businesses b
  WHERE b.id = payments.business_id AND b.owner_id = auth.uid()
));

CREATE POLICY "payments_owner_update"
ON public.payments
FOR UPDATE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.businesses b
  WHERE b.id = payments.business_id AND b.owner_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.businesses b
  WHERE b.id = payments.business_id AND b.owner_id = auth.uid()
));

CREATE POLICY "payments_owner_delete"
ON public.payments
FOR DELETE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.businesses b
  WHERE b.id = payments.business_id AND b.owner_id = auth.uid()
));