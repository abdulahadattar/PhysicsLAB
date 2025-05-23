
import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, Orbit, BookOpen, ListChecks, Users, MessageSquare, Settings as SettingsIcon, UserCog, Lightbulb, Brain, Map, Ruler, Thermometer, Scale, ClockIcon, Waves, Sigma, BatteryCharging, TrendingUp, Atom, FileEdit, CalendarDays, ClipboardList, BookCopy, NotebookText, UserCircle, FileArchive, TestTubeDiagonal, Beaker, Edit, Link2, FileText, SearchIcon, Timer, Weight, Replace, HelpCircle, MoveVertical, Speaker, Projector, Zap, Network, Binary, Pipette, Magnet } from 'lucide-react';

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

export const APP_NAME = "PhysicsLab";
export const APP_AUTHOR = "Sir Abdul Ahad";

export interface SimulationTopic {
  id: string;
  name: string;
  grade: string;
  description: string;
  icon: LucideIcon;
  image?: string;
  aiHint?: string;
}

export const SIMULATION_TOPICS: SimulationTopic[] = [
  // Grade 9
  { id: "vernier-caliper-g9", name: "Vernier Caliper Practice", grade: "9", description: "Learn to read Vernier calipers accurately, identify zero error, and apply corrections.", icon: Ruler, image: "https://placehold.co/400x200.png", aiHint: "vernier caliper measure" },
  { id: "hookes-law-g9", name: "Hooke's Law Lab", grade: "9", description: "Investigate force-extension for springs, determine spring constant, and understand the limit of proportionality.", icon: Weight, image: "https://placehold.co/400x200.png", aiHint: "spring force experiment" },
  { id: "motion-constant-acceleration-g9", name: "Motion - Constant Acceleration", grade: "9", description: "Explore 1D motion, interpret motion graphs, and apply equations of motion.", icon: TrendingUp, image: "https://placehold.co/400x200.png", aiHint: "motion graph acceleration" },
  { id: "states-of-matter-g9", name: "States of Matter - Particle Model", grade: "9", description: "Visualize particle behavior in solids, liquids, and gases, and how temperature/pressure affect them.", icon: Atom, image: "https://placehold.co/400x200.png", aiHint: "particles solid liquid gas" },
  // Grade 10
  { id: "ripple-tank-g10", name: "Ripple Tank Simulation", grade: "10", description: "Observe wave reflection, refraction, and diffraction using a simulated ripple tank. Adjust wave parameters.", icon: Waves, image: "https://placehold.co/400x200.png", aiHint: "ripple tank waves" },
  { id: "sound-wave-g10", name: "Sound Wave Viewer & Echo", grade: "10", description: "Visualize longitudinal sound waves, compressions/rarefactions, and simulate the echo method for speed of sound.", icon: Speaker, image: "https://placehold.co/400x200.png", aiHint: "sound waves audio" },
  { id: "dispersion-prism-g10", name: "Dispersion of Light (Prism)", grade: "10", description: "Simulate white light passing through a prism to observe dispersion and rainbow formation.", icon: Pipette, image: "https://placehold.co/400x200.png", aiHint: "prism light spectrum" },
  { id: "ray-diagrams-g10", name: "Lens & Mirror Ray Diagram", grade: "10", description: "Interactively draw ray diagrams for spherical mirrors and lenses. Adjust object position and focal length.", icon: Projector, image: "https://placehold.co/400x200.png", aiHint: "optics lens mirror" },
  { id: "electric-field-g10", name: "Electric Field Visualizer", grade: "10", description: "Visualize electric field lines around point charges and understand electrostatic induction.", icon: Zap, image: "https://placehold.co/400x200.png", aiHint: "electric field charge" },
  { id: "simple-circuits-g10", name: "Simple Circuit Builder", grade: "10", description: "Build and test simple series/parallel circuits with virtual resistors, batteries, and meters to verify Ohm's law.", icon: Network, image: "https://placehold.co/400x200.png", aiHint: "electric circuit build" },
  { id: "magnetic-fields-forces-g10", name: "Magnetic Fields & Motor Principle", grade: "10", description: "Visualize magnetic fields and simulate the force on a current-carrying wire in a magnetic field.", icon: Magnet, image: "https://placehold.co/400x200.png", aiHint: "magnetism force motor" },
  { id: "logic-gates-g10", name: "Logic Gate Simulator", grade: "10", description: "Simulate basic logic gates (AND, OR, NOT, NAND, NOR) and verify their truth tables.", icon: Binary, image: "https://placehold.co/400x200.png", aiHint: "logic gates circuit" },
  // Grade 11
  { id: "projectile-motion-g11", name: "Projectile Motion", grade: "11", description: "Detailed simulation of projectile motion with calculations for range, height, and time of flight.", icon: Orbit, image: "https://placehold.co/400x200.png", aiHint: "projectile trajectory physics" },
  { id: "unit-converter-g11", name: "Unit Converter", grade: "11", description: "Convert between common physics units for length, mass, time, etc.", icon: Replace, image: "https://placehold.co/400x200.png", aiHint: "units conversion tool" },
  { id: "shm-spring-mass-g11", name: "SHM - Spring-Mass", grade: "11", description: "Simulate a spring-mass system and observe Simple Harmonic Motion.", icon: Waves, image: "https://placehold.co/400x200.png", aiHint: "spring mass oscillation" },
  { id: "sig-figs-practice-g11", name: "Significant Figures Practice", grade: "11", description: "Practice identifying and using significant figures.", icon: Sigma, image: "https://placehold.co/400x200.png", aiHint: "significant figures numbers" },
  { id: "capacitor-rc-circuit-g11", name: "Capacitor Charging/Discharging", grade: "11", description: "Visualize RC circuit charging and discharging.", icon: BatteryCharging, image: "https://placehold.co/400x200.png", aiHint: "capacitor circuit graph" },
  { id: "simple-pendulum-shm-g11", name: "Simple Pendulum SHM", grade: "11", description: "Simulate a simple pendulum and observe SHM.", icon: MoveVertical, image: "https://placehold.co/400x200.png", aiHint: "pendulum swing motion" },
];


