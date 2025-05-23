
// src/app/(app)/simulations/ac-power-g12/page.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Construction, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function ACPowerG12Page() {
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
            <TrendingUp className="h-8 w-8 text-primary" />
            G12: Power in AC Circuits
          </CardTitle>
          <CardDescription>
            STBB Aligned: Unit 3 - Current Electricity. Explore Real, Reactive, and Apparent Power in AC circuits. Calculate and visualize Power Factor.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Construction className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Feature Under Advanced Development</p>
          <p className="text-sm text-muted-foreground mt-2">
            This simulation will feature:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside mt-1 inline-block text-left">
            <li>Interactive RLC circuit components for AC.</li>
            <li>Calculation and display of Real Power (P), Reactive Power (Q), and Apparent Power (S).</li>
            <li>Visualization of the power triangle.</li>
            <li>Calculation and display of Power Factor (cos φ).</li>
            <li>Effects of changing R, L, C on power parameters.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
