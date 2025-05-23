
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Construction, Move } from "lucide-react";
import Link from "next/link";

export default function PhetForcesMotionBasicsG9Page() {
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
            <Move className="h-8 w-8 text-primary" />
            PhET: Forces and Motion Basics
          </CardTitle>
          <CardDescription>
            Grade 9 - Explore net force, friction, and Newton's laws. Based on PhET's Forces and Motion: Basics.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Construction className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Feature Under Advanced Development</p>
          <p className="text-sm text-muted-foreground mt-2">
            This simulation will allow you to:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside mt-1 inline-block text-left">
            <li>Apply forces to objects and observe acceleration.</li>
            <li>View interactive free-body diagrams that update in real-time.</li>
            <li>See calculations for net force and acceleration.</li>
            <li>Adjust coefficients of static and kinetic friction.</li>
            <li>Take on a "Predict the Motion" challenge.</li>
          </ul>
           <p className="text-xs text-muted-foreground mt-4">STBB Relevance: Force, Momentum, Newton's Laws of Motion, Friction (G9, Unit 3).</p>
        </CardContent>
      </Card>
    </div>
  );
}
