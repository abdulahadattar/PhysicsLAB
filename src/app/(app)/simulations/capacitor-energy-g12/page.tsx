
// src/app/(app)/simulations/capacitor-energy-g12/page.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Construction, BatteryCharging } from "lucide-react";
import Link from "next/link";

export default function CapacitorEnergyG12Page() {
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
            <BatteryCharging className="h-8 w-8 text-primary" />
            G12: Energy Stored in a Capacitor
          </CardTitle>
          <CardDescription>
            STBB Aligned: Unit 2 - Electrostatics. Calculate and visualize the energy stored in a capacitor (U = 1/2 CV^2) with interactive parameters.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Construction className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Feature Under Advanced Development</p>
          <p className="text-sm text-muted-foreground mt-2">
            This simulation will feature:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside mt-1 inline-block text-left">
            <li>Interactive controls for capacitance (C) and voltage (V).</li>
            <li>Real-time calculation and display of stored energy (U).</li>
            <li>Visual representation of energy storage (e.g., filling animation).</li>
            <li>Graphs showing U vs. C and U vs. V.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
