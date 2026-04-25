import { Router } from 'express';
import { settingsController } from './Settings.controller';
import { authJWT } from '../../middlewares/authJWT';
import { rbac } from '../../middlewares/rbac';
import { upload } from '../../middlewares/upload';

const router = Router();

/**
 * ── Public Routes ───────────────────────────────────────────────────────────
 */
router.get('/public', settingsController.getPublic);

/**
 * ── Protected Routes ────────────────────────────────────────────────────────
 */
router.use(authJWT);

router.get('/', rbac(['READ:SETTINGS', 'MANAGE:SETTINGS', 'MANAGE:ALL']), settingsController.getAll);

router.patch('/:category', rbac(['UPDATE:SETTINGS', 'MANAGE:SETTINGS', 'MANAGE:ALL']), settingsController.updateCategory);

router.post('/logo', rbac(['UPDATE:SETTINGS', 'MANAGE:SETTINGS', 'MANAGE:ALL']), upload.single('logo'), settingsController.uploadLogo);

export default router;

