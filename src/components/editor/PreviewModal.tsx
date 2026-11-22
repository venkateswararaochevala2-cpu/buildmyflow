import React, { useState, useEffect, useRef } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { ExecutionEngine } from '../../services/executionEngine';
import { ExecutionContext } from '../../types/execution';
import { FlowNode, AnyCustomNodeData } from '../../types/workflow';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import {
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  Square,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Star,
  Check,
  X,
  Calendar,
  User,
  Mail,
  Phone,
  FileText,
  Video,
  Image as ImageIcon,
  Layers,
  HelpCircle,
} from 'lucide-react';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({ isOpen, onClose }) => {
  const { nodes, edges } = useEditorStore();
  const engineRef = useRef<ExecutionEngine | null>(null);

  const [context, setContext] = useState<ExecutionContext | null>(null);

  // User input states for interactive elements in current step
  const [singleChoiceVal, setSingleChoiceVal] = useState<string>('');
  const [multiChoiceVals, setMultiChoiceVals] = useState<string[]>([]);
  const [inputVal, setInputVal] = useState<string>('');
  const [contactData, setContactData] = useState({ name: '', email: '', phone: '' });
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  // Initialize or restart engine
  const startSimulation = () => {
    const engine = new ExecutionEngine(nodes, edges);
    engineRef.current = engine;
    const initialContext = engine.start();
    setContext(initialContext);
    resetFormStates();
  };

  const resetFormStates = () => {
    setSingleChoiceVal('');
    setMultiChoiceVals([]);
    setInputVal('');
    setContactData({ name: '', email: '', phone: '' });
    setFormData({});
    setSelectedDate('');
    setSelectedRating(null);
  };

  useEffect(() => {
    if (isOpen) {
      startSimulation();
    } else {
      if (engineRef.current) engineRef.current.stop();
      engineRef.current = null;
      setContext(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentNode = nodes.find((n) => n.id === context?.currentNodeId);
  const d = currentNode?.data as AnyCustomNodeData | undefined;

  const handleNextStep = (inputPayload: Record<string, unknown> = {}, selectedHandle?: string) => {
    if (!engineRef.current) return;
    const updated = engineRef.current.submitInput(inputPayload, selectedHandle);
    setContext(updated);
    resetFormStates();
  };

  const handlePreviousStep = () => {
    if (!engineRef.current) return;
    const updated = engineRef.current.stepPrevious();
    setContext(updated);
    resetFormStates();
  };

  const handleStop = () => {
    if (!engineRef.current) return;
    const updated = engineRef.current.stop();
    setContext(updated);
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Interactive Flow Preview"
      description="Experience the conversation exactly as a customer or user would."
      maxWidth="xl"
      footer={
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={startSimulation}
              title="Restart from Start block"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" /> Restart
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handlePreviousStep}
              disabled={!context || context.previousNodeIds.length === 0}
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back
            </Button>
            {context?.status === 'running' || context?.status === 'waiting_for_input' ? (
              <Button size="sm" variant="outline" onClick={handleStop}>
                <Square className="h-3.5 w-3.5 mr-1 text-red-600" /> Stop
              </Button>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Close Preview
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-3">
        {/* Status indicator bar */}
        <div className="flex items-center justify-between border-b border-zinc-200 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-900">
              {context?.status === 'completed'
                ? 'Flow Complete'
                : currentNode
                ? currentNode.data.label || currentNode.type
                : 'Waiting...'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-zinc-500">
              Step {context?.stepCount || 1}
            </span>
            <Badge
              variant={
                context?.status === 'completed'
                  ? 'success'
                  : context?.status === 'error'
                  ? 'error'
                  : 'secondary'
              }
            >
              {context?.status === 'completed' ? 'COMPLETED' : 'IN PROGRESS'}
            </Badge>
          </div>
        </div>

        {/* --- Main Simulator Screen --- */}
        <div className="rounded-md border border-zinc-200 bg-zinc-50 p-6 min-h-[340px] flex flex-col justify-center">
          {/* If Workflow Completed */}
          {context?.status === 'completed' && (
            <div className="flex flex-col items-center justify-center py-8 text-center gap-2.5">
              <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h4 className="text-sm font-semibold text-zinc-900">Flow Complete</h4>
              <p className="text-xs text-zinc-600 max-w-sm leading-relaxed">
                {d?.type === 'end' && (d as any).endMessage
                  ? (d as any).endMessage
                  : 'Thank you! The customer journey has completed successfully.'}
              </p>
              <div className="mt-2">
                <Button size="sm" variant="primary" onClick={startSimulation}>
                  Restart Flow
                </Button>
              </div>
            </div>
          )}

          {/* If Execution Error */}
          {context?.status === 'error' && (
            <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
              <AlertCircle className="h-10 w-10 text-rose-600" />
              <h4 className="text-sm font-semibold text-zinc-900">Flow Error</h4>
              <p className="text-xs text-zinc-600 font-mono bg-rose-50 p-2 rounded border border-rose-200">
                {context.error || 'The flow reached a block without an outgoing connection.'}
              </p>
            </div>
          )}

          {/* Active Flow Screen */}
          {context?.status === 'waiting_for_input' && currentNode && d && (
            <div className="space-y-4 max-w-md mx-auto w-full bg-white p-5 rounded-lg border border-zinc-200 shadow-2xs">
              {/* Block Header info */}
              <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                <span className="text-xs font-semibold text-zinc-900">{d.label || currentNode.type}</span>
                <span className="text-[10px] uppercase font-mono text-zinc-400 bg-zinc-100 px-1 py-0.5 rounded">
                  {currentNode.type}
                </span>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* Category B: Message Blocks in Preview                         */}
              {/* ------------------------------------------------------------- */}

              {/* 1. Text Message */}
              {d.type === 'textMessage' && (
                <div className="space-y-3">
                  <div className="rounded-lg bg-zinc-100/90 border border-zinc-200 p-3 text-xs text-zinc-900 leading-relaxed whitespace-pre-wrap">
                    {(d as any).message || 'No text provided'}
                  </div>
                  <div className="pt-2 border-t border-zinc-100 flex justify-end">
                    <Button size="sm" variant="primary" onClick={() => handleNextStep({}, 'output')}>
                      Next <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </div>
                </div>
              )}

              {/* 2. Image + Text */}
              {d.type === 'imageText' && (
                <div className="space-y-3">
                  {(d as any).imageUrl && (
                    <div className="overflow-hidden rounded border border-zinc-200 bg-zinc-50 flex justify-center max-h-48">
                      <img
                        src={(d as any).imageUrl}
                        alt="Preview"
                        className="w-full h-auto object-cover max-h-48"
                      />
                    </div>
                  )}
                  {(d as any).heading && (
                    <h4 className="text-xs font-semibold text-zinc-900">{(d as any).heading}</h4>
                  )}
                  <p className="text-xs text-zinc-700 leading-relaxed whitespace-pre-wrap">
                    {(d as any).text}
                  </p>
                  {(d as any).caption && (
                    <p className="text-[10px] text-zinc-400 italic">{(d as any).caption}</p>
                  )}
                  <div className="pt-2 border-t border-zinc-100 flex justify-end">
                    <Button size="sm" variant="primary" onClick={() => handleNextStep({}, 'output')}>
                      Continue <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </div>
                </div>
              )}

              {/* 3. Video + Text */}
              {d.type === 'videoText' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 bg-zinc-50 rounded border border-zinc-200 text-xs text-zinc-700">
                    <Video className="h-4 w-4 text-blue-600 shrink-0" />
                    <span className="truncate">{(d as any).videoUrl || 'Video player'}</span>
                  </div>
                  {(d as any).heading && (
                    <h4 className="text-xs font-semibold text-zinc-900">{(d as any).heading}</h4>
                  )}
                  <p className="text-xs text-zinc-700 leading-relaxed whitespace-pre-wrap">
                    {(d as any).text}
                  </p>
                  <div className="pt-2 border-t border-zinc-100 flex justify-end">
                    <Button size="sm" variant="primary" onClick={() => handleNextStep({}, 'output')}>
                      Continue <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </div>
                </div>
              )}

              {/* 4. Text + Button */}
              {d.type === 'textButton' && (
                <div className="space-y-3">
                  <div className="rounded-lg bg-zinc-100/90 border border-zinc-200 p-3 text-xs text-zinc-900 leading-relaxed whitespace-pre-wrap">
                    {(d as any).message || 'Select an option:'}
                  </div>
                  <div className="flex flex-col gap-2 pt-1">
                    {((d as any).buttons || []).map((btn: any) => (
                      <Button
                        key={btn.id}
                        size="sm"
                        variant="outline"
                        className="w-full justify-between hover:bg-blue-50 hover:text-blue-700 hover:border-blue-400 font-medium text-left"
                        onClick={() => {
                          if (btn.actionType === 'url' && btn.url) {
                            window.open(btn.url, '_blank');
                          } else {
                            handleNextStep({ selectedButton: btn.text }, btn.id);
                          }
                        }}
                      >
                        <span>{btn.text || 'Button'}</span>
                        {btn.actionType === 'url' ? (
                          <ExternalLink className="h-3.5 w-3.5 text-zinc-400 shrink-0 ml-2" />
                        ) : (
                          <ArrowRight className="h-3.5 w-3.5 text-zinc-400 shrink-0 ml-2" />
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Image + Text + Button */}
              {d.type === 'imageTextButton' && (
                <div className="space-y-3">
                  {(d as any).imageUrl && (
                    <div className="overflow-hidden rounded border border-zinc-200 bg-zinc-50 flex justify-center max-h-44">
                      <img src={(d as any).imageUrl} alt="Card" className="w-full h-auto object-cover max-h-44" />
                    </div>
                  )}
                  {(d as any).heading && (
                    <h4 className="text-xs font-semibold text-zinc-900">{(d as any).heading}</h4>
                  )}
                  <p className="text-xs text-zinc-700 leading-relaxed whitespace-pre-wrap">
                    {(d as any).description}
                  </p>
                  <div className="flex flex-col gap-2 pt-2 border-t border-zinc-100">
                    {((d as any).buttons || []).map((btn: any) => (
                      <Button
                        key={btn.id}
                        size="sm"
                        variant="outline"
                        className="w-full justify-between hover:bg-blue-50 hover:text-blue-700 font-medium text-left"
                        onClick={() => {
                          if (btn.actionType === 'url' && btn.url) {
                            window.open(btn.url, '_blank');
                          } else {
                            handleNextStep({ selectedButton: btn.text }, btn.id);
                          }
                        }}
                      >
                        <span>{btn.text || 'Button'}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-zinc-400 shrink-0 ml-2" />
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. Multiple Buttons */}
              {d.type === 'multipleButtons' && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-zinc-900">{(d as any).title || 'Choose an option:'}</p>
                  <div className="flex flex-col gap-2">
                    {((d as any).buttons || []).map((btn: any) => (
                      <Button
                        key={btn.id}
                        size="md"
                        variant={btn.style === 'primary' ? 'primary' : btn.style === 'secondary' ? 'secondary' : 'outline'}
                        fullWidth
                        className="justify-between"
                        onClick={() => {
                          if (btn.actionType === 'url' && btn.url) {
                            window.open(btn.url, '_blank');
                          } else {
                            handleNextStep({ selectedOption: btn.text }, btn.id);
                          }
                        }}
                      >
                        <span>{btn.text || 'Button'}</span>
                        <ArrowRight className="h-3.5 w-3.5 ml-2" />
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* 7. List Message */}
              {d.type === 'listMessage' && (
                <div className="space-y-3">
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-900">{(d as any).title || 'Select from list:'}</h4>
                    {(d as any).description && (
                      <p className="text-[11px] text-zinc-500 mt-0.5">{(d as any).description}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    {((d as any).items || []).map((item: any) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleNextStep({ selectedListItem: item.title }, item.id)}
                        className="flex items-center justify-between p-2.5 rounded border border-zinc-200 bg-zinc-50 hover:bg-blue-50/60 hover:border-blue-300 text-left transition-colors"
                      >
                        <div className="overflow-hidden pr-3">
                          <p className="text-xs font-semibold text-zinc-900 truncate">{item.title}</p>
                          {item.description && (
                            <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">{item.description}</p>
                          )}
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 8. Card Message */}
              {d.type === 'cardMessage' && (
                <div className="space-y-3">
                  {(d as any).imageUrl && (
                    <div className="overflow-hidden rounded border border-zinc-200 bg-zinc-50 flex justify-center max-h-40">
                      <img src={(d as any).imageUrl} alt="Card" className="w-full h-auto object-cover max-h-40" />
                    </div>
                  )}
                  <h4 className="text-xs font-semibold text-zinc-900">{(d as any).heading || 'Card Title'}</h4>
                  <p className="text-xs text-zinc-700 leading-relaxed whitespace-pre-wrap">
                    {(d as any).description}
                  </p>
                  <Button
                    size="md"
                    variant="primary"
                    fullWidth
                    onClick={() => {
                      if ((d as any).buttonUrl) {
                        window.open((d as any).buttonUrl, '_blank');
                      } else {
                        handleNextStep({}, 'button_action');
                      }
                    }}
                  >
                    {(d as any).buttonText || 'Continue'}
                  </Button>
                </div>
              )}

              {/* 9. Carousel Message */}
              {d.type === 'carouselMessage' && (
                <div className="space-y-3">
                  {(d as any).title && (
                    <h4 className="text-xs font-semibold text-zinc-900">{(d as any).title}</h4>
                  )}
                  <div className="flex gap-2.5 overflow-x-auto pb-2">
                    {((d as any).cards || []).map((card: any) => (
                      <div
                        key={card.id}
                        className="flex-shrink-0 w-44 rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 flex flex-col justify-between"
                      >
                        <div>
                          {card.imageUrl && (
                            <div className="h-20 rounded bg-zinc-200 mb-2 overflow-hidden">
                              <img src={card.imageUrl} alt={card.title} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <h5 className="text-xs font-semibold text-zinc-900">{card.title}</h5>
                          <p className="text-[11px] text-zinc-600 line-clamp-2 mt-1">{card.description}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="primary"
                          fullWidth
                          className="mt-3 text-xs"
                          onClick={() => handleNextStep({ selectedCard: card.title }, card.id)}
                        >
                          {card.buttonText || 'Choose'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 10. Document + Text */}
              {d.type === 'documentText' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5 p-3 rounded border border-zinc-200 bg-zinc-50">
                    <FileText className="h-6 w-6 text-blue-600 shrink-0" />
                    <div className="overflow-hidden">
                      <p className="text-xs font-semibold text-zinc-900 truncate">{(d as any).fileName || 'Document.pdf'}</p>
                      {(d as any).fileSize && <p className="text-[10px] text-zinc-500">{(d as any).fileSize}</p>}
                    </div>
                  </div>
                  <p className="text-xs text-zinc-700 leading-relaxed whitespace-pre-wrap">
                    {(d as any).text}
                  </p>
                  <div className="pt-2 border-t border-zinc-100 flex justify-end">
                    <Button size="sm" variant="primary" onClick={() => handleNextStep({}, 'output')}>
                      Next <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* Category C: Interactive Blocks in Preview                     */}
              {/* ------------------------------------------------------------- */}

              {/* Single Choice */}
              {d.type === 'singleChoice' && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-zinc-900">{(d as any).question}</p>
                  <div className="space-y-1.5">
                    {((d as any).options || []).map((opt: any) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleNextStep({ selectedChoice: opt.text }, opt.id)}
                        className="w-full flex items-center justify-between p-2.5 rounded border border-zinc-200 bg-zinc-50 hover:bg-blue-50/70 hover:border-blue-400 text-left text-xs font-medium text-zinc-800 transition-colors"
                      >
                        <span>{opt.text}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-zinc-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Multiple Choice */}
              {d.type === 'multipleChoice' && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-zinc-900">{(d as any).question}</p>
                  <div className="space-y-1.5">
                    {((d as any).options || []).map((opt: any) => {
                      const isChecked = multiChoiceVals.includes(opt.value);
                      return (
                        <div
                          key={opt.id}
                          className={`flex items-center justify-between p-2 rounded border cursor-pointer text-xs transition-colors ${
                            isChecked
                              ? 'border-blue-600 bg-blue-50 text-blue-900 font-medium'
                              : 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-800'
                          }`}
                        >
                          <label className="flex items-center gap-2 cursor-pointer flex-1">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                setMultiChoiceVals((prev) =>
                                  isChecked ? prev.filter((v) => v !== opt.value) : [...prev, opt.value]
                                );
                              }}
                              className="text-blue-600 rounded"
                            />
                            <span>{opt.text}</span>
                          </label>

                          <button
                            type="button"
                            onClick={() => handleNextStep({ selectedChoice: opt.text }, opt.id)}
                            className="text-[11px] text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-0.5 shrink-0 ml-2 font-medium"
                          >
                            Choose <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  {multiChoiceVals.length > 0 && (
                    <div className="pt-2">
                      <Button
                        size="sm"
                        variant="primary"
                        fullWidth
                        onClick={() => {
                          const firstSelected = (d as any).options?.find((o: any) =>
                            multiChoiceVals.includes(o.value)
                          );
                          handleNextStep(
                            { selectedChoices: multiChoiceVals },
                            firstSelected?.id || (d as any).options?.[0]?.id || 'output'
                          );
                        }}
                      >
                        Submit Selected ({multiChoiceVals.length}) <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Question */}
              {d.type === 'question' && (
                <div className="space-y-3">
                  <div className="flex items-start gap-1.5">
                    <HelpCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-900">{(d as any).question}</h4>
                      {(d as any).helpText && (
                        <p className="text-[11px] text-zinc-500 mt-0.5">{(d as any).helpText}</p>
                      )}
                    </div>
                  </div>
                  <Input
                    type={(d as any).answerType === 'number' ? 'number' : (d as any).answerType === 'date' ? 'date' : 'text'}
                    placeholder={(d as any).placeholder || 'Type your answer...'}
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    autoFocus
                  />
                  <div className="pt-2">
                    <Button
                      size="sm"
                      variant="primary"
                      fullWidth
                      disabled={(d as any).required && !inputVal.trim()}
                      onClick={() => handleNextStep({ answer: inputVal }, 'output')}
                    >
                      Continue <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </div>
                </div>
              )}

              {/* User Input */}
              {d.type === 'userInput' && (
                <div className="space-y-3">
                  <label className="text-xs font-medium text-zinc-800 block">
                    {(d as any).fieldLabel} {(d as any).required && <span className="text-red-500">*</span>}
                  </label>
                  <Input
                    type={(d as any).inputType === 'number' ? 'number' : 'text'}
                    placeholder={(d as any).placeholder || 'Enter value...'}
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                  />
                  <div className="pt-2">
                    <Button
                      size="sm"
                      variant="primary"
                      fullWidth
                      disabled={(d as any).required && !inputVal.trim()}
                      onClick={() => handleNextStep({ userInput: inputVal }, 'output')}
                    >
                      Submit <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Form Block */}
              {d.type === 'form' && (
                <div className="space-y-3">
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-900">{(d as any).formTitle || 'Form'}</h4>
                    {(d as any).formDescription && (
                      <p className="text-[11px] text-zinc-500 mt-0.5">{(d as any).formDescription}</p>
                    )}
                  </div>
                  <div className="space-y-2.5">
                    {((d as any).fields || []).map((f: any) => (
                      <div key={f.id} className="space-y-1">
                        <label className="text-xs font-medium text-zinc-700">
                          {f.label} {f.required && <span className="text-red-500">*</span>}
                        </label>
                        <Input
                          type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
                          placeholder={f.placeholder || `Enter ${f.label.toLowerCase()}...`}
                          value={formData[f.id] || ''}
                          onChange={(e) => setFormData({ ...formData, [f.id]: e.target.value })}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="pt-2">
                    <Button
                      size="sm"
                      variant="primary"
                      fullWidth
                      onClick={() => handleNextStep(formData, 'output')}
                    >
                      {(d as any).submitButtonText || 'Submit Form'}{' '}
                      <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Contact Information */}
              {d.type === 'contactInfo' && (
                <div className="space-y-3">
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-900">{(d as any).title || 'Contact Details'}</h4>
                    {(d as any).description && (
                      <p className="text-[11px] text-zinc-500 mt-0.5">{(d as any).description}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    {(d as any).requireName !== false && (
                      <Input
                        label="Full Name *"
                        placeholder="John Doe"
                        value={contactData.name}
                        onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                      />
                    )}
                    {(d as any).requireEmail !== false && (
                      <Input
                        label="Email Address *"
                        placeholder="john@example.com"
                        value={contactData.email}
                        onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                      />
                    )}
                    {(d as any).requirePhone !== false && (
                      <Input
                        label="Phone Number *"
                        placeholder="+1 555-0100"
                        value={contactData.phone}
                        onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                      />
                    )}
                  </div>
                  <div className="pt-2">
                    <Button
                      size="sm"
                      variant="primary"
                      fullWidth
                      onClick={() => handleNextStep(contactData, 'output')}
                    >
                      {(d as any).submitButtonText || 'Continue'}{' '}
                      <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Date Selection */}
              {d.type === 'dateSelection' && (
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-zinc-900 block">
                    {(d as any).label || 'Select Date'}
                  </label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                  <div className="pt-2">
                    <Button
                      size="sm"
                      variant="primary"
                      fullWidth
                      disabled={(d as any).required && !selectedDate}
                      onClick={() => handleNextStep({ selectedDate }, 'output')}
                    >
                      Confirm Date <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Rating */}
              {d.type === 'rating' && (
                <div className="space-y-3 text-center">
                  <p className="text-xs font-semibold text-zinc-900">{(d as any).question}</p>
                  <div className="flex items-center justify-center gap-2 py-2">
                    {Array.from({ length: (d as any).maxRating || 5 }).map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setSelectedRating(i + 1);
                          handleNextStep({ rating: i + 1 }, 'output');
                        }}
                        className={`p-1.5 rounded transition-transform hover:scale-110 ${
                          (selectedRating || 0) > i
                            ? 'text-amber-500 fill-amber-400'
                            : 'text-zinc-300 hover:text-amber-400'
                        }`}
                      >
                        <Star className="h-6 w-6" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Confirmation */}
              {d.type === 'confirmation' && (
                <div className="space-y-4">
                  <p className="text-xs font-semibold text-zinc-900 leading-relaxed text-center py-2">
                    {(d as any).message || 'Are you sure you want to proceed?'}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="md"
                      variant="primary"
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => handleNextStep({ decision: 'confirm' }, 'confirm')}
                    >
                      <Check className="h-4 w-4 mr-1.5" />
                      {(d as any).confirmLabel || 'Yes'}
                    </Button>
                    <Button
                      size="md"
                      variant="outline"
                      className="border-rose-300 text-rose-700 hover:bg-rose-50"
                      onClick={() => handleNextStep({ decision: 'cancel' }, 'cancel')}
                    >
                      <X className="h-4 w-4 mr-1.5" />
                      {(d as any).cancelLabel || 'No'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Navigation */}
              {d.type === 'navigation' && (
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-zinc-900">{(d as any).title}</h4>
                  <p className="text-xs text-zinc-500">{(d as any).targetUrl}</p>
                  <Button
                    size="md"
                    variant="primary"
                    fullWidth
                    onClick={() => {
                      if ((d as any).targetUrl) {
                        window.open((d as any).targetUrl, (d as any).openInNewTab ? '_blank' : '_self');
                      }
                      handleNextStep({}, 'output');
                    }}
                  >
                    {(d as any).buttonText || 'Open Page'}{' '}
                    <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                  </Button>
                </div>
              )}

              {/* Connect Flow */}
              {d.type === 'connectFlow' && (
                <div className="space-y-3 text-center py-2">
                  <h4 className="text-xs font-semibold text-zinc-900">
                    Connecting to: {(d as any).flowName}
                  </h4>
                  {(d as any).description && (
                    <p className="text-xs text-zinc-500">{(d as any).description}</p>
                  )}
                  <Button size="sm" variant="primary" onClick={() => handleNextStep({}, 'output')}>
                    Enter Flow <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
              )}

              {/* Generic Continue for basic content nodes */}
              {['text', 'heading', 'image', 'video', 'audio', 'file', 'divider'].includes(d.type) && (
                <div className="pt-2 border-t border-zinc-100 flex justify-end">
                  <Button size="sm" variant="primary" onClick={() => handleNextStep({}, 'output')}>
                    Next <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
};
