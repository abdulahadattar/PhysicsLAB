
import type {Metadata} from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from "@/components/ui/toaster";
import { TeacherModeProvider } from '@/contexts/teacher-mode-context';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'PhysicsLab by Sir Abdul Ahad',
  description: 'Interactive Physics Demonstrations and Study Material for Grades 9-12, Sindh Textbook Board. Notes by Abdul Ahad Attar.',
  manifest: '/manifest.json', // Link to the manifest file
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* You might also want to add specific PWA meta tags here if needed, e.g., for iOS splash screens, though manifest covers a lot. */}
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <TeacherModeProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </TeacherModeProvider>
      </body>
    </html>
  );
}
