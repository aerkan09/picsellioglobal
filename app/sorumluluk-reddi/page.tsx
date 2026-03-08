import ContentPage from "../components/ContentPage";

export const metadata = {
  title: "Sorumluluk Reddi | Picsellio",
  description: "Picsellio sorumluluk reddi.",
};

export default function SorumlulukReddiPage() {
  return (
    <ContentPage title="Sorumluluk Reddi">
      <p>
        Picsellio bir ilan ve bilgi platformudur. Sitede yer alan ilanlar, içerikler
        ve kullanıcı paylaşımları üçüncü taraflarca oluşturulmakta olup, doğruluk
        ve yasal uygunluklarından Picsellio sorumlu tutulamaz.
      </p>
      <p>
        Platform üzerinden gerçekleştirilen ticari veya hizmet ilişkileri doğrudan
        ilan sahibi ile alıcı/hizmet alan arasında kurulur. Picsellio, bu ilişkilerden
        doğan anlaşmazlıklardan veya zararlardan sorumlu değildir.
      </p>
      <p>
        Sitedeki bilgiler “olduğu gibi” sunulmaktadır; garanti verilmemektedir.
        Karar vermeden önce ilgili tarafla iletişime geçmeniz ve gerekli kontrolleri
        yapmanız önerilir.
      </p>
    </ContentPage>
  );
}
