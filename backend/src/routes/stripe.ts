import type { FastifyInstance, FastifyPluginOptions } from 'fastify'
import Stripe from 'stripe'
import { prisma } from '../lib/prisma.js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '')

export default async function stripeRoutes(app: FastifyInstance, _opts: FastifyPluginOptions) {
  // Ödeme oturumu oluştur (userId zorunlu; productId opsiyonel – marketplace ürünü)
  app.post<{
    Body: { userId: string; amount?: number; productId?: string; successUrl?: string; cancelUrl?: string }
  }>('/checkout-session', async (request, reply) => {
    const { userId, amount: amountBody, productId, successUrl, cancelUrl } = request.body || {}
    if (!userId) return reply.status(400).send({ error: 'userId gerekli' })
    let amount = amountBody
    let productName = 'Picsellio Ödeme'
    if (productId) {
      const product = await prisma.product.findUnique({ where: { id: productId } })
      if (!product) return reply.status(404).send({ error: 'Product not found' })
      if (product.status !== 'APPROVED') return reply.status(400).send({ error: 'Sadece onaylı ürün satın alınabilir' })
      amount = product.price
      productName = product.title
    }
    const unitAmount = Math.round(Number(amount) || 999)
    if (unitAmount < 1) return reply.status(400).send({ error: 'Geçerli amount gerekli' })
    try {
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [{ price_data: { currency: 'try', unit_amount: unitAmount, product_data: { name: productName } }, quantity: 1 }],
        success_url: successUrl || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl || `${process.env.FRONTEND_URL || 'http://localhost:3000'}`,
        client_reference_id: userId,
        metadata: productId ? { productId } : undefined,
      })
      return reply.send({ url: session.url, sessionId: session.id })
    } catch (e) {
      request.log.error(e)
      return reply.status(500).send({ error: 'Stripe session oluşturulamadı' })
    }
  })

  // Webhook (Stripe CLI: stripe listen --forward-to localhost:4000/api/stripe/webhook)
  // Not: İmza doğrulaması için production'da raw body kullanın (örn. @fastify/raw-body)
  app.post('/webhook', async (request, reply) => {
    const sig = (request.headers['stripe-signature'] as string) || ''
    const body = typeof (request as any).rawBody === 'string' ? (request as any).rawBody : JSON.stringify(request.body || {})
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) return reply.status(400).send({ error: 'Webhook secret yok' })
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    } catch (err: any) {
      return reply.status(400).send({ error: err.message })
    }
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.client_reference_id
      const productId = session.metadata?.productId ?? null
      if (userId && session.payment_status === 'paid') {
        await prisma.payment.create({
          data: {
            userId,
            productId: productId || undefined,
            stripeId: session.id,
            amount: (session.amount_total ?? 0) as number,
            status: 'succeeded',
          },
        }).catch(() => {})
      }
    }
    return reply.send({ received: true })
  })
}
