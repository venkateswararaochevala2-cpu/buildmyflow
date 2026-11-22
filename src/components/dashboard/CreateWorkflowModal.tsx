import React, { useState } from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { WorkflowMetadata } from '../../types/workflow';

interface CreateWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string, category: WorkflowMetadata['category']) => void;
}

export const CreateWorkflowModal: React.FC<CreateWorkflowModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<WorkflowMetadata['category']>('General Flow');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Workflow name is required.');
      return;
    }

    onCreate(name.trim(), description.trim(), category);
    setName('');
    setDescription('');
    setCategory('General');
    setError('');
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Workflow"
      description="Define the workflow identity and category to initialize the canvas."
      maxWidth="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Create Workflow
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <Input
          label="Workflow Name *"
          placeholder="e.g. User Onboarding Flow"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError('');
          }}
          error={error}
          autoFocus
        />

        <Textarea
          label="Description (Optional)"
          placeholder="Summarize the intent and execution steps of this flow..."
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <Select
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value as WorkflowMetadata['category'])}
          options={[
            { value: 'General Flow', label: 'General Flow' },
            { value: 'Chatbot', label: 'Chatbot Flow' },
            { value: 'Customer Journey', label: 'Customer Journey' },
            { value: 'Product Flow', label: 'Product Flow' },
            { value: 'Form Flow', label: 'Form Flow' },
            { value: 'Support Flow', label: 'Support Flow' },
          ]}
        />
      </form>
    </Dialog>
  );
};
