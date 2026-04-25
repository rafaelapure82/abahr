"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { 
  Mail, Phone, Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight,
  MoreHorizontal, Eye, Trash2, CheckCircle2, Circle,
  User as UserIcon, Globe, Briefcase, QrCode as QrIcon, Printer, Download
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export default function ProfilePage() {
  const { user } = useAuth();
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.employee?.id) {
      fetchEmployee();
    }
  }, [user]);

  const fetchEmployee = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.get(`${API_URL}/employees/${user?.employee?.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployee(res.data);
    } catch (err) {
      console.error("Error fetching employee profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const identityValue = employee.taxId || employee.employeeCode;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Carnet de Identificación - ${employee.firstName}</title>
          <style>
            body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
            .card { border: 2px solid #e2e8f0; border-radius: 20px; padding: 40px; text-align: center; width: 300px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
            .logo { font-weight: bold; font-size: 20px; margin-bottom: 20px; color: #2563eb; }
            .qr-container { margin: 20px 0; }
            .name { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
            .code { font-size: 14px; color: #64748b; font-family: monospace; letter-spacing: 2px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="logo">ABA Talent HR</div>
            <div class="name">${employee.firstName} ${employee.lastName}</div>
            <div class="qr-container">
              <img src="${document.querySelector('canvas')?.toDataURL()}" width="200" height="200" />
            </div>
            <div class="code">${identityValue}</div>
            <div style="margin-top: 20px; font-size: 10px; color: #94a3b8;">ID Oficial de Empleado</div>
          </div>
          <script>
            window.onload = () => { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownload = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `QR_${employee.employeeCode}.png`;
    link.href = url;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-20">
        <UserIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-800">No se encontró información del perfil</h2>
      </div>
    );
  }

  const identityValue = employee.taxId || employee.employeeCode;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">Mi Perfil</h1>
        <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
          <span>{new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* User Hero Card */}
          <div className="card-premium p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full translate-x-16 -translate-y-16"></div>
            
            <div className="relative z-10">
              <div className="w-40 h-40 rounded-full border-4 border-primary/20 p-1">
                <div className="w-full h-full rounded-full bg-slate-200 overflow-hidden flex items-center justify-center">
                  {employee.avatarUrl ? (
                    <img src={employee.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-16 h-16 text-slate-400" />
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 text-center md:text-left space-y-4 z-10">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">
                  {employee.firstName} {employee.lastName}
                  <span className={`ml-3 text-[10px] px-2 py-1 rounded-full uppercase font-black ${employee.employmentStatus === 'ACTIVE' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                    {employee.employmentStatus}
                  </span>
                </h2>
                <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-sm text-slate-500">
                  <p>Código: <span className="text-slate-900 font-semibold">{employee.employeeCode}</span></p>
                  <p>Posición: <span className="text-slate-900 font-semibold">{employee.jobTitle}</span></p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="p-2 bg-slate-100 rounded-lg"><Mail className="w-4 h-4 text-primary" /></div>
                  <span>{employee.user?.email || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="p-2 bg-slate-100 rounded-lg"><Phone className="w-4 h-4 text-primary" /></div>
                  <span>{employee.personalPhone || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card-premium p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                Información Laboral
              </h3>
              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                <InfoItem label="Fecha Contratación" value={new Date(employee.hireDate).toLocaleDateString()} highlight />
                <InfoItem label="Departamento" value={employee.department?.name || 'N/A'} highlight />
                <InfoItem label="Tipo de Contrato" value={employee.employmentType} />
                <InfoItem label="ID Fiscal / Cédula" value={employee.taxId || 'N/A'} />
              </div>
            </div>

            <div className="card-premium p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Información de Contacto
              </h3>
              <div className="space-y-6">
                <InfoItem label="Correo Personal" value={employee.personalEmail || 'N/A'} />
                <InfoItem label="Dirección" value={employee.addressLine1 ? `${employee.addressLine1}, ${employee.city}` : 'N/A'} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - QR Code Section */}
        <div className="space-y-6">
          <div className="card-premium p-8 text-center flex flex-col items-center border-t-4 border-t-blue-500">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
              <QrIcon className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Mi Identificación QR</h3>
            <p className="text-sm text-slate-500 mb-6">Use este código para registrar su entrada y salida en la terminal principal.</p>
            
            <div className="bg-white p-4 rounded-3xl shadow-xl border border-slate-100 mb-6">
              <QRCodeCanvas 
                id="qr-code-canvas"
                value={identityValue} 
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>
            
            <div className="text-2xl font-black tracking-[0.3em] text-slate-800 mb-6">
              {identityValue}
            </div>

            <div className="grid grid-cols-2 gap-3 w-full">
              <button 
                onClick={handlePrint}
                className="flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all"
              >
                <Printer className="w-4 h-4" /> Imprimir
              </button>
              <button 
                onClick={handleDownload}
                className="flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all"
              >
                <Download className="w-4 h-4" /> Descargar
              </button>
            </div>
          </div>

          <div className="card-premium p-6">
            <h4 className="font-bold text-slate-800 mb-4">Horario Sugerido</h4>
            <div className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
              <Clock className="w-8 h-8 text-amber-500" />
              <div>
                <p className="text-sm font-bold text-amber-900">09:00 AM - 06:00 PM</p>
                <p className="text-xs text-amber-700">Lunes a Viernes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value, highlight = false }: { label: string, value: string, highlight?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
      <p className={`text-sm font-bold ${highlight ? 'text-primary' : 'text-slate-800'}`}>
        {value}
      </p>
    </div>
  );
}
