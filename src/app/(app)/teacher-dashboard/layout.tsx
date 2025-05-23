
"use client";

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useTeacherMode } from '@/contexts/teacher-mode-context';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state

export default function TeacherDashboardLayout({ children }: { children: ReactNode }) {
  const { isTeacherMode, isLoading } = useTeacherMode();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isTeacherMode) {
      // User is not in teacher mode and loading is complete, redirect them.
      // Display a message or redirect immediately.
      // For now, redirecting immediately.
      console.log("Access denied: Not in teacher mode. Redirecting to dashboard.");
      router.replace('/'); 
    }
  }, [isTeacherMode, isLoading, router]);

  if (isLoading) {
    // Show a loading state while teacher mode is being determined
    return (
        <div className="p-6 space-y-4">
            <Skeleton className="h-12 w-1/3" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
    );
  }

  if (!isTeacherMode) {
    // This content might flash briefly before redirection or if redirection fails.
    // Or, if preferred, return null here as well to avoid flashing content.
    return (
        <div className="p-6 text-center">
            <p>Redirecting...</p>
        </div>
    ); 
  }

  // If in teacher mode and not loading, render the children (teacher dashboard pages)
  return <>{children}</>;
}
