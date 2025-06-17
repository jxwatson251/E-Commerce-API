import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import emailService from '../services/emailService';

export const register = async (req: Request, res: Response): Promise<void> => {
  const { username, email, password } = req.body;

  try {
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      res.status(400).json({ msg: 'User already exists' });
      return;
    }

    const hashed = await bcrypt.hash(password, 10);
    const emailVerificationToken = emailService.generateVerificationToken();
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = new User({ 
      username, 
      email, 
      password: hashed,
      emailVerificationToken,
      emailVerificationExpires
    });
    
    await user.save();

    try {
      const verificationEmail = emailService.generateVerificationEmail(username, emailVerificationToken);
      await emailService.sendEmail({
        to: email,
        subject: 'Verify your email address',
        html: verificationEmail
      });

      res.status(201).json({ 
        msg: 'User registered successfully. Please check your email to verify your account.',
        emailSent: true
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      res.status(201).json({ 
        msg: 'User registered successfully, but verification email could not be sent. Please request a new verification email.',
        emailSent: false
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.query;

  if (!token || typeof token !== 'string') {
    res.status(400).json({ msg: 'Invalid verification token' });
    return;
  }

  try {
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() }
    });

    if (!user) {
      res.status(400).json({ msg: 'Invalid or expired verification token' });
      return;
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({ msg: 'Email verified successfully. You can now log in.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

export const resendVerificationEmail = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ msg: 'User not found' });
      return;
    }

    if (user.isEmailVerified) {
      res.status(400).json({ msg: 'Email is already verified' });
      return;
    }

    const emailVerificationToken = emailService.generateVerificationToken();
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationExpires = emailVerificationExpires;
    await user.save();

    try {
      const verificationEmail = emailService.generateVerificationEmail(user.username, emailVerificationToken);
      await emailService.sendEmail({
        to: email,
        subject: 'Verify your email address',
        html: verificationEmail
      });

      res.json({ msg: 'Verification email sent successfully' });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      res.status(500).json({ msg: 'Failed to send verification email' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ msg: 'Invalid credentials' });
      return;
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      res.status(400).json({ msg: 'Invalid credentials' });
      return;
    }

    if (!user.isEmailVerified) {
      res.status(400).json({ 
        msg: 'Please verify your email before logging in',
        emailVerified: false
      });
      return;
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
}
