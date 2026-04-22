import { Component, inject, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EmployeeService, Employee, Document, AttendanceSummary, LeaveSummary, PerformanceSummary, DocumentType, EmployeeHistory } from '../../../core/services/employee.service';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LucideAngularModule, Mail, Phone, MapPin, Briefcase, Calendar, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Upload, FileText, File, Image, X, Eye, Download, Trash2, Clock, User, Award, FileCheck, AlertCircle, CheckCircle, XCircle, LayoutDashboard, Users, Monitor, LayoutGrid, DollarSign, Settings, Bell, Search, Play, Pause, MoreVertical, Check } from 'lucide-angular';

@Component({
    selector: 'app-employee-detail',
    imports: [
        CommonModule,
        RouterLink,
        FormsModule,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardContentComponent,
        ButtonComponent,
        LucideAngularModule
    ],
    template: `
    <div class="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-indigo-500/30 overflow-x-hidden relative" *ngIf="employee">
      <!-- Background Decorations -->
      <div class="fixed inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div class="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-violet-600/20 rounded-full blur-[100px] animate-pulse" style="animation-delay: 2s"></div>
        <div class="absolute -bottom-[10%] left-[20%] w-[35%] h-[35%] bg-blue-600/10 rounded-full blur-[110px] animate-pulse" style="animation-delay: 4s"></div>
        <div class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      <div class="relative z-10 p-4 md:p-8 lg:p-12 max-w-[1600px] mx-auto">
        <!-- Header / Breadcrumbs -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 animate-fade-in">
          <div class="flex items-center gap-4">
            <button (click)="router.navigate(['/employees'])" class="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
              <lucide-icon name="chevron-left" size="20" class="group-hover:-translate-x-1 transition-transform"></lucide-icon>
            </button>
            <div>
              <h1 class="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                Perfil de Empleado
              </h1>
              <p class="text-slate-400 text-sm font-medium mt-1 flex items-center gap-2">
                ABA Talent <span class="opacity-30">/</span> Empleados <span class="opacity-30">/</span> {{ employee.firstName }} {{ employee.lastName }}
              </p>
            </div>
          </div>
          
          <div class="flex items-center gap-3">
            <button (click)="editEmployee()" class="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 active:scale-95">
              <lucide-icon name="file-text" size="18"></lucide-icon>
              Editar Perfil
            </button>
            <button class="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-red-400 hover:text-red-300">
              <lucide-icon name="trash-2" size="20"></lucide-icon>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <!-- LEFT COLUMN: Profile Summary -->
          <div class="lg:col-span-4 xl:col-span-3 space-y-8 animate-fade-in" style="animation-delay: 0.1s">
            <!-- Profile Card -->
            <div class="glass-container p-8 rounded-[40px] relative overflow-hidden group">
              <div class="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div class="relative flex flex-col items-center text-center">
                <!-- Avatar -->
                <div class="relative mb-6">
                  <div class="w-40 h-40 rounded-[48px] overflow-hidden border-4 border-white/10 shadow-2xl relative z-10">
                    <div *ngIf="!employee.avatarUrl" class="w-full h-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-5xl font-bold text-white">
                      {{ employee.firstName[0] }}{{ employee.lastName[0] }}
                    </div>
                    <img *ngIf="employee.avatarUrl" [src]="employee.avatarUrl" class="w-full h-full object-cover">
                  </div>
                  <!-- Status Indicator -->
                  <div class="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-[#0f172a] p-1.5 z-20 shadow-xl border border-white/10">
                    <div class="w-full h-full rounded-xl bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]"></div>
                  </div>
                </div>

                <h2 class="text-2xl font-bold text-white">{{ employee.firstName }} {{ employee.lastName }}</h2>
                <p class="text-indigo-400 font-semibold mt-1 tracking-wide">{{ employee.jobTitle }}</p>
                <div class="mt-4 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-slate-400">
                  ID: {{ employee.employeeCode }}
                </div>

                <!-- Basic Stats -->
                <div class="grid grid-cols-2 w-full gap-4 mt-8">
                  <div class="p-4 rounded-3xl bg-white/5 border border-white/10 text-left">
                    <p class="text-[10px] font-bold text-slate-500 uppercase">Salario Base</p>
                    <p class="text-lg font-bold text-white mt-1">{{ employee.baseSalary | currency }}</p>
                  </div>
                  <div class="p-4 rounded-3xl bg-white/5 border border-white/10 text-left">
                    <p class="text-[10px] font-bold text-slate-500 uppercase">Antigüedad</p>
                    <p class="text-lg font-bold text-white mt-1">2.4 Años</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Contact Info -->
            <div class="glass-container p-8 rounded-[40px] space-y-6">
              <h3 class="text-lg font-bold flex items-center gap-3">
                <lucide-icon name="phone" size="18" class="text-indigo-400"></lucide-icon>
                Contacto
              </h3>
              <div class="space-y-4">
                <div class="flex items-center gap-4 group">
                  <div class="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-indigo-600/20 group-hover:border-indigo-600/40 transition-all">
                    <lucide-icon name="mail" size="16" class="text-slate-400 group-hover:text-indigo-400"></lucide-icon>
                  </div>
                  <div class="overflow-hidden">
                    <p class="text-[10px] font-bold text-slate-500 uppercase">Email Corporativo</p>
                    <p class="text-sm font-medium truncate">{{ employee.workEmail || 'N/A' }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-4 group">
                  <div class="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-indigo-600/20 group-hover:border-indigo-600/40 transition-all">
                    <lucide-icon name="phone" size="16" class="text-slate-400 group-hover:text-indigo-400"></lucide-icon>
                  </div>
                  <div>
                    <p class="text-[10px] font-bold text-slate-500 uppercase">Teléfono</p>
                    <p class="text-sm font-medium">{{ employee.workPhone || 'N/A' }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-4 group">
                  <div class="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-indigo-600/20 group-hover:border-indigo-600/40 transition-all">
                    <lucide-icon name="map-pin" size="16" class="text-slate-400 group-hover:text-indigo-400"></lucide-icon>
                  </div>
                  <div>
                    <p class="text-[10px] font-bold text-slate-500 uppercase">Ubicación</p>
                    <p class="text-sm font-medium">{{ employee.location?.name || 'Oficina Central' }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- RIGHT COLUMN: Detailed Tabs -->
          <div class="lg:col-span-8 xl:col-span-9 space-y-8 animate-fade-in" style="animation-delay: 0.2s">
            
            <!-- Custom Tabs Navigation -->
            <div class="flex items-center bg-white/5 border border-white/10 p-1.5 rounded-[28px] backdrop-blur-md overflow-x-auto no-scrollbar">
              <button 
                *ngFor="let tab of tabs"
                (click)="setActiveTab(tab.id)"
                class="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all whitespace-nowrap"
                [ngClass]="activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-white hover:bg-white/5'"
              >
                <lucide-icon [name]="tab.icon" size="18"></lucide-icon>
                {{ tab.label }}
              </button>
            </div>

            <!-- TAB CONTENT: OVERVIEW -->
            <div *ngIf="activeTab === 'overview'" class="grid grid-cols-1 md:grid-cols-2 gap-8 animate-slide-up">
              
              <!-- Personal Details Card -->
              <div class="glass-container p-8 rounded-[40px] space-y-8 col-span-1 md:col-span-2 lg:col-span-1">
                <h3 class="text-xl font-bold border-b border-white/10 pb-4">Información Personal</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                  <div class="space-y-1">
                    <p class="text-[10px] font-bold text-slate-500 uppercase">Nombre Completo</p>
                    <p class="font-semibold">{{ employee.firstName }} {{ employee.middleName || '' }} {{ employee.lastName }}</p>
                  </div>
                  <div class="space-y-1">
                    <p class="text-[10px] font-bold text-slate-500 uppercase">Fecha de Nacimiento</p>
                    <p class="font-semibold">{{ employee.dateOfBirth | date:'longDate' }}</p>
                  </div>
                  <div class="space-y-1">
                    <p class="text-[10px] font-bold text-slate-500 uppercase">Género</p>
                    <p class="font-semibold">{{ employee.gender || 'No Especificado' }}</p>
                  </div>
                  <div class="space-y-1">
                    <p class="text-[10px] font-bold text-slate-500 uppercase">Estado Civil</p>
                    <p class="font-semibold">{{ employee.maritalStatus || 'No Especificado' }}</p>
                  </div>
                  <div class="space-y-1">
                    <p class="text-[10px] font-bold text-slate-500 uppercase">Nacionalidad</p>
                    <p class="font-semibold">{{ employee.nationality || 'N/A' }}</p>
                  </div>
                  <div class="space-y-1">
                    <p class="text-[10px] font-bold text-slate-500 uppercase">Grupo Sanguíneo</p>
                    <p class="font-semibold text-red-400">{{ employee.bloodType || 'N/A' }}</p>
                  </div>
                </div>
              </div>

              <!-- Employment Details Card -->
              <div class="glass-container p-8 rounded-[40px] space-y-8 col-span-1 md:col-span-2 lg:col-span-1">
                <h3 class="text-xl font-bold border-b border-white/10 pb-4">Detalles Laborales</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                  <div class="space-y-1">
                    <p class="text-[10px] font-bold text-slate-500 uppercase">Departamento</p>
                    <p class="font-semibold">{{ employee.department?.name || 'Sin Asignar' }}</p>
                  </div>
                  <div class="space-y-1">
                    <p class="text-[10px] font-bold text-slate-500 uppercase">Reporta a</p>
                    <p class="font-semibold text-indigo-400 cursor-pointer hover:underline" *ngIf="employee.manager">
                      {{ employee.manager.firstName }} {{ employee.manager.lastName }}
                    </p>
                    <p class="font-semibold" *ngIf="!employee.manager">N/A</p>
                  </div>
                  <div class="space-y-1">
                    <p class="text-[10px] font-bold text-slate-500 uppercase">Tipo de Contrato</p>
                    <span class="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold">
                      {{ formatEmploymentType(employee.employmentType) }}
                    </span>
                  </div>
                  <div class="space-y-1">
                    <p class="text-[10px] font-bold text-slate-500 uppercase">Estado</p>
                    <span class="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold">
                      Activo
                    </span>
                  </div>
                  <div class="space-y-1">
                    <p class="text-[10px] font-bold text-slate-500 uppercase">Fecha de Ingreso</p>
                    <p class="font-semibold">{{ employee.hireDate | date:'longDate' }}</p>
                  </div>
                  <div class="space-y-1">
                    <p class="text-[10px] font-bold text-slate-500 uppercase">Modalidad</p>
                    <p class="font-semibold">{{ employee.isRemote ? 'Remoto' : 'Presencial' }}</p>
                  </div>
                </div>
              </div>

              <!-- Quick Stats Section -->
              <div class="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div class="glass-container p-6 rounded-[32px] flex items-center gap-6">
                  <div class="w-16 h-16 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500">
                    <lucide-icon name="clock" size="32"></lucide-icon>
                  </div>
                  <div>
                    <p class="text-3xl font-bold">98%</p>
                    <p class="text-xs font-bold text-slate-500 uppercase">Asistencia</p>
                  </div>
                </div>
                <div class="glass-container p-6 rounded-[32px] flex items-center gap-6">
                  <div class="w-16 h-16 rounded-2xl bg-amber-600/10 flex items-center justify-center text-amber-500">
                    <lucide-icon name="award" size="32"></lucide-icon>
                  </div>
                  <div>
                    <p class="text-3xl font-bold">4.8</p>
                    <p class="text-xs font-bold text-slate-500 uppercase">Rating Desempeño</p>
                  </div>
                </div>
                <div class="glass-container p-6 rounded-[32px] flex items-center gap-6">
                  <div class="w-16 h-16 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-500">
                    <lucide-icon name="calendar" size="32"></lucide-icon>
                  </div>
                  <div>
                    <p class="text-3xl font-bold">12</p>
                    <p class="text-xs font-bold text-slate-500 uppercase">Días Vacaciones</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- TAB CONTENT: DOCUMENTS -->
            <div *ngIf="activeTab === 'documents'" class="glass-container p-8 rounded-[40px] space-y-8 animate-slide-up">
              <div class="flex items-center justify-between">
                <h3 class="text-2xl font-bold text-white">Repositorio de Documentos</h3>
                <button (click)="showUploadModal = true" class="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20">
                  <lucide-icon name="upload" size="18"></lucide-icon>
                  Subir Documento
                </button>
              </div>

              <!-- Document Grid -->
              <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                <!-- Loading State -->
                <div *ngIf="loadingDocuments" class="col-span-full py-20 text-center">
                  <div class="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p class="text-slate-400 font-medium">Cargando documentos...</p>
                </div>

                <!-- Empty State -->
                <div *ngIf="!loadingDocuments && documents.length === 0" class="col-span-full py-20 text-center glass-panel rounded-[32px] border-dashed border-2 border-white/10">
                  <lucide-icon name="file" size="48" class="mx-auto text-slate-600 mb-4"></lucide-icon>
                  <p class="text-slate-400 font-medium">No hay documentos cargados en este perfil.</p>
                </div>

                <!-- Document Card -->
                <div *ngFor="let doc of documents" class="group glass-panel p-6 rounded-[32px] border border-white/10 hover:bg-white/5 transition-all relative overflow-hidden">
                  <div class="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div class="relative flex flex-col h-full">
                    <div class="flex items-start justify-between mb-4">
                      <div class="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400">
                        <lucide-icon [name]="getDocumentIcon(doc.mimeType)" size="24"></lucide-icon>
                      </div>
                      <button (click)="deleteDocument(doc)" class="p-2 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100">
                        <lucide-icon name="trash-2" size="16"></lucide-icon>
                      </button>
                    </div>

                    <h4 class="font-bold text-white truncate pr-6">{{ doc.name }}</h4>
                    <p class="text-[10px] font-bold text-slate-500 uppercase mt-1">{{ formatDocumentType(doc.type) }}</p>
                    
                    <div class="mt-auto pt-6 flex items-center justify-between">
                      <span class="text-xs text-slate-500 font-medium">{{ formatFileSize(doc.fileSize) }}</span>
                      <div class="flex gap-2">
                        <button (click)="viewDocument(doc)" class="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-indigo-600 hover:border-indigo-600 transition-all text-white">
                          <lucide-icon name="eye" size="18"></lucide-icon>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- TAB CONTENT: ATTENDANCE -->
            <div *ngIf="activeTab === 'attendance'" class="space-y-8 animate-slide-up">
              <!-- Attendance Stats Header -->
              <div class="grid grid-cols-1 sm:grid-cols-4 gap-6">
                <div class="glass-container p-6 rounded-[32px] border-b-4 border-green-500/50">
                  <p class="text-[10px] font-bold text-slate-500 uppercase">Días Presente</p>
                  <p class="text-3xl font-bold mt-2">{{ attendanceSummary?.presentDays || 0 }}</p>
                </div>
                <div class="glass-container p-6 rounded-[32px] border-b-4 border-red-500/50">
                  <p class="text-[10px] font-bold text-slate-500 uppercase">Días Ausente</p>
                  <p class="text-3xl font-bold mt-2">{{ attendanceSummary?.absentDays || 0 }}</p>
                </div>
                <div class="glass-container p-6 rounded-[32px] border-b-4 border-amber-500/50">
                  <p class="text-[10px] font-bold text-slate-500 uppercase">Retrasos</p>
                  <p class="text-3xl font-bold mt-2">{{ attendanceSummary?.lateCount || 0 }}</p>
                </div>
                <div class="glass-container p-6 rounded-[32px] border-b-4 border-indigo-500/50">
                  <p class="text-[10px] font-bold text-slate-500 uppercase">Puntualidad</p>
                  <p class="text-3xl font-bold mt-2">{{ attendanceSummary?.onTimePercentage || 0 }}%</p>
                </div>
              </div>

              <!-- Attendance Table Card -->
              <div class="glass-container p-8 rounded-[40px] overflow-hidden">
                <div class="flex items-center justify-between mb-8">
                  <h3 class="text-2xl font-bold text-white">Registro Detallado</h3>
                  <div class="flex items-center gap-2 bg-white/5 p-1 rounded-2xl">
                    <button class="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white">
                      <lucide-icon name="chevron-left" size="18"></lucide-icon>
                    </button>
                    <span class="px-4 py-1 text-sm font-bold uppercase tracking-widest text-slate-300">Septiembre 2024</span>
                    <button class="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white">
                      <lucide-icon name="chevron-right" size="18"></lucide-icon>
                    </button>
                  </div>
                </div>

                <div class="overflow-x-auto">
                  <table class="w-full text-left">
                    <thead>
                      <tr class="border-b border-white/5">
                        <th class="pb-4 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Fecha</th>
                        <th class="pb-4 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Entrada</th>
                        <th class="pb-4 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Salida</th>
                        <th class="pb-4 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Horas</th>
                        <th class="pb-4 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let record of attendanceSummary?.records" class="border-b border-white/5 last:border-0 group hover:bg-white/5 transition-all">
                        <td class="py-5 px-4 font-bold text-slate-200">{{ record.date | date:'mediumDate' }}</td>
                        <td class="py-5 px-4 text-slate-400 font-medium">{{ record.checkIn ? (record.checkIn | date:'shortTime') : '--:--' }}</td>
                        <td class="py-5 px-4 text-slate-400 font-medium">{{ record.checkOut ? (record.checkOut | date:'shortTime') : '--:--' }}</td>
                        <td class="py-5 px-4 font-bold text-indigo-400">{{ record.totalHours || 0 }} h</td>
                        <td class="py-5 px-4 text-center">
                          <span 
                            class="px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block min-w-[100px]"
                            [ngClass]="{
                              'bg-green-500/10 text-green-400 border border-green-500/20': record.status === 'PRESENT',
                              'bg-red-500/10 text-red-400 border border-red-500/20': record.status === 'ABSENT',
                              'bg-amber-500/10 text-amber-400 border border-amber-500/20': record.status === 'LATE'
                            }"
                          >
                            {{ record.status }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- Placeholder for other tabs (History, Leaves, Performance) -->
            <div *ngIf="activeTab === 'history' || activeTab === 'leaves' || activeTab === 'performance'" class="glass-container p-20 rounded-[40px] text-center">
              <lucide-icon name="layout-grid" size="64" class="mx-auto text-indigo-600/30 mb-6"></lucide-icon>
              <h3 class="text-2xl font-bold text-white mb-2">Sección en Desarrollo</h3>
              <p class="text-slate-400 max-w-md mx-auto">Esta funcionalidad está siendo optimizada para ofrecer la mejor experiencia visual del sistema.</p>
            </div>

          </div>
        </div>
      </div>

      <!-- UPLOAD MODAL -->
      <div *ngIf="showUploadModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div (click)="showUploadModal = false" class="absolute inset-0 bg-[#020617]/80 backdrop-blur-md"></div>
        
        <div class="glass-container w-full max-w-xl rounded-[40px] overflow-hidden relative z-10 animate-scale-in">
          <div class="p-8 border-b border-white/10 flex items-center justify-between bg-white/5">
            <h3 class="text-2xl font-bold text-white">Subir Nuevo Documento</h3>
            <button (click)="showUploadModal = false" class="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all">
              <lucide-icon name="x" size="24"></lucide-icon>
            </button>
          </div>
          
          <div class="p-10 space-y-8">
            <!-- Dropzone -->
            <div 
              class="relative border-2 border-dashed border-white/10 rounded-[32px] p-12 text-center hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group"
              (click)="fileInput.click()"
            >
              <input #fileInput type="file" class="hidden" (change)="onFileSelected($event)">
              
              <div *ngIf="!selectedFile" class="space-y-4">
                <div class="w-20 h-20 rounded-full bg-indigo-600/10 flex items-center justify-center mx-auto text-indigo-500 group-hover:scale-110 transition-transform">
                  <lucide-icon name="upload" size="32"></lucide-icon>
                </div>
                <div>
                  <p class="text-lg font-bold text-white">Haz click para seleccionar</p>
                  <p class="text-sm text-slate-500 mt-1">Soporta PDF, PNG, JPG hasta 10MB</p>
                </div>
              </div>

              <div *ngIf="selectedFile" class="flex flex-col items-center gap-4">
                <div class="w-20 h-20 rounded-[28px] overflow-hidden bg-white/5 border border-white/10 p-2">
                  <img *ngIf="filePreviewUrl" [src]="filePreviewUrl" class="w-full h-full object-cover rounded-2xl">
                  <lucide-icon *ngIf="!filePreviewUrl" [name]="getFileIcon()" size="32" class="text-indigo-400 mx-auto mt-4"></lucide-icon>
                </div>
                <div>
                  <p class="text-lg font-bold text-white">{{ selectedFile.name }}</p>
                  <p class="text-xs text-indigo-400 font-bold uppercase mt-1">{{ formatFileSize(selectedFile.size) }}</p>
                </div>
                <button (click)="clearSelectedFile(); $event.stopPropagation()" class="text-xs font-bold text-red-400 hover:underline">Cambiar archivo</button>
              </div>
            </div>

            <!-- Type Selector -->
            <div class="space-y-4">
              <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Categoría del Documento</label>
              <select 
                [(ngModel)]="uploadType"
                class="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all appearance-none cursor-pointer"
              >
                <option value="NATIONAL_ID" class="bg-[#1e293b]">Documento de Identidad</option>
                <option value="EMPLOYMENT_CONTRACT" class="bg-[#1e293b]">Contrato de Trabajo</option>
                <option value="NDA" class="bg-[#1e293b]">Acuerdo de Confidencialidad (NDA)</option>
                <option value="DEGREE_CERTIFICATE" class="bg-[#1e293b]">Título / Certificado</option>
                <option value="OTHER" class="bg-[#1e293b]">Otros</option>
              </select>
            </div>

            <button 
              (click)="uploadDocument()"
              [disabled]="!selectedFile || uploading"
              class="w-full py-5 rounded-[28px] bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:opacity-50 text-white font-bold text-lg shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              <span *ngIf="!uploading">Procesar y Guardar</span>
              <div *ngIf="uploading" class="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State Global -->
    <div *ngIf="!employee && loading" class="fixed inset-0 flex items-center justify-center bg-[#0f172a] z-[200]">
       <div class="relative">
          <div class="w-32 h-32 border-4 border-indigo-500/10 rounded-full"></div>
          <div class="absolute inset-0 w-32 h-32 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin shadow-[0_0_50px_rgba(79,70,229,0.3)]"></div>
          <p class="absolute -bottom-12 left-1/2 -translate-x-1/2 text-indigo-400 font-bold tracking-[0.2em] whitespace-nowrap animate-pulse">CARGANDO SISTEMA</p>
       </div>
    </div>

    <style>
      .glass-container {
        background: rgba(30, 41, 59, 0.4);
        backdrop-filter: blur(24px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      }
      .glass-panel {
        background: rgba(255, 255, 255, 0.03);
        backdrop-filter: blur(12px);
      }
      .no-scrollbar::-webkit-scrollbar { display: none; }
      .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes scaleIn {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
      }
      .animate-fade-in { animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      .animate-slide-up { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      .animate-scale-in { animation: scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    </style>
  `
})

