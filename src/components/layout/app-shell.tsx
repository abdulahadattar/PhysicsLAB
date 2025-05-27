"use client";
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from "@/components/ui/accordion";
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  SidebarProvider,
  Sidebar, SidebarHeader, SidebarContent, SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { // Updated lucide-react imports
  Atom, Eye as EyeIcon, EyeOff as EyeOffIcon, KeyRound, WifiOff, SearchIcon, XCircle, BookOpen,
  ListChecks, Settings as SettingsIcon, UserCog, Bug, ChevronDown, UsersRoundIcon, BarChart3, MessageSquare, FileTextIcon,
  FileEdit, FileArchive, NotebookText, CalendarDays, ClipboardList, BookCopy, Info, HelpCircle, Map, MenuIcon,
  LogIn, LogOut, UserCircle, Users, Loader2,
} from 'lucide-react'; // Consolidated necessary icons
import { NAV_ITEMS, APP_NAME, APP_AUTHOR, SIMULATION_TOPICS, QUIZ_TOPICS, SETTINGS_SEARCHABLE_KEYWORDS, CURRICULUM_BOARDS } from '@/lib/constants';
import type { NavItem } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";

/**
 * @fileOverview The main application shell component.
 * Renders the sidebar, header, main content area, and footer.
 * Manages global search functionality, user login UI (Firebase-integrated and simulated offline debug),
 * and provides the core layout structure including a collapsible sidebar, a fixed header,
 * a main content area for routing, and a footer.
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
      className={cn("z-10",
        "relative flex min-h-svh flex-1 flex-col bg-background",
        // These classes are specific to how sidebar variant="inset" interacts
        "peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))] md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow",
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

/**
 * The AppShell component provides the main layout for the application,
 * including sidebar navigation, header with search and user controls,
 * and the main content area.
 * It handles:
 * - User session management (displaying login/logout, user info, role-based views).
 * - A global search functionality.
 * - Theme toggling.
 * - Debug mode for switching user roles during development.
 * - Online/offline status indication.
 */
