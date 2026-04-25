"use client";

import { useState } from 'react';
import { X, Upload, FileText, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios';

interface Props {
  employeeId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DOCUMENT_TYPES = [
  { value: 'NATIONAL_ID', label: 'Documento de Identidad' },
  { value: 'PASSPORT', label: 'Pasaporte' },
  { value: 'DRIVERS_LICENSE', label: 'Licencia de Conducir' },
  { value: 'EMPLOYMENT_CONTRACT', label: 'Contrato Laboral' },
  { value: 'NDA', label: 'Acuerdo de Confidencialidad' },
  { value: 'WORK_PERMIT', label: 'Permiso de Trabajo' },
  { value: 'TAX_FORM', label: 'Formulario de Impuestos' },
  { value: 'DEGREE_CERTIFICATE', label: 'Título Universitario' },
  { value: 'PROFESSIONAL_LICENSE', label: 'Licencia Profesional' },
  { value: 'PERFORMANCE_REVIEW_DOC', label: 'Evaluación de Desempeño' },
  { value: 'DISCIPLINARY_NOTICE', label: 'Aviso Disciplinario' },
  { value: 'RESIGNATION_LETTER', label: 'Carta de Renuncia' },
  { value: 'OTHER', label: 'Otro Documento' },
];

export default function UploadDocumentModal({ employeeId, isOpen, onClose, onSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState('OTHER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Por favor selecciona un archivo');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      const token = localStorage.getItem('access_token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
      
      await axios.post(`${API_URL}/employees/${employeeId}/documents`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
        setSuccess(false);
        setFile(null);
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Error al subir el archivo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              Subir Documento
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Añadir al expediente digital</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400 hover:text-slate-600 shadow-sm">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleUpload} className="p-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold animate-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          {success ? (
            <div className="py-12 flex flex-col items-center justify-center gap-4 text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
              <div>
                <p className="text-lg font-black text-slate-800">¡Documento Cargado!</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Sincronizando expediente...</p>
              </div>
            </div>
          ) : (
            <>
              {/* File Drop Zone */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Archivo (PDF, JPG, PNG)</label>
                <div className="relative group">
                  <input 
                    type="file" 
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  />
                  <div className={`p-10 border-2 border-dashed rounded-[24px] flex flex-col items-center justify-center gap-3 transition-all ${file ? 'border-primary bg-primary/5' : 'border-slate-200 bg-slate-50 group-hover:border-primary/50 group-hover:bg-white'}`}>
                    <div className={`p-4 rounded-2xl shadow-sm ${file ? 'bg-primary text-white' : 'bg-white text-slate-400'}`}>
                      <FileText className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-black text-slate-800 uppercase tracking-tight">
                        {file ? file.name : 'Haz clic o arrastra un archivo'}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 mt-1">Máximo 10MB</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Type Selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Documento</label>
                <select 
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full h-14 bg-slate-50 border-slate-100 rounded-2xl px-6 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
                >
                  {DOCUMENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={onClose}
                  className="flex-1 h-14 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={loading || !file}
                  className="flex-[2] btn-primary h-14 shadow-xl shadow-primary/20 disabled:opacity-50 disabled:shadow-none"
                >
                  {loading ? (
                    <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Subiendo...</span>
                  ) : 'Subir Archivo'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
