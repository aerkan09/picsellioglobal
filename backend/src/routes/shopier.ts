import type { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../lib/auth.js'
import { getShopierPaymentUrl, verifyShopierCallback } from '../lib/shopier.js'

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000'
const API_URL = process.env.API_URL || process.env.BACKEND_URL || 'http://localhost:4000'

export default async function shopierRoutes(app: FastifyInstance, _opts: FastifyPluginOptions) {
  // Create Shopier payment: for a plan (credit only) or for publishing a listing (planSlug + productId → listing becomes active on success)
  app.post<{
    Body: { planSlug: string; productId?: string; successUrl?: string; cancelUrl?: string }
  }>('/checkout', { preHandler: [requireAuth] }, async (request, reply) => {
    const payload = await requireAuth(request, reply)
    const { planSlug, productId, successUrl, cancelUrl } = request.body ?? {}
    if (!planSlug) return reply.status(400).send({ error: 'planSlug gerekli (10_DAY veya 30_DAY)' })

    const plan = await prisma.plan.findUnique({ where: { slug: planSlug } })
    if (!plan) return reply.status(404).send({ error: 'Plan bulunamadı' })

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true },
    })
    if (!user) return reply.status(404).send({ error: 'User not found' })
    if (user.banned) return reply.status(403).send({ error: 'Hesabınız kısıtlandı' })

    let productIdToPublish: string | null = null
    if (productId) {
      const product = await prisma.product.findUnique({ where: { id: productId } })
      if (!product) return reply.status(404).send({ error: 'İlan bulunamadı' })
      if (product.userId !== payload.userId) return reply.status(403).send({ error: 'Bu ilan size ait değil' })
      if (product.status !== 'DRAFT') return reply.status(400).send({ error: 'Sadece taslak ilanlar ödeme ile yayına alınabilir' })
      productIdToPublish = product.id
    }

    const orderId = `picsellio-${Date.now()}-${payload.userId.slice(0, 8)}`
    const amountLira = plan.priceCents / 100

    const params = {
      planSlug,
      userId: user.id,
      userEmail: user.email,
      userName: user.name || user.email.split('@')[0],
      userPhone: '5550000000',
      orderId,
      amountLira,
      productName: plan.name,
      callbackUrl: `${API_URL}/api/shopier/callback`,
      successUrl: successUrl || `${FRONTEND_URL}/dashboard?payment=success`,
    }

    const result = getShopierPaymentUrl(params)
    if (!result) {
      return reply.status(503).send({
        error: 'Shopier yapılandırılmamış. SHOPIER_API_KEY ve SHOPIER_API_SECRET .env dosyasında olmalı.',
      })
    }

    await prisma.pendingShopierOrder.create({
      data: { orderId, userId: user.id, planId: plan.id, productId: productIdToPublish },
    }).catch(() => {})

    return reply.send({
      url: result.url,
      formData: result.formData,
      orderId,
      planId: plan.id,
      amountLira,
    })
  })

  // Shopier server posts here after payment
  app.post('/callback', async (request, reply) => {
    const body = (request.body ?? {}) as Record<string, unknown>
    const orderId = String(body.order_id ?? body.orderId ?? '')
    const paymentStatus = String(body.payment_status ?? body.status ?? '').toLowerCase()
    const totalOrderValue = body.total_order_value ?? body.amount

    if (!orderId) return reply.status(400).send({ error: 'order_id gerekli' })

    // Verify signature if present
    if (body.signature && !verifyShopierCallback(body)) {
      request.log.warn({ orderId }, 'Shopier callback signature invalid')
      return reply.status(400).send({ error: 'Invalid signature' })
    }

    const paid = ['success', 'completed', 'paid', '1', 'true'].some((s) => paymentStatus.includes(s))
    if (!paid) {
      return reply.send({ received: true, status: 'not_paid' })
    }

    const pending = await prisma.pendingShopierOrder.findUnique({
      where: { orderId },
    })
    if (!pending) {
      request.log.warn({ orderId }, 'Shopier callback: pending order not found')
      return reply.send({ received: true, status: 'order_not_found' })
    }

    const { userId } = pending
    const plan = await prisma.plan.findUnique({ where: { id: pending.planId } })
    if (!plan) {
      return reply.send({ received: true, status: 'plan_not_found' })
    }

    const amountCents = Math.round(Number(totalOrderValue) * 100) || plan.priceCents
    const productIdToActivate = pending.productId

    await prisma.$transaction(async (tx) => {
      const existing = await tx.payment.findFirst({
        where: { shopierId: orderId },
      })
      if (existing) return

      await tx.payment.create({
        data: {
          userId,
          planId: plan.id,
          productId: productIdToActivate ?? undefined,
          shopierId: orderId,
          amount: amountCents,
          status: 'succeeded',
        },
      })

      await tx.listingCredit.create({
        data: {
          userId,
          planId: plan.id,
          used: !!productIdToActivate,
          usedAt: productIdToActivate ? new Date() : undefined,
          productId: productIdToActivate ?? undefined,
        },
      })

      if (productIdToActivate) {
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + plan.days)
        await tx.product.update({
          where: { id: productIdToActivate },
          data: {
            status: 'APPROVED',
            listingExpiresAt: expiresAt,
          },
        })
      }

      await tx.pendingShopierOrder.delete({ where: { orderId } }).catch(() => {})
    })

    return reply.send({ received: true, status: 'ok' })
  })

  // Optional: success redirect with query order_id – frontend can send order_id and we confirm and return credits
  app.get<{ Querystring: { order_id?: string } }>('/success', async (request, reply) => {
    const { order_id } = request.query
    if (!order_id) return reply.redirect(FRONTEND_URL + '/dashboard')
    const payment = await prisma.payment.findFirst({
      where: { shopierId: order_id, status: 'succeeded' },
      include: { plan: true },
    })
    if (!payment) return reply.redirect(FRONTEND_URL + '/dashboard?payment=pending')
    return reply.redirect(FRONTEND_URL + '/dashboard?payment=success')
  })
}
