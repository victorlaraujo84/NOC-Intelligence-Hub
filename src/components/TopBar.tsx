import React, { useMemo, useState } from 'react';
import { AlertTriangle, Menu, OctagonAlert, Search, UserCircle2, X } from 'lucide-react';
import { ModuleId } from '../types/noc';

interface SearchResult {
  id: string;
  label: string;
  sublabel: string;
  module: ModuleId;
}

interface TopBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  disasterCount: number;
  warningCount: number;
  onClickAlerts: (filter: 'ALL' | 'HIGH+') => void;
  onSelectModule: (m: ModuleId) => void;
  onOpenMobileMenu: () => void;
  searchableItems: SearchResult[];
}

export const TopBar: React.FC<TopBarProps> = ({
  searchQuery,
  onSearchChange,
  disasterCount,
  warningCount,
  onClickAlerts,
  onSelectModule,
  onOpenMobileMenu,
  searchableItems,
}) => {
  const [searchFocused, setSearchFocused] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const quickResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return searchableItems
      .filter(
        (item) =>
          item.label.toLowerCase().includes(q) ||
          item.sublabel.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [searchQuery, searchableItems]);

  return (
    <header className="sticky top-0 z-30 h-[64px] bg-[#0A101B]/95 backdrop-blur-sm border-b border-[#1A2639] px-4 lg:px-6 flex items-center justify-between gap-3">
      {/* Left: Mobile toggle + Operational stream info */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-md border border-[#1E2B40] text-slate-300 hover:text-white cursor-pointer"
          aria-label="Abrir navegação"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="hidden xl:flex items-center gap-4 border-r border-[#1A2639] pr-4">
          <div className="flex items-center gap-2 text-[11px] font-mono font-semibold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <span className="whitespace-nowrap">24X7 OPERATIONAL · NOMINAL</span>
          </div>
          <div className="text-[11px] font-mono text-[#7E92AD] whitespace-nowrap">
            P95: <span className="text-sky-400 font-semibold">184ms</span>
          </div>
          <div className="text-[11px] font-mono text-[#7E92AD] whitespace-nowrap">
            Active Shift: <span className="text-slate-200">Turno Alpha 07:00-19:00</span>
          </div>
        </div>
      </div>

      {/* Center: Global Search */}
      <div className="relative flex-1 max-w-md">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-[#647894] absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 160)}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search triggers, incidents, analysts (regex / CIDR)..."
            className="w-full h-9 pl-9 pr-8 rounded-lg bg-[#0F1724] border border-[#1E2B40] text-xs text-slate-200 placeholder:text-[#647894] focus:outline-none focus:border-sky-500 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 text-[#647894] hover:text-white cursor-pointer"
              aria-label="Limpar busca"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Instant Search Results Dropdown */}
        {searchFocused && quickResults.length > 0 && (
          <div className="absolute left-0 right-0 mt-1.5 rounded-lg bg-[#0F1724] border border-[#243652] shadow-xl overflow-hidden z-50">
            <div className="px-3 py-1.5 text-[10px] font-mono text-[#7E92AD] border-b border-[#1A2639]">
              RESULTADOS RÁPIDOS ({quickResults.length})
            </div>
            {quickResults.map((res) => (
              <button
                key={res.id}
                type="button"
                onMouseDown={() => {
                  onSelectModule(res.module);
                  onSearchChange('');
                }}
                className="w-full px-3 py-2 text-left hover:bg-[#162235] flex items-center justify-between gap-2 border-b border-[#1A2639]/50 last:border-none cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="text-xs font-medium text-white truncate">{res.label}</div>
                  <div className="text-[11px] text-[#7E92AD] truncate">{res.sublabel}</div>
                </div>
                <span className="text-[10px] font-mono text-sky-400 uppercase shrink-0">
                  {res.module.replace('-', ' ')}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Alert counters + User profile */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          onClick={() => onClickAlerts('HIGH+')}
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#111927] border border-[#232D3F] hover:border-rose-500/40 text-[11px] font-mono text-slate-200 transition-colors cursor-pointer whitespace-nowrap"
        >
          <OctagonAlert className="w-3.5 h-3.5 text-rose-400" />
          <span className="font-bold text-rose-400">{disasterCount}</span>
          <span>DISASTER</span>
        </button>

        <button
          type="button"
          onClick={() => onClickAlerts('ALL')}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#1A1416] border border-rose-500/35 hover:border-rose-400 text-[11px] font-mono text-rose-200 transition-colors cursor-pointer whitespace-nowrap"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          <span className="font-bold text-rose-400">{warningCount}</span>
          <span className="hidden sm:inline">WARNINGS</span>
        </button>

        <div className="relative pl-1 border-l border-[#1A2639]">
          <button
            type="button"
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-[#121C2D] transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-[#15263E] border border-sky-500/40 flex items-center justify-center text-sky-300">
              <UserCircle2 className="w-4 h-4" />
            </div>
            <div className="hidden md:block text-left leading-tight">
              <div className="text-xs font-semibold text-white whitespace-nowrap">Rodrigo Valente</div>
              <div className="text-[10px] font-mono text-sky-400 whitespace-nowrap">ADMIN / NOC LEAD</div>
            </div>
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-60 rounded-lg bg-[#0F1724] border border-[#243652] shadow-xl p-3 z-50 text-xs">
              <div className="font-semibold text-white">Rodrigo Valente de Sá</div>
              <div className="text-[11px] font-mono text-[#7E92AD] mt-0.5">
                Matrícula: NOC-8831 · Turno Alpha
              </div>
              <div className="mt-2.5 pt-2.5 border-t border-[#1A2639] space-y-1.5 text-[11px] text-slate-300">
                <div className="flex justify-between">
                  <span className="text-[#7E92AD]">Autenticação:</span>
                  <span className="text-emerald-400 font-mono">SSO Okta + FIDO2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7E92AD]">Escopo RBAC:</span>
                  <span className="font-mono text-sky-400">LEAD_24X7</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  onSelectModule('shift-intelligence');
                }}
                className="mt-3 w-full py-1.5 rounded bg-[#162235] hover:bg-[#1D2D46] text-sky-300 font-medium cursor-pointer"
              >
                Ir para Passagem de Turno
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
