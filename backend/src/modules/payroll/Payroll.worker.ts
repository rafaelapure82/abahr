import { Worker, Job } from 'bullmq';
import redis from '../../config/redis';
import { payrollService } from './Payroll.service';
import { logger } from '../../config/logger';

export const payrollWorker = new Worker('payroll', async (job: Job) => {
  const { periodId, payrollId, dto } = job.data;

  logger.info(`Starting background payroll processing for Period ${periodId}`);

  try {
    await payrollService.processPayrollTask(periodId, payrollId, dto);
    logger.info(`Background payroll processing finished for Period ${periodId}`);
  } catch (error) {
    logger.error(`Background payroll processing failed for Job ${job.id}:`, error);
    throw error;
  }
}, { 
  connection: redis,
  concurrency: 1 // Process one payroll at a time to avoid heavy DB load
});

payrollWorker.on('completed', (job) => {
  logger.info(`Payroll job ${job.id} completed`);
});

payrollWorker.on('failed', (job, err) => {
  logger.error(`Payroll job ${job?.id} failed:`, err);
});
