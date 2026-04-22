import { Router } from 'express';
import { authyUsersController } from './AuthyUsers.controller';
import { validate } from '../../middlewares/validate';
import { loginSchema, registerSchema, verify2FASchema, enable2FASchema } from './AuthyUsers.types';
import { authJWT } from '../../middlewares/authJWT';
import { rbac } from '../../middlewares/rbac';
import { authRateLimiter } from '../../middlewares/rateLimit';

const router = Router();

/**
 * ── Public Routes ───────────────────────────────────────────────────────────
 */

router.post('/login', authRateLimiter, validate(loginSchema), authyUsersController.login);
router.post('/verify-2fa', authRateLimiter, validate(verify2FASchema), authyUsersController.verify2FA);
router.post('/refresh', authyUsersController.refresh);

/**
 * ── Protected Routes ────────────────────────────────────────────────────────
 */

router.use(authJWT);

router.post('/logout', authyUsersController.logout);
router.get('/me', authyUsersController.getMe);
router.get('/me/permissions', authyUsersController.getPermissions);

// MFA Management
router.post('/mfa/setup', authyUsersController.generate2FA);
router.post('/mfa/enable', validate(enable2FASchema), authyUsersController.enable2FA);
router.post('/mfa/disable', authyUsersController.disable2FA);

/**
 * ── Administrative Routes ───────────────────────────────────────────────────
 * Restricted to users with CREATE:USER or MANAGE:ALL permissions
 */

router.post(
  '/register', 
  rbac(['CREATE:USER', 'MANAGE:ALL']), 
  validate(registerSchema), 
  authyUsersController.register
);

export default router;
