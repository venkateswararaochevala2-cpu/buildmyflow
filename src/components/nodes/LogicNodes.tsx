import React from 'react';
import { NodeProps, Handle, Position } from '@xyflow/react';
import { NodeWrapper } from './NodeWrapper';
import {
  ConditionNodeData,
  IfElseNodeData,
  SwitchNodeData,
  VariableNodeData,
  CalculationNodeData,
  MergeNodeData,
} from '../../types/workflow';

export const ConditionNode: React.FC<NodeProps> = React.memo(({ id, data, selected }) => {
  const d = data as unknown as ConditionNodeData;
  return (
    <NodeWrapper
      id={id}
      type="condition"
      selected={selected}
      title={d.label || 'Condition'}
      outputs={[]}
      minWidth="min-w-[220px] max-w-[280px]"
    >
      <div className="flex flex-col gap-1.5 text-xs">
        <div className="flex items-center gap-1 font-mono text-[11px] bg-zinc-50 border border-zinc-200 p-1.5 rounded truncate">
          <span className="text-blue-700 font-semibold">${d.variable || 'var'}</span>
          <span className="text-zinc-500 font-sans">{d.operator || 'equals'}</span>
          <span className="text-zinc-800">"{d.comparisonValue || ''}"</span>
        </div>
        <div className="flex flex-col gap-1 pt-1">
          <div className="relative flex items-center justify-between rounded bg-emerald-50 px-2.5 py-1 text-[11px] text-emerald-800 border border-emerald-200 font-medium">
            <span>TRUE</span>
            <Handle
              type="source"
              position={Position.Right}
              id="true"
              className="!absolute !-right-1.5 !top-1/2 !-translate-y-1/2 !h-2.5 !w-2.5 !rounded-full !bg-white !border-2 !border-emerald-600 hover:!bg-emerald-600"
            />
          </div>
          <div className="relative flex items-center justify-between rounded bg-zinc-100 px-2.5 py-1 text-[11px] text-zinc-700 border border-zinc-200 font-medium">
            <span>FALSE</span>
            <Handle
              type="source"
              position={Position.Right}
              id="false"
              className="!absolute !-right-1.5 !top-1/2 !-translate-y-1/2 !h-2.5 !w-2.5 !rounded-full !bg-white !border-2 !border-zinc-500 hover:!bg-zinc-500"
            />
          </div>
        </div>
      </div>
    </NodeWrapper>
  );
});
ConditionNode.displayName = 'ConditionNode';

export const IfElseNode: React.FC<NodeProps> = React.memo(({ id, data, selected }) => {
  const d = data as unknown as IfElseNodeData;
  return (
    <NodeWrapper
      id={id}
      type="ifElse"
      selected={selected}
      title={d.label || 'If / Else'}
      outputs={[]}
      minWidth="min-w-[220px] max-w-[280px]"
    >
      <div className="flex flex-col gap-1.5 text-xs">
        <div className="flex items-center gap-1 font-mono text-[11px] bg-zinc-50 border border-zinc-200 p-1.5 rounded truncate">
          <span className="text-blue-700 font-semibold">${d.variable || 'var'}</span>
          <span className="text-zinc-500 font-sans">{d.operator || 'equals'}</span>
          <span className="text-zinc-800">"{d.comparisonValue || ''}"</span>
        </div>
        <div className="flex flex-col gap-1 pt-1">
          <div className="relative flex items-center justify-between rounded bg-emerald-50 px-2.5 py-1 text-[11px] text-emerald-800 border border-emerald-200 font-medium">
            <span>IF</span>
            <Handle
              type="source"
              position={Position.Right}
              id="if"
              className="!absolute !-right-1.5 !top-1/2 !-translate-y-1/2 !h-2.5 !w-2.5 !rounded-full !bg-white !border-2 !border-emerald-600 hover:!bg-emerald-600"
            />
          </div>
          <div className="relative flex items-center justify-between rounded bg-zinc-100 px-2.5 py-1 text-[11px] text-zinc-700 border border-zinc-200 font-medium">
            <span>ELSE</span>
            <Handle
              type="source"
              position={Position.Right}
              id="else"
              className="!absolute !-right-1.5 !top-1/2 !-translate-y-1/2 !h-2.5 !w-2.5 !rounded-full !bg-white !border-2 !border-zinc-500 hover:!bg-zinc-500"
            />
          </div>
        </div>
      </div>
    </NodeWrapper>
  );
});
IfElseNode.displayName = 'IfElseNode';

