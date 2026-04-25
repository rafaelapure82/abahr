"use client";

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { 
  Mail, Phone, Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight,
  MoreHorizontal, Eye, Trash2, CheckCircle2, Circle,
  User as UserIcon, Globe, Briefcase, QrCode as QrIcon, Printer, Download,
  MapPin, ShieldCheck, CreditCard, Building2, Users, Rocket,
  ArrowRight, Award, Zap, Plus, X, Edit3, Share2, Copy, CodeXml, ContactRound, ExternalLink
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import React from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'payroll'>('overview');
  
  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState<{show: boolean, msg: string, type: 'success' | 'error'}>({ show: false, msg: '', type: 'success' });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.employee?.id) {
      fetchEmployee();
    }
  }, [user]);

  const fetchEmployee = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.get(`${API_URL}/employees/${user?.employee?.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployee(res.data.data || res.data);
    } catch (err) {
      console.error("Error fetching employee profile:", err);
      notify("Error al cargar el perfil", "error");
    } finally {
      setLoading(false);
    }
  };

  const notify = (msg: string, type: 'success' | 'error' = 'success') => {
    setShowToast({ show: true, msg, type });
    setTimeout(() => setShowToast({ show: false, msg: '', type: 'success' }), 3000);
  };

  const handleUpdateProfile = async (formData: any) => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('access_token');
      await axios.patch(`${API_URL}/employees/${employee.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchEmployee();
      setIsEditModalOpen(false);
      notify("Perfil actualizado correctamente");
    } catch (err) {
      console.error("Update profile failed:", err);
      notify("No se pudo actualizar el perfil", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setIsSaving(true);
    try {
      const token = localStorage.getItem('access_token');
      await axios.patch(`${API_URL}/employees/${employee.id}/avatar`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      notify("Foto de perfil actualizada");
      await refreshUser();
      fetchEmployee();
    } catch (err) {
      console.error("Avatar upload failed:", err);
      notify("Error al subir imagen", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const getAvatarUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    // Base uploads path for relative keys
    const uploadsBase = API_URL.replace('/api/v1', '/uploads');
    return `${uploadsBase}/${url}`;
  };

  const handleDownloadQR = () => {
    const canvas = document.getElementById("qr-code-canvas") as HTMLCanvasElement;
    if (!canvas) return;
    
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = `QR_ABA_${employee.employeeCode || 'ID'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify("QR Descargado correctamente");
  };

  const handlePrint = () => {
    if (!employee) return;
    const identityValue = employee.nationalId || employee.taxId || employee.employeeCode;
    const canvas = document.getElementById("qr-code-canvas") as HTMLCanvasElement;
    const qrDataUrl = canvas?.toDataURL();

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>ABA Talent HR - Carnet de Empleado</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            body { font-family: 'Inter', sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f0f2f5; }
            .card { width: 340px; height: 540px; background: white; border-radius: 40px; overflow: hidden; box-shadow: 0 40px 100px rgba(0,0,0,0.15); display: flex; flex-direction: column; position: relative; }
            .header { background: #1e293b; color: white; padding: 40px 20px; text-align: center; }
            .logo { font-size: 20px; font-weight: 900; letter-spacing: 2px; margin-bottom: 5px; }
            .logo span { color: #6366f1; }
            .avatar-container { width: 140px; height: 140px; margin: -70px auto 20px; border-radius: 40px; background: white; padding: 6px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
            .avatar { width: 100%; height: 100%; border-radius: 34px; object-cover: cover; background: #f8fafc; }
            .content { padding: 0 40px 40px; text-align: center; flex: 1; display: flex; flex-direction: column; justify-content: center; }
            .name { font-size: 24px; font-weight: 900; color: #0f172a; margin: 0; }
            .job { font-size: 11px; font-weight: 800; color: #6366f1; text-transform: uppercase; margin-top: 5px; letter-spacing: 1px; }
            .qr-wrap { background: #f8fafc; padding: 20px; border-radius: 30px; margin: 25px auto; width: 160px; height: 160px; display: flex; align-items: center; justify-content: center; border: 1px solid #f1f5f9; }
            .id-code { font-family: monospace; font-size: 18px; font-weight: 900; letter-spacing: 6px; color: #334155; }
            .footer { background: #f8fafc; padding: 20px; font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; text-align: center; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <div class="logo">ABA TALENT <span>HR</span></div>
              <p style="font-size: 10px; opacity: 0.5; margin: 0;">CORPORATE IDENTITY</p>
            </div>
            <div class="avatar-container">
              <img src="${getAvatarUrl(employee.avatarUrl) || 'https://ui-avatars.com/api/?name='+employee.firstName+'+'+employee.lastName+'&background=6366f1&color=fff'}" class="avatar" />
            </div>
            <div class="content">
              <h1 class="name">${employee.firstName} ${employee.lastName}</h1>
              <p class="job">${employee.jobTitle}</p>
              <div class="qr-wrap">
                <img src="${qrDataUrl}" width="140" height="140" />
              </div>
              <div class="id-code">${identityValue}</div>
            </div>
            <div class="footer">Credential Digital • Validez Interna</div>
          </div>
          <script>
            window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 500); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const copyProfileLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    notify("Enlace copiado al portapapeles");
  };

  if (loading) return <ProfileSkeleton />;

  if (!employee) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <UserIcon className="w-20 h-20 text-slate-200" />
      <h2 className="text-xl font-black text-slate-800">No se pudo cargar el perfil</h2>
      <button onClick={fetchEmployee} className="btn-primary px-8 py-3">Intentar de nuevo</button>
    </div>
  );

  const identityValue = employee.nationalId || employee.taxId || employee.employeeCode;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700">
      
      {/* Toast Notification */}
      {showToast.show && (
        <div className={`fixed top-10 right-10 z-[100] px-6 py-4 rounded-3xl shadow-2xl animate-in slide-in-from-right-10 flex items-center gap-4 ${showToast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
          {showToast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <X className="w-5 h-5" />}
          <span className="font-black text-sm uppercase tracking-widest">{showToast.msg}</span>
        </div>
      )}

      {/* Header Profile Section */}
      <div className="relative">
        <div className="h-56 w-full bg-gradient-to-br from-indigo-700 via-primary to-violet-600 rounded-[3rem] overflow-hidden relative shadow-2xl">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        </div>

        <div className="px-10 -mt-24 flex flex-col md:flex-row items-end gap-10 relative z-10">
          <div className="w-48 h-48 rounded-[3rem] bg-white p-2 shadow-2xl relative group">
            <div className="w-full h-full rounded-[2.5rem] bg-slate-50 overflow-hidden border-4 border-slate-50 flex items-center justify-center">
              {employee.avatarUrl ? (
                <img src={getAvatarUrl(employee.avatarUrl)} alt="Avatar" className="w-full h-full object-cover transition-all duration-700 group-hover:scale-125" />
              ) : (
                <UserIcon className="w-20 h-20 text-slate-200" />
              )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 w-12 h-12 bg-primary text-white shadow-xl rounded-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all border-4 border-white z-20"
              title="Cambiar Foto"
            >
              <Zap className="w-5 h-5 fill-current" />
            </button>
          </div>

          <div className="flex-1 pb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <h1 className="text-5xl font-black text-slate-900 tracking-tighter">
                    {employee.firstName} {employee.lastName}
                  </h1>
                  <div className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase flex items-center gap-1">
                    <Award className="w-3 h-3" /> MVP
                  </div>
                </div>
                <div className="flex items-center gap-4 text-slate-500 font-bold">
                  <p className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-primary" /> {employee.jobTitle}</p>
                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                  <p className="flex items-center gap-2"><Building2 className="w-4 h-4 text-primary" /> {employee.department?.name || 'Gestión Humana'}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-8 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" /> Editar Perfil
                </button>
                <button 
                  onClick={() => setIsShareModalOpen(true)}
                  className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:-translate-y-1 hover:shadow-2xl transition-all flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" /> Compartir
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatMini icon={<CalendarIcon />} label="Antigüedad" value={new Date(employee.hireDate).getFullYear().toString()} sub={`Desde ${new Date(employee.hireDate).toLocaleDateString()}`} />
            <StatMini icon={<Clock />} label="Jornada" value="Completa" sub="09:00 AM - 06:00 PM" />
            <StatMini icon={<Award />} label="Categoría" value="Senior" sub="Nivel de Carrera 4" />
          </div>

          <div className="card-premium p-10 bg-white border-none shadow-sm space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> Datos de Contacto
                  </h3>
                  <button onClick={() => setIsEditModalOpen(true)} className="text-[10px] font-black text-slate-400 hover:text-primary transition-colors">ACTUALIZAR</button>
                </div>
                <div className="space-y-6">
                  <DetailRow label="Cédula de Identidad" value={employee.nationalId || employee.taxId || '---'} />
                  <DetailRow label="Correo Electrónico" value={employee.user?.email || '---'} />
                  <DetailRow label="Móvil Personal" value={employee.personalPhone || '---'} />
                  <DetailRow label="Residencia" value={`${employee.city || '---'}, ${employee.country || '---'}`} icon={<MapPin className="w-3 h-3" />} />
                </div>
              </div>

              <div className="space-y-8">
                <h3 className="text-[11px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                  <Rocket className="w-4 h-4" /> Estatus de Integración
                </h3>
                <div className="space-y-6 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase">Progreso Onboarding</p>
                      <p className="text-3xl font-black text-slate-900 mt-1">85%</p>
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-primary shadow-sm">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                  </div>
                  <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[85%] rounded-full shadow-[0_0_15px_rgba(99,102,241,0.6)]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card-premium p-10 bg-white border-none shadow-sm">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-3">
                <Users className="w-6 h-6 text-primary" /> Colaboradores Cercanos
              </h3>
              <button className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">Ver Organigrama <ArrowRight className="w-3 h-3" /></button>
            </div>
            <div className="flex flex-wrap gap-8">
              <TeamMember name={employee.manager ? `${employee.manager.firstName} ${employee.manager.lastName}` : 'Líder Directo'} role="Director" isLeader />
              <TeamMember name="Andres Perez" role="UX Designer" />
              <TeamMember name="Mariana Gomez" role="Lead Frontend" />
              <TeamMember name="Luis Rivas" role="Data Analyst" />
              <TeamMember name="Sofía Luna" role="Recruiter" />
              <div className="flex flex-col items-center gap-2 group cursor-pointer">
                <div className="w-14 h-14 rounded-full bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 group-hover:border-primary group-hover:text-primary transition-all">
                  <Plus className="w-5 h-5" />
                </div>
                <p className="text-[9px] font-black text-slate-400 uppercase">Invitar</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-8">
          <div className="card-premium p-0 bg-white border-none shadow-2xl overflow-hidden group rounded-[3rem]">
            <div className="p-10 bg-slate-900 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full translate-x-12 -translate-y-12 group-hover:scale-150 transition-transform duration-1000"></div>
              <div className="relative z-10 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mb-2">Carnet Corporativo</p>
                  <h4 className="text-2xl font-black tracking-tight">ABA Talent <span className="text-primary">HR</span></h4>
                </div>
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center backdrop-blur-md">
                  <QrIcon className="w-6 h-6 text-primary" />
                </div>
              </div>
            </div>
            <div className="p-10 text-center space-y-8">
              <div id="qr-container" className="bg-slate-50 p-8 rounded-[3rem] border border-slate-100 shadow-inner inline-block group-hover:scale-105 transition-transform duration-700 relative">
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                   <p className="text-[10px] font-black text-slate-900 uppercase bg-white px-4 py-2 rounded-full shadow-xl">Válido 2026</p>
                </div>
                <QRCodeCanvas 
                  id="qr-code-canvas"
                  value={identityValue || "000"} 
                  size={180}
                  level="H"
                  includeMargin={false}
                  className="rounded-2xl"
                  style={{ width: '180px', height: '180px' }}
                />
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-black text-slate-800 tracking-[0.5em]">{identityValue}</p>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">CÓDIGO DE IDENTIFICACIÓN</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={handlePrint}
                  className="flex items-center justify-center gap-3 py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest hover:bg-slate-800 hover:shadow-2xl hover:-translate-y-1 transition-all"
                >
                  <Printer className="w-5 h-5" /> Imprimir
                </button>
                <button 
                  onClick={handleDownloadQR}
                  className="flex items-center justify-center gap-3 py-5 bg-slate-50 text-slate-700 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest hover:bg-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all border border-slate-100"
                >
                  <Download className="w-5 h-5" /> Bajar PNG
                </button>
              </div>
            </div>
            <div className="p-5 bg-slate-50/80 text-center border-t border-slate-100 flex items-center justify-center gap-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Activo para Control de Asistencia</p>
            </div>
          </div>

          <div className="card-premium p-10 bg-gradient-to-br from-indigo-700 via-primary to-blue-600 text-white border-none shadow-2xl relative overflow-hidden group">
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-10 translate-y-10 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            <h4 className="font-black text-sm uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
              <Award className="w-5 h-5" /> Plan de Beneficios
            </h4>
            <div className="space-y-6">
              <BenefitItem icon={<ShieldCheck />} label="Seguro Médico" value="Cobertura Total Global" />
              <BenefitItem icon={<CreditCard />} label="Tarjeta Alimenticia" value="$350.00 / Mensual" />
              <BenefitItem icon={<ExternalLink />} label="Suscripción Gym" value="Gold Member Activo" />
            </div>
            <button className="w-full mt-10 py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all backdrop-blur-md border border-white/10">Gestionar Beneficios</button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isEditModalOpen && (
        <EditProfileModal 
          employee={employee} 
          onClose={() => setIsEditModalOpen(false)} 
          onSave={handleUpdateProfile}
          isSaving={isSaving}
        />
      )}

      {isShareModalOpen && (
        <ShareProfileModal 
          employee={employee} 
          onClose={() => setIsShareModalOpen(false)} 
          onCopy={copyProfileLink}
        />
      )}
    </div>
  );
}

// ── Components ──

function EditProfileModal({ employee, onClose, onSave, isSaving }: any) {
  const [formData, setFormData] = useState({
    firstName: employee.firstName,
    lastName: employee.lastName,
    personalPhone: employee.personalPhone || '',
    city: employee.city || '',
    country: employee.country || '',
    linkedinUrl: employee.linkedinUrl || '',
    githubUrl: employee.githubUrl || '',
    twitterUrl: employee.twitterUrl || '',
    personalWebsiteUrl: employee.personalWebsiteUrl || '',
  });

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={onClose}></div>
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
        <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Editar Perfil</h2>
            <p className="text-slate-500 font-bold text-sm mt-1">Actualiza tu información pública y de contacto.</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:rotate-90 transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-10 space-y-8 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-6">
            <InputGroup label="Nombre" value={formData.firstName} onChange={(v) => setFormData({...formData, firstName: v})} />
            <InputGroup label="Apellido" value={formData.lastName} onChange={(v) => setFormData({...formData, lastName: v})} />
          </div>
          <InputGroup label="Teléfono Móvil" value={formData.personalPhone} onChange={(v) => setFormData({...formData, personalPhone: v})} icon={<Phone className="w-4 h-4" />} />
          <div className="grid grid-cols-2 gap-6">
            <InputGroup label="Ciudad" value={formData.city} onChange={(v) => setFormData({...formData, city: v})} icon={<MapPin className="w-4 h-4" />} />
            <InputGroup label="País" value={formData.country} onChange={(v) => setFormData({...formData, country: v})} icon={<Globe className="w-4 h-4" />} />
          </div>
          <div className="space-y-4">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Redes Profesionales</p>
            <InputGroup label="LinkedIn Profile" value={formData.linkedinUrl} onChange={(v) => setFormData({...formData, linkedinUrl: v})} icon={<ContactRound className="w-4 h-4" />} />
            <InputGroup label="GitHub Profile" value={formData.githubUrl} onChange={(v) => setFormData({...formData, githubUrl: v})} icon={<CodeXml className="w-4 h-4" />} />
            <InputGroup label="Twitter (X)" value={formData.twitterUrl} onChange={(v) => setFormData({...formData, twitterUrl: v})} icon={<ExternalLink className="w-4 h-4" />} />
            <InputGroup label="Personal Website" value={formData.personalWebsiteUrl} onChange={(v) => setFormData({...formData, personalWebsiteUrl: v})} icon={<Globe className="w-4 h-4" />} />
          </div>
        </div>

        <div className="p-10 bg-slate-50 flex gap-4">
          <button onClick={onClose} className="flex-1 py-5 bg-white text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest border border-slate-200 hover:bg-slate-100 transition-all">Cancelar</button>
          <button 
            onClick={() => onSave(formData)} 
            disabled={isSaving}
            className="flex-[2] py-5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
          >
            {isSaving ? 'Guardando Cambios...' : 'Guardar Información'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ShareProfileModal({ employee, onClose, onCopy }: any) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={onClose}></div>
      <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-500">
        <div className="p-10 text-center space-y-6">
          <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary mx-auto mb-4">
            <Share2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Compartir Perfil</h2>
          <p className="text-slate-500 font-bold text-sm">Permite que otros colaboradores accedan a tu información profesional.</p>
          
          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between text-xs font-black text-slate-400 uppercase tracking-widest">
              <span>Enlace Directo</span>
              <span className="text-primary">Público</span>
            </div>
            <div className="flex gap-2">
              <input readOnly value={`https://abahr.com/p/${employee.employeeCode}`} className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-600 outline-none" />
              <button onClick={onCopy} className="p-3 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:scale-110 active:scale-90 transition-all"><Copy className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => window.open(`https://wa.me/?text=Hola! Te comparto mi perfil profesional en ABA Talent HR: https://abahr.com/p/${employee.employeeCode}`, '_blank')}
              className="flex items-center justify-center gap-3 py-4 bg-[#25D366] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              WhatsApp
            </button>
            <button 
              onClick={() => window.open(`mailto:?subject=Perfil Profesional - ${employee.firstName} ${employee.lastName}&body=Hola! Puedes ver mi perfil profesional aquí: https://abahr.com/p/${employee.employeeCode}`, '_blank')}
              className="flex items-center justify-center gap-3 py-4 bg-[#EA4335] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              Correo
            </button>
          </div>
        </div>
        <div className="p-6 bg-slate-50 text-center">
           <button onClick={onClose} className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-slate-900 transition-colors">Cerrar Ventana</button>
        </div>
      </div>
    </div>
  );
}

function InputGroup({ label, value, onChange, icon }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{label}</label>
      <div className="relative group">
        {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">{icon}</div>}
        <input 
          type="text" 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          className={`w-full ${icon ? 'pl-12' : 'pl-5'} pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 ring-primary/10 outline-none transition-all group-hover:border-slate-200`}
        />
      </div>
    </div>
  );
}

function StatMini({ icon, label, value, sub }: any) {
  return (
    <div className="card-premium p-8 bg-white border-none shadow-sm flex items-center gap-6 group hover:bg-primary transition-all duration-500 hover:-translate-y-2">
      <div className="p-4 bg-slate-50 rounded-[1.5rem] text-primary group-hover:bg-white/20 group-hover:text-white transition-all">
        {React.cloneElement(icon, { className: 'w-6 h-6' })}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white/60">{label}</p>
        <p className="text-xl font-black text-slate-800 tracking-tight group-hover:text-white">{value}</p>
        <p className="text-[10px] font-bold text-slate-400 group-hover:text-white/40">{sub}</p>
      </div>
    </div>
  );
}

function DetailRow({ label, value, icon }: any) {
  return (
    <div className="flex items-center justify-between py-3 group">
      <div className="flex items-center gap-2">
        {icon && <span className="text-slate-300">{icon}</span>}
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight group-hover:text-slate-500 transition-colors">{label}</p>
      </div>
      <p className="text-sm font-black text-slate-800 group-hover:text-primary transition-colors">{value}</p>
    </div>
  );
}

function TeamMember({ name, role, isLeader = false }: any) {
  return (
    <div className="flex flex-col items-center gap-3 group cursor-pointer">
      <div className={`w-16 h-16 rounded-[1.5rem] bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xl border-4 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 ${isLeader ? 'border-primary shadow-xl shadow-primary/20 bg-white text-primary' : 'border-white hover:border-slate-100 shadow-sm'}`}>
        {name[0]}
      </div>
      <div className="text-center">
        <p className="text-xs font-black text-slate-800 leading-none group-hover:text-primary transition-colors">{name}</p>
        <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-widest">{role}</p>
      </div>
    </div>
  );
}

function BenefitItem({ icon, label, value }: any) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-all">
      <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm shadow-xl">{React.cloneElement(icon, { className: 'w-5 h-5' })}</div>
      <div>
        <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-black tracking-tight">{value}</p>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-pulse">
      <div className="h-56 w-full bg-slate-100 rounded-[3rem]" />
      <div className="px-10 -mt-24 flex gap-10">
        <div className="w-48 h-48 bg-slate-200 rounded-[3rem] border-8 border-white" />
        <div className="flex-1 pb-4 pt-24 space-y-4">
          <div className="h-10 w-80 bg-slate-100 rounded-2xl" />
          <div className="h-4 w-60 bg-slate-50 rounded-xl" />
        </div>
      </div>
      <div className="grid grid-cols-12 gap-8 pt-4">
        <div className="col-span-8 space-y-8">
          <div className="grid grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-white rounded-[2rem]" />)}
          </div>
          <div className="h-[500px] bg-white rounded-[3rem]" />
        </div>
        <div className="col-span-4 space-y-8">
          <div className="h-[600px] bg-white rounded-[3rem]" />
        </div>
      </div>
    </div>
  );
}


