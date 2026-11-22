import React, { useState } from 'react';
import { CATEGORIES_LIST, BLOCK_DEFINITIONS } from '../../constants/blockDefinitions';
import { NodeType } from '../../types/workflow';
import { useEditorStore } from '../../store/useEditorStore';
import { Search, ChevronDown, ChevronRight, Plus } from 'lucide-react';

interface BlockLibraryProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const BlockLibrary: React.FC<BlockLibraryProps> = ({ isCollapsed, onToggleCollapse }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    message: true,
    interactive: true,
    content: true,
    flow: true,
  });

  const addNode = useEditorStore((s) => s.addNode);

  const toggleCategory = (catId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const handleDragStart = (e: React.DragEvent, nodeType: NodeType) => {
    e.dataTransfer.setData('application/reactflow-type', nodeType);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleClickAdd = (nodeType: NodeType) => {
    // Add near center of canvas
    addNode(nodeType, { x: 300 + Math.random() * 50, y: 200 + Math.random() * 50 });
  };

  if (isCollapsed) {
    return (
      <div className="w-12 border-r border-zinc-200 bg-white flex flex-col items-center py-4">
        <button
          onClick={onToggleCollapse}
          className="p-2 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded"
          title="Expand Block Library"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  const query = searchQuery.trim().toLowerCase();

  return (
    <aside className="w-72 border-r border-zinc-200 bg-white flex flex-col h-full select-none shrink-0">
      {/* Header & Search */}
      <div className="p-3 border-b border-zinc-200 space-y-2.5 bg-zinc-50/50">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-700">Block Library</span>
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1 text-zinc-400 hover:text-zinc-600 rounded"
              title="Collapse Panel"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search blocks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-7 pl-8 pr-2.5 text-xs bg-white border border-zinc-300 rounded focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 placeholder:text-zinc-400"
          />
        </div>
      </div>

      {/* Block List with Categories */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-3">
        {CATEGORIES_LIST.map((category) => {
          const matchingTypes = category.types.filter((t) => {
            const def = BLOCK_DEFINITIONS[t];
            return (
              def.name.toLowerCase().includes(query) ||
              def.description.toLowerCase().includes(query)
            );
          });

          if (query && matchingTypes.length === 0) return null;

          const isExpanded = expandedCategories[category.id] ?? true;

          return (
            <div key={category.id} className="space-y-1">
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center justify-between py-1 px-1.5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider hover:text-zinc-800 transition-colors"
              >
                <span>{category.name}</span>
                {isExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
                )}
              </button>

              {isExpanded && (
                <div className="space-y-1">
                  {matchingTypes.map((type) => {
                    const block = BLOCK_DEFINITIONS[type];
                    return (
                      <div
                        key={type}
                        draggable
                        onDragStart={(e) => handleDragStart(e, type)}
                        onClick={() => handleClickAdd(type)}
                        className="group flex items-start justify-between p-2 rounded border border-zinc-200 bg-white hover:border-zinc-400 hover:bg-zinc-50 cursor-grab active:cursor-grabbing transition-all text-left shadow-2xs"
                      >
                        <div className="flex-1 overflow-hidden pr-2">
                          <div className="text-xs font-medium text-zinc-900 group-hover:text-blue-600">
                            {block.name}
                          </div>
                          <div className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                            {block.description}
                          </div>
                        </div>

                        <button
                          type="button"
                          className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-blue-600 hover:bg-zinc-200 rounded transition-opacity"
                          title="Click to insert"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
};
