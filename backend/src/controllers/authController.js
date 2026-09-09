import User from '../models/User.js';
import { generateToken } from '../utils/tokenGenerator.js';

const authResponse = (user) => ({ success: true, token: generateToken(user._id.toString()), user });

export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) return res.status(409).json({ success: false, message: 'Email or username is already registered' });
    const user = await User.create({ username, email, password });
    res.status(201).json(authResponse(user));
  } catch (error) { next(error); }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) return res.status(401).json({ success: false, message: 'Invalid email or password' });
    res.json(authResponse(user));
  } catch (error) { next(error); }
};

export const getMe = (req, res) => res.json({ success: true, user: req.user });

export const logout = (_req, res) => res.json({ success: true, message: 'Logged out successfully' });