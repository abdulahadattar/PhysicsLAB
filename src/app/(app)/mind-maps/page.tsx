
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Loader2, Map, Brain, WifiOff, AlertTriangle, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { StudyGrade } from '@/lib/types';
import { generateMindMapData, type GenerateMindMapInput, type GenerateMindMapOutput, type MindMapNode as AIMindMapNode } from '@/ai/flows/generate-mind-map-flow';

import ReactFlow, {
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    type Node,
    type Edge,
    type Connection,
    Position,
} from 'reactflow';
import 'reactflow/dist/style.css';

const NODE_WIDTH = 170;
const NODE_HEIGHT = 40;
const HORIZONTAL_SPACING = 50;
const VERTICAL_SPACING = 70;


// Helper to arrange nodes in a basic tree layout
function autoLayout(aiNodes: AIMindMapNode[], rootNodeId: string): { nodes: Node[], edges: Edge[] } {
    const flowNodes: Node[] = [];
    const flowEdges: Edge[] = [];
    
    const childrenMap = new Map<string, string[]>();
    aiNodes.forEach(node => {
        if (node.parentId) {
            if (!childrenMap.has(node.parentId)) {
                childrenMap.set(node.parentId, []);
            }
            childrenMap.get(node.parentId)!.push(node.id);
        }
    });

    function layout(nodeId: string, x: number, y: number, level: number): number {
        const aiNode = aiNodes.find(n => n.id === nodeId);
        if (!aiNode) return x;

        const nodeType = level === 0 ? 'input' : (childrenMap.has(nodeId) ? 'default' : 'output');
        
        flowNodes.push({
            id: nodeId,
            data: { label: aiNode.label },
            position: { x, y },
            type: nodeType,
            sourcePosition: Position.Right,
            targetPosition: Position.Left,
            style: { width: NODE_WIDTH, height: NODE_HEIGHT, fontSize: '12px' },
        });

        const children = childrenMap.get(nodeId) || [];
        let currentX = x;
        let cumulativeChildWidth = 0;

        if (children.length > 0) {
            const childrenY = y + NODE_HEIGHT + VERTICAL_SPACING;
            let childXOffset = 0;

            // Calculate total width required for children to center them
            const totalChildrenWidth = children.reduce((acc, childId) => {
                // Estimate child width recursively (simplified here, could be more complex)
                const childNode = aiNodes.find(n => n.id === childId);
                let numGrandchildren = childrenMap.get(childId)?.length || 0;
                if (numGrandchildren === 0 && level < 2) numGrandchildren = 1; // Assume some width for leaf nodes at chapter level
                return acc + (NODE_WIDTH + HORIZONTAL_SPACING) * Math.max(1, numGrandchildren) - HORIZONTAL_SPACING;
            }, 0);
             
            let startXForChildren = x + NODE_WIDTH / 2 - totalChildrenWidth / 2;


            children.forEach((childId, index) => {
                const childAiNode = aiNodes.find(n => n.id === childId);
                 if(childAiNode) {
                    flowEdges.push({
                        id: `e-${nodeId}-${childId}`,
                        source: nodeId,
                        target: childId,
                        type: 'smoothstep',
                        animated: level < 1,
                    });
                    const childWidthWithSpacing = (NODE_WIDTH + HORIZONTAL_SPACING) * Math.max(1, (childrenMap.get(childId)?.length || (level + 1 < 2 ? 1 : 0)));
                    const childStartX = startXForChildren + childXOffset;
                    layout(childId, childStartX, childrenY, level + 1);
                    childXOffset += childWidthWithSpacing;
                 }
            });
             currentX = Math.max(currentX, startXForChildren + childXOffset - HORIZONTAL_SPACING);
        }
        return currentX;
    }

    layout(rootNodeId, 50, 50, 0);
    
    // Basic centering for the entire graph (optional, can be complex)
    if (flowNodes.length > 0) {
        const minX = Math.min(...flowNodes.map(n => n.position.x));
        const maxX = Math.max(...flowNodes.map(n => n.position.x + NODE_WIDTH));
        const graphWidth = maxX - minX;
        const viewportWidth = 800; // Assume a default viewport width for centering
        const xOffset = (viewportWidth - graphWidth) / 2 - minX;

        if (isFinite(xOffset)) {
             flowNodes.forEach(n => n.position.x += xOffset);
        }
    }

    return { nodes: flowNodes, edges: flowEdges };
}


