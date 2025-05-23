
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Construction, Orbit } from "lucide-react";
import Link from "next/link";

export default function OrbitalMechanicsPage() {
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
            Orbital Mechanics Explorer
          </CardTitle>
          <CardDescription>
            Grade 9/10 - STBB. Explore how Earth (or a satellite) orbits a central body like the Sun. Adjust parameters like initial velocity and distance to observe effects on the orbit's shape and period. (Conceptual Simulation)
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Construction className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">This Simulation is Under Development.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Soon, you'll be able to:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside mt-1 inline-block text-left">
            <li>Visualize a planet orbiting a star in 2D.</li>
            <li>Adjust initial tangential velocity of the planet using a slider.</li>
            <li>Adjust the initial radial distance from the star using a slider.</li>
            <li>Observe changes in the orbit's shape (e.g., circular, elliptical, escape trajectory).</li>
            <li>See conceptual representations of gravitational force and velocity vectors.</li>
            <li>Display the orbital period (conceptual).</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
    