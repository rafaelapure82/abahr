"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FileText, Download, PieChart, BarChart3, Users, 
  Building2, Calendar, Search, Filter, Loader2,
  CheckCircle2, AlertCircle, Clock, TrendingUp
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, Cell, PieChart as RePie, Pie
} from 'recharts';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    employeeId: '',
    departmentId: '',
    period: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'annual',
    date: new Date().toISOString().split('T')[0]
  });

  const [stats, setStats] = useState<any>({
    attendanceTrend: [],
    statusDist: []
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!error) fetchStats();
  }, [filters, error]);

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };
      
      console.log(`[Reports] Fetching initial data from ${API_URL}`);
      
      // Fetch employees and departments sequentially to better identify network issues
      const empRes = await axios.get(`${API_URL}/employees`, { headers, params: { limit: 100 } });
      setEmployees(empRes.data.data || []);
      
      const depRes = await axios.get(`${API_URL}/departments`, { headers });
      setDepartments(depRes.data.data || []);
      
    } catch (err: any) {
      console.error("[Reports] Network Error in fetchInitialData:", err);
      setError("Error de conexión con el servidor. Por favor, verifica que el backend esté corriendo.");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`${API_URL}/attendance/report-stats`, {
        headers,
        params: filters
      });
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error("[Reports] Error fetching report stats:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleDownload = async (format: 'pdf' | 'excel') => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const endpoint = format === 'pdf' ? '/exports/attendance/pdf' : '/exports/attendance/excel';
      const response = await axios.get(`${API_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: filters,
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte_asistencia_${filters.period}_${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(`Error downloading ${format}:`, err);
      alert(`Error al generar el reporte en ${format.toUpperCase()}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Centro de Reportes</h1>
          <p className="text-slate-500 font-medium mt-1">Genera estadísticas detalladas y documentos oficiales.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => handleDownload('excel')}
            disabled={loading}
            className="group flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
          >
            <Download className="w-4 h-4 group-hover:scale-110 transition-transform" /> {loading ? '...' : 'Excel'}
          </button>
          <button 
            onClick={() => handleDownload('pdf')}
            disabled={loading}
            className="group flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm"
          >
            <FileText className="w-4 h-4 group-hover:scale-110 transition-transform" /> {loading ? '...' : 'PDF'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-6 bg-red-50 border border-red-100 rounded-3xl flex items-center justify-between gap-4 animate-in fade-in zoom-in duration-300">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="font-black text-red-800 uppercase tracking-tight">Falla de Conexión</p>
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          </div>
          <button 
            onClick={fetchInitialData}
            className="px-6 py-3 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-200"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Filters Card */}
      <div className="card-premium p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Filter className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Configuración del Reporte</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Frecuencia</label>
            <select 
              className="w-full h-14 px-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
              value={filters.period}
              onChange={(e) => setFilters({...filters, period: e.target.value as any})}
            >
              <option value="daily">Diario</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensual</option>
              <option value="annual">Anual</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Departamento</label>
            <select 
              className="w-full h-14 px-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
              value={filters.departmentId}
              onChange={(e) => setFilters({...filters, departmentId: e.target.value, employeeId: ''})}
            >
              <option value="">Todos los Departamentos</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Empleado (Opcional)</label>
            <select 
              className="w-full h-14 px-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
              value={filters.employeeId}
              onChange={(e) => setFilters({...filters, employeeId: e.target.value})}
            >
              <option value="">Cualquier Empleado</option>
              {employees
                .filter(e => !filters.departmentId || e.departmentId === filters.departmentId)
                .map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)
              }
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Fecha Base</label>
            <input 
              type="date"
              className="w-full h-14 px-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
              value={filters.date}
              onChange={(e) => setFilters({...filters, date: e.target.value})}
            />
          </div>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-4 gap-6 transition-opacity duration-300 ${statsLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        <SummaryCard 
          label="Tasa de Asistencia" 
          value={stats.statusDist?.find((s: any) => s.name === 'Puntual')?.value ? `${stats.statusDist.find((s: any) => s.name === 'Puntual').value}%` : '0%'} 
          trend={stats.statusDist?.find((s: any) => s.name === 'Puntual')?.value > 90 ? "+2.4%" : "-1.2%"}
          icon={<TrendingUp className="text-emerald-500" />} 
          loading={statsLoading}
        />
        <SummaryCard 
          label="Promedio Horas" 
          value={stats.attendanceTrend?.length ? `${(stats.attendanceTrend.reduce((a: any, b: any) => a + b.value, 0) / stats.attendanceTrend.length).toFixed(1)}h` : '0h'} 
          icon={<Clock className="text-blue-500" />} 
          loading={statsLoading}
        />
        <SummaryCard 
          label="Retrasos Totales" 
          value={stats.statusDist?.find((s: any) => s.name === 'Retraso')?.value ? `${stats.statusDist.find((s: any) => s.name === 'Retraso').value}%` : '0%'} 
          icon={<AlertCircle className="text-amber-500" />} 
          loading={statsLoading}
        />
        <SummaryCard label="Departamentos" value={departments.length.toString()} icon={<Building2 className="text-purple-500" />} loading={statsLoading} />
      </div>

      {/* Charts Section */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 transition-opacity duration-300 ${statsLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        <div className="card-premium p-8 border border-slate-100 min-h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Tendencia de Asistencia</h3>
            <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-400">ÚLTIMOS 7 DÍAS</span>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.attendanceTrend}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#94a3b8'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  itemStyle={{ fontWeight: 800, fontSize: '14px' }}
                />
                <Area type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-premium p-8 border border-slate-100 min-h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Distribución de Estados</h3>
            <PieChart className="w-5 h-5 text-slate-400" />
          </div>
          <div className="h-[300px] flex items-center">
            <div className="flex-1 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <RePie>
                  <Pie
                    data={stats.statusDist}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.statusDist.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePie>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-4 pr-8">
              {stats.statusDist.map((s: any) => (
                <div key={s.name} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{s.name}</p>
                    <p className="text-lg font-black text-slate-800">{s.value}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, trend, icon, loading }: any) {
  return (
    <div className="card-premium p-6 border border-slate-100 group hover:border-primary/20 transition-all cursor-default relative overflow-hidden">
      {loading && (
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center z-10">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
        </div>
      )}
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-2xl bg-slate-50 group-hover:bg-primary/5 transition-colors">
          {icon}
        </div>
        {trend && (
          <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <h4 className="text-3xl font-black text-slate-800 tracking-tight">{value}</h4>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{label}</p>
      </div>
    </div>
  );
}
