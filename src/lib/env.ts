import { z } from 'zod';
import { logger } from './logger';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().default('file:./dev.db'),

  // Auth
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(8).optional(),
  JWT_SECRET: z.string().min(32),

  // Passkeys (WebAuthn)
  PASSKEY_RP_ID: z.string().optional(),
  PASSKEY_RP_NAME: z.string().default('Douglas Mitchell Portfolio'),
  PASSKEY_EXPECTED_ORIGINS: z.string().optional(),

  // Redis/Cache
  UPSTASH_REDIS_URL: z.string().optional(),
  UPSTASH_REDIS_TOKEN: z.string().optional(),

  // Storage
  STORAGE_PROVIDER: z.enum(['local', 's3', 'r2']).default('local'),
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().default('us-east-1'),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),

  // Upload limits
  MAX_FILE_SIZE: z.string().default('50'), // MB
  UPLOAD_DIR: z.string().default('./public/uploads'),

  // App config
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_SITE_URL: z.string().url().default('https://douglasmitchell.info'),
  ALLOW_PUBLIC_ADMIN_SETUP: z.string().default('false'),
  ALLOW_ADMIN_SEED_API: z.string().default('false'),

  // AI
  GOOGLE_GEMINI_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  OPENROUTER_API_KEY: z.string().optional(),
  SAMBANOVA_API_KEY: z.string().optional(),
  CEREBRAS_API_KEY: z.string().optional(),
  MISTRAL_API_KEY: z.string().optional(),
  MINIMAX_API_KEY: z.string().optional(),
  OLLAMA_CLOUD_API_KEY: z.string().optional(),
  OLLAMA_CLOUD_BASE_URL: z.string().url().optional(),
  OPENCODE_ZEN_API_KEY: z.string().optional(),
  OPENCODE_ZEN_BASE_URL: z.string().url().optional(),
  OPENAI_API_KEY: z.string().optional(),

  // Features
  ENABLE_PASSKEYS: z.string().default('true'),
  ENABLE_ANALYTICS: z.string().default('false'),

  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().default('587'),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  FROM_EMAIL: z.string().email().optional(),
});

export type AppEnv = z.infer<typeof envSchema>;

let validatedEnv: AppEnv | null = null;

/** True while Next is collecting page data / compiling — not a live request. */
function isNextBuildPhase() {
  return (
    process.env.NEXT_PHASE === 'phase-production-build' ||
    process.env.NEXT_PHASE === 'phase-export' ||
    process.env.npm_lifecycle_event === 'build'
  );
}

/**
 * During `next build`, route modules are evaluated to collect page data even
 * when secrets are not present in the build environment (common on Vercel
 * preview). Supply a non-operational placeholder so validation does not abort
 * the build; runtime requests still require a real JWT_SECRET.
 */
function resolveEnvSource(): NodeJS.ProcessEnv {
  if (process.env.JWT_SECRET || !isNextBuildPhase()) {
    return process.env;
  }

  return {
    ...process.env,
    JWT_SECRET: 'build-time-placeholder-not-for-runtime-use!!',
  };
}

export function getEnv(): AppEnv {
  if (validatedEnv) return validatedEnv;

  try {
    validatedEnv = envSchema.parse(resolveEnvSource());
    return validatedEnv;
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('Environment validation failed:');
      error.issues.forEach((err) => {
        logger.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    }
    throw new Error('Invalid environment variables');
  }
}

/**
 * Lazy env access — importing this module must not throw during Next.js build
 * page-data collection. Properties resolve through getEnv() on first read.
 */
export const env: AppEnv = new Proxy({} as AppEnv, {
  get(_target, property) {
    if (typeof property !== 'string') return undefined;
    return getEnv()[property as keyof AppEnv];
  },
});

function readFeatureFlags() {
  const current = getEnv();
  return {
    passkeys: current.ENABLE_PASSKEYS === 'true',
    analytics: current.ENABLE_ANALYTICS === 'true',
    email: Boolean(current.SMTP_HOST && current.SMTP_USER && current.SMTP_PASS),
    s3:
      current.STORAGE_PROVIDER === 's3' &&
      Boolean(current.S3_BUCKET && current.S3_ACCESS_KEY),
    redis: Boolean(current.UPSTASH_REDIS_URL && current.UPSTASH_REDIS_TOKEN),
    publicAdminSetup: current.ALLOW_PUBLIC_ADMIN_SETUP === 'true',
    adminSeedApi: current.ALLOW_ADMIN_SEED_API === 'true',
  } as const;
}

type FeatureFlags = ReturnType<typeof readFeatureFlags>;

/** Lazy feature flags — same build-safety rationale as `env`. */
export const features: FeatureFlags = new Proxy({} as FeatureFlags, {
  get(_target, property) {
    if (typeof property !== 'string') return undefined;
    return readFeatureFlags()[property as keyof FeatureFlags];
  },
});
