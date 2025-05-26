"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  Panel,
  ReactFlowProvider,
  Node,
  Edge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import mindMapJsonData from '@/data/grade9-physics-mindmap-stbb.json';
import { CustomMindMapNode, CustomNodeData } from '@/components/mind-maps/CustomMindMapNode';
import { processMindMapData, getLayoutedElements, buildNodeMap, HierarchicalMindMapNode } from '@/lib/mindmap-utils';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, ZoomIn, ZoomOut, Expand } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

const nodeTypes = {
  customMindMapNode: CustomMindMapNode,
  rootSubjectNode: CustomMindMapNode,
  unitNode: CustomMindMapNode,
  majorTopicNode: CustomMindMapNode,
  subTopicNode: CustomMindMapNode,
  instrumentNode: CustomMindMapNode
} as Record<string, any>;

const typedMindMapData = mindMapJsonData as HierarchicalMindMapNode[];
// Automatically adopt root node based on given data array
const rootNodeId = typedMindMapData.length ? typedMindMapData[0].id : '';
const allNodesMap = buildNodeMap(typedMindMapData);

// Remove duplicate imports and use correct generics for useNodesState/useEdgesState
// Remove duplicate import of Node, Edge, CustomNodeData
// Only import them once, and use Node<CustomNodeData> and Edge as generics

export default function PerfectMindMapPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<any>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNodeDetails, setSelectedNodeDetails] = useState<CustomNodeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Start with the root node expanded (if available)
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(new Set(rootNodeId ? [rootNodeId] : []));
  const [visibleNodeIds, setVisibleNodeIds] = useState<Set<string>>(new Set());

  const reactFlowInstance = React.useRef<any>(null);

  const regenerateFlowElements = useCallback(() => {
    setIsLoading(true);
    const newVisibleNodeIds = new Set<string>();
    function determineVisibility(data: HierarchicalMindMapNode[] = [], parentIsExpanded: boolean) {
      data.forEach(item => {
        if (parentIsExpanded || item.id === rootNodeId) {
          newVisibleNodeIds.add(item.id);
          if (item.children && expandedNodeIds.has(item.id)) {
            determineVisibility(item.children, true);
          }
        }
      });
    }
    determineVisibility(typedMindMapData, true);
    setVisibleNodeIds(newVisibleNodeIds);

    const { nodes: processedNodes, edges: processedEdges } = processMindMapData(
      typedMindMapData,
      newVisibleNodeIds,
      expandedNodeIds
    );
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(processedNodes, processedEdges);

    const finalNodes = layoutedNodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        onToggleExpand: (nodeId: string) => {
          setExpandedNodeIds((prev: Set<string>) => {
            const newSet = new Set(prev);
            newSet.has(nodeId) ? newSet.delete(nodeId) : newSet.add(nodeId);
            return newSet;
          });
        },
        onShowDetails: (data: CustomNodeData) => setSelectedNodeDetails(data),
      }
    }));

    setNodes(finalNodes as Node<any>[]);
    setEdges(layoutedEdges);
    setIsLoading(false);
  }, [expandedNodeIds]);

  useEffect(() => {
    regenerateFlowElements();
  }, [regenerateFlowElements]);

  useEffect(() => {
    if (reactFlowInstance.current && nodes.length > 0 && !isLoading) {
      reactFlowInstance.current.fitView({ duration: 300, padding: 0.1 });
    }
  }, [nodes, isLoading]);

  return (
    <div className="h-[calc(100vh-120px)] w-full flex flex-col border rounded-lg shadow-xl">
      {selectedNodeDetails && (
        <Card className="absolute top-4 right-4 z-10 w-80 max-h-[80vh] shadow-2xl bg-background/90 backdrop-blur-sm">
          <CardHeader className="p-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-md">{selectedNodeDetails.label}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setSelectedNodeDetails(null)} className="h-6 w-6">
                <LucideIcons.X className="h-4 w-4" />
              </Button>
            </div>
            {selectedNodeDetails.page_no && (
              <CardDescription className="text-xs">Textbook Ref: Page {selectedNodeDetails.page_no}</CardDescription>
            )}
          </CardHeader>
          <ScrollArea className="max-h-[calc(80vh-150px)]">
            <CardContent className="p-3 text-sm space-y-3">
              {selectedNodeDetails.definition && (
                <div>
                  <h4 className="font-semibold text-xs mb-0.5 text-muted-foreground">Definition:</h4>
                  <p className="text-xs">{selectedNodeDetails.definition}</p>
                </div>
              )}
              {selectedNodeDetails.stbbRelevance && (
                <div>
                  <h4 className="font-semibold text-xs mb-0.5 text-muted-foreground">STBB Relevance:</h4>
                  <p className="text-xs">{selectedNodeDetails.stbbRelevance}</p>
                </div>
              )}
            </CardContent>
          </ScrollArea>
        </Card>
      )}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-3 text-lg">Laying out Mind Map...</p>
        </div>
      )}
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.2}
          maxZoom={2}
          attributionPosition="top-left"
          className="physicslab-mindmap-perfect"
          onInit={(instance) => (reactFlowInstance.current = instance)}
          proOptions={{ hideAttribution: true }}
        >
          <Controls className="fill-muted-foreground stroke-border" />
          <MiniMap nodeStrokeWidth={3} zoomable pannable className="border-2 border-primary rounded-md" />
          <Background color="#ccc" gap={20} className="dark:opacity-20" />
          <Panel position="top-left" className="flex gap-2 m-2">
            <Button size="sm" variant="outline" onClick={() => reactFlowInstance.current?.zoomIn({ duration: 200 })}>
              <ZoomIn className="h-4 w-4 mr-1" /> Zoom In
            </Button>
            <Button size="sm" variant="outline" onClick={() => reactFlowInstance.current?.zoomOut({ duration: 200 })}>
              <ZoomOut className="h-4 w-4 mr-1" /> Zoom Out
            </Button>
            <Button size="sm" variant="outline" onClick={() => reactFlowInstance.current?.fitView({ duration: 200, padding: 0.1 })}>
              <Expand className="h-4 w-4 mr-1" /> Fit View
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const allIds = new Set<string>();
                allNodesMap.forEach(node => allIds.add(node.id));
                setExpandedNodeIds(allIds);
              }}
            >
              <LucideIcons.PlusSquare className="h-4 w-4 mr-1" /> Expand All
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setExpandedNodeIds(new Set(rootNodeId ? [rootNodeId] : []))}
            >
              <LucideIcons.MinusSquare className="h-4 w-4 mr-1" /> Collapse All
            </Button>
          </Panel>
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}
