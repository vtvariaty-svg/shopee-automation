import Fastify from 'fastify';
import { adminRoutes } from './routes/admin.js';

export const server = Fastify();

server.get('/health', async () => {
  return { status: 'ok' };
});

server.register(adminRoutes);
