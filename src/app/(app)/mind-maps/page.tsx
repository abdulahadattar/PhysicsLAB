
"use client";

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Loader2, Map, Brain, WifiOff, AlertTriangle, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { StudyGrade } from '@/lib/types';
import { CURRICULUM_BOARDS } from '@/lib/constants';
import type { AIMindMapNode as AIMindMapNodeType } from '@/ai/flows/generate-mind-map-flow'; 
import type { Position } from '@xyflow/react';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load VisualMindMap component
const VisualMindMap = React.lazy(() => import('@/components/mind-maps/visual-mind-map'));
import type { VisualMindMapNodeType, VisualMindMapEdgeType } from '@/components/mind-maps/visual-mind-map';


const NODE_WIDTH = 180;
const NODE_HEIGHT_ESTIMATE = 70; 
const HORIZONTAL_SPACING = 60;
const VERTICAL_SPACING = 100;


interface FetchedMindMapData {
  mindMapTitle: string;
  nodes: AIMindMapNodeType[]; 
}

interface LayoutNode extends AIMindMapNodeType {
  children: LayoutNode[];
  x: number;
  y: number;
  width: number; // width of the subtree rooted at this node
  level: number;
  modifier: number; // For adjusting positions in the tree layout
}

function buildTree(aiNodes: AIMindMapNodeType[], rootId: string): LayoutNode | null {
  const nodeMap = new Map<string, LayoutNode>();
  aiNodes.forEach(node => {
    nodeMap.set(node.id, { ...node, children: [], x: 0, y: 0, width: 0, level: 0, modifier: 0 });
  });

  let rootNode: LayoutNode | null = null;
  aiNodes.forEach(aiNode => {
    const node = nodeMap.get(aiNode.id)!;
    if (aiNode.parentId && nodeMap.has(aiNode.parentId)) {
      const parent = nodeMap.get(aiNode.parentId)!;
      parent.children.push(node);
    } else if (aiNode.id === rootId) {
      rootNode = node;
    }
  });
  return rootNode;
}

function firstWalk(node: LayoutNode, level: number): void {
  node.level = level;
  node.x = 0; // Initial x, will be adjusted
  node.modifier = 0;

  if (node.children.length === 0) {
    node.width = NODE_WIDTH; // Leaf node width
  } else {
    let childrenWidth = 0;
    node.children.forEach((child, i) => {
      firstWalk(child, level + 1);
      childrenWidth += child.width;
      if (i < node.children.length - 1) {
        childrenWidth += HORIZONTAL_SPACING;
      }
    });
    node.width = Math.max(NODE_WIDTH, childrenWidth);
  }
}

function secondWalk(node: LayoutNode, currentX: number, currentY: number): void {
  node.x = currentX + node.modifier;
  node.y = currentY + node.level * VERTICAL_SPACING;

  let childrenStartX = node.x - (node.width / 2) + (NODE_WIDTH / 2);
  if (node.children.length > 0 && node.width > NODE_WIDTH) { // If subtree is wider than node, adjust start
      childrenStartX = node.x - (node.width - NODE_WIDTH) / 2;
  }


  node.children.forEach(child => {
    const childXOffset = childrenStartX;
    secondWalk(child, childXOffset, currentY);
    childrenStartX += child.width + HORIZONTAL_SPACING;
  });
}


