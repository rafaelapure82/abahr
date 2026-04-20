import { Router } from 'express';
import { Role } from '@prisma/client';
import { AuthController } from './auth.controller';
import { authJWT } from '../../middlewares/authJWT';
import { rbac } from '../../middlewares/rbac';
import { validate } from '../../middlewares/validate';
import { authRateLimiter } from '../../middlewares/rateLimit';
import {
  loginSchema,
  registerSchema,
  refreshSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './auth.types';

export const authRouter = Router();

// Public routes (rate-limited)
authRouter.post('/login',          authRateLimiter, validate(loginSchema),          AuthController.login);
authRouter.post('/refresh',        authRateLimiter, AuthController.refresh);
authRouter.post('/forgot-password',authRateLimiter, validate(forgotPasswordSchema), AuthController.forgotPassword);
authRouter.post('/reset-password', authRateLimiter, validate(resetPasswordSchema),  AuthController.resetPassword);

// Protected – any authenticated user
authRouter.get('/me',              authJWT, AuthController.me);
authRouter.put('/change-password', authJWT, validate(changePasswordSchema), AuthController.changePassword);
authRouter.post('/logout',         authJWT, AuthController.logout);

// Protected – HR+ only (admin creates users)
authRouter.post(
  '/register',
  authJWT,
  rbac(Role.SUPER_ADMIN, Role.HR_ADMIN, Role.HR_MANAGER),
  validate(registerSchema),
  AuthController.register,
);
