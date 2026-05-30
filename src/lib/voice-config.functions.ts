import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const SaveVoiceConfigInput = z.object({
  voiceId: z.string().min(1).max(255),
});

export const getVoiceConfig = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("voice_configs")
      .select("id, config")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      throw new Error(error.message);
    }

    const config = (data?.config ?? {}) as Record<string, unknown>;
    return {
      voiceId: typeof config.voiceId === "string" ? config.voiceId : "",
    };
  });

export const saveVoiceConfig = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => SaveVoiceConfigInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: existing } = await supabase
      .from("voice_configs")
      .select("id")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (existing?.id) {
      const { error } = await supabase
        .from("voice_configs")
        .update({
          config: { voiceId: data.voiceId },
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .eq("owner_id", userId);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from("voice_configs").insert({
        owner_id: userId,
        config: { voiceId: data.voiceId },
      });
      if (error) throw new Error(error.message);
    }

    return { ok: true };
  });
