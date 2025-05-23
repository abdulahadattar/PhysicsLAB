
"use client";

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useUserSession } from '@/contexts/user-session-context'; // Updated import
import { Skeleton } from '@/components/ui/skeleton'; 

export default function TeacherDashboardLayout({ children }: { children: ReactNode }) {
  const { isLoggedIn, userRole, isLoading } = useUserSession(); // Updated hook
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!isLoggedIn || userRole !== 'teacher')) {
      console.log("Access denied: Not logged in as teacher. Redirecting to dashboard.");
      router.replace('/'); 
    }
  }, [isLoggedIn, userRole, isLoading, router]);

  if (isLoading) {
    return (
        <div className="p-6 space-y-4">
            <Skeleton className="h-12 w-1/3" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
    );
  }

  if (!isLoggedIn || userRole !== 'teacher') {
    return (
        <div className="p-6 text-center">
            <p>Redirecting...</p>
        </div>
    ); 
  }

  return <>{children}</>;
}
