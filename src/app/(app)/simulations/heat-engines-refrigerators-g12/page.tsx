// src/app/(app)/simulations/heat-engines-refrigerators-g12/page.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Construction, Cog } from "lucide-react";
import Link from "next/link";

export default function HeatEnginesRefrigeratorsG12Page() {
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
            <Cog className="h-8 w-8 text-primary" />
            G12: Heat Engines & Refrigerators
          </CardTitle>
          <CardDescription>
            STBB Aligned: Unit 1 - Heat & Thermodynamics. Conceptual cycle animations, principles, and coefficient of performance.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Construction className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Feature Under Advanced Development</p>
          <p className="text-sm text-muted-foreground mt-2">
            This simulation will feature:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside mt-1 inline-block text-left">
            <li>Conceptual cycle animations for heat engines.</li>
            <li>Conceptual cycle animations for refrigerators.</li>
            <li>Explanation of working principles.</li>
            <li>Calculation and display of Coefficient of Performance (COP).</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}