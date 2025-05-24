
'use client';
import { AppShell } from '@/components/layout/app-shell';
import { FunFactPanel } from '@/components/fun-fact-panel';
// Removed Button and useUserSession import as they are no longer needed here

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const { userRole, viewAsStudent, updateSession } = useUserSession(); // REMOVED - This logic is now in AppShell

  return (
    <AppShell>
      {children}
      <FunFactPanel />
      {/* The development mode view switcher is now handled entirely within AppShell's header DropdownMenu */}
    </AppShell>
  );
}
