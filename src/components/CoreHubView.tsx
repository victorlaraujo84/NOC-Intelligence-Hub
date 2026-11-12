import React, { useMemo, useState } from 'react';
import {
  Activity,
  ArrowRightLeft,
  BellRing,
  CheckCircle2,
  Cpu,
  Download,
  Filter,
  Link2,
  Megaphone,
  Monitor,
  PhoneCall,
  Search,
  Server,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { AuditLogEntry, MicroserviceStatus, PriorityAlert } from '../types/noc';
import { CoreTopologyGraph } from './VisualGraphics';

interface CoreHubViewProps {
  microservices: MicroserviceStatus[];
  alerts: PriorityAlert[];
  auditLogs: AuditLogEntry[];
  alertFilter: 'ALL' | 'HIGH+';
  onAlertFilterChange: (f: 'ALL' | 'HIGH+') => void;
  onAcknowledgeAlert: (id: string) => void;
  onTransferAlertToShift: (alert: PriorityAlert) => void;
  onEscalateAlertN3: (alert: PriorityAlert) => void;
  onOpenBroadcast: () => void;
  onInspectService: (service: MicroserviceStatus) => void;
  auditSectionRef: React.RefObject<HTMLDivElement | null>;
}

export const CoreHubView: React.FC<CoreHubViewProps> = ({
  microservices,
  alerts,
  auditLogs,
  alertFilter,
  onAlertFilterChange,
  onAcknowledgeAlert,
  onTransferAlertToShift,
  onEscalateAlertN3,
  onOpenBroadcast,
  onInspectService,
  auditSectionRef,
}) => {
  const [auditQuery, setAuditQuery] = useState('');
  const [auditPage, setAuditPage] = useState(1);
  const [autoAckEnabled, setAutoAckEnabled] = useState(false);

  const visibleAlerts = useMemo(() => {
    return alerts.filter((a) => {
      if (alertFilter === 'HIGH+') {
        return a.severity === 'HIGH SEVERITY' || a.severity === 'DISASTER';
      }
      return true;
    });
  }, [alerts, alertFilter]);

  const filteredAudit = useMemo(() => {
    const q = auditQuery.trim().toLowerCase();
    if (!q) return auditLogs;
    return auditLogs.filter(
      (log) =>
        log.operator.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.originIp.toLowerCase().includes(q) ||
        log.role.toLowerCase().includes(q)
    );
  }, [auditLogs, auditQuery]);

  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(filteredAudit.length / pageSize));
  const pagedAudit = filteredAudit.slice((auditPage - 1) * pageSize, auditPage * pageSize);

  const handleExportAuditCsv = () => {
    const header = 'Timestamp,Operator,Role,Action,OriginIP,Status\n';
    const rows = filteredAudit
      .map(
        (l) =>
          `"${l.timestamp}","${l.operator}","${l.role}","${l.action.replace(/"/g, '""')}","${l.originIp}","${l.status}"`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'noc-audit-log.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeAlertCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="space-y-6">
      {/* Top Hero Header */}
      <section className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
            <span className="text-sky-400 font-semibold tracking-wider">
              NOC CONTROL COMMAND / STATION 01
            </span>
            <span className="text-[#4E617C]">·</span>
            <span className="text-emerald-400 font-medium">STREAM SYNCHRONIZED</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white text-balance">
            Painel de Missão Crítica • Visão Geral 24x7
          </h1>
          <p className="text-sm text-[#9FB2C9] leading-relaxed">
            Boas-vindas, <span className="text-sky-400 font-medium">Rodrigo Valente</span>. O turno
            Alpha está operando em plena conformidade. 0 incidentes de desastre em curso, telemetria
            analítica com amostragem nominal e 100% dos slots de prontidão cobertos.
          </p>
        </div>

        {/* Right Telemetry Cluster + Broadcast CTA */}
        <div className="rounded-xl bg-[#0F1724] border border-[#1E2B40] p-4 flex flex-col sm:flex-row sm:items-center gap-4 shrink-0">
          <div className="grid grid-cols-2 gap-4 pr-2">
            <div>
              <div className="text-[10px] font-mono text-[#7E92AD] uppercase">PIPELINE LATENCY</div>
              <div className="font-mono text-base font-bold text-emerald-400 tabular-nums mt-0.5">
                142ms <span className="text-xs font-normal text-[#7E92AD]">(P95)</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-[#7E92AD] uppercase">CLUSTER HASH</div>
              <div className="font-mono text-base font-bold text-sky-400 tabular-nums mt-0.5">
                0x7F9B-NOC-V4
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenBroadcast}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#0EA5E9] hover:bg-sky-400 text-[#04101D] text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Megaphone className="w-4 h-4" />
            Broadcast Geral
          </button>
        </div>
      </section>

      {/* Federation of Microservices */}
      <section className="rounded-xl bg-[#0F1724] border border-[#1E2B40] p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-200 uppercase">
            <Server className="w-3.5 h-3.5 text-sky-400" />
            <span>Federação de Microsserviços &amp; Core Daemons</span>
          </div>
          <span className="text-[11px] font-mono text-[#7E92AD]">
            Healthcheck: interval 5s • jitter ±0.8ms
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2.5">
          {microservices.map((svc) => (
            <button
              key={svc.id}
              type="button"
              onClick={() => onInspectService(svc)}
              className="text-left rounded-lg bg-[#0B121D] border border-[#1B283C] hover:border-sky-500/40 p-3 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span className="text-xs font-semibold text-white truncate">{svc.name}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                <span className="text-emerald-400 font-semibold">{svc.status}</span>
                <span className="text-[#7E92AD] tabular-nums">{svc.latency}</span>
              </div>
              <div className="text-[10px] font-mono text-[#6E829D] truncate">{svc.detail}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Master Telemetry KPIs */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-sm font-bold tracking-wide text-white uppercase">
            KPIs Mestres de Telemetria Operacional
          </h2>
          <span className="text-[11px] font-mono text-[#7E92AD]">
            Intervalo: Turno Vigente (07:00 - 19:00 UTC-3)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Card 1: Active Alerts */}
          <div className="rounded-xl bg-[#0F1724] border border-[#1E2B40] p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#7E92AD]">
              <span>ALERTAS ATIVOS</span>
              <BellRing className="w-4 h-4 text-rose-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2.5">
              <span className="font-mono text-3xl font-bold text-white tabular-nums">
                {26 + activeAlertCount}
              </span>
              <span className="text-[11px] font-mono font-medium text-emerald-400">
                -14% vs. 1h atrás
              </span>
            </div>
            <div className="mt-4">
              <div className="h-1.5 w-full rounded-full bg-[#172436] overflow-hidden flex gap-0.5">
                <div className="w-[22%] bg-rose-500" />
                <div className="w-[40%] bg-amber-400" />
                <div className="w-[26%] bg-sky-500" />
                <div className="w-[12%] bg-slate-500" />
              </div>
              <div className="grid grid-cols-5 text-center font-mono text-[10px] mt-2 text-[#9FB2C9]">
                <div>
                  <div className="text-rose-400 font-bold">0</div>
                  <div className="text-[#647894]">DIS</div>
                </div>
                <div>
                  <div className="text-rose-400 font-bold">6</div>
                  <div className="text-[#647894]">HIGH</div>
                </div>
                <div>
                  <div className="text-emerald-400 font-bold">12</div>
                  <div className="text-[#647894]">WARN</div>
                </div>
                <div>
                  <div className="text-sky-400 font-bold">8</div>
                  <div className="text-[#647894]">AVG</div>
                </div>
                <div>
                  <div className="text-slate-300 font-bold">3</div>
                  <div className="text-[#647894]">INFO</div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Resolution in Shift */}
          <div className="rounded-xl bg-[#0F1724] border border-[#1E2B40] p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#7E92AD]">
              <span>RESOLUÇÃO NO TURNO</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2.5">
              <span className="font-mono text-3xl font-bold text-white tabular-nums">94.2%</span>
              <span className="text-xs font-mono text-[#7E92AD]">162 / 172 resolvidos</span>
            </div>
            <div className="mt-3">
              <svg viewBox="0 0 200 36" className="w-full h-9">
                <polyline
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points="4,28 38,24 72,22 106,15 140,16 174,10 196,12"
                />
              </svg>
              <div className="flex items-center justify-between text-[11px] font-mono mt-1">
                <span className="text-[#7E92AD]">MTTR Médio: 11m 40s</span>
                <span className="text-emerald-400 font-semibold">Meta: 90%</span>
              </div>
            </div>
          </div>

          {/* Card 3: Standby Posts */}
          <div className="rounded-xl bg-[#0F1724] border border-[#1E2B40] p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#7E92AD]">
              <span>POSTOS EM PRONTIDÃO</span>
              <Users className="w-4 h-4 text-sky-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2.5">
              <span className="font-mono text-3xl font-bold text-white tabular-nums">8 / 8</span>
              <span className="text-[11px] font-mono font-semibold text-emerald-400">
                100% COBERTO
              </span>
            </div>
            <div className="mt-4">
              <div className="grid grid-cols-8 gap-1">
                {['01', '02', '03', '04', '05', '06', '07', 'LEAD'].map((slot) => (
                  <div
                    key={slot}
                    className={`h-7 rounded flex items-center justify-center font-mono text-[10px] font-bold border ${
                      slot === 'LEAD'
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                        : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    }`}
                  >
                    {slot}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono mt-2.5 text-[#7E92AD]">
                <span>Escala: 12x36 Matutino</span>
                <span className="text-slate-200">Próx. Troca: 19:00</span>
              </div>
            </div>
          </div>

          {/* Card 4: Pipeline & API Ingest */}
          <div className="rounded-xl bg-[#0F1724] border border-[#1E2B40] p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#7E92AD]">
              <span>PIPELINE &amp; API INGEST</span>
              <Activity className="w-4 h-4 text-sky-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2.5">
              <span className="font-mono text-3xl font-bold text-white tabular-nums">142ms</span>
              <span className="text-[11px] font-mono font-medium text-emerald-400">
                ↓ 8ms jitter
              </span>
            </div>
            <div className="mt-3 space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-[#7E92AD]">Throughput Ingest:</span>
                <span className="font-mono font-semibold text-sky-400 tabular-nums">
                  1,480 ev/s
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[#172436] overflow-hidden">
                <div className="h-full w-[64%] bg-sky-500 rounded-full" />
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono pt-1">
                <span className="text-[#7E92AD]">Fila Kafka: 0 msg</span>
                <span className="text-emerald-400 font-semibold">Capacidade: 98% livre</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main 2-Column Workspace: Adapters Left + Real-Time Priority Alerts Right */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Adapters & Ingestion */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-sky-400" />
              <span>Adapters &amp; Ingestion</span>
            </h2>
            <span className="font-mono text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 rounded">
              3 CONNECTED
            </span>
          </div>

          {/* Zabbix-Analyzer */}
          <div className="rounded-xl bg-[#0F1724] border border-[#1E2B40] p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-display text-sm font-bold text-white">Zabbix-Analyzer</h3>
                <div className="text-[10px] font-mono text-[#7E92AD]">
                  INGESTION STREAM • CLUSTER ZBX-PRD
                </div>
              </div>
              <span className="font-mono text-[11px] font-semibold text-sky-400 bg-sky-500/10 border border-sky-500/25 px-2 py-0.5 rounded">
                1.4k ev/s
              </span>
            </div>
            <div className="space-y-1.5 text-xs border-t border-[#1A2639] pt-2.5">
              <div className="flex justify-between">
                <span className="text-[#7E92AD]">Triggers Processadas:</span>
                <span className="font-mono font-semibold text-white">1,842,910 / 24h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7E92AD]">Loss Rate:</span>
                <span className="font-mono font-semibold text-emerald-400">0.000%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7E92AD]">Polling Sync:</span>
                <span className="font-mono text-sky-400">HTTP Event Collector v2</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono pt-1 border-t border-[#1A2639]">
              <span className="text-[#647894]">Último sync: agora</span>
              <span className="text-emerald-400 font-semibold">Status: STREAM ATIVO</span>
            </div>
          </div>

          {/* Triggers Factory */}
          <div className="rounded-xl bg-[#0F1724] border border-[#1E2B40] p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-display text-sm font-bold text-white">Triggers Factory</h3>
                <div className="text-[10px] font-mono text-[#7E92AD]">
                  QUALITY &amp; FLAPPING ENGINE
                </div>
              </div>
              <span className="font-mono text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded">
                SYNC: 2m
              </span>
            </div>
            <div className="space-y-1.5 text-xs border-t border-[#1A2639] pt-2.5">
              <div className="flex justify-between">
                <span className="text-[#7E92AD]">Regras Flapping Ativas:</span>
                <span className="font-mono font-semibold text-white">34 supressões</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7E92AD]">Falsos Positivos Filtrados:</span>
                <span className="font-mono font-semibold text-emerald-400">19.4% do ruído</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7E92AD]">Engine Mode:</span>
                <span className="font-mono text-slate-200">Automated Heuristic</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono pt-1 border-t border-[#1A2639]">
              <span className="text-[#647894]">Ruleset: v4.8-telecom</span>
              <span className="text-emerald-400 font-semibold">Status: SINCRONIZADO</span>
            </div>
          </div>

          {/* OperaDash */}
          <div className="rounded-xl bg-[#0F1724] border border-[#1E2B40] p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-display text-sm font-bold text-white">OperaDash</h3>
                <div className="text-[10px] font-mono text-[#7E92AD]">
                  WALL &amp; UNIFIED TELEMETRY
                </div>
              </div>
              <span className="font-mono text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded">
                ONLINE
              </span>
            </div>
            <div className="space-y-1.5 text-xs border-t border-[#1A2639] pt-2.5">
              <div className="flex justify-between">
                <span className="text-[#7E92AD]">Telas Sincronizadas:</span>
                <span className="font-mono font-semibold text-white">4 x 4K Displays</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7E92AD]">FPS Wall Telemetria:</span>
                <span className="font-mono font-semibold text-sky-400">60.0 FPS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7E92AD]">Layout Ativo:</span>
                <span className="font-mono text-sky-400">WAR_ROOM_ALPHA</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono pt-1 border-t border-[#1A2639]">
              <span className="text-[#647894]">Latência WebSockets: 14ms</span>
              <span className="text-emerald-400 font-semibold">Sessão: IDLE NOMINAL</span>
            </div>
          </div>

          {/* Topology Engine */}
          <CoreTopologyGraph />
        </div>

        {/* Right Column: Real-Time Priority Alerts */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <h2 className="font-display text-base font-bold text-white">
                Alertas Prioritários em Tempo Real
              </h2>
              <span className="font-mono text-[11px] font-semibold text-rose-300 bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded">
                {activeAlertCount} Requerem Ação
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onAlertFilterChange(alertFilter === 'HIGH+' ? 'ALL' : 'HIGH+')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                  alertFilter === 'HIGH+'
                    ? 'bg-sky-500/15 border-sky-500/40 text-sky-300'
                    : 'bg-[#0F1724] border-[#1E2B40] text-slate-300 hover:text-white'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filtrar: {alertFilter}</span>
              </button>
              <button
                type="button"
                onClick={() => setAutoAckEnabled((v) => !v)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                  autoAckEnabled
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                    : 'bg-[#0F1724] border-[#1E2B40] text-slate-300 hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Auto-Acknowledge: {autoAckEnabled ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          </div>

          <div className="space-y-3.5">
            {visibleAlerts.map((alert) => {
              const isHigh = alert.severity !== 'WARNING';
              return (
                <div
                  key={alert.id}
                  className={`rounded-xl border p-4 transition-colors ${
                    alert.acknowledged
                      ? 'bg-[#0C131F] border-[#1B283C] opacity-75'
                      : isHigh
                      ? 'bg-[#121622] border-rose-500/35'
                      : 'bg-[#111824] border-amber-500/35'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
                      <span
                        className={`px-2 py-0.5 rounded font-semibold ${
                          isHigh
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {alert.severity}
                      </span>
                      <span className="text-sky-400 font-semibold">{alert.host}</span>
                      <span className="text-[#7E92AD]">ID: {alert.triggerId}</span>
                    </div>
                    <span className="font-mono text-[11px] text-[#7E92AD]">{alert.activeFor}</span>
                  </div>

                  <h3 className="font-display text-[15px] font-bold text-white leading-snug">
                    {alert.title}
                  </h3>
                  <p className="text-xs text-[#9FB2C9] mt-1.5 leading-relaxed">
                    {alert.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#7E92AD] mt-3 pt-3 border-t border-[#1C283B]">
                    <span>{alert.assignee}</span>
                    <span>·</span>
                    <span>{alert.flapping}</span>
                    {alert.transferred && (
                      <>
                        <span>·</span>
                        <span className="text-sky-400 font-medium">
                          Transferido para Shift Intelligence
                        </span>
                      </>
                    )}
                    {alert.acknowledged && (
                      <>
                        <span>·</span>
                        <span className="text-emerald-400 font-medium">Reconhecido pelo Lead</span>
                      </>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => onAcknowledgeAlert(alert.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#162235] hover:bg-[#1E2F49] border border-[#243652] text-xs font-medium text-slate-200 cursor-pointer"
                    >
                      <Link2 className="w-3.5 h-3.5 text-sky-400" />
                      {alert.acknowledged ? 'Incidente Vinculado' : 'Vincular Incidente'}
                    </button>

                    <button
                      type="button"
                      onClick={() => onTransferAlertToShift(alert)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#162235] hover:bg-[#1E2F49] border border-[#243652] text-xs font-medium text-emerald-300 cursor-pointer"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      {alert.transferred ? 'Na Fila de Handover' : 'Transferir Turno'}
                    </button>

                    <button
                      type="button"
                      onClick={() => onEscalateAlertN3(alert)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer ${
                        isHigh
                          ? 'bg-rose-500/15 hover:bg-rose-500/25 border-rose-500/35 text-rose-300'
                          : 'bg-sky-500/15 hover:bg-sky-500/25 border-sky-500/35 text-sky-300'
                      }`}
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      {isHigh ? 'Acionar Plantão N3' : 'Reconhecer'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Audit Log Section */}
      <section
        ref={auditSectionRef}
        className="rounded-xl bg-[#0F1724] border border-[#1E2B40] overflow-hidden"
      >
        <div className="p-4 border-b border-[#1E2B40] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <span>Trilha de Auditoria Recente do Sistema (Audit Log)</span>
            </h2>
            <p className="text-xs text-[#7E92AD] mt-0.5">
              Eventos imutáveis com carimbo SHA-256 e IP de procedência
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#647894] absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={auditQuery}
                onChange={(e) => {
                  setAuditQuery(e.target.value);
                  setAuditPage(1);
                }}
                placeholder="Filtrar por ação, operador ou IP..."
                className="h-8 pl-8 pr-3 rounded-lg bg-[#0A101B] border border-[#1E2B40] text-xs text-slate-200 placeholder:text-[#647894] focus:outline-none focus:border-sky-500"
              />
            </div>
            <button
              type="button"
              onClick={handleExportAuditCsv}
              className="h-8 px-2.5 rounded-lg bg-[#0A101B] border border-[#1E2B40] hover:border-sky-500/40 text-slate-300 hover:text-white cursor-pointer"
              title="Exportar CSV"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1A2639] bg-[#0B121D] text-[10px] font-mono text-[#7E92AD] uppercase">
                <th className="py-2.5 px-4">TIMESTAMP (UTC-3)</th>
                <th className="py-2.5 px-4">OPERADOR / RESPONSÁVEL</th>
                <th className="py-2.5 px-4">PERFIL / CARGO</th>
                <th className="py-2.5 px-4">AÇÃO EXECUTADA</th>
                <th className="py-2.5 px-4">ORIGEM / IP</th>
                <th className="py-2.5 px-4 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A2639] text-xs">
              {pagedAudit.map((entry) => (
                <tr key={entry.id} className="hover:bg-[#131E30]/60 transition-colors">
                  <td className="py-3 px-4 font-mono text-[11px] text-[#7E92AD] whitespace-nowrap">
                    {entry.timestamp}
                  </td>
                  <td className="py-3 px-4 font-medium text-white whitespace-nowrap">
                    {entry.operator}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] whitespace-nowrap">
                    <span
                      className={
                        entry.roleColor === 'cyan'
                          ? 'text-sky-400 font-semibold'
                          : entry.roleColor === 'emerald'
                          ? 'text-emerald-400 font-semibold'
                          : entry.roleColor === 'sky'
                          ? 'text-cyan-300 font-semibold'
                          : 'text-[#7E92AD]'
                      }
                    >
                      {entry.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-200">
                    {entry.action}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-[#7E92AD] whitespace-nowrap">
                    {entry.originIp}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-[11px] font-semibold text-emerald-400 whitespace-nowrap">
                    • {entry.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-[#1A2639] bg-[#0B121D] flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-[#7E92AD]">
          <div>
            Exibindo {pagedAudit.length} de {filteredAudit.length} eventos auditados nas últimas 24h •{' '}
            <span className="text-emerald-400 font-semibold">SHA-256 Chain Verified: Valid</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={auditPage <= 1}
              onClick={() => setAuditPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded border border-[#1E2B40] text-slate-300 disabled:opacity-40 hover:bg-[#162235] cursor-pointer"
            >
              Anterior
            </button>
            <span className="text-slate-200">
              Página {auditPage} de {totalPages}
            </span>
            <button
              type="button"
              disabled={auditPage >= totalPages}
              onClick={() => setAuditPage((p) => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 rounded border border-[#1E2B40] text-slate-300 disabled:opacity-40 hover:bg-[#162235] cursor-pointer"
            >
              Próxima
            </button>
          </div>
        </div>
      </section>

      {/* Core Footer */}
      <footer className="rounded-xl bg-[#0B121D] border border-[#1A2639] px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-2 text-[11px] font-mono text-[#7E92AD]">
        <div>
          <span className="text-white font-semibold">NOC Intelligence Hub Operational Core v4.2</span>
          <span className="mx-2">·</span>
          <span>SLA Contratual P0/P1: 99.98% • Uptime Contínuo: 412d 18h 44m</span>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-emerald-400">
          <span>Zabbix JSON-RPC 6.4: ONLINE</span>
          <span>NTP Stratum-1: SYNC (&lt; 0.2ms)</span>
          <span>PostgreSQL HA: MASTER</span>
        </div>
      </footer>
    </div>
  );
};
