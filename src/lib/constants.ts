
import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, Orbit, BookOpen, ListChecks, Users, MessageSquare, Settings as SettingsIcon, UserCog, Lightbulb, Brain, Map, Ruler, Thermometer, Scale, ClockIcon, Waves, Heater, Sigma, BatteryCharging, MoveHorizontal, TrendingUp, Atom, FileEdit, CalendarDays, ClipboardList, BookCopy, NotebookText, UserCircle, FileArchive, TestTubeDiagonal, Beaker, Edit, Link2, FileText, UploadCloud } from 'lucide-react'; // Added Link2, FileText, UploadCloud

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  subItems?: NavItem[];
  matchExact?: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, matchExact: true },
  { href: '/simulations', label: 'Simulations', icon: Orbit },
  { href: '/study-material', label: 'Study Material', icon: BookOpen },
  { href: '/quizzes', label: 'Quizzes', icon: ListChecks },
  { href: '/assignments', label: 'Assignments', icon: Edit },
  { href: '/learn-with-ai', label: 'Learn with AI', icon: Brain },
  { href: '/mind-maps', label: 'Mind Maps', icon: Map },
  { href: '/model-papers', label: 'Model Papers', icon: FileArchive },
  { href: '/practicals', label: 'Practicals', icon: Beaker },
  { href: '/mdcat-preparation', label: 'MDCAT Prep', icon: TestTubeDiagonal },
  {
    href: '/teacher-dashboard',
    label: 'Teacher Panel',
    icon: UserCog,
    subItems: [
      { href: '/teacher-dashboard/accounts', label: 'Student Accounts', icon: Users },
      { href: '/teacher-dashboard/analytics', label: 'Analytics', icon: LayoutDashboard },
      { href: '/teacher-dashboard/announcements', label: 'Announcements', icon: MessageSquare },
      { href: '/teacher-dashboard/assignments', label: 'Manage Assignments', icon: Edit },
      { href: '/teacher-dashboard/content-management', label: 'Study Content', icon: FileEdit },
      { href: '/teacher-dashboard/manage-model-papers', label: 'Model Papers', icon: FileArchive },
      { href: '/teacher-dashboard/lesson-planner', label: 'Lesson Planner', icon: NotebookText },
      { href: '/teacher-dashboard/daily-diary', label: 'Daily Diary', icon: CalendarDays },
      { href: '/teacher-dashboard/scheme-of-study', label: 'Scheme of Study', icon: ClipboardList },
      { href: '/teacher-dashboard/timetable', label: 'Timetable', icon: BookCopy },
      { href: '/teacher-dashboard/my-portfolio', label: 'My Portfolio', icon: UserCircle },
    ]
  },
  { href: '/feedback', label: 'Feedback & Notes', icon: MessageSquare },
  { href: '/settings', label: 'Settings', icon: SettingsIcon },
];

export const APP_NAME = "PhysicsLab";
export const APP_AUTHOR = "Sir Abdul Ahad";

// Define a type for SimulationTopic to include optional image and aiHint
export interface SimulationTopic {
  id: string;
  name: string;
  grade: string;
  description: string;
  icon: LucideIcon;
  image?: string; // Optional image URL
  aiHint?: string; // Optional AI hint for image generation
}

export const SIMULATION_TOPICS: SimulationTopic[] = [
  // Grade 9
  { id: "vernier-caliper-g9", name: "Vernier Caliper Practice", grade: "9", description: "Learn to read Vernier calipers accurately.", icon: Ruler, image: "https://placehold.co/400x200.png", aiHint: "vernier caliper measurement" },
  { id: "hookes-law-g9", name: "Hooke's Law Lab", grade: "9", description: "Investigate the relationship between force and extension for a spring.", icon: Sigma, image: "https://placehold.co/400x200.png", aiHint: "spring force experiment" },
  { id: "motion-constant-acceleration-g9", name: "Motion - Constant Acceleration", grade: "9", description: "Explore 1D motion with constant acceleration.", icon: TrendingUp, image: "https://placehold.co/400x200.png", aiHint: "motion graph acceleration" },
  { id: "states-of-matter-g9", name: "States of Matter - Particle Model", grade: "9", description: "Visualize particle behavior in solids, liquids, and gases.", icon: Atom, image: "https://placehold.co/400x200.png", aiHint: "particles solid liquid gas" },
  // Grade 11
  { id: "projectile-motion-g11", name: "Projectile Motion", grade: "11", description: "Detailed simulation of projectile motion with calculations for range, height, and time of flight.", icon: Orbit, image: "https://placehold.co/400x200.png", aiHint: "projectile trajectory physics" },
  { id: "unit-converter-g11", name: "Unit Converter", grade: "11", description: "Convert between common physics units for length, mass, time, etc.", icon: Ruler, image: "https://placehold.co/400x200.png", aiHint: "units conversion tool" },
  { id: "shm-spring-mass-g11", name: "SHM - Spring-Mass", grade: "11", description: "Simulate a spring-mass system and observe Simple Harmonic Motion.", icon: Waves, image: "https://placehold.co/400x200.png", aiHint: "spring mass oscillation" },
  { id: "sig-figs-practice-g11", name: "Significant Figures Practice", grade: "11", description: "Practice identifying and using significant figures.", icon: Sigma, image: "https://placehold.co/400x200.png", aiHint: "significant figures numbers" },
  { id: "capacitor-rc-circuit-g11", name: "Capacitor Charging/Discharging", grade: "11", description: "Visualize RC circuit charging and discharging.", icon: BatteryCharging, image: "https://placehold.co/400x200.png", aiHint: "capacitor circuit graph" },
  { id: "simple-pendulum-shm-g11", name: "Simple Pendulum SHM", grade: "11", description: "Simulate a simple pendulum and observe SHM.", icon: MoveHorizontal, image: "https://placehold.co/400x200.png", aiHint: "pendulum swing motion" },
];


export const QUIZ_TOPICS = [
  { id: "kinematics", name: "Kinematics Quiz" },
  { id: "dynamics", name: "Dynamics Quiz" },
  { id: "electromagnetism", name: "Electromagnetism Quiz" },
];
