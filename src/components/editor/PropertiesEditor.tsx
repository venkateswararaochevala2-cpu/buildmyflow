import React from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Switch } from '../ui/Switch';
import { Button } from '../ui/Button';
import { storeAsset } from '../../services/assetStorage';
import { AnyCustomNodeData, InputFieldType } from '../../types/workflow';
import { Copy, Trash2, Plus, ArrowRight, ExternalLink } from 'lucide-react';

export const PropertiesEditor: React.FC = () => {
  const {
    nodes,
    edges,
    selectedNodeId,
    metadata,
    settings,
    updateNodeData,
    duplicateNode,
    deleteNode,
    updateWorkflowMetadata,
    toggleGrid,
    toggleMinimap,
  } = useEditorStore();

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  // When no node is selected: General Workflow & Canvas Properties
  if (!selectedNode || !selectedNodeId) {
    return (
      <div className="flex h-full flex-col bg-white border-l border-zinc-200 overflow-y-auto">
        <div className="border-b border-zinc-200 px-4 py-3 bg-zinc-50">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-700">Workflow Settings</h2>
        </div>

        <div className="p-4 space-y-4">
          <Input
            label="Workflow Name"
            value={metadata?.name || ''}
            onChange={(e) => updateWorkflowMetadata({ name: e.target.value })}
            placeholder="e.g. Customer Support Flow"
          />

          <Textarea
            label="Description"
            rows={3}
            value={metadata?.description || ''}
            onChange={(e) => updateWorkflowMetadata({ description: e.target.value })}
            placeholder="Describe what this customer journey accomplishes..."
          />

          <Select
            label="Category"
            value={metadata?.category || 'General Flow'}
            onChange={(e) => updateWorkflowMetadata({ category: e.target.value as any })}
            options={[
              { value: 'General Flow', label: 'General Flow' },
              { value: 'Chatbot', label: 'Chatbot' },
              { value: 'Customer Journey', label: 'Customer Journey' },
              { value: 'Product Flow', label: 'Product Flow' },
              { value: 'Form Flow', label: 'Form Flow' },
              { value: 'Support Flow', label: 'Support Flow' },
            ]}
          />

          <Select
            label="Status"
            value={metadata?.status || 'draft'}
            onChange={(e) => updateWorkflowMetadata({ status: e.target.value as any })}
            options={[
              { value: 'draft', label: 'Draft' },
              { value: 'published', label: 'Published' },
              { value: 'archived', label: 'Archived' },
            ]}
          />

          <div className="border-t border-zinc-200 pt-4 space-y-3">
            <h3 className="text-xs font-semibold text-zinc-800">Canvas Configuration</h3>
            <Switch
              label="Grid Background"
              description="Show coordinate grid on canvas"
              checked={settings.showGrid}
              onChange={toggleGrid}
            />
            <Switch
              label="Minimap Overview"
              description="Display thumbnail navigation map"
              checked={settings.showMinimap}
              onChange={toggleMinimap}
            />
          </div>

          <div className="border-t border-zinc-200 pt-4 space-y-2 text-xs text-zinc-600">
            <h3 className="font-semibold text-zinc-800">Flow Statistics</h3>
            <div className="flex justify-between py-1 border-b border-zinc-100">
              <span>Total Blocks</span>
              <span className="font-semibold text-zinc-900">{nodes.length}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-100">
              <span>Active Paths</span>
              <span className="font-semibold text-zinc-900">{edges.length}</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Created</span>
              <span>{metadata?.createdAt ? new Date(metadata.createdAt).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const d = selectedNode.data as AnyCustomNodeData;

  const handleUpdate = (partial: Partial<AnyCustomNodeData>) => {
    updateNodeData(selectedNodeId, partial);
  };

  const incomingEdges = edges.filter((e) => e.target === selectedNodeId);
  const outgoingEdges = edges.filter((e) => e.source === selectedNodeId);

  // File upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'imageUrl' = 'imageUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const assetId = await storeAsset(file);
      const blobUrl = URL.createObjectURL(file);
      handleUpdate({ assetId, [fieldName]: blobUrl });
    } catch (err) {
      console.error('Image upload failed', err);
    }
  };

  return (
    <div className="flex h-full flex-col bg-white border-l border-zinc-200 overflow-y-auto">
      {/* Header with Title and Quick Actions */}
      <div className="border-b border-zinc-200 px-4 py-3 bg-zinc-50 flex items-center justify-between sticky top-0 z-10">
        <div className="overflow-hidden pr-2">
          <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
            Block Properties
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <h3 className="text-xs font-semibold text-zinc-900 truncate">{d.label || selectedNode.type}</h3>
            <span className="text-[10px] uppercase font-mono bg-zinc-200/70 text-zinc-600 px-1 py-0.5 rounded shrink-0">
              {selectedNode.type}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => duplicateNode(selectedNodeId)}
            title="Duplicate Block"
          >
            <Copy className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => deleteNode(selectedNodeId)}
            title="Delete Block"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Common Label Input */}
        <Input
          label="Block Display Name"
          value={d.label || ''}
          onChange={(e) => handleUpdate({ label: e.target.value })}
        />

        {/* ========================================================= */}
        {/* CATEGORY B: MESSAGE BLOCKS                                */}
        {/* ========================================================= */}

        {/* 1. Text Message */}
        {d.type === 'textMessage' && (
          <>
            <Textarea
              label="Message Text"
              rows={4}
              value={d.message || ''}
              onChange={(e) => handleUpdate({ message: e.target.value })}
              placeholder="Enter message text..."
            />
            <div className="grid grid-cols-2 gap-2">
              <Select
                label="Font Size"
                value={d.fontSize || 'base'}
                onChange={(e) => handleUpdate({ fontSize: e.target.value as any })}
                options={[
                  { value: 'sm', label: 'Small' },
                  { value: 'base', label: 'Medium' },
                  { value: 'lg', label: 'Large' },
                ]}
              />
              <Select
                label="Alignment"
                value={d.textAlign || 'left'}
                onChange={(e) => handleUpdate({ textAlign: e.target.value as any })}
                options={[
                  { value: 'left', label: 'Left' },
                  { value: 'center', label: 'Center' },
                  { value: 'right', label: 'Right' },
                ]}
              />
            </div>
          </>
        )}

        {/* 2. Image + Text */}
        {d.type === 'imageText' && (
          <>
            <Input
              label="Image URL"
              value={d.imageUrl || ''}
              onChange={(e) => handleUpdate({ imageUrl: e.target.value, assetId: undefined })}
              placeholder="https://..."
            />
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-zinc-700">Or Upload Image File</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded file:border file:border-zinc-300 file:text-xs file:font-medium file:bg-zinc-50 file:text-zinc-700 hover:file:bg-zinc-100"
              />
            </div>
            <Select
              label="Image Position"
              value={d.imagePosition || 'top'}
              onChange={(e) => handleUpdate({ imagePosition: e.target.value as any })}
              options={[
                { value: 'top', label: 'Image on Top' },
                { value: 'bottom', label: 'Image on Bottom' },
              ]}
            />
            <Input
              label="Heading (Optional)"
              value={d.heading || ''}
              onChange={(e) => handleUpdate({ heading: e.target.value })}
              placeholder="e.g. Welcome to Our Store"
            />
            <Textarea
              label="Message Description"
              rows={3}
              value={d.text || ''}
              onChange={(e) => handleUpdate({ text: e.target.value })}
              placeholder="Enter descriptive text..."
            />
            <Input
              label="Image Caption (Optional)"
              value={d.caption || ''}
              onChange={(e) => handleUpdate({ caption: e.target.value })}
              placeholder="e.g. Limited time offer"
            />
          </>
        )}

        {/* 3. Video + Text */}
        {d.type === 'videoText' && (
          <>
            <Input
              label="Video URL"
              value={d.videoUrl || ''}
              onChange={(e) => handleUpdate({ videoUrl: e.target.value })}
              placeholder="https://..."
            />
            <Input
              label="Heading (Optional)"
              value={d.heading || ''}
              onChange={(e) => handleUpdate({ heading: e.target.value })}
              placeholder="e.g. Product Demo"
            />
            <Textarea
              label="Message Description"
              rows={3}
              value={d.text || ''}
              onChange={(e) => handleUpdate({ text: e.target.value })}
              placeholder="Enter explanation text..."
            />
          </>
        )}

        {/* 4. Text + Button */}
        {d.type === 'textButton' && (
          <>
            <Textarea
              label="Message Text"
              rows={3}
              value={d.message || ''}
              onChange={(e) => handleUpdate({ message: e.target.value })}
              placeholder="What would you like to do?"
            />
            <div className="border-t border-zinc-200 pt-3 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-zinc-800">Action Buttons</span>
                  <p className="text-[11px] text-zinc-500">Each button connects to a separate path</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const newBtn = {
                      id: `btn_${Date.now()}`,
                      text: `Button ${(d.buttons?.length || 0) + 1}`,
                      actionType: 'navigate' as const,
                    };
                    handleUpdate({ buttons: [...(d.buttons || []), newBtn] });
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" /> Add Button
                </Button>
              </div>

              <div className="space-y-2 pt-1">
                {(d.buttons || []).map((btn, idx) => (
                  <div key={btn.id} className="p-2.5 bg-zinc-50 border border-zinc-200 rounded space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Input
                        value={btn.text}
                        placeholder="Button label..."
                        onChange={(e) => {
                          const updated = [...(d.buttons || [])];
                          updated[idx].text = e.target.value;
                          handleUpdate({ buttons: updated });
                        }}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const updated = (d.buttons || []).filter((_, i) => i !== idx);
                          handleUpdate({ buttons: updated });
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
                      </Button>
                    </div>

                    <Select
                      value={btn.actionType || 'navigate'}
                      onChange={(e) => {
                        const updated = [...(d.buttons || [])];
                        updated[idx].actionType = e.target.value as any;
                        handleUpdate({ buttons: updated });
                      }}
                      options={[
                        { value: 'navigate', label: 'Connect to Next Block' },
                        { value: 'url', label: 'Open External URL' },
                      ]}
                    />

                    {btn.actionType === 'url' && (
                      <Input
                        placeholder="https://..."
                        value={btn.url || ''}
                        onChange={(e) => {
                          const updated = [...(d.buttons || [])];
                          updated[idx].url = e.target.value;
                          handleUpdate({ buttons: updated });
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* 5. Image + Text + Button */}
        {d.type === 'imageTextButton' && (
          <>
            <Input
              label="Image URL"
              value={d.imageUrl || ''}
              onChange={(e) => handleUpdate({ imageUrl: e.target.value, assetId: undefined })}
              placeholder="https://..."
            />
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-zinc-700">Or Upload Image File</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded file:border file:border-zinc-300 file:text-xs file:font-medium file:bg-zinc-50 file:text-zinc-700 hover:file:bg-zinc-100"
              />
            </div>
            <Input
              label="Heading"
              value={d.heading || ''}
              onChange={(e) => handleUpdate({ heading: e.target.value })}
              placeholder="Card Title"
            />
            <Textarea
              label="Description"
              rows={3}
              value={d.description || ''}
              onChange={(e) => handleUpdate({ description: e.target.value })}
              placeholder="Card description text..."
            />

            <div className="border-t border-zinc-200 pt-3 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-zinc-800">Card Buttons</span>
                  <p className="text-[11px] text-zinc-500">Each button has its own output handle</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const newBtn = {
                      id: `btn_${Date.now()}`,
                      text: `Button ${(d.buttons?.length || 0) + 1}`,
                      actionType: 'navigate' as const,
                    };
                    handleUpdate({ buttons: [...(d.buttons || []), newBtn] });
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" /> Add Button
                </Button>
              </div>

              <div className="space-y-2 pt-1">
                {(d.buttons || []).map((btn, idx) => (
                  <div key={btn.id} className="p-2.5 bg-zinc-50 border border-zinc-200 rounded space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Input
                        value={btn.text}
                        placeholder="Button label..."
                        onChange={(e) => {
                          const updated = [...(d.buttons || [])];
                          updated[idx].text = e.target.value;
                          handleUpdate({ buttons: updated });
                        }}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const updated = (d.buttons || []).filter((_, i) => i !== idx);
                          handleUpdate({ buttons: updated });
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
                      </Button>
                    </div>

                    <Select
                      value={btn.actionType || 'navigate'}
                      onChange={(e) => {
                        const updated = [...(d.buttons || [])];
                        updated[idx].actionType = e.target.value as any;
                        handleUpdate({ buttons: updated });
                      }}
                      options={[
                        { value: 'navigate', label: 'Connect to Next Block' },
                        { value: 'url', label: 'Open External URL' },
                      ]}
                    />

                    {btn.actionType === 'url' && (
                      <Input
                        placeholder="https://..."
                        value={btn.url || ''}
                        onChange={(e) => {
                          const updated = [...(d.buttons || [])];
                          updated[idx].url = e.target.value;
                          handleUpdate({ buttons: updated });
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* 6. Multiple Buttons */}
        {d.type === 'multipleButtons' && (
          <>
            <Input
              label="Prompt Title"
              value={d.title || ''}
              onChange={(e) => handleUpdate({ title: e.target.value })}
              placeholder="e.g. Choose an option:"
            />

            <div className="border-t border-zinc-200 pt-3 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-zinc-800">Buttons List</span>
                  <p className="text-[11px] text-zinc-500">1 to 10 buttons with separate outputs</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={(d.buttons?.length || 0) >= 10}
                  onClick={() => {
                    const newBtn = {
                      id: `btn_${Date.now()}`,
                      text: `Option ${(d.buttons?.length || 0) + 1}`,
                      style: 'primary' as const,
                      actionType: 'navigate' as const,
                    };
                    handleUpdate({ buttons: [...(d.buttons || []), newBtn] });
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" /> Add Button
                </Button>
              </div>

              <div className="space-y-2.5 pt-1">
                {(d.buttons || []).map((btn, idx) => (
                  <div key={btn.id} className="p-2.5 bg-zinc-50 border border-zinc-200 rounded space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Input
                        value={btn.text}
                        placeholder="Button text..."
                        onChange={(e) => {
                          const updated = [...(d.buttons || [])];
                          updated[idx].text = e.target.value;
                          handleUpdate({ buttons: updated });
                        }}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={(d.buttons || []).length <= 1}
                        onClick={() => {
                          const updated = (d.buttons || []).filter((_, i) => i !== idx);
                          handleUpdate({ buttons: updated });
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Select
                        label="Style"
                        value={btn.style || 'primary'}
                        onChange={(e) => {
                          const updated = [...(d.buttons || [])];
                          updated[idx].style = e.target.value as any;
                          handleUpdate({ buttons: updated });
                        }}
                        options={[
                          { value: 'primary', label: 'Primary' },
                          { value: 'secondary', label: 'Secondary' },
                          { value: 'outline', label: 'Outline' },
                        ]}
                      />
                      <Select
                        label="Action"
                        value={btn.actionType || 'navigate'}
                        onChange={(e) => {
                          const updated = [...(d.buttons || [])];
                          updated[idx].actionType = e.target.value as any;
                          handleUpdate({ buttons: updated });
                        }}
                        options={[
                          { value: 'navigate', label: 'Next Block' },
                          { value: 'url', label: 'Open URL' },
                        ]}
                      />
                    </div>

                    {btn.actionType === 'url' && (
                      <Input
                        placeholder="https://..."
                        value={btn.url || ''}
                        onChange={(e) => {
                          const updated = [...(d.buttons || [])];
                          updated[idx].url = e.target.value;
                          handleUpdate({ buttons: updated });
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* 7. List Message */}
        {d.type === 'listMessage' && (
          <>
            <Input
              label="List Title"
              value={d.title || ''}
              onChange={(e) => handleUpdate({ title: e.target.value })}
              placeholder="e.g. Select a product:"
            />
            <Textarea
              label="Description (Optional)"
              rows={2}
              value={d.description || ''}
              onChange={(e) => handleUpdate({ description: e.target.value })}
              placeholder="Subtitle or instructions..."
            />

            <div className="border-t border-zinc-200 pt-3 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-zinc-800">List Items</span>
                  <p className="text-[11px] text-zinc-500">Each selectable item branches independently</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const newItem = {
                      id: `item_${Date.now()}`,
                      title: `Item ${(d.items?.length || 0) + 1}`,
                      description: 'Item description...',
                    };
                    handleUpdate({ items: [...(d.items || []), newItem] });
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" /> Add Item
                </Button>
              </div>

              <div className="space-y-2 pt-1">
                {(d.items || []).map((item, idx) => (
                  <div key={item.id} className="p-2.5 bg-zinc-50 border border-zinc-200 rounded space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <Input
                        value={item.title}
                        placeholder="Item title..."
                        onChange={(e) => {
                          const updated = [...(d.items || [])];
                          updated[idx].title = e.target.value;
                          handleUpdate({ items: updated });
                        }}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const updated = (d.items || []).filter((_, i) => i !== idx);
                          handleUpdate({ items: updated });
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
                      </Button>
                    </div>
                    <Input
                      value={item.description || ''}
                      placeholder="Item subtitle / description..."
                      onChange={(e) => {
                        const updated = [...(d.items || [])];
                        updated[idx].description = e.target.value;
                        handleUpdate({ items: updated });
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* 8. Card Message */}
        {d.type === 'cardMessage' && (
          <>
            <Input
              label="Card Image URL"
              value={d.imageUrl || ''}
              onChange={(e) => handleUpdate({ imageUrl: e.target.value, assetId: undefined })}
              placeholder="https://..."
            />
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-zinc-700">Or Upload Image File</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded file:border file:border-zinc-300 file:text-xs file:font-medium file:bg-zinc-50 file:text-zinc-700 hover:file:bg-zinc-100"
              />
            </div>
            <Input
              label="Card Heading"
              value={d.heading || ''}
              onChange={(e) => handleUpdate({ heading: e.target.value })}
              placeholder="e.g. Special Offer"
            />
            <Textarea
              label="Card Description"
              rows={3}
              value={d.description || ''}
              onChange={(e) => handleUpdate({ description: e.target.value })}
              placeholder="Enter card details..."
            />
            <Input
              label="Button Text"
              value={d.buttonText || ''}
              onChange={(e) => handleUpdate({ buttonText: e.target.value })}
              placeholder="e.g. Claim Offer"
            />
            <Input
              label="Button Web Link (Optional)"
              value={d.buttonUrl || ''}
              onChange={(e) => handleUpdate({ buttonUrl: e.target.value })}
              placeholder="Leave blank to connect to next block"
            />
          </>
        )}

        {/* 9. Carousel Message */}
        {d.type === 'carouselMessage' && (
          <>
            <Input
              label="Carousel Title (Optional)"
              value={d.title || ''}
              onChange={(e) => handleUpdate({ title: e.target.value })}
              placeholder="e.g. Featured Products"
            />

            <div className="border-t border-zinc-200 pt-3 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-zinc-800">Carousel Cards</span>
                  <p className="text-[11px] text-zinc-500">Horizontal swipe cards with buttons</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const newCard = {
                      id: `card_${Date.now()}`,
                      title: `Card ${(d.cards?.length || 0) + 1}`,
                      description: 'Card description...',
                      buttonText: 'Select',
                    };
                    handleUpdate({ cards: [...(d.cards || []), newCard] });
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" /> Add Card
                </Button>
              </div>

              <div className="space-y-3 pt-1">
                {(d.cards || []).map((card, idx) => (
                  <div key={card.id} className="p-3 bg-zinc-50 border border-zinc-200 rounded space-y-2">
                    <div className="flex items-center justify-between border-b border-zinc-200/70 pb-1.5">
                      <span className="text-xs font-semibold text-zinc-800">Card #{idx + 1}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const updated = (d.cards || []).filter((_, i) => i !== idx);
                          handleUpdate({ cards: updated });
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
                      </Button>
                    </div>

                    <Input
                      label="Title"
                      value={card.title}
                      onChange={(e) => {
                        const updated = [...(d.cards || [])];
                        updated[idx].title = e.target.value;
                        handleUpdate({ cards: updated });
                      }}
                    />
                    <Input
                      label="Description"
                      value={card.description}
                      onChange={(e) => {
                        const updated = [...(d.cards || [])];
                        updated[idx].description = e.target.value;
                        handleUpdate({ cards: updated });
                      }}
                    />
                    <Input
                      label="Image URL"
                      value={card.imageUrl || ''}
                      onChange={(e) => {
                        const updated = [...(d.cards || [])];
                        updated[idx].imageUrl = e.target.value;
                        handleUpdate({ cards: updated });
                      }}
                      placeholder="https://..."
                    />
                    <Input
                      label="Button Label"
                      value={card.buttonText}
                      onChange={(e) => {
                        const updated = [...(d.cards || [])];
                        updated[idx].buttonText = e.target.value;
                        handleUpdate({ cards: updated });
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* 10. Document + Text */}
        {d.type === 'documentText' && (
          <>
            <Input
              label="File Name"
              value={d.fileName || ''}
              onChange={(e) => handleUpdate({ fileName: e.target.value })}
              placeholder="e.g. Catalog.pdf"
            />
            <Input
              label="File Size (Optional)"
              value={d.fileSize || ''}
              onChange={(e) => handleUpdate({ fileSize: e.target.value })}
              placeholder="e.g. 1.2 MB"
            />
            <Input
              label="File Download URL"
              value={d.fileUrl || ''}
              onChange={(e) => handleUpdate({ fileUrl: e.target.value })}
              placeholder="https://..."
            />
            <Textarea
              label="Accompanying Message"
              rows={3}
              value={d.text || ''}
              onChange={(e) => handleUpdate({ text: e.target.value })}
              placeholder="Explain the document..."
            />
          </>
        )}

        {/* ========================================================= */}
        {/* CATEGORY C: INTERACTIVE BLOCKS                            */}
        {/* ========================================================= */}

        {/* Single Choice */}
        {d.type === 'singleChoice' && (
          <>
            <Input
              label="Question Prompt"
              value={d.question || ''}
              onChange={(e) => handleUpdate({ question: e.target.value })}
            />
            <Switch
              label="Mandatory Selection"
              checked={d.required ?? true}
              onChange={(v) => handleUpdate({ required: v })}
            />
            <div className="flex flex-col gap-2 pt-2 border-t border-zinc-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-800">Options</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const newOpt = {
                      id: `opt_${Date.now()}`,
                      text: `Option ${(d.options?.length || 0) + 1}`,
                      value: `val_${(d.options?.length || 0) + 1}`,
                    };
                    handleUpdate({ options: [...(d.options || []), newOpt] });
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" /> Add Option
                </Button>
              </div>
              {(d.options || []).map((opt, i) => (
                <div key={opt.id} className="flex items-center gap-1.5 p-2 bg-zinc-50 border border-zinc-200 rounded">
                  <Input
                    value={opt.text}
                    onChange={(e) => {
                      const updated = [...(d.options || [])];
                      updated[i].text = e.target.value;
                      handleUpdate({ options: updated });
                    }}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const updated = (d.options || []).filter((_, idx) => idx !== i);
                      handleUpdate({ options: updated });
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Multiple Choice */}
        {d.type === 'multipleChoice' && (
          <>
            <Input
              label="Question Prompt"
              value={d.question || ''}
              onChange={(e) => handleUpdate({ question: e.target.value })}
            />
            <div className="flex flex-col gap-2 pt-2 border-t border-zinc-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-800">Options</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const newOpt = {
                      id: `opt_${Date.now()}`,
                      text: `Option ${(d.options?.length || 0) + 1}`,
                      value: `val_${(d.options?.length || 0) + 1}`,
                    };
                    handleUpdate({ options: [...(d.options || []), newOpt] });
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" /> Add Option
                </Button>
              </div>
              {(d.options || []).map((opt, i) => (
                <div key={opt.id} className="flex items-center gap-1.5 p-2 bg-zinc-50 border border-zinc-200 rounded">
                  <Input
                    value={opt.text}
                    onChange={(e) => {
                      const updated = [...(d.options || [])];
                      updated[i].text = e.target.value;
                      handleUpdate({ options: updated });
                    }}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const updated = (d.options || []).filter((_, idx) => idx !== i);
                      handleUpdate({ options: updated });
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Question */}
        {d.type === 'question' && (
          <>
            <Input
              label="Question Prompt"
              value={d.question || ''}
              onChange={(e) => handleUpdate({ question: e.target.value })}
              placeholder="e.g. What is your preferred budget?"
            />
            <Select
              label="Expected Answer Type"
              value={d.answerType || 'text'}
              onChange={(e) => handleUpdate({ answerType: e.target.value as any })}
              options={[
                { value: 'text', label: 'Freeform Text' },
                { value: 'number', label: 'Numeric (Number)' },
                { value: 'email', label: 'Email Address' },
                { value: 'phone', label: 'Phone Number' },
                { value: 'date', label: 'Date' },
              ]}
            />
            <Input
              label="Placeholder Text"
              value={d.placeholder || ''}
              onChange={(e) => handleUpdate({ placeholder: e.target.value })}
              placeholder="e.g. Type your answer..."
            />
            <Input
              label="Help Text (Optional)"
              value={d.helpText || ''}
              onChange={(e) => handleUpdate({ helpText: e.target.value })}
              placeholder="Additional guidance for user..."
            />
            <Switch
              label="Required Answer"
              checked={d.required ?? true}
              onChange={(v) => handleUpdate({ required: v })}
            />
          </>
        )}

        {/* User Input */}
        {d.type === 'userInput' && (
          <>
            <Input
              label="Field Label"
              value={d.fieldLabel || ''}
              onChange={(e) => handleUpdate({ fieldLabel: e.target.value })}
            />
            <Input
              label="Placeholder Text"
              value={d.placeholder || ''}
              onChange={(e) => handleUpdate({ placeholder: e.target.value })}
            />
            <Select
              label="Input Type"
              value={d.inputType || 'text'}
              onChange={(e) => handleUpdate({ inputType: e.target.value as InputFieldType })}
              options={[
                { value: 'text', label: 'Single-line Text' },
                { value: 'email', label: 'Email Address' },
                { value: 'phone', label: 'Phone Number' },
                { value: 'number', label: 'Numeric' },
                { value: 'date', label: 'Date' },
                { value: 'longText', label: 'Multi-line Text' },
              ]}
            />
            <Switch
              label="Mandatory Field"
              checked={d.required ?? false}
              onChange={(v) => handleUpdate({ required: v })}
            />
          </>
        )}

        {/* Form Block */}
        {d.type === 'form' && (
          <>
            <Input
              label="Form Title"
              value={d.formTitle || ''}
              onChange={(e) => handleUpdate({ formTitle: e.target.value })}
              placeholder="e.g. Lead Information"
            />
            <Textarea
              label="Form Description (Optional)"
              rows={2}
              value={d.formDescription || ''}
              onChange={(e) => handleUpdate({ formDescription: e.target.value })}
              placeholder="Instructions for the user..."
            />
            <Input
              label="Submit Button Label"
              value={d.submitButtonText || 'Submit Form'}
              onChange={(e) => handleUpdate({ submitButtonText: e.target.value })}
            />

            <div className="border-t border-zinc-200 pt-3 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-zinc-800">Form Fields</span>
                  <p className="text-[11px] text-zinc-500">Design your data collection form</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const newField = {
                      id: `f_${Date.now()}`,
                      label: `Field ${(d.fields?.length || 0) + 1}`,
                      type: 'text' as InputFieldType,
                      required: true,
                    };
                    handleUpdate({ fields: [...(d.fields || []), newField] });
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" /> Add Field
                </Button>
              </div>

              <div className="space-y-2.5 pt-1">
                {(d.fields || []).map((field, idx) => (
                  <div key={field.id} className="p-2.5 bg-zinc-50 border border-zinc-200 rounded space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Input
                        value={field.label}
                        placeholder="Field label..."
                        onChange={(e) => {
                          const updated = [...(d.fields || [])];
                          updated[idx].label = e.target.value;
                          handleUpdate({ fields: updated });
                        }}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const updated = (d.fields || []).filter((_, i) => i !== idx);
                          handleUpdate({ fields: updated });
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Select
                        label="Type"
                        value={field.type}
                        onChange={(e) => {
                          const updated = [...(d.fields || [])];
                          updated[idx].type = e.target.value as InputFieldType;
                          handleUpdate({ fields: updated });
                        }}
                        options={[
                          { value: 'text', label: 'Text' },
                          { value: 'email', label: 'Email' },
                          { value: 'phone', label: 'Phone' },
                          { value: 'number', label: 'Number' },
                          { value: 'date', label: 'Date' },
                          { value: 'dropdown', label: 'Dropdown' },
                          { value: 'radio', label: 'Radio' },
                          { value: 'checkbox', label: 'Checkbox' },
                          { value: 'longText', label: 'Long Text' },
                        ]}
                      />
                      <div className="flex items-center pt-5">
                        <label className="flex items-center gap-1.5 text-xs text-zinc-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => {
                              const updated = [...(d.fields || [])];
                              updated[idx].required = e.target.checked;
                              handleUpdate({ fields: updated });
                            }}
                            className="rounded text-blue-600"
                          />
                          <span>Required</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Contact Information */}
        {d.type === 'contactInfo' && (
          <>
            <Input
              label="Card Title"
              value={d.title || ''}
              onChange={(e) => handleUpdate({ title: e.target.value })}
              placeholder="e.g. Contact Details"
            />
            <Textarea
              label="Description (Optional)"
              rows={2}
              value={d.description || ''}
              onChange={(e) => handleUpdate({ description: e.target.value })}
              placeholder="How we will use this information..."
            />
            <div className="border-t border-zinc-200 pt-3 space-y-2.5">
              <span className="text-xs font-semibold text-zinc-800">Fields to Include</span>
              <Switch
                label="Full Name"
                checked={d.requireName !== false}
                onChange={(v) => handleUpdate({ requireName: v })}
              />
              <Switch
                label="Email Address"
                checked={d.requireEmail !== false}
                onChange={(v) => handleUpdate({ requireEmail: v })}
              />
              <Switch
                label="Phone Number"
                checked={d.requirePhone !== false}
                onChange={(v) => handleUpdate({ requirePhone: v })}
              />
            </div>
            <Input
              label="Submit Button Text"
              value={d.submitButtonText || 'Continue'}
              onChange={(e) => handleUpdate({ submitButtonText: e.target.value })}
            />
          </>
        )}

        {/* Date Selection */}
        {d.type === 'dateSelection' && (
          <>
            <Input
              label="Label"
              value={d.label || ''}
              onChange={(e) => handleUpdate({ label: e.target.value })}
              placeholder="e.g. Preferred Booking Date"
            />
            <Input
              label="Placeholder Text"
              value={d.placeholder || ''}
              onChange={(e) => handleUpdate({ placeholder: e.target.value })}
              placeholder="Select preferred date..."
            />
            <Switch
              label="Required Field"
              checked={d.required ?? true}
              onChange={(v) => handleUpdate({ required: v })}
            />
          </>
        )}

        {/* Rating */}
        {d.type === 'rating' && (
          <>
            <Input
              label="Feedback Prompt"
              value={d.question || ''}
              onChange={(e) => handleUpdate({ question: e.target.value })}
              placeholder="How was your experience?"
            />
            <Select
              label="Rating Scale"
              value={String(d.maxRating || 5)}
              onChange={(e) => handleUpdate({ maxRating: Number(e.target.value) as any })}
              options={[
                { value: '3', label: '3-Point Scale' },
                { value: '5', label: '5-Point Scale (Standard)' },
                { value: '10', label: '10-Point Scale' },
              ]}
            />
            <Select
              label="Display Style"
              value={d.ratingType || 'stars'}
              onChange={(e) => handleUpdate({ ratingType: e.target.value as any })}
              options={[
                { value: 'stars', label: 'Star Icons' },
                { value: 'numbers', label: 'Numeric Pills (1, 2, 3...)' },
              ]}
            />
          </>
        )}

        {/* Confirmation */}
        {d.type === 'confirmation' && (
          <>
            <Textarea
              label="Confirmation Question"
              rows={3}
              value={d.message || ''}
              onChange={(e) => handleUpdate({ message: e.target.value })}
              placeholder="e.g. Would you like to confirm this order?"
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Confirm Button Text"
                value={d.confirmLabel || 'Yes'}
                onChange={(e) => handleUpdate({ confirmLabel: e.target.value })}
              />
              <Input
                label="Cancel Button Text"
                value={d.cancelLabel || 'No'}
                onChange={(e) => handleUpdate({ cancelLabel: e.target.value })}
              />
            </div>
            <p className="text-[11px] text-zinc-500 italic">
              Provides two distinct output connection handles: Confirm (Yes) and Cancel (No).
            </p>
          </>
        )}

        {/* ========================================================= */}
        {/* CATEGORY D: FLOW BLOCKS                                   */}
        {/* ========================================================= */}

        {/* Navigation */}
        {d.type === 'navigation' && (
          <>
            <Input
              label="Title"
              value={d.title || ''}
              onChange={(e) => handleUpdate({ title: e.target.value })}
              placeholder="e.g. Visit Documentation"
            />
            <Input
              label="Target Web URL"
              value={d.targetUrl || ''}
              onChange={(e) => handleUpdate({ targetUrl: e.target.value })}
              placeholder="https://..."
            />
            <Input
              label="Button Label"
              value={d.buttonText || 'Open Link'}
              onChange={(e) => handleUpdate({ buttonText: e.target.value })}
            />
            <Switch
              label="Open in New Tab"
              checked={d.openInNewTab ?? true}
              onChange={(v) => handleUpdate({ openInNewTab: v })}
            />
          </>
        )}

        {/* Connect Flow */}
        {d.type === 'connectFlow' && (
          <>
            <Input
              label="Target Flow Name"
              value={d.flowName || ''}
              onChange={(e) => handleUpdate({ flowName: e.target.value })}
              placeholder="e.g. Billing Support Flow"
            />
            <Textarea
              label="Description (Optional)"
              rows={2}
              value={d.description || ''}
              onChange={(e) => handleUpdate({ description: e.target.value })}
              placeholder="Context or note regarding this flow connection..."
            />
          </>
        )}

        {/* ========================================================= */}
        {/* CATEGORY A: BASIC CONTENT                                 */}
        {/* ========================================================= */}

        {/* Start Node */}
        {d.type === 'start' && (
          <div className="p-3 bg-emerald-50/60 rounded border border-emerald-200 text-xs text-emerald-800">
            This block marks the initial entry point where customer interactions start.
          </div>
        )}

        {/* End Node */}
        {d.type === 'end' && (
          <>
            <Textarea
              label="Completion Message"
              rows={3}
              value={d.endMessage || ''}
              onChange={(e) => handleUpdate({ endMessage: e.target.value })}
              placeholder="Thank you for reaching out! This concludes the flow."
            />
          </>
        )}

        {/* Text Node */}
        {d.type === 'text' && (
          <>
            <Textarea
              label="Text Content"
              rows={4}
              value={d.content || ''}
              onChange={(e) => handleUpdate({ content: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-2">
              <Select
                label="Font Size"
                value={d.fontSize || 'base'}
                onChange={(e) => handleUpdate({ fontSize: e.target.value as any })}
                options={[
                  { value: 'sm', label: 'Small' },
                  { value: 'base', label: 'Medium' },
                  { value: 'lg', label: 'Large' },
                ]}
              />
              <Select
                label="Alignment"
                value={d.textAlign || 'left'}
                onChange={(e) => handleUpdate({ textAlign: e.target.value as any })}
                options={[
                  { value: 'left', label: 'Left' },
                  { value: 'center', label: 'Center' },
                  { value: 'right', label: 'Right' },
                ]}
              />
            </div>
          </>
        )}

        {/* Heading Node */}
        {d.type === 'heading' && (
          <>
            <Input
              label="Heading Text"
              value={d.text || ''}
              onChange={(e) => handleUpdate({ text: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-2">
              <Select
                label="Level"
                value={String(d.level || 2)}
                onChange={(e) => handleUpdate({ level: Number(e.target.value) as any })}
                options={[
                  { value: '1', label: 'H1' },
                  { value: '2', label: 'H2' },
                  { value: '3', label: 'H3' },
                  { value: '4', label: 'H4' },
                ]}
              />
              <Select
                label="Alignment"
                value={d.textAlign || 'left'}
                onChange={(e) => handleUpdate({ textAlign: e.target.value as any })}
                options={[
                  { value: 'left', label: 'Left' },
                  { value: 'center', label: 'Center' },
                  { value: 'right', label: 'Right' },
                ]}
              />
            </div>
          </>
        )}

        {/* Image Node */}
        {d.type === 'image' && (
          <>
            <Input
              label="Image Web URL"
              value={d.imageUrl || ''}
              onChange={(e) => handleUpdate({ imageUrl: e.target.value, assetId: undefined })}
            />
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-zinc-700">Or Upload Image File</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded file:border file:border-zinc-300 file:text-xs file:font-medium file:bg-zinc-50 file:text-zinc-700 hover:file:bg-zinc-100"
              />
            </div>
            <Input
              label="Alt Text"
              value={d.altText || ''}
              onChange={(e) => handleUpdate({ altText: e.target.value })}
            />
          </>
        )}

        {/* Video Node */}
        {d.type === 'video' && (
          <>
            <Input
              label="Video Source URL"
              value={d.videoUrl || ''}
              onChange={(e) => handleUpdate({ videoUrl: e.target.value })}
            />
            <Switch
              label="Show Playback Controls"
              checked={d.controls ?? true}
              onChange={(v) => handleUpdate({ controls: v })}
            />
          </>
        )}

        {/* Audio Node */}
        {d.type === 'audio' && (
          <>
            <Input
              label="Audio Source URL"
              value={d.audioUrl || ''}
              onChange={(e) => handleUpdate({ audioUrl: e.target.value })}
            />
          </>
        )}

        {/* File Node */}
        {d.type === 'file' && (
          <>
            <Input
              label="File Name"
              value={d.fileName || ''}
              onChange={(e) => handleUpdate({ fileName: e.target.value })}
            />
            <Input
              label="File Size"
              value={d.fileSize || ''}
              onChange={(e) => handleUpdate({ fileSize: e.target.value })}
            />
            <Input
              label="Download URL"
              value={d.fileUrl || ''}
              onChange={(e) => handleUpdate({ fileUrl: e.target.value })}
            />
          </>
        )}

        {/* Divider Node */}
        {d.type === 'divider' && (
          <>
            <Select
              label="Spacing Size"
              value={d.spacing || 'md'}
              onChange={(e) => handleUpdate({ spacing: e.target.value as any })}
              options={[
                { value: 'sm', label: 'Small' },
                { value: 'md', label: 'Medium' },
                { value: 'lg', label: 'Large' },
              ]}
            />
          </>
        )}

        {/* Button Node (Legacy) */}
        {d.type === 'button' && (
          <>
            <Input
              label="Button Text"
              value={d.buttonLabel || ''}
              onChange={(e) => handleUpdate({ buttonLabel: e.target.value })}
            />
            <Select
              label="Action Type"
              value={d.actionType || 'continue'}
              onChange={(e) => handleUpdate({ actionType: e.target.value as any })}
              options={[
                { value: 'continue', label: 'Continue to Connected Block' },
                { value: 'openUrl', label: 'Open External URL' },
              ]}
            />
          </>
        )}

        {/* Legacy / Compatibility Fallback */}
        {['condition', 'ifElse', 'switch', 'variable', 'calculation', 'merge', 'delay', 'redirect', 'subflow', 'apiRequest', 'webhook', 'javaScript'].includes(
          d.type
        ) && (
          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded text-xs space-y-1">
            <span className="font-semibold text-zinc-800">Legacy Block ({d.type})</span>
            <p className="text-zinc-600">
              This node was preserved from a previous workflow version. Its configuration and connections remain intact.
            </p>
          </div>
        )}

        {/* Connections Overview */}
        <div className="border-t border-zinc-200 pt-3 space-y-1.5 text-xs text-zinc-600">
          <span className="font-semibold text-zinc-800">Connection Details</span>
          <div className="flex justify-between py-0.5">
            <span>Incoming Paths</span>
            <span className="font-semibold text-zinc-900">{incomingEdges.length}</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span>Outgoing Paths</span>
            <span className="font-semibold text-zinc-900">{outgoingEdges.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
