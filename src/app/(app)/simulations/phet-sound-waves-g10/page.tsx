
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Construction, Speaker } from "lucide-react";
import Link from "next/link";

export default function PhetSoundWavesG10Page() {
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
            PhET: Sound Waves Visualization
          </CardTitle>
          <CardDescription>
            Grade 10 - Visualize sound waves as pressure variations. Based on PhET's Sound Waves.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Construction className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Feature Under Advanced Development</p>
          <p className="text-sm text-muted-foreground mt-2">
            This simulation will allow you to:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside mt-1 inline-block text-left">
            <li>Animate the longitudinal motion of air particles.</li>
            <li>Show synchronized graphs of pressure variation and particle displacement.</li>
            <li>Demonstrate interference patterns from multiple sound sources.</li>
            <li>Control frequency (pitch) and amplitude (loudness).</li>
          </ul>
          <p className="text-xs text-muted-foreground mt-4">STBB Relevance: Sound Waves, Longitudinal Waves, Properties of Sound (G10, Unit 2 - Note: STBB G10 textbook has 'Sound' as Unit 11).</p>
        </CardContent>
      </Card>
    </div>
  );
}
