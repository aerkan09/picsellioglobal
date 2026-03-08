import type { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { prisma } from '../lib/prisma.js'
import { hashPassword, verifyPassword, requireAuth } from '../lib/auth.js'

export default async function authRoutes(app: FastifyInstance, _opts: FastifyPluginOptions) {
  app.post<{
    Body: {
      email: string
      password: string
      name?: string
      userType?: 'ESNAF' | 'USTA'
      businessName?: string
      profession?: string
      phone?: string
      city?: string
      district?: string
      category?: string
      address?: string
    }
  }>('/register', async (request, reply) => {
    const body = request.body ?? {}
    const { email, password, name, userType, businessName, profession, phone, city, district, category, address } = body
    if (!email || !password) return reply.status(400).send({ error: 'email ve password gerekli' })
    if (password.length < 8) return reply.status(400).send({ error: 'Şifre en az 8 karakter olmalı' })
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return reply.status(409).send({ error: 'Bu email zaten kayıtlı' })

    if (userType === 'ESNAF') {
      if (!businessName?.trim()) return reply.status(400).send({ error: 'İşletme adı gerekli' })
      if (!phone?.trim()) return reply.status(400).send({ error: 'Telefon gerekli' })
      if (!city?.trim()) return reply.status(400).send({ error: 'İl gerekli' })
      if (!district?.trim()) return reply.status(400).send({ error: 'İlçe gerekli' })
      if (!category?.trim()) return reply.status(400).send({ error: 'Kategori gerekli' })
      if (!address?.trim()) return reply.status(400).send({ error: 'Adres gerekli' })
    } else if (userType === 'USTA') {
      if (!name?.trim()) return reply.status(400).send({ error: 'Ad soyad gerekli' })
      if (!profession?.trim()) return reply.status(400).send({ error: 'Meslek gerekli' })
      if (!phone?.trim()) return reply.status(400).send({ error: 'Telefon gerekli' })
      if (!city?.trim()) return reply.status(400).send({ error: 'İl gerekli' })
      if (!district?.trim()) return reply.status(400).send({ error: 'İlçe gerekli' })
      if (!category?.trim()) return reply.status(400).send({ error: 'Kategori gerekli' })
      if (!address?.trim()) return reply.status(400).send({ error: 'Adres gerekli' })
    }

    const passwordHash = await hashPassword(password)
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: passwordHash!,
        name: userType === 'USTA' ? (name || null) : (userType === 'ESNAF' ? businessName || null : name || null),
        role: 'USER',
        userType: userType || null,
        businessName: userType === 'ESNAF' ? businessName || null : null,
        profession: userType === 'USTA' ? profession || null : null,
        phone: phone?.trim() || null,
        city: city?.trim() || null,
        district: district?.trim() || null,
        category: category?.trim() || null,
        address: address?.trim() || null,
      },
      select: { id: true, email: true, name: true, role: true, userType: true, createdAt: true },
    })
    const token = app.jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )
    return reply.send({ user, token })
  })

  app.post<{
    Body: { email: string; password: string }
  }>('/login', async (request, reply) => {
    const { email, password } = request.body ?? {}
    if (!email || !password) return reply.status(400).send({ error: 'email ve password gerekli' })
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.passwordHash) return reply.status(401).send({ error: 'Geçersiz email veya şifre' })
    const ok = await verifyPassword(password, user.passwordHash)
    if (!ok) return reply.status(401).send({ error: 'Geçersiz email veya şifre' })
    if ((user as { banned?: boolean }).banned) return reply.status(403).send({ error: 'Hesabınız kısıtlandı' })
    const token = app.jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )
    return reply.send({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      token,
    })
  })

  app.get('/me', { preHandler: [requireAuth] }, async (request, reply) => {
    const payload = await requireAuth(request, reply)
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true, role: true, createdAt: true, banned: true },
    })
    if (!user) return reply.status(404).send({ error: 'User not found' })
    const unusedCredits = await prisma.listingCredit.count({
      where: { userId: payload.userId, used: false },
    })
    return reply.send({ ...user, unusedListingCredits: unusedCredits })
  })

  // GET /api/auth/plan — active plan name and expiration for dashboard (Shopier listing credits)
  app.get('/plan', { preHandler: [requireAuth] }, async (request, reply) => {
    const payload = await requireAuth(request, reply)
    const latestCredit = await prisma.listingCredit.findFirst({
      where: { userId: payload.userId },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    })
    const plan = latestCredit?.plan?.name ?? null

    const [latestProduct, latestService] = await Promise.all([
      prisma.product.findFirst({
        where: { userId: payload.userId, listingExpiresAt: { not: null } },
        select: { listingExpiresAt: true },
        orderBy: { listingExpiresAt: 'desc' },
      }),
      prisma.serviceListing.findFirst({
        where: { userId: payload.userId, listingExpiresAt: { not: null } },
        select: { listingExpiresAt: true },
        orderBy: { listingExpiresAt: 'desc' },
      }),
    ])
    const dates = [latestProduct?.listingExpiresAt, latestService?.listingExpiresAt].filter(
      (d): d is Date => d != null
    )
    const maxDate = dates.length ? new Date(Math.max(...dates.map((d) => d.getTime()))) : null
    const TR_MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
    const plan_expire = maxDate
      ? `${maxDate.getDate()} ${TR_MONTHS[maxDate.getMonth()]} ${maxDate.getFullYear()}`
      : null

    return reply.send({ plan, plan_expire })
  })
}
