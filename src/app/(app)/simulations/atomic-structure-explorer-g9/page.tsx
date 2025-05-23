
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Construction, Atom } from "lucide-react";
import Link from "next/link";

export default function AtomicStructureExplorerPage() {
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
            Atomic Structure Explorer
          </CardTitle>
          <CardDescription>
            Grade 9/10 - STBB. Visualize the basic components of an atom (protons, neutrons, electrons) and observe how changing their numbers affects the element and its properties. (Conceptual Simulation)
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Construction className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">This Simulation is Under Development.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Soon, you'll be able to:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside mt-1 inline-block text-left">
            <li>View a simplified Bohr model or electron cloud model of an atom.</li>
            <li>Add or remove protons, neutrons, and electrons using interactive controls (e.g., buttons or sliders).</li>
            <li>See the atomic number, mass number, and overall charge update dynamically.</li>
            <li>Observe how the element's identity changes with the number of protons (linking to a simplified periodic table concept).</li>
            <li>Explore the concepts of isotopes (varying neutrons) and ions (varying electrons).</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
    