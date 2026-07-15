"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import axios from 'axios';

interface Settings {
  general: Record<string, any>;
  appearance: Record<string, any>;
  notifications: Record<string, any>;
  security: Record<string, any>;
  integrations: Record<string, any>;
}

interface SettingsContextType {
  settings: Settings;
  loading: boolean;
  updateSetting: (category: keyof Settings, key: string, value: any) => void;
  saveSettings: (category?: keyof Settings) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

const defaultSettings: Settings = {
  general: {
    company_name: 'ABA Talent Management',
    company_logo: '',
    contact_email: 'hr@abatalent.com',
  },
  appearance: {
    theme_mode: 'light',
    theme_primary: '#00bfa5',
    is_compact: false,
  },
  notifications: {
    notify_new_hires: true,
    notify_leave_requests: true,
  },
  security: {
    pass_min_8: true,
  },
  integrations: {
    api_enabled: false,
  },
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const refreshSettings = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      const res = await axios.get(`${API_URL}/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.data) {
        setSettings((prev) => ({ ...prev, ...res.data.data }));
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  // Apply Appearance Settings Instantly
  useEffect(() => {
    const { theme_mode, theme_primary } = settings.appearance;

    const html = document.documentElement;
    if (theme_mode === 'dark') {
      html.classList.add('dark');
    } else if (theme_mode === 'light') {
      html.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      html.classList.toggle('dark', prefersDark);
    }

    const colorMap: Record<string, string> = {
      primary: '#00bfa5',
      indigo: '#4f46e5',
      emerald: '#059669',
      rose: '#e11d48',
      amber: '#d97706',
      slate: '#1e293b',
    };

    const hexColor = colorMap[theme_primary] || theme_primary || '#00bfa5';
    document.documentElement.style.setProperty('--primary', hexColor);
    document.documentElement.style.setProperty('--color-primary', hexColor);
    document.documentElement.style.setProperty('--ring', `${hexColor}33`);
  }, [settings.appearance]);

  const updateSetting = (category: keyof Settings, key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  const saveSettings = async (category?: keyof Settings) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No token');
      if (category) {
        await axios.patch(`${API_URL}/settings/${category}`, settings[category], {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        const promises = Object.entries(settings).map(([cat, data]) =>
          axios.patch(`${API_URL}/settings/${cat}`, data, {
            headers: { Authorization: `Bearer ${token}` },
          })
        );
        await Promise.all(promises);
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      throw err;
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, updateSetting, saveSettings, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};