import ContentPage from "../components/ContentPage";

export const metadata = {
  title: "İlan Yayınlama Kuralları | Picsellio",
  description: "Picsellio ilan yayınlama kuralları.",
};

export default function IlanKurallariPage() {
  return (
    <ContentPage title="İlan Yayınlama Kuralları">
      <p>İlanlar gerçek ürün veya hizmete ait olmalı; yanıltıcı veya yasak içerik barındırmamalıdır. Görsel ve metinler telif ve kişilik haklarına uygun olmalıdır.</p>
      <p>Fiyat ve iletişim bilgileri doğru tutulmalıdır. Kurallara uymayan ilanlar onaylanmayabilir veya kaldırılabilir.</p>
    </ContentPage>
  );
}
