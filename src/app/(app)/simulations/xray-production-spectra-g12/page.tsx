
// src/app/(app)/simulations/xray-production-spectra-g12/page.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Construction, Activity } from "lucide-react";
import Link from "next/link";

export default function XrayProductionSpectraG12Page() {
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
            <Activity className="h-8 w-8 text-primary" /> {/* Represents X-ray detection/machine */}
            G12: X-Ray Production & Spectra
          </CardTitle>
          <CardDescription>
            STBB Aligned: Unit 6 - Atomic Spectra. Conceptual animation of X-ray production, continuous & characteristic X-rays, Bragg's Law.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Construction className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Feature Under Advanced Development</p>
          <p className="text-sm text-muted-foreground mt-2">
            This conceptual animation/simulation will feature:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside mt-1 inline-block text-left">
            <li>Animation of high-energy electrons bombarding a metal target.</li>
            <li>Visualization of continuous spectrum (Bremsstrahlung) and characteristic X-ray peaks.</li>
            <li>Explanation of electron transitions causing characteristic X-rays.</li>
            <li>Introduction to Bragg's Law for X-ray diffraction (conceptual).</li>
            <li>Controls for accelerating voltage and target material (conceptual).</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
