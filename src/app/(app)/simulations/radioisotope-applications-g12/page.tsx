
// src/app/(app)/simulations/radioisotope-applications-g12/page.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Construction, TestTubeDiagonal } from "lucide-react";
import Link from "next/link";

export default function RadioisotopeApplicationsG12Page() {
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
            <TestTubeDiagonal className="h-8 w-8 text-primary" /> {/* For applications/medical */}
            G12: Applications of Radioisotopes
          </CardTitle>
          <CardDescription>
            STBB Aligned: Unit 7 - Nuclear Physics. Conceptual explanations and diagrams of radioisotope uses in medical imaging, carbon dating, and industry.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Construction className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Feature Under Advanced Development</p>
          <p className="text-sm text-muted-foreground mt-2">
            This section will feature:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside mt-1 inline-block text-left">
            <li>Interactive diagrams for medical tracers and imaging (e.g., PET scans).</li>
            <li>Explanation of carbon-14 dating principles.</li>
            <li>Examples of industrial applications (e.g., thickness gauging, sterilization).</li>
            <li>Information on safety and handling of radioisotopes.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
