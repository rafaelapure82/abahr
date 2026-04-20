import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server as SocketIO } from 'socket.io';

import { env } from './config/env';
import { logger } from './config/logger';
import { prisma } from './config/prisma';
import { rateLimiter } from './common/middlewares/rateLimiter';
import { errorHandler } from './common/middlewares/errorHandler';
import { notFoundHandler } from './common/middlewares/notFoundHandler';

// ── Route imports (filled per module) ────────────────────────────────────────
import { authRouter } from './modules/auth/auth.router';
import { employeesRouter } from './modules/employees/employees.router';
import { departmentsRouter } from './modules/departments/departments.router';
import { attendanceRouter } from './modules/attendance/attendance.router';
import { payrollRouter } from './modules/payroll/payroll.router';
import { recruitmentRouter } from './modules/recruitment/recruitment.router';
import { performanceRouter } from './modules/performance/performance.router';
import { benefitsRouter } from './modules/benefits/benefits.router';
import { onboardingRouter } from './modules/onboarding/onboarding.router';
import { notificationsRouter } from './modules/notifications/notifications.router';
import { reportsRouter } from './modules/reports/reports.router';
import { webhooksRouter } from './modules/webhooks/webhooks.router';
import { dashboardRouter } from './modules/dashboard/dashboard.router';

// ─────────────────────────────────────────────────────────────────────────────
const app = express();
const httpServer = createServer(app);

// ── Socket.IO ────────────────────────────────────────────────────────────────
export const io = new SocketIO(httpServer, {
  cors: {
    origin: env.CORS_ORIGINS.split(','),
    methods: ['GET', 'POST'],
    credentials: true,
  },
  path: '/ws',
});

io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);
  socket.on('disconnect', () => logger.info(`Socket disconnected: ${socket.id}`));
});

// ── Security middleware ───────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  cors({
    origin: env.CORS_ORIGINS.split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  }),
);

// ── General middleware ────────────────────────────────────────────────────────
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use('/uploads', express.static('uploads'));

// ── Rate limiting ─────────────────────────────────────────────────────────────
app.use('/api/', rateLimiter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? '1.0.0',
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
const API_PREFIX = '/api/v1';

app.use(`${API_PREFIX}/auth`,          authRouter);
app.use(`${API_PREFIX}/employees`,     employeesRouter);
app.use(`${API_PREFIX}/departments`,   departmentsRouter);
app.use(`${API_PREFIX}/attendance`,    attendanceRouter);
app.use(`${API_PREFIX}/payroll`,       payrollRouter);
app.use(`${API_PREFIX}/recruitment`,   recruitmentRouter);
app.use(`${API_PREFIX}/performance`,   performanceRouter);
app.use(`${API_PREFIX}/benefits`,      benefitsRouter);
app.use(`${API_PREFIX}/onboarding`,    onboardingRouter);
app.use(`${API_PREFIX}/notifications`, notificationsRouter);
app.use(`${API_PREFIX}/reports`,       reportsRouter);
app.use(`${API_PREFIX}/webhooks`,      webhooksRouter);
app.use(`${API_PREFIX}/dashboard`,     dashboardRouter);

// ── Error handlers ────────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ── Graceful boot ─────────────────────────────────────────────────────────────
async function bootstrap() {
  try {
    await prisma.$connect();
    logger.info('✅ Database connected');

    httpServer.listen(env.PORT, () => {
      logger.info(`🚀 ABA Talent API running on http://localhost:${env.PORT}`);
      logger.info(`📡 WebSocket listening on ws://localhost:${env.PORT}/ws`);
      logger.info(`🌍 Environment: ${env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// ── Graceful shutdown ─────────────────────────────────────────────────────────
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received – shutting down gracefully');
  await prisma.$disconnect();
  httpServer.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

bootstrap();
