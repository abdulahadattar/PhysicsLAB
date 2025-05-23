
"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, HelpCircle, RefreshCw, CheckCircle, XCircle, Sigma } from "lucide-react";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Problem {
  id: string;
  value: string; // The number or expression
  type: 'count_sig_figs' | 'to_scientific_notation' | 'from_scientific_notation' | 'round_sig_figs';
  instruction: string;
  answer: string | number; // Correct answer (string for scientific notation, number for count)
  sigFigsToRound?: number; // For rounding problems
  explanation?: string; // Optional brief explanation of the rule applied
}

// More comprehensive problem set
const G9_PROBLEMS: Problem[] = [
  // Counting Significant Figures
  { id: "sf1", value: "3.005", type: "count_sig_figs", instruction: "How many significant figures are in 3.005?", answer: 4, explanation: "All non-zero digits are significant. Zeros between non-zero digits are significant." },
  { id: "sf2", value: "0.00420", type: "count_sig_figs", instruction: "How many significant figures are in 0.00420?", answer: 3, explanation: "Leading zeros are not significant. Trailing zeros in the decimal portion are significant." },
  { id: "sf3", value: "5000", type: "count_sig_figs", instruction: "How many significant figures are in 5000 (assume least precise)?", answer: 1, explanation: "Trailing zeros in a whole number without a decimal point are ambiguous. Typically, assume they are not significant unless indicated otherwise (e.g., by scientific notation or a decimal point)." },
  { id: "sf4", value: "5000.", type: "count_sig_figs", instruction: "How many significant figures are in 5000. (note the decimal)?", answer: 4, explanation: "Trailing zeros are significant if the number contains a decimal point." },
  { id: "sf5", value: "1.20 x 10^3", type: "count_sig_figs", instruction: "How many significant figures are in 1.20 x 10^3?", answer: 3, explanation: "For numbers in scientific notation, all digits in the coefficient are significant." },
  { id: "sf6", value: "100.0", type: "count_sig_figs", instruction: "How many significant figures are in 100.0?", answer: 4, explanation: "Trailing zeros in the decimal portion are significant." },
  { id: "sf7", value: "0.070600", type: "count_sig_figs", instruction: "How many significant figures are in 0.070600?", answer: 5, explanation: "Leading zeros are not significant. Zeros between non-zeros and trailing zeros in decimal part are significant."},

  // To Scientific Notation (Expected format: X.YeZ or X.Ye+Z or X.Ye-Z, case-insensitive E)
  { id: "sn1", value: "45000", type: "to_scientific_notation", instruction: "Convert 45000 to scientific notation (e.g., 1.2e3 or 1.2e+3).", answer: "4.5e4", explanation: "Move decimal 4 places left: 4.5 x 10^4." },
  { id: "sn2", value: "0.00078", type: "to_scientific_notation", instruction: "Convert 0.00078 to scientific notation (e.g., 1.2e-3).", answer: "7.8e-4", explanation: "Move decimal 4 places right: 7.8 x 10^-4." },
  { id: "sn3", value: "234.56", type: "to_scientific_notation", instruction: "Convert 234.56 to scientific notation.", answer: "2.3456e2", explanation: "Move decimal 2 places left: 2.3456 x 10^2." },
  { id: "sn4", value: "602200000000000000000000", type: "to_scientific_notation", instruction: "Convert Avogadro's number (approx.) to scientific notation.", answer: "6.022e23", explanation: "Move decimal 23 places left." },

  // From Scientific Notation (Less emphasized for G9, but good practice)
  { id: "fsn1", value: "3.5e5", type: "from_scientific_notation", instruction: "Convert 3.5e5 to standard form.", answer: "350000", explanation: "Move decimal 5 places right." },
  { id: "fsn2", value: "8.12e-3", type: "from_scientific_notation", instruction: "Convert 8.12e-3 to standard form.", answer: "0.00812", explanation: "Move decimal 3 places left." },

  // Rounding to Significant Figures (Basic)
  { id: "rsf1", value: "12.345", sigFigsToRound: 3, type: "round_sig_figs", instruction: "Round 12.345 to 3 significant figures.", answer: "12.3", explanation: "The 4th digit (4) is less than 5, so the 3rd digit (3) remains unchanged." },
  { id: "rsf2", value: "0.06789", sigFigsToRound: 2, type: "round_sig_figs", instruction: "Round 0.06789 to 2 significant figures.", answer: "0.068", explanation: "Identify the first 2 sig figs (6, 7). The next digit (8) is >= 5, so round up the 7 to 8." },
  { id: "rsf3", value: "499.5", sigFigsToRound: 3, type: "round_sig_figs", instruction: "Round 499.5 to 3 significant figures.", answer: "500", explanation: "The 4th digit (5) causes rounding up. 499 rounds to 500. Using '5.00e2' would clearly show 3 sig figs." },
];

