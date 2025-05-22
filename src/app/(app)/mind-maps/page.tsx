
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Loader2, Map, Brain, WifiOff, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { StudyGrade } from '@/lib/types';
import { generateMindMapText, type GenerateMindMapInput, type GenerateMindMapOutput } from '@/ai/flows/generate-mind-map-flow';

export default function MindMapsPage() {
  const { toast } = useToast();
  const [studyGrades, setStudyGrades] = useState<StudyGrade[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [mindMapText, setMindMapText] = useState<string | null>(null);
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
        if (!res.ok) {
          throw new Error(`Failed to fetch grades: ${res.statusText}`);
        }
        const data: StudyGrade[] = await res.json();
        setStudyGrades(data);
      } catch (error) {
        console.error("Error fetching study grades:", error);
        setGradesError(error instanceof Error ? error.message : "Could not load grade information.");
        toast({
          variant: "destructive",
          title: "Error loading grades",
          description: error instanceof Error ? error.message : "Could not load grade information for mind map selection.",
        });
      } finally {
        setIsLoadingGrades(false);
      }
    }
    fetchGrades();
  }, [toast]);

  const handleGenerateMindMap = async () => {
    if (!selectedGrade) {
      toast({
        title: "Select a Grade",
        description: "Please select a grade to generate a mind map.",
        variant: "destructive",
      });
      return;
    }
    if (!isOnline) {
      toast({
        title: "Offline",
        description: "Mind map generation requires an internet connection.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setMindMapText(null);
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
        chapters: selectedGradeObject.chapters.map(c => ({id: c.id, name: c.name})),
       };
      const response: GenerateMindMapOutput = await generateMindMapText(input);
      setMindMapText(response.mindMapText);
    } catch (error) {
      console.error("Error generating mind map:", error);
      toast({
        title: "Mind Map Generation Error",
        description: "Could not generate the mind map. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedGradeName = studyGrades.find(g => g.id === selectedGrade)?.name || "";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <div className="inline-block mx-auto bg-primary/10 p-3 rounded-full mb-2">
            <Map className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl">Physics Mind Maps</CardTitle>
          <CardDescription>
            Visualize topics and their connections for each grade. Select a grade to generate an AI-powered mind map.
          </CardDescription>
        </CardHeader>
      </Card>

      {!isOnline && (
        <Alert variant="destructive">
          <WifiOff className="h-4 w-4" />
          <AlertTitle>You are currently offline</AlertTitle>
          <AlertDescription>
            Mind map generation requires an internet connection. Please connect to use this feature.
          </AlertDescription>
        </Alert>
      )}

      <Card>
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
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{gradesError}</AlertDescription>
            </Alert>
          ) : (
            <Select onValueChange={setSelectedGrade} value={selectedGrade || undefined} disabled={!isOnline}>
              <SelectTrigger className="w-full sm:w-[280px]">
                <SelectValue placeholder="Select a grade level" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Grades</SelectLabel>
                  {studyGrades.map((grade) => (
                    <SelectItem key={grade.id} value={grade.id}>
                      {grade.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
          <Button onClick={handleGenerateMindMap} disabled={isLoading || !selectedGrade || !isOnline || isLoadingGrades}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Brain className="mr-2 h-4 w-4" />}
            {isLoading ? "Generating..." : "Generate Mind Map"}
          </Button>
        </CardContent>
      </Card>

      {mindMapText && (
        <Card>
          <CardHeader>
            <CardTitle>Mind Map for {selectedGradeName}</CardTitle>
            <CardDescription>AI-generated textual mind map of topics and sub-topics.</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="p-4 border rounded-md bg-secondary/30 whitespace-pre-wrap text-sm overflow-x-auto">
              {mindMapText}
            </pre>
          </CardContent>
        </Card>
      )}

      {!isLoading && !mindMapText && selectedGrade && isOnline && (
        <Card className="border-dashed">
          <CardContent className="text-center py-10 text-muted-foreground">
            <Map className="mx-auto h-12 w-12 mb-4" />
            <p>Your generated mind map for {selectedGradeName} will appear here.</p>
          </CardContent>
        </Card>
      )}
       {!isLoading && !selectedGrade && isOnline && (
        <Card className="border-dashed">
          <CardContent className="text-center py-10 text-muted-foreground">
            <p>Please select a grade and click "Generate Mind Map".</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
