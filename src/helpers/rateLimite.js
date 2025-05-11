import rateLimit from 'express-rate-limit';

export const refreshTokenLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: 'Too many requests, please try again later.',
});

export const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many requests, please try again later.',
});
