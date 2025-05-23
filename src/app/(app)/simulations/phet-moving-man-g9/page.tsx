
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Construction, PersonStanding } from "lucide-react";
import Link from "next/link";

export default function PhetMovingManG9Page() {
  return (
    <div className="space-y-6">
      <Button variant="outline" asChild size="sm">
        <Link href="/simulations">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Simulations
        </Link>
      </Button>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl flex items-center gap-2">
            <PersonStanding className="h-8 w-8 text-primary" />
            PhET: The Moving Man (Kinematics)
          </CardTitle>
          <CardDescription>
            Grade 9 - Explore position, velocity, and acceleration. Replicates the core ideas of PhET's "The Moving Man" simulation.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Construction className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Feature Under Advanced Development</p>
          <p className="text-sm text-muted-foreground mt-2">
            This simulation will allow you to:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside mt-1 inline-block text-left">
            <li>Control a character's position, velocity, and acceleration.</li>
            <li>Observe synchronized P-T, V-T, and A-T graphs in real-time.</li>
            <li>Input values directly or drag the character to see graphical changes.</li>
            <li>Engage in a "Draw the Graph" challenge based on motion descriptions.</li>
          </ul>
           <p className="text-xs text-muted-foreground mt-4">STBB Relevance: Displacement, Velocity, Acceleration, Graphical Analysis of Motion (G9, Unit 2).</p>
        </CardContent>
      </Card>
    </div>
  );
}
