import React, { useEffect, useRef } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { Copy, Trash2, Plus, CheckSquare } from 'lucide-react';
import { NodeType } from '../../types/workflow';

interface CanvasContextMenuProps {
  x: number;
  y: number;
  flowPosition: { x: number; y: number };
  onClose: () => void;
}

export const CanvasContextMenu: React.FC<CanvasContextMenuProps> = ({
  x,
  y,
  flowPosition,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const {
    selectedNodeId,
    selectedNodeIds,
    duplicateNode,
    deleteSelectedNodes,
    copySelectedNodes,
    pasteNodes,
    selectAllNodes,
    addNode,
  } = useEditorStore();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleAddQuickNode = (type: NodeType) => {
    addNode(type, flowPosition);
    onClose();
  };

  return (
    <div
      ref={menuRef}
      style={{ left: x, top: y }}
      className="fixed z-50 w-52 rounded-md border border-zinc-200 bg-white py-1 shadow-md text-xs select-none"
    >
      {selectedNodeIds.length > 0 ? (
        <>
          <button
            onClick={() => {
              copySelectedNodes();
              onClose();
            }}
            className="flex w-full items-center gap-2 px-3 py-1.5 hover:bg-zinc-100 text-zinc-700 text-left"
          >
            <Copy className="h-3.5 w-3.5" />
            <span>Copy ({selectedNodeIds.length})</span>
            <span className="ml-auto text-[10px] text-zinc-400">Ctrl+C</span>
          </button>

          {selectedNodeId && (
            <button
              onClick={() => {
                duplicateNode(selectedNodeId);
                onClose();
              }}
              className="flex w-full items-center gap-2 px-3 py-1.5 hover:bg-zinc-100 text-zinc-700 text-left"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>Duplicate Block</span>
              <span className="ml-auto text-[10px] text-zinc-400">Ctrl+D</span>
            </button>
          )}

          <button
            onClick={() => {
              deleteSelectedNodes();
              onClose();
            }}
            className="flex w-full items-center gap-2 px-3 py-1.5 hover:bg-zinc-100 text-red-600 text-left"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete Selected</span>
            <span className="ml-auto text-[10px] text-zinc-400">Del</span>
          </button>
          <div className="my-1 border-t border-zinc-100" />
        </>
      ) : (
        <>
          <button
            onClick={() => {
              pasteNodes();
              onClose();
            }}
            className="flex w-full items-center gap-2 px-3 py-1.5 hover:bg-zinc-100 text-zinc-700 text-left"
          >
            <Copy className="h-3.5 w-3.5" />
            <span>Paste Nodes</span>
            <span className="ml-auto text-[10px] text-zinc-400">Ctrl+V</span>
          </button>
        </>
      )}

      <button
        onClick={() => {
          selectAllNodes();
          onClose();
        }}
        className="flex w-full items-center gap-2 px-3 py-1.5 hover:bg-zinc-100 text-zinc-700 text-left"
      >
        <CheckSquare className="h-3.5 w-3.5" />
        <span>Select All</span>
        <span className="ml-auto text-[10px] text-zinc-400">Ctrl+A</span>
      </button>

      <div className="my-1 border-t border-zinc-100" />
      <div className="px-3 py-1 text-[10px] uppercase font-semibold text-zinc-400">Quick Insert</div>

      <button
        onClick={() => handleAddQuickNode('text')}
        className="flex w-full items-center gap-2 px-3 py-1.5 hover:bg-zinc-100 text-zinc-700 text-left"
      >
        <Plus className="h-3.5 w-3.5" />
        <span>Add Text Block</span>
      </button>
      <button
        onClick={() => handleAddQuickNode('button')}
        className="flex w-full items-center gap-2 px-3 py-1.5 hover:bg-zinc-100 text-zinc-700 text-left"
      >
        <Plus className="h-3.5 w-3.5" />
        <span>Add Button Block</span>
      </button>
      <button
        onClick={() => handleAddQuickNode('condition')}
        className="flex w-full items-center gap-2 px-3 py-1.5 hover:bg-zinc-100 text-zinc-700 text-left"
      >
        <Plus className="h-3.5 w-3.5" />
        <span>Add Condition Block</span>
      </button>
    </div>
  );
};
