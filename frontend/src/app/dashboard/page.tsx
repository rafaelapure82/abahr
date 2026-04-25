"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, Calendar, Clock, Briefcase, 
  Search, Bell, MoreHorizontal, TrendingUp, 
  UserCheck, UserMinus, Plus, Building2,
  CalendarClock, Star, AlertCircle, DollarSign,
  TrendingDown, CheckCircle2, Loader2, ArrowUpRight,
  ArrowDownRight, Cake
} from 'lucide-react';
import Link from 'next/link';
import React from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export default function MainDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    fetchDashboard();
  }, [period]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.get(`${API_URL}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { period }
      });
      setData(res.data.data);
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return <DashboardSkeleton />;
  }

  const kpis = data?.kpis || {};

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Panel de Control</h1>
          <p className="text-slate-500 font-medium mt-1">Monitoreo en tiempo real de ABA Talent HR.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar..." 
              className="input-modern pl-11 w-64 bg-white border-transparent shadow-sm focus:shadow-md transition-all"
            />
          </div>
          <Link href="/dashboard/employees/new" className="btn-primary px-6 py-3 flex items-center gap-2 shadow-lg hover:shadow-primary/20 transition-all">
            <Plus className="w-4 h-4" />
            Nuevo Registro
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard 
          kpi={kpis.totalEmployees}
          color="bg-indigo-500" 
          icon={<Users />}
        />
        <SummaryCard 
          kpi={kpis.activeEmployees}
          color="bg-emerald-500" 
          icon={<UserCheck />}
        />
        <SummaryCard 
          kpi={kpis.pendingLeaves}
          color="bg-amber-500" 
          icon={<CalendarClock />}
        />
        <SummaryCard 
          kpi={kpis.turnoverRate}
          color="bg-rose-500" 
          icon={<TrendingDown />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Attendance Chart Area */}
        <div className="lg:col-span-2 space-y-8">
          <div className="card-premium p-8 bg-white border-none shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-black text-slate-800">Tendencia Mensual</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Altas vs Bajas de Personal</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setPeriod('month')}
                  className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${period === 'month' ? 'bg-primary text-white shadow-md' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                >
                  Mes
                </button>
                <button 
                  onClick={() => setPeriod('quarter')}
                  className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${period === 'quarter' ? 'bg-primary text-white shadow-md' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                >
                  Trimestre
                </button>
              </div>
            </div>
            
            <div className="h-72 flex items-end justify-between gap-4 px-2 relative">
              {/* Background Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-[0.03]">
                {[...Array(5)].map((_, i) => <div key={i} className="w-full border-t border-slate-900" />)}
              </div>

              {data?.monthlyTrends?.length > 0 ? data.monthlyTrends.map((trend: any, i: number) => {
                const max = Math.max(...data.monthlyTrends.map((t: any) => t.hires + t.terminations + 1));
                const hireHeight = (trend.hires / max) * 100;
                const termHeight = (trend.terminations / max) * 100;

                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-3 group relative z-10">
                    <div className="w-full flex items-end justify-center gap-1.5 h-64">
                      {/* Hire Bar */}
                      <div 
                        className="w-3 md:w-5 bg-emerald-500 rounded-t-lg transition-all duration-1000 relative group/bar" 
                        style={{ height: `${Math.max(5, hireHeight)}%` }}
                      >
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-50">
                          Altas: {trend.hires}
                        </div>
                      </div>
                      {/* Termination Bar */}
                      <div 
                        className="w-3 md:w-5 bg-rose-400/30 rounded-t-lg transition-all duration-1000 relative group/bar" 
                        style={{ height: `${Math.max(3, termHeight)}%` }}
                      >
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-50">
                          Bajas: {trend.terminations}
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                      {new Date(trend.month + '-01').toLocaleDateString('es-ES', { month: 'short' })}
                    </span>
                  </div>
                );
              }) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold italic">Cargando tendencias...</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <KPIWidget kpi={kpis.absenteeismRate} color="text-amber-500" sub="Tasa de inasistencias injustificadas" />
            <KPIWidget kpi={kpis.avgPerformance} color="text-indigo-500" sub="Promedio de evaluaciones de desempeño" />
          </div>
        </div>

        {/* Right Sidebar Widgets */}
        <div className="space-y-8">
          
          {/* Recent Activity */}
          <div className="card-premium p-8 bg-white border-none shadow-sm h-fit">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black text-slate-800">Actividad Reciente</h3>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            </div>
            <div className="space-y-6">
              {data?.recentActivity?.length > 0 ? data.recentActivity.map((activity: any, i: number) => (
                <div key={i} className="flex gap-4 group cursor-default">
                  <div className={`w-1 h-10 rounded-full shrink-0 ${
                    activity.severity === 'success' ? 'bg-emerald-500' :
                    activity.severity === 'error' ? 'bg-rose-500' : 'bg-primary'
                  }`}></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <p className="text-xs font-black text-slate-800 group-hover:text-primary transition-colors">{activity.title}</p>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">{formatTimestamp(activity.timestamp)}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">{activity.description}</p>
                  </div>
                </div>
              )) : (
                <p className="text-center py-10 text-slate-300 font-bold italic">No hay actividad reciente</p>
              )}
            </div>
            <button className="w-full mt-10 py-3 bg-slate-50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-100 transition-all">
              Ver Historial Completo
            </button>
          </div>

          {/* Upcoming Birthdays */}
          <div className="card-premium p-8 bg-primary text-white border-none shadow-xl shadow-primary/20 relative overflow-hidden">
            <div className="absolute -top-4 -right-4 opacity-10">
              <Cake className="w-24 h-24" />
            </div>
            <h3 className="text-lg font-black mb-6">Próximos Cumpleaños</h3>
            <div className="space-y-5">
              {data?.upcomingBirthdays?.length > 0 ? data.upcomingBirthdays.map((bday: any, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-black">
                    {bday.name[0]}
                  </div>
                  <div>
                    <p className="text-xs font-bold">{bday.name}</p>
                    <p className="text-[10px] opacity-70 font-medium">{bday.departmentName} • {new Date(bday.date).toLocaleDateString([], { day: 'numeric', month: 'short' })}</p>
                  </div>
                </div>
              )) : (
                <p className="text-xs font-medium opacity-70 italic">Sin cumpleaños próximos</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function SummaryCard({ kpi, color, icon }: { kpi: any, color: string, icon: React.ReactNode }) {
  if (!kpi) return <div className="card-premium h-40 bg-slate-50 animate-pulse"></div>;

  return (
    <div className="card-premium p-8 relative overflow-hidden group bg-white border-none shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
      <div className="flex justify-between items-start mb-6">
        <div className={`p-4 rounded-[1.5rem] text-white shadow-lg ${color} transition-transform group-hover:scale-110`}>
          {React.cloneElement(icon as React.ReactElement, { className: 'w-6 h-6' })}
        </div>
        {kpi.change !== undefined && (
          <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${kpi.trend === 'up' ? 'text-emerald-500' : kpi.trend === 'down' ? 'text-rose-500' : 'text-slate-400'}`}>
            {kpi.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : kpi.trend === 'down' ? <ArrowDownRight className="w-3 h-3" /> : null}
            {Math.abs(kpi.change)}%
          </div>
        )}
      </div>
      <div>
        <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{kpi.value}</h3>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{kpi.label}</p>
      </div>
      <div className="absolute -bottom-4 -right-4 opacity-[0.02] group-hover:opacity-[0.06] transition-opacity">
        {React.cloneElement(icon as React.ReactElement, { className: 'w-32 h-32' })}
      </div>
    </div>
  );
}

