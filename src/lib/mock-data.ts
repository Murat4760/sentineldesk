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
    notes?: string;
  };
}

const names = [
  "Sarah Johnson", "Michael Chen", "Emily Rodriguez", "David Park", "Jessica Williams",
  "Brandon Miller", "Ashley Thompson", "Christopher Lee", "Amanda Garcia", "Tyler Brooks",
  "Olivia Martinez", "Ethan Davis", "Sophia Wilson", "Jacob Anderson", "Isabella Moore",
  "Ryan Taylor", "Mia Jackson", "Daniel White", "Ava Harris", "Matthew Clark",
  "Charlotte Lewis", "Joshua Walker", "Amelia Young", "Andrew Hall", "Harper Allen",
  "Nathan King", "Evelyn Wright", "Samuel Scott", "Abigail Green", "Benjamin Adams",
];

const outcomes: Outcome[] = ["booked", "booked", "booked", "info", "info", "missed", "voicemail", "transferred"];
const sentiments: Sentiment[] = ["positive", "positive", "positive", "neutral", "neutral", "negative"];

const sampleScripts = [
  [
    { role: "ai", text: "Hi, thanks for calling Smile Dental. How can I help you today?", time: "00:00" },
    { role: "caller", text: "Hi, I'd like to book a cleaning appointment.", time: "00:04" },
    { role: "ai", text: "Of course! Are you a current patient with us?", time: "00:08" },
    { role: "caller", text: "Yes, I've been there a couple of times.", time: "00:12" },
    { role: "ai", text: "Great. Can I get your full name and date of birth?", time: "00:16" },
    { role: "caller", text: "Sure, it's Sarah Johnson, March 14th 1989.", time: "00:22" },
    { role: "ai", text: "Found you. We have openings Friday at 9am or Monday at 11am.", time: "00:30" },
    { role: "caller", text: "Friday at 9 works perfectly.", time: "00:36" },
    { role: "ai", text: "Booked. You'll get a text confirmation shortly. Anything else?", time: "00:42" },
    { role: "caller", text: "No that's it, thank you!", time: "00:48" },
    { role: "ai", text: "Have a wonderful day.", time: "00:51" },
  ],
  [
    { role: "ai", text: "Thanks for calling Allbright HVAC. What can I do for you?", time: "00:00" },
    { role: "caller", text: "My AC stopped cooling last night.", time: "00:04" },
    { role: "ai", text: "Sorry to hear that. Is the unit running but not cooling, or not running at all?", time: "00:09" },
    { role: "caller", text: "It's running but blowing warm air.", time: "00:15" },
    { role: "ai", text: "Got it. We can dispatch a technician today between 2pm and 5pm.", time: "00:22" },
    { role: "caller", text: "Perfect, please send someone.", time: "00:28" },
    { role: "ai", text: "Confirmed. The trip fee is $89 and applies to repairs if approved.", time: "00:34" },
    { role: "caller", text: "Understood. Thanks.", time: "00:40" },
  ],
  [
    { role: "ai", text: "Hi, this is Ringly for Beverly Salon. How can I help?", time: "00:00" },
    { role: "caller", text: "Do you have a slot for highlights this Saturday?", time: "00:05" },
    { role: "ai", text: "Let me check. We have 10:30am with Tasha or 3pm with Maria.", time: "00:12" },
    { role: "caller", text: "10:30 with Tasha.", time: "00:18" },
    { role: "ai", text: "Booked. Heads up — highlights take about 2.5 hours.", time: "00:24" },
    { role: "caller", text: "Got it, thanks!", time: "00:30" },
  ],
];

const services = ["Teeth cleaning", "AC repair", "Highlights", "Consultation", "Inspection", "Tune-up"];
const intents = ["book_appointment", "request_info", "reschedule", "billing_question", "emergency"];

function pad(n: number) { return n < 10 ? `0${n}` : `${n}`; }
function phone(i: number) {
  const a = 200 + (i * 37) % 700;
  const b = 1000 + (i * 113) % 9000;
  return `+1 (415) 555-${pad(a % 100)}${pad(b % 100)}`.slice(0, 17);
}

