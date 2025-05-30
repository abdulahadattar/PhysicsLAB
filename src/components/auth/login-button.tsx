"use client";

import React from 'react';
import { useUserSession } from '@/contexts/user-session-context';
import { Button } from '@/components/ui/button';

export function LoginButton() {
  const { isLoggedIn, signInWithGoogle, isLoading } = useUserSession();

  if (isLoading || isLoggedIn) {
    return null;
  }

  return (
    <Button onClick={signInWithGoogle} disabled={isLoading}>
      Login
    </Button>
  );
}