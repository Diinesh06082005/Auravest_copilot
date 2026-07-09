import dotenv from 'dotenv';
import { z } from 'zod';
import { logger } from '../logger';

// Load environment variables from .env file
dotenv.config();

// Apply fallback mapping for common environment key variations
if (process.env.MONGO_URI && !process.env.MONGODB_URI) {
  process.env.MONGODB_URI = process.env.MONGO_URI;
}
if (process.env.JWT_SECRET && !process.env.JWT_ACCESS_SECRET) {
  process.env.JWT_ACCESS_SECRET = process.env.JWT_SECRET;
}
if (process.env.JWT_SECRET && !process.env.JWT_REFRESH_SECRET) {
  process.env.JWT_REFRESH_SECRET = process.env.JWT_SECRET;
}
if (process.env.CLIENT_URL && !process.env.CORS_ORIGIN) {
  process.env.CORS_ORIGIN = process.env.CLIENT_URL;
}

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z.string().url({ message: 'MONGODB_URI/MONGO_URI must be a valid connection string URL' }),
  JWT_ACCESS_SECRET: z.string().min(8, { message: 'JWT_ACCESS_SECRET/JWT_SECRET must be at least 8 characters long' }),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(8, { message: 'JWT_REFRESH_SECRET/JWT_SECRET must be at least 8 characters long' }),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  GOOGLE_CLIENT_ID: z.string().min(1, { message: 'GOOGLE_CLIENT_ID is required' }),
  GOOGLE_CLIENT_SECRET: z.string().min(1, { message: 'GOOGLE_CLIENT_SECRET is required' }),
  GEMINI_API_KEY: z.string().min(1, { message: 'GEMINI_API_KEY is required' }),
  GEMINI_API_KEYS: z.string().optional(),  // comma-separated list for key rotation
  CORS_ORIGIN: z.string().min(1, { message: 'CORS_ORIGIN/CLIENT_URL is required' }),
  TAVILY_API_KEY: z.string().min(1, { message: 'TAVILY_API_KEY is required' }),
  NEWS_API_KEY: z.string().optional().default(''),
  LANGCHAIN_API_KEY: z.string().optional(),
  LANGCHAIN_TRACING_V2: z.string().optional(),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errorDetails = result.error.errors
      .map((err) => `  - ${err.path.join('.')}: ${err.message}`)
      .join('\n');
    
    console.error('❌ Server startup halted due to missing/invalid environment variables:\n' + errorDetails);
    
    // Fail-fast on startup
    process.exit(1);
  }

  // Log a warning if LangSmith is not configured
  if (!result.data.LANGCHAIN_API_KEY) {
    console.warn('⚠️  Warning: LANGCHAIN_API_KEY (LangSmith) is not configured. Running without tracing.');
  }

  return result.data;
};

const env = parseEnv();

export const config = {
  port: env.PORT,
  nodeEnv: env.NODE_ENV,
  mongodbUri: env.MONGODB_URI,
  jwt: {
    accessSecret: env.JWT_ACCESS_SECRET,
    accessExpiresIn: env.JWT_ACCESS_EXPIRES_IN,
    refreshSecret: env.JWT_REFRESH_SECRET,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  },
  google: {
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
  },
  gemini: {
    apiKey: env.GEMINI_API_KEY,
    // Parse all rotation keys; fall back to single key if GEMINI_API_KEYS not set
    apiKeys: env.GEMINI_API_KEYS
      ? env.GEMINI_API_KEYS.split(',').map(k => k.trim()).filter(Boolean)
      : [env.GEMINI_API_KEY],
  },
  corsOrigin: env.CORS_ORIGIN,

  news: {
    apiKey: env.NEWS_API_KEY,
  },
  tavily: {
    apiKey: env.TAVILY_API_KEY,
  },
  langsmith: {
    apiKey: env.LANGCHAIN_API_KEY,
    tracing: env.LANGCHAIN_TRACING_V2,
  },
} as const;

export type Config = typeof config;