export const QUIZ_TOPICS = [
  { id: "kinematics", name: "Kinematics Quiz", description: "Test your knowledge on motion, speed, velocity, and acceleration." },
  { id: "dynamics", name: "Dynamics Quiz", description: "Explore forces, Newton's laws, momentum, and energy." },
  { id: "electromagnetism", name: "Electromagnetism Quiz", description: "Questions on electric and magnetic fields, circuits, and waves." },
  { id: "optics", name: "Optics Quiz", description: "Challenge yourself with questions on light, reflection, refraction, lenses, and mirrors." },
  { id: "waves-sound", name: "Waves & Sound Quiz", description: "Test your understanding of wave properties, sound phenomena, and simple harmonic motion." },
  { id: "heat-thermo", name: "Heat & Thermodynamics Quiz", description: "Questions on temperature, heat transfer, states of matter, and laws of thermodynamics." },
];

export const SETTINGS_SEARCHABLE_KEYWORDS: {term: string, label: string, href: string}[] = [
    {term: "theme", label: "Appearance Theme (Light/Dark/System)", href: "/settings"},
    {term: "dark mode", label: "Dark Mode Theme Setting", href: "/settings"},
    {term: "light mode", label: "Light Mode Theme Setting", href: "/settings"},
    {term: "fun facts", label: "Fun Physics Facts Panel Setting", href: "/settings"},
    {term: "tidbits", label: "Fun Physics Tidbits Panel Setting", href: "/settings"},
    {term: "notifications", label: "Notification Settings (Coming Soon)", href: "/settings"},
    {term: "offline", label: "Offline Data & Sync Settings", href: "/settings"},
    {term: "login", label: "Login/Account Settings", href: "/settings"},
    {term: "account", label: "Login/Account Settings", href: "/settings"},
];
