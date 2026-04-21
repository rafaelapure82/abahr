import { Router } from 'express';
import { Role } from '@prisma/client';
import { RecruitmentController } from './Recruitment.controller';
import { authJWT } from '../../middlewares/authJWT';
import { rbac } from '../../middlewares/rbac';
import { validate } from '../../middlewares/validate';
import { RecruitmentQuerySchema } from './Recruitment.types';

export const recruitmentRouter = Router();



recruitmentRouter.use(authJWT);

const ADMIN_ROLES = ['SUPER_ADMIN', 'HR_ADMIN', 'HR_MANAGER'];
const ALL_ROLES = [...ADMIN_ROLES, 'DEPARTMENT_MANAGER'];

recruitmentRouter.get(
  '/',
  rbac(ALL_ROLES),
  validate(RecruitmentQuerySchema, 'query'),
  RecruitmentController.list,
);

recruitmentRouter.get('/:id',  RecruitmentController.show);
recruitmentRouter.post('/',    rbac(ADMIN_ROLES), RecruitmentController.create);
recruitmentRouter.patch('/:id', rbac(ADMIN_ROLES), RecruitmentController.update);
recruitmentRouter.delete('/:id', rbac(['SUPER_ADMIN', 'HR_ADMIN']), RecruitmentController.remove);



