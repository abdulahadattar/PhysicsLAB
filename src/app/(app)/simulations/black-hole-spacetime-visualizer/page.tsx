
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Construction, Orbit } from "lucide-react";
import Link from "next/link";

export default function BlackHoleSpacetimeVisualizerPage() {
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
            <Orbit className="h-8 w-8 text-primary" /> 
            Black Hole / Spacetime Curvature Visualizer
          </CardTitle>
          <CardDescription>
            Grade 12 / Advanced - Conceptual simulation of spacetime warping.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12 space-y-4">
          <Construction className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Feature Under Advanced Development</p>
          <div className="text-sm text-muted-foreground text-left inline-block">
            <p className="font-semibold mb-1">Planned Interactive Features:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Place massive objects (stars, black holes) on a 2D representation of spacetime.</li>
              <li>Observe the visual "warping" or "gravitational well" effect around these masses.</li>
              <li>Launch test particles or light rays and see their trajectories bend as they pass near massive objects.</li>
              <li>Conceptually visualize event horizons for black holes.</li>
              <li>(Highly conceptual) Illustrate frame-dragging or gravitational lensing if feasible in 2D.</li>
            </ul>
          </div>
          <p className="text-xs text-muted-foreground mt-4">STBB Relevance: Gravitation, General Relativity concepts (conceptual introduction).</p>
        </CardContent>
      </Card>
    </div>
  );
}
