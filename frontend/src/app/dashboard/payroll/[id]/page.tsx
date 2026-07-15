"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { 
  CreditCard, ArrowLeft, Download, FileText, 
  CheckCircle2, AlertCircle, Loader2, User,
  DollarSign, PieChart, Printer, ChevronRight,
  TrendingUp, TrendingDown, Info
} from 'lucide-react';
import { getAvatarUrl } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

export default function PayrollDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [payroll, setPayroll] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.get(`${API_URL}/payroll/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayroll(res.data.data);
    } catch (error) {
      console.error("Error fetching payroll details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!confirm('Â¿EstÃ¡s seguro de aprobar esta nÃ³mina? Una vez aprobada, los registros de pago serÃ¡n inmutables.')) return;
    setApproving(true);
    try {
      const token = localStorage.getItem('access_token');
      await axios.patch(`${API_URL}/payroll/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (error) {
      console.error("Error approving payroll:", error);
      alert('Error al aprobar la nÃ³mina');
    } finally {
      setApproving(false);
    }
  };

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-12 h-12 animate-spin text-primary opacity-20" />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Compilando registros de pago...</p>
    </div>
  );

  if (!payroll) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
      <AlertCircle className="w-12 h-12 text-red-500" />
      <h2 className="text-xl font-bold">NÃ³mina no encontrada</h2>
      <button onClick={() => router.back()} className="btn-primary px-6 py-2 mt-4">Volver</button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-3 bg-white rounded-2xl text-slate-400 hover:text-primary shadow-sm transition-all border border-slate-50">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Detalle de NÃ³mina</h1>
            <p className="text-slate-500 font-medium text-sm">Periodo: {new Date(payroll.periodStart).toLocaleDateString()} - {new Date(payroll.periodEnd).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-white text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm border border-slate-100 hover:border-primary transition-all">
            <Printer className="w-4 h-4" /> Imprimir Lote
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-white text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm border border-slate-100 hover:border-primary transition-all">
            <Download className="w-4 h-4" /> Exportar Excel
          </button>
          {payroll.status === 'DRAFT' || payroll.status === 'PENDING_APPROVAL' ? (
            <button 
              onClick={handleApprove}
              disabled={approving}
              className="btn-primary px-8 py-3 shadow-xl bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2"
            >
              {approving ? <Loader2 className="animate-spin w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
              {approving ? 'PROCESANDO...' : 'APROBAR PAGO'}
            </button>
          ) : (
            <div className="px-8 py-3 bg-emerald-50 text-emerald-600 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 border border-emerald-100">
              <CheckCircle2 className="w-4 h-4" /> NÃ“MINA PAGADA
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card-premium p-6 bg-white space-y-2">
          <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Total Bruto</p>
          <p className="text-2xl font-black text-slate-800">${parseFloat(payroll.totalGross).toLocaleString()}</p>
          <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400">
            <TrendingUp className="w-3 h-3 text-emerald-500" /> +2.5% vs mes anterior
          </div>
        </div>
        <div className="card-premium p-6 bg-white space-y-2">
          <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Deducciones</p>
          <p className="text-2xl font-black text-red-500">-${parseFloat(payroll.totalDeductions).toLocaleString()}</p>
          <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400">
            <TrendingDown className="w-3 h-3 text-red-400" /> Retenciones aplicadas
          </div>
        </div>
        <div className="card-premium p-6 bg-emerald-600 text-white space-y-2 shadow-emerald-200">
          <p className="text-[9px] font-black uppercase opacity-60 tracking-widest">Neto a Pagar</p>
          <p className="text-2xl font-black">${parseFloat(payroll.totalNet).toLocaleString()}</p>
          <div className="flex items-center gap-1 text-[9px] font-bold opacity-80">
            {payroll.items?.length || 0} Empleados incluidos
          </div>
        </div>
        <div className="card-premium p-6 bg-white space-y-2">
          <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Estatus de Lote</p>
          <div className="flex items-center gap-2 mt-2">
            <div className={`w-3 h-3 rounded-full ${payroll.status === 'PAID' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></div>
            <p className="text-sm font-black text-slate-800 uppercase tracking-widest">{payroll.status}</p>
          </div>
          <p className="text-[9px] font-bold text-slate-400">Moneda: {payroll.currency}</p>
        </div>
      </div>

      {/* Employee List Table */}
      <div className="card-premium bg-white p-0 overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <h3 className="font-black text-xs uppercase tracking-widest text-slate-400">Desglose de Empleados</h3>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-slate-50 rounded-lg text-[9px] font-bold text-slate-500">TOTAL: {payroll.items?.length || 0}</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Empleado</th>
                <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Bruto</th>
                <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Bonos</th>
                <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Deducciones</th>
                <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Neto</th>
                <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Recibo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {payroll.items?.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-primary font-bold text-xs border border-slate-200">
                        {item.employee?.avatarUrl ? (
                          <img src={getAvatarUrl(item.employee.avatarUrl) || ''} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          <User className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-800">{item.employee?.firstName} {item.employee?.lastName}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{item.employee?.jobTitle}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-xs font-bold text-slate-700">${parseFloat(item.baseSalary).toLocaleString()}</td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-bold text-emerald-500">+${(item.bonuses?.reduce((acc: number, b: any) => acc + parseFloat(b.amount), 0) || 0).toLocaleString()}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-bold text-red-400">-${(item.deductions?.reduce((acc: number, d: any) => acc + parseFloat(d.amount), 0) || 0).toLocaleString()}</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <p className="text-sm font-black text-slate-800">${parseFloat(item.netPay).toLocaleString()}</p>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <button 
                      className="p-2 text-slate-400 hover:text-primary transition-colors bg-white rounded-lg border border-slate-100 shadow-sm"
                      title="Descargar PDF"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="card-premium bg-white p-8 space-y-6">
          <h4 className="font-black text-xs uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <Info className="w-4 h-4" /> Notas de AuditorÃ­a
          </h4>
          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Creado por</span>
              <span className="font-black text-slate-700">{payroll.processedBy || 'Sistema AutomÃ¡tico'}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Fecha de GeneraciÃ³n</span>
              <span className="font-black text-slate-700">{new Date(payroll.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Ãšltima ModificaciÃ³n</span>
              <span className="font-black text-slate-700">{new Date(payroll.updatedAt).toLocaleString()}</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 italic">
            * Este lote incluye cÃ¡lculos basados en {payroll.items?.length || 0} contratos activos y registros de asistencia procesados hasta la fecha.
          </p>
        </div>

        <div className="card-premium bg-white p-8 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center text-primary">
            <DollarSign className="w-10 h-10" />
          </div>
          <h4 className="text-xl font-bold text-slate-800">Cierre de Periodo</h4>
          <p className="text-sm text-slate-400 max-w-xs">
            Una vez aprobada la nÃ³mina, se generarÃ¡n los asientos contables y se enviarÃ¡n las notificaciones de pago a los empleados.
          </p>
          {!payroll.approvedAt && (
            <button 
              onClick={handleApprove}
              disabled={approving}
              className="btn-primary w-full py-4 shadow-lg flex items-center justify-center gap-2"
            >
              Confirmar y Aprobar Todo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}