import { Request, Response, NextFunction } from 'express';
import { Unauthorized, Forbidden } from '../common/utils/apiError';
import { authyUsersService } from '../modules/authyusers/AuthyUsers.service';

/**
 * Authorize one or more permissions.
 * Usage: router.get('/', authJWT, rbac(['READ:EMPLOYEE', 'MANAGE:ALL']), handler)
 */
export const rbac =
  (requiredPermissions: string[]) =>
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        return next(Unauthorized());
      }

      const userPermissions = await authyUsersService.getPermissions(req.user.id);

      // Super Admin escape hatch or general permission check
      const hasPermission = 
        userPermissions.includes('MANAGE:ALL') ||
        requiredPermissions.some(rp => userPermissions.includes(rp));

      if (!hasPermission) {
        return next(
          Forbidden(
            `You do not have the required permissions. Required: ${requiredPermissions.join(' | ')}`,
          ),
        );
      }

      next();
    } catch (err) {
      next(err);
    }
  };

/**
 * Allow only the resource owner OR specified permissions.
 * Usage: rbacOrSelf('employeeId', ['UPDATE:EMPLOYEE', 'MANAGE:ALL'])
 */
export const rbacOrSelf =
  (paramKey: string, requiredPermissions: string[]) =>
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) return next(Unauthorized());

      const userPermissions = await authyUsersService.getPermissions(req.user.id);
      
      const hasPermission = 
        userPermissions.includes('MANAGE:ALL') ||
        requiredPermissions.some(rp => userPermissions.includes(rp));

      // We need to fetch the employeeId of the user if it's not in the token
      // For now, let's assume we can get it from the user object if we expand the payload
      // Or just check userId if the paramKey is 'userId'
      
      const isSelf = req.user.id === req.params[paramKey];

      if (!hasPermission && !isSelf) {
        return next(Forbidden('You can only access your own resources'));
      }

      next();
    } catch (err) {
      next(err);
    }
  };
