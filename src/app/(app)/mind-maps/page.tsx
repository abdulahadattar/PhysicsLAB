
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Loader2, Map, Brain, WifiOff, AlertTriangle, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { StudyGrade, Chapter } from '@/lib/types';
import { CURRICULUM_BOARDS } from '@/lib/constants';
import type { AIMindMapNode as AIMindMapNodeType } from '@/ai/flows/generate-mind-map-flow'; // Use the AI's node type

import VisualMindMap, { type VisualMindMapNodeType, type VisualMindMapEdgeType } from '@/components/mind-maps/visual-mind-map';
import type { Node as ReactFlowNode, Edge as ReactFlowEdge, Position } from '@xyflow/react';
import type { CustomNodeData } from '@/components/mind-maps/custom-mindmap-node';
import { Skeleton } from '@/components/ui/skeleton';

const NODE_WIDTH = 180;
const NODE_HEIGHT = 'auto'; // Let content determine height
const HORIZONTAL_SPACING = 60;
const VERTICAL_SPACING = 80;

interface FetchedMindMapData {
  mindMapTitle: string;
  nodes: AIMindMapNodeType[]; // Nodes from JSON are AIMindMapNodeType
}

/**
 * Transforms hierarchical AI-generated nodes into React Flow nodes and edges.
 * @param aiNodes - Array of nodes with id, label, and optional parentId.
 * @param rootNodeId - The ID of the root node for the layout.
 * @returns Object containing arrays of React Flow nodes and edges.
 */
