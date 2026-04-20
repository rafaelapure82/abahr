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

// Middlewares
import { rateLimiter } from './middlewares/rateLimit';
import { requestId } from './middlewares/auditLog';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';

// Module Routers
import { authRouter }          from './modules/auth/auth.routes';
import { employeesRouter }     from './modules/employees/employees.routes';
import { departmentsRouter }   from './modules/departments/departments.routes';
import { attendanceRouter }    from './modules/attendance/attendance.routes';
import { leavesRouter }        from './modules/leaves/leaves.routes';
import { payrollRouter }       from './modules/payroll/payroll.routes';
import { recruitmentRouter }   from './modules/recruitment/recruitment.routes';
import { performanceRouter }   from './modules/performance/performance.routes';
import { benefitsRouter }      from './modules/benefits/benefits.routes';
import { onboardingRouter }    from './modules/onboarding/onboarding.routes';
import { offboardingRouter }   from './modules/offboarding/offboarding.routes';
import { notificationsRouter } from './modules/notifications/notifications.routes';
import { dashboardRouter }     from './modules/dashboard/dashboard.routes';

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

  // ── Health check ───────────────────────────────────────────────────────
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

  app.use(`${API}/auth`,          authRouter);
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

  // ── Error handling (must be last) ─────────────────────────────────────
  app.use(notFoundHandler);
  app.use(errorHandler);

  return { app, io, httpServer };
}
