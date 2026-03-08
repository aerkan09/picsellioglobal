import type { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../lib/auth.js'
import { processListingImagePipeline } from '../services/listingImagePipeline.js'
import { generateListingText } from '../services/listingTextGeneration.js'

export default async function productsRoutes(app: FastifyInstance, _opts: FastifyPluginOptions) {
  // List products (public: only APPROVED; optional auth for own listings; filter by city, district)
  app.get<{
    Querystring: { status?: string; page?: string; limit?: string; userId?: string; city?: string; district?: string; categorySlug?: string }
  }>('/', async (request, reply) => {
    const { status = 'APPROVED', page = '1', limit = '20', userId, city, district, categorySlug } = request.query
    const pageNum = Math.max(1, parseInt(page, 10))
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)))
    const skip = (pageNum - 1) * limitNum

    const where: { status?: string; userId?: string; listingExpiresAt?: object; city?: string; district?: string; categorySlug?: string } = {}
    if (status) where.status = status
    if (userId) where.userId = userId
    if (city) where.city = city
    if (district) where.district = district
    if (categorySlug) where.categorySlug = categorySlug
    // Public listing: only show approved and not expired
    if (status === 'APPROVED' && !userId) {
      where.listingExpiresAt = { gte: new Date() }
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { user: { select: { id: true, email: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.product.count({ where }),
    ])

    return reply.send({
      data: products,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    })
  })

  // Get single product (public for APPROVED)
  app.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const product = await prisma.product.findUnique({
      where: { id: request.params.id },
      include: { user: { select: { id: true, email: true, name: true } } },
    })
    if (!product) return reply.status(404).send({ error: 'Product not found' })
    if (product.status !== 'APPROVED') {
      const payload = await request.jwtVerify<{ userId: string; role: string }>().catch(() => null)
      const canView = payload && (payload.userId === product.userId || payload.role === 'ADMIN')
      if (!canView) return reply.status(404).send({ error: 'Product not found' })
    }
    return reply.send(product)
  })

  // Create listing as DRAFT (authenticated). No credit consumed. User must complete Shopier payment to publish (status → active).
  app.post<{
    Body: { title: string; description?: string; price: number; imageUrl: string; sellerPhone?: string; planSlug?: string; city?: string; district?: string; category?: string; categorySlug?: string }
  }>('/', { preHandler: [requireAuth] }, async (request, reply) => {
    const payload = await requireAuth(request, reply)
    const { title, description, price, imageUrl, sellerPhone, city, district, category, categorySlug } = request.body ?? {}
    if (!title || !imageUrl) return reply.status(400).send({ error: 'title ve imageUrl gerekli' })
    const amount = Math.round(Number(price))
    if (!Number.isFinite(amount) || amount < 0) return reply.status(400).send({ error: 'Geçerli price gerekli (cent)' })

    const product = await prisma.product.create({
      data: {
        title,
        description: description || null,
        price: amount,
        imageUrl,
        sellerPhone: sellerPhone || null,
        city: city || null,
        district: district || null,
        category: category || null,
        categorySlug: categorySlug || null,
        userId: payload.userId,
        status: 'DRAFT',
      },
      include: { user: { select: { id: true, email: true, name: true } } },
    })

    // Run AI image pipeline in background; update product imageUrl when done
    processListingImagePipeline(imageUrl, { title, price: amount })
      .then((result) => {
        if (result.success && result.publicUrl) {
          return prisma.product.update({
            where: { id: product.id },
            data: { imageUrl: result.publicUrl },
          })
        }
      })
      .catch((err) => request.log.error(err, 'listing image pipeline failed'))

    // Run AI text generation in background; update product with improved title, description, SEO tags
    generateListingText({ title, price: amount, category: category ?? undefined })
      .then((result) => {
        if (result.success && (result.improvedTitle || result.description != null || result.seoTags != null)) {
          return prisma.product.update({
            where: { id: product.id },
            data: {
              ...(result.improvedTitle && { title: result.improvedTitle }),
              ...(result.description != null && { description: result.description }),
              ...(result.seoTags != null && { seoTags: result.seoTags }),
            },
          })
        }
      })
      .catch((err) => request.log.error(err, 'listing text generation failed'))

    return reply.status(201).send(product)
  })

  // Update own product (only PENDING)
  app.patch<{
    Params: { id: string }
    Body: { title?: string; description?: string; price?: number; imageUrl?: string; sellerPhone?: string; city?: string; district?: string; category?: string; categorySlug?: string; seoTags?: string }
  }>('/:id', { preHandler: [requireAuth] }, async (request, reply) => {
    const payload = await requireAuth(request, reply)
    const product = await prisma.product.findUnique({ where: { id: request.params.id } })
    if (!product) return reply.status(404).send({ error: 'Product not found' })
    if (product.userId !== payload.userId) return reply.status(403).send({ error: 'Bu ürün size ait değil' })
    if (product.status !== 'DRAFT' && product.status !== 'PENDING') return reply.status(400).send({ error: 'Sadece taslak veya beklemedeki ürün güncellenebilir' })

    const { title, description, price, imageUrl, sellerPhone, city, district, category, categorySlug, seoTags } = request.body ?? {}
    const data: Partial<{ title: string; description: string | null; price: number; imageUrl: string; sellerPhone: string | null; city: string | null; district: string | null; category: string | null; categorySlug: string | null; seoTags: string | null }> = {}
    if (title !== undefined) data.title = title
    if (description !== undefined) data.description = description ?? null
    if (imageUrl !== undefined) data.imageUrl = imageUrl
    if (sellerPhone !== undefined) data.sellerPhone = sellerPhone ?? null
    if (city !== undefined) data.city = city ?? null
    if (district !== undefined) data.district = district ?? null
    if (category !== undefined) data.category = category ?? null
    if (categorySlug !== undefined) data.categorySlug = categorySlug ?? null
    if (seoTags !== undefined) data.seoTags = seoTags ?? null
    if (price !== undefined) {
      const amount = Math.round(Number(price))
      if (Number.isFinite(amount) && amount >= 0) data.price = amount
    }

    const updated = await prisma.product.update({
      where: { id: request.params.id },
      data,
      include: { user: { select: { id: true, email: true, name: true } } },
    })
    return reply.send(updated)
  })

  // Delete own product (only PENDING or own)
  app.delete<{ Params: { id: string } }>('/:id', { preHandler: [requireAuth] }, async (request, reply) => {
    const payload = await requireAuth(request, reply)
    const product = await prisma.product.findUnique({ where: { id: request.params.id } })
    if (!product) return reply.status(404).send({ error: 'Product not found' })
    if (product.userId !== payload.userId) return reply.status(403).send({ error: 'Bu ürün size ait değil' })
    await prisma.product.delete({ where: { id: request.params.id } })
    return reply.status(204).send()
  })
}
