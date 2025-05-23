
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Beaker, Construction } from "lucide-react";

export default function PracticalsPage() {
  return (
    <div className="space-y-6">
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <div className="inline-block mx-auto bg-primary/10 p-3 rounded-full mb-2">
             <Beaker className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl">Physics Practicals</CardTitle>
          <CardDescription>Find resources, instructions, and related simulations for your physics practicals. (Organized by Grade)</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
            <Construction className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">This feature is currently under development.</p>
            <p className="text-sm text-muted-foreground mt-1">Coming soon: A dedicated section for grade-wise physics practicals.</p>
        </CardContent>
      </Card>
    </div>
  );
}
