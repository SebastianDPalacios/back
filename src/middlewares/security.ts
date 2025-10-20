import helmet from 'helmet';
import cors from 'cors';
import { env } from '../config/env.js';

export const security = [
  helmet({ contentSecurityPolicy: false }),
  cors({ origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN, credentials: true })
];
