"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, Filter, Calendar as CalendarIcon, Clock, 
  CheckCircle2, AlertCircle, Loader2, User, MapPin, 
  ArrowUpRight, ArrowDownRight, MoreHorizontal, Download, X, Save
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export default function AttendanceManagementPage() {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ search: '', status: '', startDate: '', endDate: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, [filter, page]);

  useEffect(() => {
    if (isModalOpen) fetchEmployees();
  }, [isModalOpen]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };
      
      // Clean up empty filters to avoid Zod validation errors (e.g. empty status string)
      const cleanFilters = Object.fromEntries(
        Object.entries(filter).filter(([_, value]) => value !== '')
      );
      
      const [listRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/attendance`, { 
          params: { ...cleanFilters, page, limit: 10 }, 
          headers 
        }),
        axios.get(`${API_URL}/attendance/stats`, { headers })
      ]);
      
      setAttendance(listRes.data.data || []);
      setTotalPages(listRes.data.meta?.totalPages || 1);
      setStats(statsRes.data.data);
    } catch (err) {
      console.error("Error fetching attendance data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.get(`${API_URL}/employees`, { 
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 100 }
      });
      setEmployees(res.data.data || []);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/exports/attendance/excel`, {
        headers: { Authorization: `Bearer ${token}` },
        params: filter,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `asistencia_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este registro?')) return;
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`${API_URL}/attendance/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Gestión de Asistencia</h1>
          <p className="text-slate-500">Monitoreo en tiempo real de entradas y salidas.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExport}
            className="btn-secondary flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Exportar Reporte
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Clock className="w-4 h-4" /> Nuevo Registro
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard 
          label="Presentes Hoy" 
          value={stats?.employeesPresent || 0} 
          total={stats?.employeesTotal || 0}
          icon={<User className="text-blue-500" />}
          color="blue"
        />
        <StatCard 
          label="Retrasos" 
          value={stats?.employeesLate || 0} 
          icon={<AlertCircle className="text-amber-500" />}
          color="amber"
        />
        <StatCard 
          label="Tasa de Asistencia" 
          value={`${Math.round(stats?.attendanceRate || 0)}%`} 
          icon={<CheckCircle2 className="text-emerald-500" />}
          color="emerald"
        />
        <StatCard 
          label="Remoto" 
          value={Array.isArray(attendance) ? attendance.filter(a => a.isRemote).length : 0} 
          icon={<MapPin className="text-purple-500" />}
          color="purple"
        />
      </div>

      {/* Filters & Table */}
      <div className="card-premium overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-1 min-w-[300px] gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar empleado o código..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20"
                value={filter.search}
                onChange={(e) => setFilter({...filter, search: e.target.value})}
              />
            </div>
            <select 
              className="bg-slate-50 border-none rounded-xl text-sm px-4 focus:ring-2 focus:ring-primary/20"
              value={filter.status}
              onChange={(e) => setFilter({...filter, status: e.target.value})}
            >
              <option value="">Todos los Estados</option>
              <option value="PRESENT">Puntual</option>
              <option value="LATE">Retraso</option>
              <option value="ABSENT">Ausente</option>
            </select>
          </div>
          <div className="flex gap-2">
            <input 
              type="date" 
              className="bg-slate-50 border-none rounded-xl text-sm px-4 py-2"
              value={filter.startDate}
              onChange={(e) => setFilter({...filter, startDate: e.target.value})}
            />
            <span className="self-center text-slate-400">a</span>
            <input 
              type="date" 
              className="bg-slate-50 border-none rounded-xl text-sm px-4 py-2"
              value={filter.endDate}
              onChange={(e) => setFilter({...filter, endDate: e.target.value})}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Empleado</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Fecha</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Entrada</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Salida</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Horas</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Estado</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">Cargando registros...</p>
                  </td>
                </tr>
              ) : attendance.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <p className="text-slate-400 text-sm">No se encontraron registros de asistencia.</p>
                  </td>
                </tr>
              ) : (
                attendance.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                          {record.employee.firstName[0]}{record.employee.lastName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{record.employee.firstName} {record.employee.lastName}</p>
                          <p className="text-xs text-slate-400">{record.employee.employeeCode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-600">
                        {new Date(record.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <ArrowUpRight className="w-4 h-4" />
                        </div>
                        <p className="text-sm font-bold text-slate-700">
                          {record.checkIn ? new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                          <ArrowDownRight className="w-4 h-4" />
                        </div>
                        <p className="text-sm font-bold text-slate-700">
                          {record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-black text-slate-800">{record.hoursWorked || 0}h</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        record.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-600' : 
                        record.status === 'LATE' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {record.status === 'PRESENT' ? 'Puntual' : record.status === 'LATE' ? 'Retraso' : 'Ausente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleDelete(record.id)}
                          className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                          title="Eliminar registro"
                        >
                          <AlertCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <p className="text-sm text-slate-500 font-medium">
            Página <span className="text-slate-900 font-bold">{page}</span> de <span className="text-slate-900 font-bold">{totalPages}</span>
          </p>
          <div className="flex gap-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 text-sm font-bold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 transition-all"
            >
              Anterior
            </button>
            <button 
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 text-sm font-bold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 transition-all"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* Manual Attendance Modal */}
      {isModalOpen && (
        <ManualAttendanceModal 
          employees={employees} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => {
            setIsModalOpen(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}
function ManualAttendanceModal({ employees, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    checkIn: '',
    checkOut: '',
    status: 'PRESENT',
    note: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      // Format times to full ISO if provided
      const payload = {
        ...formData,
        checkIn: formData.checkIn ? `${formData.date}T${formData.checkIn}:00` : undefined,
        checkOut: formData.checkOut ? `${formData.date}T${formData.checkOut}:00` : undefined,
      };

      await axios.post(`${API_URL}/attendance`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onSuccess();
    } catch (err) {
      console.error("Save failed:", err);
      alert("Error al guardar el registro.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-300">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Nuevo Registro Manual</h2>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-slate-600 shadow-sm">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Seleccionar Empleado</label>
            <select 
              required
              className="w-full h-12 px-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
              value={formData.employeeId}
              onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
            >
              <option value="">-- Elegir Empleado --</option>
              {employees.map((emp: any) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} ({emp.employeeCode})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Fecha</label>
              <input 
                type="date" 
                required
                className="w-full h-12 px-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Estado</label>
              <select 
                className="w-full h-12 px-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="PRESENT">Puntual</option>
                <option value="LATE">Retraso</option>
                <option value="ABSENT">Ausente</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Entrada (HH:mm)</label>
              <input 
                type="time" 
                className="w-full h-12 px-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                value={formData.checkIn}
                onChange={(e) => setFormData({...formData, checkIn: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Salida (HH:mm)</label>
              <input 
                type="time" 
                className="w-full h-12 px-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                value={formData.checkOut}
                onChange={(e) => setFormData({...formData, checkOut: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nota / Observación</label>
            <textarea 
              className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none min-h-[100px]"
              placeholder="Ej. Justificación médica, falla técnica..."
              value={formData.note}
              onChange={(e) => setFormData({...formData, note: e.target.value})}
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 h-12 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-[2] h-12 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {loading ? 'Guardando...' : 'Guardar Registro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StatCard({ label, value, total, icon, color }: any) {
  return (
    <div className="card-premium p-6 shadow-sm border border-slate-100">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl bg-${color}-50`}>{icon}</div>
        {total > 0 && (
          <span className="text-xs font-bold text-slate-400">{Math.round((value/total)*100)}%</span>
        )}
      </div>
      <div>
        <h4 className="text-2xl font-black text-slate-800">
          {value}{total > 0 && <span className="text-sm text-slate-400 font-normal ml-1">/ {total}</span>}
        </h4>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      </div>
    </div>
  );
}
