// /home/user/PhysicsLAB/src/components/layout/app-shell.tsx
"use client";
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from "@/components/ui/accordion";
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation'; // Removed useSearchParams if not directly used here
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  SidebarProvider,
  Sidebar, SidebarHeader, SidebarContent, SidebarFooter,
  SidebarMenu,
  SidebarMenuButton, // Assuming this is your custom enhanced button
  // SidebarTrigger, // Not explicitly used here, SidebarProvider handles toggle
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'; // Assuming SidebarMenuButton is exported from here
import {
  Atom, Eye as EyeIcon, EyeOff as EyeOffIcon, KeyRound, WifiOff, SearchIcon as SearchLIcon, // Renamed to avoid conflict
  XCircle, BookOpen, ListChecks, Settings as SettingsIcon, UserCog, Bug, ChevronDown, MessageSquare,
  FileTextIcon, NotebookText, Info, HelpCircle, Map, MenuIcon, LogIn, LogOut, Users, Loader2, Milestone,
  BrainCircuit, FileArchive, Beaker, TestTubeDiagonal, Brain, Telescope, GraduationCap, FlaskConical, Globe, Sparkles, LayoutDashboard, Orbit, Edit,
} from 'lucide-react';
import { NAV_ITEMS, APP_NAME, APP_AUTHOR, SIMULATION_TOPICS, QUIZ_TOPICS, SETTINGS_SEARCHABLE_KEYWORDS } from '@/lib/constants';
import type { NavItem } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserSession } from '@/contexts/user-session-context';
import { cn } from "@/lib/utils";
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverTrigger, PopoverContent, PopoverAnchor } from '@/components/ui/popover';
import type { StudyGrade } from '@/lib/types'; // Chapter not directly used here
import { Badge } from '../ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel
} from "@/components/ui/dropdown-menu";

interface AppShellProps {
  children: React.ReactNode;
}

