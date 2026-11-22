import { create } from 'zustand';
import {
  Connection,
  addEdge,
  Viewport,
} from '@xyflow/react';
import { applyNodeChanges, applyEdgeChanges } from '@xyflow/system';
import {
  WorkflowData,
  WorkflowMetadata,
  FlowNode,
  FlowEdge,
  NodeType,
  AnyCustomNodeData,
  WorkflowSettings,
} from '../types/workflow';
import { BLOCK_DEFINITIONS } from '../constants/blockDefinitions';
import { saveWorkflow } from '../services/workflowStorage';

interface HistoryState {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

interface EditorState {
  // Workflow data
  workflowId: string | null;
  metadata: WorkflowMetadata | null;
  nodes: FlowNode[];
  edges: FlowEdge[];
  viewport: Viewport;
  settings: WorkflowSettings;

  // Selection state
  selectedNodeId: string | null;
  selectedNodeIds: string[];
  clipboard: FlowNode[];

  // Persistence & dirty flags
  isDirty: boolean;
  isSaving: boolean;
  lastSavedTime: string | null;

  // Undo / Redo
  past: HistoryState[];
  future: HistoryState[];

  // Actions
  loadWorkflow: (data: WorkflowData) => void;
  setNodes: (nodes: FlowNode[]) => void;
  setEdges: (edges: FlowEdge[]) => void;
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: Connection) => void;
  updateNodeData: (nodeId: string, partialData: Partial<AnyCustomNodeData>) => void;
  addNode: (type: NodeType, position: { x: number; y: number }) => FlowNode;
  duplicateNode: (nodeId: string) => void;
  deleteNode: (nodeId: string) => void;
  deleteSelectedNodes: () => void;
  copySelectedNodes: () => void;
  pasteNodes: () => void;
  selectAllNodes: () => void;
  selectNode: (nodeId: string | null) => void;
  updateWorkflowMetadata: (partial: Partial<WorkflowMetadata>) => void;
  setViewport: (viewport: Viewport) => void;
  toggleGrid: () => void;
  toggleMinimap: () => void;
  saveCurrentWorkflow: () => Promise<void>;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  takeSnapshot: () => void;
}

const MAX_HISTORY = 30;

