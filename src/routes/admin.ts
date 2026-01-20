import type { FastifyInstance } from 'fastify';
import { transitionOrder } from '../services/orderState.service.js';
import type { OrderState } from '../models/types.js';

export async function adminRoutes(app: FastifyInstance) {
  // Endpoint de transição (somente para validar Fase 2)
  app.post('/admin/orders/:id/transition', async (req, reply) => {
    const orderId = Number((req.params as any).id);
    const body = req.body as any;

    const toState = body?.toState as OrderState | undefined;
    const reason = (body?.reason ?? null) as string | null;

    // idempotency key obrigatória (fase 2)
    const idempotencyKey = body?.idempotencyKey as string | undefined;

    if (!orderId || !toState || !idempotencyKey) {
      return reply.status(400).send({
        error: 'BAD_REQUEST',
        required: ['toState', 'idempotencyKey']
      });
    }

    const result = await transitionOrder({
      orderId,
      toState,
      reason,
      idempotencyKey,
      triggerJob: 'ADMIN'
    });

    return reply.send({ ok: true, result });
  });
}
