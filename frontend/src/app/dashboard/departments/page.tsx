"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Building2, Plus, Search, MoreHorizontal, 
  ChevronRight, Users, Briefcase, MapPin, 
  Edit3, Trash2, Loader2, AlertCircle, CheckCircle2,
  GitBranch, X, Save, Trash, DollarSign, History, 
  GitPullRequest, TrendingUp, Filter, ArrowRight
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export default function DepartmentsPage() {
  const [activeTab, setActiveTab] = useState<'depts' | 'positions' | 'locations' | 'chart' | 'history' | 'bulk'>('depts');
  const [departments, setDepartments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [deptHistory, setDeptHistory] = useState<any[]>([]);
  const [orgTree, setOrgTree] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const [formData, setFormData] = useState<any>({
    id: '',
    name: '',
    code: '',
    description: '',
    parentId: '',
    headId: '',
    color: '#6366f1',
    budget: 0,
    costCenter: '',
    // Position extra fields
    title: '',
    departmentId: '',
    level: 1,
    minSalary: 0,
    maxSalary: 0,
    targetCount: 1,
    // Location extra fields
    address: '',
    city: '',
    country: 'US',
    timeZone: 'UTC'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [deptRes, empRes, posRes, locRes, treeRes] = await Promise.all([
        axios.get(`${API_URL}/departments`, { headers }),
        axios.get(`${API_URL}/employees`, { headers }),
        axios.get(`${API_URL}/departments/positions/all`, { headers }),
        axios.get(`${API_URL}/departments/locations/all`, { headers }),
        axios.get(`${API_URL}/departments/tree`, { headers })
      ]);
      
      setDepartments(deptRes.data.data?.data || deptRes.data.data || []);
      setEmployees(empRes.data.data?.data || empRes.data.data || []);
      setPositions(posRes.data.data || posRes.data || []);
      setLocations(locRes.data.data || locRes.data || []);
      setOrgTree(treeRes.data.data || treeRes.data || []);
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
      const headers = { Authorization: `Bearer ${token}` };
      
      let endpoint = '';
      if (activeTab === 'depts') endpoint = '/departments';
      else if (activeTab === 'positions') endpoint = '/departments/positions';
      else if (activeTab === 'locations') endpoint = '/departments/locations';

      if (formData.id) {
        await axios.patch(`${API_URL}${endpoint}/${formData.id}`, formData, { headers });
      } else {
        await axios.post(`${API_URL}${endpoint}`, formData, { headers });
      }
      
      setStatus({ type: 'success', message: 'Información actualizada correctamente.' });
      fetchData();
      setTimeout(() => setIsModalOpen(false), 1000);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Error al procesar la solicitud.';
      setStatus({ type: 'error', message: Array.isArray(msg) ? msg[0] : msg });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este registro? Esta acción no se puede deshacer.')) return;
    
    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };
      
      let endpoint = '';
      if (activeTab === 'depts') endpoint = '/departments';
      // Note: Positions and Locations might need their own delete endpoints in backend if not already present
      // For now we implement depts delete which we verified in backend
      
      await axios.delete(`${API_URL}${endpoint}/${id}`, { headers });
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al eliminar');
    }
  };

  const openEdit = (item: any) => {
    setFormData({
      ...item,
      description: item.description || '',
      parentId: item.parentId || '',
      headId: item.headId || '',
      color: item.color || '#6366f1',
      departmentId: item.departmentId || '',
      level: item.level || 1,
    });
    setIsModalOpen(true);
    setStatus(null);
  };

  const openCreate = () => {
    setFormData({ 
      id: '', name: '', code: '', description: '', parentId: '', headId: '', color: '#6366f1',
      title: '', departmentId: '', level: 1, minSalary: 0, maxSalary: 0,
      address: '', city: '', country: 'US', timeZone: 'UTC'
    });
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
        <button onClick={openCreate} className="btn-primary px-6 py-3 shadow-xl flex items-center gap-2 transition-transform hover:scale-105 active:scale-95">
          <Plus className="w-5 h-5" /> 
          {activeTab === 'depts' ? 'Nuevo Departamento' : activeTab === 'positions' ? 'Nuevo Cargo' : 'Nueva Sede'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit border border-slate-200/50 shadow-inner">
        <TabButton active={activeTab === 'depts'} onClick={() => setActiveTab('depts')} icon={<Building2 className="w-4 h-4" />} label="Departamentos" />
        <TabButton active={activeTab === 'positions'} onClick={() => setActiveTab('positions')} icon={<Briefcase className="w-4 h-4" />} label="Cargos" />
        <TabButton active={activeTab === 'locations'} onClick={() => setActiveTab('locations')} icon={<MapPin className="w-4 h-4" />} label="Sedes" />
        <div className="w-[1px] h-6 bg-slate-200 mx-1 self-center" />
        <TabButton active={activeTab === 'chart'} onClick={() => setActiveTab('chart')} icon={<GitBranch className="w-4 h-4" />} label="Organigrama" />
        <TabButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<History className="w-4 h-4" />} label="Historial" />
        <TabButton active={activeTab === 'bulk'} onClick={() => setActiveTab('bulk')} icon={<GitPullRequest className="w-4 h-4" />} label="Traslados" />
      </div>

      {/* Stats Quick View (Contextual to active tab) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={<Building2 />} label="Departamentos" value={departments.length} color="text-primary" />
        <StatCard icon={<Briefcase />} label="Cargos Totales" value={positions.length} color="text-amber-500" />
        <StatCard icon={<Users />} label="Total Personal" value={employees.length} color="text-teal-500" />
      </div>

      {/* Main Content Area */}
      <div className="card-premium bg-white p-2 min-h-[400px]">
        {loading ? (
          <div className="py-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-primary" /></div>
        ) : (
          <>
            {activeTab === 'depts' && <DepartmentsTable departments={departments} employees={employees} onEdit={openEdit} onDelete={handleDelete} />}
            {activeTab === 'positions' && <PositionsTable positions={positions} departments={departments} employees={employees} onEdit={openEdit} onDelete={handleDelete} />}
            {activeTab === 'locations' && <LocationsTable locations={locations} onEdit={openEdit} onDelete={handleDelete} />}
            {activeTab === 'chart' && <OrgChart tree={orgTree} />}
            {activeTab === 'history' && <HistoryView departments={departments} />}
            {activeTab === 'bulk' && <BulkMoveTool employees={employees} departments={departments} positions={positions} onComplete={fetchData} />}
          </>
        )}
      </div>

      {/* Unified Edit/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden border border-white/20">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                {formData.id ? 'Editar' : 'Crear'} {activeTab === 'depts' ? 'Departamento' : activeTab === 'positions' ? 'Cargo' : 'Sede'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {activeTab === 'depts' && (
                <>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2"><FormField label="Nombre del Departamento" value={formData.name} onChange={(val:string) => setFormData({...formData, name: val})} required /></div>
                    <FormField label="Código (ID)" value={formData.code} onChange={(val:string) => setFormData({...formData, code: val})} required placeholder="Ej. IT-01" />
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Color de Marca</label>
                      <input type="color" value={formData.color} onChange={(e) => setFormData({...formData, color: e.target.value})} className="w-full h-11 rounded-xl cursor-pointer bg-white border border-slate-200 p-1" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <FormField label="Presupuesto Anual" type="number" value={formData.budget} onChange={(val:any) => setFormData({...formData, budget: parseFloat(val)})} />
                    <FormField label="Centro de Costos" value={formData.costCenter} onChange={(val:string) => setFormData({...formData, costCenter: val})} placeholder="Ej. CC-001" />
                  </div>
                  <div className="space-y-4">
                    <FormSelect label="Departamento Padre" value={formData.parentId} onChange={(val) => setFormData({...formData, parentId: val})} options={departments.filter(d => d.id !== formData.id).map(d => ({ label: d.name, value: d.id }))} emptyLabel="Ninguno (Raíz)" />
                    <FormSelect label="Gerente / Líder de Área" value={formData.headId} onChange={(val) => setFormData({...formData, headId: val})} options={employees.map(e => ({ label: `${e.firstName} ${e.lastName}`, value: e.id }))} emptyLabel="Sin Asignar" />
                  </div>
                </>
              )}

              {activeTab === 'positions' && (
                <>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2"><FormField label="Título del Cargo" value={formData.title} onChange={(val:string) => setFormData({...formData, title: val})} required /></div>
                    <FormField label="Código de Cargo" value={formData.code} onChange={(val:string) => setFormData({...formData, code: val})} required placeholder="Ej. DEV-01" />
                    <FormField label="Nivel de Seniority (1-10)" type="number" value={formData.level} onChange={(val:any) => setFormData({...formData, level: parseInt(val)})} required />
                    <FormField label="Target Headcount (Plazas)" type="number" value={formData.targetCount} onChange={(val:any) => setFormData({...formData, targetCount: parseInt(val)})} required />
                  </div>
                  <FormSelect label="Asignar a Departamento" value={formData.departmentId} onChange={(val) => setFormData({...formData, departmentId: val})} options={departments.map(d => ({ label: d.name, value: d.id }))} required />
                </>
              )}

              {activeTab === 'locations' && (
                <>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2"><FormField label="Nombre de la Sede" value={formData.name} onChange={(val:string) => setFormData({...formData, name: val})} required /></div>
                    <FormField label="Código Postal/Sede" value={formData.code} onChange={(val:string) => setFormData({...formData, code: val})} required />
                    <FormField label="Ciudad" value={formData.city} onChange={(val:string) => setFormData({...formData, city: val})} required />
                  </div>
                  <FormField label="Dirección Completa" value={formData.address} onChange={(val:string) => setFormData({...formData, address: val})} />
                </>
              )}

              {status && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-bottom-2 ${status.type === 'success' ? 'bg-teal-50 text-teal-600 border border-teal-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                  {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  <p className="text-sm font-bold">{status.message}</p>
                </div>
              )}

              <div className="pt-4 flex gap-4">
                {formData.id && (
                  <button type="button" onClick={() => handleDelete(formData.id)} className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-colors"><Trash2 className="w-5 h-5" /></button>
                )}
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-slate-600">Cancelar</button>
                <button type="submit" disabled={isSaving} className="flex-[2] btn-primary py-4 shadow-xl flex items-center justify-center gap-2">
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  {formData.id ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components for Tables ───────────────────────────────────────────────

function DepartmentsTable({ departments, employees, onEdit, onDelete }: any) {
  return (
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
        {departments.map((dept: any) => (
          <tr key={dept.id} className="hover:bg-slate-50/50 transition-all group">
            <td className="px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="w-3 h-10 rounded-full" style={{ backgroundColor: dept.color }}></div>
                <div>
                  <p className="font-bold text-slate-800">{dept.name}</p>
                  {dept.parentId && (
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter flex items-center gap-1">
                      <ChevronRight className="w-2 h-2" /> Sub-depto de {departments.find((d: any) => d.id === dept.parentId)?.name}
                    </p>
                  )}
                </div>
              </div>
            </td>
            <td className="px-6 py-5 text-xs font-black text-slate-400">{dept.code}</td>
            <td className="px-6 py-5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-primary/5 text-primary flex items-center justify-center">
                  <Users className="w-3 h-3" />
                </div>
                <p className="text-xs font-bold text-slate-600">
                  {employees.find((e: any) => e.id === dept.headId) 
                    ? `${employees.find((e: any) => e.id === dept.headId).firstName} ${employees.find((e: any) => e.id === dept.headId).lastName}` 
                    : 'Sin Manager'}
                </p>
              </div>
            </td>
            <td className="px-6 py-5">
              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black">
                {dept._count?.employees || 0} Empleados
              </span>
            </td>
            <td className="px-6 py-5 text-right">
              <div className="flex justify-end gap-2">
                <button onClick={() => onEdit(dept)} className="p-2 text-slate-400 hover:text-primary transition-colors hover:bg-primary/5 rounded-xl"><Edit3 className="w-4 h-4" /></button>
                <button onClick={() => onDelete(dept.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PositionsTable({ positions, departments, employees, onEdit, onDelete }: any) {
  return (
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-slate-50 bg-slate-50/50">
          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cargo / Puesto</th>
          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Departamento</th>
          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Nivel</th>
          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Headcount</th>
          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        {positions.map((pos: any) => {
          const currentCount = employees.filter((e: any) => e.positionId === pos.id).length;
          const isOverLimit = currentCount > (pos.targetCount || 1);
          const isUnderLimit = currentCount < (pos.targetCount || 1);

          return (
            <tr key={pos.id} className="hover:bg-slate-50/50 transition-all group">
              <td className="px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{pos.title}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase">{pos.code}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: departments.find((d: any) => d.id === pos.departmentId)?.color || '#ccc' }}></div>
                  <p className="text-xs font-bold text-slate-600">{pos.department?.name || departments.find((d: any) => d.id === pos.departmentId)?.name || 'Sin Asignar'}</p>
                </div>
              </td>
              <td className="px-6 py-5 text-center">
                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black">Lvl {pos.level}</span>
              </td>
              <td className="px-6 py-5 text-center">
                <div className="flex flex-col items-center">
                  <span className={`text-xs font-black ${isOverLimit ? 'text-red-500' : isUnderLimit ? 'text-amber-500' : 'text-teal-500'}`}>
                    {currentCount} / {pos.targetCount || 1}
                  </span>
                  <div className="w-12 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                    <div 
                      className={`h-full ${isOverLimit ? 'bg-red-500' : isUnderLimit ? 'bg-amber-500' : 'bg-teal-500'}`} 
                      style={{ width: `${Math.min(100, (currentCount / (pos.targetCount || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              </td>
              <td className="px-6 py-5 text-right">
                <div className="flex justify-end gap-2">
                  <button onClick={() => onEdit(pos)} className="p-2 text-slate-400 hover:text-primary transition-colors hover:bg-primary/5 rounded-xl"><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => onDelete(pos.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function LocationsTable({ locations, onEdit, onDelete }: any) {
  return (
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-slate-50 bg-slate-50/50">
          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre Sede</th>
          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ubicación</th>
          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        {locations.map((loc: any) => (
          <tr key={loc.id} className="hover:bg-slate-50/50 transition-all group">
            <td className="px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">{loc.name}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase">{loc.code}</p>
                </div>
              </div>
            </td>
            <td className="px-6 py-5">
              <p className="text-xs font-bold text-slate-600">{loc.city}, {loc.country}</p>
              <p className="text-[10px] text-slate-400 font-medium">{loc.address}</p>
            </td>
            <td className="px-6 py-5 text-right">
              <div className="flex justify-end gap-2">
                <button onClick={() => onEdit(loc)} className="p-2 text-slate-400 hover:text-primary transition-colors hover:bg-primary/5 rounded-xl"><Edit3 className="w-4 h-4" /></button>
                <button onClick={() => onDelete(loc.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── UI UI Helpers ────────────────────────────────────────────────────────────

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all duration-300 ${active ? 'bg-white text-primary shadow-sm ring-1 ring-slate-200' : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'}`}
    >
      {icon} {label}
    </button>
  );
}

function StatCard({ icon, label, value, color }: any) {
  return (
    <div className="card-premium bg-white p-6 flex items-center gap-4 transition-transform hover:translate-y-[-2px]">
      <div className={`w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center ${color}`}>{icon}</div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-black text-slate-800 tracking-tight">{value}</p>
      </div>
    </div>
  );
}

function FormField({ label, value, onChange, placeholder, required, type = "text" }: any) {
  return (
    <div className="space-y-1">
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label} {required && '*'}</label>
      <input 
        type={type} 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        required={required} 
        className="input-modern w-full h-11 bg-slate-50/50 border-slate-100 focus:bg-white text-xs font-bold" 
        placeholder={placeholder} 
      />
    </div>
  );
}

function FormSelect({ label, value, onChange, options, required, emptyLabel = "Seleccionar..." }: any) {
  return (
    <div className="space-y-1">
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label} {required && '*'}</label>
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        required={required}
        className="w-full h-11 bg-slate-50 border-slate-100 rounded-xl px-4 text-xs font-bold focus:bg-white focus:ring-2 ring-primary/20 transition-all"
      >
        <option value="">{emptyLabel}</option>
        {options.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  );
}

// ── NEW ADVANCED COMPONENTS ──────────────────────────────────────────────────

function OrgChart({ tree }: { tree: any[] }) {
  const renderNode = (node: any) => (
    <div key={node.id} className="flex flex-col items-center">
      <div className="p-4 bg-white rounded-2xl border-2 shadow-sm min-w-[200px] text-center mb-4 transition-all hover:shadow-lg hover:scale-105" style={{ borderColor: node.color || '#6366f1' }}>
        <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">{node.code}</p>
        <p className="font-bold text-slate-800">{node.name}</p>
        <div className="mt-2 flex justify-center gap-2">
          <span className="px-2 py-0.5 bg-slate-100 rounded-full text-[9px] font-black text-slate-500 uppercase">{node._count?.employees || 0} Empleados</span>
        </div>
      </div>
      {node.children && node.children.length > 0 && (
        <div className="flex gap-8 relative pt-4 border-t-2 border-slate-100">
          {node.children.map((child: any) => renderNode(child))}
        </div>
      )}
    </div>
  );

  return (
    <div className="overflow-auto p-12 bg-slate-50/50 rounded-3xl">
      <div className="flex justify-center min-w-max">
        {tree.map(renderNode)}
      </div>
    </div>
  );
}

function HistoryView({ departments }: { departments: any[] }) {
  const [selectedDept, setSelectedDept] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedDept) {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      axios.get(`${API_URL}/departments/${selectedDept}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => setHistory(res.data.data || []))
        .finally(() => setLoading(false));
    }
  }, [selectedDept]);

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-xs">
        <FormSelect 
          label="Seleccionar Departamento para ver Historial" 
          value={selectedDept} 
          onChange={setSelectedDept} 
          options={departments.map(d => ({ label: d.name, value: d.id }))} 
        />
      </div>

      {loading ? (
        <div className="py-10 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div>
      ) : selectedDept ? (
        <div className="space-y-4">
          {history.length === 0 ? (
            <div className="p-10 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-slate-400 font-bold">No hay cambios registrados para este departamento.</div>
          ) : (
            history.map((item: any) => (
              <div key={item.id} className="flex gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.action === 'BUDGET_UPDATE' ? 'bg-teal-50 text-teal-600' : 'bg-primary/5 text-primary'}`}>
                  {item.action === 'BUDGET_UPDATE' ? <DollarSign className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">{item.action.replace('_', ' ')}</p>
                    <p className="text-[10px] font-bold text-slate-400">{new Date(item.createdAt).toLocaleString()}</p>
                  </div>
                  <p className="text-sm font-bold text-slate-700 mt-1">
                    Cambio de {item.previousValue || 'N/A'} a <span className="text-primary">{item.newValue}</span>
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="p-10 text-center text-slate-300 font-black uppercase tracking-widest text-sm">Selecciona un departamento arriba para comenzar.</div>
      )}
    </div>
  );
}

function BulkMoveTool({ employees, departments, positions, onComplete }: any) {
  const [selectedEmps, setSelectedEmps] = useState<string[]>([]);
  const [moveData, setMoveData] = useState({
    newDeptId: '',
    newPositionId: '',
    newManagerId: '',
    reason: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const toggleEmp = (id: string) => {
    setSelectedEmps(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleMove = async () => {
    if (selectedEmps.length === 0 || !moveData.newDeptId) return;
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`${API_URL}/departments/bulk-move`, {
        employeeIds: selectedEmps,
        ...moveData
      }, { headers: { Authorization: `Bearer ${token}` } });
      alert('Traslado masivo completado con éxito.');
      setSelectedEmps([]);
      onComplete();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Error en traslado');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
      <div className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <Filter className="w-4 h-4" /> 1. Seleccionar Personal ({selectedEmps.length})
        </h3>
        <div className="max-h-[500px] overflow-auto space-y-2 pr-2">
          {employees.map((emp: any) => (
            <div 
              key={emp.id} 
              onClick={() => toggleEmp(emp.id)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${selectedEmps.includes(emp.id) ? 'bg-primary/5 border-primary shadow-sm' : 'bg-white border-slate-100 hover:border-primary/30'}`}
            >
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-[10px]">
                {emp.firstName[0]}{emp.lastName[0]}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">{emp.firstName} {emp.lastName}</p>
                <p className="text-[9px] font-black text-slate-400 uppercase">{emp.jobTitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <ArrowRight className="w-4 h-4" /> 2. Destino del Traslado
        </h3>
        
        <FormSelect label="Nuevo Departamento" value={moveData.newDeptId} onChange={(v) => setMoveData({...moveData, newDeptId: v})} options={departments.map(d => ({ label: d.name, value: d.id }))} />
        <FormSelect label="Nuevo Cargo (Opcional)" value={moveData.newPositionId} onChange={(v) => setMoveData({...moveData, newPositionId: v})} options={positions.filter(p => p.departmentId === moveData.newDeptId).map(p => ({ label: p.title, value: p.id }))} />
        <FormSelect label="Nuevo Reporte Directo (Opcional)" value={moveData.newManagerId} onChange={(v) => setMoveData({...moveData, newManagerId: v})} options={employees.filter(e => e.departmentId === moveData.newDeptId).map(e => ({ label: `${e.firstName} ${e.lastName}`, value: e.id }))} />
        <FormField label="Motivo del Traslado" value={moveData.reason} onChange={(v:string) => setMoveData({...moveData, reason: v})} placeholder="Ej. Reestructuración de Q2" />

        <button 
          onClick={handleMove}
          disabled={isProcessing || selectedEmps.length === 0 || !moveData.newDeptId}
          className="w-full btn-primary py-4 shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
        >
          {isProcessing ? <Loader2 className="animate-spin w-5 h-5" /> : <GitPullRequest className="w-5 h-5" />}
          Ejecutar Traslado Masivo
        </button>
      </div>
    </div>
  );
}
