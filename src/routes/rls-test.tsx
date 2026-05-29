import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Loader2, Play, Trash2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/rls-test")({
  head: () => ({
    meta: [
      { title: "RLS Test Paneli — Sentinel" },
      { name: "description", content: "Owner/workspace bazlı RLS kurallarını örnek verilerle test eder." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RlsTest,
});

type Status = "pending" | "running" | "pass" | "fail";

interface Result {
  key: string;
  label: string;
  status: Status;
  detail?: string;
}

const TEST_TAG = "__rls_test__";
const TEST_PHONE = "+90000RLS0000";

function StatusIcon({ status }: { status: Status }) {
  if (status === "running") return <Loader2 className="size-4 animate-spin text-muted-foreground" />;
  if (status === "pass") return <CheckCircle2 className="size-4 text-[color:var(--color-success)]" />;
  if (status === "fail") return <XCircle className="size-4 text-destructive" />;
  return <span className="size-4 inline-block rounded-full border border-border" />;
}

function RlsTest() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<Result[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
      setUserEmail(data.user?.email ?? null);
    });
  }, []);

  function setResult(key: string, label: string, status: Status, detail?: string) {
    setResults((prev) => {
      const existing = prev.find((r) => r.key === key);
      if (existing) return prev.map((r) => (r.key === key ? { ...r, status, detail } : r));
      return [...prev, { key, label, status, detail }];
    });
  }

  async function runTests() {
    if (!userId) return;
    setRunning(true);
    setResults([]);

    const tests: { key: string; label: string }[] = [
      { key: "insert_customer", label: "Müşteri ekle (owner = ben)" },
      { key: "read_customer", label: "Eklenen müşteri görünür mü" },
      { key: "insert_call", label: "Çağrı ekle (owner = ben)" },
      { key: "insert_appointment", label: "Randevu ekle (owner = ben)" },
      { key: "reject_foreign_customer", label: "Başkasına ait müşteri reddedilmeli" },
      { key: "scope_counts", label: "Yalnızca kendi kayıtlarım listeleniyor" },
    ];
    tests.forEach((t) => setResult(t.key, t.label, "running"));

    let customerId: string | null = null;

    // 1. Insert customer with own owner_id
    try {
      const { data, error } = await supabase
        .from("customers")
        .insert({ phone: TEST_PHONE, name: "RLS Test Müşteri", owner_id: userId, tags: [TEST_TAG] })
        .select("id")
        .single();
      if (error) throw error;
      customerId = data.id;
      setResult("insert_customer", tests[0].label, "pass", `id: ${data.id.slice(0, 8)}…`);
    } catch (e) {
      setResult("insert_customer", tests[0].label, "fail", msg(e));
    }

    // 2. Read it back
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("id, owner_id")
        .eq("phone", TEST_PHONE);
      if (error) throw error;
      const allOwned = data.every((r) => r.owner_id === userId);
      if (data.length > 0 && allOwned) {
        setResult("read_customer", tests[1].label, "pass", `${data.length} kayıt, hepsi bana ait`);
      } else {
        setResult("read_customer", tests[1].label, "fail", `${data.length} kayıt, sahiplik uyuşmuyor`);
      }
    } catch (e) {
      setResult("read_customer", tests[1].label, "fail", msg(e));
    }

    // 3. Insert call
    try {
      const { error } = await supabase.from("calls").insert({
        caller_phone: TEST_PHONE,
        caller_name: "RLS Test",
        duration: 0,
        outcome: "info",
        owner_id: userId,
        customer_id: customerId,
        extracted_data: { tag: TEST_TAG },
      });
      if (error) throw error;
      setResult("insert_call", tests[2].label, "pass", "çağrı eklendi");
    } catch (e) {
      setResult("insert_call", tests[2].label, "fail", msg(e));
    }

    // 4. Insert appointment
    try {
      const { error } = await supabase.from("appointments").insert({
        customer_name: "RLS Test",
        customer_phone: TEST_PHONE,
        service: "Test",
        appointment_datetime: new Date().toISOString(),
        status: "pending",
        owner_id: userId,
        customer_id: customerId,
        notes: TEST_TAG,
      });
      if (error) throw error;
      setResult("insert_appointment", tests[3].label, "pass", "randevu eklendi");
    } catch (e) {
      setResult("insert_appointment", tests[3].label, "fail", msg(e));
    }

    // 5. Try to insert a customer owned by someone else -> must be rejected by WITH CHECK
    try {
      const fakeOwner = "00000000-0000-0000-0000-000000000000";
      const { error } = await supabase
        .from("customers")
        .insert({ phone: TEST_PHONE + "X", name: "Yabancı", owner_id: fakeOwner, tags: [TEST_TAG] });
      if (error) {
        setResult("reject_foreign_customer", tests[4].label, "pass", "RLS doğru şekilde reddetti");
      } else {
        // It got inserted -> RLS is too permissive. Clean it up.
        await supabase.from("customers").delete().eq("phone", TEST_PHONE + "X");
        setResult("reject_foreign_customer", tests[4].label, "fail", "Reddedilmeliydi ama kabul edildi!");
      }
    } catch (e) {
      setResult("reject_foreign_customer", tests[4].label, "pass", "RLS doğru şekilde reddetti");
    }

    // 6. Scope check: every visible row across tables belongs to me
    try {
      const [c, ca, ap] = await Promise.all([
        supabase.from("customers").select("owner_id"),
        supabase.from("calls").select("owner_id"),
        supabase.from("appointments").select("owner_id"),
      ]);
      const rows = [...(c.data ?? []), ...(ca.data ?? []), ...(ap.data ?? [])];
      const foreign = rows.filter((r) => r.owner_id && r.owner_id !== userId).length;
      if (foreign === 0) {
        setResult("scope_counts", tests[5].label, "pass", `${rows.length} kayıt görünür, hiçbiri başkasına ait değil`);
      } else {
        setResult("scope_counts", tests[5].label, "fail", `${foreign} kayıt başka kullanıcıya ait!`);
      }
    } catch (e) {
      setResult("scope_counts", tests[5].label, "fail", msg(e));
    }

    setRunning(false);
  }

  async function cleanup() {
    setRunning(true);
    try {
      // appointments + customers have DELETE policies for the owner
      await supabase.from("appointments").delete().eq("customer_phone", TEST_PHONE);
      const cust = await supabase.from("customers").delete().eq("phone", TEST_PHONE);
      // calls has no DELETE policy for authenticated users -> report below
      const calls = await supabase.from("calls").delete().eq("caller_phone", TEST_PHONE);
      setResult(
        "cleanup",
        "Örnek verileri temizle",
        "pass",
        calls.error
          ? "Müşteri/randevu silindi. (Çağrılar için DELETE politikası yok — kalıcı olabilir.)"
          : "Tüm örnek veriler silindi.",
      );
      if (cust.error) throw cust.error;
    } catch (e) {
      setResult("cleanup", "Örnek verileri temizle", "fail", msg(e));
    }
    setRunning(false);
  }

  if (userId === null) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <div className="max-w-sm text-center">
          <ShieldCheck className="size-8 mx-auto text-muted-foreground" />
          <h1 className="mt-4 text-xl font-semibold">Giriş gerekli</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            RLS testleri giriş yapmış bir kullanıcı olarak çalışır. Lütfen önce giriş yapın.
          </p>
          <Link
            to="/login"
            search={{ redirect: "/rls-test" }}
            className="mt-6 inline-flex h-10 px-4 items-center rounded-md bg-foreground text-background text-sm font-medium hover:opacity-90 transition"
          >
            Giriş yap
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">RLS Test Paneli</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              customers · calls · appointments — owner bazlı kurallar
            </p>
            <p className="mt-1 text-xs text-muted-foreground break-all">
              Kullanıcı: {userEmail} ({userId.slice(0, 8)}…)
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={runTests}
              disabled={running}
              className="h-9 px-3 rounded-md bg-foreground text-background text-sm inline-flex items-center gap-2 hover:opacity-90 transition disabled:opacity-60"
            >
              <Play className="size-3.5" /> Testleri çalıştır
            </button>
            <button
              onClick={cleanup}
              disabled={running}
              className="h-9 px-3 rounded-md border border-border bg-card text-sm inline-flex items-center gap-2 hover:border-foreground/20 transition disabled:opacity-60"
            >
              <Trash2 className="size-3.5" /> Temizle
            </button>
          </div>
        </div>

        {results.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            Örnek verilerle RLS kurallarını doğrulamak için “Testleri çalıştır”a basın.
          </div>
        ) : (
          <div className="mt-8 rounded-xl border border-border bg-card divide-y divide-border">
            {results.map((r) => (
              <div key={r.key} className="flex items-center gap-3 p-4">
                <StatusIcon status={r.status} />
                <div className="flex-1">
                  <div className="text-sm font-medium">{r.label}</div>
                  {r.detail && (
                    <div className="text-xs text-muted-foreground mt-0.5 break-all">{r.detail}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="mt-6 text-xs text-muted-foreground">
          Bu panel gerçek tablolara örnek kayıtlar yazar. Bittiğinde “Temizle” ile kaldırın.
          Örnek kayıtlar <code className="font-mono">{TEST_PHONE}</code> telefonuyla işaretlenir.
        </p>
      </div>
    </div>
  );
}

function msg(e: unknown): string {
  return e instanceof Error ? e.message : "Bilinmeyen hata";
}
