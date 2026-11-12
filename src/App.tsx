import React, { useMemo, useRef, useState } from 'react';
import {
  INITIAL_ALERTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_HANDOVER_INCIDENTS,
  INITIAL_MICROSERVICES,
  INITIAL_OPERATIONAL_EVENTS,
  INITIAL_ROSTER,
  INITIAL_SWAP_REQUESTS,
  PERFORMANCE_ANALYSTS,
  SSO_CHECKINS,
} from './data/mockNocData';
import {
  AnalystRosterRow,
  AuditLogEntry,
  HandoverIncident,
  MicroserviceStatus,
  ModuleId,
  OperationalEvent,
  PerformanceAnalystMetric,
  PriorityAlert,
  ShiftSwapRequest,
} from './types/noc';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { CoreHubView } from './components/CoreHubView';
import { ShiftManagerView } from './components/ShiftManagerView';
import { ShiftIntelligenceView } from './components/ShiftIntelligenceView';
import { PerformanceIntelView } from './components/PerformanceIntelView';
import {
  BroadcastModal,
  EvidenceTrailModal,
  PlanShiftModal,
  ServiceDetailModal,
  SpikeAuditModal,
} from './components/Modals';

function formatAuditNow(): string {
  const now = new Date();
  const pad = (n: number, len = 2) => String(n).padStart(len, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(
    now.getHours()
  )}:${pad(now.getMinutes())}:${pad(now.getSeconds())}.${pad(now.getMilliseconds(), 3)}`;
}

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleId>('core-hub');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Shared cross-module operational state
  const [microservices] = useState<MicroserviceStatus[]>(INITIAL_MICROSERVICES);
  const [alerts, setAlerts] = useState<PriorityAlert[]>(INITIAL_ALERTS);
  const [alertFilter, setAlertFilter] = useState<'ALL' | 'HIGH+'>('ALL');
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);

  const [roster, setRoster] = useState<AnalystRosterRow[]>(INITIAL_ROSTER);
  const [swapRequests, setSwapRequests] = useState<ShiftSwapRequest[]>(INITIAL_SWAP_REQUESTS);

  const [handoverIncidents, setHandoverIncidents] = useState<HandoverIncident[]>(
    INITIAL_HANDOVER_INCIDENTS
  );
  const [operationalEvents, setOperationalEvents] = useState<OperationalEvent[]>(
    INITIAL_OPERATIONAL_EVENTS
  );
  const [handoverSealed, setHandoverSealed] = useState(false);
  const [sealedHash, setSealedHash] = useState<string | null>(null);
  const [sealedAt, setSealedAt] = useState<string | null>(null);

  // Modals & Toast Feedback
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [planShiftOpen, setPlanShiftOpen] = useState(false);
  const [inspectedService, setInspectedService] = useState<MicroserviceStatus | null>(null);
  const [inspectedAnalyst, setInspectedAnalyst] = useState<PerformanceAnalystMetric | null>(null);
  const [spikeAuditOpen, setSpikeAuditOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const auditSectionRef = useRef<HTMLDivElement | null>(null);

  const notify = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((curr) => (curr === msg ? null : curr));
    }, 3600);
  };

  const appendAudit = (
    action: string,
    status: AuditLogEntry['status'] = 'SUCCESS',
    operator = 'Rodrigo Valente',
    role = 'ADMIN / NOC LEAD'
  ) => {
    const newEntry: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      timestamp: formatAuditNow(),
      operator,
      role,
      roleColor: 'cyan',
      action,
      originIp: '10.240.12.8 (VPN-HQ-LEAD)',
      status,
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  // Global search index across all 4 modules
  const searchableItems = useMemo(() => {
    const items = [
      ...alerts.map((a) => ({
        id: a.id,
        label: `${a.triggerId} • ${a.host}`,
        sublabel: a.title,
        module: 'core-hub' as ModuleId,
      })),
      ...handoverIncidents.map((h) => ({
        id: h.id,
        label: `${h.triggerCode} • ${h.service}`,
        sublabel: h.lastAction,
        module: 'shift-intelligence' as ModuleId,
      })),
      ...roster.map((r) => ({
        id: r.id,
        label: `${r.name} (${r.regime})`,
        sublabel: r.role,
        module: 'shift-manager' as ModuleId,
      })),
      ...PERFORMANCE_ANALYSTS.map((p) => ({
        id: p.id,
        label: `${p.name} • Scorecard ${p.docScore}`,
        sublabel: `${p.verifiedActions} ações verificadas · MTTR ${p.mttrMin}m`,
        module: 'performance-intel' as ModuleId,
      })),
    ];
    return items;
  }, [alerts, handoverIncidents, roster]);

  // Core Hub Handlers
  const handleAcknowledgeAlert = (id: string) => {
    const target = alerts.find((a) => a.id === id);
    if (!target) return;
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
    );
    appendAudit(`LINK_INCIDENT: ${target.triggerId} (${target.host})`, 'COMMITTED');
    notify(`Incidente vinculado ao alerta ${target.triggerId}.`);
  };

  const handleTransferAlertToShift = (alert: PriorityAlert) => {
    if (alert.transferred) {
      setActiveModule('shift-intelligence');
      return;
    }
    setAlerts((prev) =>
      prev.map((a) => (a.id === alert.id ? { ...a, transferred: true } : a))
    );
    const newHandover: HandoverIncident = {
      id: `ho-${Date.now()}`,
      triggerCode: alert.triggerId.replace('#', 'ZBX-'),
      timestamp: 'Transferido agora',
      service: alert.host,
      serviceDetail: alert.title.slice(0, 48),
      severity: alert.severity === 'WARNING' ? 'HIGH' : alert.severity === 'DISASTER' ? 'DISASTER' : 'HIGH',
      ownerInitials: 'RV',
      ownerName: 'R. Valente',
      lastAction: alert.description.slice(0, 88),
      nextStep: 'Validar estabilização durante sobreposição do Turno Bravo.',
      accepted: false,
    };
    setHandoverIncidents((prev) => [newHandover, ...prev]);
    appendAudit(`TRANSFER_HANDOVER: ${alert.triggerId} enviado ao Shift Intelligence`, 'DISPATCHED');
    notify(`${alert.triggerId} transferido para a fila de passagem de turno.`);
  };

  const handleEscalateAlertN3 = (alert: PriorityAlert) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alert.id ? { ...a, acknowledged: true } : a))
    );
    const isHigh = alert.severity !== 'WARNING';
    appendAudit(
      isHigh
        ? `ESCALATE_N3: Plantão acionado para ${alert.triggerId}`
        : `ACK_WARNING: ${alert.triggerId} reconhecido`,
      isHigh ? 'DISPATCHED' : 'COMMITTED'
    );
    notify(
      isHigh
        ? `Plantão N3 acionado para ${alert.host}.`
        : `Alerta ${alert.triggerId} reconhecido com sucesso.`
    );
  };

  const handleSendBroadcast = (message: string, target: string) => {
    appendAudit(`BROADCAST [${target}]: ${message.slice(0, 64)}`, 'DISPATCHED');
    notify(`Broadcast transmitido para ${target}.`);
  };

  // Shift Manager Handlers
  const handleToggleRosterCell = (rowId: string, dayIdx: number) => {
    setRoster((prev) =>
      prev.map((row) => {
        if (row.id !== rowId || !row.days[dayIdx]) return row;
        const nextDays = [...row.days];
        const curr = nextDays[dayIdx];
        if (curr.type === 'rest') {
          nextDays[dayIdx] = {
            label: row.teamGroup === 'bravo' ? '19-07' : row.teamGroup === 'alpha' ? '07-19' : '08-16',
            type: row.teamGroup === 'bravo' ? 'night' : row.teamGroup === 'alpha' ? 'day' : 'specialist',
          };
        } else {
          nextDays[dayIdx] = { label: 'FOLGA', type: 'rest' };
        }
        return { ...row, days: nextDays };
      })
    );
    appendAudit(`ROSTER_UPDATE: Ajuste manual de posto na Semana 18`, 'COMMITTED');
  };

  const handleResolveSwapRequest = (reqId: string, decision: 'approved' | 'rejected') => {
    setSwapRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status: decision } : r))
    );
    appendAudit(
      `SHIFT_REQUEST_${decision.toUpperCase()}: ${reqId}`,
      decision === 'approved' ? 'COMPLETED' : 'COMMITTED'
    );
    notify(
      decision === 'approved'
        ? `Solicitação ${reqId} aprovada e registrada em conformidade CLT.`
        : `Solicitação ${reqId} rejeitada.`
    );
  };

  const handleCreateShift = (
    name: string,
    role: string,
    regime: '12x36' | '6x1' | '5x2' | '4x1',
    team: 'alpha' | 'bravo' | 'specialists'
  ) => {
    const initials = name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
    const label = team === 'bravo' ? '19-07' : team === 'alpha' ? '07-19' : '08-16';
    const type = team === 'bravo' ? 'night' : team === 'alpha' ? 'day' : 'specialist';
    const newRow: AnalystRosterRow = {
      id: `ros-${Date.now()}`,
      initials,
      name,
      role,
      teamGroup: team,
      regime,
      regimeColor: regime === '6x1' ? 'emerald' : regime === '5x2' ? 'coral' : 'slate',
      statusDot: 'emerald',
      days: [
        { label, type },
        { label: 'FOLGA', type: 'rest' },
        { label, type },
        { label, subLabel: team === 'alpha' ? 'EM CONSOLE' : undefined, type: team === 'alpha' ? 'active-day' : type },
        { label: 'FOLGA', type: 'rest' },
        { label, type },
        { label: 'FOLGA', type: 'rest' },
      ],
    };
    setRoster((prev) => [...prev, newRow]);
    appendAudit(`SHIFT_PLAN_ADD: ${name} (${regime}) alocado`, 'COMPLETED');
    notify(`Nova escala criada para ${name}.`);
  };

  // Shift Intelligence Handlers
  const handleToggleAcceptIncident = (id: string) => {
    const now = new Date();
    const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setHandoverIncidents((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              accepted: !item.accepted,
              acceptedAt: !item.accepted ? hhmm : undefined,
            }
          : item
      )
    );
  };

  const handleAddOperationalEvent = (
    title: string,
    description: string,
    category: 'critical' | 'action' | 'maintenance',
    refCode: string
  ) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const newEv: OperationalEvent = {
      id: `ev-${Date.now()}`,
      time: timeStr,
      category,
      title,
      description,
      operator: 'R. Valente',
      refCode,
    };
    setOperationalEvents((prev) => [newEv, ...prev]);
    appendAudit(`SHIFT_EVENT_LOG: ${refCode} - ${title}`, 'COMMITTED');
    notify('Evento operacional registrado no log do turno.');
  };

  const handleSealHandover = (notes: string, receiverHash: string) => {
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' BRT';
    setHandoverSealed(true);
    setSealedHash(receiverHash);
    setSealedAt(nowStr);
    appendAudit(
      `HANDOVER_SEALED: NOC-HO-20241024-B SHA-256:${receiverHash.slice(0, 12)}`,
      'COMPLETED'
    );
    notify('Passagem de turno chancelada e lacrada com assinatura SHA-256.');
  };

  const handleJumpAuditLog = () => {
    setActiveModule('core-hub');
    setTimeout(() => {
      auditSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 80);
  };

  const warningBadgeCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="min-h-screen bg-[#080D16] text-[#E6EDF5] flex">
      <Sidebar
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        openIncidentCount={handoverIncidents.length}
        coveragePercent={100}
        onJumpAuditLog={handleJumpAuditLog}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          disasterCount={0}
          warningCount={warningBadgeCount}
          onClickAlerts={(filter) => {
            setAlertFilter(filter);
            setActiveModule('core-hub');
          }}
          onSelectModule={setActiveModule}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          searchableItems={searchableItems}
        />

        <main className="flex-1 p-4 sm:p-6 max-w-[1440px] w-full mx-auto">
          {activeModule === 'core-hub' && (
            <CoreHubView
              microservices={microservices}
              alerts={alerts}
              auditLogs={auditLogs}
              alertFilter={alertFilter}
              onAlertFilterChange={setAlertFilter}
              onAcknowledgeAlert={handleAcknowledgeAlert}
              onTransferAlertToShift={handleTransferAlertToShift}
              onEscalateAlertN3={handleEscalateAlertN3}
              onOpenBroadcast={() => setBroadcastOpen(true)}
              onInspectService={setInspectedService}
              auditSectionRef={auditSectionRef}
            />
          )}

          {activeModule === 'shift-manager' && (
            <ShiftManagerView
              roster={roster}
              requests={swapRequests}
              ssoCheckins={SSO_CHECKINS}
              onToggleCell={handleToggleRosterCell}
              onResolveRequest={handleResolveSwapRequest}
              onOpenPlanModal={() => setPlanShiftOpen(true)}
              onValidateCoverage={() =>
                appendAudit('COVERAGE_RULES_CHECK: 100% Cobertura CLT Validada', 'SUCCESS')
              }
            />
          )}

          {activeModule === 'shift-intelligence' && (
            <ShiftIntelligenceView
              incidents={handoverIncidents}
              events={operationalEvents}
              onToggleAcceptIncident={handleToggleAcceptIncident}
              onAddOperationalEvent={handleAddOperationalEvent}
              onSealHandover={handleSealHandover}
              handoverSealed={handoverSealed}
              sealedHash={sealedHash}
              sealedAt={sealedAt}
            />
          )}

          {activeModule === 'performance-intel' && (
            <PerformanceIntelView
              onOpenEvidence={setInspectedAnalyst}
              onOpenSpikeAudit={() => setSpikeAuditOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      {broadcastOpen && (
        <BroadcastModal
          onClose={() => setBroadcastOpen(false)}
          onSend={handleSendBroadcast}
        />
      )}
      {inspectedService && (
        <ServiceDetailModal
          service={inspectedService}
          onClose={() => setInspectedService(null)}
        />
      )}
      {planShiftOpen && (
        <PlanShiftModal
          onClose={() => setPlanShiftOpen(false)}
          onCreate={handleCreateShift}
        />
      )}
      {inspectedAnalyst && (
        <EvidenceTrailModal
          analyst={inspectedAnalyst}
          onClose={() => setInspectedAnalyst(null)}
        />
      )}
      {spikeAuditOpen && <SpikeAuditModal onClose={() => setSpikeAuditOpen(false)} />}

      {/* Subtle Action Toast */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-[#0F1724] border border-sky-500/40 px-4 py-2.5 shadow-xl text-xs font-medium text-sky-200">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
