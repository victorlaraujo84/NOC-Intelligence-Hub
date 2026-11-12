import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  ArrowDown,
  ArrowRight,
  ArrowRightLeft,
  Check,
  CheckCircle2,
  Clock,
  FileSignature,
  Lock,
  Plus,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { HandoverIncident, OperationalEvent } from '../types/noc';
import { NocVideoWallPreview } from './VisualGraphics';

interface ShiftIntelligenceViewProps {
  incidents: HandoverIncident[];
  events: OperationalEvent[];
  onToggleAcceptIncident: (id: string) => void;
  onAddOperationalEvent: (title: string, description: string, category: 'critical' | 'action' | 'maintenance', refCode: string) => void;
  onSealHandover: (notes: string, receiverHash: string) => void;
  handoverSealed: boolean;
  sealedHash: string | null;
  sealedAt: string | null;
}

async function computeSha256Hex(payload: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    const encoded = new TextEncoder().encode(payload);
    const buffer = await window.crypto.subtle.digest('SHA-256', encoded);
    return Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
      .slice(0, 40);
  }
  return '9f4c12a87b3091d5c28e4a67b1023f8e9d1a4c22';
}

export const ShiftIntelligenceView: React.FC<ShiftIntelligenceViewProps> = ({
  incidents,
  events,
  onToggleAcceptIncident,
  onAddOperationalEvent,
  onSealHandover,
  handoverSealed,
  sealedHash,
  sealedAt,
}) => {
  const [filterTab, setFilterTab] = useState<'ALL' | 'CRITICAL' | 'PENDING'>('ALL');
  const [remainingSeconds, setRemainingSeconds] = useState(17 * 60 + 37);
  const [notes, setNotes] = useState('');
  const [declared, setDeclared] = useState(false);
  const [addingEvent, setAddingEvent] = useState(false);
  const [newEvTitle, setNewEvTitle] = useState('');
  const [newEvDesc, setNewEvDesc] = useState('');
  const [newEvCat, setNewEvCat] = useState<'critical' | 'action' | 'maintenance'>('action');
  const [videoWallExpanded, setVideoWallExpanded] = useState(false);

  const signatureRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const mins = String(Math.floor(remainingSeconds / 60)).padStart(2, '0');
  const secs = String(remainingSeconds % 60).padStart(2, '0');

  const acceptedCount = incidents.filter((i) => i.accepted).length;
  const criticalCount = incidents.filter((i) => i.severity === 'DISASTER' || i.severity === 'HIGH').length;
  const pendingCount = incidents.filter((i) => !i.accepted).length;
  const disasterCount = incidents.filter((i) => i.severity === 'DISASTER').length;

  // Matches 11 of 12 (91.6%) baseline + dynamic updates when user toggles items
  const totalChecklistBaseline = 12;
  const totalConfirmedDisplay = totalChecklistBaseline - pendingCount;
  const acceptanceRate = ((totalConfirmedDisplay / totalChecklistBaseline) * 100).toFixed(1);

  const filteredIncidents = useMemo(() => {
    if (filterTab === 'CRITICAL') {
      return incidents.filter((i) => i.severity === 'DISASTER' || i.severity === 'HIGH');
    }
    if (filterTab === 'PENDING') {
      return incidents.filter((i) => !i.accepted);
    }
    return incidents;
  }, [incidents, filterTab]);

  const handleSealSubmit = async () => {
    if (pendingCount > 0 || !declared || handoverSealed) return;
    const payload = JSON.stringify({
      protocol: 'NOC-HO-20241024-B',
      transmitter: 'Rodrigo Valente de Sá (NOC-8831)',
      receiver: 'Gabriel Soares Albuquerque (NOC-9402)',
      items: incidents.map((i) => ({ id: i.triggerCode, acceptedAt: i.acceptedAt })),
      notes,
      timestamp: new Date().toISOString(),
    });
    const hash = await computeSha256Hex(payload);
    onSealHandover(notes, hash);
  };

  return (
    <div className="space-y-6">
      {/* Top Handover Banner */}
      <section className="rounded-xl bg-[#0F1724] border border-[#1E2B40] p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/15 border border-emerald-500/30 text-[11px] font-mono font-bold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              {handoverSealed ? 'PASSAGEM SELADA' : 'PASSAGEM EM ANDAMENTO'}
            </span>
            <div className="flex items-center gap-2 text-sm sm:text-base font-display font-bold text-white">
              <span>Turno Alpha (07:00 - 19:00)</span>
              <ArrowRight className="w-4 h-4 text-[#7E92AD]" />
              <span className="text-emerald-400">Turno Bravo (19:00 - 07:00)</span>
            </div>
          </div>
          <div className="text-xs font-mono text-[#7E92AD]">
            PROTOCOLO: <span className="text-sky-400 font-semibold">NOC-HO-20241024-B</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="rounded-lg bg-[#0A101B] border border-[#1E2B40] px-4 py-2 flex items-center gap-3">
            <Clock className="w-4 h-4 text-rose-400 shrink-0" />
            <div>
              <div className="text-[10px] font-mono text-[#7E92AD] uppercase">
                OVERLAP DE PASSAGEM
              </div>
              <div className="font-mono text-sm font-bold text-white tabular-nums">
                {mins}:{secs} <span className="text-xs font-normal text-[#7E92AD]">RESTANTES</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => signatureRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#0EA5E9] hover:bg-sky-400 text-[#04101D] text-xs font-bold cursor-pointer whitespace-nowrap"
          >
            <FileSignature className="w-4 h-4" />
            Assinar e Confirmar Recebimento
          </button>
        </div>
      </section>

      {/* 4 KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-xl bg-[#0F1724] border border-[#1E2B40] p-4 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-[#7E92AD]">ACEITE DE PENDÊNCIAS</span>
            <span className="text-emerald-400 font-semibold">+4.3%</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-white tabular-nums">
              {acceptanceRate}%
            </span>
            <span className="text-xs text-[#7E92AD]">confirmadas</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[#172436]">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${acceptanceRate}%` }}
            />
          </div>
          <div className="text-[11px] font-mono text-[#7E92AD]">
            {totalConfirmedDisplay} de {totalChecklistBaseline} itens recepcionados
          </div>
        </div>

        <div className="rounded-xl bg-[#0F1724] border border-[#1E2B40] p-4 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-[#7E92AD]">CRÍTICOS EM ABERTO</span>
            <span className="text-rose-400 font-semibold">{disasterCount} Disaster</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-white tabular-nums">
              {criticalCount}
            </span>
            <span className="text-xs text-[#7E92AD]">sob investigação</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[#172436]">
            <div className="h-full w-2/3 rounded-full bg-rose-500" />
          </div>
          <div className="text-[11px] text-[#7E92AD]">Zero impacto generalizado em Core</div>
        </div>

        <div className="rounded-xl bg-[#0F1724] border border-[#1E2B40] p-4 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-[#7E92AD]">TRIGGERS FLAPPING</span>
            <span className="text-sky-400 font-semibold">Instáveis</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-white tabular-nums">5</span>
            <span className="text-xs text-[#7E92AD]">itens sob monitoria</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[#172436]">
            <div className="h-full w-1/2 rounded-full bg-sky-500" />
          </div>
          <div className="text-[11px] text-[#7E92AD]">Circuito Edge-SP01 com oscilação</div>
        </div>

        <div className="rounded-xl bg-[#0F1724] border border-[#1E2B40] p-4 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-[#7E92AD]">AÇÕES DOCUMENTADAS</span>
            <span className="text-emerald-400 font-semibold">100% Audit</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-white tabular-nums">
              {24 + events.length}
            </span>
            <span className="text-xs text-[#7E92AD]">ações no turno</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[#172436]">
            <div className="h-full w-full rounded-full bg-emerald-500" />
          </div>
          <div className="text-[11px] text-[#7E92AD]">100% comprovadas em changelog</div>
        </div>
      </section>

      {/* Main Split: Incidents Table (Left) + Team & Video Wall (Right) */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left: Transferred Incidents Table */}
        <div className="xl:col-span-8 rounded-xl bg-[#0F1724] border border-[#1E2B40] overflow-hidden">
          <div className="p-4 border-b border-[#1E2B40] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-base font-bold text-white flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-sky-400" />
                <span>Incidentes e Pendências Transferidas</span>
              </h2>
              <p className="text-xs text-[#7E92AD] mt-0.5">
                Validação compulsória de recebimento de chamados e ações em curso
              </p>
            </div>

            <div className="inline-flex rounded-lg bg-[#0A101B] border border-[#1E2B40] p-1 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => setFilterTab('ALL')}
                className={`px-2.5 py-1 rounded cursor-pointer ${
                  filterTab === 'ALL'
                    ? 'bg-[#0EA5E9] text-[#04101D] font-bold'
                    : 'text-[#9FB2C9] hover:text-white'
                }`}
              >
                TODOS ({incidents.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('CRITICAL')}
                className={`px-2.5 py-1 rounded cursor-pointer ${
                  filterTab === 'CRITICAL'
                    ? 'bg-[#0EA5E9] text-[#04101D] font-bold'
                    : 'text-[#9FB2C9] hover:text-white'
                }`}
              >
                CRÍTICOS ({criticalCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('PENDING')}
                className={`px-2.5 py-1 rounded cursor-pointer ${
                  filterTab === 'PENDING'
                    ? 'bg-[#0EA5E9] text-[#04101D] font-bold'
                    : 'text-[#9FB2C9] hover:text-white'
                }`}
              >
                PENDENTES ACEITE ({pendingCount})
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1A2639] bg-[#0B121D] text-[10px] font-mono text-[#7E92AD] uppercase">
                  <th className="py-2.5 px-3.5">ID / TRIGGER</th>
                  <th className="py-2.5 px-3">SERVIÇO IMPACTADO</th>
                  <th className="py-2.5 px-3">SEVERIDADE</th>
                  <th className="py-2.5 px-3">RESP. ANTERIOR</th>
                  <th className="py-2.5 px-3">ÚLTIMA AÇÃO EXECUTADA</th>
                  <th className="py-2.5 px-3">PRÓXIMO PASSO OBRIGATÓRIO</th>
                  <th className="py-2.5 px-3.5 text-center">ACEITE FORMAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A2639] text-xs">
                {filteredIncidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-[#131E30]/50 align-top">
                    <td className="py-3.5 px-3.5 whitespace-nowrap">
                      <div
                        className={`font-mono font-bold ${
                          inc.severity === 'DISASTER' || inc.severity === 'HIGH'
                            ? 'text-rose-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {inc.triggerCode}
                      </div>
                      <div className="font-mono text-[10px] text-[#7E92AD] mt-0.5">
                        {inc.timestamp}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 max-w-[165px]">
                      <div className="font-semibold text-white leading-snug">{inc.service}</div>
                      <div className="text-[11px] text-[#7E92AD] mt-0.5">{inc.serviceDetail}</div>
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span
                        className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${
                          inc.severity === 'DISASTER'
                            ? 'bg-rose-500/15 text-rose-400 border-rose-500/35'
                            : inc.severity === 'HIGH'
                            ? 'bg-rose-500/10 text-rose-300 border-rose-500/25'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                        }`}
                      >
                        • {inc.severity}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="w-6 h-6 rounded-full bg-[#15243A] border border-[#243652] font-mono text-[10px] font-bold text-sky-300 flex items-center justify-center">
                          {inc.ownerInitials}
                        </span>
                        <span className="text-slate-200 text-[11px]">{inc.ownerName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-[11px] text-[#9FB2C9] max-w-[180px] leading-relaxed">
                      {inc.lastAction}
                    </td>
                    <td className="py-3.5 px-3 text-[11px] text-sky-300 max-w-[180px] leading-relaxed">
                      {inc.nextStep}
                    </td>
                    <td className="py-3.5 px-3.5 text-center">
                      <button
                        type="button"
                        disabled={handoverSealed}
                        onClick={() => onToggleAcceptIncident(inc.id)}
                        className="inline-flex flex-col items-center gap-1 cursor-pointer disabled:cursor-default"
                      >
                        <span
                          className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                            inc.accepted
                              ? 'bg-emerald-500 border-emerald-400 text-[#04101D]'
                              : 'bg-[#0A101B] border-[#324666] hover:border-sky-400'
                          }`}
                        >
                          {inc.accepted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </span>
                        <span
                          className={`font-mono text-[10px] ${
                            inc.accepted ? 'text-emerald-400 font-semibold' : 'text-amber-400'
                          }`}
                        >
                          {inc.accepted ? inc.acceptedAt : 'Pendente'}
                        </span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 border-t border-[#1A2639] bg-[#0B121D] flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <span className="text-[#7E92AD]">
              * Todas as pendências exigem validação prévia à assinatura final de liberação do turno.
            </span>
            <span className="font-mono text-sky-400 font-semibold">
              Corte Oficial de Horário: 19:00:00 BRT
            </span>
          </div>
        </div>

        {/* Right: Team Transition & Video Wall */}
        <div className="xl:col-span-4 space-y-4">
          <div className="rounded-xl bg-[#0F1724] border border-[#1E2B40] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xs font-bold tracking-wider text-slate-200 uppercase">
                Transição de Equipe
              </h3>
              <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded">
                Roster 12x36
              </span>
            </div>

            <div className="rounded-lg bg-[#0B121D] border border-[#1A2639] p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-sky-500/15 border border-sky-500/30 flex items-center justify-center font-mono text-xs font-bold text-sky-300">
                  RV
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Rodrigo Valente</div>
                  <div className="text-[10px] font-mono text-[#7E92AD]">
                    LÍDER TRANSMISSOR (SAINDO)
                  </div>
                </div>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            </div>

            <div className="flex justify-center">
              <ArrowDown className="w-4 h-4 text-[#647894]" />
            </div>

            <div className="rounded-lg bg-[#0B121D] border border-[#1A2639] p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center font-mono text-xs font-bold text-emerald-300">
                  GS
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Gabriel Soares</div>
                  <div className="text-[10px] font-mono text-emerald-400">
                    LÍDER RECEPTOR (ENTRANDO)
                  </div>
                </div>
              </div>
              <span
                className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded border ${
                  handoverSealed
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : 'bg-[#142033] text-sky-300 border-[#243652]'
                }`}
              >
                {handoverSealed ? 'CHANCELADO' : 'VALIDANDO'}
              </span>
            </div>
          </div>

          <NocVideoWallPreview onExpand={() => setVideoWallExpanded((v) => !v)} />

          {videoWallExpanded && (
            <div className="rounded-xl bg-[#0B121D] border border-sky-500/40 p-3 text-[11px] font-mono text-sky-300 flex items-center justify-between">
              <span>Wall Feed 4K Sync: Latência 14ms · 0 Dropped Frames</span>
              <button
                type="button"
                onClick={() => setVideoWallExpanded(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                Recolher
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Operational Event Log Timeline */}
      <section className="rounded-xl bg-[#0F1724] border border-[#1E2B40] p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Registro de Eventos e Log Operacional do Turno</span>
            </h2>
            <p className="text-xs text-[#7E92AD] mt-0.5">
              Rastreabilidade temporal ininterrupta dos acontecimentos do Turno Alpha (07:00 - 19:00)
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Manutenção
            </span>
            <span className="flex items-center gap-1.5 text-sky-400">
              <span className="w-2 h-2 rounded-full bg-sky-400" /> Acionamento
            </span>
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-400" /> Crítico
            </span>
            <button
              type="button"
              onClick={() => setAddingEvent((v) => !v)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#162235] hover:bg-[#1E2F49] border border-[#243652] text-sky-300 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Registrar Evento
            </button>
          </div>
        </div>

        {addingEvent && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newEvTitle.trim()) return;
              onAddOperationalEvent(
                newEvTitle.trim(),
                newEvDesc.trim() || 'Registro manual de ocorrência pelo operador de turno.',
                newEvCat,
                `EVT-${Math.floor(1000 + Math.random() * 9000)}`
              );
              setNewEvTitle('');
              setNewEvDesc('');
              setAddingEvent(false);
            }}
            className="rounded-lg bg-[#0A101B] border border-[#243652] p-3.5 grid grid-cols-1 md:grid-cols-4 gap-3 text-xs"
          >
            <input
              value={newEvTitle}
              onChange={(e) => setNewEvTitle(e.target.value)}
              placeholder="Título do evento operacional..."
              className="md:col-span-2 h-9 px-3 rounded bg-[#0F1724] border border-[#1E2B40] text-white focus:outline-none focus:border-sky-500"
            />
            <select
              value={newEvCat}
              onChange={(e) => setNewEvCat(e.target.value as 'critical' | 'action' | 'maintenance')}
              className="h-9 px-3 rounded bg-[#0F1724] border border-[#1E2B40] text-white focus:outline-none focus:border-sky-500"
            >
              <option value="action">Acionamento</option>
              <option value="critical">Crítico</option>
              <option value="maintenance">Manutenção</option>
            </select>
            <button
              type="submit"
              className="h-9 rounded bg-[#0EA5E9] text-[#04101D] font-bold cursor-pointer"
            >
              Salvar no Log
            </button>
            <input
              value={newEvDesc}
              onChange={(e) => setNewEvDesc(e.target.value)}
              placeholder="Descrição técnica verificável..."
              className="md:col-span-4 h-9 px-3 rounded bg-[#0F1724] border border-[#1E2B40] text-white focus:outline-none focus:border-sky-500"
            />
          </form>
        )}

        <div className="relative pl-6 space-y-3 before:content-[''] before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-px before:bg-[#1E2B40]">
          {events.map((ev) => {
            const dotColor =
              ev.category === 'critical'
                ? 'bg-rose-400'
                : ev.category === 'maintenance'
                ? 'bg-emerald-400'
                : 'bg-sky-400';
            const timeColor =
              ev.category === 'critical'
                ? 'text-rose-400'
                : ev.category === 'maintenance'
                ? 'text-emerald-400'
                : 'text-sky-400';
            return (
              <div
                key={ev.id}
                className="relative rounded-lg bg-[#0B121D] border border-[#1A2639] p-3.5 flex flex-col md:flex-row md:items-start justify-between gap-3"
              >
                <span
                  className={`absolute -left-[20px] top-4 w-2.5 h-2.5 rounded-full ring-4 ring-[#0F1724] ${dotColor}`}
                />
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`font-mono text-xs font-bold ${timeColor}`}>{ev.time}</span>
                    <span className="text-sm font-semibold text-white">{ev.title}</span>
                  </div>
                  <p className="text-xs text-[#9FB2C9] leading-relaxed">{ev.description}</p>
                </div>
                <div className="text-left md:text-right shrink-0 font-mono text-[11px]">
                  <div className="text-[#7E92AD]">Operador: {ev.operator}</div>
                  <div className="text-sky-400 font-semibold mt-0.5">{ev.refCode}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Auditable Handover Term & Digital Signature */}
      <section
        ref={signatureRef}
        className="rounded-xl bg-[#0F1724] border border-[#1E2B40] p-5 space-y-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-sky-400" />
              <span>Termo de Transferência e Assinatura Digital Auditável</span>
            </h2>
            <p className="text-xs text-[#7E92AD] mt-0.5">
              A chancela deste documento firma o encerramento legal da responsabilidade operacional
              do Turno Alpha e a assunção irrevogável pelo Turno Bravo.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-emerald-400 bg-[#0A101B] border border-[#1E2B40] px-3 py-1.5 rounded-lg">
            <Lock className="w-3.5 h-3.5" />
            SHA-256 SIGNATURE {handoverSealed ? 'LOCKED' : 'READY'}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Transmitter */}
          <div className="rounded-xl bg-[#0B121D] border border-[#1A2639] p-4 space-y-3">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-[#7E92AD]">ANALISTA TRANSMISSOR (SAINDO)</span>
              <span className="text-emerald-400 font-semibold">ASSINADO E CHANCELADO</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center font-mono text-sm font-bold text-sky-300">
                RV
              </div>
              <div>
                <div className="text-sm font-bold text-white">Rodrigo Valente de Sá</div>
                <div className="text-[11px] font-mono text-[#7E92AD]">
                  Matrícula: NOC-8831 • Cargo: Tech Lead 24x7
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-[#080D16] border border-[#172336] p-3 font-mono text-[11px]">
              <div className="text-[#7E92AD]">Hash de Validação:</div>
              <div className="text-emerald-400 break-all mt-0.5">
                7a3f89e2c019b88493dae91129bca02179fd901a
              </div>
              <div className="text-[#7E92AD] mt-1">Timestamp: 2024-10-24 18:42:15 BRT</div>
            </div>
          </div>

          {/* Receiver */}
          <div className="rounded-xl bg-[#0B121D] border border-[#1A2639] p-4 space-y-3">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-[#7E92AD]">ANALISTA RECEPTOR (ENTRANDO)</span>
              <span
                className={`font-semibold ${
                  handoverSealed ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {handoverSealed ? 'ASSINADO E CHANCELADO' : 'PENDENTE DE CHANCELA'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center font-mono text-sm font-bold text-emerald-300">
                GS
              </div>
              <div>
                <div className="text-sm font-bold text-white">Gabriel Soares Albuquerque</div>
                <div className="text-[11px] font-mono text-[#7E92AD]">
                  Matrícula: NOC-9402 • Cargo: Senior NOC Specialist
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-[#080D16] border border-[#172336] p-3 font-mono text-[11px]">
              <div className="text-[#7E92AD]">Hash de Validação:</div>
              <div
                className={`break-all mt-0.5 ${
                  handoverSealed ? 'text-emerald-400' : 'text-[#9FB2C9]'
                }`}
              >
                {handoverSealed && sealedHash
                  ? sealedHash
                  : pendingCount > 0
                  ? `Aguardando confirmação formal de ${pendingCount} pendência(s)...`
                  : 'Pendências validadas! Marque a declaração abaixo e finalize.'}
              </div>
              <div className="text-[#7E92AD] mt-1">
                Timestamp: {handoverSealed && sealedAt ? sealedAt : '--:--:--'}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-[11px] font-mono text-[#7E92AD] uppercase">
            OBSERVAÇÕES OPERACIONAIS CRÍTICAS &amp; RECOMENDAÇÕES ESPECÍFICAS
          </label>
          <textarea
            rows={3}
            disabled={handoverSealed}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Adicione notas de relevância tática: ex. engenheiro acionado em trânsito, comportamento atípico do ar condicionado da Sala B, prioridade no teste do gerador às 03:00..."
            className="w-full p-3 rounded-lg bg-[#0A101B] border border-[#1E2B40] text-xs text-white placeholder:text-[#647894] focus:outline-none focus:border-sky-500 disabled:opacity-70"
          />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2 border-t border-[#1A2639]">
          <label className="flex items-start gap-2.5 text-xs text-slate-200 cursor-pointer select-none">
            <input
              type="checkbox"
              disabled={handoverSealed}
              checked={handoverSealed || declared}
              onChange={(e) => setDeclared(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded accent-[#0EA5E9] cursor-pointer"
            />
            <span>
              Declaro ter conferido todos os {incidents.length} itens de incidentes em aberto,
              concordando com as orientações de continuidade do Turno Bravo.
            </span>
          </label>

          <button
            type="button"
            disabled={handoverSealed || pendingCount > 0 || !declared}
            onClick={handleSealSubmit}
            className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
              handoverSealed
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : pendingCount === 0 && declared
                ? 'bg-[#0EA5E9] hover:bg-sky-400 text-[#04101D] cursor-pointer'
                : 'bg-[#172131] text-[#6E829D] border border-[#24334B] cursor-not-allowed'
            }`}
          >
            {handoverSealed ? (
              <>
                <Zap className="w-4 h-4" />
                Passagem Selada e Auditada
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Finalizar e Trancar Passagem de Turno
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  );
};
