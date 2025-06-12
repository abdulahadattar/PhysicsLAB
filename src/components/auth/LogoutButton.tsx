typescriptreact
"use client";

import React from 'react';
import { useUserSession } from '@/contexts/user-session-context';
import { Button } from '@/components/ui/button';

export function LogoutButton() {
  const { isLoggedIn, signOutFirebase } = useUserSession();

  if (!isLoggedIn) {
    return null;
  }

  return (
    <Button onClick={signOutFirebase} variant="ghost">
      Logout
    </Button>
  );
}