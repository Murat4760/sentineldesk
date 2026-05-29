import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

// Vapi webhook endpoint: POST /api/vapi-webhook
// Vapi POSTs an "end-of-call-report" after each call. We parse the
// transcript + summary, upsert the customer, save the call, and create
// an appointment if the caller booked one.
//
// Required env (server-only):
//   - VITE_SUPABASE_URL  (or SUPABASE_URL)
//   - SUPABASE_SERVICE_ROLE_KEY
//
// NOTE: Lovable Cloud must be enabled and the `customers`, `calls`, and
// `appointments` tables must exist with the columns referenced below.

function getSupabase() {
  const url = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Diagnostic logging — never log the actual secret values.
  console.log("[vapi-webhook] env check:", {
    hasUrl: Boolean(url),
    hasServiceRoleKey: Boolean(key),
    urlSource: process.env.VITE_SUPABASE_URL
      ? "VITE_SUPABASE_URL"
      : process.env.SUPABASE_URL
        ? "SUPABASE_URL"
        : "none",
  });

  if (!url || !key) {
    throw new Error(
      `Supabase env vars missing (url=${Boolean(url)}, serviceRoleKey=${Boolean(key)}).`,
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// Vapi has no concept of the app user, so inserted rows must be stamped with
// an owner_id or RLS (auth.uid() = owner_id) will hide them in the dashboard.
// Resolution order:
//   1. WORKSPACE_OWNER_ID env var (explicit, preferred for multi-user setups)
//   2. The single existing auth user (works for a single-clinic deployment)
async function resolveOwnerId(
  supabase: ReturnType<typeof getSupabase>,
): Promise<string | null> {
  const envOwner = process.env.WORKSPACE_OWNER_ID;
  if (envOwner) return envOwner;

  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 2 });
  if (error) {
    console.error("[vapi-webhook] listUsers error:", error);
    return null;
  }
  const users = data?.users ?? [];
  if (users.length === 1) return users[0].id;
  console.warn(
    `[vapi-webhook] could not auto-resolve owner_id (found ${users.length} users). ` +
      `Set WORKSPACE_OWNER_ID to assign ownership.`,
  );
  return null;
}


export const Route = createFileRoute("/api/vapi-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        console.log("[vapi-webhook] request received");
        try {
          const supabase = getSupabase();
          const body = await request.json();

          const messageType = body?.message?.type;
          console.log("[vapi-webhook] parsed body:", {
            messageType,
            hasCall: Boolean(body?.message?.call),
            hasTranscript: Boolean(body?.message?.transcript),
            hasSummary: Boolean(body?.message?.summary),
          });

          // Only process call ended events
          if (messageType !== "end-of-call-report") {
            console.log(
              `[vapi-webhook] ignoring event of type "${messageType}" (waiting for end-of-call-report)`,
            );
            return Response.json({ received: true, ignored: messageType });
          }

          const call = body.message.call ?? {};
          const transcript: string = body.message.transcript ?? "";
          const summary: string = body.message.summary ?? "";

          const extracted = {
            intent: summary.includes("randevu") ? "book_appointment" : "info",
            service: extractService(transcript),
            notes: summary,
          };

          const callerPhone: string = call.customer?.number ?? "unknown";

          // Find or create customer
          const { data: existingCustomer, error: findErr } = await supabase
            .from("customers")
            .select("id, total_calls")
            .eq("phone", callerPhone)
            .maybeSingle();

          if (findErr) console.error("[vapi-webhook] customer lookup error:", findErr);

          let customer = existingCustomer;

          if (!customer) {
            const { data: newCustomer, error: insertCustErr } = await supabase
              .from("customers")
              .insert({
                phone: callerPhone,
                name: extractName(transcript),
                total_calls: 1,
              })
              .select("id, total_calls")
              .single();
            if (insertCustErr)
              console.error("[vapi-webhook] customer insert error:", insertCustErr);
            customer = newCustomer;
          } else {
            const { error: updateCustErr } = await supabase
              .from("customers")
              .update({ total_calls: (customer.total_calls ?? 0) + 1 })
              .eq("id", customer.id);
            if (updateCustErr)
              console.error("[vapi-webhook] customer update error:", updateCustErr);
          }

          const startedAt = call.startedAt ? new Date(call.startedAt).getTime() : 0;
          const endedAt = call.endedAt ? new Date(call.endedAt).getTime() : 0;
          const duration = startedAt && endedAt ? Math.round((endedAt - startedAt) / 1000) : 0;

          const { error: callErr } = await supabase.from("calls").insert({
            caller_phone: callerPhone,
            caller_name: extractName(transcript),
            duration,
            transcript: body.message.messages ?? [],
            outcome: extracted.intent === "book_appointment" ? "booked" : "info",
            sentiment: analyzeSentiment(transcript),
            extracted_data: extracted,
            vapi_call_id: call.id,
            customer_id: customer?.id,
          });
          if (callErr) {
            console.error("[vapi-webhook] call insert error:", callErr);
          } else {
            console.log("[vapi-webhook] call inserted for", callerPhone);
          }

          if (extracted.intent === "book_appointment") {
            const appointmentTime = extractAppointmentTime(transcript);
            if (appointmentTime) {
              const { error: apptErr } = await supabase.from("appointments").insert({
                customer_name: extractName(transcript),
                customer_phone: callerPhone,
                service: extracted.service,
                appointment_datetime: appointmentTime,
                status: "pending",
                customer_id: customer?.id,
              });
              if (apptErr)
                console.error("[vapi-webhook] appointment insert error:", apptErr);
              else console.log("[vapi-webhook] appointment created for", callerPhone);
            }
          }

          return Response.json({ success: true });
        } catch (error) {
          console.error("[vapi-webhook] webhook error:", error);
          return Response.json(
            { error: error instanceof Error ? error.message : "Webhook failed" },
            { status: 500 },
          );
        }
      },
    },
  },
});

