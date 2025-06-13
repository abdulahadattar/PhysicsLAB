// src/features/auth/AuthControl.tsx
"use client";
import React, { useState, useCallback } from 'react';
import { useUserSession } from '@/contexts/user-session-context';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Bug, LogIn, LogOut, Settings, User, BookOpen } from 'lucide-react';


export function AuthControl() {
  const {
    currentUser, isLoggedIn, userRole, viewAsStudent, signInWithGoogle, magicLogin,
    signOutFirebase, isLoading: isSessionLoading, isFirebaseConfigured, debugSwitchRole, toggleViewAsStudent,
  } = useUserSession();
  const { toast } = useToast();
  const [isLoginFlowActive, setIsLoginFlowActive] = useState(false);
  const [debugUsername, setDebugUsername] = useState("");
  const [debugPassword, setDebugPassword] = useState("");

  const handleDebugLogin = useCallback(async () => {
    if (!debugSwitchRole) return;
    try {
      // In a real app, this would involve calling a backend endpoint
      // that performs the authentication and returns user details/token.
      // For this debug implementation, we'll simulate a login.
      console.log(`Attempting debug login for username: ${debugUsername}`);
      // Simulate a successful login
      const simulatedUser = {
        uid: `debug-${debugUsername}`,
        email: `${debugUsername}@example.com`,
        displayName: `Debug ${debugUsername.charAt(0).toUpperCase() + debugUsername.slice(1)}`,
        role: debugUsername as 'student' | 'teacher', // Assume username is the role
      };
      // You would likely have a method in useUserSession to set a debug user
      // debugSwitchRole(simulatedUser.role); // This is the method from the hook

      // Close the modal and clear fields
      setDebugUsername("");
      setDebugPassword("");
      toast({
        title: "Debug Login Successful",
        description: `Logged in as debug user: ${simulatedUser.displayName}`,
      });
    } catch (error: any) {
      console.error("Debug login failed:", error);
      toast({
        title: "Debug Login Failed",
        description: error.message || "An error occurred during debug login.",
        variant: "destructive",
      });
    }
  }, [debugUsername, debugPassword, debugSwitchRole, toast]); // Include debugSwitchRole in dependencies


  if (isSessionLoading) {
    return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />;
  }

  return (
    <>
      {!isLoggedIn ? (
        <Dialog open={isLoginFlowActive} onOpenChange={setIsLoginFlowActive}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <LogIn className="mr-2 h-4 w-4" /> Login
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Login to PhysicsLab</DialogTitle>
              <DialogDescription>
                Access personalized features and track your progress.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Optional: Add email/password fields if you support it */}
              {/*
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input id="email" value="pedro@example.com" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  Password
                </Label>
                <Input id="password" type="password" className="col-span-3" />
              </div>
              */}
              {/* Google Login */}
              {isFirebaseConfigured && (
                 <Button variant="outline" className="w-full" onClick={signInWithGoogle}>
                    {/* Replace with actual Google icon */}
                   <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M22.675 11.514c0-.873-.073-1.617-.21-2.3H12v4.393h6.045c-.276 1.463-1.052 2.75-2.286 3.628v2.842h3.626c2.123-1.957 3.344-4.827 3.344-8.563z" fill="#4285F4"/><path d="M12 23c3.246 0 5.964-1.076 7.952-2.914l-3.626-2.842c-.995.671-2.262 1.069-4.326 1.069-3.354 0-6.22-2.262-7.24-5.338H.934V17.04c1.989 3.938 5.964 6.96 11.066 6.96z" fill="#34A853"/><path d="M4.76 14.105c-.235-.67-.368-1.389-.368-2.105s.133-1.435.368-2.105V6.16H1.134C.408 7.615 0 9.238 0 11c0 1.762.408 3.385 1.134 4.84z" fill="#FBBC05"/><path d="M12 4.195c1.783 0 3.333.585 4.552 1.72l3.2-3.199C18.062 1.158 15.344 0 12 0 6.934 0 2.959 3.022.971 6.96L4.76 10.85c1.02-3.076 3.886-5.338 7.24-5.338z" fill="#EA4335"/></svg>
                    Sign in with Google
                 </Button>
              )}
               {/* Optional: Add magic link login */}
               {/*
               <Button variant="outline" className="w-full" onClick={() => magicLogin("user@example.com")}>
                 Send Magic Link
               </Button>
               */}
            </div>
            {/* Optional: Debug login fields */}
            {process.env.NODE_ENV === 'development' && debugSwitchRole && (
              <div className="grid gap-2 border-t pt-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="debug-username" className="text-right text-xs text-muted-foreground">
                    Debug User
                  </Label>
                  <Input
                    id="debug-username"
                    value={debugUsername}
                    onChange={(e) => setDebugUsername(e.target.value)}
                    placeholder="student or teacher"
                    className="col-span-3 h-8 text-xs"
                  />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="debug-password" className="text-right text-xs text-muted-foreground">
                    Debug Pass
                  </Label>
                  <Input
                    id="debug-password"
                     value={debugPassword}
                    onChange={(e) => setDebugPassword(e.target.value)}
                    type="password"
                    placeholder="any"
                    className="col-span-3 h-8 text-xs"
                  />
                </div>
                <Button variant="secondary" size="sm" onClick={handleDebugLogin} className="col-span-4">
                  <Bug className="mr-2 h-4 w-4" /> Debug Login
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={currentUser?.photoURL || ""} alt={currentUser?.displayName || "User"} />
                <AvatarFallback>{currentUser?.displayName?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{currentUser?.displayName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {currentUser?.email}
                </p>
                 <p className="text-xs leading-none text-muted-foreground">
                   Role: {userRole}
                 </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
               {/* Example: Link to settings */}
               <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              {/* Toggle View As Student */}
              {userRole === 'teacher' && (
                 <DropdownMenuItem onClick={toggleViewAsStudent}>
                   <BookOpen className="mr-2 h-4 w-4" />
                   <span>View as {viewAsStudent ? 'Teacher' : 'Student'}</span>
                 </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOutFirebase}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
       {process.env.NODE_ENV === 'development' && debugSwitchRole && !isLoggedIn && (
         // Debug role switcher for logged-out state, potentially useful
         // Or this could be moved into the debug login modal if preferred
         null // Keeping it simple for now, primary debug login is in the modal
       )}
    </>
  );
}