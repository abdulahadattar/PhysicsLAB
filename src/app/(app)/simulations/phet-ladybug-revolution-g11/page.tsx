
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Construction, Bug } from "lucide-react"; // Using Bug as placeholder for Ladybug
import Link from "next/link";

export default function PhetLadybugRevolutionG11Page() {
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
            <Bug className="h-8 w-8 text-primary" />
            PhET: Ladybug Revolution (Rotational Motion)
          </CardTitle>
          <CardDescription>
            Grade 11 - Explore angular position, velocity, and acceleration. Based on PhET.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Construction className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Feature Under Advanced Development</p>
          <p className="text-sm text-muted-foreground mt-2">
            This simulation will allow you to:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside mt-1 inline-block text-left">
            <li>Visualize tangential velocity, angular velocity, and centripetal acceleration vectors.</li>
            <li>Plot angular position/velocity/acceleration vs. time graphs.</li>
            <li>Experience a "Break the String" challenge with increasing angular velocity.</li>
          </ul>
          <p className="text-xs text-muted-foreground mt-4">STBB Relevance: Angular Displacement, Angular Velocity, Angular Acceleration, Centripetal Force (G11, Unit 3 - Note: Corresponds to STBB G11 Unit 4: Rotational and Circular Motion).</p>
        </CardContent>
      </Card>
    </div>
  );
}
