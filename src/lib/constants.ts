
/**
 * @fileOverview Defines constant values used throughout the application.
 * This includes navigation structures, lists of topics for simulations and quizzes,
 * application metadata, searchable keywords for settings, and curriculum board information.
 */
import { FileEditIcon } from 'lucide-react';
import {
  LayoutDashboard, Orbit, BookOpen, ListChecks, Users, MessageSquare, Settings as SettingsIcon, 
  Lightbulb, Brain, Map, Ruler, Thermometer, Scale, ClockIcon, Waves, Heater, Sigma,
  BatteryCharging, MoveHorizontal, TrendingUp, Atom, FileEdit, CalendarDays, ClipboardList, BookCopy,
  NotebookText, UserCircle, FileArchive, TestTubeDiagonal, Beaker, Edit, Link2, FileText as FileTextIcon,
  SearchIcon, Timer, Weight, Replace, HelpCircle, MoveVertical, Speaker, Projector, Zap,
  Network, Binary, Pipette, Magnet, LineChart, Move, Anchor, RefreshCw, GitCommitHorizontal, Sun,
  Info, UsersRound, BookMarked, Telescope, GraduationCap, FlaskConical, Archive, PersonStanding, UsersRoundIcon, Globe, AlertTriangle,
  Bug, Droplets, GripVertical, Activity, Radiation, SigmaSquare, Route, Combine, TestTube,
  RadioTower, Wind, Cable, Cog, Aperture, BrainCircuit, AlignCenter, Album, BookKey,
  FunctionSquare, Sparkles, Rocket, DraftingCompass, Microscope, SlidersHorizontal,
  Recycle, Milestone, SquareAsterisk, Dna, Bot, GitFork, BinaryIcon, AreaChart, ArrowDown,
  Box, Car, CircleDot, Hand, Heater as HeaterIcon, Leaf, Layers, Music2, MinusSquare,
  Plug, Radio, Satellite, Ship, BatteryWarning,
  Square, SquareRadical, StretchHorizontal, ThermometerSnowflake, Triangle,
  Users as UsersIcon,
  LogIn, LogOut,
  UserCog,
  KeyRound, Eye, EyeOff, WifiOff, XCircle, CalendarClock, Shuffle,
  UserPlus, BarChart3, Percent, CheckCircle, History, Smartphone, Laptop, Signal,
  DownloadCloud, Notebook as NotebookIcon, Share2,
  LocateIcon, ZoomInIcon, ZoomOutIcon,
} from 'lucide-react';

import type { SimulationTopic as SimTopicType, NavItem } from '@/lib/types';


/**
 * Defines the structure for a simulation topic.
 * @property {string} id - Unique identifier, often used in the route.
 * @property {string} name - Display name of the simulation.
 * @property {string} grade - Target grade level(s).
 * @property {string} description - Brief description of what the simulation covers.
 * @property {React.ElementType} icon - Icon to represent the simulation.
 * @property {string[]} [categories] - Array of category names the simulation belongs to.
 * @property {string} [image] - Optional URL for a thumbnail image.
 * @property {string} [aiHint] - Optional hint for AI image generation tools if placeholders are used.
 */
export type SimulationTopic = SimTopicType;


/**
 * Main navigation items for the application sidebar.
 * Each item defines its route, label, icon, and optionally sub-items for a nested menu.
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
  { href: '/philosophical-physics', label: 'Philosophical Physics', icon: Brain },
  { href: '/research-centers', label: 'Physics Research', icon: Telescope },
  { href: '/universities', label: 'University Programs', icon: GraduationCap },
  { href: '/lab-equipment', label: 'Lab Equipment', icon: FlaskConical },
  { href: '/about-us', label: 'About Us', icon: Info },
  {
    href: '/teacher-dashboard',
    label: 'Teacher Panel',
    icon: UserCog,
    subItems: [
      { href: '/teacher-dashboard/accounts', label: 'Student Accounts', icon: UsersRoundIcon },
      { href: '/teacher-dashboard/analytics', label: 'Analytics', icon: BarChart3 },
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
 * Defines categories for simulations to aid in filtering and organization.
 */
export const SIMULATION_CATEGORIES: string[] = [
  "Measurements & Units",
  "Kinematics",
  "Dynamics & Forces",
  "Vectors",
  "Rotational & Circular Motion",
  "Work, Energy & Power",
  "Simple Machines",
  "Gravitation & Orbital Mechanics",
  "Properties of Matter & Fluids",
  "Elasticity",
  "Heat & Thermodynamics",
  "Waves & Oscillations",
  "Simple Harmonic Motion",
  "Sound",
  "Light & Optics",
  "Electrostatics",
  "Current Electricity",
  "Magnetism & Electromagnetism",
  "Electronics",
  "Modern Physics",
  "Atomic Physics",
  "Nuclear Physics",
  "Particle Physics",
  "Communication Systems",
  "Lab Skills & Instruments"
];


/**
 * List of available interactive simulations in the application.
 * This list populates the simulations page and is used for search.
 * Each object describes a simulation topic, its target grade, a brief description,
 * an associated icon, and relevant categories.
 */
