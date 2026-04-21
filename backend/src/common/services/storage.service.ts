import fs from 'fs/promises';
import path from 'path';
import { env } from '../../config/env';
import { InternalError } from '../utils/apiError';

export interface FileData {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  buffer?: Buffer;
  path?: string;
}

export interface StorageResult {
  url: string;
  key: string;
}

export abstract class StorageService {
  abstract upload(file: FileData, folder: string): Promise<StorageResult>;
  abstract delete(key: string): Promise<void>;
  abstract getUrl(key: string): string;
}

export class LocalStorageService extends StorageService {
  private baseDir: string;

  constructor() {
    super();
    this.baseDir = path.resolve(env.UPLOAD_DIR || './uploads');
  }

  async upload(file: FileData, folder: string): Promise<StorageResult> {
    try {
      const targetDir = path.join(this.baseDir, folder);
      await fs.mkdir(targetDir, { recursive: true });

      const fileName = `${Date.now()}-${file.filename}`;
      const filePath = path.join(targetDir, fileName);
      const relativeKey = path.join(folder, fileName).replace(/\\/g, '/');

      if (file.buffer) {
        await fs.writeFile(filePath, file.buffer);
      } else if (file.path) {
        await fs.copyFile(file.path, filePath);
        // Optionally delete temp file if needed, but usually multer handles it
      } else {
        throw InternalError('No source data for file upload');
      }

      return {
        url: `${env.APP_URL}/uploads/${relativeKey}`,
        key: relativeKey,
      };
    } catch (error) {
      throw InternalError(`Local upload failed: ${(error as Error).message}`);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const filePath = path.join(this.baseDir, key);
      await fs.unlink(filePath);
    } catch (error) {
      // Ignore if not found
    }
  }

  getUrl(key: string): string {
    return `${env.APP_URL}/uploads/${key.replace(/\\/g, '/')}`;
  }
}

// Export singleton based on environment
export const storageService = new LocalStorageService();
// Later we can do: export const storageService = env.STORAGE_DRIVER === 's3' ? new S3StorageService() : new LocalStorageService();
