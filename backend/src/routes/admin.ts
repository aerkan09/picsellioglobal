import type { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { prisma } from '../lib/prisma.js'
import { requireAdmin } from '../lib/auth.js'

export default async function adminRoutes(app: FastifyInstance, _opts: FastifyPluginOptions) {
  const adminPreHandler = [requireAdmin]

  app.get('/users', { preHandler: adminPreHandler }, async (_, reply) => {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true, _count: { select: { products: true, payments: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return reply.send(users)
  })

  app.get('/payments', { preHandler: adminPreHandler }, async (_, reply) => {
    const payments = await prisma.payment.findMany({
      include: { user: { select: { email: true, name: true } }, product: { select: { id: true, title: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return reply.send(payments)
  })

  app.get('/verifications', { preHandler: adminPreHandler }, async (_, reply) => {
    const list = await prisma.verification.findMany({
      include: { image: true },
      orderBy: { createdAt: 'desc' },
    })
    return reply.send(list)
  })

  app.get('/products', { preHandler: adminPreHandler }, async (request, reply) => {
    const { status } = (request.query as { status?: string }) ?? {}
    const where = status ? { status } : {}
    const products = await prisma.product.findMany({
      where,
      include: { user: { select: { id: true, email: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return reply.send(products)
  })

  app.patch<{
    Params: { id: string }
    Body: { status: 'APPROVED' | 'REJECTED' }
  }>('/products/:id/moderate', { preHandler: adminPreHandler }, async (request, reply) => {
    const { id } = request.params
    const { status } = request.body ?? {}
    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      return reply.status(400).send({ error: 'status: APPROVED veya REJECTED gerekli' })
    }
    const product = await prisma.product.findUnique({ where: { id } })
    if (!product) return reply.status(404).send({ error: 'Product not found' })
    const updated = await prisma.product.update({
      where: { id },
      data: { status },
      include: { user: { select: { id: true, email: true, name: true } } },
    })
    return reply.send(updated)
  })

  app.get('/services', { preHandler: adminPreHandler }, async (request, reply) => {
    const { status } = (request.query as { status?: string }) ?? {}
    const where = status ? { status } : {}
    const list = await prisma.serviceListing.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
    return reply.send(list)
  })

  app.patch<{ Params: { id: string } }>('/services/:id/approve', { preHandler: adminPreHandler }, async (request, reply) => {
    const { id } = request.params
    const service = await prisma.serviceListing.findUnique({ where: { id } })
    if (!service) return reply.status(404).send({ error: 'Service not found' })
    const updated = await prisma.serviceListing.update({
      where: { id },
      data: { status: 'APPROVED' },
    })
    return reply.send(updated)
  })

  app.delete<{ Params: { id: string } }>('/services/:id', { preHandler: adminPreHandler }, async (request, reply) => {
    const { id } = request.params
    await prisma.serviceListing.delete({ where: { id } }).catch(() => null)
    return reply.status(204).send()
  })

  app.patch<{
    Params: { id: string }
    Body: { banned: boolean }
  }>('/users/:id/ban', { preHandler: adminPreHandler }, async (request, reply) => {
    const { id } = request.params
    const { banned } = (request.body ?? {}) as { banned?: boolean }
    if (typeof banned !== 'boolean') return reply.status(400).send({ error: 'banned: true veya false gerekli' })
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) return reply.status(404).send({ error: 'User not found' })
    if (user.role === 'ADMIN') return reply.status(403).send({ error: 'Admin kullanıcılar yasaklanamaz' })
    const updated = await prisma.user.update({
      where: { id },
      data: { banned },
      select: { id: true, email: true, name: true, role: true, banned: true },
    })
    return reply.send(updated)
  })
}
