'use client';

import * as React from 'react';
import { useContext, useState, useEffect, useCallback } from 'react';
import { cn } from "@/lib/utils";

interface SidebarContextType {
  isSidebarOpen: boolean;
  isMobile: boolean;
  toggleSidebar: () => void;
  openMobileSidebar: () => void;
  closeMobileSidebar: () => void;
}

const SidebarContext = React.createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default to open on desktop
  const [isMobile, setIsMobile] = useState(false);
  const [openMobile, setOpenMobile] = useState(false); // State for mobile sidebar

  // Effect to detect mobile size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // Example breakpoint for 'md'
    };

    checkMobile(); // Check on mount
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = useCallback(() => {
    if (!isMobile) {
      setIsSidebarOpen(prev => !prev);
    } else {
      setOpenMobile(prev => !prev);
    }
  }, [isMobile]);

  const openMobileSidebar = useCallback(() => {
    if (isMobile) {
      setOpenMobile(true);
    }
  }, [isMobile]);

  const closeMobileSidebar = useCallback(() => {
    if (isMobile) {
      setOpenMobile(false);
    }
  }, [isMobile]);

  const contextValue = React.useMemo(() => ({
    isSidebarOpen: isMobile ? openMobile : isSidebarOpen, // Use mobile state if on mobile
    isMobile,
    toggleSidebar,
    openMobileSidebar,
    closeMobileSidebar,
  }), [isSidebarOpen, isMobile, openMobile, toggleSidebar, openMobileSidebar, closeMobileSidebar]);

  return (
    <SidebarContext.Provider value={contextValue}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}

// Basic visual components (can be enhanced later)

export function Sidebar({
  className,
  ...props
}: React.ComponentProps<'aside'> & { children?: React.ReactNode }) {
   const { isSidebarOpen, isMobile, closeMobileSidebar } = useSidebar();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex h-screen w-64 flex-col border-r bg-background transition-transform duration-300 ease-in-out",
        !isSidebarOpen && !isMobile && "-translate-x-full md:translate-x-0 md:w-[5rem]", // Collapsed state on desktop
        isMobile && !isSidebarOpen && "-translate-x-full", // Closed state on mobile
        isMobile && isSidebarOpen && "translate-x-0", // Open state on mobile
        "data-[collapsible=icon]:w-[5rem]", // Tailwind variant for icon-only state (needs config)
        className
      )}
      data-collapsible={!isSidebarOpen && !isMobile ? 'icon' : undefined}
      {...props}
    >
       {/* Overlay for mobile */}
       {isMobile && isSidebarOpen && (
           <div
               className="fixed inset-0 z-30 bg-black/50" onClick={closeMobileSidebar}
           ></div>
       )}
       {/* Render children inside the sidebar */}
       <div className="flex flex-col flex-grow z-40 bg-background">
           {props.children}
       </div>
    </aside>
  );
}

export function SidebarHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn("flex items-center p-4", className)} {...props} />;
}

export function SidebarContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn("flex-grow overflow-y-auto", className)} {...props} />;
}

export function SidebarFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn("p-4", className)} {...props} />;
}

export function SidebarMenu({ className, ...props }: React.ComponentProps<'nav'>) {
  return <nav className={cn("grid items-start gap-1", className)} {...props} />;
}

export function SidebarMenuItem({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn("", className)} {...props} />;
}

interface SidebarMenuButtonProps extends React.ComponentProps<'button'> {
  isActive?: boolean;
  asChild?: boolean; // To allow rendering as a Link or other component
}

export function SidebarMenuButton({
  className,
  isActive,
  asChild,
  children,
  ...props
}: SidebarMenuButtonProps) {
  const Comp = asChild ? 'div' : 'button'; // Use 'div' if asChild for wrapping Link
  return (
    <Comp
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-muted-foreground transition-all hover:text-primary",
        isActive && "bg-muted text-primary hover:text-primary",
        "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-3",
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}

export function SidebarTrigger({
  className,
  ...props
}: React.ComponentProps<'button'>) {
    const { toggleSidebar } = useSidebar();
  return (
    <button
      className={cn("md:hidden", className)}
      onClick={toggleSidebar}
      {...props}
    />
  );
}

// Re-export useSidebar for convenience
// export { useSidebar } from './sidebar-context'; // If context were in a separate file
