import { Request, Response, NextFunction, CookieOptions } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../../data/models/user.model';
import { config } from '../../shared/config';
import { logger } from '../../shared/logger';

interface RefreshDecoded {
  id: string;
}

export const refreshSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let refreshToken = '';

    // Extract refresh token from cookies or request body
    if (req.cookies && req.cookies.refresh_token) {
      refreshToken = req.cookies.refresh_token;
    } else if (req.body && req.body.refreshToken) {
      refreshToken = req.body.refreshToken;
    }

    if (!refreshToken) {
      return res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'Refresh token is required.',
      });
    }

    // Verify Refresh Token
    let decoded: RefreshDecoded;
    const errorCookieOptions: CookieOptions = {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: config.nodeEnv === 'production' ? 'none' : 'lax',
    };

    try {
      decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as RefreshDecoded;
    } catch (err: any) {
      res.clearCookie('access_token', errorCookieOptions);
      res.clearCookie('refresh_token', errorCookieOptions);
      return res.status(401).json({
        status: 'error',
        statusCode: 401,
        message: 'Invalid or expired refresh token. Please log in again.',
      });
    }

    // Find User
    const user = await User.findById(decoded.id);
    if (!user) {
      res.clearCookie('access_token', errorCookieOptions);
      res.clearCookie('refresh_token', errorCookieOptions);
      return res.status(401).json({
        status: 'error',
        statusCode: 401,
        message: 'User session no longer exists.',
      });
    }

    // Generate new Access and Refresh tokens
    const accessToken = user.generateAuthToken();
    const newRefreshToken = user.generateRefreshToken();

    // Set cookie options
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

    res.cookie('refresh_token', newRefreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      status: 'success',
      data: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    logger.error('Error refreshing session:', error);
    next(error);
  }
};

export const logout = (req: Request, res: Response) => {
  const cookieOptions: CookieOptions = {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: config.nodeEnv === 'production' ? 'none' : 'lax',
  };

  res.clearCookie('access_token', cookieOptions);
  res.clearCookie('refresh_token', cookieOptions);

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully.',
  });
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'Name, email, and password are required.',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        status: 'error',
        statusCode: 409,
        message: 'A user with this email address already exists.',
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user',
    });

    // Generate tokens
    const accessToken = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();

    // Set cookies
    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: config.nodeEnv === 'production' ? 'none' : 'lax',
    };

    res.cookie('access_token', accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 mins
    });

    res.cookie('refresh_token', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    logger.error('Error during local registration:', error);
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'Email and password are required.',
      });
    }

    // Find user by email and explicitly select password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        status: 'error',
        statusCode: 401,
        message: 'Invalid email or password.',
      });
    }

    // Check password validity
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        status: 'error',
        statusCode: 401,
        message: 'Invalid email or password.',
      });
    }

    // Generate tokens
    const accessToken = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();

    // Set cookies
    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: config.nodeEnv === 'production' ? 'none' : 'lax',
    };

    res.cookie('access_token', accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 mins
    });

    res.cookie('refresh_token', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    logger.error('Error during local login:', error);
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.user as any)?._id;
    const { name, password } = req.body;

    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({
        status: 'error',
        statusCode: 404,
        message: 'User not found.',
      });
    }

    if (name) {
      user.name = name;
    }
    if (password) {
      user.password = password;
    }

    await user.save();

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
      },
    });
  } catch (error) {
    logger.error('Error updating user profile:', error);
    next(error);
  }
};
