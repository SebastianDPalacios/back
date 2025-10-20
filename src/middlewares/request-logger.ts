import pino from 'pino';
import pinoHttp from 'pino-http';
import { env } from '../config/env.js';

export const logger = pino({ level: env.LOG_LEVEL, base: undefined });
export const httpLogger = pinoHttp({ logger, genReqId: (req) => (req as any).requestId });
