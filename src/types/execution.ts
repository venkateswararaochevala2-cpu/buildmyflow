export type ExecutionStatus = 'idle' | 'running' | 'waiting_for_input' | 'paused' | 'completed' | 'error';

export interface ExecutionLogEntry {
  id: string;
  timestamp: string;
  nodeId: string;
  nodeType: string;
  nodeLabel: string;
  message: string;
  status: 'info' | 'success' | 'warning' | 'error';
  dataSnapshot?: Record<string, unknown>;
}

export interface ExecutionContext {
  status: ExecutionStatus;
  currentNodeId: string | null;
  previousNodeIds: string[];
  variables: Record<string, unknown>;
  logs: ExecutionLogEntry[];
  error?: string;
  stepCount: number;
}
