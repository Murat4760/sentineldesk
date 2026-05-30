import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ---------- Shared UI types ----------
export type Outcome = "booked" | "info" | "missed" | "voicemail" | "transferred";
export type Sentiment = "positive" | "neutral" | "negative";

export interface TranscriptTurn {
  role: "ai" | "caller";
  text: string;
  time: string;
}

export interface Call {
  id: string;
  callerName: string;
  callerPhone: string;
  timestamp: string;
  duration: number;
  outcome: Outcome;
  sentiment: Sentiment;
  transcript: TranscriptTurn[];
  extracted: {
    intent: string;
    service?: string;
    preferredDate?: string;
    preferredTime?: string;
    isNewPatient?: boolean;
    businessHours?: boolean;
    notes?: string;
  };
}

export interface Appointment {
  id: string;
  customer: string;
  service: string;
  date: string;
  time: string;
  duration: number;
  status: "confirmed" | "pending" | "cancelled";
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalCalls: number;
  lastContact: string;
  tags: string[];
  lifetimeValue: number;
}

// ---------- Mappers ----------
const OUTCOMES: Outcome[] = ["booked", "info", "missed", "voicemail", "transferred"];
const SENTIMENTS: Sentiment[] = ["positive", "neutral", "negative"];

function asOutcome(v: unknown): Outcome {
  return OUTCOMES.includes(v as Outcome) ? (v as Outcome) : "info";
}
function asSentiment(v: unknown): Sentiment {
  return SENTIMENTS.includes(v as Sentiment) ? (v as Sentiment) : "neutral";
}

function mapTranscript(raw: unknown): TranscriptTurn[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((t): TranscriptTurn | null => {
      if (!t || typeof t !== "object") return null;
      const o = t as Record<string, unknown>;
      const text = String(o.text ?? o.message ?? o.content ?? "");
      if (!text) return null;
      const role = String(o.role ?? "");
      const isCaller = role === "caller" || role === "user" || role === "human";
      return {
        role: isCaller ? "caller" : "ai",
        text,
        time: String(o.time ?? o.timestamp ?? ""),
      };
    })
    .filter((t): t is TranscriptTurn => t !== null);
}

type CallRow = {
  id: string;
  caller_name: string | null;
  caller_phone: string;
  duration: number;
  outcome: string | null;
  sentiment: string | null;
  transcript: unknown;
  extracted_data: unknown;
  started_at: string | null;
  created_at: string;
};

function mapCall(r: CallRow): Call {
  const ex = (r.extracted_data && typeof r.extracted_data === "object" ? r.extracted_data : {}) as Record<string, unknown>;
  return {
    id: r.id,
    callerName: r.caller_name || "Bilinmiyor",
    callerPhone: r.caller_phone || "—",
    timestamp: r.started_at || r.created_at,
    duration: r.duration ?? 0,
    outcome: asOutcome(r.outcome),
    sentiment: asSentiment(r.sentiment),
    transcript: mapTranscript(r.transcript),
    extracted: {
      intent: String(ex.intent ?? "—"),
      service: ex.service != null ? String(ex.service) : undefined,
      preferredDate: ex.preferredDate != null ? String(ex.preferredDate) : undefined,
      preferredTime: ex.preferredTime != null ? String(ex.preferredTime) : undefined,
      isNewPatient: typeof ex.isNewPatient === "boolean" ? ex.isNewPatient : undefined,
      notes: ex.notes != null ? String(ex.notes) : undefined,
    },
  };
}

type ApptRow = {
  id: string;
  customer_name: string | null;
  service: string | null;
  appointment_datetime: string;
  status: string;
  notes: string | null;
};

function mapAppointment(r: ApptRow): Appointment {
  const dt = new Date(r.appointment_datetime);
  const status = (["confirmed", "pending", "cancelled"].includes(r.status) ? r.status : "pending") as Appointment["status"];
  return {
    id: r.id,
    customer: r.customer_name || "—",
    service: r.service || "—",
    date: dt.toISOString().slice(0, 10),
    time: dt.toTimeString().slice(0, 5),
    duration: 30,
    status,
  };
}

type CustomerRow = {
  id: string;
  name: string | null;
  phone: string;
  email: string | null;
  total_calls: number;
  last_call_at: string | null;
  tags: string[] | null;
  created_at: string;
};

function mapCustomer(r: CustomerRow): Customer {
  return {
    id: r.id,
    name: r.name || "—",
    phone: r.phone || "—",
    email: r.email || "—",
    totalCalls: r.total_calls ?? 0,
    lastContact: r.last_call_at || r.created_at,
    tags: Array.isArray(r.tags) ? r.tags : [],
    lifetimeValue: 0,
  };
}

// ---------- Query options (RLS scopes to logged-in user) ----------
export const callsQueryOptions = queryOptions({
  queryKey: ["calls"],
  queryFn: async (): Promise<Call[]> => {
    const { data, error } = await supabase
      .from("calls")
      .select("id, caller_name, caller_phone, duration, outcome, sentiment, transcript, extracted_data, started_at, created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r) => mapCall(r as CallRow));
  },
});

export const appointmentsQueryOptions = queryOptions({
  queryKey: ["appointments"],
  queryFn: async (): Promise<Appointment[]> => {
    const { data, error } = await supabase
      .from("appointments")
      .select("id, customer_name, service, appointment_datetime, status, notes")
      .order("appointment_datetime", { ascending: true });
    if (error) throw error;
    return (data ?? []).map((r) => mapAppointment(r as ApptRow));
  },
});

export const customersQueryOptions = queryOptions({
  queryKey: ["customers"],
  queryFn: async (): Promise<Customer[]> => {
    const { data, error } = await supabase
      .from("customers")
      .select("id, name, phone, email, total_calls, last_call_at, tags, created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r) => mapCustomer(r as CustomerRow));
  },
});

// ---------- Analytics helpers (computed from real calls) ----------
export function buildCallsPerDay(calls: Call[], days = 14) {
  const buckets: { day: string; calls: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("tr-TR", { month: "short", day: "numeric" });
    buckets.push({
      day: label,
      calls: calls.filter((c) => c.timestamp.slice(0, 10) === key).length,
    });
  }
  return buckets;
}

export function buildOutcomeBreakdown(calls: Call[]) {
  const defs: { name: string; key: Outcome; color: string }[] = [
    { name: "Randevu", key: "booked", color: "var(--color-success)" },
    { name: "Bilgi", key: "info", color: "var(--color-primary)" },
    { name: "Sesli mesaj", key: "voicemail", color: "var(--color-muted-foreground)" },
    { name: "Kaçırılan", key: "missed", color: "var(--color-destructive)" },
  ];
  return defs.map((d) => ({
    name: d.name,
    color: d.color,
    value: calls.filter((c) => c.outcome === d.key).length,
  }));
}

export function buildTopicBreakdown(calls: Call[]) {
  const counts = new Map<string, number>();
  for (const c of calls) {
    const topic = c.extracted.intent || "Diğer";
    counts.set(topic, (counts.get(topic) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}
