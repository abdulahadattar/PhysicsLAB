
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Construction, Zap } from "lucide-react"; // Using Zap for energy
import Link from "next/link";

export default function PhetEnergySkateParkBasicsG9Page() {
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
            PhET: Energy Skate Park Basics
          </CardTitle>
          <CardDescription>
            Grade 9 - Explore conservation of mechanical energy. Inspired by PhET's Energy Skate Park.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Construction className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Feature Under Advanced Development</p>
          <p className="text-sm text-muted-foreground mt-2">
            This simulation will allow you to:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside mt-1 inline-block text-left">
            <li>Build skate tracks and observe a skater's motion.</li>
            <li>View real-time bar graphs for kinetic, potential, thermal, and total energy.</li>
            <li>Control friction to see energy dissipation.</li>
            <li>Display numerical values for energy components.</li>
            <li>Engage in a "Design a Rollercoaster" challenge mode.</li>
          </ul>
           <p className="text-xs text-muted-foreground mt-4">STBB Relevance: Work, Kinetic Energy, Potential Energy, Conservation of Energy (G9, Unit 4 - Note: STBB G9 curriculum typically covers Work, Energy, Power in Unit 8. Adjusting mapping if needed).</p>
        </CardContent>
      </Card>
    </div>
  );
}
