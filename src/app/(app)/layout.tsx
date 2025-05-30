
'use client';
import { AppShell } from '@/components/layout/app-shell';
import { FunFactPanel } from '@/components/fun-fact-panel';
import { useEffect } from 'react';
// Removed Button and useUserSession import as they are no longer needed here

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const { userRole, viewAsStudent, updateSession } = useUserSession(); // REMOVED - This logic is now in AppShell

  // Register Service Worker for PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <AppShell>
      {children}
      <FunFactPanel />
      {/* The development mode view switcher is now handled entirely within AppShell's header DropdownMenu */}
    </AppShell>
  );
}
