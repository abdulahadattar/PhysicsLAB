
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Construction, Projector } from "lucide-react";
import Link from "next/link";

export default function PhetGeometricOpticsG10Page() {
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
            <Projector className="h-8 w-8 text-primary" />
            PhET: Geometric Optics (Lenses & Mirrors)
          </CardTitle>
          <CardDescription>
            Grade 10 - Visualize ray tracing for lenses and mirrors. Based on PhET's Geometric Optics.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Construction className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Feature Under Advanced Development</p>
          <p className="text-sm text-muted-foreground mt-2">
            This simulation will allow you to:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside mt-1 inline-block text-left">
            <li>Interactively trace rays with customizable focal length, object distance, and height.</li>
            <li>Instantly see image location, height, nature (real/virtual, etc.).</li>
            <li>Use an integrated lens/mirror equation tool to check calculations.</li>
            <li>Explore simple combinations of lenses/mirrors.</li>
          </ul>
           <p className="text-xs text-muted-foreground mt-4">STBB Relevance: Lenses (Convex, Concave), Mirrors (Plane, Spherical), Ray Tracing, Image Formation (G10, Unit 3 - Note: STBB G10 textbook likely covers this in Geometrical Optics, Unit 13).</p>
        </CardContent>
      </Card>
    </div>
  );
}
