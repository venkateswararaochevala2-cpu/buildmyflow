import React, { useEffect, useState } from 'react';
import { NodeProps, Handle, Position } from '@xyflow/react';
import { NodeWrapper } from './NodeWrapper';
import {
  TextNodeData,
  HeadingNodeData,
  ImageNodeData,
  VideoNodeData,
  AudioNodeData,
  FileNodeData,
  DividerNodeData,
} from '../../types/workflow';
import { getAssetUrl } from '../../services/assetStorage';
import { FileText, Image as ImageIcon, Video, Music, Paperclip, ExternalLink } from 'lucide-react';

export const TextNode: React.FC<NodeProps> = React.memo(({ id, data, selected }) => {
  const d = data as unknown as TextNodeData;
  const hasButtons = Array.isArray(d.buttons) && d.buttons.length > 0;

  return (
    <NodeWrapper
      id={id}
      type="text"
      selected={selected}
      title={d.label || 'Text Message'}
      outputs={hasButtons ? [] : undefined}
      minWidth={hasButtons ? 'min-w-[260px] max-w-[320px]' : undefined}
    >
      <div className="flex flex-col gap-1.5">
        {/* Optional Header */}
        {d.headerText && (
          <div className="text-xs font-semibold text-zinc-900 border-b border-zinc-100 pb-1">
            {d.headerText}
          </div>
        )}

        {/* Text Body */}
        <div
          className="break-words text-zinc-800"
          style={{
            fontSize: d.fontSize === 'sm' ? '12px' : d.fontSize === 'lg' ? '15px' : '13px',
            fontWeight: d.fontWeight || 'normal',
            textAlign: d.textAlign || 'left',
            color: d.textColor || '#09090b',
          }}
        >
          {d.content || <span className="text-zinc-400 italic">No text provided</span>}
        </div>

        {/* Optional Footer */}
        {d.footerText && (
          <div className="text-[10px] text-zinc-400 italic pt-0.5">
            {d.footerText}
          </div>
        )}

        {/* Interactive Buttons / Quick Replies */}
        {hasButtons && (
          <div className="mt-1.5 flex flex-col gap-1.5 pt-2 border-t border-zinc-100">
            {d.buttons!.map((btn) => (
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
          </div>
        )}
      </div>
    </NodeWrapper>
  );
});
TextNode.displayName = 'TextNode';

export const HeadingNode: React.FC<NodeProps> = React.memo(({ id, data, selected }) => {
  const d = data as unknown as HeadingNodeData;
  return (
    <NodeWrapper id={id} type="heading" selected={selected} title={d.label || 'Heading'}>
      <div
        className="font-semibold text-zinc-900 truncate"
        style={{
          fontSize: d.fontSize === 'xl' ? '16px' : d.fontSize === '2xl' ? '18px' : '14px',
          textAlign: d.textAlign || 'left',
        }}
      >
        {d.text || <span className="text-zinc-400 italic">Empty Heading</span>}
      </div>
    </NodeWrapper>
  );
});
HeadingNode.displayName = 'HeadingNode';

export const ImageNode: React.FC<NodeProps> = React.memo(({ id, data, selected }) => {
  const d = data as unknown as ImageNodeData;
  const [displaySrc, setDisplaySrc] = useState<string>(d.imageUrl || '');

  useEffect(() => {
    let active = true;
    if (d.assetId) {
      getAssetUrl(d.assetId).then((url) => {
        if (active && url) setDisplaySrc(url);
      });
    } else {
      setDisplaySrc(d.imageUrl || '');
    }
    return () => {
      active = false;
    };
  }, [d.assetId, d.imageUrl]);

  return (
    <NodeWrapper id={id} type="image" selected={selected} title={d.label || 'Image'}>
      <div className="flex flex-col gap-1.5">
        {displaySrc ? (
          <div className="relative overflow-hidden rounded border border-zinc-200 bg-zinc-50 max-h-36 flex items-center justify-center">
            <img
              src={displaySrc}
              alt={d.altText || 'Node image'}
              className="w-full h-auto object-cover max-h-36"
              onError={() => setDisplaySrc('')}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-1 py-4 border border-dashed border-zinc-200 rounded bg-zinc-50 text-zinc-400">
            <ImageIcon className="h-6 w-6 stroke-[1.5]" />
            <span className="text-[11px]">No image source</span>
          </div>
        )}
        {d.altText && <span className="text-[10px] text-zinc-500 truncate">{d.altText}</span>}
      </div>
    </NodeWrapper>
  );
});
ImageNode.displayName = 'ImageNode';

export const VideoNode: React.FC<NodeProps> = React.memo(({ id, data, selected }) => {
  const d = data as unknown as VideoNodeData;
  return (
    <NodeWrapper id={id} type="video" selected={selected} title={d.label || 'Video'}>
      <div className="flex items-center gap-2 rounded border border-zinc-200 bg-zinc-50 p-2 text-zinc-700">
        <Video className="h-4 w-4 shrink-0 text-zinc-500" />
        <span className="truncate text-xs">{d.videoUrl || 'No video URL specified'}</span>
      </div>
    </NodeWrapper>
  );
});
VideoNode.displayName = 'VideoNode';

export const AudioNode: React.FC<NodeProps> = React.memo(({ id, data, selected }) => {
  const d = data as unknown as AudioNodeData;
  return (
    <NodeWrapper id={id} type="audio" selected={selected} title={d.label || 'Audio'}>
      <div className="flex items-center gap-2 rounded border border-zinc-200 bg-zinc-50 p-2 text-zinc-700">
        <Music className="h-4 w-4 shrink-0 text-zinc-500" />
        <span className="truncate text-xs">{d.audioUrl || 'No audio URL specified'}</span>
      </div>
    </NodeWrapper>
  );
});
AudioNode.displayName = 'AudioNode';

export const FileNode: React.FC<NodeProps> = React.memo(({ id, data, selected }) => {
  const d = data as unknown as FileNodeData;
  return (
    <NodeWrapper id={id} type="file" selected={selected} title={d.label || 'File'}>
      <div className="flex items-center justify-between gap-2 rounded border border-zinc-200 bg-zinc-50 p-2">
        <div className="flex items-center gap-2 overflow-hidden">
          <Paperclip className="h-4 w-4 shrink-0 text-zinc-500" />
          <div className="truncate">
            <p className="text-xs font-medium text-zinc-800 truncate">{d.fileName || 'file.pdf'}</p>
            {d.fileSize && <p className="text-[10px] text-zinc-500">{d.fileSize}</p>}
          </div>
        </div>
      </div>
    </NodeWrapper>
  );
});
FileNode.displayName = 'FileNode';

export const DividerNode: React.FC<NodeProps> = React.memo(({ id, data, selected }) => {
  const d = data as unknown as DividerNodeData;
  return (
    <NodeWrapper id={id} type="divider" selected={selected} title={d.label || 'Divider'} minWidth="min-w-[180px]">
      <div className="py-2">
        <hr
          className="border-zinc-300"
          style={{
            borderTopStyle: d.borderStyle || 'solid',
          }}
        />
      </div>
    </NodeWrapper>
  );
});
DividerNode.displayName = 'DividerNode';
