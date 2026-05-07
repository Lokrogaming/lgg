CREATE POLICY "Site owner can grant purchases"
ON public.purchases
FOR INSERT
WITH CHECK (public.is_site_owner(auth.uid()));