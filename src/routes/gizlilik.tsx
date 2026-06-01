import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout, LegalSection, LegalList } from "@/components/legal/LegalPage";

export const Route = createFileRoute("/gizlilik")({
  head: () => ({
    meta: [
      { title: "Gizlilik Politikası — Sentinel" },
      {
        name: "description",
        content:
          "Sentinel gizlilik politikası: hangi kişisel verileri topladığımız, nasıl kullandığımız, nerede sakladığımız ve haklarınız.",
      },
    ],
  }),
  component: GizlilikPage,
});

function GizlilikPage() {
  return (
    <LegalLayout
      title="Gizlilik Politikası"
      subtitle="Sentinel olarak kişisel verilerinizin gizliliğine önem veriyoruz. Bu politika, hizmetlerimizi kullanırken verilerinizin nasıl işlendiğini açıklar."
      updated="1 Haziran 2026"
    >
      <LegalSection heading="1. Topladığımız Veriler">
        <p>
          Sentinel hizmetini sunarken, sizin ve işletmenizi arayan kişilere ait
          aşağıdaki kişisel veriler işlenmektedir:
        </p>
        <LegalList
          items={[
            "Ad ve soyad bilgisi",
            "Telefon numarası",
            "Arama ses kayıtları",
            "Arama metin dökümleri (transcript)",
            "Randevu ve rezervasyon bilgileri",
            "Hesap bilgileri (e-posta adresi, işletme adı)",
          ]}
        />
      </LegalSection>

      <LegalSection heading="2. Verilerin Kullanım Amaçları">
        <p>Toplanan kişisel veriler şu amaçlarla kullanılır:</p>
        <LegalList
          items={[
            "Gelen aramaların yanıtlanması ve randevuların yönetilmesi",
            "Hizmetin sağlanması, sürdürülmesi ve iyileştirilmesi",
            "Hizmet kalitesinin ölçülmesi ve müşteri desteği sağlanması",
            "Yasal yükümlülüklerin yerine getirilmesi",
          ]}
        />
      </LegalSection>

      <LegalSection heading="3. Verilerin Saklandığı Yer">
        <p>
          Kişisel verileriniz, altyapı sağlayıcımız Supabase aracılığıyla Avrupa
          Birliği (AB) sunucularında güvenli bir şekilde saklanmaktadır. Verilere
          erişim, yetkili personel ve veri işleyenlerle sınırlıdır.
        </p>
      </LegalSection>

      <LegalSection heading="4. Üçüncü Taraflar (Veri İşleyenler)">
        <p>
          Hizmetimizi sunabilmek için aşağıdaki üçüncü taraf hizmet sağlayıcıları
          veri işleyen sıfatıyla kullanmaktayız:
        </p>
        <LegalList
          items={[
            "Vapi — sesli yapay zekâ asistanı altyapısı",
            "Telnyx — telefon ve arama altyapısı",
            "ElevenLabs — ses sentezi (seslendirme)",
            "OpenAI — doğal dil işleme ve yanıt üretimi",
            "Supabase — veritabanı ve dosya depolama",
          ]}
        />
        <p>
          Bu sağlayıcılar yalnızca hizmetin gerektirdiği ölçüde ve sözleşmesel
          gizlilik yükümlülükleri çerçevesinde veri işler.
        </p>
      </LegalSection>

      <LegalSection heading="5. Saklama Süresi">
        <p>
          Arama ses kayıtları ve metin dökümleri, oluşturuldukları tarihten
          itibaren 90 (doksan) gün boyunca saklanır ve bu sürenin sonunda
          otomatik olarak silinir. Hesap ve işletme bilgileri, hesabınız aktif
          olduğu sürece saklanır.
        </p>
      </LegalSection>

      <LegalSection heading="6. Kullanıcı Hakları">
        <p>İlgili kişi olarak aşağıdaki haklara sahipsiniz:</p>
        <LegalList
          items={[
            "Verilerinize erişim talep etme",
            "Verilerinizin silinmesini talep etme",
            "Yanlış veya eksik verilerin düzeltilmesini talep etme",
            "Verilerinizin işlenmesine itiraz etme",
          ]}
        />
      </LegalSection>

      <LegalSection heading="7. İletişim">
        <p>
          Gizlilik ile ilgili her türlü talep ve sorunuz için bizimle{" "}
          <a
            href="mailto:privacy@sentineldesk.com"
            className="text-[#6B8FFF] hover:underline"
          >
            privacy@sentineldesk.com
          </a>{" "}
          adresinden iletişime geçebilirsiniz.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
