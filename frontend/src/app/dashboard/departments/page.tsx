"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Building2, Plus, Search, MoreHorizontal, 
  ChevronRight, Users, Briefcase, MapPin, 
  Edit3, Trash2, Loader2, AlertCircle, CheckCircle2,
  GitBranch
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    code: '',
    description: '',
    parentId: '',
    headId: '',
    color: '#6366f1'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const [deptRes, empRes] = await Promise.all([
        axios.get(`${API_URL}/departments`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/employees`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setDepartments(deptRes.data.data || []);
      setEmployees(empRes.data.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatus(null);
    try {
      const token = localStorage.getItem('access_token');
      if (formData.id) {
        await axios.patch(`${API_URL}/departments/${formData.id}`, formData, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post(`${API_URL}/departments`, formData, { headers: { Authorization: `Bearer ${token}` } });
      }
      setStatus({ type: 'success', message: 'Estructura actualizada correctamente.' });
      fetchData();
      setTimeout(() => setIsModalOpen(false), 1000);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Error al procesar la solicitud.';
      setStatus({ type: 'error', message: Array.isArray(msg) ? msg[0] : msg });
    } finally {
      setIsSaving(false);
    }
  };

  const openEdit = (dept: any) => {
    setFormData({
      id: dept.id,
      name: dept.name,
      code: dept.code,
      description: dept.description || '',
      parentId: dept.parentId || '',
      headId: dept.headId || '',
      color: dept.color || '#6366f1'
    });
    setIsModalOpen(true);
    setStatus(null);
  };

  const openCreate = () => {
    setFormData({ id: '', name: '', code: '', description: '', parentId: '', headId: '', color: '#6366f1' });
    setIsModalOpen(true);
    setStatus(null);
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Building2 className="text-primary w-7 h-7" /> Estructura Organizacional
          </h1>
          <p className="text-sm text-slate-400 font-medium">Gestiona departamentos, jerarquías y líderes de área.</p>
        </div>
        <button onClick={openCreate} className="btn-primary px-6 py-3 shadow-xl flex items-center gap-2">
          <Plus className="w-5 h-5" /> Nuevo Departamento
        </button>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={<Building2 />} label="Departamentos" value={departments.length} color="text-primary" />
        <StatCard icon={<Users />} label="Total Personal" value={employees.length} color="text-teal-500" />
        <StatCard icon={<GitBranch />} label="Niveles Jerárquicos" value={3} color="text-amber-500" />
      </div>

      {/* Departments Table */}
      <div className="card-premium bg-white p-2">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-50 bg-slate-50/50">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Departamento</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Código</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Líder / Manager</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Personal</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-primary" /></td></tr>
            ) : departments.map((dept) => (
              <tr key={dept.id} className="hover:bg-slate-50/50 transition-all group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-10 rounded-full" style={{ backgroundColor: dept.color }}></div>
                    <div>
                      <p className="font-bold text-slate-800">{dept.name}</p>
                      {dept.parentId && <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Sub-depto de {departments.find(d => d.id === dept.parentId)?.name}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 text-xs font-black text-slate-400">{dept.code}</td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-primary/5 text-primary flex items-center justify-center"><User className="w-3 h-3" /></div>
                    <p className="text-xs font-bold text-slate-600">
                      {employees.find(e => e.id === dept.headId) ? `${employees.find(e => e.id === dept.headId).firstName} ${employees.find(e => e.id === dept.headId).lastName}` : 'Sin Manager'}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black">{dept._count?.employees || 0} Empleados</span>
                </td>
                <td className="px-6 py-5 text-right">
                  <button onClick={() => openEdit(dept)} className="p-2 text-slate-400 hover:text-primary transition-colors hover:bg-primary/5 rounded-xl"><Edit3 className="w-5 h-5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden border border-white/20">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">{formData.id ? 'Editar Departamento' : 'Crear Departamento'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2"><FormField label="Nombre del Departamento" value={formData.name} onChange={(val:string) => setFormData({...formData, name: val})} required /></div>
                <FormField label="Código (ID)" value={formData.code} onChange={(val:string) => setFormData({...formData, code: val})} required placeholder="Ej. IT-01" />
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Color de Marca</label>
                  <input type="color" value={formData.color} onChange={(e) => setFormData({...formData, color: e.target.value})} className="w-full h-11 rounded-xl cursor-pointer bg-white border border-slate-200 p-1" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Departamento Padre (Jerarquía)</label>
                  <select value={formData.parentId} onChange={(e) => setFormData({...formData, parentId: e.target.value})} className="w-full h-11 bg-slate-50 border-slate-100 rounded-xl px-4 text-xs font-bold">
                    <option value="">Ninguno (Departamento Raíz)</option>
                    {departments.filter(d => d.id !== formData.id).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gerente / Líder de Área</label>
                  <select value={formData.headId} onChange={(e) => setFormData({...formData, headId: e.target.value})} className="w-full h-11 bg-slate-50 border-slate-100 rounded-xl px-4 text-xs font-bold">
                    <option value="">Sin Asignar</option>
                    {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                  </select>
                  <p className="text-[9px] text-slate-400 font-bold px-1">* Un empleado solo puede ser líder de un departamento.</p>
                </div>
              </div>

              {status && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-bottom-2 ${status.type === 'success' ? 'bg-teal-50 text-teal-600 border border-teal-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                  {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  <p className="text-sm font-bold">{status.message}</p>
                </div>
              )}

              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-slate-400 font-black text-xs uppercase tracking-widest">Cancelar</button>
                <button type="submit" disabled={isSaving} className="flex-[2] btn-primary py-4 shadow-xl flex items-center justify-center gap-2">
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  {formData.id ? 'Actualizar' : 'Crear Departamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }: any) {
  return (
    <div className="card-premium bg-white p-6 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center ${color}`}>{icon}</div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-black text-slate-800 tracking-tight">{value}</p>
      </div>
    </div>
  );
}

function FormField({ label, value, onChange, placeholder, required }: any) {
  return (
    <div className="space-y-1">
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label} {required && '*'}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} required={required} className="input-modern w-full h-11 bg-slate-50/50 border-slate-100 focus:bg-white text-xs font-bold" placeholder={placeholder} />
    </div>
  );
}

function User({ className }: any) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>; }
function X({ className }: any) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>; }
function Save({ className }: any) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>; }
