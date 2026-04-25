"use client";

import { useState, useEffect, use } from 'react';
import axios from 'axios';
import { 
  Briefcase, Users, Search, Filter, 
  Plus, Calendar, MoreVertical, ExternalLink,
  ChevronLeft, BadgeCheck, Clock, TrendingUp,
  MapPin, DollarSign, Building2, User, Mail,
  Phone, Globe, Github, FileText,
  AlertCircle, CheckCircle2, XCircle, ArrowRight
} from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [job, setJob] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pipeline');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [selectedStage, setSelectedStage] = useState('APPLIED');
  const [isDragging, setIsDragging] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };
      
      console.log(`Fetching data for job: ${id}...`);
      
      const [jobRes, appsRes] = await Promise.all([
        axios.get(`${API_URL}/recruitment/jobs/${id}`, { headers }).catch(e => {
          console.error("Job Fetch Error:", e.response?.data || e.message);
          throw e;
        }),
        axios.get(`${API_URL}/recruitment/jobs/${id}/applications`, { headers }).catch(e => {
          console.error("Applications Fetch Error:", e.response?.data || e.message);
          throw e;
        })
      ]);
      
      setJob(jobRes.data);
      setApplications(appsRes.data || []);
    } catch (err: any) {
      console.error("Error fetching job details:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMoveStage = async (appId: string, status: string) => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`${API_URL}/recruitment/applications/${appId}/move`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      console.error("Move stage failed:", err);
    }
  };

  const stages = [
    { id: 'APPLIED', name: 'Nuevos', color: 'slate' },
    { id: 'SCREENING', name: 'Screening', color: 'blue' },
    { id: 'TECHNICAL_INTERVIEW', name: 'Entrevistas', color: 'purple' },
    { id: 'OFFER_EXTENDED', name: 'Oferta', color: 'amber' },
    { id: 'HIRED', name: 'Contratados', color: 'emerald' },
  ];

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4 animate-pulse">
      <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Cargando pipeline...</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/dashboard/recruitment" className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
              <Briefcase className="w-3.5 h-3.5" /> Módulo de Reclutamiento
            </Link>
            <Link href="/dashboard/recruitment" className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-primary transition-all">
              <ChevronLeft className="w-4 h-4" /> Volver a Vacantes
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <div className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-2xl shadow-slate-200/50 relative group">
              <div className="absolute inset-0 bg-primary/5 rounded-[2rem] scale-90 group-hover:scale-110 transition-transform duration-500" />
              <BadgeCheck className="w-12 h-12 text-primary relative z-10" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${job?.status === 'OPEN' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                  {job?.status === 'OPEN' ? 'Activa' : 'Inactiva'}
                </span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">ID: {job?.code || '---'}</span>
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none uppercase">{job?.title}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100/50">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-black text-slate-600 uppercase tracking-tight">{job?.department?.name || 'General'}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100/50">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-black text-slate-600 uppercase tracking-tight">{job?.location || 'Remoto'}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-2xl border border-emerald-100/50">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-black text-emerald-700 uppercase tracking-tight">
                    {job?.salaryMin?.toLocaleString()} - {job?.salaryMax?.toLocaleString()} {job?.currency}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="h-14 px-8 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] border-2 border-slate-200 hover:border-primary/30 hover:text-primary transition-all bg-white shadow-sm">Editar Vacante</button>
          <button className="h-14 px-8 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] bg-primary text-white shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all">Publicar</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-slate-100">
        {[
          { id: 'pipeline', name: 'Pipeline de Candidatos', icon: <TrendingUp className="w-4 h-4" /> },
          { id: 'details', name: 'Detalles del Puesto', icon: <FileText className="w-4 h-4" /> },
          { id: 'settings', name: 'Configuración', icon: <MoreVertical className="w-4 h-4" /> }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === tab.id ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {tab.icon}
            {tab.name}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full animate-in slide-in-from-bottom-1" />
            )}
          </button>
        ))}
      </div>

      {activeTab === 'pipeline' ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-[600px] mt-8">
          {stages.map(stage => {
            const stageApps = applications?.filter(app => {
              if (stage.id === 'SCREENING') return ['SCREENING', 'PHONE_INTERVIEW'].includes(app.status);
              if (stage.id === 'TECHNICAL_INTERVIEW') return ['TECHNICAL_INTERVIEW', 'PANEL_INTERVIEW', 'BACKGROUND_CHECK'].includes(app.status);
              return app.status === stage.id;
            }) || [];

            return (
              <div 
                key={stage.id} 
                className="flex flex-col gap-4"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add('bg-primary/5');
                }}
                onDragLeave={(e) => {
                  e.currentTarget.classList.remove('bg-primary/5');
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('bg-primary/5');
                  const appId = e.dataTransfer.getData('appId');
                  if (appId) handleMoveStage(appId, stage.id);
                }}
              >
                <div className="flex items-center justify-between px-3 py-2 bg-white/50 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(var(--color-primary),0.5)] bg-${stage.color}-500`} />
                    {stage.name}
                  </h3>
                  <span className="text-[10px] font-black bg-slate-900 text-white px-2.5 py-1 rounded-xl shadow-lg shadow-slate-200">
                    {stageApps.length}
                  </span>
                </div>

                <div className={`flex-1 rounded-[2rem] p-3 space-y-4 transition-all duration-300 ${stageApps.length === 0 ? 'bg-slate-50/50 border-2 border-dashed border-slate-200/50 flex flex-col' : 'bg-transparent'}`}>
                  {stageApps.map((app: any) => (
                    <CandidateCard 
                      key={app.id} 
                      app={app} 
                      onMove={(status: string) => handleMoveStage(app.id, status)}
                      onSchedule={() => {
                        setSelectedApplication(app);
                        setIsInterviewModalOpen(true);
                      }}
                      onDragStart={() => setIsDragging(app.id)}
                      onDragEnd={() => setIsDragging(null)}
                    />
                  ))}
                  
                  {stageApps.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-40">
                      <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mb-4 shadow-xl shadow-slate-200/50">
                        <Users className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sin Candidatos</p>
                    </div>
                  )}

                  <button 
                    onClick={() => {
                      setSelectedStage(stage.id);
                      setIsAddModalOpen(true);
                    }}
                    className="w-full group py-5 border-2 border-dashed border-slate-200 rounded-[1.5rem] text-slate-400 hover:text-primary hover:border-primary/40 hover:bg-white hover:shadow-2xl hover:shadow-primary/10 transition-all flex items-center justify-center gap-3"
                  >
                    <div className="p-2 bg-slate-50 group-hover:bg-primary/10 rounded-xl transition-all">
                      <Plus className="w-5 h-5 group-hover:scale-125 transition-transform" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Añadir Candidato</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {activeTab === 'details' ? (
        <div className="grid grid-cols-3 gap-8 mt-8">
          <div className="col-span-2 space-y-8">
            <section className="card-premium p-8 bg-white border border-slate-100 shadow-xl shadow-slate-200/40">
              <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-xl"><FileText className="w-5 h-5 text-blue-500" /></div>
                Descripción del Puesto
              </h3>
              <div className="prose prose-slate max-w-none text-slate-600 font-medium whitespace-pre-wrap">
                {job?.description}
              </div>
            </section>
            
            <section className="card-premium p-8 bg-white border border-slate-100 shadow-xl shadow-slate-200/40">
              <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-xl"><BadgeCheck className="w-5 h-5 text-purple-500" /></div>
                Requisitos y Aptitudes
              </h3>
              <div className="flex flex-wrap gap-2">
                {job?.skills?.map((skill: string, i: number) => (
                  <span key={i} className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold border border-slate-100">
                    {skill}
                  </span>
                ))}
              </div>
              <div className="mt-6 prose prose-slate text-slate-600 font-medium">
                {job?.requirements}
              </div>
            </section>
          </div>
          
          <div className="space-y-6">
            <div className="card-premium p-6 bg-gradient-to-br from-primary to-indigo-600 text-white shadow-xl shadow-primary/20">
              <h4 className="text-sm font-black uppercase tracking-widest opacity-80 mb-4">Métricas Rápidas</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold opacity-80">Conversión</span>
                  <span className="text-lg font-black">12.5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold opacity-80">Días Abierta</span>
                  <span className="text-lg font-black">24d</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold opacity-80">Coste Estimado</span>
                  <span className="text-lg font-black">$1,200</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isAddModalOpen && (
        <AddCandidateModal 
          jobId={id} 
          defaultStage={selectedStage}
          onClose={() => setIsAddModalOpen(false)}
          onSave={() => {
            setIsAddModalOpen(false);
            fetchData();
          }}
        />
      )}

      {isInterviewModalOpen && (
        <ScheduleInterviewModal 
          application={selectedApplication}
          onClose={() => setIsInterviewModalOpen(false)}
          onSave={() => {
            setIsInterviewModalOpen(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}

function AddCandidateModal({ jobId, defaultStage, onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    currentTitle: '',
    status: defaultStage
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`${API_URL}/recruitment/apply`, {
        jobId,
        candidate: formData,
        status: formData.status
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onSave();
    } catch (err) {
      console.error("Add candidate failed:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in duration-300">
        <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Nuevo Candidato</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Registrar talento directamente en el pipeline</p>
          </div>
          <button onClick={onClose} className="p-4 hover:bg-white rounded-3xl transition-all text-slate-400 hover:text-slate-600 shadow-sm border border-transparent hover:border-slate-100">
            <XCircle className="w-8 h-8" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nombre</label>
              <input required type="text" className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Apellido</label>
              <input required type="text" className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Correo Electrónico</label>
            <input required type="email" className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Título / Cargo Actual</label>
            <input required type="text" className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none" placeholder="Ej: Senior Frontend Engineer" value={formData.currentTitle} onChange={e => setFormData({...formData, currentTitle: e.target.value})} />
          </div>

          <div className="mt-10 flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 h-16 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Cancelar</button>
            <button type="submit" className="flex-[2] h-16 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all">Agregar al Pipeline</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ScheduleInterviewModal({ application, onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    title: `Entrevista Técnica - ${application.candidate.firstName}`,
    scheduledAt: '',
    time: '10:00',
    interviewerIds: [] as string[]
  });
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.get(`${API_URL}/employees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(res.data.data || []);
    } catch (err) {
      console.error("Fetch employees failed:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      // Combine date and time
      const scheduledAt = new Date(`${formData.scheduledAt}T${formData.time}`).toISOString();
      
      await axios.post(`${API_URL}/recruitment/applications/${application.id}/interview`, {
        title: formData.title,
        scheduledAt,
        interviewerIds: formData.interviewerIds
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onSave();
    } catch (err) {
      console.error("Schedule interview failed:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in duration-300">
        <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-purple-50/50">
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Programar Entrevista</h2>
            <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mt-1">Candidato: {application.candidate.firstName} {application.candidate.lastName}</p>
          </div>
          <button onClick={onClose} className="p-4 hover:bg-white rounded-3xl transition-all text-slate-400 hover:text-slate-600 shadow-sm border border-transparent hover:border-slate-100">
            <XCircle className="w-8 h-8" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Título de la Entrevista</label>
            <input required type="text" className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-purple-200 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Fecha</label>
              <input required type="date" className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-purple-200 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none" value={formData.scheduledAt} onChange={e => setFormData({...formData, scheduledAt: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Hora</label>
              <input required type="time" className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-purple-200 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Asignar Entrevistador</label>
            <select 
              className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-purple-200 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none appearance-none"
              onChange={(e) => {
                const val = e.target.value;
                if (val && !formData.interviewerIds.includes(val)) {
                  setFormData({...formData, interviewerIds: [...formData.interviewerIds, val]});
                }
              }}
            >
              <option value="">Seleccionar Entrevistador</option>
              {employees.map((emp: any) => (
                <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} - {emp.jobTitle}</option>
              ))}
            </select>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.interviewerIds.map(id => {
                const emp = employees.find(e => e.id === id);
                return (
                  <span key={id} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-[10px] font-black flex items-center gap-2 uppercase tracking-tight">
                    {emp?.firstName} {emp?.lastName}
                    <button type="button" onClick={() => setFormData({...formData, interviewerIds: formData.interviewerIds.filter(i => i !== id)})}>
                      <XCircle className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          </div>

          <div className="mt-10 flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 h-16 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Cancelar</button>
            <button type="submit" className="flex-[2] h-16 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-purple-300 hover:scale-[1.02] active:scale-[0.98] transition-all">Confirmar Entrevista</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CandidateCard({ app, onMove, onSchedule, onDragStart, onDragEnd }: any) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div 
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('appId', app.id);
        onDragStart();
        e.currentTarget.classList.add('opacity-40', 'scale-95');
      }}
      onDragEnd={(e) => {
        onDragEnd();
        e.currentTarget.classList.remove('opacity-40', 'scale-95');
      }}
      className="group relative bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-slate-200/60 hover:-translate-y-1 transition-all cursor-grab active:cursor-grabbing overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-100 group-hover:bg-primary transition-colors" />
      
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:from-primary/10 group-hover:to-primary/5 group-hover:text-primary group-hover:border-primary/20 transition-all duration-500">
            {app.candidate.firstName[0]}{app.candidate.lastName[0]}
          </div>
          <div>
            <Link href={`/dashboard/recruitment/candidates/${app.id}`}>
              <h5 className="text-sm font-black text-slate-800 group-hover:text-primary transition-colors cursor-pointer leading-none">{app.candidate.firstName} {app.candidate.lastName}</h5>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight mt-1.5">{app.candidate.currentTitle || 'Candidato'}</p>
            </Link>
          </div>
        </div>
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-[1.5rem] shadow-2xl border border-slate-100 p-2 z-50 animate-in zoom-in-95 duration-200">
              <div className="px-4 py-2 border-b border-slate-50 mb-1">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Acciones Rápidas</p>
              </div>
              <button onClick={() => onMove('SCREENING')} className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 hover:text-primary rounded-xl transition-all flex items-center gap-3">
                <ArrowRight className="w-4 h-4" /> Screening
              </button>
              <button onClick={() => {
                onMove('TECHNICAL_INTERVIEW');
                setShowMenu(false);
              }} className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 hover:text-primary rounded-xl transition-all flex items-center gap-3">
                <ArrowRight className="w-4 h-4" /> Entrevista
              </button>
              <button onClick={() => {
                onSchedule();
                setShowMenu(false);
              }} className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 rounded-xl transition-all flex items-center gap-3">
                <Calendar className="w-4 h-4" /> Programar
              </button>
              <button onClick={() => onMove('HIRED')} className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4" /> Contratar
              </button>
              <div className="h-px bg-slate-50 my-1" />
              <button onClick={() => onMove('REJECTED')} className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-red-400 hover:bg-red-50 rounded-xl transition-all flex items-center gap-3">
                <XCircle className="w-4 h-4" /> Rechazar
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className="px-2 py-0.5 bg-slate-50 text-[8px] font-black text-slate-400 uppercase tracking-widest rounded-md border border-slate-100">Top Skills</span>
        <span className="px-2 py-0.5 bg-primary/5 text-[8px] font-black text-primary uppercase tracking-widest rounded-md border border-primary/10">AI Verified</span>
      </div>

      <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {app.interviews && app.interviews.length > 0 ? (
            <div className="flex items-center gap-2 px-2 py-1 bg-purple-50 text-purple-600 rounded-lg border border-purple-100 animate-pulse">
              <Calendar className="w-3 h-3" />
              <span className="text-[8px] font-black uppercase tracking-tighter">
                {new Date(app.interviews[0].scheduledAt).toLocaleDateString()} @ {new Date(app.interviews[0].scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-[9px] font-black uppercase tracking-tighter">En espera</span>
            </div>
          )}
        </div>
        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
          {new Date(app.appliedAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}
