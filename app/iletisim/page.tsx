import ContentPage from "../components/ContentPage";

export const metadata = {
  title: "İletişim | Picsellio",
  description: "Picsellio iletişim bilgileri.",
};

export default function IletisimPage() {
  return (
    <ContentPage title="İletişim">
      <p>
        Sorularınız, önerileriniz veya şikâyetleriniz için aşağıdaki kanallardan
        bize ulaşabilirsiniz.
      </p>
      <p>
        <strong>E-posta:</strong> destek@picsellio.com (örnek adres; projenize göre güncelleyin)
      </p>
      <p>
        <strong>Adres:</strong> Şirket adresi buraya eklenebilir.
      </p>
      <p>
        KVKK ve yasal başvurularınızı aynı e-posta üzerinden “KVKK Başvurusu” veya
        “Yasal Başvuru” konu başlığı ile iletebilirsiniz. Başvurularınız en kısa
        sürede yanıtlanacaktır.
      </p>
    </ContentPage>
  );
}
