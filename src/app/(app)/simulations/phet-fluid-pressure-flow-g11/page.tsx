
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Construction, Droplets } from "lucide-react"; // Using Droplets for fluid
import Link from "next/link";

export default function PhetFluidPressureFlowG11Page() {
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
            <Droplets className="h-8 w-8 text-primary" />
            PhET: Fluid Pressure and Flow
          </CardTitle>
          <CardDescription>
            Grade 11 - Explore pressure, buoyancy, and fluid flow. Based on PhET.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Construction className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Feature Under Advanced Development</p>
          <p className="text-sm text-muted-foreground mt-2">
            This simulation will allow you to:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside mt-1 inline-block text-left">
            <li>Visualize pressure variations in fluids using color gradients or force arrows.</li>
            <li>Conduct buoyancy experiments with objects of different densities.</li>
            <li>Demonstrate Pascal's Principle in a hydraulic system.</li>
            <li>Animate fluid flow through varying pipe cross-sections (Bernoulli's Principle).</li>
          </ul>
          <p className="text-xs text-muted-foreground mt-4">STBB Relevance: Pressure in Fluids, Pascal's Principle, Archimedes' Principle, Buoyancy, Bernoulli's Principle (G11, Unit 5 - Note: Corresponds to STBB G11 Units 6 & 7: Fluid Statics & Fluid Dynamics).</p>
        </CardContent>
      </Card>
    </div>
  );
}
