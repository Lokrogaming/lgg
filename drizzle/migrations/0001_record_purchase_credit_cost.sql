ALTER TABLE public.purchases ADD COLUMN credits_spent integer;
COMMENT ON COLUMN public.purchases.credits_spent IS 'Recorded cost at purchase time; NULL for legacy purchases whose historical cost is unknown; zero for site-owner grants.';
CREATE OR REPLACE FUNCTION public.record_purchase_credit_cost()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.servers WHERE id = NEW.server_id AND owner_id = auth.uid()) THEN
    SELECT price INTO NEW.credits_spent FROM public.shop_items WHERE id = NEW.item_id;
  ELSIF public.is_site_owner(auth.uid()) THEN
    NEW.credits_spent := 0;
  ELSE
    NEW.credits_spent := NULL;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER record_purchase_credit_cost BEFORE INSERT ON public.purchases FOR EACH ROW EXECUTE FUNCTION public.record_purchase_credit_cost();