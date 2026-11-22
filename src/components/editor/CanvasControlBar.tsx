import React from 'react';
import { useReactFlow } from '@xyflow/react';
import { useEditorStore } from '../../store/useEditorStore';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid,
  Map,
  RotateCcw,
  Focus,
} from 'lucide-react';

export const CanvasControlBar: React.FC = () => {
  const { zoomIn, zoomOut, fitView, setViewport } = useReactFlow();
  const { settings, toggleGrid, toggleMinimap } = useEditorStore();

  const handleCenter = () => {
    setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 300 });
  };

  return (
    <div className="absolute bottom-4 left-4 z-10 flex items-center gap-1 rounded-md border border-zinc-200 bg-white p-1 shadow-xs">
      <button
        onClick={() => zoomIn({ duration: 200 })}
        className="rounded p-1.5 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
        title="Zoom In"
      >
        <ZoomIn className="h-4 w-4" />
      </button>

      <button
        onClick={() => zoomOut({ duration: 200 })}
        className="rounded p-1.5 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
        title="Zoom Out"
      >
        <ZoomOut className="h-4 w-4" />
      </button>

      <div className="h-4 w-px bg-zinc-200 mx-0.5" />

      <button
        onClick={() => fitView({ padding: 0.2, duration: 250 })}
        className="rounded p-1.5 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
        title="Fit All Nodes in View"
      >
        <Maximize2 className="h-4 w-4" />
      </button>

      <button
        onClick={handleCenter}
        className="rounded p-1.5 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
        title="Center Canvas (Reset Viewport)"
      >
        <RotateCcw className="h-4 w-4" />
      </button>

      <div className="h-4 w-px bg-zinc-200 mx-0.5" />

      <button
        onClick={toggleGrid}
        className={`rounded p-1.5 transition-colors ${
          settings.showGrid ? 'bg-zinc-100 text-blue-600' : 'text-zinc-600 hover:bg-zinc-100'
        }`}
        title={settings.showGrid ? 'Hide Grid' : 'Show Grid'}
      >
        <Grid className="h-4 w-4" />
      </button>

      <button
        onClick={toggleMinimap}
        className={`rounded p-1.5 transition-colors ${
          settings.showMinimap ? 'bg-zinc-100 text-blue-600' : 'text-zinc-600 hover:bg-zinc-100'
        }`}
        title={settings.showMinimap ? 'Hide Minimap' : 'Show Minimap'}
      >
        <Map className="h-4 w-4" />
      </button>
    </div>
  );
};
