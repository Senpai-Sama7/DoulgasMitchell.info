import { z } from 'zod';
import { logger } from './logger';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().default('file:./dev.db'),
  
  // Auth
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(8).optional(),
  JWT_SECRET: z.string().min(32).optional(),
  
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

let validatedEnv: z.infer<typeof envSchema> | null = null;

export function getEnv() {
  if (validatedEnv) return validatedEnv;
  
  try {
    validatedEnv = envSchema.parse(process.env);
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

// Type-safe env export
export const env = getEnv();

// Feature flags
export const features = {
  passkeys: env.ENABLE_PASSKEYS === 'true',
  analytics: env.ENABLE_ANALYTICS === 'true',
  email: env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS,
  s3: env.STORAGE_PROVIDER === 's3' && env.S3_BUCKET && env.S3_ACCESS_KEY,
  redis: env.UPSTASH_REDIS_URL && env.UPSTASH_REDIS_TOKEN,
  publicAdminSetup: env.ALLOW_PUBLIC_ADMIN_SETUP === 'true',
  adminSeedApi: env.ALLOW_ADMIN_SEED_API === 'true',
} as const;
