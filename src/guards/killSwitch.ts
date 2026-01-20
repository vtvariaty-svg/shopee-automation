import { db } from '../db/index.js';

export async function assertKillSwitch(accountId?: number) {
  const { rows } = await db.query(
    `SELECT global_kill_switch FROM system_controls WHERE id = 1`
  );

  if (rows[0]?.global_kill_switch) {
    throw new Error('GLOBAL_KILL_SWITCH_ACTIVE');
  }

  if (accountId) {
    const res = await db.query(
      `SELECT kill_switch FROM accounts WHERE id = $1`,
      [accountId]
    );

    if (res.rows[0]?.kill_switch) {
      throw new Error('ACCOUNT_KILL_SWITCH_ACTIVE');
    }
  }
}
