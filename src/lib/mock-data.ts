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
  "Ayşe Yılmaz", "Mehmet Demir", "Zeynep Kaya", "Can Öztürk", "Elif Şahin",
  "Murat Çelik", "Selin Aydın", "Burak Doğan", "Deniz Arslan", "Ece Polat",
  "Emre Koç", "Gizem Erdoğan", "Kerem Yıldız", "Pınar Aksoy", "Tolga Güneş",
  "Hülya Acar", "Onur Tekin", "Berna Aslan", "Serkan Yavuz", "Melis Bulut",
  "Hakan Sönmez", "Ceren Eren", "Yusuf Bilgin", "Aslı Tunç", "Barış Korkmaz",
  "Sevgi Çetin", "Furkan Aktaş", "Nazlı Özdemir", "Cem Uçar", "Defne Karaca",
];

const outcomes: Outcome[] = ["booked", "booked", "booked", "info", "info", "missed", "voicemail", "transferred"];
const sentiments: Sentiment[] = ["positive", "positive", "positive", "neutral", "neutral", "negative"];

const sampleScripts = [
  [
    { role: "ai", text: "Merhaba, Beyaz Diş Polikliniği'ne hoş geldiniz. Size nasıl yardımcı olabilirim?", time: "00:00" },
    { role: "caller", text: "Merhaba, diş temizliği için randevu almak istiyorum.", time: "00:04" },
    { role: "ai", text: "Tabii ki, daha önce kliniğimize geldiniz mi?", time: "00:08" },
    { role: "caller", text: "Hayır, ilk defa arıyorum.", time: "00:12" },
    { role: "ai", text: "Anladım. Hangi gün sizin için uygun olur?", time: "00:16" },
    { role: "caller", text: "Perşembe öğleden sonra olabilir mi?", time: "00:22" },
    { role: "ai", text: "Perşembe 14:00 ve 16:00 arası müsait. Hangisi sizin için iyi?", time: "00:30" },
    { role: "caller", text: "15:00 olur.", time: "00:36" },
    { role: "ai", text: "Harika. İsim ve telefon numaranızı alabilir miyim?", time: "00:42" },
    { role: "caller", text: "Ayşe Yılmaz, 0532 555 0142.", time: "00:48" },
    { role: "ai", text: "Teşekkürler Ayşe Hanım, randevunuz Perşembe 15:00 için onaylandı. SMS göndereceğim.", time: "00:54" },
  ],
  [
    { role: "ai", text: "Anadolu Klima Servis, iyi günler. Size nasıl yardımcı olabilirim?", time: "00:00" },
    { role: "caller", text: "Klimam soğutmuyor, dün geceden beri böyle.", time: "00:04" },
    { role: "ai", text: "Çalışıyor ama sıcak hava mı üflüyor, yoksa hiç açılmıyor mu?", time: "00:09" },
    { role: "caller", text: "Çalışıyor ama soğutmuyor.", time: "00:15" },
    { role: "ai", text: "Anladım. Bugün 14:00 ile 17:00 arası teknisyen gönderebiliriz.", time: "00:22" },
    { role: "caller", text: "Tamam, lütfen birini gönderin. Adresim Beylikdüzü.", time: "00:28" },
    { role: "ai", text: "Onaylandı. Servis ücreti 450 TL, onarım onaylanırsa düşülür.", time: "00:34" },
    { role: "caller", text: "Anlaşıldı, teşekkürler.", time: "00:40" },
  ],
  [
    { role: "ai", text: "Patiland Veteriner, merhaba. Nasıl yardımcı olabilirim?", time: "00:00" },
    { role: "caller", text: "Cumartesi kedim için aşı randevusu var mı?", time: "00:05" },
    { role: "ai", text: "Cumartesi 10:30 ve 15:00 müsait.", time: "00:12" },
    { role: "caller", text: "10:30 mükemmel.", time: "00:18" },
    { role: "ai", text: "Onaylandı. Kedinizin ismini ve cinsini alabilir miyim?", time: "00:24" },
    { role: "caller", text: "Pamuk, British Shorthair.", time: "00:30" },
    { role: "ai", text: "Kaydettim. Cumartesi 10:30'da görüşürüz.", time: "00:36" },
  ],
];

