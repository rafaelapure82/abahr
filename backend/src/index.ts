import 'dotenv/config';
import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { createServer, Server } from 'http';
import { Server as SocketIO } from 'socket.io';

// Config
import { env } from './config/env';
import { logger } from './config/logger';
import { corsOptions } from './config/cors';
import { helmetOptions } from './config/helmet';
import { createRedisClient } from './config/redis';
import { createAdapter } from '@socket.io/redis-adapter';

// Middlewares
import { rateLimiter } from './middlewares/rateLimit';
import { requestId } from './middlewares/auditLog';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';

// Module Routers
import authyUsersRouter from './modules/authyusers/AuthyUsers.routes';
import { employeesRouter }     from './modules/employees/Employees.routes';
import { departmentsRouter }   from './modules/departments/Departments.routes';
import { attendanceRouter }    from './modules/attendance/Attendance.routes';
import { leavesRouter }        from './modules/leaves/Leaves.routes';
import { payrollRouter }       from './modules/payroll/Payroll.routes';
import { recruitmentRouter }   from './modules/recruitment/Recruitment.routes';
import { performanceRouter }   from './modules/performance/Performance.routes';
import { benefitsRouter }      from './modules/benefits/Benefits.routes';
import { onboardingRouter }    from './modules/onboarding/Onboarding.routes';
import { offboardingRouter }   from './modules/offboarding/Offboarding.routes';
import { notificationsRouter } from './modules/notifications/Notifications.routes';
import { dashboardRouter }     from './modules/dashboard/Dashboard.routes';
import { reportsRouter }       from './modules/reports/Reports.routes';
import { webhooksRouter }      from './modules/webhooks/Webhooks.routes';
import holidaysRouter        from './modules/holidays/Holidays.routes';
import exportsRouter         from './modules/exports/Exports.routes';
import { auditLogsRouter }   from './modules/audit-logs/AuditLogs.routes';

// ═══════════════════════════════════════════════════════════════════
//  APP FACTORY
// ═══════════════════════════════════════════════════════════════════
export function createApp(): { app: Application; io: SocketIO; httpServer: Server } {
  const app = express();
  const httpServer = createServer(app);

  // ── Socket.IO ──────────────────────────────────────────────────────────
  const io = new SocketIO(httpServer, {
    cors: {
      origin: env.CORS_ORIGINS.split(','),
      methods: ['GET', 'POST'],
      credentials: true,
    },
    path: '/ws',
  });

  // Redis Adapter for Horizontal Scaling
  const pubClient = createRedisClient();
  const subClient = pubClient.duplicate();
  io.adapter(createAdapter(pubClient, subClient));

  // Make io available in controllers
  app.set('io', io);

  io.on('connection', (socket) => {
    logger.debug(`Socket connected: ${socket.id}`);

    // Join personal room for targeted notifications
    socket.on('join', (userId: string) => {
      void socket.join(`user:${userId}`);
      logger.debug(`Socket ${socket.id} joined user:${userId}`);
    });

    socket.on('disconnect', () => {
      logger.debug(`Socket disconnected: ${socket.id}`);
    });
  });

  // ── Security ───────────────────────────────────────────────────────────
  app.use(helmet(helmetOptions));
  app.use(cors(corsOptions));

  // ── General middleware ─────────────────────────────────────────────────
  app.use(compression());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());
  app.use(requestId);

  // ── Logging ────────────────────────────────────────────────────────────
  app.use(
    morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev', {
      stream: { write: (msg) => logger.http(msg.trim()) },
    }),
  );

  // ── Static files (uploads) ─────────────────────────────────────────────
  app.use('/uploads', express.static('uploads'));

  // ── Global rate limiter ────────────────────────────────────────────────
  app.use('/api/', rateLimiter);

  // ── Welcome & Health check ───────────────────────────────────────────
  app.get('/', (_req, res) => {
    res.json({
      success: true,
      message: '🚀 ABA Talent Management API is running',
      docs: '/api/v1',
      health: '/health'
    });
  });

  app.get('/health', (_req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? '1.0.0',
      env: env.NODE_ENV,
    });
  });

  // ── API Routes ─────────────────────────────────────────────────────────
  const API = '/api/v1';

  app.use(`${API}/auth`,          authyUsersRouter);
  app.use(`${API}/employees`,     employeesRouter);
  app.use(`${API}/departments`,   departmentsRouter);
  app.use(`${API}/attendance`,    attendanceRouter);
  app.use(`${API}/leaves`,        leavesRouter);
  app.use(`${API}/payroll`,       payrollRouter);
  app.use(`${API}/recruitment`,   recruitmentRouter);
  app.use(`${API}/performance`,   performanceRouter);
  app.use(`${API}/benefits`,      benefitsRouter);
  app.use(`${API}/onboarding`,    onboardingRouter);
  app.use(`${API}/offboarding`,   offboardingRouter);
  app.use(`${API}/notifications`, notificationsRouter);
  app.use(`${API}/dashboard`,     dashboardRouter);
  app.use(`${API}/reports`,       reportsRouter);
  app.use(`${API}/webhooks`,      webhooksRouter);
  app.use(`${API}/holidays`,      holidaysRouter);
  app.use(`${API}/exports`,       exportsRouter);
  app.use(`${API}/audit-logs`,    auditLogsRouter);

  // ── Error handling (must be last) ─────────────────────────────────────
  app.use(notFoundHandler);
  app.use(errorHandler);

  return { app, io, httpServer };
}
