import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ReactFlowProvider } from '@xyflow/react';
import { useEditorStore } from '../store/useEditorStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { getWorkflowById } from '../services/workflowStorage';
import { Toolbar } from '../components/editor/Toolbar';
import { BlockLibrary } from '../components/editor/BlockLibrary';
import { Canvas } from '../components/editor/Canvas';
import { PropertiesEditor } from '../components/editor/PropertiesEditor';
import { useToast } from '../components/ui/Toast';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const EditorContent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const {
    workflowId,
    loadWorkflow,
    saveCurrentWorkflow,
    isDirty,
    undo,
    redo,
    copySelectedNodes,
    pasteNodes,
    duplicateNode,
    deleteSelectedNodes,
    selectAllNodes,
    selectNode,
    selectedNodeId,
    nodes,
    edges,
    metadata,
  } = useEditorStore();

  const { autosaveEnabled, autosaveDelayMs } = useSettingsStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isLibraryCollapsed, setIsLibraryCollapsed] = useState(false);
  const [isPropertiesCollapsed, setIsPropertiesCollapsed] = useState(false);

  // Load workflow from database
  useEffect(() => {
    if (!id) {
      navigate('/');
      return;
    }

    const load = async () => {
      setIsLoading(true);
      try {
        const wf = await getWorkflowById(id);
        if (!wf) {
          addToast({
            type: 'error',
            title: 'Workflow Not Found',
            description: 'The requested workflow does not exist in local storage.',
          });
          navigate('/');
          return;
        }
        loadWorkflow(wf);
      } catch (err) {
        console.error('Failed to load workflow', err);
        addToast({
          type: 'error',
          title: 'Load Error',
          description: 'Failed to retrieve workflow from IndexedDB.',
        });
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [id]);

  // Debounced Autosave
  useEffect(() => {
    if (!isDirty || !autosaveEnabled || !workflowId) return;

    const timer = setTimeout(() => {
      saveCurrentWorkflow().catch((err) => {
        console.error('Autosave failed:', err);
      });
    }, autosaveDelayMs);

    return () => clearTimeout(timer);
  }, [isDirty, autosaveEnabled, autosaveDelayMs, workflowId, nodes, edges, metadata]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName);

      // Ctrl + S (Save)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveCurrentWorkflow().then(() => {
          addToast({
            type: 'success',
            title: 'Saved',
            description: 'Workflow saved to IndexedDB.',
          });
        });
        return;
      }

      // Ignore standard editing keystrokes when typing inside an input field
      if (isInput) return;

      // Ctrl + Z (Undo)
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undo();
        return;
      }

      // Ctrl + Shift + Z or Ctrl + Y (Redo)
      if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z') ||
          ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y')) {
        e.preventDefault();
        redo();
        return;
      }

      // Ctrl + C (Copy)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        copySelectedNodes();
        return;
      }

      // Ctrl + V (Paste)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        pasteNodes();
        return;
      }

      // Ctrl + D (Duplicate)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        if (selectedNodeId) duplicateNode(selectedNodeId);
        return;
      }

      // Delete / Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelectedNodes();
        return;
      }

      // Ctrl + A (Select All)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        selectAllNodes();
        return;
      }

      // Escape (Deselect)
      if (e.key === 'Escape') {
        selectNode(null);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, saveCurrentWorkflow, undo, redo, copySelectedNodes, pasteNodes, duplicateNode, deleteSelectedNodes, selectAllNodes, selectNode]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-zinc-50 text-xs text-zinc-500">
        Loading visual canvas...
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-white select-none">
      <Toolbar />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Panel: Block Library */}
        <BlockLibrary
          isCollapsed={isLibraryCollapsed}
          onToggleCollapse={() => setIsLibraryCollapsed(!isLibraryCollapsed)}
        />

        {/* Center Panel: Visual Canvas */}
        <main className="flex-1 relative h-full overflow-hidden">
          <Canvas />
        </main>

        {/* Right Panel Toggle on tablet / collapsed */}
        {isPropertiesCollapsed && (
          <div className="w-10 border-l border-zinc-200 bg-white flex flex-col items-center py-4">
            <button
              onClick={() => setIsPropertiesCollapsed(false)}
              className="p-2 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded"
              title="Expand Properties Editor"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Right Panel: Properties Editor */}
        {!isPropertiesCollapsed && (
          <div className="w-80 h-full shrink-0 relative">
            <PropertiesEditor />
            <button
              onClick={() => setIsPropertiesCollapsed(true)}
              className="absolute top-2.5 right-2 p-1 text-zinc-400 hover:text-zinc-600 rounded md:hidden"
              title="Collapse Properties"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const EditorPage: React.FC = () => {
  return (
    <ErrorBoundary fallbackTitle="Visual Editor Encountered an Error">
      <ReactFlowProvider>
        <EditorContent />
      </ReactFlowProvider>
    </ErrorBoundary>
  );
};
