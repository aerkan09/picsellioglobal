"use client";

export default function AdminAyarlarPage() {
  const sections = [
    {
      title: "Shopier",
      description: "Ödeme ve ilan paketleri. API anahtarları ve callback URL .env dosyasında (SHOPIER_API_KEY, SHOPIER_SECRET_KEY, SHOPIER_CALLBACK_URL) tanımlanır.",
    },
    {
      title: "OpenAI",
      description: "AI metin üretimi. OPENAI_API_KEY .env dosyasında tanımlanır.",
    },
    {
      title: "Cloudinary",
      description: "Görsel işleme ve depolama. CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET .env dosyasında tanımlanır.",
    },
    {
      title: "Photoroom",
      description: "Arka plan kaldırma. PHOTOROOM_API_KEY .env dosyasında tanımlanır.",
    },
    {
      title: "Stability AI",
      description: "Görsel büyütme / upscale. STABILITY_API_KEY .env dosyasında tanımlanır.",
    },
    {
      title: "Admin Panel",
      description: "Yönetici girişi ve yetkileri. ADMIN_USERNAME ve ADMIN_PASSWORD .env dosyasında veya ilk kurulumda seed ile ayarlanır.",
    },
  ];

  return (
    <>
      <h1 className="text-2xl font-bold">Site Ayarları</h1>
      <p className="mt-1 text-slate-400">
        Entegrasyonlar ve yapılandırma bilgisi. Değişiklikler sunucu .env dosyası üzerinden yapılır.
      </p>
      <div className="mt-8 space-y-4">
        {sections.map((s) => (
          <div
            key={s.title}
            className="rounded-xl border border-slate-700 bg-slate-800/50 p-6"
          >
            <h2 className="text-lg font-semibold text-white">{s.title}</h2>
            <p className="mt-2 text-sm text-slate-400">{s.description}</p>
          </div>
        ))}
      </div>
    </>
  );
}
