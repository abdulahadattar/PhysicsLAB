
/**
 * @fileOverview Defines constant values used throughout the application.
 * This includes navigation structures, lists of topics for simulations and quizzes,
 * application metadata, and searchable keywords for settings.
 */

import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard, Orbit, BookOpen, ListChecks, Users, MessageSquare, Settings as SettingsIcon,
  UserCog, Lightbulb, Brain, Map, Ruler, Thermometer, Scale, Waves, Sigma,
  BatteryCharging, TrendingUp, Atom, FileEdit, CalendarDays, ClipboardList, BookCopy,
  NotebookText, UserCircle, FileArchive, TestTubeDiagonal, Beaker, Edit, Link2, FileText,
  SearchIcon, Timer, Weight, Replace, HelpCircle, MoveVertical, Speaker, Projector, Zap,
  Network, Binary, Pipette, Magnet, LineChart, Move, Anchor, RefreshCw, GitCommitHorizontal, Sun,
  Archive
} from 'lucide-react';

/**
 * Defines the structure for a navigation item in the sidebar.
 */
export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  subItems?: NavItem[];
  matchExact?: boolean; // If true, path must match exactly for item to be active
};

/**
 * Main navigation items for the application sidebar.
 * Some items are conditional based on user role (e.g., Teacher Panel).
 */
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
      { href: '/teacher-dashboard/content-management', label: 'Content Management', icon: FileEdit },
      { href: '/teacher-dashboard/manage-model-papers', label: 'Manage Model Papers', icon: FileArchive },
      { href: '/teacher-dashboard/lesson-planner', label: 'Lesson Planner', icon: NotebookText },
      { href: '/teacher-dashboard/daily-diary', label: 'Daily Diary', icon: CalendarDays },
      { href: '/teacher-dashboard/scheme-of-study', label: 'Scheme of Study', icon: ClipboardList },
      { href: '/teacher-dashboard/timetable', label: 'Timetable', icon: BookCopy },
      { href: '/teacher-dashboard/my-portfolio', label: 'My Portfolio', icon: UserCircle },
    ]
  },
  { href: '/feedback', label: 'Feedback & Questions', icon: HelpCircle },
  { href: '/settings', label: 'Settings', icon: SettingsIcon },
];

/**
 * Application name, used globally.
 */
export const APP_NAME = "PhysicsLab";
/**
 * Application author, used globally.
 */
export const APP_AUTHOR = "Sir Abdul Ahad";

/**
 * Defines the structure for a simulation topic.
 */
export interface SimulationTopic {
  id: string; // Unique identifier, often used in the route
  name: string; // Display name of the simulation
  grade: string; // Target grade level(s)
  description: string; // Brief description of what the simulation covers
  icon: LucideIcon; // Icon to represent the simulation
  image?: string; // Optional URL for a thumbnail image
  aiHint?: string; // Optional hint for AI image generation tools if placeholders are used
}

/**
 * List of available interactive simulations in the application.
 * This list populates the simulations page and is used for search.
 */
