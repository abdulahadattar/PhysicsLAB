typescriptreact
"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface QuizNavigationProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: () => void;
  isLastQuestion: boolean;
}

const QuizNavigation: React.FC<QuizNavigationProps> = ({
  currentQuestionIndex,
  totalQuestions,
  onNext,
  onPrevious,
  onSubmit,
  isLastQuestion,
}) => {
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  return (
    <div className="flex flex-col gap-4 mt-8">
      <Progress value={progress} className="w-full" />
      <div className="flex justify-between items-center">
        <Button onClick={onPrevious} disabled={currentQuestionIndex === 0}>
          Previous
        </Button>
        <span>{`Question ${currentQuestionIndex + 1} of ${totalQuestions}`}</span>
        {isLastQuestion ? (
          <Button onClick={onSubmit}>
            Submit
          </Button>
        ) : (
          <Button onClick={onNext}>
            Next
          </Button>
        )}
      </div>
    </div>
  );
};

export default QuizNavigation;