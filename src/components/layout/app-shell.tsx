
"use client";
import type { NavItem } from '@/lib/constants';
import { NAV_ITEMS, APP_NAME, APP_AUTHOR } from '@/lib/constants';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  // SidebarInset, // This was causing the SlotClone error, AppShell will now directly render SidebarInset
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Atom }  from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useTeacherMode } from '@/contexts/teacher-mode-context'; // Import the hook

interface AppShellProps {
  children: React.ReactNode;
}

// Re-define SidebarInset here as it was removed from ui/sidebar to avoid SlotClone error
// This is a simplified version for direct use in AppShell.
const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"main">
>(({ className, ...props }, ref) => {
  return (
    <main
      ref={ref}
      className={cn(
        "relative flex min-h-svh flex-1 flex-col bg-background",
        // These classes are specific to how sidebar variant="inset" interacts
        "peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))] md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow",
        className
      )}
      {...props}
    />
  )
})
SidebarInset.displayName = "SidebarInset"


export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { isTeacherMode, isLoading: isTeacherModeLoading } = useTeacherMode(); // Use the hook

  const renderNavItems = (items: NavItem[], isSubMenu = false) => {
    return items.map((item) => {
      // Conditionally render Teacher Panel based on isTeacherMode
      if (item.href === '/teacher-dashboard' && !isTeacherMode) {
        return null;
      }

      const isActive = item.matchExact ? pathname === item.href : pathname.startsWith(item.href);
      
      if (item.subItems && item.subItems.length > 0) {
        const isParentActive = item.subItems.some(subItem => pathname.startsWith(subItem.href));
        return (
          <Accordion type="single" collapsible className="w-full" key={item.href} defaultValue={isParentActive ? item.href : undefined}>
            <AccordionItem value={item.href} className="border-none">
              <AccordionTrigger 
                className={`w-full justify-start p-0 hover:no-underline [&[data-state=open]>svg:last-child]:rotate-180 group-data-[collapsible=icon]:justify-center ${isActive && !isParentActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''}`}
              >
                <SidebarMenuButton
                  asChild={true} // Keep asChild true here for AccordionTrigger
                  className="w-full"
                  isActive={isActive && !isParentActive && !isSubMenu} 
                  tooltip={item.label}
                >
                  {/* Wrap icon and label in a single element for asChild to work */}
                  <span className="flex items-center gap-2">
                    <item.icon />
                    <span>{item.label}</span>
                  </span>
                </SidebarMenuButton>
              </AccordionTrigger>
              <AccordionContent className="pb-0 group-data-[collapsible=icon]:hidden">
                 <SidebarMenuSub>
                  {item.subItems.map(subItem => (
                     <SidebarMenuSubItem key={subItem.href}>
                      <Link href={subItem.href} passHref legacyBehavior>
                        <SidebarMenuSubButton
                          asChild={false}
                          isActive={pathname === subItem.href}
                        >
                          <subItem.icon />
                          <span>{subItem.label}</span>
                        </SidebarMenuSubButton>
                      </Link>
                    </SidebarMenuSubItem>
                  ))}
                 </SidebarMenuSub>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        );
      }

      return (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href} passHref legacyBehavior>
            <SidebarMenuButton
              asChild={false}
              isActive={isActive && !isSubMenu}
              tooltip={item.label}
            >
              <item.icon />
              <span>{item.label}</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      );
    });
  };

  if (isTeacherModeLoading) {
    return <div>Loading application state...</div>; // Or a proper loading skeleton for the shell
  }

  return (
    <SidebarProvider defaultOpen>
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
             <Atom className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-semibold group-data-[collapsible=icon]:hidden">{APP_NAME}</h1>
          </div>
        </SidebarHeader>
        <ScrollArea className="flex-grow">
          <SidebarContent>
            <SidebarMenu>
              {renderNavItems(NAV_ITEMS)}
            </SidebarMenu>
          </SidebarContent>
        </ScrollArea>
        <SidebarFooter className="p-4 mt-auto group-data-[collapsible=icon]:justify-center">
          <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
            <Avatar>
              <AvatarImage src="https://placehold.co/40x40.png" alt={APP_AUTHOR} data-ai-hint="scientist portrait" />
              <AvatarFallback>{APP_AUTHOR.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{APP_AUTHOR}</p>
              <p className="text-xs text-muted-foreground">Teacher</p>
            </div>
          </div>
          <div className="group-data-[collapsible=icon]:hidden text-center text-xs text-muted-foreground mt-2">
            &copy; {new Date().getFullYear()} {APP_NAME}
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1">
            {/* Breadcrumbs or page title can go here */}
          </div>
          <ThemeToggle />
          {/* Optional User Dropdown if login is implemented */}
        </header>
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </main>
        <footer className="border-t p-4 text-center text-sm text-muted-foreground">
          PhysicsLab by {APP_AUTHOR}. Notes by Abdul Ahad Attar.
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
