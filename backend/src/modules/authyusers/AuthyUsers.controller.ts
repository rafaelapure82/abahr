import { Request, Response } from 'express';
import { authyUsersService } from './AuthyUsers.service';
import { sendOk, sendCreated } from '../../common/utils/response';
import { asyncHandler } from '../../common/utils/asyncHandler';

export class AuthyUsersController {
  
  login = asyncHandler(async (req: Request, res: Response) => {
    const result = await authyUsersService.login(req.body, req.ip || '0.0.0.0');

    if ((result as any).mfaRequired) {
      return sendOk(res, result, 'MFA verification required');
    }

    sendOk(res, result, 'Login successful');
  });

  verify2FA = asyncHandler(async (req: Request, res: Response) => {
    const { mfaToken, code } = req.body;
    const result = await authyUsersService.verify2FA(mfaToken, code, req.ip || '0.0.0.0');

    sendOk(res, result, 'MFA verification successful');
  });

  register = asyncHandler(async (req: Request, res: Response) => {
    const result = await authyUsersService.register(req.body);
    sendCreated(res, result, 'User and Employee registered successfully');
  });

  refresh = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    const result = await authyUsersService.refresh(refreshToken);
    sendOk(res, result, 'Token refreshed successfully');
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    await authyUsersService.logout(userId);
    res.clearCookie('refreshToken');
    sendOk(res, null, 'Logged out successfully');
  });

  getMe = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    // We could add more details here
    sendOk(res, (req as any).user, 'User profile retrieved');
  });

  getPermissions = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const permissions = await authyUsersService.getPermissions(userId);
    sendOk(res, { permissions }, 'User permissions retrieved');
  });

  /**
   * ── MFA Management ────────────────────────────────────────────────────────
   */

  generate2FA = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const result = await authyUsersService.generate2FA(userId);
    sendOk(res, result, 'MFA setup initiated');
  });

  enable2FA = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { token } = req.body;
    const result = await authyUsersService.enable2FA(userId, token);
    sendOk(res, result, 'MFA enabled successfully');
  });

  disable2FA = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const result = await authyUsersService.disable2FA(userId);
    sendOk(res, result, 'MFA disabled successfully');
  });
}

export const authyUsersController = new AuthyUsersController();

