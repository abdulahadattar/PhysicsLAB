
// src/app/(app)/simulations/particle-accelerators-g12/page.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Construction, Orbit } from "lucide-react";
import Link from "next/link";

export default function ParticleAcceleratorsG12Page() {
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
            <Orbit className="h-8 w-8 text-primary" /> {/* For particle paths */}
            G12: Particle Accelerators (Conceptual)
          </CardTitle>
          <CardDescription>
            STBB Aligned: Unit 8 - Fundamental Particles. Conceptual animations explaining how cyclotrons and synchrotrons accelerate particles to high energies.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Construction className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Feature Under Advanced Development</p>
          <p className="text-sm text-muted-foreground mt-2">
            These conceptual animations will feature:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside mt-1 inline-block text-left">
            <li>Principle of operation for a Cyclotron (magnetic field, alternating electric field).</li>
            <li>Principle of operation for a Synchrotron (guiding magnets, accelerating cavities).</li>
            <li>Visualization of particle paths and energy gain.</li>
            <li>Applications in research and medicine.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
