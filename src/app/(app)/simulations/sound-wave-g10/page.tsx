
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Construction, Speaker } from "lucide-react";
import Link from "next/link";

export default function SoundWaveG10Page() {
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
            <Speaker className="h-8 w-8 text-primary" />
            Sound Wave Viewer & Echo
          </CardTitle>
          <CardDescription>
            Grade 10 - STBB. Visualize longitudinal sound waves, compressions, rarefactions, and simulate echo phenomena.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Construction className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">This Simulation is Under Development.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Soon, you'll be able to:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside mt-1 inline-block text-left">
            <li>See animated compressions and rarefactions.</li>
            <li>Adjust sound frequency and amplitude.</li>
            <li>Simulate sound reflecting off a barrier to create an echo.</li>
            <li>Conceptually explore the echo method for determining speed of sound.</li>
            <li>View a simple oscilloscope representation of sound waves.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
