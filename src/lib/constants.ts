
/**
 * @fileOverview Defines constant values used throughout the application.
 * This includes navigation structures, lists of topics for simulations and quizzes,
 * application metadata, searchable keywords for settings, and curriculum board information.
 */
import {
  LayoutDashboard, Orbit, BookOpen, ListChecks, MessageSquare, Settings as SettingsIcon,
  UserCog, Lightbulb, Brain, Map, Ruler, Thermometer, Scale, ClockIcon, Waves, Heater, Sigma,
 BatteryCharging, MoveHorizontal, TrendingUp, Atom, FileEdit, CalendarDays, ClipboardList, BookCopy, PersonStanding,
  NotebookText, UserCircle, FileArchive, TestTubeDiagonal, Beaker, Edit, Link2, FileText as FileTextIcon,
  SearchIcon, Timer, Weight, Replace, HelpCircle, MoveVertical, Speaker, Projector, Zap,
  Network, Binary, Pipette, Magnet, LineChart, Move, Anchor, RefreshCw, GitCommitHorizontal, Sun,
  Info, UsersRoundIcon, BookMarked, Telescope, GraduationCap, FlaskConical, UsersRound, Globe, AlertTriangle,
  Bug, Droplets, GripVertical, Activity, Radiation, SigmaSquare, Route, Combine, TestTube,
  RadioTower, Wind, Cable, Cog, Aperture, BrainCircuit, AlignCenter, Album, BookKey,
  FunctionSquare, Sparkles, Rocket, DraftingCompass, Microscope, SlidersHorizontal,
  Recycle, Milestone, SquareAsterisk, Dna, Bot, GitFork, BinaryIcon, AreaChart, ArrowDown,
  Box, Car, CircleDot, Hand, Heater as HeaterIcon, Leaf, Layers, Music2, MinusSquare,
  Plug, Radio, Satellite, Ship, BatteryWarning,
  Square, SquareRadical, StretchHorizontal, ThermometerSnowflake, Triangle,
  Users as UsersIcon,
  LogIn, LogOut,
  KeyRound, Eye, EyeOff, WifiOff, XCircle, CalendarClock, Shuffle,
  UserPlus, BarChart3, Percent, CheckCircle, History, Smartphone, Laptop, Signal,
  DownloadCloud, Notebook as NotebookIcon, Share2,
  LocateIcon, ZoomInIcon, ZoomOutIcon,
  Archive, // Added
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
  {
    href: '#', // Added href
    label: 'Learn Core', icon: BookOpen, // Good encompassing icon
    subItems: [
      { href: '/', label: 'Dashboard', icon: LayoutDashboard, matchExact: true },
      { href: '/study-material', label: 'Study Materials', icon: BookMarked }, // BookMarked is good
      { href: '/simulations', label: 'Simulations', icon: Orbit },
      { href: '/quizzes', label: 'Quizzes', icon: ListChecks },
      { href: '/assignments', label: 'Assignments', icon: Edit },
    ],
  },
  {
    href: '#', // Added href
    label: 'Explore & Practice', icon: Sparkles, // Sparkles is fitting for exploration
    subItems: [
      { href: '/learn-with-ai', label: 'AI Learning Assistant', icon: BrainCircuit },
      { href: '/mind-maps', label: 'Concept Maps', icon: Map }, // Map is good
      { href: '/physics-timeline', label: 'Physics Milestones', icon: Milestone }, // Milestone is perfect
      { href: '/exam-practice', label: 'Exam Practice', icon: FileArchive }, // FileArchive works
      { href: '/practicals', label: 'Practical Work', icon: Beaker },
      { href: '/mdcat-preparation', label: 'MDCAT Prep', icon: TestTubeDiagonal },
    ],
  },
  {
    href: '#', // Added href
    label: 'Discover Physics World', icon: Globe, // Globe is excellent
    subItems: [
      { href: '/philosophical-physics', label: 'Physics & Philosophy', icon: Brain },
      { href: '/current-research', label: 'Current Research', icon: Telescope }, // Telescope is good
      { href: '/university-pathways', label: 'University Pathways', icon: GraduationCap }, // GraduationCap is perfect
      { href: '/lab-equipment', label: 'Lab Instruments', icon: FlaskConical },
    ],
  },
  {
    href: '#', // Added href
    label: 'App & Support', icon: HelpCircle, // HelpCircle is standard and good
    subItems: [
      { href: '/about-us', label: 'About PhysicsLab', icon: Info },
      { href: '/feedback', label: 'Help & Feedback', icon: MessageSquare }, // Changed from HelpCircle to avoid duplicate with parent
      { href: '/settings', label: 'Settings', icon: SettingsIcon },
    ],
  },
  {
    href: '/teacher-dashboard', // This one is a direct link, not just a label for a sub-menu
    label: 'Teacher Panel',
    icon: UserCog,
    subItems: [
      // ... (teacher sub-items are good)
      { href: '/teacher-dashboard/question-papers', label: 'Question Paper Generator', icon: FileTextIcon }, // Good new addition
    ]
  },
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
 * List of quiz topics.
 */
export const QUIZ_TOPICS: { id: string; name: string; description?: string; icon?: React.ElementType }[] = [
  { id: 'kinematics-g9', name: 'Kinematics Basics (G9)', description: "Test your understanding of motion, speed, velocity, and acceleration.", icon: TrendingUp },
  { id: 'forces-g9', name: 'Forces & Newton\'s Laws (G9)', description: "Explore concepts of force, net force, and Newton's laws.", icon: Move },
  { id: 'energy-g9', name: 'Work, Energy & Power (G9)', description: "Questions on kinetic energy, potential energy, work done, and power.", icon: Zap },
  { id: 'waves-g10', name: 'Wave Properties (G10)', description: "Understand amplitude, wavelength, frequency, and wave speed.", icon: Waves },
  { id: 'sound-g10', name: 'Sound Waves (G10)', description: "Explore properties of sound, echo, and ultrasound.", icon: Speaker },
  { id: 'optics-g10', name: 'Geometrical Optics (G10)', description: "Test your knowledge on lenses, mirrors, and image formation.", icon: Projector },
  { id: 'electrostatics-g10', name: 'Electrostatics (G10)', description: "Concepts of electric charge, field, and potential.", icon: Zap },
  { id: 'current-electricity-g10', name: 'Current Electricity (G10)', description: "Ohm's law, circuits, resistance, and power.", icon: Network },
  { id: 'electromagnetism-g10', name: 'Electromagnetism (G10)', description: "Magnetic fields, forces, and electromagnetic induction.", icon: Magnet },
  { id: 'shm-g11', name: 'Simple Harmonic Motion (G11)', description: "Oscillations, pendulums, and spring-mass systems.", icon: Waves },
  { id: 'thermodynamics-g12', name: 'Thermodynamics (G12)', description: "Gas laws, heat engines, and laws of thermodynamics.", icon: Thermometer },
  { id: 'modern-physics-g12', name: 'Modern Physics (G12)', description: "Relativity, quantum physics, and nuclear physics.", icon: Atom },
];

/**
 * List of available interactive simulations in the application.
 */
export const SIMULATION_TOPICS: SimulationTopic[] = [
  // Grade 9
  { id: "measurement-tool-interactive-g9", name: "Measurement Tool Interactive", grade: "9", description: "Practice using Vernier calipers, Micrometer Screw Gauge, rulers, and protractors. Interactive reading and error analysis.", icon: DraftingCompass, categories: ["Measurements & Units", "Lab Skills & Instruments"], image: "https://placehold.co/400x200.png", aiHint: "measurement tools practice" },
  { id: "sig-figs-scientific-notation-g9", name: "Significant Figures & Scientific Notation Practice", grade: "9", description: "Interactive exercises for mastering significant figures in readings/calculations and scientific notation, with immediate feedback.", icon: SigmaSquare, categories: ["Measurements & Units"], image: "https://placehold.co/400x200.png", aiHint: "significant figures scientific notation" },
  { id: "motion-graphing-lab-g9", name: "1D Motion Graphing Lab", grade: "9", description: "Interactive control of motion (position, velocity, acceleration), auto-generated P-T, V-T, A-T graphs. Match graphs to motion scenarios.", icon: LineChart, categories: ["Kinematics"], image: "https://placehold.co/400x200.png", aiHint: "motion graphs pva" },
  { id: "phet-projectile-motion-g9", name: "PhET: Projectile Motion", grade: "9", description: "Launch objects (cannonballs, etc.) with adjustable angle, initial speed, mass. Observe trajectory. Toggle air resistance. PhysicsLab Enhancement: Vector components, 'Hit the Target' game, energy analysis graph.", icon: Orbit, categories: ["Kinematics", "Dynamics & Forces"], image: "https://placehold.co/400x200.png", aiHint: "projectile motion trajectory" },
  { id: "vectors-lab-g9", name: "Vectors Addition/Subtraction Lab", grade: "9", description: "Interactively add and subtract vectors using graphical (head-to-tail) and analytical (component) methods. Drag & drop vectors, see resultant.", icon: GitFork, categories: ["Kinematics", "Dynamics & Forces", "Vectors"], image: "https://placehold.co/400x200.png", aiHint: "vector addition subtraction" },
  { id: "phet-forces-motion-basics-g9", name: "PhET: Forces and Motion Basics", grade: "9", description: "Explore net force, friction, and Newton's laws. Apply forces, observe acceleration, analyze free-body diagrams. PhysicsLab Enhancement: Interactive FBDs, net force calculation, friction coefficient adjustment, 'Predict the Motion' challenge.", icon: Move, categories: ["Dynamics & Forces"], image: "https://placehold.co/400x200.png", aiHint: "newton laws force friction" },
  { id: "momentum-collisions-lab-g9", name: "Momentum & Collisions Lab", grade: "9", description: "Simulate 1D/2D elastic/inelastic collisions. Observe conservation of momentum and KE changes. Adjustable masses and initial velocities.", icon: Combine, categories: ["Dynamics & Forces"], image: "https://placehold.co/400x200.png", aiHint: "momentum collisions conservation" },
  { id: "uniform-circular-motion-g9", name: "Uniform Circular Motion Simulator", grade: "9", description: "Explore centripetal force, velocity, and acceleration in uniform circular motion. Adjust radius, speed, and mass. Visualization of vectors.", icon: RefreshCw, categories: ["Rotational & Circular Motion", "Dynamics & Forces"], image: "https://placehold.co/400x200.png", aiHint: "circular motion centripetal force" },
  { id: "phet-energy-skate-park-basics-g9", name: "PhET: Energy Skate Park Basics", grade: "9", description: "Demonstrates conservation of mechanical energy (KE & PE) for a skateboarder. PhysicsLab Enhancement: Replicate track builder, energy bar graphs (KE, PE, Thermal, Total), friction control, numerical energy display, 'Design a Rollercoaster' mode.", icon: PersonStanding, categories: ["Work, Energy & Power"], image: "https://placehold.co/400x200.png", aiHint: "energy skate park conservation" },
  { id: "work-energy-lab-g9", name: "Work-Energy Transformation Lab", grade: "9", description: "Investigate KE, PE, work done by/against friction, and power in scenarios like inclined planes and spring systems.", icon: Route, categories: ["Work, Energy & Power"], image: "https://placehold.co/400x200.png", aiHint: "work energy power lab" },
  { id: "simple-machines-levers-pulleys-g9", name: "Levers & Pulleys Efficiency Analyzer", grade: "9", description: "Analyze mechanical advantage (MA) and efficiency of interactive levers and pulley systems with adjustable loads and efforts.", icon: Anchor, categories: ["Simple Machines", "Work, Energy & Power"], image: "https://placehold.co/400x200.png", aiHint: "levers pulleys simple machines" },
  { id: "simple-machines-inclined-plane-g9", name: "Inclined Plane & Screw Mechanism", grade: "9", description: "Interactively manipulate incline angle and screw pitch to understand work, Mechanical Advantage (MA), and efficiency.", icon: Album, categories: ["Simple Machines"], image: "https://placehold.co/400x200.png", aiHint: "inclined plane screw simple machines" },
  { id: "universal-gravitation-explorer-g9", name: "Law of Universal Gravitation Explorer", grade: "9", description: "Explore gravitational force between interactive planets/masses. Adjust masses and distance, observe force vectors. Demonstrates F = Gm₁m₂/r².", icon: UsersRound, categories: ["Gravitation & Orbital Mechanics"], image: "https://placehold.co/400x200.png", aiHint: "gravitation universal law planets" },
  { id: "density-buoyancy-lab-g9", name: "Density & Buoyancy Lab", grade: "9", description: "Submerge objects of different materials/volumes, measure buoyant force, calculate density. Explore Archimedes' Principle, flotation.", icon: Anchor, categories: ["Properties of Matter & Fluids"], image: "https://placehold.co/400x200.png", aiHint: "density buoyancy archimedes" },
  { id: "elasticity-hookes-law-g9", name: "Hooke's Law & Stress-Strain Lab", grade: "9", description: "Investigate force-extension for springs and wires. Plot load-extension and stress-strain curves. Determine spring constant and Young's Modulus.", icon: Weight, categories: ["Elasticity", "Properties of Matter & Fluids"], image: "https://placehold.co/400x200.png", aiHint: "hookes law stress strain elasticity" },
  { id: "phet-states-of-matter-basics-g9", name: "PhET: States of Matter Basics", grade: "9", description: "Visualizes atoms/molecules in solid, liquid, and gas phases. Change temperature/pressure to observe phase transitions. PhysicsLab Enhancement: Atomic-level visualization, phase change animation, pressure/volume link for gases, evaporation focus.", icon: Atom, categories: ["Heat & Thermodynamics", "Properties of Matter & Fluids"], image: "https://placehold.co/400x200.png", aiHint: "particles solid liquid gas" },
  { id: "thermal-expansion-g9", name: "Thermal Expansion Simulator", grade: "9", description: "Explore linear, area, and volume expansion of solids/liquids by heating materials and observing changes.", icon: Thermometer, categories: ["Heat & Thermodynamics"], image: "https://placehold.co/400x200.png", aiHint: "thermal expansion linear area volume" },
  { id: "heat-transfer-modes-g9", name: "Heat Transfer Modes Visualizer", grade: "9", description: "Animated microscopic/macroscopic examples of conduction, convection, and radiation.", icon: HeaterIcon, categories: ["Heat & Thermodynamics"], image: "https://placehold.co/400x200.png", aiHint: "heat transfer conduction convection radiation" },
  { id: "specific-heat-calculator-g9", name: "Specific Heat & Heat Capacity Calculator", grade: "9", description: "Interactive problem-solver for Q=mcΔT, allowing users to find any variable.", icon: SigmaSquare, categories: ["Heat & Thermodynamics"], image: "https://placehold.co/400x200.png", aiHint: "specific heat capacity calculator" },
  { id: "latent-heat-heating-curve-g9", name: "Latent Heat & Phase Change Heating Curve", grade: "9", description: "Interactive graph of heating ice to steam, explaining phase transitions and latent heat.", icon: LineChart, categories: ["Heat & Thermodynamics"], image: "https://placehold.co/400x200.png", aiHint: "latent heat phase change heating curve" },
  { id: "magnetism-basics-g9", name: "Magnetism Basics Explorer", grade: "9", description: "Explore temporary vs. permanent magnets, plot magnetic fields (bar magnet, Earth), and visualize paramagnetic/diamagnetic materials.", icon: Magnet, categories: ["Magnetism & Electromagnetism"], image: "https://placehold.co/400x200.png", aiHint: "magnetism fields poles" },
  { id: "measurement-errors-visualizer-g9", name: "Measurement Errors Visualizer", grade: "9", description: "Simulate and differentiate systematic vs. random errors. Visualize least count error.", icon: AlertTriangle, categories: ["Measurements & Units", "Lab Skills & Instruments"] },
  { id: "significant-figures-rules-practice-g9", name: "Significant Figures Rules Practice", grade: "9", description: "Interactive exercises on identifying significant figures in readings and calculations.", icon: SigmaSquare, categories: ["Measurements & Units", "Lab Skills & Instruments"] },
  { id: "relative-velocity-scenarios-g9", name: "Relative Velocity Scenarios", grade: "9", description: "Interactive animation of relative motion for boats in rivers, planes in wind. Users control velocities and observe resultant paths.", icon: Ship, categories: ["Kinematics", "Vectors"] },
  { id: "motion-under-gravity-g9", name: "Motion Under Gravity (Free Fall)", grade: "9", description: "Simulate objects falling with/without air resistance, showing increasing velocity and effect of air resistance leading to terminal velocity.", icon: ArrowDown, categories: ["Kinematics", "Dynamics & Forces"] },
  { id: "forces-as-vectors-composer-g9", name: "Forces as Vectors Composer", grade: "9", description: "Interactive tool to resolve forces into components and find resultant force. Add multiple forces and visualize their sum.", icon: GitFork, categories: ["Dynamics & Forces", "Vectors"] },
  { id: "inertia-demonstration-g9", name: "Inertia Demonstration", grade: "9", description: "Animation showing an object's resistance to change in motion, e.g., coin on cardboard, passengers in a braking bus.", icon: Box, categories: ["Dynamics & Forces"] },
  { id: "action-reaction-pairs-visualizer-g9", name: "Action-Reaction Pairs Visualizer", grade: "9", description: "Identifying and visualizing Newton's 3rd Law pairs in various scenarios (e.g., person pushing a wall, rocket propulsion).", icon: UsersIcon, categories: ["Dynamics & Forces"] },
  { id: "momentum-change-impulse-g9", name: "Momentum Change & Impulse", grade: "9", description: "Force vs. time graph, calculating impulse (area under graph), linking to momentum change.", icon: AreaChart, categories: ["Dynamics & Forces"] },
  { id: "power-calculation-scenarios-g9", name: "Power Calculation Scenarios", grade: "9", description: "Interactive problems, e.g., lifting weights, running up stairs, showing work done over time.", icon: TrendingUp, categories: ["Work, Energy & Power"] },
  { id: "energy-forms-transformation-examples-g9", name: "Energy Forms Transformation Examples", grade: "9", description: "Animation of energy changing forms: chemical to electrical to light, etc.", icon: Recycle, categories: ["Work, Energy & Power"] },
  { id: "wheel-axle-principle-g9", name: "Wheel & Axle Principle", grade: "9", description: "Interactive visualization of its working and mechanical advantage.", icon: CircleDot, categories: ["Simple Machines"] },
  { id: "screw-as-inclined-plane-g9", name: "Screw as Inclined Plane", grade: "9", description: "Unrolling a screw to visualize it as an inclined plane.", icon: MinusSquare, categories: ["Simple Machines"] },
  { id: "gravitational-field-strength-variation-g9", name: "Gravitational Field Strength Variation", grade: "9", description: "Graph/visualizer of 'g' with altitude/depth.", icon: LineChart, categories: ["Gravitation & Orbital Mechanics"] },
  { id: "weightlessness-in-orbit-g9", name: "Weightlessness in Orbit", grade: "9", description: "Conceptual animation of free-fall causing apparent weightlessness.", icon: Orbit, categories: ["Gravitation & Orbital Mechanics"] },
  { id: "pressure-in-solids-fluids-g9", name: "Pressure in Solids & Fluids", grade: "9", description: "Conceptual visualization of force distribution, e.g., sharp vs. blunt object.", icon: Droplets, categories: ["Properties of Matter & Fluids"] },
  { id: "liquid-level-communicating-vessels-g9", name: "Liquid Level in Communicating Vessels", grade: "9", description: "Demonstration of equal pressure at same depth.", icon: Layers, categories: ["Properties of Matter & Fluids"] },
  { id: "types-of-stress-strain-g9", name: "Types of Stress & Strain", grade: "9", description: "Visual examples of tensile, compressive, shear stress/strain.", icon: StretchHorizontal, categories: ["Elasticity"] },
  { id: "ductile-vs-brittle-materials-g9", name: "Ductile vs. Brittle Materials", grade: "9", description: "Stress-strain curve comparison for different materials.", icon: LineChart, categories: ["Elasticity"] },
  { id: "bimetallic-strip-animator-g9", name: "Bimetallic Strip Animator", grade: "9", description: "Demonstration of thermal expansion causing bending, used in thermostats.", icon: Layers, categories: ["Heat & Thermodynamics"] },
  { id: "factors-affecting-evaporation-g9", name: "Factors Affecting Evaporation", grade: "9", description: "Interactive visualization of surface area, temperature, wind, nature of liquid effects.", icon: Wind, categories: ["Heat & Thermodynamics"] },
  { id: "heating-curve-of-water-g9", name: "Heating Curve of Water", grade: "9", description: "Detailed plot with phase change plateaus, showing energy input vs. temperature.", icon: LineChart, categories: ["Heat & Thermodynamics"] },

  // Grade 10
  { id: "phet-pendulum-lab-g10", name: "PhET: Pendulum Lab", grade: "10", description: "Investigate pendulum period by changing length, mass, gravity, and initial angle. PhysicsLab Enhancement: Graphical analysis (angle vs. time, energy vs. time), 'Unknown Gravity' challenge.", icon: MoveVertical, categories: ["Simple Harmonic Motion", "Waves & Oscillations"], image: "https://placehold.co/400x200.png", aiHint: "pendulum lab phet period shm" },
  { id: "phet-wave-on-a-string-g10", name: "PhET: Wave on a String", grade: "10", description: "Creates transverse waves. Adjust amplitude, frequency, damping, tension. PhysicsLab Enhancement: Display wave properties, explore standing waves (fixed/loose ends), visualize superposition.", icon: Waves, categories: ["Waves & Oscillations"], image: "https://placehold.co/400x200.png", aiHint: "wave string phet transverse standing" },
  { id: "phet-sound-waves-g10", name: "PhET: Sound Waves", grade: "10", description: "Visualizes sound waves as pressure variations. Control frequency (pitch) and amplitude (loudness). PhysicsLab Enhancement: Particle vibration animation, synchronized pressure/displacement graphs, multiple source interference.", icon: Speaker, categories: ["Sound", "Waves & Oscillations"], image: "https://placehold.co/400x200.png", aiHint: "sound waves phet pressure pitch loudness" },
  { id: "phet-bending-light-g10", name: "PhET: Bending Light (Refraction & Reflection)", grade: "10", description: "Explore how light bends. Shine a laser through various media. PhysicsLab Enhancement: Flexible media with adjustable refractive indices, interactive ray tracing, Snell's Law calculator, critical angle visualization.", icon: Pipette, categories: ["Light & Optics"], image: "https://placehold.co/400x200.png", aiHint: "bending light phet refraction reflection" },
  { id: "phet-geometric-optics-g10", name: "PhET: Geometric Optics (Lenses & Mirrors)", grade: "10", description: "Helps visualize ray tracing for lenses and mirrors. PhysicsLab Enhancement: Interactive tracing, image properties display, lens/mirror equation tool, compound systems.", icon: Projector, categories: ["Light & Optics"], image: "https://placehold.co/400x200.png", aiHint: "geometric optics phet lenses mirrors" },
  { id: "phet-balloons-static-electricity-g10", name: "PhET: Balloons & Static Electricity", grade: "10", description: "Demonstrates charging by friction and induction. PhysicsLab Enhancement: Microscopic electron movement visualization, charge redistribution animation, interactive forces between multiple charged objects.", icon: Zap, categories: ["Electrostatics"], image: "https://placehold.co/400x200.png", aiHint: "balloons static electricity phet charge" },
  { id: "phet-circuit-construction-kit-dc-g10", name: "PhET: Circuit Construction Kit (DC)", grade: "10", description: "Build DC circuits with wires, batteries, resistors, bulbs, etc. PhysicsLab Enhancement: Visual current flow, functional meters, Ohm's Law/Kirchhoff's exploration, 'Build a Circuit' challenge.", icon: Network, categories: ["Current Electricity"], image: "https://placehold.co/400x200.png", aiHint: "dc circuit phet builder ohms law" },
  { id: "shm-lab-g10", name: "Simple Harmonic Motion (SHM) Lab", grade: "10", description: "Explore SHM with spring-mass and simple pendulum. View displacement, velocity, acceleration graphs, and energy transformation. Toggle damping.", icon: Waves, categories: ["Simple Harmonic Motion", "Waves & Oscillations"]},
  { id: "wave-types-visualizer-g10", name: "Types of Waves Visualizer", grade: "10", description: "Demonstrate properties of transverse and longitudinal waves (amplitude, wavelength, frequency, speed).", icon: Waves, categories: ["Waves & Oscillations"]},
  { id: "wave-phenomena-g10", name: "Wave Phenomena Simulator", grade: "10", description: "Visualize superposition, 2D interference, diffraction, and standing waves with adjustable sources and patterns.", icon: Waves, categories: ["Waves & Oscillations"]},
  { id: "sound-propagation-g10", name: "Sound Wave Propagation Animator", grade: "10", description: "Animate pressure/displacement variations for sound waves. Adjust pitch (frequency) and loudness (amplitude).", icon: Speaker, categories: ["Sound", "Waves & Oscillations"]},
  { id: "resonance-musical-instruments-g10", name: "Resonance & Musical Instruments", grade: "10", description: "Show vibrating strings/air columns, formation of standing waves, fundamental frequencies & harmonics.", icon: Music2, categories: ["Sound", "Waves & Oscillations"]},
  { id: "reflection-lab-g10", name: "Reflection Lab (Plane Mirrors)", grade: "10", description: "Interactive incident/reflected rays for plane mirrors. Verify laws of reflection.", icon: BookKey, categories: ["Light & Optics"]},
  { id: "refraction-snells-law-g10", name: "Refraction & Snell's Law Lab", grade: "10", description: "Simulate light bending through media. Adjust angle, refractive index. Observe critical angle & Total Internal Reflection (TIR).", icon: Pipette, categories: ["Light & Optics"]},
  { id: "optical-instruments-g10", name: "Optical Instruments Explorer", grade: "10", description: "Ray tracing for simple microscope, compound microscope, and astronomical telescope. Image formation.", icon: Microscope, categories: ["Light & Optics"]},
  { id: "electric-charges-forces-g10", name: "Electric Charges & Forces Lab", grade: "10", description: "Simulate charging by friction/induction, visualize Coulomb's Law, field lines, and force vectors.", icon: Zap, categories: ["Electrostatics"]},
  { id: "electric-potential-energy-g10", name: "Electric Potential & Potential Energy", grade: "10", description: "Move test charges in electric fields. Visualize work done, potential difference, ΔPE.", icon: BatteryCharging, categories: ["Electrostatics"]},
  { id: "resistivity-factors-g10", name: "Resistivity & Factors Affecting Resistance", grade: "10", description: "Interactive wire properties (material, length, area), resistance calculation.", icon: Cable, categories: ["Current Electricity"]},
  { id: "household-wiring-g10", name: "Household Wiring Diagram", grade: "10", description: "Interactive circuit diagram of household parallel wiring, safety features (fuses, circuit breakers, earth wire).", icon: Plug, categories: ["Current Electricity"]},
  { id: "magnetic-field-visualizer-g10", name: "Magnetic Field Visualizer (Magnets & Wires)", grade: "10", description: "Visualize magnetic field lines around bar magnets, and current-carrying wires (straight, loop, solenoid). Compass deflection.", icon: Magnet, categories: ["Magnetism & Electromagnetism"]},
  { id: "force-on-conductor-charge-g10", name: "Force on Conductor/Charge (Lorentz Force)", grade: "10", description: "Demonstrate directional rule (Fleming's LHR) and display force vector. Adjust B, I, L, q, v.", icon: GripVertical, categories: ["Magnetism & Electromagnetism"]},
  { id: "dc-motor-animator-g10", name: "DC Motor Principle Animator", grade: "10", description: "Animate the working of a simple DC motor, showing coil rotation in magnetic field and commutator action.", icon: RefreshCw, categories: ["Magnetism & Electromagnetism"]},
  { id: "energy-in-shm-animator-g10", name: "Energy in SHM Animator", grade: "10", description: "Kinetic vs. Potential energy exchange in mass-spring system over a cycle.", icon: LineChart, categories: ["Simple Harmonic Motion", "Work, Energy & Power"] },
  { id: "properties-of-waves-g10", name: "Properties of Waves", grade: "10", description: "Interactive diagram to identify crest, trough, wavelength, amplitude, period.", icon: DraftingCompass, categories: ["Waves & Oscillations"] },
  { id: "principle-of-superposition-g10", name: "Principle of Superposition (Constructive/Destructive)", grade: "10", description: "Visualizing two waves combining.", icon: Combine, categories: ["Waves & Oscillations"] },
  { id: "factors-affecting-speed-of-sound-g10", name: "Factors Affecting Speed of Sound", grade: "10", description: "Conceptual explanation/visualization of temperature, medium density effects.", icon: Thermometer, categories: ["Sound"] },
  { id: "echolocation-principle-g10", name: "Echolocation Principle", grade: "10", description: "Animation showing sound waves reflecting, calculating distance.", icon: Milestone, categories: ["Sound"] },
  { id: "resonance-in-air-columns-g10", name: "Resonance in Air Columns", grade: "10", description: "Animation showing vibrating air columns in open/closed pipes, node/antinode formation.", icon: Speaker, categories: ["Sound", "Waves & Oscillations"] },
  { id: "image-formation-plane-mirror-g10", name: "Image Formation by Plane Mirror", grade: "10", description: "Ray tracing, virtual image formation, properties.", icon: Square, categories: ["Light & Optics"] },
  { id: "spherical-chromatic-aberration-g10", name: "Spherical & Chromatic Aberration", grade: "10", description: "Conceptual animation of lens/mirror defects.", icon: Aperture, categories: ["Light & Optics"] },
  { id: "magnifying-glass-animator-g10", name: "Magnifying Glass Animator", grade: "10", description: "Ray tracing for a simple convex lens as a magnifier.", icon: ZoomInIcon, categories: ["Light & Optics"] },
  { id: "gold-leaf-electroscope-function-g10", name: "Gold Leaf Electroscope Function", grade: "10", description: "Animation of charging by contact/induction, leaf deflection.", icon: Leaf, categories: ["Electrostatics", "Lab Skills & Instruments"] },
  { id: "capacitor-as-energy-storage-g10", name: "Capacitor as Energy Storage Device", grade: "10", description: "Visualizing charge accumulation and energy storage.", icon: BatteryCharging, categories: ["Electrostatics", "Current Electricity"] },
  { id: "emf-vs-potential-difference-g10", name: "EMF vs. Potential Difference", grade: "10", description: "Conceptual comparison using a circuit analogy.", icon: BatteryCharging, categories: ["Current Electricity"] },
  { id: "internal-resistance-battery-g10", name: "Internal Resistance of Battery", grade: "10", description: "Circuit simulation showing voltage drop across internal resistance.", icon: BatteryWarning, categories: ["Current Electricity"] },
  { id: "joules-law-of-heating-g10", name: "Joule's Law of Heating", grade: "10", description: "Current, resistance, time affecting heat produced in a resistor.", icon: HeaterIcon, categories: ["Current Electricity", "Heat & Thermodynamics"] },
  { id: "magnetic-field-current-conductor-g10", name: "Magnetic Field (Current Conductors)", grade: "10", description: "3D visualization, Right-Hand Rule for straight wires, loops, solenoids.", icon: Magnet, categories: ["Magnetism & Electromagnetism"] },
  { id: "electromagnet-construction-g10", name: "Electromagnet Construction", grade: "10", description: "Interactive build, varying turns, current, core material.", icon: Magnet, categories: ["Magnetism & Electromagnetism"] },
  { id: "magnetic-levitation-principle-g10", name: "Magnetic Levitation Principle", grade: "10", description: "Simple demonstration using opposing magnetic fields.", icon: Magnet, categories: ["Magnetism & Electromagnetism"] },
  { id: "flemings-left-hand-rule-animator-g10", name: "Fleming's Left-Hand Rule Animator", grade: "10", description: "Interactive tool for force direction on current/charge in a magnetic field.", icon: Hand, categories: ["Magnetism & Electromagnetism"] },

  // Grade 11
  { id: "phet-forces-motion-friction-g11", name: "PhET: Forces and Motion - Friction", grade: "11", description: "Explore static and kinetic friction. PhysicsLab Enhancement: Detailed force vectors, adjustable surfaces/coefficients, Applied Force vs. Friction Force graphs.", icon: GripVertical, categories: ["Dynamics & Forces"], image: "https://placehold.co/400x200.png", aiHint: "friction phet forces static kinetic" },
  { id: "phet-energy-skate-park-work-g11", name: "PhET: Energy Skate Park - Work & Energy", grade: "11", description: "Explore work and energy transformations with external forces. PhysicsLab Enhancement: External work visualization, instantaneous power display, 'Power Up' challenge.", icon: PersonStanding, categories: ["Work, Energy & Power"], image: "https://placehold.co/400x200.png", aiHint: "energy skate park phet work power" },
  { id: "phet-ladybug-revolution-g11", name: "PhET: Ladybug Revolution (Rotational)", grade: "11", description: "Explore angular position, velocity, and acceleration. PhysicsLab Enhancement: Clear vector visualization, graphs, 'Break the String' challenge.", icon: Bug, categories: ["Rotational & Circular Motion"], image: "https://placehold.co/400x200.png", aiHint: "ladybug revolution phet rotational angular" },
  { id: "phet-my-solar-system-g11", name: "PhET: My Solar System (Gravitation)", grade: "11", description: "N-body gravitational simulator. PhysicsLab Enhancement: Add multiple bodies, visualize dynamic gravitational fields, display orbital elements, 'Stable Orbit' challenge.", icon: Orbit, categories: ["Gravitation & Orbital Mechanics"], image: "https://placehold.co/400x200.png", aiHint: "solar system phet gravity nbody orbit" },
  { id: "phet-fluid-pressure-flow-g11", name: "PhET: Fluid Pressure and Flow", grade: "11", description: "Explore pressure, buoyancy, and fluid flow. PhysicsLab Enhancement: Pressure visualization, buoyancy experiments, Pascal's Principle, Bernoulli's Principle animation.", icon: Droplets, categories: ["Properties of Matter & Fluids"], image: "https://placehold.co/400x200.png", aiHint: "fluid pressure flow phet buoyancy bernoulli" },
  { id: "vector-analysis-lab-g11", name: "Vector Analysis Lab", grade: "11", description: "Interactive tool for vector addition/subtraction using perpendicular components. Explore dot product and cross product concepts visually (2D/3D).", icon: GitFork, categories: ["Vectors", "Kinematics", "Dynamics & Forces"] },
  { id: "forces-in-equilibrium-g11", name: "Forces in Equilibrium", grade: "11", description: "Simulate concurrent forces acting on a point. Adjust force magnitudes and angles to achieve equilibrium. Verify Lami's Theorem.", icon: Triangle, categories: ["Dynamics & Forces", "Vectors"] },
  { id: "gravitational-potential-escape-velocity-g11", name: "Gravitational Potential & Escape Velocity", grade: "11", description: "Visualize gravitational potential field around a mass. Calculate and simulate escape velocity for different celestial bodies.", icon: Rocket, categories: ["Gravitation & Orbital Mechanics", "Work, Energy & Power"] },
  { id: "power-calculation-efficiency-g11", name: "Power Calculation & Efficiency", grade: "11", description: "Interactive scenarios for calculating power (e.g., motor lifting a load, person climbing stairs). Analyze efficiency and energy losses.", icon: TrendingUp, categories: ["Work, Energy & Power"] },
  { id: "torque-rotational-equilibrium-g11", name: "Torque & Rotational Equilibrium", grade: "11", description: "Apply forces at different points on a rigid body (e.g., a beam on a pivot). Adjust forces and distances to achieve rotational equilibrium. Visualize torque vectors.", icon: Replace, categories: ["Rotational & Circular Motion", "Dynamics & Forces"] },
  { id: "angular-kinematics-g11", name: "Angular Kinematics", grade: "11", description: "Simulate a rotating disc with a point on its edge. Visualize and graph angular displacement, angular velocity, and angular acceleration.", icon: RefreshCw, categories: ["Rotational & Circular Motion"] },
  { id: "moment-of-inertia-angular-momentum-g11", name: "Moment of Inertia & Angular Momentum", grade: "11", description: "Visualize moment of inertia for different shapes. Simulate conservation of angular momentum (e.g., ice skater, spinning platform with changing mass distribution).", icon: Album, categories: ["Rotational & Circular Motion"] },
  { id: "real-world-centripetal-force-g11", name: "Real-world Centripetal Force", grade: "11", description: "Analyze forces in banking of roads (cars turning) and vertical circular motion (e.g., bucket of water, rollercoaster loop). Visualize force components.", icon: Car, categories: ["Rotational & Circular Motion", "Dynamics & Forces"] },
  { id: "satellite-motion-kepler-g11", name: "Satellite Motion & Kepler's Laws", grade: "11", description: "Simulate satellite orbits (circular and elliptical). Visualize Kepler's Laws (areas, periods). Adjustable orbital parameters.", icon: Satellite, categories: ["Gravitation & Orbital Mechanics"] },
  { id: "surface-tension-capillarity-g11", name: "Surface Tension & Capillarity", grade: "11", description: "Visualize molecular forces causing surface tension. Animate droplet formation, meniscus in a capillary tube, and insects walking on water.", icon: TestTube, categories: ["Properties of Matter & Fluids"] },
  { id: "damped-forced-oscillations-g11", name: "Damped & Forced Oscillations", grade: "11", description: "Observe amplitude vs. time for damped oscillations. Apply a driving force with variable frequency to demonstrate resonance.", icon: Waves, categories: ["Simple Harmonic Motion", "Waves & Oscillations"] },
  { id: "doppler-effect-animator-g11", name: "Doppler Effect Animator", grade: "11", description: "Animate moving sound/light source or observer. Show change in perceived frequency/wavelength.", icon: RadioTower, categories: ["Sound", "Light & Optics", "Waves & Oscillations"] },
  { id: "youngs-double-slit-g11", name: "Young's Double Slit Experiment", grade: "11", description: "Simulate light passing through two narrow slits and forming an interference pattern on a screen. Adjust slit separation, wavelength, and screen distance.", icon: AlignCenter, categories: ["Light & Optics", "Waves & Oscillations"] },
  { id: "thin-film-interference-g11", name: "Thin Film Interference", grade: "11", description: "Conceptual animation explaining how colors appear in soap bubbles or oil slicks due to interference of light waves reflected from thin film surfaces.", icon: Album, categories: ["Light & Optics", "Waves & Oscillations"] },
  { id: "diffraction-grating-g11", name: "Diffraction Grating", grade: "11", description: "Simulate light passing through a diffraction grating, showing the formation of multiple sharp interference maxima (spectra). Calculate angles.", icon: GripVertical, categories: ["Light & Optics", "Waves & Oscillations"] },
  { id: "polarization-of-light-g11", name: "Polarization of Light", grade: "11", description: "Visualize the transverse nature of light waves. Simulate light passing through one or two polarizing filters (Polaroids). Demonstrate Malus's Law.", icon: Layers, categories: ["Light & Optics", "Waves & Oscillations"] },
  { id: "thermal-conductivity-g11", name: "Thermal Conductivity", grade: "11", description: "Simulate heat flow through different materials (rods of same dimensions). Compare temperature gradients and rates of heat transfer.", icon: HeaterIcon, categories: ["Heat & Thermodynamics"] },
  { id: "specific-heat-gases-cp-cv-g11", name: "Specific Heat Capacities of Gases (Cp & Cv)", grade: "11", description: "Conceptual explanation of why Cp is greater than Cv for gases. Relate to the first law of thermodynamics and work done.", icon: ThermometerSnowflake, categories: ["Heat & Thermodynamics"] },
  { id: "thermodynamic-processes-pv-g11", name: "Thermodynamic Processes & P-V Diagrams", grade: "11", description: "Interactive tracing of Isothermal, Isobaric, Isochoric, and Adiabatic processes on P-V diagrams. Calculate work done.", icon: AreaChart, categories: ["Heat & Thermodynamics"] },
  { id: "electric-field-lines-complex-g11", name: "Electric Field Lines (Complex Distributions)", grade: "11", description: "Visualize electric field lines for configurations beyond simple point charges (e.g., charged plates, spheres, dipoles).", icon: Zap, categories: ["Electrostatics"] },
  { id: "gauss-law-animator-g11", name: "Gauss's Law Conceptual Animator", grade: "11", description: "Visualize electric flux through Gaussian surfaces for different charge enclosures. Illustrate the concept of surface integrals.", icon: SquareRadical, categories: ["Electrostatics"] },
  { id: "electric-potential-point-charges-g11", name: "Electric Potential (Point Charges/Dipole)", grade: "11", description: "Map equipotential surfaces and calculate electric potential at various points due to point charges or an electric dipole.", icon: FunctionSquare, categories: ["Electrostatics"] },
  { id: "wheatstone-potentiometer-g11", name: "Wheatstone Bridge & Potentiometer", grade: "11", description: "Interactive simulations of balancing a Wheatstone bridge to find unknown resistance and using a potentiometer to measure unknown EMF or compare EMFs.", icon: SlidersHorizontal, categories: ["Current Electricity", "Lab Skills & Instruments"] },
  { id: "magnetic-field-loops-solenoids-g11", name: "Magnetic Field of Loops & Solenoids", grade: "11", description: "Detailed 3D visualization of magnetic field patterns for current loops and solenoids. Explore factors affecting field strength.", icon: Magnet, categories: ["Magnetism & Electromagnetism"] },
  { id: "force-on-current-loop-g11", name: "Force on Current Loop in Magnetic Field", grade: "11", description: "Animate a current-carrying loop rotating in a uniform magnetic field. Visualize torque and the motor effect.", icon: RefreshCw, categories: ["Magnetism & Electromagnetism"] },
  { id: "galvanometer-ammeter-voltmeter-g11", name: "Galvanometer, Ammeter, Voltmeter Principles", grade: "11", description: "Conceptual animations showing the internal working principle of a moving coil galvanometer and how it's converted into an ammeter (shunt) and voltmeter (multiplier resistor).", icon: Scale, categories: ["Current Electricity", "Magnetism & Electromagnetism", "Lab Skills & Instruments"] },
  { id: "em-induction-faraday-lenz-g11", name: "EM Induction (Faraday & Lenz)", grade: "11", description: "Simulate changing magnetic flux through a coil to induce EMF/current. Visualize direction based on Lenz's Law.", icon: Magnet, categories: ["Magnetism & Electromagnetism"] },
  { id: "ac-generator-dc-motor-g11", name: "AC Generator & DC Motor Principles", grade: "11", description: "Detailed animations comparing the working principles of an AC generator (rotating coil in B-field) and a DC motor (force on current loop).", icon: Cog, categories: ["Magnetism & Electromagnetism"] },
  { id: "transformer-efficiency-g11", name: "Transformer Efficiency & Principles", grade: "11", description: "Simulate a step-up and step-down transformer. Vary turns ratio. Conceptualize power losses and efficiency calculations.", icon: Replace, categories: ["Magnetism & Electromagnetism"] },
  { id: "cro-principle-g11", name: "Cathode Ray Oscilloscope (CRO) Principle", grade: "11", description: "Conceptual animation showing the electron gun, deflection plates (X and Y), and how they trace a waveform on a fluorescent screen.", icon: Activity, categories: ["Electronics", "Lab Skills & Instruments"] },
  { id: "modulation-demodulation-g11", name: "Modulation & Demodulation (AM/FM)", grade: "11", description: "Conceptual animations illustrating Amplitude Modulation (AM) and Frequency Modulation (FM) of carrier waves with an information signal.", icon: RadioTower, categories: ["Communication Systems"] },
  { id: "optical-fiber-communication-g11", name: "Optical Fiber Communication", grade: "11", description: "Animate light transmission through an optical fiber using Total Internal Reflection. Discuss advantages over coaxial cables.", icon: Cable, categories: ["Communication Systems", "Light & Optics"] },
  { id: "satellite-communication-g11", name: "Satellite Communication", grade: "11", description: "Conceptual diagram showing geostationary orbits, uplink/downlink frequencies, and basic components of a satellite communication system.", icon: Satellite, categories: ["Communication Systems", "Gravitation & Orbital Mechanics"] },
  { id: "vector-addition-perpendicular-components-g11", name: "Vector Addition (Perpendicular Components)", grade: "11", description: "Step-by-step graphical and analytical method for adding vectors using their perpendicular components. Calculate resultant magnitude and direction.", icon: GitFork, categories: ["Vectors"] },
  { id: "momentum-rocketry-jet-propulsion-g11", name: "Momentum in Rocketry/Jet Propulsion", grade: "11", description: "Conceptual animation explaining the principle of conservation of momentum in rocket launches and jet engine operation.", icon: Rocket, categories: ["Dynamics & Forces"] },
  { id: "conservative-vs-non-conservative-forces-g11", name: "Conservative vs. Non-Conservative Forces", grade: "11", description: "Visualize work done by gravity (conservative) vs. friction (non-conservative) along different paths. Discuss energy conservation.", icon: Route, categories: ["Work, Energy & Power"] },
  { id: "energy-diagram-potential-energy-g11", name: "Potential Energy Diagrams", grade: "11", description: "Interactive graph showing potential energy curves for systems like spring-mass or gravitational fields. Identify stable/unstable equilibrium points.", icon: LineChart, categories: ["Work, Energy & Power"] },
  { id: "banking-of-roads-g11", name: "Banking of Roads", grade: "11", description: "Analyze forces acting on a car on a banked turn (normal force, friction, weight). Calculate ideal banking angle and maximum safe speed.", icon: Car, categories: ["Rotational & Circular Motion", "Dynamics & Forces"] },
  { id: "artificial-gravity-space-stations-g11", name: "Artificial Gravity in Space Stations", grade: "11", description: "Conceptual animation of a rotating space station to create apparent gravity (centripetal acceleration).", icon: Orbit, categories: ["Rotational & Circular Motion"] },
  { id: "gravitational-potential-energy-large-distances-g11", name: "Gravitational PE (Large Distances)", grade: "11", description: "Interactive graph of U = -GMm/r. Interpret negative potential energy and work done in moving masses.", icon: LineChart, categories: ["Gravitation & Orbital Mechanics"] },
  { id: "satellite-orbits-types-g11", name: "Satellite Orbits & Types", grade: "11", description: "Visualize circular and elliptical orbits. Compare geostationary vs. polar orbits and their applications.", icon: Satellite, categories: ["Gravitation & Orbital Mechanics"] },
  { id: "streamline-vs-turbulent-flow-g11", name: "Streamline vs. Turbulent Flow", grade: "11", description: "Visualize fluid flow patterns (streamlines) around different obstacles. Adjust flow speed to observe transition to turbulent flow.", icon: Wind, categories: ["Properties of Matter & Fluids"] },
  { id: "venturi-effect-g11", name: "Venturi Effect & Bernoulli", grade: "11", description: "Animation of fluid speed and pressure changes as it flows through a constricted pipe (Venturi meter). Relate to Bernoulli's principle.", icon: Combine, categories: ["Properties of Matter & Fluids"] },
  { id: "surface-tension-phenomena-g11", name: "Surface Tension Phenomena", grade: "11", description: "Droplets, meniscus, insects walking on water. Visualize molecular forces causing surface tension.", icon: Droplets, categories: ["Properties of Matter & Fluids"] },
  { id: "coupled-oscillators-g11", name: "Coupled Oscillators", grade: "11", description: "Simulate two or more coupled oscillators (e.g., masses connected by springs). Observe energy transfer and normal modes of oscillation.", icon: GitCommitHorizontal, categories: ["Simple Harmonic Motion", "Waves & Oscillations"] },
  { id: "shm-ucm-relation-g11", name: "SHM & Uniform Circular Motion Relation", grade: "11", description: "Visualize the projection of an object undergoing Uniform Circular Motion onto a diameter, demonstrating its Simple Harmonic Motion.", icon: Orbit, categories: ["Simple Harmonic Motion", "Rotational & Circular Motion"] },
  { id: "intensity-of-sound-light-inverse-square-law-g11", name: "Intensity of Sound/Light (Inverse Square Law)", grade: "11", description: "Visualize how the intensity of sound or light from a point source decreases with the square of the distance.", icon: Radio, categories: ["Sound", "Light & Optics", "Waves & Oscillations"] },
  { id: "interference-of-waves-2d-g11", name: "Interference of Waves (2D)", grade: "11", description: "Visualize the overlap of circular or plane waves from two sources, showing regions of constructive and destructive interference.", icon: Waves, categories: ["Waves & Oscillations"] },
  { id: "coherent-incoherent-sources-g11", name: "Coherent & Incoherent Sources", grade: "11", description: "Compare interference patterns produced by coherent versus incoherent light sources. Explain conditions for sustained interference.", icon: Lightbulb, categories: ["Light & Optics", "Waves & Oscillations"] },
  { id: "single-slit-diffraction-g11", name: "Single Slit Diffraction", grade: "11", description: "Visualize Huygen's principle for wave propagation through a single slit. Observe the diffraction pattern and the effect of slit width and wavelength on the central maximum.", icon: AlignCenter, categories: ["Light & Optics", "Waves & Oscillations"] },
  { id: "braggs-law-xray-diffraction-g11", name: "Bragg's Law for X-Ray Diffraction", grade: "11", description: "Conceptual animation of X-rays scattering constructively from crystal planes. Explain 2d sin(θ) = nλ.", icon: SquareAsterisk, categories: ["Light & Optics", "Modern Physics"] },
  { id: "work-done-by-gas-pv-diagram-g11", name: "Work Done by/on a Gas (P-V Diagram)", grade: "11", description: "Visualize piston movement and calculate work done (area under curve) for expansion/compression of a gas on a P-V diagram.", icon: AreaChart, categories: ["Heat & Thermodynamics"] },
  { id: "thermodynamic-cycles-otto-diesel-g11", name: "Thermodynamic Cycles (Otto, Diesel)", grade: "11", description: "Conceptual animations of the Otto cycle (petrol engine) and Diesel cycle on P-V diagrams, showing key stages.", icon: Replace, categories: ["Heat & Thermodynamics"] },
  { id: "entropy-as-disorder-g11", name: "Entropy as Disorder (Conceptual)", grade: "11", description: "Conceptual animation showing increasing disorder (entropy) in closed systems, e.g., gas expanding into a vacuum, mixing of substances.", icon: Shuffle, categories: ["Heat & Thermodynamics"] },
  { id: "van-de-graaff-generator-principle-g11", name: "Van de Graaff Generator Principle", grade: "11", description: "Animation of charge accumulation on the dome via a moving belt, demonstrating high voltage generation.", icon: Zap, categories: ["Electrostatics"] },
  { id: "electric-flux-calculation-conceptual-g11", name: "Electric Flux Calculation (Conceptual)", grade: "11", description: "Visualize electric field lines passing through a surface. Conceptually explore how flux changes with field strength, area, and orientation.", icon: SquareRadical, categories: ["Electrostatics"] },
  { id: "dielectric-in-capacitor-g11", name: "Dielectric in a Capacitor", grade: "11", description: "Visualize how inserting a dielectric material between capacitor plates affects capacitance, electric field strength, and stored energy.", icon: Layers, categories: ["Electrostatics"] },
  { id: "internal-resistance-terminal-voltage-g11", name: "Internal Resistance & Terminal Voltage", grade: "11", description: "Interactive circuit. Plot V vs. I to determine internal resistance and EMF of a battery. Observe terminal voltage drop with increasing current.", icon: LineChart, categories: ["Current Electricity"] },
  { id: "potentiometer-working-principle-g11", name: "Potentiometer Working Principle", grade: "11", description: "Simulate balancing a potentiometer to measure an unknown EMF or compare EMFs of two cells. Visualize the null point.", icon: SlidersHorizontal, categories: ["Current Electricity", "Lab Skills & Instruments"] },
  { id: "magnetic-field-of-earth-g11", name: "Magnetic Field of Earth", grade: "11", description: "Conceptual diagram showing Earth's magnetic field lines, geographic vs. magnetic poles, and how a compass needle aligns.", icon: Globe, categories: ["Magnetism & Electromagnetism"] },
  { id: "magnetic-hysteresis-loop-g11", name: "Magnetic Hysteresis Loop (B-H Curve)", grade: "11", description: "Conceptual animation of the B-H curve for ferromagnetic materials, showing hysteresis, retentivity, and coercivity.", icon: LineChart, categories: ["Magnetism & Electromagnetism"] },
  { id: "eddy-currents-demonstration-g11", name: "Eddy Currents Demonstration", grade: "11", description: "Conceptual animation of eddy currents induced in a conductor moving in a magnetic field or exposed to changing flux, showing damping effect.", icon: Magnet, categories: ["Magnetism & Electromagnetism"] },
  { id: "self-mutual-inductance-g11", name: "Self & Mutual Inductance", grade: "11", description: "Conceptual animation of changing current in one coil inducing an EMF in itself (self-inductance) or in a nearby coil (mutual inductance).", icon: RefreshCw, categories: ["Magnetism & Electromagnetism"] },
  { id: "digital-multimeter-working-g11", name: "Digital Multimeter (DMM) Working", grade: "11", description: "Conceptual animation of the internal logic of a DMM for measuring voltage, current, and resistance.", icon: FunctionSquare, categories: ["Electronics", "Lab Skills & Instruments"] },
  { id: "analog-vs-digital-signals-g11", name: "Analog vs. Digital Signals", grade: "11", description: "Comparison of waveform characteristics for analog and digital signals. Discuss advantages of digital transmission.", icon: LineChart, categories: ["Communication Systems", "Electronics"] },
  { id: "sampling-quantization-encoding-g11", name: "Sampling, Quantization & Encoding (A/D)", grade: "11", description: "Animation of the Analog-to-Digital (A/D) conversion process: sampling an analog signal, quantizing levels, and binary encoding.", icon: BinaryIcon, categories: ["Communication Systems", "Electronics"] },
  { id: "transmission-media-comparison-g11", name: "Transmission Media Comparison", grade: "11", description: "Conceptual comparison of coaxial cables, optical fibers, and wireless transmission, highlighting advantages/disadvantages.", icon: Cable, categories: ["Communication Systems"] },

  // Grade 12
  { id: "ideal-gas-law-g12", name: "Ideal Gas Law & Thermo Processes", grade: "12", description: "Interactive simulation of ideal gas behavior (P, V, T, n). Trace thermodynamic processes on a real-time P-V diagram. Microscopic particle view.", icon: Thermometer, categories: ["Heat & Thermodynamics", "Modern Physics"] },
  { id: "carnot-engine-g12", name: "Carnot Engine Cycle Animator", grade: "12", description: "Step-by-step animation of the Carnot cycle with synchronized P-V diagram. Calculate efficiency.", icon: Replace, categories: ["Heat & Thermodynamics"] },
  { id: "heat-engines-refrigerators-g12", name: "Heat Engines & Refrigerators", grade: "12", description: "Conceptual cycle animations, working principles, and coefficient of performance for heat engines and refrigerators.", icon: Cog, categories: ["Heat & Thermodynamics"] },
  { id: "electric-field-potential-g12", name: "Electric Field & Potential Mapping (Adv)", grade: "12", description: "Advanced mapping of electric fields and equipotential lines for complex charge distributions. Test charge interaction.", icon: Zap, categories: ["Electrostatics"] },
  { id: "capacitor-networks-g12", name: "Capacitor Networks Analysis", grade: "12", description: "Analyze complex series/parallel capacitor combinations, calculating equivalent capacitance, charge, and voltage distribution.", icon: Network, categories: ["Electrostatics"] },
  { id: "capacitor-energy-g12", name: "Energy Stored in a Capacitor", grade: "12", description: "Calculate and visualize the energy stored in a capacitor (U = 1/2 CV^2) with interactive parameters.", icon: BatteryCharging, categories: ["Electrostatics"] },
  { id: "ac-circuit-analyzer-g12", name: "AC Circuit Analyzer (RLC)", grade: "12", description: "Build and analyze RLC series/parallel AC circuits. View oscilloscope plots, phasor diagrams, impedance, and resonance effects.", icon: Activity, categories: ["Current Electricity", "Magnetism & Electromagnetism"] },
  { id: "ac-power-g12", name: "Power in AC Circuits", grade: "12", description: "Explore Real, Reactive, and Apparent Power in AC circuits. Calculate and visualize Power Factor.", icon: TrendingUp, categories: ["Current Electricity", "Magnetism & Electromagnetism"] },
  { id: "mass-spectrometer-g12", name: "Mass Spectrometer Simulator", grade: "12", description: "Simulate ion path through velocity selector and deflection chamber to determine charge-to-mass ratio.", icon: Scale, categories: ["Magnetism & Electromagnetism", "Modern Physics"] },
  { id: "hall-effect-g12", name: "Hall Effect Simulator", grade: "12", description: "Visualize force on charge carriers in a conductor in a magnetic field, leading to Hall voltage. Explore material properties.", icon: Magnet, categories: ["Magnetism & Electromagnetism"] },
  { id: "photoelectric-effect-g12", name: "Photoelectric Effect (Enhanced)", grade: "12", description: "Adjust light frequency/intensity, metal work function. Observe emitted electrons, KE, stopping voltage. Plot KE vs. Freq.", icon: Sun, categories: ["Modern Physics", "Atomic Physics"] },
  { id: "compton-effect-g12", name: "Compton Effect Animator", grade: "12", description: "Conceptual animation of photon-electron scattering, showing wavelength change and energy/momentum transfer.", icon: Sparkles, categories: ["Modern Physics"] },
  { id: "wave-particle-duality-g12", name: "Wave-Particle Duality Visualizer", grade: "12", description: "Conceptual animation of electron diffraction, demonstrating the wave nature of particles.", icon: Waves, categories: ["Modern Physics"] },
  { id: "blackbody-radiation-g12", name: "Blackbody Radiation Curve Lab", grade: "12", description: "Interactive graph of blackbody radiation spectrum. Adjust temperature and observe changes. Visualize Wien's Law and Planck's Law.", icon: LineChart, categories: ["Modern Physics", "Heat & Thermodynamics"] },
  { id: "atomic-spectra-bohr-g12", name: "Atomic Spectra & Bohr Model Interactive", grade: "12", description: "Interactive energy level diagram (Hydrogen). Show electron transitions, photon emission/absorption, and resulting spectra (Balmer, Lyman, etc.).", icon: Atom, categories: ["Atomic Physics", "Modern Physics"] },
  { id: "xray-production-spectra-g12", name: "X-Ray Production & Spectra", grade: "12", description: "Conceptual animation of X-ray production, continuous & characteristic X-rays, Bragg's Law.", icon: Activity, categories: ["Atomic Physics", "Modern Physics"] },
  { id: "laser-principle-g12", name: "Laser Principle Animator", grade: "12", description: "Animated explanation of population inversion, stimulated emission, and coherent light production in a laser.", icon: Zap, categories: ["Atomic Physics", "Light & Optics"] },
  { id: "radioactive-decay-g12", name: "Radioactive Decay Chains Visualizer", grade: "12", description: "Visualize alpha, beta, gamma decay. Simulate half-life and trace decay series.", icon: Radiation, categories: ["Nuclear Physics"] },
  { id: "nuclear-fission-fusion-g12", name: "Nuclear Fission & Fusion Animator", grade: "12", description: "Animated diagrams of fission (chain reaction) and fusion (e.g., D-T reaction), showing energy release. Conceptual reactor diagram.", icon: Atom, categories: ["Nuclear Physics"] },
  { id: "binding-energy-mass-defect-g12", name: "Binding Energy & Mass Defect", grade: "12", description: "Explore the binding energy curve, calculate mass defect, and understand nuclear stability.", icon: SigmaSquare, categories: ["Nuclear Physics"] },
  { id: "radioisotope-applications-g12", name: "Applications of Radioisotopes", grade: "12", description: "Conceptual explanations and diagrams of radioisotope uses in medical imaging, carbon dating, and industry.", icon: TestTubeDiagonal, categories: ["Nuclear Physics"] },
  { id: "standard-model-explorer-g12", name: "Standard Model Particle Explorer", grade: "12", description: "Interactive diagram of the Standard Model: quarks, leptons, bosons. Explore fundamental forces and particle properties.", icon: BrainCircuit, categories: ["Particle Physics", "Modern Physics"] },
  { id: "particle-accelerators-g12", name: "Particle Accelerators (Conceptual)", grade: "12", description: "Conceptual animations explaining how cyclotrons and synchrotrons accelerate particles to high energies.", icon: Orbit, categories: ["Particle Physics", "Modern Physics"] },

  // New Additions from previous request
  { id: "black-hole-spacetime-visualizer", name: "Black Hole / Spacetime Curvature Visualizer", grade: "12 / Advanced", description: "Conceptual simulation of spacetime warping by massive objects. Place masses, observe gravitational wells, and test particle trajectories.", icon: Orbit, categories: ["Gravitation & Orbital Mechanics", "Modern Physics", "Relativity"], image: "https://placehold.co/400x200.png", aiHint: "black hole spacetime gravity" },
  { id: "rocket-launch-rendezvous", name: "Rocket Launch & Orbital Rendezvous Simulator", grade: "11 / 12", description: "Simulate rocket launches, achieving orbit, and attempting orbital maneuvers for rendezvous. Understand orbital velocity, escape velocity, and relative motion.", icon: Rocket, categories: ["Dynamics & Forces", "Kinematics", "Gravitation & Orbital Mechanics"], image: "https://placehold.co/400x200.png", aiHint: "rocket launch orbit rendezvous" },
];

/**
 * Keywords for searching settings options.
 */
export const SETTINGS_SEARCHABLE_KEYWORDS = [
  { term: "theme", label: "Change Theme (Light/Dark/System)", href: "/settings" },
  { term: "dark mode", label: "Enable Dark Mode Theme", href: "/settings" },
  { term: "light mode", label: "Enable Light Mode Theme", href: "/settings" },
  { term: "fun facts", label: "Toggle Fun Physics Facts Panel", href: "/settings" },
  { term: "tidbits", label: "Show/Hide Physics Tidbits Panel", href: "/settings" },
  { term: "notifications", label: "Manage App Notifications (Coming Soon)", href: "/settings" },
  { term: "offline", label: "Offline Data & Sync Settings", href: "/settings" },
  { term: "sync", label: "Data Synchronization Settings", href: "/settings" },
  // { term: "update", label: "Check for App Updates", href: "/settings" }, // This is an action, not a setting page itself
  { term: "teacher mode", label: "Toggle Teacher Mode Access", href: "/settings" },
  { term: "admin", label: "Access Teacher/Admin Panel (via toggle)", href: "/settings" },
];

/**
 * Curriculum boards for selection, e.g., in Mind Maps.
 */
export const CURRICULUM_BOARDS = [
  { id: "stbb", name: "Sindh Textbook Board (STBB)" },
  { id: "ptbb", name: "Punjab Textbook Board (PTBB)" },
  { id: "national", name: "National Curriculum (Pakistan)" },
  // Add more as needed, e.g., { id: "federal", name: "Federal Board" }
];