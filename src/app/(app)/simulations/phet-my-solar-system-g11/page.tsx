
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Construction, Orbit } from "lucide-react";
import Link from "next/link";

export default function PhetMySolarSystemG11Page() {
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
            PhET: My Solar System (Gravitation)
          </CardTitle>
          <CardDescription>
            Grade 11 - N-body gravitational simulator. Inspired by PhET.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Construction className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Feature Under Advanced Development</p>
          <p className="text-sm text-muted-foreground mt-2">
            This simulation will allow you to:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside mt-1 inline-block text-left">
            <li>Add multiple celestial bodies, setting mass, initial position, and velocity.</li>
            <li>Visualize dynamic gravitational field lines.</li>
            <li>Display real-time orbital elements (period, semi-major axis, eccentricity).</li>
            <li>Engage in a "Stable Orbit" challenge.</li>
          </ul>
           <p className="text-xs text-muted-foreground mt-4">STBB Relevance: Newton's Law of Universal Gravitation, Gravitational Field, Orbital Motion (G11, Unit 4 - Note: Corresponds to STBB G9 Unit 6 and G11 Unit 4).</p>
        </CardContent>
      </Card>
    </div>
  );
}
