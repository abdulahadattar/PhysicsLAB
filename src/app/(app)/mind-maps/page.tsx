
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Loader2, Map, Brain, WifiOff, AlertTriangle, Share2, RefreshCw } from "lucide-react"; // Added RefreshCw
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { StudyGrade, Chapter } from '@/lib/types';
import { generateMindMapData, type GenerateMindMapInput, type GenerateMindMapOutput, type MindMapNode as AIMindMapNode } from '@/ai/flows/generate-mind-map-flow';

import VisualMindMap, { type VisualMindMapNodeType, type VisualMindMapEdgeType } from '@/components/mind-maps/visual-mind-map'; // Updated import
import type { Node as ReactFlowNode, Edge as ReactFlowEdge, Position } from '@xyflow/react'; // Kept for autoLayout internal types
import type { CustomNodeData } from '@/components/mind-maps/custom-mindmap-node';


const NODE_WIDTH = 180; // Adjusted for CustomMindMapNode
const NODE_HEIGHT = 60;  // Adjusted for CustomMindMapNode
const HORIZONTAL_SPACING = 60;
const VERTICAL_SPACING = 80;


function autoLayout(aiNodes: AIMindMapNode[], rootNodeId: string): { nodes: VisualMindMapNodeType[], edges: VisualMindMapEdgeType[] } {
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

    function determineNodeType(aiNode: AIMindMapNode, level: number): CustomNodeData['nodeType'] {
        if (level === 0) return 'root';
        if (level === 1) return 'chapter';
        return 'subtopic'; // Default for deeper levels
    }

    // Recursive layout function
    function layout(nodeId: string, currentX: number, currentY: number, level: number): { width: number, newY: number } {
        const aiNode = aiNodes.find(n => n.id === nodeId);
        if (!aiNode) return { width: 0, newY: currentY };

        const children = childrenMap.get(nodeId) || [];
        let subtreeWidth = 0;
        let maxYInSubtree = currentY + NODE_HEIGHT;

        if (children.length > 0) {
            let childStartX = currentX;
            const childrenY = currentY + NODE_HEIGHT + VERTICAL_SPACING;
            
            const childrenLayouts = children.map(childId => layout(childId, childStartX, childrenY, level + 1));
            
            let currentChildXOffset = 0;
            childrenLayouts.forEach((childLayout, index) => {
                const childAiNode = aiNodes.find(n => n.id === children[index]);
                 if (childAiNode) {
                    const childNode = flowNodes.find(fn => fn.id === children[index]);
                    if (childNode) {
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
        
        const nodeX = currentX + (subtreeWidth / 2) - (NODE_WIDTH / 2);

        flowNodes.push({
            id: nodeId,
            type: 'customMindMapNode', // Use the custom node type
            data: { 
                label: aiNode.label,
                nodeType: determineNodeType(aiNode, level)
            },
            position: { x: nodeX, y: currentY }, // Position will be centered by parent
             sourcePosition: 'bottom' as Position, // Explicitly cast
             targetPosition: 'top' as Position,    // Explicitly cast
            style: { width: NODE_WIDTH, height: 'auto' }, // Height auto for dynamic content
        });
        
        children.forEach(childId => {
            flowEdges.push({
                id: `e-${nodeId}-${childId}`,
                source: nodeId,
                target: childId,
                type: 'smoothstep', // defaultEdgeOptions will apply from VisualMindMap
                animated: level < 1, // Animate edges from root/chapter
            });
        });
        
        return { width: subtreeWidth, newY: maxYInSubtree };
    }

    const { width: totalWidth } = layout(rootNodeId, 0, 50, 0);
    
    // Center the root node based on total width; children positions are relative
    const root FlowNode = flowNodes.find(n => n.id === rootNodeId);
    if (rootFlowNode) {
        const initialRootX = rootFlowNode.position.x;
        const xOffset = -initialRootX; // Center based on its own subtree positioning for now
        
        // Adjust all node positions to center the graph loosely
        // More sophisticated centering might consider the viewport.
        const minX = Math.min(...flowNodes.map(n => n.position.x));
        flowNodes.forEach(n => {
            n.position.x -= minX - 50; // Shift so leftmost node is at x=50
        });
    }
    
    return { nodes: flowNodes, edges: flowEdges };
}


export default function MindMapsPage() {
  const { toast } = useToast();
  const [studyGrades, setStudyGrades] = useState<StudyGrade[]>([]);
  const [selectedGradeId, setSelectedGradeId] = useState<string | null>(null);
  
  const [aiMindMapOutput, setAiMindMapOutput] = useState<GenerateMindMapOutput | null>(null);
  const [flowNodes, setFlowNodes] = useState<VisualMindMapNodeType[]>([]);
  const [flowEdges, setFlowEdges] = useState<VisualMindMapEdgeType[]>([]);

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
        setAiMindMapOutput(parsedData);
        const { nodes: newFlowNodes, edges: newFlowEdges } = autoLayout(parsedData.nodes, `grade-${gradeId}`);
        setFlowNodes(newFlowNodes);
        setFlowEdges(newFlowEdges);
        return true;
      }
    } catch (e) {
      console.error("Failed to load mind map from cache:", e);
      localStorage.removeItem(`mindMap-${gradeId}`); 
    }
    return false;
  }, []);

  useEffect(() => {
    if (selectedGradeId) {
      setAiMindMapOutput(null); 
      setFlowNodes([]); setFlowEdges([]); 
      const loadedFromCache = loadMindMapFromCache(selectedGradeId);
      if (!loadedFromCache && isOnline) {
        // Wait for button press
      } else if (!loadedFromCache && !isOnline) {
         toast({ title: "Offline", description: "No cached mind map for this grade. Connect to generate one."});
      }
    }
  }, [selectedGradeId, loadMindMapFromCache, isOnline, toast]);

  const handleGenerateMindMap = async (forceRegenerate = false) => {
    if (!selectedGradeId) {
      toast({ title: "Select a Grade", description: "Please select a grade to generate a mind map.", variant: "destructive" });
      return;
    }
    if (!isOnline) {
      toast({ title: "Offline", description: "Mind map generation requires an internet connection.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setError(null); // Clear previous errors
    if (forceRegenerate || !loadMindMapFromCache(selectedGradeId)) {
        try {
            const selectedGradeObject = studyGrades.find(g => g.id === selectedGradeId);
            if (!selectedGradeObject) {
                toast({ title: "Error", description: "Selected grade details not found.", variant: "destructive" });
                setIsLoading(false);
                setError("Selected grade details not found.");
                return;
            }
            const input: GenerateMindMapInput = {
                gradeId: selectedGradeObject.id,
                gradeName: selectedGradeObject.name,
                chapters: selectedGradeObject.chapters.map(c => ({ id: c.id, name: c.name })),
            };
            const response: GenerateMindMapOutput = await generateMindMapData(input);
            
            if (!response || !response.nodes || response.nodes.length === 0) {
                throw new Error("AI returned empty or invalid mind map data.");
            }

            setAiMindMapOutput(response);
            localStorage.setItem(`mindMap-${selectedGradeId}`, JSON.stringify(response));
            const { nodes: newFlowNodes, edges: newFlowEdges } = autoLayout(response.nodes, `grade-${selectedGradeId}`);
            setFlowNodes(newFlowNodes);
            setFlowEdges(newFlowEdges);
        } catch (error) {
            console.error("Error generating mind map:", error);
            const errorMsg = error instanceof Error ? error.message : "Could not generate the mind map.";
            setError(errorMsg);
            toast({ title: "Mind Map Generation Error", description: errorMsg, variant: "destructive" });
            setAiMindMapOutput(null); setFlowNodes([]); setFlowEdges([]); 
        }
    }
    setIsLoading(false);
  };

  const selectedGradeName = studyGrades.find(g => g.id === selectedGradeId)?.name || "";
  const showGenerateButton = selectedGradeId && !aiMindMapOutput && isOnline && !isLoading;
  const showRegenerateButton = selectedGradeId && aiMindMapOutput && isOnline && !isLoading;
  const [error, setError] = useState<string | null>(null);


  const handleNodeClick = useCallback((event: React.MouseEvent, node: VisualMindMapNodeType) => {
    console.log('Node clicked:', node);
    toast({
        title: `Node Clicked: ${node.data.label}`,
        description: `ID: ${node.id}, Type: ${node.data.nodeType}`,
    });
  }, [toast]);


  return (
    <div className="space-y-6 flex flex-col" style={{ height: 'calc(100vh - 120px)' }}> 
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
            <Select onValueChange={setSelectedGradeId} value={selectedGradeId || undefined}>
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
      
      <div className="flex-grow min-h-[400px]">
        {selectedGradeId && (
            <VisualMindMap
                initialNodes={flowNodes}
                initialEdges={flowEdges}
                isLoading={isLoading}
                error={error}
                onNodeClick={handleNodeClick}
                gradeName={selectedGradeName}
                className="h-full w-full"
            />
        )}
        {!selectedGradeId && !isLoading && (
            <Card className="border-dashed flex-grow h-full">
                <CardContent className="text-center py-10 text-muted-foreground flex flex-col items-center justify-center h-full">
                    <Map className="mx-auto h-12 w-12 mb-4" />
                    <p>Please select a grade to view or generate its mind map.</p>
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}
