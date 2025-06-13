"use client";

import React from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { MenuIcon } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserNav } from './UserNav'; // Assuming UserNav will be another component

interface AppHeaderProps {
  isLoggedIn: boolean;
  userRole: 'student' | 'teacher' | null;
  viewAsStudent: boolean;
  currentUser: any; // TODO: Replace with proper user type
  // Add other necessary props like toggleViewAsStudent if it's handled here
}

export function AppHeader({
  isLoggedIn,
  userRole,
  viewAsStudent,
  currentUser,
}: AppHeaderProps) {
  const { setOpen } = useSidebar();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      {/* Mobile Sidebar Toggle */}
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden" onClick={() => setOpen(true)}>
            <MenuIcon className="h-5 w-5" />
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
        </SheetTrigger>
        {/* Sidebar content will be rendered here by the AppShell when Sheet is open */}
      </Sheet>

      {/* Desktop Header Content */}
      <div className="relative ml-auto flex flex-1 items-center gap-4 md:grow-0">
        {/* Search or other header elements could go here */}
        {/* <Input
          type="search"
          placeholder="Search..."
          className="w-full rounded-lg bg-background md:w-[200px] lg:w-[336px]"
        /> */}
      </div>

      <ThemeToggle />

      {/* User Navigation/Profile */}
      <UserNav 
        isLoggedIn={isLoggedIn}
        userRole={userRole}
        viewAsStudent={viewAsStudent}
        currentUser={currentUser}
        // Pass toggleViewAsStudent here if needed
      />

    </header>
  );
}