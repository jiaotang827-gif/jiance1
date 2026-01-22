import React from 'react';
import { LayoutDashboard, UploadCloud, ScanLine, FileText, Settings, Microscope } from 'lucide-react';
import { AppStep } from '../types';

interface SidebarProps {
  currentStep: AppStep;
  setStep: (step: AppStep) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentStep, setStep }) => {
  const navItems = [
    { id: AppStep.UPLOAD_TRAIN, label: 'Data & Model', icon: <UploadCloud size={20} /> },
    { id: AppStep.PREDICT, label: 'Detection', icon: <ScanLine size={20} /> },
    { id: AppStep.REPORT, label: 'Methodology', icon: <FileText size={20} /> },
  ];

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 z-20">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="bg-emerald-500 p-2 rounded-lg">
           <Microscope className="text-slate-900" size={24} />
        </div>
        <div>
            <h1 className="font-bold text-slate-100 text-lg tracking-tight">BioSense AI</h1>
            <p className="text-xs text-slate-400">Pathogen Detection</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setStep(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              currentStep === item.id
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/5'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            {item.icon}
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-lg p-3">
           <div className="flex items-center gap-2 text-slate-400 mb-2">
             <Settings size={14} />
             <span className="text-xs font-semibold uppercase tracking-wider">System Status</span>
           </div>
           <div className="flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
             <span className="text-xs text-slate-300">Model Engine Ready</span>
           </div>
        </div>
      </div>
    </div>
  );
};