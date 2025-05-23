
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CalendarDays, Save, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, startOfDay } from 'date-fns';

const DIARY_STORAGE_KEY_PREFIX = 'physicsLabDailyDiary_';

interface DiaryEntry {
  topicsCovered: string;
  studentObservations: string;
  assignmentsGiven: string;
  reflectionsNextSteps: string;
  lastSaved?: string;
}

const initialDiaryCategories: { id: keyof DiaryEntry; label: string; placeholder: string; rows: number }[] = [
  { id: "topicsCovered", label: "Topics Covered Today", placeholder: "E.g., Unit 2: Kinematics - Equations of motion, introduction to projectile motion.", rows: 3 },
  { id: "studentObservations", label: "Key Student Observations/Progress", placeholder: "E.g., Most students grasped 'v=u+at'. Some struggled with graph interpretation. Aisha asked a good question about air resistance.", rows: 4 },
  { id: "assignmentsGiven", label: "Assignments/Homework Given", placeholder: "E.g., Textbook Chapter 2, problems 1-5. Prepare for short quiz on kinematics next class.", rows: 2 },
  { id: "reflectionsNextSteps", label: "Reflections & Plans for Next Session", placeholder: "E.g., Need to revisit graph slopes. Consider a quick recap activity. Prepare more examples for projectile motion.", rows: 4 },
];

export default function TeacherDailyDiaryPage() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [diaryEntry, setDiaryEntry] = useState<Partial<DiaryEntry>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getStorageKeyForDate = useCallback((date: Date | undefined): string | null => {
    if (!date) return null;
    return `${DIARY_STORAGE_KEY_PREFIX}${format(startOfDay(date), 'yyyy-MM-dd')}`;
  }, []);

  const loadDiaryEntry = useCallback((date: Date | undefined) => {
    setIsLoading(true);
    const storageKey = getStorageKeyForDate(date);
    if (storageKey) {
      try {
        const savedDataRaw = localStorage.getItem(storageKey);
        if (savedDataRaw) {
          const savedData: DiaryEntry = JSON.parse(savedDataRaw);
          setDiaryEntry(savedData);
        } else {
          setDiaryEntry({}); // Clear form for new date
        }
      } catch (e) {
        console.error("Failed to load or parse diary entry:", e);
        toast({ title: "Error Loading Entry", description: "Could not load diary entry for this date.", variant: "destructive" });
        setDiaryEntry({});
      }
    } else {
        setDiaryEntry({});
    }
    setIsLoading(false);
  }, [getStorageKeyForDate, toast]);

  useEffect(() => {
    loadDiaryEntry(selectedDate);
  }, [selectedDate, loadDiaryEntry]);

  const handleInputChange = (field: keyof DiaryEntry, value: string) => {
    setDiaryEntry(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveEntry = () => {
    const storageKey = getStorageKeyForDate(selectedDate);
    if (!storageKey) {
      toast({ title: "No Date Selected", description: "Please select a date to save the entry.", variant: "destructive" });
      return;
    }
    // Check if there's anything to save
    const hasContent = Object.values(diaryEntry).some(value => typeof value === 'string' && value.trim() !== "");
    if (!hasContent) {
        toast({ title: "Empty Entry", description: "Cannot save an empty diary entry.", variant: "destructive" });
        return;
    }

    setIsSaving(true);
    try {
      const entryToSave: DiaryEntry = {
        topicsCovered: diaryEntry.topicsCovered || "",
        studentObservations: diaryEntry.studentObservations || "",
        assignmentsGiven: diaryEntry.assignmentsGiven || "",
        reflectionsNextSteps: diaryEntry.reflectionsNextSteps || "",
        lastSaved: new Date().toISOString(),
      };
      localStorage.setItem(storageKey, JSON.stringify(entryToSave));
      setDiaryEntry(entryToSave); // Ensure state reflects saved data with timestamp
      toast({ title: "Diary Entry Saved!", description: `Entry for ${selectedDate ? format(selectedDate, 'PPP') : ''} has been saved locally.` });
    } catch (e) {
      console.error("Failed to save diary entry:", e);
      toast({ title: "Save Failed", description: "Could not save diary entry to local storage.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CalendarDays className="h-7 w-7 text-primary"/>Daily Teaching Diary</CardTitle>
          <CardDescription>Log your daily teaching activities, observations, assignments, and reflections. Entries are saved locally to your browser for the selected date.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-3 gap-6 items-start">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-xl">Select Date</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              disabled={(date) => date > new Date()} // Disable future dates
            />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl">
              Diary Entry for: {selectedDate ? format(selectedDate, 'PPP') : "No date selected"}
            </CardTitle>
            {diaryEntry.lastSaved && (
                <CardDescription className="text-xs">
                    Last saved: {format(parseISO(diaryEntry.lastSaved), 'Pp')}
                </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : initialDiaryCategories.map(category => (
              <div key={category.id}>
                <Label htmlFor={category.id}>{category.label}</Label>
                <Textarea
                  id={category.id}
                  value={diaryEntry[category.id as keyof DiaryEntry] || ""}
                  onChange={(e) => handleInputChange(category.id as keyof DiaryEntry, e.target.value)}
                  placeholder={category.placeholder}
                  rows={category.rows}
                  disabled={!selectedDate}
                />
              </div>
            ))}
            <Button onClick={handleSaveEntry} disabled={isSaving || !selectedDate || isLoading} className="w-full">
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
              Save Entry for {selectedDate ? format(selectedDate, 'MMM d') : ''}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
