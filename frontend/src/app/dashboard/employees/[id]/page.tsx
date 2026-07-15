"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { 
  ArrowLeft, Mail, Phone, MapPin, Briefcase, 
  Calendar, Building2, FileText, User, 
  History, CreditCard, ShieldAlert, Trash2, 
  Download, Loader2, CheckCircle2, X, Plus, Clock, 
  DollarSign, FileCheck
} from 'lucide-react';
import UploadDocumentModal from '@/components/employees/UploadDocumentModal';
import { getAvatarUrl } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

type Tab = 'GENERAL' | 'DOCUMENTS' | 'HISTORY' | 'ATTENDANCE' | 'PAYROLL';

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('GENERAL');
  const [employee, setEmployee] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [docs, setDocs] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [payroll, setPayroll] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const [empRes, histRes, docsRes, attRes, payRes] = await Promise.all([
        axios.get(`${API_URL}/employees/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/employees/${id}/history`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/employees/${id}/documents`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/attendance`, { 
          headers: { Authorization: `Bearer ${token}` },
          params: { employeeId: id, limit: 10 }
        }),
        axios.get(`${API_URL}/payroll/history`, { 
          headers: { Authorization: `Bearer ${token}` },
          params: { employeeId: id }
        })
      ]);
      setEmployee(empRes.data.data);
      setHistory(histRes.data.data || []);
      setDocs(docsRes.data.data || []);
      setAttendance(attRes.data.data || []);
      setPayroll(payRes.data.data || []);
    } catch (error) {
      console.error("Error fetching detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteDoc = async (docId: string) => {
    if (!confirm('Â¿EstÃ¡s seguro de eliminar este documento?')) return;
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`${API_URL}/employees/documents/${docId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (error) {
      alert('Error al eliminar documento');
    }
  };

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-12 h-12 animate-spin text-primary" />
      <p className="text-xs font-black uppercase tracking-widest text-slate-400">Cargando expediente...</p>
    </div>
  );
  
  if (!employee) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
      <ShieldAlert className="w-12 h-12 text-red-500" />
      <p className="text-sm font-bold text-slate-800">No se pudo cargar el expediente</p>
      <button onClick={fetchData} className="btn-primary px-6 py-2">Reintentar</button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      {/* Header Profile Card */}
      <div className="card-premium bg-white p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        
        <div className="flex flex-col md:flex-row items-center gap-8 relative">
          <div className="w-32 h-32 rounded-3xl bg-slate-100 border-4 border-white shadow-2xl overflow-hidden flex-shrink-0">
            {employee.avatarUrl ? (
              <img src={getAvatarUrl(employee.avatarUrl) || ''} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-black text-primary bg-primary/5 uppercase">
                {employee.firstName?.[0]}{employee.lastName?.[0]}
              </div>
            )}
          </div>

          <div className="text-center md:text-left space-y-2 flex-1">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              {employee.firstName} {employee.lastName}
            </h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm font-bold text-slate-500">
              <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {employee.jobTitle}</span>
              <span className="flex items-center gap-1"><Building2 className="w-4 h-4" /> {employee.department?.name || 'Sin Depto'}</span>
              <span className="px-3 py-1 bg-teal-50 text-teal-600 rounded-full text-[10px] font-black uppercase tracking-widest">{employee.employmentStatus}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => router.back()} className="p-3 text-slate-400 hover:text-primary transition-colors"><ArrowLeft className="w-6 h-6" /></button>
            <button 
              onClick={() => router.push(`/dashboard/offboarding?employeeId=${id}`)} 
              className="px-6 py-3 bg-red-50 text-red-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all border border-red-100"
            >
              Iniciar Salida
            </button>
            <button onClick={() => router.push(`/dashboard/employees/edit/${id}`)} className="btn-primary px-6 py-3 shadow-xl">Editar Perfil</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-100 pb-2 overflow-x-auto no-scrollbar">
        {(['GENERAL', 'DOCUMENTS', 'ATTENDANCE', 'PAYROLL', 'HISTORY'] as Tab[]).map((tab) => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {tab === 'GENERAL' ? 'InformaciÃ³n' : 
             tab === 'DOCUMENTS' ? 'Expediente' : 
             tab === 'ATTENDANCE' ? 'Asistencia' :
             tab === 'PAYROLL' ? 'NÃ³mina' : 'Historial'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {activeTab === 'GENERAL' && (
          <>
            <div className="lg:col-span-2 space-y-8">
              {/* Personal Section */}
              <Section icon={<User />} title="Datos Personales">
                <div className="grid grid-cols-2 gap-6">
                  <InfoItem label="Email Corporativo" value={employee.user?.email} />
                  <InfoItem label="Email Personal" value={employee.personalEmail} />
                  <InfoItem label="TelÃ©fono" value={employee.personalPhone} />
                  <InfoItem label="GÃ©nero" value={employee.gender} />
                  <InfoItem label="PaÃ­s" value={employee.country} />
                  <InfoItem label="Ciudad" value={employee.city} />
                  <div className="col-span-2"><InfoItem label="DirecciÃ³n" value={employee.addressLine1} /></div>
                </div>
              </Section>

              {/* Bank Info Section */}
              <Section icon={<CreditCard className="text-amber-500" />} title="InformaciÃ³n Bancaria (NÃ³mina)">
                <div className="grid grid-cols-2 gap-6">
                  <InfoItem label="Banco" value={employee.bankName || 'No especificado'} />
                  <InfoItem label="Nro de Cuenta" value={employee.bankAccountNumber || 'No especificado'} />
                  <InfoItem label="RIF / Tax ID" value={employee.taxId || 'No especificado'} />
                  <InfoItem label="Salario Base" value={`$${employee.baseSalary}`} />
                </div>
              </Section>
            </div>

            <div className="space-y-8">
              {/* Emergency Contact */}
              <Section icon={<ShieldAlert className="text-red-500" />} title="Emergencias">
                <div className="space-y-4">
                  <div className="p-4 bg-red-50/50 rounded-2xl border border-red-100">
                    <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Contacto</p>
                    <p className="font-bold text-red-700">{employee.emergencyName || 'Sin asignar'}</p>
                    <p className="text-xs text-red-600 mt-1">{employee.emergencyRelation}</p>
                    <p className="text-xs font-black text-red-700 mt-2 flex items-center gap-2"><Phone className="w-3 h-3" /> {employee.emergencyPhone}</p>
                  </div>
                </div>
              </Section>

              {/* Work Details */}
              <Section icon={<Briefcase className="text-primary" />} title="RelaciÃ³n Laboral">
                <div className="space-y-4">
                  <InfoItem label="Fecha de Ingreso" value={new Date(employee.hireDate).toLocaleDateString()} />
                  <InfoItem label="Tipo de Contrato" value={employee.employmentType} />
                  <InfoItem label="Manager" value={employee.manager ? `${employee.manager.firstName} ${employee.manager.lastName}` : 'Directo'} />
                </div>
              </Section>
            </div>
          </>
        )}

        {activeTab === 'DOCUMENTS' && (
          <div className="lg:col-span-3 card-premium bg-white p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-50 pb-4">
              <h3 className="font-black text-xs uppercase tracking-widest text-slate-400">Expediente Digital</h3>
              <button 
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm"
              >
                <Plus className="w-3 h-3" /> Subir Documento
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {docs.length === 0 ? (
                <p className="col-span-full text-center py-20 text-slate-400 font-bold">No hay documentos en el expediente.</p>
              ) : docs.map((doc) => (
                <div key={doc.id} className="p-4 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between group hover:border-primary transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-primary"><FileText className="w-5 h-5" /></div>
                    <div>
                      <p className="text-xs font-bold text-slate-700 truncate max-w-[150px]">{doc.name}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase">{doc.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <a href={doc.fileUrl} target="_blank" className="p-2 text-slate-400 hover:text-primary"><Download className="w-4 h-4" /></a>
                    <button onClick={() => deleteDoc(doc.id)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'HISTORY' && (
          <div className="lg:col-span-3 card-premium bg-white p-8 space-y-6">
            <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 border-b border-slate-50 pb-4">Historial de AuditorÃ­a</h3>
            <div className="space-y-4">
              {history.length === 0 ? (
                <p className="text-center py-20 text-slate-400 font-bold">Sin registros de cambios.</p>
              ) : history.map((log: any) => (
                <div key={log.id} className="flex gap-4 p-4 border-l-4 border-primary bg-slate-50/50 rounded-r-2xl">
                  <div className="p-2 bg-white rounded-xl h-fit border border-slate-100 text-primary"><History className="w-4 h-4" /></div>
                  <div className="space-y-1 flex-1">
                    <div className="flex justify-between">
                      <p className="text-xs font-bold text-slate-800">{log.description}</p>
                      <span className="text-[10px] font-bold text-slate-400">{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium">Realizado por: <span className="font-bold text-primary">{log.user?.email || 'Sistema'}</span></p>
                    {log.newValues && Object.keys(log.newValues).length > 0 && (
                      <div className="mt-2 text-[9px] bg-white p-2 rounded-lg border border-slate-100 font-mono text-slate-400">
                        Cambios detectados: {Object.keys(log.newValues).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'ATTENDANCE' && (
          <div className="lg:col-span-3 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card-premium p-6 bg-primary text-white text-center">
                <p className="text-[10px] font-black uppercase opacity-60">Asistencia Total</p>
                <p className="text-3xl font-black">{attendance.length}</p>
              </div>
              <div className="card-premium p-6 bg-white text-center">
                <p className="text-[10px] font-black uppercase text-slate-400">Promedio Check-In</p>
                <p className="text-3xl font-black text-slate-800">08:45 AM</p>
              </div>
              <div className="card-premium p-6 bg-white text-center border-2 border-primary/20">
                <p className="text-[10px] font-black uppercase text-primary">Estatus Actual</p>
                <p className="text-xl font-black text-slate-800">PRESENTE</p>
              </div>
            </div>
            
            <div className="card-premium bg-white p-8">
              <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 border-b border-slate-50 pb-4">Ãšltimos Registros</h3>
              <div className="space-y-3 mt-6">
                {attendance.length === 0 ? (
                  <p className="text-center py-10 text-slate-400 font-bold">No hay registros de asistencia.</p>
                ) : attendance.map((att) => (
                  <div key={att.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-white rounded-xl text-primary shadow-sm"><Clock className="w-5 h-5" /></div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{new Date(att.date).toLocaleDateString()}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase">{att.status}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-slate-700">{att.checkIn ? new Date(att.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'} â†’ {att.checkOut ? new Date(att.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'PAYROLL' && (
          <div className="lg:col-span-3 space-y-8">
            <div className="card-premium bg-white p-8">
              <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 border-b border-slate-50 pb-4">HistÃ³rico de Pagos</h3>
              <div className="space-y-4 mt-6">
                {payroll.length === 0 ? (
                  <p className="text-center py-20 text-slate-400 font-bold">No se han generado recibos de nÃ³mina para este empleado.</p>
                ) : payroll.map((pay) => (
                  <div key={pay.id} className="p-6 bg-slate-50 rounded-[24px] border border-slate-100 flex items-center justify-between group hover:border-primary transition-all">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-2xl text-emerald-500 shadow-sm"><DollarSign className="w-6 h-6" /></div>
                      <div>
                        <p className="text-sm font-black text-slate-800">{pay.payrollPeriod?.name || pay.payroll?.notes || 'Pago Ordinario'}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{pay.payroll?.status || 'PAID'} â€¢ {new Date(pay.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-lg font-black text-emerald-600">${pay.netPay || pay.netSalary}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Neto a Recibir</p>
                      </div>
                      <button className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-primary hover:border-primary transition-all shadow-sm">
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      <UploadDocumentModal 
        employeeId={id as string} 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
}

function Section({ icon, title, children }: any) {
  return (
    <div className="card-premium bg-white p-8 space-y-6">
      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-50 pb-4">
        <span className="p-1.5 bg-slate-50 rounded-lg">{icon}</span> {title}
      </h3>
      {children}
    </div>
  );
}

function InfoItem({ label, value }: any) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-sm font-bold text-slate-800">{value || '---'}</p>
    </div>
  );
}