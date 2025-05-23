
/**
 * @fileOverview Defines constant values used throughout the application.
 * This includes navigation structures, lists of topics for simulations and quizzes,
 * application metadata, and searchable keywords for settings.
 */

import type { NavItem as NavItemType, SimulationTopic as SimTopicType } from '@/lib/types'; // Renamed to avoid conflict
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard, Orbit, BookOpen, ListChecks, Users, MessageSquare, Settings as SettingsIcon,
  UserCog, Lightbulb, Brain, Map, Ruler, Thermometer, Scale, Waves, Sigma,
  BatteryCharging, MoveHorizontal, TrendingUp, Atom, FileEdit, CalendarDays, ClipboardList, BookCopy,
  NotebookText, UserCircle, FileArchive, TestTubeDiagonal, Beaker, Edit, Link2, FileText,
  SearchIcon, Timer, Weight, Replace, HelpCircle, MoveVertical, Speaker, Projector, Zap,
  Network, Binary, Pipette, Magnet, LineChart, Move, Anchor, RefreshCw, GitCommitHorizontal, Sun,
  Info, UsersRound, BookMarked, Telescope, GraduationCap, FlaskConical, Archive, PersonStanding,
  Bug, Droplets, GripVertical, Activity, Radiation, SigmaSquare, Route, Combine, TestTube,
  RadioTower, Wind, Cable, Cog, Aperture, BrainCircuit, AlignCenter, Album, BookKey,
  FunctionSquare, Sparkles, Rocket, DraftingCompass, Microscope, SlidersHorizontal,
  Recycle, Milestone, SquareAsterisk, Dna, Bot, GitFork, BinaryIcon // Added Rocket, DraftingCompass, Microscope, SlidersHorizontal and more
} from 'lucide-react';

/**
 * Defines the structure for a navigation item in the sidebar.
 */
export type NavItem = NavItemType; // Use imported type

/**
 * Defines the structure for a simulation topic.
 */
export type SimulationTopic = SimTopicType; // Use imported type

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

