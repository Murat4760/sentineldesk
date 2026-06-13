import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Vapi webhook endpoint: POST /api/vapi-webhook
// Vapi POSTs an "end-of-call-report" after each call. We parse the
// transcript + summary, upsert the customer, save the call, and create
// an appointment if the caller booked one.
//
// This webhook writes to the Lovable Cloud managed Supabase instance using
// the service-role admin client (`supabaseAdmin`), which reads:
//   - SUPABASE_URL                 (Cloud-managed)
//   - SUPABASE_SERVICE_ROLE_KEY    (Cloud-managed)
// The service role bypasses RLS, which is required because a webhook has no
// logged-in user. Rows are stamped with owner_id so they appear in the
// owner-scoped dashboard queries.

// Use the shared admin client so the webhook always targets the Cloud
// instance. Returning it from a helper keeps the rest of the handler
// unchanged and centralizes the client reference.
function getSupabase() {
  return supabaseAdmin;
}

// Vapi has no concept of the app user, so inserted rows must be stamped with
// an owner_id or RLS (auth.uid() = owner_id) will hide them in the dashboard.
// Resolution order (multi-tenant routing):
//   1. voice_configs.owner_id matching the call's assistant_id (per-business)
//   2. WORKSPACE_OWNER_ID env var (fallback, keeps the original account working)
//   3. The first existing auth user (temporary debug fallback)
async function resolveOwnerId(
  supabase: ReturnType<typeof getSupabase>,
  assistantId?: string | null,
): Promise<string | null> {
  // 1. Route by assistant_id → business owner
  if (assistantId) {
    const { data: vc, error: vcErr } = await supabase
      .from("voice_configs")
      .select("owner_id")
      .eq("assistant_id", assistantId)
      .maybeSingle();
    if (vcErr) {
      console.error("[vapi-webhook] voice_configs lookup error:", vcErr.message);
    } else if (vc?.owner_id) {
      return vc.owner_id;
    }
  }

  // 2. Fallback to the configured workspace owner.
  const envOwner = process.env.WORKSPACE_OWNER_ID;
  if (envOwner) {
    return envOwner;
  }

  return null;
}


export const Route = createFileRoute("/api/vapi-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Validate the shared secret before processing any payload.
        const expectedSecret = process.env.VAPI_WEBHOOK_SECRET;
        const providedSecret = request.headers.get("x-vapi-secret");
        if (!expectedSecret || providedSecret !== expectedSecret) {
          return new Response("Unauthorized", { status: 401 });
        }

        try {
          const supabase = getSupabase();
          const body = await request.json();

          const messageType = body?.message?.type;

          // Only process call ended events
          if (messageType !== "end-of-call-report") {
            return Response.json({ received: true, ignored: messageType });
          }

          const call = body.message.call ?? {};
          const transcript: string = body.message.transcript ?? "";
          const summary: string = body.message.summary ?? "";

          // Always extract details from the transcript, regardless of intent.
          const { date: preferredDate, time: preferredTime } = extractPreferredDateTime(transcript);
          const extracted = {
            intent: summary.includes("randevu") ? "book_appointment" : "info",
            service: extractService(transcript),
            preferredDate,
            preferredTime,
            businessHours: extractBusinessHoursAsk(transcript),
            isNewPatient: isNewPatient(transcript),
            notes: summary,
          };

          const callerPhone: string = call.customer?.number ?? "unknown";

          const ownerId = await resolveOwnerId(supabase, call.assistantId);
          if (!ownerId) {
            console.warn(
              "[vapi-webhook] owner_id is null; rows may not appear in owner-scoped dashboard queries",
            );
          }


          // Find or create customer
          const { data: existingCustomer, error: findErr } = await supabase
            .from("customers")
            .select("id, total_calls")
            .eq("phone", callerPhone)
            .maybeSingle();

          if (findErr) console.error("[vapi-webhook] customer lookup error:", findErr.message);

          let customer = existingCustomer;

          if (!customer) {
            const { data: newCustomer, error: insertCustErr } = await supabase
              .from("customers")
              .insert({
                phone: callerPhone,
                name: extractName(transcript),
                total_calls: 1,
                owner_id: ownerId,
              })
              .select("id, total_calls")
              .single();

            if (insertCustErr) {
              console.error("[vapi-webhook] customer insert error:", insertCustErr.message);
            } else {
              customer = newCustomer;
            }
          } else {
            const { error: updateCustErr } = await supabase
              .from("customers")
              .update({ total_calls: (customer.total_calls ?? 0) + 1 })
              .eq("id", customer.id);
            if (updateCustErr) console.error("[vapi-webhook] customer update error:", updateCustErr.message);
          }

          const startedAt = call.startedAt ? new Date(call.startedAt).getTime() : 0;
          const endedAt = call.endedAt ? new Date(call.endedAt).getTime() : 0;
          const duration = startedAt && endedAt ? Math.round((endedAt - startedAt) / 1000) : 0;

          const callInsert = {
            caller_phone: callerPhone,
            caller_name: extractName(transcript),
            duration,
            transcript: body.message.messages ?? [],
            outcome: extracted.intent === "book_appointment" ? "booked" : "info",
            sentiment: analyzeSentiment(transcript),
            extracted_data: extracted,
            vapi_call_id: call.id,
            customer_id: customer?.id,
            owner_id: ownerId,
          };
          const { error: callErr } = await supabase
            .from("calls")
            .insert(callInsert)
            .select("id")
            .single();
          if (callErr) {
            console.error("[vapi-webhook] call insert error:", callErr.message);
          }

          if (extracted.intent === "book_appointment") {
            const appointmentTime = extractAppointmentTime(transcript);
            if (appointmentTime) {
              const appointmentInsert = {
                customer_name: extractName(transcript),
                customer_phone: callerPhone,
                service: extracted.service,
                appointment_datetime: appointmentTime,
                status: "pending",
                customer_id: customer?.id,
                owner_id: ownerId,
              };
              const { error: apptErr } = await supabase
                .from("appointments")
                .insert(appointmentInsert)
                .select("id")
                .single();
              if (apptErr) console.error("[vapi-webhook] appointment insert error:", apptErr.message);
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

const TURKISH_DAYS = ["pazartesi", "salı", "çarşamba", "perşembe", "cuma", "cumartesi", "pazar"];

// Extract a human-readable Turkish day name and time (e.g. "14:00") from the
// transcript, independent of intent. Either field may be empty if not found.
function extractPreferredDateTime(transcript: string): { date: string; time: string } {
  const lower = transcript.toLowerCase();
  let date = "";
  for (const day of TURKISH_DAYS) {
    if (lower.includes(day)) {
      date = day.charAt(0).toLocaleUpperCase("tr-TR") + day.slice(1);
      break;
    }
  }
  let time = "";
  const timeMatch = transcript.match(/\b([01]?\d|2[0-3])[:.]([0-5]\d)\b/);
  if (timeMatch) {
    time = `${timeMatch[1].padStart(2, "0")}:${timeMatch[2]}`;
  }
  return { date, time };
}

// True when the caller is asking about the business's opening hours.
function extractBusinessHoursAsk(transcript: string): boolean {
  const t = transcript.toLowerCase();
  return (
    t.includes("çalışma saat") ||
    t.includes("açılış saat") ||
    t.includes("kaçta açık") ||
    t.includes("kaça kadar") ||
    t.includes("saat kaçta") ||
    t.includes("açık mısınız")
  );
}

// True when the caller identifies as a first-time / new patient.
function isNewPatient(transcript: string): boolean {
  const t = transcript.toLowerCase();
  return t.includes("ilk defa") || t.includes("yeni hasta");
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
