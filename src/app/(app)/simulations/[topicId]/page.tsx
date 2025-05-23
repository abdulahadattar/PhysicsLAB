
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Maximize, Zap, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { SIMULATION_TOPICS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface SimulationPageProps {
  params: { topicId: string };
}

export default function SimulationTopicPage({ params }: SimulationPageProps) {
  const topic = SIMULATION_TOPICS.find(t => t.id === params.topicId);

  if (!topic) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold">Simulation not found</h1>
        <p className="text-muted-foreground">The requested simulation could not be located.</p>
        <Button asChild className="mt-4">
          <Link href="/simulations">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Simulations
          </Link>
        </Button>
      </div>
    );
  }

  // Placeholder for dynamic feedback
  const dynamicFeedback = "As you adjust the sliders, observe how the simulation responds in real-time.";

  return (
    <div className="space-y-6">
      <Button variant="outline" asChild size="sm">
        <Link href="/simulations">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Simulations
        </Link>
      </Button>

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl">{topic.name}</CardTitle>
              <CardDescription>Interactive simulation for Grade {topic.grade}.</CardDescription>
            </div>
            <Button variant="outline" size="icon" aria-label="Fullscreen">
              <Maximize className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-6 overflow-hidden">
            {/* Placeholder for actual simulation. Replace with an iframe or a React component */}
            <Image src={`https://placehold.co/800x450.png`} alt={`${topic.name} Simulation`} width={800} height={450} data-ai-hint="physics interactive diagram" className="object-cover"/>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2"><SlidersHorizontal className="h-5 w-5 text-primary"/>Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="mass-slider">Mass (kg)</Label>
                  <Slider defaultValue={[50]} max={100} step={1} id="mass-slider" aria-label="Mass slider" />
                  <p className="text-xs text-muted-foreground text-center">50 kg</p>
                </div>
                <div>
                  <Label htmlFor="force-slider">Force (N)</Label>
                  <Slider defaultValue={[25]} max={100} step={1} id="force-slider" aria-label="Force slider" />
                   <p className="text-xs text-muted-foreground text-center">25 N</p>
                </div>
                <div>
                  <Label htmlFor="angle-slider">Angle (°)</Label>
                  <Slider defaultValue={[45]} max={90} step={1} id="angle-slider" aria-label="Angle slider" />
                  <p className="text-xs text-muted-foreground text-center">45 °</p>
                </div>
                <Badge variant="secondary" className="w-full justify-center py-2">{dynamicFeedback}</Badge>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2"><Zap className="h-5 w-5 text-primary"/>Explanation & Examples</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h3 className="font-semibold">Concept Explanation:</h3>
                <p className="text-sm text-muted-foreground">
                  This simulation demonstrates {topic.description.toLowerCase()}. Key principles include... (Detailed explanation specific to the topic would go here).
                  For example, in projectile motion, the range is maximized at a 45° launch angle (ignoring air resistance).
                </p>
                <h3 className="font-semibold">Real-world Examples:</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Throwing a ball.</li>
                  <li>A cannon firing a shell.</li>
                  <li>Water flowing from a hose.</li>
                </ul>
                <h3 className="font-semibold">Tips & Tricks:</h3>
                <p className="text-sm text-muted-foreground">
                  Try setting the angle to 90° to see what happens! Notice how changing the mass affects the outcome when air resistance is considered (though not modeled here).
                </p>
              </CardContent>
               <CardFooter>
               </CardFooter>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export async function generateStaticParams() {
  return SIMULATION_TOPICS.map((topic) => ({
    topicId: topic.id,
  }));
}
