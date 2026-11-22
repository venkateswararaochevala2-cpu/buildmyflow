import React, { useEffect, useState } from 'react';
import { NodeProps, Handle, Position } from '@xyflow/react';
import { NodeWrapper } from './NodeWrapper';
import {
  TextMessageNodeData,
  ImageTextNodeData,
  VideoTextNodeData,
  TextButtonNodeData,
  ImageTextButtonNodeData,
  MultipleButtonsNodeData,
  ListMessageNodeData,
  CardMessageNodeData,
  CarouselMessageNodeData,
  DocumentTextNodeData,
} from '../../types/workflow';
import { getAssetUrl } from '../../services/assetStorage';
import {
  Image as ImageIcon,
  Video,
  FileText,
  ExternalLink,
  ChevronRight,
  Layers,
} from 'lucide-react';

// 1. Text Message Node
export const TextMessageNode: React.FC<NodeProps> = React.memo(({ id, data, selected }) => {
  const d = data as unknown as TextMessageNodeData;
  return (
    <NodeWrapper
      id={id}
      type="textMessage"
      selected={selected}
      title={d.label || 'Text Message'}
      minWidth="min-w-[240px] max-w-[320px]"
    >
      <div
        className="rounded bg-zinc-50 border border-zinc-200/80 p-2.5 text-xs text-zinc-800 leading-relaxed break-words whitespace-pre-wrap"
        style={{
          fontSize: d.fontSize === 'sm' ? '12px' : d.fontSize === 'lg' ? '15px' : '13px',
          textAlign: d.textAlign || 'left',
          color: d.textColor || '#18181b',
          backgroundColor: d.backgroundColor || '#f4f4f5',
        }}
      >
        {d.message || <span className="text-zinc-400 italic">Enter message text...</span>}
      </div>
    </NodeWrapper>
  );
});
TextMessageNode.displayName = 'TextMessageNode';

// 2. Image + Text Node
export const ImageTextNode: React.FC<NodeProps> = React.memo(({ id, data, selected }) => {
  const d = data as unknown as ImageTextNodeData;
  const [src, setSrc] = useState(d.imageUrl || '');

  useEffect(() => {
    let active = true;
    if (d.assetId) {
      getAssetUrl(d.assetId).then((url) => {
        if (active && url) setSrc(url);
      });
    } else {
      setSrc(d.imageUrl || '');
    }
    return () => {
      active = false;
    };
  }, [d.assetId, d.imageUrl]);

  const imageElement = (
    <div className="overflow-hidden rounded border border-zinc-200 bg-zinc-100 flex items-center justify-center max-h-36">
      {src ? (
        <img
          src={src}
          alt={d.caption || 'Flow image'}
          className="w-full h-auto object-cover max-h-36"
          onError={() => setSrc('')}
        />
      ) : (
        <div className="flex flex-col items-center justify-center py-5 text-zinc-400 gap-1">
          <ImageIcon className="h-6 w-6 stroke-[1.5]" />
          <span className="text-[10px]">No image attached</span>
        </div>
      )}
    </div>
  );

  return (
    <NodeWrapper
      id={id}
      type="imageText"
      selected={selected}
      title={d.label || 'Image + Text'}
      minWidth="min-w-[260px] max-w-[320px]"
    >
      <div className="flex flex-col gap-2">
        {d.imagePosition !== 'bottom' && imageElement}

        <div className="space-y-1">
          {d.heading && <h4 className="text-xs font-semibold text-zinc-900">{d.heading}</h4>}
          <p className="text-xs text-zinc-700 leading-relaxed break-words whitespace-pre-wrap">
            {d.text || <span className="text-zinc-400 italic">Enter message description...</span>}
          </p>
          {d.caption && <span className="text-[10px] text-zinc-400 italic block">{d.caption}</span>}
        </div>

        {d.imagePosition === 'bottom' && imageElement}
      </div>
    </NodeWrapper>
  );
});
ImageTextNode.displayName = 'ImageTextNode';

// 3. Video + Text Node
export const VideoTextNode: React.FC<NodeProps> = React.memo(({ id, data, selected }) => {
  const d = data as unknown as VideoTextNodeData;
  return (
    <NodeWrapper
      id={id}
      type="videoText"
      selected={selected}
      title={d.label || 'Video + Text'}
      minWidth="min-w-[260px] max-w-[320px]"
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 rounded border border-zinc-200 bg-zinc-100 p-2 text-zinc-700">
          <Video className="h-4 w-4 shrink-0 text-zinc-500" />
          <span className="truncate text-xs">{d.videoUrl || 'No video link specified'}</span>
        </div>
        <div className="space-y-1">
          {d.heading && <h4 className="text-xs font-semibold text-zinc-900">{d.heading}</h4>}
          <p className="text-xs text-zinc-700 leading-relaxed break-words whitespace-pre-wrap">
            {d.text || <span className="text-zinc-400 italic">Enter message description...</span>}
          </p>
        </div>
      </div>
    </NodeWrapper>
  );
});
VideoTextNode.displayName = 'VideoTextNode';