export const SIMULATION_TOPICS: SimulationTopic[] = [
  // Grade 9
  { id: "vernier-caliper-g9", name: "Vernier Caliper Practice", grade: "9", description: "Learn to read Vernier calipers accurately, identify zero error, and apply corrections.", icon: Ruler, image: "https://placehold.co/400x200.png", aiHint: "vernier caliper measure" },
  { id: "hookes-law-g9", name: "Hooke's Law Lab", grade: "9", description: "Investigate force-extension for springs, determine spring constant, and understand the limit of proportionality.", icon: Weight, image: "https://placehold.co/400x200.png", aiHint: "spring force experiment" },
  { id: "motion-graphs-g9", name: "Motion Graphs (Input → Output)", grade: "9", description: "Explore how changes in velocity and acceleration affect position-time and velocity-time graphs.", icon: LineChart, image: "https://placehold.co/400x200.png", aiHint: "motion graph kinematics" },
  { id: "newtons-laws-g9", name: "Newton's Laws (Force Vectors)", grade: "9", description: "Visualize forces, net force, and the application of Newton's laws of motion with interactive vectors.", icon: Move, image: "https://placehold.co/400x200.png", aiHint: "newton laws force" },
  { id: "density-measurement-g9", name: "Density Measurement (Interactive)", grade: "9", description: "Interactively determine density of objects using virtual measuring cylinders and balances.", icon: Archive, image: "https://placehold.co/400x200.png", aiHint: "density volume mass" },
  { id: "states-of-matter-g9", name: "States of Matter - Particle Model", grade: "9", description: "Visualize particle behavior in solids, liquids, and gases, and how temperature/pressure affect them. Includes a conceptual P-V diagram.", icon: Atom, image: "https://placehold.co/400x200.png", aiHint: "particles solid liquid gas" },
  // Grade 10
  { id: "wave-generator-g10", name: "Wave Generator (Adjustable Params)", grade: "10", description: "Generate transverse and longitudinal waves. Adjust frequency, amplitude, and wavelength to observe wave characteristics.", icon: Waves, image: "https://placehold.co/400x200.png", aiHint: "wave generator physics" },
  { id: "ray-tracing-g10", name: "Ray Tracing (Mirrors & Lenses)", grade: "10", description: "Interactively trace rays for concave/convex mirrors and lenses. Observe image formation based on object position and focal length.", icon: Projector, image: "https://placehold.co/400x200.png", aiHint: "optics ray diagram" },
  { id: "ohms-law-g10", name: "Ohm's Law (Circuit Building)", grade: "10", description: "Build simple series and parallel circuits. Adjust voltage and resistance to observe changes in current and verify Ohm's Law.", icon: Network, image: "https://placehold.co/400x200.png", aiHint: "ohms law circuit" },
  { id: "electric-field-lines-g10", name: "Electric Field Lines (Basic)", grade: "10", description: "Place positive and negative point charges and visualize the resulting electric field lines and patterns.", icon: Zap, image: "https://placehold.co/400x200.png", aiHint: "electric field charge" },
  { id: "dispersion-prism-g10", name: "Dispersion of Light (Prism)", grade: "10", description: "Simulate white light passing through a prism to see the spectrum. Explain rainbow formation.", icon: Pipette, image: "https://placehold.co/400x200.png", aiHint: "light prism dispersion" },
  { id: "magnetic-fields-forces-g10", name: "Magnetic Fields & Motor Principle", grade: "10", description: "Visualize magnetic fields and simulate the force on a current-carrying wire (motor principle).", icon: Magnet, image: "https://placehold.co/400x200.png", aiHint: "magnetic field motor" },
  // Grade 11
  { id: "circular-motion-g11", name: "Circular Motion (Centripetal Force)", grade: "11", description: "Explore uniform circular motion, vary speed and radius, and visualize centripetal force and acceleration vectors.", icon: RefreshCw, image: "https://placehold.co/400x200.png", aiHint: "circular motion physics" },
  { id: "roller-coaster-energy-g11", name: "Roller Coaster Energy (PE/KE)", grade: "11", description: "Simulate a roller coaster car, observing the transformation between potential and kinetic energy at different points on a track.", icon: Zap, image: "https://placehold.co/400x200.png", aiHint: "energy conservation roller coaster" },
  { id: "archimedes-principle-g11", name: "Archimedes' Principle (Buoyancy)", grade: "11", description: "Investigate buoyancy by submerging objects of different densities and volumes in a fluid. Observe displaced fluid and buoyant force.", icon: Anchor, image: "https://placehold.co/400x200.png", aiHint: "buoyancy archimedes fluid" },
  { id: "shm-spring-mass-g11", name: "SHM - Spring-Mass", grade: "11", description: "Simulate a spring-mass system and observe Simple Harmonic Motion. Adjust mass, spring constant, and amplitude.", icon: Waves, image: "https://placehold.co/400x200.png", aiHint: "spring mass oscillation" },
  { id: "capacitor-rc-circuit-g11", name: "Capacitor Charging/Discharging", grade: "11", description: "Visualize RC circuit charging and discharging. Observe voltage/current graphs over time as R and C vary.", icon: BatteryCharging, image: "https://placehold.co/400x200.png", aiHint: "capacitor circuit graph" },
  { id: "simple-pendulum-shm-g11", name: "Simple Pendulum SHM", grade: "11", description: "Simulate a simple pendulum. Adjust length and gravity to observe changes in period and Simple Harmonic Motion.", icon: MoveVertical, image: "https://placehold.co/400x200.png", aiHint: "pendulum swing motion" },
  { id: "unit-converter-g11", name: "Unit Converter", grade: "11", description: "Convert between common units for length, mass, and time.", icon: Replace, image: "https://placehold.co/400x200.png", aiHint: "unit conversion tool" },
  { id: "sig-figs-practice-g11", name: "Significant Figures Practice", grade: "11", description: "Practice identifying and applying rules for significant figures in measurements and calculations.", icon: Sigma, image: "https://placehold.co/400x200.png", aiHint: "significant figures math" },
  // Grade 12
  { id: "gas-laws-g12", name: "Gas Laws (P/V/T Relationships)", grade: "12", description: "Interactively explore Boyle's Law, Charles's Law, and Gay-Lussac's Law. Adjust P, V, T and observe relationships.", icon: Thermometer, image: "https://placehold.co/400x200.png", aiHint: "gas laws pressure volume temperature" },
  { id: "em-induction-g12", name: "Electromagnetic Induction (Magnet/Coil)", grade: "12", description: "Simulate moving a magnet near a coil or changing current in a primary coil to observe induced EMF and current.", icon: Magnet, image: "https://placehold.co/400x200.png", aiHint: "electromagnetic induction faraday" },
  { id: "pn-junction-diode-g12", name: "PN Junction Diode (Basic Behavior)", grade: "12", description: "Visualize charge carriers and depletion region in a PN junction. Observe forward and reverse bias characteristics.", icon: GitCommitHorizontal, image: "https://placehold.co/400x200.png", aiHint: "diode semiconductor electronics" },
  { id: "photoelectric-effect-g12", name: "Photoelectric Effect (Frequency/Intensity)", grade: "12", description: "Shine light of varying frequency and intensity on a metal surface and observe electron emission and kinetic energy.", icon: Sun, image: "https://placehold.co/400x200.png", aiHint: "photoelectric effect quantum" },
];

