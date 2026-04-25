"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ShieldAlert, Search, Filter, Calendar, 
  User, Database, History, ChevronLeft, 
  ChevronRight, ArrowUpDown, Clock
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [page, actionFilter, resourceFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/audit-logs`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { 
          page, 
          limit: 15, 
          search: searchTerm,
          action: actionFilter || undefined,
          resource: resourceFilter || undefined
        }
      });
      setLogs(response.data.data?.data || response.data.data || []);
      setTotalPages(response.data.data?.meta?.totalPages || response.data.meta?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/audit-logs/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const getActionColor = (action: string) => {
    if (action.includes('CREATE')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (action.includes('UPDATE')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (action.includes('DELETE')) return 'bg-red-100 text-red-700 border-red-200';
    if (action.includes('LOGIN')) return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="text-primary w-6 h-6" />
            Centro de Auditoría Global
          </h1>
          <p className="text-sm text-slate-400">Seguimiento íntegro de acciones administrativas y cambios en el sistema.</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card-premium p-6 bg-white border-l-4 border-primary">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Registros</p>
          <p className="text-2xl font-black text-slate-800 mt-1">{stats?.total || '0'}</p>
        </div>
        <div className="card-premium p-6 bg-white border-l-4 border-emerald-400">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Creaciones</p>
          <p className="text-2xl font-black text-slate-800 mt-1">
            {stats?.byAction?.find((a: any) => a.action === 'CREATE')?.count || '0'}
          </p>
        </div>
        <div className="card-premium p-6 bg-white border-l-4 border-blue-400">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Modificaciones</p>
          <p className="text-2xl font-black text-slate-800 mt-1">
            {stats?.byAction?.find((a: any) => a.action === 'UPDATE')?.count || '0'}
          </p>
        </div>
        <div className="card-premium p-6 bg-white border-l-4 border-red-400">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Eliminaciones</p>
          <p className="text-2xl font-black text-slate-800 mt-1">
            {stats?.byAction?.find((a: any) => a.action === 'DELETE')?.count || '0'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card-premium bg-white p-6 shadow-sm border border-slate-100">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Buscar por usuario o acción..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 pl-10 pr-4 bg-slate-50 border-transparent rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all outline-none"
            />
          </div>
          <select 
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="h-11 bg-slate-50 border-transparent rounded-xl text-xs font-bold px-4 outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Todas las acciones</option>
            <option value="CREATE">CREAR</option>
            <option value="UPDATE">ACTUALIZAR</option>
            <option value="DELETE">ELIMINAR</option>
            <option value="LOGIN">INICIO SESIÓN</option>
          </select>
          <select 
            value={resourceFilter}
            onChange={(e) => setResourceFilter(e.target.value)}
            className="h-11 bg-slate-50 border-transparent rounded-xl text-xs font-bold px-4 outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Todos los recursos</option>
            <option value="EMPLOYEE">Empleado</option>
            <option value="PAYROLL">Nómina</option>
            <option value="ATTENDANCE">Asistencia</option>
            <option value="DEPARTMENT">Departamento</option>
            <option value="SETTINGS">Configuración</option>
          </select>
          <button type="submit" className="btn-primary h-11 text-xs uppercase tracking-widest font-black">Filtrar Historial</button>
        </form>
      </div>

      {/* Table */}
      <div className="card-premium bg-white overflow-hidden shadow-xl shadow-slate-200/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Fecha y Hora</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Usuario / Actor</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Acción</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Recurso</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Descripción</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Cargando registros...</p>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-slate-400 font-bold">No se encontraron registros de auditoría.</td>
                </tr>
              ) : logs.map((log) => (
                <tr key={log.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="p-5 border-b border-slate-50">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-slate-300" />
                      <span className="text-xs font-bold text-slate-600">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="p-5 border-b border-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-800">{log.user?.employee?.firstName} {log.user?.employee?.lastName || 'Sistema'}</p>
                        <p className="text-[10px] font-bold text-slate-400">{log.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-5 border-b border-slate-50">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="p-5 border-b border-slate-50">
                    <div className="flex items-center gap-2">
                      <Database className="w-3 h-3 text-primary/50" />
                      <span className="text-xs font-bold text-slate-600">{log.resource}</span>
                      <span className="text-[9px] font-mono text-slate-300">#{log.resourceId?.slice(-6)}</span>
                    </div>
                  </td>
                  <td className="p-5 border-b border-slate-50">
                    <p className="text-xs text-slate-500 font-medium line-clamp-1 group-hover:line-clamp-none transition-all">
                      {log.description}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
          <p className="text-xs font-bold text-slate-400">Página {page} de {totalPages}</p>
          <div className="flex gap-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
