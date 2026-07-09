import { Router } from 'express';
import { authRouter } from './auth.routes';
import dashboardRouter from './dashboard.routes';
import researchRouter from './research.routes';

export const mainRouter = Router();

import mongoose from 'mongoose';
import { serviceStatus } from '../../shared/utils/verifyServices';
import { config } from '../../shared/config';

// Health Check Endpoint
mainRouter.get('/health', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const dbStatus = isDbConnected ? 'connected' : 'disconnected';
  
  // Overall status is healthy if database is connected and all required services are validated
  const isHealthy = isDbConnected && 
                    serviceStatus.gemini === 'connected' &&
                    serviceStatus.tavily === 'connected' &&
                    serviceStatus.googleOAuth === 'configured';

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    environment: config.nodeEnv,
    services: {
      mongodb: dbStatus,
      gemini: serviceStatus.gemini,
      tavily: serviceStatus.tavily,
      googleOAuth: serviceStatus.googleOAuth,
      langsmith: serviceStatus.langsmith,
    },
    timestamp: new Date().toISOString(),
  });
});

// Auth Routes
mainRouter.use('/auth', authRouter);

// Dashboard Routes
mainRouter.use('/dashboard', dashboardRouter);

// Research Routes
mainRouter.use('/research', researchRouter);

import { verifyAIInfrastructure } from '../../ai';

// AI Infrastructure Status Route
mainRouter.get('/ai/status', async (req, res) => {
  try {
    const status = await verifyAIInfrastructure();
    res.status(200).json(status);
  } catch (error: any) {
    res.status(500).json({
      langchain: 'failed',
      langgraph: 'failed',
      gemini: 'failed',
      status: `AI infrastructure error: ${error.message}`,
    });
  }
});

