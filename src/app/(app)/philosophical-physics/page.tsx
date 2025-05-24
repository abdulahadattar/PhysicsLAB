
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Brain, Loader2, AlertTriangle } from "lucide-react";
import type { PhilosophicalBranch } from '@/lib/types';

// Directly import the JSON data for client-side rendering.
// This avoids an API call for static data.
import philosophicalQuestionsData from '@/data/philosophical-questions.json';

export default function PhilosophicalPhysicsPage() {
  const [questionBranches, setQuestionBranches] = useState<PhilosophicalBranch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadQuestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Use the directly imported JSON data
      const data: PhilosophicalBranch[] = philosophicalQuestionsData;
      if (!data || data.length === 0) {
        setError("No philosophical questions found. The data file might be empty or missing.");
      }
      setQuestionBranches(data);
    } catch (e) {
      console.error("Error loading philosophical questions:", e);
      setError(e instanceof Error ? e.message : "Could not load philosophical questions data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  return (
    <div className="space-y-6">
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <div className="inline-block mx-auto bg-primary/10 p-3 rounded-full mb-2">
             <Brain className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl">Philosophical Physics & Critical Thinking</CardTitle>
          <CardDescription>
            Explore deep, logical, and thought-provoking questions related to various branches of physics.
            These questions are designed to stimulate critical thinking beyond standard curriculum.
          </CardDescription>
        </CardHeader>
      </Card>

      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-3">Loading questions...</p>
        </div>
      )}
      {error && !isLoading && (
        <Card>
            <CardContent className="pt-6">
                <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
                </Alert>
            </CardContent>
        </Card>
      )}

      {!isLoading && !error && questionBranches.length > 0 && (
        <Accordion type="multiple" className="w-full space-y-4">
          {questionBranches.map((branch) => (
            <AccordionItem value={branch.id} key={branch.id} className="border bg-card rounded-lg shadow-sm">
              <AccordionTrigger className="px-6 py-4 text-xl font-semibold hover:no-underline">
                {branch.branchName}
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 pt-0">
                {branch.questions && Array.isArray(branch.questions) && branch.questions.length > 0 ? (
                  <ul className="space-y-3 list-disc list-inside text-muted-foreground">
                    {branch.questions.map((item) => (
                      <li key={item.id} className="pl-2">
                        <p className="font-medium text-foreground">{item.question}</p>
                        {item.hint && <p className="text-xs italic mt-0.5">Hint: {item.hint}</p>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No questions available for this branch yet.</p>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
       {!isLoading && !error && questionBranches.length === 0 && (
         <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
                No philosophical questions loaded. The data file might be empty or there was an issue fetching them.
            </CardContent>
        </Card>
      )}
    </div>
  );
}
