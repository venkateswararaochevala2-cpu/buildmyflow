import React from 'react';
import { clsx } from 'clsx';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export const Switch: React.FC<SwitchProps> = ({ checked, onChange, label, description, disabled }) => {
  return (
    <label className={clsx('flex items-center justify-between gap-3 cursor-pointer select-none', disabled && 'opacity-50 cursor-not-allowed')}>
      {(label || description) && (
        <div className="flex flex-col">
          {label && <span className="text-xs font-medium text-zinc-800">{label}</span>}
          {description && <span className="text-[11px] text-zinc-500">{description}</span>}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={clsx(
          'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-1 focus:ring-blue-600',
          checked ? 'bg-blue-600' : 'bg-zinc-300'
        )}
      >
        <span
          className={clsx(
            'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-150 ease-in-out',
            checked ? 'translate-x-4' : 'translate-x-0'
          )}
        />
      </button>
    </label>
  );
};
