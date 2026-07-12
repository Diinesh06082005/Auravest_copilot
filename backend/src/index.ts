import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import mongoose from 'mongoose';
import passport from 'passport';
import { config } from './shared/config';
import { logger } from './shared/logger';
import { configurePassport } from './shared/config/passport';
import { mainRouter } from './presentation/routes';
import { verifyServices } from './shared/utils/verifyServices';
import { User } from './data/models/user.model';

// Configure Passport.js OAuth Strategies
configurePassport();

const app = express();

// ==============================================================================
// Security Middlewares
// ==============================================================================
app.use(helmet());
app.use(
  cors({
    origin: config.corsOrigin.split(',').map(o => o.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ==============================================================================
// Request Parsers & Optimization Middlewares
// ==============================================================================
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());
app.use(passport.initialize());

// ==============================================================================
// Request Logging (Morgan linked to Winston)
// ==============================================================================
const morganFormat = config.nodeEnv === 'development' ? 'dev' : 'combined';
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message: string) => logger.http(message.trim()),
    },
  })
);

// ==============================================================================
// Global Rate Limiter
// ==============================================================================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per window
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    status: 'error',
    statusCode: 429,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
});
app.use('/api', limiter);

// ==============================================================================
// Route Loader
// ==============================================================================
app.use('/api', mainRouter);

// ==============================================================================
// 404 Route Handler
// ==============================================================================
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    statusCode: 404,
    message: `Cannot ${req.method} ${req.originalUrl}. Route not found.`,
  });
});

// ==============================================================================
// Global Error Handler
// ==============================================================================
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  logger.error(`${req.method} ${req.url} - Error: ${message}`, {
    stack: config.nodeEnv === 'development' ? err.stack : undefined,
  });

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message: config.nodeEnv === 'production' && statusCode === 500 ? 'Internal Server Error' : message,
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
});

let server: any;

async function bootstrap() {
  try {
    // Validate required integrations and connect database
    await verifyServices();
    
    // Seed default demo user if not exists
    const demoEmail = 'demo@auravest.com';
    const demoUser = await User.findOne({ email: demoEmail });
    if (!demoUser) {
      logger.info(`🌱 Seeding default demo user: ${demoEmail}`);
      await User.create({
        name: 'Demo User',
        email: demoEmail,
        password: 'demopassword',
        role: 'user',
      });
      logger.info('✅ Demo user seeded successfully.');
    } else {
      logger.info('ℹ️ Demo user already exists.');
    }
    
    server = app.listen(config.port, () => {
      logger.info(`⚡ Server running in ${config.nodeEnv} mode on port ${config.port}`);
    });
  } catch (error: any) {
    logger.error('❌ Server startup failed due to service validation errors:', error);
    process.exit(1);
  }
}

bootstrap();

const gracefulShutdown = (signal: string) => {
  logger.warn(`Received ${signal}. Initiating graceful shutdown...`);
  
  server.close(async () => {
    logger.info('HTTP server closed.');
    try {
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
        logger.info('Database connection closed.');
      }
      logger.info('Graceful shutdown completed successfully. Exiting.');
      process.exit(0);
    } catch (err) {
      logger.error('Error closing resources during graceful shutdown:', err);
      process.exit(1);
    }
  });

  // Force close after 10 seconds if connections are hanging
  setTimeout(() => {
    logger.error('Could not close connections in time. Forcefully shutting down.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