const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"main">
>(({ className, ...props }, ref) => {
  return (
    <main
      ref={ref}
      className={cn("z-10",
        "relative flex min-h-svh flex-1 flex-col bg-background transition-all duration-300 ease-in-out", // Added transition
        "peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))] md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-lg", // Enhanced shadow
        className
      )}
      {...props}
    />
  )
});
SidebarInset.displayName = "SidebarInset";

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
  const {
    currentUser, isLoggedIn, userRole, viewAsStudent, signInWithGoogle, magicLogin,
    signOutFirebase, isLoading: isSessionLoading, isFirebaseConfigured, debugSwitchRole, toggleViewAsStudent,
  } = useUserSession();
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(true);
  const [isLoginFlowActive, setIsLoginFlowActive] = useState(false);
  const [debugUsername, setDebugUsername] = useState("");
  const [debugPassword, setDebugPassword] = useState("");
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [studyGradesData, setStudyGradesData] = useState<StudyGrade[]>([]);
  const [isLoadingSearchData, setIsLoadingSearchData] = useState(false);
  const { isSidebarOpen, toggleSidebar } = useSidebar(); // Get sidebar state for header button

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

  useEffect(() => {
    function handleError(event: ErrorEvent) {
      const errorMsg = `[${new Date().toISOString()}] JS Error: ${event.message}\nSource: ${event.filename}\nLine: ${event.lineno}, Col: ${event.colno}\nStack: ${event.error?.stack || 'N/A'}\n---\n`;
      fetch('/api/log-error', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: errorMsg })
      }).catch(console.error);
    }
    function handleRejection(event: PromiseRejectionEvent) {
      const errorMsg = `[${new Date().toISOString()}] Unhandled Promise Rejection: ${event.reason?.message || event.reason}\nStack: ${event.reason?.stack || 'N/A'}\n---\n`;
      fetch('/api/log-error', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: errorMsg })
      }).catch(console.error);
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('error', handleError);
      window.addEventListener('unhandledrejection', handleRejection);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('error', handleError);
        window.removeEventListener('unhandledrejection', handleRejection);
      }
    };
  }, []);

  const fetchStudyGradesForSearch = useCallback(async () => {
    if (studyGradesData.length > 0) return;
    setIsLoadingSearchData(true);
    let loadedFromCache = false;
    if (typeof window !== 'undefined') {
      try {
        const cachedDataString = localStorage.getItem(STUDY_GRADES_SEARCH_CACHE_KEY);
        if (cachedDataString) {
          const cachedData = JSON.parse(cachedDataString);
          if (cachedData && cachedData.length > 0) {
            setStudyGradesData(cachedData);
            loadedFromCache = true;
          }
        }
      } catch (e) {
        console.warn("AppShell Search: Failed to parse study grades from localStorage:", e);
        if (typeof window !== 'undefined') localStorage.removeItem(STUDY_GRADES_SEARCH_CACHE_KEY);
      }
    }
    if (isOnline) {
      try {
        const res = await fetch('/api/study-materials');
        if (res.ok) {
          const data = await res.json();
          setStudyGradesData(data);
          if (typeof window !== 'undefined') {
            localStorage.setItem(STUDY_GRADES_SEARCH_CACHE_KEY, JSON.stringify(data));
          }
        } else if (!loadedFromCache) {
          toast({ title: "Search Data Limited", description: "Could not load full study material index. Some results may be missing.", variant: "default" });
        }
      } catch (e) {
        console.error("AppShell Search: Error fetching study materials:", e);
        if (!loadedFromCache) {
          toast({ title: "Search Data Error", description: "Error loading study material index. Search may be incomplete.", variant: "destructive" });
        }
      }
    }
    setIsLoadingSearchData(false);
  }, [isOnline, toast, studyGradesData.length]);

  useEffect(() => {
    fetchStudyGradesForSearch();
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

    NAV_ITEMS.forEach(item => {
      if (item.label.toLowerCase().includes(lowerQuery)) {
        results.push({ id: `nav-${item.href || item.label}`, label: item.label, href: item.href === '#' ? (item.subItems && item.subItems.length > 0 ? item.subItems[0].href : '/') : item.href, category: 'Navigation', icon: item.icon });
      }
      item.subItems?.forEach(subItem => {
        if (subItem.label.toLowerCase().includes(lowerQuery)) {
          results.push({ id: `nav-${subItem.href}`, label: `${item.label} > ${subItem.label}`, href: subItem.href, category: 'Navigation', icon: subItem.icon });
        }
      });
    });

    SIMULATION_TOPICS.forEach(sim => {
      let match = sim.name.toLowerCase().includes(lowerQuery) ||
                  (sim.description && sim.description.toLowerCase().includes(lowerQuery)) ||
                  (sim.categories && sim.categories.some(cat => cat.toLowerCase().includes(lowerQuery)));
      if (match) {
        results.push({ id: `sim-${sim.id}`, label: sim.name, href: `/simulations/${sim.id}`, category: 'Simulation', icon: sim.icon, description: sim.description });
      }
    });

    QUIZ_TOPICS.forEach(quiz => {
      if (quiz.name.toLowerCase().includes(lowerQuery) || (quiz.description && quiz.description.toLowerCase().includes(lowerQuery))) {
        results.push({ id: `quiz-${quiz.id}`, label: quiz.name, href: `/quizzes/topic/${quiz.id}`, category: 'Quiz Topic', icon: ListChecks, description: quiz.description });
      }
    });

    if (studyGradesData && studyGradesData.length > 0) {
      studyGradesData.forEach((grade, gradeIndex) => {
        if (grade.name.toLowerCase().includes(lowerQuery)) {
          results.push({ id: `grade-${grade.id}`, label: grade.name, href: `/study-material`, category: 'Study Grade', icon: BookOpen });
        }
        (grade.chapters || []).forEach((chapter, chapterIndex) => {
          if (chapter.name.toLowerCase().includes(lowerQuery)) {
            results.push({ id: `chapter-${chapter.id}`, label: `${grade.name} > ${chapter.name}`, href: `/study-material/${grade.id}/${chapter.id}`, category: 'Study Chapter', icon: FileTextIcon });
          }
          const content = chapter.content;
          if (content) {
            if (content.keyPoints && content.keyPoints.toLowerCase().includes(lowerQuery)) {
              results.push({ id: `chapter-kp-${chapter.id}`, label: `${chapter.name} (Key Points)`, href: `/study-material/${grade.id}/${chapter.id}`, category: 'Study Material - Key Point', icon: FileTextIcon });
            }
            // Updated to handle missing 'id' for mcqs, shortAnswers, longAnswers
            (content.mcqs || []).forEach((mcq, mcqIndex) => {
              if (mcq.question.toLowerCase().includes(lowerQuery)) {
                // Use chapter.id and index if mcq.id is missing
                const resultId = mcq.id ? `chapter-mcq-${mcq.id}` : `chapter-${chapter.id}-mcq-${mcqIndex}`;
                results.push({ id: resultId, label: `${chapter.name} (MCQ: ${mcq.question.substring(0, 30)}...)`, href: `/study-material/${grade.id}/${chapter.id}`, category: 'Study Material - MCQ', icon: ListChecks });
              }
            });
            (content.shortAnswers || []).forEach((sa, saIndex) => {
              if (sa.question.toLowerCase().includes(lowerQuery)) {
                const resultId = sa.id ? `chapter-sa-${sa.id}` : `chapter-${chapter.id}-sa-${saIndex}`;
                results.push({ id: resultId, label: `${chapter.name} (Short Q: ${sa.question.substring(0, 30)}...)`, href: `/study-material/${grade.id}/${chapter.id}`, category: 'Study Material - Short Answer', icon: ListChecks });
              }
            });
            (content.longAnswers || []).forEach((la, laIndex) => {
              if (la.question.toLowerCase().includes(lowerQuery)) {
                const resultId = la.id ? `chapter-la-${la.id}` : `chapter-${chapter.id}-la-${laIndex}`;
                results.push({ id: resultId, label: `${chapter.name} (Long Q: ${la.question.substring(0, 30)}...)`, href: `/study-material/${grade.id}/${chapter.id}`, category: 'Study Material - Long Answer', icon: ListChecks });
              }
            });
          }
        });
      });
    }

    SETTINGS_SEARCHABLE_KEYWORDS.forEach(setting => {
      if (setting.term.toLowerCase().includes(lowerQuery) || setting.label.toLowerCase().includes(lowerQuery)) {
        results.push({ id: `setting-${setting.term}`, label: setting.label, href: setting.href, category: 'Settings', icon: SettingsIcon });
      }
    });

    const uniqueResults = results.reduce((acc, current) => {
      if (!acc.find(item => item.href === current.href && item.label === current.label)) {
        acc.push(current);
      }
      return acc;
    }, [] as SearchResult[]);
    setSearchResults(uniqueResults.slice(0, 10));
  }, [studyGradesData]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm.trim()) {
        performSearch(searchTerm);
      } else {
        setSearchResults([]);
        setIsSearchOpen(false);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm, performSearch]);

  const handleDebugLogin = useCallback(async () => {
    if (!debugUsername || !debugPassword) {
      toast({ title: "Debug Login", description: "Please enter debug username and password.", variant: "destructive" });
      return;
    }
    if (magicLogin) {
      const success = await magicLogin(debugUsername, debugPassword);
      if (success) {
        setIsLoginFlowActive(false);
        setDebugUsername("");
        setDebugPassword("");
      }
    }
  }, [debugUsername, debugPassword, magicLogin, toast]);

  const renderNavItems = useCallback((itemsToRender: NavItem[]) => {
    return itemsToRender.map((item) => {
      if (item.href === '/teacher-dashboard' && (!isLoggedIn || userRole !== 'teacher' || (userRole === 'teacher' && viewAsStudent))) {
        return null;
      }
      const isChildActive = item.subItems ? item.subItems.some(sub => pathname === sub.href || pathname?.startsWith(sub.href + '/')) : false;

      if (item.subItems && item.subItems.length > 0) {
        const accordionKey = item.label.replace(/\s+/g, '-').toLowerCase();
        return (
          <Accordion type="single" collapsible className="w-full" key={accordionKey} defaultValue={isChildActive ? accordionKey : undefined}>
            <AccordionItem value={accordionKey} className="border-none">
              <AccordionTrigger asChild>
                <SidebarMenuButton
                  className={cn(
                    "w-full justify-between transition-colors duration-150 ease-in-out",
                    "data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
                    isChildActive && !isDirectlyActive && "data-[state=closed]:text-primary data-[state=closed]:font-medium" // Parent highlight if child active
                  )}
                  // `isActive` prop might not be needed if styling is based on data-state and `isChildActive`
                >
                  <span className="flex items-center gap-2">
                    <item.icon className="h-5 w-5" />
                    <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                  </span>
                  <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[collapsible=icon]:hidden ui-open:rotate-180" />
                </SidebarMenuButton>
              </AccordionTrigger>
              <AccordionContent className="pb-0 pt-1 pl-4 group-data-[collapsible=icon]:hidden animate-in slide-in-from-top-2 duration-200">
                <SidebarMenu className="border-l border-border/70 ml-[7px] pl-5 space-y-0.5">
                  {item.subItems.map(subItem => {
                    const isSubItemActive = pathname === subItem.href || pathname?.startsWith(subItem.href + '/');
                    return (
                      <SidebarMenuItem key={subItem.href}>
                        <Link href={subItem.href} passHref legacyBehavior={false}>
                          <SidebarMenuButton
                            asChild
                            isActive={isSubItemActive}
                            className="text-sm font-normal h-9" // Explicitly smaller for sub-items
                            // tooltip={subItem.label} // Tooltips might be too noisy for sub-items unless sidebar is collapsed
                          >
                            <>
                              <subItem.icon className="h-4 w-4 mr-2.5" />
                              <span>{subItem.label}</span>
                            </>
                          </SidebarMenuButton>
                        </Link>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        );
      } else if (item.href && item.href !== '#') {
        const isDirectlyActive = item.matchExact ? pathname === item.href : (pathname === item.href || pathname?.startsWith(item.href + '/'));
        return (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href} passHref legacyBehavior={false}>
              <SidebarMenuButton
                asChild
                isActive={isDirectlyActive}
                // tooltip={item.label} // Only if sidebar is collapsed
              >
                <>
                  <item.icon className="h-5 w-5" />
                  <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                </>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        );
      }
      // Fallback for non-interactive headers if any (currently all are interactive or have sub-items)
      return (
        <SidebarMenuItem key={item.label} className="opacity-50 cursor-not-allowed">
          <SidebarMenuButton className="pointer-events-none">
            <item.icon className="h-5 w-5" />
            <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    });
  }, [pathname, isLoggedIn, userRole, viewAsStudent]); // Removed `isDirectlyActive` as it's local

  const PersistentToggleButton = () => {
    const { toggleSidebar: actualToggle } = useSidebar(); // Renamed to avoid conflict
    return (
      <Button
        variant="outline"
        size="icon"
        onClick={actualToggle}
        className="fixed top-1/2 left-4 z-50 -translate-y-1/2 md:hidden bg-background/80 backdrop-blur-sm shadow-md"
        aria-label="Toggle Sidebar"
      >
        <MenuIcon className="h-5 w-5" />
      </Button>
    );
  };

  if (isSessionLoading && !currentUser) {
    return (
      <div className="flex items-center justify-center h-screen text-lg bg-background text-foreground">
        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
        Initializing PhysicsLab...
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar className="z-40 border-r border-border/70 shadow-md transition-all duration-300 ease-in-out"> {/* Added z-index and transition */}
        <SidebarHeader className="p-4">
          <Link href="/" className="flex items-center gap-2.5 group-data-[collapsible=icon]:justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md">
            <Atom className="h-7 w-7 text-primary" />
            <h1 className="text-xl font-semibold group-data-[collapsible=icon]:hidden tracking-tight">{APP_NAME}</h1>
          </Link>
        </SidebarHeader>
        <ScrollArea className="flex-grow px-2"> {/* Added slight horizontal padding to scroll area */}
          <SidebarContent>
            <SidebarMenu className="space-y-1"> {/* Added space between menu items/accordions */}
              {renderNavItems(NAV_ITEMS)}
            </SidebarMenu>
          </SidebarContent>
        </ScrollArea>
        <SidebarFooter className="p-4 mt-auto space-y-2 border-t border-border/70">
          <div className="flex items-center gap-2.5 group-data-[collapsible=icon]:hidden">
            <Avatar className="h-9 w-9">
              <AvatarImage src={currentUser?.photoURL || (isLoggedIn && userRole === 'teacher' ? "/placeholder-teacher.png" : "/placeholder-student.png")} alt={currentUser?.displayName || "User"} />
              <AvatarFallback className="font-semibold">
                {currentUser?.displayName ? currentUser.displayName.substring(0, 2).toUpperCase() : (isLoggedIn ? (userRole === 'teacher' ? (currentUser?.uid?.startsWith('debug-') ? "DT" : APP_AUTHOR.substring(0,1) + (APP_AUTHOR.split(" ")[1]?.substring(0,1) || 'A') ) : (currentUser?.uid?.startsWith('debug-') ? "DS" : 'ST') ) : 'GU')}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium truncate max-w-[120px]">{currentUser?.displayName || (isLoggedIn ? (userRole === 'teacher' ? (currentUser?.uid === 'debug-teacher' ? "Debug Teacher" : APP_AUTHOR) : (currentUser?.uid === 'debug-student' ? "Debug Student" : 'Student User')) : 'Guest')}</p>
              <p className="text-xs text-muted-foreground">
                {isLoggedIn ? (userRole === 'teacher' ? (viewAsStudent ? 'Teacher (Student View)' : 'Teacher') : 'Student') : 'Not Logged In'}
              </p>
            </div>
          </div>
          <div className="group-data-[collapsible=icon]:hidden text-center text-xs text-muted-foreground pt-2">
            © {new Date().getFullYear()} {APP_NAME}
          </div>
        </SidebarFooter>
      </Sidebar>
      {!isSidebarOpen && <PersistentToggleButton />} {/* Show only if sidebar is closed on mobile */}
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border/70 bg-background/90 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
          <Button variant="ghost" size="icon" className="h-9 w-9 md:hidden" onClick={toggleSidebar} aria-label="Open Sidebar">
            <MenuIcon className="h-5 w-5" />
          </Button>

          <div className="relative flex-grow max-w-lg"> {/* Increased max-width slightly */}
             <Popover open={isSearchOpen} onOpenChange={(open) => {
              if (!open) { setIsSearchOpen(false); if (!searchTerm.trim()) { setSearchTerm(''); setSearchResults([]); }}
              else if (searchTerm.trim()) { setIsSearchOpen(true); }
              else { setIsSearchOpen(true); } // Allow opening on focus even if empty
            }}>
              <PopoverAnchor asChild>
                <div className="relative">
                  <SearchLIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder={`Search ${APP_NAME}...`}
                    className="pl-10 w-full h-9 rounded-md shadow-sm focus-visible:ring-primary focus-visible:ring-offset-0" // Enhanced focus
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); if(e.target.value.trim()){ setIsSearchOpen(true); if (studyGradesData.length === 0 && isOnline && !isLoadingSearchData) fetchStudyGradesForSearch();} else {setIsSearchOpen(false); setSearchResults([])} }}
                    onFocus={() => { setIsSearchOpen(true); if (studyGradesData.length === 0 && isOnline && !isLoadingSearchData) fetchStudyGradesForSearch();}}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchResults.length > 0 && searchResults[0].href) {
                        e.preventDefault(); router.push(searchResults[0].href); setSearchTerm(''); setSearchResults([]); setIsSearchOpen(false);
                      }
                    }}
                  />
                  {searchTerm && (
                    <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => { setSearchTerm(''); setSearchResults([]); setIsSearchOpen(false); }} aria-label="Clear search">
                      <XCircle className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </Button>
                  )}
                </div>
              </PopoverAnchor>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] max-h-[min(60vh,400px)] overflow-y-auto p-1 shadow-xl rounded-md mt-1.5" align="start" sideOffset={6} onOpenAutoFocus={(e) => e.preventDefault()}>
                <ScrollArea className="h-full">
                  <div className="flex flex-col gap-0.5">
                    {searchResults.map(result => {
                      const Icon = result.icon || FileTextIcon;
                      return (
                        <Button key={result.id} variant="ghost" className="w-full justify-start h-auto py-2.5 px-3 text-left rounded-sm hover:bg-accent"
                          onClick={() => { if (result.href) router.push(result.href); setSearchTerm(''); setSearchResults([]); setIsSearchOpen(false); }}>
                          <Icon className="mr-2.5 h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium truncate">{result.label}</p>
                            <p className="text-xs text-muted-foreground truncate">{result.category}</p>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </PopoverContent>
              {isSearchOpen && searchTerm && searchResults.length === 0 && !isLoadingSearchData && (
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-4 text-center shadow-xl rounded-md mt-1.5" align="start" sideOffset={6} onOpenAutoFocus={(e) => e.preventDefault()} forceMount>
                  <p className="text-sm text-muted-foreground">No results found for "{searchTerm}".</p>
                </PopoverContent>
              )}
               {isSearchOpen && isLoadingSearchData && (
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-4 text-center shadow-xl rounded-md mt-1.5" align="start" sideOffset={6} onOpenAutoFocus={(e) => e.preventDefault()} forceMount>
                  <div className="flex items-center justify-center text-sm text-muted-foreground">
                     <Loader2 className="h-4 w-4 animate-spin mr-2"/> Searching modules...
                  </div>
                </PopoverContent>
              )}
            </Popover>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            {!isOnline && <Badge variant="destructive" className="hidden md:flex items-center text-xs h-7 animate-pulse shadow-sm"><WifiOff className="mr-1 h-3 w-3" />Offline</Badge>}
            {isSessionLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : !isLoggedIn ? (
              isLoginFlowActive ? (
                <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setIsLoginFlowActive(false)}>
                  <Card className="p-4 sm:p-6 w-full max-w-sm shadow-xl animate-in fade-in-0 zoom-in-95 duration-200" onClick={(e)=>e.stopPropagation()}>
                    <CardHeader className="p-0 mb-3 text-center">
                      <CardTitle className="text-lg">Login or Create Account</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 space-y-3">
                      {(isOnline && isFirebaseConfigured) && (
                        <Button size="lg" className="w-full h-11 text-base" onClick={async () => { await signInWithGoogle(); setIsLoginFlowActive(false); }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="mr-2.5"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.13-3.13C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/><path fill="none" d="M1 1h22v22H1z"/></svg>
                          Sign In with Google
                        </Button>
                      )}
                      {(!isOnline && !isFirebaseConfigured && magicLogin) && ( // Show debug only if magicLogin exists
                        <div className="space-y-2 pt-2">
                           <p className="text-xs text-center text-muted-foreground flex items-center justify-center"><KeyRound className="mr-1 h-3 w-3" /> Offline Debug Login</p>
                          <div>
                            <Label htmlFor="debugUser" className="text-xs sr-only">Username</Label>
                            <Input id="debugUser" value={debugUsername} onChange={(e) => setDebugUsername(e.target.value)} placeholder="Debug Username" size={3} className="h-9" />
                          </div>
                          <div>
                            <Label htmlFor="debugPass" className="text-xs sr-only">Password</Label>
                            <Input id="debugPass" type="password" value={debugPassword} onChange={(e) => setDebugPassword(e.target.value)} placeholder="Debug Password" size={3} className="h-9" />
                          </div>
                          <Button size="sm" onClick={handleDebugLogin} className="w-full h-9">Login (Debug)</Button>
                        </div>
                      )}
                      {(!isFirebaseConfigured && !magicLogin) && (
                        <p className="text-xs text-center text-muted-foreground pt-2">Login services are currently unavailable.</p>
                      )}
                       <Button variant="ghost" size="sm" onClick={() => { setIsLoginFlowActive(false); setDebugUsername(""); setDebugPassword(""); }} className="w-full text-muted-foreground hover:text-foreground">Cancel</Button>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Button variant="outline" size="sm" className="h-9 shadow-sm" onClick={() => setIsLoginFlowActive(true)}>
                  <LogIn className="mr-2 h-4 w-4" /> Login
                </Button>
              )
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full shadow-sm hover:bg-accent">
                     <Avatar className="h-8 w-8">
                       <AvatarImage src={currentUser?.photoURL || (isLoggedIn && userRole === 'teacher' ? "/placeholder-teacher.png" : "/placeholder-student.png")} alt={currentUser?.displayName || "User"} />
                       <AvatarFallback className="font-semibold text-sm">
                         {currentUser?.displayName ? currentUser.displayName.substring(0, 1).toUpperCase() : (isLoggedIn ? (userRole === 'teacher' ? (currentUser?.uid?.startsWith('debug-') ? "DT" : APP_AUTHOR.substring(0,1)) : (currentUser?.uid?.startsWith('debug-') ? "DS" : 'ST') ) : 'GU')}
                       </AvatarFallback>
                     </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 shadow-lg rounded-md">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none truncate">{currentUser?.displayName || currentUser?.email || "User"}</p>
                      <p className="text-xs leading-none text-muted-foreground capitalize">{userRole}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {userRole === 'teacher' && toggleViewAsStudent && (
                    <DropdownMenuItem onClick={() => { toggleViewAsStudent(); }} className="cursor-pointer">
                      {viewAsStudent ? <EyeIcon className="mr-2 h-4 w-4"/> : <EyeOffIcon className="mr-2 h-4 w-4"/>}
                      {viewAsStudent ? "Switch to Teacher View" : "Switch to Student View"}
                    </DropdownMenuItem>
                  )}
                  {signOutFirebase && isLoggedIn && (
                    <DropdownMenuItem onClick={async () => { await signOutFirebase(); setIsLoginFlowActive(false); }} className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700">
                      <LogOut className="mr-2 h-4 w-4" /> Logout
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <ThemeToggle />
            {process.env.NODE_ENV === 'development' && debugSwitchRole && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="h-9 w-9 shadow-sm">
                    <Bug className="h-4 w-4"/> <span className="sr-only">Dev Tools</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="shadow-lg rounded-md">
                  <DropdownMenuLabel className="text-xs font-normal">Debug View As</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => debugSwitchRole(null)} className="cursor-pointer">
                    <Users className="mr-2 h-4 w-4" /> Guest
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => debugSwitchRole('student')} className="cursor-pointer">
                    <Users className="mr-2 h-4 w-4" /> Student
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => debugSwitchRole('teacher')} className="cursor-pointer">
                    <UserCog className="mr-2 h-4 w-4" /> Teacher
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-muted/20"> {/* Added slight bg color */}
          {children}
        </main>
        <footer className="border-t border-border/70 p-4 text-center text-xs text-muted-foreground">
          {APP_NAME} © {new Date().getFullYear()} {APP_AUTHOR}. All rights reserved.
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}