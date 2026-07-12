import { Router } from 'express';
import passport from 'passport';
import { refreshSession, logout, register, login, updateProfile } from '../controllers/auth.controller';
import { googleAuthCallback } from '../controllers/google-auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
 
export const authRouter = Router();
 
authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/refresh', refreshSession);
authRouter.post('/logout', logout);
authRouter.put('/me', authenticate, updateProfile);

// Google OAuth Authorization Trigger Route
authRouter.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

// Google OAuth Callback Redirect Route
authRouter.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login?error=auth_failed', session: false }),
  googleAuthCallback
);

// Session Verification Test Route
authRouter.get('/me', authenticate, (req, res) => {
  const user = req.user as any;
  const accessToken = user.generateAuthToken();
  res.status(200).json({
    status: 'success',
    data: {
      user: {
        id: user?._id,
        name: user?.name,
        email: user?.email,
        role: user?.role,
        avatar: user?.avatar,
      },
      accessToken,
    },
  });
});
