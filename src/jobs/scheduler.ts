import { runSyncOrders } from './syncOrders.job.js';
import { runGateOrders } from './gateOrders.job.js';
import { runAcceptOrders } from './acceptOrders.job.js';
import { logger } from '../logger.js';

export function startScheduler() {
  const TWO_MIN = 2 * 60 * 1000;

  setInterval(async () => {
    try {
      await runSyncOrders();
      await runGateOrders();
      await runAcceptOrders();
    } catch (err) {
      logger.error('SCHEDULER_CRASH', { err });
    }
  }, TWO_MIN);

  logger.info('SCHEDULER_STARTED', { everyMs: TWO_MIN });
}
