"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { 
  Camera, Loader2, CheckCircle2, AlertCircle, 
  UserPlus, ChevronRight, ChevronLeft, Upload, 
  FileText, Users, Briefcase, Plus, Trash2, MapPin
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

type Step = 'IDENTITY' | 'PROFESSIONAL' | 'LOCATION' | 'DOCUMENTS' | 'FAMILY' | 'FINALIZE';

export default function NewEmployeePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('IDENTITY');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  const fileRefs = {
    avatar: useRef<HTMLInputElement>(null),
    degree: useRef<HTMLInputElement>(null),
    idCard: useRef<HTMLInputElement>(null),
  };

  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [familyFiles, setFamilyFiles] = useState<Record<number, File>>({});
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: 'Password123!',
    personalPhone: '',
    personalEmail: '',
    jobTitle: 'Gestión de Personal',
    degreeTitle: '',
    employmentType: 'FULL_TIME',
    baseSalary: '0',
    country: 'Venezuela',
    city: '',
    addressLine1: '',
    postalCode: '',
    nationalId: '',
    familyMembers: [{ name: '', relationship: 'HIJO/A', idNumber: '' }]
  });

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFamilyChange = (index: number, e: any) => {
    const newMembers = [...formData.familyMembers];
    (newMembers[index] as any)[e.target.name] = e.target.value;
    setFormData({ ...formData, familyMembers: newMembers });
  };

  const handleFamilyFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFamilyFiles(prev => ({ ...prev, [index]: file }));
  };

  const addFamilyMember = () => {
    setFormData({ ...formData, familyMembers: [...formData.familyMembers, { name: '', relationship: 'HIJO/A', idNumber: '' }] });
  };

  const removeFamilyMember = (index: number) => {
    const newMembers = formData.familyMembers.filter((_, i) => i !== index);
    setFormData({ ...formData, familyMembers: newMembers });
    const newFiles = { ...familyFiles }; delete newFiles[index]; setFamilyFiles(newFiles);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviews(prev => ({ ...prev, [key]: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const canAdvance = () => {
    if (currentStep === 'IDENTITY') return formData.firstName && formData.lastName && formData.email && formData.nationalId;
    if (currentStep === 'PROFESSIONAL') return formData.jobTitle && formData.degreeTitle && previews.degree;
    if (currentStep === 'LOCATION') return formData.country && formData.city;
    if (currentStep === 'DOCUMENTS') return previews.idCard;
    if (currentStep === 'FAMILY') return formData.familyMembers.every(m => m.name && m.idNumber);
    return true;
  };

  const nextStep = () => {
    if (!canAdvance()) {
      setStatus({ type: 'error', message: 'Faltan campos obligatorios o documentos por subir.' });
      return;
    }
    setStatus(null);
    const steps: Step[] = ['IDENTITY', 'PROFESSIONAL', 'LOCATION', 'DOCUMENTS', 'FAMILY', 'FINALIZE'];
    setCurrentStep(steps[steps.indexOf(currentStep) + 1]);
  };

  const prevStep = () => {
    const steps: Step[] = ['IDENTITY', 'PROFESSIONAL', 'LOCATION', 'DOCUMENTS', 'FAMILY', 'FINALIZE'];
    setCurrentStep(steps[steps.indexOf(currentStep) - 1]);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setStatus(null);
    try {
      const token = localStorage.getItem('access_token');
      
      const payload: any = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        jobTitle: formData.jobTitle.trim(),
        personalEmail: formData.personalEmail.trim() || formData.email.trim(),
        personalPhone: formData.personalPhone || undefined,
        country: formData.country,
        city: formData.city,
        addressLine1: formData.addressLine1,
        postalCode: formData.postalCode,
        employmentType: formData.employmentType,
        baseSalary: parseFloat(formData.baseSalary) || 0,
        employmentStatus: 'ACTIVE',
        hireDate: new Date().toISOString(),
        nationalId: formData.nationalId.trim(),
      };

      const response = await axios.post(`${API_URL}/employees`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const empId = response.data.data.id;

      const upload = async (file: File, type: string, fileName?: string) => {
        const d = new FormData(); 
        d.append('file', file); 
        d.append('type', type);
        if (fileName) d.append('name', fileName);
        return axios.post(`${API_URL}/employees/${empId}/documents`, d, { headers: { Authorization: `Bearer ${token}` }});
      };

      if (fileRefs.avatar.current?.files?.[0]) await upload(fileRefs.avatar.current.files[0], 'OTHER', 'Foto Perfil');
      if (fileRefs.degree.current?.files?.[0]) await upload(fileRefs.degree.current.files[0], 'DEGREE_CERTIFICATE', `Titulo - ${formData.degreeTitle}`);
      if (fileRefs.idCard.current?.files?.[0]) await upload(fileRefs.idCard.current.files[0], 'NATIONAL_ID', `Cedula - ${formData.firstName}`);

      for (const index in familyFiles) {
        const member = formData.familyMembers[parseInt(index)];
        await upload(familyFiles[index], 'OTHER', `Doc Familiar - ${member.relationship} - ${member.name}`);
      }

      setStatus({ type: 'success', message: '¡Registro Exitoso! Redirigiendo...' });
      setTimeout(() => router.push('/dashboard/employees'), 2000);
    } catch (e: any) {
      console.error("Error:", e.response?.data);
      const msg = e.response?.data?.message;
      setStatus({ type: 'error', message: Array.isArray(msg) ? msg[0] : (msg || 'Error al guardar el registro.') });
    } finally { setIsLoading(false); }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
        <UserPlus className="text-primary w-6 h-6" /> Registro de Personal
      </h1>
      
      <div className="flex gap-2 overflow-x-auto py-2">
        {['IDENTITY', 'PROFESSIONAL', 'LOCATION', 'DOCUMENTS', 'FAMILY', 'FINALIZE'].map((s, i) => (
          <div key={s} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${currentStep === s ? 'bg-primary text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
            {i + 1}. {s}
          </div>
        ))}
      </div>

      <div className="card-premium bg-white p-8">
        {currentStep === 'IDENTITY' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-slate-50 border-4 border-white shadow-xl flex items-center justify-center cursor-pointer overflow-hidden" onClick={() => fileRefs.avatar.current?.click()}>
                {previews.avatar ? <img src={previews.avatar} className="w-full h-full object-cover" /> : <Camera className="text-slate-300 w-8 h-8" />}
                <input type="file" ref={fileRefs.avatar} className="hidden" onChange={(e) => handleFileChange(e, 'avatar')} />
              </div>
              <div><h3 className="font-bold">Foto del Empleado</h3><p className="text-xs text-slate-400">Captura la imagen profesional para el carnet.</p></div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <FormField label="Nombre" name="firstName" value={formData.firstName} onChange={handleChange} required />
              <FormField label="Apellido" name="lastName" value={formData.lastName} onChange={handleChange} required />
              <FormField label="Email Corporativo" name="email" value={formData.email} onChange={handleChange} required placeholder="ej@abatalent.com" />
              <FormField label="Teléfono" name="personalPhone" value={formData.personalPhone} onChange={handleChange} placeholder="+58 4XX XXXXXXX" />
              <FormField label="Cédula de Identidad" name="nationalId" value={formData.nationalId} onChange={handleChange} required placeholder="V-12345678" />
            </div>
          </div>
        )}

        {currentStep === 'PROFESSIONAL' && (
          <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><Briefcase className="text-primary" /> Detalles Laborales</h3>
            <div className="grid grid-cols-2 gap-6">
              <FormField label="Cargo / Función" name="jobTitle" value={formData.jobTitle} onChange={handleChange} required />
              <FormField label="Título Universitario" name="degreeTitle" value={formData.degreeTitle} onChange={handleChange} required placeholder="Ej. Lic. en Administración" />
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Contrato</label>
                <select name="employmentType" value={formData.employmentType} onChange={handleChange} className="input-modern w-full h-11 bg-slate-50 border-slate-100 text-xs font-bold">
                  <option value="FULL_TIME">TIEMPO COMPLETO</option>
                  <option value="PART_TIME">MEDIO TIEMPO</option>
                  <option value="CONTRACTOR">CONTRATISTA</option>
                </select>
              </div>
              <FormField label="Salario Mensual ($)" name="baseSalary" type="number" value={formData.baseSalary} onChange={handleChange} />
            </div>
            <div className="p-10 border-2 border-dashed rounded-3xl text-center bg-slate-50">
              {previews.degree ? <CheckCircle2 className="mx-auto text-teal-500 w-10 h-10" /> : <Upload className="mx-auto text-slate-300 w-10 h-10" />}
              <p className="mt-4 text-sm font-bold">Título Escaneado (Obligatorio)</p>
              <button type="button" onClick={() => fileRefs.degree.current?.click()} className="mt-4 btn-secondary text-xs">Cargar Título</button>
              <input type="file" ref={fileRefs.degree} className="hidden" onChange={(e) => handleFileChange(e, 'degree')} />
            </div>
          </div>
        )}

        {currentStep === 'LOCATION' && (
          <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><MapPin className="text-primary" /> Ubicación y Domicilio</h3>
            <div className="grid grid-cols-2 gap-6">
              <FormField label="País" name="country" value={formData.country} onChange={handleChange} required />
              <FormField label="Ciudad" name="city" value={formData.city} onChange={handleChange} required />
              <div className="md:col-span-2">
                <FormField label="Dirección de Habitación" name="addressLine1" value={formData.addressLine1} onChange={handleChange} placeholder="Calle, Edificio, Apto..." />
              </div>
              <FormField label="Código Postal" name="postalCode" value={formData.postalCode} onChange={handleChange} />
              <FormField label="Email Personal" name="personalEmail" value={formData.personalEmail} onChange={handleChange} placeholder="personal@gmail.com" />
            </div>
          </div>
        )}

        {currentStep === 'DOCUMENTS' && (
          <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><FileText className="text-primary" /> Identificación Legal</h3>
            <div className="p-10 border-2 border-dashed rounded-3xl text-center bg-slate-50">
              {previews.idCard ? <CheckCircle2 className="mx-auto text-teal-500 w-10 h-10" /> : <Upload className="mx-auto text-slate-300 w-10 h-10" />}
              <p className="mt-4 text-sm font-bold">Cédula de Identidad / Pasaporte</p>
              <button type="button" onClick={() => fileRefs.idCard.current?.click()} className="mt-4 btn-secondary text-xs">Cargar Documento</button>
              <input type="file" ref={fileRefs.idCard} className="hidden" onChange={(e) => handleFileChange(e, 'idCard')} />
            </div>
          </div>
        )}

        {currentStep === 'FAMILY' && (
          <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><Users className="text-primary" /> Grupo Familiar</h3>
              <button type="button" onClick={addFamilyMember} className="btn-secondary text-[10px] flex items-center gap-1"><Plus className="w-3 h-3" /> Añadir Familiar</button>
            </div>
            {formData.familyMembers.map((m, i) => (
              <div key={i} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-4 items-end relative">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase">Relación</label>
                  <select name="relationship" value={m.relationship} onChange={(e) => handleFamilyChange(i, e)} className="w-full h-10 bg-white border-slate-200 rounded-xl px-3 text-xs font-bold mt-1">
                    <option>HIJO/A</option><option>CÓNYUGE</option><option>MADRE</option><option>PADRE</option>
                  </select>
                </div>
                <div><FormField label="Nombre Completo" name="name" value={m.name} onChange={(e:any) => handleFamilyChange(i, e)} /></div>
                <div><FormField label="ID / Cédula" name="idNumber" value={m.idNumber} onChange={(e:any) => handleFamilyChange(i, e)} /></div>
                <div className="flex gap-2">
                  <input type="file" id={`fam-file-${i}`} className="hidden" onChange={(e) => handleFamilyFileChange(i, e)} />
                  <button type="button" onClick={() => document.getElementById(`fam-file-${i}`)?.click()} className={`flex-1 h-10 rounded-xl text-[10px] font-bold transition-all border ${familyFiles[i] ? 'bg-teal-50 text-teal-600 border-teal-100' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'}`}>
                    {familyFiles[i] ? 'Doc Cargado' : 'Subir ID'}
                  </button>
                  {i > 0 && <button type="button" onClick={() => removeFamilyMember(i)} className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center"><Trash2 className="w-4 h-4" /></button>}
                </div>
              </div>
            ))}
          </div>
        )}

        {currentStep === 'FINALIZE' && (
          <div className="text-center py-10 space-y-6">
            <div className="w-20 h-20 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto"><CheckCircle2 className="w-10 h-10" /></div>
            <h3 className="text-xl font-bold text-slate-800">Expediente Completo</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">Has completado todos los pasos. Se creará el registro con toda la información laboral y personal alineada.</p>
          </div>
        )}

        <div className="mt-10 pt-8 border-t flex justify-between items-center">
          <div className="max-w-[70%]">
            {status && <div className={`text-xs font-bold flex items-center gap-2 p-3 rounded-xl ${status.type === 'success' ? 'bg-teal-50 text-teal-600' : 'bg-red-50 text-red-600 animate-pulse'}`}>
              <AlertCircle className="w-4 h-4" /> {status.message}
            </div>}
          </div>
          <div className="flex gap-4">
            {currentStep !== 'IDENTITY' && <button type="button" onClick={prevStep} className="px-6 text-slate-400 font-bold text-xs">Anterior</button>}
            {currentStep !== 'FINALIZE' ? (
              <button type="button" onClick={nextStep} className="btn-primary px-10 py-3 shadow-lg flex items-center gap-2">Continuar <ChevronRight className="w-4 h-4" /></button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={isLoading} className="btn-primary px-12 py-3 shadow-xl bg-teal-600 hover:bg-teal-700 flex items-center gap-2 disabled:opacity-50">
                {isLoading ? <Loader2 className="animate-spin" /> : 'Confirmar Alta'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, name, type = "text", value, onChange, placeholder, required }: any) {
  return (
    <div className="space-y-1">
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label} {required && '*'}</label>
      <input type={type} name={name} value={value} onChange={onChange} required={required} className="input-modern w-full h-11 bg-slate-50/50 border-slate-100 focus:bg-white text-xs font-bold" placeholder={placeholder} />
    </div>
  );
}
