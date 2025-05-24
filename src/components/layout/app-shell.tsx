
"use client";
import { NAV_ITEMS, APP_NAME, APP_AUTHOR, SIMULATION_TOPICS, QUIZ_TOPICS, SETTINGS_SEARCHABLE_KEYWORDS, CURRICULUM_BOARDS } from '@/lib/constants';
import type { NavItem } from '@/lib/types';
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton

} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Atom, LogIn, LogOut, UserCircle, Eye, EyeOff, KeyRound, WifiOff, SearchIcon, XCircle, FileText, BookOpen,
  ListChecks, Settings as SettingsIcon, UserCog, Bug, ChevronDown, UsersRoundIcon, BarChart3, MessageSquare,
  FileEdit, FileArchive, NotebookText, CalendarDays, ClipboardList, BookCopy, Info, HelpCircle, Map,
  Ruler, Thermometer, Scale, ClockIcon, Waves, Heater, Sigma, BatteryCharging, Replace, TrendingUp,
  Weight, MoveVertical, Speaker, Projector, Zap, Network, Binary, Pipette, Magnet, LineChart, Move, Anchor,
  RefreshCw, GitCommitHorizontal, Sun, Telescope, GraduationCap, FlaskConical, PersonStanding, Orbit, Rocket,
  DraftingCompass, Microscope, SlidersHorizontal, Recycle, Milestone, SquareAsterisk, Dna, Bot, GitFork,
  BinaryIcon, AreaChart, ArrowDown, Box, Car, CircleDot, Hand, HeaterIcon, Leaf, Layers, Music2, MinusSquare,
  Plug, Radio, Satellite, Ship, BatteryWarning, Square, SquareRadical, StretchHorizontal, ThermometerSnowflake, Triangle
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserSession, type UserRole } from '@/contexts/user-session-context';
import { cn } from "@/lib/utils";
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverTrigger, PopoverContent, PopoverAnchor } from '@/components/ui/popover';
import type { StudyGrade, Chapter } from '@/lib/types';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


