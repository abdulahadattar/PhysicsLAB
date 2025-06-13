"use client";

import React, { useCallback, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from "@/lib/utils";
import { Atom, ChevronDown, EyeIcon, EyeOffIcon, Users, UserCog, LogIn, LogOut, Bug } from 'lucide-react';
import { NAV_ITEMS, APP_NAME, APP_AUTHOR } from '@/lib/constants';
import type { NavItem } from '@/lib/types';

interface AppSidebarProps {
  isLoggedIn: boolean;
  userRole: 'student' | 'teacher' | null;
  viewAsStudent: boolean;
  currentUser: any; // TODO: Replace with proper user type
}

export function AppSidebar({
  isLoggedIn,
  userRole,
  viewAsStudent,
  currentUser,
}: AppSidebarProps) {
  const pathname = usePathname();

  const renderNavItems = useCallback((itemsToRender: NavItem[]) => {
    return itemsToRender.map((item) => {
      if (item.href === '/teacher-dashboard' && (!isLoggedIn || userRole !== 'teacher' || (userRole === 'teacher' && viewAsStudent))) {
        return null;
      }
      const isChildActive = item.subItems ? item.subItems.some(sub => pathname === sub.href || pathname?.startsWith(sub.href + '/')) : false;

      if (item.subItems && item.subItems.length > 0) {
        const accordionKey = item.label.replace(/\s+/g, '-').toLowerCase();
        return (
          <Accordion type="single" collapsible className="w-full" key={accordionKey} defaultValue={isChildActive ? accordionKey : undefined}>
            <AccordionItem value={accordionKey} className="border-none">
              <AccordionTrigger asChild>
                <SidebarMenuButton
                  className={cn(
                    "w-full justify-between transition-colors duration-150 ease-in-out",
                    "data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
                    isChildActive && "data-[state=closed]:text-primary data-[state=closed]:font-medium" // Parent highlight if child active
                  )}
                >
                  <span className="flex items-center gap-2">
                    <item.icon className="h-5 w-5" />
                    <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                  </span>
                  <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[collapsible=icon]:hidden ui-open:rotate-180" />
                </SidebarMenuButton>
              </AccordionTrigger>
              <AccordionContent className="pb-0 pt-1 pl-4 group-data-[collapsible=icon]:hidden animate-in slide-in-from-top-2 duration-200">
                <SidebarMenu className="border-l border-border/70 ml-[7px] pl-5 space-y-0.5">
                  {item.subItems.map(subItem => {
                    const isSubItemActive = pathname === subItem.href || pathname?.startsWith(subItem.href + '/');
                    return (
                      <SidebarMenuItem key={subItem.href}>
                        <Link href={subItem.href} passHref legacyBehavior={false}>
                          <SidebarMenuButton
                            asChild
                            isActive={isSubItemActive}
                            className="text-sm font-normal h-9"
                          >
                            <>
                              <subItem.icon className="h-4 w-4 mr-2.5" />
                              <span>{subItem.label}</span>
                            </>
                          </SidebarMenuButton>
                        </Link>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        );
      } else if (item.href && item.href !== '#') {
        const isDirectlyActive = item.matchExact ? pathname === item.href : (pathname === item.href || pathname?.startsWith(item.href + '/'));
        return (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href} passHref legacyBehavior={false}>
              <SidebarMenuButton
                asChild
                isActive={isDirectlyActive}
              >
                <>
                  <item.icon className="h-5 w-5" />
                  <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                </>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        );
      }
      return (
        <SidebarMenuItem key={item.label} className="opacity-50 cursor-not-allowed">
          <SidebarMenuButton className="pointer-events-none">
            <item.icon className="h-5 w-5" />
            <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    });
  }, [pathname, isLoggedIn, userRole, viewAsStudent]);

  return (
    <Sidebar className="z-40 border-r border-border/70 shadow-md transition-all duration-300 ease-in-out">
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2.5 group-data-[collapsible=icon]:justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md">
          <Atom className="h-7 w-7 text-primary" />
          <h1 className="text-xl font-semibold group-data-[collapsible=icon]:hidden tracking-tight">{APP_NAME}</h1>
        </Link>
      </SidebarHeader>
      <ScrollArea className="flex-grow px-2">
        <SidebarContent>
          <SidebarMenu className="space-y-1">
            {renderNavItems(NAV_ITEMS)}
          </SidebarMenu>
        </SidebarContent>
      </ScrollArea>
      <SidebarFooter className="p-4 mt-auto space-y-2 border-t border-border/70">
        <div className="flex items-center gap-2.5 group-data-[collapsible=icon]:hidden">
          <Avatar className="h-9 w-9">
            <AvatarImage src={currentUser?.photoURL || (isLoggedIn && userRole === 'teacher' ? "/placeholder-teacher.png" : "/placeholder-student.png")} alt={currentUser?.displayName || "User"} />
            <AvatarFallback className="font-semibold">
              {currentUser?.displayName ? currentUser.displayName.substring(0, 2).toUpperCase() : (isLoggedIn ? (userRole === 'teacher' ? (currentUser?.uid?.startsWith('debug-') ? "DT" : APP_AUTHOR.substring(0,1) + (APP_AUTHOR.split(" ")[1]?.substring(0,1) || 'A') ) : (currentUser?.uid?.startsWith('debug-') ? "DS" : 'ST') ) : 'GU')}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium truncate max-w-[120px]">{currentUser?.displayName || (isLoggedIn ? (userRole === 'teacher' ? (currentUser?.uid === 'debug-teacher' ? "Debug Teacher" : APP_AUTHOR) : (currentUser?.uid === 'debug-student' ? "Debug Student" : 'Student User')) : 'Guest')}</p>
            <p className="text-xs text-muted-foreground">
              {isLoggedIn ? (userRole === 'teacher' ? (viewAsStudent ? 'Teacher (Student View)' : 'Teacher') : 'Student') : 'Not Logged In'}
            </p>
          </div>
        </div>
        <div className="group-data-[collapsible=icon]:hidden text-center text-xs text-muted-foreground pt-2">
          © {new Date().getFullYear()} {APP_NAME}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}