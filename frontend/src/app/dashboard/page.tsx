"use client";

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { 
  Users, Calendar, Clock, Briefcase, 
  Search, Bell, MoreHorizontal, TrendingUp, 
  UserCheck, UserMinus, Plus
} from 'lucide-react';

export default function MainDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Good Morning!</h1>
          <p className="text-slate-500">Aquí tienes un resumen de la actividad de hoy en ABA Talent.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar cualquier cosa..." 
              className="input-modern pl-10 w-64 bg-white"
            />
          </div>
          <Link href="/dashboard/employees/new" className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nuevo Registro
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard 
          label="Total Empleados" 
          value="128" 
          sub="3 nuevos este mes" 
          icon={<Users />} 
          color="bg-primary" 
        />
        <SummaryCard 
          label="Presentes Hoy" 
          value="92%" 
          sub="118 empleados en sitio" 
          icon={<UserCheck />} 
          color="bg-blue-500" 
        />
        <SummaryCard 
          label="Permisos/Ausencias" 
          value="4" 
          sub="2 solicitudes pendientes" 
          icon={<UserMinus />} 
          color="bg-orange-500" 
        />
        <SummaryCard 
          label="Vacantes Activas" 
          value="12" 
          sub="5 para IT / 7 para Ventas" 
          icon={<Briefcase />} 
          color="bg-indigo-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Attendance Chart Area */}
        <div className="lg:col-span-2 space-y-8">
          <div className="card-premium p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800">Reporte de Asistencia Semanal</h3>
              <select className="text-xs font-bold bg-slate-50 border-none rounded-lg p-2 outline-none">
                <option>Esta Semana</option>
                <option>Mes Pasado</option>
              </select>
            </div>
            <div className="h-64 flex items-end justify-between gap-2 px-2">
              {[85, 92, 78, 95, 88, 60, 40].map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className={`w-full max-w-[40px] rounded-t-lg transition-all duration-1000 ${i === 3 ? 'bg-primary' : 'bg-primary/20'}`} 
                    style={{ height: `${val}%` }}
                  ></div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    {['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MetricGaugeCard label="Desempeño del Equipo" value="88.52%" sub="Basado en objetivos Q2" />
            <MetricGaugeCard label="Satisfacción Laboral" value="72%" sub="Encuesta Junio 2026" />
          </div>
        </div>

        {/* Right Sidebar Widgets */}
        <div className="space-y-8">
          
          {/* Employment Status */}
          <div className="card-premium p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Estado de Empleados</h3>
            <div className="space-y-4">
              <StatusRow label="Full-time" count="105" percentage={82} color="bg-primary" />
              <StatusRow label="Part-time" count="12" percentage={10} color="bg-blue-400" />
              <StatusRow label="Freelance" count="8" percentage={6} color="bg-orange-400" />
              <StatusRow label="Internship" count="3" percentage={2} color="bg-slate-300" />
            </div>
          </div>

          {/* Schedules */}
          <div className="card-premium p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800">Próximos Eventos</h3>
              <button className="text-xs font-bold text-primary">Ver todos</button>
            </div>
            <div className="space-y-4">
              <ScheduleItem 
                title="Entrevista: Frontend Developer" 
                time="09:00 AM - 10:30 AM" 
                tag="Recruitment" 
                color="border-teal-500" 
              />
              <ScheduleItem 
                title="Reunión Trimestral" 
                time="02:00 PM - 03:30 PM" 
                tag="Management" 
                color="border-blue-500" 
              />
              <ScheduleItem 
                title="Feedback: Senior UI Designer" 
                time="04:00 PM - 05:00 PM" 
                tag="Performance" 
                color="border-orange-500" 
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, sub, icon, color }: { label: string, value: string, sub: string, icon: React.ReactNode, color: string }) {
  return (
    <div className="card-premium p-6 relative overflow-hidden group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl text-white shadow-lg ${color}`}>
          {React.cloneElement(icon as React.ReactElement, { className: 'w-6 h-6' })}
        </div>
        <button className="text-slate-300 hover:text-slate-600 transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>
      <div>
        <h3 className="text-2xl font-black text-slate-900">{value}</h3>
        <p className="text-sm font-bold text-slate-400">{label}</p>
        <p className="text-[11px] text-slate-400 mt-2 font-medium">{sub}</p>
      </div>
      <div className="absolute -bottom-2 -right-2 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
        {React.cloneElement(icon as React.ReactElement, { className: 'w-24 h-24' })}
      </div>
    </div>
  );
}

function MetricGaugeCard({ label, value, sub }: { label: string, value: string, sub: string }) {
  return (
    <div className="card-premium p-6 flex items-center gap-6">
      <div className="relative w-20 h-20 shrink-0">
        <svg className="w-full h-full" viewBox="0 0 36 36">
          <path className="text-slate-100 stroke-current" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
          <path className="text-primary stroke-current" strokeDasharray="88, 100" strokeWidth="3" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-black text-slate-800">{value}</span>
        </div>
      </div>
      <div>
        <p className="text-sm font-bold text-slate-800">{label}</p>
        <p className="text-xs text-slate-500 mt-1">{sub}</p>
      </div>
    </div>
  );
}

function StatusRow({ label, count, percentage, color }: { label: string, count: string, percentage: number, color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-bold">
        <span className="text-slate-500">{label}</span>
        <span className="text-slate-800">{count}</span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}

function ScheduleItem({ title, time, tag, color }: { title: string, time: string, tag: string, color: string }) {
  return (
    <div className={`pl-4 border-l-4 ${color}`}>
      <p className="text-sm font-bold text-slate-800">{title}</p>
      <div className="flex items-center justify-between mt-1">
        <p className="text-xs text-slate-400 font-medium">{time}</p>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{tag}</span>
      </div>
    </div>
  );
}

import React from 'react';
