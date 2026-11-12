export type ModuleId = 'core-hub' | 'shift-manager' | 'shift-intelligence' | 'performance-intel';

export type SeverityLevel = 'DISASTER' | 'HIGH' | 'WARNING' | 'AVERAGE' | 'INFO' | 'PLANNED';

export interface MicroserviceStatus {
  id: string;
  name: string;
  status: string;
  latency: string;
  detail: string;
  healthColor: 'emerald' | 'cyan' | 'amber';
  endpoint: string;
  uptime: string;
  description: string;
}

export interface PriorityAlert {
  id: string;
  triggerId: string;
  severity: 'HIGH SEVERITY' | 'WARNING' | 'DISASTER';
  host: string;
  title: string;
  description: string;
  activeFor: string;
  assignee: string;
  flapping: string;
  acknowledged: boolean;
  transferred: boolean;
  incidentLinked?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  operator: string;
  role: string;
  roleColor: 'cyan' | 'slate' | 'emerald' | 'sky';
  action: string;
  originIp: string;
  status: 'SUCCESS' | 'COMMITTED' | 'AUTO_MUTED' | 'COMPLETED' | 'DISPATCHED';
}

export type ShiftCellType = 'day' | 'night' | 'specialist' | 'rest' | 'active-day' | 'upcoming-night';

export interface ShiftDayCell {
  label: string;
  subLabel?: string;
  type: ShiftCellType;
}

export interface AnalystRosterRow {
  id: string;
  initials: string;
  name: string;
  role: string;
  teamGroup: 'alpha' | 'bravo' | 'specialists';
  regime: '12x36' | '6x1' | '5x2' | '4x1';
  regimeColor: 'slate' | 'emerald' | 'coral' | 'indigo';
  statusDot: 'emerald' | 'cyan' | 'amber' | 'rose';
  vacationNotice?: string;
  days: ShiftDayCell[];
}

export interface ShiftSwapRequest {
  id: string;
  type: 'TROCA DE TURNO MÚTUA' | 'SOLICITAÇÃO DE FOLGA PROGRAMADA';
  badgeType: 'coral' | 'cyan';
  ruleCompliance: string;
  requesterLabel: string;
  requesterName: string;
  requesterDetail: string;
  replacementLabel: string;
  replacementName: string;
  replacementDetail: string;
  validationNote: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface SsoCheckInRecord {
  id: string;
  name: string;
  method: string;
  time: string;
  expected: string;
  isTransition?: boolean;
}

export interface HandoverIncident {
  id: string;
  triggerCode: string;
  timestamp: string;
  service: string;
  serviceDetail: string;
  severity: 'DISASTER' | 'HIGH' | 'PLANNED';
  ownerInitials: string;
  ownerName: string;
  lastAction: string;
  nextStep: string;
  accepted: boolean;
  acceptedAt?: string;
}

export interface OperationalEvent {
  id: string;
  time: string;
  category: 'critical' | 'action' | 'maintenance';
  title: string;
  description: string;
  operator: string;
  refCode: string;
}

export interface PerformanceAnalystMetric {
  id: string;
  initials: string;
  avatarBg: string;
  name: string;
  role: string;
  squad: 'Alpha' | 'Bravo' | 'Charlie' | 'Delta';
  regime: '12x36' | '6x1' | '5x2';
  shiftType: 'Diurno' | 'Noturno' | 'Madrugada';
  hoursWorked: string;
  exposedTriggers: number;
  verifiedActions: number;
  actionsPerHour: number;
  deltaLabel?: string;
  mttrMin: number;
  docScore: 'SCORE A+' | 'SCORE A' | 'SCORE B+';
  evidenceLogs: {
    id: string;
    time: string;
    source: 'Zabbix-Analyzer' | 'Jira ITSM' | 'Triggers Factory' | 'Runbook Auto';
    summary: string;
    ref: string;
  }[];
}

export interface CorrelationDayPoint {
  day: string;
  triggers: number;
  mtta: number;
  note?: string;
}
