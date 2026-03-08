import type { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../lib/auth.js'

export default async function servicesRoutes(app: FastifyInstance, _opts: FastifyPluginOptions) {
  // GET /api/services — list (public: only APPROVED; query: city, district, category, sortBy=rating; or my=1 for own)
  app.get<{
    Querystring: { city?: string; district?: string; category?: string; page?: string; limit?: string; my?: string; sortBy?: string }
  }>('/', async (request, reply) => {
    const { city, district, category, page = '1', limit = '24', my, sortBy } = request.query
    const pageNum = Math.max(1, parseInt(page, 10))
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)))
    const skip = (pageNum - 1) * limitNum

    const where: Record<string, unknown> = {}
    if (my === '1') {
      try {
        const payload = await request.jwtVerify<{ userId: string }>()
        where.userId = payload.userId
      } catch {
        return reply.status(401).send({ error: 'Unauthorized' })
      }
    } else {
      where.status = 'APPROVED'
    }
    if (city) where.city = city
    if (district) where.district = district
    if (category) where.category = { contains: category, mode: 'insensitive' }

    const list = await prisma.serviceListing.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: sortBy === 'rating' ? 0 : skip,
      take: sortBy === 'rating' ? 500 : limitNum,
      include: sortBy === 'rating' ? { serviceReviews: true } : undefined,
    })
    const total = await prisma.serviceListing.count({ where })

    let data: unknown[] = list
    if (sortBy === 'rating') {
      const withAvg = list.map((s) => {
        const reviews = (s as { serviceReviews?: { rating: number }[] }).serviceReviews ?? []
        const totalReviews = reviews.length
        const averageRating = totalReviews ? reviews.reduce((a, r) => a + r.rating, 0) / totalReviews : 0
        const { serviceReviews: _, ...rest } = s as { serviceReviews?: unknown[]; [k: string]: unknown }
        return { ...rest, averageRating, totalReviews, _avgRating: averageRating }
      })
      withAvg.sort((a, b) => (b._avgRating as number) - (a._avgRating as number))
      data = withAvg.slice(skip, skip + limitNum).map(({ _avgRating: _, ...s }) => s)
    }

    return reply.send({
      data,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    })
  })

  // GET /api/services/:id — single (public if APPROVED), includes averageRating and totalReviews
  app.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const service = await prisma.serviceListing.findUnique({
      where: { id: request.params.id },
      include: {
        serviceReviews: { select: { rating: true } },
      },
    })
    if (!service) return reply.status(404).send({ error: 'Service not found' })
    if (service.status !== 'APPROVED') {
      try {
        const payload = await request.jwtVerify<{ userId: string; role: string }>()
        const canView = payload.role === 'ADMIN' || payload.userId === service.userId
        if (!canView) return reply.status(404).send({ error: 'Service not found' })
      } catch {
        return reply.status(404).send({ error: 'Service not found' })
      }
    }
    const reviews = service.serviceReviews ?? []
    const totalReviews = reviews.length
    const averageRating = totalReviews ? reviews.reduce((a, r) => a + r.rating, 0) / totalReviews : 0
    const { serviceReviews: _, ...rest } = service
    return reply.send({ ...rest, averageRating, totalReviews })
  })

  // GET /api/services/:id/reviews — list reviews for a service
  app.get<{ Params: { id: string } }>('/:id/reviews', async (request, reply) => {
    const service = await prisma.serviceListing.findUnique({
      where: { id: request.params.id },
      select: { id: true, status: true },
    })
    if (!service) return reply.status(404).send({ error: 'Service not found' })
    if (service.status !== 'APPROVED') return reply.status(404).send({ error: 'Service not found' })

    const reviews = await prisma.serviceReview.findMany({
      where: { serviceId: request.params.id },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    })
    const data = reviews.map((r) => ({
      id: r.id,
      serviceId: r.serviceId,
      userId: r.userId,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      userName: r.user?.name || (r.user?.email ? r.user.email.replace(/(.{2}).*(@.*)/, '$1***$2') : 'Anonim'),
    }))
    return reply.send({ data })
  })

  // POST /api/services/:id/reviews — create review (authenticated)
  app.post<{
    Params: { id: string }
    Body: { rating: number; comment?: string }
  }>('/:id/reviews', { preHandler: [requireAuth] }, async (request, reply) => {
    const payload = await requireAuth(request, reply)
    const { id: serviceId } = request.params
    const { rating, comment } = request.body ?? {}
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return reply.status(400).send({ error: 'rating 1-5 arasında olmalı' })
    }

    const service = await prisma.serviceListing.findUnique({
      where: { id: serviceId },
      select: { id: true, status: true },
    })
    if (!service) return reply.status(404).send({ error: 'Service not found' })
    if (service.status !== 'APPROVED') return reply.status(400).send({ error: 'Sadece onaylı servislere yorum yapılabilir' })

    const existing = await prisma.serviceReview.findUnique({
      where: { userId_serviceId: { userId: payload.userId, serviceId } },
    })
    if (existing) return reply.status(400).send({ error: 'Bu servise zaten yorum yaptınız' })

    const review = await prisma.serviceReview.create({
      data: {
        serviceId,
        userId: payload.userId,
        rating,
        comment: typeof comment === 'string' ? comment.trim() || null : null,
      },
    })
    return reply.status(201).send(review)
  })

  // POST /api/services — create (authenticated). Requires one unused listing credit (same as products).
  app.post<{
    Body: {
      name: string
      category: string
      phone: string
      whatsapp: string
      city: string
      district: string
      address?: string
      description?: string
      image: string
    }
  }>('/', { preHandler: [requireAuth] }, async (request, reply) => {
    const payload = await requireAuth(request, reply)
    const body = request.body ?? {}
    const { name, category, phone, whatsapp, city, district, address, description, image } = body
    if (!name || !category || !phone || !whatsapp || !city || !district || !image) {
      return reply.status(400).send({
        error: 'name, category, phone, whatsapp, city, district, image gerekli',
      })
    }

    const credit = await prisma.listingCredit.findFirst({
      where: { userId: payload.userId, used: false },
      include: { plan: true },
      orderBy: { createdAt: 'asc' },
    })
    if (!credit) {
      return reply.status(403).send({
        error: 'İlan verebilmek için önce bir paket satın almalısınız.',
      })
    }

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + credit.plan.days)

    const service = await prisma.serviceListing.create({
      data: {
        name,
        category,
        phone,
        whatsapp,
        city,
        district,
        address: address || null,
        description: description || null,
        image,
        status: 'PENDING',
        userId: payload.userId,
        listingExpiresAt: expiresAt,
      },
    })

    await prisma.listingCredit.update({
      where: { id: credit.id },
      data: { used: true, usedAt: new Date(), serviceListingId: service.id },
    })

    return reply.status(201).send(service)
  })
}
