
// src/app/(app)/simulations/wave-particle-duality-g12/page.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Construction, Waves } from "lucide-react";
import Link from "next/link";

export default function WaveParticleDualityG12Page() {
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
            <Waves className="h-8 w-8 text-primary" /> {/* Combined with particle idea conceptually */}
            G12: Wave-Particle Duality Visualizer
          </CardTitle>
          <CardDescription>
            STBB Aligned: Unit 5 - Dawn of Modern Physics. Conceptual animation of electron diffraction, demonstrating the wave nature of particles.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Construction className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Feature Under Advanced Development</p>
          <p className="text-sm text-muted-foreground mt-2">
            This conceptual animation will feature:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside mt-1 inline-block text-left">
            <li>Animation of electrons passing through a crystal lattice or double slit.</li>
            <li>Visualization of the resulting diffraction/interference pattern on a screen.</li>
            <li>Explanation of de Broglie wavelength.</li>
            <li>Comparison with light wave diffraction.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
