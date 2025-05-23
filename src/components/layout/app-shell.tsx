
"use client";
import { NAV_ITEMS, APP_NAME, APP_AUTHOR, SIMULATION_TOPICS, QUIZ_TOPICS, SETTINGS_SEARCHABLE_KEYWORDS } from '@/lib/constants';
import { NavItem } from '@/lib/types';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarGroup,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton

} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Atom, LogIn, LogOut, UserCircle, Eye, EyeOff, UserCog, KeyRound, WifiOff, SearchIcon, XCircle, FileText, BookOpen, ListChecks, Settings as SettingsIcon } from 'lucide-react'; // Removed ChevronDown, it's part of Accordion
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserSession } from '@/contexts/user-session-context'; 
import { cn } from "@/lib/utils"; 
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input'; 
import { Label } from '@/components/ui/label'; 
import { Popover, PopoverTrigger, PopoverContent, PopoverAnchor } from '@/components/ui/popover';
import type { StudyGrade } from '@/lib/types';
import { Badge } from '../ui/badge';

/**
 * @fileOverview The main application shell component.
 * Renders the sidebar, header, main content area, and footer.
 * Manages global search functionality and simulated user login UI.
 */

interface AppShellProps {
  children: React.ReactNode;
}

/**
 * SidebarInset is a local redefinition to avoid a previous SlotClone error.
 * It's a simple main element styled to work with the inset sidebar variant.
 */
const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"main">
>(({ className, ...props }, ref) => {
  return (
    <main
      ref={ref}
      className={cn(
        "relative flex min-h-svh flex-1 flex-col bg-background",
        "peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))] md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow",
        className
      )}
      {...props}
    />
  )
})
SidebarInset.displayName = "SidebarInset"

interface SearchResult {
  id: string;
  label: string;
  href: string;
  category: string;
  icon?: React.ElementType;
  description?: string;
}


