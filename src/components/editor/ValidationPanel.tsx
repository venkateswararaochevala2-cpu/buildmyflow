import React from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { validateWorkflow } from '../../services/validationService';
import { Dialog } from '../ui/Dialog';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { AlertCircle, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';
import { useReactFlow } from '@xyflow/react';

interface ValidationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ValidationPanel: React.FC<ValidationPanelProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const { nodes, edges, viewport, metadata, settings, selectNode } = useEditorStore();
  const reactFlow = useReactFlow();

  if (!metadata) return null;

  const currentWorkflowData = {
    metadata,
    nodes,
    edges,
    viewport,
    settings,
    schemaVersion: 1,
  };

  const report = validateWorkflow(currentWorkflowData);

  const handleFocusNode = (nodeId?: string) => {
    if (!nodeId) return;
    const targetNode = nodes.find((n) => n.id === nodeId);
    if (targetNode) {
      selectNode(nodeId);
      if (reactFlow?.setCenter) {
        reactFlow.setCenter(targetNode.position.x + 120, targetNode.position.y + 60, {
          zoom: 1.2,
          duration: 400,
        });
      }
      onClose();
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Workflow Validation"
      description="Review structural integrity, missing parameters, and connection validity."
      maxWidth="lg"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="space-y-4">
        {/* Status Header */}
        <div className="flex items-center justify-between p-3 rounded border border-zinc-200 bg-zinc-50">
          <div className="flex items-center gap-2">
            {report.isValid ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-rose-600" />
            )}
            <div>
              <p className="text-xs font-semibold text-zinc-900">
                {report.isValid ? 'Workflow Structure is Valid' : 'Validation Issues Detected'}
              </p>
              <p className="text-[11px] text-zinc-500">
                {report.errorsCount} critical error{report.errorsCount !== 1 ? 's' : ''},{' '}
                {report.warningsCount} warning{report.warningsCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {report.errorsCount > 0 && <Badge variant="error">{report.errorsCount} Errors</Badge>}
            {report.warningsCount > 0 && <Badge variant="warning">{report.warningsCount} Warnings</Badge>}
            {report.isValid && <Badge variant="success">Pass</Badge>}
          </div>
        </div>

        {/* Issues List */}
        {report.issues.length === 0 ? (
          <div className="py-8 text-center text-zinc-500 text-xs">
            No issues found. This workflow meets all validation requirements and is ready for execution.
          </div>
        ) : (
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {report.issues.map((issue) => (
              <div
                key={issue.id}
                onClick={() => handleFocusNode(issue.nodeId)}
                className={`flex items-start justify-between p-2.5 rounded border transition-colors ${
                  issue.nodeId ? 'cursor-pointer hover:bg-zinc-50 hover:border-zinc-400' : ''
                } ${
                  issue.severity === 'error'
                    ? 'border-rose-200 bg-rose-50/30'
                    : 'border-amber-200 bg-amber-50/30'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {issue.severity === 'error' ? (
                    <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-zinc-900">{issue.title}</span>
                      <span className="text-[10px] uppercase font-mono px-1 py-0.2 bg-zinc-200 rounded text-zinc-600">
                        {issue.category}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 mt-0.5">{issue.message}</p>
                  </div>
                </div>

                {issue.nodeId && (
                  <button
                    className="flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-800 shrink-0 ml-2"
                    title="Focus Block on Canvas"
                  >
                    <span>Inspect</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Dialog>
  );
};
