import { Node, Edge, Position } from '@xyflow/react';
import dagre from 'dagre';

// HierarchicalMindMapNode type for mind map tree structure
export interface HierarchicalMindMapNode {
  id: string;
  type?: string;
  data: {
    label: string;
    icon?: string;
    color?: string;
    definition?: string;
    stbbRelevance?: string;
    page_no?: string;
    width?: number;
    height?: number;
    // Any other fields needed for node rendering
    [key: string]: any;
  };
  children?: HierarchicalMindMapNode[];
}

const dagreGraph = new dagre.graphlib.Graph({ compound: true });
dagreGraph.setDefaultEdgeLabel(() => ({}));
dagreGraph.setGraph({ rankdir: 'LR', nodesep: 60, ranksep: 120 });

const NODE_WIDTH = 200;
const NODE_HEIGHT = 80;

export interface FlowData {
  nodes: Node[];
  edges: Edge[];
}

export const processMindMapData = (
  hierarchicalData: HierarchicalMindMapNode[],
  visibleNodeIds: Set<string>,
  expandedNodeIds: Set<string>,
  parentId: string | null = null,
  level = 0
): FlowData => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  hierarchicalData.forEach((item) => {
    if (!visibleNodeIds.has(item.id)) return;

    const nodeDataWithStatus = {
      ...item.data,
      isExpanded: expandedNodeIds.has(item.id),
      hasChildren: !!(item.children && item.children.length > 0)
    };

    dagreGraph.setNode(item.id, {
      label: item.data.label,
      width: item.data.width || NODE_WIDTH,
      height: item.data.height || NODE_HEIGHT,
    });

    nodes.push({
      id: item.id,
      type: item.type || 'customMindMapNode',
      data: nodeDataWithStatus,
      position: { x: 0, y: 0 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    });

    if (parentId) {
      dagreGraph.setEdge(parentId, item.id);
      edges.push({
        id: `e-${parentId}-${item.id}`,
        source: parentId,
        target: item.id,
        type: 'smoothstep',
        animated: level < 2,
        style: { strokeWidth: 1.5 },
      });
    }

    if (item.children && item.children.length > 0 && expandedNodeIds.has(item.id)) {
      const childrenFlow = processMindMapData(item.children, visibleNodeIds, expandedNodeIds, item.id, level + 1);
      nodes.push(...childrenFlow.nodes);
      edges.push(...childrenFlow.edges);
    }
  });

  return { nodes, edges };
};

export const getLayoutedElements = (nodes: Node[], edges: Edge[]): { nodes: Node[]; edges: Edge[] } => {
  // Fix: add type annotations for dagreGraph nodes/edges
  (dagreGraph.nodes() as string[]).forEach((n: string) => dagreGraph.removeNode(n));
  (dagreGraph.edges() as {v: string; w: string; name?: string}[]).forEach((e) => dagreGraph.removeEdge(e.v, e.w, e.name));

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      width: node.data.width || NODE_WIDTH,
      height: node.data.height || NODE_HEIGHT,
      label: node.data.label
    });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id) as { x: number; y: number };
    let x = 0;
    let y = 0;
    if (nodeWithPosition && typeof nodeWithPosition.x === 'number' && typeof nodeWithPosition.y === 'number') {
      x = Number(nodeWithPosition.x);
      y = Number(nodeWithPosition.y);
    }
    const width = typeof node.data.width === 'number' ? node.data.width : NODE_WIDTH;
    const height = typeof node.data.height === 'number' ? node.data.height : NODE_HEIGHT;
    return {
      ...node,
      targetPosition: Position.Left,
      sourcePosition: Position.Right,
      position: {
        x: x - width / 2,
        y: y - height / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

export const getAllDescendantIds = (nodeId: string, allNodesMap: Map<string, HierarchicalMindMapNode>): string[] => {
  const descendants: string[] = [];
  const queue: string[] = [nodeId];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (visited.has(currentId)) continue;
    visited.add(currentId);

    const node = allNodesMap.get(currentId);
    if (node && node.children) {
      node.children.forEach(child => {
        if (!visited.has(child.id)) {
          descendants.push(child.id);
          queue.push(child.id);
        }
      });
    }
  }
  return descendants;
};

export const buildNodeMap = (hierarchicalData: HierarchicalMindMapNode[]): Map<string, HierarchicalMindMapNode> => {
  const map = new Map<string, HierarchicalMindMapNode>();
  function traverse(nodes: HierarchicalMindMapNode[]) {
    nodes.forEach(node => {
      map.set(node.id, node);
      if (node.children) traverse(node.children);
    });
  }
  traverse(hierarchicalData);
  return map;
};
