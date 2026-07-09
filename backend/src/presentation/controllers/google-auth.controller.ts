import { Request, Response, CookieOptions } from 'express';
import { IUserDocument } from '../../data/models/user.model';
import { config } from '../../shared/config';
import { logger } from '../../shared/logger';

export const googleAuthCallback = (req: Request, res: Response) => {
  try {
    const user = req.user as IUserDocument;
    if (!user) {
      logger.error('Google OAuth callback failed: user not found on request');
      return res.redirect(`${config.corsOrigin}/login?error=auth_failed`);
    }

    // Generate Access & Refresh Tokens
    const accessToken = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();

    // Cookie configuration
    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: config.nodeEnv === 'production' ? 'none' : 'lax',
    };

    // Set cookies
    res.cookie('access_token', accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 mins
    });

    res.cookie('refresh_token', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Redirect user to the frontend dashboard
    return res.redirect(`${config.corsOrigin}/`);
  } catch (error) {
    logger.error('Error handling Google OAuth callback redirect:', error);
    return res.redirect(`${config.corsOrigin}/login?error=server_error`);
  }
};
