"use client";

import { LogOut, Settings, User, UserCog, EyeIcon, EyeOffIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { APP_AUTHOR } from "@/lib/constants";
import { useAuthService } from "@/lib/auth/authService"; // Assuming authService provides logout and user info

interface UserNavProps {
  isLoggedIn: boolean;
  userRole: 'student' | 'teacher' | null;
  viewAsStudent: boolean;
  currentUser: any; // TODO: Replace with proper user type
  // TODO: Add toggleViewAsStudent function prop if needed
}

export function UserNav({
  isLoggedIn,
  userRole,
  viewAsStudent,
  currentUser,
}: UserNavProps) {
  const { handleLogout, isLoading } = useAuthService(); // Assuming useAuthService hook exists and provides handleLogout
  // const { toggleViewAsStudent } = useSomeViewToggleHook(); // Assuming a hook for this

  const handleViewToggle = () => {
    // TODO: Implement view toggle logic here
    console.log("Toggle view as student/teacher");
    // toggleViewAsStudent();
  };

  const userFallback = useAuthService().user ? (useAuthService().user.displayName || '').substring(0, 2).toUpperCase() || (useAuthService().user.uid?.startsWith('debug-') ? (useAuthService().user.uid === 'debug-teacher' ? "DT" : "DS") : (useAuthService().user.isTeacher ? 'TE' : 'ST')) : 'GU';
  const userName = currentUser?.displayName || (isLoggedIn ? (userRole === 'teacher' ? (currentUser?.uid === 'debug-teacher' ? "Debug Teacher" : APP_AUTHOR) : (currentUser?.uid === 'debug-student' ? "Debug Student" : 'Student User')) : 'Guest');
  const userEmail = currentUser?.email || (isLoggedIn ? (userRole === 'teacher' ? (currentUser?.uid === 'debug-teacher' ? "debug.teacher@example.com" : APP_AUTHOR.toLowerCase().replace(/\s/g, '.') + '@example.com') : (currentUser?.uid === 'debug-student' ? "debug.student@example.com" : 'student.user@example.com')) : 'guest@example.com');


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
          <Avatar className="h-9 w-9">
          <AvatarImage src={currentUser?.photoURL || (isLoggedIn && userRole === 'teacher' ? "/placeholder-teacher.png" : "/placeholder-student.png")} alt={currentUser?.displayName || "User"} />
            <AvatarFallback className="font-semibold">{userFallback}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none truncate">{userName}</p>
            <p className="text-xs leading-none text-muted-foreground">
             {userEmail}
            </p>
             <p className="text-xs leading-none text-muted-foreground capitalize pt-1">
             {isLoggedIn ? (userRole === 'teacher' ? (viewAsStudent ? 'Teacher (Student View)' : 'Teacher') : 'Student') : 'Guest'}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
             <Link href="/settings" passHref legacyBehavior={false}>
              <div className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
                <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
              </div>
            </Link>
          </DropdownMenuItem>
          {/* Implement view toggle if applicable */}
          {isLoggedIn && userRole === 'teacher' && (
             <DropdownMenuItem onClick={handleViewToggle}>
              <div className="flex items-center">
                 {viewAsStudent ? (
                   <EyeIcon className="mr-2 h-4 w-4" />
                 ) : (
                   <EyeOffIcon className="mr-2 h-4 w-4" />
                 )}
                <span>{viewAsStudent ? 'View as Teacher' : 'View as Student'}</span>
              </div>
            </DropdownMenuItem>
          )}
          {/* Add other relevant menu items */}
           {/* <DropdownMenuItem>
            <div className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
               <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </div>
          </DropdownMenuItem> */}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {isLoggedIn ? (
          <DropdownMenuItem onClick={handleLogout} disabled={isLoading} className="text-red-600 focus:text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem asChild>
             <Link href="/login" passHref legacyBehavior={false}>
              <div className="flex items-center">
                <LogIn className="mr-2 h-4 w-4" />
                <span>Log In</span>
              </div>
            </Link>
          </DropdownMenuItem>
        )}
         {/* Debug/Dev Items (Optional based on environment) */}
         {/* TODO: Add environment check */}
         {isLoggedIn && (
           <DropdownMenuItem asChild>
            <Link href="/debug" passHref legacyBehavior={false}>
             <div className="flex items-center">
               <Bug className="mr-2 h-4 w-4" />
               <span>Debug Info</span>
             </div>
           </Link>
         </DropdownMenuItem>
         )}

      </DropdownContent>
    </DropdownMenu>
  );
}