export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams(); // For preserving scroll on simulations page

  const {
    currentUser,
    isLoggedIn,
    userRole,
    viewAsStudent,
    signInWithGoogle,
    magicLogin,
    signOutFirebase,
    isLoading: isSessionLoading,
    isFirebaseConfigured,
    debugSwitchRole,
    toggleViewAsStudent,
  } = useUserSession();

  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(true);

  // State for login flow (when user clicks initial Login button)
  const [isLoginFlowActive, setIsLoginFlowActive] = useState(false);
  // State for debug login form (offline teacher login)
  const [debugUsername, setDebugUsername] = useState("");
  const [debugPassword, setDebugPassword] = useState("");

  // Global Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState < SearchResult[] > ([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [studyGradesData, setStudyGradesData] = useState<StudyGrade[]>([]);
  const [isLoadingSearchData, setIsLoadingSearchData] = useState(false);




  // Effect for online/offline detection
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

  /**
   * Fetches study grades data for the global search.
   * Tries to load from localStorage first, then falls back to API if online.
   * This function is now called once on mount.
   */
  const fetchStudyGradesForSearch = useCallback(async () => {
    if (studyGradesData.length > 0) { // Don't refetch if already loaded
      return;
    }
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
        } else {
          if (!loadedFromCache) {
            toast({ title: "Search Data Limited", description: "Could not load full study material index for search. Some results may be missing.", variant: "default" });
          }
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
    fetchStudyGradesForSearch(); // Fetch once on mount
  }, [fetchStudyGradesForSearch]);


  /**
   * Performs a client-side search across various application content.
   * Includes navigation items, simulations, quiz topics, study materials (grades, chapters, basic content), and settings keywords.
   * @param {string} query - The search query string.
   */
  const performSearch = useCallback((query: string) => {
    // This is client-side substring matching.
    // Advanced fuzzy/semantic search would require dedicated libraries or backend services.
    // The comment below acknowledges this limitation.
    // For very large datasets (especially deep content search), a backend search index (Algolia, MeiliSearch) or a client-side pre-built index (Lunr.js) would be more performant.
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
        results.push({ id: `nav-${item.href || item.label}`, label: item.label, href: item.href === '#' ? (item.subItems && item.subItems.length > 0 ? item.subItems[0].href : '/') : item.href, category: 'Navigation', icon: item.icon });
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

    // Search Study Materials (Grades, Chapters, and basic content)
    if (studyGradesData && studyGradesData.length > 0) {
      studyGradesData.forEach(grade => {
        if (grade.name.toLowerCase().includes(lowerQuery)) {
          results.push({ id: `grade-${grade.id}`, label: grade.name, href: `/study-material`, category: 'Study Grade', icon: BookOpen });
        }
        (grade.chapters || []).forEach(chapter => {
          if (chapter.name.toLowerCase().includes(lowerQuery)) {
            results.push({ id: `chapter-${chapter.id}`, label: `${grade.name} > ${chapter.name}`, href: `/study-material/${grade.id}/${chapter.id}`, category: 'Study Chapter', icon: FileTextIcon });
          }
          const content = chapter.content;
          if (content) {
            if (content.keyPoints && content.keyPoints.toLowerCase().includes(lowerQuery)) {
              results.push({ id: `chapter-kp-${chapter.id}`, label: `${chapter.name} (Key Points)`, href: `/study-material/${grade.id}/${chapter.id}`, category: 'Study Material - Key Point', icon: FileTextIcon });
            }
            (content.mcqs || []).forEach(mcq => {
              if (mcq.question.toLowerCase().includes(lowerQuery)) {
                results.push({ id: `chapter-mcq-${mcq.id}`, label: `${chapter.name} (MCQ: ${mcq.question.substring(0, 30)}...)`, href: `/study-material/${grade.id}/${chapter.id}`, category: 'Study Material - MCQ', icon: ListChecks });
              }
            });
            (content.shortAnswers || []).forEach(sa => {
              if (sa.question.toLowerCase().includes(lowerQuery)) {
                results.push({ id: `chapter-sa-${sa.id}`, label: `${chapter.name} (Short Q: ${sa.question.substring(0, 30)}...)`, href: `/study-material/${grade.id}/${chapter.id}`, category: 'Study Material - Short Answer', icon: ListChecks });
              }
            });
            (content.longAnswers || []).forEach(la => {
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

    // Deduplicate results (simple check based on href and label)
    const uniqueResults = results.reduce((acc, current) => {
      const x = acc.find(item => item.href === current.href && item.label === current.label);
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, [] as SearchResult[]);

    setSearchResults(uniqueResults.slice(0, 10)); // Limit to 10 results
  }, [studyGradesData]); // Dependency on studyGradesData ensures search re-runs if this data updates

  // Debounced search effect
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm.trim()) {
        performSearch(searchTerm);
      } else {
        setSearchResults([]);
        setIsSearchOpen(false);
      }
    }, 300); // 300ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, performSearch]);

  /**
   * Handles debug login attempt when offline and Firebase is not configured.
   */
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


  /**
   * Renders navigation items for the sidebar, conditionally including teacher panel.
   * Handles nested sub-items using Accordion components.
   * @param {NavItem[]} items - The array of navigation items to render.
   * @returns {React.ReactNode[]} An array of React nodes representing the sidebar menu items.
   */
  const renderNavItems = useCallback((itemsToRender: NavItem[]) => {
    return itemsToRender.map((item) => { // Renamed from `items` to `itemsToRender` to avoid potential conflict if an 'item' variable existed elsewhere
      if (item.href === '/teacher-dashboard' && (!isLoggedIn || userRole !== 'teacher' || (userRole === 'teacher' && viewAsStudent))) {
        return null;
      }

      // Determine if the current item or any of its sub-items are active
      const isDirectlyActive = item.matchExact ? pathname === item.href : (item.href && item.href !== '#' ? pathname && pathname.startsWith(item.href) : false);
      const isChildActive = item.subItems ? item.subItems.some(sub => pathname && pathname.startsWith(sub.href)) : false;
      const isActive = isDirectlyActive || isChildActive; // This 'isActive' is used for visual indication for the parent item/accordion trigger

      if (item.subItems && item.subItems.length > 0) {
        // Category with sub-items (Accordion)
        const accordionKey = item.label.replace(/\s+/g, '-').toLowerCase(); // Create a safe key from label
        return (
          <Accordion type="single" collapsible className="w-full" key={accordionKey} defaultValue={isChildActive ? accordionKey : undefined}>
            <AccordionItem value={accordionKey} className="border-none" key={`${accordionKey}-item`}>
              <AccordionTrigger
                className={cn(
                  "w-full justify-start p-0 hover:no-underline data-[state=open]:text-primary [&[data-state=open]>button>span>svg:last-child]:!rotate-180", // Custom rotation for internal chevron if needed
                  isChildActive && "text-primary font-semibold" // Highlight parent if child is active
                )}
              >
                {/* SidebarMenuButton here is for the trigger visual, not direct navigation */}
                <SidebarMenuButton
                  asChild={false} // Renders its own button element
                  className="w-full hover:bg-sidebar-accent/50" // Custom hover for trigger
                  tooltip={item.label}
                  isActive={isChildActive} // Visually indicate if a child is active
                >
                  <span className="flex w-full items-center justify-between">
                    <span className="flex items-center gap-2">
                      <item.icon />
                      <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                    </span>
                    {/* The default AccordionTrigger will add a ChevronDown icon here */}
                  </span>
                </SidebarMenuButton>
              </AccordionTrigger>
              <AccordionContent className="pb-0 pt-0 pl-2 group-data-[collapsible=icon]:hidden">
                <SidebarMenu className="border-l border-border ml-[calc(theme(spacing.2)_+_2px)] pl-3">
                  {item.subItems.map(subItem => (
                    <SidebarMenuItem key={subItem.href}>
                      <Link href={subItem.href} passHref legacyBehavior={false}>
                        <SidebarMenuButton // This button IS the link target
                          asChild // Let Link render this button
                          isActive={pathname && pathname.startsWith(subItem.href)}
                          className="text-sm" // Explicitly smaller for sub-items
                          tooltip={subItem.label}
                        >
                          <>
                            <subItem.icon className="h-3.5 w-3.5" /> {/* Slightly smaller icon */}
                            <span>{subItem.label}</span>
                          </>
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        );
      } else if (item.href && item.href !== '#') {
        // Direct navigation item
        return (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href} passHref legacyBehavior={false}>
              <SidebarMenuButton // This button IS the link target
                asChild // Let Link render this button
                isActive={isDirectlyActive}
                tooltip={item.label}
                  >
                <>
                  <item.icon />
                  <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                </>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        );
      }

      // Handle items with '#' href or no href (should not be interactive links)
      return (
        <SidebarMenuItem key={item.label}>
          <SidebarMenuButton
            asChild={false} // Renders its own button, not a link
            isActive={isActive}
            tooltip={item.label}
            className="cursor-default" // Indicate it's not interactive if no proper href
          >
            <item.icon />
            <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
          </SidebarMenuButton>
          </SidebarMenuItem>
        );
    });
  }, [pathname, isLoggedIn, userRole, viewAsStudent]);

  // Component to render the persistent toggle button and access toggleSidebar via context
  const PersistentToggleButton = () => { const { toggleSidebar } = useSidebar();
    return (
      <Button
        variant="outline"
        size="icon"
        onClick={toggleSidebar}
        className="fixed top-1/2 left-4 z-50 -translate-y-1/2 md:hidden" // Position for mobile, hidden on desktop
        aria-label="Toggle Sidebar Open/Close"
      >
        {/* You can use an icon here, e.g., a hamburger icon */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
      </Button>
    );
  };


  // Main return for AppShell component
  if (isSessionLoading && !currentUser) {
    return (
      <div className="flex items-center justify-center h-screen text-lg">
        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
        Loading PhysicsLab...
      </div>
    );
  }

  // Get toggleSidebar from useSidebar for header button
  const { toggleSidebar } = useSidebar();

  return (
    <SidebarProvider>
      <Sidebar className="z-20">
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center" data-ai-hint="app logo and name in sidebar header">
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
                {currentUser?.displayName ? currentUser.displayName.substring(0, 2).toUpperCase() : (isLoggedIn ? (userRole === 'teacher' ? APP_AUTHOR.substring(0,1) + (APP_AUTHOR.split(" ")[1]?.substring(0,1) || '') : 'ST') : 'GU')}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{currentUser?.displayName || (isLoggedIn ? (userRole === 'teacher' ? currentUser?.uid === 'debug-teacher' ? "Debug Teacher" : APP_AUTHOR : currentUser?.uid === 'debug-student' ? "Debug Student" : 'Student User') : 'Guest')}</p>
              <p className="text-xs text-muted-foreground">
                {isLoggedIn ? (userRole === 'teacher' ? (viewAsStudent ? 'Teacher (Student View)' : 'Teacher') : 'Student') : 'Not Logged In'}
              </p>
            </div>
          </div>
          <div className="group-data-[collapsible=icon]:hidden text-center text-xs text-muted-foreground mt-2">
            &copy; {new Date().getFullYear()} {APP_NAME}
          </div>
        </SidebarFooter>
      </Sidebar>
      <PersistentToggleButton />
      <SidebarInset>
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6 ">
          {/* Sidebar Trigger for mobile */}
          <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden" onClick={toggleSidebar} aria-label="Open Sidebar">
            <MenuIcon className="h-5 w-5" />
          </Button>

          {/* Global Search Bar */}
          <div className="relative flex-grow max-w-md">
             <Popover open={isSearchOpen} onOpenChange={(open) => {
              if (open && searchTerm.trim()) {
                setIsSearchOpen(true); // Open if there's a term
              } else if (!open) {
                setIsSearchOpen(false); // Always close if 'open' is false from the trigger
                if (!searchTerm.trim()) { // Also clear search if closing and term is empty
                  setSearchTerm('');
                  setSearchResults([]);
                }
              } else if (open && !searchTerm.trim()){
                setIsSearchOpen(true); // Open if explicitly opened even with no term (e.g. onFocus)
              }
            }}>
              <PopoverAnchor asChild>
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search app..."
                    className="pl-10 w-full"
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); if(e.target.value.trim()) {setIsSearchOpen(true); if (studyGradesData.length === 0 && isOnline && !isLoadingSearchData) fetchStudyGradesForSearch();} else setIsSearchOpen(false);}}
                    onFocus={() => { if (searchTerm.trim()) {setIsSearchOpen(true);} if (studyGradesData.length === 0 && isOnline && !isLoadingSearchData) {fetchStudyGradesForSearch();}}}
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
                  <ScrollArea className="h-full">
                    <div className="flex flex-col gap-0.5">
                        {searchResults.map(result => {
                        const Icon = result.icon || FileTextIcon;
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
                  </ScrollArea>
                </PopoverContent>
              )}
              {isSearchOpen && searchTerm && searchResults.length === 0 && !isLoadingSearchData && (
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-4 text-center" align="start" onOpenAutoFocus={(e) => e.preventDefault()} forceMount>
                  <p className="text-sm text-muted-foreground">No results found for "{searchTerm}".</p>
                </PopoverContent>
              )}
               {isSearchOpen && isLoadingSearchData && (
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-4 text-center" align="start" onOpenAutoFocus={(e) => e.preventDefault()} forceMount>
                  <div className="flex items-center justify-center">
                     <Loader2 className="h-4 w-4 animate-spin mr-2"/> Searching...
                  </div>
                </PopoverContent>
              )}
            </Popover>
          </div>


          {/* Right side of header: Network Status, Login/User Info, Theme Toggle, Dev View Switcher */}
          <div className="flex items-center gap-1 sm:gap-2 ml-auto">
            {!isOnline && <Badge variant="destructive" className="hidden md:flex items-center text-xs h-7 animate-pulse"><WifiOff className="mr-1 h-3 w-3" />Offline</Badge>}

            {isSessionLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : !isLoggedIn ? (
              isLoginFlowActive ? (
                // This section is for when "Login / Create Account" has been clicked
                <>
                  {(isOnline && isFirebaseConfigured) && (
                    <Button
                      variant="secondary" // Changed to secondary for better visual distinction from Login button
                      size="sm"
                      onClick={async () => {
                        await signInWithGoogle();
                        setIsLoginFlowActive(false);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="mr-2"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.13-3.13C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/><path fill="none" d="M1 1h22v22H1z"/></svg>
                      Sign In with Google
                    </Button>
                  )}
                  {(!isOnline && !isFirebaseConfigured) && (
                    <Card className="p-3 w-full md:w-auto shadow-md absolute top-16 right-4 sm:right-6 z-50 bg-card border">
                      <CardHeader className="p-0 mb-2">
                        <CardTitle className="text-sm flex items-center"><KeyRound className="mr-1 h-4 w-4" /> Offline Debug Login</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0 space-y-2">
                        <div>
                          <Label htmlFor="debugUser" className="text-xs">Username</Label>
                          <Input id="debugUser" value={debugUsername} onChange={(e) => setDebugUsername(e.target.value)} placeholder="debug_user" size={3} className="h-8" />
                        </div>
                        <div>
                          <Label htmlFor="debugPass" className="text-xs">Password</Label>
                          <Input id="debugPass" type="password" value={debugPassword} onChange={(e) => setDebugPassword(e.target.value)} placeholder="debug_pass" size={3} className="h-8" />
                        </div>
                        <Button size="sm" onClick={handleDebugLogin} className="w-full h-8 mt-1">Login (Debug)</Button>
                      </CardContent>
                    </Card>
                  )}
                  {(!isFirebaseConfigured && !isOnline && !magicLogin) && (
                    <p className="text-xs text-muted-foreground">Login not available.</p>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => { setIsLoginFlowActive(false); setDebugUsername(""); setDebugPassword(""); }} className="h-8 w-8"><XCircle className="h-4 w-4"/></Button>
                </>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setIsLoginFlowActive(true)}>
                  <LogIn className="mr-2 h-4 w-4" /> Login / Create Account
                </Button>
              )
            ) : (
              // User is logged in
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                       <Avatar className="h-8 w-8">
                         <AvatarImage src={currentUser?.photoURL || (isLoggedIn && userRole === 'teacher' ? "https://placehold.co/40x40.png?text=TA" : "https://placehold.co/40x40.png?text=ST")} alt={currentUser?.displayName || (isLoggedIn ? (userRole || "User") : "Guest")} data-ai-hint="user avatar" />
                         <AvatarFallback>
                           {currentUser?.displayName ? currentUser.displayName.substring(0, 2).toUpperCase() : (isLoggedIn ? (userRole === 'teacher' ? (currentUser?.uid?.startsWith('debug-') ? "DT" : APP_AUTHOR.substring(0,1) + (APP_AUTHOR.split(" ")[1]?.substring(0,1) || '') ) : (currentUser?.uid?.startsWith('debug-') ? "DS" : 'ST') ) : 'GU')}
                         </AvatarFallback>
                       </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel className="text-xs">
                      Signed in as: <span className="font-semibold">{currentUser?.displayName || currentUser?.email || "User"}</span> (<span className="capitalize">{userRole}</span>)
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {userRole === 'teacher' && toggleViewAsStudent && (
 <DropdownMenuItem onClick={() => { toggleViewAsStudent(); }}>
 {viewAsStudent ? <EyeIcon className="mr-2 h-4 w-4" data-ai-hint="icon for switch to teacher view"/> : <EyeOffIcon className="mr-2 h-4 w-4" data-ai-hint="icon for switch to student view"/>}
                        {viewAsStudent ? "Switch to Teacher View" : "Switch to Student View"}
                      </DropdownMenuItem>
                    )}
                    {signOutFirebase && isLoggedIn && (
                        <DropdownMenuItem onClick={async () => { await signOutFirebase(); setIsLoginFlowActive(false); }}>
                            <LogOut className="mr-2 h-4 w-4" /> Logout
                        </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
            <ThemeToggle />

            {process.env.NODE_ENV === 'development' && debugSwitchRole && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                        <Bug className="h-4 w-4"/>
                        <span className="sr-only">Developer Debug View Switcher</span>
                    </Button>
                  </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
 <DropdownMenuItem onClick={() => debugSwitchRole(null)} data-ai-hint="debug switch role to guest">
                        <UserCircle className="mr-2 h-4 w-4" /> View as Guest
 </DropdownMenuItem>
 <DropdownMenuItem onClick={() => debugSwitchRole('student')} data-ai-hint="debug switch role to student">
                        <UserCircle className="mr-2 h-4 w-4" /> View as Student
 </DropdownMenuItem>
 <DropdownMenuItem onClick={() => debugSwitchRole('teacher')}>
                        <UserCog className="mr-2 h-4 w-4" /> View as Teacher
                    </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
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

// --- Automated error logging ---
useEffect(() => {
  function handleError(event: ErrorEvent) {
    const errorMsg = `[${new Date().toISOString()}] JS Error: ${event.message}\nSource: ${event.filename}\nLine: ${event.lineno}, Col: ${event.colno}\nStack: ${event.error?.stack || 'N/A'}\n---\n`;
    fetch('/api/log-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: errorMsg })
    });
  }
  function handleRejection(event: PromiseRejectionEvent) {
    const errorMsg = `[${new Date().toISOString()}] Unhandled Promise Rejection: ${event.reason?.message || event.reason}\nStack: ${event.reason?.stack || 'N/A'}\n---\n`;
    fetch('/api/log-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: errorMsg })
    });
  }
  window.addEventListener('error', handleError);
  window.addEventListener('unhandledrejection', handleRejection);
  return () => {
    window.removeEventListener('error', handleError);
    window.removeEventListener('unhandledrejection', handleRejection);
  };
}, []);
