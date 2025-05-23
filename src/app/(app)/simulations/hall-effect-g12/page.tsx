
// src/app/(app)/simulations/hall-effect-g12/page.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Construction, Magnet } from "lucide-react";
import Link from "next/link";

export default function HallEffectG12Page() {
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
            <Magnet className="h-8 w-8 text-primary" />
            G12: Hall Effect Simulator
          </CardTitle>
          <CardDescription>
            STBB Aligned: Unit 4 - Electromagnetism. Visualize force on charge carriers in a conductor in a magnetic field, leading to Hall voltage. Explore material properties.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Construction className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Feature Under Advanced Development</p>
          <p className="text-sm text-muted-foreground mt-2">
            This simulation will feature:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside mt-1 inline-block text-left">
            <li>Visualization of a conductor carrying current in a magnetic field.</li>
            <li>Animation of charge carrier deflection (electrons/holes).</li>
            <li>Display of Hall voltage buildup.</li>
            <li>Controls for current, magnetic field strength, and material type (n-type/p-type).</li>
            <li>Calculation of Hall coefficient.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
