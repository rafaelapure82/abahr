import { Router } from 'express';
import { HolidaysController } from './Holidays.controller';
import { validate } from '../../middlewares/validate';
import { createHolidaySchema, updateHolidaySchema, holidayQuerySchema } from './Holidays.types';
import { authJWT } from '../../middlewares/authJWT';
import { rbac } from '../../middlewares/rbac';

const router = Router();

router.use(authJWT);

router.get(
  '/', 
  validate(holidayQuerySchema, 'query'), 
  HolidaysController.list
);

router.post(
  '/', 
  rbac(['MANAGE:SETTINGS', 'MANAGE:ALL']), 
  validate(createHolidaySchema), 
  HolidaysController.create
);

router.patch(
  '/:id', 
  rbac(['MANAGE:SETTINGS', 'MANAGE:ALL']), 
  validate(updateHolidaySchema), 
  HolidaysController.update
);

router.delete(
  '/:id', 
  rbac(['MANAGE:SETTINGS', 'MANAGE:ALL']), 
  HolidaysController.delete
);

export default router;
