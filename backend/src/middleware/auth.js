import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET || 'development-secret');
    const user = await User.findById(payload.userId);
    if (!user) return res.status(401).json({ success: false, message: 'User no longer exists' });
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

export const errorHandler = (error, _req, res, _next) => {
  console.error(error);
  if (error.code === 11000) return res.status(409).json({ success: false, message: 'Email or username already exists' });
  return res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Internal server error' });
};