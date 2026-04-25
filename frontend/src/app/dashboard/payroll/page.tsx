"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CreditCard, Plus, Search, Filter, 
  Download, Eye, CheckCircle2, Clock, 
  AlertCircle, ChevronRight, FileText,
  DollarSign, PieChart, Loader2, Calendar
} from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export default function PayrollPage() {
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalMonthly: 0, pendingApproval: 0, lastRun: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const res = await axios.get(`${API_URL}/payroll`, { headers });
      const data = res.data.data?.data || res.data.data || [];
      setPayrolls(data);

      // Calculate simple stats from data
      const pending = data.filter((p: any) => p.status === 'PENDING_APPROVAL' || p.status === 'DRAFT').length;
      const total = data.reduce((acc: number, p: any) => acc + (parseFloat(p.totalNet) || 0), 0);
      
      setStats({
        totalMonthly: total,
        pendingApproval: pending,
        lastRun: data[0]?.createdAt || 'N/A'
      });
    } catch (error) {
      console.error("Error fetching payroll:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'APPROVED': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'DRAFT': return 'bg-slate-50 text-slate-400 border-slate-100';
      case 'PENDING_APPROVAL': return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-slate-50 text-slate-400 border-slate-100';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <CreditCard className="text-primary w-8 h-8" /> Gestión de Nómina
          </h1>
          <p className="text-slate-500 font-medium mt-1">Procesamiento y auditoría de pagos corporativos.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/payroll/new" className="btn-primary px-6 py-3 shadow-xl flex items-center gap-2">
            <Plus className="w-5 h-5" /> Nueva Nómina
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-premium p-8 bg-white border-none shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
            <DollarSign className="w-20 h-20 text-primary" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Gasto Total Acumulado</p>
          <p className="text-3xl font-black text-slate-900">${stats.totalMonthly.toLocaleString()}</p>
          <div className="mt-4 flex items-center gap-2 text-emerald-500 font-bold text-xs">
            <CheckCircle2 className="w-4 h-4" /> <span>Periodo Actual Activo</span>
          </div>
        </div>

        <div className="card-premium p-8 bg-white border-none shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
            <Clock className="w-20 h-20 text-amber-500" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Pendiente de Aprobación</p>
          <p className="text-3xl font-black text-slate-900">{stats.pendingApproval} Lotes</p>
          <div className="mt-4 flex items-center gap-2 text-amber-500 font-bold text-xs">
            <AlertCircle className="w-4 h-4" /> <span>Requiere revisión de RRHH</span>
          </div>
        </div>

        <div className="card-premium p-8 bg-white border-none shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
            <Calendar className="w-20 h-20 text-blue-500" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Último Cierre</p>
          <p className="text-3xl font-black text-slate-900">{stats.lastRun !== 'N/A' ? new Date(stats.lastRun).toLocaleDateString() : 'Sin registros'}</p>
          <div className="mt-4 flex items-center gap-2 text-blue-500 font-bold text-xs">
            <FileText className="w-4 h-4" /> <span>Reporte consolidado listo</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="card-premium bg-white p-0 overflow-hidden shadow-xl border-none">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Buscar por periodo o nota..." 
              className="input-modern w-full pl-11 bg-white border-slate-100"
            />
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-100 rounded-xl hover:bg-white hover:shadow-sm transition-all">
              <Filter className="w-3 h-3" /> Filtrar
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-100 rounded-xl hover:bg-white hover:shadow-sm transition-all">
              <Download className="w-3 h-3" /> Exportar Global
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <PayrollSkeleton />
          ) : payrolls.length === 0 ? (
            <div className="py-32 flex flex-col items-center justify-center text-center px-10">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <PieChart className="w-10 h-10 text-slate-200" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">No hay nóminas procesadas</h3>
              <p className="text-sm text-slate-400 max-w-sm mt-2">Inicia tu primer proceso de nómina para comenzar a gestionar los pagos de tu equipo.</p>
              <Link href="/dashboard/payroll/new" className="mt-8 btn-primary px-8 py-3">Iniciar Primer Ciclo</Link>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-50">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Periodo / Identificador</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Gasto Neto</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha Pago</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {payrolls.map((payroll) => (
                  <tr key={payroll.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-white group-hover:shadow-sm transition-all">
                          <Calendar className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800">Periodo {new Date(payroll.periodStart).toLocaleDateString([], { month: 'long', year: 'numeric' })}</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-0.5">#{payroll.id.slice(0, 8).toUpperCase()} • {payroll.notes || 'Nómina mensual estándar'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(payroll.status)}`}>
                        {payroll.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-0.5">
                        <p className="text-sm font-black text-slate-800">${parseFloat(payroll.totalNet).toLocaleString()}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Moneda: {payroll.currency}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm font-bold text-slate-600">
                      {payroll.payDate ? new Date(payroll.payDate).toLocaleDateString() : 'Por definir'}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link 
                          href={`/dashboard/payroll/${payroll.id}`}
                          className="p-2 text-slate-400 hover:text-primary transition-colors"
                          title="Ver Detalles"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                        <button 
                          className="p-2 text-slate-400 hover:text-emerald-500 transition-colors"
                          title="Descargar Reporte"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                        <ChevronRight className="w-5 h-5 text-slate-200 ml-2" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function PayrollSkeleton() {
  return (
    <div className="p-8 space-y-6">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center justify-between p-6 bg-slate-50/50 rounded-[24px] border border-slate-50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-2xl w-12 h-12 animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-40 bg-white animate-pulse rounded-md" />
              <div className="h-3 w-24 bg-white animate-pulse rounded-md" />
            </div>
          </div>
          <div className="flex gap-12">
            <div className="h-6 w-20 bg-white animate-pulse rounded-full" />
            <div className="h-6 w-24 bg-white animate-pulse rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
