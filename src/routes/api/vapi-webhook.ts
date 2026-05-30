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
// Resolution order:
//   1. WORKSPACE_OWNER_ID env var (explicit, preferred for multi-user setups)
//   2. The first existing auth user (temporary debug fallback)
async function resolveOwnerId(
  supabase: ReturnType<typeof getSupabase>,
): Promise<string | null> {
  const envOwner = process.env.WORKSPACE_OWNER_ID;
  if (envOwner) {
    return envOwner;
  }

  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
  if (error) {
    console.error("[vapi-webhook] listUsers error:", error.message);
    return null;
  }
  const users = data?.users ?? [];
  if (users[0]?.id) {
    return users[0].id;
  }
  console.warn("[vapi-webhook] could not auto-resolve owner_id; no auth users found");
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

          const extracted = {
            intent: summary.includes("randevu") ? "book_appointment" : "info",
            service: extractService(transcript),
            notes: summary,
          };

          const callerPhone: string = call.customer?.number ?? "unknown";

          const ownerId = await resolveOwnerId(supabase);
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
          console.log("[vapi-webhook] call insert attempted", callInsert);
          const { data: insertedCall, error: callErr } = await supabase
            .from("calls")
            .insert(callInsert)
            .select("id")
            .single();
          if (callErr) {
            console.error("[vapi-webhook] call insert full error:", callErr);
          } else {
            console.log("[vapi-webhook] call insert result", insertedCall);
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
              console.log("[vapi-webhook] appointment insert attempted", appointmentInsert);
              const { data: insertedAppointment, error: apptErr } = await supabase
                .from("appointments")
                .insert(appointmentInsert)
                .select("id")
                .single();
              if (apptErr) console.error("[vapi-webhook] appointment insert full error:", apptErr);
              else console.log("[vapi-webhook] appointment insert result", insertedAppointment);
            } else {
              console.log("[vapi-webhook] no appointment time extracted; appointment insert skipped");
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
