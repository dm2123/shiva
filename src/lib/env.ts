import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),

  MYSQL_HOST: z.string().default('127.0.0.1'),
  MYSQL_PORT: z.string().default('3306'),
  MYSQL_USER: z.string().default('root'),
  MYSQL_PASSWORD: z.string().default('root'),
  MYSQL_DATABASE: z.string().default('the_shiva'),

  REDIS_HOST: z.string().default('127.0.0.1'),
  REDIS_PORT: z.string().default('6379'),
  REDIS_PASSWORD: z.string().default(''),

  SESSION_SECRET: z.string().min(16),
  SESSION_COOKIE_NAME: z.string().default('shiva_session_id'),
  SESSION_TTL_SECONDS: z.string().transform(Number).default('604800'),
});

export const env = envSchema.parse(process.env);
