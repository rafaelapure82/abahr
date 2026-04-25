export interface UpdateSettingsDto {
  [key: string]: any;
}

export interface SettingsResponse {
  [category: string]: Record<string, any>;
}

export interface SystemConfig {
  id: string;
  key: string;
  value: any;
  category: string;
  isPublic: boolean;
  updatedBy?: string;
  updatedAt: Date;
}
