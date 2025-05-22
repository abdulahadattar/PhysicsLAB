import { AppShell } from '@/components/layout/app-shell';
import { FunFactPanel } from '@/components/fun-fact-panel';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell>
      {children}
      <FunFactPanel />
    </AppShell>
  );
}
