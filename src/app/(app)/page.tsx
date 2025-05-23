
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, FlaskConical, Lightbulb, ListChecks } from "lucide-react";
import { APP_NAME, APP_AUTHOR } from "@/lib/constants";

export default function DashboardPage() {
  const features = [
    {
      title: "Interactive Simulations",
      description: "Visualize physics concepts with dynamic simulations.",
      href: "/simulations",
      icon: FlaskConical,
      image: "https://placehold.co/600x400.png", 
      aiHint: "physics simulation"
    },
    {
      title: "Study Materials",
      description: "Access chapter-wise notes and MCQs for grades 9-12.",
      href: "/study-material",
      icon: BookOpen,
      image: "https://placehold.co/600x400.png", 
      aiHint: "textbooks study"
    },
    {
      title: "Quizzes & Assessments",
      description: "Test your knowledge with daily and topic-wise quizzes.",
      href: "/quizzes",
      icon: ListChecks,
      image: "https://placehold.co/600x400.png", 
      aiHint: "quiz test"
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <Card className="shadow-lg animate-in fade-in-0 slide-in-from-top-5 duration-500 ease-out">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Welcome to {APP_NAME}!</CardTitle>
          <CardDescription>Your interactive guide to mastering physics, by {APP_AUTHOR}.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            Explore simulations, dive into study materials, test your knowledge with quizzes, and discover fun facts about the world of physics.
            This platform is designed to help students from grades 9 to 12 align with the Sindh Textbook Board curriculum.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <Card 
            key={feature.title} 
            className="flex flex-col overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 animate-in fade-in-0 slide-in-from-bottom-5 duration-500 ease-out"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="relative h-48 w-full bg-secondary/30 flex items-center justify-center" data-ai-hint={feature.aiHint}>
              {feature.image.startsWith("https://placehold.co") ? (
                <feature.icon className="h-20 w-20 text-primary/70" strokeWidth={1.5}/>
              ) : (
                <Image
                  src={feature.image}
                  alt={feature.title}
                  layout="fill"
                  objectFit="cover"
                />
              )}
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <feature.icon className="h-6 w-6 text-primary" />
                {feature.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-muted-foreground">{feature.description}</p>
            </CardContent>
            <CardContent className="mt-auto">
              <Link href={feature.href} passHref>
                <Button className="w-full">Explore</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-lg animate-in fade-in-0 slide-in-from-bottom-5 duration-500 ease-out" style={{ animationDelay: `${features.length * 100}ms` }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Lightbulb className="h-6 w-6 text-yellow-400" />
            Discover Fun Facts!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Look out for the "Fun Physics Fact!" panel that appears as you navigate the app. Click to get new facts and expand your physics knowledge in an enjoyable way! You can toggle this panel in <Link href="/settings" className="text-primary hover:underline">Settings</Link>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
