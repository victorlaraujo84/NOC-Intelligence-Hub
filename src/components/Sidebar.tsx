import React from 'react';
import {
  Activity,
  ArrowLeftRight,
  Calendar,
  Network,
  ShieldCheck,
  TrendingUp,
  X,
} from 'lucide-react';
import { ModuleId } from '../types/noc';
import { NocBrandMark } from './VisualGraphics';

interface SidebarProps {
  activeModule: ModuleId;
  onSelectModule: (module: ModuleId) => void;
  openIncidentCount: number;
  coveragePercent: number;
  onJumpAuditLog: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const MODULES: {
  id: ModuleId;
  code: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'core-hub', code: '01', label: 'Core Hub', icon: Network },
  { id: 'shift-manager', code: '02', label: 'Shift Manager', icon: Calendar },
  { id: 'shift-intelligence', code: '03', label: 'Shift Intelligence', icon: ArrowLeftRight },
  { id: 'performance-intel', code: '04', label: 'Performance Intel', icon: TrendingUp },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  openIncidentCount,
  coveragePercent,
  onJumpAuditLog,
  mobileOpen,
  onCloseMobile,
}) => {
  const handleSelect = (mod: ModuleId) => {
    onSelectModule(mod);
    onCloseMobile();
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-[236px] shrink-0 bg-[#0A101B] border-r border-[#1A2639] flex flex-col justify-between transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-[64px] px-4 border-b border-[#1A2639] flex items-center justify-between">
            <button
              type="button"
              onClick={() => handleSelect('core-hub')}
              className="flex items-center gap-2.5 text-left cursor-pointer"
            >
              <NocBrandMark className="w-9 h-9 shrink-0" />
              <div className="leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-bold text-[15px] tracking-tight text-white">
                    NOC HUB
                  </span>
                  <span className="font-mono text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#132238] text-sky-400 border border-[#1E3454]">
                    v4.2
                  </span>
                </div>
                <div className="text-[10px] font-mono tracking-wider text-[#7E92AD]">
                  INTELLIGENCE 24X7
                </div>
              </div>
            </button>
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-[#7E92AD] hover:text-white"
              aria-label="Fechar menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Core Modules */}
          <div className="px-3 pt-5 pb-3">
            <div className="px-2.5 pb-2.5 text-[10px] font-semibold tracking-widest text-[#647894] uppercase">
              CORE MODULES
            </div>
            <nav className="space-y-1.5" aria-label="Módulos principais">
              {MODULES.map((mod) => {
                const Icon = mod.icon;
                const isActive = activeModule === mod.id;
                return (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => handleSelect(mod.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#0EA5E9] text-[#04101D] font-semibold shadow-sm shadow-sky-500/20'
                        : 'text-[#9FB2C9] hover:text-white hover:bg-[#121C2D]'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#04101D]' : 'text-sky-400'}`} />
                      <span className="truncate">{mod.label}</span>
                    </span>
                    <span
                      className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                        isActive
                          ? 'bg-[#04101D]/20 text-[#04101D] font-bold'
                          : 'bg-[#121D2E] text-[#7E92AD]'
                      }`}
                    >
                      {mod.code}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Direct Feeds */}
          <div className="px-3 pt-4 border-t border-[#1A2639]/70 mt-2">
            <div className="px-2.5 pb-2.5 text-[10px] font-semibold tracking-widest text-[#647894] uppercase">
              DIRECT FEEDS
            </div>
            <div className="space-y-1 text-[12px]">
              <button
                type="button"
                onClick={() => handleSelect('shift-manager')}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-md text-[#9FB2C9] hover:text-white hover:bg-[#121C2D] transition-colors cursor-pointer"
              >
                <span className="truncate">12x36 / 6x1 Coverage</span>
                <span className="font-mono text-[11px] font-semibold text-emerald-400 tabular-nums">
                  {coveragePercent}%
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleSelect('shift-intelligence')}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-md text-[#9FB2C9] hover:text-white hover:bg-[#121C2D] transition-colors cursor-pointer"
              >
                <span className="truncate">Incident Transfer</span>
                <span className="font-mono text-[11px] font-semibold text-rose-400 tabular-nums">
                  {openIncidentCount} Open
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleSelect('performance-intel')}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-md text-[#9FB2C9] hover:text-white hover:bg-[#121C2D] transition-colors cursor-pointer"
              >
                <span className="truncate">SLA &amp; MTTR KPI</span>
                <span className="font-mono text-[11px] font-semibold text-sky-400 tabular-nums">
                  99.98%
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onJumpAuditLog();
                  onCloseMobile();
                }}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-md text-[#9FB2C9] hover:text-white hover:bg-[#121C2D] transition-colors cursor-pointer"
              >
                <span className="truncate">Audit Log &amp; Access</span>
                <ShieldCheck className="w-3.5 h-3.5 text-[#7E92AD]" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Duty Engine Widget */}
        <div className="p-3.5 border-t border-[#1A2639]">
          <div className="rounded-lg bg-[#0F1724] border border-[#1B283C] p-3">
            <div className="flex items-center justify-between text-[10px] font-mono text-[#7E92AD] mb-1">
              <span>DUTY ENGINE</span>
              <Activity className="w-3 h-3 text-emerald-400" />
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono mb-2">
              <span className="text-slate-200 font-medium">STREAM-INGEST-01</span>
              <span className="text-emerald-400 font-semibold">ONLINE</span>
            </div>
            <div className="h-1 w-full rounded-full bg-[#172436] overflow-hidden">
              <div className="h-full w-full bg-emerald-500 rounded-full" />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