export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, isLoggedIn, userRole, viewAsStudent, signInWithGoogle, magicLogin, signOutFirebase, isLoading: isSessionLoading, isFirebaseConfigured, updateSession } = useUserSession();
  const [isLoginFlowActive, setIsLoginFlowActive] = useState(false);
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(true);

  const [debugUsername, setDebugUsername] = useState("");
  const [debugPassword, setDebugPassword] = useState("");

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [studyGradesData, setStudyGradesData] = useState<StudyGrade[]>([]);
  const [isLoadingSearchData, setIsLoadingSearchData] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  // Fetch study grades once on mount for search functionality
  const fetchStudyGradesForSearch = useCallback(async () => {
    if (studyGradesData.length > 0 || isLoadingSearchData) return; 
    setIsLoadingSearchData(true);
    try {
      const res = await fetch('/api/study-materials');
      if (res.ok) {
        const data = await res.json();
        setStudyGradesData(data);
      } else {
        console.warn("AppShell Search: Could not fetch study materials for indexing.");
      }
    } catch (e) {
      console.warn("AppShell Search: Error fetching study materials for indexing:", e);
    }
    setIsLoadingSearchData(false);
  }, [studyGradesData.length, isLoadingSearchData]);

  useEffect(() => {
    fetchStudyGradesForSearch(); // Fetch once when AppShell mounts
  }, [fetchStudyGradesForSearch]);


  const performSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearchOpen(false);
      return;
    }
    setIsSearchOpen(true);
    const lowerQuery = query.toLowerCase();
    const results: SearchResult[] = [];

    // Search Nav Items
    NAV_ITEMS.forEach(item => {
      if (item.label.toLowerCase().includes(lowerQuery)) {
        results.push({ id: item.href, label: item.label, href: item.href, category: 'Navigation', icon: item.icon });
      }
      item.subItems?.forEach((subItem: NavItem) => {
        if ((subItem as NavItem).label.toLowerCase().includes(lowerQuery)) {
          results.push({ id: subItem.href, label: `${item.label} > ${subItem.label}`, href: subItem.href, category: 'Navigation', icon: subItem.icon });
        }
      });
    });

    // Search Simulations
    SIMULATION_TOPICS.forEach(sim => {
      if (sim.name.toLowerCase().includes(lowerQuery) || sim.description.toLowerCase().includes(lowerQuery)) {
        results.push({ id: sim.id, label: sim.name, href: `/simulations/${sim.id}`, category: 'Simulation', icon: sim.icon, description: sim.description });
      }
    });

    // Search Quiz Topics
    QUIZ_TOPICS.forEach(quiz => {
      if (quiz.name.toLowerCase().includes(lowerQuery) || (quiz.description && quiz.description.toLowerCase().includes(lowerQuery))) {
        results.push({ id: quiz.id, label: quiz.name, href: `/quizzes/topic/${quiz.id}`, category: 'Quiz Topic', icon: ListChecks, description: quiz.description });
      }
    });
    
    // Search Study Materials (Grades, Chapters, and basic content)
    // Uses studyGradesData state which is fetched once on mount
    studyGradesData.forEach(grade => {
      if (grade.name.toLowerCase().includes(lowerQuery)) {
        results.push({ id: `grade-${grade.id}`, label: grade.name, href: `/study-material`, category: 'Study Grade', icon: BookOpen });
      }
      grade.chapters.forEach(chapter => {
        if (chapter.name.toLowerCase().includes(lowerQuery)) {
          results.push({ id: `chapter-${chapter.id}`, label: `${grade.name} > ${chapter.name}`, href: `/study-material/${grade.id}/${chapter.id}`, category: 'Study Chapter', icon: FileText });
        }
        const content = chapter.content;
        if (content) {
            if (content.keyPoints && content.keyPoints.toLowerCase().includes(lowerQuery)) {
                 results.push({ id: `chapter-kp-${chapter.id}`, label: `${chapter.name} (Key Points)`, href: `/study-material/${grade.id}/${chapter.id}`, category: 'Study Material - Key Point', icon: FileText });
            }
            content.mcqs?.forEach(mcq => {
                if(mcq.question.toLowerCase().includes(lowerQuery)) {
                    results.push({ id: `chapter-mcq-${mcq.id}`, label: `${chapter.name} (MCQ: ${mcq.question.substring(0,30)}...)`, href: `/study-material/${grade.id}/${chapter.id}`, category: 'Study Material - MCQ', icon: ListChecks });
                }
            });
             content.shortAnswers?.forEach(sa => {
                if(sa.question.toLowerCase().includes(lowerQuery)) {
                    results.push({ id: `chapter-sa-${sa.id}`, label: `${chapter.name} (Short Q: ${sa.question.substring(0,30)}...)`, href: `/study-material/${grade.id}/${chapter.id}`, category: 'Study Material - Short Answer', icon: ListChecks });
                }
            });
             content.longAnswers?.forEach(la => {
                if(la.question.toLowerCase().includes(lowerQuery)) {
                    results.push({ id: `chapter-la-${la.id}`, label: `${chapter.name} (Long Q: ${la.question.substring(0,30)}...)`, href: `/study-material/${grade.id}/${chapter.id}`, category: 'Study Material - Long Answer', icon: ListChecks });
                }
            });
        }
      });
    });

    // Search Settings Keywords
    // This is a client-side substring match for keywords related to settings.
    SETTINGS_SEARCHABLE_KEYWORDS.forEach(setting => {
        if(setting.term.toLowerCase().includes(lowerQuery) || setting.label.toLowerCase().includes(lowerQuery)) {
            if (!results.find(r => r.href === setting.href && r.category === 'Settings')) {
                 results.push({ id: `setting-${setting.term}`, label: setting.label, href: setting.href, category: 'Settings', icon: SettingsIcon });
            }
        }
    });

    // Simple deduplication based on href and label
    const uniqueResults = results.reduce((acc, current) => {
        const x = acc.find(item => item.href === current.href && item.label === current.label);
        if (!x) {
            return acc.concat([current]);
        } else {
            return acc;
        }
    }, [] as SearchResult[]);

    setSearchResults(uniqueResults.slice(0, 10)); // Limit to top 10 results
  }, [studyGradesData]); // Depends on the fetched studyGradesData

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm) {
        performSearch(searchTerm);
      } else {
        setSearchResults([]);
        setIsSearchOpen(false);
      }
    }, 300); // Debounce search by 300ms

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, performSearch]);


  const handleDebugLogin = async () => {
    if (!debugUsername || !debugPassword) {
        toast({ title: "Debug Login", description: "Please enter debug username and password.", variant: "destructive"});
        return;
    }
    const success = await magicLogin(debugUsername, debugPassword);
    if (success) {
        setIsLoginFlowActive(false); 
        setDebugUsername("");
        setDebugPassword("");
    }
  };

  /**
   * Renders navigation items.
   * Handles conditional rendering for teacher panel and active states.
   * For sub-menus, it uses ShadCN Accordion.
   */
  const renderNavItems = (items: NavItem[], isSubMenu = false) => {
    return items.map((item) => {
      // Conditional rendering for Teacher Panel
      if (item.href === '/teacher-dashboard' && (!isLoggedIn || userRole !== 'teacher' || viewAsStudent)) {
        return null;
      }

      const isActive = item.matchExact ? pathname === item.href : pathname.startsWith(item.href);
      
      if (item.subItems && item.subItems.length > 0) {
        const isParentActive = item.subItems.some(subItem => pathname.startsWith(subItem.href));
        return (
          <Accordion type="single" collapsible className="w-full" key={item.href} defaultValue={isParentActive ? item.href : undefined}>
            <AccordionItem value={item.href} className="border-none">
              <AccordionTrigger 
                className={cn(
                  "w-full justify-start p-0 hover:no-underline [&[data-state=open]>svg:last-child]:rotate-180 group-data-[collapsible=icon]:justify-center",
                  isActive && !isParentActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : '',
                )}
                asChild 
              >
                 <SidebarMenuButton
                    asChild={true} // This makes SidebarMenuButton pass its props to AccordionTrigger's button
                    className="w-full"
                    isActive={isActive && !isParentActive && !isSubMenu} 
                    tooltip={item.label}
                  >
                    {/* The content for the AccordionTrigger's button */}
                    <span className="flex w-full items-center justify-between">
                        <span className="flex items-center gap-2">
                            <item.icon />
                            <span>{item.label}</span>
                        </span>
                        {/* AccordionTrigger will add its own chevron here */}
                    </span>
                  </SidebarMenuButton>
              </AccordionTrigger>
              <AccordionContent className="pb-0 group-data-[collapsible=icon]:hidden">
                 <SidebarMenuSub>
                  {item.subItems.map(subItem => (
                     <SidebarMenuSubItem key={subItem.href}>
                      <Link href={subItem.href} passHref legacyBehavior>
                        <SidebarMenuSubButton
                          asChild={false}
                          isActive={pathname.startsWith(subItem.href)}
                        >
                          <subItem.icon />
                          <span>{subItem.label}</span>
                        </SidebarMenuSubButton>
                      </Link>
                    </SidebarMenuSubItem>
                  ))}
                 </SidebarMenuSub>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        );
      }

      return (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href} passHref legacyBehavior>
            <SidebarMenuButton
              asChild={false}
              isActive={isActive && !isSubMenu}
              tooltip={item.label}
            >
              <item.icon />
              <span>{item.label}</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      )
    });
  };

  if (isSessionLoading && !currentUser) { // Initial loading state for auth
    return <div className="flex items-center justify-center h-screen text-lg">Loading Application...</div>; 
  }

  return (
    <SidebarProvider defaultOpen>
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
             <Atom className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-semibold group-data-[collapsible=icon]:hidden">{APP_NAME}</h1>
          </div>
        </SidebarHeader>
        <ScrollArea className="flex-grow">
          <SidebarContent>
            <SidebarMenu>
              {renderNavItems(NAV_ITEMS)}
            </SidebarMenu>
          </SidebarContent>
        </ScrollArea>
        <SidebarFooter className="p-4 mt-auto">
          <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
            <Avatar>
              <AvatarImage src={currentUser?.photoURL || (isLoggedIn && userRole === 'teacher' ? "https://placehold.co/40x40.png?text=TA" : "https://placehold.co/40x40.png?text=ST")} alt={currentUser?.displayName || (isLoggedIn ? userRole || "User" : "Guest")} data-ai-hint="user avatar" />
              <AvatarFallback>
                {currentUser?.displayName ? currentUser.displayName.substring(0,2).toUpperCase() : (isLoggedIn ? (userRole === 'teacher' ? 'TA' : 'ST') : 'GU')}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{currentUser?.displayName || (isLoggedIn ? (userRole === 'teacher' ? APP_AUTHOR : 'Student User') : 'Guest')}</p>
              <p className="text-xs text-muted-foreground">{isLoggedIn ? (userRole === 'teacher' ? (viewAsStudent ? 'Teacher (Student View)' : 'Teacher') : 'Student') : 'Not Logged In'}</p>
            </div>
          </div>
           <div className="group-data-[collapsible=icon]:hidden text-center text-xs text-muted-foreground mt-2">
            &copy; {new Date().getFullYear()} {APP_NAME}
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
          <SidebarTrigger className="md:hidden" />
          
          <div className="relative flex-grow max-w-md"> {/* Search bar container */}
            <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                <PopoverAnchor asChild>
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                        type="search"
                        placeholder="Search app..."
                        className="pl-10 w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => setIsSearchOpen(true)}
                        onKeyDown={(e) => {
 if (e.key === 'Enter') { e.preventDefault(); /* Prevent form submission or other default Enter behavior */ }
 }}
                        />
                        {searchTerm && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                                onClick={() => { setSearchTerm(''); setSearchResults([]); setIsSearchOpen(false); }}
                                aria-label="Clear search"
                            >
                                <XCircle className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                            </Button>
                        )}
                    </div>
                </PopoverAnchor>
                {isSearchOpen && searchResults.length > 0 && (
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] max-h-[400px] overflow-y-auto p-1" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
                        <div className="flex flex-col gap-0.5">
                        {searchResults.map(result => {
                            const Icon = result.icon || FileText; // Default icon
                            return (
                            <Button
                                key={result.id}
                                variant="ghost"
                                className="w-full justify-start h-auto py-2 px-3 text-left"
                                onClick={() => {
                                router.push(result.href);
                                setSearchTerm('');
                                setSearchResults([]);
                                setIsSearchOpen(false);
                                }}
                            >
                                <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{result.label}</p>
                                    <p className="text-xs text-muted-foreground">{result.category}</p>
                                </div>
                            </Button>
                            );
                        })}
                        </div>
                    </PopoverContent>
                )}
                 {isSearchOpen && searchTerm && searchResults.length === 0 && !isLoadingSearchData && (
                     <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-4 text-center" align="start" onOpenAutoFocus={(e) => e.preventDefault()} forceMount>
                         <p className="text-sm text-muted-foreground">No results found for "{searchTerm}".</p>
                     </PopoverContent>
                 )}
            </Popover>
          </div>

          <div className="flex items-center gap-2 ml-auto"> {/* Login/Profile section */}
            {!isOnline && <Badge variant="destructive" className="hidden md:flex items-center"><WifiOff className="mr-1 h-3 w-3"/>Offline</Badge>}
            {isSessionLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : !isLoggedIn ? (
              isLoginFlowActive ? (
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  {/* Debug Login - shows if OFFLINE AND Firebase is NOT configured */}
                  { (!isOnline && !isFirebaseConfigured) && (
                    <Card className="p-3 w-full md:w-auto shadow-md">
                        <CardHeader className="p-0 mb-2">
                            <CardTitle className="text-sm flex items-center"><KeyRound className="mr-1 h-4 w-4"/> Offline Debug Login</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 space-y-2">
                            <div>
                                <Label htmlFor="debugUser" className="text-xs">Debug Username</Label>
                                <Input id="debugUser" value={debugUsername} onChange={(e) => setDebugUsername(e.target.value)} placeholder="debug_user" size={3} className="h-8"/>
                            </div>
                            <div>
                                <Label htmlFor="debugPass" className="text-xs">Debug Password</Label>
                                <Input id="debugPass" type="password" value={debugPassword} onChange={(e) => setDebugPassword(e.target.value)} placeholder="debug_pass" size={3} className="h-8"/>
                            </div>
                            <Button size="sm" onClick={handleDebugLogin} className="w-full h-8">Login (Debug)</Button>
                        </CardContent>
                    </Card>
                  )}
                   {/* Google Login - shows if ONLINE OR Firebase IS configured */}
                   { (isOnline || isFirebaseConfigured) && (
                     <Button variant="default" size="sm" onClick={async () => { if(isFirebaseConfigured) {await signInWithGoogle();} setIsLoginFlowActive(false); }} disabled={!isFirebaseConfigured && !isOnline}>
                      <UserCircle className="mr-2 h-4 w-4" /> Login with Google
                    </Button>
                   )}
                  <Button variant="ghost" size="sm" onClick={() => setIsLoginFlowActive(false)}>Cancel</Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setIsLoginFlowActive(true)}>
                  <LogIn className="mr-2 h-4 w-4" /> Login / Create Account
                </Button>
              )
            ) : ( // User is Logged In
              <>
                <span className="text-sm text-muted-foreground hidden md:inline">
                  {currentUser?.displayName || currentUser?.email || "User"} (<span className="font-semibold capitalize">{userRole}</span>
                  {userRole === 'teacher' && viewAsStudent && " (Student View)"})
                </span>
                {userRole === 'teacher' && updateSession && (
                  <Button variant="outline" size="sm" onClick={() => updateSession({ viewAsStudent: !viewAsStudent })}>
                    {viewAsStudent ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                    {viewAsStudent ? "Teacher View" : "Student View"} 
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={async () => { await signOutFirebase(); setIsLoginFlowActive(false);}}>
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
              </>
            )}
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </main>
        <footer className="border-t p-4 text-center text-sm text-muted-foreground">
          {APP_NAME} by {APP_AUTHOR}.
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
    