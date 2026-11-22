import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StoredWorkflowRecord } from '../../db/database';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  exportWorkflowToJson,
  downloadJsonFile,
} from '../../services/workflowStorage';
import {
  FolderOpen,
  Copy,
  Trash2,
  Download,
  Edit2,
  Calendar,
  Layers,
  Check,
  X,
} from 'lucide-react';

interface WorkflowCardProps {
  workflow: StoredWorkflowRecord;
  onDuplicate: (id: string) => void;
  onDelete: (id: string, name: string) => void;
  onRename: (id: string, newName: string) => void;
}

export const WorkflowCard: React.FC<WorkflowCardProps> = ({
  workflow,
  onDuplicate,
  onDelete,
  onRename,
}) => {
  const navigate = useNavigate();
  const [isRenaming, setIsRenaming] = useState(false);
  const [nameVal, setNameVal] = useState(workflow.name);

  const blockCount = workflow.data?.nodes?.length || 0;
  const modifiedDate = new Date(workflow.updatedAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const handleExport = (e: React.MouseEvent) => {
    e.stopPropagation();
    const jsonStr = exportWorkflowToJson(workflow.data);
    const safeName = workflow.name.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    downloadJsonFile(jsonStr, `${safeName}_workflow.json`);
  };

  const handleSaveRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (nameVal.trim() && nameVal !== workflow.name) {
      onRename(workflow.id, nameVal.trim());
    }
    setIsRenaming(false);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNameVal(workflow.name);
    setIsRenaming(false);
  };

  return (
    <div
      onClick={() => !isRenaming && navigate(`/editor/${workflow.id}`)}
      className="group relative flex flex-col justify-between rounded-md border border-zinc-200 bg-white p-4 hover:border-zinc-400 hover:shadow-xs transition-all cursor-pointer text-left select-none"
    >
      <div className="space-y-2">
        {/* Header & Badges */}
        <div className="flex items-start justify-between gap-2">
          {isRenaming ? (
            <div className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={nameVal}
                onChange={(e) => setNameVal(e.target.value)}
                autoFocus
                className="h-7 w-full px-2 text-xs font-semibold text-zinc-900 border border-blue-600 rounded focus:outline-none"
              />
              <button
                onClick={handleSaveRename}
                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                title="Save Name"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                onClick={handleCancelRename}
                className="p-1 text-zinc-400 hover:bg-zinc-100 rounded"
                title="Cancel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex-1 overflow-hidden">
              <h3 className="text-sm font-semibold text-zinc-900 group-hover:text-blue-600 truncate transition-colors">
                {workflow.name}
              </h3>
            </div>
          )}

          <div className="flex items-center gap-1 shrink-0">
            <Badge variant="secondary">{workflow.category || 'General'}</Badge>
            <Badge variant={workflow.status === 'published' ? 'success' : 'outline'}>
              {workflow.status}
            </Badge>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-zinc-500 line-clamp-2 min-h-[32px]">
          {workflow.description || 'No description provided.'}
        </p>
      </div>

      {/* Metadata & Actions */}
      <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1" title="Block count">
            <Layers className="h-3.5 w-3.5" />
            <span>{blockCount} blocks</span>
          </span>
          <span className="flex items-center gap-1" title="Last updated">
            <Calendar className="h-3.5 w-3.5" />
            <span>{modifiedDate}</span>
          </span>
        </div>

        <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsRenaming(true);
            }}
            className="p-1.5 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded"
            title="Rename Workflow"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(workflow.id);
            }}
            className="p-1.5 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded"
            title="Duplicate Workflow"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={handleExport}
            className="p-1.5 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded"
            title="Export JSON"
          >
            <Download className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(workflow.id, workflow.name);
            }}
            className="p-1.5 text-zinc-500 hover:text-red-600 hover:bg-zinc-100 rounded"
            title="Delete Workflow"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
