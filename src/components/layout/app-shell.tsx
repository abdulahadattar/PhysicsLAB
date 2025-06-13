"use client";
import React from 'react';
import { useUserSession } from '@/contexts/user-session-context';
import { useGlobalErrorHandler } from '@/hooks/use-global-error-handler';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { cn } from "@/lib/utils";
import { Loader2, MenuIcon } from 'lucide-react';
import { AppSidebar } from './sidebar/AppSidebar';
import { AppHeader } from './AppHeader';
import { Button } from '../ui/button';
import { APP_NAME, APP_AUTHOR } from '@/lib/constants';

interface AppShellProps {
  children: React.ReactNode;
}

// This small, self-contained layout component can stay here.
const SidebarInset = React.forwardRef<HTMLDivElement, React.ComponentProps<"main">>(
  ({ className, ...props }, ref) => (
    <main ref={ref} className={cn("z-10 relative md:ml-[16rem] lg:ml-[20rem] flex flex-col min-h-screen", className)} {...props} />
  )
);
SidebarInset.displayName = "SidebarInset";

// This can also be a small, self-contained component here.
const PersistentToggleButton = () => {
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  if (isSidebarOpen) return null;
  return (
    <Button variant="outline" size="icon" onClick={toggleSidebar} className="fixed top-2 left-2 z-50 md:hidden">
      <MenuIcon className="h-5 w-5" />
    </Button>
  );
};


export function AppShell({ children }: AppShellProps) {
  const { isLoading: isSessionLoading, currentUser } = useUserSession();

  // Use the custom hooks at the top level
  useGlobalErrorHandler();

  if (isSessionLoading && !currentUser) {
    return (
      <div className="flex items-center justify-center h-screen text-lg font-medium text-muted-foreground">
        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
        Initializing PhysicsLab...
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <PersistentToggleButton />
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-muted/20">
          {children}
        </main>
        <footer className="border-t border-border/70 p-4 text-center text-xs text-muted-foreground">
          {APP_NAME} © {new Date().getFullYear()} {APP_AUTHOR}. All rights reserved.
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
