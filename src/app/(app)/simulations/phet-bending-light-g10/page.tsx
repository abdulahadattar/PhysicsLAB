
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Construction, Pipette } from "lucide-react"; // Using Pipette as placeholder for light bending
import Link from "next/link";

export default function PhetBendingLightG10Page() {
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
            <Pipette className="h-8 w-8 text-primary" />
            PhET: Bending Light (Refraction & Reflection)
          </CardTitle>
          <CardDescription>
            Grade 10 - Explore how light bends. Inspired by PhET's Bending Light simulation.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Construction className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Feature Under Advanced Development</p>
          <p className="text-sm text-muted-foreground mt-2">
            This simulation will allow you to:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside mt-1 inline-block text-left">
            <li>Select different media (air, water, glass) with adjustable refractive indices.</li>
            <li>Use a "laser pointer" tool to draw rays and see reflection/refraction.</li>
            <li>Verify Snell's Law with an integrated calculator.</li>
            <li>Visualize the critical angle and total internal reflection.</li>
          </ul>
          <p className="text-xs text-muted-foreground mt-4">STBB Relevance: Reflection, Refraction, Snell's Law, Total Internal Reflection (G10, Unit 3 - Note: STBB G10 textbook likely covers this in Geometrical Optics, Unit 13).</p>
        </CardContent>
      </Card>
    </div>
  );
}
