import React from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { key: 'Ctrl + S', description: 'Save current workflow to IndexedDB' },
  { key: 'Ctrl + Z', description: 'Undo last action' },
  { key: 'Ctrl + Shift + Z', description: 'Redo previously undone action' },
  { key: 'Ctrl + C', description: 'Copy selected blocks to clipboard' },
  { key: 'Ctrl + V', description: 'Paste blocks from clipboard' },
  { key: 'Ctrl + D', description: 'Duplicate currently selected block' },
  { key: 'Delete / Backspace', description: 'Delete selected blocks' },
  { key: 'Ctrl + A', description: 'Select all blocks on canvas' },
  { key: 'Escape', description: 'Clear selection or close active modal' },
];

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Keyboard Shortcuts"
      description="Quick access key bindings for efficient workflow editing."
      maxWidth="md"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="divide-y divide-zinc-100 text-xs">
        {SHORTCUTS.map((sc) => (
          <div key={sc.key} className="py-2.5 flex items-center justify-between">
            <span className="text-zinc-700">{sc.description}</span>
            <kbd className="px-2 py-1 font-mono text-[11px] font-semibold text-zinc-800 bg-zinc-100 border border-zinc-300 rounded shadow-2xs">
              {sc.key}
            </kbd>
          </div>
        ))}
      </div>
    </Dialog>
  );
};
