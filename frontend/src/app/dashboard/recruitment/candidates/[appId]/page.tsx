"use client";

import { useState, useEffect, use, useRef } from 'react';
import axios from 'axios';
import { 
  User, Mail, Phone, Globe, 
  FileText, Calendar, Clock, Star, MessageSquare,
  ChevronLeft, ExternalLink, Download, ShieldAlert,
  BadgeCheck, Briefcase, MapPin, CheckCircle2, XCircle,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

export default function CandidateDetailPage({ params }: { params: Promise<{ appId: string }> }) {
  const { appId } = use(params);
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [appId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`${API_URL}/recruitment/applications/${appId}`, { headers });
      setApp(res.data.data || res.data);
    } catch (err) {
      console.error("Error fetching candidate details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadOffer = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/recruitment/applications/${appId}/offer-letter`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `carta_oferta_${candidate?.lastName}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  const handleSaveSignature = async (signatureData: string) => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`${API_URL}/recruitment/applications/${appId}/sign`, { signatureData }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsSignatureModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("Signature save failed:", err);
    }
  };

  const handleScheduleInterview = async (interviewData: any) => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`${API_URL}/recruitment/applications/${appId}/interview`, interviewData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsInterviewModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("Schedule interview failed:", err);
    }
  };

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4 animate-pulse">
      <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Cargando expediente...</p>
    </div>
  );

  const candidate = app?.candidate;
  const job = app?.job;

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-slate-100 to-slate-200 border-4 border-white shadow-2xl flex items-center justify-center text-3xl font-black text-slate-400">
              {candidate?.firstName[0]}{candidate?.lastName[0]}
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 border-4 border-white rounded-2xl flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Link href="/dashboard/recruitment" className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
                <Briefcase className="w-3.5 h-3.5" /> MÃ³dulo de Reclutamiento
              </Link>
              <Link href={`/dashboard/recruitment/${job?.id}`} className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors">
                <ChevronLeft className="w-3.5 h-3.5" /> Volver al Pipeline
              </Link>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">{candidate?.firstName} {candidate?.lastName}</h1>
            <p className="text-slate-500 mt-2 font-bold flex items-center gap-2">
              {candidate?.currentTitle} <span className="text-slate-300">â€¢</span> {candidate?.currentCompany || 'Candidato Externo'}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsSignatureModalOpen(true)}
            className="btn-secondary h-14 px-8 rounded-2xl font-black text-xs uppercase tracking-widest border-2 flex items-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" /> {app?.hrSignature ? 'Cambiar Firma' : 'Firmar Oferta'}
          </button>
          <button 
            onClick={handleDownloadOffer}
            className="btn-secondary h-14 px-8 rounded-2xl font-black text-xs uppercase tracking-widest border-2 flex items-center gap-2"
          >
            <FileText className="w-5 h-5" /> Generar Carta de Oferta
          </button>
          <button 
            onClick={() => setIsInterviewModalOpen(true)}
            className="btn-primary h-14 px-8 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 flex items-center gap-2"
          >
            <Calendar className="w-5 h-5" /> Programar Entrevista
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Sidebar */}
        <div className="space-y-6">
          <section className="card-premium p-8 bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-200/50 border-none relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <TrendingUp className="w-20 h-20 rotate-12" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 mb-6">
              <TrendingUp className="w-4 h-4" /> AI Talent Insights
            </h3>
            <div className="space-y-4 relative z-10">
              <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Score de Aptitud</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-white w-[92%] rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                  </div>
                  <span className="text-xl font-black">92%</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-bold leading-relaxed opacity-90">
                  "Candidato con fuerte dominio tÃ©cnico en arquitecturas distribuidas. Alta compatibilidad cultural con valores de agilidad."
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="text-[9px] font-black px-2 py-1 bg-white/20 rounded-lg uppercase tracking-tighter">Hard Skills 10/10</span>
                  <span className="text-[9px] font-black px-2 py-1 bg-white/20 rounded-lg uppercase tracking-tighter">Soft Skills 8/10</span>
                </div>
              </div>
            </div>
          </section>

          <section className="card-premium p-8 bg-white border border-slate-100 shadow-xl shadow-slate-200/40 space-y-6">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <User className="w-4 h-4 text-primary" /> InformaciÃ³n de Contacto
            </h3>
            <div className="space-y-4">
              <ContactItem icon={<Mail />} label="Email" value={candidate?.email} />
              <ContactItem icon={<Phone />} label="TelÃ©fono" value={candidate?.phone} />
              <ContactItem icon={<Globe />} label="Portfolio" value={candidate?.portfolioUrl} isLink />
              <ContactItem icon={<Globe />} label="GitHub" value={candidate?.githubUrl} isLink />
            </div>
          </section>

          <section className="card-premium p-8 bg-white border border-slate-100 shadow-xl shadow-slate-200/40 space-y-6">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <BadgeCheck className="w-4 h-4 text-primary" /> Aptitudes
            </h3>
            <div className="flex flex-wrap gap-2">
              {candidate?.skills?.map((skill: string, i: number) => (
                <span key={i} className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-wider border border-slate-100">
                  {skill}
                </span>
              ))}
            </div>
          </section>
        </div>

        {/* Main Experience & Application Timeline */}
        <div className="lg:col-span-2 space-y-8">
          {/* Application Context */}
          <div className="card-premium p-8 bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-2xl">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-xs font-black uppercase tracking-[0.2em] opacity-60 mb-2">Aplicando para</h4>
                <p className="text-2xl font-black">{job?.title}</p>
                <div className="flex items-center gap-3 mt-4">
                  <span className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/10">
                    ID: {app?.id.substring(0,8)}
                  </span>
                  <span className="px-3 py-1 bg-primary/20 rounded-lg text-[10px] font-black uppercase tracking-widest border border-primary/30 text-primary-foreground">
                    Estado: {app?.status}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] opacity-60 mb-2">Fecha de AplicaciÃ³n</h4>
                <p className="text-lg font-black">{new Date(app?.appliedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <section className="card-premium p-8 bg-white border border-slate-100 shadow-xl shadow-slate-200/40">
            <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary" /> Historial de SelecciÃ³n
            </h3>
            <div className="space-y-8 relative before:absolute before:left-[1.25rem] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
              <TimelineItem 
                title="AplicaciÃ³n Recibida"
                date={new Date(app?.appliedAt).toLocaleString()}
                description="El candidato enviÃ³ su CV a travÃ©s del portal de empleo."
                icon={<Mail className="w-4 h-4" />}
                status="COMPLETED"
              />
              {app?.interviews?.map((interview: any) => (
                <TimelineItem 
                  key={interview.id}
                  title={interview.title}
                  date={new Date(interview.scheduledAt).toLocaleString()}
                  description={interview.notes || 'No hay notas adicionales.'}
                  icon={<Calendar className="w-4 h-4" />}
                  status={new Date(interview.scheduledAt) < new Date() ? 'COMPLETED' : 'PENDING'}
                />
              ))}
            </div>
          </section>

          {/* Files */}
          <section className="card-premium p-8 bg-white border border-slate-100 shadow-xl shadow-slate-200/40">
            <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
              <FileText className="w-5 h-5 text-primary" /> DocumentaciÃ³n
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <FileCard name="Curriculum Vitae" type="PDF" url={candidate?.resumeUrl} />
              <FileCard name="Carta de PresentaciÃ³n" type="DOCX" url={candidate?.coverLetterUrl} />
            </div>
          </section>
        </div>
      </div>
      {/* Interview Modal */}
      {isInterviewModalOpen && (
        <InterviewModal 
          onClose={() => setIsInterviewModalOpen(false)} 
          onSave={handleScheduleInterview} 
        />
      )}

      {/* Signature Modal */}
      {isSignatureModalOpen && (
        <SignatureModal 
          onClose={() => setIsSignatureModalOpen(false)} 
          onSave={handleSaveSignature} 
        />
      )}
    </div>
  );
}