function buchheimTreeLayout(aiNodes: AIMindMapNodeType[], rootId: string): { nodes: VisualMindMapNodeType[], edges: VisualMindMapEdgeType[] } {
  if (!aiNodes.find(n => n.id === rootId)) {
    console.error("Root node not found for layout:", rootId);
    return { nodes: [], edges: [] };
  }
  
  const root = buildTree(aiNodes, rootId);
  if (!root) return { nodes: [], edges: [] };

  firstWalk(root, 0);
  secondWalk(root, 0, 50); // Start root at y=50

  const flowNodes: VisualMindMapNodeType[] = [];
  const flowEdges: VisualMindMapEdgeType[] = [];
  
  const nodeMap = new Map<string, LayoutNode>();
  function collectNodesAndEdges(node: LayoutNode) {
      nodeMap.set(node.id, node);
      let nodeType: CustomNodeData['nodeType'] = 'subtopic';
      if (node.level === 0) nodeType = 'root';
      else if (node.level === 1) nodeType = 'chapter';

      flowNodes.push({
        id: node.id,
        type: 'customMindMapNode',
        data: { label: node.label, nodeType },
        position: { x: node.x, y: node.y },
        sourcePosition: 'bottom' as Position,
        targetPosition: 'top' as Position,
        style: { width: NODE_WIDTH, height: 'auto' }, // Custom node will determine height
      });
      node.children.forEach(child => {
          flowEdges.push({
              id: `e-${node.id}-${child.id}`,
              source: node.id,
              target: child.id,
              type: 'smoothstep',
              animated: node.level < 1,
          });
          collectNodesAndEdges(child);
      });
  }
  
  collectNodesAndEdges(root);

  // Center the graph horizontally
  if (flowNodes.length > 0) {
    const minX = Math.min(...flowNodes.map(n => n.position.x));
    const maxX = Math.max(...flowNodes.map(n => n.position.x + NODE_WIDTH));
    const graphActualWidth = maxX - minX;
    const viewportWidthEstimate = NODE_WIDTH * 3; // Estimate viewport width
    const xOffset = -minX + (viewportWidthEstimate - graphActualWidth) / 2;

    flowNodes.forEach(n => {
        n.position.x += xOffset;
    });
  }

  return { nodes: flowNodes, edges: flowEdges };
}



