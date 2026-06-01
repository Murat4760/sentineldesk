import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout, LegalSection, LegalList } from "@/components/legal/LegalPage";

export const Route = createFileRoute("/kullanim-kosullari")({
  head: () => ({
    meta: [
      { title: "Kullanım Koşulları — Sentinel" },
      {
        name: "description",
        content:
          "Sentinel hizmetinin kullanım koşulları: hizmet tanımı, abonelik, ödeme, sorumluluk reddi ve fesih.",
      },
    ],
  }),
  component: KullanimKosullariPage,
});

function KullanimKosullariPage() {
  return (
    <LegalLayout
      title="Kullanım Koşulları"
      subtitle="Sentinel hizmetini kullanarak aşağıdaki kullanım koşullarını kabul etmiş sayılırsınız."
      updated="1 Haziran 2026"
    >
      <LegalSection heading="1. Hizmet Tanımı">
        <p>
          Sentinel, işletmelerin gelen telefon aramalarını yapay zekâ destekli
          bir sesli asistan aracılığıyla yanıtlamasını, randevu ve rezervasyon
          almasını ve müşteri etkileşimlerini yönetmesini sağlayan bulut tabanlı
          bir hizmettir.
        </p>
      </LegalSection>

      <LegalSection heading="2. Abonelik ve Ödeme Koşulları">
        <LegalList
          items={[
            "Hizmet, kullanıma dayalı (dakika başı) veya abonelik modeliyle sunulabilir.",
            "Ücretler, seçtiğiniz plana göre belirlenir ve önceden bildirilir.",
            "Aboneliğiniz, iptal edilmediği sürece ilgili dönem sonunda otomatik olarak yenilenir.",
            "Aboneliğinizi istediğiniz zaman iptal edebilirsiniz; iptal, mevcut fatura döneminin sonunda geçerli olur.",
          ]}
        />
      </LegalSection>

      <LegalSection heading="3. Sorumluluk Reddi">
        <p>
          Hizmet “olduğu gibi” sunulmaktadır. Sentinel, hizmetin kesintisiz veya
          hatasız olacağını garanti etmez. Yapay zekâ asistanının ürettiği
          yanıtlardan, üçüncü taraf altyapı sağlayıcıların kaynaklı
          kesintilerden veya hizmetin kullanımından doğabilecek dolaylı
          zararlardan Sentinel sorumlu tutulamaz. Hizmetin kullanımına ilişkin
          tüm sorumluluk kullanıcıya aittir.
        </p>
      </LegalSection>

      <LegalSection heading="4. Fesih Koşulları">
        <p>
          Kullanıcı, hesabını dilediği zaman kapatarak sözleşmeyi feshedebilir.
          Sentinel, bu koşulların ihlali, yasa dışı kullanım veya ödeme
          yükümlülüklerinin yerine getirilmemesi hâllerinde hizmeti askıya alma
          veya sonlandırma hakkını saklı tutar. Fesih durumunda, ilgili gizlilik
          politikası ve KVKK aydınlatma metni kapsamındaki veri saklama ve silme
          kuralları geçerli olmaya devam eder.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
