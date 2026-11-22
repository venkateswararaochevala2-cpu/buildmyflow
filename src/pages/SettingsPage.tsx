import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '../store/useSettingsStore';
import {
  getAllWorkflows,
  saveWorkflow,
  downloadJsonFile,
  clearAllApplicationData,
} from '../services/workflowStorage';
import { Button } from '../components/ui/Button';
import { Switch } from '../components/ui/Switch';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { useToast } from '../components/ui/Toast';
import {
  ArrowLeft,
  Download,
  Upload,
  Trash2,
  Sliders,
  Database,
  Keyboard,
  RotateCcw,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const settings = useSettingsStore();

  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExportAll = async () => {
    try {
      const all = await getAllWorkflows();
      const backupData = {
        exportedAt: new Date().toISOString(),
        version: 1,
        workflows: all.map((r) => r.data),
      };
      const jsonStr = JSON.stringify(backupData, null, 2);
      downloadJsonFile(jsonStr, `flow_builder_backup_${new Date().toISOString().slice(0, 10)}.json`);
      addToast({
        type: 'success',
        title: 'Export Completed',
        description: `Exported ${all.length} workflows to JSON backup.`,
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Export Failed',
        description: 'Failed to retrieve workflows for backup.',
      });
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        const list = Array.isArray(parsed) ? parsed : parsed.workflows;
        if (!Array.isArray(list)) {
          throw new Error('Invalid backup file structure.');
        }

        let importedCount = 0;
        for (const wf of list) {
          if (wf && wf.metadata && wf.nodes && wf.edges) {
            await saveWorkflow(wf);
            importedCount++;
          }
        }

        addToast({
          type: 'success',
          title: 'Import Successful',
          description: `Restored ${importedCount} workflows into IndexedDB.`,
        });
      } catch (err: any) {
        addToast({
          type: 'error',
          title: 'Import Failed',
          description: err.message || 'File could not be parsed.',
        });
      } finally {
        setIsImporting(false);
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleClearAllData = async () => {
    try {
      await clearAllApplicationData();
      settings.resetSettings();
      addToast({
        type: 'info',
        title: 'Application Reset',
        description: 'All local workflows, images, and preferences have been cleared.',
      });
      navigate('/');
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Reset Failed',
        description: 'Could not wipe IndexedDB tables.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* Top Header */}
      <header className="h-14 border-b border-zinc-200 bg-white px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="-ml-2 text-zinc-600 hover:text-zinc-900"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Dashboard</span>
          </Button>
          <div className="h-4 w-px bg-zinc-200" />
          <h1 className="text-sm font-semibold text-zinc-900">Application Settings</h1>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 space-y-6">
        {/* Canvas & Editor Settings */}
        <section className="bg-white rounded-md border border-zinc-200 p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
            <Sliders className="h-4 w-4 text-zinc-600" />
            <h2 className="text-sm font-semibold text-zinc-900">Canvas & Editor Configuration</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Switch
              label="Grid Background"
              description="Display coordinate dots on editor canvas"
              checked={settings.showGrid}
              onChange={(val) => settings.updateSettings({ showGrid: val })}
            />

            <Switch
              label="Overview Minimap"
              description="Display bottom-right navigation minimap"
              checked={settings.showMinimap}
              onChange={(val) => settings.updateSettings({ showMinimap: val })}
            />

            <Switch
              label="Snap to Grid"
              description="Snap dragged blocks to coordinate grid"
              checked={settings.snapToGrid}
              onChange={(val) => settings.updateSettings({ snapToGrid: val })}
            />

            <Switch
              label="Autosave Changes"
              description="Automatically sync changes to IndexedDB"
              checked={settings.autosaveEnabled}
              onChange={(val) => settings.updateSettings({ autosaveEnabled: val })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-100">
            <Select
              label="Grid Interval Size"
              value={String(settings.gridSize)}
              onChange={(e) => settings.updateSettings({ gridSize: Number(e.target.value) })}
              options={[
                { value: '10', label: '10px (Dense)' },
                { value: '20', label: '20px (Standard)' },
                { value: '30', label: '30px (Wide)' },
              ]}
            />

            <Select
              label="Autosave Interval"
              value={String(settings.autosaveDelayMs)}
              onChange={(e) => settings.updateSettings({ autosaveDelayMs: Number(e.target.value) })}
              options={[
                { value: '1000', label: '1 second' },
                { value: '2500', label: '2.5 seconds (Default)' },
                { value: '5000', label: '5 seconds' },
              ]}
            />
          </div>
        </section>

        {/* Data Management */}
        <section className="bg-white rounded-md border border-zinc-200 p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
            <Database className="h-4 w-4 text-zinc-600" />
            <h2 className="text-sm font-semibold text-zinc-900">Local Data & Portability</h2>
          </div>

          <p className="text-xs text-zinc-600 leading-relaxed">
            All workflows and uploaded image media are stored directly in your browser's IndexedDB database. No data is transmitted to an external server.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={handleExportAll}>
              <Download className="h-3.5 w-3.5 mr-1.5" />
              <span>Export All Workflows</span>
            </Button>

            <label className="inline-flex">
              <Button
                variant="outline"
                size="sm"
                disabled={isImporting}
                onClick={() => document.getElementById('backup-input')?.click()}
              >
                <Upload className="h-3.5 w-3.5 mr-1.5" />
                <span>{isImporting ? 'Importing...' : 'Restore from Backup'}</span>
              </Button>
              <input
                id="backup-input"
                type="file"
                accept=".json,application/json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsConfirmClearOpen(true)}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              <span>Clear All Application Data</span>
            </Button>
          </div>
        </section>

        {/* Keyboard Shortcuts Reference */}
        <section className="bg-white rounded-md border border-zinc-200 p-5 space-y-3">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
            <Keyboard className="h-4 w-4 text-zinc-600" />
            <h2 className="text-sm font-semibold text-zinc-900">Keyboard Shortcuts Reference</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-zinc-100">
              <span className="text-zinc-600">Save Workflow</span>
              <kbd className="px-1.5 py-0.5 font-mono text-[11px] bg-zinc-100 rounded border border-zinc-200">Ctrl + S</kbd>
            </div>
            <div className="flex justify-between py-1.5 border-b border-zinc-100">
              <span className="text-zinc-600">Undo Action</span>
              <kbd className="px-1.5 py-0.5 font-mono text-[11px] bg-zinc-100 rounded border border-zinc-200">Ctrl + Z</kbd>
            </div>
            <div className="flex justify-between py-1.5 border-b border-zinc-100">
              <span className="text-zinc-600">Redo Action</span>
              <kbd className="px-1.5 py-0.5 font-mono text-[11px] bg-zinc-100 rounded border border-zinc-200">Ctrl + Shift + Z</kbd>
            </div>
            <div className="flex justify-between py-1.5 border-b border-zinc-100">
              <span className="text-zinc-600">Copy Selected</span>
              <kbd className="px-1.5 py-0.5 font-mono text-[11px] bg-zinc-100 rounded border border-zinc-200">Ctrl + C</kbd>
            </div>
            <div className="flex justify-between py-1.5 border-b border-zinc-100">
              <span className="text-zinc-600">Paste Blocks</span>
              <kbd className="px-1.5 py-0.5 font-mono text-[11px] bg-zinc-100 rounded border border-zinc-200">Ctrl + V</kbd>
            </div>
            <div className="flex justify-between py-1.5 border-b border-zinc-100">
              <span className="text-zinc-600">Duplicate Block</span>
              <kbd className="px-1.5 py-0.5 font-mono text-[11px] bg-zinc-100 rounded border border-zinc-200">Ctrl + D</kbd>
            </div>
            <div className="flex justify-between py-1.5 border-b border-zinc-100">
              <span className="text-zinc-600">Delete Block</span>
              <kbd className="px-1.5 py-0.5 font-mono text-[11px] bg-zinc-100 rounded border border-zinc-200">Delete / Backspace</kbd>
            </div>
            <div className="flex justify-between py-1.5 border-b border-zinc-100">
              <span className="text-zinc-600">Select All</span>
              <kbd className="px-1.5 py-0.5 font-mono text-[11px] bg-zinc-100 rounded border border-zinc-200">Ctrl + A</kbd>
            </div>
          </div>
        </section>
      </main>

      {/* Confirmation modal for data wipe */}
      <ConfirmModal
        isOpen={isConfirmClearOpen}
        onClose={() => setIsConfirmClearOpen(false)}
        onConfirm={handleClearAllData}
        title="Clear All Application Data"
        description="Are you certain you want to wipe all workflows and stored assets from IndexedDB? This action is permanent and cannot be undone."
        confirmLabel="Wipe All Data"
        variant="destructive"
      />
    </div>
  );
};
