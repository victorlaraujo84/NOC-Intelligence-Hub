import React, { useState } from 'react';
import { Maximize2, MonitorCheck, Network } from 'lucide-react';

export const NocBrandMark: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="NOC Hub Brand Mark">
    <rect width="40" height="40" rx="8" fill="#0D1829" stroke="#1E3352" strokeWidth="1.5" />
    <path
      d="M20 7L31 12.5V20.5C31 26.8 26.2 31.8 20 33.5C13.8 31.8 9 26.8 9 20.5V12.5L20 7Z"
      fill="#0EA5E9"
      fillOpacity="0.14"
      stroke="#0EA5E9"
      strokeWidth="1.6"
    />
    <circle cx="20" cy="19.5" r="3.2" fill="#0EA5E9" />
    <circle cx="14" cy="15.5" r="1.8" fill="#10B981" />
    <circle cx="26" cy="15.5" r="1.8" fill="#38BDF8" />
    <circle cx="20" cy="26.5" r="1.8" fill="#38BDF8" />
    <path d="M15.4 16.5L18.2 18.4M24.6 16.5L21.8 18.4M20 22.7V24.7" stroke="#38BDF8" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

interface TopologyNode {
  id: string;
  label: string;
  x: number;
  y: number;
  status: 'nominal' | 'warning';
  detail: string;
}

const TOPOLOGY_NODES: TopologyNode[] = [
  { id: 'sp-core', label: 'SW-CORE-SP-01', x: 92, y: 58, status: 'nominal', detail: '480Gbps Backbone • 0% Drop' },
  { id: 'sp-core-2', label: 'SW-CORE-SP-02', x: 184, y: 42, status: 'warning', detail: 'Peer Hold Timer • Re-routed Lumen' },
  { id: 'rj-edge', label: 'EDGE-RJ-02', x: 276, y: 66, status: 'nominal', detail: 'DWDM Ch34 Backup Active' },
  { id: 'zbx-prd', label: 'ZBX-PRD-01', x: 74, y: 122, status: 'nominal', detail: '1,480 ev/s • JSON-RPC 6.4' },
  { id: 'kafka', label: 'KAFKA-BUS', x: 184, y: 112, status: 'nominal', detail: '0 Lag • Partition Healthy' },
  { id: 'pg-ha', label: 'PG-HA-MASTER', x: 288, y: 124, status: 'nominal', detail: 'WAL Sync • 84 Conns' },
];

const TOPOLOGY_LINKS: [string, string][] = [
  ['sp-core', 'sp-core-2'],
  ['sp-core-2', 'rj-edge'],
  ['sp-core', 'zbx-prd'],
  ['zbx-prd', 'kafka'],
  ['sp-core-2', 'kafka'],
  ['kafka', 'pg-ha'],
  ['rj-edge', 'pg-ha'],
];