export class EmployeeDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  public router = inject(Router);
  private employeeService = inject(EmployeeService);
  private cdr = inject(ChangeDetectorRef);
  
  employee: Employee | null = null;
  loading = true;
  
  activeTab = 'overview';
  previousTab = '';

  documents: Document[] = [];
  loadingDocuments = false;
  attendanceSummary: AttendanceSummary | null = null;
  leaveSummary: LeaveSummary | null = null;
  performanceSummary: PerformanceSummary | null = null;
  history: EmployeeHistory[] = [];
  loadingHistory = false;
  
  showUploadModal = false;
  selectedFile: File | null = null;
  filePreviewUrl: string | null = null;
  uploadType: DocumentType = 'OTHER';
  uploading = false;
  
  attendanceMonth = new Date().getMonth() + 1;
  attendanceYear = new Date().getFullYear();

  tabs = [
    { id: 'overview', label: 'Overview', icon: 'user' },
    { id: 'documents', label: 'Documents', icon: 'file-text' },
    { id: 'attendance', label: 'Attendance', icon: 'clock' },
    { id: 'leaves', label: 'Leaves', icon: 'calendar' },
    { id: 'performance', label: 'Performance', icon: 'award' },
    { id: 'history', label: 'History', icon: 'file-check' }
  ];

  constructor() {}

  ngOnInit() {
    // Use pre-fetched data from resolver
    const resolvedData = (this.route.snapshot.data as any)['employee'];
    if (resolvedData) {
      this.employee = resolvedData.data;
      this.loading = false;
      this.loadAllTabData();
      this.cdr.detectChanges();
    } else {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.fetchDetails(id);
      }
    }
  }

  fetchDetails(id: string) {
    this.loading = true;
    this.cdr.detectChanges();

    this.employeeService.getEmployeeById(id).subscribe({
      next: (res) => {
        this.employee = res.data;
        this.loading = false;
        this.loadAllTabData();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching employee details:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadAllTabData() {
    if (!this.employee) return;
    this.loadDocuments();
    this.loadAttendance();
    this.loadLeaves();
    this.loadPerformance();
    this.loadHistory();
  }

  setActiveTab(tabId: string) {
    if (this.activeTab === tabId) return;
    this.activeTab = tabId;
    this.loadTabData(tabId);
    this.cdr.detectChanges();
  }

  loadTabData(tabId: string) {
    if (!this.employee) return;
    
    switch (tabId) {
      case 'documents':
        this.loadDocuments();
        break;
      case 'attendance':
        this.loadAttendance();
        break;
      case 'leaves':
        this.loadLeaves();
        break;
      case 'performance':
        this.loadPerformance();
        break;
      case 'history':
        this.loadHistory();
        break;
    }
  }

  loadDocuments() {
    if (!this.employee) return;
    this.loadingDocuments = true;
    this.employeeService.getDocuments(this.employee.id).subscribe({
      next: (res) => {
        this.documents = res.data;
        this.loadingDocuments = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingDocuments = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadAttendance() {
    if (!this.employee) return;
    this.employeeService.getAttendanceSummary(this.employee.id, this.attendanceYear, this.attendanceMonth).subscribe({
      next: (res) => {
        this.attendanceSummary = res.data;
        this.cdr.detectChanges();
      }
    });
  }

  loadLeaves() {
    if (!this.employee) return;
    this.employeeService.getLeaveSummary(this.employee.id, this.attendanceYear).subscribe({
      next: (res) => {
        this.leaveSummary = res.data;
        this.cdr.detectChanges();
      }
    });
  }

  loadPerformance() {
    if (!this.employee) return;
    this.employeeService.getPerformanceSummary(this.employee.id).subscribe({
      next: (res) => {
        this.performanceSummary = res.data;
        this.cdr.detectChanges();
      }
    });
  }

  loadHistory() {
    if (!this.employee) return;
    this.loadingHistory = true;
    this.employeeService.getEmployeeHistory(this.employee.id).subscribe({
      next: (res) => {
        this.history = res.data;
        this.loadingHistory = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingHistory = false;
        this.cdr.detectChanges();
      }
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.selectedFile = file;
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.filePreviewUrl = e.target?.result as string;
          this.cdr.markForCheck();
        };
        reader.readAsDataURL(file);
      } else {
        this.filePreviewUrl = null;
      }
      this.cdr.markForCheck();
    }
  }

  clearSelectedFile() {
    this.selectedFile = null;
    this.filePreviewUrl = null;
    this.cdr.markForCheck();
  }

  isImageFile(): boolean {
    const file = this.selectedFile;
    return file ? file.type.startsWith('image/') : false;
  }

  getFileIcon(): string {
    if (this.isImageFile()) return 'image';
    const file = this.selectedFile;
    if (!file) return 'file';
    if (file.type === 'application/pdf') return 'file-text';
    return 'file';
  }

  uploadDocument() {
    if (!this.employee || !this.selectedFile) return;
    this.uploading = true;
    this.employeeService.uploadDocument(this.employee.id, this.selectedFile!, this.uploadType).subscribe({
      next: () => {
        this.uploading = false;
        this.showUploadModal = false;
        this.clearSelectedFile();
        this.loadDocuments();
        this.cdr.markForCheck();
      },
      error: () => {
        this.uploading = false;
        this.cdr.markForCheck();
      }
    });
  }

  deleteDocument(doc: Document) {
    if (!confirm('Are you sure you want to delete this document?')) return;
    this.employeeService.deleteDocument(doc.id).subscribe({
      next: () => this.loadDocuments()
    });
  }

  viewDocument(doc: Document) {
    window.open(doc.fileUrl, '_blank');
  }

  editEmployee() {
    this.router.navigate(['/employees', this.employee?.id, 'edit']);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatEmploymentType(type: string): string {
    const map: Record<string, string> = {
      'FULL_TIME': 'Full Time',
      'PART_TIME': 'Part Time',
      'CONTRACT': 'Contract',
      'INTERN': 'Intern',
      'FREELANCE': 'Freelance',
      'TEMPORARY': 'Temporary'
    };
    return map[type] || type;
  }

  formatDocumentType(type: string): string {
    const map: Record<string, string> = {
      'NATIONAL_ID': 'National ID',
      'PASSPORT': 'Passport',
      'DRIVERS_LICENSE': 'Driver\'s License',
      'EMPLOYMENT_CONTRACT': 'Employment Contract',
      'NDA': 'NDA',
      'WORK_PERMIT': 'Work Permit',
      'TAX_FORM': 'Tax Form',
      'DEGREE_CERTIFICATE': 'Degree Certificate',
      'OTHER': 'Other'
    };
    return map[type] || type;
  }

  formatLeaveType(type: string): string {
    const map: Record<string, string> = {
      'VACATION': 'Vacation',
      'SICK': 'Sick Leave',
      'PERSONAL': 'Personal',
      'MATERNITY': 'Maternity',
      'PATERNITY': 'Paternity',
      'PARENTAL': 'Parental',
      'BEREAVEMENT': 'Bereavement',
      'UNPAID': 'Unpaid Leave'
    };
    return map[type] || type;
  }

  getDocumentIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType === 'application/pdf') return 'file-text';
    return 'file';
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'ACTIVE': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      'PROBATION': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      'ON_LEAVE': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'SUSPENDED': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      'TERMINATED': 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
      'RETIRED': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    };
    return classes[status] || 'bg-muted text-muted-foreground';
  }

  getAttendanceStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'PRESENT': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      'ABSENT': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      'LATE': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    };
    return classes[status] || 'bg-muted text-muted-foreground';
  }

  getLeaveStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'PENDING': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      'APPROVED': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      'REJECTED': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      'CANCELLED': 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
    };
    return classes[status] || 'bg-muted text-muted-foreground';
  }

  getHistoryActionClass(action: string): string {
    const classes: Record<string, string> = {
      'CREATE': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      'UPDATE': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'DELETE': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      'SOFT_DELETE': 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
      'RESTORE': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    };
    return classes[action] || 'bg-muted text-muted-foreground';
  }

  getHistoryIcon(action: string): string {
    const icons: Record<string, string> = {
      'CREATE': 'plus-circle',
      'UPDATE': 'edit',
      'DELETE': 'trash2',
      'SOFT_DELETE': 'trash2',
      'RESTORE': 'refresh-cw'
    };
    return icons[action] || 'file';
  }
}