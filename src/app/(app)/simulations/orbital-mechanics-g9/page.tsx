// src/app/(app)/simulations/orbital-mechanics/page.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Orbit } from "lucide-react";
import Link from "next/link";
import OrbitalMechanicsSim from "/home/user/PhysicsLAB/src/app/(app)/simulations/orbital-mechanics-g9/OrbitalMechanicsSim"; // Adjust path if needed

export default function OrbitalMechanicsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" asChild size="sm">
          <Link href="/simulations">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Simulations
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Orbit className="h-7 w-7 text-primary" />
            Orbital Mechanics Explorer
        </h1>
        {/* Potential for a global help/info icon for the page itself */}
        <div className="w-10 h-10"></div> {/* Placeholder for spacing if no icon */}
      </div>
      
      {/* The main simulation component is now directly rendered */}
      <OrbitalMechanicsSim />

      {/* You can add a separate card for learning objectives or theory if desired */}
      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle>Learning Objectives</CardTitle>
             <CardDescription>
                Grade 9/10 - STBB. Explore how celestial bodies orbit a central mass.
            </CardDescription>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
            <p>After using this simulation, you should be able to:</p>
            <ul className="list-disc list-inside text-muted-foreground">
                <li>Understand that gravity provides the force for orbits.</li>
                <li>See how initial velocity and distance affect an orbit's shape.</li>
                <li>Distinguish between circular, elliptical, and escape trajectories.</li>
                <li>Observe the conceptual relationship between orbital size and period.</li>
            </ul>
             <p className="mt-3 text-xs">
                <strong>Key Concepts:</strong> Newton's Law of Universal Gravitation, Centripetal Force, Orbital Energy.
                The simulation uses scaled units for G and masses.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}