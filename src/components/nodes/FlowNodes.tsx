import React from 'react';
import { NodeProps } from '@xyflow/react';
import { NodeWrapper } from './NodeWrapper';
import {
  StartNodeData,
  EndNodeData,
  NavigationNodeData,
  ConnectFlowNodeData,
  DelayNodeData,
  RedirectNodeData,
  SubflowNodeData,
} from '../../types/workflow';
import { Play, CheckCircle2, Compass, GitMerge, Clock, CornerUpRight, Workflow, ExternalLink } from 'lucide-react';

export const StartNode: React.FC<NodeProps> = React.memo(({ id, data, selected }) => {
  const d = data as unknown as StartNodeData;
  return (
    <NodeWrapper
      id={id}
      type="start"
      selected={selected}
      title={d.label || 'Start'}
      inputs={[]}
      outputs={[{ id: 'output', label: 'Begin' }]}
      minWidth="min-w-[180px]"
    >
      <div className="flex items-center gap-2 py-1 text-xs text-zinc-700">
        <Play className="h-4 w-4 text-emerald-600 fill-emerald-600" />
        <span className="font-medium text-emerald-900">Flow Entry Point</span>
      </div>
    </NodeWrapper>
  );
});
StartNode.displayName = 'StartNode';

export const EndNode: React.FC<NodeProps> = React.memo(({ id, data, selected }) => {
  const d = data as unknown as EndNodeData;
  return (
    <NodeWrapper
      id={id}
      type="end"
      selected={selected}
      title={d.label || 'End'}
      inputs={[{ id: 'input' }]}
      outputs={[]}
      minWidth="min-w-[180px]"
    >
      <div className="flex items-center gap-2 py-1 text-xs text-zinc-700">
        <CheckCircle2 className="h-4 w-4 text-zinc-500" />
        <span className="text-zinc-600 truncate">{d.endMessage || 'Flow Completion'}</span>
      </div>
    </NodeWrapper>
  );
});
EndNode.displayName = 'EndNode';

export const NavigationNode: React.FC<NodeProps> = React.memo(({ id, data, selected }) => {
  const d = data as unknown as NavigationNodeData;
  return (
    <NodeWrapper id={id} type="navigation" selected={selected} title={d.label || 'Navigation'} minWidth="min-w-[220px]">
      <div className="flex items-center justify-between gap-2 rounded border border-blue-200 bg-blue-50/50 p-2 text-xs">
        <div className="overflow-hidden">
          <p className="font-semibold text-blue-900 truncate">{d.title || 'Visit Page'}</p>
          <p className="text-[10px] text-zinc-500 truncate">{d.targetUrl || 'https://'}</p>
        </div>
        <ExternalLink className="h-4 w-4 text-blue-600 shrink-0" />
      </div>
    </NodeWrapper>
  );
});
NavigationNode.displayName = 'NavigationNode';

export const ConnectFlowNode: React.FC<NodeProps> = React.memo(({ id, data, selected }) => {
  const d = data as unknown as ConnectFlowNodeData;
  return (
    <NodeWrapper id={id} type="connectFlow" selected={selected} title={d.label || 'Connect to Flow'} minWidth="min-w-[220px]">
      <div className="flex items-center gap-2 py-1 text-xs text-zinc-700">
        <GitMerge className="h-4 w-4 text-blue-600" />
        <div className="overflow-hidden">
          <span className="font-semibold text-zinc-900 truncate block">{d.flowName || 'External Flow'}</span>
          {d.description && <span className="text-[10px] text-zinc-500 truncate block">{d.description}</span>}
        </div>
      </div>
    </NodeWrapper>
  );
});
ConnectFlowNode.displayName = 'ConnectFlowNode';

// Legacy nodes preserved for backward compatibility
export const DelayNode: React.FC<NodeProps> = React.memo(({ id, data, selected }) => {
  const d = data as unknown as DelayNodeData;
  return (
    <NodeWrapper id={id} type="delay" selected={selected} title={d.label || 'Delay'}>
      <div className="flex items-center gap-2 py-1 text-xs text-zinc-700">
        <Clock className="h-4 w-4 text-amber-600" />
        <span>Wait {d.duration || 5} {d.unit || 'seconds'}</span>
      </div>
    </NodeWrapper>
  );
});
DelayNode.displayName = 'DelayNode';

export const RedirectNode: React.FC<NodeProps> = React.memo(({ id, data, selected }) => {
  const d = data as unknown as RedirectNodeData;
  return (
    <NodeWrapper id={id} type="redirect" selected={selected} title={d.label || 'Redirect'} outputs={[]}>
      <div className="flex items-center gap-2 py-1 text-xs text-zinc-700">
        <CornerUpRight className="h-4 w-4 text-blue-600" />
        <span className="truncate text-blue-700">{d.targetUrl || 'No destination'}</span>
      </div>
    </NodeWrapper>
  );
});
RedirectNode.displayName = 'RedirectNode';

export const SubflowNode: React.FC<NodeProps> = React.memo(({ id, data, selected }) => {
  const d = data as unknown as SubflowNodeData;
  return (
    <NodeWrapper id={id} type="subflow" selected={selected} title={d.label || 'Subflow'}>
      <div className="flex items-center gap-2 py-1 text-xs text-zinc-700">
        <Workflow className="h-4 w-4 text-zinc-600" />
        <span className="font-medium truncate">{d.subflowName || 'Select Subflow'}</span>
      </div>
    </NodeWrapper>
  );
});
SubflowNode.displayName = 'SubflowNode';