export const SIMULATION_TOPICS: SimulationTopic[] = [
  // --- Grade 9 ---
  { id: "measurement-tool-interactive-g9", name: "Measurement Tool Interactive", grade: "9", description: "Practice using Vernier calipers, Micrometer Screw Gauge, rulers, and protractors. Interactive reading and error analysis.", icon: DraftingCompass, categories: ["Measurements & Units", "Lab Skills & Instruments"], image: "https://placehold.co/400x200.png", aiHint: "measurement tools practice" },
  { id: "significant-figures-rules-practice-g9", name: "Significant Figures & Scientific Notation Practice", grade: "9", description: "Interactive exercises for mastering significant figures in readings/calculations and scientific notation, with immediate feedback.", icon: SigmaSquare, categories: ["Measurements & Units"], image: "https://placehold.co/400x200.png", aiHint: "significant figures scientific notation" },
  { id: "motion-graphing-lab-g9", name: "1D Motion Graphing Lab", grade: "9", description: "Interactive control of motion (position, velocity, acceleration), auto-generated P-T, V-T, A-T graphs. Match graphs to motion scenarios.", icon: LineChart, categories: ["Kinematics"], image: "https://placehold.co/400x200.png", aiHint: "motion graphs pva" },
  { id: "phet-moving-man-g9", name: "PhET: The Moving Man (Kinematics)", grade: "9", description: "Control position, velocity, and acceleration of a stick figure and see how these relate to real-time P-T, V-T, and A-T graphs. PhysicsLab Enhancement: Graphical synchronization, user input options, 'Draw the Graph' challenge.", icon: PersonStanding, categories: ["Kinematics"], image: "https://placehold.co/400x200.png", aiHint: "moving man phet kinematics graphs" },
  { id: "phet-projectile-motion-g9", name: "PhET: Projectile Motion", grade: "9", description: "Launch objects with adjustable angle, initial speed, and mass, observing their trajectory. Air resistance toggle. PhysicsLab Enhancement: Vector components visualization, 'Hit the Target' game mode, energy analysis.", icon: Orbit, categories: ["Kinematics", "Dynamics & Forces"], image: "https://placehold.co/400x200.png", aiHint: "projectile motion phet trajectory" },
  { id: "vectors-lab-g9", name: "Vectors Addition/Subtraction Lab", grade: "9", description: "Interactively add and subtract vectors using graphical (head-to-tail) and analytical (component) methods. Drag & drop vectors, see resultant.", icon: GitFork, categories: ["Kinematics", "Dynamics & Forces", "Vectors"], image: "https://placehold.co/400x200.png", aiHint: "vector addition subtraction" },
  { id: "forces-motion-workbench-g9", name: "Forces & Motion Workbench", grade: "9", description: "Apply forces to objects on different surfaces (varying friction) and observe the resulting motion, illustrating Newton's laws. Simulations of collisions between objects with adjustable masses and initial velocities to show conservation of momentum.", icon: Move, categories: ["Dynamics & Forces"], image: "https://placehold.co/400x200.png", aiHint: "newton laws force friction" },
  { id: "phet-forces-motion-basics-g9", name: "PhET: Forces and Motion Basics", grade: "9", description: "Explores net force, friction, and Newton's laws. Users can apply forces to objects, observe acceleration, and analyze free-body diagrams. PhysicsLab Enhancement: Interactive FBDs, real-time net force/acceleration, adjustable friction, 'Predict Motion' challenge.", icon: Move, categories: ["Dynamics & Forces"], image: "https://placehold.co/400x200.png", aiHint: "newton laws phet friction" },
  { id: "momentum-collisions-lab-g9", name: "Momentum & Collisions Lab", grade: "9", description: "Simulate 1D/2D elastic/inelastic collisions. Observe conservation of momentum and KE changes. Adjustable masses and initial velocities.", icon: Combine, categories: ["Dynamics & Forces"], image: "https://placehold.co/400x200.png", aiHint: "momentum collisions conservation" },
  { id: "uniform-circular-motion-g9", name: "Uniform Circular Motion Simulator", grade: "9", description: "Explore centripetal force, velocity, and acceleration in uniform circular motion. Adjust radius, speed, and mass. Visualization of vectors.", icon: RefreshCw, categories: ["Rotational & Circular Motion", "Dynamics & Forces"], image: "https://placehold.co/400x200.png", aiHint: "circular motion centripetal force" },
  { id: "work-energy-lab-g9", name: "Work-Energy Transformation Lab", grade: "9", description: "Investigate KE, PE, work done by/against friction, and power in scenarios like inclined planes and spring systems.", icon: Route, categories: ["Work, Energy & Power"], image: "https://placehold.co/400x200.png", aiHint: "work energy power lab" },
  { id: "phet-energy-skate-park-basics-g9", name: "PhET: Energy Skate Park Basics", grade: "9", description: "Demonstrates conservation of mechanical energy (kinetic and potential) for a skateboarder on a track. PhysicsLab Enhancement: Track builder, real-time energy bars, friction control, numerical display, 'Design a Rollercoaster' mode.", icon: PersonStanding, categories: ["Work, Energy & Power"], image: "https://placehold.co/400x200.png", aiHint: "energy skate park phet conservation" },
  { id: "conservation-energy-rollercoaster-g9", name: "Conservation of Energy Roller Coaster", grade: "9", description: "Based on Energy Skate Park concept. Build tracks, observe energy breakdown (KE, PE, Thermal), explore non-conservative forces.", icon: TrendingUp, categories: ["Work, Energy & Power"], image: "https://placehold.co/400x200.png", aiHint: "roller coaster energy conservation" },
  { id: "simple-machines-levers-pulleys-g9", name: "Levers & Pulleys Efficiency Analyzer", grade: "9", description: "Analyze mechanical advantage (MA) and efficiency of interactive levers and pulley systems with adjustable loads and efforts.", icon: Anchor, categories: ["Simple Machines", "Work, Energy & Power"], image: "https://placehold.co/400x200.png", aiHint: "levers pulleys simple machines" },
  { id: "simple-machines-inclined-plane-g9", name: "Inclined Plane & Screw Mechanism", grade: "9", description: "Interactively manipulate incline angle and screw pitch to understand work, Mechanical Advantage (MA), and efficiency.", icon: Album, categories: ["Simple Machines"], image: "https://placehold.co/400x200.png", aiHint: "inclined plane screw simple machines" },
  { id: "universal-gravitation-explorer-g9", name: "Law of Universal Gravitation Explorer", grade: "9", description: "Explore gravitational force between interactive planets/masses. Adjust masses and distance, observe force vectors. Demonstrates F = Gm₁m₂/r².", icon: UsersRoundIcon, categories: ["Gravitation & Orbital Mechanics"], image: "https://placehold.co/400x200.png", aiHint: "gravitation universal law planets" },
  { id: "orbital-mechanics-g9", name: "Orbital Mechanics Explorer (Earth/Sun)", grade: "9/10", description: "Simulate Earth orbiting the Sun. Adjust initial velocity and radial distance to observe changes in orbit shape and period.", icon: Orbit, categories: ["Gravitation & Orbital Mechanics", "Kinematics"], image: "https://placehold.co/400x200.png", aiHint: "orbit earth sun gravity" },
  { id: "density-buoyancy-lab-g9", name: "Density & Buoyancy Lab", grade: "9", description: "Submerge objects of different materials/volumes, measure buoyant force, calculate density. Explore Archimedes' Principle, flotation.", icon: Anchor, categories: ["Properties of Matter & Fluids"], image: "https://placehold.co/400x200.png", aiHint: "density buoyancy archimedes" },
  { id: "elasticity-hookes-law-g9", name: "Hooke's Law & Stress-Strain Lab", grade: "9", description: "Investigate force-extension for springs and wires. Plot load-extension and stress-strain curves. Determine spring constant and Young's Modulus.", icon: Weight, categories: ["Elasticity", "Properties of Matter & Fluids"], image: "https://placehold.co/400x200.png", aiHint: "hookes law stress strain elasticity" },
  { id: "states-of-matter-g9", name: "States of Matter - Particle Model", grade: "9", description: "Visualize particle behavior in solids, liquids, and gases, and how temperature/pressure affect them. Includes a conceptual P-V diagram.", icon: Atom, categories: ["Heat & Thermodynamics", "Properties of Matter & Fluids"], image: "https://placehold.co/400x200.png", aiHint: "particles solid liquid gas" },
  { id: "phet-states-of-matter-basics-g9", name: "PhET: States of Matter: Basics", grade: "9", description: "Visualizes atoms/molecules in solid, liquid, and gas phases, and allows changing temperature and pressure to observe phase transitions. PhysicsLab Enhancement: Phase change animation, pressure/volume link for gases, evaporation focus.", icon: Atom, categories: ["Heat & Thermodynamics", "Properties of Matter & Fluids"], image: "https://placehold.co/400x200.png", aiHint: "states of matter phet particles" },
  { id: "thermal-expansion-g9", name: "Thermal Expansion Simulator", grade: "9", description: "Explore linear, area, and volume expansion of solids/liquids by heating materials and observing changes.", icon: Thermometer, categories: ["Heat & Thermodynamics"], image: "https://placehold.co/400x200.png", aiHint: "thermal expansion linear area volume" },
  { id: "heat-transfer-modes-g9", name: "Heat Transfer Modes Visualizer", grade: "9", description: "Animated microscopic and macroscopic examples of conduction, convection, and radiation.", icon: HeaterIcon, categories: ["Heat & Thermodynamics"], image: "https://placehold.co/400x200.png", aiHint: "heat transfer conduction convection radiation" },
  { id: "specific-heat-calculator-g9", name: "Specific Heat & Heat Capacity Calculator", grade: "9", description: "Interactive problem-solver for Q=mcΔT, allowing users to find any variable.", icon: SigmaSquare, categories: ["Heat & Thermodynamics"], image: "https://placehold.co/400x200.png", aiHint: "specific heat capacity calculator" },
  { id: "latent-heat-heating-curve-g9", name: "Latent Heat & Phase Change Heating Curve", grade: "9", description: "Interactive graph of heating ice to steam, explaining phase transitions and latent heat.", icon: LineChart, categories: ["Heat & Thermodynamics"], image: "https://placehold.co/400x200.png", aiHint: "latent heat phase change heating curve" },
  { id: "magnetism-basics-g9", name: "Magnetism Basics Explorer", grade: "9", description: "Explore temporary vs. permanent magnets, plot magnetic fields (bar magnet, Earth), and visualize paramagnetic/diamagnetic materials.", icon: Magnet, categories: ["Magnetism & Electromagnetism"], image: "https://placehold.co/400x200.png", aiHint: "magnetism fields poles" },
  { id: "measurement-errors-visualizer-g9", name: "Measurement Errors Visualizer", grade: "9", description: "Simulate and differentiate systematic vs. random errors. Visualize least count error visualization.", icon: AlertTriangle, categories: ["Measurements & Units", "Lab Skills & Instruments"], image: "https://placehold.co/400x200.png", aiHint: "measurement error systematic random" },
  { id: "relative-velocity-scenarios-g9", name: "Relative Velocity Scenarios", grade: "9", description: "Interactive animation of relative motion for boats in rivers, planes in wind. Users control velocities and observe resultant paths.", icon: Ship, categories: ["Kinematics", "Vectors"], image: "https://placehold.co/400x200.png", aiHint: "relative velocity boat plane" },
  { id: "motion-under-gravity-g9", name: "Motion Under Gravity (Free Fall)", grade: "9", description: "Objects falling with/without air resistance, showing increasing velocity and effect of air resistance leading to terminal velocity.", icon: ArrowDown, categories: ["Kinematics", "Dynamics & Forces"], image: "https://placehold.co/400x200.png", aiHint: "free fall gravity air resistance" },
  { id: "forces-as-vectors-composer-g9", name: "Forces as Vectors Composer", grade: "9", description: "Interactive tool to resolve forces into components and find resultant force.", icon: GitFork, categories: ["Dynamics & Forces", "Vectors"], image: "https://placehold.co/400x200.png", aiHint: "vector addition forces components" },
  { id: "inertia-demonstration-g9", name: "Inertia Demonstration", grade: "9", description: "Animation showing an object's resistance to change in motion, e.g., coin on cardboard, passengers in a braking bus.", icon: Box, categories: ["Dynamics & Forces"], image: "https://placehold.co/400x200.png", aiHint: "inertia newton first law" },
  { id: "action-reaction-pairs-visualizer-g9", name: "Action-Reaction Pairs Visualizer", grade: "9", description: "Identifying and visualizing Newton's 3rd Law pairs in various scenarios (e.g., person pushing a wall, rocket propulsion).", icon: UsersIcon, categories: ["Dynamics & Forces"], image: "https://placehold.co/400x200.png", aiHint: "newton third law action reaction" },
  { id: "momentum-change-impulse-g9", name: "Momentum Change & Impulse", grade: "9", description: "Force vs. time graph, calculating impulse (area under graph), linking to momentum change.", icon: AreaChart, categories: ["Dynamics & Forces"], image: "https://placehold.co/400x200.png", aiHint: "impulse momentum graph" },
  { id: "power-calculation-scenarios-g9", name: "Power Calculation Scenarios", grade: "9", description: "Interactive problems, e.g., lifting weights, running up stairs, showing work done over time.", icon: TrendingUp, categories: ["Work, Energy & Power"], image: "https://placehold.co/400x200.png", aiHint: "power calculation work time" },
  { id: "energy-forms-transformation-examples-g9", name: "Energy Forms Transformation Examples", grade: "9", description: "Animation of energy changing forms: chemical to electrical to light, etc.", icon: Recycle, categories: ["Work, Energy & Power"], image: "https://placehold.co/400x200.png", aiHint: "energy transformation forms" },
  { id: "wheel-axle-principle-g9", name: "Wheel & Axle Principle", grade: "9", description: "Interactive visualization of its working and mechanical advantage.", icon: CircleDot, categories: ["Simple Machines"], image: "https://placehold.co/400x200.png", aiHint: "wheel axle simple machine" },
  { id: "screw-as-inclined-plane-g9", name: "Screw as Inclined Plane", grade: "9", description: "Unrolling a screw to visualize it as an inclined plane.", icon: MinusSquare, categories: ["Simple Machines"], image: "https://placehold.co/400x200.png", aiHint: "screw inclined plane physics" },
  { id: "gravitational-field-strength-variation-g9", name: "Gravitational Field Strength Variation", grade: "9", description: "Graph/visualizer of 'g' with altitude/depth.", icon: LineChart, categories: ["Gravitation & Orbital Mechanics"], image: "https://placehold.co/400x200.png", aiHint: "gravity variation altitude depth" },
  { id: "weightlessness-in-orbit-g9", name: "Weightlessness in Orbit", grade: "9", description: "Conceptual animation of free-fall causing apparent weightlessness.", icon: Orbit, categories: ["Gravitation & Orbital Mechanics"], image: "https://placehold.co/400x200.png", aiHint: "weightlessness orbit satellite" },
  { id: "pressure-in-solids-fluids-g9", name: "Pressure in Solids & Fluids", grade: "9", description: "Conceptual visualization of force distribution, e.g., sharp vs. blunt object.", icon: Droplets, categories: ["Properties of Matter & Fluids"], image: "https://placehold.co/400x200.png", aiHint: "pressure solids fluids force" },
  { id: "liquid-level-communicating-vessels-g9", name: "Liquid Level in Communicating Vessels", grade: "9", description: "Demonstration of equal pressure at same depth.", icon: Layers, categories: ["Properties of Matter & Fluids"], image: "https://placehold.co/400x200.png", aiHint: "communicating vessels pressure liquid" },
  { id: "types-of-stress-strain-g9", name: "Types of Stress & Strain", grade: "9", description: "Visual examples of tensile, compressive, shear stress/strain.", icon: StretchHorizontal, categories: ["Elasticity"], image: "https://placehold.co/400x200.png", aiHint: "stress strain types tensile compressive shear" },
  { id: "ductile-vs-brittle-materials-g9", name: "Ductile vs. Brittle Materials", grade: "9", description: "Stress-strain curve comparison for different materials.", icon: LineChart, categories: ["Elasticity"], image: "https://placehold.co/400x200.png", aiHint: "ductile brittle materials stress strain" },
  { id: "bimetallic-strip-animator-g9", name: "Bimetallic Strip Animator", grade: "9", description: "Demonstration of thermal expansion causing bending, used in thermostats.", icon: Layers, categories: ["Heat & Thermodynamics"], image: "https://placehold.co/400x200.png", aiHint: "bimetallic strip thermal expansion thermostat" },
  { id: "factors-affecting-evaporation-g9", name: "Factors Affecting Evaporation", grade: "9", description: "Interactive visualization of surface area, temperature, wind, nature of liquid effects.", icon: Wind, categories: ["Heat & Thermodynamics"], image: "https://placehold.co/400x200.png", aiHint: "evaporation factors temperature wind" },
  { id: "heating-curve-of-water-g9", name: "Heating Curve of Water", grade: "9", description: "Detailed plot with phase change plateaus, showing energy input vs. temperature.", icon: LineChart, categories: ["Heat & Thermodynamics"], image: "https://placehold.co/400x200.png", aiHint: "heating curve water phase change latent heat" },
  { id: "atomic-structure-explorer-g9", name: "Atomic Structure Explorer", grade: "9/10", description: "Visualize atomic components (protons, neutrons, electrons). Change numbers to see effects on element and properties. Simulate alpha/beta decay.", icon: Atom, categories: ["Atomic Physics", "Nuclear Physics"], image: "https://placehold.co/400x200.png", aiHint: "atom protons neutrons electrons decay" },
  
  // Grade 10
  { id: "phet-pendulum-lab-g10", name: "PhET: Pendulum Lab", grade: "10", description: "Investigate pendulum period by changing length, mass, gravity, and initial angle. PhysicsLab Enhancement: Graphical analysis (angle vs. time, energy vs. time), 'Unknown Gravity' challenge.", icon: MoveVertical, categories: ["Simple Harmonic Motion", "Waves & Oscillations"], image: "https://placehold.co/400x200.png", aiHint: "pendulum lab phet period shm" },
  { id: "shm-lab-g10", name: "Simple Harmonic Motion (SHM) Lab", grade: "10", description: "Explore SHM with spring-mass and simple pendulum. View displacement, velocity, acceleration graphs, and energy transformation. Toggle damping.", icon: Waves, categories: ["Simple Harmonic Motion", "Waves & Oscillations"], image: "https://placehold.co/400x200.png", aiHint: "shm lab spring pendulum graphs energy" },
  { id: "phet-wave-on-a-string-g10", name: "PhET: Wave on a String", grade: "10", description: "Creates transverse waves. Adjust amplitude, frequency, damping, tension. PhysicsLab Enhancement: Display wave properties, explore standing waves (fixed/loose ends), visualize superposition.", icon: Waves, categories: ["Waves & Oscillations"], image: "https://placehold.co/400x200.png", aiHint: "wave string phet transverse standing" },
  { id: "wave-types-visualizer-g10", name: "Types of Waves Visualizer", grade: "10", description: "Demonstrate properties of transverse and longitudinal waves (amplitude, wavelength, frequency, speed).", icon: Waves, categories: ["Waves & Oscillations"], image: "https://placehold.co/400x200.png", aiHint: "wave types transverse longitudinal" },
  { id: "wave-phenomena-g10", name: "Wave Phenomena Simulator", grade: "10", description: "Visualize superposition, 2D interference, diffraction, and standing waves with adjustable sources and patterns.", icon: Waves, categories: ["Waves & Oscillations"], image: "https://placehold.co/400x200.png", aiHint: "wave phenomena superposition interference diffraction" },
  { id: "phet-sound-waves-g10", name: "PhET: Sound Waves", grade: "10", description: "Visualizes sound waves as pressure variations. Control frequency (pitch) and amplitude (loudness). PhysicsLab Enhancement: Particle vibration animation, synchronized pressure/displacement graphs, multiple source interference.", icon: Speaker, categories: ["Sound", "Waves & Oscillations"], image: "https://placehold.co/400x200.png", aiHint: "sound waves phet pressure pitch loudness" },
  { id: "sound-propagation-g10", name: "Sound Wave Propagation Animator", grade: "10", description: "Animate pressure/displacement variations for sound waves. Adjust pitch (frequency) and loudness (amplitude).", icon: Speaker, categories: ["Sound", "Waves & Oscillations"], image: "https://placehold.co/400x200.png", aiHint: "sound wave propagation animation" },
  { id: "resonance-musical-instruments-g10", name: "Resonance & Musical Instruments", grade: "10", description: "Show vibrating strings/air columns, formation of standing waves, fundamental frequencies & harmonics.", icon: Music2, categories: ["Sound", "Waves & Oscillations"], image: "https://placehold.co/400x200.png", aiHint: "resonance musical instruments standing waves" },
  { id: "phet-bending-light-g10", name: "PhET: Bending Light (Refraction & Reflection)", grade: "10", description: "Explore how light bends. Shine a laser through various media. PhysicsLab Enhancement: Flexible media with adjustable refractive indices, interactive ray tracing, Snell's Law calculator, critical angle visualization.", icon: Pipette, categories: ["Light & Optics"], image: "https://placehold.co/400x200.png", aiHint: "bending light phet refraction reflection" },
  { id: "reflection-lab-g10", name: "Reflection Lab", grade: "10", description: "Interactive incident/reflected rays for plane mirrors. Verify laws of reflection.", icon: BookKey, categories: ["Light & Optics"], image: "https://placehold.co/400x200.png", aiHint: "reflection lab plane mirrors" },
  { id: "refraction-snells-law-g10", name: "Refraction & Snell's Law Lab", grade: "10", description: "Simulate light bending through media. Adjust angle, refractive index. Observe critical angle & Total Internal Reflection (TIR).", icon: Pipette, categories: ["Light & Optics"], image: "https://placehold.co/400x200.png", aiHint: "refraction snells law tir" },
  { id: "phet-geometric-optics-g10", name: "PhET: Geometric Optics (Lenses & Mirrors)", grade: "10", description: "Visualize ray tracing for lenses/mirrors. PhysicsLab Enhancement: Interactive tracing, image properties display, lens/mirror equation tool, compound systems.", icon: Projector, categories: ["Light & Optics"], image: "https://placehold.co/400x200.png", aiHint: "geometric optics phet lenses mirrors" },
  { id: "ray-diagrams-g10", name: "Lens & Mirror Ray Diagram Tool", grade: "10", description: "Interactively draw and explore ray diagrams for spherical mirrors and lenses to understand image formation.", icon: Projector, categories: ["Light & Optics"], image: "https://placehold.co/400x200.png", aiHint: "ray diagram lens mirror optics" },
  { id: "optical-instruments-g10", name: "Optical Instruments Explorer", grade: "10", description: "Ray tracing for simple microscope, compound microscope, and astronomical telescope. Image formation.", icon: Microscope, categories: ["Light & Optics"], image: "https://placehold.co/400x200.png", aiHint: "optical instruments microscope telescope" },
  { id: "phet-balloons-static-electricity-g10", name: "PhET: Balloons & Static Electricity", grade: "10", description: "Demonstrate charging by friction and induction. PhysicsLab Enhancement: Microscopic electron movement visualization, charge redistribution animation, interactive forces between multiple charged objects.", icon: Zap, categories: ["Electrostatics"], image: "https://placehold.co/400x200.png", aiHint: "balloons static electricity phet charge" },
  { id: "electric-charges-forces-g10", name: "Electric Charges & Forces Lab", grade: "10", description: "Simulate charging by friction/induction, visualize Coulomb's Law, field lines, and force vectors.", icon: Zap, categories: ["Electrostatics"], image: "https://placehold.co/400x200.png", aiHint: "electric charge coulomb law field" },
  { id: "electric-field-g10", name: "Electric Field Visualizer", grade: "10", description: "Visualize electric field lines around point charges and understand electrostatic phenomena like induction.", icon: Zap, categories: ["Electrostatics"], image: "https://placehold.co/400x200.png", aiHint: "electric field lines induction" },
  { id: "electric-potential-energy-g10", name: "Electric Potential & Potential Energy", grade: "10", description: "Move test charges in electric fields. Visualize work done, potential difference, ΔPE.", icon: BatteryCharging, categories: ["Electrostatics"], image: "https://placehold.co/400x200.png", aiHint: "electric potential energy work" },
  { id: "phet-circuit-construction-kit-dc-g10", name: "PhET: Circuit Construction Kit (DC)", grade: "10", description: "Build DC circuits. PhysicsLab Enhancement: Visual current flow, functional meters, Ohm's Law/Kirchhoff's exploration, 'Build a Circuit' challenge.", icon: Network, categories: ["Current Electricity"], image: "https://placehold.co/400x200.png", aiHint: "dc circuit phet builder ohms law" },
  { id: "simple-circuits-g10", name: "Simple Circuit Builder (Series/Parallel)", grade: "10", description: "Build and test simple series and parallel circuits to understand Ohm's law and current flow.", icon: Network, categories: ["Current Electricity"], image: "https://placehold.co/400x200.png", aiHint: "circuit builder series parallel ohms" },
  { id: "resistivity-factors-g10", name: "Resistivity & Factors Affecting Resistance", grade: "10", description: "Interactive wire properties (material, length, area), resistance calculation.", icon: Cable, categories: ["Current Electricity"], image: "https://placehold.co/400x200.png", aiHint: "resistivity resistance factors" },
  { id: "household-wiring-g10", name: "Household Wiring Diagram", grade: "10", description: "Interactive circuit diagram of household parallel wiring, safety features (fuses, circuit breakers, earth wire).", icon: Plug, categories: ["Current Electricity"], image: "https://placehold.co/400x200.png", aiHint: "household wiring safety circuits" },
  { id: "magnetic-field-visualizer-g10", name: "Magnetic Field Visualizer", grade: "10", description: "Visualize magnetic field lines around bar magnets, and current-carrying wires (straight, loop, solenoid). Compass deflection.", icon: Magnet, categories: ["Magnetism & Electromagnetism"], image: "https://placehold.co/400x200.png", aiHint: "magnetic field lines bar magnet current wire" },
  { id: "magnetic-fields-forces-g10", name: "Magnetic Fields & Motor Principle", grade: "10", description: "Visualize magnetic fields and simulate the force on a current-carrying wire in a magnetic field (motor principle).", icon: Magnet, categories: ["Magnetism & Electromagnetism"], image: "https://placehold.co/400x200.png", aiHint: "magnetic field motor force" },
  { id: "force-on-conductor-charge-g10", name: "Force on Conductor/Charge (Lorentz Force)", grade: "10", description: "Demonstrate directional rule (Fleming's LHR) and display force vector. Adjust B, I, L, q, v.", icon: GripVertical, categories: ["Magnetism & Electromagnetism"], image: "https://placehold.co/400x200.png", aiHint: "lorentz force magnetic conductor charge" },
  { id: "dc-motor-animator-g10", name: "DC Motor Principle Animator", grade: "10", description: "Animate the working of a simple DC motor, showing coil rotation in magnetic field and commutator action.", icon: RefreshCw, categories: ["Magnetism & Electromagnetism"], image: "https://placehold.co/400x200.png", aiHint: "dc motor principle animation" },
  { id: "logic-gates-g10", name: "Logic Gate Simulator", grade: "10/12", description: "Simulate basic logic gates (AND, OR, NOT, NAND, NOR, XOR) and verify their truth tables.", icon: Binary, categories: ["Electronics"], image: "https://placehold.co/400x200.png", aiHint: "logic gates truth table digital" },
  { id: "energy-in-shm-animator-g10", name: "Energy in SHM Animator", grade: "10", description: "Kinetic vs. Potential energy exchange in mass-spring system over a cycle.", icon: LineChart, categories: ["Simple Harmonic Motion", "Work, Energy & Power"], image: "https://placehold.co/400x200.png", aiHint: "shm energy kinetic potential" },
  { id: "properties-of-waves-g10", name: "Properties of Waves", grade: "10", description: "Interactive diagram to identify crest, trough, wavelength, amplitude, period.", icon: DraftingCompass, categories: ["Waves & Oscillations"], image: "https://placehold.co/400x200.png", aiHint: "wave properties diagram" },
  { id: "principle-of-superposition-g10", name: "Principle of Superposition (Constructive/Destructive)", grade: "10", description: "Visualizing two waves combining.", icon: Combine, categories: ["Waves & Oscillations"], image: "https://placehold.co/400x200.png", aiHint: "wave superposition interference" },
  { id: "factors-affecting-speed-of-sound-g10", name: "Factors Affecting Speed of Sound", grade: "10", description: "Conceptual explanation/visualization of temperature, medium density effects.", icon: Thermometer, categories: ["Sound"], image: "https://placehold.co/400x200.png", aiHint: "speed of sound factors" },
  { id: "echolocation-principle-g10", name: "Echolocation Principle", grade: "10", description: "Animation showing sound waves reflecting, calculating distance.", icon: Milestone, categories: ["Sound"], image: "https://placehold.co/400x200.png", aiHint: "echolocation ultrasound distance" },
  { id: "resonance-in-air-columns-g10", name: "Resonance in Air Columns", grade: "10", description: "Animation showing vibrating air columns in open/closed pipes, node/antinode formation.", icon: Speaker, categories: ["Sound", "Waves & Oscillations"], image: "https://placehold.co/400x200.png", aiHint: "resonance air columns pipes" },
  { id: "image-formation-plane-mirror-g10", name: "Image Formation by Plane Mirror", grade: "10", description: "Ray tracing, virtual image formation, properties.", icon: Square, categories: ["Light & Optics"], image: "https://placehold.co/400x200.png", aiHint: "plane mirror image formation" },
  { id: "spherical-chromatic-aberration-g10", name: "Spherical & Chromatic Aberration", grade: "10", description: "Conceptual animation of lens/mirror defects.", icon: Aperture, categories: ["Light & Optics"], image: "https://placehold.co/400x200.png", aiHint: "lens aberration spherical chromatic" },
  { id: "magnifying-glass-animator-g10", name: "Magnifying Glass Animator", grade: "10", description: "Ray tracing for a simple convex lens as a magnifier.", icon: ZoomInIcon, categories: ["Light & Optics"], image: "https://placehold.co/400x200.png", aiHint: "magnifying glass convex lens" },
  { id: "gold-leaf-electroscope-function-g10", name: "Gold Leaf Electroscope Function", grade: "10", description: "Animation of charging by contact/induction, leaf deflection.", icon: Leaf, categories: ["Electrostatics", "Lab Skills & Instruments"], image: "https://placehold.co/400x200.png", aiHint: "electroscope gold leaf charging" },
  { id: "capacitor-as-energy-storage-g10", name: "Capacitor as Energy Storage Device", grade: "10", description: "Visualizing charge accumulation and energy storage.", icon: BatteryCharging, categories: ["Electrostatics", "Current Electricity"], image: "https://placehold.co/400x200.png", aiHint: "capacitor energy storage charge" },
  { id: "emf-vs-potential-difference-g10", name: "EMF vs. Potential Difference", grade: "10", description: "Conceptual comparison using a circuit analogy.", icon: BatteryCharging, categories: ["Current Electricity"], image: "https://placehold.co/400x200.png", aiHint: "emf potential difference battery" },
  { id: "internal-resistance-battery-g10", name: "Internal Resistance of Battery", grade: "10", description: "Circuit simulation showing voltage drop across internal resistance.", icon: BatteryWarning, categories: ["Current Electricity"], image: "https://placehold.co/400x200.png", aiHint: "internal resistance battery voltage drop" },
  { id: "joules-law-of-heating-g10", name: "Joule's Law of Heating", grade: "10", description: "Current, resistance, time affecting heat produced in a resistor.", icon: HeaterIcon, categories: ["Current Electricity", "Heat & Thermodynamics"], image: "https://placehold.co/400x200.png", aiHint: "joules law heating effect current" },
  { id: "magnetic-field-current-conductor-g10", name: "Magnetic Field (Current Conductors)", grade: "10", description: "3D visualization, Right-Hand Rule for straight wires, loops, solenoids.", icon: Magnet, categories: ["Magnetism & Electromagnetism"], image: "https://placehold.co/400x200.png", aiHint: "magnetic field current wire loop solenoid" },
  { id: "electromagnet-construction-g10", name: "Electromagnet Construction", grade: "10", description: "Interactive build, varying turns, current, core material.", icon: Magnet, categories: ["Magnetism & Electromagnetism"], image: "https://placehold.co/400x200.png", aiHint: "electromagnet construction lab" },
  { id: "magnetic-levitation-principle-g10", name: "Magnetic Levitation Principle", grade: "10", description: "Simple demonstration using opposing magnetic fields.", icon: Magnet, categories: ["Magnetism & Electromagnetism"], image: "https://placehold.co/400x200.png", aiHint: "magnetic levitation force" },
  { id: "flemings-left-hand-rule-animator-g10", name: "Fleming's Left-Hand Rule Animator", grade: "10", description: "Interactive tool for force direction on current/charge in a magnetic field.", icon: Hand, categories: ["Magnetism & Electromagnetism"], image: "https://placehold.co/400x200.png", aiHint: "flemings left hand rule force" },
  { id: "wave-generator-g10", name: "Wave Generator (Adjustable Params)", grade: "10", description: "Generate transverse waves. Adjust frequency, amplitude, damping, and tension to observe wave characteristics.", icon: Waves, categories: ["Waves & Oscillations"], image: "https://placehold.co/400x200.png", aiHint: "wave generator physics" },
  { id: "ray-tracing-g10", name: "Ray Tracing (Mirrors & Lenses)", grade: "10", description: "Interactive ray diagrams for spherical mirrors and lenses. Adjust object position, focal length. See image properties.", icon: Projector, categories: ["Light & Optics"], image: "https://placehold.co/400x200.png", aiHint: "ray tracing optics mirror lens" },
  { id: "ohms-law-circuit-g10", name: "Ohm's Law (Circuit Building)", grade: "10", description: "Build simple series/parallel circuits. Verify Ohm's Law. Observe current and voltage.", icon: Network, categories: ["Current Electricity"], image: "https://placehold.co/400x200.png", aiHint: "ohms law circuit series parallel" },
  { id: "electric-field-lines-g10", name: "Electric Field Lines (Basic)", grade: "10", description: "Visualize electric field lines for point charges. Explore attraction, repulsion, and basic induction.", icon: Zap, categories: ["Electrostatics"], image: "https://placehold.co/400x200.png", aiHint: "electric field lines charges" },
  { id: "dispersion-prism-g10", name: "Dispersion of Light (Prism)", grade: "10", description: "Simulate white light passing through a prism, showing the spectrum of colors. Explain rainbow formation.", icon: Pipette, categories: ["Light & Optics"], image: "https://placehold.co/400x200.png", aiHint: "dispersion prism light spectrum" },
  
  // Grade 11
  { id: "phet-forces-motion-friction-g11", name: "PhET: Forces and Motion - Friction Focus", grade: "11", description: "Explore static and kinetic friction. PhysicsLab Enhancement: Detailed force vectors, adjustable surfaces/coefficients, Applied Force vs. Friction Force graphs.", icon: GripVertical, categories: ["Dynamics & Forces"], image: "https://placehold.co/400x200.png", aiHint: "friction phet forces static kinetic" },
  { id: "phet-energy-skate-park-work-g11", name: "PhET: Energy Skate Park - Work & Energy", grade: "11", description: "Explore work and energy transformations with external forces. PhysicsLab Enhancement: External work visualization, instantaneous power display, 'Power Up' challenge.", icon: PersonStanding, categories: ["Work, Energy & Power"], image: "https://placehold.co/400x200.png", aiHint: "energy skate park phet work power" },
  { id: "phet-ladybug-revolution-g11", name: "PhET: Ladybug Revolution (Rotational Motion)", grade: "11", description: "Explore angular position, velocity, and acceleration. PhysicsLab Enhancement: Clear vector visualization (tangential/angular velocity, centripetal acceleration), graphs, 'Break the String' challenge.", icon: Bug, categories: ["Rotational & Circular Motion"], image: "https://placehold.co/400x200.png", aiHint: "ladybug revolution phet rotational angular" },
  { id: "phet-my-solar-system-g11", name: "PhET: My Solar System (Gravitation)", grade: "11", description: "N-body gravitational simulator. PhysicsLab Enhancement: Add multiple bodies, visualize dynamic gravitational fields, display orbital elements, 'Stable Orbit' challenge.", icon: Orbit, categories: ["Gravitation & Orbital Mechanics"], image: "https://placehold.co/400x200.png", aiHint: "solar system phet gravity nbody orbit" },
  { id: "phet-fluid-pressure-flow-g11", name: "PhET: Fluid Pressure and Flow", grade: "11", description: "Explore pressure, buoyancy, and fluid flow. PhysicsLab Enhancement: Pressure visualization, buoyancy experiments, Pascal's Principle (hydraulic system), Bernoulli's Principle animation.", icon: Droplets, categories: ["Properties of Matter & Fluids"], image: "https://placehold.co/400x200.png", aiHint: "fluid pressure flow phet buoyancy bernoulli" },
  { id: "vector-analysis-lab-g11", name: "Vector Analysis Lab", grade: "11", description: "Interactive tool for vector addition/subtraction using perpendicular components. Explore dot product and cross product concepts visually (2D/3D).", icon: GitFork, categories: ["Vectors", "Kinematics", "Dynamics & Forces"], image: "https://placehold.co/400x200.png", aiHint: "vector analysis components dot cross product" },
  { id: "forces-in-equilibrium-g11", name: "Forces in Equilibrium", grade: "11", description: "Simulate concurrent forces acting on a point. Adjust force magnitudes and angles to achieve equilibrium. Verify Lami's Theorem.", icon: Triangle, categories: ["Dynamics & Forces", "Vectors"], image: "https://placehold.co/400x200.png", aiHint: "forces equilibrium lami theorem concurrent" },
  { id: "gravitational-potential-escape-velocity-g11", name: "Gravitational Potential & Escape Velocity", grade: "11", description: "Visualize gravitational potential field around a mass. Calculate and simulate escape velocity for different celestial bodies.", icon: Rocket, categories: ["Gravitation & Orbital Mechanics", "Work, Energy & Power"], image: "https://placehold.co/400x200.png", aiHint: "gravitational potential escape velocity energy" },
  { id: "power-calculation-efficiency-g11", name: "Power Calculation & Efficiency", grade: "11", description: "Interactive scenarios for calculating power (e.g., motor lifting a load, person climbing stairs). Analyze efficiency and energy losses.", icon: TrendingUp, categories: ["Work, Energy & Power"], image: "https://placehold.co/400x200.png", aiHint: "power calculation efficiency work time" },
  { id: "torque-rotational-equilibrium-g11", name: "Torque & Rotational Equilibrium", grade: "11", description: "Apply forces at different points on a rigid body (e.g., a beam on a pivot). Adjust forces and distances to achieve rotational equilibrium. Visualize torque vectors.", icon: Replace, categories: ["Rotational & Circular Motion", "Dynamics & Forces"], image: "https://placehold.co/400x200.png", aiHint: "torque rotational equilibrium moment" },
  { id: "angular-kinematics-g11", name: "Angular Kinematics", grade: "11", description: "Simulate a rotating disc with a point on its edge. Visualize and graph angular displacement, angular velocity, and angular acceleration.", icon: RefreshCw, categories: ["Rotational & Circular Motion"], image: "https://placehold.co/400x200.png", aiHint: "angular kinematics displacement velocity acceleration" },
  { id: "moment-of-inertia-angular-momentum-g11", name: "Moment of Inertia & Angular Momentum", grade: "11", description: "Visualize moment of inertia for different shapes. Simulate conservation of angular momentum (e.g., ice skater, spinning platform with changing mass distribution).", icon: Album, categories: ["Rotational & Circular Motion"], image: "https://placehold.co/400x200.png", aiHint: "moment inertia angular momentum conservation" },
  { id: "real-world-centripetal-force-g11", name: "Real-world Centripetal Force", grade: "11", description: "Analyze forces in banking of roads (cars turning) and vertical circular motion (e.g., bucket of water, rollercoaster loop). Visualize force components.", icon: Car, categories: ["Rotational & Circular Motion", "Dynamics & Forces"], image: "https://placehold.co/400x200.png", aiHint: "centripetal force banking roads vertical circle" },
  { id: "satellite-motion-kepler-g11", name: "Satellite Motion & Kepler's Laws", grade: "11", description: "Simulate satellite orbits (circular and elliptical). Visualize Kepler's Laws (areas, periods). Adjustable orbital parameters.", icon: Satellite, categories: ["Gravitation & Orbital Mechanics"], image: "https://placehold.co/400x200.png", aiHint: "satellite motion kepler laws orbit" },
  { id: "streamline-vs-turbulent-flow-g11", name: "Streamline vs. Turbulent Flow", grade: "11", description: "Visualize fluid flow patterns (streamlines) around different obstacles. Adjust flow speed to observe transition to turbulent flow.", icon: Wind, categories: ["Properties of Matter & Fluids"], image: "https://placehold.co/400x200.png", aiHint: "streamline turbulent flow fluid dynamics" },
  { id: "venturi-effect-g11", name: "Venturi Effect", grade: "11", description: "Animation of fluid speed and pressure changes as it flows through a constricted pipe (Venturi meter). Relate to Bernoulli's principle.", icon: Combine, categories: ["Properties of Matter & Fluids"], image: "https://placehold.co/400x200.png", aiHint: "venturi effect bernoulli fluid pressure speed" },
  { id: "surface-tension-phenomena-g11", name: "Surface Tension Phenomena", grade: "11", description: "Visualize molecular forces causing surface tension. Animate droplet formation, meniscus in a capillary tube, and insects walking on water.", icon: TestTube, categories: ["Properties of Matter & Fluids"], image: "https://placehold.co/400x200.png", aiHint: "surface tension capillarity meniscus molecular forces" },
  { id: "coupled-oscillators-g11", name: "Coupled Oscillators", grade: "11", description: "Simulate two or more coupled oscillators (e.g., masses connected by springs). Observe energy transfer and normal modes of oscillation.", icon: GitCommitHorizontal, categories: ["Simple Harmonic Motion", "Waves & Oscillations"], image: "https://placehold.co/400x200.png", aiHint: "coupled oscillators energy transfer normal modes" },
  { id: "shm-ucm-relation-g11", name: "SHM & Uniform Circular Motion Relation", grade: "11", description: "Visualize the projection of an object undergoing Uniform Circular Motion onto a diameter, demonstrating its Simple Harmonic Motion.", icon: Orbit, categories: ["Simple Harmonic Motion", "Rotational & Circular Motion"], image: "https://placehold.co/400x200.png", aiHint: "shm ucm projection circular motion" },
  { id: "intensity-of-sound-light-inverse-square-law-g11", name: "Intensity of Sound/Light (Inverse Square Law)", grade: "11", description: "Visualize how the intensity of sound or light from a point source decreases with the square of the distance.", icon: Radio, categories: ["Sound", "Light & Optics", "Waves & Oscillations"], image: "https://placehold.co/400x200.png", aiHint: "intensity inverse square law sound light" },
  { id: "interference-of-waves-2d-g11", name: "Interference of Waves (2D)", grade: "11", description: "Visualize the overlap of circular or plane waves from two sources, showing regions of constructive and destructive interference.", icon: Waves, categories: ["Waves & Oscillations"], image: "https://placehold.co/400x200.png", aiHint: "wave interference 2d constructive destructive" },
  { id: "coherent-incoherent-sources-g11", name: "Coherent & Incoherent Sources", grade: "11", description: "Compare interference patterns produced by coherent versus incoherent light sources. Explain conditions for sustained interference.", icon: Lightbulb, categories: ["Light & Optics", "Waves & Oscillations"], image: "https://placehold.co/400x200.png", aiHint: "coherent incoherent light sources interference" },
  { id: "youngs-double-slit-g11", name: "Young's Double Slit Experiment", grade: "11", description: "Simulate light passing through two narrow slits and forming an interference pattern on a screen. Adjust slit separation, wavelength, and screen distance.", icon: AlignCenter, categories: ["Light & Optics", "Waves & Oscillations"], image: "https://placehold.co/400x200.png", aiHint: "youngs double slit interference fringes" },
  { id: "thin-film-interference-g11", name: "Thin Film Interference", grade: "11", description: "Conceptual animation explaining how colors appear in soap bubbles or oil slicks due to interference of light waves reflected from thin film surfaces.", icon: Album, categories: ["Light & Optics", "Waves & Oscillations"], image: "https://placehold.co/400x200.png", aiHint: "thin film interference soap bubble oil slick" },
  { id: "diffraction-grating-g11", name: "Diffraction Grating", grade: "11", description: "Simulate light passing through a diffraction grating, showing the formation of multiple sharp interference maxima (spectra). Calculate angles.", icon: GripVertical, categories: ["Light & Optics", "Waves & Oscillations"], image: "https://placehold.co/400x200.png", aiHint: "diffraction grating spectra interference" },
  { id: "polarization-of-light-g11", name: "Polarization of Light", grade: "11", description: "Visualize the transverse nature of light waves. Simulate light passing through one or two polarizing filters (Polaroids). Demonstrate Malus's Law.", icon: Layers, categories: ["Light & Optics", "Waves & Oscillations"], image: "https://placehold.co/400x200.png", aiHint: "polarization light polaroids malus law" },
  { id: "thermal-conductivity-g11", name: "Thermal Conductivity", grade: "11", description: "Simulate heat flow through different materials (rods of same dimensions). Compare temperature gradients and rates of heat transfer.", icon: HeaterIcon, categories: ["Heat & Thermodynamics"], image: "https://placehold.co/400x200.png", aiHint: "thermal conductivity heat flow materials" },
  { id: "specific-heat-gases-cp-cv-g11", name: "Specific Heat Capacities of Gases (Cp & Cv)", grade: "11", description: "Conceptual explanation of why Cp is greater than Cv for gases. Relate to the first law of thermodynamics and work done.", icon: ThermometerSnowflake, categories: ["Heat & Thermodynamics"], image: "https://placehold.co/400x200.png", aiHint: "specific heat gases cp cv thermodynamics" },
  { id: "thermodynamic-processes-pv-g11", name: "Thermodynamic Processes & P-V Diagrams", grade: "11", description: "Interactive tracing of Isothermal, Isobaric, Isochoric, and Adiabatic processes on P-V diagrams. Calculate work done.", icon: AreaChart, categories: ["Heat & Thermodynamics"], image: "https://placehold.co/400x200.png", aiHint: "thermodynamic processes pv diagram work done" },
  { id: "electric-field-lines-complex-g11", name: "Electric Field Lines for Complex Distributions", grade: "11", description: "Visualize electric field lines for configurations beyond simple point charges (e.g., charged plates, spheres, dipoles).", icon: Zap, categories: ["Electrostatics"], image: "https://placehold.co/400x200.png", aiHint: "electric field lines complex distributions plates" },
  { id: "gauss-law-animator-g11", name: "Gauss's Law Conceptual Animator", grade: "11", description: "Visualize electric flux through Gaussian surfaces for different charge enclosures. Illustrate the concept of surface integrals.", icon: SquareRadical, categories: ["Electrostatics"], image: "https://placehold.co/400x200.png", aiHint: "gauss law electric flux surface integral" },
  { id: "electric-potential-point-charges-g11", name: "Electric Potential (Point Charges/Dipole)", grade: "11", description: "Map equipotential surfaces and calculate electric potential at various points due to point charges or an electric dipole.", icon: FunctionSquare, categories: ["Electrostatics"], image: "https://placehold.co/400x200.png", aiHint: "electric potential equipotential dipole" },
  { id: "capacitor-networks-g11", name: "Capacitors in Series & Parallel", grade: "11", description: "Build and analyze capacitor networks. Calculate equivalent capacitance, charge, and voltage distribution across each capacitor.", icon: Network, categories: ["Electrostatics", "Current Electricity"], image: "https://placehold.co/400x200.png", aiHint: "capacitor series parallel equivalent charge voltage" },
  { id: "wheatstone-potentiometer-g11", name: "Wheatstone Bridge & Potentiometer", grade: "11", description: "Interactive simulations of balancing a Wheatstone bridge to find unknown resistance and using a potentiometer to measure unknown EMF or compare EMFs.", icon: SlidersHorizontal, categories: ["Current Electricity", "Lab Skills & Instruments"], image: "https://placehold.co/400x200.png", aiHint: "wheatstone bridge potentiometer emf resistance" },
  { id: "magnetic-field-loops-solenoids-g11", name: "Magnetic Field of Loops & Solenoids", grade: "11", description: "Detailed 3D visualization of magnetic field patterns for current loops and solenoids. Explore factors affecting field strength.", icon: Magnet, categories: ["Magnetism & Electromagnetism"], image: "https://placehold.co/400x200.png", aiHint: "magnetic field current loop solenoid 3d" },
  { id: "force-on-current-loop-g11", name: "Force on Current Loop in Magnetic Field", grade: "11", description: "Animate a current-carrying loop rotating in a uniform magnetic field. Visualize torque and the motor effect.", icon: RefreshCw, categories: ["Magnetism & Electromagnetism"], image: "https://placehold.co/400x200.png", aiHint: "force current loop torque motor effect" },
  { id: "galvanometer-ammeter-voltmeter-g11", name: "Galvanometer, Ammeter, Voltmeter Principles", grade: "11", description: "Conceptual animations showing the internal working principle of a moving coil galvanometer and how it's converted into an ammeter (shunt) and voltmeter (multiplier resistor).", icon: Scale, categories: ["Current Electricity", "Magnetism & Electromagnetism", "Lab Skills & Instruments"], image: "https://placehold.co/400x200.png", aiHint: "galvanometer ammeter voltmeter conversion" },
  { id: "em-induction-faraday-lenz-g11", name: "Electromagnetic Induction (Faraday & Lenz)", grade: "11", description: "Simulate changing magnetic flux through a coil (moving magnet, changing current). Visualize induced EMF and current direction according to Lenz's Law.", icon: Magnet, categories: ["Magnetism & Electromagnetism"], image: "https://placehold.co/400x200.png", aiHint: "electromagnetic induction faraday lenz law emf" },
  { id: "ac-generator-dc-motor-g11", name: "AC Generator & DC Motor Principles", grade: "11", description: "Detailed animations comparing the working principles of an AC generator (rotating coil in B-field) and a DC motor (force on current loop).", icon: Cog, categories: ["Magnetism & Electromagnetism"], image: "https://placehold.co/400x200.png", aiHint: "ac generator dc motor working principle" },
  { id: "transformer-efficiency-g11", name: "Transformer Efficiency & Principles", grade: "11", description: "Simulate a step-up and step-down transformer. Vary turns ratio. Conceptualize power losses and efficiency calculations.", icon: Replace, categories: ["Magnetism & Electromagnetism"], image: "https://placehold.co/400x200.png", aiHint: "transformer step up step down efficiency" },
  { id: "cro-principle-g11", name: "Cathode Ray Oscilloscope (CRO) Principle", grade: "11", description: "Conceptual animation showing the electron gun, deflection plates (X and Y), and how they trace a waveform on a fluorescent screen.", icon: Activity, categories: ["Electronics", "Lab Skills & Instruments"], image: "https://placehold.co/400x200.png", aiHint: "cro oscilloscope electron gun deflection" },
  { id: "modulation-demodulation-g11", name: "Modulation & Demodulation (AM/FM)", grade: "11", description: "Conceptual animations illustrating Amplitude Modulation (AM) and Frequency Modulation (FM) of carrier waves with an information signal.", icon: RadioTower, categories: ["Communication Systems"], image: "https://placehold.co/400x200.png", aiHint: "modulation demodulation am fm carrier wave" },
  { id: "optical-fiber-communication-g11", name: "Optical Fiber Communication", grade: "11", description: "Animate light transmission through an optical fiber using Total Internal Reflection. Discuss advantages over coaxial cables.", icon: Cable, categories: ["Communication Systems", "Light & Optics"], image: "https://placehold.co/400x200.png", aiHint: "optical fiber communication tir light" },
  { id: "satellite-communication-g11", name: "Satellite Communication", grade: "11", description: "Conceptual diagram showing geostationary orbits, uplink/downlink frequencies, and basic components of a satellite communication system.", icon: Satellite, categories: ["Communication Systems", "Gravitation & Orbital Mechanics"], image: "https://placehold.co/400x200.png", aiHint: "satellite communication geostationary orbit" },
  { id: "circular-motion-g11", name: "Circular Motion (Centripetal Force)", grade: "11", description: "Explore centripetal force and acceleration. Adjust mass, velocity, radius of circular path. Visualize force and velocity vectors.", icon: RefreshCw, categories: ["Rotational & Circular Motion", "Dynamics & Forces"], image: "https://placehold.co/400x200.png", aiHint: "circular motion centripetal force" },
  { id: "roller-coaster-energy-g11", name: "Roller Coaster Energy (PE/KE)", grade: "11", description: "Design a simple roller coaster track and observe the conversion between Potential Energy (PE) and Kinetic Energy (KE) of a cart.", icon: TrendingUp, categories: ["Work, Energy & Power"], image: "https://placehold.co/400x200.png", aiHint: "roller coaster energy potential kinetic" },
  { id: "archimedes-principle-g11", name: "Archimedes' Principle (Buoyancy)", grade: "11", description: "Investigate buoyant force on objects of different densities and volumes submerged in various fluids.", icon: Anchor, categories: ["Properties of Matter & Fluids"], image: "https://placehold.co/400x200.png", aiHint: "archimedes principle buoyancy fluid" },
  { id: "damped-oscillations-g11", name: "Damped Oscillations", grade: "11", description: "Simulate damped oscillations (e.g., mass-spring with friction). Adjust damping coefficient and observe amplitude decay over time.", icon: Waves, categories: ["Simple Harmonic Motion", "Waves & Oscillations"], image: "https://placehold.co/400x200.png", aiHint: "damped oscillations amplitude decay friction" },
  { id: "capacitor-rc-circuit-g11", name: "Capacitor Charging/Discharging (RC Circuit)", grade: "11", description: "Visualize charging/discharging of a capacitor in an RC circuit. Observe voltage and current graphs. Determine time constant.", icon: BatteryCharging, categories: ["Current Electricity", "Electrostatics"], image: "https://placehold.co/400x200.png", aiHint: "capacitor rc circuit charging discharging" },
  
  // Grade 12
  { id: "ideal-gas-law-g12", name: "Ideal Gas Law & Thermo Processes", grade: "12", description: "Microscopic view of gas particles, P-V-T controls, real-time P-V diagram, Work, Q, ΔU calculations for various processes.", icon: Thermometer, categories: ["Heat & Thermodynamics", "Modern Physics"], image: "https://placehold.co/400x200.png", aiHint: "ideal gas law pv diagram thermodynamics" },
  { id: "carnot-engine-g12", name: "Carnot Engine Cycle Animator", grade: "12", description: "Step-by-step animation of the Carnot cycle (isothermal expansion, adiabatic expansion, isothermal compression, adiabatic compression). Efficiency calculation.", icon: Replace, categories: ["Heat & Thermodynamics"], image: "https://placehold.co/400x200.png", aiHint: "carnot engine cycle efficiency thermodynamics" },
  { id: "electric-field-potential-g12", name: "Electric Field & Potential Mapper (Adv)", grade: "12", description: "Map fields/equipotentials for complex charge distributions. Drag test charges, see force/potential.", icon: Zap, categories: ["Electrostatics"], image: "https://placehold.co/400x200.png", aiHint: "electric field potential mapping complex" },
  { id: "ac-circuit-analyzer-g12", name: "AC Circuit Analyzer (RLC Series/Parallel)", grade: "12", description: "Build RLC circuits, view voltage/current on oscilloscope, phasor diagrams, impedance, resonance.", icon: Activity, categories: ["Current Electricity", "Magnetism & Electromagnetism"], image: "https://placehold.co/400x200.png", aiHint: "rlc circuit ac oscilloscope phasor" },
  { id: "em-induction-lenz-g12", name: "EM Induction & Lenz's Law (Advanced)", grade: "12", description: "Drag magnet through coil, see flux, induced EMF/current, Lenz's Law force visualization. AC generator concept.", icon: Magnet, categories: ["Magnetism & Electromagnetism"], image: "https://placehold.co/400x200.png", aiHint: "electromagnetic induction lenz law faraday" },
  { id: "mass-spectrometer-g12", name: "Mass Spectrometer Simulator", grade: "12", description: "Visualize ion source, velocity selector, deflection chamber. Calculate q/m ratio from particle path.", icon: Scale, categories: ["Magnetism & Electromagnetism", "Modern Physics"], image: "https://placehold.co/400x200.png", aiHint: "mass spectrometer qm ratio ions" },
  { id: "photoelectric-effect-g12", name: "Photoelectric Effect (Enhanced)", grade: "12", description: "Adjust light frequency/intensity, metal work function. Observe emitted electrons, KE vs. Freq graph, stopping voltage.", icon: Sun, categories: ["Modern Physics", "Atomic Physics"], image: "https://placehold.co/400x200.png", aiHint: "photoelectric effect work function planck" },
  { id: "atomic-spectra-bohr-g12", name: "Atomic Spectra & Bohr Model Interactive", grade: "12", description: "Energy levels, electron transitions, emission/absorption spectra (Balmer, Lyman, Paschen series).", icon: Atom, categories: ["Atomic Physics", "Modern Physics"], image: "https://placehold.co/400x200.png", aiHint: "atomic spectra bohr model emission absorption" },
  { id: "radioactive-decay-g12", name: "Radioactive Decay Chains Visualizer", grade: "12", description: "Interactive visualization of alpha, beta, gamma decay. Half-life simulation. Trace decay series.", icon: Radiation, categories: ["Nuclear Physics", "Modern Physics"], image: "https://placehold.co/400x200.png", aiHint: "radioactive decay half life alpha beta gamma" },
  { id: "nuclear-fission-fusion-g12", name: "Nuclear Fission & Fusion Animator", grade: "12", description: "Animated diagrams of chain reactions, energy release, conceptual reactor/stellar fusion.", icon: Atom, categories: ["Nuclear Physics", "Modern Physics"], image: "https://placehold.co/400x200.png", aiHint: "nuclear fission fusion chain reaction energy" },
  { id: "molecular-speeds-distribution-g12", name: "Molecular Speeds & Distribution", grade: "12", description: "Visualize Maxwell-Boltzmann distribution of molecular speeds in a gas. Observe effect of temperature on the distribution curve.", icon: LineChart, categories: ["Heat & Thermodynamics", "Modern Physics"], image: "https://placehold.co/400x200.png", aiHint: "maxwell boltzmann distribution molecular speeds temperature" },
  { id: "entropy-change-calculation-g12", name: "Entropy Change Calculation (Conceptual)", grade: "12", description: "Conceptual examples of entropy change in reversible and irreversible processes. Relate to the second law of thermodynamics.", icon: Shuffle, categories: ["Heat & Thermodynamics"], image: "https://placehold.co/400x200.png", aiHint: "entropy change thermodynamics reversible irreversible" },
  { id: "refrigerators-heat-pumps-g12", name: "Refrigerators & Heat Pumps", grade: "12", description: "Conceptual animation of the working cycle of refrigerators and heat pumps, illustrating energy flow and coefficient of performance.", icon: ThermometerSnowflake, categories: ["Heat & Thermodynamics"], image: "https://placehold.co/400x200.png", aiHint: "refrigerator heat pump cycle cop" },
  { id: "electric-dipole-in-electric-field-g12", name: "Electric Dipole in an Electric Field", grade: "12", description: "Visualize torque experienced by an electric dipole in a uniform electric field. Show alignment and potential energy changes.", icon: Replace, categories: ["Electrostatics"], image: "https://placehold.co/400x200.png", aiHint: "electric dipole torque potential energy field" },
  { id: "dielectric-strength-breakdown-g12", name: "Dielectric Strength & Breakdown", grade: "12", description: "Conceptual visualization of electric breakdown in insulators when the electric field exceeds dielectric strength.", icon: AlertTriangle, categories: ["Electrostatics"], image: "https://placehold.co/400x200.png", aiHint: "dielectric strength breakdown insulator electric field" },
  { id: "growth-decay-current-lr-circuit-g12", name: "Growth & Decay of Current in LR Circuit", grade: "12", description: "Plot current vs. time graphs for charging and discharging an inductor in an LR circuit. Illustrate the time constant L/R.", icon: LineChart, categories: ["Current Electricity", "Magnetism & Electromagnetism"], image: "https://placehold.co/400x200.png", aiHint: "lr circuit current growth decay time constant" },
  { id: "ac-series-rlc-circuit-impedance-triangle-g12", name: "AC Series RLC - Impedance Triangle", grade: "12", description: "Dynamically draw the impedance triangle (R, XL, XC, Z) and phasor diagram for a series RLC circuit. Show phase angle.", icon: Triangle, categories: ["Current Electricity", "Magnetism & Electromagnetism"], image: "https://placehold.co/400x200.png", aiHint: "rlc circuit impedance triangle phasor phase angle" },
  { id: "motional-emf-g12", name: "Motional EMF", grade: "12", description: "Simulate a conductor moving in a uniform magnetic field. Visualize the induced EMF and the forces on charge carriers.", icon: MoveHorizontal, categories: ["Magnetism & Electromagnetism"], image: "https://placehold.co/400x200.png", aiHint: "motional emf conductor magnetic field induced" },
  { id: "magnetic-force-parallel-conductors-g12", name: "Magnetic Force Between Parallel Conductors", grade: "12", description: "Visualize the attractive or repulsive force between two parallel current-carrying wires. Adjust current magnitudes and directions.", icon: MoveVertical, categories: ["Magnetism & Electromagnetism"], image: "https://placehold.co/400x200.png", aiHint: "magnetic force parallel wires current attraction repulsion" },
  { id: "magnetic-flux-density-visualizer-g12", name: "Magnetic Flux Density (B) Visualizer", grade: "12", description: "Visualize and calculate magnetic flux density for various current configurations (long straight wire, circular loop, solenoid).", icon: Magnet, categories: ["Magnetism & Electromagnetism"], image: "https://placehold.co/400x200.png", aiHint: "magnetic flux density b field current wire loop solenoid" },
  { id: "rutherfords-gold-foil-experiment-g12", name: "Rutherford's Gold Foil Experiment", grade: "12", description: "Animated simulation of alpha particles scattering off gold nuclei, leading to the discovery of the nucleus.", icon: Atom, categories: ["Atomic Physics", "Modern Physics"], image: "https://placehold.co/400x200.png", aiHint: "rutherford gold foil experiment alpha scattering nucleus" },
  { id: "de-broglie-wavelength-matter-waves-g12", name: "De Broglie Wavelength of Matter Waves", grade: "12", description: "Conceptual illustration relating the wavelength of particles (electrons, protons) to their momentum.", icon: Waves, categories: ["Modern Physics"], image: "https://placehold.co/400x200.png", aiHint: "de broglie wavelength matter waves momentum" },
  { id: "heisenbergs-uncertainty-principle-g12", name: "Heisenberg's Uncertainty Principle", grade: "12", description: "Conceptual illustration of the fundamental limit to the precision with which position and momentum of a particle can be known simultaneously.", icon: HelpCircle, categories: ["Modern Physics"], image: "https://placehold.co/400x200.png", aiHint: "heisenberg uncertainty principle position momentum" },
  { id: "origin-of-xrays-g12", name: "Origin of X-Rays", grade: "12", description: "Animation showing the production of Bremsstrahlung (braking radiation) and characteristic X-rays from electron bombardment of a metal target.", icon: Activity, categories: ["Atomic Physics", "Modern Physics"], image: "https://placehold.co/400x200.png", aiHint: "xray production bremsstrahlung characteristic" },
  { id: "spectrometer-spectroscope-principle-g12", name: "Spectrometer/Spectroscope Principle", grade: "12", description: "Conceptual animation showing how a prism or diffraction grating disperses light into its constituent wavelengths to form a spectrum.", icon: Projector, categories: ["Light & Optics", "Atomic Physics"], image: "https://placehold.co/400x200.png", aiHint: "spectrometer spectroscope prism diffraction grating spectrum" },
  { id: "nuclear-forces-vs-electrostatic-forces-g12", name: "Nuclear Forces vs. Electrostatic Forces", grade: "12", description: "Conceptual comparison of the strong nuclear force (attractive) and electrostatic force (repulsive between protons) within an atomic nucleus.", icon: Combine, categories: ["Nuclear Physics"], image: "https://placehold.co/400x200.png", aiHint: "nuclear forces strong electrostatic nucleus" },
  { id: "radioactive-dating-carbon14-g12", name: "Radioactive Dating (Carbon-14)", grade: "12", description: "Explain the principle of carbon-14 dating using its half-life to determine the age of ancient organic materials.", icon: CalendarClock, categories: ["Nuclear Physics"], image: "https://placehold.co/400x200.png", aiHint: "radioactive dating carbon 14 half life" },
  { id: "nuclear-fusion-in-stars-g12", name: "Nuclear Fusion in Stars", grade: "12", description: "Conceptual animation of the proton-proton chain or CNO cycle, showing how light elements fuse to form heavier elements in stars, releasing energy.", icon: Sun, categories: ["Nuclear Physics", "Modern Physics"], image: "https://placehold.co/400x200.png", aiHint: "nuclear fusion stars proton proton cno cycle" },
  { id: "geiger-muller-counter-working-g12", name: "Geiger-Müller Counter Working Principle", grade: "12", description: "Animation showing how ionizing radiation creates an electrical pulse in a GM tube, allowing detection and counting of particles.", icon: Radio, categories: ["Nuclear Physics", "Lab Skills & Instruments"], image: "https://placehold.co/400x200.png", aiHint: "geiger muller counter radiation detection ionization" },
  { id: "cloud-bubble-chamber-g12", name: "Cloud & Bubble Chamber Tracks", grade: "12", description: "Conceptual visualization of how different charged particles leave distinct tracks (straight, curved, spiraling) in cloud or bubble chambers when moving through a magnetic field.", icon: Microscope, categories: ["Nuclear Physics", "Particle Physics"], image: "https://placehold.co/400x200.png", aiHint: "cloud chamber bubble chamber particle tracks" },
  { id: "quark-confinement-g12", name: "Quark Confinement", grade: "12", description: "Conceptual illustration of why quarks are never observed in isolation and are always bound together to form hadrons (protons, neutrons).", icon: Box, categories: ["Particle Physics"], image: "https://placehold.co/400x200.png", aiHint: "quark confinement hadrons protons neutrons" },
  { id: "particle-interactions-feynman-diagrams-g12", name: "Particle Interactions (Feynman Diagrams - Simplified)", grade: "12", description: "Conceptual representation of fundamental particle interactions (e.g., electron-electron scattering via photon exchange) using simplified Feynman diagrams.", icon: GitFork, categories: ["Particle Physics"], image: "https://placehold.co/400x200.png", aiHint: "feynman diagrams particle interactions qed" },
  // Added new placeholders from the full blueprint
  { id: "simple-pendulum-shm-g11", name: "Simple Pendulum SHM", grade: "11", description: "Observe Simple Harmonic Motion of a simple pendulum. Adjust length, gravity, and initial angle (small angle approximation).", icon: MoveVertical, categories: ["Simple Harmonic Motion", "Waves & Oscillations"], image: "https://placehold.co/400x200.png", aiHint: "simple pendulum shm oscillation" },
  { id: "sig-figs-practice-g11", name: "Significant Figures Practice", grade: "11", description: "Test knowledge of significant figures rules and calculations in measurements and derived quantities.", icon: Sigma, categories: ["Measurements & Units"], image: "https://placehold.co/400x200.png", aiHint: "significant figures practice" },
  { id: "photoroom_background_removal_g11", name: "Photoroom Background Removal", grade: "11", description: "Explore how AI is used in image processing for tasks like background removal. (Conceptual, links to AI in daily life)", icon: Bot, categories: ["Modern Physics", "Electronics"], image: "https://placehold.co/400x200.png", aiHint: "ai image processing background removal" }, // Example for "AI tools"
  { id: "black-hole-spacetime-visualizer", name: "Black Hole / Spacetime Curvature Visualizer", grade: "12 / Advanced", description: "Visualizing how massive objects (stars, black holes) warp spacetime. Place masses, observe the 'gravitational well' and trajectories of nearby objects (light rays, other planets). This is conceptual, but highly engaging.", icon: Orbit, categories: ["Gravitation & Orbital Mechanics", "Modern Physics"], image: "https://placehold.co/400x200.png", aiHint: "black hole spacetime gravity relativity" },
  { id: "rocket-launch-rendezvous", name: "Rocket Launch & Orbital Rendezvous Simulator", grade: "11 / 12", description: "Launch a rocket into orbit, then attempt to dock with a space station or another spacecraft. Control thrust, orbital maneuvers, and understand concepts like orbital velocity, escape velocity, and relative motion in space.", icon: Rocket, categories: ["Dynamics & Forces", "Kinematics", "Gravitation & Orbital Mechanics"], image: "https://placehold.co/400x200.png", aiHint: "rocket launch orbit rendezvous space" }

];

