
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Construction, Orbit } from "lucide-react";
import Link from "next/link";

export default function PhetProjectileMotionG9Page() {
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
            PhET: Projectile Motion
          </CardTitle>
          <CardDescription>
            Grade 9 - Launch objects and explore their trajectories. Inspired by PhET's Projectile Motion simulation.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Construction className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Feature Under Advanced Development</p>
          <p className="text-sm text-muted-foreground mt-2">
            This simulation will allow you to:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside mt-1 inline-block text-left">
            <li>Adjust launch angle, initial speed, and mass for various projectiles.</li>
            <li>Toggle air resistance to observe its effects.</li>
            <li>Visualize horizontal and vertical components of velocity and acceleration.</li>
            <li>Play a "Hit the Target" game mode.</li>
            <li>Analyze kinetic, potential, and total mechanical energy during flight.</li>
          </ul>
          <p className="text-xs text-muted-foreground mt-4">STBB Relevance: Projectile Motion, Trajectory, Range, Height, Time of Flight (G9, Unit 2).</p>
        </CardContent>
      </Card>
    </div>
  );
}
