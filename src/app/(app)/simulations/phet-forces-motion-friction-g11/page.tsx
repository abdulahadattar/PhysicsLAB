
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Construction, GripVertical } from "lucide-react"; // Using GripVertical for friction idea
import Link from "next/link";

export default function PhetForcesMotionFrictionG11Page() {
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
            <GripVertical className="h-8 w-8 text-primary" />
            PhET: Forces and Motion - Friction Focus
          </CardTitle>
          <CardDescription>
            Grade 11 - Explore static and kinetic friction. Inspired by PhET.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Construction className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Feature Under Advanced Development</p>
          <p className="text-sm text-muted-foreground mt-2">
            This simulation will allow you to:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside mt-1 inline-block text-left">
            <li>Visualize applied force, friction forces, normal force, and weight vectors.</li>
            <li>Adjust surfaces or coefficients of friction.</li>
            <li>Plot Applied Force vs. Friction Force graphs to see static/kinetic transitions.</li>
          </ul>
           <p className="text-xs text-muted-foreground mt-4">STBB Relevance: Static Friction, Kinetic Friction, Coefficients of Friction (G11, Unit 1 - Note: STBB G11 textbook typically covers this in Dynamics or Forces).</p>
        </CardContent>
      </Card>
    </div>
  );
}