function KPIWidget({ kpi, color, sub }: { kpi: any, color: string, sub: string }) {
  if (!kpi) return <div className="card-premium h-32 bg-slate-50 animate-pulse"></div>;

  return (
    <div className="card-premium p-8 flex items-center gap-8 bg-white border-none shadow-sm transition-all hover:shadow-lg">
      <div className="relative w-24 h-24 shrink-0">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="16" fill="none" className="text-slate-50 stroke-current" strokeWidth="3" />
          <circle cx="18" cy="18" r="16" fill="none" className={`${color.replace('text-', 'stroke-')} stroke-current transition-all duration-1000 ease-out`} strokeWidth="3" strokeDasharray={`${parseFloat(kpi.value) || 100}, 100`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-black text-slate-800 tracking-tighter">{kpi.value}</span>
        </div>
      </div>
      <div>
        <h4 className="text-base font-black text-slate-800">{kpi.label}</h4>
        <p className="text-[11px] text-slate-500 mt-2 font-medium leading-relaxed">{sub}</p>
        <div className="mt-4 flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${kpi.trend === 'up' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Estado: {kpi.trend === 'up' ? 'Óptimo' : 'Bajo'}</span>
        </div>
      </div>
    </div>
  );
}

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = (now.getTime() - date.getTime()) / 1000;

  if (diff < 60) return 'Ahora';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-slate-100 rounded-xl" />
          <div className="h-4 w-48 bg-slate-50 rounded-lg" />
        </div>
        <div className="h-12 w-48 bg-slate-100 rounded-2xl" />
      </div>
      <div className="grid grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => <div key={i} className="h-44 bg-white rounded-[2rem] shadow-sm border border-slate-50" />)}
      </div>
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 h-96 bg-white rounded-[2.5rem] shadow-sm border border-slate-50" />
        <div className="h-96 bg-white rounded-[2.5rem] shadow-sm border border-slate-50" />
      </div>
    </div>
  );
}
