import React from 'react';
import { NodeProps, Handle, Position } from '@xyflow/react';
import { NodeWrapper } from './NodeWrapper';
import {
  ApiRequestNodeData,
  WebhookNodeData,
  JavaScriptNodeData,
} from '../../types/workflow';

export const ApiRequestNode: React.FC<NodeProps> = React.memo(({ id, data, selected }) => {
  const d = data as unknown as ApiRequestNodeData;
  return (
    <NodeWrapper
      id={id}
      type="apiRequest"
      selected={selected}
      title={d.label || 'API Request'}
      outputs={[]}
      minWidth="min-w-[240px] max-w-[300px]"
    >
      <div className="flex flex-col gap-1 text-xs">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <span className="font-mono font-bold text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-white shrink-0">
            {d.method || 'GET'}
          </span>
          <span className="truncate text-zinc-700 font-mono text-[11px]">{d.url || 'https://api.example.com'}</span>
        </div>
        {d.responseVariable && (
          <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
            stores: ${d.responseVariable}
          </div>
        )}
        <div className="flex flex-col gap-1 pt-1.5">
          <div className="relative flex items-center justify-between rounded bg-emerald-50 px-2.5 py-1 text-[11px] text-emerald-800 border border-emerald-200 font-medium">
            <span>200 OK</span>
            <Handle
              type="source"
              position={Position.Right}
              id="success"
              className="!absolute !-right-1.5 !top-1/2 !-translate-y-1/2 !h-2.5 !w-2.5 !rounded-full !bg-white !border-2 !border-emerald-600 hover:!bg-emerald-600"
            />
          </div>
          <div className="relative flex items-center justify-between rounded bg-rose-50 px-2.5 py-1 text-[11px] text-rose-800 border border-rose-200 font-medium">
            <span>Error</span>
            <Handle
              type="source"
              position={Position.Right}
              id="error"
              className="!absolute !-right-1.5 !top-1/2 !-translate-y-1/2 !h-2.5 !w-2.5 !rounded-full !bg-white !border-2 !border-rose-600 hover:!bg-rose-600"
            />
          </div>
        </div>
      </div>
    </NodeWrapper>
  );
});
ApiRequestNode.displayName = 'ApiRequestNode';

export const WebhookNode: React.FC<NodeProps> = React.memo(({ id, data, selected }) => {
  const d = data as unknown as WebhookNodeData;
  return (
    <NodeWrapper id={id} type="webhook" selected={selected} title={d.label || 'Webhook'}>
      <div className="flex flex-col gap-1 text-xs">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <span className="font-mono font-bold text-[10px] px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-800 shrink-0">
            {d.method || 'POST'}
          </span>
          <span className="truncate text-zinc-700 font-mono text-[11px]">{d.webhookUrl || 'https://'}</span>
        </div>
      </div>
    </NodeWrapper>
  );
});
WebhookNode.displayName = 'WebhookNode';

export const JavaScriptNode: React.FC<NodeProps> = React.memo(({ id, data, selected }) => {
  const d = data as unknown as JavaScriptNodeData;
  return (
    <NodeWrapper id={id} type="javaScript" selected={selected} title={d.label || 'JavaScript'}>
      <div className="flex flex-col gap-1 text-xs">
        <div className="rounded bg-zinc-900 p-2 font-mono text-[10px] text-zinc-200 overflow-hidden line-clamp-2">
          {d.code || '// Custom JavaScript'}
        </div>
        {d.outputVariable && (
          <div className="text-[10px] text-zinc-500 font-mono">
            output: ${d.outputVariable}
          </div>
        )}
      </div>
    </NodeWrapper>
  );
});
JavaScriptNode.displayName = 'JavaScriptNode';
