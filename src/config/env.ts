import 'dotenv/config';
import process = require('process');
import { z } from 'zod';

const Env = z.object({
  PORT: z.coerce.number().default(3001),
  CORS_ORIGIN: z.string().default('*'),
  NODE_ENV: z.enum(['development','test','production']).default('development'),
  LOG_LEVEL: z.enum(['fatal','error','warn','info','debug','trace','silent']).default('info'),
  SWAGGER_ENABLED: z.coerce.boolean().default(true),
  DATABASE_URL: z.string().url(),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  RATE_LIMIT_MAX: z.coerce.number().default(120),
  AI_PROVIDER: z.enum(['gemini','deepseek']).optional(),
  GEMINI_API_KEY: z.string().optional(),
  DEEPSEEK_API_KEY: z.string().optional()
});

export const env = Env.parse(process.env);
export const isProd = env.NODE_ENV === 'production';
