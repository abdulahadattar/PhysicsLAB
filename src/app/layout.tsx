
/*
👋 Gemini Code Generator Context:

This is the root layout file for the PhysicsLab application. It should include the necessary providers (like ThemeProvider and UserSessionContext) and handle initial setup.

According to the TODO list, this file is involved in implementing User Roles and Authentication using Firebase Authentication and Custom Claims. It should likely include logic to initialize the Firebase SDK and potentially listen for authentication state changes to manage user sessions and context.

The layout should also be responsive and adhere to accessibility guidelines (WCAG 2.1 Level AA).

Ensure proper integration with Tailwind CSS for styling and provide a basic structure that wraps the rest of the application.
*/
"use client";

import type {Metadata} from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { useEffect } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from "@/components/ui/toaster";
import { UserSessionProvider } from '@/contexts/user-session-context';
import Script from 'next/script';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => console.log('Service Worker registered:', registration))
        .catch((error) => console.error('Service Worker registration failed:', error));
    }
  }, []);
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <UserSessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </UserSessionProvider>
        <Toaster />
      </body>
    </html>
  );
}
