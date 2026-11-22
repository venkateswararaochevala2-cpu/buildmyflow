import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAllWorkflows,
  createNewWorkflow,
  duplicateWorkflow,
  renameWorkflow,
  deleteWorkflow,
} from '../services/workflowStorage';
import { StoredWorkflowRecord } from '../db/database';
import { WorkflowCard } from '../components/dashboard/WorkflowCard';
import { CreateWorkflowModal } from '../components/dashboard/CreateWorkflowModal';
import { ImportWorkflowModal } from '../components/dashboard/ImportWorkflowModal';
import { EmptyState } from '../components/dashboard/EmptyState';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { useToast } from '../components/ui/Toast';
import { WorkflowMetadata } from '../types/workflow';
import {
  Plus,
  Upload,
  Search,
  Settings,
  Workflow,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [workflows, setWorkflows] = useState<StoredWorkflowRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search, Filter & Sort states
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'modified' | 'created' | 'name'>('modified');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const fetchWorkflows = async () => {
    setIsLoading(true);
    try {
      const records = await getAllWorkflows();
      setWorkflows(records);
    } catch (err) {
      console.error('Failed to load workflows', err);
      addToast({
        type: 'error',
        title: 'Storage Error',
        description: 'Failed to retrieve workflows from IndexedDB.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  // Filter & Sort computation
  const filteredWorkflows = useMemo(() => {
    return workflows
      .filter((wf) => {
        const matchesQuery =
          wf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          wf.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory =
          categoryFilter === 'all' || wf.category === categoryFilter;
        return matchesQuery && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'created') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [workflows, searchQuery, categoryFilter, sortBy]);

  const handleCreate = async (
    name: string,
    description: string,
    category: WorkflowMetadata['category']
  ) => {
    try {
      const newWf = await createNewWorkflow(name, description, category);
      setIsCreateOpen(false);
      addToast({
        type: 'success',
        title: 'Workflow Created',
        description: `"${newWf.metadata.name}" initialized.`,
      });
      navigate(`/editor/${newWf.metadata.id}`);
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Creation Failed',
        description: 'Could not create new workflow.',
      });
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const copy = await duplicateWorkflow(id);
      if (copy) {
        addToast({
          type: 'success',
          title: 'Workflow Duplicated',
          description: `Created copy "${copy.metadata.name}"`,
        });
        fetchWorkflows();
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Duplicate Failed',
        description: 'Could not duplicate workflow.',
      });
    }
  };

  const handleRename = async (id: string, newName: string) => {
    try {
      await renameWorkflow(id, newName);
      addToast({
        type: 'success',
        title: 'Workflow Renamed',
        description: `Name updated to "${newName}"`,
      });
      fetchWorkflows();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Rename Failed',
        description: 'Could not update workflow name.',
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteWorkflow(deleteTarget.id);
      addToast({
        type: 'info',
        title: 'Workflow Deleted',
        description: `"${deleteTarget.name}" has been removed.`,
      });
      fetchWorkflows();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Delete Failed',
        description: 'Failed to delete workflow from storage.',
      });
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* Top Navigation */}
      <header className="h-14 border-b border-zinc-200 bg-white px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
            <Workflow className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-zinc-900 leading-tight">Visual Flow Builder</h1>
            <p className="text-[11px] text-zinc-500">Workflow Studio</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate('/settings')}
            title="Application Settings"
          >
            <Settings className="h-4 w-4 mr-1.5" />
            <span>Settings</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsImportOpen(true)}
          >
            <Upload className="h-3.5 w-3.5 mr-1.5" />
            <span>Import JSON</span>
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            <span>New Workflow</span>
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Search, Filter & Sort Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-md border border-zinc-200">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search workflows by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-2.5 text-xs bg-white border border-zinc-300 rounded focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 placeholder:text-zinc-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={categoryFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategoryFilter(e.target.value)}
              className="h-8 text-xs min-w-[130px]"
              options={[
                { value: 'all', label: 'All Categories' },
                { value: 'General Flow', label: 'General Flow' },
                { value: 'Chatbot', label: 'Chatbot' },
                { value: 'Customer Journey', label: 'Customer Journey' },
                { value: 'Product Flow', label: 'Product Flow' },
                { value: 'Form Flow', label: 'Form Flow' },
                { value: 'Support Flow', label: 'Support Flow' },
              ]}
            />

            <Select
              value={sortBy}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value as any)}
              className="h-8 text-xs min-w-[130px]"
              options={[
                { value: 'modified', label: 'Recently Modified' },
                { value: 'created', label: 'Date Created' },
                { value: 'name', label: 'Alphabetical' },
              ]}
            />
          </div>
        </div>

        {/* Workflows Grid / Empty State */}
        {isLoading ? (
          <div className="py-20 text-center text-xs text-zinc-500">
            Loading workflows from local storage...
          </div>
        ) : filteredWorkflows.length === 0 ? (
          workflows.length === 0 ? (
            <EmptyState
              onCreate={() => setIsCreateOpen(true)}
              onImport={() => setIsImportOpen(true)}
            />
          ) : (
            <div className="py-16 text-center text-xs text-zinc-500">
              No workflows match your search or filter criteria.
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWorkflows.map((wf) => (
              <WorkflowCard
                key={wf.id}
                workflow={wf}
                onDuplicate={handleDuplicate}
                onDelete={(id: string, name: string) => setDeleteTarget({ id, name })}
                onRename={handleRename}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <CreateWorkflowModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreate}
      />

      <ImportWorkflowModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportSuccess={() => fetchWorkflows()}
      />

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Workflow"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action removes all nodes, connections, and local data permanently.`}
        confirmLabel="Delete Workflow"
        variant="destructive"
      />
    </div>
  );
};
