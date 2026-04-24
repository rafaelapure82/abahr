"use client";

import { useAuth } from '@/context/AuthContext';
import { 
  Mail, Phone, Send, 
  Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight,
  MoreHorizontal, Eye, Trash2, CheckCircle2, Circle,
  User as UserIcon, Globe, Briefcase
} from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Section */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">Perfil</h1>
        <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
          <span>Julio 24, 2026, 4:30 PM</span>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><Mail className="w-5 h-5" /></button>
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><ChevronRight className="w-5 h-5" /></button>
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><MoreHorizontal className="w-5 h-5" /></button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - User Info & Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* User Hero Card */}
          <div className="card-premium p-8 flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <div className="w-40 h-40 rounded-full border-4 border-primary/20 p-1">
                <div className="w-full h-full rounded-full bg-slate-200 overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200" 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="absolute bottom-2 right-2 bg-orange-500 text-white p-2 rounded-xl shadow-lg">
                <Mail className="w-4 h-4" />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">Helen Voizhicki <span className="ml-2 text-xs bg-teal-100 text-teal-600 px-2 py-1 rounded-full uppercase font-bold">Activo</span></h2>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-sm text-slate-500">
                    <p>Rol: <span className="text-slate-900 font-semibold">User</span></p>
                    <p>Posición: <span className="text-slate-900 font-semibold">Head of HR Department</span></p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>helenvoizhicki@gmail.com</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>+7 (291) 255 58 43</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <span className="font-semibold text-slate-400">Compañía:</span>
                  <span>Loremipsum Group</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <SocialLink icon={<Globe className="w-4 h-4" />} color="bg-blue-600" />
                <SocialLink icon={<div className="font-bold text-[10px]">FB</div>} color="bg-blue-800" />
                <SocialLink icon={<Send className="w-4 h-4" />} color="bg-sky-500" />
              </div>
            </div>
          </div>

          {/* Basic & Personal Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="card-premium p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center justify-between">
                Información Básica
                <span className="text-xs text-slate-400 font-normal">(No Editable)</span>
              </h3>
              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                <InfoItem label="Fecha Contratación" value="Agosto 28, 2023" highlight />
                <InfoItem label="Tiempo Trabajado" value="7 años, 1 mes" highlight />
                <InfoItem label="ID Empleado" value="3156" highlight />
                <InfoItem label="Seguro Social (SSN)" value="XXX-XX-3561" highlight />
              </div>
            </div>

            {/* Personal Info */}
            <div className="card-premium p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center justify-between">
                Información Personal
                <span className="text-xs text-primary font-semibold cursor-pointer">(Editar)</span>
              </h3>
              <div className="space-y-6">
                <InfoItem label="Fecha Nacimiento" value="12/12/1985" />
                <InfoItem label="Dirección" value="315N Crestwater Lane, Seattle, WA" />
              </div>
            </div>
          </div>

          {/* Occupation Info */}
          <div className="card-premium p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Información de Ocupación</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <OccupationItem icon={<Clock />} label="Tiempo Completo" sub="Ocupación" />
              <OccupationItem icon={<Briefcase />} label="Ingeniería" sub="Departamento" />
              <OccupationItem icon={<Send />} label="Seattle, WA" sub="Ubicación" />
            </div>
          </div>
        </div>

        {/* Right Column - Calendar & Events & Onboarding */}
        <div className="space-y-6">
          
          {/* Mini Calendar */}
          <div className="card-premium p-6">
            <div className="flex items-center justify-between mb-4">
              <button className="p-1 hover:bg-slate-100 rounded-lg"><ChevronLeft className="w-4 h-4" /></button>
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-sm">Julio 2026</h4>
              <button className="p-1 hover:bg-slate-100 rounded-lg"><ChevronRight className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <span key={i} className="text-[10px] font-bold text-slate-400 py-2">{d}</span>
              ))}
              {Array.from({ length: 31 }, (_, i) => (
                <span key={i} className={`text-xs py-2 rounded-lg cursor-pointer transition-colors hover:bg-primary/10 ${i + 1 === 24 ? 'bg-primary text-white font-bold' : 'text-slate-600'}`}>
                  {i + 1}
                </span>
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="card-premium p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-slate-800">Próximos Eventos</h4>
              <button className="text-xs text-orange-500 font-bold hover:underline">Ver Todo</button>
            </div>
            <div className="space-y-4">
              <EventItem 
                title="Revisión de Diseño" 
                time="9:00 AM - 10:00 AM" 
                color="bg-blue-600"
              />
              <EventItem 
                title="Reunión de Equipo" 
                time="11:30 AM - 12:30 PM" 
                color="bg-pink-500"
              />
            </div>
          </div>

          {/* Onboarding */}
          <div className="card-premium p-6 flex-1">
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-bold text-slate-800">Onboarding</h4>
              <span className="text-xs text-slate-500 font-bold">1/5 completado</span>
            </div>
            <div className="space-y-6">
              <OnboardingTask title="Preparar espacio de trabajo" assigned="Jim Jones" date="07/25/2026" completed />
              <OnboardingTask title="Reunión con HR Manager" assigned="Jim Jones" date="07/26/2026" />
              <OnboardingTask title="Tour por la oficina" assigned="Sara Smith" date="07/26/2026" />
              <button className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-bold text-sm hover:border-primary hover:text-primary transition-all">
                + Añadir Nueva Tarea
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function SocialLink({ icon, color }: { icon: React.ReactNode, color: string }) {
  return (
    <div className={`${color} text-white p-2 rounded-lg cursor-pointer hover:opacity-80 transition-opacity`}>
      {icon}
    </div>
  );
}

function InfoItem({ label, value, highlight = false }: { label: string, value: string, highlight?: boolean }) {
  return (
    <div>
      <p className="text-xs font-bold text-slate-400 mb-1">{label}</p>
      <p className={`text-sm font-bold ${highlight ? 'bg-slate-900 text-white px-3 py-1 rounded-lg inline-block' : 'text-slate-800'}`}>
        {value}
      </p>
    </div>
  );
}

function OccupationItem({ icon, label, sub }: { icon: React.ReactElement, label: string, sub: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-500 flex items-center justify-center border border-teal-100">
        {React.cloneElement(icon, { className: 'w-6 h-6' })}
      </div>
      <div>
        <p className="text-sm font-bold text-slate-800">{label}</p>
        <p className="text-xs text-slate-400">{sub}</p>
      </div>
    </div>
  );
}

import React from 'react';

function EventItem({ title, time, color }: { title: string, time: string, color: string }) {
  return (
    <div className={`p-4 rounded-2xl ${color} text-white relative overflow-hidden`}>
      <div className="relative z-10">
        <p className="text-xs opacity-80 mb-1 font-bold">{time}</p>
        <p className="font-bold">{title}</p>
      </div>
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-12 -translate-y-8"></div>
    </div>
  );
}

function OnboardingTask({ title, assigned, date, completed = false }: { title: string, assigned: string, date: string, completed?: boolean }) {
  return (
    <div className="flex items-center gap-4 group">
      <div className={completed ? "text-teal-500" : "text-slate-200"}>
        {completed ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
      </div>
      <div className="flex-1">
        <p className={`text-sm font-bold ${completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{title}</p>
        <p className="text-[10px] text-slate-400 font-medium">Asignado a: {assigned} • Vence {date}</p>
      </div>
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-1 text-slate-400 hover:text-slate-600"><Eye className="w-4 h-4" /></button>
        <button className="p-1 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
      </div>
    </div>
  );
}
