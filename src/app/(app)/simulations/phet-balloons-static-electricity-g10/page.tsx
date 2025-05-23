
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Construction, Zap } from "lucide-react"; // Using Zap for electricity
import Link from "next/link";

export default function PhetBalloonsStaticElectricityG10Page() {
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
            PhET: Balloons & Static Electricity
          </CardTitle>
          <CardDescription>
            Grade 10 - Demonstrate charging by friction and induction. Inspired by PhET.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Construction className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Feature Under Advanced Development</p>
          <p className="text-sm text-muted-foreground mt-2">
            This simulation will allow you to:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside mt-1 inline-block text-left">
            <li>Microscopically visualize electron movement between objects.</li>
            <li>Animate charge redistribution due to induction.</li>
            <li>Interact with multiple charged objects to observe forces.</li>
          </ul>
          <p className="text-xs text-muted-foreground mt-4">STBB Relevance: Static Electricity, Charging by Friction, Induction, Attraction/Repulsion of Charges (G10, Unit 4 - Note: STBB G10 textbook likely covers this in Electrostatics, Unit 14).</p>
        </CardContent>
      </Card>
    </div>
  );
}
