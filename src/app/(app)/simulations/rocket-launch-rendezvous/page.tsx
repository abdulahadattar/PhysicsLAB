
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Construction, Rocket } from "lucide-react";
import Link from "next/link";

export default function RocketLaunchRendezvousPage() {
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
            <Rocket className="h-8 w-8 text-primary" /> 
            Rocket Launch & Orbital Rendezvous Simulator
          </CardTitle>
          <CardDescription>
            Grade 11 / 12 - Simulate rocket launches, orbital mechanics, and spacecraft rendezvous.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12 space-y-4">
          <Construction className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Feature Under Advanced Development</p>
          <div className="text-sm text-muted-foreground text-left inline-block">
            <p className="font-semibold mb-1">Planned Interactive Features:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Control rocket thrust, staging (conceptual), and launch angle.</li>
              <li>Achieve stable orbit around a planet (e.g., Earth).</li>
              <li>Visualize orbital parameters (apoapsis, periapsis, velocity).</li>
              <li>Attempt orbital maneuvers (e.g., Hohmann transfer) to reach a target orbit or spacecraft.</li>
              <li>Simulate rendezvous and docking with a space station (conceptual).</li>
              <li>Understand concepts like orbital velocity, escape velocity, and relative motion in space.</li>
              <li>Display fuel consumption and mission time.</li>
            </ul>
          </div>
          <p className="text-xs text-muted-foreground mt-4">STBB Relevance: Dynamics, Gravitation, Conservation of Momentum, Work & Energy.</p>
        </CardContent>
      </Card>
    </div>
  );
}
