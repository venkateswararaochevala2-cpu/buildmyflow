import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEditorStore } from '../../store/useEditorStore';
import { useToast } from '../ui/Toast';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ValidationPanel } from './ValidationPanel';
import { PreviewModal } from './PreviewModal';
import { KeyboardShortcutsModal } from '../common/KeyboardShortcutsModal';
import {
  exportWorkflowToJson,
  downloadJsonFile,
  importWorkflowFromJson,
} from '../../services/workflowStorage';
import { validateWorkflow } from '../../services/validationService';
import {
  ArrowLeft,
  Save,
  Undo2,
  Redo2,
  Play,
  CheckCircle,
  AlertCircle,
  Download,
  Upload,
  Keyboard,
  Settings,
  MoreVertical,
} from 'lucide-react';

export const Toolbar: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    metadata,
    nodes,
    edges,
    viewport,
    settings,
    isDirty,
    isSaving,
    lastSavedTime,
    undo,
    redo,
    canUndo,
    canRedo,
    saveCurrentWorkflow,
    updateWorkflowMetadata,
    loadWorkflow,
  } = useEditorStore();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(metadata?.name || 'Untitled Workflow');
  const [isValidationOpen, setIsValidationOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Calculate validation issue count for badge
  const validationReport = metadata
    ? validateWorkflow({
        metadata,
        nodes,
        edges,
        viewport,
        settings,
        schemaVersion: 1,
      })
    : null;

  const handleSave = async () => {
    try {
      await saveCurrentWorkflow();
      addToast({
        type: 'success',
        title: 'Workflow Saved',
        description: 'All nodes and connections have been stored in IndexedDB.',
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Save Failed',
        description: 'Could not write to local storage.',
      });
    }
  };

  const handleBackToDashboard = () => {
    if (isDirty) {
      const confirmLeave = window.confirm(
        'You have unsaved changes. Are you sure you want to return to the Dashboard?'
      );
      if (!confirmLeave) return;
    }
    navigate('/');
  };

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleInput.trim() && titleInput !== metadata?.name) {
      updateWorkflowMetadata({ name: titleInput.trim() });
    }
  };

  const handleExportJson = () => {
    if (!metadata) return;
    const currentData = {
      metadata,
      nodes,
      edges,
      viewport,
      settings,
      schemaVersion: 1,
    };
    const jsonStr = exportWorkflowToJson(currentData);
    const safeName = metadata.name.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    downloadJsonFile(jsonStr, `${safeName}_workflow.json`);
    addToast({
      type: 'info',
      title: 'Workflow Exported',
      description: `Saved as ${safeName}_workflow.json`,
    });
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const content = event.target?.result as string;
          const imported = await importWorkflowFromJson(content);
          loadWorkflow(imported);
          addToast({
            type: 'success',
            title: 'Workflow Imported',
            description: `Successfully loaded "${imported.metadata.name}"`,
          });
        } catch (err: any) {
          addToast({
            type: 'error',
            title: 'Import Failed',
            description: err.message || 'File structure does not match schema.',
          });
        }
      };
      reader.readAsText(file);
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Read Error',
        description: err.message,
      });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <header className="h-12 border-b border-zinc-200 bg-white px-3 flex items-center justify-between shrink-0 select-none">
        {/* Left: Back & Editable Title */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToDashboard}
            className="text-zinc-600 hover:text-zinc-900 -ml-1"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Dashboard</span>
          </Button>

          <div className="h-4 w-px bg-zinc-200" />

          {/* Editable Name */}
          {isEditingTitle ? (
            <input
              type="text"
              value={titleInput}
              autoFocus
              onBlur={handleTitleSubmit}
              onChange={(e) => setTitleInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleSubmit();
                if (e.key === 'Escape') {
                  setTitleInput(metadata?.name || '');
                  setIsEditingTitle(false);
                }
              }}
              className="h-7 px-2 text-xs font-semibold text-zinc-900 border border-blue-600 rounded focus:outline-none"
            />
          ) : (
            <div
              onClick={() => {
                setTitleInput(metadata?.name || '');
                setIsEditingTitle(true);
              }}
              className="group flex items-center gap-1.5 cursor-pointer rounded px-2 py-1 hover:bg-zinc-100"
              title="Click to rename workflow"
            >
              <span className="text-xs font-semibold text-zinc-900 truncate max-w-[200px] sm:max-w-[320px]">
                {metadata?.name || 'Untitled Workflow'}
              </span>
              <span className="text-[10px] text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                rename
              </span>
            </div>
          )}

          {metadata?.category && (
            <Badge variant="secondary" className="hidden md:inline-flex">
              {metadata.category}
            </Badge>
          )}
        </div>

        {/* Center: Save, Undo, Redo */}
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={undo}
            disabled={!canUndo()}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={redo}
            disabled={!canRedo()}
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </Button>

          <div className="h-4 w-px bg-zinc-200 mx-1" />

          <Button
            size="sm"
            variant={isDirty ? 'primary' : 'outline'}
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="h-3.5 w-3.5 mr-1" />
            <span className="text-xs">
              {isSaving ? 'Saving...' : isDirty ? 'Save Changes' : 'Saved'}
            </span>
          </Button>
          {lastSavedTime && (
            <span className="text-[10px] text-zinc-400 hidden lg:inline ml-1">
              at {lastSavedTime}
            </span>
          )}
        </div>

        {/* Right: Validation, Preview, Import/Export, Settings */}
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsValidationOpen(true)}
            title="Validate Workflow"
            className="relative"
          >
            {validationReport && validationReport.errorsCount > 0 ? (
              <AlertCircle className="h-3.5 w-3.5 text-rose-600 mr-1" />
            ) : (
              <CheckCircle className="h-3.5 w-3.5 text-emerald-600 mr-1" />
            )}
            <span className="hidden sm:inline">Validate</span>
            {validationReport && validationReport.errorsCount > 0 && (
              <span className="ml-1 rounded-full bg-rose-600 text-white text-[10px] px-1 py-0.2 font-mono">
                {validationReport.errorsCount}
              </span>
            )}
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsPreviewOpen(true)}
            title="Preview and Execute Workflow"
          >
            <Play className="h-3.5 w-3.5 mr-1" />
            <span>Preview</span>
          </Button>

          <div className="h-4 w-px bg-zinc-200 mx-0.5" />

          {/* Import / Export / Settings Dropdown */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsShortcutsOpen(true)}
            title="Keyboard Shortcuts"
            className="hidden sm:inline-flex"
          >
            <Keyboard className="h-3.5 w-3.5" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleExportJson}
            title="Export JSON"
            className="hidden sm:inline-flex"
          >
            <Download className="h-3.5 w-3.5" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
            title="Import JSON"
            className="hidden sm:inline-flex"
          >
            <Upload className="h-3.5 w-3.5" />
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleImportFile}
            className="hidden"
          />

          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate('/settings')}
            title="Application Settings"
          >
            <Settings className="h-3.5 w-3.5" />
          </Button>
        </div>
      </header>

      {/* Validation Panel Dialog */}
      {isValidationOpen && (
        <ValidationPanel
          isOpen={isValidationOpen}
          onClose={() => setIsValidationOpen(false)}
        />
      )}

      {/* Preview Modal Dialog */}
      {isPreviewOpen && (
        <PreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}

      {/* Keyboard Shortcuts Dialog */}
      {isShortcutsOpen && (
        <KeyboardShortcutsModal
          isOpen={isShortcutsOpen}
          onClose={() => setIsShortcutsOpen(false)}
        />
      )}
    </>
  );
};