function SignatureModal({ onClose, onSave }: any) {
  const canvasRef = useRef(null) as any;
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasEl = useState<HTMLCanvasElement | null>(null);

  // Manual canvas handling
  const startDrawing = (e: any) => {
    const canvas = document.getElementById('signature-canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d')!;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    const canvas = document.getElementById('signature-canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d')!;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const clear = () => {
    const canvas = document.getElementById('signature-canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const save = () => {
    const canvas = document.getElementById('signature-canvas') as HTMLCanvasElement;
    onSave(canvas.toDataURL());
  };

  useEffect(() => {
    const canvas = document.getElementById('signature-canvas') as HTMLCanvasElement;
    if (canvas) {
      const ctx = canvas.getContext('2d')!;
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-300">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Firma Digital</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Dibuja tu firma en el recuadro</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-slate-600 shadow-sm">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8">
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl overflow-hidden relative group">
            <canvas 
              id="signature-canvas"
              width={400}
              height={200}
              className="w-full h-[200px] cursor-crosshair touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
            <button 
              onClick={clear}
              className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur rounded-lg text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all shadow-sm"
            >
              Limpiar
            </button>
          </div>

          <div className="mt-8 flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
            >
              Cancelar
            </button>
            <button 
              onClick={save}
              className="flex-[2] h-12 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Guardar y Aplicar Firma
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InterviewModal({ onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    title: '',
    scheduledAt: '',
    type: 'VIDEO',
    location: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-300">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Programar Entrevista</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Define los detalles del encuentro</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-slate-600 shadow-sm">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">TÃ­tulo de la SesiÃ³n</label>
            <input 
              required
              type="text" 
              className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none"
              placeholder="Ej: Entrevista TÃ©cnica Round 1"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Fecha y Hora</label>
              <input 
                required
                type="datetime-local" 
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none"
                value={formData.scheduledAt}
                onChange={(e) => setFormData({...formData, scheduledAt: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tipo</label>
              <select 
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option value="VIDEO">Video Llamada</option>
                <option value="PHONE">TelefÃ³nica</option>
                <option value="ONSITE">Presencial</option>
                <option value="PANEL">Panel / Grupal</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">UbicaciÃ³n / Link</label>
            <input 
              type="text" 
              className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none"
              placeholder="Google Meet, Zoom o DirecciÃ³n FÃ­sica"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Notas Preparatorias</label>
            <textarea 
              rows={3}
              className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none resize-none"
              placeholder="Temas a tratar, evaluadores..."
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            />
          </div>

          <div className="mt-8 flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="flex-[2] h-12 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Confirmar Entrevista
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ContactItem({ icon, label, value, isLink }: any) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-4 group">
      <div className="p-2 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
        {icon}
      </div>
      <div className="overflow-hidden">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
        {isLink ? (
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-slate-700 hover:text-primary truncate block flex items-center gap-1">
            {value.replace('https://', '')} <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          <p className="text-sm font-bold text-slate-700 truncate">{value}</p>
        )}
      </div>
    </div>
  );
}

function TimelineItem({ title, date, description, icon, status }: any) {
  return (
    <div className="flex gap-6 relative">
      <div className={`z-10 w-10 h-10 rounded-2xl flex items-center justify-center border-4 border-white shadow-lg ${status === 'COMPLETED' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{date}</p>
        <h4 className="text-sm font-black text-slate-800 mt-1">{title}</h4>
        <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function FileCard({ name, type, url }: any) {
  return (
    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between hover:bg-white hover:shadow-lg transition-all group cursor-pointer">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-[10px] font-black text-primary">
          {type}
        </div>
        <div>
          <p className="text-xs font-black text-slate-800 group-hover:text-primary transition-colors">{name}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ver archivo</p>
        </div>
      </div>
      <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-primary transition-colors">
        <Download className="w-4 h-4" />
      </button>
    </div>
  );
}