import { Router } from 'express';
import { authyUsersController } from './AuthyUsers.controller';
import { validate } from '../../middlewares/validate';
import { loginSchema, registerSchema } from './AuthyUsers.types';
import { authJWT } from '../../middlewares/authJWT';
import { rbac } from '../../middlewares/rbac';
import { authRateLimiter } from '../../middlewares/rateLimit';

const router = Router();

/**
 * ── Public Routes ───────────────────────────────────────────────────────────
 */

router.post('/login', authRateLimiter, validate(loginSchema), authyUsersController.login);
router.post('/refresh', authyUsersController.refresh);

/**
 * ── Protected Routes ────────────────────────────────────────────────────────
 */

router.use(authJWT);

router.post('/logout', authyUsersController.logout);
router.get('/me', authyUsersController.getMe);
router.get('/me/permissions', authyUsersController.getPermissions);

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
