import React, { useState } from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { importWorkflowFromJson } from '../../services/workflowStorage';
import { useToast } from '../ui/Toast';
import { WorkflowData } from '../../types/workflow';
import { Upload } from 'lucide-react';

interface ImportWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (workflow: WorkflowData) => void;
}

export const ImportWorkflowModal: React.FC<ImportWorkflowModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const { addToast } = useToast();
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setJsonText(event.target?.result as string);
      setError('');
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!jsonText.trim()) {
      setError('Please provide workflow JSON data.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const workflow = await importWorkflowFromJson(jsonText);
      addToast({
        type: 'success',
        title: 'Workflow Imported',
        description: `Imported "${workflow.metadata.name}" successfully.`,
      });
      onImportSuccess(workflow);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to import workflow JSON.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Import Workflow"
      description="Upload a .json file or paste workflow JSON content."
      maxWidth="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleImport} disabled={isLoading}>
            {isLoading ? 'Importing...' : 'Import Workflow'}
          </Button>
        </>
      }
    >
      <div className="space-y-3.5">
        <div>
          <label className="text-xs font-medium text-zinc-700 block mb-1">
            Upload Workflow JSON File
          </label>
          <input
            type="file"
            accept=".json,application/json"
            onChange={handleFileUpload}
            className="text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded file:border file:border-zinc-300 file:text-xs file:font-medium file:bg-zinc-50 file:text-zinc-700 hover:file:bg-zinc-100"
          />
        </div>

        <div className="text-center text-xs text-zinc-400 font-semibold">— OR —</div>

        <Textarea
          label="Paste Workflow JSON"
          rows={6}
          placeholder='{"metadata": {...}, "nodes": [...], "edges": [...]}'
          value={jsonText}
          onChange={(e) => {
            setJsonText(e.target.value);
            if (error) setError('');
          }}
          error={error}
          className="font-mono text-[11px]"
        />
      </div>
    </Dialog>
  );
};
