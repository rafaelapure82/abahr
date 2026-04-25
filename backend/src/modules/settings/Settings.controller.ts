import { Request, Response, NextFunction } from 'express';
import { settingsService } from './Settings.service';
import { sendOk } from '../../common/utils/response';
import { BadRequest } from '../../common/utils/apiError';
import { env } from '../../config/env';


export class SettingsController {
  
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await settingsService.findAll();
      sendOk(res, data);
    } catch (err) {
      next(err);
    }
  }

  async getPublic(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await settingsService.findPublic();
      sendOk(res, data);
    } catch (err) {
      next(err);
    }
  }

  async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { category } = req.params;
      const userId = (req as any).user?.id;
      const data = await settingsService.updateMany(category, req.body, userId);
      sendOk(res, data, `Settings for ${category} updated successfully`);
    } catch (err) {
      next(err);
    }
  }

  async uploadLogo(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw BadRequest('No file uploaded');
      
      const fileUrl = `${env.APP_URL}/uploads/${req.file.filename}`;
      
      // Update setting immediately
      await settingsService.updateMany('general', { company_logo: fileUrl }, (req as any).user?.id);
      
      sendOk(res, { url: fileUrl }, 'Logo uploaded successfully');
    } catch (err) {
      next(err);
    }
  }

}

export const settingsController = new SettingsController();