/**
 * List of available quiz topics in the application.
 * This list populates the quizzes page.
 */
export const QUIZ_TOPICS = [
  {
    id: 'kinematics-g9',
    name: 'Kinematics Quiz',
    description: 'Test your understanding of motion, displacement, velocity, and acceleration.',
  },
  {
    id: 'dynamics-g9',
    name: 'Dynamics Quiz',
    description: 'Challenge yourself on Newton\'s laws, friction, and momentum.',
  },
  {
    id: 'work-energy-power-g9',
    name: 'Work, Energy & Power Quiz',
    description: 'Assess your knowledge of work, energy types, conservation, and power.',
  },
  {
    id: 'waves-sound-g10',
    name: 'Waves & Sound Quiz',
    description: 'Questions on wave properties, types of waves, sound characteristics, and phenomena.',
  },
  {
    id: 'light-optics-g10',
    name: 'Light & Optics Quiz',
    description: 'Test your understanding of reflection, refraction, lenses, mirrors, and optical instruments.',
  },
  {
    id: 'electricity-magnetism-g10',
    name: 'Electricity & Magnetism Quiz',
    description: 'Quizzes covering electrostatics, current electricity, and electromagnetism fundamentals for Grade 10.',
  },
  {
    id: 'shm-oscillations-g11',
    name: 'SHM & Oscillations Quiz',
    description: 'Questions on Simple Harmonic Motion, damped oscillations, resonance, and wave properties.',
  },
  {
    id: 'thermodynamics-g11-g12',
    name: 'G11/12: Thermodynamics Quiz',
    description: 'Assess your knowledge of heat, temperature, gas laws, and laws of thermodynamics.',
  },
  {
    id: "electrostatics-g11",
    name: "Electrostatics Quiz",
    description: "Test your understanding of electric fields, potential, Gauss's Law, and capacitors.",
  },
  {
    id: "current-electricity-g11",
    name: "Current Electricity (DC Circuits) Quiz",
    description: "Questions on Ohm's Law, Kirchhoff's Laws, Wheatstone bridge, and potentiometer.",
  },
  {
    id: "electromagnetism-g11",
    name: "Electromagnetism Quiz",
    description: "Covers magnetic fields, forces, EM induction, AC generators, and transformers.",
  },
  {
    id: 'modern-physics-g12',
    name: 'Modern Physics Quiz',
    description: 'Explore concepts from relativity, quantum mechanics (photoelectric effect, Compton effect, wave-particle duality).',
  },
  {
    id: 'atomic-nuclear-g12',
    name: 'Atomic & Nuclear Physics Quiz',
    description: 'Questions on Bohr model, spectra, X-rays, radioactivity, fission, fusion, and fundamental particles.',
  }
];