export default function MindMapsPage() {
  const { toast } = useToast();
  const [studyGrades, setStudyGrades] = useState<StudyGrade[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  
  const [mindMapData, setMindMapData] = useState<GenerateMindMapOutput | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingGrades, setIsLoadingGrades] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [gradesError, setGradesError] = useState<string | null>(null);

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

  const loadMindMapFromCache = useCallback((gradeId: string): boolean => {
    try {
      const cachedData = localStorage.getItem(`mindMap-${gradeId}`);
      if (cachedData) {
        const parsedData: GenerateMindMapOutput = JSON.parse(cachedData);
        setMindMapData(parsedData);
        const { nodes: flowNodes, edges: flowEdges } = autoLayout(parsedData.nodes, `grade-${gradeId}`);
        setNodes(flowNodes);
        setEdges(flowEdges);
        return true;
      }
    } catch (e) {
      console.error("Failed to load mind map from cache:", e);
      localStorage.removeItem(`mindMap-${gradeId}`); // Clear corrupted cache
    }
    return false;
  }, [setNodes, setEdges]);

  useEffect(() => {
    if (selectedGrade) {
      setMindMapData(null); // Clear previous map
      setNodes([]); setEdges([]); // Clear flow elements
      const loadedFromCache = loadMindMapFromCache(selectedGrade);
      if (!loadedFromCache && isOnline) {
        // Optionally auto-generate if not in cache and online, or wait for button press
        // For now, we wait for button press to show "Generate" button
      } else if (!loadedFromCache && !isOnline) {
         toast({ title: "Offline", description: "No cached mind map for this grade. Connect to generate one."});
      }
    }
  }, [selectedGrade, loadMindMapFromCache, isOnline, setNodes, setEdges, toast]);

  const handleGenerateMindMap = async (forceRegenerate = false) => {
    if (!selectedGrade) {
      toast({ title: "Select a Grade", description: "Please select a grade to generate a mind map.", variant: "destructive" });
      return;
    }
    if (!isOnline) {
      toast({ title: "Offline", description: "Mind map generation requires an internet connection.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    if (forceRegenerate || !loadMindMapFromCache(selectedGrade)) {
        try {
            const selectedGradeObject = studyGrades.find(g => g.id === selectedGrade);
            if (!selectedGradeObject) {
                toast({ title: "Error", description: "Selected grade details not found.", variant: "destructive" });
                setIsLoading(false);
                return;
            }
            const input: GenerateMindMapInput = {
                gradeId: selectedGradeObject.id,
                gradeName: selectedGradeObject.name,
                chapters: selectedGradeObject.chapters.map(c => ({ id: c.id, name: c.name })),
            };
            const response: GenerateMindMapOutput = await generateMindMapData(input);
            setMindMapData(response);
            localStorage.setItem(`mindMap-${selectedGrade}`, JSON.stringify(response));
            const { nodes: flowNodes, edges: flowEdges } = autoLayout(response.nodes, `grade-${selectedGrade}`);
            setNodes(flowNodes);
            setEdges(flowEdges);
        } catch (error) {
            console.error("Error generating mind map:", error);
            toast({ title: "Mind Map Generation Error", description: "Could not generate the mind map. Please try again.", variant: "destructive" });
            setMindMapData(null); setNodes([]); setEdges([]); // Clear on error
        }
    }
    setIsLoading(false);
  };

  const selectedGradeName = studyGrades.find(g => g.id === selectedGrade)?.name || "";
  const showGenerateButton = selectedGrade && !mindMapData && isOnline;
  const showRegenerateButton = selectedGrade && mindMapData && isOnline;

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  return (
    <div className="space-y-6 flex flex-col" style={{ height: 'calc(100vh - 120px)' }}> {/* Adjust height as needed */}
      <Card className="shadow-xl shrink-0">
        <CardHeader className="text-center">
          <div className="inline-block mx-auto bg-primary/10 p-3 rounded-full mb-2">
            <Share2 className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl">Interactive Physics Mind Maps</CardTitle>
          <CardDescription>
            Visualize topics and their connections. Select a grade to view or generate an AI-powered mind map.
          </CardDescription>
        </CardHeader>
      </Card>

      {!isOnline && (
        <Alert variant="destructive" className="shrink-0">
          <WifiOff className="h-4 w-4" />
          <AlertTitle>You are currently offline</AlertTitle>
          <AlertDescription>
            Mind map generation/regeneration requires an internet connection. Cached maps may be available.
          </AlertDescription>
        </Alert>
      )}

      <Card className="shrink-0">
        <CardHeader>
          <CardTitle>Select Grade</CardTitle>
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
            <Select onValueChange={setSelectedGrade} value={selectedGrade || undefined}>
              <SelectTrigger className="w-full sm:w-[280px]">
                <SelectValue placeholder="Select a grade level" />
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
          {showGenerateButton && (
            <Button onClick={() => handleGenerateMindMap(false)} disabled={isLoading || isLoadingGrades}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Brain className="mr-2 h-4 w-4" />}
              Generate Mind Map
            </Button>
          )}
          {showRegenerateButton && (
            <Button onClick={() => handleGenerateMindMap(true)} variant="outline" disabled={isLoading || isLoadingGrades}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Regenerate Mind Map
            </Button>
          )}
        </CardContent>
      </Card>

      {isLoading && selectedGrade && (
         <Card className="flex-grow flex items-center justify-center">
            <CardContent className="text-center py-10 text-muted-foreground">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
                <p>Generating mind map for {selectedGradeName}...</p>
            </CardContent>
         </Card>
      )}

      {!isLoading && mindMapData && nodes.length > 0 && (
        <Card className="flex-grow flex flex-col min-h-[400px]">
          <CardHeader>
            <CardTitle>{mindMapData.mindMapTitle || `Mind Map for ${selectedGradeName}`}</CardTitle>
            <CardDescription>AI-generated interactive mind map. Drag to pan, scroll to zoom.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow p-0 relative">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              fitView
              attributionPosition="bottom-left"
              className="bg-background rounded-b-lg"
            >
              <Controls />
              <Background />
            </ReactFlow>
          </CardContent>
        </Card>
      )}

      {!isLoading && selectedGrade && !mindMapData && !isOnline && (
        <Card className="border-dashed flex-grow">
          <CardContent className="text-center py-10 text-muted-foreground">
            <WifiOff className="mx-auto h-12 w-12 mb-4" />
            <p>Connect to the internet to generate a mind map for {selectedGradeName}.</p>
          </CardContent>
        </Card>
      )}
      {!isLoading && selectedGrade && !mindMapData && isOnline && !showGenerateButton && !showRegenerateButton && (
         <Card className="border-dashed flex-grow">
            <CardContent className="text-center py-10 text-muted-foreground">
                <p>No cached mind map for {selectedGradeName}. Click "Generate Mind Map" to create one.</p>
            </CardContent>
        </Card>
      )}
       {!isLoading && !selectedGrade && (
        <Card className="border-dashed flex-grow">
          <CardContent className="text-center py-10 text-muted-foreground">
            <Map className="mx-auto h-12 w-12 mb-4" />
            <p>Please select a grade to view or generate its mind map.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

