
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Construction, Waves } from "lucide-react";
import Link from "next/link";

export default function PhetWaveOnAStringG10Page() {
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
            <Waves className="h-8 w-8 text-primary" />
            PhET: Wave on a String
          </CardTitle>
          <CardDescription>
            Grade 10 - Explore transverse waves. Inspired by PhET's Wave on a String.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Construction className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Feature Under Advanced Development</p>
          <p className="text-sm text-muted-foreground mt-2">
            This simulation will allow you to:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside mt-1 inline-block text-left">
            <li>Control wave amplitude, frequency, damping, and tension.</li>
            <li>Clearly display wavelength, period, and wave speed.</li>
            <li>Explore standing waves with fixed/loose end boundary conditions (nodes/antinodes).</li>
            <li>Visually demonstrate wave superposition.</li>
          </ul>
          <p className="text-xs text-muted-foreground mt-4">STBB Relevance: Transverse Waves, Wavelength, Frequency, Amplitude, Speed, Superposition (G10, Unit 1).</p>
        </CardContent>
      </Card>
    </div>
  );
}
