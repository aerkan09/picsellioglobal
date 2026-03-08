import 'dotenv/config'
import Fastify from 'fastify'
import path from 'path'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import fastifyStatic from '@fastify/static'
import { prisma } from './lib/prisma.js'

import stripeRoutes from './routes/stripe.js'
import shopierRoutes from './routes/shopier.js'
import plansRoutes from './routes/plans.js'
import aiRoutes from './routes/ai.js'
import authRoutes from './routes/auth.js'
import productsRoutes from './routes/products.js'
import servicesRoutes from './routes/services.js'
import adminRoutes from './routes/admin.js'
import apiRoutes from './routes/index.js'

const app = Fastify({ logger: true })
const PORT = Number(process.env.PORT) || 4000

await app.register(cors, { origin: true })
await app.register(jwt, {
  secret: process.env.JWT_SECRET || 'change-me-in-production',
  sign: { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
})

const publicDir = path.join(process.cwd(), 'public')
const uploadsDir = path.join(publicDir, 'uploads')
await import('fs/promises').then(({ mkdir }) => mkdir(uploadsDir, { recursive: true }).catch(() => {}))
await app.register(fastifyStatic, { root: publicDir, prefix: '/' })

await app.register(apiRoutes, { prefix: '/api' })
await app.register(authRoutes, { prefix: '/api/auth' })
await app.register(productsRoutes, { prefix: '/api/products' })
await app.register(servicesRoutes, { prefix: '/api/services' })
await app.register(plansRoutes, { prefix: '/api/plans' })
await app.register(stripeRoutes, { prefix: '/api/stripe' })
await app.register(shopierRoutes, { prefix: '/api/shopier' })
await app.register(aiRoutes, { prefix: '/api/ai' })
await app.register(adminRoutes, { prefix: '/api/admin' })

app.get('/health', async (_, reply) => {
  return reply.send({ status: 'ok', service: 'picsellio-backend' })
})
app.get('/api/health', async (_, reply) => {
  return reply.send({ status: 'ok', service: 'picsellio-backend' })
})

async function start() {
  try {
    await prisma.$connect()
    await app.listen({ port: PORT, host: '0.0.0.0' })
    console.log(`Backend http://localhost:${PORT}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
