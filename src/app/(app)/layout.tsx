'use client';
import { AppShell } from '@/components/layout/app-shell';
import { FunFactPanel } from '@/components/fun-fact-panel';
import { Button } from '@/components/ui/button';
import { useUserSession } from '@/contexts/user-session-context';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userRole, viewAsStudent, updateSession } = useUserSession();

  return (
    <AppShell>
      {children}
      <FunFactPanel />
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 z-50">
          {userRole === 'teacher' && updateSession && (
            <Button onClick={() => updateSession({ viewAsStudent: !viewAsStudent })}>
              Switch to {viewAsStudent ? 'Teacher' : 'Student'} View
            </Button>
          )}
          {userRole !== 'teacher' && (
             <Button disabled>Student Mode</Button>
          )}
        </div>
      )}
    </AppShell>
  );
}
