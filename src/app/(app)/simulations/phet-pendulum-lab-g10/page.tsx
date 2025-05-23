
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Construction, MoveVertical } from "lucide-react";
import Link from "next/link";

export default function PhetPendulumLabG10Page() {
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
            <MoveVertical className="h-8 w-8 text-primary" />
            PhET: Pendulum Lab
          </CardTitle>
          <CardDescription>
            Grade 10 - Investigate the period of a pendulum. Based on PhET's Pendulum Lab.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Construction className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Feature Under Advanced Development</p>
          <p className="text-sm text-muted-foreground mt-2">
            This simulation will allow you to:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside mt-1 inline-block text-left">
            <li>Control pendulum length, mass, gravity, and initial angle.</li>
            <li>Plot angle vs. time and energy vs. time graphs.</li>
            <li>Engage in an "Unknown Gravity" challenge to determine 'g' on another planet.</li>
          </ul>
          <p className="text-xs text-muted-foreground mt-4">STBB Relevance: Simple Pendulum, Factors Affecting Period, SHM (G10, Unit 1; also G11 Oscillations).</p>
        </CardContent>
      </Card>
    </div>
  );
}
