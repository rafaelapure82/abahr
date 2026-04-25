"use client";

import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, Users, Clock, Briefcase, 
  CreditCard, Settings, LogOut, Search, Bell, User as UserIcon,
  Building2, GitBranch, ShieldAlert
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RoleGuard } from '@/components/RoleGuard';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', roles: ['ADMIN', 'USER'] },
  { icon: Users, label: 'Empleados', href: '/dashboard/employees', roles: ['ADMIN'] },
  { icon: Building2, label: 'Departamentos', href: '/dashboard/departments', roles: ['ADMIN'] },
  { icon: GitBranch, label: 'Organigrama', href: '/dashboard/org-chart', roles: ['ADMIN'] },
  { icon: Clock, label: 'Asistencia', href: '/dashboard/attendance', roles: ['ADMIN', 'USER'] },
  { icon: Briefcase, label: 'Recruitment', href: '/dashboard/recruitment', roles: ['ADMIN'] },
  { icon: Bell, label: 'Onboarding', href: '/dashboard/onboarding', roles: ['ADMIN'] },
  { icon: LogOut, label: 'Offboarding', href: '/dashboard/offboarding', roles: ['ADMIN'] },
  { icon: CreditCard, label: 'Payroll', href: '/dashboard/payroll', roles: ['ADMIN'] },
  { icon: LayoutDashboard, label: 'Reportes', href: '/dashboard/reports', roles: ['ADMIN'] },
  { icon: ShieldAlert, label: 'Auditoría', href: '/dashboard/audit-logs', roles: ['ADMIN'] },
  { icon: Settings, label: 'Configuración', href: '/dashboard/settings', roles: ['ADMIN'] },
  { icon: UserIcon, label: 'Mi Perfil', href: '/dashboard/profile', roles: ['ADMIN', 'USER'] },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, hasRole } = useAuth();
  const pathname = usePathname();

  const getAvatarUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const uploadsBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1').replace('/api/v1', '/uploads');
    return `${uploadsBase}/${url}`;
  };

  return (
    <RoleGuard>
      <div className="flex h-screen bg-[#f8fafc]">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-100 flex flex-col shrink-0">
          <div className="p-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white">
              <Briefcase className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-slate-900">ABA Talent</span>
          </div>

          <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              const isAllowed = item.roles.some(role => hasRole(role));

              if (!isAllowed) return null;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-100">
            <button
              onClick={logout}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-500 hover:bg-red-50 transition-all font-medium"
            >
              <LogOut className="w-5 h-5" />
              Cerrar Sesión
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 shrink-0">
            <div className="relative w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                className="input-modern w-full pl-11 bg-slate-50 border-transparent focus:bg-white"
                placeholder="Buscar empleados, documentos..."
              />
            </div>

            <div className="flex items-center gap-6">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] leading-none mb-1">Bienvenido de vuelta</span>
                <span className="text-sm font-black text-slate-900 leading-none">{user?.employee?.firstName || user?.email?.split('@')[0]}</span>
              </div>

              <button className="relative p-2 text-slate-400 hover:text-primary transition-all hover:scale-110">
                <Bell className="w-6 h-6" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
              </button>
              
              <Link 
                href="/dashboard/profile"
                className="flex items-center gap-3 border-l pl-6 border-slate-100 group"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-black text-slate-900 group-hover:text-primary transition-colors">{user?.email}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{user?.roles?.[0]?.role?.name || 'Usuario'}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 overflow-hidden group-hover:border-primary/30 group-hover:shadow-lg transition-all">
                  {user?.employee?.avatarUrl ? (
                    <img src={getAvatarUrl(user.employee.avatarUrl)} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-6 h-6" />
                  )}
                </div>
              </Link>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 overflow-y-auto p-8">
            {children}
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}