// ---------- helpers ----------

function extractName(transcript: string): string {
  const match = transcript.match(/(?:adım|ismim|ben)\s+([A-ZÇĞİÖŞÜa-zçğışöüı]+)/i);
  return match?.[1] || "Bilinmiyor";
}

function extractService(transcript: string): string {
  const t = transcript.toLowerCase();
  if (t.includes("temizlik")) return "Diş Temizliği";
  if (t.includes("dolgu")) return "Dolgu";
  if (t.includes("kontrol")) return "Kontrol";
  if (t.includes("çekim") || t.includes("çekimi")) return "Diş Çekimi";
  return "Genel";
}

function extractAppointmentTime(transcript: string): string | null {
  const days: Record<string, number> = {
    pazartesi: 1,
    salı: 2,
    çarşamba: 3,
    perşembe: 4,
    cuma: 5,
    cumartesi: 6,
    pazar: 0,
  };
  const today = new Date();
  const lower = transcript.toLowerCase();
  for (const [day, dayNum] of Object.entries(days)) {
    if (lower.includes(day)) {
      const diff = ((dayNum - today.getDay() + 7) % 7) || 7;
      const date = new Date(today);
      date.setDate(today.getDate() + diff);
      const hourMatch = transcript.match(/(\d{1,2})[:.]?(\d{2})?\s*(?:de|da|'de|'da)?/);
      if (hourMatch) {
        date.setHours(parseInt(hourMatch[1], 10), parseInt(hourMatch[2] || "0", 10), 0, 0);
      }
      return date.toISOString();
    }
  }
  return null;
}

function analyzeSentiment(transcript: string): string {
  const positive = ["teşekkür", "harika", "güzel", "memnun", "tamam", "iyi"];
  const negative = ["kötü", "berbat", "sinir", "olmaz", "hayır"];
  const lower = transcript.toLowerCase();
  const pos = positive.filter((w) => lower.includes(w)).length;
  const neg = negative.filter((w) => lower.includes(w)).length;
  if (pos > neg) return "positive";
  if (neg > pos) return "negative";
  return "neutral";
}
