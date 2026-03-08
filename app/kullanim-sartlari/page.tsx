import ContentPage from "../components/ContentPage";

export const metadata = {
  title: "Kullanım Şartları | Picsellio",
  description: "Picsellio kullanım şartları.",
};

export default function KullanimSartlariPage() {
  return (
    <ContentPage title="Picsellio Kullanım Şartları">
      <p>
        Picsellio platformu kullanıcıların ürün ve hizmet ilanlarını paylaşmasına olanak sağlayan bir dijital pazaryeridir. Platformda paylaşılan içeriklerin doğruluğundan ilan sahibi sorumludur.
      </p>
      <p>Picsellio;</p>
      <ul className="list-disc pl-6 space-y-2 mt-2">
        <li>kullanıcılar arasındaki ticari işlemlerin tarafı değildir</li>
        <li>sadece ilan yayınlama hizmeti sağlar</li>
        <li>hukuka aykırı içerikleri kaldırma hakkını saklı tutar</li>
      </ul>
    </ContentPage>
  );
}
