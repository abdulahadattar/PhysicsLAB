
// src/app/(app)/simulations/blackbody-radiation-g12/page.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Construction, LineChart } from "lucide-react";
import Link from "next/link";

export default function BlackbodyRadiationG12Page() {
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
            <LineChart className="h-8 w-8 text-primary" />
            G12: Blackbody Radiation Curve Lab
          </CardTitle>
          <CardDescription>
            STBB Aligned: Unit 5 - Dawn of Modern Physics. Interactive graph of blackbody radiation spectrum. Adjust temperature and observe changes.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Construction className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Feature Under Advanced Development</p>
          <p className="text-sm text-muted-foreground mt-2">
            This simulation will feature:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside mt-1 inline-block text-left">
            <li>An interactive graph showing intensity vs. wavelength (or frequency).</li>
            <li>Slider to adjust the temperature of the blackbody.</li>
            <li>Real-time updates to the radiation curve (Planck's Law).</li>
            <li>Visualization of Wien's Displacement Law (peak wavelength shift).</li>
            <li>Comparison with classical Rayleigh-Jeans law (ultraviolet catastrophe).</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
