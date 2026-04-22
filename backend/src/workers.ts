import { logger } from './config/logger';
import { notificationWorker } from './common/queues/notification.queue';
import { payrollWorker } from './modules/payroll/Payroll.worker';

export function initWorkers() {
  logger.info('⚙️  Initializing background workers...');
  
  // Just by importing them and accessing them, they should start
  const workers = [notificationWorker, payrollWorker];
  
  logger.info(`✅ ${workers.length} background workers active`);
}
