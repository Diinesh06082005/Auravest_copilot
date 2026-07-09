interface EnvConfig {
  apiUrl: string;
  googleClientId: string;
}

const getEnv = (key: string, required = true): string => {
  const value = import.meta.env[key];
  if (required && (!value || value.trim() === '')) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value || '';
};

const validateEnv = (): EnvConfig => {
  try {
    return {
      apiUrl: getEnv('VITE_API_URL'),
      googleClientId: getEnv('VITE_GOOGLE_CLIENT_ID'),
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error(`❌ Frontend Configuration Error: ${error.message}`);
    }
    throw error;
  }
};

export const config = validateEnv();
