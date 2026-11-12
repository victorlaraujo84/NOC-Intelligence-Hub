import React, { useState } from 'react';
import {
  Activity,
  CheckCircle2,
  FileSearch,
  Megaphone,
  Plus,
  Server,
  ShieldAlert,
  X,
} from 'lucide-react';
import { MicroserviceStatus, PerformanceAnalystMetric } from '../types/noc';

interface ModalShellProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}

export const ModalShell: React.FC<ModalShellProps> = ({
  title,
  subtitle,
  onClose,
  children,
  maxWidth = 'max-w-xl',
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
    <div
      className={`w-full ${maxWidth} rounded-xl bg-[#0F1724] border border-[#243652] shadow-2xl overflow-hidden`}
      role="dialog"
      aria-modal="true"
    >
      <div className="px-5 py-4 border-b border-[#1E2B40] flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-base font-bold text-white">{title}</h3>
          {subtitle && <p className="text-xs text-[#7E92AD] mt-0.5">{subtitle}</p>}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-md text-[#7E92AD] hover:text-white hover:bg-[#172436] cursor-pointer"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="p-5 max-h-[80vh] overflow-y-auto">{children}</div>
    </div>
  </div>
);

export const BroadcastModal: React.FC<{
  onClose: () => void;
  onSend: (message: string, target: string) => void;
}> = ({ onClose, onSend }) => {
  const [message, setMessage] = useState(
    'Atenção Equipe Alpha e Bravo: Manter observação em BGP AS53001 até estabilização às 19:30.'
  );
  const [target, setTarget] = useState('Todos os Postos (Wall + Consoles)');

  return (
    <ModalShell
      title="Broadcast Operacional Geral"
      subtitle="Dispara aviso imediato para consoles ativos, OperaDash Wall e Audit Log"
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!message.trim()) return;
          onSend(message.trim(), target);
          onClose();
        }}
        className="space-y-4"
      >
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Destinatários do Canal
          </label>
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="w-full h-9 px-3 rounded-lg bg-[#0A101B] border border-[#1E2B40] text-xs text-white focus:outline-none focus:border-sky-500"
          >
            <option>Todos os Postos (Wall + Consoles)</option>
            <option>Apenas Turno Alpha (Diurno)</option>
            <option>Turno Bravo + Especialistas N3</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Comunicado Tático
          </label>
          <textarea
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-3 rounded-lg bg-[#0A101B] border border-[#1E2B40] text-xs text-white focus:outline-none focus:border-sky-500"
          />
        </div>
        <div className="flex justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[#1E2B40] text-xs font-medium text-slate-300 hover:bg-[#162235] cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0EA5E9] hover:bg-sky-400 text-[#04101D] text-xs font-semibold cursor-pointer"
          >
            <Megaphone className="w-3.5 h-3.5" />
            Transmitir Broadcast
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

export const ServiceDetailModal: React.FC<{
  service: MicroserviceStatus;
  onClose: () => void;
}> = ({ service, onClose }) => (
  <ModalShell
    title={service.name}
    subtitle={`Adapter / Core Daemon • ${service.status}`}
    onClose={onClose}
  >
    <div className="space-y-4 text-xs">
      <p className="text-slate-300 leading-relaxed">{service.description}</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-[#0A101B] border border-[#1B283C]">
          <div className="text-[#7E92AD] mb-1">Latência Atual</div>
          <div className="font-mono text-sm font-semibold text-emerald-400">{service.latency}</div>
        </div>
        <div className="p-3 rounded-lg bg-[#0A101B] border border-[#1B283C]">
          <div className="text-[#7E92AD] mb-1">Uptime Contínuo</div>
          <div className="font-mono text-sm font-semibold text-white">{service.uptime}</div>
        </div>
      </div>
      <div className="p-3 rounded-lg bg-[#0A101B] border border-[#1B283C]">
        <div className="text-[#7E92AD] mb-1 flex items-center gap-1.5">
          <Server className="w-3.5 h-3.5 text-sky-400" />
          <span>Endpoint / Contrato Interno</span>
        </div>
        <code className="text-[11px] text-sky-300 break-all">{service.endpoint}</code>
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-lg bg-[#162235] hover:bg-[#1E2F49] text-white font-medium cursor-pointer"
        >
          Fechar
        </button>
      </div>
    </div>
  </ModalShell>
);

export const PlanShiftModal: React.FC<{
  onClose: () => void;
  onCreate: (name: string, role: string, regime: '12x36' | '6x1' | '5x2' | '4x1', team: 'alpha' | 'bravo' | 'specialists') => void;
}> = ({ onClose, onCreate }) => {
  const [name, setName] = useState('Gabriel Lima');
  const [role, setRole] = useState('NOC Operator L2 • Backbone');
  const [regime, setRegime] = useState<'12x36' | '6x1' | '5x2' | '4x1'>('12x36');
  const [team, setTeam] = useState<'alpha' | 'bravo' | 'specialists'>('alpha');

  return (
    <ModalShell
      title="Planejar Nova Escala de Analista"
      subtitle="Validação automática de interjornada CLT (11h mín.) e sobreposição de handover"
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          onCreate(name.trim(), role.trim(), regime, team);
          onClose();
        }}
        className="space-y-4 text-xs"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-300 mb-1.5">Analista / Especialista</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-9 px-3 rounded-lg bg-[#0A101B] border border-[#1E2B40] text-white focus:outline-none focus:border-sky-500"
            />
          </div>
          <div>
            <label className="block text-slate-300 mb-1.5">Regime Contratual</label>
            <select
              value={regime}
              onChange={(e) => setRegime(e.target.value as '12x36' | '6x1' | '5x2' | '4x1')}
              className="w-full h-9 px-3 rounded-lg bg-[#0A101B] border border-[#1E2B40] text-white focus:outline-none focus:border-sky-500"
            >
              <option value="12x36">12x36 (Escala Base)</option>
              <option value="6x1">6x1 (Especialistas)</option>
              <option value="5x2">5x2 (Eng. N3)</option>
              <option value="4x1">4x1 (Plantão Noturno)</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-300 mb-1.5">Função / Posto</label>
            <input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full h-9 px-3 rounded-lg bg-[#0A101B] border border-[#1E2B40] text-white focus:outline-none focus:border-sky-500"
            />
          </div>
          <div>
            <label className="block text-slate-300 mb-1.5">Alocação de Equipe</label>
            <select
              value={team}
              onChange={(e) => setTeam(e.target.value as 'alpha' | 'bravo' | 'specialists')}
              className="w-full h-9 px-3 rounded-lg bg-[#0A101B] border border-[#1E2B40] text-white focus:outline-none focus:border-sky-500"
            >
              <option value="alpha">Equipe Alpha (Diurno 07-19)</option>
              <option value="bravo">Equipe Bravo (Noturno 19-07)</option>
              <option value="specialists">Especialistas N3</option>
            </select>
          </div>
        </div>
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-2 text-emerald-300">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Sem conflitos de fadiga NR-17 ou sobreposição pendente para a Semana 18.</span>
        </div>
        <div className="flex justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[#1E2B40] text-slate-300 hover:bg-[#162235] cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0EA5E9] hover:bg-sky-400 text-[#04101D] font-semibold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Adicionar à Grade
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

export const EvidenceTrailModal: React.FC<{
  analyst: PerformanceAnalystMetric;
  onClose: () => void;
}> = ({ analyst, onClose }) => (
  <ModalShell
    title={`Rastro Forense de Evidências — ${analyst.name}`}
    subtitle={`${analyst.role} • ${analyst.verifiedActions} ações comprovadas com autoria verificável`}
    onClose={onClose}
    maxWidth="max-w-2xl"
  >
    <div className="space-y-3 text-xs">
      <div className="grid grid-cols-3 gap-3 mb-2">
        <div className="p-3 rounded-lg bg-[#0A101B] border border-[#1B283C]">
          <div className="text-[#7E92AD]">Taxa Verificada</div>
          <div className="font-mono text-base font-bold text-white mt-0.5">
            {analyst.actionsPerHour.toFixed(2)} ações/h
          </div>
        </div>
        <div className="p-3 rounded-lg bg-[#0A101B] border border-[#1B283C]">
          <div className="text-[#7E92AD]">MTTR Médio</div>
          <div className="font-mono text-base font-bold text-emerald-400 mt-0.5">
            {analyst.mttrMin.toFixed(1)} min
          </div>
        </div>
        <div className="p-3 rounded-lg bg-[#0A101B] border border-[#1B283C]">
          <div className="text-[#7E92AD]">Qualidade Docs</div>
          <div className="font-mono text-base font-bold text-sky-400 mt-0.5">{analyst.docScore}</div>
        </div>
      </div>

      <div className="border border-[#1B283C] rounded-lg overflow-hidden">
        <div className="bg-[#0A101B] px-3.5 py-2 text-[10px] font-mono text-[#7E92AD] uppercase border-b border-[#1B283C] flex justify-between">
          <span>Registros de Origem Auditados</span>
          <span>100% Autoria Confirmada</span>
        </div>
        <div className="divide-y divide-[#1A2639]">
          {analyst.evidenceLogs.map((log) => (
            <div key={log.id} className="p-3 flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[11px] text-sky-400">{log.time}</span>
                  <span className="text-[11px] font-medium text-emerald-400">{log.source}</span>
                </div>
                <p className="text-slate-200">{log.summary}</p>
              </div>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#132238] text-sky-300 border border-[#1E3454] shrink-0">
                {log.ref}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-lg bg-[#162235] hover:bg-[#1E2F49] text-white font-medium cursor-pointer"
        >
          Fechar Auditoria
        </button>
      </div>
    </div>
  </ModalShell>
);

export const SpikeAuditModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <ModalShell
    title="Auditoria Forense de Spike — Quarta-feira (12/11)"
    subtitle="Correlação de 1.840 triggers BGP vs. estabilidade de MTTA em 4.8 min"
    onClose={onClose}
  >
    <div className="space-y-3.5 text-xs">
      <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-slate-200 leading-relaxed">
          Rajada de <strong>1.840 triggers</strong> originada por flapping transitório no peer AS53001 entre 14:12 e 14:48 UTC-3.
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between p-2.5 rounded bg-[#0A101B] border border-[#1B283C]">
          <span className="text-[#7E92AD]">Supressão Triggers Factory</span>
          <span className="font-mono text-emerald-400 font-semibold">1.492 ruídos isolados (81.0%)</span>
        </div>
        <div className="flex items-center justify-between p-2.5 rounded bg-[#0A101B] border border-[#1B283C]">
          <span className="text-[#7E92AD]">Incidentes Reais Escalados</span>
          <span className="font-mono text-sky-400 font-semibold">4 tickets acionáveis</span>
        </div>
        <div className="flex items-center justify-between p-2.5 rounded bg-[#0A101B] border border-[#1B283C]">
          <span className="text-[#7E92AD]">MTTA Médio Durante Spike</span>
          <span className="font-mono text-white font-semibold flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            4.8 min (SLA ≤ 8.0 min)
          </span>
        </div>
      </div>
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0EA5E9] text-[#04101D] font-semibold cursor-pointer"
        >
          <FileSearch className="w-3.5 h-3.5" />
          Concluir Inspeção
        </button>
      </div>
    </div>
  </ModalShell>
);
