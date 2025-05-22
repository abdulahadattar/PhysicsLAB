"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send, MessageSquarePlus, Trash2, Edit3 } from "lucide-react";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Announcement {
    id: string;
    title: string;
    message: string;
    date: string;
    targetAudience: string;
}

const initialAnnouncements: Announcement[] = [
    { id: "ann001", title: "Mid-Term Exam Schedule", message: "The mid-term exams will commence from August 15th. Please check the notice board for the detailed schedule.", date: "2024-07-15", targetAudience: "All Grades" },
    { id: "ann002", title: "Physics Practical Class - Grade 10", message: "Grade 10 students, your next physics practical class is on Wednesday at 10 AM in Lab 2.", date: "2024-07-18", targetAudience: "Grade 10" },
];


export default function TeacherAnnouncementsPage() {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetGrades, setTargetGrades] = useState<string[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);

  const handleSendAnnouncement = () => {
    if (!title.trim() || !message.trim()) {
        toast({
            title: "Error",
            description: "Title and message cannot be empty.",
            variant: "destructive",
        });
        return;
    }
    const newAnnouncement: Announcement = {
        id: `ann${Date.now()}`,
        title,
        message,
        date: new Date().toISOString().split('T')[0],
        targetAudience: targetGrades.length > 0 ? targetGrades.join(', ') : "All Grades"
    };
    setAnnouncements(prev => [newAnnouncement, ...prev]);
    setTitle("");
    setMessage("");
    setTargetGrades([]);
    // Clear checkboxes if using individual ones
    document.querySelectorAll<HTMLInputElement>('input[type="checkbox"][name="grade-target"]').forEach(cb => cb.checked = false);

    toast({
      title: "Announcement Sent!",
      description: `"${title}" has been broadcasted.`,
    });
    // Here, you would typically send this to a backend or local storage
  };

  const handleGradeChange = (grade: string, checked: boolean | string) => {
    if (checked) {
        setTargetGrades(prev => [...prev, grade]);
    } else {
        setTargetGrades(prev => prev.filter(g => g !== grade));
    }
  };
  
  const handleDelete = (id: string) => {
    setAnnouncements(prev => prev.filter(ann => ann.id !== id));
    toast({
        title: "Announcement Deleted",
        description: "The announcement has been removed.",
    });
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" asChild size="sm">
        <Link href="/teacher-dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Teacher Dashboard
        </Link>
      </Button>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl flex items-center gap-2"><MessageSquarePlus className="h-7 w-7 text-primary"/>Send New Announcement</CardTitle>
            <CardDescription>Compose and broadcast messages, reminders, or updates to students. Messages are delivered when students are online (if sync is enabled).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="announcement-title">Title</Label>
              <Input id="announcement-title" placeholder="E.g., Upcoming Test Schedule" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="announcement-message">Message</Label>
              <Textarea id="announcement-message" placeholder="Enter your announcement details here..." rows={5} value={message} onChange={e => setMessage(e.target.value)} />
            </div>
            <div>
              <Label>Target Audience (Optional - Default: All Grades)</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {["Grade 9", "Grade 10", "Grade 11", "Grade 12"].map(grade => (
                   <div key={grade} className="flex items-center space-x-2">
                     <Checkbox 
                        id={`grade-${grade.replace(/\s+/g, '-')}`} 
                        name="grade-target"
                        onCheckedChange={(checked) => handleGradeChange(grade, checked)}
                     />
                     <Label htmlFor={`grade-${grade.replace(/\s+/g, '-')}`} className="font-normal">{grade}</Label>
                   </div>
                ))}
              </div>
            </div>
            <Button onClick={handleSendAnnouncement} className="w-full">
              <Send className="mr-2 h-4 w-4" /> Send Announcement
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="text-2xl">Sent Announcements</CardTitle>
                <CardDescription>History of broadcasted messages.</CardDescription>
            </CardHeader>
            <CardContent className="max-h-[500px] overflow-y-auto space-y-3">
                {announcements.length > 0 ? announcements.map(ann => (
                    <Card key={ann.id} className="bg-secondary/30">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg">{ann.title}</CardTitle>
                                <div className="space-x-1">
                                    <Button variant="ghost" size="icon" className="h-7 w-7" disabled><Edit3 className="h-4 w-4"/></Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(ann.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">Sent: {ann.date} | To: {ann.targetAudience}</p>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm">{ann.message}</p>
                        </CardContent>
                    </Card>
                )) : (
                    <p className="text-muted-foreground text-center py-4">No announcements sent yet.</p>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