export const SIMULATION_CATEGORIES = [
  "Measurements & Units",
  "Kinematics",
  "Dynamics & Forces",
  "Work, Energy & Power",
  "Simple Machines",
  "Gravitation & Orbital Mechanics",
  "Properties of Matter & Fluids",
  "Elasticity",
  "Heat & Thermodynamics",
  "Waves & Oscillations",
  "Sound",
  "Light & Optics",
  "Electrostatics",
  "Current Electricity",
  "Magnetism & Electromagnetism",
  "Electronics",
  "Modern Physics",
  "Nuclear Physics",
  "Particle Physics",
  "Communication Systems",
  "Lab Skills & Instruments"
];


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
    description: "Practice using Vernier Calipers, Micrometer Screw Gauge, rulers, and protractors. Includes reading scales, identifying zero error, and understanding precision. PhysicsLab Enhancement: Allow users to drag instruments, close jaws, read scales. Generate random objects for measurement. Provide feedback and explain common mistakes. Animate Vernier scale principle.",
    icon: Ruler,
    categories: ["Measurements & Units", "Lab Skills & Instruments"],
    image: "https://placehold.co/400x200.png",
    aiHint: "vernier caliper measure gauge"
  },
  {
    id: "sig-figs-scientific-notation-g9",
    name: "G9: Sig Figs & Sci Notation Practice",
    grade: "9",
    description: "Interactive exercises for mastering significant figures in readings/calculations and scientific notation, with immediate feedback on user answers.",
    icon: SigmaSquare,
    categories: ["Measurements & Units"],
    image: "https://placehold.co/400x200.png",
    aiHint: "significant figures notation math"
  },
  {
    id: "measurement-errors-visualizer-g9",
    name: "G9: Measurement Errors Visualizer",
    grade: "9",
    description: "Visualizations of systematic vs. random errors, and least count error. Interactive elements to show how these errors affect measurements.",
    icon: DraftingCompass, // Icon for precision/measurement
    categories: ["Measurements & Units", "Lab Skills & Instruments"],
    image: "https://placehold.co/400x200.png",
    aiHint: "measurement error systematic random"
  },
  {
    id: "phet-moving-man-g9",
    name: "G9: PhET: The Moving Man (Kinematics)",
    grade: "9",
    description: "Control position, velocity, acceleration of a figure. See real-time P-T, V-T, A-T graphs. PhysicsLab Enhancement: Graphical synchronization, user input for motion parameters, 'Draw the Graph' challenge.",
    icon: PersonStanding,
    categories: ["Kinematics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "kinematics motion graph pva"
  },
  {
    id: "motion-graphing-lab-g9",
    name: "G9: 1D Motion Graphing Lab (PVA)",
    grade: "9",
    description: "Explore how changes in velocity and acceleration affect position-time and velocity-time graphs. Users can input motion parameters or sketch graphs.",
    icon: LineChart,
    categories: ["Kinematics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "motion graph kinematics"
  },
  {
    id: "phet-projectile-motion-g9",
    name: "G9: PhET: Projectile Motion",
    grade: "9",
    description: "Launch objects with adjustable angle, speed, mass. Observe trajectory. PhysicsLab Enhancement: Air resistance toggle, vector components (velocity, acceleration), 'Hit the Target' game, energy analysis graph.",
    icon: Orbit,
    categories: ["Kinematics", "Dynamics & Forces"],
    image: "https://placehold.co/400x200.png",
    aiHint: "projectile motion trajectory physics"
  },
  {
    id: "relative-velocity-scenarios-g9",
    name: "G9: Relative Velocity Scenarios",
    grade: "9",
    description: "Interactive animation of relative motion for boats in rivers, planes in wind. Users control velocities and observe resultant paths.",
    icon: Ship, // Placeholder, need a suitable icon
    categories: ["Kinematics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "relative velocity boat river plane"
  },
   {
    id: "motion-under-gravity-g9",
    name: "G9: Motion Under Gravity (Free Fall)",
    grade: "9",
    description: "Simulate objects falling with/without air resistance. Show increasing velocity and the effect of air resistance leading to terminal velocity.",
    icon: ArrowDown, // Placeholder
    categories: ["Kinematics", "Dynamics & Forces"],
    image: "https://placehold.co/400x200.png",
    aiHint: "free fall gravity air resistance"
  },
  {
    id: "vectors-lab-g9",
    name: "G9: Vectors Addition/Subtraction Lab",
    grade: "9",
    description: "Interactively add and subtract vectors using graphical (head-to-tail) and analytical (component) methods. Drag & drop vectors, see resultant.",
    icon: Move, // Represents vector direction/movement
    categories: ["Kinematics", "Dynamics & Forces"],
    image: "https://placehold.co/400x200.png",
    aiHint: "vector addition physics forces"
  },
  {
    id: "phet-forces-motion-basics-g9",
    name: "G9: PhET: Forces and Motion Basics",
    grade: "9",
    description: "Explore net force, friction, Newton's laws. Apply forces, observe acceleration. PhysicsLab Enhancement: Interactive Free-Body Diagrams, real-time net force/acceleration calculation, adjustable friction coefficients, 'Predict the Motion' challenge.",
    icon: PersonStanding, // Reusing, or use GitFork for force interaction
    categories: ["Dynamics & Forces"],
    image: "https://placehold.co/400x200.png",
    aiHint: "forces newton friction physics"
  },
   {
    id: "forces-as-vectors-composer-g9",
    name: "G9: Forces as Vectors Composer",
    grade: "9",
    description: "Interactive tool to resolve forces into components (x, y) and find the resultant of multiple forces acting on a point.",
    icon: GitFork, // Represents combining/splitting forces
    categories: ["Dynamics & Forces"],
    image: "https://placehold.co/400x200.png",
    aiHint: "force vectors components resultant"
  },
  {
    id: "inertia-demonstration-g9",
    name: "G9: Inertia Demonstration",
    grade: "9",
    description: "Animation showing an object's resistance to change in motion, e.g., coin on cardboard flicked away, passengers in a braking bus.",
    icon: Box, // Placeholder for object
    categories: ["Dynamics & Forces"],
    image: "https://placehold.co/400x200.png",
    aiHint: "inertia newton first law"
  },
  {
    id: "action-reaction-pairs-visualizer-g9",
    name: "G9: Action-Reaction Pairs Visualizer",
    grade: "9",
    description: "Identifying and visualizing Newton's 3rd Law pairs in various scenarios (e.g., person pushing a wall, rocket propulsion).",
    icon: Users, // Represents interaction between two entities
    categories: ["Dynamics & Forces"],
    image: "https://placehold.co/400x200.png",
    aiHint: "newton third law action reaction"
  },
   {
    id: "momentum-collisions-lab-g9",
    name: "G9: Momentum & Collisions Lab",
    grade: "9",
    description: "Simulate 1D and 2D elastic/inelastic collisions. Observe conservation of momentum and changes in kinetic energy. Adjustable masses and initial velocities.",
    icon: Combine, // Represents merging/colliding
    categories: ["Dynamics & Forces"],
    image: "https://placehold.co/400x200.png",
    aiHint: "momentum collision physics energy"
  },
  {
    id: "momentum-change-impulse-g9",
    name: "G9: Momentum Change & Impulse",
    grade: "9",
    description: "Interactive Force vs. Time graph. Calculate impulse (area under graph) and link it to the change in momentum of an object.",
    icon: AreaChart, // Placeholder
    categories: ["Dynamics & Forces"],
    image: "https://placehold.co/400x200.png",
    aiHint: "impulse momentum force time graph"
  },
  {
    id: "uniform-circular-motion-g9",
    name: "G9: Uniform Circular Motion Simulator",
    grade: "9",
    description: "Explore centripetal force, velocity, and acceleration in uniform circular motion. Adjust radius, speed, and mass. Visualize force and velocity vectors.",
    icon: RefreshCw, // Represents circular/repeating motion
    categories: ["Rotational & Circular Motion", "Dynamics & Forces"],
    image: "https://placehold.co/400x200.png",
    aiHint: "circular motion centripetal force"
  },
  {
    id: "phet-energy-skate-park-basics-g9",
    name: "G9: PhET: Energy Skate Park Basics",
    grade: "9",
    description: "Classic sim demonstrating conservation of mechanical energy (KE, PE) for a skateboarder. PhysicsLab Enhancement: Replicate track builder, real-time energy bars (KE, PE, Thermal, Total), friction control, numerical display, 'Design a Rollercoaster' mode.",
    icon: Zap, // Represents energy
    categories: ["Work, Energy & Power"],
    image: "https://placehold.co/400x200.png",
    aiHint: "energy skate park conservation physics"
  },
  {
    id: "work-energy-lab-g9",
    name: "G9: Work-Energy Transformation Lab",
    grade: "9",
    description: "Investigate Kinetic Energy (KE), Potential Energy (PE), work done by/against friction, and power in scenarios like inclined planes and spring systems.",
    icon: Route, // Represents path/work done
    categories: ["Work, Energy & Power"],
    image: "https://placehold.co/400x200.png",
    aiHint: "work energy power physics"
  },
  {
    id: "power-calculation-scenarios-g9",
    name: "G9: Power Calculation Scenarios",
    grade: "9",
    description: "Interactive problems for calculating power, e.g., lifting weights, running up stairs, showing work done over time.",
    icon: TrendingUp, // Represents rate/power
    categories: ["Work, Energy & Power"],
    image: "https://placehold.co/400x200.png",
    aiHint: "power calculation work time"
  },
  {
    id: "energy-forms-transformation-examples-g9",
    name: "G9: Energy Forms Transformation Examples",
    grade: "9",
    description: "Animation of energy changing forms: e.g., chemical to electrical to light in a flashlight, potential to kinetic in a falling object.",
    icon: Recycle, // Represents transformation
    categories: ["Work, Energy & Power"],
    image: "https://placehold.co/400x200.png",
    aiHint: "energy transformation forms"
  },
  {
    id: "simple-machines-levers-pulleys-g9",
    name: "G9: Levers & Pulleys Efficiency Analyzer",
    grade: "9",
    description: "Analyze mechanical advantage (MA) and efficiency of interactive levers and pulley systems with adjustable loads and efforts.",
    icon: Anchor, // Represents lifting/mechanical advantage
    categories: ["Simple Machines", "Work, Energy & Power"],
    image: "https://placehold.co/400x200.png",
    aiHint: "simple machines lever pulley efficiency"
  },
  {
    id: "simple-machines-inclined-plane-g9",
    name: "G9: Inclined Plane & Screw Mechanism",
    grade: "9",
    description: "Interactively manipulate incline angle and screw pitch to understand work, Mechanical Advantage (MA), and efficiency.",
    icon: Album, // Placeholder, represents a plane/surface
    categories: ["Simple Machines", "Work, Energy & Power"],
    image: "https://placehold.co/400x200.png",
    aiHint: "inclined plane screw simple machine"
  },
  {
    id: "wheel-axle-principle-g9",
    name: "G9: Wheel & Axle Principle",
    grade: "9",
    description: "Interactive visualization of a wheel and axle, showing how it works and allows calculation of its mechanical advantage.",
    icon: CircleDot, // Placeholder
    categories: ["Simple Machines"],
    image: "https://placehold.co/400x200.png",
    aiHint: "wheel axle mechanical advantage"
  },
  {
    id: "screw-as-inclined-plane-g9",
    name: "G9: Screw as Inclined Plane",
    grade: "9",
    description: "Animation or interactive model that 'unrolls' a screw to visualize it as a long, thin inclined plane wrapped around a cylinder.",
    icon: MinusSquare, // Placeholder, like unrolling a surface
    categories: ["Simple Machines"],
    image: "https://placehold.co/400x200.png",
    aiHint: "screw inclined plane visualization"
  },
  {
    id: "universal-gravitation-explorer-g9",
    name: "G9: Law of Universal Gravitation Explorer",
    grade: "9",
    description: "Explore gravitational force between interactive planets/masses. Adjust masses and distance, observe force vectors. Demonstrates F = Gm₁m₂/r².",
    icon: Users, // Represents interaction between two masses
    categories: ["Gravitation & Orbital Mechanics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "gravity universal law planets"
  },
  {
    id: "gravitational-field-strength-variation-g9",
    name: "G9: Gravitational Field Strength Variation",
    grade: "9",
    description: "Graph/visualizer showing how gravitational field strength ('g') varies with altitude above Earth's surface and depth below it.",
    icon: LineChart,
    categories: ["Gravitation & Orbital Mechanics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "gravity field strength altitude depth"
  },
  {
    id: "weightlessness-in-orbit-g9",
    name: "G9: Weightlessness in Orbit",
    grade: "9",
    description: "Conceptual animation explaining how continuous free-fall causes the sensation of apparent weightlessness for astronauts in orbit.",
    icon: Orbit,
    categories: ["Gravitation & Orbital Mechanics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "weightlessness orbit free fall"
  },
  {
    id: "density-measurement-g9",
    name: "G9: Density Measurement (Interactive)",
    grade: "9",
    description: "Interactively determine density of objects using virtual measuring cylinders and balances. Methods for regular/irregular solids and liquids.",
    icon: Archive,
    categories: ["Properties of Matter & Fluids", "Measurements & Units"],
    image: "https://placehold.co/400x200.png",
    aiHint: "density volume mass"
  },
  {
    id: "density-buoyancy-lab-g9",
    name: "G9: Density & Buoyancy Lab",
    grade: "9",
    description: "Submerge objects of different materials and volumes, measure buoyant force, and calculate density. Explore Archimedes' Principle and conditions for flotation.",
    icon: Anchor, // Represents buoyancy
    categories: ["Properties of Matter & Fluids"],
    image: "https://placehold.co/400x200.png",
    aiHint: "density buoyancy archimedes physics"
  },
  {
    id: "pressure-in-solids-fluids-g9",
    name: "G9: Pressure in Solids & Fluids",
    grade: "9",
    description: "Conceptual visualization of force distribution creating pressure, e.g., a sharp knife vs. a blunt object on a surface, pressure with depth in a fluid.",
    icon: ArrowDownUp, // Placeholder
    categories: ["Properties of Matter & Fluids"],
    image: "https://placehold.co/400x200.png",
    aiHint: "pressure solids fluids force area"
  },
  {
    id: "liquid-level-communicating-vessels-g9",
    name: "G9: Liquid Level in Communicating Vessels",
    grade: "9",
    description: "Demonstration showing that liquid finds its own level in connected vessels of different shapes, illustrating equal pressure at the same depth.",
    icon: Beaker,
    categories: ["Properties of Matter & Fluids"],
    image: "https://placehold.co/400x200.png",
    aiHint: "communicating vessels liquid level pressure"
  },
  {
    id: "hookes-law-g9",
    name: "G9: Hooke's Law Lab",
    grade: "9",
    description: "Interactive simulation of Hooke's Law. Apply forces to a spring and observe extension. Plot Force vs. Extension graph and determine spring constant.",
    icon: Weight,
    categories: ["Elasticity", "Dynamics & Forces"],
    image: "https://placehold.co/400x200.png",
    aiHint: "hookes law spring force extension"
  },
  {
    id: "elasticity-hookes-law-g9", // This seems like a duplicate of the above, maybe refine/merge or ensure distinct focus
    name: "G9: Elasticity & Stress-Strain Lab",
    grade: "9",
    description: "Investigate force-extension for springs and wires. Plot load-extension and stress-strain curves. Determine spring constant and Young's Modulus.",
    icon: Weight,
    categories: ["Elasticity", "Properties of Matter & Fluids"],
    image: "https://placehold.co/400x200.png",
    aiHint: "hookes law elasticity stress strain"
  },
   {
    id: "types-of-stress-strain-g9",
    name: "G9: Types of Stress & Strain Visualizer",
    grade: "9",
    description: "Visual examples and animations of tensile, compressive, and shear stress and their corresponding strains on different materials.",
    icon: StretchHorizontal, // Placeholder
    categories: ["Elasticity", "Properties of Matter & Fluids"],
    image: "https://placehold.co/400x200.png",
    aiHint: "stress strain tensile compressive shear"
  },
  {
    id: "ductile-vs-brittle-materials-g9",
    name: "G9: Ductile vs. Brittle Materials",
    grade: "9",
    description: "Comparison of stress-strain curves for ductile and brittle materials, showing differences in elastic limit, yield point, and fracture.",
    icon: LineChart,
    categories: ["Elasticity", "Properties of Matter & Fluids"],
    image: "https://placehold.co/400x200.png",
    aiHint: "ductile brittle materials stress strain curve"
  },
  {
    id: "states-of-matter-g9",
    name: "G9: States of Matter - Particle Model",
    grade: "9",
    description: "Visualize particle behavior in solids, liquids, and gases. Temperature/pressure sliders affect behavior. Includes conceptual P-V diagram and predicted state hints. Microscopic animator for phase changes and Brownian motion.",
    icon: Atom,
    categories: ["Heat & Thermodynamics", "Properties of Matter & Fluids"],
    image: "https://placehold.co/400x200.png",
    aiHint: "particles solid liquid gas phase change"
  },
  {
    id: "thermal-expansion-g9",
    name: "G9: Thermal Expansion Simulator",
    grade: "9",
    description: "Simulate linear, area, and volume expansion of solids and liquids when heated. Observe changes with temperature adjustments.",
    icon: Thermometer, // Or an icon suggesting expansion
    categories: ["Heat & Thermodynamics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "thermal expansion heat physics"
  },
  {
    id: "bimetallic-strip-animator-g9",
    name: "G9: Bimetallic Strip Animator",
    grade: "9",
    description: "Demonstration of thermal expansion causing bending in a bimetallic strip, explaining its use in thermostats.",
    icon: Thermometer, // Or an icon for temperature control
    categories: ["Heat & Thermodynamics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "bimetallic strip thermal expansion thermostat"
  },
  {
    id: "heat-transfer-modes-g9",
    name: "G9: Heat Transfer Modes Visualizer",
    grade: "9",
    description: "Animated microscopic/macroscopic examples of conduction (vibrating particles), convection (fluid currents), and radiation (emitted waves). Explore factors affecting heat transfer.",
    icon: Wind, // Represents convection/movement
    categories: ["Heat & Thermodynamics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "heat transfer conduction convection radiation"
  },
  {
    id: "specific-heat-calculator-g9",
    name: "G9: Specific Heat & Heat Capacity Calculator",
    grade: "9",
    description: "Interactive problem-solver for Q=mcΔT. Input values and calculate heat transferred, mass, specific heat capacity, or temperature change.",
    icon: SigmaSquare, // Represents formula/calculation
    categories: ["Heat & Thermodynamics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "specific heat capacity calculator physics"
  },
  {
    id: "latent-heat-heating-curve-g9",
    name: "G9: Latent Heat & Phase Change Heating Curve",
    grade: "9",
    description: "Interactive graph showing the heating curve of a substance (e.g., ice to steam), highlighting phase transitions and explaining latent heat of fusion/vaporization.",
    icon: LineChart,
    categories: ["Heat & Thermodynamics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "latent heat phase change heating curve"
  },
  {
    id: "heating-curve-of-water-g9", // Similar to above, perhaps more specific
    name: "G9: Heating Curve of Water (Detailed)",
    grade: "9",
    description: "Detailed plot of energy input vs. temperature for water, showing melting and boiling plateaus and specific heat regions.",
    icon: LineChart,
    categories: ["Heat & Thermodynamics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "heating curve water phase change"
  },
  {
    id: "factors-affecting-evaporation-g9",
    name: "G9: Factors Affecting Evaporation Visualizer",
    grade: "9",
    description: "Interactive visualization showing how surface area, temperature, wind speed, and nature of liquid affect the rate of evaporation.",
    icon: Wind, // Represents air flow/evaporation
    categories: ["Heat & Thermodynamics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "evaporation factors temperature surface area"
  },
  {
    id: "magnetism-basics-g9",
    name: "G9: Magnetism Basics Explorer",
    grade: "9",
    description: "Explore temporary vs. permanent magnets, plot magnetic fields (bar magnet, Earth), and visualize paramagnetic/diamagnetic materials.",
    icon: Magnet,
    categories: ["Magnetism & Electromagnetism"],
    image: "https://placehold.co/400x200.png",
    aiHint: "magnetism magnetic field earth"
  },

  // --- Grade 10 Simulations ---
  {
    id: "phet-pendulum-lab-g10", // Replaces shm-lab-g10 for a PhET focus
    name: "G10: PhET: Pendulum Lab (SHM)",
    grade: "10/11",
    description: "Investigate pendulum period by changing length, mass, gravity, initial angle. PhysicsLab Enhancement: Plot angle/energy vs. time, 'Unknown Gravity' challenge.",
    icon: MoveVertical,
    categories: ["Waves & Oscillations"],
    image: "https://placehold.co/400x200.png",
    aiHint: "pendulum shm period gravity"
  },
  {
    id: "energy-in-shm-animator-g10",
    name: "G10: Energy in SHM Animator",
    grade: "10",
    description: "Visualize kinetic vs. potential energy exchange in a mass-spring system or simple pendulum over one complete cycle. Show graphs.",
    icon: BarChartBig, // Placeholder
    categories: ["Waves & Oscillations", "Work, Energy & Power"],
    image: "https://placehold.co/400x200.png",
    aiHint: "shm energy kinetic potential"
  },
  {
    id: "phet-wave-on-a-string-g10", // Replaces wave-types-visualizer-g10
    name: "G10: PhET: Wave on a String",
    grade: "10",
    description: "Create transverse waves. Adjust amplitude, frequency, damping, tension. PhysicsLab Enhancement: Display wavelength, period, speed. Explore standing waves (fixed/loose ends), visualize superposition.",
    icon: Waves,
    categories: ["Waves & Oscillations"],
    image: "https://placehold.co/400x200.png",
    aiHint: "wave on string transverse standing waves"
  },
  {
    id: "properties-of-waves-g10",
    name: "G10: Properties of Waves Diagram",
    grade: "10",
    description: "Interactive diagram to identify and label crest, trough, wavelength, amplitude, and period on a transverse wave.",
    icon: Waves,
    categories: ["Waves & Oscillations"],
    image: "https://placehold.co/400x200.png",
    aiHint: "wave properties diagram crest trough"
  },
  {
    id: "principle-of-superposition-g10",
    name: "G10: Principle of Superposition Visualizer",
    grade: "10",
    description: "Visualize two waves (transverse or pulses) combining to show constructive and destructive interference.",
    icon: Combine,
    categories: ["Waves & Oscillations"],
    image: "https://placehold.co/400x200.png",
    aiHint: "wave superposition interference"
  },
  {
    id: "wave-phenomena-g10", // Keep this if distinct from ripple tank
    name: "G10: Wave Phenomena Simulator (Advanced Ripple Tank)",
    grade: "10",
    description: "Explore superposition, 2D interference (e.g. Young's double source), diffraction (single/double slit), and standing waves. Adjustable sources and parameters to observe patterns, nodes/antinodes. Builds upon basic ripple tank.",
    icon: Waves, // Consider Square if more geometric
    categories: ["Waves & Oscillations", "Light & Optics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "wave interference diffraction ripple tank"
  },
  {
    id: "phet-sound-waves-g10", // Replaces sound-propagation-g10
    name: "G10: PhET: Sound Waves Visualizer",
    grade: "10",
    description: "Visualize sound as pressure variations. Control frequency/amplitude. PhysicsLab Enhancement: Animate longitudinal particle motion, show synchronized pressure/displacement graphs, demonstrate interference from multiple sources.",
    icon: Speaker,
    categories: ["Sound", "Waves & Oscillations"],
    image: "https://placehold.co/400x200.png",
    aiHint: "sound waves pressure pitch loudness"
  },
  {
    id: "factors-affecting-speed-of-sound-g10",
    name: "G10: Factors Affecting Speed of Sound",
    grade: "10",
    description: "Conceptual explanation and visualization of how temperature and medium density affect the speed of sound.",
    icon: Thermometer, // And perhaps density icon
    categories: ["Sound"],
    image: "https://placehold.co/400x200.png",
    aiHint: "speed of sound temperature density"
  },
  {
    id: "echolocation-principle-g10",
    name: "G10: Echolocation Principle Animator",
    grade: "10",
    description: "Animation showing sound waves reflecting off an object (echo) and how this can be used to calculate distance (e.g., by bats, sonar).",
    icon: Milestone, // Placeholder
    categories: ["Sound"],
    image: "https://placehold.co/400x200.png",
    aiHint: "echolocation sonar echo distance"
  },
  {
    id: "resonance-musical-instruments-g10",
    name: "G10: Resonance & Musical Instruments (Air Columns)",
    grade: "10",
    description: "Simulate vibrating strings and air columns (open/closed pipes). Observe formation of standing waves, fundamental frequencies, and harmonics.",
    icon: Music2, // Placeholder
    categories: ["Sound", "Waves & Oscillations"],
    image: "https://placehold.co/400x200.png",
    aiHint: "resonance standing waves musical instruments air columns"
  },
  {
    id: "phet-bending-light-g10", // Replaces refraction-snells-law-g10
    name: "G10: PhET: Bending Light (Refraction & TIR)",
    grade: "10",
    description: "Explore refraction/reflection. Shine laser through media. PhysicsLab Enhancement: Adjustable refractive indices, ray tracing tool, Snell's Law calculator, critical angle/TIR visualization.",
    icon: Pipette, // Represents light bending/refraction
    categories: ["Light & Optics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "refraction snells law tir light bending"
  },
  {
    id: "reflection-lab-g10", // Keep if distinct from Bending Light's reflection part
    name: "G10: Reflection Lab (Plane & Spherical Mirrors)",
    grade: "10",
    description: "Interactively explore laws of reflection using plane and spherical mirrors. Adjust incident ray angle and observe the reflected ray. Verify angle of incidence equals angle of reflection for plane mirrors. Ray diagrams for spherical mirrors.",
    icon: BookKey, // Or a mirror icon
    categories: ["Light & Optics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "reflection plane mirror light laws spherical"
  },
  {
    id: "image-formation-plane-mirror-g10",
    name: "G10: Image Formation by Plane Mirror",
    grade: "10",
    description: "Interactive ray tracing for a plane mirror, showing virtual image formation and its properties (laterally inverted, same size, same distance).",
    icon: Square, // Placeholder
    categories: ["Light & Optics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "plane mirror image formation virtual"
  },
  {
    id: "phet-geometric-optics-g10", // Replaces ray-tracing-g10
    name: "G10: PhET: Geometric Optics (Lenses & Mirrors)",
    grade: "10",
    description: "Visualize ray tracing for lenses/mirrors. Adjust object, properties. PhysicsLab Enhancement: Interactive tracing, image properties display, lens/mirror equation tool, simple compound systems.",
    icon: Projector,
    categories: ["Light & Optics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "geometric optics ray tracing lens mirror"
  },
  {
    id: "spherical-chromatic-aberration-g10",
    name: "G10: Lens/Mirror Aberrations Visualizer",
    grade: "10",
    description: "Conceptual animation of spherical aberration (rays not focusing at a single point) and chromatic aberration (colors dispersing) in lenses/mirrors.",
    icon: SigmaSquare, // Placeholder
    categories: ["Light & Optics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "lens aberration spherical chromatic"
  },
  {
    id: "magnifying-glass-animator-g10",
    name: "G10: Magnifying Glass Animator",
    grade: "10",
    description: "Ray tracing animation for a simple convex lens used as a magnifying glass, showing how it forms a magnified, virtual image.",
    icon: ZoomIn, // Placeholder
    categories: ["Light & Optics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "magnifying glass convex lens ray tracing"
  },
  {
    id: "optical-instruments-g10",
    name: "G10: Optical Instruments Explorer (Microscope/Telescope)",
    grade: "10",
    description: "Ray tracing demonstrations for simple microscope, compound microscope, and astronomical telescope, showing image formation and magnification principles.",
    icon: Aperture, // Or Microscope
    categories: ["Light & Optics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "microscope telescope optical instruments ray tracing"
  },
  {
    id: "phet-balloons-static-electricity-g10", // Replaces electric-charges-forces-g10
    name: "G10: PhET: Balloons & Static Electricity",
    grade: "10",
    description: "Demonstrates charging by friction/induction. Rub balloon, move near wall. PhysicsLab Enhancement: Microscopic electron visualization, charge redistribution animation, interactive forces between multiple charged objects.",
    icon: Zap,
    categories: ["Electrostatics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "static electricity balloons friction induction"
  },
  {
    id: "gold-leaf-electroscope-function-g10",
    name: "G10: Gold Leaf Electroscope Animator",
    grade: "10",
    description: "Animation showing how a gold leaf electroscope works when charged by contact or induction, visualizing leaf deflection.",
    icon: Leaf, // Placeholder
    categories: ["Electrostatics", "Lab Skills & Instruments"],
    image: "https://placehold.co/400x200.png",
    aiHint: "electroscope gold leaf charging"
  },
  {
    id: "electric-potential-energy-g10",
    name: "G10: Electric Potential & Potential Energy Lab",
    grade: "10",
    description: "Move test charges in electric fields (point charges, parallel plates). Visualize work done, potential difference, ΔPE.",
    icon: BatteryCharging,
    categories: ["Electrostatics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "electric potential voltage energy field"
  },
  {
    id: "capacitor-as-energy-storage-g10",
    name: "G10: Capacitor as Energy Storage",
    grade: "10",
    description: "Visualizing charge accumulation on capacitor plates and the concept of energy storage in the electric field between them.",
    icon: BatteryCharging,
    categories: ["Electrostatics", "Current Electricity"],
    image: "https://placehold.co/400x200.png",
    aiHint: "capacitor energy storage charge"
  },
  {
    id: "phet-circuit-construction-kit-dc-g10", // Replaces dc-circuit-kit-g10
    name: "G10: PhET: Circuit Construction Kit (DC)",
    grade: "10/12",
    description: "Build DC circuits (wires, batteries, resistors, bulbs, switches). PhysicsLab Enhancement: Visual current flow (animated electrons), functional ammeters/voltmeters, Ohm's Law/Kirchhoff's exploration, 'Build a Circuit' challenge.",
    icon: Network,
    categories: ["Current Electricity"],
    image: "https://placehold.co/400x200.png",
    aiHint: "dc circuit builder ohms law"
  },
  {
    id: "emf-vs-potential-difference-g10",
    name: "G10: EMF vs. Potential Difference",
    grade: "10",
    description: "Conceptual comparison using a circuit analogy to explain the difference between electromotive force (EMF) of a source and potential difference (voltage) across a component.",
    icon: Battery, // Placeholder
    categories: ["Current Electricity"],
    image: "https://placehold.co/400x200.png",
    aiHint: "emf potential difference voltage circuit"
  },
  {
    id: "internal-resistance-battery-g10",
    name: "G10: Internal Resistance of a Battery",
    grade: "10",
    description: "Circuit simulation showing how internal resistance of a battery causes a voltage drop when current flows, affecting the terminal potential difference.",
    icon: BatteryWarning, // Placeholder
    categories: ["Current Electricity"],
    image: "https://placehold.co/400x200.png",
    aiHint: "internal resistance battery voltage drop"
  },
  {
    id: "resistivity-factors-g10",
    name: "G10: Resistivity & Factors Affecting Resistance",
    grade: "10",
    description: "Interactively change material, length, and cross-sectional area of a wire to see effects on resistance. Calculate resistivity.",
    icon: Cable, // Or icon representing wire properties
    categories: ["Current Electricity"],
    image: "https://placehold.co/400x200.png",
    aiHint: "resistivity resistance wire factors"
  },
  {
    id: "joules-law-of-heating-g10",
    name: "G10: Joule's Law of Heating Visualizer",
    grade: "10",
    description: "Simulation showing how current, resistance, and time affect the heat produced in a resistor (e.g., a glowing filament). Visual representation of P = I²R.",
    icon: Heater, // Placeholder
    categories: ["Current Electricity", "Heat & Thermodynamics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "joules law heating resistor power"
  },
  {
    id: "household-wiring-g10",
    name: "G10: Household Wiring Diagram (Interactive)",
    grade: "10",
    description: "Interactive diagram of household parallel wiring, showing connection of appliances and the function of safety features (fuses, circuit breakers, earth wire). User can 'trip' a breaker.",
    icon: Plug, // Placeholder
    categories: ["Current Electricity"],
    image: "https://placehold.co/400x200.png",
    aiHint: "household wiring circuit safety fuse"
  },
  {
    id: "magnetic-field-current-conductor-g10", // Replaces magnetic-field-visualizer-g10 (partially)
    name: "G10: Magnetic Field (Current-Carrying Conductors)",
    grade: "10",
    description: "3D visualization of magnetic field lines around straight wires, circular loops, and solenoids. Interactive application of Right-Hand Rule.",
    icon: Magnet, // Or icons like Circle, Square for loop/solenoid
    categories: ["Magnetism & Electromagnetism"],
    image: "https://placehold.co/400x200.png",
    aiHint: "magnetic field current wire loop solenoid"
  },
  {
    id: "electromagnet-construction-g10",
    name: "G10: Electromagnet Construction Lab",
    grade: "10",
    description: "Interactive simulation to build an electromagnet. Vary number of turns, current, and core material (iron vs. air) and observe the strength of the magnetic field (e.g., by picking up paper clips).",
    icon: MagnetIcon, // Placeholder, Magnet is good
    categories: ["Magnetism & Electromagnetism"],
    image: "https://placehold.co/400x200.png",
    aiHint: "electromagnet construction coil current core"
  },
  {
    id: "magnetic-levitation-principle-g10",
    name: "G10: Magnetic Levitation Principle",
    grade: "10",
    description: "Simple demonstration using opposing magnetic fields from electromagnets or permanent magnets to levitate an object.",
    icon: Magnet, // Or an icon suggesting upward force
    categories: ["Magnetism & Electromagnetism"],
    image: "https://placehold.co/400x200.png",
    aiHint: "magnetic levitation repulsion"
  },
  {
    id: "force-on-conductor-charge-g10", // Keep, but ensure distinct from Fleming's rule one
    name: "G10: Force on Conductor/Charge (Motor Principle)",
    grade: "10",
    description: "Explore Lorentz Force. Visualize force on current-carrying conductor or moving charge in a magnetic field. Apply Fleming's Left-Hand Rule. Adjust B, I, L, q, v.",
    icon: GripVertical, // Represents force interaction
    categories: ["Magnetism & Electromagnetism"],
    image: "https://placehold.co/400x200.png",
    aiHint: "lorentz force magnetic field motor"
  },
  {
    id: "flemings-left-hand-rule-animator-g10",
    name: "G10: Fleming's Left-Hand Rule Animator",
    grade: "10",
    description: "Interactive tool to visualize Fleming's Left-Hand Rule. User inputs direction of B-field and current, tool shows direction of force.",
    icon: Hand, // Placeholder
    categories: ["Magnetism & Electromagnetism"],
    image: "https://placehold.co/400x200.png",
    aiHint: "fleming left hand rule force field current"
  },
  {
    id: "dc-motor-animator-g10",
    name: "G10: DC Motor Principle Animator (Detailed)",
    grade: "10",
    description: "Animated demonstration of a simple DC motor, showing coil rotation in a magnetic field, forces on coil sides, and the action of the split-ring commutator.",
    icon: RefreshCw, // Represents rotation
    categories: ["Magnetism & Electromagnetism"],
    image: "https://placehold.co/400x200.png",
    aiHint: "dc motor electromagnetism principle commutator"
  },
  // Logic Gates G10 is already covered by the existing logic-gates-g10.

  // --- Grade 11 Simulations (PhET Inspired & Specifics) ---
  {
    id: "vector-addition-perpendicular-components-g11",
    name: "G11: Vector Addition by Perpendicular Components",
    grade: "11",
    description: "Step-by-step graphical and analytical method for adding vectors by resolving them into perpendicular components and then recombining.",
    icon: GitFork,
    categories: ["Kinematics", "Dynamics & Forces"],
    image: "https://placehold.co/400x200.png",
    aiHint: "vector addition components resolution"
  },
  {
    id: "phet-forces-motion-friction-g11",
    name: "G11: PhET: Forces and Motion - Friction Focus",
    grade: "11",
    description: "Focuses on static/kinetic friction. Apply forces, observe motion threshold. PhysicsLab Enhancement: Detailed force vectors, adjustable surfaces/coefficients, Applied Force vs. Friction Force graphs.",
    icon: GripVertical,
    categories: ["Dynamics & Forces"],
    image: "https://placehold.co/400x200.png",
    aiHint: "friction static kinetic forces graph"
  },
  {
    id: "forces-in-equilibrium-g11",
    name: "G11: Forces in Equilibrium Lab (Concurrent)",
    grade: "11",
    description: "Analyze concurrent forces acting on a point. Adjust force magnitudes and angles to achieve equilibrium (net force = 0). Verify Lami's Theorem.",
    icon: Users,
    categories: ["Dynamics & Forces"],
    image: "https://placehold.co/400x200.png",
    aiHint: "forces equilibrium lami theorem concurrent"
  },
  {
    id: "momentum-rocketry-jet-propulsion-g11",
    name: "G11: Momentum in Rocketry/Jet Propulsion",
    grade: "11",
    description: "Conceptual animation explaining how rockets and jet engines work based on the principle of conservation of momentum (expelling mass).",
    icon: Rocket,
    categories: ["Dynamics & Forces"],
    image: "https://placehold.co/400x200.png",
    aiHint: "momentum rocket jet propulsion conservation"
  },
  {
    id: "phet-energy-skate-park-work-g11",
    name: "G11: PhET: Energy Skate Park - Work & Energy",
    grade: "11",
    description: "Advanced version. Add force applicator to do work on skater, showing how work changes mechanical energy. PhysicsLab Enhancement: External work visualization, instantaneous power display, 'Power Up' challenge.",
    icon: PersonStanding,
    categories: ["Work, Energy & Power"],
    image: "https://placehold.co/400x200.png",
    aiHint: "energy skate park work power theorem"
  },
  {
    id: "conservative-vs-non-conservative-forces-g11",
    name: "G11: Conservative vs. Non-Conservative Forces",
    grade: "11",
    description: "Simulations showing work done by gravity (conservative) is path-independent, while work done by friction (non-conservative) is path-dependent.",
    icon: Route,
    categories: ["Work, Energy & Power"],
    image: "https://placehold.co/400x200.png",
    aiHint: "conservative non-conservative forces work path"
  },
  {
    id: "energy-diagram-potential-energy-g11",
    name: "G11: Potential Energy Diagrams",
    grade: "11",
    description: "Interactive potential energy diagrams (e.g., for a spring, or a molecule). Identify stable, unstable, and neutral equilibrium points.",
    icon: LineChart,
    categories: ["Work, Energy & Power"],
    image: "https://placehold.co/400x200.png",
    aiHint: "potential energy diagram equilibrium stable unstable"
  },
  {
    id: "phet-ladybug-revolution-g11",
    name: "G11: PhET: Ladybug Revolution (Rotational)",
    grade: "11",
    description: "Explore angular position, velocity, acceleration. Place ladybug on rotating disk. PhysicsLab Enhancement: Visualize tangential/angular velocity, centripetal acceleration vectors, plot angular graphs, 'Break the String' challenge.",
    icon: Bug,
    categories: ["Rotational & Circular Motion"],
    image: "https://placehold.co/400x200.png",
    aiHint: "ladybug revolution rotational angular kinematics"
  },
  {
    id: "torque-rotational-equilibrium-g11",
    name: "G11: Torque & Rotational Equilibrium Lab",
    grade: "11",
    description: "Apply forces at different points on a rigid body (lever, wheel). Adjust pivot. Explore conditions for rotational equilibrium (net torque = 0).",
    icon: RefreshCw,
    categories: ["Rotational & Circular Motion"],
    image: "https://placehold.co/400x200.png",
    aiHint: "torque rotational equilibrium moment lever"
  },
  {
    id: "moment-of-inertia-angular-momentum-g11",
    name: "G11: Moment of Inertia & Angular Momentum Lab",
    grade: "11",
    description: "Explore moment of inertia for different shapes. Simulate conservation of angular momentum (e.g., ice skater pulling arms in).",
    icon: PersonStanding,
    categories: ["Rotational & Circular Motion"],
    image: "https://placehold.co/400x200.png",
    aiHint: "moment of inertia angular momentum conservation skater"
  },
  {
    id: "real-world-centripetal-force-g11",
    name: "G11: Real-World Centripetal Force Applications",
    grade: "11",
    description: "Simulate banking of roads (how angle affects safe speed) and vertical circular motion (bucket of water, loop-the-loop), visualizing forces.",
    icon: Car, // Placeholder
    categories: ["Rotational & Circular Motion"],
    image: "https://placehold.co/400x200.png",
    aiHint: "centripetal force banking roads vertical circle"
  },
  {
    id: "banking-of-roads-g11", // More specific
    name: "G11: Banking of Roads Analyzer",
    grade: "11",
    description: "Detailed analysis of forces acting on a car on a banked turn (normal force components, friction, centripetal force). Adjust bank angle, speed, coefficient of friction.",
    icon: BarChartHorizontal, // Placeholder
    categories: ["Rotational & Circular Motion", "Dynamics & Forces"],
    image: "https://placehold.co/400x200.png",
    aiHint: "banking roads friction centripetal force analysis"
  },
  {
    id: "artificial-gravity-space-stations-g11",
    name: "G11: Artificial Gravity in Space Stations",
    grade: "11",
    description: "Conceptual animation showing how rotation of a space station can create an apparent gravitational force for occupants.",
    icon: Orbit,
    categories: ["Rotational & Circular Motion", "Gravitation & Orbital Mechanics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "artificial gravity space station rotation"
  },
  {
    id: "phet-my-solar-system-g11",
    name: "G11: PhET: My Solar System (Gravitation)",
    grade: "11/12",
    description: "N-body gravitational simulator. Add bodies, masses, initial conditions. PhysicsLab Enhancement: Dynamic gravitational field visualization, real-time orbital elements display, 'Stable Orbit' challenge.",
    icon: Orbit,
    categories: ["Gravitation & Orbital Mechanics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "solar system gravity n-body orbits"
  },
  {
    id: "gravitational-potential-escape-velocity-g11", // More specific for G11
    name: "G11: Gravitational Potential & Escape Velocity",
    grade: "11",
    description: "Explore gravitational potential fields around planets. Calculate gravitational potential energy. Determine and visualize escape velocity for different celestial bodies. Graph of GPE vs. distance (negative values).",
    icon: Orbit,
    categories: ["Gravitation & Orbital Mechanics", "Work, Energy & Power"],
    image: "https://placehold.co/400x200.png",
    aiHint: "gravitational potential escape velocity energy"
  },
  {
    id: "satellite-orbits-types-g11",
    name: "G11: Satellite Orbits & Types Visualizer",
    grade: "11",
    description: "Visualize different types of satellite orbits: Circular, Elliptical. Explain characteristics of Geostationary and Polar orbits. Interactive orbit parameter adjustments.",
    icon: Satellite, // Placeholder
    categories: ["Gravitation & Orbital Mechanics", "Communication Systems"],
    image: "https://placehold.co/400x200.png",
    aiHint: "satellite orbits geostationary polar circular elliptical"
  },
  {
    id: "phet-fluid-pressure-flow-g11",
    name: "G11: PhET: Fluid Pressure and Flow Dynamics",
    grade: "11",
    description: "Explore pressure with depth, Pascal's Principle, Archimedes' Principle, Continuity Equation, Bernoulli's Principle. PhysicsLab Enhancement: Pressure visualization, buoyancy experiments, hydraulic system demo, animated flow through varying pipes.",
    icon: Droplets,
    categories: ["Properties of Matter & Fluids"],
    image: "https://placehold.co/400x200.png",
    aiHint: "fluid dynamics pressure pascal bernoulli buoyancy"
  },
  {
    id: "streamline-vs-turbulent-flow-g11",
    name: "G11: Streamline vs. Turbulent Flow Visualizer",
    grade: "11",
    description: "Visualizing fluid flow patterns (streamlines) around objects. Demonstrate transition from streamline to turbulent flow as speed increases or obstacle shape changes.",
    icon: Wind,
    categories: ["Properties of Matter & Fluids"],
    image: "https://placehold.co/400x200.png",
    aiHint: "streamline turbulent flow fluid dynamics"
  },
  {
    id: "venturi-effect-g11",
    name: "G11: Venturi Effect Animator",
    grade: "11",
    description: "Animation showing how fluid speed increases and pressure decreases as it flows through a constricted section of a pipe (Venturi tube). Applications.",
    icon: SeparatorHorizontal, // Placeholder
    categories: ["Properties of Matter & Fluids"],
    image: "https://placehold.co/400x200.png",
    aiHint: "venturi effect fluid dynamics pressure speed"
  },
  {
    id: "surface-tension-phenomena-g11", // Replaces surface-tension-capillarity-g11
    name: "G11: Surface Tension Phenomena Visualizer",
    grade: "11",
    description: "Visualize molecular forces causing surface tension (drop formation, insects on water) and capillary action (meniscus in tubes of different radii). Interactive elements to change liquid type or tube radius.",
    icon: TestTube,
    categories: ["Properties of Matter & Fluids"],
    image: "https://placehold.co/400x200.png",
    aiHint: "surface tension capillarity molecular forces meniscus"
  },
  {
    id: "damped-forced-oscillations-g11",
    name: "G11: Damped & Forced Oscillations Lab (Advanced)",
    grade: "11",
    description: "Investigate damped oscillations (amplitude vs. time with varying damping coefficients) and forced oscillations. Observe resonance by adjusting driving frequency. Plot amplitude vs. frequency response curve.",
    icon: Waves,
    categories: ["Waves & Oscillations"],
    image: "https://placehold.co/400x200.png",
    aiHint: "damped oscillations forced resonance frequency response"
  },
  {
    id: "coupled-oscillators-g11",
    name: "G11: Coupled Oscillators Simulator",
    grade: "11",
    description: "Simulate two coupled pendulums or spring-mass systems. Observe energy transfer and normal modes of oscillation.",
    icon: GitCommitHorizontal, // Represents connected systems
    categories: ["Waves & Oscillations"],
    image: "https://placehold.co/400x200.png",
    aiHint: "coupled oscillators resonance energy transfer"
  },
  {
    id: "shm-ucm-relation-g11",
    name: "G11: SHM & Uniform Circular Motion Relation",
    grade: "11",
    description: "Animation showing the projection of an object undergoing Uniform Circular Motion (UCM) onto a diameter, demonstrating that this projection executes Simple Harmonic Motion (SHM).",
    icon: Orbit, // Or RefreshCw
    categories: ["Waves & Oscillations", "Rotational & Circular Motion"],
    image: "https://placehold.co/400x200.png",
    aiHint: "shm ucm projection circular motion"
  },
  {
    id: "doppler-effect-animator-g11",
    name: "G11: Doppler Effect Animator (Sound & Light)",
    grade: "11",
    description: "Visualize wavefronts from a moving source or for a moving observer. Observe changes in perceived frequency/wavelength for sound and (conceptually) light. Interactive controls for source/observer speed.",
    icon: Speaker,
    categories: ["Sound", "Waves & Oscillations", "Modern Physics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "doppler effect sound light waves frequency"
  },
  {
    id: "intensity-of-sound-light-inverse-square-law-g11",
    name: "G11: Intensity & Inverse Square Law Visualizer",
    grade: "11",
    description: "Visualizing how the intensity of sound or light from a point source decreases with the square of the distance. Show spreading wavefronts.",
    icon: Radio, // Placeholder
    categories: ["Sound", "Light & Optics", "Waves & Oscillations"],
    image: "https://placehold.co/400x200.png",
    aiHint: "intensity inverse square law sound light"
  },
  {
    id: "youngs-double-slit-g11",
    name: "G11: Young's Double Slit Experiment Simulator",
    grade: "11",
    description: "Simulate interference patterns of light passing through double slits. Adjust slit separation, wavelength (color), and screen distance to observe changes in fringe spacing. Plot intensity graph.",
    icon: AlignCenter, // Or BarChartHorizontal
    categories: ["Light & Optics", "Waves & Oscillations"],
    image: "https://placehold.co/400x200.png",
    aiHint: "youngs double slit interference light fringe"
  },
  {
    id: "interference-of-waves-2d-g11", // Distinct from Young's, more general
    name: "G11: 2D Wave Interference Visualizer",
    grade: "11",
    description: "Visualizing the overlap of crests and troughs from two point sources (e.g., water waves) creating patterns of constructive and destructive interference zones.",
    icon: Waves,
    categories: ["Waves & Oscillations"],
    image: "https://placehold.co/400x200.png",
    aiHint: "wave interference 2d constructive destructive"
  },
  {
    id: "coherent-incoherent-sources-g11",
    name: "G11: Coherent & Incoherent Sources",
    grade: "11",
    description: "Conceptual animation comparing interference patterns (or lack thereof) produced by coherent vs. incoherent light sources.",
    icon: Lightbulb,
    categories: ["Light & Optics", "Waves & Oscillations"],
    image: "https://placehold.co/400x200.png",
    aiHint: "coherent incoherent light sources interference"
  },
  {
    id: "thin-film-interference-g11",
    name: "G11: Thin Film Interference Visualizer (Advanced)",
    grade: "11",
    description: "Conceptual animation showing light paths, phase changes upon reflection, and interference (constructive/destructive) causing colors in soap bubbles or oil slicks. Vary film thickness, refractive index, and angle of incidence.",
    icon: SquareRadical, // Represents layers/films
    categories: ["Light & Optics", "Waves & Oscillations"],
    image: "https://placehold.co/400x200.png",
    aiHint: "thin film interference optics colors soap bubble"
  },
  {
    id: "diffraction-grating-g11",
    name: "G11: Diffraction Grating Lab (Interactive)",
    grade: "11",
    description: "Simulate light passing through a diffraction grating, showing the formation of spectra and multiple order maxima. Adjust grating spacing (lines/mm), wavelength, and observe angles of diffraction. Plot intensity.",
    icon: FunctionSquare, // Or Grip
    categories: ["Light & Optics", "Waves & Oscillations"],
    image: "https://placehold.co/400x200.png",
    aiHint: "diffraction grating spectra light maxima"
  },
  {
    id: "single-slit-diffraction-g11",
    name: "G11: Single Slit Diffraction Simulator",
    grade: "11",
    description: "Visualize the diffraction pattern (central maximum, subsidiary maxima/minima) formed when light passes through a single slit. Adjust slit width and wavelength. Plot intensity profile.",
    icon: SeparatorVertical, // Placeholder
    categories: ["Light & Optics", "Waves & Oscillations"],
    image: "https://placehold.co/400x200.png",
    aiHint: "single slit diffraction intensity pattern"
  },
  {
    id: "polarization-of-light-g11",
    name: "G11: Polarization of Light Lab (Interactive)",
    grade: "11",
    description: "Demonstrate the transverse nature of light using interactive polarizers (linear polarizers). Rotate polarizers and observe changes in light intensity. Verify Malus's Law.",
    icon: Aperture, // Represents filtering/polarizing
    categories: ["Light & Optics", "Waves & Oscillations"],
    image: "https://placehold.co/400x200.png",
    aiHint: "polarization light malus law polarizers"
  },
  {
    id: "braggs-law-xray-diffraction-g11", // Can also be G12
    name: "G11/12: Bragg's Law X-Ray Diffraction",
    grade: "11/12",
    description: "Conceptual animation of X-rays scattering from crystal planes, illustrating constructive interference based on Bragg's Law (2d sinθ = nλ).",
    icon: Dna, // Represents crystal lattice structure
    categories: ["Light & Optics", "Modern Physics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "bragg law xray diffraction crystal"
  },
  {
    id: "thermal-conductivity-g11",
    name: "G11: Thermal Conductivity Lab (Comparative)",
    grade: "11",
    description: "Compare heat flow rate through rods of different materials but same dimensions. Adjust material properties (conductivity) and temperature gradients at ends. Visualize heat flow.",
    icon: Thermometer,
    categories: ["Heat & Thermodynamics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "thermal conductivity heat flow materials comparison"
  },
  {
    id: "specific-heat-gases-cp-cv-g11",
    name: "G11: Specific Heats of Gases (Cp & Cv) - Conceptual",
    grade: "11",
    description: "Conceptual explanation and animation of the difference between specific heat at constant pressure (Cp) and constant volume (Cv), their relation to internal energy, degrees of freedom, and Mayer's formula.",
    icon: SigmaSquare,
    categories: ["Heat & Thermodynamics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "specific heat gases cp cv mayers formula"
  },
  {
    id: "thermodynamic-processes-pv-g11", // Covered by G12 Ideal Gas Law sim, but can be a focused G11 version
    name: "G11: Thermodynamic Processes on P-V Diagrams",
    grade: "11",
    description: "Detailed tracing of Isothermal, Isobaric, Isochoric, and Adiabatic processes on P-V diagrams. Calculate work done (area under curve) for each process.",
    icon: LineChart,
    categories: ["Heat & Thermodynamics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "thermodynamic processes pv diagram work done"
  },
  {
    id: "work-done-by-gas-pv-diagram-g11", // Similar to above
    name: "G11: Work Done By/On a Gas (P-V Diagram)",
    grade: "11",
    description: "Visualizing piston movement in a cylinder. Input P, V changes. Plot on P-V diagram and calculate/visualize the area under the curve representing work done.",
    icon: AreaChart, // Placeholder
    categories: ["Heat & Thermodynamics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "work done gas pv diagram piston"
  },
  {
    id: "thermodynamic-cycles-otto-diesel-g11", // Can be G12
    name: "G11/12: Thermodynamic Cycles (Otto, Diesel)",
    grade: "11/12",
    description: "Conceptual animations of the Otto Cycle and Diesel Cycle, showing the P-V diagrams and key processes involved in these engine cycles.",
    icon: Cog, // Represents engines/cycles
    categories: ["Heat & Thermodynamics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "thermodynamic cycles otto diesel engine"
  },
  {
    id: "entropy-as-disorder-g11", // Can be G12
    name: "G11/12: Entropy as Disorder Visualizer",
    grade: "11/12",
    description: "Conceptual animation of increasing disorder in closed systems (e.g., gas expanding into a vacuum, mixing of two gases) to illustrate the concept of entropy and the Second Law of Thermodynamics.",
    icon: Shuffle, // Placeholder
    categories: ["Heat & Thermodynamics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "entropy disorder second law thermodynamics"
  },
  {
    id: "electric-field-lines-complex-g11",
    name: "G11: Electric Field Lines (Complex Distributions)",
    grade: "11",
    description: "Visualize electric field lines for more complex charge distributions beyond point charges (e.g., charged plates, spheres, rings, dipoles). Place test charges.",
    icon: Zap,
    categories: ["Electrostatics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "electric field lines charge distribution complex"
  },
  {
    id: "van-de-graaff-generator-principle-g11",
    name: "G11: Van de Graaff Generator Principle",
    grade: "11",
    description: "Animation showing how a Van de Graaff generator accumulates static charge on a large metal sphere via a moving belt.",
    icon: Zap,
    categories: ["Electrostatics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "van de graaff generator static electricity"
  },
  {
    id: "gauss-law-animator-g11",
    name: "G11: Gauss's Law Conceptual Animator",
    grade: "11",
    description: "Visualize electric flux through Gaussian surfaces for different charge enclosures. Understand surface integrals and how Gauss's Law simplifies field calculations for symmetric distributions.",
    icon: FunctionSquare, // Or BoxSelect
    categories: ["Electrostatics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "gauss law electric flux electrostatics symmetry"
  },
  {
    id: "electric-flux-calculation-conceptual-g11", // Related to Gauss's Law
    name: "G11: Electric Flux Calculation (Conceptual)",
    grade: "11",
    description: "Visualizing the number of electric field lines passing through a surface. Change surface area, orientation, and field strength to see flux change.",
    icon: AreaChart, // Placeholder
    categories: ["Electrostatics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "electric flux field lines surface area"
  },
  {
    id: "electric-potential-point-charges-g11",
    name: "G11: Electric Potential (Point Charges/Dipole) Mapper",
    grade: "11",
    description: "Map electric potential surfaces (equipotentials) and field lines for point charges and electric dipoles. Calculate potential at various points. Move test charge.",
    icon: BatteryCharging,
    categories: ["Electrostatics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "electric potential dipole equipotential mapping"
  },
  {
    id: "dielectric-in-capacitor-g11",
    name: "G11: Dielectric in a Capacitor",
    grade: "11",
    description: "Simulation showing the effect of inserting a dielectric material between capacitor plates on capacitance, electric field strength, and stored energy.",
    icon: Layers, // Placeholder
    categories: ["Electrostatics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "dielectric capacitor capacitance field"
  },
  {
    id: "capacitor-rc-circuit-g11", // Already exists
    name: "G11: Charging/Discharging of Capacitor (RC Circuit)",
    grade: "11",
    description: "RC circuit simulation. Adjust R, C, Vs. Observe charging/discharging curves for voltage and current. Visualize time constant.",
    icon: BatteryCharging,
    categories: ["Current Electricity"],
    image: "https://placehold.co/400x200.png",
    aiHint: "rc circuit capacitor charging discharging"
  },
  {
    id: "internal-resistance-terminal-voltage-g11", // G11 version of G10 one
    name: "G11: Internal Resistance & Terminal Voltage",
    grade: "11",
    description: "Interactive circuit to measure terminal voltage of a battery with varying external load. Plot V vs. I to determine internal resistance and EMF.",
    icon: BatteryWarning,
    categories: ["Current Electricity"],
    image: "https://placehold.co/400x200.png",
    aiHint: "internal resistance terminal voltage emf graph"
  },
  {
    id: "wheatstone-potentiometer-g11",
    name: "G11: Wheatstone Bridge & Potentiometer Lab",
    grade: "11",
    description: "Interactive simulations for balancing a Wheatstone bridge to find an unknown resistance and using a potentiometer to measure an unknown EMF or compare EMFs. Show null deflection.",
    icon: Scale,
    categories: ["Current Electricity", "Lab Skills & Instruments"],
    image: "https://placehold.co/400x200.png",
    aiHint: "wheatstone bridge potentiometer circuits null deflection"
  },
  {
    id: "potentiometer-working-principle-g11", // More focused
    name: "G11: Potentiometer Working Principle",
    grade: "11",
    description: "Detailed animation and simulation of a potentiometer circuit, showing how balancing length is used to measure or compare EMFs without drawing current.",
    icon: SlidersHorizontal,
    categories: ["Current Electricity", "Lab Skills & Instruments"],
    image: "https://placehold.co/400x200.png",
    aiHint: "potentiometer emf measurement balancing length"
  },
  {
    id: "magnetic-field-loops-solenoids-g11",
    name: "G11: Magnetic Fields (Loops & Solenoids - Detailed)",
    grade: "11",
    description: "Detailed 3D visualization (or clear 2D cross-sections) of magnetic fields produced by current loops and solenoids. Apply right-hand rules. Vary current, number of turns.",
    icon: Magnet,
    categories: ["Magnetism & Electromagnetism"],
    image: "https://placehold.co/400x200.png",
    aiHint: "magnetic field current loop solenoid 3d"
  },
  {
    id: "magnetic-field-of-earth-g11", // Can be G9 too
    name: "G9/11: Earth's Magnetic Field Visualizer",
    grade: "9/11",
    description: "Conceptual diagram of Earth's magnetic field, showing magnetic poles, geographic poles, angle of dip/declination. Explain compass needle alignment.",
    icon: Globe,
    categories: ["Magnetism & Electromagnetism"],
    image: "https://placehold.co/400x200.png",
    aiHint: "earth magnetic field compass dip declination"
  },
  {
    id: "force-on-current-loop-g11",
    name: "G11: Force/Torque on Current Loop in B-Field (Motor)",
    grade: "11",
    description: "Animate a current-carrying rectangular loop rotating in a uniform magnetic field, visualizing forces on each segment and the resulting torque. Relate to DC motor principle.",
    icon: RefreshCw,
    categories: ["Magnetism & Electromagnetism"],
    image: "https://placehold.co/400x200.png",
    aiHint: "torque current loop magnetic field motor effect"
  },
  {
    id: "galvanometer-ammeter-voltmeter-g11",
    name: "G11: Galvanometer, Ammeter, Voltmeter (Conversion)",
    grade: "11",
    description: "Explain the principle of operation of a moving coil galvanometer and its conversion into an ammeter (using shunt) and voltmeter (using series high resistance). Interactive circuit adjustments.",
    icon: Activity, // Or a specific meter icon
    categories: ["Magnetism & Electromagnetism", "Current Electricity", "Lab Skills & Instruments"],
    image: "https://placehold.co/400x200.png",
    aiHint: "galvanometer ammeter voltmeter conversion shunt series"
  },
  {
    id: "em-induction-faraday-lenz-g11", // Keep G11 focus
    name: "G11: EM Induction (Faraday's/Lenz's Law)",
    grade: "11",
    description: "Simulate changing magnetic flux through a coil (moving magnet, changing current in another coil). Visualize induced EMF and current direction (Lenz's Law). Factors affecting induced EMF.",
    icon: Magnet,
    categories: ["Magnetism & Electromagnetism"],
    image: "https://placehold.co/400x200.png",
    aiHint: "electromagnetic induction faraday lenz law flux"
  },
  {
    id: "self-mutual-inductance-g11",
    name: "G11: Self & Mutual Inductance Animator",
    grade: "11",
    description: "Conceptual animations explaining self-inductance (back EMF in a coil due to changing current) and mutual inductance (EMF induced in one coil due to changing current in a nearby coil).",
    icon: Link2,
    categories: ["Magnetism & Electromagnetism"],
    image: "https://placehold.co/400x200.png",
    aiHint: "self inductance mutual inductance emf coil"
  },
  {
    id: "ac-generator-dc-motor-g11", // G11 Focus
    name: "G11: AC Generator & DC Motor Principles (Detailed)",
    grade: "11",
    description: "Detailed animations of AC generators (rotating coil in B-field, slip rings, sinusoidal EMF) and DC motors (split-ring commutator, torque production, back EMF).",
    icon: Cog,
    categories: ["Magnetism & Electromagnetism"],
    image: "https://placehold.co/400x200.png",
    aiHint: "ac generator dc motor electromagnetism slip rings commutator"
  },
  {
    id: "transformer-efficiency-g11",
    name: "G11: Transformer Principles & Efficiency Lab",
    grade: "11",
    description: "Simulate step-up/step-down transformers. Explore turns ratio, voltage/current relationships. Discuss power losses (eddy currents, hysteresis, flux leakage) and calculate efficiency.",
    icon: Network,
    categories: ["Magnetism & Electromagnetism"],
    image: "https://placehold.co/400x200.png",
    aiHint: "transformer step up step down efficiency power loss"
  },
  {
    id: "magnetic-hysteresis-loop-g11", // Also G12
    name: "G11/12: Magnetic Hysteresis Loop (B-H Curve)",
    grade: "11/12",
    description: "Interactive B-H curve for ferromagnetic materials. Show concepts of retentivity, coercivity, and energy loss per cycle (area of loop).",
    icon: LineChart,
    categories: ["Magnetism & Electromagnetism", "Properties of Matter & Fluids"],
    image: "https://placehold.co/400x200.png",
    aiHint: "magnetic hysteresis bh curve ferromagnetic"
  },
  {
    id: "eddy-currents-demonstration-g11", // Also G12
    name: "G11/12: Eddy Currents Demonstrator",
    grade: "11/12",
    description: "Conceptual animation showing the formation of eddy currents in a conductor moving through a magnetic field or exposed to a changing magnetic field, and their damping effect or heating effect. Applications.",
    icon: Recycle, // Placeholder
    categories: ["Magnetism & Electromagnetism"],
    image: "https://placehold.co/400x200.png",
    aiHint: "eddy currents damping heating magnetic field"
  },
  {
    id: "cro-principle-g11",
    name: "G11: Cathode Ray Oscilloscope (CRO) Working",
    grade: "11",
    description: "Visualize the electron gun, deflection plates (X and Y), time base generator, and how time-varying voltage signals create waveforms on a fluorescent screen. Basic controls for V/div, time/div.",
    icon: Activity, // Represents oscilloscope display
    categories: ["Electronics", "Lab Skills & Instruments"],
    image: "https://placehold.co/400x200.png",
    aiHint: "cro oscilloscope waveform electron gun deflection"
  },
  {
    id: "digital-multimeter-working-g11",
    name: "G11: Digital Multimeter (DMM) Internals",
    grade: "11",
    description: "Conceptual animation of the internal logic of a DMM for measuring voltage, current, and resistance, including A/D conversion.",
    icon: Gauge, // Placeholder
    categories: ["Electronics", "Current Electricity", "Lab Skills & Instruments"],
    image: "https://placehold.co/400x200.png",
    aiHint: "dmm digital multimeter measurement adc"
  },
  {
    id: "modulation-demodulation-g11",
    name: "G11: Modulation & Demodulation (AM/FM) Visualizer",
    grade: "11",
    description: "Conceptual animations of Amplitude Modulation (AM) and Frequency Modulation (FM), showing carrier waves, modulating signals, and how information is encoded and (conceptually) decoded.",
    icon: RadioTower,
    categories: ["Communication Systems", "Waves & Oscillations"],
    image: "https://placehold.co/400x200.png",
    aiHint: "modulation am fm communication carrier wave"
  },
  {
    id: "analog-vs-digital-signals-g11",
    name: "G11: Analog vs. Digital Signals Comparison",
    grade: "11",
    description: "Visual comparison of analog (continuous) and digital (discrete) waveforms. Highlight characteristics like noise immunity for digital signals.",
    icon: LineChart, // With step-like features for digital
    categories: ["Communication Systems", "Electronics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "analog digital signals waveform noise"
  },
  {
    id: "sampling-quantization-encoding-g11",
    name: "G11: Analog-to-Digital Conversion (ADC) Steps",
    grade: "11",
    description: "Animation of the A/D conversion process: sampling an analog signal, quantizing the samples, and encoding them into binary.",
    icon: BinaryIcon,
    categories: ["Communication Systems", "Electronics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "adc analog digital conversion sampling quantization"
  },
  {
    id: "optical-fiber-communication-g11",
    name: "G11: Optical Fiber Communication Principles",
    grade: "11",
    description: "Animated light path demonstrating Total Internal Reflection (TIR) in optical fibers. Explain principles of light propagation, advantages (bandwidth, low loss), and basic components (transmitter, fiber, receiver).",
    icon: Cable,
    categories: ["Communication Systems", "Light & Optics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "optical fiber tir communication light bandwidth"
  },
  {
    id: "transmission-media-comparison-g11",
    name: "G11: Transmission Media Comparison",
    grade: "11",
    description: "Interactive comparison of different communication transmission media: Wire-pairs, Coaxial cables, Radio/Microwave links, Optical Fibers, Satellites. Highlight advantages, disadvantages, bandwidth, typical uses.",
    icon: Route,
    categories: ["Communication Systems"],
    image: "https://placehold.co/400x200.png",
    aiHint: "transmission media coaxial fiber wireless satellite"
  },
  {
    id: "satellite-communication-g11",
    name: "G11: Satellite Communication Systems (Principles)",
    grade: "11",
    description: "Conceptual diagram of satellite communication, including geostationary orbits, uplink/downlink frequencies, transponders, signal transmission paths, and reception.",
    icon: Satellite,
    categories: ["Communication Systems", "Gravitation & Orbital Mechanics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "satellite communication geostationary orbit uplink downlink"
  },

  // --- Grade 12 Simulations (Many are advanced versions of earlier concepts) ---
  {
    id: "ideal-gas-law-g12", // Already exists as placeholder
    name: "G12: Ideal Gas Law & Thermo Processes (Adv)",
    grade: "12",
    description: "Advanced: Microscopic view (3D/advanced 2D), P-V-T controls, real-time PVT display, interactive PV diagram tracing Isothermal, Isobaric, Isochoric, Adiabatic. Work Done, ΔU, Q calculations. Maxwell-Boltzmann distribution graph.",
    icon: Thermometer,
    categories: ["Heat & Thermodynamics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "ideal gas law thermodynamics pv diagram advanced"
  },
  {
    id: "molecular-speeds-distribution-g12",
    name: "G12: Molecular Speeds Distribution (Maxwell-Boltzmann)",
    grade: "12",
    description: "Interactive Maxwell-Boltzmann distribution curve for molecular speeds in a gas. Adjust temperature and see how the distribution shifts (most probable speed, average speed, rms speed).",
    icon: BarChart, // Placeholder
    categories: ["Heat & Thermodynamics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "maxwell boltzmann distribution molecular speeds temperature"
  },
  {
    id: "carnot-engine-g12", // Already exists as placeholder
    name: "G12: Carnot Engine Cycle Animator (Detailed)",
    grade: "12",
    description: "Detailed step-by-step animation of Carnot cycle with synchronized P-V diagram. Visualize piston, heat transfer (Q_H, Q_L), work done. Calculate efficiency from reservoir temperatures.",
    icon: Replace, // Or Cog
    categories: ["Heat & Thermodynamics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "carnot engine thermodynamics cycle efficiency pv diagram"
  },
  {
    id: "refrigerators-heat-pumps-g12",
    name: "G12: Refrigerators & Heat Pumps Cycle",
    grade: "12",
    description: "Conceptual animation of the working cycle of refrigerators and heat pumps, showing energy flow (heat absorbed from cold, work input, heat rejected to hot) and calculation of Coefficient of Performance (COP).",
    icon: ThermometerSnowflake, // Placeholder
    categories: ["Heat & Thermodynamics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "refrigerator heat pump cop thermodynamics cycle"
  },
  {
    id: "entropy-change-calculation-g12", // Conceptual
    name: "G12: Entropy Change Calculation (Conceptual)",
    grade: "12",
    description: "Conceptual examples and calculator for entropy change in simple reversible (e.g., isothermal expansion) and irreversible processes (e.g., free expansion, heat transfer between bodies at different T).",
    icon: SigmaSquare,
    categories: ["Heat & Thermodynamics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "entropy change thermodynamics reversible irreversible"
  },
  {
    id: "electric-field-potential-g12", // Already exists, ensure advanced focus
    name: "G12: Electric Field & Potential Mapping (Adv)",
    grade: "12",
    description: "Map electric fields and equipotential lines for complex charge distributions. Drag test charges, observe force, potential, ΔPE. Presets: dipole, parallel plates, charged sphere. Inspired by PhET.",
    icon: Zap,
    categories: ["Electrostatics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "electric field potential mapping advanced dipole"
  },
  {
    id: "electric-dipole-in-electric-field-g12",
    name: "G12: Electric Dipole in an Electric Field",
    grade: "12",
    description: "Visualize an electric dipole in a uniform electric field. Show torque experienced, potential energy. Animate alignment with field.",
    icon: SigmaSquare, // Placeholder
    categories: ["Electrostatics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "electric dipole torque potential energy field"
  },
  {
    id: "dielectric-strength-breakdown-g12",
    name: "G12: Dielectric Strength & Breakdown Visualizer",
    grade: "12",
    description: "Conceptual visualization of electric breakdown in insulators (dielectrics) when the electric field exceeds the dielectric strength. Show spark formation.",
    icon: Zap, // Or AlertTriangle
    categories: ["Electrostatics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "dielectric strength breakdown insulator spark"
  },
  {
    id: "capacitor-networks-g12", // Already exists
    name: "G12: Capacitor Networks Analysis (Advanced)",
    grade: "12",
    description: "Analyze complex series/parallel capacitor combinations, calculating equivalent capacitance, charge, and voltage distribution. Problem-solving focus.",
    icon: Network,
    categories: ["Electrostatics", "Current Electricity"],
    image: "https://placehold.co/400x200.png",
    aiHint: "capacitor networks series parallel advanced"
  },
  {
    id: "capacitor-energy-g12", // Already exists
    name: "G12: Energy Stored in a Capacitor (Detailed)",
    grade: "12",
    description: "Calculate and visualize energy stored (U = 1/2 CV^2). Interactive C, V. Graphs of U vs. C, U vs. V. Animation of energy storage.",
    icon: BatteryCharging,
    categories: ["Electrostatics", "Current Electricity"],
    image: "https://placehold.co/400x200.png",
    aiHint: "capacitor energy stored electrostatics graph"
  },
  {
    id: "growth-decay-current-lr-circuit-g12",
    name: "G12: Current in LR Circuit (Growth & Decay)",
    grade: "12",
    description: "Simulate current growth in an LR series circuit when connected to a DC source, and current decay when the source is removed. Plot I vs. t graphs. Show time constant (L/R).",
    icon: LineChart,
    categories: ["Current Electricity", "Magnetism & Electromagnetism"],
    image: "https://placehold.co/400x200.png",
    aiHint: "lr circuit current growth decay time constant"
  },
  {
    id: "ac-circuit-analyzer-g12", // Already exists, ensure advanced focus
    name: "G12: AC Circuit Analyzer (RLC - Advanced)",
    grade: "12",
    description: "Build RLC series/parallel circuits. Real-time Oscilloscope (V_R, V_L, V_C, I, V_S), Phasor Diagrams, Impedance/Reactance calculation, Resonance. Measure peak/RMS, phase differences. Inspired by PhET.",
    icon: Activity,
    categories: ["Current Electricity", "Magnetism & Electromagnetism"],
    image: "https://placehold.co/400x200.png",
    aiHint: "ac circuit rlc oscilloscope phasor resonance advanced"
  },
  {
    id: "ac-series-rlc-circuit-impedance-triangle-g12",
    name: "G12: AC Series RLC Impedance Triangle",
    grade: "12",
    description: "Dynamically draw the impedance triangle (R, X_L, X_C, Z) and voltage triangle for a series RLC circuit. Show phase angle. Adjust R, L, C, frequency.",
    icon: Triangle, // Placeholder
    categories: ["Current Electricity", "Magnetism & Electromagnetism"],
    image: "https://placehold.co/400x200.png",
    aiHint: "rlc circuit impedance triangle phasor phase angle"
  },
  {
    id: "ac-power-g12", // Already exists
    name: "G12: Power in AC Circuits (Detailed)",
    grade: "12",
    description: "Explore Real Power (P), Reactive Power (Q), Apparent Power (S) in RLC circuits. Calculate and visualize the power triangle and Power Factor (cos φ). Vary components and frequency.",
    icon: TrendingUp,
    categories: ["Current Electricity", "Magnetism & Electromagnetism"],
    image: "https://placehold.co/400x200.png",
    aiHint: "ac power factor triangle rlc circuits"
  },
  {
    id: "motional-emf-g12",
    name: "G12: Motional EMF Visualizer",
    grade: "12",
    description: "Simulate a conductor (rod) moving with velocity 'v' in a uniform magnetic field 'B'. Show induced EMF (Blvsinθ) and direction of induced current (if part of a closed circuit).",
    icon: Move,
    categories: ["Magnetism & Electromagnetism"],
    image: "https://placehold.co/400x200.png",
    aiHint: "motional emf conductor magnetic field induced current"
  },
  {
    id: "magnetic-force-parallel-conductors-g12",
    name: "G12: Force Between Parallel Conductors",
    grade: "12",
    description: "Visualize two parallel current-carrying conductors. Show magnetic fields produced by each and the resulting force (attraction/repulsion) between them based on current directions.",
    icon: ArrowRightLeft, // Placeholder
    categories: ["Magnetism & Electromagnetism"],
    image: "https://placehold.co/400x200.png",
    aiHint: "magnetic force parallel conductors current attraction repulsion"
  },
  {
    id: "magnetic-flux-density-visualizer-g12",
    name: "G12: Magnetic Flux Density (B) Visualizer",
    grade: "12",
    description: "Interactive visualization of magnetic flux density (B) for various current configurations (long straight wire, circular loop, solenoid, toroid). Show field lines and vector direction.",
    icon: Magnet,
    categories: ["Magnetism & Electromagnetism"],
    image: "https://placehold.co/400x200.png",
    aiHint: "magnetic flux density field lines current wire loop"
  },
  {
    id: "mass-spectrometer-g12", // Already exists
    name: "G12: Mass Spectrometer Simulator (Detailed)",
    grade: "12",
    description: "Simulate ion path through ion source, velocity selector (E, B fields), and deflection chamber (B field). Adjust m, q, v, E, B. Calculate q/m. Identify isotopes. Detector graph.",
    icon: Scale,
    categories: ["Magnetism & Electromagnetism", "Modern Physics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "mass spectrometer qm ratio isotopes deflection"
  },
  {
    id: "hall-effect-g12", // Already exists
    name: "G12: Hall Effect Simulator (Detailed)",
    grade: "12",
    description: "Visualize force on charge carriers (electrons/holes) in a conductor in B-field, leading to Hall voltage. Controls for current, B-field, material type (n/p). Calculate Hall coefficient.",
    icon: Magnet,
    categories: ["Magnetism & Electromagnetism", "Electronics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "hall effect voltage semiconductor n-type p-type"
  },
  {
    id: "photoelectric-effect-g12", // Already exists, ensure enhanced focus
    name: "G12: Photoelectric Effect (Enhanced)",
    grade: "12",
    description: "Adjust light Frequency (color) & Intensity. Select Metal (Work Function Φ). Observe emitted electrons, K.E.max vs. Frequency graph, Current vs. Intensity. Stopping Voltage. Determine Planck's constant.",
    icon: Sun,
    categories: ["Modern Physics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "photoelectric effect quantum light planck work function"
  },
  {
    id: "rutherfords-gold-foil-experiment-g12",
    name: "G12: Rutherford's Gold Foil Experiment Animator",
    grade: "12",
    description: "Animation of alpha particles scattering from a thin gold foil, demonstrating the discovery of the nucleus. Show expected vs. observed scattering patterns.",
    icon: Atom,
    categories: ["Modern Physics", "Nuclear Physics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "rutherford gold foil experiment alpha scattering nucleus"
  },
  {
    id: "compton-effect-g12", // Already exists
    name: "G12: Compton Effect Animator (Conceptual)",
    grade: "12",
    description: "Conceptual animation of photon-electron scattering, showing wavelength change of photon and recoil of electron, demonstrating energy/momentum transfer.",
    icon: Sparkles,
    categories: ["Modern Physics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "compton effect scattering photon electron wavelength"
  },
  {
    id: "wave-particle-duality-g12", // Already exists
    name: "G12: Wave-Particle Duality Visualizer (Electron Diffraction)",
    grade: "12",
    description: "Conceptual animation of electron diffraction (e.g., through crystal lattice/double slit), demonstrating wave nature. Compare with light wave diffraction. De Broglie wavelength.",
    icon: Waves,
    categories: ["Modern Physics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "wave particle duality electron diffraction de broglie"
  },
  {
    id: "de-broglie-wavelength-matter-waves-g12",
    name: "G12: De Broglie Wavelength Calculator",
    grade: "12",
    description: "Interactive calculator for De Broglie wavelength (λ = h/p). Input mass and velocity of particles (electron, proton, macroscopic object) and see their matter wavelength. Conceptual illustration.",
    icon: SigmaSquare,
    categories: ["Modern Physics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "de broglie wavelength matter waves momentum"
  },
  {
    id: "heisenbergs-uncertainty-principle-g12",
    name: "G12: Heisenberg's Uncertainty Principle (Conceptual)",
    grade: "12",
    description: "Conceptual illustration of the position-momentum uncertainty (ΔxΔp ≥ ħ/2) and energy-time uncertainty (ΔEΔt ≥ ħ/2). Emphasize limitations of simultaneous precise measurement.",
    icon: HelpCircle, // Or an icon for uncertainty
    categories: ["Modern Physics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "heisenberg uncertainty principle quantum position momentum"
  },
  {
    id: "blackbody-radiation-g12", // Already exists
    name: "G12: Blackbody Radiation Curve Lab (Interactive)",
    grade: "12",
    description: "Interactive graph of blackbody radiation spectrum (Intensity vs. Wavelength). Adjust T. Observe Wien's Law, Stefan-Boltzmann. Compare with Rayleigh-Jeans (UV catastrophe).",
    icon: LineChart,
    categories: ["Modern Physics", "Heat & Thermodynamics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "blackbody radiation planck curve temperature wien"
  },
  {
    id: "atomic-spectra-bohr-g12", // Already exists
    name: "G12: Atomic Spectra & Bohr Model (Interactive)",
    grade: "12",
    description: "Interactive energy level diagram (Hydrogen). Simulate electron transitions (absorption/emission of photons). Display emission/absorption spectra (Balmer, Lyman, Paschen).",
    icon: Atom,
    categories: ["Modern Physics", "Atomic Physics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "atomic spectra bohr model emission absorption hydrogen"
  },
  {
    id: "origin-of-xrays-g12",
    name: "G12: Origin of X-Rays Visualizer",
    grade: "12",
    description: "Animation showing electron bombardment of a metal target, leading to Bremsstrahlung (continuous spectrum) and characteristic X-rays (electron transitions in target atoms).",
    icon: Activity,
    categories: ["Modern Physics", "Atomic Physics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "xrays bremsstrahlung characteristic electron bombardment"
  },
  {
    id: "xray-production-spectra-g12", // Already exists
    name: "G12: X-Ray Production & Spectra (Detailed)",
    grade: "12",
    description: "Conceptual animation of X-ray production, continuous & characteristic X-rays. Bragg's Law for diffraction. Controls for voltage, target material (conceptual).",
    icon: Activity,
    categories: ["Modern Physics", "Atomic Physics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "xray production spectra bragg law diffraction"
  },
  {
    id: "spectrometer-spectroscope-principle-g12",
    name: "G12: Spectrometer/Spectroscope Working Principle",
    grade: "12",
    description: "Animation showing how a spectrometer (e.g., prism or grating based) disperses light into its constituent wavelengths to form a spectrum, which can then be analyzed.",
    icon: Pipette, // Or SearchCode
    categories: ["Light & Optics", "Modern Physics", "Lab Skills & Instruments"],
    image: "https://placehold.co/400x200.png",
    aiHint: "spectrometer spectroscope prism grating spectrum"
  },
  {
    id: "laser-principle-g12", // Already exists
    name: "G12: Laser Principle Animator (Detailed)",
    grade: "12",
    description: "Animated explanation of population inversion, stimulated emission, spontaneous emission, and coherent light production in a laser cavity (resonator). Pumping mechanisms.",
    icon: Zap,
    categories: ["Modern Physics", "Light & Optics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "laser principle stimulated emission population inversion coherent"
  },
  {
    id: "radioactive-decay-g12", // Already exists
    name: "G12: Radioactive Decay Chains Visualizer (Adv)",
    grade: "12",
    description: "Visualize Alpha, Beta (β-, β+), Gamma decay. Trace decay series. Simulate half-life with large N, plot N vs. t, Activity vs. t. Geiger counter concept.",
    icon: Radiation, // Ensure this icon is imported
    categories: ["Nuclear Physics", "Modern Physics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "radioactive decay alpha beta gamma half life geiger"
  },
  {
    id: "nuclear-forces-vs-electrostatic-forces-g12",
    name: "G12: Nuclear vs. Electrostatic Forces in Nucleus",
    grade: "12",
    description: "Conceptual comparison of the strong nuclear force (attractive, short-range) and electrostatic force (repulsive between protons, long-range) within an atomic nucleus. Illustrate stability.",
    icon: Atom,
    categories: ["Nuclear Physics", "Modern Physics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "nuclear force strong electrostatic nucleus stability"
  },
  {
    id: "radioactive-dating-carbon14-g12",
    name: "G12: Radioactive Dating (Carbon-14)",
    grade: "12",
    description: "Explanation of the principle of Carbon-14 dating, focusing on its formation, incorporation into living organisms, decay after death, and half-life application for determining age.",
    icon: CalendarClock, // Placeholder
    categories: ["Nuclear Physics", "Modern Physics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "carbon dating radioactive half life archaeology"
  },
  {
    id: "nuclear-fission-fusion-g12", // Already exists
    name: "G12: Nuclear Fission & Fusion Animator (Adv)",
    grade: "12",
    description: "Detailed animations of chain reactions in fission (U-235) and conditions for D-T fusion. Quantify energy release (E=mc²). Conceptual nuclear reactor diagram. Fusion in stars.",
    icon: Atom, // Or Sprout for fusion
    categories: ["Nuclear Physics", "Modern Physics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "nuclear fission fusion chain reaction energy reactor stars"
  },
  {
    id: "nuclear-fusion-in-stars-g12", // More specific
    name: "G12: Nuclear Fusion in Stars (Conceptual)",
    grade: "12",
    description: "Conceptual animation of the proton-proton chain or CNO cycle, showing how stars like the Sun generate energy through nuclear fusion.",
    icon: Sun,
    categories: ["Nuclear Physics", "Modern Physics", "Gravitation & Orbital Mechanics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "nuclear fusion stars sun proton-proton cno cycle"
  },
  {
    id: "binding-energy-mass-defect-g12", // Already exists
    name: "G12: Binding Energy & Mass Defect Curve",
    grade: "12",
    description: "Explore binding energy per nucleon curve. Calculate mass defect & binding energy. Understand nuclear stability, fission/fusion regions.",
    icon: SigmaSquare,
    categories: ["Nuclear Physics", "Modern Physics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "binding energy mass defect nuclear stability curve"
  },
  {
    id: "geiger-muller-counter-working-g12",
    name: "G12: Geiger-Müller Counter Animator",
    grade: "12",
    description: "Animation showing how a G-M tube detects ionizing radiation: ionization of gas, avalanche effect, and pulse generation.",
    icon: AlertTriangle, // Placeholder
    categories: ["Nuclear Physics", "Modern Physics", "Lab Skills & Instruments"],
    image: "https://placehold.co/400x200.png",
    aiHint: "geiger muller counter radiation detection ionization"
  },
  {
    id: "cloud-bubble-chamber-g12",
    name: "G12: Cloud & Bubble Chamber Track Visualizer",
    grade: "12",
    description: "Conceptual visualization of particle tracks (alpha, beta, gamma, cosmic rays) in cloud chambers and bubble chambers. Explain how track properties reveal particle characteristics.",
    icon: Microscope, // Placeholder
    categories: ["Nuclear Physics", "Particle Physics", "Modern Physics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "cloud chamber bubble chamber particle tracks"
  },
  {
    id: "radioisotope-applications-g12", // Already exists
    name: "G12: Applications of Radioisotopes (Detailed)",
    grade: "12",
    description: "Conceptual explanations & diagrams of radioisotope uses in medical imaging (tracers, PET), carbon dating, industry (gauging, sterilization), agriculture.",
    icon: TestTubeDiagonal,
    categories: ["Nuclear Physics", "Modern Physics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "radioisotopes applications medical dating industry agriculture"
  },
  {
    id: "standard-model-explorer-g12", // Already exists
    name: "G12: Standard Model Particle Explorer (Interactive)",
    grade: "12",
    description: "Interactive diagram: quarks, leptons, force carrier bosons (photon, gluon, W/Z, Higgs). Explore properties (charge, spin, mass) & fundamental forces. Build simple hadrons.",
    icon: BrainCircuit,
    categories: ["Particle Physics", "Modern Physics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "standard model quarks leptons bosons higgs forces"
  },
  {
    id: "quark-confinement-g12",
    name: "G12: Quark Confinement Visualizer",
    grade: "12",
    description: "Conceptual illustration explaining why quarks are never observed in isolation (color confinement, string model). Show hadron formation (mesons, baryons).",
    icon: Link,
    categories: ["Particle Physics", "Modern Physics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "quark confinement color force hadrons"
  },
  {
    id: "particle-interactions-feynman-diagrams-g12",
    name: "G12: Feynman Diagrams (Simplified)",
    grade: "12",
    description: "Conceptual representation of fundamental particle interactions (e.g., electron-electron scattering via photon exchange) using simplified Feynman diagrams.",
    icon: GitFork, // Represents interactions/paths
    categories: ["Particle Physics", "Modern Physics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "feynman diagrams particle interactions quantum"
  },
  {
    id: "particle-accelerators-g12", // Already exists
    name: "G12: Particle Accelerators (Cyclotron/Synchrotron)",
    grade: "12",
    description: "Conceptual animations explaining how cyclotrons and synchrotrons use electric and magnetic fields to accelerate particles to high energies. Applications in research.",
    icon: Orbit,
    categories: ["Particle Physics", "Modern Physics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "particle accelerator cyclotron synchrotron high energy"
  },
  // New Generic Placeholders from this request
  {
    id: "black-hole-spacetime-visualizer",
    name: "Black Hole / Spacetime Curvature Visualizer",
    grade: "12 / Advanced",
    description: "Visualizing how massive objects (stars, black holes) warp spacetime. Place masses, observe the 'gravitational well' and trajectories of nearby objects (light rays, other planets). Conceptual but engaging.",
    icon: Orbit, // Or Atom for black hole singularity
    categories: ["Gravitation & Orbital Mechanics", "Modern Physics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "black hole spacetime gravity relativity"
  },
  {
    id: "rocket-launch-rendezvous-simulator",
    name: "Rocket Launch & Orbital Rendezvous Simulator",
    grade: "11 / 12",
    description: "Launch a rocket into orbit, then attempt to dock with a space station or another spacecraft. Control thrust, orbital maneuvers, and understand concepts like orbital velocity, escape velocity, and relative motion in space.",
    icon: Rocket,
    categories: ["Dynamics & Forces", "Kinematics", "Gravitation & Orbital Mechanics"],
    image: "https://placehold.co/400x200.png",
    aiHint: "rocket launch orbit rendezvous space"
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
