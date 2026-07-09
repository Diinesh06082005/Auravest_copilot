import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../shared/config';
import { User } from '../../data/models/user.model';
import { logger } from '../../shared/logger';

interface DecodedToken {
  id: string;
  email: string;
  role: string;
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token = '';

    // 1. Check Authorization Header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // 2. Check Cookie Fallback
    else if (req.cookies && req.cookies.access_token) {
      token = req.cookies.access_token;
    }
    // 3. Check Query Parameter Fallback (for EventSource/SSE)
    else if (req.query && req.query.token) {
      token = req.query.token as string;
    }

    if (!token) {
      return res.status(401).json({
        status: 'error',
        statusCode: 401,
        message: 'Authentication required. Please provide a valid token.',
      });
    }

    // Verify Access Token
    let decoded: DecodedToken;
    try {
      decoded = jwt.verify(token, config.jwt.accessSecret) as DecodedToken;
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          status: 'error',
          statusCode: 401,
          message: 'Access token has expired. Please refresh your session.',
        });
      }
      return res.status(401).json({
        status: 'error',
        statusCode: 401,
        message: 'Invalid access token.',
      });
    }

    // Check if User Still Exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        status: 'error',
        statusCode: 401,
        message: 'The user associated with this session no longer exists.',
      });
    }

    // Mount user onto Request
    req.user = user;
    next();
  } catch (error) {
    logger.error('Error in authentication middleware:', error);
    next(error);
  }
};

// Role-Based Authorization Guard
export const authorize = (...roles: Array<'user' | 'analyst' | 'admin'>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        statusCode: 401,
        message: 'Authentication required.',
      });
    }

    if (!roles.includes((req.user as any).role)) {
      return res.status(403).json({
        status: 'error',
        statusCode: 403,
        message: 'Access denied. You do not have permissions to access this resource.',
      });
    }

    next();
  };
};