/**
 * Defines topics for quizzes.
 * Used to populate the topic selection for topic-wise quizzes.
 */
export const QUIZ_TOPICS = [
  { id: "kinematics", name: "Kinematics Quiz", description: "Test your knowledge on motion, speed, velocity, and acceleration." },
  { id: "dynamics", name: "Dynamics Quiz", description: "Explore forces, Newton's laws, momentum, and energy." },
  { id: "electromagnetism", name: "Electromagnetism Quiz", description: "Questions on electric and magnetic fields, circuits, and waves." },
  { id: "optics", name: "Optics Quiz", description: "Challenge yourself with questions on light, reflection, refraction, lenses, and mirrors." },
  { id: "waves-sound", name: "Waves & Sound Quiz", description: "Test your understanding of wave properties, sound phenomena, and simple harmonic motion." },
  { id: "heat-thermo", name: "Heat & Thermodynamics Quiz", description: "Questions on temperature, heat transfer, states of matter, and laws of thermodynamics." },
];

/**
 * Defines searchable keywords and labels for the Settings page.
 * Used by the global search function to help users find settings options.
 */
export const SETTINGS_SEARCHABLE_KEYWORDS: {term: string, label: string, href: string}[] = [
    {term: "theme", label: "Appearance Theme (Light/Dark/System)", href: "/settings"},
    {term: "dark mode", label: "Dark Mode Theme Setting", href: "/settings"},
    {term: "light mode", label: "Light Mode Theme Setting", href: "/settings"},
    {term: "fun facts", label: "Fun Physics Facts Panel Setting", href: "/settings"},
    {term: "tidbits", label: "Fun Physics Tidbits Panel Setting", href: "/settings"},
    {term: "offline", label: "Offline Data & App Update Settings", href: "/settings"},
    {term: "sync", label: "Data Sync & App Update Settings", href: "/settings"},
    {term: "login", label: "Login/Account (via Header)", href: "/settings"},
    {term: "account", label: "Account Information (via Header)", href: "/settings"},
    // {term: "update", label: "Check for App Updates Setting", href: "/settings"} // This is an action, not a setting section.
];
