typescriptreact
import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Question } from '@/lib/types'; // Assuming Question interface is in types.ts

interface QuestionDisplayProps {
  question: Question;
  onAnswerChange: (questionId: string, answer: string | string[] | boolean) => void;
  userAnswer: string | string[] | boolean;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({ question, onAnswerChange, userAnswer }) => {
  const handleSingleChoiceChange = (value: string) => {
    onAnswerChange(question.questionId, value);
  };

  const handleMultipleChoiceChange = (option: string, checked: boolean) => {
    let currentAnswers = Array.isArray(userAnswer) ? userAnswer : [];
    if (checked) {
      currentAnswers = [...currentAnswers, option];
    } else {
      currentAnswers = currentAnswers.filter((item) => item !== option);
    }
    onAnswerChange(question.questionId, currentAnswers);
  };

  const handleShortAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onAnswerChange(question.questionId, e.target.value);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{question.questionText}</h3>
      {question.questionType === 'single-choice' && (
        <RadioGroup onValueChange={handleSingleChoiceChange} value={userAnswer as string}>
          {question.options?.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value={option} id={`option-${question.questionId}-${index}`} />
              <Label htmlFor={`option-${question.questionId}-${index}`}>{option}</Label>
            </div>
          ))}
        </RadioGroup>
      )}
      {question.questionType === 'multiple-choice' && (
        <div className="space-y-2">
          {question.options?.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Checkbox
                id={`option-${question.questionId}-${index}`}
                checked={Array.isArray(userAnswer) && userAnswer.includes(option)}
                onCheckedChange={(checked) => handleMultipleChoiceChange(option, checked as boolean)}
              />
              <Label htmlFor={`option-${question.questionId}-${index}`}>{option}</Label>
            </div>
          ))}
        </div>
      )}
      {question.questionType === 'short-answer' && (
        <div>
          <Label htmlFor={`answer-${question.questionId}`}>Your Answer</Label>
          <Input
            id={`answer-${question.questionId}`}
            value={userAnswer as string}
            onChange={handleShortAnswerChange}
          />
        </div>
      )}
      {/* Add other question types as needed */}
    </div>
  );
};

export default QuestionDisplay;