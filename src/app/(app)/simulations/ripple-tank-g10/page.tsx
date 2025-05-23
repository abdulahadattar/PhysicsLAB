
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Construction, Waves } from "lucide-react";
import Link from "next/link";

export default function RippleTankG10Page() {
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
            <Waves className="h-8 w-8 text-primary" />
            Ripple Tank Simulation
          </CardTitle>
          <CardDescription>
            Grade 10 - STBB. Observe wave phenomena like reflection, refraction, and diffraction in a simulated ripple tank environment.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Construction className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">This Simulation is Under Development.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Soon, you'll be able to:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside mt-1 inline-block text-left">
            <li>Generate plane and circular waves.</li>
            <li>Adjust wave frequency and amplitude.</li>
            <li>Observe reflection from barriers.</li>
            <li>See refraction through different medium depths (conceptual).</li>
            <li>Visualize diffraction through single and double slits.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
