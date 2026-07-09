import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../../data/models/user.model';
import { config } from './index';
import { logger } from '../logger';

export const configurePassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.google.clientId,
        clientSecret: config.google.clientSecret,
        callbackURL: '/api/auth/google/callback',
        proxy: true,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('Google profile does not contain an email address'));
          }

          // 1. Check if user already exists with Google ID
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            return done(null, user);
          }

          // 2. Check if user exists with the same email (traditional login fallback)
          user = await User.findOne({ email });

          if (user) {
            // Bind Google ID to the existing account
            user.googleId = profile.id;
            if (!user.avatar && profile.photos?.[0]?.value) {
              user.avatar = profile.photos[0].value;
            }
            await user.save();
            return done(null, user);
          }

          // 3. Register a new user
          user = await User.create({
            name: profile.displayName || 'Google User',
            email: email,
            googleId: profile.id,
            avatar: profile.photos?.[0]?.value || '',
            role: 'user',
          });

          return done(null, user);
        } catch (error: any) {
          logger.error('Error in Google Strategy authentication:', error);
          return done(error);
        }
      }
    )
  );

  // Passport Serialization (Stateless JWT will bypass session lookup, but defined for compatibility)
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
};
