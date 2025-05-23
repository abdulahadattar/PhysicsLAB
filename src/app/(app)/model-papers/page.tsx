
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileArchive, Link2, AlertTriangle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { ModelPaper } from '@/lib/types';

const MODEL_PAPERS_STORAGE_KEY = 'physicsLabModelPapers'; // For teacher overrides/additions

export default function ModelPapersPage() {
  const [modelPapers, setModelPapers] = useState<ModelPaper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadModelPapers = useCallback(() => {
    setIsLoading(true);
    setError(null);
    // For now, we'll primarily rely on localStorage managed by the teacher.
    // A future enhancement could fetch a default list from an API.
    try {
      const storedData = localStorage.getItem(MODEL_PAPERS_STORAGE_KEY);
      if (storedData) {
        setModelPapers(JSON.parse(storedData));
      } else {
        setModelPapers([]); // No papers added by teacher yet
      }
    } catch (e) {
      console.error("Error loading model papers from localStorage:", e);
      setError("Could not load model papers. Local data might be corrupted.");
      setModelPapers([]);
    }
    setIsLoading(false);
  }, []);

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
        <CardContent>
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
          {!isLoading && !error && modelPapers.length === 0 && (
            <p className="text-muted-foreground text-center py-10">
              No model papers have been added by the teacher yet. Please check back later.
            </p>
          )}
          {!isLoading && !error && modelPapers.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              {modelPapers.map((paper) => (
                <Card key={paper.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{paper.title}</CardTitle>
                    {paper.description && <CardDescription>{paper.description}</CardDescription>}
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full">
                      <a href={paper.url} target="_blank" rel="noopener noreferrer">
                        <Link2 className="mr-2 h-4 w-4" /> View Paper
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
