
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings as SettingsIcon, Palette, Bell, Download, UserCog } from "lucide-react";
import { useFunFactsSettings } from '@/hooks/use-fun-facts-settings';
import { ThemeToggle } from '@/components/theme-toggle';
// Removed useTeacherMode import as it's replaced by useUserSession

export default function SettingsPage() {
  const { isPanelVisible, togglePanelVisibility, isMounted: isFunFactsMounted } = useFunFactsSettings();
  // const { isTeacherMode, toggleTeacherMode, isLoading: isTeacherModeLoading } = useTeacherMode(); // Removed

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <Card className="shadow-xl">
        <CardHeader className="text-center">
           <div className="inline-block mx-auto bg-primary/10 p-3 rounded-full mb-2">
             <SettingsIcon className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl">Application Settings</CardTitle>
          <CardDescription>Customize your PhysicsLab experience.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2"><Palette className="h-5 w-5 text-primary"/>Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <Label htmlFor="theme-toggle-label" className="flex flex-col gap-1">
              <span className="font-semibold">Theme</span>
              <span className="text-sm text-muted-foreground">Select your preferred light or dark mode.</span>
            </Label>
            <ThemeToggle />
          </div>
          {isFunFactsMounted && (
            <div className="flex items-center justify-between p-4 border rounded-lg">
                <Label htmlFor="fun-facts-toggle" className="flex flex-col gap-1">
                <span className="font-semibold">Fun Physics Facts Panel</span>
                <span className="text-sm text-muted-foreground">Show or hide the floating panel with interesting physics facts.</span>
                </Label>
                <Switch
                id="fun-facts-toggle"
                checked={isPanelVisible}
                onCheckedChange={togglePanelVisibility}
                aria-label="Toggle fun facts panel visibility"
                />
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2"><Bell className="h-5 w-5 text-primary"/>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="flex items-center justify-between p-4 border rounded-lg">
            <Label htmlFor="notifications-toggle" className="flex flex-col gap-1">
              <span className="font-semibold">Enable Notifications</span>
               <span className="text-sm text-muted-foreground">Receive updates for new quizzes or announcements. (Feature coming soon)</span>
            </Label>
            <Switch id="notifications-toggle" disabled aria-label="Toggle notifications"/>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2"><Download className="h-5 w-5 text-primary"/>Data & Sync</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="flex items-center justify-between p-4 border rounded-lg">
            <Label htmlFor="online-sync-toggle" className="flex flex-col gap-1">
              <span className="font-semibold">Online MCQ Sync</span>
              <span className="text-sm text-muted-foreground">Periodically fetch updated MCQs from online sources. Requires internet.</span>
            </Label>
            <Switch 
              id="online-sync-toggle" 
              disabled 
              aria-label="Toggle online MCQ sync"
            />
          </div>
          <Button variant="outline" className="w-full" disabled>Sync Now (Fetch MCQs)</Button>
          {/* Removed the note about offline-capability and optional sync */}
        </CardContent>
      </Card>

      {/* Removed Access Mode Card as login is now handled in AppShell header 
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2"><UserCog className="h-5 w-5 text-primary"/>Access Mode</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          // Content removed
        </CardContent>
      </Card>
      */}
    </div>
  );
}
