// src/components/layout/sidebar/AppSidebar.tsx
"use client";
import Link from 'next/link';
import { Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarMenu } from '@/components/ui/sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Atom } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';
import { SidebarNav } from './SidebarNav';
import { SidebarProfile } from './SidebarProfile';

export function AppSidebar() {
  return (
    <Sidebar className="z-40 border-r border-border/70 shadow-md">
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2.5 text-lg font-semibold text-primary">
          <Atom className="h-7 w-7 text-primary" />
          <h1 className="text-xl font-semibold transition-opacity duration-300 group-data-[collapsible=icon]:opacity-0">{APP_NAME}</h1>
        </Link>
      </SidebarHeader>
      <ScrollArea className="flex-grow px-2">
        <SidebarContent>
          <SidebarMenu className="space-y-1">
            <SidebarNav />
          </SidebarMenu>
        </SidebarContent>
      </ScrollArea>
      <SidebarFooter className="p-4 mt-auto space-y-2 border-t border-border/70">
        <SidebarProfile />
        <div className="text-center text-xs text-muted-foreground transition-opacity duration-300 group-data-[collapsible=icon]:opacity-0">
          © {new Date().getFullYear()} {APP_AUTHOR}.
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}