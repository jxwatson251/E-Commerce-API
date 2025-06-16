import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export const register = async (req: Request, res: Response): Promise<void> => {
  const { username, email, password } = req.body;

  try {
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      res.status(400).json({ msg: 'User already exists' });
      return;
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashed });
    await user.save();

    res.status(201).json({ msg: 'User registered' });
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

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
}