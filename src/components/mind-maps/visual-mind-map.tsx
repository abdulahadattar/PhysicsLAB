
// src/components/mind-maps/visual-mind-map.tsx
'use client';

import React, { useEffect, useCallback } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
  Panel,
  useReactFlow,
  Viewport,
  ConnectionLineType,
  MarkerType,
} from '@xyflow/react';

import CustomMindMapNode, { CustomNodeData } from './custom-mindmap-node';
import { Button } from '@/components/ui/button';
import { Loader2, ZoomInIcon, ZoomOutIcon, LocateIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type VisualMindMapNodeType = Node<CustomNodeData, 'customMindMapNode'>;
export type VisualMindMapEdgeType = Edge;

interface VisualMindMapProps {
  initialNodes?: VisualMindMapNodeType[];
  initialEdges?: VisualMindMapEdgeType[];
  isLoading?: boolean;
  error?: string | null;
  onNodeClick?: (event: React.MouseEvent, node: VisualMindMapNodeType) => void;
  onNodeDoubleClick?: (event: React.MouseEvent, node: VisualMindMapNodeType) => void;
  gradeName?: string;
  className?: string;
}

const nodeTypes = {
  customMindMapNode: CustomMindMapNode,
};

const initialViewport: Viewport = { x: 0, y: 0, zoom: 1 };

const defaultEdgeOptions = {
  animated: false,
  type: ConnectionLineType.SmoothStep,
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 15,
    height: 15,
    color: 'hsl(var(--muted-foreground))',
  },
  style: {
    strokeWidth: 1.5,
    stroke: 'hsl(var(--muted-foreground))',
  },
};

const VisualMindMapContent: React.FC<VisualMindMapProps> = ({
  initialNodes = [],
  initialEdges = [],
  isLoading,
  error,
  onNodeClick,
  onNodeDoubleClick,
  gradeName,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { fitView, zoomIn, zoomOut } = useReactFlow();

  useEffect(() => {
    setNodes(initialNodes.map(n => ({ ...n, type: n.type || 'customMindMapNode' })));
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  useEffect(() => {
    if (nodes.length > 0 && !isLoading) {
      const timeoutId = setTimeout(() => {
        fitView({ padding: 0.2, duration: 600, includeHiddenNodes: true });
      }, 150);
      return () => clearTimeout(timeoutId);
    }
  }, [nodes, fitView, isLoading]);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge({ ...params, ...defaultEdgeOptions }, eds));
    },
    [setEdges]
  );

  const handleFitView = useCallback(() => {
    fitView({ padding: 0.2, duration: 600 });
  }, [fitView]);

  const handleZoomIn = useCallback(() => zoomIn({ duration: 300 }), [zoomIn]);
  const handleZoomOut = useCallback(() => zoomOut({ duration: 300 }), [zoomOut]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-lg text-muted-foreground">
        <Loader2 className="mr-2 h-10 w-10 animate-spin text-primary" />
        Generating Mind Map... Please wait.
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-destructive text-lg p-4">
        <p className="font-semibold">Error Generating Mind Map</p>
        <p className="text-sm text-center">{error}</p>
        <Button onClick={handleFitView} variant="outline" className="mt-4">Try Resetting View</Button>
      </div>
    );
  }

  if (!initialNodes || initialNodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] text-muted-foreground text-lg p-4 text-center">
        No mind map data available. Select a grade and generate a map, or the map might be empty.
      </div>
    );
  }

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      onNodeClick={onNodeClick}
      onNodeDoubleClick={onNodeDoubleClick}
      defaultEdgeOptions={defaultEdgeOptions}
      connectionLineType={ConnectionLineType.SmoothStep}
      connectionLineStyle={{ stroke: 'hsl(var(--border))', strokeWidth: 2 }}
      fitView
      fitViewOptions={{ padding: 0.2, duration: 600 }}
      defaultViewport={initialViewport}
      attributionPosition="bottom-left"
      className="bg-background"
      minZoom={0.1}
      maxZoom={2.5}
      proOptions={{ hideAttribution: true }}
    >
      <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="hsl(var(--border))" />
      <Controls
        showInteractive={false}
        position="bottom-center"
        className="[&>button]:bg-card [&>button]:border [&>button:hover]:bg-muted"
      />
      <MiniMap
        nodeStrokeWidth={3}
        pannable
        zoomable
        position="bottom-left"
        className="!border-border !bg-card"
        nodeColor={(node) => {
          if (node.data?.nodeType === 'root' || node.data?.nodeType === 'chapter') return 'hsl(var(--primary))';
          return 'hsl(var(--secondary))';
        }}
      />
      <Panel position="top-center" className="flex gap-2 p-1 bg-card/80 backdrop-blur-sm border rounded-lg shadow-md">
        {gradeName && <span className="font-semibold text-sm p-2 text-card-foreground">Map: {gradeName}</span>}
        <Button onClick={handleZoomIn} variant="ghost" size="icon" aria-label="Zoom In">
          <ZoomInIcon className="h-5 w-5" />
        </Button>
        <Button onClick={handleZoomOut} variant="ghost" size="icon" aria-label="Zoom Out">
          <ZoomOutIcon className="h-5 w-5" />
        </Button>
        <Button onClick={handleFitView} variant="ghost" size="icon" aria-label="Fit View">
          <LocateIcon className="h-5 w-5" />
        </Button>
      </Panel>
    </ReactFlow>
  );
};

const VisualMindMap: React.FC<VisualMindMapProps> = ({ className, ...props }) => {
  return (
    <div className={cn("w-full h-[600px] md:h-[700px] rounded-lg border bg-card overflow-hidden relative", className)}>
      <ReactFlowProvider>
        <VisualMindMapContent {...props} />
      </ReactFlowProvider>
    </div>
  );
};

export default VisualMindMap;
