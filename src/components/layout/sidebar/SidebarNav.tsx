// src/components/layout/sidebar/SidebarNav.tsx
"use client";
import React, { useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useUserSession } from '@/contexts/user-session-context';
import { NAV_ITEMS } from '@/lib/constants';
import type { NavItem } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { SidebarMenuButton } from '@/components/ui/sidebar';
import { getIcon } from '@/lib/getIcon'; // Assuming getIcon utility exists

export function SidebarNav() {
  const pathname = usePathname();
  const { isLoggedIn, userRole, viewAsStudent } = useUserSession();

  const renderNavItems = useCallback((itemsToRender: NavItem[]) => {
    return itemsToRender
      .filter(item => {
        // Filter items based on login status, role, and viewAsStudent preference
        if (item.requiresAuth && !isLoggedIn) return false;
        if (item.requiresTeacher && userRole !== 'teacher' && !viewAsStudent) return false;
        // If viewing as student, hide teacher-only items
        if (viewAsStudent && item.requiresTeacher) return false;
        return true;
      })
      .map(item => {
        const Icon = getIcon(item.icon);
        const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));

        if (item.children && item.children.length > 0) {
          // Render as Accordion if it has children
          // Determine the default open state for the accordion
          const isChildActive = item.children.some(child =>
            pathname === child.href || (child.href !== '/' && pathname?.startsWith(child.href))
          );
          const defaultValue = isChildActive ? item.label : undefined; // Open if any child is active

          return (
            <Accordion type="single" collapsible key={item.label} defaultValue={defaultValue}>
              <AccordionItem value={item.label} className="border-none">
                <AccordionTrigger className="data-[state=open]:bg-muted/30 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted/20 [&[data-state=open]>svg]:rotate-0">
                  <div className="flex items-center gap-3">
                    {Icon && <Icon className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />}
                    <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-0 pl-6 pr-2">
                  <div className="grid gap-1">
                    {renderNavItems(item.children)} {/* Recursively render children */}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          );
        } else {
          // Render as a simple link button
          return (
            <Link key={item.href} href={item.href} passHref>
              <SidebarMenuButton active={isActive} className="w-full">
                {Icon && <Icon className="h-5 w-5" />}
                <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
              </SidebarMenuButton>
            </Link>
          );
        }
      });
  }, [pathname, isLoggedIn, userRole, viewAsStudent]);

  return <>{renderNavItems(NAV_ITEMS)}</>;
}