export const useEditorStore = create<EditorState>((set, get) => ({
  workflowId: null,
  metadata: null,
  nodes: [],
  edges: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  settings: {
    defaultZoom: 1,
    snapToGrid: true,
    gridSize: 20,
    showMinimap: true,
    showGrid: true,
  },

  selectedNodeId: null,
  selectedNodeIds: [],
  clipboard: [],

  isDirty: false,
  isSaving: false,
  lastSavedTime: null,

  past: [],
  future: [],

  loadWorkflow: (data: WorkflowData) => {
    set({
      workflowId: data.metadata.id,
      metadata: data.metadata,
      nodes: data.nodes,
      edges: data.edges,
      viewport: data.viewport || { x: 0, y: 0, zoom: 1 },
      settings: data.settings || {
        defaultZoom: 1,
        snapToGrid: true,
        gridSize: 20,
        showMinimap: true,
        showGrid: true,
      },
      selectedNodeId: null,
      selectedNodeIds: [],
      clipboard: [],
      isDirty: false,
      isSaving: false,
      lastSavedTime: new Date(data.metadata.updatedAt).toLocaleTimeString(),
      past: [],
      future: [],
    });
  },

  setNodes: (nodes: FlowNode[]) => set({ nodes, isDirty: true }),
  setEdges: (edges: FlowEdge[]) => set({ edges, isDirty: true }),

  takeSnapshot: () => {
    const { nodes, edges, past } = get();
    const currentSnapshot: HistoryState = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    };
    const updatedPast = [...past, currentSnapshot].slice(-MAX_HISTORY);
    set({ past: updatedPast, future: [] });
  },

  onNodesChange: (changes: any) => {
    const { nodes, selectedNodeId } = get();
    let updatedNodes: FlowNode[];
    if (typeof changes?.applyTo === 'function') {
      updatedNodes = changes.applyTo(nodes);
    } else {
      updatedNodes = applyNodeChanges(nodes as any, changes) as FlowNode[];
    }

    let newSelectedId = selectedNodeId;
    const selectedIds: string[] = [];
    updatedNodes.forEach((n) => {
      if (n.selected) selectedIds.push(n.id);
    });

    if (selectedIds.length === 1) {
      newSelectedId = selectedIds[0];
    } else if (selectedIds.length === 0) {
      newSelectedId = null;
    }

    set({
      nodes: updatedNodes,
      selectedNodeId: newSelectedId,
      selectedNodeIds: selectedIds,
      isDirty: true,
    });
  },

  onEdgesChange: (changes: any) => {
    const { edges } = get();
    let updatedEdges: FlowEdge[];
    if (typeof changes?.applyTo === 'function') {
      updatedEdges = changes.applyTo(edges);
    } else {
      updatedEdges = applyEdgeChanges(edges as any, changes) as FlowEdge[];
    }
    set({ edges: updatedEdges, isDirty: true });
  },

  onConnect: (connection: Connection) => {
    const { edges, takeSnapshot } = get();
    if (connection.source === connection.target) return;

    takeSnapshot();
    const edge: FlowEdge = {
      ...connection,
      id: `edge_${connection.source}_${connection.sourceHandle || 'def'}_${connection.target}_${connection.targetHandle || 'def'}`,
      type: 'smoothstep',
      animated: false,
    };
    set({ edges: addEdge(edge, edges), isDirty: true });
  },

  updateNodeData: (nodeId: string, partialData: Partial<AnyCustomNodeData>) => {
    const { nodes } = get();
    const updatedNodes = nodes.map((node) => {
      if (node.id === nodeId) {
        return {
          ...node,
          data: {
            ...node.data,
            ...partialData,
          } as AnyCustomNodeData,
        };
      }
      return node;
    });

    set({ nodes: updatedNodes, isDirty: true });
  },

  addNode: (type: NodeType, position: { x: number; y: number }) => {
    const { nodes, takeSnapshot } = get();
    takeSnapshot();

    const def = BLOCK_DEFINITIONS[type];
    const newNode: FlowNode = {
      id: `node_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type,
      position,
      data: { ...def.defaultData },
    };

    set({
      nodes: [...nodes, newNode],
      selectedNodeId: newNode.id,
      selectedNodeIds: [newNode.id],
      isDirty: true,
    });

    return newNode;
  },

  duplicateNode: (nodeId: string) => {
    const { nodes, takeSnapshot } = get();
    const target = nodes.find((n) => n.id === nodeId);
    if (!target) return;

    takeSnapshot();
    const duplicatedNode: FlowNode = {
      id: `node_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: target.type,
      position: { x: target.position.x + 40, y: target.position.y + 40 },
      data: {
        ...JSON.parse(JSON.stringify(target.data)),
        label: `${target.data.label || target.type} (Copy)`,
      },
    };

    set({
      nodes: [...nodes, duplicatedNode],
      selectedNodeId: duplicatedNode.id,
      selectedNodeIds: [duplicatedNode.id],
      isDirty: true,
    });
  },

  deleteNode: (nodeId: string) => {
    const { nodes, edges, takeSnapshot, selectedNodeId } = get();
    takeSnapshot();

    const filteredNodes = nodes.filter((n) => n.id !== nodeId);
    const filteredEdges = edges.filter((e) => e.source !== nodeId && e.target !== nodeId);

    set({
      nodes: filteredNodes,
      edges: filteredEdges,
      selectedNodeId: selectedNodeId === nodeId ? null : selectedNodeId,
      selectedNodeIds: [],
      isDirty: true,
    });
  },

  deleteSelectedNodes: () => {
    const { nodes, edges, selectedNodeIds, takeSnapshot } = get();
    if (selectedNodeIds.length === 0) return;

    takeSnapshot();
    const idsSet = new Set(selectedNodeIds);
    const filteredNodes = nodes.filter((n) => !idsSet.has(n.id));
    const filteredEdges = edges.filter((e) => !idsSet.has(e.source) && !idsSet.has(e.target));

    set({
      nodes: filteredNodes,
      edges: filteredEdges,
      selectedNodeId: null,
      selectedNodeIds: [],
      isDirty: true,
    });
  },

  copySelectedNodes: () => {
    const { nodes, selectedNodeIds } = get();
    const selectedNodes = nodes.filter((n) => selectedNodeIds.includes(n.id));
    if (selectedNodes.length > 0) {
      set({ clipboard: JSON.parse(JSON.stringify(selectedNodes)) });
    }
  },

  pasteNodes: () => {
    const { clipboard, nodes, takeSnapshot } = get();
    if (clipboard.length === 0) return;

    takeSnapshot();
    const newNodes: FlowNode[] = clipboard.map((orig) => ({
      ...orig,
      id: `node_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      position: { x: orig.position.x + 30, y: orig.position.y + 30 },
      data: {
        ...orig.data,
        label: `${orig.data.label || orig.type} (Copy)`,
      },
    }));

    set({
      nodes: [...nodes, ...newNodes],
      selectedNodeId: newNodes[0].id,
      selectedNodeIds: newNodes.map((n) => n.id),
      isDirty: true,
    });
  },

  selectAllNodes: () => {
    const { nodes } = get();
    const updated = nodes.map((n) => ({ ...n, selected: true }));
    set({
      nodes: updated,
      selectedNodeIds: nodes.map((n) => n.id),
      selectedNodeId: nodes.length === 1 ? nodes[0].id : null,
    });
  },

  selectNode: (nodeId: string | null) => {
    const { nodes } = get();
    const updated = nodes.map((n) => ({ ...n, selected: n.id === nodeId }));
    set({
      nodes: updated,
      selectedNodeId: nodeId,
      selectedNodeIds: nodeId ? [nodeId] : [],
    });
  },

  updateWorkflowMetadata: (partial: Partial<WorkflowMetadata>) => {
    const { metadata } = get();
    if (!metadata) return;
    set({
      metadata: { ...metadata, ...partial, updatedAt: new Date().toISOString() },
      isDirty: true,
    });
  },

  setViewport: (viewport: Viewport) => set({ viewport }),

  toggleGrid: () => {
    set((state) => ({
      settings: { ...state.settings, showGrid: !state.settings.showGrid },
    }));
  },

  toggleMinimap: () => {
    set((state) => ({
      settings: { ...state.settings, showMinimap: !state.settings.showMinimap },
    }));
  },

  saveCurrentWorkflow: async () => {
    const { workflowId, metadata, nodes, edges, viewport, settings } = get();
    if (!workflowId || !metadata) return;

    set({ isSaving: true });
    try {
      const now = new Date().toISOString();
      const workflowData: WorkflowData = {
        metadata: { ...metadata, updatedAt: now },
        nodes,
        edges,
        viewport,
        settings,
        schemaVersion: 1,
      };

      await saveWorkflow(workflowData);
      set({
        isDirty: false,
        isSaving: false,
        lastSavedTime: new Date().toLocaleTimeString(),
      });
    } catch (err) {
      console.error('Failed to save workflow', err);
      set({ isSaving: false });
      throw err;
    }
  },

  undo: () => {
    const { past, future, nodes, edges } = get();
    if (past.length === 0) return;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    const currentSnapshot: HistoryState = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    };

    set({
      nodes: previous.nodes,
      edges: previous.edges,
      past: newPast,
      future: [currentSnapshot, ...future],
      isDirty: true,
      selectedNodeId: null,
      selectedNodeIds: [],
    });
  },

  redo: () => {
    const { past, future, nodes, edges } = get();
    if (future.length === 0) return;

    const next = future[0];
    const newFuture = future.slice(1);

    const currentSnapshot: HistoryState = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    };

    set({
      nodes: next.nodes,
      edges: next.edges,
      past: [...past, currentSnapshot],
      future: newFuture,
      isDirty: true,
      selectedNodeId: null,
      selectedNodeIds: [],
    });
  },

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,
}));
