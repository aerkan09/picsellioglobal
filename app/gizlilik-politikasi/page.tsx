import ContentPage from "../components/ContentPage";

export const metadata = {
  title: "Gizlilik Politikası | Picsellio",
  description: "Picsellio gizlilik politikası.",
};

export default function GizlilikPolitikasiPage() {
  return (
    <ContentPage title="Gizlilik Politikası">
      <p>
        Picsellio kullanıcıların kişisel verilerini gizlilik ilkelerine uygun olarak korur.
      </p>
      <p className="mt-4 font-medium">Toplanan bilgiler:</p>
      <ul className="list-disc pl-6 space-y-1 mt-2">
        <li>isim</li>
        <li>telefon</li>
        <li>şehir</li>
        <li>ilan bilgileri</li>
      </ul>
      <p className="mt-4">
        Bu bilgiler yalnızca platformun işleyişi ve kullanıcı deneyimini geliştirmek amacıyla kullanılır.
      </p>
    </ContentPage>
  );
}
