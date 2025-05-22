import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle, Clock, Zap } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";

export default function DailyQuizPage() {
  const currentQuestion = {
    id: 1,
    text: "Which of the following is a scalar quantity?",
    options: ["Velocity", "Acceleration", "Force", "Speed"],
    answer: "Speed",
    explanation: "Speed is a scalar quantity as it only has magnitude, whereas velocity, acceleration, and force are vector quantities having both magnitude and direction."
  };
  const totalQuestions = 10;
  const currentQuestionNumber = 3; // Example

  return (
    <div className="space-y-6">
       <Button variant="outline" asChild size="sm">
        <Link href="/quizzes">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Quizzes
        </Link>
      </Button>
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-3xl">Daily Quiz Challenge</CardTitle>
              <CardDescription>Today's 10 MCQs to test your physics knowledge.</CardDescription>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground flex items-center"><Clock className="mr-1 h-4 w-4"/>Time Remaining: 08:32</p>
              <p className="text-sm text-muted-foreground flex items-center"><Zap className="mr-1 h-4 w-4 text-yellow-500"/>Streak: 5 days</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
            <div className="mb-4">
                <div className="flex justify-between text-sm text-muted-foreground mb-1">
                    <span>Question {currentQuestionNumber} of {totalQuestions}</span>
                    <span>Score: 20</span>
                </div>
                <Progress value={(currentQuestionNumber / totalQuestions) * 100} className="w-full h-2" />
            </div>

          <Card className="bg-card">
            <CardHeader>
                <CardTitle className="text-xl">Question {currentQuestionNumber}:</CardTitle>
                <p className="text-md pt-2">{currentQuestion.text}</p>
            </CardHeader>
            <CardContent>
              <RadioGroup defaultValue="" className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border rounded-md hover:bg-secondary/50 transition-colors">
                    <RadioGroupItem value={option.toLowerCase().replace(/\s/g, '-')} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Placeholder for answer feedback */}
          {/* <Card className="mt-4 bg-green-50 border-green-200">
            <CardHeader className="flex flex-row items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600"/>
                <CardTitle className="text-lg text-green-700">Correct!</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-green-700">
                <p><strong>Explanation:</strong> {currentQuestion.explanation}</p>
            </CardContent>
          </Card> */}
          
          <div className="mt-6 flex justify-between">
            <Button variant="outline">Previous Question</Button>
            <Button>Next Question / Submit</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
