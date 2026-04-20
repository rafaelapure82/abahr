import 'dotenv/config';
import { env } from './config/env';
import { logger } from './config/logger';
import { prisma } from './config/prisma';
import { createApp } from './index';

// ═══════════════════════════════════════════════════════════════════
//  BOOTSTRAP – connects DB then starts HTTP server
// ═══════════════════════════════════════════════════════════════════
async function bootstrap(): Promise<void> {
  try {
    // ── Validate DB connection ──────────────────────────────────────
    await prisma.$connect();
    logger.info('✅ Database connected');

    // ── Create app ─────────────────────────────────────────────────
    const { httpServer } = createApp();

    // ── Start listening ────────────────────────────────────────────
    httpServer.listen(env.PORT, () => {
      logger.info('═══════════════════════════════════════════════════');
      logger.info('  🚀  ABA Talent Management API is running');
      logger.info(`  📡  http://localhost:${env.PORT}`);
      logger.info(`  🔌  ws://localhost:${env.PORT}/ws`);
      logger.info(`  🌍  Environment: ${env.NODE_ENV}`);
      logger.info('═══════════════════════════════════════════════════');
    });

    // ── Graceful shutdown ──────────────────────────────────────────
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received – shutting down gracefully...`);
      await prisma.$disconnect();
      httpServer.close(() => {
        logger.info('HTTP server closed. Goodbye 👋');
        process.exit(0);
      });
      // Force exit after 10s
      setTimeout(() => process.exit(1), 10_000);
    };

    process.on('SIGTERM', () => void shutdown('SIGTERM'));
    process.on('SIGINT',  () => void shutdown('SIGINT'));

    // ── Unhandled rejections ───────────────────────────────────────
    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled rejection:', reason);
    });

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception:', error);
      void shutdown('UNCAUGHT_EXCEPTION');
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

void bootstrap();
