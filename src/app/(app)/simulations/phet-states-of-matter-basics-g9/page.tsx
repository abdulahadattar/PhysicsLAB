
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Construction, Atom } from "lucide-react";
import Link from "next/link";

export default function PhetStatesOfMatterBasicsG9Page() {
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
            <Atom className="h-8 w-8 text-primary" />
            PhET: States of Matter Basics
          </CardTitle>
          <CardDescription>
            Grade 9 - Visualize atoms/molecules in different phases. Inspired by PhET's States of Matter.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Construction className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Feature Under Advanced Development</p>
          <p className="text-sm text-muted-foreground mt-2">
            This simulation will allow you to:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside mt-1 inline-block text-left">
            <li>View particle arrangement and motion for solid, liquid, and gas states.</li>
            <li>Animate phase changes (melting, boiling, freezing, condensation) by adding/removing heat.</li>
            <li>Observe how particle collisions create pressure (for gases).</li>
            <li>Focus on evaporation and its cooling effect.</li>
          </ul>
           <p className="text-xs text-muted-foreground mt-4">STBB Relevance: States of Matter, Thermal Expansion, Evaporation, Boiling (G9, Unit 9).</p>
        </CardContent>
      </Card>
    </div>
  );
}
