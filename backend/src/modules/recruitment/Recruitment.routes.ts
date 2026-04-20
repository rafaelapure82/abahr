import { Router } from 'express';
import { Role } from '@prisma/client';
import { RecruitmentController } from './Recruitment.controller';
import { authJWT } from '../../middlewares/authJWT';
import { rbac } from '../../middlewares/rbac';
import { validate } from '../../middlewares/validate';
import { RecruitmentQuerySchema } from './Recruitment.types';

export const RecruitmentRouter = Router();

RecruitmentRouter.use(authJWT);

RecruitmentRouter.get(
  '/',
  rbac(Role.SUPER_ADMIN, Role.HR_ADMIN, Role.HR_MANAGER, Role.DEPARTMENT_MANAGER),
  validate(RecruitmentQuerySchema, 'query'),
  RecruitmentController.list,
);

RecruitmentRouter.get('/:id',  RecruitmentController.show);
RecruitmentRouter.post('/',    rbac(Role.SUPER_ADMIN, Role.HR_ADMIN, Role.HR_MANAGER), RecruitmentController.create);
RecruitmentRouter.patch('/:id',rbac(Role.SUPER_ADMIN, Role.HR_ADMIN, Role.HR_MANAGER), RecruitmentController.update);
RecruitmentRouter.delete('/:id',rbac(Role.SUPER_ADMIN, Role.HR_ADMIN), RecruitmentController.remove);
