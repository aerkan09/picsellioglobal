import type { FastifyInstance, FastifyPluginOptions } from 'fastify'

export default async function routes(app: FastifyInstance, _opts: FastifyPluginOptions) {
  app.get('/', async (_, reply) => {
    return reply.send({ message: 'Picsellio API', version: '1.0' })
  })
}
