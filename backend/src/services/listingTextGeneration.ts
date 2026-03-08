/**
 * AI-powered advertisement text generation for listings.
 * Uses OpenAI to generate: improved title, description, SEO tags from user input (title, price, category).
 * Only extends AI functionality; does not modify existing modules.
 */
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export type ListingTextInput = {
  title: string
  price: number // cents or TL
  category?: string | null
}

export type ListingTextResult = {
  success: boolean
  improvedTitle?: string
  description?: string
  seoTags?: string // comma-separated for storage
  error?: string
}

const LISTING_SYSTEM_PROMPT = `Sen bir e-ticaret ilan metni uzmanısın. Kullanıcının verdiği kısa ilan bilgilerinden (başlık, fiyat, kategori) profesyonel bir ilan metni üret.
Kurallar:
1. Başlık: Dikkat çekici, net, Türkçe; ürün tipini ve kalitesini yansıtsın (ör: "Ahşap Çalışma Masası").
2. Açıklama: Kısa, ikna edici, 1-3 cümle; dayanıklılık/kalite vurgusu yapılabilir.
3. SEO etiketleri: Küçük harf, virgülle ayrılmış anahtar kelimeler; Türkçe ve arama motoru dostu (ör: masa, ahşap masa, çalışma masası).
Yanıtını SADECE aşağıdaki JSON formatında ver (başka metin veya açıklama ekleme):
{"improvedTitle":"...","description":"...","seoTags":"kelime1, kelime2, kelime3"}`

/**
 * Generate improved title, description, and SEO tags for a listing using OpenAI.
 * Called when a listing is created; result is stored in the product.
 */
export async function generateListingText(input: ListingTextInput): Promise<ListingTextResult> {
  if (!process.env.OPENAI_API_KEY) {
    return { success: false, error: 'OPENAI_API_KEY not configured' }
  }
  try {
    const priceDisplay = input.price >= 100 ? `₺${(input.price / 100).toFixed(0)}` : `₺${input.price}`
    const userMessage = [
      `Başlık: ${input.title || 'Belirtilmedi'}`,
      `Fiyat: ${priceDisplay}`,
      input.category ? `Kategori: ${input.category}` : '',
    ]
      .filter(Boolean)
      .join('\n')

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL_ENHANCE || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: LISTING_SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 600,
    })

    const raw = completion.choices[0]?.message?.content ?? '{}'
    const cleaned = raw.replace(/```json?\s*|\s*```/g, '').trim()
    let parsed: { improvedTitle?: string; description?: string; seoTags?: string }
    try {
      parsed = JSON.parse(cleaned) as { improvedTitle?: string; description?: string; seoTags?: string }
    } catch {
      parsed = {}
    }

    const improvedTitle = (parsed.improvedTitle || input.title || '').trim()
    const description = (parsed.description || '').trim()
    const seoTags = (parsed.seoTags || '')
      .replace(/#/g, '')
      .trim()

    return {
      success: true,
      improvedTitle: improvedTitle || undefined,
      description: description || undefined,
      seoTags: seoTags || undefined,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { success: false, error: message }
  }
}
