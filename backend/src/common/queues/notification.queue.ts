import { Queue, Worker, Job } from 'bullmq';
import redis from '../../config/redis';
import { emailService } from '../services/email.service';
import { logger } from '../../config/logger';

// ── Queue Definition ────────────────────────────────────────────────────────
export const notificationQueue = new Queue('notifications', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: true,
  }
});

// ── Worker Definition ───────────────────────────────────────────────────────
export const notificationWorker = new Worker('notifications', async (job: Job) => {
  const { type, payload } = job.data;

  try {
    switch (type) {
      case 'EMAIL':
        await emailService.sendEmail(
          payload.to,
          payload.subject,
          payload.html || payload.text || ''
        );
        break;
      
      // Add other background notification types here (SMS, etc.)
      
      default:
        logger.warn(`Unknown notification job type: ${type}`);
    }
  } catch (error) {
    logger.error(`Error processing notification job ${job.id}:`, error);
    throw error; // Let Bull handle the retry
  }
}, { connection: redis });

notificationWorker.on('completed', (job) => {
  logger.info(`Notification job ${job.id} completed successfully`);
});

notificationWorker.on('failed', (job, err) => {
  logger.error(`Notification job ${job?.id} failed:`, err);
});
