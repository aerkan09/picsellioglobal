import type { FastifyRequest, FastifyReply } from 'fastify'
import bcrypt from 'bcrypt'
import { prisma } from './prisma.js'

export const SALT_ROUNDS = 12

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export type JWTPayload = { userId: string; email: string; role: string }

export async function requireAuth(request: FastifyRequest, reply: FastifyReply): Promise<JWTPayload> {
  try {
    const payload = await request.jwtVerify<JWTPayload>()
    if (payload.role !== 'ADMIN') {
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { banned: true },
      })
      if (user?.banned) {
        reply.status(403).send({ error: 'Hesabınız kısıtlandı' })
        throw new Error('Forbidden')
      }
    }
    return payload
  } catch (e) {
    if ((e as Error).message === 'Forbidden') throw e
    reply.status(401).send({ error: 'Unauthorized' })
    throw new Error('Unauthorized')
  }
}

export async function requireAdmin(request: FastifyRequest, reply: FastifyReply): Promise<JWTPayload> {
  const payload = await requireAuth(request, reply)
  if (payload.role !== 'ADMIN') {
    reply.status(403).send({ error: 'Forbidden: admin only' })
    throw new Error('Forbidden')
  }
  return payload
}