const services = ["Diş temizliği", "Klima bakımı", "Aşı", "Konsültasyon", "Muayene", "Rezervasyon"];
const intents = ["randevu_al", "bilgi_al", "ertele", "fatura_sorusu", "acil"];

function pad(n: number) { return n < 10 ? `0${n}` : `${n}`; }
function phone(i: number) {
  const prefixes = ["532", "533", "535", "537", "538", "541", "544", "545"];
  const p = prefixes[i % prefixes.length];
  const mid = String(100 + (i * 37) % 900);
  const tail = String(1000 + (i * 113) % 9000);
  return `+90 ${p} ${mid} ${tail.slice(0, 4)}`;
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
      preferredTime: ["Sabah", "Öğleden sonra", "Akşam"][i % 3],
      isNewPatient: i % 2 === 0,
      notes: i % 3 === 0 ? "Dr. Kaya'yı tercih ediyor" : i % 3 === 1 ? "Lateks alerjisi var" : "Sadık müşteri",
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

const slugify = (s: string) => s
  .toLowerCase()
  .replace(/ı/g, "i").replace(/ş/g, "s").replace(/ç/g, "c")
  .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ö/g, "o")
  .replace(/\s+/g, ".");

export const mockCustomers: Customer[] = Array.from({ length: 18 }).map((_, i) => ({
  id: `cust_${i + 1}`,
  name: names[i % names.length],
  phone: phone(i + 7),
  email: slugify(names[i % names.length]) + "@ornek.com",
  totalCalls: 1 + (i * 3) % 12,
  lastContact: new Date(Date.now() - (i * 86400000)).toISOString(),
  tags: [["vip", "sadık"], ["yeni"], ["sadık"], ["takip"], ["vip"]][i % 5],
  lifetimeValue: 800 + ((i * 187) % 14800),
}));

export const voices = [
  { id: "zeynep", name: "Zeynep", traits: "Sıcak, profesyonel", accent: "Türkçe" },
  { id: "mehmet", name: "Mehmet", traits: "Güvenli, samimi", accent: "Türkçe" },
  { id: "elif", name: "Elif", traits: "Genç, enerjik", accent: "Türkçe" },
  { id: "can", name: "Can", traits: "Sakin, dengeli", accent: "Türkçe" },
  { id: "selin", name: "Selin", traits: "Kibar, kurumsal", accent: "Türkçe" },
  { id: "kerem", name: "Kerem", traits: "Net, güven veren", accent: "Türkçe" },
];

export const callsPerDay = Array.from({ length: 14 }).map((_, i) => ({
  day: new Date(Date.now() - (13 - i) * 86400000).toLocaleDateString("tr-TR", { month: "short", day: "numeric" }),
  calls: 20 + Math.round(Math.sin(i / 2) * 12) + (i * 2),
}));

export const outcomeBreakdown = [
  { name: "Randevu", value: 142, color: "var(--color-success)" },
  { name: "Bilgi", value: 87, color: "var(--color-primary)" },
  { name: "Sesli mesaj", value: 31, color: "var(--color-muted-foreground)" },
  { name: "Kaçırılan", value: 14, color: "var(--color-destructive)" },
];

export const topicBreakdown = [
  { topic: "Randevu alma", count: 142 },
  { topic: "Fiyat sorgusu", count: 64 },
  { topic: "Saatler ve konum", count: 41 },
  { topic: "Erteleme", count: 28 },
  { topic: "Fatura sorusu", count: 19 },
  { topic: "Diğer", count: 12 },
];
