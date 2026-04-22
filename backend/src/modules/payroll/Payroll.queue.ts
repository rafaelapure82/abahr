import { Queue } from 'bullmq';
import redis from '../../config/redis';

export const payrollQueue = new Queue('payroll', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 10000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 1000 },
  }
});
