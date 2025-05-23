
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Construction, Projector } from "lucide-react";
import Link from "next/link";

export default function RayDiagramsG10Page() {
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
            <Projector className="h-8 w-8 text-primary" />
            Lens & Mirror Ray Diagram Tool
          </CardTitle>
          <CardDescription>
            Grade 10 - STBB. Interactively draw and explore ray diagrams for spherical mirrors and lenses to understand image formation.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Construction className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">This Simulation is Under Development.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Soon, you'll be able to:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside mt-1 inline-block text-left">
            <li>Select concave/convex mirrors and lenses.</li>
            <li>Adjust object position and size.</li>
            <li>Change focal length of the optical device.</li>
            <li>See principal rays being drawn automatically.</li>
            <li>Observe the characteristics (position, size, nature) of the formed image.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
