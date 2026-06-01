import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout, LegalSection, LegalList } from "@/components/legal/LegalPage";

export const Route = createFileRoute("/cerez")({
  head: () => ({
    meta: [
      { title: "Çerez Politikası — Sentinel" },
      {
        name: "description",
        content:
          "Sentinel çerez politikası: kullanılan çerez türleri ve çerez tercihlerinizi nasıl yönetebileceğiniz.",
      },
    ],
  }),
  component: CerezPage,
});

function CerezPage() {
  return (
    <LegalLayout
      title="Çerez Politikası"
      subtitle="Bu politika, Sentinel web sitesinde kullanılan çerezler ve benzeri teknolojiler hakkında bilgi vermektedir."
      updated="1 Haziran 2026"
    >
      <LegalSection heading="1. Çerez Nedir?">
        <p>
          Çerezler, ziyaret ettiğiniz web siteleri tarafından cihazınıza
          kaydedilen küçük metin dosyalarıdır. Çerezler, sitenin düzgün
          çalışmasını sağlamak ve deneyiminizi iyileştirmek için kullanılır.
        </p>
      </LegalSection>

      <LegalSection heading="2. Kullandığımız Çerezler">
        <LegalList
          items={[
            "Oturum (zorunlu) çerezleri: Giriş yapmanızı ve oturumunuzun güvenli şekilde sürdürülmesini sağlar. Bu çerezler olmadan site temel işlevlerini yerine getiremez.",
            "Analitik çerezler: Ziyaretçilerin siteyi nasıl kullandığını anlamamıza, performansı ölçmemize ve hizmetimizi geliştirmemize yardımcı olur.",
          ]}
        />
      </LegalSection>

      <LegalSection heading="3. Çerezlerin Yönetimi">
        <p>
          Çerez tercihlerinizi tarayıcınızın ayarlar bölümünden istediğiniz zaman
          değiştirebilir veya çerezleri silebilirsiniz. Çoğu tarayıcı, çerezleri
          engellemenize veya silmenize olanak tanır. Ancak zorunlu çerezlerin
          devre dışı bırakılması, sitenin bazı bölümlerinin düzgün çalışmamasına
          neden olabilir.
        </p>
        <p>
          Popüler tarayıcıların çerez ayarlarına, tarayıcınızın “Ayarlar” veya
          “Gizlilik” menüsünden ulaşabilirsiniz.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
