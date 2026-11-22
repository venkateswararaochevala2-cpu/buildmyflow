import { describe, it, expect, beforeEach } from 'vitest';
import { useEditorStore } from '../store/useEditorStore';
import { createInitialWorkflowData } from '../services/workflowStorage';

describe('Editor Zustand Store and Actions', () => {
  beforeEach(() => {
    const initial = createInitialWorkflowData('test_store_wf', 'Editor Store Test');
    useEditorStore.getState().loadWorkflow(initial);
  });

  it('loads workflow correctly', () => {
    const state = useEditorStore.getState();
    expect(state.workflowId).toBe('test_store_wf');
    expect(state.nodes.length).toBe(2);
    expect(state.edges.length).toBe(1);
    expect(state.isDirty).toBe(false);
  });

  it('adds custom blocks to canvas', () => {
    const store = useEditorStore.getState();
    const addedNode = store.addNode('button', { x: 200, y: 400 });

    expect(addedNode.type).toBe('button');
    expect(useEditorStore.getState().nodes.length).toBe(3);
    expect(useEditorStore.getState().isDirty).toBe(true);
  });

  it('updates node data immediately', () => {
    const store = useEditorStore.getState();
    const targetNode = store.nodes[1]; // text node

    store.updateNodeData(targetNode.id, { label: 'Updated Label', content: 'New Content' } as any);

    const updated = useEditorStore.getState().nodes.find((n) => n.id === targetNode.id);
    expect(updated?.data.label).toBe('Updated Label');
  });

  it('updates node positions when dragged via onNodesChange', () => {
    const store = useEditorStore.getState();
    const targetNode = store.nodes[0];

    // Simulate drag position change
    store.onNodesChange({
      applyTo: (nodes: any[]) =>
        nodes.map((n) => (n.id === targetNode.id ? { ...n, position: { x: 450, y: 600 } } : n)),
    });

    const moved = useEditorStore.getState().nodes.find((n) => n.id === targetNode.id);
    expect(moved?.position.x).toBe(450);
    expect(moved?.position.y).toBe(600);
  });

  it('duplicates and deletes nodes with undo and redo history', () => {
    const store = useEditorStore.getState();
    const initialCount = store.nodes.length;
    const targetId = store.nodes[1].id;

    // Duplicate
    store.duplicateNode(targetId);
    expect(useEditorStore.getState().nodes.length).toBe(initialCount + 1);
    expect(useEditorStore.getState().canUndo()).toBe(true);

    // Undo duplicate
    store.undo();
    expect(useEditorStore.getState().nodes.length).toBe(initialCount);
    expect(useEditorStore.getState().canRedo()).toBe(true);

    // Redo duplicate
    store.redo();
    expect(useEditorStore.getState().nodes.length).toBe(initialCount + 1);

    // Delete node
    const dupNodeId = useEditorStore.getState().nodes[initialCount].id;
    store.deleteNode(dupNodeId);
    expect(useEditorStore.getState().nodes.length).toBe(initialCount);
  });

  it('handles copy, paste, select all, and deselect', () => {
    const store = useEditorStore.getState();
    store.selectAllNodes();
    expect(useEditorStore.getState().selectedNodeIds.length).toBe(2);

    store.copySelectedNodes();
    expect(useEditorStore.getState().clipboard.length).toBe(2);

    store.pasteNodes();
    expect(useEditorStore.getState().nodes.length).toBe(4);

    store.selectNode(null);
    expect(useEditorStore.getState().selectedNodeId).toBeNull();
  });
});
