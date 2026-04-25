import { prisma } from '../../config/prisma';
import { NotFound } from '../../common/utils/apiError';
import { logger } from '../../config/logger';

export class SettingsService {
  
  async findAll() {
    const configs = await prisma.systemConfig.findMany();
    
    // Group by category
    const grouped: Record<string, any> = {};
    configs.forEach(c => {
      if (!grouped[c.category]) grouped[c.category] = {};
      grouped[c.category][c.key] = c.value;
    });
    
    return grouped;
  }

  async findByCategory(category: string) {
    const configs = await prisma.systemConfig.findMany({
      where: { category }
    });
    
    const result: Record<string, any> = {};
    configs.forEach(c => {
      result[c.key] = c.value;
    });
    
    return result;
  }

  async findPublic() {
    const configs = await prisma.systemConfig.findMany({
      where: { isPublic: true }
    });
    
    const result: Record<string, any> = {};
    configs.forEach(c => {
      result[c.key] = c.value;
    });
    
    return result;
  }

  async updateMany(category: string, data: Record<string, any>, userId?: string) {
    logger.info(`Updating settings for category: ${category}`);
    
    const updates = Object.entries(data).map(([key, value]) => {
      return prisma.systemConfig.upsert({
        where: { key },
        update: { 
          value, 
          updatedBy: userId,
          category // Ensure category is set
        },
        create: {
          key,
          value,
          category,
          updatedBy: userId,
          isPublic: this.isKeyPublic(key)
        }
      });
    });

    await Promise.all(updates);
    return this.findByCategory(category);
  }

  private isKeyPublic(key: string): boolean {
    const publicKeys = [
      'company_name', 
      'company_logo', 
      'theme_primary', 
      'theme_mode', 
      'contact_email', 
      'website',
      'is_compact'
    ];
    return publicKeys.includes(key);
  }

}

export const settingsService = new SettingsService();