export const mockCalls: Call[] = Array.from({ length: 34 }).map((_, i) => {
  const hoursAgo = i * 1.7;
  const ts = new Date(Date.now() - hoursAgo * 3600 * 1000);
  const outcome = outcomes[i % outcomes.length];
  const sentiment = outcome === "missed" || outcome === "voicemail" ? "negative" : sentiments[i % sentiments.length];
  return {
    id: `call_${(i + 1).toString(36).padStart(6, "0")}`,
    callerName: names[i % names.length],
    callerPhone: phone(i),
    timestamp: ts.toISOString(),
    duration: 45 + ((i * 23) % 240),
    outcome,
    sentiment,
    transcript: sampleScripts[i % sampleScripts.length] as TranscriptTurn[],
    extracted: {
      intent: intents[i % intents.length],
      service: services[i % services.length],
      preferredDate: new Date(Date.now() + (i % 7) * 86400000).toISOString().slice(0, 10),
      preferredTime: ["Morning", "Afternoon", "Evening"][i % 3],
      isNewPatient: i % 2 === 0,
      notes: i % 3 === 0 ? "Prefers Dr. Chen" : i % 3 === 1 ? "Allergic to latex" : "Repeat customer",
    },
  };
});

export interface Appointment {
  id: string;
  customer: string;
  service: string;
  date: string;
  time: string;
  duration: number;
  status: "confirmed" | "pending" | "cancelled";
}

export const mockAppointments: Appointment[] = Array.from({ length: 24 }).map((_, i) => {
  const date = new Date();
  date.setDate(date.getDate() + (i % 14) - 3);
  const hour = 8 + (i * 2) % 10;
  return {
    id: `appt_${i + 1}`,
    customer: names[i % names.length],
    service: services[i % services.length],
    date: date.toISOString().slice(0, 10),
    time: `${pad(hour)}:${i % 2 === 0 ? "00" : "30"}`,
    duration: [30, 45, 60, 90][i % 4],
    status: (["confirmed", "confirmed", "confirmed", "pending", "cancelled"] as const)[i % 5],
  };
});

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

export const mockCustomers: Customer[] = Array.from({ length: 18 }).map((_, i) => ({
  id: `cust_${i + 1}`,
  name: names[i % names.length],
  phone: phone(i + 7),
  email: names[i % names.length].toLowerCase().replace(" ", ".") + "@example.com",
  totalCalls: 1 + (i * 3) % 12,
  lastContact: new Date(Date.now() - (i * 86400000)).toISOString(),
  tags: [["vip", "repeat"], ["new"], ["repeat"], ["follow-up"], ["vip"]][i % 5],
  lifetimeValue: 200 + ((i * 187) % 4800),
}));

export const voices = [
  { id: "ava", name: "Ava", traits: "Warm, professional", accent: "American" },
  { id: "mason", name: "Mason", traits: "Calm, confident", accent: "American" },
  { id: "luna", name: "Luna", traits: "Friendly, upbeat", accent: "American" },
  { id: "oliver", name: "Oliver", traits: "Polished, articulate", accent: "British" },
  { id: "zoe", name: "Zoe", traits: "Bright, energetic", accent: "American" },
  { id: "kai", name: "Kai", traits: "Smooth, reassuring", accent: "Australian" },
];

export const callsPerDay = Array.from({ length: 14 }).map((_, i) => ({
  day: new Date(Date.now() - (13 - i) * 86400000).toLocaleDateString("en", { month: "short", day: "numeric" }),
  calls: 20 + Math.round(Math.sin(i / 2) * 12) + (i * 2),
}));

export const outcomeBreakdown = [
  { name: "Booked", value: 142, color: "var(--color-success)" },
  { name: "Info", value: 87, color: "var(--color-primary)" },
  { name: "Voicemail", value: 31, color: "var(--color-muted-foreground)" },
  { name: "Missed", value: 14, color: "var(--color-destructive)" },
];

export const topicBreakdown = [
  { topic: "Appointment booking", count: 142 },
  { topic: "Pricing inquiry", count: 64 },
  { topic: "Hours & location", count: 41 },
  { topic: "Reschedule", count: 28 },
  { topic: "Billing question", count: 19 },
  { topic: "Other", count: 12 },
];
