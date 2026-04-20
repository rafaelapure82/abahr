import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { Unauthorized, Forbidden } from '../common/utils/apiError';

// ── Role decorator / guard ────────────────────────────────────────────────────

/**
 * Authorize one or more roles.
 * Usage: router.get('/', authJWT, rbac(Role.HR_ADMIN, Role.SUPER_ADMIN), handler)
 */
export const rbac =
  (...roles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(Unauthorized());
    }

    if (!roles.includes(req.user.role as Role)) {
      return next(
        Forbidden(
          `Role '${req.user.role}' is not authorized. Required: ${roles.join(' | ')}`,
        ),
      );
    }

    next();
  };

/**
 * Allow only the resource owner OR specified roles.
 * Usage: rbacOrSelf('employeeId', Role.HR_ADMIN)
 * Compares req.params[paramKey] against req.user.employeeId
 */
export const rbacOrSelf =
  (paramKey: string, ...roles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(Unauthorized());

    const isPrivileged = roles.includes(req.user.role as Role);
    const isSelf = req.user.employeeId === req.params[paramKey];

    if (!isPrivileged && !isSelf) {
      return next(Forbidden('You can only access your own resources'));
    }

    next();
  };

/**
 * Role hierarchy check – allows the given role and ALL roles above it.
 * Order (ascending): VIEWER → EMPLOYEE → RECRUITER → DEPT_MANAGER →
 *                    PAYROLL_ADMIN → HR_MANAGER → HR_ADMIN → SUPER_ADMIN
 */
const ROLE_LEVELS: Record<Role, number> = {
  VIEWER: 0,
  EMPLOYEE: 1,
  RECRUITER: 2,
  DEPARTMENT_MANAGER: 3,
  PAYROLL_ADMIN: 4,
  HR_MANAGER: 5,
  HR_ADMIN: 6,
  SUPER_ADMIN: 7,
};

export const rbacLevel =
  (minRole: Role) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(Unauthorized());

    const userLevel = ROLE_LEVELS[req.user.role as Role] ?? -1;
    const requiredLevel = ROLE_LEVELS[minRole];

    if (userLevel < requiredLevel) {
      return next(Forbidden(`Requires at least '${minRole}' role`));
    }

    next();
  };
