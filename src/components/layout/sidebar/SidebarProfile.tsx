// src/components/layout/sidebar/SidebarProfile.tsx
"use client";
import { useUserSession } from '@/contexts/user-session-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { APP_AUTHOR } from '@/lib/constants';
import { UserIcon } from 'lucide-react'; // Assuming lucide-react is used for icons

export function SidebarProfile() {
  const { currentUser, isLoggedIn, userRole, viewAsStudent } = useUserSession();

  // Only render if logged in
  if (!isLoggedIn || !currentUser) {
    return null; // Or some placeholder if desired
  }

  return (
    <div className="flex items-center gap-2.5 group-data-[collapsible=icon]:hidden">
        <Avatar>
          <AvatarImage src={currentUser.photoURL || ''} alt={currentUser.displayName || 'User Avatar'} />
          <AvatarFallback>
            {currentUser.displayName ? currentUser.displayName[0] : <UserIcon className="h-5 w-5" />}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-semibold truncate max-w-[120px]">
            {currentUser.displayName || 'User'}
          </span>
          <span className="text-xs text-muted-foreground truncate max-w-[120px]">
            {viewAsStudent ? 'Student View' : userRole === 'teacher' ? 'Teacher' : 'User'}
          </span>
        </div>
    </div>
  );
}