
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Construction, Network } from "lucide-react";
import Link from "next/link";

export default function SimpleCircuitsG10Page() {
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
            Simple Circuit Builder
          </CardTitle>
          <CardDescription>
            Grade 10 - STBB. Build and test simple series and parallel circuits to understand Ohm's law and current flow.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Construction className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">This Simulation is Under Development.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Soon, you'll be able to:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside mt-1 inline-block text-left">
            <li>Drag and drop components (resistors, batteries, wires, switches, light bulbs).</li>
            <li>Connect components to form series and parallel circuits.</li>
            <li>Adjust voltage and resistance values.</li>
            <li>Observe current flow and brightness of bulbs.</li>
            <li>Use virtual ammeters and voltmeters to take readings.</li>
            <li>Verify Ohm's Law and rules for series/parallel circuits.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
