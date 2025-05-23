
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Construction, Pipette } from "lucide-react";
import Link from "next/link";

export default function DispersionPrismG10Page() {
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
            <Pipette className="h-8 w-8 text-primary" />
            Dispersion of Light (Prism & Rainbow)
          </CardTitle>
          <CardDescription>
            Grade 10 - STBB. Explore how white light disperses into a spectrum through a prism and understand rainbow formation.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Construction className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">This Simulation is Under Development.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Soon, you'll be able to:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside mt-1 inline-block text-left">
            <li>Pass white light through a virtual prism.</li>
            <li>Observe the spectrum of colors.</li>
            <li>Adjust prism properties (e.g., angle, material refractive index - conceptual).</li>
            <li>Simulate rainbow formation through water droplets.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
