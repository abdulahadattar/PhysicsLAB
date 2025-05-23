
"use client";
import type { NavItem } from '@/lib/constants';
import { NAV_ITEMS, APP_NAME, APP_AUTHOR } from '@/lib/constants';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react'; // Added useState
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarGroup,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Atom, LogIn, LogOut, UserCircle, Eye, EyeOff, UserPlus, UserCog } from 'lucide-react'; // Added UserCog
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useUserSession } from '@/contexts/user-session-context'; 
import { cn } from "@/lib/utils"; 
import { useToast } from '@/hooks/use-toast'; // Added useToast

interface AppShellProps {
  children: React.ReactNode;
}

const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"main">
>(({ className, ...props }, ref) => {
  return (
    <main
      ref={ref}
      className={cn(
        "relative flex min-h-svh flex-1 flex-col bg-background",
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
  const { isLoggedIn, userRole, viewAsStudent, login, logout, toggleViewAsStudent, isLoading } = useUserSession();
  const [isLoginFlowActive, setIsLoginFlowActive] = useState(false);
  const { toast } = useToast();

  const renderNavItems = (items: NavItem[], isSubMenu = false) => {
    return items.map((item) => {
      // Conditionally render Teacher Panel
      if (item.href === '/teacher-dashboard' && (!isLoggedIn || userRole !== 'teacher' || viewAsStudent)) {
        return null;
      }

      const isActive = item.matchExact ? pathname === item.href : pathname.startsWith(item.href);
      
      if (item.subItems && item.subItems.length > 0) {
        const isParentActive = item.subItems.some(subItem => pathname.startsWith(subItem.href));
        return (
          <Accordion type="single" collapsible className="w-full" key={item.href} defaultValue={isParentActive ? item.href : undefined}>
            <AccordionItem value={item.href} className="border-none">
              <AccordionTrigger 
                className={cn(
                  "w-full justify-start p-0 hover:no-underline [&[data-state=open]>svg:last-child]:rotate-180 group-data-[collapsible=icon]:justify-center",
                  isActive && !isParentActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''
                )}
                asChild
              >
                <SidebarMenuButton
                  asChild={true}
                  className="w-full"
                  isActive={isActive && !isParentActive && !isSubMenu}
                  tooltip={item.label}
                >
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
                          isActive={pathname.startsWith(subItem.href)} // Use startsWith for sub-items too
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

  if (isLoading) {
    // Or a more sophisticated loading skeleton for the shell
    return <div className="flex items-center justify-center h-screen text-lg">Loading Application...</div>; 
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
        <SidebarFooter className="p-4 mt-auto">
          <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
            <Avatar>
              <AvatarImage src={isLoggedIn && userRole === 'teacher' ? "https://placehold.co/40x40.png?text=TA" : "https://placehold.co/40x40.png?text=ST"} alt={isLoggedIn ? userRole || "User" : "Guest"} data-ai-hint="user avatar" />
              <AvatarFallback>{isLoggedIn ? (userRole === 'teacher' ? 'TA' : 'ST') : 'GU'}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{isLoggedIn ? (userRole === 'teacher' ? APP_AUTHOR : 'Student User') : 'Guest'}</p>
              <p className="text-xs text-muted-foreground">{isLoggedIn ? (userRole === 'teacher' ? (viewAsStudent ? 'Teacher (Student View)' : 'Teacher') : 'Student') : 'Not Logged In'}</p>
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
          <div className="flex items-center gap-2">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading user...</p>
            ) : !isLoggedIn ? (
              isLoginFlowActive ? (
                <>
                  <Button variant="default" size="sm" onClick={() => { 
                    login('student'); 
                    setIsLoginFlowActive(false);
                    toast({ title: "Logged In as Student", description: "New student accounts require teacher approval for full features."});
                  }}>
                    <UserCircle className="mr-2 h-4 w-4" /> Proceed as Student
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { login('teacher'); setIsLoginFlowActive(false); }}>
                    <UserCog className="mr-2 h-4 w-4" /> Proceed as Teacher
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setIsLoginFlowActive(false)}>Cancel</Button>
                </>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setIsLoginFlowActive(true)}>
                  <LogIn className="mr-2 h-4 w-4" /> Login / Create Account
                </Button>
              )
            ) : (
              <>
                <span className="text-sm text-muted-foreground">
                  Logged in as: <span className="font-semibold capitalize">{userRole}</span>
                  {userRole === 'teacher' && viewAsStudent && " (Student View)"}
                </span>
                {userRole === 'teacher' && (
                  <Button variant="outline" size="sm" onClick={toggleViewAsStudent}>
                    {viewAsStudent ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                    {viewAsStudent ? "Teacher View" : "Student View"}
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => { logout(); setIsLoginFlowActive(false);}}>
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
              </>
            )}
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </main>
        <footer className="border-t p-4 text-center text-sm text-muted-foreground">
          {APP_NAME} by {APP_AUTHOR}.
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
