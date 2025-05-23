
// src/app/(app)/simulations/capacitor-networks-g12/page.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Construction, Network } from "lucide-react";
import Link from "next/link";

export default function CapacitorNetworksG12Page() {
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
            G12: Capacitor Networks Analysis
          </CardTitle>
          <CardDescription>
            STBB Aligned: Unit 2 - Electrostatics. Analyze complex series/parallel capacitor combinations, calculating equivalent capacitance, charge, and voltage distribution.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Construction className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Feature Under Advanced Development</p>
          <p className="text-sm text-muted-foreground mt-2">
            This simulation will feature:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside mt-1 inline-block text-left">
            <li>Interactive building or selection of series/parallel capacitor networks.</li>
            <li>Calculation and display of equivalent capacitance.</li>
            <li>Visualization of charge and voltage distribution across capacitors.</li>
            <li>Problem-solving exercises.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
