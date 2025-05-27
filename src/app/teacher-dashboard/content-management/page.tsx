import React from "react";
import { Button } from "@/components/ui/button";

export default function TeacherContentManagementPage() {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Teacher Content Management</h1>
      <p className="mb-6 text-muted-foreground">
        Generate, review, and edit AI-drafted chapter content. Select a chapter to begin.
      </p>
      {/* TODO: Add chapter selector, AI draft button, and editable fields here */}
      <Button disabled>Generate AI Draft for this Chapter</Button>
      {/* More UI coming soon... */}
    </div>
  );
}
