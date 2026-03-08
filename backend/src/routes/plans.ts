import type { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { prisma } from '../lib/prisma.js'

export default async function plansRoutes(app: FastifyInstance, _opts: FastifyPluginOptions) {
  app.get('/', async (_, reply) => {
    const plans = await prisma.plan.findMany({
      orderBy: { days: 'asc' },
    })
    return reply.send(plans)
  })
}
