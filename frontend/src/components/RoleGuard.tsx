"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  fallback?: React.ReactNode;
}

export function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
  const { user, isAuthenticated, isLoading, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (allowedRoles && !allowedRoles.some(role => hasRole(role))) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
          <span className="text-4xl font-bold">!</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Acceso Denegado</h2>
        <p className="text-slate-500 mt-2 max-w-md">No tienes los permisos necesarios para ver esta sección. Contacta a tu administrador si crees que esto es un error.</p>
      </div>
    );
  }

  return <>{children}</>;
}