export const CoreTopologyGraph: React.FC<{ onInspectNode?: (node: TopologyNode) => void }> = ({ onInspectNode }) => {
  const [selectedId, setSelectedId] = useState<string>('sp-core-2');
  const activeNode = TOPOLOGY_NODES.find((n) => n.id === selectedId) || TOPOLOGY_NODES[0];

  return (
    <div className="rounded-lg border border-[#1B283C] bg-[#0B121D] overflow-hidden">
      <div className="relative h-[168px] w-full bg-[radial-gradient(circle_at_50%_30%,#132642_0%,#09101A_75%)]">
        {/* Subtle blueprint grid */}
        <svg viewBox="0 0 360 165" className="w-full h-full">
          <defs>
            <pattern id="noc-grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#1E304B" strokeWidth="0.6" strokeOpacity="0.45" />
            </pattern>
          </defs>
          <rect width="360" height="165" fill="url(#noc-grid)" />

          {/* Links */}
          {TOPOLOGY_LINKS.map(([aId, bId], idx) => {
            const a = TOPOLOGY_NODES.find((n) => n.id === aId)!;
            const b = TOPOLOGY_NODES.find((n) => n.id === bId)!;
            const isWarningLink = a.status === 'warning' || b.status === 'warning';
            return (
              <line
                key={idx}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={isWarningLink ? '#F59E0B' : '#0EA5E9'}
                strokeOpacity={isWarningLink ? 0.55 : 0.45}
                strokeWidth={isWarningLink ? 1.5 : 1.2}
                strokeDasharray={isWarningLink ? '4 3' : undefined}
              />
            );
          })}

          {/* Nodes */}
          {TOPOLOGY_NODES.map((node) => {
            const isSelected = node.id === selectedId;
            const fill = node.status === 'warning' ? '#F59E0B' : '#10B981';
            return (
              <g
                key={node.id}
                className="cursor-pointer"
                onClick={() => {
                  setSelectedId(node.id);
                  onInspectNode?.(node);
                }}
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isSelected ? 13 : 9}
                  fill={fill}
                  fillOpacity={isSelected ? 0.2 : 0.12}
                  stroke={isSelected ? '#38BDF8' : fill}
                  strokeWidth={isSelected ? 1.5 : 1}
                />
                <circle cx={node.x} cy={node.y} r="4" fill={fill} />
                <text
                  x={node.x}
                  y={node.y + 20}
                  textAnchor="middle"
                  className="fill-[#9FB2C9] text-[8px] font-mono select-none"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Bottom Scrim & Label */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#080D16] via-[#080D16]/85 to-transparent px-3.5 py-2.5 flex items-end justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-sky-400 uppercase">
              <Network className="w-3 h-3" />
              <span>Core Infrastructure Graph</span>
            </div>
            <div className="text-sm font-semibold text-white">Topology Engine v4.2</div>
            <div className="text-[11px] text-[#7E92AD]">
              9,410 active interfaces mapped • <span className="text-sky-300 font-mono">{activeNode.label}</span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-[#90A4BF] bg-[#111B2B] border border-[#1E2E47] px-2 py-1 rounded">
            {activeNode.detail}
          </span>
        </div>
      </div>
    </div>
  );
};

export const NocVideoWallPreview: React.FC<{ onExpand?: () => void }> = ({ onExpand }) => {
  return (
    <div className="rounded-lg border border-[#1B283C] bg-[#0B121D] overflow-hidden">
      <div className="relative h-[132px] bg-[#070C14] p-2.5 flex flex-col justify-between overflow-hidden">
        {/* Simulated 4x4K War Room Wall Grid */}
        <div className="grid grid-cols-3 gap-1.5 h-[84px] opacity-90">
          {/* Screen 1: Network Matrix */}
          <div className="rounded bg-[#0D1726] border border-[#1B2D45] p-1.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[8px] font-mono text-sky-400">
              <span>WALL-01 BGP</span>
              <span className="text-emerald-400">OK</span>
            </div>
            <svg viewBox="0 0 80 28" className="w-full h-7">
              <polyline
                fill="none"
                stroke="#0EA5E9"
                strokeWidth="1.5"
                points="0,22 12,18 24,20 36,9 48,14 60,11 72,13 80,10"
              />
              <polyline
                fill="none"
                stroke="#10B981"
                strokeWidth="1"
                strokeOpacity="0.6"
                points="0,25 14,24 28,23 42,19 58,21 80,18"
              />
            </svg>
          </div>
          {/* Screen 2: Cluster Load */}
          <div className="rounded bg-[#0D1726] border border-[#1B2D45] p-1.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[8px] font-mono text-emerald-400">
              <span>WALL-02 ZBX</span>
              <span>1.4k/s</span>
            </div>
            <div className="grid grid-cols-6 gap-0.5 items-end h-7 pt-1">
              {[42, 68, 55, 84, 62, 48].map((h, idx) => (
                <div
                  key={idx}
                  style={{ height: `${h}%` }}
                  className={`rounded-t-[1px] ${h > 75 ? 'bg-amber-400/80' : 'bg-sky-400/80'}`}
                />
              ))}
            </div>
          </div>
          {/* Screen 3: Camera / Datacenter Matrix */}
          <div className="rounded bg-[#0D1726] border border-[#1B2D45] p-1.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[8px] font-mono text-slate-300">
              <span>CAM 16/16</span>
              <span className="text-emerald-400">REC</span>
            </div>
            <div className="grid grid-cols-2 gap-1 h-7">
              <div className="rounded-[2px] bg-[#132238] border border-[#223757]" />
              <div className="rounded-[2px] bg-[#132238] border border-[#223757]" />
              <div className="rounded-[2px] bg-[#132238] border border-[#223757]" />
              <div className="rounded-[2px] bg-[#132238] border border-[#223757]" />
            </div>
          </div>
        </div>

        {/* Overlay Bar */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] font-mono text-[#7E92AD]">OPERADASH WAR-ROOM • 4x 4K @ 60FPS</span>
          {onExpand && (
            <button
              type="button"
              onClick={onExpand}
              className="text-[10px] font-medium text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
            >
              <Maximize2 className="w-3 h-3" />
              Ampliar
            </button>
          )}
        </div>
      </div>

      {/* Metadata block below preview */}
      <div className="p-3.5 border-t border-[#1B283C] bg-[#0F1724]">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div>
            <div className="text-[10px] font-semibold tracking-wider text-[#7E92AD] uppercase">
              SALA DE COMANDO PRINCIPAL
            </div>
            <div className="text-sm font-semibold text-white">NOC Video Wall Central SP</div>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded">
            <MonitorCheck className="w-3 h-3" />
            Sincronizado
          </span>
        </div>
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#7E92AD]">Câmeras Operacionais:</span>
            <span className="font-mono font-medium text-slate-200">16/16 Online</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#7E92AD]">Linha Quente Telecom:</span>
            <span className="font-medium text-emerald-400">Ativa e Testada</span>
          </div>
        </div>
      </div>
    </div>
  );
};
