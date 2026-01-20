import { runSyncOrders } from './syncOrders.job.js';
import { logger } from '../logger.js';

/**
 * Scheduler interno (compatível com Render free).
 * Overlap de 10 min garante tolerância a restart.
 */
export function startScheduler() {
  const TWO_MIN = 2 * 60 * 1000;

  setInterval(async () => {
    try {
      await runSyncOrders();
    } catch (err) {
      logger.error('SYNC_CRASH', { err });
    }
  }, TWO_MIN);

  logger.info('SCHEDULER_STARTED', { everyMs: TWO_MIN });
}
