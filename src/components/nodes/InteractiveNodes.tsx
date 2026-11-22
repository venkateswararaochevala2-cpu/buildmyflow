import React from 'react';
import { NodeProps, Handle, Position } from '@xyflow/react';
import { NodeWrapper } from './NodeWrapper';
import {
  ButtonNodeData,
  UserInputNodeData,
  MultipleChoiceNodeData,
  SingleChoiceNodeData,
  FormNodeData,
  LinkNodeData,
  QuestionNodeData,
  ContactInfoNodeData,
  DateSelectionNodeData,
  RatingNodeData,
  ConfirmationNodeData,
} from '../../types/workflow';
import {
  ExternalLink,
  Calendar,
  Star,
  Check,
  X,
  User,
  Mail,
  Phone,
  HelpCircle,
} from 'lucide-react';

export const ButtonNode: React.FC<NodeProps> = React.memo(({ id, data, selected }) => {
  const d = data as unknown as ButtonNodeData;
  const hasMultiple = Array.isArray(d.buttons) && d.buttons.length > 0;

  return (
    <NodeWrapper
      id={id}
      type="button"
      selected={selected}
      title={d.label || (hasMultiple ? 'Buttons Group' : 'Button Action')}
      outputs={hasMultiple ? [] : undefined}
      minWidth={hasMultiple ? 'min-w-[240px] max-w-[300px]' : undefined}
    >
      <div className="py-1">
        {hasMultiple ? (
          <div className="flex flex-col gap-1.5">
            {d.buttons!.map((btn) => (
              <div
                key={btn.id}
                className="relative flex items-center justify-between rounded px-3 py-1.5 text-center text-xs font-medium border"
                style={{
                  backgroundColor: btn.style === 'primary' ? '#2563eb' : '#ffffff',
                  color: btn.style === 'primary' ? '#ffffff' : '#18181b',
                  borderColor: btn.style === 'outline' ? '#d4d4d8' : '#e4e4e7',
                }}
              >
                <span className="truncate pr-4">{btn.text || (btn as any).label || 'Button'}</span>
                {btn.actionType === 'url' ? (
                  <ExternalLink className="h-3 w-3 shrink-0" />
                ) : (
                  <Handle
                    type="source"
                    position={Position.Right}
                    id={btn.id}
                    className="!absolute !-right-1.5 !top-1/2 !-translate-y-1/2 !h-2.5 !w-2.5 !rounded-full !bg-white !border-2 !border-zinc-500 hover:!border-blue-600 hover:!bg-blue-600"
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div>
            <div
              className="rounded px-3 py-1.5 text-center text-xs font-medium border"
              style={{
                backgroundColor: d.buttonStyle === 'primary' ? d.backgroundColor || '#2563eb' : '#ffffff',
                color: d.buttonStyle === 'primary' ? d.textColor || '#ffffff' : '#18181b',
                borderColor: d.buttonStyle === 'outline' ? '#d4d4d8' : 'transparent',
              }}
            >
              {d.buttonLabel || 'Button'}
            </div>
            {d.actionType === 'openUrl' && d.targetUrl && (
              <div className="mt-1 flex items-center gap-1 text-[10px] text-zinc-500 truncate">
                <ExternalLink className="h-3 w-3 shrink-0" />
                <span className="truncate">{d.targetUrl}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </NodeWrapper>
  );
});
ButtonNode.displayName = 'ButtonNode';

export const UserInputNode: React.FC<NodeProps> = React.memo(({ id, data, selected }) => {
  const d = data as unknown as UserInputNodeData;
  return (
    <NodeWrapper id={id} type="userInput" selected={selected} title={d.label || 'User Input'}>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-800">
          {d.fieldLabel || 'Input Field'} {d.required && <span className="text-red-500">*</span>}
        </label>
        <div className="rounded border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs text-zinc-400">
          {d.placeholder || 'Enter value...'}
        </div>
        <div className="mt-1 flex items-center justify-between text-[10px] text-zinc-500">
          <span>Type: {d.inputType || 'text'}</span>
        </div>
      </div>
    </NodeWrapper>
  );
});
UserInputNode.displayName = 'UserInputNode';

export const MultipleChoiceNode: React.FC<NodeProps> = React.memo(({ id, data, selected }) => {
  const d = data as unknown as MultipleChoiceNodeData;
  const options = d.options || [];

  return (
    <NodeWrapper
      id={id}
      type="multipleChoice"
      selected={selected}
      title={d.label || 'Multiple Choice'}
      outputs={[]}
      minWidth="min-w-[260px] max-w-[320px]"
    >
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-zinc-900">{d.question || 'Select an option:'}</p>
        <div className="flex flex-col gap-1.5">
          {options.map((opt) => (
            <div
              key={opt.id}
              className="relative flex items-center justify-between rounded border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs"
            >
              <span className="text-zinc-800 truncate pr-4">{opt.text}</span>
              <Handle
                type="source"
                position={Position.Right}
                id={opt.id}
                className="!absolute !-right-1.5 !top-1/2 !-translate-y-1/2 !h-2.5 !w-2.5 !rounded-full !bg-white !border-2 !border-zinc-500 hover:!border-blue-600 hover:!bg-blue-600"
              />
            </div>
          ))}
          {options.length === 0 && (
            <div className="text-[11px] text-zinc-400 italic py-1">No options defined</div>
          )}
        </div>
      </div>
    </NodeWrapper>
  );
});
MultipleChoiceNode.displayName = 'MultipleChoiceNode';

export const SingleChoiceNode: React.FC<NodeProps> = React.memo(({ id, data, selected }) => {
  const d = data as unknown as SingleChoiceNodeData;
  const options = d.options || [];

  return (
    <NodeWrapper
      id={id}
      type="singleChoice"
      selected={selected}
      title={d.label || 'Single Choice'}
      outputs={[]}
      minWidth="min-w-[260px] max-w-[320px]"
    >
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-zinc-900">{d.question || 'Choose one option:'}</p>
        <div className="flex flex-col gap-1.5">
          {options.map((opt) => (
            <div
              key={opt.id}
              className="relative flex items-center gap-2 rounded border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs"
            >
              <div className="h-2.5 w-2.5 rounded-full border border-zinc-400 shrink-0" />
              <span className="text-zinc-800 truncate pr-4 flex-1">{opt.text}</span>
              <Handle
                type="source"
                position={Position.Right}
                id={opt.id}
                className="!absolute !-right-1.5 !top-1/2 !-translate-y-1/2 !h-2.5 !w-2.5 !rounded-full !bg-white !border-2 !border-zinc-500 hover:!border-blue-600 hover:!bg-blue-600"
              />
            </div>
          ))}
          {options.length === 0 && (
            <div className="text-[11px] text-zinc-400 italic py-1">No choices defined</div>
          )}
        </div>
      </div>
    </NodeWrapper>
  );
});
SingleChoiceNode.displayName = 'SingleChoiceNode';

export const FormNode: React.FC<NodeProps> = React.memo(({ id, data, selected }) => {
  const d = data as unknown as FormNodeData;
  const fields = d.fields || [];

  return (
    <NodeWrapper id={id} type="form" selected={selected} title={d.label || 'Form'} minWidth="min-w-[250px] max-w-[310px]">
      <div className="flex flex-col gap-1.5">
        <div>
          <p className="text-xs font-semibold text-zinc-900">{d.formTitle || 'Form Title'}</p>
          {d.formDescription && <p className="text-[10px] text-zinc-500 mt-0.5">{d.formDescription}</p>}
        </div>
        <div className="flex flex-col gap-1 pt-1">
          {fields.slice(0, 4).map((f) => (
            <div key={f.id} className="flex items-center justify-between rounded bg-zinc-50 px-2 py-1 text-[11px] border border-zinc-200">
              <span className="text-zinc-700 truncate">{f.label} {f.required && <span className="text-red-500">*</span>}</span>
              <span className="font-mono text-zinc-400 text-[10px] shrink-0 ml-1">{f.type}</span>
            </div>
          ))}
          {fields.length > 4 && (
            <span className="text-[10px] text-zinc-500 italic">+{fields.length - 4} more fields</span>
          )}
          {fields.length === 0 && (
            <span className="text-[11px] text-zinc-400 italic py-1">No fields added</span>
          )}
        </div>
      </div>
    </NodeWrapper>
  );
});
FormNode.displayName = 'FormNode';

export const QuestionNode: React.FC<NodeProps> = React.memo(({ id, data, selected }) => {
  const d = data as unknown as QuestionNodeData;
  return (
    <NodeWrapper id={id} type="question" selected={selected} title={d.label || 'Question'} minWidth="min-w-[240px] max-w-[310px]">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-start gap-1.5">
          <HelpCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-zinc-900">{d.question || 'Enter your question prompt'}</p>
            {d.helpText && <p className="text-[10px] text-zinc-500 mt-0.5">{d.helpText}</p>}
          </div>
        </div>
        <div className="rounded border border-dashed border-zinc-200 bg-zinc-50/70 px-2 py-1 text-[11px] text-zinc-400 flex items-center justify-between">
          <span>{d.placeholder || 'User answer will appear here...'}</span>
          <span className="font-mono text-[9px] uppercase bg-zinc-200/60 px-1 py-0.2 rounded text-zinc-600">
            {d.answerType || 'text'}
          </span>
        </div>
      </div>
    </NodeWrapper>
  );
});
QuestionNode.displayName = 'QuestionNode';

export const ContactInfoNode: React.FC<NodeProps> = React.memo(({ id, data, selected }) => {
  const d = data as unknown as ContactInfoNodeData;
  return (
    <NodeWrapper id={id} type="contactInfo" selected={selected} title={d.label || 'Contact Info'} minWidth="min-w-[250px] max-w-[310px]">
      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-semibold text-zinc-900">{d.title || 'Contact Information'}</p>
        <div className="space-y-1">
          {d.requireName !== false && (
            <div className="flex items-center gap-1.5 rounded border border-zinc-200 bg-zinc-50 px-2 py-1 text-[11px] text-zinc-600">
              <User className="h-3 w-3 text-zinc-400" />
              <span>Full Name</span>
            </div>
          )}
          {d.requireEmail !== false && (
            <div className="flex items-center gap-1.5 rounded border border-zinc-200 bg-zinc-50 px-2 py-1 text-[11px] text-zinc-600">
              <Mail className="h-3 w-3 text-zinc-400" />
              <span>Email Address</span>
            </div>
          )}
          {d.requirePhone !== false && (
            <div className="flex items-center gap-1.5 rounded border border-zinc-200 bg-zinc-50 px-2 py-1 text-[11px] text-zinc-600">
              <Phone className="h-3 w-3 text-zinc-400" />
              <span>Phone Number</span>
            </div>
          )}
        </div>
      </div>
    </NodeWrapper>
  );
});
ContactInfoNode.displayName = 'ContactInfoNode';

export const DateSelectionNode: React.FC<NodeProps> = React.memo(({ id, data, selected }) => {
  const d = data as unknown as DateSelectionNodeData;
  return (
    <NodeWrapper id={id} type="dateSelection" selected={selected} title={d.label || 'Date Selection'} minWidth="min-w-[240px] max-w-[300px]">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-zinc-800">{d.label || 'Select Date'}</label>
        <div className="flex items-center justify-between rounded border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs text-zinc-500">
          <span>{d.placeholder || 'YYYY-MM-DD'}</span>
          <Calendar className="h-3.5 w-3.5 text-zinc-400" />
        </div>
      </div>
    </NodeWrapper>
  );
});
DateSelectionNode.displayName = 'DateSelectionNode';

export const RatingNode: React.FC<NodeProps> = React.memo(({ id, data, selected }) => {
  const d = data as unknown as RatingNodeData;
  const count = d.maxRating || 5;

  return (
    <NodeWrapper id={id} type="rating" selected={selected} title={d.label || 'Rating'} minWidth="min-w-[240px] max-w-[300px]">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-zinc-900">{d.question || 'How would you rate our service?'}</p>
        <div className="flex items-center justify-center gap-1 py-1">
          {d.ratingType === 'numbers' ? (
            Array.from({ length: Math.min(count, 5) }).map((_, i) => (
              <div key={i} className="h-6 w-6 rounded border border-zinc-300 bg-white flex items-center justify-center text-xs font-medium text-zinc-700">
                {i + 1}
              </div>
            ))
          ) : (
            Array.from({ length: Math.min(count, 5) }).map((_, i) => (
              <Star key={i} className="h-4 w-4 text-amber-500 fill-amber-400" />
            ))
          )}
        </div>
      </div>
    </NodeWrapper>
  );
});
RatingNode.displayName = 'RatingNode';

export const ConfirmationNode: React.FC<NodeProps> = React.memo(({ id, data, selected }) => {
  const d = data as unknown as ConfirmationNodeData;
  return (
    <NodeWrapper
      id={id}
      type="confirmation"
      selected={selected}
      title={d.label || 'Confirmation'}
      outputs={[]}
      minWidth="min-w-[260px] max-w-[320px]"
    >
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-zinc-900">{d.message || 'Are you sure you want to proceed?'}</p>
        <div className="grid grid-cols-2 gap-2 pt-1">
          {/* Confirm Choice with Right Handle */}
          <div className="relative flex items-center justify-between rounded bg-emerald-50 border border-emerald-300 px-2 py-1.5 text-xs font-medium text-emerald-800">
            <div className="flex items-center gap-1">
              <Check className="h-3 w-3 text-emerald-600" />
              <span>{d.confirmLabel || 'Yes'}</span>
            </div>
            <Handle
              type="source"
              position={Position.Right}
              id="confirm"
              className="!absolute !-right-1.5 !top-1/2 !-translate-y-1/2 !h-2.5 !w-2.5 !rounded-full !bg-white !border-2 !border-emerald-600 hover:!bg-emerald-600"
            />
          </div>

          {/* Cancel Choice with Right Handle */}
          <div className="relative flex items-center justify-between rounded bg-rose-50 border border-rose-300 px-2 py-1.5 text-xs font-medium text-rose-800">
            <div className="flex items-center gap-1">
              <X className="h-3 w-3 text-rose-600" />
              <span>{d.cancelLabel || 'No'}</span>
            </div>
            <Handle
              type="source"
              position={Position.Right}
              id="cancel"
              className="!absolute !-right-1.5 !top-1/2 !-translate-y-1/2 !h-2.5 !w-2.5 !rounded-full !bg-white !border-2 !border-rose-600 hover:!bg-rose-600"
            />
          </div>
        </div>
      </div>
    </NodeWrapper>
  );
});
ConfirmationNode.displayName = 'ConfirmationNode';

export const LinkNode: React.FC<NodeProps> = React.memo(({ id, data, selected }) => {
  const d = data as unknown as LinkNodeData;
  return (
    <NodeWrapper id={id} type="link" selected={selected} title={d.label || 'Link'}>
      <div className="flex items-center gap-1.5 rounded border border-zinc-200 bg-zinc-50 p-2 text-xs">
        <ExternalLink className="h-4 w-4 shrink-0 text-blue-600" />
        <div className="truncate">
          <p className="font-medium text-blue-600 underline truncate">{d.title || 'External Link'}</p>
          <p className="text-[10px] text-zinc-500 truncate">{d.url || 'https://'}</p>
        </div>
      </div>
    </NodeWrapper>
  );
});
LinkNode.displayName = 'LinkNode';
