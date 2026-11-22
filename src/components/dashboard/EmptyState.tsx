import React from 'react';
import { Button } from '../ui/Button';
import { Plus, Upload, Workflow } from 'lucide-react';

interface EmptyStateProps {
  onCreate: () => void;
  onImport: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onCreate, onImport }) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50/50 p-12 text-center">
      <div className="rounded-full bg-zinc-100 p-3 text-zinc-600 mb-3">
        <Workflow className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-semibold text-zinc-900">No Workflows Available</h3>
      <p className="mt-1 text-xs text-zinc-500 max-w-sm">
        You have not created any visual workflows yet. Start building from scratch or import an existing workflow JSON.
      </p>
      <div className="mt-5 flex items-center gap-2">
        <Button variant="primary" onClick={onCreate}>
          <Plus className="h-4 w-4 mr-1.5" />
          <span>Create Workflow</span>
        </Button>
        <Button variant="outline" onClick={onImport}>
          <Upload className="h-4 w-4 mr-1.5" />
          <span>Import JSON</span>
        </Button>
      </div>
    </div>
  );
};
