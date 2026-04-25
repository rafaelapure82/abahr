"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Bell, Plus, Search, Filter, 
  CheckCircle2, Clock, AlertCircle, 
  UserPlus, MoreHorizontal, ChevronRight,
  ClipboardList, Calendar, Loader2, X,
  Save, Layout, ArrowRight, TrendingUp
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export default function OnboardingPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'templates'>('active');
  const [onboardings, setOnboardings] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedOnboarding, setSelectedOnboarding] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    employeeId: '',
    templateId: '',
    startDate: new Date().toISOString().split('T')[0],
    targetDate: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [onRes, tempRes, empRes] = await Promise.all([
        axios.get(`${API_URL}/onboarding`, { headers }),
        axios.get(`${API_URL}/onboarding/templates`, { headers }),
        axios.get(`${API_URL}/employees`, { headers })
      ]);
      
      setOnboardings(onRes.data.data || []);
      setTemplates(tempRes.data.data || []);
      // Only show employees that DON'T have onboarding yet for new assignments
      const assignedIds = (onRes.data.data || []).map((o:any) => o.employeeId);
      setEmployees((empRes.data.data || []).filter((e:any) => !assignedIds.includes(e.id)));
    } catch (error) {
      console.error("Error fetching onboarding data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInitiate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`${API_URL}/onboarding/initiate`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al iniciar onboarding');
    } finally {
      setIsSaving(false);
    }
  };

  const openDetail = async (id: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.get(`${API_URL}/onboarding/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedOnboarding(res.data.data);
      setIsDetailOpen(true);
    } catch (error) {
      console.error("Error fetching detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      const token = localStorage.getItem('access_token');
      await axios.patch(`${API_URL}/onboarding/tasks/${taskId}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refresh detail
      openDetail(selectedOnboarding.id);
      fetchData(); // Refresh list to see progress update
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const stats = {
    total: onboardings.length,
    active: onboardings.filter(o => o.status !== 'COMPLETED').length,
    completed: onboardings.filter(o => o.status === 'COMPLETED').length,
    percentage: onboardings.length > 0 ? Math.round((onboardings.filter(o => o.status === 'COMPLETED').length / onboardings.length) * 100) : 0
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <Bell className="text-primary w-8 h-8" />
            </div>
            Centro de Onboarding
          </h1>
          <p className="text-slate-500 mt-2 font-medium flex items-center gap-2">
            Gestión de integración estratégica para el <span className="text-primary font-black uppercase text-[10px] bg-primary/5 px-2 py-0.5 rounded-full">Nuevo Talento</span>
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary h-14 px-8 shadow-2xl shadow-primary/30 flex items-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] rounded-[1.5rem]"
        >
          <UserPlus className="w-6 h-6" />
          <span className="font-black uppercase tracking-widest text-xs">Iniciar Onboarding</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard label="Total Procesos" value={stats.total} icon={<ClipboardList className="w-6 h-6" />} color="blue" />
        <StatsCard label="En Ejecución" value={stats.active} icon={<Clock className="w-6 h-6" />} color="amber" />
        <StatsCard label="Completados" value={stats.completed} icon={<CheckCircle2 className="w-6 h-6" />} color="emerald" />
        <StatsCard label="Tasa de Éxito" value={`${stats.percentage}%`} icon={<TrendingUp className="w-6 h-6" />} color="purple" />
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2 p-1.5 bg-slate-100/80 backdrop-blur-md rounded-2xl w-fit border border-slate-200/50 shadow-inner">
          <TabButton active={activeTab === 'active'} onClick={() => setActiveTab('active')} icon={<Clock className="w-4 h-4" />} label="En Proceso" />
          <TabButton active={activeTab === 'completed'} onClick={() => setActiveTab('completed')} icon={<CheckCircle2 className="w-4 h-4" />} label="Completados" />
          <TabButton active={activeTab === 'templates'} onClick={() => setActiveTab('templates')} icon={<Layout className="w-4 h-4" />} label="Plantillas" />
        </div>

        <div className="hidden md:flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
          <AlertCircle className="w-3.5 h-3.5 text-primary" />
          Actualizado en tiempo real
        </div>
      </div>

      <div className="card-premium bg-white p-2 min-h-[400px]">
        {loading ? (
          <div className="py-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-primary" /></div>
        ) : (
          <div className="overflow-x-auto">
            {activeTab !== 'templates' ? (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-50 bg-slate-50/50">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Empleado</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Progreso</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Estado</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha Límite</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {onboardings.filter(o => activeTab === 'completed' ? o.status === 'COMPLETED' : o.status !== 'COMPLETED').map((on) => {
                    const completed = on.tasks?.filter((t:any) => t.status === 'COMPLETED').length || 0;
                    const total = on.tasks?.length || 0;
                    const progress = total > 0 ? (completed / total) * 100 : 0;

                    return (
                      <tr key={on.id} className="hover:bg-slate-50/50 transition-all group">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary font-bold">
                              {on.employee.firstName[0]}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800">{on.employee.firstName} {on.employee.lastName}</p>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{on.employee.jobTitle}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col gap-1 w-32">
                            <div className="flex justify-between text-[9px] font-black uppercase text-slate-400">
                              <span>{Math.round(progress)}%</span>
                              <span>{completed}/{total}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary transition-all duration-1000" 
                                style={{ width: `${progress}%` }} 
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                            on.status === 'COMPLETED' ? 'bg-teal-50 text-teal-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            {on.status === 'COMPLETED' ? 'Completado' : 'En Curso'}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-slate-500">
                            <Calendar className="w-3.5 h-3.5" />
                            <span className="text-xs font-bold">{new Date(on.targetDate).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button 
                            onClick={() => openDetail(on.id)}
                            className="p-2 text-slate-400 hover:text-primary transition-colors hover:bg-primary/5 rounded-xl flex items-center gap-2 text-xs font-bold ml-auto"
                          >
                            Ver Checklist <ChevronRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map(temp => (
                  <div key={temp.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="p-3 bg-white rounded-2xl shadow-sm text-primary">
                        <ClipboardList className="w-6 h-6" />
                      </div>
                      {temp.isDefault && <span className="px-2 py-0.5 bg-primary text-white text-[8px] font-black rounded-full uppercase">Default</span>}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{temp.name}</h3>
                      <p className="text-xs text-slate-400 font-medium">{temp.description}</p>
                    </div>
                    <div className="pt-2 flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase">
                      <Layout className="w-3.5 h-3.5" /> {temp.tasks?.length || 0} Tareas
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Initiation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden border border-white/20">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                <UserPlus className="text-primary" /> Asignar Onboarding
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
            </div>
            <form onSubmit={handleInitiate} className="p-8 space-y-6">
              <FormSelect 
                label="Nuevo Empleado" 
                value={formData.employeeId} 
                onChange={(v) => setFormData({...formData, employeeId: v})} 
                options={employees.map(e => ({ label: `${e.firstName} ${e.lastName}`, value: e.id }))}
                required 
              />
              <FormSelect 
                label="Plantilla de Onboarding" 
                value={formData.templateId} 
                onChange={(v) => setFormData({...formData, templateId: v})} 
                options={templates.map(t => ({ label: t.name, value: t.id }))}
                required 
              />
              <div className="grid grid-cols-2 gap-6">
                <FormField label="Fecha de Inicio" type="date" value={formData.startDate} onChange={(v:string) => setFormData({...formData, startDate: v})} required />
                <FormField label="Fecha Objetivo" type="date" value={formData.targetDate} onChange={(v:string) => setFormData({...formData, targetDate: v})} required />
              </div>
              <FormField label="Notas Adicionales" value={formData.notes} onChange={(v:string) => setFormData({...formData, notes: v})} placeholder="Instrucciones para el equipo de HR..." />
              
              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-slate-600 transition-colors">Cerrar</button>
                <button type="submit" disabled={isSaving || !formData.employeeId || !formData.templateId} className="flex-[2] btn-primary py-4 shadow-xl flex items-center justify-center gap-2">
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Confirmar Asignación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Checklist Modal */}
      {isDetailOpen && selectedOnboarding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-white/20">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white text-xl font-black shadow-lg shadow-primary/20">
                  {selectedOnboarding.employee.firstName[0]}
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800 tracking-tight">
                    Onboarding: {selectedOnboarding.employee.firstName} {selectedOnboarding.employee.lastName}
                  </h2>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{selectedOnboarding.template.name}</p>
                </div>
              </div>
              <button onClick={() => setIsDetailOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
            </div>
            
            <div className="p-8 max-h-[60vh] overflow-y-auto space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                <ClipboardList className="w-4 h-4" /> Lista de Tareas ({selectedOnboarding.tasks.filter((t:any)=>t.status==='COMPLETED').length}/{selectedOnboarding.tasks.length})
              </h3>
              
              {selectedOnboarding.tasks.map((task: any) => (
                <div 
                  key={task.id} 
                  className={`p-5 rounded-3xl border-2 transition-all flex items-start gap-4 ${
                    task.status === 'COMPLETED' ? 'bg-teal-50/30 border-teal-100 opacity-70' : 'bg-white border-slate-50 shadow-sm hover:border-primary/20'
                  }`}
                >
                  <button 
                    onClick={() => toggleTask(task.id, task.status)}
                    className={`shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                      task.status === 'COMPLETED' ? 'bg-teal-500 border-teal-500 text-white' : 'border-slate-200 hover:border-primary'
                    }`}
                  >
                    {task.status === 'COMPLETED' && <CheckCircle2 className="w-4 h-4" />}
                  </button>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className={`font-bold text-sm ${task.status === 'COMPLETED' ? 'text-teal-700 line-through' : 'text-slate-800'}`}>
                        {task.title}
                      </h4>
                      <span className="text-[9px] font-black text-slate-400 uppercase bg-slate-50 px-2 py-0.5 rounded-full">{task.category}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{task.description}</p>
                    {task.dueDate && (
                      <div className="flex items-center gap-1.5 mt-2 text-[10px] font-bold text-slate-400">
                        <Clock className="w-3 h-3" /> Vence: {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-4">
               <button onClick={() => setIsDetailOpen(false)} className="px-8 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black text-slate-500 uppercase tracking-widest hover:bg-slate-100 transition-colors shadow-sm">Cerrar Detalle</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatsCard({ label, value, icon, color }: any) {
  const colorMap: any = {
    blue: "from-blue-500/20 to-blue-500/5 text-blue-600 border-blue-100",
    amber: "from-amber-500/20 to-amber-500/5 text-amber-600 border-amber-100",
    emerald: "from-emerald-500/20 to-emerald-500/5 text-emerald-600 border-emerald-100",
    purple: "from-purple-500/20 to-purple-500/5 text-purple-600 border-purple-100"
  };

  return (
    <div className="card-premium p-6 group hover:scale-[1.02] transition-all bg-white/50 backdrop-blur-sm border border-slate-100">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-4 rounded-[1.5rem] bg-gradient-to-br ${colorMap[color]} shadow-sm group-hover:shadow-md transition-all`}>
          {icon}
        </div>
        <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest group-hover:text-primary transition-colors">
          Real Time
        </div>
      </div>
      <div>
        <h4 className="text-3xl font-black text-slate-800 tracking-tight leading-none">{value}</h4>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{label}</p>
      </div>
    </div>
  );
}

// ── UI Helpers ────────────────────────────────────────────────────────────

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all duration-300 ${active ? 'bg-white text-primary shadow-sm ring-1 ring-slate-200' : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'}`}
    >
      {icon} {label}
    </button>
  );
}

function FormField({ label, value, onChange, placeholder, required, type = "text" }: any) {
  return (
    <div className="space-y-1">
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label} {required && '*'}</label>
      <input 
        type={type} 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        required={required} 
        className="input-modern w-full h-11 bg-slate-50/50 border-slate-100 focus:bg-white text-xs font-bold" 
        placeholder={placeholder} 
      />
    </div>
  );
}

function FormSelect({ label, value, onChange, options, required, emptyLabel = "Seleccionar..." }: any) {
  return (
    <div className="space-y-1">
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label} {required && '*'}</label>
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        required={required}
        className="w-full h-11 bg-slate-50 border-slate-100 rounded-xl px-4 text-xs font-bold focus:bg-white focus:ring-2 ring-primary/20 transition-all"
      >
        <option value="">{emptyLabel}</option>
        {options.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  );
}
