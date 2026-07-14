"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LogOut, Plus, Search, Filter, 
  CheckCircle2, Clock, AlertCircle, 
  UserMinus, MoreHorizontal, ChevronRight,
  ClipboardList, Calendar, Loader2, X,
  Save, Layout, ArrowRight, Truck, ShieldOff, MessageSquare,
  TrendingUp, Users, Download, FileText, Upload
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import UploadDocumentModal from '@/components/employees/UploadDocumentModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export default function OffboardingPage() {
  const searchParams = useSearchParams();
  const preSelectedEmployeeId = searchParams.get('employeeId');

  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'templates'>('active');
  const [offboardings, setOffboardings] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedOffboarding, setSelectedOffboarding] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [internalNotes, setInternalNotes] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    employeeId: '',
    templateId: '',
    lastWorkDay: new Date().toISOString().split('T')[0],
    exitReason: 'RESIGNATION',
    notes: ''
  });

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (preSelectedEmployeeId) {
      setFormData(prev => ({ ...prev, employeeId: preSelectedEmployeeId }));
      setIsModalOpen(true);
    }
  }, [preSelectedEmployeeId]);

  useEffect(() => {
    if (selectedOffboarding) {
      setInternalNotes(selectedOffboarding.notes || '');
    }
  }, [selectedOffboarding]);

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    pendingInterviews: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (offboardings.length > 0) {
      setStats({
        total: offboardings.length,
        active: offboardings.filter(o => o.status !== 'COMPLETED').length,
        completed: offboardings.filter(o => o.status === 'COMPLETED').length,
        pendingInterviews: offboardings.filter(o => !o.exitInterviewAt).length
      });
    }
  }, [offboardings]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [offRes, tempRes, empRes] = await Promise.all([
        axios.get(`${API_URL}/offboarding`, { headers }),
        axios.get(`${API_URL}/offboarding/templates`, { headers }),
        axios.get(`${API_URL}/employees`, { headers })
      ]);
      
      setOffboardings(offRes.data.data?.data || offRes.data.data || []);
      setTemplates(tempRes.data.data?.data || tempRes.data.data || []);
      // Only show ACTIVE employees for offboarding
      const employeesList = empRes.data.data?.data || empRes.data.data || [];
      setEmployees(employeesList.filter((e:any) => e.employmentStatus !== 'TERMINATED'));
    } catch (error) {
      console.error("Error fetching offboarding data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOffboardings = offboardings.filter(o => {
    const matchesTab = activeTab === 'completed' ? o.status === 'COMPLETED' : o.status !== 'COMPLETED';
    const matchesSearch = (o.employee.firstName + ' ' + o.employee.lastName).toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/offboarding/export/csv`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'offboarding_report.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Export error:", error);
    }
  };

  const saveNotes = async () => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.patch(`${API_URL}/offboarding/${selectedOffboarding.id}`, { notes: internalNotes }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
      alert('Notas guardadas');
    } catch (error) {
      console.error("Error saving notes:", error);
    }
  };

  const handleInitiate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`${API_URL}/offboarding/initiate`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al iniciar offboarding');
    } finally {
      setIsSaving(false);
    }
  };

  const openDetail = async (id: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.get(`${API_URL}/offboarding/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedOffboarding(res.data.data);
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
      await axios.patch(`${API_URL}/offboarding/tasks/${taskId}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      openDetail(selectedOffboarding.id);
      fetchData();
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <div className="p-3 bg-red-500 rounded-2xl shadow-lg shadow-red-200">
              <LogOut className="text-white w-7 h-7" />
            </div>
            Centro de Offboarding
          </h1>
          <p className="text-sm text-slate-400 font-medium mt-2">Gestión de salida, desvinculación y recuperación de activos.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleExport}
            className="px-6 py-4 bg-white border border-slate-200 rounded-2xl text-xs font-black text-slate-500 uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
          >
            <Download className="w-4 h-4" /> Exportar CSV
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-red-500 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-red-200 flex items-center gap-3 transition-all hover:scale-105 active:scale-95 uppercase text-xs tracking-widest"
          >
            <UserMinus className="w-5 h-5" /> Iniciar Desvinculación
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard label="Total Desvinculaciones" value={stats.total} icon={<Users className="w-6 h-6 text-white" />} color="blue" />
        <StatsCard label="Procesos Activos" value={stats.active} icon={<Clock className="w-6 h-6 text-white" />} color="amber" />
        <StatsCard label="Completados" value={stats.completed} icon={<CheckCircle2 className="w-6 h-6 text-white" />} color="emerald" />
        <StatsCard label="Entrevistas Pendientes" value={stats.pendingInterviews} icon={<MessageSquare className="w-6 h-6 text-white" />} color="red" />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex gap-2 p-1.5 bg-slate-100/80 backdrop-blur-md rounded-2xl w-fit border border-slate-200/50 shadow-inner">
          <TabButton active={activeTab === 'active'} onClick={() => setActiveTab('active')} icon={<Clock className="w-4 h-4" />} label="Activos" />
          <TabButton active={activeTab === 'completed'} onClick={() => setActiveTab('completed')} icon={<CheckCircle2 className="w-4 h-4" />} label="Completados" />
          <TabButton active={activeTab === 'templates'} onClick={() => setActiveTab('templates')} icon={<ClipboardList className="w-4 h-4" />} label="Plantillas" />
        </div>

        {activeTab !== 'templates' && (
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar ex-empleado..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:ring-2 ring-red-500/20 transition-all outline-none"
            />
          </div>
        )}
      </div>

      <div className="card-premium bg-white/70 backdrop-blur-xl p-2 min-h-[400px] border border-white/40 shadow-2xl">
        {loading ? (
          <div className="py-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-primary" /></div>
        ) : (
          <div className="overflow-x-auto">
            {activeTab !== 'templates' ? (
              filteredOffboardings.length > 0 ? (
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ex-Empleado</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Tareas</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Motivo</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Último Día</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredOffboardings.map((off) => {
                      const completed = off.tasks?.filter((t:any) => t.status === 'COMPLETED').length || 0;
                      const total = off.tasks?.length || 0;

                      return (
                        <tr key={off.id} className="hover:bg-white transition-all group">
                          <td className="px-6 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 font-black text-lg border border-red-100 shadow-sm">
                                {off.employee.firstName[0]}
                              </div>
                              <div>
                                <p className="font-black text-slate-800 text-sm">{off.employee.firstName} {off.employee.lastName}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mt-0.5">{off.employee.jobTitle}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-6 text-center">
                            <div className="flex flex-col items-center gap-1.5">
                              <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tight ${
                                completed === total ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}>
                                {completed} / {total} Completadas
                              </span>
                              <div className="w-24 h-1 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full transition-all duration-1000 ${completed === total ? 'bg-emerald-500' : 'bg-red-500'}`}
                                  style={{ width: `${(completed/total) * 100}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-6 text-center">
                            <span className="px-3 py-1 bg-slate-100/50 text-slate-500 border border-slate-200/50 rounded-full text-[9px] font-black uppercase tracking-widest">
                              {off.exitReason}
                            </span>
                          </td>
                          <td className="px-6 py-6">
                            <div className="flex items-center gap-2 text-slate-600">
                              <div className="p-1.5 bg-slate-100 rounded-lg">
                                <Calendar className="w-4 h-4 text-slate-400" />
                              </div>
                              <span className="text-xs font-black">{new Date(off.lastWorkDay).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            </div>
                          </td>
                          <td className="px-6 py-6 text-right">
                            <button 
                              onClick={() => openDetail(off.id)}
                              className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 hover:text-red-500 hover:border-red-200 transition-all rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ml-auto shadow-sm hover:shadow-md"
                            >
                              Checklist <ChevronRight className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="py-32 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-6 border border-slate-100 shadow-inner">
                    <UserMinus className="w-10 h-10 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">No se encontraron procesos</h3>
                  <p className="text-sm text-slate-400 font-medium max-w-xs mt-2">
                    {searchTerm ? `No hay resultados para "${searchTerm}" en esta sección.` : 'Inicia un proceso de desvinculación para verlo reflejado aquí.'}
                  </p>
                  {!searchTerm && (
                    <button 
                      onClick={() => setIsModalOpen(true)}
                      className="mt-8 text-xs font-black text-red-500 uppercase tracking-widest hover:underline"
                    >
                      + Iniciar primer proceso
                    </button>
                  )}
                </div>
              )
            ) : (
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map(temp => (
                  <div key={temp.id} className="p-8 bg-white rounded-[2.5rem] border border-slate-100 space-y-6 hover:shadow-2xl hover:shadow-slate-200/50 transition-all group">
                    <div className="flex justify-between items-start">
                      <div className="p-4 bg-red-50 rounded-2xl shadow-sm text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all">
                        <ClipboardList className="w-6 h-6" />
                      </div>
                      {temp.isDefault && <span className="px-3 py-1 bg-red-500 text-white text-[10px] font-black rounded-full uppercase tracking-tighter shadow-lg shadow-red-200">Por Defecto</span>}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-800 text-lg tracking-tight leading-none">{temp.name}</h3>
                      <p className="text-xs text-slate-400 font-medium mt-3 leading-relaxed">{temp.description}</p>
                    </div>
                    <div className="pt-4 border-t border-slate-50 flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      <Layout className="w-4 h-4 text-red-500" /> {temp.tasks?.length || 0} Tareas de Salida
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300">
            <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-3">
                  <UserMinus className="text-red-500 w-8 h-8" /> Iniciar Offboarding
                </h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Configuración de salida de personal</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white rounded-2xl transition-all hover:rotate-90"><X className="w-6 h-6 text-slate-400" /></button>
            </div>
            <form onSubmit={handleInitiate} className="p-10 space-y-8">
              <FormSelect 
                label="Empleado a Desvincular" 
                value={formData.employeeId} 
                onChange={(v: any) => setFormData({...formData, employeeId: v})} 
                options={employees.map(e => ({ label: `${e.firstName} ${e.lastName}`, value: e.id }))}
                required 
              />
              <FormSelect 
                label="Plantilla de Salida" 
                value={formData.templateId} 
                onChange={(v: any) => setFormData({...formData, templateId: v})} 
                options={templates.map(t => ({ label: t.name, value: t.id }))}
                required 
              />
              <div className="grid grid-cols-2 gap-8">
                <FormField label="Último Día de Trabajo" type="date" value={formData.lastWorkDay} onChange={(v:string) => setFormData({...formData, lastWorkDay: v})} required />
                <FormSelect 
                  label="Motivo de Salida" 
                  value={formData.exitReason} 
                  onChange={(v: any) => setFormData({...formData, exitReason: v})} 
                  options={[
                    { label: 'Renuncia Voluntaria', value: 'RESIGNATION' },
                    { label: 'Despido con Causa', value: 'TERMINATION_WITH_CAUSE' },
                    { label: 'Despido sin Causa', value: 'TERMINATION_WITHOUT_CAUSE' },
                    { label: 'Jubilación', value: 'RETIREMENT' },
                    { label: 'Fin de Contrato', value: 'CONTRACT_ENDED' }
                  ]}
                />
              </div>
              <FormField label="Comentarios HR" value={formData.notes} onChange={(v:string) => setFormData({...formData, notes: v})} placeholder="Detalles adicionales sobre la desvinculación..." />
              
              <div className="pt-6 flex gap-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-slate-600 transition-colors">Cancelar</button>
                <button type="submit" disabled={isSaving || !formData.employeeId || !formData.templateId} className="flex-[2] bg-red-500 text-white rounded-[1.5rem] font-black py-5 shadow-2xl shadow-red-200 flex items-center justify-center gap-3 uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all">
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Confirmar Salida
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Checklist Modal */}
      {isDetailOpen && selectedOffboarding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-4xl overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300">
            <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-[1.5rem] bg-red-500 flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-red-200">
                  {selectedOffboarding.employee.firstName[0]}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tighter">
                    Checklist: {selectedOffboarding.employee.firstName} {selectedOffboarding.employee.lastName}
                  </h2>
                  <p className="text-xs text-slate-400 font-black uppercase tracking-widest mt-1">{selectedOffboarding.template.name}</p>
                </div>
              </div>
              <button onClick={() => setIsDetailOpen(false)} className="p-3 hover:bg-white rounded-2xl transition-all hover:rotate-90"><X className="w-6 h-6 text-slate-400" /></button>
            </div>
            
            <div className="flex h-[60vh]">
              {/* Tasks List */}
              <div className="flex-[2] p-10 overflow-y-auto space-y-6 border-r border-slate-50">
                <div className="grid grid-cols-3 gap-6 mb-8">
                   <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 flex flex-col items-center group hover:bg-white hover:shadow-xl transition-all">
                      <div className="p-3 bg-white rounded-2xl shadow-sm mb-3 group-hover:bg-amber-500 group-hover:text-white transition-all">
                        <Truck className="w-6 h-6 text-amber-500 group-hover:text-white" />
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Equipo</span>
                   </div>
                   <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 flex flex-col items-center group hover:bg-white hover:shadow-xl transition-all">
                      <div className="p-3 bg-white rounded-2xl shadow-sm mb-3 group-hover:bg-red-500 group-hover:text-white transition-all">
                        <ShieldOff className="w-6 h-6 text-red-500 group-hover:text-white" />
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accesos</span>
                   </div>
                   <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 flex flex-col items-center group hover:bg-white hover:shadow-xl transition-all">
                      <div className="p-3 bg-white rounded-2xl shadow-sm mb-3 group-hover:bg-blue-500 group-hover:text-white transition-all">
                        <MessageSquare className="w-6 h-6 text-blue-500 group-hover:text-white" />
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entrevista</span>
                   </div>
                </div>

                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-3">
                  <div className="w-8 h-px bg-slate-200" /> Tareas Requeridas
                </h3>
                
                <div className="space-y-4">
                  {selectedOffboarding.tasks.map((task: any) => (
                    <div 
                      key={task.id} 
                      className={`p-6 rounded-[2rem] border-2 transition-all flex items-start gap-5 ${
                        task.status === 'COMPLETED' ? 'bg-emerald-50/20 border-emerald-100 opacity-60' : 'bg-white border-slate-50 shadow-sm hover:border-red-200 hover:shadow-xl hover:shadow-slate-100'
                      }`}
                    >
                      <button 
                        onClick={() => toggleTask(task.id, task.status)}
                        className={`shrink-0 w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${
                          task.status === 'COMPLETED' ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-100' : 'border-slate-200 hover:border-red-500'
                        }`}
                      >
                        {task.status === 'COMPLETED' && <CheckCircle2 className="w-5 h-5" />}
                      </button>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className={`font-black text-base ${task.status === 'COMPLETED' ? 'text-emerald-700 line-through' : 'text-slate-800'}`}>
                            {task.title}
                          </h4>
                          <span className="text-[10px] font-black text-slate-400 uppercase bg-slate-100 px-3 py-1 rounded-full border border-slate-200">{task.category}</span>
                        </div>
                        <p className="text-sm text-slate-500 mt-2 leading-relaxed">{task.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Internal Notes & Documents */}
              <div className="flex-1 p-10 bg-slate-50/30 overflow-y-auto space-y-8">
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Notas Internas HR
                  </h3>
                  <textarea 
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    className="w-full h-40 bg-white border border-slate-100 rounded-[2rem] p-6 text-sm font-medium focus:ring-2 ring-red-500/10 outline-none transition-all shadow-inner"
                    placeholder="Escribe notas privadas sobre la salida..."
                  />
                  <button 
                    onClick={saveNotes}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 transition-all shadow-xl shadow-slate-200"
                  >
                    Guardar Notas
                  </button>
                </div>

                <div className="space-y-4 pt-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Documentos Adjuntos
                  </h3>
                  <button 
                    onClick={() => setIsUploadModalOpen(true)}
                    className="w-full py-10 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-red-500 hover:text-red-500 hover:bg-white transition-all group"
                  >
                    <Upload className="w-8 h-8 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Subir Documento</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-10 bg-slate-50/50 border-t border-slate-100 flex justify-end">
               <button onClick={() => setIsDetailOpen(false)} className="px-10 py-4 bg-white border border-slate-200 rounded-[1.5rem] text-xs font-black text-slate-500 uppercase tracking-widest hover:bg-slate-100 transition-all shadow-sm active:scale-95">Cerrar Checklist</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatsCard({ label, value, icon, color }: any) {
  const colorMap: any = {
    blue: 'from-blue-500 to-blue-600 shadow-blue-100',
    amber: 'from-amber-500 to-amber-600 shadow-amber-100',
    emerald: 'from-emerald-500 to-emerald-600 shadow-emerald-100',
    red: 'from-red-500 to-red-600 shadow-red-100',
    purple: 'from-purple-500 to-purple-600 shadow-purple-100',
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
