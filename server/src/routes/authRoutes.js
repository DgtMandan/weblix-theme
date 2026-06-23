import express from 'express';
import passport from 'passport';
import { body } from 'express-validator';
import { signup, login, logout, me, forgotPassword, resetPassword, updateProfile, verifySignupOtp, resendSignupOtp, verifyLoginOtp, resendLoginOtp } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { signToken } from '../utils/token.js';
import { clientUrl } from '../config/urls.js';

export const authRoutes = express.Router();

authRoutes.post('/signup', body('email').isEmail(), body('password').isLength({ min: 8 }), signup);
authRoutes.post('/verify-otp', verifySignupOtp);
authRoutes.post('/resend-otp', resendSignupOtp);
authRoutes.post('/login', login);
authRoutes.post('/verify-login-otp', verifyLoginOtp);
authRoutes.post('/resend-login-otp', resendLoginOtp);
authRoutes.post('/logout', logout);
authRoutes.get('/me', protect, me);
authRoutes.put('/profile', protect, upload.single('avatar'), updateProfile);
authRoutes.post('/forgot-password', forgotPassword);
authRoutes.post('/reset-password', resetPassword);

authRoutes.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
authRoutes.get('/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
  const token = signToken(req.user);
  res.redirect(`${clientUrl()}/oauth/success?token=${token}`);
});

authRoutes.get('/github', passport.authenticate('github', { scope: ['user:email'], session: false }));
authRoutes.get('/github/callback', passport.authenticate('github', { session: false }), (req, res) => {
  const token = signToken(req.user);
  res.redirect(`${clientUrl()}/oauth/success?token=${token}`);
});