/**
 * @fileOverview The main application shell component.
 * Renders the sidebar, header, main content area, and footer.
 * Manages global search functionality and simulated user login UI.
 * Provides the core layout structure including a collapsible sidebar, a fixed header,
 * a main content area for routing, and a footer. It also integrates
 * authentication status display and a global search bar.
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
        // These classes are specific to how sidebar variant="inset" interacts
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

const STUDY_GRADES_SEARCH_CACHE_KEY = 'studyGradesSearchCache';

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, isLoggedIn, userRole, viewAsStudent, signInWithGoogle, magicLogin, signOutFirebase, isLoading: isSessionLoading, isFirebaseConfigured, debugSwitchRole, updateSession } = useUserSession();
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

  const fetchStudyGradesForSearch = useCallback(async (forceFetch = false) => {
    if (!forceFetch && studyGradesData.length > 0) return;
    if (isLoadingSearchData && !forceFetch) return;

    setIsLoadingSearchData(true);
    let loadedFromCache = false;

    try {
      const cachedDataString = localStorage.getItem(STUDY_GRADES_SEARCH_CACHE_KEY);
      if (cachedDataString) {
        const cachedData = JSON.parse(cachedDataString);
        if (cachedData && cachedData.length > 0) {
          setStudyGradesData(cachedData);
          loadedFromCache = true;
          if (!isOnline && !forceFetch) {
            setIsLoadingSearchData(false);
            return;
          }
        }
      }
    } catch (e) {
      console.warn("AppShell: Failed to parse study grades from localStorage cache:", e);
      localStorage.removeItem(STUDY_GRADES_SEARCH_CACHE_KEY);
    }

    if (!isOnline && !forceFetch && !loadedFromCache) {
      console.log("AppShell: Offline and no cached study grades for search.");
      setIsLoadingSearchData(false);
      return;
    }
    
    console.log("AppShell: Fetching study grades for search from API...");
    try {
      const res = await fetch('/api/study-materials');
      if (res.ok) {
        const data = await res.json();
        setStudyGradesData(data);
        localStorage.setItem(STUDY_GRADES_SEARCH_CACHE_KEY, JSON.stringify(data));
      } else {
        console.warn("AppShell Search: Could not fetch study materials for indexing from API. Status:", res.status);
        if (!loadedFromCache) toast({ title: "Search Data Limited", description: "Could not load full study material index.", variant: "default" });
      }
    } catch (e) {
      console.warn("AppShell Search: Error fetching study materials for indexing:", e);
      if (!loadedFromCache) toast({ title: "Search Data Error", description: "Error loading study material index.", variant: "destructive" });
    }
    setIsLoadingSearchData(false);
  }, [isOnline, studyGradesData.length, isLoadingSearchData, toast]);


  useEffect(() => {
    // Fetch study grades on mount if not already fetched by another component
    if (studyGradesData.length === 0 && isOnline && !isLoadingSearchData) {
      fetchStudyGradesForSearch();
    }
  }, [fetchStudyGradesForSearch, studyGradesData.length, isOnline, isLoadingSearchData]);


  const performSearch = useCallback((query: string) => {
    // Client-side search. For a "high budget" feel with fuzzy/semantic search,
    // consider libraries like Fuse.js (client-side fuzzy) or backend search engines (Algolia, MeiliSearch).
    // Current implementation: Substring matching.
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearchOpen(false);
      return;
    }
    setIsSearchOpen(true);
    const lowerQuery = query.toLowerCase();
    const results: SearchResult[] = [];

    // Search Navigation Items
    NAV_ITEMS.forEach(item => {
      if (item.label.toLowerCase().includes(lowerQuery)) {
        results.push({ id: `nav-${item.href}`, label: item.label, href: item.href, category: 'Navigation', icon: item.icon });
      }
      item.subItems?.forEach(subItem => {
        if (subItem.label.toLowerCase().includes(lowerQuery)) {
          results.push({ id: `nav-${subItem.href}`, label: `${item.label} > ${subItem.label}`, href: subItem.href, category: 'Navigation', icon: subItem.icon });
        }
      });
    });

    // Search Simulations
    SIMULATION_TOPICS.forEach(sim => {
      let match = false;
      if (sim.name.toLowerCase().includes(lowerQuery)) match = true;
      if (sim.description && sim.description.toLowerCase().includes(lowerQuery)) match = true;
      if (sim.categories && sim.categories.some(cat => cat.toLowerCase().includes(lowerQuery))) match = true;
      
      if (match) {
        results.push({ id: `sim-${sim.id}`, label: sim.name, href: `/simulations/${sim.id}`, category: 'Simulation', icon: sim.icon, description: sim.description });
      }
    });

    // Search Quiz Topics
    QUIZ_TOPICS.forEach(quiz => {
      if (quiz.name.toLowerCase().includes(lowerQuery) || (quiz.description && quiz.description.toLowerCase().includes(lowerQuery))) {
        results.push({ id: `quiz-${quiz.id}`, label: quiz.name, href: `/quizzes/topic/${quiz.id}`, category: 'Quiz Topic', icon: ListChecks, description: quiz.description });
      }
    });

    // Search Study Materials (Grades, Chapters, Basic Content)
    if (studyGradesData && studyGradesData.length > 0) {
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
              if (mcq.question.toLowerCase().includes(lowerQuery)) {
                results.push({ id: `chapter-mcq-${mcq.id}`, label: `${chapter.name} (MCQ: ${mcq.question.substring(0, 30)}...)`, href: `/study-material/${grade.id}/${chapter.id}`, category: 'Study Material - MCQ', icon: ListChecks });
              }
            });
            content.shortAnswers?.forEach(sa => {
              if (sa.question.toLowerCase().includes(lowerQuery)) {
                results.push({ id: `chapter-sa-${sa.id}`, label: `${chapter.name} (Short Q: ${sa.question.substring(0, 30)}...)`, href: `/study-material/${grade.id}/${chapter.id}`, category: 'Study Material - Short Answer', icon: ListChecks });
              }
            });
            content.longAnswers?.forEach(la => {
              if (la.question.toLowerCase().includes(lowerQuery)) {
                results.push({ id: `chapter-la-${la.id}`, label: `${chapter.name} (Long Q: ${la.question.substring(0, 30)}...)`, href: `/study-material/${grade.id}/${chapter.id}`, category: 'Study Material - Long Answer', icon: ListChecks });
              }
            });
          }
        });
      });
    }

    // Search Settings Keywords
    SETTINGS_SEARCHABLE_KEYWORDS.forEach(setting => {
      if (setting.term.toLowerCase().includes(lowerQuery) || setting.label.toLowerCase().includes(lowerQuery)) {
        results.push({ id: `setting-${setting.term}`, label: setting.label, href: setting.href, category: 'Settings', icon: SettingsIcon });
      }
    });

    // Deduplicate results (simple href based, could be more sophisticated)
    const uniqueResults = results.reduce((acc, current) => {
      const x = acc.find(item => item.href === current.href && item.label === current.label);
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, [] as SearchResult[]);

    setSearchResults(uniqueResults.slice(0, 10)); // Limit to 10 results
  }, [studyGradesData]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm.trim()) {
        performSearch(searchTerm);
      } else {
        setSearchResults([]);
        setIsSearchOpen(false);
      }
    }, 300); // Debounce search

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, performSearch]);

  const handleDebugLogin = useCallback(async () => {
    if (!debugUsername || !debugPassword) {
      toast({ title: "Debug Login", description: "Please enter debug username and password.", variant: "destructive" });
      return;
    }
    if (magicLogin) { // magicLogin is part of UserSessionContext
      const success = await magicLogin(debugUsername, debugPassword);
      if (success) {
        setIsLoginFlowActive(false);
        setDebugUsername("");
        setDebugPassword("");
      }
    }
  }, [debugUsername, debugPassword, magicLogin, toast]);

  const renderNavItems = useCallback((items: NavItem[]) => {
    return items.map((item) => {
      // Hide Teacher Panel if not logged in as teacher OR if teacher is viewing as student
      if (item.href === '/teacher-dashboard' && (!isLoggedIn || userRole !== 'teacher' || (userRole === 'teacher' && viewAsStudent))) {
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
                  "w-full justify-start p-0 hover:no-underline [&[data-state=open]>svg:last-child]:rotate-180",
                  isActive && !isParentActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : '',
                )}
                asChild={true} // Pass down props to SidebarMenuButton
              >
                 <SidebarMenuButton
                  asChild={true}
                  className="w-full"
                  isActive={isActive && !isParentActive} // Active if direct link, not if sub-item is active
                  tooltip={item.label}
                >
                  <span className="flex w-full items-center justify-between"> {/* Single child for AccordionTrigger */}
                    <span className="flex items-center gap-2">
                      <item.icon />
                      <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                    </span>
                    {/* Chevron will be rendered by AccordionTrigger itself */}
                  </span>
                </SidebarMenuButton>
              </AccordionTrigger>
              <AccordionContent className="pb-0 group-data-[collapsible=icon]:hidden">
                <SidebarMenuSub>
                  {item.subItems.map(subItem => (
                    <SidebarMenuSubItem key={subItem.href}>
                      <Link href={subItem.href} passHref legacyBehavior>
                        <SidebarMenuSubButton
                          asChild={false} // Link is the child, not the button itself
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
              isActive={isActive}
              tooltip={item.label}
            >
              <item.icon />
              <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      )
    });
  }, [pathname, isLoggedIn, userRole, viewAsStudent]); // Added dependencies

  if (isSessionLoading && !currentUser) { // Show loader if session is loading and no user data yet
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
        <SidebarFooter className="p-4 mt-auto space-y-2">
          <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
            <Avatar>
              <AvatarImage src={currentUser?.photoURL || (isLoggedIn && userRole === 'teacher' ? "https://placehold.co/40x40.png?text=TA" : "https://placehold.co/40x40.png?text=ST")} alt={currentUser?.displayName || (isLoggedIn ? (userRole || "User") : "Guest")} data-ai-hint="user avatar"/>
              <AvatarFallback>
                {currentUser?.displayName ? currentUser.displayName.substring(0, 2).toUpperCase() : (isLoggedIn ? (userRole === 'teacher' ? 'TA' : 'ST') : 'GU')}
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

          {/* Global Search Bar */}
          <div className="relative flex-grow max-w-md">
             <Popover open={isSearchOpen} onOpenChange={(open) => { if(!open) { setSearchTerm(''); setSearchResults([]);} setIsSearchOpen(open);}}>
              <PopoverAnchor asChild>
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search app..."
                    className="pl-10 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => {
                        if (searchTerm) setIsSearchOpen(true);
                        if (studyGradesData.length === 0 && isOnline && !isLoadingSearchData) fetchStudyGradesForSearch(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchResults.length > 0 && searchResults[0].href) {
                        e.preventDefault();
                        router.push(searchResults[0].href);
                        setSearchTerm('');
                        setSearchResults([]);
                        setIsSearchOpen(false);
                      }
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
                      const Icon = result.icon || FileText;
                      return (
                        <Button
                          key={result.id}
                          variant="ghost"
                          className="w-full justify-start h-auto py-2 px-3 text-left"
                          onClick={() => {
                            if (result.href) router.push(result.href);
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


          <div className="flex items-center gap-2 ml-auto">
            {!isOnline && <Badge variant="destructive" className="hidden md:flex items-center"><WifiOff className="mr-1 h-3 w-3" />Offline</Badge>}
            
            {process.env.NODE_ENV === 'development' && debugSwitchRole && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Bug className="mr-2 h-4 w-4" />
                    Dev View
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => debugSwitchRole(null)}>
                    <UserCircle className="mr-2 h-4 w-4" /> Guest View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => debugSwitchRole('student')}>
                    <UserCircle className="mr-2 h-4 w-4" /> Student View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => debugSwitchRole('teacher')}>
                    <UserCog className="mr-2 h-4 w-4" /> Teacher View
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {isSessionLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : !isLoggedIn ? (
              isLoginFlowActive ? (
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  {(!isOnline && !isFirebaseConfigured) && (
                    <Card className="p-3 w-full md:w-auto shadow-md">
                      <CardHeader className="p-0 mb-2">
                        <CardTitle className="text-sm flex items-center"><KeyRound className="mr-1 h-4 w-4" /> Offline Debug Login</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0 space-y-2">
                        <div>
                          <Label htmlFor="debugUser" className="text-xs">Debug Username</Label>
                          <Input id="debugUser" value={debugUsername} onChange={(e) => setDebugUsername(e.target.value)} placeholder="debug_user" size={3} className="h-8" />
                        </div>
                        <div>
                          <Label htmlFor="debugPass" className="text-xs">Debug Password</Label>
                          <Input id="debugPass" type="password" value={debugPassword} onChange={(e) => setDebugPassword(e.target.value)} placeholder="debug_pass" size={3} className="h-8" />
                        </div>
                        <Button size="sm" onClick={handleDebugLogin} className="w-full h-8">Login (Debug)</Button>
                      </CardContent>
                    </Card>
                  )}
                   {isFirebaseConfigured && (
                     <Button variant="default" size="sm" onClick={async () => { if (signInWithGoogle) { await signInWithGoogle(); setIsLoginFlowActive(false); } else if (!isFirebaseConfigured) { toast({ title: "Firebase Not Configured", description: "Google Sign-In is unavailable. Please set up Firebase environment variables.", variant: "destructive"}); } }} disabled={!isFirebaseConfigured && !isOnline}>
                       <LogIn className="mr-2 h-4 w-4" /> Sign in with Google
                     </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => { setIsLoginFlowActive(false); setDebugUsername(""); setDebugPassword(""); }}>Cancel</Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setIsLoginFlowActive(true)}>
                  <LogIn className="mr-2 h-4 w-4" /> Login / Create Account
                </Button>
              )
            ) : ( 
              <>
                <span className="text-sm text-muted-foreground hidden md:inline">
                  {currentUser?.displayName || currentUser?.email || "User"} (<span className="font-semibold capitalize">{userRole}</span>
                  {userRole === 'teacher' && viewAsStudent && " (Student View)"})
                </span>
                {userRole === 'teacher' && updateSession && (
                  <Button variant="outline" size="sm" onClick={() => { if (updateSession) updateSession({ viewAsStudent: !viewAsStudent });}}>
                    {viewAsStudent ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                    {viewAsStudent ? "Teacher View" : "Student View"}
                  </Button>
                )}
                {signOutFirebase && ( 
                    <Button variant="ghost" size="sm" onClick={async () => { await signOutFirebase(); setIsLoginFlowActive(false); }}>
                        <LogOut className="mr-2 h-4 w-4" /> Logout
                    </Button>
                )}
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
