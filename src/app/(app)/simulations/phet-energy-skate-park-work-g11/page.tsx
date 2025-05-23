
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Construction, PersonStanding, Zap } from "lucide-react";
import Link from "next/link";

export default function PhetEnergySkateParkWorkG11Page() {
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
            <PersonStanding className="h-8 w-8 text-primary mr-1" /> <Zap className="h-7 w-7 text-yellow-400" />
            PhET: Energy Skate Park - Work & Energy
          </CardTitle>
          <CardDescription>
            Grade 11 - Explore work and energy transformations with external forces. Advanced version.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Construction className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Feature Under Advanced Development</p>
          <p className="text-sm text-muted-foreground mt-2">
            This simulation will allow you to:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside mt-1 inline-block text-left">
            <li>Apply external forces and visualize energy added/removed from the system.</li>
            <li>Display instantaneous power delivered by the applied force.</li>
            <li>Engage in a "Power Up" challenge to achieve specific energy/speed goals.</li>
          </ul>
          <p className="text-xs text-muted-foreground mt-4">STBB Relevance: Work-Energy Theorem, Conservation of Energy with non-conservative forces (G11, Unit 2 - Note: Corresponds to STBB G11 Unit 5: Work, Energy and Power).</p>
        </CardContent>
      </Card>
    </div>
  );
}
