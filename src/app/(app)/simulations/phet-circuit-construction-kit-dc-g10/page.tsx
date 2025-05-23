
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Construction, Network } from "lucide-react";
import Link from "next/link";

export default function PhetCircuitConstructionKitDcG10Page() {
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
            <Network className="h-8 w-8 text-primary" />
            PhET: Circuit Construction Kit (DC)
          </CardTitle>
          <CardDescription>
            Grade 10 - Build and test DC circuits. Based on PhET's Virtual Lab.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Construction className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Feature Under Advanced Development</p>
          <p className="text-sm text-muted-foreground mt-2">
            This simulation will allow you to:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside mt-1 inline-block text-left">
            <li>Drag and drop wires, batteries, resistors, bulbs, and switches.</li>
            <li>Visualize current flow with animated electrons.</li>
            <li>Use functional ammeters and voltmeters.</li>
            <li>Explore Ohm's Law and series/parallel circuit rules.</li>
            <li>Engage in "Build a Circuit" challenges.</li>
          </ul>
          <p className="text-xs text-muted-foreground mt-4">STBB Relevance: Ohm's Law, Series Circuits, Parallel Circuits, Kirchhoff's Rules (G10, Unit 4 - Note: STBB G10 textbook likely covers this in Current Electricity, Unit 15).</p>
        </CardContent>
      </Card>
    </div>
  );
}
