
// src/app/(app)/simulations/compton-effect-g12/page.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Construction, Sparkles } from "lucide-react";
import Link from "next/link";

export default function ComptonEffectG12Page() {
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
            <Sparkles className="h-8 w-8 text-primary" />
            G12: Compton Effect Animator
          </CardTitle>
          <CardDescription>
            STBB Aligned: Unit 5 - Dawn of Modern Physics. Conceptual animation of photon-electron scattering, showing wavelength change and energy/momentum transfer.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Construction className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Feature Under Advanced Development</p>
          <p className="text-sm text-muted-foreground mt-2">
            This animation will feature:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside mt-1 inline-block text-left">
            <li>Visualization of an incident photon (X-ray or gamma ray) striking a stationary electron.</li>
            <li>Animation of the scattered photon with increased wavelength (decreased energy).</li>
            <li>Animation of the recoiling electron.</li>
            <li>Display of energy and momentum conservation principles involved.</li>
            <li>Controls for incident photon energy and scattering angle (conceptual).</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
