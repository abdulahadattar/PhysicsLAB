
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Construction, Binary } from "lucide-react";
import Link from "next/link";

export default function LogicGatesG10Page() {
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
            <Binary className="h-8 w-8 text-primary" />
            Logic Gate Simulator
          </CardTitle>
          <CardDescription>
            Grade 10 - STBB. Simulate basic logic gates (AND, OR, NOT, NAND, NOR) and verify their truth tables.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Construction className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">This Simulation is Under Development.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Soon, you'll be able to:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside mt-1 inline-block text-left">
            <li>Select different logic gates (AND, OR, NOT, NAND, NOR).</li>
            <li>Toggle input values (0 or 1).</li>
            <li>Observe the output of the gate (e.g., with a virtual LED).</li>
            <li>Verify the truth table for each gate.</li>
            <li>Potentially combine gates to build simple circuits.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
