import React, { useState } from 'react';
import {
  AlertCircle,
  CalendarPlus,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Fingerprint,
  Lock,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { AnalystRosterRow, ShiftSwapRequest, SsoCheckInRecord } from '../types/noc';

interface ShiftManagerViewProps {
  roster: AnalystRosterRow[];
  requests: ShiftSwapRequest[];
  ssoCheckins: SsoCheckInRecord[];
  onToggleCell: (rowId: string, dayIdx: number) => void;
  onResolveRequest: (reqId: string, decision: 'approved' | 'rejected') => void;
  onOpenPlanModal: () => void;
  onValidateCoverage: () => void;
}

const WEEK_COLUMNS = [
  'SEG 28',
  'TER 29',
  'QUA 30',
  'QUI 31 (HOJE)',
  'SEX 01',
  'SÁB 02',
  'DOM 03',
];

const HOURS_HEATMAP = ['00h', '04h', '08h', '12h', '16h', '20h'];

export const ShiftManagerView: React.FC<ShiftManagerViewProps> = ({
  roster,
  requests,
  ssoCheckins,
  onToggleCell,
  onResolveRequest,
  onOpenPlanModal,
  onValidateCoverage,
}) => {
  const [viewMode, setViewMode] = useState<'SEMANAL' | 'MENSAL' | 'MAPA CALOR'>('SEMANAL');
  const [weekOffset, setWeekOffset] = useState(0);
  const [validationBanner, setValidationBanner] = useState<string | null>(null);

  const pendingRequestsCount = requests.filter((r) => r.status === 'pending').length;

  const alphaRows = roster.filter((r) => r.teamGroup === 'alpha');
  const bravoRows = roster.filter((r) => r.teamGroup === 'bravo');
  const specialistRows = roster.filter((r) => r.teamGroup === 'specialists');

  const renderCell = (row: AnalystRosterRow, dayIdx: number) => {
    const cell = row.days[dayIdx];
    if (!cell) return null;

    let style = 'bg-[#121C2D] text-[#6E829D] border-[#1A2639] hover:border-[#2C3F5E]';
    if (cell.type === 'day') {
      style = 'bg-[#0F2A42] text-sky-300 border-sky-500/25 hover:border-sky-400/50';
    } else if (cell.type === 'active-day') {
      style = 'bg-[#0EA5E9] text-[#04101D] border-sky-400 font-bold shadow-sm shadow-sky-500/25';
    } else if (cell.type === 'night') {
      style = 'bg-[#0E2B2A] text-emerald-300 border-emerald-500/25 hover:border-emerald-400/50';
    } else if (cell.type === 'upcoming-night') {
      style = 'bg-[#113330] text-emerald-300 border-emerald-400/40 font-semibold';
    } else if (cell.type === 'specialist') {
      style = 'bg-[#172436] text-slate-200 border-[#243652] hover:border-sky-500/40';
    }

    return (
      <button
        type="button"
        onClick={() => onToggleCell(row.id, dayIdx)}
        title="Clique para alternar turno / folga"
        className={`w-full min-h-[38px] px-2 py-1 rounded border font-mono text-[11px] flex flex-col items-center justify-center leading-tight transition-colors cursor-pointer ${style}`}
      >
        <span>{cell.label}</span>
        {cell.subLabel && (
          <span className="text-[9px] font-sans font-bold tracking-wide mt-0.5">
            {cell.subLabel}
          </span>
        )}
      </button>
    );
  };

  const renderRowGroup = (
    title: string,
    subtitle: string,
    dotColor: string,
    rows: AnalystRosterRow[]
  ) => (
    <>
      <tr className="bg-[#0B121D] border-y border-[#1A2639]">
        <td colSpan={9} className="px-4 py-2">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
            <span className={`w-2 h-2 rounded-full ${dotColor}`} />
            <span className="font-semibold text-sky-300">{title}</span>
            <span className="text-[#7E92AD] font-sans">{subtitle}</span>
          </div>
        </td>
      </tr>
      {rows.map((row) => (
        <tr key={row.id} className="border-b border-[#1A2639] hover:bg-[#111A29]/60">
          <td className="py-3 px-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#142338] border border-[#243652] flex items-center justify-center font-mono text-xs font-bold text-slate-200 shrink-0">
                {row.initials}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-white truncate">{row.name}</span>
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      row.statusDot === 'emerald'
                        ? 'bg-emerald-400'
                        : row.statusDot === 'cyan'
                        ? 'bg-sky-400'
                        : 'bg-rose-400'
                    }`}
                  />
                </div>
                <div className="text-[11px] text-[#7E92AD] truncate">{row.role}</div>
              </div>
            </div>
          </td>
          <td className="py-3 px-3 text-center">
            <span
              className={`font-mono text-[11px] font-semibold px-2 py-0.5 rounded border ${
                row.regime === '6x1'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                  : row.regime === '5x2'
                  ? 'bg-rose-500/10 text-rose-300 border-rose-500/25'
                  : row.regime === '4x1'
                  ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/25'
                  : 'bg-[#142033] text-slate-300 border-[#243652]'
              }`}
            >
              {row.regime}
            </span>
          </td>
          {row.vacationNotice ? (
            <td colSpan={7} className="py-3 px-3">
              <div className="h-[38px] rounded border border-[#243652] bg-[#121A28] flex items-center justify-center px-4 font-mono text-[11px] text-[#8DA0BA] tracking-wide">
                {row.vacationNotice}
              </div>
            </td>
          ) : (
            WEEK_COLUMNS.map((_, idx) => (
              <td
                key={idx}
                className={`py-2.5 px-1.5 ${idx === 3 ? 'bg-[#0F1E31]/50' : ''}`}
              >
                {renderCell(row, idx)}
              </td>
            ))
          )}
        </tr>
      ))}
    </>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-[11px] font-mono">
            <span className="px-2 py-0.5 rounded bg-sky-500/15 text-sky-400 border border-sky-500/30 font-semibold">
              MÓDULO 02
            </span>
            <span className="text-[#7E92AD] tracking-wider uppercase">
              TELEMETRIA DE RECURSOS HUMANOS CRÍTICOS
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Shift Manager • Escalas e Cobertura 24x7
          </h1>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/25 text-[11px] font-mono text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            TURNO DIURNO ATIVO [07:00 — 19:00]
          </div>
        </div>

        {/* Right View & Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex rounded-lg bg-[#0F1724] border border-[#1E2B40] p-1">
            {(['SEMANAL', 'MENSAL', 'MAPA CALOR'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setViewMode(tab)}
                className={`px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  viewMode === tab
                    ? 'bg-[#0EA5E9] text-[#04101D]'
                    : 'text-[#9FB2C9] hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              onValidateCoverage();
              setValidationBanner(
                'Validação CLT & Cobertura 24x7 concluída: 0 violações de interjornada (mín. 11h) e 100% dos postos críticos cobertos.'
              );
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#0F1724] hover:bg-[#162235] border border-[#1E2B40] text-xs font-medium text-slate-200 cursor-pointer whitespace-nowrap"
          >
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            Validar Regras de Cobertura
          </button>

          <button
            type="button"
            onClick={onOpenPlanModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0EA5E9] hover:bg-sky-400 text-[#04101D] text-xs font-bold cursor-pointer whitespace-nowrap"
          >
            <CalendarPlus className="w-4 h-4" />
            Planejar Nova Escala
          </button>
        </div>
      </section>

      {validationBanner && (
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-3 flex items-center justify-between gap-3 text-xs text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{validationBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setValidationBanner(null)}
            className="text-emerald-200 hover:text-white font-mono text-[11px] cursor-pointer"
          >
            DISPENSAR
          </button>
        </div>
      )}

      {/* 4 KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-xl bg-[#0F1724] border border-[#1E2B40] p-4 space-y-3">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#7E92AD]">
            <span>TAXA DE COBERTURA GERAL</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold text-white tabular-nums">100%</span>
            <span className="font-mono text-xs text-[#7E92AD]">/ 98.4% Previsto</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[#172436]">
            <div className="h-full w-full rounded-full bg-emerald-500" />
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-[#7E92AD]">Tolerância de Gap: 0.0%</span>
            <span className="text-emerald-400 font-semibold">STATUS: NOMINAL</span>
          </div>
        </div>

        <div className="rounded-xl bg-[#0F1724] border border-[#1E2B40] p-4 space-y-3">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#7E92AD]">
            <span>HORAS-POSTO SEMANAIS</span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold text-white tabular-nums">168.0h</span>
            <span className="font-mono text-xs text-[#7E92AD]">/ 168.0h (100%)</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[#172436]">
            <div className="h-full w-full rounded-full bg-sky-500" />
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-[#7E92AD]">Postos Simultâneos: 6 Ativos</span>
            <span className="text-sky-400 font-semibold">Ciclo W-{18 + weekOffset}</span>
          </div>
        </div>

        <div className="rounded-xl bg-[#0F1724] border border-[#1E2B40] p-4 space-y-3">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#7E92AD]">
            <span>GAPS DE ESCALA (PRÓX. 48H)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold text-white tabular-nums">0 GAPS</span>
            <span className="text-xs text-[#7E92AD]">Detecção Preditiva</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[#172436]">
            <div className="h-full w-full rounded-full bg-emerald-500" />
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-[#7E92AD]">Varredura CLT &amp; Fadiga</span>
            <span className="text-emerald-400 font-semibold">CONFORME</span>
          </div>
        </div>

        <div className="rounded-xl bg-[#0F1724] border border-[#1E2B40] p-4 space-y-3">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#7E92AD]">
            <span>TROCAS &amp; SUBSTITUIÇÕES</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`font-mono text-3xl font-bold tabular-nums ${
                pendingRequestsCount > 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {pendingRequestsCount} {pendingRequestsCount === 1 ? 'PENDENTE' : 'PENDENTES'}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[#172436]">
            <div
              className={`h-full rounded-full transition-all ${
                pendingRequestsCount > 0 ? 'w-1/2 bg-rose-400' : 'w-full bg-emerald-500'
              }`}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-[#7E92AD]">Impacto no SLA: Nulo</span>
            <span className={pendingRequestsCount > 0 ? 'text-rose-400 font-semibold' : 'text-emerald-400 font-semibold'}>
              {pendingRequestsCount > 0 ? 'REVISAR' : 'LIQUIDADO'}
            </span>
          </div>
        </div>
      </section>

      {/* Handover Overlap Rule Banner */}
      <section className="rounded-xl bg-[#0F1724] border border-[#1E2B40] p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0 mt-0.5">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-display text-sm font-bold text-white">
                Regra Operacional Handover Ativa:
              </span>
              <span className="font-mono text-sm font-bold text-emerald-400">
                30 min de Sobreposição Obrigatória
              </span>
            </div>
            <p className="text-xs text-[#9FB2C9] mt-0.5">
              A janela entre 06:45-07:15 e 18:45-19:15 exige dupla presença em console para
              transferência de contexto de incidentes em andamento.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-x-5 gap-y-1.5 text-[11px] font-mono text-[#9FB2C9] shrink-0">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#0EA5E9]" /> 12X36 (ESCALA BASE)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-400" /> 6X1 (ESPECIALISTAS)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-rose-400" /> 5X2 (ENG. N3)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-slate-400" /> 4X1 (PLANTÃO NOTURNO)
          </span>
        </div>
      </section>

      {/* Main Schedule View: Semanal / Mensal / Mapa Calor */}
      <section className="rounded-xl bg-[#0F1724] border border-[#1E2B40] overflow-hidden">
        <div className="px-4 py-3.5 border-b border-[#1E2B40] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h2 className="font-display text-base font-bold text-white">
              {viewMode === 'SEMANAL'
                ? 'Grade de Alocação de Escala Semanal'
                : viewMode === 'MENSAL'
                ? 'Projeção Mensal de Cobertura (Novembro)'
                : 'Mapa de Calor — Densidade Operacional 24h'}
            </h2>
            <span className="font-mono text-xs text-sky-400">
              Semana {18 + weekOffset} • 28 Out - 03 Nov
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setWeekOffset((w) => w - 1)}
              className="p-1.5 rounded bg-[#0A101B] border border-[#1E2B40] text-slate-300 hover:text-white cursor-pointer"
              aria-label="Semana anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-slate-200 px-2">
              {weekOffset === 0
                ? 'Atual (Semana Vigente)'
                : weekOffset > 0
                ? `Semana +${weekOffset}`
                : `Semana ${weekOffset}`}
            </span>
            <button
              type="button"
              onClick={() => setWeekOffset((w) => w + 1)}
              className="p-1.5 rounded bg-[#0A101B] border border-[#1E2B40] text-slate-300 hover:text-white cursor-pointer"
              aria-label="Próxima semana"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {viewMode === 'SEMANAL' && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] border-collapse">
              <thead>
                <tr className="border-b border-[#1E2B40] bg-[#0B121D] text-[10px] font-mono text-[#7E92AD] uppercase">
                  <th className="py-3 px-4 text-left w-[270px]">EQUIPE / ANALISTA / POSTO</th>
                  <th className="py-3 px-3 text-center w-[80px]">REGIME</th>
                  {WEEK_COLUMNS.map((day, idx) => (
                    <th
                      key={day}
                      className={`py-3 px-2 text-center ${
                        idx === 3 ? 'text-sky-400 bg-[#0F1E31]/70 font-bold' : ''
                      }`}
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {renderRowGroup(
                  'EQUIPE ALPHA • TURNO DIURNO PRIMÁRIO (07:00 — 19:00)',
                  'Capacidade: 100% Coberta',
                  'bg-sky-400',
                  alphaRows
                )}
                {renderRowGroup(
                  'EQUIPE BRAVO • TURNO NOTURNO PRIMÁRIO (19:00 — 07:00)',
                  'Handover 18:45 agendado',
                  'bg-emerald-400',
                  bravoRows
                )}
                {renderRowGroup(
                  'ESPECIALISTAS N3 & REGIMES 6X1 / 5X2 / 4X1',
                  'Plantão & Escalonamento Técnico',
                  'bg-rose-400',
                  specialistRows
                )}
              </tbody>
            </table>
          </div>
        )}

        {viewMode === 'MENSAL' && (
          <div className="p-5 grid grid-cols-7 gap-2">
            {['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'].map((d) => (
              <div key={d} className="text-center font-mono text-[11px] text-[#7E92AD] pb-1">
                {d}
              </div>
            ))}
            {Array.from({ length: 28 }, (_, i) => {
              const dayNum = i + 1;
              const isToday = dayNum === 31;
              return (
                <div
                  key={dayNum}
                  className={`rounded-lg border p-2.5 min-h-[76px] flex flex-col justify-between ${
                    isToday
                      ? 'bg-[#0F2A42] border-sky-400'
                      : 'bg-[#0B121D] border-[#1B283C]'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className={isToday ? 'text-sky-300 font-bold' : 'text-slate-300'}>
                      {String(dayNum).padStart(2, '0')}/11
                    </span>
                    <span className="text-[10px] text-emerald-400">100%</span>
                  </div>
                  <div className="text-[10px] font-mono text-[#7E92AD] mt-2">
                    Alpha: 2 · Bravo: 1 · N3: {dayNum % 7 >= 5 ? '1' : '2'}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {viewMode === 'MAPA CALOR' && (
          <div className="p-5 space-y-3">
            <div className="text-xs text-[#9FB2C9]">
              Concentração de analistas simultâneos por janela horária (picos de 4+ analistas nas
              janelas de sobreposição 06:45 e 18:45):
            </div>
            <div className="overflow-x-auto">
              <div className="grid grid-cols-8 gap-2 min-w-[640px]">
                <div />
                {WEEK_COLUMNS.map((d) => (
                  <div key={d} className="text-center font-mono text-[11px] text-[#7E92AD]">
                    {d.split(' ')[0]}
                  </div>
                ))}
                {HOURS_HEATMAP.map((hour, hIdx) => (
                  <React.Fragment key={hour}>
                    <div className="font-mono text-xs text-[#7E92AD] flex items-center">{hour}</div>
                    {WEEK_COLUMNS.map((d, dIdx) => {
                      const intensity = ((hIdx === 2 || hIdx === 4) && dIdx < 5) ? 4 : hIdx === 0 ? 2 : 3;
                      const bg =
                        intensity === 4
                          ? 'bg-sky-500 text-[#04101D] font-bold'
                          : intensity === 3
                          ? 'bg-emerald-500/35 text-emerald-200'
                          : 'bg-[#132238] text-sky-300';
                      return (
                        <div
                          key={`${hour}-${d}`}
                          className={`h-10 rounded flex items-center justify-center font-mono text-xs border border-[#1E2E47] ${bg}`}
                        >
                          {intensity} postos
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Bottom 2-Column Split: Requests Queue + SSO Audit */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Left: Requests Queue */}
        <div className="xl:col-span-7 space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-white">
              Fila de Solicitações de Troca e Ausência
            </h2>
            <span className="font-mono text-[11px] font-semibold text-rose-300 bg-rose-500/15 border border-rose-500/30 px-2.5 py-0.5 rounded">
              {pendingRequestsCount} Exigem Validação CLT
            </span>
          </div>

          <div className="space-y-3.5">
            {requests.map((req) => (
              <div
                key={req.id}
                className="rounded-xl bg-[#0F1724] border border-[#1E2B40] p-4 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span
                      className={`px-2 py-0.5 rounded font-semibold ${
                        req.badgeType === 'coral'
                          ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          : 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                      }`}
                    >
                      {req.type}
                    </span>
                    <span className="text-[#7E92AD]">{req.id}</span>
                  </div>
                  <span className="font-mono text-[11px] text-emerald-400 font-medium">
                    {req.ruleCompliance}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-lg bg-[#0B121D] border border-[#1A2639] p-3">
                  <div>
                    <div className="text-[10px] font-mono text-[#7E92AD] uppercase">
                      {req.requesterLabel}
                    </div>
                    <div className="text-sm font-semibold text-white mt-0.5">
                      {req.requesterName}
                    </div>
                    <div className="text-[11px] font-mono text-sky-400 mt-0.5">
                      {req.requesterDetail}
                    </div>
                  </div>
                  <div className="sm:text-right">
                    <div className="text-[10px] font-mono text-[#7E92AD] uppercase">
                      {req.replacementLabel}
                    </div>
                    <div className="text-sm font-semibold text-white mt-0.5">
                      {req.replacementName}
                    </div>
                    <div className="text-[11px] font-mono text-emerald-400 mt-0.5">
                      {req.replacementDetail}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>{req.validationNote}</span>
                  </div>

                  {req.status === 'pending' ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onResolveRequest(req.id, 'rejected')}
                        className="px-3 py-1.5 rounded-lg bg-[#162235] hover:bg-[#1E2F49] border border-[#243652] text-xs font-medium text-slate-200 cursor-pointer"
                      >
                        Rejeitar
                      </button>
                      <button
                        type="button"
                        onClick={() => onResolveRequest(req.id, 'approved')}
                        className="px-3.5 py-1.5 rounded-lg bg-[#0EA5E9] hover:bg-sky-400 text-[#04101D] text-xs font-bold cursor-pointer"
                      >
                        {req.type.includes('TROCA') ? 'Aprovar Troca' : 'Aprovar Folga'}
                      </button>
                    </div>
                  ) : (
                    <span
                      className={`font-mono text-xs font-semibold px-2.5 py-1 rounded ${
                        req.status === 'approved'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {req.status === 'approved' ? 'APROVADA E AUDITADA' : 'REJEITADA'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Auditoria SSO & Check-in */}
        <div className="xl:col-span-5 space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-white flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-emerald-400" />
              <span>Auditoria SSO &amp; Check-in</span>
            </h2>
            <span className="font-mono text-xs text-emerald-400 font-semibold">
              Turno Alpha (Ativo)
            </span>
          </div>

          <div className="rounded-xl bg-[#0F1724] border border-[#1E2B40] p-4 space-y-2.5">
            {ssoCheckins.map((rec) => (
              <div
                key={rec.id}
                className="rounded-lg bg-[#0B121D] border border-[#1A2639] p-3 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      rec.isTransition
                        ? 'bg-[#142033] text-[#7E92AD]'
                        : 'bg-emerald-500/10 text-emerald-400'
                    }`}
                  >
                    {rec.isTransition ? (
                      <Clock className="w-4 h-4" />
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate">{rec.name}</div>
                    <div className="text-[11px] text-[#7E92AD] truncate">{rec.method}</div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div
                    className={`font-mono text-xs font-bold tabular-nums ${
                      rec.isTransition ? 'text-sky-400' : 'text-emerald-400'
                    }`}
                  >
                    {rec.time}
                  </div>
                  <div className="text-[10px] font-mono text-[#7E92AD]">{rec.expected}</div>
                </div>
              </div>
            ))}

            <div className="rounded-lg bg-[#0B1420] border border-[#1E334D] p-3 flex items-start gap-2.5 text-[11px] text-[#9FB2C9] mt-2">
              <Sparkles className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <span>
                Nenhum operador com mais de 12 horas consecutivas. Banco de fadiga em conformidade
                com ISO 27001 e NR-17.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Overlap Handover 24h Timeline */}
      <section className="rounded-xl bg-[#0F1724] border border-[#1E2B40] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-sm font-bold text-white">
            Linha do Tempo da Sobreposição de Turno (Overlap Handover 30 min)
          </h2>
          <span className="text-[11px] font-mono text-[#7E92AD]">Ciclo 24 Horas Contínuo</span>
        </div>

        <div className="h-9 rounded-lg overflow-hidden flex font-mono text-[11px] border border-[#1E2B40]">
          <div className="w-[27%] bg-[#182232] text-[#9FB2C9] flex items-center justify-center">
            00:00 - 06:45
          </div>
          <div className="w-[6%] bg-emerald-500 text-[#04101D] font-bold flex items-center justify-center">
            HAND
          </div>
          <div className="w-[44%] bg-[#0EA5E9] text-[#04101D] font-bold flex items-center justify-center px-2 truncate">
            07:15 - 18:45 (TURNO DIURNO ALPHA EM OPERAÇÃO)
          </div>
          <div className="w-[6%] bg-emerald-500 text-[#04101D] font-bold flex items-center justify-center">
            HAND
          </div>
          <div className="w-[17%] bg-[#182232] text-[#9FB2C9] flex items-center justify-center">
            19:15 - 24:00
          </div>
        </div>

        <div className="flex items-center justify-between font-mono text-[11px] text-[#7E92AD]">
          <span>00:00</span>
          <span>06:00</span>
          <span className="text-emerald-400 font-semibold">06:45 (Overlap)</span>
          <span className="text-sky-400 font-semibold">12:00 (Pico)</span>
          <span className="text-emerald-400 font-semibold">18:45 (Overlap)</span>
          <span>24:00</span>
        </div>
      </section>
    </div>
  );
};
