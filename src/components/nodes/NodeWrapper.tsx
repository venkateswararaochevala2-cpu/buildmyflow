import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Copy, Trash2 } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { BLOCK_DEFINITIONS } from '../../constants/blockDefinitions';
import { NodeType } from '../../types/workflow';

export interface NodeWrapperProps {
  id: string;
  type: NodeType;
  selected?: boolean;
  title: string;
  badge?: string;
  inputs?: { id: string; label?: string }[];
  outputs?: { id: string; label?: string }[];
  children?: React.ReactNode;
  minWidth?: string;
}

export const NodeWrapper: React.FC<NodeWrapperProps> = React.memo(
  ({
    id,
    type,
    selected,
    title,
    badge,
    inputs,
    outputs,
    children,
    minWidth = 'min-w-[220px] max-w-[280px]',
  }) => {
    const duplicateNode = useEditorStore((s) => s.duplicateNode);
    const deleteNode = useEditorStore((s) => s.deleteNode);

    const def = BLOCK_DEFINITIONS[type];
    const resolvedInputs = inputs !== undefined ? inputs : def?.inputs || [];
    const resolvedOutputs = outputs !== undefined ? outputs : def?.outputs || [];

    const handleDuplicate = (e: React.MouseEvent) => {
      e.stopPropagation();
      duplicateNode(id);
    };

    const handleDelete = (e: React.MouseEvent) => {
      e.stopPropagation();
      deleteNode(id);
    };

    return (
      <div
        className={`relative rounded-md border bg-white shadow-xs transition-colors ${minWidth} ${
          selected ? 'border-blue-600 ring-1 ring-blue-600' : 'border-zinc-300 hover:border-zinc-400'
        }`}
      >
        {/* Input Handles */}
        {resolvedInputs.map((input, index) => {
          const topPercent = resolvedInputs.length === 1 ? 50 : (100 / (resolvedInputs.length + 1)) * (index + 1);
          return (
            <div
              key={input.id}
              className="absolute left-0 -translate-x-1/2 flex items-center z-10"
              style={{ top: `${topPercent}%` }}
            >
              <Handle
                type="target"
                position={Position.Left}
                id={input.id}
                className="!relative !left-0 !transform-none !h-2.5 !w-2.5 !rounded-full !bg-white !border-2 !border-zinc-500 hover:!border-blue-600 hover:!bg-blue-600"
              />
            </div>
          );
        })}

        {/* Node Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/80 px-3 py-2 rounded-t-md">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className="text-xs font-semibold text-zinc-900 truncate">{title}</span>
            <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 bg-zinc-200/60 px-1 py-0.5 rounded">
              {badge || type}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0 opacity-80 hover:opacity-100 nodrag">
            <button
              onClick={handleDuplicate}
              title="Duplicate Block"
              className="rounded p-0.5 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 transition-colors"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleDelete}
              title="Delete Block"
              className="rounded p-0.5 text-zinc-400 hover:bg-zinc-200 hover:text-red-600 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Node Body */}
        {children && <div className="p-3 text-xs text-zinc-700">{children}</div>}

        {/* Output Handles */}
        {resolvedOutputs.map((output, index) => {
          const topPercent = resolvedOutputs.length === 1 ? 50 : (100 / (resolvedOutputs.length + 1)) * (index + 1);
          return (
            <div
              key={output.id}
              className="absolute right-0 translate-x-1/2 flex items-center justify-end z-10"
              style={{ top: `${topPercent}%` }}
            >
              <Handle
                type="source"
                position={Position.Right}
                id={output.id}
                className="!relative !right-0 !transform-none !h-2.5 !w-2.5 !rounded-full !bg-white !border-2 !border-zinc-500 hover:!border-blue-600 hover:!bg-blue-600"
              />
            </div>
          );
        })}
      </div>
    );
  }
);
NodeWrapper.displayName = 'NodeWrapper';
