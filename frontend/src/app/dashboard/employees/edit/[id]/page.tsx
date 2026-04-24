"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { 
  ArrowLeft, Save, Loader2, User, 
  Briefcase, MapPin, CreditCard, ShieldAlert,
  AlertCircle, CheckCircle2
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export default function EditEmployeePage() {
  const { id } = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    jobTitle: '',
    personalEmail: '',
    personalPhone: '',
    country: '',
    city: '',
    addressLine1: '',
    postalCode: '',
    employmentStatus: 'ACTIVE',
    employmentType: 'FULL_TIME',
    baseSalary: 0,
    // Bank Info
    bankName: '',
    bankAccountNumber: '',
    taxId: '',
    // Emergency
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelation: ''
  });

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const fetchEmployee = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/employees/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = response.data.data;
      setFormData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.user?.email || '',
        jobTitle: data.jobTitle || '',
        personalEmail: data.personalEmail || '',
        personalPhone: data.personalPhone || '',
        country: data.country || '',
        city: data.city || '',
        addressLine1: data.addressLine1 || '',
        postalCode: data.postalCode || '',
        employmentStatus: data.employmentStatus || 'ACTIVE',
        employmentType: data.employmentType || 'FULL_TIME',
        baseSalary: data.baseSalary || 0,
        bankName: data.bankName || '',
        bankAccountNumber: data.bankAccountNumber || '',
        taxId: data.taxId || '',
        emergencyName: data.emergencyName || '',
        emergencyPhone: data.emergencyPhone || '',
        emergencyRelation: data.emergencyRelation || ''
      });
    } catch (error) {
      console.error("Error fetching employee:", error);
      setStatus({ type: 'error', message: 'No se pudo cargar la información.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatus(null);
    try {
      const token = localStorage.getItem('access_token');
      await axios.patch(`${API_URL}/employees/${id}`, {
        ...formData,
        baseSalary: parseFloat(formData.baseSalary as any) || 0
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatus({ type: 'success', message: '¡Expediente actualizado y auditado correctamente!' });
      setTimeout(() => router.push(`/dashboard/employees/${id}`), 1500);
    } catch (error: any) {
      console.error("Error updating:", error);
      const msg = error.response?.data?.message || 'Error al guardar cambios.';
      setStatus({ type: 'error', message: Array.isArray(msg) ? msg[0] : msg });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-slate-400">
      <Loader2 className="w-12 h-12 animate-spin text-primary" />
      <p className="font-bold uppercase tracking-widest text-[10px]">Cargando formulario...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-bold text-xs uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4" /> Volver al Expediente
        </button>
        <h1 className="text-xl font-bold text-slate-800">Editar Expediente Digital</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section: Identity */}
        <CardSection icon={<User className="text-primary" />} title="Identidad Básica">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Nombre" name="firstName" value={formData.firstName} onChange={handleChange} required />
            <FormField label="Apellido" name="lastName" value={formData.lastName} onChange={handleChange} required />
            <FormField label="Email Corporativo" name="email" value={formData.email} onChange={handleChange} required disabled />
          </div>
        </CardSection>

        {/* Section: Bank Info */}
        <CardSection icon={<CreditCard className="text-amber-500" />} title="Información de Nómina / Banco">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Banco" name="bankName" value={formData.bankName} onChange={handleChange} placeholder="Ej. Banco Mercantil" />
            <FormField label="Número de Cuenta" name="bankAccountNumber" value={formData.bankAccountNumber} onChange={handleChange} placeholder="0105..." />
            <FormField label="Salario Mensual ($)" name="baseSalary" type="number" value={formData.baseSalary} onChange={handleChange} />
            <FormField label="RIF / Identificación Fiscal" name="taxId" value={formData.taxId} onChange={handleChange} placeholder="J-12345678-9" />
          </div>
        </CardSection>

        {/* Section: Emergency */}
        <CardSection icon={<ShieldAlert className="text-red-500" />} title="Contacto de Emergencia">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Nombre del Contacto" name="emergencyName" value={formData.emergencyName} onChange={handleChange} />
            <FormField label="Parentesco" name="emergencyRelation" value={formData.emergencyRelation} onChange={handleChange} placeholder="Madre, Esposa, etc." />
            <div className="md:col-span-2">
              <FormField label="Teléfono de Emergencia" name="emergencyPhone" value={formData.emergencyPhone} onChange={handleChange} />
            </div>
          </div>
        </CardSection>

        {/* Section: Contact & Location */}
        <CardSection icon={<MapPin className="text-teal-500" />} title="Contacto y Ubicación">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Email Personal" name="personalEmail" value={formData.personalEmail} onChange={handleChange} />
            <FormField label="Teléfono Personal" name="personalPhone" value={formData.personalPhone} onChange={handleChange} />
            <FormField label="País" name="country" value={formData.country} onChange={handleChange} />
            <FormField label="Ciudad" name="city" value={formData.city} onChange={handleChange} />
          </div>
        </CardSection>

        {/* Status Messages */}
        {status && (
          <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-bottom-2 ${status.type === 'success' ? 'bg-teal-50 text-teal-600 border border-teal-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
            {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <p className="text-sm font-bold">{status.message}</p>
          </div>
        )}

        {/* Action Bar */}
        <div className="flex justify-end gap-4">
          <button type="button" onClick={() => router.back()} className="px-8 py-3 text-slate-400 font-bold text-sm uppercase tracking-widest">Cancelar</button>
          <button type="submit" disabled={isSaving} className="btn-primary px-12 py-3 shadow-xl flex items-center gap-2 disabled:opacity-50">
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  );
}

function CardSection({ icon, title, children }: any) {
  return (
    <div className="card-premium bg-white p-8 space-y-6">
      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-50 pb-4">
        {icon} {title}
      </h3>
      {children}
    </div>
  );
}

function FormField({ label, name, type = "text", value, onChange, placeholder, required, disabled }: any) {
  return (
    <div className="space-y-1">
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label} {required && '*'}</label>
      <input 
        type={type} 
        name={name} 
        value={value} 
        onChange={onChange} 
        required={required} 
        disabled={disabled}
        className={`input-modern w-full h-11 bg-slate-50/50 border-slate-100 focus:bg-white text-xs font-bold ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`} 
        placeholder={placeholder} 
      />
    </div>
  );
}
