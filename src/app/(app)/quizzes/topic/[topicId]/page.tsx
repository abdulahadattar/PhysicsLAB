import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ListFilter } from "lucide-react";
import Link from "next/link";
import { QUIZ_TOPICS } from "@/lib/constants";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


interface QuizTopicPageProps {
  params: { topicId: string };
}

export default function QuizTopicPage({ params }: QuizTopicPageProps) {
  const topic = QUIZ_TOPICS.find(t => t.id === params.topicId);

  if (!topic) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold">Quiz Topic not found</h1>
        <p className="text-muted-foreground">The requested quiz topic could not be located.</p>
        <Button asChild className="mt-4">
          <Link href="/quizzes">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Quizzes
          </Link>
        </Button>
      </div>
    );
  }
  
  const currentQuestion = {
    id: 1,
    text: "In kinematics, what does a horizontal line on a velocity-time graph represent?",
    options: ["Constant acceleration", "Constant velocity (zero acceleration)", "Increasing acceleration", "Object at rest"],
    answer: "Constant velocity (zero acceleration)",
    explanation: "A horizontal line on a velocity-time graph indicates that the velocity is constant, meaning the acceleration is zero."
  };
  const totalQuestions = 5; // Shorter for topic quizzes
  const currentQuestionNumber = 1;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" asChild size="sm">
          <Link href="/quizzes">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Quizzes
          </Link>
        </Button>
        <div className="w-64">
            <Select defaultValue={topic.id}>
                <SelectTrigger id="topic-filter" aria-label="Select quiz topic">
                    <div className="flex items-center gap-2">
                        <ListFilter className="h-4 w-4"/>
                        <SelectValue placeholder="Select topic" />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    {QUIZ_TOPICS.map(t => (
                         <Link href={`/quizzes/topic/${t.id}`} key={t.id} passHref legacyBehavior>
                            <SelectItem value={t.id}>{t.name}</SelectItem>
                         </Link>
                    ))}
                </SelectContent>
            </Select>
        </div>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl">{topic.name}</CardTitle>
          <CardDescription>Test your understanding of {topic.name.toLowerCase().replace(" quiz","")}.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="mb-4">
                <div className="flex justify-between text-sm text-muted-foreground mb-1">
                    <span>Question {currentQuestionNumber} of {totalQuestions}</span>
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
                    <RadioGroupItem value={option.toLowerCase().replace(/\s/g, '-')} id={`topic-option-${index}`} />
                    <Label htmlFor={`topic-option-${index}`} className="flex-1 cursor-pointer">{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
          
          <div className="mt-6 flex justify-end">
            <Button>Submit Answer & Next</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export async function generateStaticParams() {
  return QUIZ_TOPICS.map((topic) => ({
    topicId: topic.id,
  }));
}
