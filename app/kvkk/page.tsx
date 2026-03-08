import ContentPage from "../components/ContentPage";

export const metadata = {
  title: "KVKK Aydınlatma Metni | Picsellio",
  description: "Picsellio KVKK aydınlatma metni.",
};

export default function KvkkPage() {
  return (
    <ContentPage title="KVKK Aydınlatma Metni">
      <p>6698 sayılı KVKK kapsamında, veri sorumlusu sıfatıyla kişisel verilerinizi işliyoruz. İşlenen veriler: kimlik ve iletişim bilgileri, işlem güvenliği ve platform kullanım verileri.</p>
      <p>KVKK 11. madde kapsamında bilgi talep etme, düzeltme, silme ve şikâyet başvurusu yapma haklarınız vardır. Başvurularınızı İletişim sayfamızdan iletebilirsiniz.</p>
    </ContentPage>
  );
}
