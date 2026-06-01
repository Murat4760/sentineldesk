import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout, LegalSection, LegalList } from "@/components/legal/LegalPage";

export const Route = createFileRoute("/kvkk")({
  head: () => ({
    meta: [
      { title: "KVKK Aydınlatma Metni — Sentinel" },
      {
        name: "description",
        content:
          "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında Sentinel aydınlatma metni.",
      },
    ],
  }),
  component: KvkkPage,
});

function KvkkPage() {
  return (
    <LegalLayout
      title="KVKK Aydınlatma Metni"
      subtitle="6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında, kişisel verilerinizin işlenmesine ilişkin olarak ilgili kişileri bilgilendirmek amacıyla hazırlanmıştır."
      updated="1 Haziran 2026"
    >
      <LegalSection heading="1. Veri Sorumlusunun Kimliği">
        <p>
          Kişisel verileriniz, veri sorumlusu sıfatıyla Sentinel hizmetini
          kullanan ilgili işletme (“İşletme”) ve hizmet altyapısını sağlayan
          Sentinel tarafından, 6698 sayılı Kanun kapsamında işlenmektedir.
          İşletme, kendi müşterilerine ait kişisel veriler bakımından veri
          sorumlusu konumundadır.
        </p>
      </LegalSection>

      <LegalSection heading="2. Kişisel Verilerin İşlenme Amacı">
        <p>Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
        <LegalList
          items={[
            "Gelen telefon aramalarının yanıtlanması",
            "Randevu ve rezervasyon süreçlerinin yürütülmesi",
            "Hizmet kalitesinin ölçülmesi ve iyileştirilmesi",
            "Müşteri ilişkilerinin yönetilmesi",
            "Hukuki yükümlülüklerin yerine getirilmesi",
          ]}
        />
      </LegalSection>

      <LegalSection heading="3. Kişisel Verilerin İşlenmesinin Hukuki Sebebi">
        <p>
          Kişisel verileriniz, KVKK madde 5 uyarınca; açık rızanızın bulunması
          ile birlikte, bir sözleşmenin kurulması veya ifasıyla doğrudan doğruya
          ilgili olması ve veri sorumlusunun meşru menfaati hukuki sebeplerine
          dayanılarak işlenmektedir.
        </p>
      </LegalSection>

      <LegalSection heading="4. Aktarılan Taraflar ve Yurt Dışı Veri Aktarımı">
        <p>
          Kişisel verileriniz, hizmetin sunulabilmesi amacıyla yurt içi ve yurt
          dışında yerleşik hizmet sağlayıcılara (veri işleyenlere) aktarılmaktadır.
          Söz konusu aktarım, AB ve ABD sunucularında barındırılan altyapı
          hizmetleri (örneğin Vapi, Telnyx, ElevenLabs, OpenAI, Supabase)
          aracılığıyla gerçekleştirilebilir. Yurt dışı aktarım, KVKK madde 9
          kapsamında açık rızanız ve gerekli güvenlik tedbirleri çerçevesinde
          yapılır.
        </p>
      </LegalSection>

      <LegalSection heading="5. Veri Sahibinin Hakları (KVKK Madde 11)">
        <p>
          Kanun’un 11. maddesi uyarınca, veri sorumlusuna başvurarak aşağıdaki
          haklarınızı kullanabilirsiniz:
        </p>
        <LegalList
          items={[
            "Kişisel verilerinizin işlenip işlenmediğini öğrenme",
            "İşlenmişse buna ilişkin bilgi talep etme",
            "İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme",
            "Yurt içinde veya yurt dışında verilerin aktarıldığı üçüncü kişileri bilme",
            "Eksik veya yanlış işlenmişse düzeltilmesini isteme",
            "Kanunda öngörülen şartlarda silinmesini veya yok edilmesini isteme",
            "Düzeltme, silme ve yok etme işlemlerinin aktarıldığı üçüncü kişilere bildirilmesini isteme",
            "İşlenen verilerin münhasıran otomatik sistemlerle analizi sonucu aleyhinize bir sonuç çıkmasına itiraz etme",
            "Kanuna aykırı işleme sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme",
          ]}
        />
      </LegalSection>

      <LegalSection heading="6. Başvuru Yöntemi">
        <p>
          KVKK madde 11 kapsamındaki haklarınıza ilişkin taleplerinizi,{" "}
          <a
            href="mailto:privacy@sentineldesk.com"
            className="text-[#6B8FFF] hover:underline"
          >
            privacy@sentineldesk.com
          </a>{" "}
          adresine yazılı olarak iletebilirsiniz. Başvurularınız, talebin
          niteliğine göre en kısa sürede ve en geç 30 (otuz) gün içinde
          ücretsiz olarak sonuçlandırılır.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
