import type { FastifyInstance, FastifyPluginOptions } from 'fastify'
import OpenAI from 'openai'
import { prisma } from '../lib/prisma.js'
import { verifyProductImage, formatImageInput, toAiVerificationStatus } from '../services/aiVerification.js'
import { checkImageExistsOnWeb } from '../services/googleVisionWebCheck.js'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export default async function aiRoutes(app: FastifyInstance, _opts: FastifyPluginOptions) {
  // --- AI Verification Service: product image → detect AI-generated, stock, fake ---
  app.post<{
    Body: { imageUrl?: string; imageBase64?: string }
  }>('/verify-image', async (request, reply) => {
    const imageInput = formatImageInput(request.body ?? {})
    if (!imageInput) return reply.status(400).send({ error: 'imageUrl veya imageBase64 gerekli' })
    try {
      const result = await verifyProductImage(imageInput)
      const aiVerificationStatus = toAiVerificationStatus(result)
      const webCheck = await checkImageExistsOnWeb(imageInput)
      return reply.send({
        success: true,
        verification: {
          status: result.status,
          aiVerificationStatus,
          flags: result.flags,
          confidence: result.confidence,
          details: result.details,
          foundOnWeb: webCheck.foundOnWeb,
          ...(webCheck.warning && { webWarning: webCheck.warning }),
        },
      })
    } catch (e) {
      request.log.error(e)
      return reply.status(500).send({
        error: 'AI verification failed',
        detail: (e as Error).message,
      })
    }
  })

  // Görsel / içerik doğrulama (OpenAI ile)
  app.post<{
    Body: { imageUrl?: string; text?: string; imageId?: string }
  }>('/verify', async (request, reply) => {
    const { imageUrl, text, imageId } = request.body || {}
    if (!imageUrl && !text) return reply.status(400).send({ error: 'imageUrl veya text gerekli' })
    try {
      const content: OpenAI.Chat.ChatCompletionContentPart[] = []
      if (imageUrl) content.push({ type: 'image_url', image_url: { url: imageUrl } })
      if (text) content.push({ type: 'text', text: `Aşağıdaki içeriği doğrula ve uygunluk durumunu (onaylı/red) ve kısa gerekçeyi JSON olarak ver: ${text}` })
      if (content.length === 0) content.push({ type: 'text', text: 'Doğrulanacak veri yok.' })

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content }],
        max_tokens: 500,
      })
      const result = completion.choices[0]?.message?.content ?? '{}'
      let status = 'pending'
      try {
        const parsed = JSON.parse(result)
        if (parsed.durum === 'onaylı' || parsed.status === 'approved') status = 'approved'
        else if (parsed.durum === 'red' || parsed.status === 'rejected') status = 'rejected'
      } catch {
        status = result.toLowerCase().includes('onay') ? 'approved' : 'rejected'
      }

      if (imageId) {
        await prisma.verification.upsert({
          where: { imageId },
          create: { imageId, status, aiResult: result },
          update: { status, aiResult: result },
        })
      }
      return reply.send({ success: true, status, aiResult: result })
    } catch (e) {
      request.log.error(e)
      return reply.status(500).send({ error: 'AI doğrulama başarısız', detail: (e as Error).message })
    }
  })

  // --- AI Destekli Metin İyileştirme (GPT-4 Turbo): dilbilgisi, imla, SEO, başlık & hashtag ---
  app.post<{
    Body: { rawText: string }
  }>('/enhance-text', async (request, reply) => {
    const rawText = typeof (request.body ?? {}).rawText === 'string' ? (request.body as { rawText: string }).rawText.trim() : ''
    if (!rawText) return reply.status(400).send({ error: 'rawText gerekli' })
    try {
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL_ENHANCE || 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: `Sen bir e-ticaret ilan metni uzmanısın. Verilen ham ilan metnini:
1. Dilbilgisi ve imla açısından düzelt.
2. SEO ve ikna edici, akıcı, global (Türkçe ağırlıklı) bir dile dönüştür.
3. Yanıtını SADECE aşağıdaki JSON formatında ver (başka metin ekleme):
{"optimizedText":"...","title":"...","hashtags":["#kelime1","#kelime2",...]}
- optimizedText: İyileştirilmiş tam açıklama metni.
- title: Dikkat çekici, kısa ilan başlığı (tek satır).
- hashtags: İlanla alakalı anahtar kelimeler, hashtag formatında (en fazla 10).`,
          },
          { role: 'user', content: rawText },
        ],
        max_tokens: 1000,
      })
      const content = completion.choices[0]?.message?.content ?? '{}'
      let parsed: { optimizedText?: string; title?: string; hashtags?: string[] }
      try {
        const cleaned = content.replace(/```json?\s*|\s*```/g, '').trim()
        parsed = JSON.parse(cleaned) as { optimizedText?: string; title?: string; hashtags?: string[] }
      } catch {
        parsed = {}
      }
      return reply.send({
        success: true,
        optimizedText: parsed.optimizedText ?? content,
        title: parsed.title ?? '',
        hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : [],
      })
    } catch (e) {
      request.log.error(e)
      return reply.status(500).send({
        error: 'Metin iyileştirme başarısız',
        detail: (e as Error).message,
      })
    }
  })

  // Image pipeline: upscale (Stability) → remove BG (Photoroom) → optional Cloudinary
  app.post<{ Body: { imageUrl: string } }>('/process-image', async (request, reply) => {
    const { imageUrl } = (request.body ?? {}) as { imageUrl?: string }
    if (!imageUrl) return reply.status(400).send({ error: 'imageUrl gerekli' })
    try {
      const { processImagePipeline } = await import('../services/imagePipeline.js')
      const result = await processImagePipeline(imageUrl)
      return reply.send({ success: true, ...result })
    } catch (e) {
      request.log.error(e)
      return reply.status(500).send({ error: 'Image pipeline failed', detail: (e as Error).message })
    }
  })

  // Product image verification: verify product by id, update product.aiVerified and aiVerificationStatus
  app.post<{ Params: { productId: string } }>('/verify-product/:productId', async (request, reply) => {
    const { productId } = request.params
    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) return reply.status(404).send({ error: 'Product not found' })
    try {
      const verification = await verifyProductImage(product.imageUrl)
      const aiVerificationStatus = toAiVerificationStatus(verification)
      await prisma.product.update({
        where: { id: productId },
        data: {
          aiVerified: verification.status === 'verified',
          aiVerificationStatus,
        },
      })
      return reply.send({
        success: true,
        aiVerified: verification.status === 'verified',
        aiVerificationStatus,
        verification,
      })
    } catch (e) {
      request.log.error(e)
      return reply.status(500).send({ error: 'AI doğrulama başarısız', detail: (e as Error).message })
    }
  })
}