function autoLayout(aiNodes: AIMindMapNodeType[], rootNodeId: string): { nodes: VisualMindMapNodeType[], edges: VisualMindMapEdgeType[] } {
    const flowNodes: VisualMindMapNodeType[] = [];
    const flowEdges: VisualMindMapEdgeType[] = [];
    
    const childrenMap = new Map<string, string[]>();
    aiNodes.forEach(node => {
        if (node.parentId) {
            if (!childrenMap.has(node.parentId)) {
                childrenMap.set(node.parentId, []);
            }
            childrenMap.get(node.parentId)!.push(node.id);
        }
    });

    function determineNodeType(aiNode: AIMindMapNodeType, level: number): CustomNodeData['nodeType'] {
        if (level === 0) return 'root'; // Grade/Curriculum Root
        if (level === 1) return 'chapter'; // Chapters
        return 'subtopic'; // Sub-topics and deeper
    }

    function layout(nodeId: string, currentX: number, currentY: number, level: number): { width: number, newY: number } {
        const aiNode = aiNodes.find(n => n.id === nodeId);
        if (!aiNode) return { width: 0, newY: currentY };

        const children = childrenMap.get(nodeId) || [];
        let subtreeWidth = 0;
        // Estimate node height; can be dynamic later if needed
        const estimatedNodeHeight = (aiNode.label.length > 30 ? 80 : 60) + (level < 1 ? 10 : 0); 
        let maxYInSubtree = currentY + estimatedNodeHeight;


        if (children.length > 0) {
            let childStartX = currentX; // Start children directly under parent for calculation
            const childrenY = currentY + estimatedNodeHeight + VERTICAL_SPACING;
            
            const childrenLayouts = children.map(childId => layout(childId, childStartX, childrenY, level + 1));
            
            let currentChildXOffset = 0;
            childrenLayouts.forEach((childLayout, index) => {
                const childAiNode = aiNodes.find(n => n.id === children[index]);
                 if (childAiNode) {
                    const childNode = flowNodes.find(fn => fn.id === children[index]);
                    if (childNode) {
                       // Position child relative to the start of this subtree level
                       childNode.position.x = childStartX + currentChildXOffset + (childLayout.width / 2) - (NODE_WIDTH / 2);
                    }
                    currentChildXOffset += childLayout.width + HORIZONTAL_SPACING;
                    maxYInSubtree = Math.max(maxYInSubtree, childLayout.newY);
                 }
            });
            subtreeWidth = Math.max(NODE_WIDTH, currentChildXOffset - HORIZONTAL_SPACING);
        } else {
            subtreeWidth = NODE_WIDTH;
        }
        
        // Center the current node above its children (or use its own width if no children)
        const nodeX = currentX + (subtreeWidth / 2) - (NODE_WIDTH / 2);

        flowNodes.push({
            id: nodeId,
            type: 'customMindMapNode',
            data: { 
                label: aiNode.label,
                nodeType: determineNodeType(aiNode, level)
            },
            position: { x: nodeX, y: currentY },
            sourcePosition: 'bottom' as Position,
            targetPosition: 'top' as Position,
            style: { width: NODE_WIDTH, height: NODE_HEIGHT },
        });
        
        children.forEach(childId => {
            flowEdges.push({
                id: `e-${nodeId}-${childId}`,
                source: nodeId,
                target: childId,
                type: 'smoothstep',
                animated: level < 1, // Animate edges from root/chapter
            });
        });
        
        return { width: subtreeWidth, newY: maxYInSubtree };
    }

    layout(rootNodeId, 0, 50, 0);
    
    // Center the whole graph
    const minX = Math.min(...flowNodes.map(n => n.position.x));
    const maxX = Math.max(...flowNodes.map(n => n.position.x + NODE_WIDTH));
    const graphActualWidth = maxX - minX;
    const xOffset = -minX + ( (NODE_WIDTH * 3) - graphActualWidth) /2 ; // Assuming a viewport roughly 3 nodes wide

    flowNodes.forEach(n => {
        n.position.x += xOffset;
    });
    
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

  useEffect(() => {
    async function fetchGrades() {
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
    }
    fetchGrades();
  }, [toast]);

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
        const rootNode = parsedData.nodes.find(n => !n.parentId); // Find the root node
        if (rootNode) {
            const { nodes: newFlowNodes, edges: newFlowEdges } = autoLayout(parsedData.nodes, rootNode.id);
            setFlowNodes(newFlowNodes);
            setFlowEdges(newFlowEdges);
        } else {
             console.error("Root node not found in cached mind map data for key:", cacheKey);
             setFlowNodes([]); setFlowEdges([]); // Clear if invalid structure
        }
        return true;
      }
    } catch (e) {
      console.error("Failed to load mind map from cache:", e);
      localStorage.removeItem(cacheKey);
    }
    return false;
  }, [getCacheKey]);

  // Effect to load from cache or prepare for fetch when selections change
  useEffect(() => {
    setFetchedMindMapData(null); // Clear previous data
    setFlowNodes([]); setFlowEdges([]);
    setMindMapError(null);

    if (selectedGradeId && selectedCurriculumId) {
      const loadedFromCache = loadMindMapFromCache();
      if (!loadedFromCache && !isOnline) {
         toast({ title: "Offline", description: "No cached mind map for this selection. Connect to the internet to fetch it."});
      } else if (!loadedFromCache && isOnline) {
        // If not cached and online, user can click "Fetch Mind Map"
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
      return;
    }

    setIsLoading(true);
    setMindMapError(null);
    setFlowNodes([]); setFlowEdges([]); // Clear previous graph

    try {
        const response = await fetch(`/api/mind-maps?gradeId=${selectedGradeId}&curriculumId=${selectedCurriculumId}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to fetch mind map (${response.status})`);
        }
        const data: FetchedMindMapData = await response.json();
        
        if (!data || !data.nodes || data.nodes.length === 0) {
            throw new Error("Fetched mind map data is empty or invalid.");
        }
        
        setFetchedMindMapData(data);
        const cacheKey = getCacheKey();
        if (cacheKey) localStorage.setItem(cacheKey, JSON.stringify(data));
        
        const rootNode = data.nodes.find(n => !n.parentId); // Find the root node
        if (rootNode) {
            const { nodes: newFlowNodes, edges: newFlowEdges } = autoLayout(data.nodes, rootNode.id);
            setFlowNodes(newFlowNodes);
            setFlowEdges(newFlowEdges);
        } else {
            console.error("Root node not found in fetched mind map data.");
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

  const showFetchButton = selectedGradeId && selectedCurriculumId && !fetchedMindMapData && isOnline && !isLoading;


  const handleNodeClick = useCallback((event: React.MouseEvent, node: VisualMindMapNodeType) => {
    console.log('Node clicked:', node);
    toast({
        title: `Node Clicked: ${node.data.label}`,
        description: `ID: ${node.id}, Type: ${node.data.nodeType}`,
    });
  }, [toast]);


  return (
    <div className="space-y-6 flex flex-col" style={{ height: 'calc(100vh - 120px)' }}> {/* Adjust height as needed */}
      <Card className="shadow-xl shrink-0">
        <CardHeader className="text-center">
          <div className="inline-block mx-auto bg-primary/10 p-3 rounded-full mb-2">
            <Share2 className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl">Interactive Physics Mind Maps</CardTitle>
          <CardDescription>
            Visualize topics and their connections. Select a grade and curriculum to view a mind map.
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
      
      <div className="flex-grow min-h-[400px]">
        {(selectedGradeId && selectedCurriculumId) ? (
            <VisualMindMap
                initialNodes={flowNodes}
                initialEdges={flowEdges}
                isLoading={isLoading}
                error={mindMapError}
                onNodeClick={handleNodeClick}
                gradeName={displayTitle}
                className="h-full w-full"
            />
        ) : (
          !isLoading && ( // Only show placeholder if not loading something else
            <Card className="border-dashed flex-grow h-full">
                <CardContent className="text-center py-10 text-muted-foreground flex flex-col items-center justify-center h-full">
                    <Map className="mx-auto h-12 w-12 mb-4" />
                    <p>Please select a grade and curriculum to view its mind map.</p>
                </CardContent>
            </Card>
          )
        )}
        {isLoading && ( // Global loading indicator if fetching map data
            <div className="flex items-center justify-center h-full min-h-[400px] text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                <span className="ml-2">Loading mind map...</span>
            </div>
        )}
      </div>
    </div>
  );
}

    