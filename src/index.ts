import { server } from './server.js';
import { env } from './config/env.js';

async function start() {
  await server.listen({ port: env.port, host: '0.0.0.0' });
  console.log(`Server running on port ${env.port}`);
}

start();
