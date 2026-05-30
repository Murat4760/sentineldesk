import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export type Industry = "dental" | "salon" | "hvac" | "restaurant" | "other";

const DayHoursSchema = z.object({
  open: z.string().max(5),
  close: z.string().max(5),
  closed: z.boolean(),
});

const OnboardingSchema = z.object({
  name: z.string().min(1).max(120),
  industry: z.enum(["dental", "salon", "hvac", "restaurant", "other"]),
  businessHours: z.object({
    mon: DayHoursSchema,
    tue: DayHoursSchema,
    wed: DayHoursSchema,
    thu: DayHoursSchema,
    fri: DayHoursSchema,
    sat: DayHoursSchema,
    sun: DayHoursSchema,
  }),
  services: z.array(z.string().min(1).max(80)).max(30),
  greeting: z.string().min(1).max(500),
});

export type OnboardingInput = z.infer<typeof OnboardingSchema>;

// Returns the existing business + config for the logged-in user (if any)
export const getMyBusiness = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: business } = await supabase
      .from("businesses")
      .select("id, name, industry, phone")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: voiceConfig } = await supabase
      .from("voice_configs")
      .select("id, assistant_id, phone_number, config")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return { business: business ?? null, voiceConfig: voiceConfig ?? null };
  });

// Creates (or updates) the user's single business + voice_config from onboarding
export const saveOnboarding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => OnboardingSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // ----- business row (one per user) -----
    const { data: existingBiz } = await supabase
      .from("businesses")
      .select("id")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let businessId: string;
    if (existingBiz?.id) {
      businessId = existingBiz.id;
      const { error } = await supabase
        .from("businesses")
        .update({
          name: data.name,
          industry: data.industry,
          updated_at: new Date().toISOString(),
        })
        .eq("id", businessId)
        .eq("owner_id", userId);
      if (error) throw new Error(error.message);
    } else {
      const { data: inserted, error } = await supabase
        .from("businesses")
        .insert({
          owner_id: userId,
          name: data.name,
          industry: data.industry,
          phone: null,
        })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      businessId = inserted.id;
    }

    // ----- voice_config row (business hours + services + greeting in JSONB) -----
    const { data: existingVc } = await supabase
      .from("voice_configs")
      .select("id, config")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const prevConfig = (existingVc?.config ?? {}) as Record<string, unknown>;
    const nextConfig = {
      ...prevConfig,
      businessHours: data.businessHours,
      services: data.services,
      greeting: data.greeting,
    };

    if (existingVc?.id) {
      const { error } = await supabase
        .from("voice_configs")
        .update({
          business_id: businessId,
          config: nextConfig,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingVc.id)
        .eq("owner_id", userId);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from("voice_configs").insert({
        owner_id: userId,
        business_id: businessId,
        config: nextConfig,
      });
      if (error) throw new Error(error.message);
    }

    return { ok: true, businessId };
  });
