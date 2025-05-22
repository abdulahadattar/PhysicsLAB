
"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, HelpCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";

interface SigFigProblem {
  id: number;
  value: string; // The number or calculation as a string
  type: 'count' | 'round' | 'calculate'; // Type of problem
  instruction: string;
  answer: number | string; // Answer might be a count or a rounded string
  sigFigs?: number; // For rounding problems
}

const problems: SigFigProblem[] = [
  { id: 1, value: "12.345", type: "count", instruction: "How many significant figures are in 12.345?", answer: 5 },
  { id: 2, value: "0.00506", type: "count", instruction: "How many significant figures are in 0.00506?", answer: 3 },
  { id: 3, value: "1.000", type: "count", instruction: "How many significant figures are in 1.000?", answer: 4 },
  { id: 4, value: "5000", type: "count", instruction: "How many significant figures are in 5000 (ambiguous)?", answer: 1 }, // Or could state it's ambiguous and explain typical interpretation.
  { id: 5, value: "123.4567", sigFigs:3, type: "round", instruction: "Round 123.4567 to 3 significant figures.", answer: "123" },
  { id: 6, value: "0.045678", sigFigs:2, type: "round", instruction: "Round 0.045678 to 2 significant figures.", answer: "0.046" },
  // Add more problems, including calculation problems if desired
];

export default function SigFigsPracticePage() {
  const { toast } = useToast();
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const currentProblem = useMemo(() => problems[currentProblemIndex], [currentProblemIndex]);

  const handleCheckAnswer = () => {
    if (!userAnswer.trim()) {
      setFeedback("Please enter an answer.");
      return;
    }
    let isCorrect = false;
    if (currentProblem.type === 'count') {
      isCorrect = parseInt(userAnswer, 10) === currentProblem.answer;
    } else if (currentProblem.type === 'round') {
      isCorrect = userAnswer.trim() === currentProblem.answer;
    }

    if (isCorrect) {
      setFeedback("Correct! Well done.");
      toast({ title: "Correct!", description: "Great job on that one." });
    } else {
      setFeedback(`Not quite. The correct answer is ${currentProblem.answer}. Try the next one!`);
      toast({ title: "Incorrect", description: `The correct answer was ${currentProblem.answer}.`, variant: "destructive" });
    }
  };

  const handleNextProblem = () => {
    setUserAnswer("");
    setFeedback(null);
    setCurrentProblemIndex((prevIndex) => (prevIndex + 1) % problems.length);
  };

  useEffect(() => {
    setUserAnswer("");
    setFeedback(null);
  }, [currentProblemIndex]);

  return (
    <div className="space-y-6">
      <Button variant="outline" asChild size="sm">
        <Link href="/simulations">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Simulations
        </Link>
      </Button>

      <Card className="shadow-lg max-w-xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl">Significant Figures Practice</CardTitle>
              <CardDescription>
                Test your knowledge of significant figures. Grade 11 Focus.
              </CardDescription>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon"><HelpCircle className="h-5 w-5"/></Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <h4 className="font-medium leading-none mb-2">How to Use</h4>
                <p className="text-sm text-muted-foreground">
                  1. Read the problem and the number/value provided.
                  <br/>2. Enter your answer in the input field.
                  <br/>3. Click "Check Answer" to see if you're correct.
                  <br/>4. Click "Next Problem" to try another.
                </p>
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Card className="bg-secondary/30">
            <CardContent className="p-6">
              <p className="text-lg font-medium mb-2">Problem: {currentProblem.instruction}</p>
              <p className="text-2xl font-bold text-primary text-center my-4 select-all">{currentProblem.value}</p>
            </CardContent>
          </Card>
          
          <div>
            <Label htmlFor="user-answer">Your Answer</Label>
            <Input
              id="user-answer"
              type={currentProblem.type === 'count' ? "number" : "text"}
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder={currentProblem.type === 'count' ? "Enter count" : "Enter rounded value"}
              className="text-lg"
            />
          </div>

          {feedback && (
            <div className={`p-3 rounded-md text-sm ${feedback.startsWith("Correct") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {feedback}
            </div>
          )}
          
          <div className="flex gap-4">
            <Button onClick={handleCheckAnswer} className="flex-1" disabled={!!feedback && feedback.startsWith("Correct")}>Check Answer</Button>
            <Button onClick={handleNextProblem} variant="outline" className="flex-1">
                <RefreshCw className="mr-2 h-4 w-4"/> Next Problem
            </Button>
          </div>
        </CardContent>
        <CardFooter>
            <p className="text-xs text-muted-foreground">Problem {currentProblemIndex + 1} of {problems.length}</p>
        </CardFooter>
      </Card>
    </div>
  );
}
