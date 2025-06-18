import { Response } from 'express';
import User from '../models/User';
import { AuthRequest } from '../middleware/authenMiddleware';

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id).select('-password');
    if (!user) {
      res.status(404).json({ msg: 'User not found' });
      return;
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.user!.id,
      { $set: req.body },
      { new: true }
    ).select('-password');

    if (!updated) {
      res.status(404).json({ msg: 'User not found' });
      return;
    }

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
}