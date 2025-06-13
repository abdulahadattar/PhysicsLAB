// src/components/layout/AppHeader.tsx
"use client";
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { AuthControl } from '@/features/auth/AuthControl';
import { GlobalSearch } from '@/features/search/GlobalSearch';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { Badge } from '@/components/ui/badge';
import { MenuIcon, WifiOff } from 'lucide-react';

export function AppHeader() {
  const { toggleSidebar } = useSidebar();
  const isOnline = useOnlineStatus();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleSidebar}>
        <MenuIcon className="h-5 w-5" />
      </Button>

      <GlobalSearch />

      <div className="flex items-center gap-2 sm:gap-3 ml-auto">
        {!isOnline && <Badge variant="destructive" className="hidden md:flex"><WifiOff className="h-4 w-4 mr-1" />Offline</Badge>}
        <AuthControl />
        <ThemeToggle />
      </div>
    </header>
  );
}