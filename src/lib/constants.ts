
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
  Info, UsersRound, BookMarked, Telescope, GraduationCap, FlaskConical, Archive, PersonStanding,
  Bug, Droplets, GripVertical, Activity, Radiation, SigmaSquare, Route, Combine, TestTube,
  RadioTower, Wind, Cable, Cog, Aperture, BrainCircuit, AlignCenter, Album, BookKey, SquareRadical,
  FunctionSquare, Sparkles, Music // Added Music as it was used
} from 'lucide-react';

/**
 * Defines the structure for a navigation item in the sidebar.
 * @property {string} href - The path for the navigation link.
 * @property {string} label - The display text for the navigation item.
 * @property {LucideIcon} icon - The icon component to display next to the label.
 * @property {NavItem[]} [subItems] - Optional array of sub-navigation items.
 * @property {boolean} [matchExact] - If true, the path must match exactly for the item to be active.
 */
export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  subItems?: NavItem[];
  matchExact?: boolean;
};

/**
 * Main navigation items for the application sidebar.
 */
export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, matchExact: true },
  { href: '/simulations', label: 'Simulations', icon: Orbit },
  { href: '/study-material', label: 'Study Material', icon: BookOpen },
  { href: '/quizzes', label: 'Quizzes', icon: ListChecks },
  { href: '/assignments', label: 'Assignments', icon: Edit },
  { href: '/learn-with-ai', label: 'Learn with AI', icon: BrainCircuit },
  { href: '/mind-maps', label: 'Mind Maps', icon: Map },
  { href: '/model-papers', label: 'Model Papers', icon: FileArchive },
  { href: '/practicals', label: 'Practicals', icon: Beaker },
  { href: '/mdcat-preparation', label: 'MDCAT Prep', icon: TestTubeDiagonal },
  { href: '/philosophical-physics', label: 'Philosophical Physics', icon: Sparkles },
  { href: '/research-centers', label: 'Physics Research', icon: Telescope },
  { href: '/universities', label: 'University Programs', icon: GraduationCap },
  { href: '/lab-equipment', label: 'Lab Equipment', icon: FlaskConical },
  { href: '/about-us', label: 'About Us', icon: Info },
  {
    href: '/teacher-dashboard',
    label: 'Teacher Panel',
    icon: UserCog,
    subItems: [
      { href: '/teacher-dashboard/accounts', label: 'Student Accounts', icon: UsersRound },
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
 * @property {string} id - Unique identifier, often used in the route.
 * @property {string} name - Display name of the simulation.
 * @property {string} grade - Target grade level(s).
 * @property {string} description - Brief description of what the simulation covers.
 * @property {LucideIcon} icon - Icon to represent the simulation.
 * @property {string} [image] - Optional URL for a thumbnail image.
 * @property {string} [aiHint] - Optional hint for AI image generation tools if placeholders are used.
 */
export interface SimulationTopic {
  id: string;
  name: string;
  grade: string;
  description: string;
  icon: LucideIcon;
  image?: string;
  aiHint?: string;
}

/**
 * List of available interactive simulations in the application.
 * This list populates the simulations page and is used for search.
 */
export const SIMULATION_TOPICS: SimulationTopic[] = [
  // --- Grade 9 Simulations ---
  {
    id: "measurement-tool-interactive-g9",
    name: "G9: Measurement Tool Interactive",
    grade: "9",
    description: "Practice using Vernier Calipers, Micrometer Screw Gauge, rulers, and protractors. Includes reading scales, identifying zero error, and understanding precision. Simulates interactive measurement tools and provides feedback.",
    icon: Ruler,
    image: "https://placehold.co/400x200.png",
    aiHint: "vernier caliper measure gauge"
  },
  {
    id: "sig-figs-scientific-notation-g9",
    name: "G9: Sig Figs & Sci Notation Practice",
    grade: "9",
    description: "Interactive exercises for mastering significant figures and scientific notation, with immediate feedback on user answers.",
    icon: SigmaSquare,
    image: "https://placehold.co/400x200.png",
    aiHint: "significant figures notation math"
  },
  {
    id: "motion-graphing-lab-g9",
    name: "G9: 1D Motion Graphing Lab (PVA)",
    grade: "9",
    description: "Control an object's motion (position, velocity, acceleration) and observe real-time generation of P-t, V-t, and A-t graphs. Inspired by PhET's Moving Man. Allows user input for motion parameters and challenges like drawing graphs.",
    icon: LineChart,
    image: "https://placehold.co/400x200.png",
    aiHint: "motion graph kinematics pva"
  },
  {
    id: "phet-projectile-motion-g9",
    name: "G9: PhET: Projectile Motion",
    grade: "9",
    description: "Launch objects with adjustable angle, initial speed. Analyze trajectory, range, max height. Includes vector components, energy graphs, and air resistance toggle. Inspired by PhET. Includes 'Hit the Target' game mode.",
    icon: Orbit,
    image: "https://placehold.co/400x200.png",
    aiHint: "projectile motion trajectory physics"
  },
  {
    id: "vectors-lab-g9",
    name: "G9: Vectors Addition/Subtraction Lab",
    grade: "9",
    description: "Interactively add and subtract vectors using graphical (head-to-tail) and analytical (component) methods. Drag, drop, and see the resultant vector.",
    icon: Move,
    image: "https://placehold.co/400x200.png",
    aiHint: "vector addition physics forces"
  },
  {
    id: "forces-motion-workbench-g9",
    name: "G9: Forces & Motion Workbench (Newton's Laws)",
    grade: "9",
    description: "Apply forces to objects, observe acceleration, analyze Free-Body Diagrams (FBDs), and explore friction on different surfaces. Based on Newton's Laws. Inspired by PhET's Forces and Motion: Basics. Includes 'Predict the Motion' challenge.",
    icon: PersonStanding,
    image: "https://placehold.co/400x200.png",
    aiHint: "forces newton friction physics"
  },
  {
    id: "momentum-collisions-lab-g9",
    name: "G9: Momentum & Collisions Lab",
    grade: "9",
    description: "Simulate 1D and 2D elastic/inelastic collisions. Observe conservation of momentum and changes in kinetic energy. Adjustable masses and initial velocities.",
    icon: Combine,
    image: "https://placehold.co/400x200.png",
    aiHint: "momentum collision physics energy"
  },
  {
    id: "uniform-circular-motion-g9",
    name: "G9: Uniform Circular Motion Simulator",
    grade: "9",
    description: "Explore centripetal force, velocity, and acceleration in uniform circular motion. Adjust radius, speed, and mass. Visualize force and velocity vectors.",
    icon: RefreshCw,
    image: "https://placehold.co/400x200.png",
    aiHint: "circular motion centripetal force"
  },
  {
    id: "work-energy-lab-g9",
    name: "G9: Work-Energy Transformation Lab",
    grade: "9",
    description: "Investigate Kinetic Energy (KE), Potential Energy (PE), work done by/against friction, and power in scenarios like inclined planes and spring systems.",
    icon: Route,
    image: "https://placehold.co/400x200.png",
    aiHint: "work energy power physics"
  },
  {
    id: "conservation-energy-rollercoaster-g9",
    name: "G9: Conservation of Energy Roller Coaster",
    grade: "9",
    description: "Design tracks and observe energy transformations (KE, PE, Thermal) for a roller coaster. Explore conservative and non-conservative forces. Inspired by PhET's Energy Skate Park. Includes 'Design a Rollercoaster' mode.",
    icon: Zap,
    image: "https://placehold.co/400x200.png",
    aiHint: "energy conservation roller coaster physics"
  },
  {
    id: "simple-machines-levers-pulleys-g9",
    name: "G9: Levers & Pulleys Efficiency Analyzer",
    grade: "9",
    description: "Analyze mechanical advantage (MA) and efficiency of interactive levers and pulley systems with adjustable loads and efforts.",
    icon: Anchor,
    image: "https://placehold.co/400x200.png",
    aiHint: "simple machines lever pulley efficiency"
  },
  {
    id: "simple-machines-inclined-plane-g9",
    name: "G9: Inclined Plane & Screw Mechanism",
    grade: "9",
    description: "Interactively manipulate incline angle and screw pitch to understand work, Mechanical Advantage (MA), and efficiency.",
    icon: Album,
    image: "https://placehold.co/400x200.png",
    aiHint: "inclined plane screw simple machine"
  },
  {
    id: "universal-gravitation-explorer-g9",
    name: "G9: Law of Universal Gravitation Explorer",
    grade: "9",
    description: "Explore gravitational force between interactive planets/masses. Adjust masses and distance, observe force vectors. Demonstrates F = Gm₁m₂/r².",
    icon: Users,
    image: "https://placehold.co/400x200.png",
    aiHint: "gravity universal law planets"
  },
  {
    id: "density-buoyancy-lab-g9",
    name: "G9: Density & Buoyancy Lab",
    grade: "9",
    description: "Submerge objects of different materials and volumes, measure buoyant force, and calculate density. Explore Archimedes' Principle and conditions for flotation.",
    icon: Archive,
    image: "https://placehold.co/400x200.png",
    aiHint: "density buoyancy archimedes physics"
  },
  {
    id: "elasticity-hookes-law-g9",
    name: "G9: Hooke's Law & Stress-Strain Lab",
    grade: "9",
    description: "Investigate force-extension for springs and wires. Plot load-extension and stress-strain curves. Determine spring constant and Young's Modulus.",
    icon: Weight,
    image: "https://placehold.co/400x200.png",
    aiHint: "hookes law elasticity stress strain"
  },
  {
    id: "states-of-matter-g9",
    name: "G9: States of Matter - Particle Model",
    grade: "9",
    description: "Visualize particle behavior in solids, liquids, and gases, and how temperature/pressure affect them. Includes a conceptual P-V diagram, predicted state, and triple point hint. Inspired by PhET.",
    icon: Atom,
    image: "https://placehold.co/400x200.png",
    aiHint: "particles solid liquid gas"
  },
  {
    id: "thermal-expansion-g9",
    name: "G9: Thermal Expansion Simulator",
    grade: "9",
    description: "Simulate linear, area, and volume expansion of solids and liquids when heated. Observe changes with temperature adjustments.",
    icon: Thermometer,
    image: "https://placehold.co/400x200.png",
    aiHint: "thermal expansion heat physics"
  },
  {
    id: "heat-transfer-modes-g9",
    name: "G9: Heat Transfer Modes Visualizer",
    grade: "9",
    description: "Animated microscopic and macroscopic examples of conduction, convection, and radiation. Explore factors affecting heat transfer.",
    icon: Wind,
    image: "https://placehold.co/400x200.png",
    aiHint: "heat transfer conduction convection radiation"
  },
  {
    id: "specific-heat-calculator-g9",
    name: "G9: Specific Heat & Heat Capacity Calculator",
    grade: "9",
    description: "Interactive problem-solver for Q=mcΔT. Input values and calculate heat transferred, mass, specific heat capacity, or temperature change.",
    icon: SigmaSquare,
    image: "https://placehold.co/400x200.png",
    aiHint: "specific heat capacity calculator physics"
  },
  {
    id: "latent-heat-heating-curve-g9",
    name: "G9: Latent Heat & Phase Change Heating Curve",
    grade: "9",
    description: "Interactive graph showing the heating curve of a substance (e.g., ice to steam), highlighting phase transitions and explaining latent heat of fusion/vaporization.",
    icon: LineChart,
    image: "https://placehold.co/400x200.png",
    aiHint: "latent heat phase change heating curve"
  },
  {
    id: "magnetism-basics-g9",
    name: "G9: Magnetism Basics Explorer",
    grade: "9",
    description: "Explore temporary vs. permanent magnets, plot magnetic fields (bar magnet, Earth), and visualize paramagnetic/diamagnetic materials.",
    icon: Magnet,
    image: "https://placehold.co/400x200.png",
    aiHint: "magnetism magnetic field earth"
  },

  // --- Grade 10 Simulations ---
  {
    id: "shm-lab-g10",
    name: "G10: Simple Harmonic Motion (SHM) Lab",
    grade: "10",
    description: "Investigate SHM using spring-mass systems and simple pendulums. Analyze displacement, velocity, acceleration graphs, energy transformations, and damping. Inspired by PhET's Pendulum Lab.",
    icon: Waves,
    image: "https://placehold.co/400x200.png",
    aiHint: "shm simple harmonic motion pendulum spring"
  },
  {
    id: "wave-types-visualizer-g10",
    name: "G10: Types of Waves Visualizer",
    grade: "10",
    description: "Visualize transverse and longitudinal wave properties: amplitude, wavelength, frequency, speed. Interactive controls. Inspired by PhET's Wave on a String.",
    icon: AlignCenter,
    image: "https://placehold.co/400x200.png",
    aiHint: "wave properties transverse longitudinal"
  },
  {
    id: "wave-phenomena-g10",
    name: "G10: Wave Phenomena Simulator",
    grade: "10",
    description: "Explore superposition, interference (2D), diffraction, and standing waves. Adjust sources and observe patterns, nodes/antinodes. Inspired by ripple tank concepts.",
    icon: Waves,
    image: "https://placehold.co/400x200.png",
    aiHint: "wave interference diffraction superposition"
  },
  {
    id: "sound-propagation-g10",
    name: "G10: Sound Wave Propagation Animator",
    grade: "10",
    description: "Animate sound waves showing pressure/displacement variations. Control pitch (frequency) and loudness (amplitude). Inspired by PhET's Sound Waves.",
    icon: Speaker,
    image: "https://placehold.co/400x200.png",
    aiHint: "sound wave pressure pitch loudness"
  },
  {
    id: "resonance-musical-instruments-g10",
    name: "G10: Resonance & Musical Instruments",
    grade: "10",
    description: "Simulate vibrating strings and air columns. Observe formation of standing waves, fundamental frequencies, and harmonics in musical instruments.",
    icon: Music,
    image: "https://placehold.co/400x200.png",
    aiHint: "resonance standing waves musical instruments"
  },
  {
    id: "reflection-lab-g10",
    name: "G10: Reflection Lab (Plane Mirrors)",
    grade: "10",
    description: "Interactively explore laws of reflection using plane mirrors. Adjust incident ray angle and observe the reflected ray. Verify angle of incidence equals angle of reflection.",
    icon: BookKey,
    image: "https://placehold.co/400x200.png",
    aiHint: "reflection plane mirror light laws"
  },
  {
    id: "refraction-snells-law-g10",
    name: "G10: Refraction & Snell's Law Lab",
    grade: "10",
    description: "Observe light bending through different media. Adjust incident angle and refractive indices. Visualize critical angle and Total Internal Reflection (TIR). Inspired by PhET's Bending Light.",
    icon: Pipette,
    image: "https://placehold.co/400x200.png",
    aiHint: "refraction snells law tir light"
  },
  {
    id: "ray-tracing-g10",
    name: "G10: Lens & Mirror Ray Tracing (Advanced)",
    grade: "10",
    description: "Interactive optical bench for convex/concave lenses and spherical mirrors. Adjust object position, focal length. See image formation and properties. Inspired by PhET's Geometric Optics.",
    icon: Projector,
    image: "https://placehold.co/400x200.png",
    aiHint: "ray tracing lens mirror optics"
  },
  {
    id: "optical-instruments-g10",
    name: "G10: Optical Instruments Explorer",
    grade: "10",
    description: "Ray tracing demonstrations for simple microscope, compound microscope, and telescope, showing image formation and magnification principles.",
    icon: Aperture,
    image: "https://placehold.co/400x200.png",
    aiHint: "microscope telescope optical instruments"
  },
  {
    id: "electric-charges-forces-g10",
    name: "G10: Electric Charges & Forces Lab",
    grade: "10",
    description: "Simulate charging by friction/induction. Explore Coulomb's Law with interactive charges, visualize field lines and force vectors. Inspired by PhET's Balloons & Static Electricity.",
    icon: Zap,
    image: "https://placehold.co/400x200.png",
    aiHint: "electrostatics charge force coulomb"
  },
  {
    id: "electric-potential-energy-g10",
    name: "G10: Electric Potential & Potential Energy",
    grade: "10",
    description: "Move test charges in electric fields created by point charges or parallel plates. Visualize work done, potential difference, and changes in electric potential energy.",
    icon: BatteryCharging,
    image: "https://placehold.co/400x200.png",
    aiHint: "electric potential voltage energy field"
  },
  {
    id: "dc-circuit-kit-g10",
    name: "G10: DC Circuit Construction Kit",
    grade: "10",
    description: "Build DC circuits with drag & drop components (resistors, batteries, bulbs, switches). Use virtual ammeters and voltmeters. Visualize current flow. Verify Ohm's Law & Kirchhoff's Laws. Inspired by PhET.",
    icon: Network,
    image: "https://placehold.co/400x200.png",
    aiHint: "dc circuit ohm kirchhoff"
  },
  {
    id: "resistivity-factors-g10",
    name: "G10: Resistivity & Factors Affecting Resistance",
    grade: "10",
    description: "Interactively change material, length, and cross-sectional area of a wire to see effects on resistance. Calculate resistivity (ρ = RA/L).",
    icon: Cable,
    image: "https://placehold.co/400x200.png",
    aiHint: "resistivity resistance wire factors"
  },
  {
    id: "household-wiring-g10",
    name: "G10: Household Wiring Diagram",
    grade: "10",
    description: "Interactive diagram of household parallel wiring, showing connection of appliances and the function of safety features like fuses, circuit breakers, and earth wire.",
    icon: Cog,
    image: "https://placehold.co/400x200.png",
    aiHint: "household wiring circuit safety"
  },
  {
    id: "magnetic-field-visualizer-g10",
    name: "G10: Magnetic Field Visualizer",
    grade: "10",
    description: "Visualize magnetic field lines for bar magnets, straight current-carrying wires, circular loops, and solenoids. Use virtual compasses to explore field direction.",
    icon: Magnet,
    image: "https://placehold.co/400x200.png",
    aiHint: "magnetic field lines magnet current"
  },
  {
    id: "force-on-conductor-charge-g10",
    name: "G10: Force on Conductor/Moving Charge (Lorentz)",
    grade: "10",
    description: "Explore Lorentz Force. Visualize force on current-carrying conductor or moving charge in a magnetic field. Apply Fleming's Left-Hand Rule. Adjust B, I, L, q, v.",
    icon: GripVertical,
    image: "https://placehold.co/400x200.png",
    aiHint: "lorentz force magnetic field conductor"
  },
  {
    id: "dc-motor-animator-g10",
    name: "G10: DC Motor Principle Animator",
    grade: "10",
    description: "Animated demonstration of a simple DC motor, showing coil rotation in a magnetic field and the action of the split-ring commutator.",
    icon: RefreshCw,
    image: "https://placehold.co/400x200.png",
    aiHint: "dc motor electromagnetism principle"
  },
  {
    id: "logic-gates-g10",
    name: "G10: Logic Gate Simulator",
    grade: "10/12",
    description: "Simulate basic logic gates (AND, OR, NOT, NAND, NOR, XOR) and verify their truth tables. Allows building simple circuits. Inspired by PhET.",
    icon: Binary,
    image: "https://placehold.co/400x200.png",
    aiHint: "logic gates circuit digital"
  },

  // --- Grade 11 Simulations ---
  {
    id: "vector-analysis-lab-g11",
    name: "G11: Vector Analysis Lab",
    grade: "11",
    description: "Interactive 2D/3D vector manipulation. Component method for addition/subtraction, dot product visualization, cross product visualization (right-hand rule).",
    icon: Move,
    image: "https://placehold.co/400x200.png",
    aiHint: "vector analysis dot cross product"
  },
  {
    id: "forces-in-equilibrium-g11",
    name: "G11: Forces in Equilibrium Lab",
    grade: "11",
    description: "Analyze concurrent forces acting on a point. Adjust force magnitudes and angles to achieve equilibrium (net force = 0). Verify Lami's Theorem.",
    icon: Users,
    image: "https://placehold.co/400x200.png",
    aiHint: "forces equilibrium lami theorem"
  },
  {
    id: "gravitational-potential-escape-velocity-g11",
    name: "G11: Gravitational Potential & Escape Velocity",
    grade: "11",
    description: "Explore gravitational potential fields around planets. Calculate gravitational potential energy. Determine and visualize escape velocity for different celestial bodies.",
    icon: Orbit,
    image: "https://placehold.co/400x200.png",
    aiHint: "gravitational potential escape velocity"
  },
  {
    id: "power-calculation-efficiency-g11",
    name: "G11: Power Calculation & Efficiency",
    grade: "11",
    description: "Calculate power by varying work done/time taken, or force/velocity. Analyze and calculate the efficiency of various simple systems.",
    icon: TrendingUp,
    image: "https://placehold.co/400x200.png",
    aiHint: "power work efficiency calculation"
  },
  {
    id: "torque-rotational-equilibrium-g11",
    name: "G11: Torque & Rotational Equilibrium",
    grade: "11",
    description: "Apply forces at different points on a rigid body (e.g., a lever or wheel). Adjust pivot point. Explore conditions for rotational equilibrium (net torque = 0).",
    icon: RefreshCw,
    image: "https://placehold.co/400x200.png",
    aiHint: "torque rotational equilibrium moment"
  },
  {
    id: "angular-kinematics-g11",
    name: "G11: Angular Kinematics Lab",
    grade: "11",
    description: "Analyze angular displacement (θ), angular velocity (ω), and angular acceleration (α) of a point on a rotating disc. Relate to linear quantities. Inspired by PhET's Ladybug Revolution.",
    icon: Bug,
    image: "https://placehold.co/400x200.png",
    aiHint: "angular kinematics rotation velocity"
  },
  {
    id: "moment-of-inertia-angular-momentum-g11",
    name: "G11: Moment of Inertia & Angular Momentum",
    grade: "11",
    description: "Explore moment of inertia for different shapes (rod, disk, sphere). Simulate conservation of angular momentum by changing mass distribution of spinning objects (e.g., ice skater pulling arms in).",
    icon: PersonStanding,
    image: "https://placehold.co/400x200.png",
    aiHint: "moment of inertia angular momentum conservation"
  },
  {
    id: "real-world-centripetal-force-g11",
    name: "G11: Real-World Centripetal Force Applications",
    grade: "11",
    description: "Simulate banking of roads (how angle affects safe speed) and vertical circular motion (e.g., a bucket of water swung overhead, loop-the-loop), visualizing forces involved.",
    icon: Route,
    image: "https://placehold.co/400x200.png",
    aiHint: "centripetal force banking roads vertical circle"
  },
  {
    id: "satellite-motion-kepler-g11",
    name: "G11: Satellite Motion & Kepler's Laws",
    grade: "11",
    description: "Simulate satellite orbits (circular, elliptical) around a central body. Explore geostationary orbits. Visualize and verify Kepler's Laws of planetary motion. Inspired by PhET's My Solar System.",
    icon: Orbit,
    image: "https://placehold.co/400x200.png",
    aiHint: "satellite orbit kepler laws geostationary"
  },
  {
    id: "phet-fluid-pressure-flow-g11",
    name: "G11: PhET: Fluid Pressure & Flow Dynamics",
    grade: "11",
    description: "Explore pressure variation with depth, Pascal's Principle (hydraulic systems), Archimedes' Principle (buoyancy), Continuity Equation, and Bernoulli's Principle with interactive fluid flow and varying pipe widths. Inspired by PhET.",
    icon: Droplets,
    image: "https://placehold.co/400x200.png",
    aiHint: "fluid dynamics pressure pascal bernoulli"
  },
  {
    id: "surface-tension-capillarity-g11",
    name: "G11: Surface Tension & Capillarity Visualizer",
    grade: "11",
    description: "Visualize molecular forces causing surface tension (e.g., drop formation, insects on water) and capillary action (meniscus in tubes of different radii).",
    icon: TestTube,
    image: "https://placehold.co/400x200.png",
    aiHint: "surface tension capillarity molecular forces"
  },
  {
    id: "damped-forced-oscillations-g11",
    name: "G11: Damped & Forced Oscillations Lab",
    grade: "11",
    description: "Investigate damped oscillations (amplitude vs. time with varying damping coefficients) and forced oscillations. Observe resonance by adjusting driving frequency. Plot amplitude vs. frequency.",
    icon: Waves,
    image: "https://placehold.co/400x200.png",
    aiHint: "damped oscillations forced resonance"
  },
  {
    id: "doppler-effect-animator-g11",
    name: "G11: Doppler Effect Animator",
    grade: "11",
    description: "Visualize wavefronts from a moving source or for a moving observer. Observe changes in perceived frequency/wavelength for sound and (conceptually) light.",
    icon: Speaker,
    image: "https://placehold.co/400x200.png",
    aiHint: "doppler effect sound light waves"
  },
  {
    id: "youngs-double-slit-g11",
    name: "G11: Young's Double Slit Experiment",
    grade: "11",
    description: "Simulate interference patterns of light passing through double slits. Adjust slit separation, wavelength (color), and screen distance to observe changes in fringe spacing.",
    icon: AlignCenter,
    image: "https://placehold.co/400x200.png",
    aiHint: "youngs double slit interference light"
  },
  {
    id: "thin-film-interference-g11",
    name: "G11: Thin Film Interference Visualizer",
    grade: "11",
    description: "Conceptual animation showing light paths and interference (constructive/destructive) causing colors in soap bubbles or oil slicks. Vary film thickness and refractive index.",
    icon: SquareRadical,
    image: "https://placehold.co/400x200.png",
    aiHint: "thin film interference optics colors"
  },
  {
    id: "diffraction-grating-g11",
    name: "G11: Diffraction Grating Lab",
    grade: "11",
    description: "Simulate light passing through a diffraction grating, showing the formation of spectra and multiple order maxima. Adjust grating spacing and wavelength.",
    icon: FunctionSquare,
    image: "https://placehold.co/400x200.png",
    aiHint: "diffraction grating spectra light"
  },
  {
    id: "polarization-of-light-g11",
    name: "G11: Polarization of Light Lab",
    grade: "11",
    description: "Demonstrate the transverse nature of light using interactive polarizers. Rotate polarizers and observe changes in light intensity. Verify Malus's Law.",
    icon: Aperture,
    image: "https://placehold.co/400x200.png",
    aiHint: "polarization light malus law optics"
  },
  {
    id: "thermal-conductivity-g11",
    name: "G11: Thermal Conductivity Lab",
    grade: "11",
    description: "Compare heat flow rate through different materials (rods of same dimensions). Adjust material properties (conductivity) and temperature gradients.",
    icon: Thermometer,
    image: "https://placehold.co/400x200.png",
    aiHint: "thermal conductivity heat flow materials"
  },
  {
    id: "specific-heat-gases-cp-cv-g11",
    name: "G11: Specific Heats of Gases (Cp & Cv)",
    grade: "11",
    description: "Conceptual explanation of the difference between specific heat at constant pressure (Cp) and constant volume (Cv), their relation to internal energy, and Mayer's formula.",
    icon: SigmaSquare,
    image: "https://placehold.co/400x200.png",
    aiHint: "specific heat gases cp cv thermodynamics"
  },
  {
    id: "thermodynamic-processes-pv-g11",
    name: "G11: Thermodynamic Processes & P-V Diagrams",
    grade: "11",
    description: "Detailed tracing of Isothermal, Isobaric, Isochoric, and Adiabatic processes on P-V diagrams. Calculate work done (area under curve) for each process.",
    icon: LineChart,
    image: "https://placehold.co/400x200.png",
    aiHint: "thermodynamic processes pv diagram work"
  },
  {
    id: "electric-field-lines-complex-g11",
    name: "G11: Electric Field Lines (Complex Distributions)",
    grade: "11",
    description: "Visualize electric field lines for more complex charge distributions beyond point charges (e.g., charged plates, spheres, rings).",
    icon: Zap,
    image: "https://placehold.co/400x200.png",
    aiHint: "electric field lines charge distribution"
  },
  {
    id: "gauss-law-animator-g11",
    name: "G11: Gauss's Law Conceptual Animator",
    grade: "11",
    description: "Visualize electric flux through Gaussian surfaces for different charge enclosures. Understand the concept of surface integrals and how Gauss's Law simplifies field calculations.",
    icon: FunctionSquare,
    image: "https://placehold.co/400x200.png",
    aiHint: "gauss law electric flux electrostatics"
  },
  {
    id: "electric-potential-point-charges-g11",
    name: "G11: Electric Potential (Point Charges/Dipole)",
    grade: "11",
    description: "Map electric potential surfaces (equipotentials) and field lines for point charges and electric dipoles. Calculate potential at various points.",
    icon: BatteryCharging,
    image: "https://placehold.co/400x200.png",
    aiHint: "electric potential dipole equipotential"
  },
  {
    id: "capacitor-networks-g11",
    name: "G11: Capacitor Networks (Series/Parallel)",
    grade: "11",
    description: "Calculate equivalent capacitance for series/parallel capacitor networks. Analyze charge and voltage distribution across individual capacitors.",
    icon: Network,
    image: "https://placehold.co/400x200.png",
    aiHint: "capacitor series parallel circuits"
  },
  {
    id: "wheatstone-potentiometer-g11",
    name: "G11: Wheatstone Bridge & Potentiometer",
    grade: "11",
    description: "Interactive simulations for balancing a Wheatstone bridge to find an unknown resistance and using a potentiometer to measure an unknown EMF or compare EMFs.",
    icon: Scale,
    image: "https://placehold.co/400x200.png",
    aiHint: "wheatstone bridge potentiometer circuits"
  },
  {
    id: "magnetic-field-loops-solenoids-g11",
    name: "G11: Magnetic Fields (Loops & Solenoids)",
    grade: "11",
    description: "Detailed 3D visualization (or clear 2D cross-sections) of magnetic fields produced by current loops and solenoids. Apply right-hand rules.",
    icon: Magnet,
    image: "https://placehold.co/400x200.png",
    aiHint: "magnetic field current loop solenoid"
  },
  {
    id: "force-on-current-loop-g11",
    name: "G11: Force/Torque on Current Loop in B-Field",
    grade: "11",
    description: "Animate a current-carrying rectangular loop rotating in a uniform magnetic field, visualizing the forces on each segment and the resulting torque. Relate to DC motor principle.",
    icon: RefreshCw,
    image: "https://placehold.co/400x200.png",
    aiHint: "torque current loop magnetic field motor"
  },
  {
    id: "galvanometer-ammeter-voltmeter-g11",
    name: "G11: Galvanometer, Ammeter, Voltmeter (Internal)",
    grade: "11",
    description: "Explain the principle of operation of a moving coil galvanometer and its conversion into an ammeter (using shunt resistance) and voltmeter (using series high resistance).",
    icon: Activity,
    image: "https://placehold.co/400x200.png",
    aiHint: "galvanometer ammeter voltmeter circuits"
  },
  {
    id: "em-induction-faraday-lenz-g11",
    name: "G11: EM Induction (Faraday's/Lenz's Law)",
    grade: "11",
    description: "Simulate changing magnetic flux through a coil (e.g., moving magnet, changing current in another coil). Visualize induced EMF and current direction (Lenz's Law).",
    icon: Magnet,
    image: "https://placehold.co/400x200.png",
    aiHint: "electromagnetic induction faraday lenz law"
  },
  {
    id: "ac-generator-dc-motor-g11",
    name: "G11: AC Generator & DC Motor (Detailed)",
    grade: "11",
    description: "Detailed animations of the working principles of AC generators (rotating coil in B-field, slip rings) and DC motors (split-ring commutator, torque production).",
    icon: Cog,
    image: "https://placehold.co/400x200.png",
    aiHint: "ac generator dc motor electromagnetism"
  },
  {
    id: "transformer-efficiency-g11",
    name: "G11: Transformer Principles & Efficiency",
    grade: "11",
    description: "Simulate step-up/step-down transformers. Explore turns ratio, voltage/current relationships. Discuss power losses (eddy currents, hysteresis, flux leakage) and efficiency.",
    icon: Network,
    image: "https://placehold.co/400x200.png",
    aiHint: "transformer step up step down efficiency"
  },
  {
    id: "cro-principle-g11",
    name: "G11: Cathode Ray Oscilloscope (CRO) Principle",
    grade: "11",
    description: "Visualize the electron gun, deflection plates (X and Y), and how time-varying voltage signals create waveforms on a fluorescent screen.",
    icon: Activity,
    image: "https://placehold.co/400x200.png",
    aiHint: "cro oscilloscope waveform electronics"
  },
  {
    id: "modulation-demodulation-g11",
    name: "G11: Modulation/Demodulation (AM/FM)",
    grade: "11",
    description: "Conceptual animations of Amplitude Modulation (AM) and Frequency Modulation (FM), showing carrier waves and how information signals are encoded and decoded.",
    icon: RadioTower,
    image: "https://placehold.co/400x200.png",
    aiHint: "modulation am fm communication waves"
  },
  {
    id: "optical-fiber-communication-g11",
    name: "G11: Optical Fiber Communication Principles",
    grade: "11",
    description: "Animated light path demonstrating Total Internal Reflection (TIR) in optical fibers. Explain principles of light propagation and advantages in communication.",
    icon: Cable,
    image: "https://placehold.co/400x200.png",
    aiHint: "optical fiber tir communication light"
  },
  {
    id: "satellite-communication-g11",
    name: "G11: Satellite Communication Systems",
    grade: "11",
    description: "Conceptual diagram of satellite communication, including geostationary orbits, uplink/downlink frequencies, signal transmission, and reception.",
    icon: Orbit,
    image: "https://placehold.co/400x200.png",
    aiHint: "satellite communication geostationary orbit"
  },

  // --- Grade 12 Simulations ---
  {
    id: "ideal-gas-law-g12",
    name: "G12: Ideal Gas Law & Thermo Processes (Adv)",
    grade: "12",
    description: "Microscopic particle view, P-V-T controls & readouts, interactive P-V diagram tracing Isothermal, Isobaric, Isochoric, Adiabatic processes. Work Done, ΔU calculations. Maxwell-Boltzmann distribution. Inspired by PhET's Gas Properties.",
    icon: Thermometer,
    image: "https://placehold.co/400x200.png",
    aiHint: "ideal gas law thermodynamics pv diagram"
  },
  {
    id: "carnot-engine-g12",
    name: "G12: Carnot Engine Cycle Animator",
    grade: "12",
    description: "Step-by-step animation of Carnot cycle with synchronized P-V diagram. Calculate efficiency based on reservoir temperatures.",
    icon: Replace,
    image: "https://placehold.co/400x200.png",
    aiHint: "carnot engine thermodynamics cycle efficiency"
  },
  {
    id: "heat-engines-refrigerators-g12",
    name: "G12: Heat Engines & Refrigerators",
    grade: "12",
    description: "Conceptual cycle animations for heat engines and refrigerators, illustrating principles and coefficient of performance (COP).",
    icon: Cog,
    image: "https://placehold.co/400x200.png",
    aiHint: "heat engine refrigerator thermodynamics"
  },
  {
    id: "electric-field-potential-g12",
    name: "G12: Electric Field & Potential Mapping (Adv)",
    grade: "12",
    description: "Map electric fields and equipotential lines for complex charge distributions. Drag test charges and observe force, potential, and ΔPE. Inspired by PhET's Charges and Fields.",
    icon: Zap,
    image: "https://placehold.co/400x200.png",
    aiHint: "electric field potential mapping advanced"
  },
  {
    id: "capacitor-networks-g12",
    name: "G12: Capacitor Networks Analysis",
    grade: "12",
    description: "Analyze complex series/parallel capacitor combinations, calculating equivalent capacitance, charge, and voltage distribution across each capacitor.",
    icon: Network,
    image: "https://placehold.co/400x200.png",
    aiHint: "capacitor networks series parallel"
  },
  {
    id: "capacitor-energy-g12",
    name: "G12: Energy Stored in a Capacitor",
    grade: "12",
    description: "Calculate and visualize the energy stored in a capacitor (U = 1/2 CV^2) with interactive parameters for C and V. Show energy graphs.",
    icon: BatteryCharging,
    image: "https://placehold.co/400x200.png",
    aiHint: "capacitor energy stored electrostatics"
  },
  {
    id: "ac-circuit-analyzer-g12",
    name: "G12: AC Circuit Analyzer (RLC)",
    grade: "12",
    description: "Build RLC series/parallel circuits with AC source. Real-time oscilloscope (V_R, V_L, V_C, I, V_S), dynamic phasor diagrams, impedance/reactance calculation, resonance visualization. Inspired by PhET's Circuit Construction Kit (AC).",
    icon: Activity,
    image: "https://placehold.co/400x200.png",
    aiHint: "ac circuit rlc oscilloscope phasor"
  },
  {
    id: "ac-power-g12",
    name: "G12: Power in AC Circuits",
    grade: "12",
    description: "Explore Real Power (P), Reactive Power (Q), and Apparent Power (S) in AC circuits. Calculate and visualize the power triangle and Power Factor (cos φ).",
    icon: TrendingUp,
    image: "https://placehold.co/400x200.png",
    aiHint: "ac power factor circuits"
  },
  {
    id: "mass-spectrometer-g12",
    name: "G12: Mass Spectrometer Simulator",
    grade: "12",
    description: "Simulate ion path through velocity selector and deflection chamber. Adjust m, q, v, E, B. Calculate q/m ratio. Identify isotopes. Inspired by PhET's Faraday's Electromagnetic Lab.",
    icon: Scale,
    image: "https://placehold.co/400x200.png",
    aiHint: "mass spectrometer qm ratio isotopes"
  },
  {
    id: "hall-effect-g12",
    name: "G12: Hall Effect Simulator",
    grade: "12",
    description: "Visualize force on charge carriers in a conductor in a magnetic field, leading to Hall voltage. Explore effects of current, B-field, and material type (n-type/p-type).",
    icon: Magnet,
    image: "https://placehold.co/400x200.png",
    aiHint: "hall effect voltage semiconductor"
  },
  {
    id: "photoelectric-effect-g12",
    name: "G12: Photoelectric Effect (Enhanced)",
    grade: "12",
    description: "Adjust light frequency/intensity, metal work function. Observe emitted electrons, K.E. vs. Frequency graph, stopping voltage. Determine Planck's constant. Inspired by PhET.",
    icon: Sun,
    image: "https://placehold.co/400x200.png",
    aiHint: "photoelectric effect quantum light planck"
  },
  {
    id: "compton-effect-g12",
    name: "G12: Compton Effect Animator",
    grade: "12",
    description: "Conceptual animation of photon-electron scattering, showing wavelength change of photon and recoil of electron, demonstrating energy/momentum transfer.",
    icon: Sparkles,
    image: "https://placehold.co/400x200.png",
    aiHint: "compton effect scattering photon electron"
  },
  {
    id: "wave-particle-duality-g12",
    name: "G12: Wave-Particle Duality Visualizer",
    grade: "12",
    description: "Conceptual animation of electron diffraction (e.g., Davisson-Germer experiment setup), demonstrating the wave nature of particles. Compare with light wave diffraction.",
    icon: Waves,
    image: "https://placehold.co/400x200.png",
    aiHint: "wave particle duality electron diffraction"
  },
  {
    id: "blackbody-radiation-g12",
    name: "G12: Blackbody Radiation Curve Lab",
    grade: "12",
    description: "Interactive graph of blackbody radiation spectrum (Intensity vs. Wavelength). Adjust temperature and observe changes in peak wavelength (Wien's Law) and total power (Stefan-Boltzmann Law). Compare with classical theory (Rayleigh-Jeans).",
    icon: LineChart,
    image: "https://placehold.co/400x200.png",
    aiHint: "blackbody radiation planck curve temperature"
  },
  {
    id: "atomic-spectra-bohr-g12",
    name: "G12: Atomic Spectra & Bohr Model (Interactive)",
    grade: "12",
    description: "Interactive energy level diagram for Hydrogen. Simulate electron transitions upon photon absorption/emission. Display emission/absorption spectra (Balmer, Lyman, Paschen series).",
    icon: Atom,
    image: "https://placehold.co/400x200.png",
    aiHint: "atomic spectra bohr model emission absorption"
  },
  {
    id: "xray-production-spectra-g12",
    name: "G12: X-Ray Production & Spectra",
    grade: "12",
    description: "Conceptual animation of X-ray production (electron bombardment of metal target). Differentiate continuous spectrum (Bremsstrahlung) & characteristic X-ray peaks. Introduce Bragg's Law for X-ray diffraction.",
    icon: Activity,
    image: "https://placehold.co/400x200.png",
    aiHint: "xray production spectra bragg law"
  },
  {
    id: "laser-principle-g12",
    name: "G12: Laser Principle Animator",
    grade: "12",
    description: "Animated explanation of population inversion, stimulated emission, and coherent light production in a laser cavity (resonator).",
    icon: Zap,
    image: "https://placehold.co/400x200.png",
    aiHint: "laser principle stimulated emission light"
  },
  {
    id: "radioactive-decay-g12",
    name: "G12: Radioactive Decay Chains Visualizer (Adv)",
    grade: "12",
    description: "Visualize Alpha, Beta (β-, β+), Gamma decay. Trace decay series for common isotopes. Simulate half-life with a large number of nuclei and graph N vs. t, Activity vs. t.",
    icon: Radiation,
    image: "https://placehold.co/400x200.png",
    aiHint: "radioactive decay alpha beta gamma half life"
  },
  {
    id: "nuclear-fission-fusion-g12",
    name: "G12: Nuclear Fission & Fusion Animator (Adv)",
    grade: "12",
    description: "Detailed animations of chain reactions in fission (U-235) and conditions for D-T fusion. Quantify energy release (E=mc²). Conceptual nuclear reactor diagram.",
    icon: Atom,
    image: "https://placehold.co/400x200.png",
    aiHint: "nuclear fission fusion chain reaction energy"
  },
  {
    id: "binding-energy-mass-defect-g12",
    name: "G12: Binding Energy & Mass Defect",
    grade: "12",
    description: "Explore the binding energy per nucleon curve. Calculate mass defect and binding energy for selected nuclides. Understand nuclear stability, fission/fusion regions on the curve.",
    icon: SigmaSquare,
    image: "https://placehold.co/400x200.png",
    aiHint: "binding energy mass defect nuclear stability"
  },
  {
    id: "radioisotope-applications-g12",
    name: "G12: Applications of Radioisotopes",
    grade: "12",
    description: "Conceptual explanations and diagrams of radioisotope uses in medical imaging (tracers, PET scans), carbon dating, and industrial applications (thickness gauging, sterilization).",
    icon: TestTubeDiagonal,
    image: "https://placehold.co/400x200.png",
    aiHint: "radioisotopes applications medical dating"
  },
  {
    id: "standard-model-explorer-g12",
    name: "G12: Standard Model Particle Explorer",
    grade: "12",
    description: "Interactive diagram of the Standard Model: quarks, leptons, force carrier bosons (photon, gluon, W/Z, Higgs). Explore particle properties (charge, spin, mass - conceptual) and fundamental forces.",
    icon: BrainCircuit,
    image: "https://placehold.co/400x200.png",
    aiHint: "standard model quarks leptons bosons"
  },
  {
    id: "particle-accelerators-g12",
    name: "G12: Particle Accelerators (Conceptual)",
    grade: "12",
    description: "Conceptual animations explaining how cyclotrons and synchrotrons use electric and magnetic fields to accelerate particles to high energies.",
    icon: Orbit,
    image: "https://placehold.co/400x200.png",
    aiHint: "particle accelerator cyclotron synchrotron"
  }
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
  { id: "modern-physics", name: "Modern Physics Quiz", description: "Delve into topics like relativity, quantum physics, and nuclear physics." },
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
    // {term: "update", label: "Check for App Updates Setting", href: "/settings"}, // Commented out as it's an action.
    {term: "login", label: "Login/Account (via Header)", href: "/settings"}, // Directs to settings, but login is in header
    {term: "account", label: "Account Information (via Header)", href: "/settings"}, // Directs to settings, but account info is in header
];

/**
 * Defines curriculum boards for selection in features like Mind Maps.
 * @property {string} id - A unique identifier for the curriculum board.
 * @property {string} name - The display name of the curriculum board.
 */
export const CURRICULUM_BOARDS = [
  { id: 'stbb', name: 'Sindh Textbook Board (STBB)' },
  { id: 'ptbb', name: 'Punjab Textbook Board (PTBB)' },
  { id: 'national', name: 'National Curriculum (SNC)' },
];
