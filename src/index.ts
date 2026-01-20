import { server } from './server.js';
import { env } from './config/env.js';
import { startScheduler } from './jobs/scheduler.js';

async function start() {
  await server.listen({ port: env.port, host: '0.0.0.0' });
  startScheduler();
  console.log(`Server running on port ${env.port}`);
}

start();
