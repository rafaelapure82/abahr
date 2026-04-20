import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { sendOk, sendCreated } from '../../common/utils/response';
import { authService } from './auth.service';

export class AuthController {
  // POST /api/v1/auth/login
  static login = asyncHandler(async (req: Request, res: Response) => {
    const { tokens, user } = await authService.login(req.body);

    // Set refresh token in httpOnly cookie (extra layer)
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    sendOk(res, { tokens, user }, 'Login successful');
  });

  // POST /api/v1/auth/register
  static register = asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.register(req.body);
    sendCreated(res, user, 'User registered successfully');
  });

  // POST /api/v1/auth/refresh
  static refresh = asyncHandler(async (req: Request, res: Response) => {
    // Accept from body OR cookie
    const refreshToken =
      req.body.refreshToken ?? req.cookies?.refreshToken;

    if (!refreshToken) {
      res.status(401).json({ success: false, error: { message: 'Refresh token required' } });
      return;
    }

    const tokens = await authService.refresh({ refreshToken });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    sendOk(res, tokens, 'Token refreshed');
  });

  // POST /api/v1/auth/logout
  static logout = asyncHandler(async (req: Request, res: Response) => {
    await authService.logout(req.user!.sub);
    res.clearCookie('refreshToken');
    sendOk(res, null, 'Logged out successfully');
  });

  // GET /api/v1/auth/me
  static me = asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.getMe(req.user!.sub);
    sendOk(res, user);
  });

  // PUT /api/v1/auth/change-password
  static changePassword = asyncHandler(async (req: Request, res: Response) => {
    await authService.changePassword(req.user!.sub, req.body);
    sendOk(res, null, 'Password changed successfully');
  });

  // POST /api/v1/auth/forgot-password
  static forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    await authService.forgotPassword(req.body);
    sendOk(res, null, 'If that email exists, a reset link has been sent');
  });

  // POST /api/v1/auth/reset-password
  static resetPassword = asyncHandler(async (req: Request, res: Response) => {
    await authService.resetPassword(req.body);
    sendOk(res, null, 'Password reset successfully. Please login.');
  });
}
