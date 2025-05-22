
import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, Orbit, BookOpen, ListChecks, Users, MessageSquare, Settings as SettingsIcon, UserCog, Lightbulb, Brain, Map, Ruler, Thermometer, Scale, Clock, Waves, Heater, Sigma, BatteryCharging, MoveHorizontal } from 'lucide-react';

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
  { href: '/learn-with-ai', label: 'Learn with AI', icon: Brain },
  { href: '/mind-maps', label: 'Mind Maps', icon: Map },
  {
    href: '/teacher-dashboard',
    label: 'Teacher Panel',
    icon: UserCog,
    subItems: [
      { href: '/teacher-dashboard/accounts', label: 'Student Accounts', icon: Users },
      { href: '/teacher-dashboard/analytics', label: 'Analytics', icon: LayoutDashboard },
      { href: '/teacher-dashboard/announcements', label: 'Announcements', icon: MessageSquare },
    ]
  },
  { href: '/feedback', label: 'Feedback', icon: MessageSquare },
  { href: '/settings', label: 'Settings', icon: SettingsIcon },
];

export const APP_NAME = "PhysicsLab";
export const APP_AUTHOR = "Sir Abdul Ahad";
export const APP_NOTES_AUTHOR = "Abdul Ahad Attar";

export const SIMULATION_TOPICS = [
  { id: "newtons-laws", name: "Newton's Laws", grade: 9, description: "Investigate force, mass, and acceleration with interactive examples." },
  { id: "ohm-law", name: "Ohm's Law", grade: 10, description: "Understand the relationship between voltage, current, and resistance in circuits." },
  { id: "wave-properties", name: "Wave Properties", grade: 12, description: "Visualize wavelength, frequency, amplitude, and speed of waves." },
  { id: "projectile-motion", name: "Projectile Motion", grade: 11, description: "Detailed simulation of projectile motion with calculations for range, height, and time of flight." },
  { id: "unit-converter-g11", name: "Unit Converter", grade: 11, description: "Convert between common physics units for length, mass, time, etc." },
  { id: "shm-spring-mass-g11", name: "SHM - Spring-Mass", grade: 11, description: "Simulate a spring-mass system and observe Simple Harmonic Motion." },
  { id: "sig-figs-practice-g11", name: "Significant Figures Practice", grade: 11, description: "Practice identifying and using significant figures.", icon: Sigma },
  { id: "capacitor-rc-circuit-g11", name: "Capacitor Charging/Discharging", grade: 11, description: "Visualize RC circuit charging and discharging.", icon: BatteryCharging },
  { id: "simple-pendulum-shm-g11", name: "Simple Pendulum SHM", grade: 11, description: "Simulate a simple pendulum and observe SHM.", icon: MoveHorizontal },
];

// STUDY_GRADES is now fetched from /api/study-materials

export const QUIZ_TOPICS = [
  { id: "kinematics", name: "Kinematics Quiz" },
  { id: "dynamics", name: "Dynamics Quiz" },
  { id: "electromagnetism", name: "Electromagnetism Quiz" },
];

