import { Router } from 'express';
import { DepartmentsController } from './Departments.controller';
import { authJWT } from '../../middlewares/authJWT';
import { rbac } from '../../middlewares/rbac';
import { validate } from '../../middlewares/validate';
import { 
  departmentsQuerySchema, 
  createDepartmentSchema, 
  updateDepartmentSchema,
  createPositionSchema,
  updatePositionSchema,
  createLocationSchema,
  updateLocationSchema
} from './Departments.types';

export const departmentsRouter = Router();


// Permission sets
const READ_ORG = ['READ:ORG', 'READ:EMPLOYEE', 'MANAGE:ALL'];
const MANAGE_ORG = ['MANAGE:ORG', 'MANAGE:ALL'];

// All routes require authentication
departmentsRouter.use(authJWT);

// ── Departments ────────────────────────────────────────────────────────────

departmentsRouter.get(
  '/',
  rbac(READ_ORG),
  validate(departmentsQuerySchema, 'query'),
  DepartmentsController.list
);

departmentsRouter.get(
  '/tree',
  rbac(READ_ORG),
  DepartmentsController.getTree
);

departmentsRouter.get(
  '/org-chart',
  rbac(READ_ORG),
  DepartmentsController.getOrgChart
);

departmentsRouter.get(
  '/:id',
  rbac(READ_ORG),
  DepartmentsController.show
);

departmentsRouter.post(
  '/',
  rbac(MANAGE_ORG),
  validate(createDepartmentSchema),
  DepartmentsController.create
);

departmentsRouter.patch(
  '/:id',
  rbac(MANAGE_ORG),
  validate(updateDepartmentSchema),
  DepartmentsController.update
);

departmentsRouter.delete(
  '/:id',
  rbac(MANAGE_ORG),
  DepartmentsController.remove
);

// ── Positions ──────────────────────────────────────────────────────────────

departmentsRouter.get(
  '/positions/all',
  rbac(READ_ORG),
  DepartmentsController.listPositions
);

departmentsRouter.post(
  '/positions',
  rbac(MANAGE_ORG),
  validate(createPositionSchema),
  DepartmentsController.createPosition
);

departmentsRouter.patch(
  '/positions/:id',
  rbac(MANAGE_ORG),
  validate(updatePositionSchema),
  DepartmentsController.updatePosition
);

// ── Office Locations ────────────────────────────────────────────────────────

departmentsRouter.get(
  '/locations/all',
  rbac(READ_ORG),
  DepartmentsController.listLocations
);

departmentsRouter.post(
  '/locations',
  rbac(MANAGE_ORG),
  validate(createLocationSchema),
  DepartmentsController.createLocation
);

departmentsRouter.patch(
  '/locations/:id',
  rbac(MANAGE_ORG),
  validate(updateLocationSchema),
  DepartmentsController.updateLocation
);




