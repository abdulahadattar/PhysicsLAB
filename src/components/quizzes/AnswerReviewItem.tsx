typescriptreact
import React from 'react';
import { cn } from '@/lib/utils'; // Assuming a utility for class names
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'; // Example icons

interface AnswerReviewItemProps {
  questionText: string;
  studentAnswer: string | string[]; // Allow single or multiple answers
  correctAnswer: string | string[];
  isCorrect: boolean;
  explanation?: string;
}

const AnswerReviewItem: React.FC<AnswerReviewItemProps> = ({
  questionText,
  studentAnswer,
  correctAnswer,
  isCorrect,
  explanation,
}) => {
  const formatAnswer = (answer: string | string[]): string => {
    if (Array.isArray(answer)) {
      return answer.join(', ');
    }
    return answer;
  };

  return (
    <div className={cn(
      "border rounded-md p-4 mb-4",
      isCorrect ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"
    )}>
      <div className="flex items-center mb-2">
        {isCorrect ? (
          <CheckCircleIcon className="h-6 w-6 text-green-600 mr-2" />
        ) : (
          <XCircleIcon className="h-6 w-6 text-red-600 mr-2" />
        )}
        <h3 className="text-lg font-semibold">{questionText}</h3>
      </div>
      <p className="mb-1">
        <span className="font-medium">Your Answer:</span>{' '}
        <span className={isCorrect ? "text-green-800" : "text-red-800"}>
          {formatAnswer(studentAnswer)}
        </span>
      </p>
      {!isCorrect && (
        <p className="mb-1">
          <span className="font-medium">Correct Answer(s):</span>{' '}
          <span className="text-green-800">
            {formatAnswer(correctAnswer)}
          </span>
        </p>
      )}
      {explanation && (
        <p className="text-sm text-gray-700 mt-2">
          <span className="font-medium">Explanation:</span> {explanation}
        </p>
      )}
    </div>
  );
};

export default AnswerReviewItem;