// 4. Text + Button Node
export const TextButtonNode: React.FC<NodeProps> = React.memo(({ id, data, selected }) => {
  const d = data as unknown as TextButtonNodeData;
  const buttons = d.buttons || [];

  return (
    <NodeWrapper
      id={id}
      type="textButton"
      selected={selected}
      title={d.label || 'Text + Button'}
      outputs={[]}
      minWidth="min-w-[260px] max-w-[320px]"
    >
      <div className="flex flex-col gap-2">
        <p className="text-xs text-zinc-800 leading-relaxed break-words whitespace-pre-wrap">
          {d.message || <span className="text-zinc-400 italic">Enter prompt message...</span>}
        </p>

        <div className="flex flex-col gap-1.5 pt-1 border-t border-zinc-100">
          {buttons.map((btn) => (
            <div
              key={btn.id}
              className="relative flex items-center justify-between rounded border border-blue-200 bg-blue-50/70 hover:bg-blue-50 px-2.5 py-1.5 text-xs text-blue-700 font-medium transition-colors"
            >
              <span className="truncate pr-4">{btn.text || 'Button'}</span>
              {btn.actionType === 'url' ? (
                <ExternalLink className="h-3 w-3 text-blue-500 shrink-0" />
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
          {buttons.length === 0 && (
            <div className="text-[11px] text-zinc-400 italic py-1">No buttons configured</div>
          )}
        </div>
      </div>
    </NodeWrapper>
  );
});
TextButtonNode.displayName = 'TextButtonNode';

// 5. Image + Text + Button Node
export const ImageTextButtonNode: React.FC<NodeProps> = React.memo(({ id, data, selected }) => {
  const d = data as unknown as ImageTextButtonNodeData;
  const [src, setSrc] = useState(d.imageUrl || '');
  const buttons = d.buttons || [];

  useEffect(() => {
    let active = true;
    if (d.assetId) {
      getAssetUrl(d.assetId).then((url) => {
        if (active && url) setSrc(url);
      });
    } else {
      setSrc(d.imageUrl || '');
    }
    return () => {
      active = false;
    };
  }, [d.assetId, d.imageUrl]);

  return (
    <NodeWrapper
      id={id}
      type="imageTextButton"
      selected={selected}
      title={d.label || 'Image + Text + Button'}
      outputs={[]}
      minWidth="min-w-[270px] max-w-[330px]"
    >
      <div className="flex flex-col gap-2">
        <div className="overflow-hidden rounded border border-zinc-200 bg-zinc-100 flex items-center justify-center max-h-36">
          {src ? (
            <img src={src} alt="Card preview" className="w-full h-auto object-cover max-h-36" onError={() => setSrc('')} />
          ) : (
            <div className="flex flex-col items-center justify-center py-4 text-zinc-400 gap-1">
              <ImageIcon className="h-5 w-5 stroke-[1.5]" />
              <span className="text-[10px]">No image</span>
            </div>
          )}
        </div>

        <div className="space-y-0.5">
          {d.heading && <h4 className="text-xs font-semibold text-zinc-900">{d.heading}</h4>}
          <p className="text-xs text-zinc-700 leading-relaxed break-words whitespace-pre-wrap">
            {d.description || <span className="text-zinc-400 italic">Card description text...</span>}
          </p>
        </div>

        <div className="flex flex-col gap-1.5 pt-1.5 border-t border-zinc-100">
          {buttons.map((btn) => (
            <div
              key={btn.id}
              className="relative flex items-center justify-between rounded border border-blue-200 bg-blue-50/70 hover:bg-blue-50 px-2.5 py-1.5 text-xs text-blue-700 font-medium transition-colors"
            >
              <span className="truncate pr-4">{btn.text || 'Button'}</span>
              {btn.actionType === 'url' ? (
                <ExternalLink className="h-3 w-3 text-blue-500 shrink-0" />
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
          {buttons.length === 0 && (
            <div className="text-[11px] text-zinc-400 italic py-1">No buttons configured</div>
          )}
        </div>
      </div>
    </NodeWrapper>
  );
});
ImageTextButtonNode.displayName = 'ImageTextButtonNode';

// 6. Multiple Buttons Node
export const MultipleButtonsNode: React.FC<NodeProps> = React.memo(({ id, data, selected }) => {
  const d = data as unknown as MultipleButtonsNodeData;
  const buttons = d.buttons || [];

  return (
    <NodeWrapper
      id={id}
      type="multipleButtons"
      selected={selected}
      title={d.label || 'Multiple Buttons'}
      outputs={[]}
      minWidth="min-w-[260px] max-w-[320px]"
    >
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-zinc-900">{d.title || 'Choose an option:'}</p>

        <div className="flex flex-col gap-1.5">
          {buttons.map((btn) => (
            <div
              key={btn.id}
              className="relative flex items-center justify-between rounded px-3 py-1.5 text-xs font-medium border text-center transition-colors"
              style={{
                backgroundColor: btn.style === 'primary' ? '#2563eb' : '#ffffff',
                color: btn.style === 'primary' ? '#ffffff' : '#18181b',
                borderColor: btn.style === 'outline' ? '#d4d4d8' : '#e4e4e7',
              }}
            >
              <span className="truncate pr-4">{btn.text || 'Button'}</span>
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
          {buttons.length === 0 && (
            <div className="text-[11px] text-zinc-400 italic py-1">No buttons defined</div>
          )}
        </div>
      </div>
    </NodeWrapper>
  );
});
MultipleButtonsNode.displayName = 'MultipleButtonsNode';

// 7. List Message Node
export const ListMessageNode: React.FC<NodeProps> = React.memo(({ id, data, selected }) => {
  const d = data as unknown as ListMessageNodeData;
  const items = d.items || [];

  return (
    <NodeWrapper
      id={id}
      type="listMessage"
      selected={selected}
      title={d.label || 'List Message'}
      outputs={[]}
      minWidth="min-w-[270px] max-w-[330px]"
    >
      <div className="flex flex-col gap-2">
        <div>
          <h4 className="text-xs font-semibold text-zinc-900">{d.title || 'Choose from list:'}</h4>
          {d.description && <p className="text-[11px] text-zinc-500 mt-0.5">{d.description}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          {items.map((item) => (
            <div
              key={item.id}
              className="relative flex items-center justify-between rounded border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 p-2 text-xs transition-colors"
            >
              <div className="overflow-hidden pr-4">
                <p className="font-medium text-zinc-900 truncate">{item.title}</p>
                {item.description && (
                  <p className="text-[10px] text-zinc-500 truncate">{item.description}</p>
                )}
              </div>
              <Handle
                type="source"
                position={Position.Right}
                id={item.id}
                className="!absolute !-right-1.5 !top-1/2 !-translate-y-1/2 !h-2.5 !w-2.5 !rounded-full !bg-white !border-2 !border-zinc-500 hover:!border-blue-600 hover:!bg-blue-600"
              />
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-[11px] text-zinc-400 italic py-1">No list items defined</div>
          )}
        </div>
      </div>
    </NodeWrapper>
  );
});
ListMessageNode.displayName = 'ListMessageNode';

// 8. Card Message Node
export const CardMessageNode: React.FC<NodeProps> = React.memo(({ id, data, selected }) => {
  const d = data as unknown as CardMessageNodeData;
  const [src, setSrc] = useState(d.imageUrl || '');

  useEffect(() => {
    let active = true;
    if (d.assetId) {
      getAssetUrl(d.assetId).then((url) => {
        if (active && url) setSrc(url);
      });
    } else {
      setSrc(d.imageUrl || '');
    }
    return () => {
      active = false;
    };
  }, [d.assetId, d.imageUrl]);

  return (
    <NodeWrapper
      id={id}
      type="cardMessage"
      selected={selected}
      title={d.label || 'Card Message'}
      outputs={[]}
      minWidth="min-w-[260px] max-w-[320px]"
    >
      <div className="flex flex-col gap-2">
        <div className="overflow-hidden rounded border border-zinc-200 bg-zinc-100 flex items-center justify-center max-h-32">
          {src ? (
            <img src={src} alt="Card preview" className="w-full h-auto object-cover max-h-32" onError={() => setSrc('')} />
          ) : (
            <div className="flex flex-col items-center justify-center py-3 text-zinc-400 gap-1">
              <ImageIcon className="h-5 w-5 stroke-[1.5]" />
              <span className="text-[10px]">No image</span>
            </div>
          )}
        </div>

        <div>
          <h4 className="text-xs font-semibold text-zinc-900">{d.heading || 'Card Title'}</h4>
          <p className="text-xs text-zinc-700 leading-relaxed mt-0.5 line-clamp-2">
            {d.description || 'Card description...'}
          </p>
        </div>

        <div className="relative flex items-center justify-between rounded border border-blue-200 bg-blue-50/70 hover:bg-blue-50 px-2.5 py-1.5 text-xs text-blue-700 font-medium transition-colors">
          <span className="truncate pr-4">{d.buttonText || 'Action Button'}</span>
          {d.buttonUrl ? (
            <ExternalLink className="h-3 w-3 text-blue-500 shrink-0" />
          ) : (
            <Handle
              type="source"
              position={Position.Right}
              id="button_action"
              className="!absolute !-right-1.5 !top-1/2 !-translate-y-1/2 !h-2.5 !w-2.5 !rounded-full !bg-white !border-2 !border-zinc-500 hover:!border-blue-600 hover:!bg-blue-600"
            />
          )}
        </div>
      </div>
    </NodeWrapper>
  );
});
CardMessageNode.displayName = 'CardMessageNode';

// 9. Carousel Message Node
export const CarouselMessageNode: React.FC<NodeProps> = React.memo(({ id, data, selected }) => {
  const d = data as unknown as CarouselMessageNodeData;
  const cards = d.cards || [];

  return (
    <NodeWrapper
      id={id}
      type="carouselMessage"
      selected={selected}
      title={d.label || 'Carousel Message'}
      outputs={[]}
      minWidth="min-w-[310px] max-w-[380px]"
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900">
          <Layers className="h-3.5 w-3.5 text-zinc-500" />
          <span>{d.title || 'Product Carousel'}</span>
          <span className="text-[10px] font-mono text-zinc-400 ml-auto">({cards.length} cards)</span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1.5 pt-0.5">
          {cards.map((card) => (
            <div
              key={card.id}
              className="flex-shrink-0 w-36 rounded border border-zinc-200 bg-zinc-50 p-2 flex flex-col justify-between text-xs"
            >
              <div>
                <div className="h-14 rounded bg-zinc-200/80 mb-1.5 flex items-center justify-center overflow-hidden">
                  {card.imageUrl ? (
                    <img src={card.imageUrl} alt={card.title} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="h-4 w-4 text-zinc-400" />
                  )}
                </div>
                <h5 className="font-semibold text-zinc-900 truncate">{card.title}</h5>
                <p className="text-[10px] text-zinc-500 line-clamp-2 mt-0.5">{card.description}</p>
              </div>

              <div className="relative mt-2 rounded bg-white border border-blue-200 px-1.5 py-1 text-center text-[11px] font-medium text-blue-600">
                <span className="truncate block">{card.buttonText || 'Select'}</span>
                <Handle
                  type="source"
                  position={Position.Right}
                  id={card.id}
                  className="!absolute !-right-1.5 !top-1/2 !-translate-y-1/2 !h-2.5 !w-2.5 !rounded-full !bg-white !border-2 !border-zinc-500 hover:!border-blue-600 hover:!bg-blue-600"
                />
              </div>
            </div>
          ))}
          {cards.length === 0 && (
            <div className="text-[11px] text-zinc-400 italic py-2">No cards in carousel</div>
          )}
        </div>
      </div>
    </NodeWrapper>
  );
});
CarouselMessageNode.displayName = 'CarouselMessageNode';

// 10. Document + Text Node
export const DocumentTextNode: React.FC<NodeProps> = React.memo(({ id, data, selected }) => {
  const d = data as unknown as DocumentTextNodeData;
  return (
    <NodeWrapper
      id={id}
      type="documentText"
      selected={selected}
      title={d.label || 'Document + Text'}
      minWidth="min-w-[260px] max-w-[320px]"
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 rounded border border-zinc-200 bg-zinc-50 p-2.5">
          <FileText className="h-5 w-5 text-blue-600 shrink-0" />
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-zinc-900 truncate">{d.fileName || 'Document.pdf'}</p>
            {d.fileSize && <p className="text-[10px] text-zinc-500">{d.fileSize}</p>}
          </div>
        </div>

        <p className="text-xs text-zinc-700 leading-relaxed break-words whitespace-pre-wrap">
          {d.text || <span className="text-zinc-400 italic">Attached file description...</span>}
        </p>
      </div>
    </NodeWrapper>
  );
});
DocumentTextNode.displayName = 'DocumentTextNode';
