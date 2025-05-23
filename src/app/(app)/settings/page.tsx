
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings as SettingsIcon, Palette, Bell, Download, UserCog } from "lucide-react";
import { useFunFactsSettings } from '@/hooks/use-fun-facts-settings';
import { ThemeToggle } from '@/components/theme-toggle';
// Removed useUserSession import as it's replaced by useUserSession

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
           <div className="p-4 border rounded-lg">
            <Label className="flex flex-col gap-1">
              <span className="font-semibold">Automatic Data Sync</span>
              <span className="text-sm text-muted-foreground">
                The app aims to automatically sync data (like pending feedback submissions and potentially future content updates) 
                when an internet connection is available. This ensures your experience is as up-to-date as possible and offline work is saved.
                PDFs and other large study materials may have manual caching options for offline use.
              </span>
            </Label>
            {/* Manual Sync button removed, placeholder for future global sync status/action if needed */}
            {/* <Button variant="outline" className="w-full mt-2" disabled>Check Sync Status (Coming Soon)</Button> */}
          </div>
          <div className="p-4 border rounded-lg">
            <Label className="flex flex-col gap-1">
              <span className="font-semibold">App Updates</span>
                <span className="text-sm text-muted-foreground">
                    This application is designed as a Progressive Web App (PWA). Updates are typically handled automatically by your browser when you re-open the app after an update has been deployed. You can also try a hard refresh (Ctrl+Shift+R or Cmd+Shift+R) if you suspect an update is available.
                </span>
            </Label>
            <Button variant="outline" className="w-full mt-2" onClick={() => window.location.reload(true)} >
               Force Reload App
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
