import { db, StoredWorkflowRecord } from '../db/database';
import { WorkflowData, WorkflowMetadata, FlowNode } from '../types/workflow';
import { BLOCK_DEFINITIONS } from '../constants/blockDefinitions';

export const CURRENT_SCHEMA_VERSION = 1;

export function createInitialWorkflowData(id: string, name: string, description: string = '', category: WorkflowMetadata['category'] = 'General Flow'): WorkflowData {
  const now = new Date().toISOString();
  
  const startNode: FlowNode = {
    id: `node_${Date.now()}_start`,
    type: 'start',
    position: { x: 250, y: 150 },
    data: { ...BLOCK_DEFINITIONS.start.defaultData },
  };

  const welcomeNode: FlowNode = {
    id: `node_${Date.now()}_welcome`,
    type: 'text',
    position: { x: 250, y: 300 },
    data: {
      ...BLOCK_DEFINITIONS.text.defaultData,
      label: 'Welcome Message',
      content: 'Welcome to this workflow! Modify this text or connect new blocks from the library on the left.',
    },
  };

  return {
    metadata: {
      id,
      name,
      description,
      category,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    },
    nodes: [startNode, welcomeNode],
    edges: [
      {
        id: `edge_${startNode.id}_${welcomeNode.id}`,
        source: startNode.id,
        sourceHandle: 'output',
        target: welcomeNode.id,
        targetHandle: 'input',
        type: 'smoothstep',
      },
    ],
    viewport: { x: 0, y: 0, zoom: 1 },
    settings: {
      defaultZoom: 1,
      snapToGrid: true,
      gridSize: 20,
      showMinimap: true,
      showGrid: true,
    },
    schemaVersion: CURRENT_SCHEMA_VERSION,
  };
}

export async function getAllWorkflows(): Promise<StoredWorkflowRecord[]> {
  return await db.workflows.orderBy('updatedAt').reverse().toArray();
}

export async function getWorkflowById(id: string): Promise<WorkflowData | null> {
  const record = await db.workflows.get(id);
  return record ? record.data : null;
}

export async function saveWorkflow(workflow: WorkflowData): Promise<void> {
  const now = new Date().toISOString();
  const updatedMetadata: WorkflowMetadata = {
    ...workflow.metadata,
    updatedAt: now,
  };
  const updatedWorkflow: WorkflowData = {
    ...workflow,
    metadata: updatedMetadata,
  };

  const record: StoredWorkflowRecord = {
    id: workflow.metadata.id,
    name: workflow.metadata.name,
    description: workflow.metadata.description,
    category: workflow.metadata.category,
    status: workflow.metadata.status,
    createdAt: workflow.metadata.createdAt,
    updatedAt: now,
    data: updatedWorkflow,
  };

  await db.workflows.put(record);
}

export async function createNewWorkflow(name: string, description: string = '', category: WorkflowMetadata['category'] = 'General'): Promise<WorkflowData> {
  const id = `wf_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const initialData = createInitialWorkflowData(id, name, description, category);
  await saveWorkflow(initialData);
  return initialData;
}

export async function duplicateWorkflow(id: string): Promise<WorkflowData | null> {
  const original = await getWorkflowById(id);
  if (!original) return null;

  const newId = `wf_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const now = new Date().toISOString();

  const duplicatedData: WorkflowData = {
    ...original,
    metadata: {
      ...original.metadata,
      id: newId,
      name: `${original.metadata.name} (Copy)`,
      createdAt: now,
      updatedAt: now,
    },
  };

  await saveWorkflow(duplicatedData);
  return duplicatedData;
}

export async function renameWorkflow(id: string, newName: string): Promise<void> {
  const workflow = await getWorkflowById(id);
  if (!workflow) return;
  workflow.metadata.name = newName;
  await saveWorkflow(workflow);
}

export async function deleteWorkflow(id: string): Promise<void> {
  await db.workflows.delete(id);
}

export function exportWorkflowToJson(workflow: WorkflowData): string {
  return JSON.stringify(workflow, null, 2);
}

export function downloadJsonFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function importWorkflowFromJson(jsonString: string): Promise<WorkflowData> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    throw new Error('Invalid JSON format.');
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('File does not contain a valid workflow object.');
  }

  const obj = parsed as Record<string, unknown>;
  if (!obj.metadata || !Array.isArray(obj.nodes) || !Array.isArray(obj.edges)) {
    throw new Error('Missing required workflow properties (metadata, nodes, edges).');
  }

  const metadata = obj.metadata as Partial<WorkflowMetadata>;
  const newId = `wf_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const now = new Date().toISOString();

  const newWorkflow: WorkflowData = {
    metadata: {
      id: newId,
      name: metadata.name ? `${metadata.name} (Imported)` : 'Imported Workflow',
      description: metadata.description || '',
      category: (metadata.category as WorkflowMetadata['category']) || 'General',
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    },
    nodes: obj.nodes as FlowNode[],
    edges: obj.edges as WorkflowData['edges'],
    viewport: (obj.viewport as WorkflowData['viewport']) || { x: 0, y: 0, zoom: 1 },
    settings: (obj.settings as WorkflowData['settings']) || {
      defaultZoom: 1,
      snapToGrid: true,
      gridSize: 20,
      showMinimap: true,
      showGrid: true,
    },
    schemaVersion: (obj.schemaVersion as number) || CURRENT_SCHEMA_VERSION,
  };

  await saveWorkflow(newWorkflow);
  return newWorkflow;
}

export async function clearAllApplicationData(): Promise<void> {
  await db.workflows.clear();
  await db.assets.clear();
}
