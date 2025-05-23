
// src/app/(app)/simulations/standard-model-explorer-g12/page.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Construction, BrainCircuit } from "lucide-react";
import Link from "next/link";

export default function StandardModelExplorerG12Page() {
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
            <BrainCircuit className="h-8 w-8 text-primary" /> {/* Abstract for fundamental particles */}
            G12: Standard Model Particle Explorer
          </CardTitle>
          <CardDescription>
            STBB Aligned: Unit 8 - Fundamental Particles. Interactive diagram of the Standard Model: quarks, leptons, bosons. Explore fundamental forces and particle properties.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Construction className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Feature Under Advanced Development</p>
          <p className="text-sm text-muted-foreground mt-2">
            This interactive diagram will feature:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside mt-1 inline-block text-left">
            <li>Visual representation of quarks (up, down, charm, strange, top, bottom).</li>
            <li>Visual representation of leptons (electron, muon, tau, and their neutrinos).</li>
            <li>Visual representation of force carrier bosons (photon, gluon, W/Z bosons, Higgs boson).</li>
            <li>Information on charge, spin, mass (conceptual) for each particle.</li>
            <li>Links between particles and fundamental forces (electromagnetism, strong, weak).</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
