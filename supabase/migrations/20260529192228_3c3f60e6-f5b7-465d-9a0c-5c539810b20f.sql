GRANT SELECT, INSERT, UPDATE, DELETE ON public.businesses TO authenticated;
GRANT ALL ON public.businesses TO service_role;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "biz_select" ON public.businesses FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "biz_insert" ON public.businesses FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "biz_update" ON public.businesses FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "biz_delete" ON public.businesses FOR DELETE TO authenticated USING (auth.uid() = owner_id);
CREATE TRIGGER set_businesses_updated_at BEFORE UPDATE ON public.businesses FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.voice_configs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id uuid,
  business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE,
  assistant_id text,
  phone_number text,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.voice_configs TO authenticated;
GRANT ALL ON public.voice_configs TO service_role;
ALTER TABLE public.voice_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vc_select" ON public.voice_configs FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "vc_insert" ON public.voice_configs FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "vc_update" ON public.voice_configs FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "vc_delete" ON public.voice_configs FOR DELETE TO authenticated USING (auth.uid() = owner_id);
CREATE TRIGGER set_voice_configs_updated_at BEFORE UPDATE ON public.voice_configs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();