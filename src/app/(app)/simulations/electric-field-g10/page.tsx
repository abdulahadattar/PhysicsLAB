
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Construction, Zap } from "lucide-react";
import Link from "next/link";

export default function ElectricFieldG10Page() {
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
            <Zap className="h-8 w-8 text-primary" />
            Electric Field Visualizer
          </CardTitle>
          <CardDescription>
            Grade 10 - STBB. Visualize electric field lines around point charges and understand electrostatic phenomena like induction.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Construction className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">This Simulation is Under Development.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Soon, you'll be able to:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside mt-1 inline-block text-left">
            <li>Place positive and negative point charges.</li>
            <li>Observe the electric field lines generated.</li>
            <li>Visualize the concept of electric field strength.</li>
            <li>Simulate electrostatic induction.</li>
            <li>Explore interactions between multiple charges.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
