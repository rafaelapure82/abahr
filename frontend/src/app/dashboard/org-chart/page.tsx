"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  GitBranch, Loader2, Users, 
  MapPin, Phone, Mail, ChevronDown, 
  ChevronRight, ZoomIn, ZoomOut, Maximize2
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

const getAvatarUrl = (url: string | null) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const uploadsBase = API_URL.replace('/api/v1', '/uploads');
  return `${uploadsBase}/${url}`;
};

export default function OrgChartPage() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    fetchChart();
  }, []);

  const fetchChart = async () => {
    try {
      const token = localStorage.getItem('access_token');
      // In the backend it's likely /departments/org-chart or similar
      const response = await axios.get(`${API_URL}/departments/org-chart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChartData(response.data.data || []);
    } catch (error) {
      console.error("Error fetching org chart:", error);
    } finally {
      setLoading(false);
    }
  };

  const adjustZoom = (delta: number) => {
    setZoom(prev => Math.min(Math.max(prev + delta, 0.5), 2));
  };

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-12 h-12 animate-spin text-primary" />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Generando Árbol Organizacional...</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <GitBranch className="text-primary w-7 h-7" /> Organigrama ABA Talent
          </h1>
          <p className="text-sm text-slate-400 font-medium">Visualización jerárquica de la estructura de reporte.</p>
        </div>
        <div className="flex bg-white rounded-2xl shadow-sm border border-slate-100 p-1">
          <button onClick={() => adjustZoom(-0.1)} className="p-3 hover:bg-slate-50 rounded-xl transition-colors"><ZoomOut className="w-5 h-5 text-slate-400" /></button>
          <div className="px-4 flex items-center font-bold text-xs text-slate-400">{Math.round(zoom * 100)}%</div>
          <button onClick={() => adjustZoom(0.1)} className="p-3 hover:bg-slate-50 rounded-xl transition-colors"><ZoomIn className="w-5 h-5 text-slate-400" /></button>
          <button onClick={() => setZoom(1)} className="p-3 hover:bg-slate-50 rounded-xl transition-colors border-l ml-1"><Maximize2 className="w-5 h-5 text-slate-400" /></button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="card-premium bg-slate-50 border-slate-100 h-[70vh] overflow-auto relative p-20 cursor-grab active:cursor-grabbing">
        <div 
          className="flex justify-center transition-transform duration-300 origin-top"
          style={{ transform: `scale(${zoom})` }}
        >
          {chartData.length === 0 ? (
            <p className="text-slate-400 font-bold py-20">No se ha definido una estructura de reporte activa.</p>
          ) : (
            <div className="flex gap-12">
              {chartData.map((node) => (
                <OrgNode key={node.id} node={node} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-6 justify-center">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
          <div className="w-3 h-3 bg-primary rounded-full"></div> Gerencia / C-Level
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
          <div className="w-3 h-3 bg-teal-500 rounded-full"></div> Mandos Medios
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
          <div className="w-3 h-3 bg-slate-300 rounded-full"></div> Operativo
        </div>
      </div>
    </div>
  );
}

function OrgNode({ node }: { node: any }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="flex flex-col items-center relative">
      {/* Node Card */}
      <div className="w-56 bg-white rounded-[2rem] shadow-xl border border-slate-100 p-5 relative z-10 group hover:border-primary transition-all duration-300">
        <div 
          className="absolute top-0 left-0 w-full h-1.5 rounded-t-[2rem]" 
          style={{ backgroundColor: node.department?.color || '#cbd5e1' }}
        ></div>
        
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border-2 border-white shadow-md">
            {node.avatarUrl ? (
              <img src={getAvatarUrl(node.avatarUrl) || ''} alt={node.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-black text-primary text-xl uppercase">
                {node.firstName?.[0]}{node.lastName?.[0]}
              </div>
            )}
          </div>
          
          <div>
            <p className="text-xs font-black text-slate-800 tracking-tight leading-tight">{node.name}</p>
            <p className="text-[9px] font-black text-primary uppercase mt-0.5">{node.jobTitle}</p>
          </div>

          <div className="px-3 py-1 bg-slate-50 rounded-full text-[8px] font-black text-slate-400 uppercase">
            {node.department?.name || 'Corporativo'}
          </div>
        </div>

        {hasChildren && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border border-slate-100 rounded-full flex items-center justify-center shadow-md hover:text-primary transition-colors"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Connector and Children */}
      {hasChildren && isExpanded && (
        <div className="mt-12 flex gap-8 relative">
          {/* Vertical line from parent */}
          <div className="absolute top-[-48px] left-1/2 -translate-x-1/2 w-0.5 h-12 bg-slate-200"></div>
          
          {/* Horizontal line connecting children */}
          {node.children.length > 1 && (
            <div className="absolute top-0 left-[15%] right-[15%] h-0.5 bg-slate-200"></div>
          )}

          {node.children.map((child: any) => (
            <div key={child.id} className="relative pt-12">
              {/* Line up to connector */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-12 bg-slate-200"></div>
              <OrgNode node={child} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
