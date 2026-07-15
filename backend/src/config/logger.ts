import winston from 'winston';
import path from 'path';
import { env } from './env';

const { combine, timestamp, errors, colorize, printf, json } = winston.format;

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

const prettyFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
    return `${timestamp} [${level}]: ${stack ?? message}${metaStr}`;
  }),
);

const productionFormat = combine(timestamp(), errors({ stack: true }), json());

const logsDir = path.resolve(process.cwd(), 'logs');
const isVercel = !!process.env.VERCEL;

const transports: winston.transport[] = [
  new winston.transports.Console(),
];

if (!isVercel) {
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5,
      tailable: true,
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      level: 'info',
      maxsize: 20 * 1024 * 1024,
      maxFiles: 10,
      tailable: true,
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'access.log'),
      level: 'http',
      maxsize: 20 * 1024 * 1024,
      maxFiles: 5,
      tailable: true,
    })
  );
}

const exceptionHandlers: winston.transport[] = [
  new winston.transports.Console(),
];

if (!isVercel) {
  exceptionHandlers.push(
    new winston.transports.File({ filename: path.join(logsDir, 'exceptions.log') })
  );
}

const rejectionHandlers: winston.transport[] = [
  new winston.transports.Console(),
];

if (!isVercel) {
  rejectionHandlers.push(
    new winston.transports.File({ filename: path.join(logsDir, 'rejections.log') })
  );
}

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  levels,
  format: env.NODE_ENV === 'production' ? productionFormat : prettyFormat,
  transports,
  exceptionHandlers,
  rejectionHandlers,
});
