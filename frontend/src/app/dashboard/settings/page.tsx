"use client";

import axios from 'axios';
import React, { useState } from 'react';
import { 
  Settings, Building2, Palette, Bell, 
  ShieldCheck, Globe, Save, Loader2, 
  Moon, Sun, Laptop, CheckCircle2,
  Lock, Smartphone, Mail, Eye, EyeOff,
  Cloud, Terminal, Download, Share2
} from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export default function SettingsPage() {
  const { settings, loading, updateSetting, saveSettings } = useSettings();
  const [activeTab, setActiveTab] = useState<'company' | 'appearance' | 'notifications' | 'security' | 'integrations'>('company');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await saveSettings();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving settings:", err);
      setError("No se pudieron guardar los cambios. Verifica tu conexión o permisos.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('logo', file);
    
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.post(`${API_URL}/settings/logo`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}` 
        }
      });
      
      updateSetting('general', 'company_logo', res.data.data.url);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error("Logo upload failed:", err);
      setError("Error al subir el logo.");
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 animate-pulse">
      <Loader2 className="w-12 h-12 animate-spin text-primary/20" />
      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Sincronizando Preferencias...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Error Message */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-sm">!</div>
          <p className="text-xs font-bold">{error}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Settings className="text-primary w-8 h-8" /> Configuración Global
          </h1>
          <p className="text-slate-500 font-medium mt-1">Personaliza tu espacio de trabajo y ajusta las preferencias del sistema.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="btn-primary px-8 py-4 shadow-xl shadow-primary/20 flex items-center gap-3 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {isSaving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>


      <div className="flex flex-col lg:flex-row gap-8">
        {/* Navigation Sidebar */}
        <aside className="lg:w-72 space-y-2">
          <SettingsNavButton active={activeTab === 'company'} onClick={() => setActiveTab('company')} icon={<Building2 />} label="Empresa" sub="Identidad corporativa" />
          <SettingsNavButton active={activeTab === 'appearance'} onClick={() => setActiveTab('appearance')} icon={<Palette />} label="Apariencia" sub="Temas y colores" />
          <SettingsNavButton active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} icon={<Bell />} label="Notificaciones" sub="Alertas y avisos" />
          <SettingsNavButton active={activeTab === 'security'} onClick={() => setActiveTab('security')} icon={<ShieldCheck />} label="Seguridad" sub="Acceso y privacidad" />
          <SettingsNavButton active={activeTab === 'integrations'} onClick={() => setActiveTab('integrations')} icon={<Terminal />} label="Integraciones" sub="API y Webhooks" />
        </aside>

        {/* Content Area */}
        <main className="flex-1 space-y-8">
          <div className="card-premium bg-white p-10 min-h-[500px] border-none shadow-sm relative overflow-hidden">
            {showSuccess && (
              <div className="absolute top-6 right-6 animate-in slide-in-from-top-4 fade-in duration-300">
                <div className="flex items-center gap-3 px-6 py-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl shadow-xl">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-xs font-black uppercase tracking-widest">Cambios aplicados</span>
                </div>
              </div>
            )}

            {activeTab === 'company' && <CompanySettings data={settings.general || {}} update={(k: any, v: any) => updateSetting('general', k, v)} onUpload={handleLogoUpload} />}
            {activeTab === 'appearance' && <AppearanceSettings data={settings.appearance || {}} update={(k: any, v: any) => updateSetting('appearance', k, v)} />}
            {activeTab === 'notifications' && <NotificationSettings data={settings.notifications || {}} update={(k: any, v: any) => updateSetting('notifications', k, v)} />}
            {activeTab === 'security' && <SecuritySettings data={settings.security || {}} update={(k: any, v: any) => updateSetting('security', k, v)} />}
            {activeTab === 'integrations' && <IntegrationSettings data={settings.integrations || {}} update={(k: any, v: any) => updateSetting('integrations', k, v)} />}

          </div>
        </main>
      </div>
    </div>
  );
}



function CompanySettings({ data, update, onUpload }: any) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpload) {
      onUpload(file);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
      <SectionTitle title="Perfil de la Organización" sub="Configura la información legal y pública de tu empresa." />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100">
            <div className="w-24 h-24 rounded-3xl bg-white border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 group hover:border-primary hover:text-primary cursor-pointer transition-all overflow-hidden">
              {data.company_logo ? (
                <img src={data.company_logo} alt="Logo" className="w-full h-full object-contain p-2" />
              ) : (
                <>
                  <Building2 className="w-8 h-8 mb-1" />
                  <span className="text-[9px] font-black uppercase">Logo</span>
                </>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-black text-slate-800">Logotipo Institucional</p>
              <p className="text-[10px] text-slate-400 font-medium mt-1">Formatos sugeridos: PNG, SVG (Max 2MB)</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange} 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest hover:border-primary hover:text-primary transition-all"
              >
                Subir Nuevo
              </button>
            </div>
          </div>
          <FormField 
            label="Nombre Legal de la Empresa" 
            placeholder="ABA Talent Solution S.A." 
            value={data.company_name || ''} 
            onChange={(v:string) => update('company_name', v)} 
          />
          <FormField 
            label="Número de Identificación Fiscal (RIF/TAX ID)" 
            placeholder="J-12345678-9" 
            value={data.tax_id || ''} 
            onChange={(v:string) => update('tax_id', v)} 
          />
        </div>
        <div className="space-y-6">
          <FormField 
            label="Correo Electrónico de Contacto" 
            placeholder="hr@abatalent.com" 
            icon={<Mail className="w-4 h-4" />} 
            value={data.contact_email || ''} 
            onChange={(v:string) => update('contact_email', v)} 
          />
          <FormField 
            label="Sitio Web Corporativo" 
            placeholder="https://abatalent.com" 
            icon={<Globe className="w-4 h-4" />} 
            value={data.website || ''} 
            onChange={(v:string) => update('website', v)} 
          />
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dirección Principal</label>
            <textarea 
              value={data.address || ''} 
              onChange={(e) => update('address', e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:bg-white focus:ring-4 ring-primary/10 outline-none transition-all h-28" 
              placeholder="Av. Principal, Edificio ABA, Piso 4, Oficina 402." 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function AppearanceSettings({ data, update }: any) {
  const theme = data.theme_mode || 'light';
  
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
      <SectionTitle title="Interfaz y Estética" sub="Personaliza los colores y el modo de visualización del sistema." />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ThemeCard active={theme === 'light'} onClick={() => update('theme_mode', 'light')} icon={<Sun />} label="Claro" sub="Interfaz limpia y brillante" />
        <ThemeCard active={theme === 'dark'} onClick={() => update('theme_mode', 'dark')} icon={<Moon />} label="Oscuro" sub="Elegancia en tonos profundos" />
        <ThemeCard active={theme === 'system'} onClick={() => update('theme_mode', 'system')} icon={<Laptop />} label="Sistema" sub="Adaptado a tu dispositivo" />
      </div>

      <div className="space-y-6 pt-6">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Color de Acento (Branding)</p>
        <div className="flex gap-4">
          <ColorCircle color="bg-[#00bfa5]" active={data.theme_primary === '#00bfa5' || data.theme_primary === 'primary'} onClick={() => update('theme_primary', '#00bfa5')} />
          <ColorCircle color="bg-indigo-600" active={data.theme_primary === 'indigo' || data.theme_primary === '#4f46e5'} onClick={() => update('theme_primary', 'indigo')} />
          <ColorCircle color="bg-emerald-600" active={data.theme_primary === 'emerald' || data.theme_primary === '#059669'} onClick={() => update('theme_primary', 'emerald')} />
          <ColorCircle color="bg-rose-600" active={data.theme_primary === 'rose' || data.theme_primary === '#e11d48'} onClick={() => update('theme_primary', 'rose')} />
          <ColorCircle color="bg-amber-600" active={data.theme_primary === 'amber' || data.theme_primary === '#d97706'} onClick={() => update('theme_primary', 'amber')} />
          <ColorCircle color="bg-slate-800" active={data.theme_primary === 'slate' || data.theme_primary === '#1e293b'} onClick={() => update('theme_primary', 'slate')} />
        </div>

      </div>

      <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-between">
        <div>
          <p className="text-sm font-black text-slate-800">Compactar Interfaz</p>
          <p className="text-[10px] text-slate-400 font-medium">Reduce el espacio entre elementos para ver más datos.</p>
        </div>
        <div onClick={() => update('is_compact', !data.is_compact)}>
          <Toggle active={data.is_compact} />
        </div>
      </div>
    </div>
  );
}

function NotificationSettings({ data, update }: any) {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
      <SectionTitle title="Centro de Notificaciones" sub="Controla qué avisos quieres recibir y por qué canales." />
      
      <div className="space-y-4">
        <NotificationRow 
          title="Nuevas Contrataciones" 
          sub="Recibe un aviso cuando un nuevo empleado completa su onboarding." 
          active={data.notify_new_hires} 
          onToggle={(v:boolean) => update('notify_new_hires', v)}
        />
        <NotificationRow 
          title="Solicitudes de Permiso" 
          sub="Alertas sobre nuevas peticiones de vacaciones o ausencias." 
          active={data.notify_leave_requests} 
          onToggle={(v:boolean) => update('notify_leave_requests', v)}
        />
        <NotificationRow 
          title="Cierre de Nómina" 
          sub="Confirmación cuando el proceso de pagos ha finalizado." 
          active={data.notify_payroll_closed} 
          onToggle={(v:boolean) => update('notify_payroll_closed', v)}
        />
        <NotificationRow 
          title="Alertas de Cumpleaños" 
          sub="Recordatorios matutinos sobre el personal que cumple años." 
          active={data.notify_birthdays} 
          onToggle={(v:boolean) => update('notify_birthdays', v)}
        />
        <NotificationRow 
          title="Auditoría Crítica" 
          sub="Avisos sobre cambios importantes en la configuración del sistema." 
          active={data.notify_critical_audit} 
          onToggle={(v:boolean) => update('notify_critical_audit', v)}
        />
      </div>
    </div>
  );
}

function SecuritySettings({ data, update }: any) {
  const [showPass, setShowPass] = useState(false);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
      <SectionTitle title="Seguridad y Acceso" sub="Protege tu cuenta y gestiona los permisos de seguridad." />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Políticas de Contraseña</p>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-xs font-bold text-slate-700">Mínimo 8 caracteres</span>
              <div onClick={() => update('pass_min_8', !data.pass_min_8)}><Toggle active={data.pass_min_8} /></div>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-xs font-bold text-slate-700">Requerir símbolos</span>
              <div onClick={() => update('pass_require_symbols', !data.pass_require_symbols)}><Toggle active={data.pass_require_symbols} /></div>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-xs font-bold text-slate-700">Expiración (90 días)</span>
              <div onClick={() => update('pass_expire_90', !data.pass_expire_90)}><Toggle active={data.pass_expire_90} /></div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Doble Factor (2FA)</p>
          <div className="p-6 bg-primary/5 rounded-[2.5rem] border border-primary/10 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary"><Smartphone className="w-6 h-6" /></div>
              <div>
                <p className="text-xs font-black text-slate-800">Autenticación por App</p>
                <p className="text-[10px] text-slate-400 font-medium">Usa Google Authenticator o Authy.</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-[10px] font-black uppercase text-slate-400">Estado</span>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase">Requerido</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
        <div>
          <p className="text-sm font-black text-slate-800 text-red-500">Cerrar Sesión en otros dispositivos</p>
          <p className="text-[10px] text-slate-400 font-medium">Esto cerrará tu sesión en todos los navegadores actuales.</p>
        </div>
        <button className="px-6 py-2 bg-red-50 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-100">Cerrar Todo</button>
      </div>
    </div>
  );
}

function IntegrationSettings({ data, update }: any) {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
      <SectionTitle title="Desarrollo e Integraciones" sub="Gestiona el acceso al API y los flujos de automatización externos." />
      
      <div className="card-premium bg-slate-900 p-8 space-y-6 border-none shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            <Cloud className="w-5 h-5 text-primary" />
            <h4 className="text-sm font-black uppercase tracking-widest">API Endpoint</h4>
          </div>
          <span className={`px-3 py-1 ${data.api_enabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'} rounded-full text-[9px] font-black`}>
            {data.api_enabled ? 'ACTIVO' : 'INACTIVO'}
          </span>
        </div>
        <div className="p-4 bg-black/40 rounded-2xl font-mono text-[11px] text-slate-300 border border-white/5 break-all">
          {data.api_url || 'https://api.abatalent.com/v1/workspaces/aba-828/graphql'}
        </div>
        <div className="flex gap-4">
          <button className="flex-1 py-3 bg-white/5 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2">
            <Download className="w-3 h-3" /> Documentación
          </button>
          <button 
            onClick={() => update('api_enabled', !data.api_enabled)}
            className={`flex-1 py-3 ${data.api_enabled ? 'bg-red-500/20 text-red-400' : 'bg-primary text-white'} rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2`}
          >
            <Terminal className="w-3 h-3" /> {data.api_enabled ? 'Desactivar API' : 'Activar API'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Webhooks Registrados</p>
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-primary"><Share2 className="w-4 h-4" /></div>
            <div>
              <p className="text-xs font-black text-slate-800">Slack Notifications</p>
              <p className="text-[9px] text-slate-400 font-medium">Eventos: hire, leave_request, payroll_closed</p>
            </div>
          </div>
          <div onClick={() => update('webhook_slack_enabled', !data.webhook_slack_enabled)}>
            <Toggle active={data.webhook_slack_enabled} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── UI Components ──

function SectionTitle({ title, sub }: any) {
  return (
    <div className="border-b border-slate-100 dark:border-slate-800 pb-6 mb-8">
      <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">{title}</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">{sub}</p>
    </div>
  );
}

function FormField({ label, placeholder, value, onChange, icon }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative group">
        {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">{icon}</div>}
        <input 
          type="text" 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`input-modern w-full ${icon ? 'pl-12' : 'pl-4'} pr-4 py-3 text-xs font-bold`} 
          placeholder={placeholder} 
        />
      </div>
    </div>
  );
}

function ThemeCard({ icon, label, sub, active, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className={`p-6 rounded-[2.5rem] border-2 cursor-pointer transition-all duration-500 flex flex-col items-center text-center gap-4 group ${
        active 
          ? 'border-primary bg-primary/5 shadow-xl shadow-primary/5' 
          : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-700'
      }`}
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
        active ? 'bg-primary text-white scale-110 rotate-3' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:scale-110'
      }`}>
        {React.cloneElement(icon as React.ReactElement, { size: 28 } as any)}
      </div>
      <div>
        <p className={`text-sm font-black ${active ? 'text-primary' : 'text-slate-500 dark:text-slate-400'}`}>{label}</p>
        <p className="text-[10px] text-slate-400 font-medium mt-1">{sub}</p>
      </div>
    </div>
  );
}

function ColorCircle({ color, active, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className={`w-12 h-12 rounded-2xl cursor-pointer transition-all duration-300 relative group flex items-center justify-center ${color} ${
        active ? 'ring-4 ring-primary/20 scale-110 shadow-lg' : 'hover:scale-110 opacity-70 hover:opacity-100'
      }`}
    >
      {active && <CheckCircle2 className="text-white w-6 h-6 animate-in zoom-in-50 duration-300" />}
      <div className="absolute -top-10 bg-slate-900 text-white text-[8px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-tighter whitespace-nowrap">
        Seleccionar
      </div>
    </div>
  );
}

function Toggle({ active }: any) {
  return (
    <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-all ${active ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}>
      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${active ? 'translate-x-6' : 'translate-x-0'}`} />
    </div>
  );
}

function NotificationRow({ title, sub, active = false, onToggle }: any) {
  return (
    <div className="p-6 bg-slate-50/50 dark:bg-slate-800/20 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm transition-all group">
      <div>
        <p className="text-sm font-black text-slate-800 dark:text-white group-hover:text-primary transition-colors">{title}</p>
        <p className="text-[10px] text-slate-400 font-medium mt-1">{sub}</p>
      </div>
      <div onClick={() => onToggle(!active)}>
        <Toggle active={active} />
      </div>
    </div>
  );
}

function SettingsNavButton({ icon, label, sub, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all duration-300 ${
        active 
          ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' 
          : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
      }`}
    >
      <div className={`p-2 rounded-xl ${active ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
        {React.cloneElement(icon as React.ReactElement, { size: 20 } as any)}
      </div>
      <div className="text-left">
        <p className="text-xs font-black uppercase tracking-widest">{label}</p>
        <p className={`text-[10px] font-medium ${active ? 'text-white/70' : 'text-slate-400'}`}>{sub}</p>
      </div>
    </button>
  );
}


