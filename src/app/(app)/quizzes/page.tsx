
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CalendarCheck, LayoutDashboard, Shapes } from "lucide-react";
import Image from "next/image";

export default function QuizzesPage() {
  const quizSections = [
    {
      title: "Daily Quiz Challenge",
      description: "Test yourself with 10 auto-generated MCQs every day. Track your streak!",
      href: "/quizzes/daily",
      icon: CalendarCheck,
      image: "https://placehold.co/600x400.png",
      aiHint: "calendar quiz"
    },
    {
      title: "Topic-wise Quizzes",
      description: "Focus on specific topics with short quizzes. Review answers and explanations.",
      href: "/quizzes/topic/kinematics", // Default to first topic or a selection page
      icon: Shapes,
      image: "https://placehold.co/600x400.png",
      aiHint: "books bulb"
    },
    {
      title: "Performance Dashboard",
      description: "View your progress, scores, weak areas, and performance trends.",
      href: "/quizzes/dashboard",
      icon: LayoutDashboard,
      image: "https://placehold.co/600x400.png",
      aiHint: "charts analytics"
    },
  ];

  return (
    <div className="space-y-8">
      <Card className="animate-in fade-in-0 slide-in-from-top-5 duration-500 ease-out">
        <CardHeader>
          <CardTitle className="text-3xl">Quizzes and Self-Assessment</CardTitle>
          <CardDescription>Sharpen your knowledge with daily challenges, topic-specific quizzes, and track your performance.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {quizSections.map((section, index) => (
          <Card 
            key={section.title} 
            className="flex flex-col overflow-hidden shadow-md hover:shadow-lg transition-shadow animate-in fade-in-0 slide-in-from-bottom-5 duration-500 ease-out"
            style={{ animationDelay: `${index * 100}ms` }}
          >
             <div className="relative h-48 w-full bg-secondary/30 flex items-center justify-center" data-ai-hint={section.aiHint}>
                {section.image.startsWith("https://placehold.co") ? (
                  <section.icon className="h-20 w-20 text-primary/70" strokeWidth={1.5}/>
                ) : (
                  <Image
                      src={section.image}
                      alt={section.title}
                      layout="fill"
                      objectFit="cover"
                  />
                )}
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <section.icon className="h-6 w-6 text-primary" />
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-muted-foreground">{section.description}</p>
            </CardContent>
            <CardContent>
              <Link href={section.href} passHref>
                <Button className="w-full">Go to {section.title.replace(" Challenge","").replace("Quizzes","Quiz")}</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
