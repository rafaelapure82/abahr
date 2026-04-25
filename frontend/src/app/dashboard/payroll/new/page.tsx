"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { 
  CreditCard, Calendar, ArrowLeft, Loader2, 
  CheckCircle2, AlertCircle, PlayCircle, Info
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export default function NewPayrollPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    periodStart: '',
    periodEnd: '',
    payDate: '',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(`${API_URL}/payroll`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const newPayroll = response.data.data;
      router.push(`/dashboard/payroll/${newPayroll.id}`);
    } catch (err: any) {
      console.error("Error generating payroll:", err);
      setError(err.response?.data?.message || 'Error al generar la nómina. Verifica las fechas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20 animate-in slide-in-from-bottom-8 duration-700">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-3 bg-white rounded-2xl text-slate-400 hover:text-primary shadow-sm transition-all border border-slate-50">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Iniciar Ciclo de Nómina</h1>
          <p className="text-slate-500 font-medium text-sm">Configura el periodo y genera el lote de pagos automático.</p>
        </div>
      </div>

      <div className="card-premium bg-white p-10 shadow-2xl border-none">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Calendar className="w-3 h-3" /> Inicio del Periodo
              </label>
              <input 
                type="date" 
                name="periodStart"
                value={formData.periodStart}
                onChange={handleChange}
                required
                className="input-modern w-full h-12 bg-slate-50 border-slate-100 focus:bg-white text-sm font-bold" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Calendar className="w-3 h-3" /> Fin del Periodo
              </label>
              <input 
                type="date" 
                name="periodEnd"
                value={formData.periodEnd}
                onChange={handleChange}
                required
                className="input-modern w-full h-12 bg-slate-50 border-slate-100 focus:bg-white text-sm font-bold" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Calendar className="w-3 h-3" /> Fecha de Pago Programada
              </label>
              <input 
                type="date" 
                name="payDate"
                value={formData.payDate}
                onChange={handleChange}
                required
                className="input-modern w-full h-12 bg-slate-50 border-slate-100 focus:bg-white text-sm font-bold" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <CreditCard className="w-3 h-3" /> Moneda Predeterminada
              </label>
              <div className="h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center px-4 text-sm font-bold text-slate-400">
                USD (Dólares Estadounidenses)
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Notas Internas / Referencia</label>
            <textarea 
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Ej. Nómina ordinaria primer quincena de Marzo..."
              className="input-modern w-full p-4 bg-slate-50 border-slate-100 focus:bg-white text-sm font-bold resize-none"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 text-xs font-bold border border-red-100 animate-pulse">
              <AlertCircle className="w-5 h-5" /> {error}
            </div>
          )}

          <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10 space-y-4">
            <h4 className="font-black text-[10px] uppercase tracking-widest text-primary flex items-center gap-2">
              <Info className="w-3 h-3" /> Información del Proceso
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Al confirmar, el sistema analizará la asistencia de todos los empleados activos en el rango de fechas seleccionado, calculará horas extra, bonos configurados y deducciones legales de forma automática.
            </p>
          </div>

          <div className="pt-4 flex justify-end">
            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary px-12 py-4 shadow-2xl flex items-center gap-3 text-sm font-black tracking-widest uppercase"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Procesando Lote...
                </>
              ) : (
                <>
                  <PlayCircle className="w-5 h-5" /> Generar Nómina
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