export default function MindMapsPage() {
  const { toast } = useToast();
  const [studyGrades, setStudyGrades] = useState<StudyGrade[]>([]);
  const [selectedGradeId, setSelectedGradeId] = useState<string | null>(null);
  const [selectedCurriculumId, setSelectedCurriculumId] = useState<string | null>(null);
  
  const [fetchedMindMapData, setFetchedMindMapData] = useState<FetchedMindMapData | null>(null);
  const [flowNodes, setFlowNodes] = useState<VisualMindMapNodeType[]>([]);
  const [flowEdges, setFlowEdges] = useState<VisualMindMapEdgeType[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingGrades, setIsLoadingGrades] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [gradesError, setGradesError] = useState<string | null>(null);
  const [mindMapError, setMindMapError] = useState<string | null>(null);


  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  const fetchGrades = useCallback(async () => {
    setIsLoadingGrades(true);
    setGradesError(null);
    try {
      const res = await fetch('/api/study-materials');
      if (!res.ok) throw new Error(`Failed to fetch grades: ${res.statusText}`);
      const data: StudyGrade[] = await res.json();
      setStudyGrades(data);
    } catch (error) {
      console.error("Error fetching study grades:", error);
      const errorMsg = error instanceof Error ? error.message : "Could not load grade information.";
      setGradesError(errorMsg);
      toast({ variant: "destructive", title: "Error loading grades", description: errorMsg });
    } finally {
      setIsLoadingGrades(false);
    }
  },[toast]);

  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

  const getCacheKey = useCallback(() => {
    if (!selectedGradeId || !selectedCurriculumId) return null;
    return `mindMap-${selectedGradeId}-${selectedCurriculumId}`;
  }, [selectedGradeId, selectedCurriculumId]);

  const loadMindMapFromCache = useCallback((): boolean => {
    const cacheKey = getCacheKey();
    if (!cacheKey) return false;

    try {
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        const parsedData: FetchedMindMapData = JSON.parse(cachedData);
        setFetchedMindMapData(parsedData);
        const rootNode = parsedData.nodes.find(n => !n.parentId && n.id.startsWith(`g${parsedData.gradeId}-${parsedData.curriculumId}-root`)); 
        if (rootNode) {
            const { nodes: newFlowNodes, edges: newFlowEdges } = buchheimTreeLayout(parsedData.nodes, rootNode.id);
            setFlowNodes(newFlowNodes);
            setFlowEdges(newFlowEdges);
            setMindMapError(null);
        } else {
             console.error("Root node not found in cached mind map data for key:", cacheKey, parsedData);
             setFlowNodes([]); setFlowEdges([]); 
             setMindMapError("Cached mind map data is malformed (no root node). Please fetch again.");
        }
        return true;
      }
    } catch (e) {
      console.error("Failed to load mind map from cache:", e);
      localStorage.removeItem(cacheKey);
      setMindMapError("Failed to load cached mind map. It might be corrupted.");
    }
    return false;
  }, [getCacheKey]);


  useEffect(() => {
    setFetchedMindMapData(null); 
    setFlowNodes([]); setFlowEdges([]);
    setMindMapError(null);

    if (selectedGradeId && selectedCurriculumId) {
      const loadedFromCache = loadMindMapFromCache();
      if (!loadedFromCache && !isOnline) {
         setMindMapError("You are offline. No cached mind map for this selection. Connect to the internet to fetch it.");
         toast({ title: "Offline", description: "No cached mind map for this selection. Connect to the internet to fetch it."});
      }
    }
  }, [selectedGradeId, selectedCurriculumId, loadMindMapFromCache, isOnline, toast]);

  const handleFetchMindMap = useCallback(async () => {
    if (!selectedGradeId || !selectedCurriculumId) {
      toast({ title: "Selection Required", description: "Please select a grade and curriculum.", variant: "destructive" });
      return;
    }
    if (!isOnline) {
      toast({ title: "Offline", description: "Mind map fetching requires an internet connection.", variant: "destructive" });
      setMindMapError("You are offline. Cannot fetch new mind map data.");
      return;
    }

    setIsLoading(true);
    setMindMapError(null);
    setFlowNodes([]); setFlowEdges([]); 

    try {
        const response = await fetch(`/api/mind-maps?gradeId=${selectedGradeId}&curriculumId=${selectedCurriculumId}`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: `Failed to fetch mind map (${response.status})` }));
            throw new Error(errorData.message || `Failed to fetch mind map (${response.status})`);
        }
        const data: FetchedMindMapData = await response.json();
        
        if (!data || !data.nodes || data.nodes.length === 0) {
            throw new Error("Fetched mind map data is empty or invalid.");
        }
        
        setFetchedMindMapData(data);
        const cacheKey = getCacheKey();
        if (cacheKey) localStorage.setItem(cacheKey, JSON.stringify(data));
        
        const rootNode = data.nodes.find(n => !n.parentId && n.id.startsWith(`g${data.gradeId}-${data.curriculumId}-root`));
        if (rootNode) {
            const { nodes: newFlowNodes, edges: newFlowEdges } = buchheimTreeLayout(data.nodes, rootNode.id);
            setFlowNodes(newFlowNodes);
            setFlowEdges(newFlowEdges);
        } else {
            console.error("Root node not found in fetched mind map data:", data);
            setFlowNodes([]); setFlowEdges([]);
            throw new Error("Fetched mind map data does not have a valid root node.");
        }
        toast({ title: "Mind Map Loaded", description: data.mindMapTitle });
    } catch (err) {
        console.error("Error fetching mind map:", err);
        const errorMsg = err instanceof Error ? err.message : "Could not fetch the mind map.";
        setMindMapError(errorMsg);
        toast({ title: "Mind Map Fetch Error", description: errorMsg, variant: "destructive" });
        setFetchedMindMapData(null); setFlowNodes([]); setFlowEdges([]);
    }
    setIsLoading(false);
  }, [selectedGradeId, selectedCurriculumId, isOnline, toast, getCacheKey]);

  const selectedGradeName = studyGrades.find(g => g.id === selectedGradeId)?.name || "";
  const selectedCurriculumName = CURRICULUM_BOARDS.find(c => c.id === selectedCurriculumId)?.name || "";
  const displayTitle = fetchedMindMapData?.mindMapTitle || (selectedGradeName && selectedCurriculumName ? `${selectedGradeName} - ${selectedCurriculumName}` : "");

  const showFetchButton = selectedGradeId && selectedCurriculumId && (!fetchedMindMapData || flowNodes.length === 0) && isOnline && !isLoading && !mindMapError;


  const handleNodeClick = useCallback((event: React.MouseEvent, node: VisualMindMapNodeType) => {
    console.log('Node clicked:', node);
    toast({
        title: `Node Clicked: ${node.data.label}`,
        description: `ID: ${node.id}, Type: ${node.data.nodeType}`,
    });
  }, [toast]);

  const MindMapSkeleton = () => (
    <Card className="border-dashed flex-grow h-full">
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2 mt-1" />
      </CardHeader>
      <CardContent className="text-center py-10 text-muted-foreground flex flex-col items-center justify-center h-full">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p>Loading Mind Map Viewer...</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 flex flex-col" style={{ height: 'calc(100vh - 100px - 2rem)' }}> {/* Adjusted height */}
      <Card className="shadow-xl shrink-0">
        <CardHeader className="text-center">
          <div className="inline-block mx-auto bg-primary/10 p-3 rounded-full mb-2">
            <Share2 className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl">Interactive Physics Mind Maps</CardTitle>
          <CardDescription>
            Visualize topics and their connections. Select a grade and curriculum to view a mind map. Mind maps are loaded from pre-generated data.
          </CardDescription>
        </CardHeader>
      </Card>

      {!isOnline && (
        <Alert variant="destructive" className="shrink-0">
          <WifiOff className="h-4 w-4" />
          <AlertTitle>You are currently offline</AlertTitle>
          <AlertDescription>
            Mind map fetching requires an internet connection. Cached maps may be available.
          </AlertDescription>
        </Alert>
      )}

      <Card className="shrink-0">
        <CardHeader>
          <CardTitle>Select Context</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4 items-center">
          {isLoadingGrades ? (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" /> <span>Loading grades...</span>
            </div>
          ) : gradesError ? (
            <Alert variant="destructive" className="w-full sm:w-auto">
              <AlertTriangle className="h-4 w-4" /> <AlertTitle>Error</AlertTitle> <AlertDescription>{gradesError}</AlertDescription>
            </Alert>
          ) : (
            <Select onValueChange={setSelectedGradeId} value={selectedGradeId || undefined}>
              <SelectTrigger className="w-full sm:w-[220px]">
                <SelectValue placeholder="Select Grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Grades</SelectLabel>
                  {studyGrades.map((grade) => (
                    <SelectItem key={grade.id} value={grade.id}>{grade.name}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
          <Select onValueChange={setSelectedCurriculumId} value={selectedCurriculumId || undefined}>
              <SelectTrigger className="w-full sm:w-[280px]">
                <SelectValue placeholder="Select Curriculum" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Curriculum Boards</SelectLabel>
                  {CURRICULUM_BOARDS.map((board) => (
                    <SelectItem key={board.id} value={board.id}>{board.name}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          {showFetchButton && (
            <Button onClick={() => handleFetchMindMap()} disabled={isLoading || isLoadingGrades}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Brain className="mr-2 h-4 w-4" />}
              Fetch Mind Map
            </Button>
          )}
        </CardContent>
      </Card>
      
      <div className="flex-grow min-h-[400px] relative">
        <Suspense fallback={<MindMapSkeleton />}>
          {(selectedGradeId && selectedCurriculumId && (isLoading || flowNodes.length > 0 || mindMapError)) ? (
              <VisualMindMap
                  key={`${selectedGradeId}-${selectedCurriculumId}-${flowNodes.length}`} // Force re-mount if key changes
                  initialNodes={flowNodes}
                  initialEdges={flowEdges}
                  isLoading={isLoading && flowNodes.length === 0} // Only show VisualMindMap's loader if truly loading new data
                  error={mindMapError}
                  onNodeClick={handleNodeClick}
                  gradeName={displayTitle}
                  className="h-full w-full absolute inset-0" // Ensure it fills parent
              />
          ) : (
            !isLoading && ( 
              <Card className="border-dashed flex-grow h-full absolute inset-0">
                  <CardContent className="text-center py-10 text-muted-foreground flex flex-col items-center justify-center h-full">
                      <Map className="mx-auto h-12 w-12 mb-4" />
                      <p>Please select a grade and curriculum to view its mind map.</p>
                      {mindMapError && <Alert variant="destructive" className="mt-4 w-auto"><AlertTriangle className="h-4 w-4"/><AlertDescription>{mindMapError}</AlertDescription></Alert>}
                  </CardContent>
              </Card>
            )
          )}
          {isLoading && flowNodes.length === 0 && !mindMapError && ( // Global loading indicator if fetching map data and no nodes yet
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground bg-background/80 backdrop-blur-sm z-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                  <span className="ml-2">Loading mind map structure...</span>
              </div>
          )}
        </Suspense>
      </div>
    </div>
  );
}
