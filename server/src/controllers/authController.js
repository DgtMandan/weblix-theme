import crypto from 'crypto';
import { validationResult } from 'express-validator';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { signToken } from '../utils/token.js';
import { sendLoginOtpEmail, sendSignupOtpEmail } from '../services/emailService.js';
import { clientUrl } from '../config/urls.js';

function generateOtp() {
  return String(crypto.randomInt(100000, 1000000));
}

function hashOtp(otp) {
  return crypto.createHash('sha256').update(String(otp)).digest('hex');
}

async function setAndSendOtp(user) {
  const otp = generateOtp();
  user.emailOtpHash = hashOtp(otp);
  user.emailOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
  user.emailOtpAttempts = 0;
  await user.save({ validateBeforeSave: false });
  const result = await sendSignupOtpEmail({ user, otp });
  return process.env.NODE_ENV === 'production' ? result : { ...result, devOtp: otp };
}

async function setAndSendLoginOtp(user) {
  const otp = generateOtp();
  user.loginOtpHash = hashOtp(otp);
  user.loginOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
  user.loginOtpAttempts = 0;
  await user.save({ validateBeforeSave: false });
  const result = await sendLoginOtpEmail({ user, otp });
  return process.env.NODE_ENV === 'production' ? result : { ...result, devOtp: otp };
}

function sendAuth(res, user) {
  const token = signToken(user);
  const safeUser = user.toObject ? user.toObject() : { ...user };
  delete safeUser.password;
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
  res.json({ token, user: safeUser });
}

export const signup = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  const exists = await User.findOne({ email: req.body.email });
  if (exists) {
    res.status(409);
    throw new Error('Email already registered');
  }
  const user = await User.create({ ...req.body, provider: 'local', isEmailVerified: false });
  const otpResult = await setAndSendOtp(user);
  res.status(201).json({
    message: 'Verification code sent. Please verify your email to continue.',
    pendingVerification: true,
    email: user.email,
    devOtp: otpResult.devOtp
  });
});

export const verifySignupOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    res.status(422);
    throw new Error('Email and verification code are required');
  }

  const user = await User.findOne({ email }).select('+emailOtpHash +emailOtpExpires +emailOtpAttempts +password');
  if (!user) return res.status(404).json({ message: 'Account not found' });
  if (user.isEmailVerified) return sendAuth(res, user);
  if (!user.emailOtpHash || !user.emailOtpExpires || user.emailOtpExpires < new Date()) {
    res.status(400);
    throw new Error('Verification code expired. Please request a new code.');
  }
  if ((user.emailOtpAttempts || 0) >= 5) {
    res.status(429);
    throw new Error('Too many attempts. Please request a new code.');
  }
  if (user.emailOtpHash !== hashOtp(otp)) {
    user.emailOtpAttempts = (user.emailOtpAttempts || 0) + 1;
    await user.save({ validateBeforeSave: false });
    res.status(400);
    throw new Error('Invalid verification code');
  }

  user.isEmailVerified = true;
  user.emailOtpHash = undefined;
  user.emailOtpExpires = undefined;
  user.emailOtpAttempts = 0;
  await user.save({ validateBeforeSave: false });
  sendAuth(res, user);
});

export const resendSignupOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(422);
    throw new Error('Email is required');
  }
  const user = await User.findOne({ email }).select('+emailOtpHash +emailOtpExpires +emailOtpAttempts');
  if (!user) return res.status(404).json({ message: 'Account not found' });
  if (user.isEmailVerified) return res.json({ message: 'Email is already verified.' });
  const otpResult = await setAndSendOtp(user);
  res.json({
    message: 'Verification code resent.',
    pendingVerification: true,
    email: user.email,
    devOtp: otpResult.devOtp
  });
});

export const login = asyncHandler(async (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(422);
    throw new Error('Email and password are required');
  }
  const user = await User.findOne({ email: req.body.email }).select('+password');
  if (!user || !(await user.comparePassword(req.body.password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }
  if (user.provider === 'local' && !user.isEmailVerified) {
    const otpResult = await setAndSendOtp(user);
    return res.status(403).json({
      message: 'Please verify your email. A new verification code has been sent.',
      pendingVerification: true,
      email: user.email,
      devOtp: otpResult.devOtp
    });
  }
  if (user.provider === 'local' && user.twoFactorEnabled !== false) {
    const otpResult = await setAndSendLoginOtp(user);
    return res.status(202).json({
      message: 'Two-step verification code sent to your email.',
      pendingTwoFactor: true,
      email: user.email,
      devOtp: otpResult.devOtp
    });
  }
  sendAuth(res, user);
});

export const verifyLoginOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    res.status(422);
    throw new Error('Email and verification code are required');
  }

  const user = await User.findOne({ email }).select('+loginOtpHash +loginOtpExpires +loginOtpAttempts');
  if (!user) return res.status(404).json({ message: 'Account not found' });
  if (!user.loginOtpHash || !user.loginOtpExpires || user.loginOtpExpires < new Date()) {
    res.status(400);
    throw new Error('Two-step verification code expired. Please sign in again.');
  }
  if ((user.loginOtpAttempts || 0) >= 5) {
    res.status(429);
    throw new Error('Too many attempts. Please sign in again to request a new code.');
  }
  if (user.loginOtpHash !== hashOtp(otp)) {
    user.loginOtpAttempts = (user.loginOtpAttempts || 0) + 1;
    await user.save({ validateBeforeSave: false });
    res.status(400);
    throw new Error('Invalid verification code');
  }

  user.loginOtpHash = undefined;
  user.loginOtpExpires = undefined;
  user.loginOtpAttempts = 0;
  await user.save({ validateBeforeSave: false });
  sendAuth(res, user);
});

export const resendLoginOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(422);
    throw new Error('Email is required');
  }
  const user = await User.findOne({ email }).select('+loginOtpHash +loginOtpExpires +loginOtpAttempts');
  if (!user) return res.status(404).json({ message: 'Account not found' });
  if (user.provider !== 'local') return res.status(400).json({ message: 'Use your OAuth provider to sign in.' });
  const otpResult = await setAndSendLoginOtp(user);
  res.json({
    message: 'Two-step verification code resent.',
    pendingTwoFactor: true,
    email: user.email,
    devOtp: otpResult.devOtp
  });
});

export const logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
};

export const me = (req, res) => res.json({ user: req.user });

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (req.body.name) user.name = req.body.name;
  if (req.file) user.avatar = req.file.path;
  await user.save({ validateBeforeSave: false });
  const safeUser = user.toObject();
  delete safeUser.password;
  res.json({ user: safeUser });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  if (!req.body.email) {
    res.status(422);
    throw new Error('Email is required');
  }

  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.json({ message: 'If that email exists, a reset link has been prepared.' });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpires = Date.now() + 1000 * 60 * 30;
  await user.save({ validateBeforeSave: false });

  res.json({
    message: 'Password reset link generated. Connect an email provider in production to send this link.',
    resetUrl: `${clientUrl()}/reset-password/${resetToken}`
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password || password.length < 8) {
    res.status(422);
    throw new Error('A valid token and password with 8+ characters are required');
  }

  const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpires: { $gt: Date.now() }
  }).select('+resetPasswordToken +resetPasswordExpires');

  if (!user) {
    res.status(400);
    throw new Error('Reset token is invalid or expired');
  }

  user.password = password;
  user.provider = user.provider || 'local';
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  sendAuth(res, user);
});