/**
 * Curriculum board identifiers and names.
 * Used for filtering mind maps and potentially other curriculum-specific content.
 */
export const CURRICULUM_BOARDS = [
  { id: "STBB", name: "Sindh Textbook Board (STBB)" },
  { id: "ptbb", name: "Punjab Textbook Board (PTBB)" },
  { id: "national", name: "National Curriculum (Pakistan)" },
  { id: "ziauddin", name: "Ziauddin University Examination Board" },
  // Add more as needed
];

/**
 * Keywords for searching settings options.
 * Used by the global search in AppShell.
 */
export const SETTINGS_SEARCHABLE_KEYWORDS: { term: string; label: string; href: string; icon?: React.ElementType }[] = [
  { term: "theme", label: "Appearance: Theme (Light/Dark)", href: "/settings", icon: SettingsIcon },
  { term: "dark mode", label: "Appearance: Dark Mode", href: "/settings", icon: SettingsIcon },
  { term: "light mode", label: "Appearance: Light Mode", href: "/settings", icon: SettingsIcon },
  { term: "fun facts", label: "Fun Physics Facts Panel", href: "/settings", icon: SettingsIcon },
  { term: "notifications", label: "Notifications Settings", href: "/settings", icon: SettingsIcon },
  { term: "offline", label: "Offline Data & Sync Settings", href: "/settings", icon: SettingsIcon },
  { term: "data sync", label: "Data & Sync Settings", href: "/settings", icon: SettingsIcon },
  // { term: "update", label: "Check for App Updates Setting", href: "/settings", icon: SettingsIcon }, // Commented out as it's an action
  { term: "download materials", label: "Download All Materials for Grade", href: "/settings", icon: DownloadCloud },
];