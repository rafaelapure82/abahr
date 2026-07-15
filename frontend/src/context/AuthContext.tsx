"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  isActive: boolean;
  roles: any[];
  employee?: { 
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 1. Initial auth check
    const checkAuth = () => {
      const token = localStorage.getItem('access_token');
      const userData = localStorage.getItem('user_data');

      if (token && userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (e) {
          console.error("Error parsing user data", e);
          logout();
        }
      }
      setIsLoading(false);
    };

    checkAuth();

    // 2. Axios interceptor for automatic token refresh on 401
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // If error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) throw new Error("No refresh token");

            const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
            const { accessToken } = response.data.data;
            
            localStorage.setItem('access_token', accessToken);
            
            // Retry the original request with the new token
            originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
            return axios(originalRequest);
          } catch (refreshError) {
            console.error("Session expired, logging out...");
            logout();
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const login = async (credentials: any) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      const { data } = response.data;
      
      localStorage.setItem('access_token', data.accessToken);
      localStorage.setItem('refresh_token', data.refreshToken);
      localStorage.setItem('user_data', JSON.stringify(data.user));
      
      setUser(data.user);
      router.push('/dashboard');
    } catch (error) {
      console.error("Login error", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    setUser(null);
    router.push('/auth/login');
  };

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const { data } = response.data;
      localStorage.setItem('user_data', JSON.stringify(data));
      setUser(data);
    } catch (error) {
      console.error("Refresh user error", error);
    }
  };

  const hasRole = (roleName: string) => {
    if (!user || !user.roles) return false;
    return user.roles.some((r: any) => 
      r.role.name === roleName || r.role.name === 'SUPER_ADMIN'
    );
  };

  const hasPermission = (permission: string) => {
    // Basic implementation based on legacy logic
    // You might want to fetch permissions from backend if not in user object
    return true; 
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading, 
      login, 
      logout, 
      refreshUser,
      hasRole, 
      hasPermission 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
