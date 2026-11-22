import React, { useCallback, useRef, useState } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  MiniMap,
  useReactFlow,
  ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useEditorStore } from '../../store/useEditorStore';
import { customNodeTypes } from '../nodes';
import { CanvasControlBar } from './CanvasControlBar';
import { CanvasContextMenu } from './CanvasContextMenu';
import { NodeType } from '../../types/workflow';

export const Canvas: React.FC = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    flowPosition: { x: number; y: number };
  } | null>(null);

  const {
    nodes,
    edges,
    settings,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    selectNode,
    setViewport,
  } = useEditorStore();

  const { screenToFlowPosition } = useReactFlow();

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const nodeType = e.dataTransfer.getData('application/reactflow-type') as NodeType;
      if (!nodeType) return;

      const position = screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      });

      addNode(nodeType, position);
    },
    [screenToFlowPosition, addNode]
  );

  const onContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const position = screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      });

      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        flowPosition: position,
      });
    },
    [screenToFlowPosition]
  );

  const onPaneClick = useCallback(() => {
    selectNode(null);
    setContextMenu(null);
  }, [selectNode]);

  // Node click selection
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: { id: string }) => {
      selectNode(node.id);
      setContextMenu(null);
    },
    [selectNode]
  );

  return (
    <div ref={reactFlowWrapper} className="relative h-full w-full bg-[#fbfbfb]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={customNodeTypes}
        onNodesChange={onNodesChange as any}
        onEdgesChange={onEdgesChange as any}
        onConnect={onConnect}
        onInit={setRfInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onContextMenu={onContextMenu}
        onPaneClick={onPaneClick}
        onNodeClick={onNodeClick}
        onMoveEnd={(_, vp) => setViewport(vp)}
        snapToGrid={settings.snapToGrid}
        snapGrid={[settings.gridSize, settings.gridSize]}
        deleteKeyCode={['Backspace', 'Delete']}
        multiSelectionKeyCode={['Meta', 'Control', 'Shift']}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={2.5}
        defaultEdgeOptions={{
          type: 'smoothstep',
          style: { strokeWidth: 1.5, stroke: '#71717a' },
        }}
        nodesDraggable={true}
        nodesConnectable={true}
        elementsSelectable={true}
        proOptions={{ hideAttribution: true }}
      >
        {settings.showGrid && (
          <Background
            variant={BackgroundVariant.Dots}
            gap={settings.gridSize}
            size={1}
            color="#e4e4e7"
          />
        )}

        {settings.showMinimap && (
          <MiniMap
            position="bottom-right"
            nodeStrokeColor="#71717a"
            nodeColor="#ffffff"
            maskColor="rgba(244, 244, 245, 0.7)"
            style={{
              width: 130,
              height: 90,
              marginBottom: 16,
              marginRight: 16,
            }}
          />
        )}

        <CanvasControlBar />
      </ReactFlow>

      {contextMenu && (
        <CanvasContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          flowPosition={contextMenu.flowPosition}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
};