export const SwitchNode: React.FC<NodeProps> = React.memo(({ id, data, selected }) => {
  const d = data as unknown as SwitchNodeData;
  const cases = d.cases || [];

  return (
    <NodeWrapper
      id={id}
      type="switch"
      selected={selected}
      title={d.label || 'Switch'}
      outputs={[]}
      minWidth="min-w-[240px] max-w-[300px]"
    >
      <div className="flex flex-col gap-1.5 text-xs">
        <div className="text-[11px] text-zinc-600">
          Route by: <span className="font-mono font-semibold text-blue-700">${d.variable || 'var'}</span>
        </div>
        <div className="flex flex-col gap-1.5 pt-1">
          {cases.map((c) => (
            <div
              key={c.id}
              className="relative flex items-center justify-between rounded bg-zinc-50 px-2.5 py-1.5 border border-zinc-200 text-[11px]"
            >
              <span className="font-medium text-zinc-800 truncate pr-3">{c.label}</span>
              <span className="font-mono text-zinc-400 text-[10px] mr-2">"{c.value}"</span>
              <Handle
                type="source"
                position={Position.Right}
                id={c.id}
                className="!absolute !-right-1.5 !top-1/2 !-translate-y-1/2 !h-2.5 !w-2.5 !rounded-full !bg-white !border-2 !border-zinc-500 hover:!border-blue-600 hover:!bg-blue-600"
              />
            </div>
          ))}
          <div className="relative flex items-center justify-between rounded bg-zinc-100 px-2.5 py-1.5 border border-zinc-200 text-[11px] text-zinc-600">
            <span className="font-medium">Default</span>
            <Handle
              type="source"
              position={Position.Right}
              id="default"
              className="!absolute !-right-1.5 !top-1/2 !-translate-y-1/2 !h-2.5 !w-2.5 !rounded-full !bg-white !border-2 !border-zinc-500 hover:!border-blue-600 hover:!bg-blue-600"
            />
          </div>
        </div>
      </div>
    </NodeWrapper>
  );
});
SwitchNode.displayName = 'SwitchNode';

export const VariableNode: React.FC<NodeProps> = React.memo(({ id, data, selected }) => {
  const d = data as unknown as VariableNodeData;
  return (
    <NodeWrapper id={id} type="variable" selected={selected} title={d.label || 'Variable'}>
      <div className="flex flex-col gap-1 text-xs">
        <div className="flex items-center justify-between rounded bg-zinc-50 p-1.5 border border-zinc-200">
          <span className="font-mono font-semibold text-blue-700">${d.variableName || 'myVar'}</span>
          <span className="text-[10px] text-zinc-500 uppercase">{d.dataType || 'string'}</span>
        </div>
        <div className="text-[11px] text-zinc-600">
          Initial: <span className="font-mono text-zinc-900">{d.initialValue || '""'}</span>
        </div>
      </div>
    </NodeWrapper>
  );
});
VariableNode.displayName = 'VariableNode';

export const CalculationNode: React.FC<NodeProps> = React.memo(({ id, data, selected }) => {
  const d = data as unknown as CalculationNodeData;
  const opSymbol =
    d.operator === 'add' ? '+' : d.operator === 'subtract' ? '-' : d.operator === 'multiply' ? '×' : d.operator === 'divide' ? '÷' : '%';

  return (
    <NodeWrapper id={id} type="calculation" selected={selected} title={d.label || 'Calculation'}>
      <div className="flex flex-col gap-1 text-xs">
        <div className="font-mono text-[11px] bg-zinc-50 border border-zinc-200 p-1.5 rounded flex items-center gap-1">
          <span className="text-blue-700 font-semibold">${d.targetVariable || 'result'}</span>
          <span className="text-zinc-500">=</span>
          <span className="text-zinc-800">{d.firstOperand || '0'}</span>
          <span className="font-bold text-zinc-600">{opSymbol}</span>
          <span className="text-zinc-800">{d.secondOperand || '0'}</span>
        </div>
      </div>
    </NodeWrapper>
  );
});
CalculationNode.displayName = 'CalculationNode';

export const MergeNode: React.FC<NodeProps> = React.memo(({ id, data, selected }) => {
  const d = data as unknown as MergeNodeData;
  return (
    <NodeWrapper
      id={id}
      type="merge"
      selected={selected}
      title={d.label || 'Merge'}
      inputs={[{ id: 'input_1', label: 'In 1' }, { id: 'input_2', label: 'In 2' }]}
      minWidth="min-w-[180px]"
    >
      <div className="text-[11px] text-zinc-500 py-1">
        {d.description || 'Combines multiple branches into a single flow path.'}
      </div>
    </NodeWrapper>
  );
});
MergeNode.displayName = 'MergeNode';
