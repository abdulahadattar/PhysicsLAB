
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookCopy, Construction } from "lucide-react";

export default function TeacherTimetablePage() {
  return (
    <div className="space-y-6">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BookCopy className="h-7 w-7 text-primary"/>Teacher's Timetable</CardTitle>
          <CardDescription>Manage and view your weekly teaching timetable. Add classes, subjects, and times. (Feature Under Construction)</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
            <Construction className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">This feature is currently under development.</p>
            <p className="text-sm text-muted-foreground mt-1">Future functionality will allow you to create and edit your personalized timetable.</p>
        </CardContent>
      </Card>
    </div>
  );
}
