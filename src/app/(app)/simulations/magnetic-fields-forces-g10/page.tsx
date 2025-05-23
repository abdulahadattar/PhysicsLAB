
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Construction, Magnet } from "lucide-react";
import Link from "next/link";

export default function MagneticFieldsForcesG10Page() {
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
            Magnetic Fields & Motor Principle
          </CardTitle>
          <CardDescription>
            Grade 10 - STBB. Visualize magnetic fields and simulate the force on a current-carrying wire in a magnetic field (motor principle).
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Construction className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">This Simulation is Under Development.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Soon, you'll be able to:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside mt-1 inline-block text-left">
            <li>Visualize magnetic field lines around bar magnets and current-carrying wires/coils.</li>
            <li>Place virtual compasses to see field direction.</li>
            <li>Adjust current strength and magnetic field strength.</li>
            <li>Observe the force on a current-carrying conductor (motor effect).</li>
            <li>Explore basics of electromagnetic induction.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
