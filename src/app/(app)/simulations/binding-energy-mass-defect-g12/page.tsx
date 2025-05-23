
// src/app/(app)/simulations/binding-energy-mass-defect-g12/page.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Construction, SigmaSquare } from "lucide-react";
import Link from "next/link";

export default function BindingEnergyMassDefectG12Page() {
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
            <SigmaSquare className="h-8 w-8 text-primary" /> {/* For calculations/formulas */}
            G12: Binding Energy & Mass Defect
          </CardTitle>
          <CardDescription>
            STBB Aligned: Unit 7 - Nuclear Physics. Explore the binding energy curve, calculate mass defect, and understand nuclear stability.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Construction className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Feature Under Advanced Development</p>
          <p className="text-sm text-muted-foreground mt-2">
            This simulation/tool will feature:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside mt-1 inline-block text-left">
            <li>Display of the binding energy per nucleon curve.</li>
            <li>Interactive selection of nuclides to see their position on the curve.</li>
            <li>Calculator for mass defect and binding energy (E=mc^2).</li>
            <li>Explanation of nuclear stability related to the curve (fission/fusion regions).</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
