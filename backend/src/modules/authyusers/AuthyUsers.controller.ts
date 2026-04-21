import { Request, Response } from 'express';
import { authyUsersService } from './AuthyUsers.service';
import { sendOk, sendCreated } from '../../common/utils/response';
import { asyncHandler } from '../../common/utils/asyncHandler';

export class AuthyUsersController {
  
  login = asyncHandler(async (req: Request, res: Response) => {
    const result = await authyUsersService.login(req.body, req.ip || '0.0.0.0');
    
    // Optional: Set refresh token in secure cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    sendOk(res, { user: result.user, accessToken: result.accessToken }, 'Login successful');
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
}

export const authyUsersController = new AuthyUsersController();

