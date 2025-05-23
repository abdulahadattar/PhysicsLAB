
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, Construction } from "lucide-react";

export default function TeacherSchemeOfStudyPage() {
  return (
    <div className="space-y-6">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ClipboardList className="h-7 w-7 text-primary"/>Scheme of Study (Roadmap)</CardTitle>
          <CardDescription>Plan and visualize your teaching roadmap. Assign topics to specific weeks or months, track progress, and adjust as needed. (Feature Under Construction)</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
            <Construction className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">This feature is currently under development.</p>
            <p className="text-sm text-muted-foreground mt-1">Future functionality will include creating, editing, and visualizing your scheme of study.</p>
        </CardContent>
      </Card>
    </div>
  );
}