function normalizeScientificNotation(input: string): string | null {
  const sciNotationRegex = /^\s*([+-]?\d+(?:\.\d+)?)\s*(?:[ex])\s*([+-]?\d+)\s*$/i;
  const match = input.trim().match(sciNotationRegex);
  if (!match) return null;

  let coefficient = parseFloat(match[1]);
  let exponent = parseInt(match[2], 10);

  // Basic normalization: ensure one non-zero digit before decimal for coefficient
  // This is a simplified normalization. True normalization is more complex.
  if (coefficient !== 0) {
    while (Math.abs(coefficient) >= 10) {
      coefficient /= 10;
      exponent++;
    }
    while (Math.abs(coefficient) < 1 && coefficient !== 0) {
      coefficient *= 10;
      exponent--;
    }
  }
  // Format to a consistent string like "1.23e+4" or "1.23e-4"
  // Keeping a few decimal places for comparison, actual sig figs depend on original number
  return `${coefficient.toPrecision(4)}e${exponent >= 0 ? '+' : ''}${exponent}`;
}


export default function SigFigsScientificNotationG9Page() {
  const { toast } = useToast();
  const [problemPool, setProblemPool] = useState<Problem[]>(() => G9_PROBLEMS.sort(() => 0.5 - Math.random()));
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState<{ message: string; type: 'correct' | 'incorrect' } | null>(null);

  const currentProblem = useMemo(() => problemPool[currentProblemIndex], [problemPool, currentProblemIndex]);

  const resetProblem = useCallback(() => {
    setUserAnswer("");
    setFeedback(null);
  }, []);

  useEffect(() => {
    resetProblem();
  }, [currentProblemIndex, resetProblem]);

  const handleCheckAnswer = () => {
    if (!userAnswer.trim()) {
      setFeedback({ message: "Please enter an answer.", type: 'incorrect' });
      return;
    }

    let isCorrect = false;
    let correctAnswerDisplay = String(currentProblem.answer);

    if (currentProblem.type === 'count_sig_figs') {
      isCorrect = parseInt(userAnswer, 10) === currentProblem.answer;
    } else if (currentProblem.type === 'to_scientific_notation') {
      const normalizedUserAnswer = normalizeScientificNotation(userAnswer);
      const normalizedCorrectAnswer = normalizeScientificNotation(String(currentProblem.answer));
      isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
      correctAnswerDisplay = String(currentProblem.answer); // Show the simple form
    } else if (currentProblem.type === 'from_scientific_notation') {
      // Direct string comparison after trimming, or could parse and compare floats
      isCorrect = userAnswer.trim() === String(currentProblem.answer).trim();
    } else if (currentProblem.type === 'round_sig_figs') {
      isCorrect = userAnswer.trim() === String(currentProblem.answer).trim();
    }

    if (isCorrect) {
      setFeedback({ message: "Correct! Well done.", type: 'correct' });
      toast({ title: "Correct!", description: currentProblem.explanation || "Good job!" });
    } else {
      const feedbackMsg = `Incorrect. The correct answer is: ${correctAnswerDisplay}. ${currentProblem.explanation || ''}`;
      setFeedback({ message: feedbackMsg, type: 'incorrect' });
      toast({ title: "Incorrect", description: `The correct answer was ${correctAnswerDisplay}.`, variant: "destructive" });
    }
  };

  const handleNextProblem = () => {
    setCurrentProblemIndex((prevIndex) => (prevIndex + 1) % problemPool.length);
    if (currentProblemIndex === problemPool.length - 1) { // Reshuffle if end of pool reached
        setProblemPool(G9_PROBLEMS.sort(() => 0.5 - Math.random()));
    }
  };

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
              <CardTitle className="text-3xl flex items-center gap-2">
                <Sigma className="h-7 w-7 text-primary"/>G9: Sig Figs &amp; Sci Notation
              </CardTitle>
              <CardDescription>
                Practice identifying significant figures and converting to/from scientific notation.
              </CardDescription>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon"><HelpCircle className="h-5 w-5"/></Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 text-sm">
                <h4 className="font-medium leading-none mb-2">How to Use</h4>
                <ul className="list-disc pl-4 text-muted-foreground space-y-1">
                  <li>Read the instruction and the given number.</li>
                  <li>For "count significant figures", enter the number of sig figs.</li>
                  <li>For "to scientific notation", enter in the format X.YeZ (e.g., 1.23e4 or 1.23e-5).</li>
                  <li>For "from scientific notation", enter the standard decimal number.</li>
                  <li>For "round to X sig figs", enter the rounded number.</li>
                  <li>Click "Check Answer", then "Next Problem".</li>
                </ul>
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Card className="bg-secondary/30">
            <CardContent className="p-6 space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{currentProblem.instruction}</p>
              <p className="text-3xl font-bold text-primary text-center my-4 select-all bg-background p-3 rounded-md">
                {currentProblem.value}
              </p>
              {currentProblem.type === "round_sig_figs" && (
                <p className="text-sm text-center text-muted-foreground">(Round to {currentProblem.sigFigsToRound} significant figures)</p>
              )}
            </CardContent>
          </Card>
          
          <div>
            <Label htmlFor="user-answer" className="text-base">Your Answer:</Label>
            <Input
              id="user-answer"
              type={currentProblem.type === 'count_sig_figs' ? "number" : "text"}
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder={
                currentProblem.type === 'count_sig_figs' ? "Enter count (e.g., 3)" :
                currentProblem.type === 'to_scientific_notation' ? "e.g., 1.23e-4" :
                "Enter number"
              }
              className="text-lg mt-1"
              onKeyPress={(event) => {
                if (event.key === 'Enter' && (!feedback || feedback.type === 'incorrect')) {
                  handleCheckAnswer();
                }
              }}
              disabled={feedback?.type === 'correct'}
            />
          </div>

          {feedback && (
            <Alert variant={feedback.type === 'correct' ? "default" : "destructive"} 
                   className={feedback.type === 'correct' ? 
                              "bg-green-50 border-green-300 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300 text-green-700" 
                              : ""}>
              {feedback.type === 'correct' ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              <AlertTitle>{feedback.type === 'correct' ? "Result" : "Feedback"}</AlertTitle>
              <AlertDescription className="whitespace-pre-wrap">{feedback.message}</AlertDescription>
            </Alert>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
                onClick={handleCheckAnswer} 
                className="flex-1" 
                disabled={feedback?.type === 'correct' || !userAnswer.trim()}
            >
              <CheckCircle className="mr-2 h-4 w-4"/> Check Answer
            </Button>
            <Button onClick={handleNextProblem} variant="outline" className="flex-1">
                <RefreshCw className="mr-2 h-4 w-4"/> Next Problem
            </Button>
          </div>
        </CardContent>
        <CardFooter>
            <p className="text-xs text-muted-foreground">Problem {currentProblemIndex + 1} of {problemPool.length}. Problems shuffle after a full cycle.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
