import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import emailService from '../services/emailService';

export const requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(200).json({ 
        msg: 'If a user with that email exists, a password reset link has been sent.' 
      });
      return;
    }

    const passwordResetToken = emailService.generateVerificationToken();
    const passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    user.passwordResetToken = passwordResetToken;
    user.passwordResetExpires = passwordResetExpires;
    await user.save();

    try {
      const resetEmail = emailService.generatePasswordResetEmail(user.username, passwordResetToken);
      await emailService.sendEmail({
        to: email,
        subject: 'Password Reset Request',
        html: resetEmail
      });

      res.status(200).json({ 
        msg: 'If a user with that email exists, a password reset link has been sent.',
        emailSent: true
      });
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      
      res.status(500).json({ 
        msg: 'Failed to send password reset email. Please try again later.',
        emailSent: false
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { token, newPassword } = req.body;

  try {
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() }
    });

    if (!user) {
      res.status(400).json({ msg: 'Invalid or expired password reset token' });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({ 
      msg: 'Password has been reset successfully. You can now log in with your new password.' 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

export const verifyResetToken = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.query;

  if (!token || typeof token !== 'string') {
    res.status(400).json({ msg: 'Invalid reset token' });
    return;
  }

  try {
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() }
    });

    if (!user) {
      res.status(400).json({ 
        msg: 'Invalid or expired password reset token',
        valid: false
      });
      return;
    }

    res.status(200).json({ 
      msg: 'Reset token is valid',
      valid: true
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
}