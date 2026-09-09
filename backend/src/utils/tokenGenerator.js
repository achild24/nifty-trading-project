import jwt from 'jsonwebtoken';

export const generateToken = (userId) => jwt.sign(
  { userId },
  process.env.JWT_SECRET || 'development-secret',
  { expiresIn: process.env.JWT_EXPIRE || '7d' },
);