import { registerAs } from '@nestjs/config';
import { validateEnv } from './env.validation';

export const appConfig = registerAs('app', () => {
  const env = validateEnv(process.env);

  return {
    nodeEnv: env.NODE_ENV,
    name: env.APP_NAME,
    url: env.APP_URL,
    port: env.PORT,
    corsOrigins: env.CORS_ORIGINS.split(',').map((origin) => origin.trim()),
    throttle: {
      ttl: env.THROTTLE_TTL_MS,
      limit: env.THROTTLE_LIMIT,
    },
    logLevel: env.LOG_LEVEL,
  };
});

export const databaseConfig = registerAs('database', () => {
  const env = validateEnv(process.env);

  return {
    url: env.DATABASE_URL,
  };
});

export const redisConfig = registerAs('redis', () => {
  const env = validateEnv(process.env);

  return {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD || undefined,
  };
});

export const jwtConfig = registerAs('jwt', () => {
  const env = validateEnv(process.env);

  return {
    accessSecret: env.JWT_ACCESS_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    accessExpiresIn: env.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  };
});
