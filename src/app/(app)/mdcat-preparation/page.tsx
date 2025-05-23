
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TestTubeDiagonal, Construction } from "lucide-react";

export default function MdcatPreparationPage() {
  return (
    <div className="space-y-6">
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <div className="inline-block mx-auto bg-primary/10 p-3 rounded-full mb-2">
             <TestTubeDiagonal className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl">MDCAT Preparation Resources</CardTitle>
          <CardDescription>Find specialized resources, MCQs, and tips for MDCAT physics preparation.</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
            <Construction className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">This feature is currently under development.</p>
            <p className="text-sm text-muted-foreground mt-1">Coming soon: Dedicated MDCAT physics preparation materials.</p>
        </CardContent>
      </Card>
    </div>
  );
}
