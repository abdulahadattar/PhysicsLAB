import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, Orbit, BookOpen, ListChecks, Users, MessageSquare, Settings as SettingsIcon, UserCog, Lightbulb } from 'lucide-react';

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
  { id: "projectile-motion", name: "Projectile Motion", grade: 11, description: "Explore the path of a projectile launched at various angles and velocities." },
  { id: "newtons-laws", name: "Newton's Laws", grade: 9, description: "Investigate force, mass, and acceleration with interactive examples." },
  { id: "ohm-law", name: "Ohm's Law", grade: 10, description: "Understand the relationship between voltage, current, and resistance in circuits." },
  { id: "wave-properties", name: "Wave Properties", grade: 12, description: "Visualize wavelength, frequency, amplitude, and speed of waves." },
];

export const STUDY_GRADES = [
  { id: "9", name: "Grade 9", chapters: [
    { id: "chapter-1", name: "Physical Quantities and Measurement" },
    { id: "chapter-2", name: "Kinematics" },
  ]},
  { id: "10", name: "Grade 10", chapters: [
    { id: "chapter-1", name: "Simple Harmonic Motion and Waves" },
    { id: "chapter-2", name: "Sound" },
  ]},
  { id: "11", name: "Grade 11", chapters: [
    { id: "chapter-1", name: "Measurements" },
    { id: "chapter-2", name: "Vectors and Equilibrium" },
  ]},
  { id: "12", name: "Grade 12", chapters: [
    { id: "chapter-1", name: "Electrostatics" },
    { id: "chapter-2", name: "Current Electricity" },
  ]},
];

export const QUIZ_TOPICS = [
  { id: "kinematics", name: "Kinematics Quiz" },
  { id: "dynamics", name: "Dynamics Quiz" },
  { id: "electromagnetism", name: "Electromagnetism Quiz" },
];
