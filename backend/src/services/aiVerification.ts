import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export type VerificationFlags = {
  aiGenerated: boolean
  stockPhoto: boolean
  fakeProduct: boolean
}

export type VerificationResult = {
  status: 'verified' | 'suspicious' | 'rejected'
  flags: VerificationFlags
  confidence: 'high' | 'medium' | 'low'
  details: string
  raw?: string
}

/** DB-friendly status for Product.aiVerificationStatus */
export type AiVerificationStatus = 'VERIFIED' | 'SUSPICIOUS' | 'REJECTED'

const SYSTEM_PROMPT = `You are an expert image authenticity analyst for e-commerce. Analyze product images and detect:

1. **AI-generated images**: Signs of AI generation (e.g. DALL-E, Midjourney, Stable Diffusion): unnatural textures, inconsistent lighting, odd artifacts, too-perfect or surreal details, watermarks, telltale patterns.
2. **Stock photos**: Generic commercial stock imagery (e.g. Shutterstock-style): staged studio look, generic backgrounds, professional lighting that doesn't match "real seller" context, over-polished.
3. **Fake product images**: Images that misrepresent the product: heavily edited, composite images, product pasted onto wrong background, stolen/copied imagery, misleading angles or filters that hide defects.

Respond ONLY with valid JSON in this exact shape (no markdown, no extra text):
{
  "aiGenerated": boolean,
  "stockPhoto": boolean,
  "fakeProduct": boolean,
  "confidence": "high" | "medium" | "low",
  "details": "Short explanation in one or two sentences."
}

- If the image appears to be a genuine, non-stock, non-AI product photo (e.g. real seller photo), set aiGenerated, stockPhoto, and fakeProduct all to false.
- confidence = high when you are very sure; medium when somewhat sure; low when ambiguous.`

function parseResponse(text: string): VerificationResult['flags'] & { confidence: VerificationResult['confidence']; details: string } {
  const cleaned = text.replace(/```json?\s*|\s*```/g, '').trim()
  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(cleaned) as Record<string, unknown>
  } catch {
    parsed = {}
  }
  const aiGenerated = Boolean(parsed.aiGenerated)
  const stockPhoto = Boolean(parsed.stockPhoto)
  const fakeProduct = Boolean(parsed.fakeProduct)
  const confidence = ['high', 'medium', 'low'].includes(String(parsed.confidence)) ? (parsed.confidence as VerificationResult['confidence']) : 'medium'
  const details = typeof parsed.details === 'string' ? parsed.details : 'Analysis completed.'
  return { aiGenerated, stockPhoto, fakeProduct, confidence, details }
}

export async function verifyProductImage(imageUrl: string): Promise<VerificationResult> {
  const content: OpenAI.Chat.ChatCompletionContentPart[] = [
    { type: 'image_url', image_url: { url: imageUrl } },
    { type: 'text', text: 'Analyze this product image. Return only the JSON object as specified.' },
  ]

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content },
    ],
    max_tokens: 400,
  })

  const raw = completion.choices[0]?.message?.content ?? '{}'
  const { aiGenerated, stockPhoto, fakeProduct, confidence, details } = parseResponse(raw)

  const flags: VerificationFlags = { aiGenerated, stockPhoto, fakeProduct }
  const rejected = aiGenerated || stockPhoto || fakeProduct
  const suspicious = !rejected && confidence === 'low'
  const status: VerificationResult['status'] = rejected ? 'rejected' : suspicious ? 'suspicious' : 'verified'

  return { status, flags, confidence, details, raw }
}

export function toAiVerificationStatus(result: VerificationResult): AiVerificationStatus {
  if (result.status === 'rejected') return 'REJECTED'
  if (result.status === 'suspicious') return 'SUSPICIOUS'
  return 'VERIFIED'
}

export function formatImageInput(body: { imageUrl?: string; imageBase64?: string }): string | null {
  if (body.imageUrl && typeof body.imageUrl === 'string') return body.imageUrl
  if (body.imageBase64 && typeof body.imageBase64 === 'string') {
    const base64 = body.imageBase64.replace(/^data:image\/\w+;base64,/, '')
    return `data:image/jpeg;base64,${base64}`
  }
  return null
}
