
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileArchive, Link2, AlertTriangle, Loader2, BookOpen } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { ModelPaper, StudyGrade } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const MODEL_PAPERS_STORAGE_KEY = 'physicsLabModelPapers';

interface GroupedModelPapers {
  [gradeId: string]: {
    gradeName: string;
    years: {
      [year: number]: ModelPaper[];
    };
  };
}

export default function ModelPapersPage() {
  const [modelPapers, setModelPapers] = useState<ModelPaper[]>([]);
  const [groupedPapers, setGroupedPapers] = useState<GroupedModelPapers>({});
  const [studyGrades, setStudyGrades] = useState<StudyGrade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGradesForNames = useCallback(async () => {
    try {
      const res = await fetch('/api/study-materials');
      if (!res.ok) throw new Error('Failed to fetch grades for names');
      const data: StudyGrade[] = await res.json();
      setStudyGrades(data);
      return data;
    } catch (e) {
      console.warn("Could not fetch grade names for model papers:", e);
      return [];
    }
  }, []);

  const groupPapers = useCallback((papers: ModelPaper[], grades: StudyGrade[]): GroupedModelPapers => {
    const grouped: GroupedModelPapers = {};
    const gradeMap = new Map(grades.map(g => [g.id, g.name]));

    papers.forEach(paper => {
      if (!grouped[paper.gradeId]) {
        grouped[paper.gradeId] = {
          gradeName: gradeMap.get(paper.gradeId) || `Grade ID: ${paper.gradeId}`,
          years: {}
        };
      }
      if (!grouped[paper.gradeId].years[paper.year]) {
        grouped[paper.gradeId].years[paper.year] = [];
      }
      grouped[paper.gradeId].years[paper.year].push(paper);
    });
    
    for (const gradeId in grouped) {
        const sortedYears: { [year: number]: ModelPaper[] } = {};
        Object.keys(grouped[gradeId].years)
            .map(Number)
            .sort((a, b) => b - a)
            .forEach(year => {
                sortedYears[year] = grouped[gradeId].years[year].sort((a, b) => a.title.localeCompare(b.title));
            });
        grouped[gradeId].years = sortedYears;
    }
    return grouped;
  }, []);

  const loadModelPapers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const grades = await fetchGradesForNames();
      const storedData = localStorage.getItem(MODEL_PAPERS_STORAGE_KEY);
      const papers = storedData ? JSON.parse(storedData) : [];
      setModelPapers(papers);
      setGroupedPapers(groupPapers(papers, grades.length > 0 ? grades : studyGrades /* fallback to potentially stale grades if fetch failed but we had them */));
    } catch (e) {
      console.error("Error loading model papers from localStorage:", e);
      setError("Could not load model papers. Local data might be corrupted.");
      setModelPapers([]);
      setGroupedPapers({});
    }
    setIsLoading(false);
  }, [fetchGradesForNames, groupPapers, studyGrades]);

  useEffect(() => {
    loadModelPapers();
  }, [loadModelPapers]);

  return (
    <div className="space-y-6">
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <div className="inline-block mx-auto bg-primary/10 p-3 rounded-full mb-2">
             <FileArchive className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl">Model Papers</CardTitle>
          <CardDescription>Access model papers for various boards and grades to aid in exam preparation. Links are managed by your teacher.</CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardContent className="pt-6"> {/* Added pt-6 for padding */}
          {isLoading && (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-3">Loading model papers...</p>
            </div>
          )}
          {error && !isLoading && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error Loading Papers</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {!isLoading && !error && Object.keys(groupedPapers).length === 0 && (
            <p className="text-muted-foreground text-center py-10">
              No model papers have been added by the teacher yet. Please check back later.
            </p>
          )}
          {!isLoading && !error && Object.keys(groupedPapers).length > 0 && (
            <Accordion type="multiple" className="w-full">
              {Object.entries(groupedPapers).map(([gradeId, gradeData]) => (
                <AccordionItem value={gradeId} key={gradeId}>
                  <AccordionTrigger className="text-lg font-semibold hover:no-underline bg-secondary/30 px-4 py-3 rounded-t-md">
                    <div className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary"/>{gradeData.gradeName}</div>
                  </AccordionTrigger>
                  <AccordionContent className="px-2 pt-2 pb-1 border border-t-0 rounded-b-md">
                    {Object.keys(gradeData.years).length > 0 ? (
                      <Accordion type="multiple" className="w-full">
                        {Object.entries(gradeData.years).map(([year, papersInYear]) => (
                          <AccordionItem value={`${gradeId}-${year}`} key={`${gradeId}-${year}`} className="mb-2 border rounded-md overflow-hidden">
                            <AccordionTrigger className="text-md font-medium hover:no-underline bg-card px-3 py-2.5">Year: {year}</AccordionTrigger>
                            <AccordionContent className="p-0">
                              <ul className="divide-y">
                                {papersInYear.map((paper) => (
                                  <li key={paper.id} className="p-3 hover:bg-muted/30">
                                    <div className="flex justify-between items-center gap-2">
                                      <div>
                                        <h4 className="font-semibold text-sm">{paper.title}</h4>
                                        {paper.description && <p className="text-xs text-muted-foreground mb-1">{paper.description}</p>}
                                        <Button asChild variant="link" className="p-0 h-auto text-xs">
                                          <a href={paper.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                                            <Link2 className="h-3 w-3" /> View Paper
                                          </a>
                                        </Button>
                                      </div>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    ) : (
                      <p className="text-muted-foreground text-center p-3">No papers for this grade yet.</p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
