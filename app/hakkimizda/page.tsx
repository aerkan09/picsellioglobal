import ContentPage from "../components/ContentPage";

export const metadata = {
  title: "Hakkımızda | Picsellio",
  description: "Picsellio hakkında bilgi.",
};

export default function HakkimizdaPage() {
  return (
    <ContentPage title="Hakkımızda">
      <p>
        Picsellio, yerel esnaf ve ustaları dijital dünyayla buluşturan bir platformdur.
        Güvenilir ticaret ve hizmet arayan kullanıcılar ile işletmeleri bir araya getiriyoruz.
      </p>
      <p>
        Misyonumuz, yerel emeği yapay zeka destekli doğrulama ile güvenilir kılmak ve
        küçük işletmelerin daha geniş kitlelere ulaşmasına yardımcı olmaktır.
      </p>
    </ContentPage>
  );
}
