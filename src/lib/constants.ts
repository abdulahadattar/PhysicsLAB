
/**
 * @fileOverview Defines constant values used throughout the application.
 * This includes navigation structures, lists of topics for simulations and quizzes,
 * application metadata, searchable keywords for settings, and curriculum board information.
 */
import type { SimulationTopic as SimTopicType, NavItem } from '@/lib/types';
import {
  LayoutDashboard, Orbit, BookOpen, ListChecks, Users, MessageSquare, Settings as SettingsIcon,
  UserCog, Lightbulb, Brain, Map, Ruler, Thermometer, Scale, ClockIcon, Waves, Heater, Sigma,
  BatteryCharging, MoveHorizontal, TrendingUp, Atom, FileEdit, CalendarDays, ClipboardList, BookCopy,
  NotebookText, UserCircle, FileArchive, TestTubeDiagonal, Beaker, Edit, Link2, FileText,
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
  UserCog as UserCogIcon,
  KeyRound, Eye, EyeOff, WifiOff, XCircle, CalendarClock, Shuffle,
  UserPlus, BarChart3, Percent, CheckCircle, History, Smartphone, Laptop, Signal,
  DownloadCloud, Notebook as NotebookIcon, Share2,
  LocateIcon, ZoomInIcon, ZoomOutIcon,
} from 'lucide-react'; // Assuming all icons are imported from lucide-react

/**
 * Defines the structure for a simulation topic.
 */
export type SimulationTopic = SimTopicType;

/**
 * Main navigation items for the application sidebar.
 * @property {string} href - The route path for the navigation item.
 * @property {string} label - The display text for the navigation item.
 * @property {React.ElementType} icon - The Lucide icon component to display.
 * @property {boolean} [matchExact] - Whether the path should be an exact match for active state.
 * @property {NavItem[]} [subItems] - Optional array of sub-navigation items.
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
    icon: UserCogIcon,
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
 */
export const SIMULATION_TOPICS: SimulationTopic[] = [
  // --- Implemented or Previously Prioritized ---
  { id: "vernier-caliper-g9", name: "G9: Vernier Caliper Practice", grade: "9", description: "Interactive tool to practice reading Vernier calipers, understanding least count and zero error.", icon: Ruler, categories: ["Measurements & Units", "Lab Skills & Instruments"], image: "https://placehold.co/400x200.png", aiHint: "vernier caliper measure" },
  { id: "hookes-law-g9", name: "G9: Hooke's Law Lab", grade: "9", description: "Simulate stretching a spring with variable force and spring constant. Observe extension and Force-Extension graph.", icon: Weight, categories: ["Elasticity", "Dynamics & Forces"], image: "https://placehold.co/400x200.png", aiHint: "hookes law spring" },
  { id: "motion-constant-acceleration-g9", name: "G9: Motion with Constant Acceleration", grade: "9", description: "Explore 1D motion with constant acceleration. Visualize object movement, P-T, V-T, and A-T graphs.", icon: TrendingUp, categories: ["Kinematics"], image: "https://placehold.co/400x200.png", aiHint: "kinematics motion graph" },
  { id: "states-of-matter-g9", name: "G9: States of Matter - Particle Model", grade: "9", description: "Visualize particle behavior in solids, liquids, and gases. Observe effects of temperature and pressure. Includes a conceptual P-V diagram.", icon: Atom, categories: ["Heat & Thermodynamics", "Properties of Matter & Fluids"], image: "https://placehold.co/400x200.png", aiHint: "particles solid liquid gas" },
  { id: "projectile-motion-g11", name: "G11: Projectile Motion", grade: "11", description: "Adjust launch angle, initial velocity, and initial height to see trajectory and calculated range, max height, and time of flight.", icon: Orbit, categories: ["Kinematics"], image: "https://placehold.co/400x200.png", aiHint: "projectile motion trajectory" },
  { id: "unit-converter-g11", name: "G11: Unit Converter", grade: "11", description: "Convert between common units for Length, Mass, and Time.", icon: Replace, categories: ["Measurements & Units"], image: "https://placehold.co/400x200.png", aiHint: "unit conversion measurement" },
  { id: "shm-spring-mass-g11", name: "G11: SHM - Spring-Mass System", grade: "11", description: "Simulate a spring-mass system. Adjust mass/spring constant, see period/frequency and basic animation.", icon: Waves, categories: ["Simple Harmonic Motion", "Waves & Oscillations"], image: "https://placehold.co/400x200.png", aiHint: "shm spring mass" },
  { id: "sig-figs-practice-g11", name: "G11: Significant Figures Practice", grade: "11", description: "Interactive exercises for identifying and applying rules of significant figures.", icon: Sigma, categories: ["Measurements & Units"], image: "https://placehold.co/400x200.png", aiHint: "significant figures math" },
  { id: "capacitor-rc-circuit-g11", name: "G11: Capacitor Charging/Discharging (RC Circuit)", grade: "11", description: "Visualize capacitor voltage over time in an RC circuit during charging and discharging. Includes graph and animation.", icon: BatteryCharging, categories: ["Electrostatics", "Current Electricity"], image: "https://placehold.co/400x200.png", aiHint: "capacitor rc circuit" },
  { id: "simple-pendulum-shm-g11", name: "G11: Simple Pendulum SHM", grade: "11", description: "Simulate a simple pendulum. Adjust length, gravity, initial angle. See period/frequency and animation.", icon: MoveVertical, categories: ["Simple Harmonic Motion", "Waves & Oscillations"], image: "https://placehold.co/400x200.png", aiHint: "simple pendulum shm" },
  { id: "wave-generator-g10", name: "G10: Wave Generator (Adjustable Params)", grade: "10", description: "Observe transverse wave motion. Adjust frequency and amplitude to see their effects. Displays wavelength and speed.", icon: Waves, categories: ["Waves & Oscillations"], image: "https://placehold.co/400x200.png", aiHint: "wave generator transverse" },
  { id: "logic-gates-g10", name: "G10: Logic Gate Simulator", grade: "10", description: "Simulate basic logic gates (AND, OR, NOT, NAND, NOR, XOR) and verify their truth tables interactively.", icon: Binary, categories: ["Electronics"], image: "https://placehold.co/400x200.png", aiHint: "logic gates truth table" },
  { id: "phet-moving-man-g9", name: "G9: PhET: The Moving Man (Kinematics)", grade: "9", description: "Control position, velocity, and acceleration of a figure and see corresponding P-T, V-T, A-T graphs. PhysicsLab Enhancement: User input, 'Draw the Graph' challenge.", icon: PersonStanding, categories: ["Kinematics"], image: "https://placehold.co/400x200.png", aiHint: "kinematics motion graph pva" },
  { id: "phet-projectile-motion-g9", name: "G9: PhET: Projectile Motion", grade: "9", description: "Launch objects, adjust angle, speed, mass. Observe trajectory. Air resistance toggle. PhysicsLab Enhancement: Vector components, 'Hit the Target' game, energy analysis.", icon: Orbit, categories: ["Kinematics", "Dynamics & Forces"], image: "https://placehold.co/400x200.png", aiHint: "projectile motion trajectory physics" },

  // --- Grade 9 (Additional Placeholders from Blueprint) ---
  { id: "measurement-tool-interactive-g9", name: "G9: Measurement Tool Interactive", grade: "9", description: "Practice using Vernier calipers, Micrometer Screw Gauge, rulers, and protractors. Interactive reading, zero error analysis. Random objects for measurement and feedback.", icon: Ruler, categories: ["Measurements & Units", "Lab Skills & Instruments"] },
  { id: "measurement-errors-visualizer-g9", name: "G9: Measurement Errors Visualizer", grade: "9", description: "Visualizations of systematic vs. random errors, and least count error. Interactive elements show how these errors affect measurements.", icon: DraftingCompass, categories: ["Measurements & Units", "Lab Skills & Instruments"] },
  { id: "sig-figs-scientific-notation-g9", name: "G9: Sig Figs & Sci Notation Practice", grade: "9", description: "Interactive exercises for mastering significant figures in readings/calculations and scientific notation, with immediate feedback.", icon: SigmaSquare, categories: ["Measurements & Units"] },
  { id: "motion-graphing-lab-g9", name: "G9: 1D Motion Graphing Lab", grade: "9", description: "Interactive control of motion, auto-generated P-T, V-T, A-T graphs. Users could draw graphs or match graphs to motion scenarios.", icon: LineChart, categories: ["Kinematics"] },
  { id: "relative-velocity-scenarios-g9", name: "G9: Relative Velocity Scenarios", grade: "9", description: "Interactive animation of relative motion for boats in rivers, planes in wind. Users control velocities and observe resultant paths.", icon: Ship, categories: ["Kinematics"] },
  { id: "motion-under-gravity-g9", name: "G9: Motion Under Gravity (Free Fall)", grade: "9", description: "Simulate objects falling with/without air resistance, showing increasing velocity and the effect of air resistance leading to terminal velocity.", icon: ArrowDown, categories: ["Kinematics", "Dynamics & Forces"] },
  { id: "vectors-lab-g9", name: "G9: Vectors Addition/Subtraction Lab", grade: "9", description: "Interactively add and subtract vectors using graphical (head-to-tail) and analytical (component) methods. Drag & drop vectors, see resultant.", icon: Move, categories: ["Kinematics", "Dynamics & Forces"] },
  { id: "phet-forces-motion-basics-g9", name: "G9: PhET: Forces and Motion Basics", grade: "9", description: "Explores net force, friction, Newton's laws. PhysicsLab Enhancement: Interactive FBDs, real-time net force/acceleration, adjustable friction, 'Predict Motion' challenge.", icon: PersonStanding, categories: ["Dynamics & Forces"] },
  { id: "forces-as-vectors-composer-g9", name: "G9: Forces as Vectors Composer", grade: "9", description: "Interactive tool to resolve forces into components (x, y) and find the resultant of multiple forces acting on a point.", icon: GitFork, categories: ["Dynamics & Forces"] },
  { id: "inertia-demonstration-g9", name: "G9: Inertia Demonstration", grade: "9", description: "Animation showing an object's resistance to change in motion (e.g., coin on cardboard, passengers in a braking bus).", icon: Box, categories: ["Dynamics & Forces"] },
  { id: "action-reaction-pairs-visualizer-g9", name: "G9: Action-Reaction Pairs Visualizer", grade: "9", description: "Identifying and visualizing Newton's 3rd Law pairs in various scenarios (e.g., person pushing a wall, rocket propulsion).", icon: UsersIcon, categories: ["Dynamics & Forces"] },
  { id: "momentum-collisions-lab-g9", name: "G9: Momentum & Collisions Lab", grade: "9", description: "Simulate 1D/2D elastic/inelastic collisions. Observe conservation of momentum and KE changes. Adjustable masses and initial velocities.", icon: Combine, categories: ["Dynamics & Forces"] },
  { id: "momentum-change-impulse-g9", name: "G9: Momentum Change & Impulse", grade: "9", description: "Interactive Force vs. Time graph. Calculate impulse (area under graph) and link it to the change in momentum of an object.", icon: AreaChart, categories: ["Dynamics & Forces"] },
  { id: "uniform-circular-motion-g9", name: "G9: Uniform Circular Motion Simulator", grade: "9", description: "Explore centripetal force, velocity, and acceleration in uniform circular motion. Adjust radius, speed, and mass. Visualization of vectors.", icon: RefreshCw, categories: ["Rotational & Circular Motion", "Dynamics & Forces"] },
  { id: "phet-energy-skate-park-basics-g9", name: "G9: PhET: Energy Skate Park Basics", grade: "9", description: "Demonstrates conservation of mechanical energy. PhysicsLab Enhancement: Track builder, real-time energy bars, friction control, numerical display, 'Design a Rollercoaster' mode.", icon: Zap, categories: ["Work, Energy & Power"] },
  { id: "work-energy-lab-g9", name: "G9: Work-Energy Transformation Lab", grade: "9", description: "Investigate KE, PE, work done by/against friction, and power in scenarios like inclined planes and spring systems.", icon: Route, categories: ["Work, Energy & Power"] },
  { id: "power-calculation-scenarios-g9", name: "G9: Power Calculation Scenarios", grade: "9", description: "Interactive problems for calculating power, e.g., lifting weights, running up stairs, showing work done over time.", icon: TrendingUp, categories: ["Work, Energy & Power"] },
  { id: "energy-forms-transformation-examples-g9", name: "G9: Energy Forms Transformation Examples", grade: "9", description: "Animation of energy changing forms: e.g., chemical to electrical to light in a flashlight, potential to kinetic in a falling object.", icon: Recycle, categories: ["Work, Energy & Power"] },
  { id: "simple-machines-levers-pulleys-g9", name: "G9: Levers & Pulleys Efficiency Analyzer", grade: "9", description: "Analyze mechanical advantage (MA) and efficiency of interactive levers and pulley systems with adjustable loads and efforts.", icon: Anchor, categories: ["Simple Machines", "Work, Energy & Power"] },
  { id: "simple-machines-inclined-plane-g9", name: "G9: Inclined Plane & Screw Mechanism", grade: "9", description: "Interactively manipulate incline angle and screw pitch to understand work, Mechanical Advantage (MA), and efficiency.", icon: Album, categories: ["Simple Machines", "Work, Energy & Power"] },
  { id: "wheel-axle-principle-g9", name: "G9: Wheel & Axle Principle", grade: "9", description: "Interactive visualization of a wheel and axle, showing how it works and allows calculation of its mechanical advantage.", icon: CircleDot, categories: ["Simple Machines"] },
  { id: "screw-as-inclined-plane-g9", name: "G9: Screw as Inclined Plane", grade: "9", description: "Animation or interactive model that 'unrolls' a screw to visualize it as a long, thin inclined plane wrapped around a cylinder.", icon: MinusSquare, categories: ["Simple Machines"] },
  { id: "universal-gravitation-explorer-g9", name: "G9: Law of Universal Gravitation Explorer", grade: "9", description: "Explore gravitational force between interactive planets/masses. Adjust masses and distance, observe force vectors. Demonstrates F = Gm₁m₂/r².", icon: UsersIcon, categories: ["Gravitation & Orbital Mechanics"] },
  { id: "gravitational-field-strength-variation-g9", name: "G9: Gravitational Field Strength Variation", grade: "9", description: "Graph/visualizer showing how gravitational field strength ('g') varies with altitude above Earth's surface and depth below it.", icon: LineChart, categories: ["Gravitation & Orbital Mechanics"] },
  { id: "weightlessness-in-orbit-g9", name: "G9: Weightlessness in Orbit", grade: "9", description: "Conceptual animation explaining how continuous free-fall causes the sensation of apparent weightlessness for astronauts in orbit.", icon: Orbit, categories: ["Gravitation & Orbital Mechanics"] },
  { id: "density-measurement-g9", name: "G9: Density Measurement (Interactive)", grade: "9", description: "Interactively determine density of objects using virtual measuring cylinders and balances.", icon: Archive, categories: ["Properties of Matter & Fluids", "Measurements & Units"] },
  { id: "density-buoyancy-lab-g9", name: "G9: Density & Buoyancy Lab", grade: "9", description: "Submerge objects of different materials and volumes, measure buoyant force, and calculate density. Explore Archimedes' Principle and conditions for flotation.", icon: Anchor, categories: ["Properties of Matter & Fluids"] },
  { id: "pressure-in-solids-fluids-g9", name: "G9: Pressure in Solids & Fluids", grade: "9", description: "Conceptual visualization of force distribution creating pressure (e.g., sharp vs. blunt object, pressure with depth in fluid).", icon: ArrowDown, categories: ["Properties of Matter & Fluids"] },
  { id: "liquid-level-communicating-vessels-g9", name: "G9: Liquid Level in Communicating Vessels", grade: "9", description: "Demonstration showing that liquid finds its own level in connected vessels of different shapes, illustrating equal pressure at the same depth.", icon: Beaker, categories: ["Properties of Matter & Fluids"] },
  { id: "elasticity-hookes-law-g9", name: "G9: Hooke's Law & Stress-Strain Lab", grade: "9", description: "Investigate force-extension for springs and wires. Plot load-extension and stress-strain curves. Determine spring constant and Young's Modulus.", icon: Weight, categories: ["Elasticity", "Properties of Matter & Fluids"] },
  { id: "types-of-stress-strain-g9", name: "G9: Types of Stress & Strain Visualizer", grade: "9", description: "Visual examples and animations of tensile, compressive, and shear stress and their corresponding strains on different materials.", icon: StretchHorizontal, categories: ["Elasticity", "Properties of Matter & Fluids"] },
  { id: "ductile-vs-brittle-materials-g9", name: "G9: Ductile vs. Brittle Materials", grade: "9", description: "Comparison of stress-strain curves for ductile and brittle materials, showing differences in elastic limit, yield point, and fracture.", icon: LineChart, categories: ["Elasticity", "Properties of Matter & Fluids"] },
  { id: "phet-states-of-matter-basics-g9", name: "G9: PhET: States of Matter: Basics", grade: "9", description: "Visualizes atoms/molecules in solid, liquid, and gas phases. PhysicsLab Enhancement: Phase change animation, pressure/volume link for gases, evaporation focus.", icon: Atom, categories: ["Heat & Thermodynamics", "Properties of Matter & Fluids"]},
  { id: "thermal-expansion-g9", name: "G9: Thermal Expansion Simulator", grade: "9", description: "Simulate linear, area, and volume expansion of solids and liquids when heated. Observe changes with temperature adjustments.", icon: Thermometer, categories: ["Heat & Thermodynamics"] },
  { id: "bimetallic-strip-animator-g9", name: "G9: Bimetallic Strip Animator", grade: "9", description: "Demonstration of thermal expansion causing bending in a bimetallic strip, explaining its use in thermostats.", icon: Layers, categories: ["Heat & Thermodynamics"] },
  { id: "heat-transfer-modes-g9", name: "G9: Heat Transfer Modes Visualizer", grade: "9", description: "Animated microscopic/macroscopic examples of conduction, convection, and radiation. Explore factors affecting heat transfer.", icon: Wind, categories: ["Heat & Thermodynamics"] },
  { id: "specific-heat-calculator-g9", name: "G9: Specific Heat & Heat Capacity Calculator", grade: "9", description: "Interactive problem-solver for Q=mcΔT. Input values and calculate heat transferred, mass, specific heat capacity, or temperature change.", icon: SigmaSquare, categories: ["Heat & Thermodynamics"] },
  { id: "latent-heat-heating-curve-g9", name: "G9: Latent Heat & Phase Change Heating Curve", grade: "9", description: "Interactive graph showing the heating curve of a substance (e.g., ice to steam), highlighting phase transitions and explaining latent heat.", icon: LineChart, categories: ["Heat & Thermodynamics"] },
  { id: "heating-curve-of-water-g9", name: "G9: Heating Curve of Water", grade: "9", description: "Detailed plot of energy input vs. temperature for water, showing melting and boiling plateaus and specific heat regions.", icon: LineChart, categories: ["Heat & Thermodynamics"] },
  { id: "factors-affecting-evaporation-g9", name: "G9: Factors Affecting Evaporation", grade: "9", description: "Interactive visualization of surface area, temperature, wind, nature of liquid effects on evaporation rate.", icon: Wind, categories: ["Heat & Thermodynamics"] },
  { id: "magnetism-basics-g9", name: "G9: Magnetism Basics Explorer", grade: "9", description: "Explore temporary vs. permanent magnets, plot magnetic fields (bar magnet, Earth), and visualize paramagnetic/diamagnetic materials.", icon: Magnet, categories: ["Magnetism & Electromagnetism"] },

  // --- Grade 10 (PhET-Inspired & Specific Placeholders) ---
  { id: "phet-pendulum-lab-g10", name: "G10: PhET: Pendulum Lab (SHM)", grade: "10", description: "Investigate pendulum period. PhysicsLab Enhancement: Plot angle/energy vs. time, 'Unknown Gravity' challenge.", icon: MoveVertical, categories: ["Simple Harmonic Motion", "Waves & Oscillations"] },
  { id: "energy-in-shm-animator-g10", name: "G10: Energy in SHM Animator", grade: "10", description: "Visualize kinetic vs. potential energy exchange in a mass-spring system or simple pendulum over one complete cycle. Show graphs.", icon: LineChart, categories: ["Simple Harmonic Motion", "Work, Energy & Power"] },
  { id: "phet-wave-on-a-string-g10", name: "G10: PhET: Wave on a String", grade: "10", description: "Create transverse waves. PhysicsLab Enhancement: Display wavelength, period, speed. Explore standing waves, visualize superposition.", icon: Waves, categories: ["Waves & Oscillations"] },
  { id: "properties-of-waves-g10", name: "G10: Properties of Waves Diagram", grade: "10", description: "Interactive diagram to identify and label crest, trough, wavelength, amplitude, and period on a transverse wave.", icon: DraftingCompass, categories: ["Waves & Oscillations"] },
  { id: "principle-of-superposition-g10", name: "G10: Principle of Superposition (Constructive/Destructive)", grade: "10", description: "Visualizing two waves (transverse or pulses) combining to show constructive and destructive interference.", icon: Combine, categories: ["Waves & Oscillations"] },
  { id: "ripple-tank-g10", name: "G10: Ripple Tank Simulation", grade: "10", description: "Observe reflection, refraction, and diffraction of waves in a simulated ripple tank environment. Adjustable sources and parameters.", icon: Square, categories: ["Waves & Oscillations", "Light & Optics"]},
  { id: "wave-phenomena-g10", name: "G10: Wave Phenomena Simulator (Ripple Tank)", grade: "10", description: "Observe reflection, refraction, and diffraction of waves using a simulated ripple tank. Adjustable sources and parameters.", icon: Square, categories: ["Waves & Oscillations", "Light & Optics"] }, // Merged with ripple-tank-g10
  { id: "phet-sound-waves-g10", name: "G10: PhET: Sound Waves Visualizer", grade: "10", description: "Visualize sound as pressure variations. PhysicsLab Enhancement: Animate particle motion, show pressure/displacement graphs, demonstrate interference.", icon: Speaker, categories: ["Sound", "Waves & Oscillations"] },
  { id: "sound-propagation-g10", name: "G10: Sound Wave Propagation Animator", grade: "10", description: "Visualize longitudinal sound waves, compressions, rarefactions, and simulate echo phenomena. Adjust frequency and amplitude.", icon: Speaker, categories: ["Sound", "Waves & Oscillations"] },
  { id: "factors-affecting-speed-of-sound-g10", name: "G10: Factors Affecting Speed of Sound", grade: "10", description: "Conceptual explanation/visualization of temperature, medium density effects on speed of sound.", icon: Thermometer, categories: ["Sound"] },
  { id: "echolocation-principle-g10", name: "G10: Echolocation Principle Animator", grade: "10", description: "Animation showing sound waves reflecting off an object (echo) and how this can be used to calculate distance.", icon: Milestone, categories: ["Sound"] },
  { id: "resonance-musical-instruments-g10", name: "G10: Resonance & Musical Instruments", grade: "10", description: "Animation showing vibrating air columns in open/closed pipes or strings, node/antinode formation, fundamental frequencies & harmonics.", icon: Music2, categories: ["Sound", "Waves & Oscillations"] },
  { id: "phet-bending-light-g10", name: "G10: PhET: Bending Light (Refraction & TIR)", grade: "10", description: "Explore refraction/reflection. PhysicsLab Enhancement: Adjustable refractive indices, ray tracing, Snell's Law calculator, critical angle/TIR visualization.", icon: Pipette, categories: ["Light & Optics"] },
  { id: "reflection-lab-g10", name: "G10: Reflection Lab (Plane & Spherical Mirrors)", grade: "10", description: "Interactive incident/reflected rays. Verify laws of reflection. Ray diagrams for spherical mirrors.", icon: BookKey, categories: ["Light & Optics"] },
  { id: "image-formation-plane-mirror-g10", name: "G10: Image Formation by Plane Mirror", grade: "10", description: "Interactive ray tracing for a plane mirror, showing virtual image formation and its properties.", icon: Square, categories: ["Light & Optics"] },
  { id: "phet-geometric-optics-g10", name: "G10: PhET: Geometric Optics (Lenses & Mirrors)", grade: "10", description: "Visualize ray tracing for lenses/mirrors. PhysicsLab Enhancement: Interactive tracing, image properties display, lens/mirror equation tool, compound systems.", icon: Projector, categories: ["Light & Optics"] },
  { id: "ray-diagrams-g10", name: "G10: Lens & Mirror Ray Diagram Tool", grade: "10", description: "Interactively draw and explore ray diagrams for spherical mirrors and lenses to understand image formation. Adjust object position, focal length.", icon: Projector, categories: ["Light & Optics"] }, // Merged with phet-geometric-optics-g10
  { id: "spherical-chromatic-aberration-g10", name: "G10: Spherical & Chromatic Aberration", grade: "10", description: "Conceptual animation of lens/mirror defects: spherical aberration and chromatic aberration.", icon: Aperture, categories: ["Light & Optics"] },
  { id: "magnifying-glass-animator-g10", name: "G10: Magnifying Glass Animator", grade: "10", description: "Ray tracing animation for a simple convex lens used as a magnifying glass.", icon: ZoomInIcon, categories: ["Light & Optics"] },
  { id: "optical-instruments-g10", name: "G10: Optical Instruments Explorer", grade: "10", description: "Ray tracing for simple microscope, compound microscope, and astronomical telescope. Image formation.", icon: Microscope, categories: ["Light & Optics"] },
  { id: "phet-balloons-static-electricity-g10", name: "G10: PhET: Balloons & Static Electricity", grade: "10", description: "Demonstrates charging by friction/induction. PhysicsLab Enhancement: Microscopic electron visualization, charge redistribution animation, interactive forces.", icon: Zap, categories: ["Electrostatics"] },
  { id: "gold-leaf-electroscope-function-g10", name: "G10: Gold Leaf Electroscope Function", grade: "10", description: "Animation showing how a gold leaf electroscope works when charged by contact or induction.", icon: Leaf, categories: ["Electrostatics", "Lab Skills & Instruments"] },
  { id: "electric-charges-forces-g10", name: "G10: Electric Charges & Forces Lab", grade: "10", description: "Charging by friction/induction, Coulomb's Law visualization, Field lines, Force vectors.", icon: Zap, categories: ["Electrostatics"] },
  { id: "electric-field-g10", name: "G10: Electric Field Visualizer (Basic)", grade: "10", description: "Visualize electric field lines around point charges and understand electrostatic phenomena like induction. Place positive/negative charges, observe field lines.", icon: Zap, categories: ["Electrostatics"] }, // Merged with electric-charges-forces-g10
  { id: "electric-potential-energy-g10", name: "G10: Electric Potential & Potential Energy", grade: "10", description: "Move test charges in electric fields. Visualize work done, potential difference, ΔPE.", icon: BatteryCharging, categories: ["Electrostatics"] },
  { id: "capacitor-as-energy-storage-g10", name: "G10: Capacitor as Energy Storage Device", grade: "10", description: "Visualizing charge accumulation on capacitor plates and energy storage in the electric field.", icon: BatteryCharging, categories: ["Electrostatics", "Current Electricity"] },
  { id: "phet-circuit-construction-kit-dc-g10", name: "G10: PhET: Circuit Construction Kit (DC)", grade: "10", description: "Build DC circuits. PhysicsLab Enhancement: Visual current flow, functional meters, Ohm's Law/Kirchhoff's exploration, 'Build a Circuit' challenge.", icon: Network, categories: ["Current Electricity"] },
  { id: "simple-circuits-g10", name: "G10: Simple Circuit Builder (Series/Parallel)", grade: "10", description: "Build and test simple series and parallel circuits to understand Ohm's law and current flow. Drag & drop components, adjust values, observe current/bulb brightness.", icon: Network, categories: ["Current Electricity"] }, // Merged with phet-circuit-construction-kit-dc-g10
  { id: "resistivity-factors-g10", name: "G10: Resistivity & Factors Affecting Resistance", grade: "10", description: "Interactive wire properties (material, length, area), resistance calculation.", icon: Cable, categories: ["Current Electricity"] },
  { id: "household-wiring-g10", name: "G10: Household Wiring Diagram", grade: "10", description: "Interactive circuit diagram of household parallel wiring, safety features (fuses, circuit breakers, earth wire).", icon: Plug, categories: ["Current Electricity"] },
  { id: "emf-vs-potential-difference-g10", name: "G10: EMF vs. Potential Difference", grade: "10", description: "Conceptual comparison using a circuit analogy to explain the difference.", icon: BatteryCharging, categories: ["Current Electricity"] },
  { id: "internal-resistance-battery-g10", name: "G10: Internal Resistance of Battery", grade: "10", description: "Circuit simulation showing voltage drop across internal resistance affecting terminal potential difference.", icon: BatteryWarning, categories: ["Current Electricity"] },
  { id: "joules-law-of-heating-g10", name: "G10: Joule's Law of Heating Visualizer", grade: "10", description: "Current, resistance, time affecting heat produced in a resistor. Visual P = I²R.", icon: HeaterIcon, categories: ["Current Electricity", "Heat & Thermodynamics"] },
  { id: "magnetic-field-current-conductor-g10", name: "G10: Magnetic Field (Current Conductors)", grade: "10", description: "3D visualization of magnetic field lines around straight wires, circular loops, and solenoids. Interactive Right-Hand Rule application.", icon: Magnet, categories: ["Magnetism & Electromagnetism"] },
  { id: "electromagnet-construction-g10", name: "G10: Electromagnet Construction Lab", grade: "10", description: "Interactive build, varying turns, current, core material, observe field strength.", icon: Magnet, categories: ["Magnetism & Electromagnetism"] },
  { id: "magnetic-levitation-principle-g10", name: "G10: Magnetic Levitation Principle", grade: "10", description: "Simple demonstration using opposing magnetic fields to levitate an object.", icon: Magnet, categories: ["Magnetism & Electromagnetism"] },
  { id: "force-on-conductor-charge-g10", name: "G10: Force on Conductor/Charge (Lorentz Force)", grade: "10", description: "Directional rule (Fleming's LHR), force vector display. Adjust B, I, L, q, v.", icon: GripVertical, categories: ["Magnetism & Electromagnetism"] },
  { id: "flemings-left-hand-rule-animator-g10", name: "G10: Fleming's Left-Hand Rule Animator", grade: "10", description: "Interactive tool to visualize Fleming's Left-Hand Rule for force direction.", icon: Hand, categories: ["Magnetism & Electromagnetism"] },
  { id: "dc-motor-animator-g10", name: "G10: DC Motor Principle Animator", grade: "10", description: "Working of a simple DC motor, coil rotation in magnetic field, commutator action.", icon: RefreshCw, categories: ["Magnetism & Electromagnetism"] },
  { id: "magnetic-fields-forces-g10", name: "G10: Magnetic Fields & Motor Principle", grade: "10", description: "Visualize magnetic fields and simulate the force on a current-carrying wire in a magnetic field (motor principle).", icon: Magnet, categories: ["Magnetism & Electromagnetism"] }, // Merged with force-on-conductor-charge-g10 and dc-motor-animator-g10
  { id: "dispersion-prism-g10", name: "G10: Dispersion of Light (Prism & Rainbow)", grade: "10", description: "Explore how white light disperses into a spectrum through a prism and understand rainbow formation. Adjust prism properties or incident light.", icon: Pipette, categories: ["Light & Optics", "Waves & Oscillations"] },

  // --- Grade 11 (PhET-Inspired & Specific Placeholders) ---
  { id: "phet-forces-motion-friction-g11", name: "G11: PhET: Forces and Motion - Friction Focus", grade: "11", description: "Focuses on static/kinetic friction. PhysicsLab Enhancement: Detailed force vectors, adjustable surfaces/coefficients, Applied Force vs. Friction Force graphs.", icon: GripVertical, categories: ["Dynamics & Forces"] },
  { id: "vector-analysis-lab-g11", name: "G11: Vector Analysis Lab", grade: "11", description: "Component method for addition/subtraction, dot product, cross product. Interactive 2D/3D vectors.", icon: GitFork, categories: ["Kinematics", "Dynamics & Forces", "Measurements & Units"] },
  { id: "vector-addition-perpendicular-components-g11", name: "G11: Vector Addition by Perpendicular Components", grade: "11", description: "Step-by-step interactive graphical method for adding vectors using their perpendicular components.", icon: GitFork, categories: ["Kinematics", "Dynamics & Forces", "Measurements & Units"]},
  { id: "forces-in-equilibrium-g11", name: "G11: Forces in Equilibrium (Concurrent)", grade: "11", description: "Analyze concurrent forces. Adjust magnitudes/angles to achieve equilibrium. Verify Lami's Theorem.", icon: UsersIcon, categories: ["Dynamics & Forces"] },
  { id: "momentum-rocketry-jet-propulsion-g11", name: "G11: Momentum in Rocketry/Jet Propulsion", grade: "11", description: "Conceptual animation explaining rocket/jet engine work based on conservation of momentum.", icon: Rocket, categories: ["Dynamics & Forces"]},
  { id: "phet-energy-skate-park-work-g11", name: "G11: PhET: Energy Skate Park - Work & Energy", grade: "11", description: "Advanced. Add force applicator to do work on skater. PhysicsLab Enhancement: External work visualization, instantaneous power display, 'Power Up' challenge.", icon: PersonStanding, categories: ["Work, Energy & Power"] },
  { id: "conservative-vs-non-conservative-forces-g11", name: "G11: Conservative vs. Non-Conservative Forces", grade: "11", description: "Simulations showing work done by gravity (conservative) is path-independent, while work by friction (non-conservative) is path-dependent.", icon: Route, categories: ["Work, Energy & Power"] },
  { id: "energy-diagram-potential-energy-g11", name: "G11: Energy Diagram for Potential Energy", grade: "11", description: "Interactive potential energy diagrams. Identify stable, unstable, and neutral equilibrium points.", icon: LineChart, categories: ["Work, Energy & Power"] },
  { id: "gravitational-potential-escape-velocity-g11", name: "G11: Gravitational Potential Energy & Escape Velocity", grade: "11", description: "Explore gravitational potential fields, GPE (at large distances, negative value interpretation), and calculate/visualize escape velocity. Graph of GPE vs. distance.", icon: Orbit, categories: ["Gravitation & Orbital Mechanics", "Work, Energy & Power"] },
  { id: "gravitational-potential-energy-large-distances-g11", name: "G11: Gravitational Potential Energy (Large Distances)", grade: "11", description: "Focus on GPE = -GMm/r. Interactive graph, negative value interpretation. Concept of zero potential at infinity.", icon: Orbit, categories: ["Gravitation & Orbital Mechanics", "Work, Energy & Power"]},
  { id: "power-calculation-efficiency-g11", name: "G11: Power Calculation & Efficiency", grade: "11", description: "Work done over time. Vary load, observe power output. Calculate efficiency for various scenarios.", icon: TrendingUp, categories: ["Work, Energy & Power"] },
  { id: "phet-ladybug-revolution-g11", name: "G11: PhET: Ladybug Revolution (Rotational)", grade: "11", description: "Explore angular kinematics. PhysicsLab Enhancement: Visualize vectors, plot angular graphs, 'Break the String' challenge.", icon: Bug, categories: ["Rotational & Circular Motion"] },
  { id: "torque-rotational-equilibrium-g11", name: "G11: Torque & Rotational Equilibrium", grade: "11", description: "Apply forces on a rigid body. Adjust pivot. Explore conditions for rotational equilibrium.", icon: RefreshCw, categories: ["Rotational & Circular Motion"] },
  { id: "angular-kinematics-g11", name: "G11: Angular Kinematics Lab", grade: "11", description: "Rotating disc with point. Visualize angular displacement, velocity, acceleration. Graphs.", icon: RefreshCw, categories: ["Rotational & Circular Motion"] },
  { id: "moment-of-inertia-angular-momentum-g11", name: "G11: Moment of Inertia & Angular Momentum", grade: "11", description: "Explore moment of inertia for different shapes. Simulate conservation of angular momentum (e.g., ice skater).", icon: PersonStanding, categories: ["Rotational & Circular Motion"] },
  { id: "real-world-centripetal-force-g11", name: "G11: Real-world Centripetal Force", grade: "11", description: "Simulate banking of roads and vertical circular motion (bucket of water, loop-the-loop), visualizing forces.", icon: Car, categories: ["Rotational & Circular Motion", "Dynamics & Forces"] },
  { id: "banking-of-roads-g11", name: "G11: Banking of Roads Analyzer", grade: "11", description: "Detailed analysis of forces on a car on a banked turn. Adjust bank angle, speed, coefficient of friction.", icon: Route, categories: ["Rotational & Circular Motion", "Dynamics & Forces"]},
  { id: "artificial-gravity-space-stations-g11", name: "G11: Artificial Gravity in Space Stations", grade: "11", description: "Conceptual animation showing how rotation of a space station can create an apparent gravitational force.", icon: Orbit, categories: ["Rotational & Circular Motion", "Gravitation & Orbital Mechanics"]},
  { id: "phet-my-solar-system-g11", name: "G11: PhET: My Solar System (Gravitation)", grade: "11", description: "N-body gravitational simulator. PhysicsLab Enhancement: Dynamic field visualization, orbital elements display, 'Stable Orbit' challenge.", icon: Orbit, categories: ["Gravitation & Orbital Mechanics"] },
  { id: "satellite-motion-kepler-g11", name: "G11: Orbital Mechanics & Satellite Motion", grade: "11", description: "Circular orbits, geostationary satellites. Visualize Kepler's Laws with adjustable orbital parameters.", icon: Satellite, categories: ["Gravitation & Orbital Mechanics"] },
  { id: "satellite-orbits-types-g11", name: "G11: Satellite Orbits & Types", grade: "11", description: "Interactive visualization comparing Circular, Elliptical, Geostationary, and Polar orbits. Highlight characteristics of each.", icon: Satellite, categories: ["Gravitation & Orbital Mechanics"]},
  { id: "phet-fluid-pressure-flow-g11", name: "G11: PhET: Fluid Pressure and Flow", grade: "11", description: "Explore pressure, Pascal's, Archimedes', Continuity, Bernoulli's. PhysicsLab Enhancement: Pressure viz, buoyancy experiments, hydraulic demo, animated flow.", icon: Droplets, categories: ["Properties of Matter & Fluids"] },
  { id: "streamline-vs-turbulent-flow-g11", name: "G11: Streamline vs. Turbulent Flow", grade: "11", description: "Visualizing fluid flow patterns around objects. Demonstrate transition from streamline to turbulent flow.", icon: Wind, categories: ["Properties of Matter & Fluids"]},
  { id: "venturi-effect-g11", name: "G11: Venturi Effect Animator", grade: "11", description: "Animation showing fluid speed increase and pressure decrease in a constricted pipe.", icon: Combine, categories: ["Properties of Matter & Fluids"]},
  { id: "surface-tension-phenomena-g11", name: "G11: Surface Tension Phenomena", grade: "11", description: "Visualize molecular forces causing surface tension (drop formation, insects on water) and capillary action (meniscus).", icon: TestTube, categories: ["Properties of Matter & Fluids"]},
  { id: "damped-forced-oscillations-g11", name: "G11: Damped & Forced Oscillations", grade: "11", description: "Investigate damped oscillations (amplitude vs. time) and forced oscillations. Observe resonance. Plot amplitude vs. frequency response.", icon: Waves, categories: ["Simple Harmonic Motion", "Waves & Oscillations"] },
  { id: "coupled-oscillators-g11", name: "G11: Coupled Oscillators", grade: "11", description: "Simulate two coupled pendulums or spring-mass systems. Observe energy transfer and normal modes.", icon: GitCommitHorizontal, categories: ["Simple Harmonic Motion", "Waves & Oscillations"]},
  { id: "shm-ucm-relation-g11", name: "G11: SHM & Uniform Circular Motion Relation", grade: "11", description: "Animation showing projection of UCM onto a diameter, demonstrating SHM.", icon: Orbit, categories: ["Simple Harmonic Motion", "Rotational & Circular Motion"]},
  { id: "doppler-effect-animator-g11", name: "G11: Doppler Effect Animator (Sound & Light)", grade: "11", description: "Visualize wavefronts from moving source/observer. Observe changes in perceived frequency/wavelength.", icon: Speaker, categories: ["Sound", "Waves & Oscillations", "Modern Physics"] },
  { id: "intensity-of-sound-light-inverse-square-law-g11", name: "G11: Intensity of Sound/Light (Inverse Square Law)", grade: "11", description: "Visualizing decreasing intensity of sound/light from a point source with distance.", icon: Radio, categories: ["Sound", "Light & Optics", "Waves & Oscillations"]},
  { id: "youngs-double-slit-g11", name: "G11: Young's Double Slit Experiment", grade: "11", description: "Simulate interference patterns of light. Adjust slit separation, wavelength, screen distance. Plot intensity graph.", icon: AlignCenter, categories: ["Light & Optics", "Waves & Oscillations"] },
  { id: "interference-of-waves-2d-g11", name: "G11: 2D Wave Interference", grade: "11", description: "Visualizing overlap of crests/troughs from two point sources creating constructive/destructive interference zones.", icon: Waves, categories: ["Waves & Oscillations"]},
  { id: "coherent-incoherent-sources-g11", name: "G11: Coherent & Incoherent Sources", grade: "11", description: "Conceptual animation comparing interference patterns produced by coherent vs. incoherent light sources.", icon: Lightbulb, categories: ["Light & Optics", "Waves & Oscillations"]},
  { id: "thin-film-interference-g11", name: "G11: Thin Film Interference Visualizer", grade: "11", description: "Conceptual animation showing light paths, phase changes, and interference causing colors in soap bubbles/oil slicks.", icon: SquareRadical, categories: ["Light & Optics", "Waves & Oscillations"] },
  { id: "diffraction-grating-g11", name: "G11: Diffraction Grating Lab", grade: "11", description: "Simulate light passing through a diffraction grating, showing spectra and multiple order maxima. Adjust grating spacing, wavelength.", icon: FunctionSquare, categories: ["Light & Optics", "Waves & Oscillations"] },
  { id: "single-slit-diffraction-g11", name: "G11: Single Slit Diffraction", grade: "11", description: "Visualize diffraction pattern (central maximum, subsidiary maxima/minima). Adjust slit width and wavelength. Plot intensity profile.", icon: AlignCenter, categories: ["Light & Optics", "Waves & Oscillations"]},
  { id: "polarization-of-light-g11", name: "G11: Polarization of Light Lab", grade: "11", description: "Demonstrate transverse nature of light using interactive polarizers. Rotate polarizers, observe intensity changes. Verify Malus's Law.", icon: Aperture, categories: ["Light & Optics", "Waves & Oscillations"] },
  { id: "braggs-law-xray-diffraction-g11", name: "G11: Bragg's Law X-Ray Diffraction", grade: "11", description: "Conceptual animation of X-rays scattering from crystal planes, illustrating constructive interference based on Bragg's Law.", icon: Dna, categories: ["Light & Optics", "Modern Physics"]},
  { id: "thermal-conductivity-g11", name: "G11: Thermal Conductivity Lab", grade: "11", description: "Compare heat flow rate through rods of different materials. Adjust material properties and temperature gradients.", icon: Thermometer, categories: ["Heat & Thermodynamics"] },
  { id: "specific-heat-gases-cp-cv-g11", name: "G11: Specific Heats of Gases (Cp & Cv)", grade: "11", description: "Conceptual explanation/animation of Cp vs. Cv, relation to internal energy, degrees of freedom, Mayer's formula.", icon: SigmaSquare, categories: ["Heat & Thermodynamics"] },
  { id: "thermodynamic-processes-pv-g11", name: "G11: Thermodynamic Processes & P-V Diagrams", grade: "11", description: "Detailed tracing of Isothermal, Isobaric, Isochoric, Adiabatic processes on P-V diagrams. Calculate work done.", icon: LineChart, categories: ["Heat & Thermodynamics"] },
  { id: "work-done-by-gas-pv-diagram-g11", name: "G11: Work Done By/On a Gas (P-V)", grade: "11", description: "Visualizing piston movement. Input P, V changes. Plot on P-V diagram and calculate/visualize work done.", icon: AreaChart, categories: ["Heat & Thermodynamics"]},
  { id: "thermodynamic-cycles-otto-diesel-g11", name: "G11: Thermodynamic Cycles (Otto, Diesel)", grade: "11", description: "Conceptual animations of Otto and Diesel Cycles, P-V diagrams, and key processes.", icon: Cog, categories: ["Heat & Thermodynamics"]},
  { id: "entropy-as-disorder-g11", name: "G11: Entropy as Disorder Visualizer", grade: "11", description: "Conceptual animation of increasing disorder in closed systems (gas expansion, mixing gases).", icon: Shuffle, categories: ["Heat & Thermodynamics"]},
  { id: "electric-field-lines-complex-g11", name: "G11: Electric Field Lines for Complex Distributions", grade: "11", description: "Visualize electric field lines for charged plates, spheres, rings, dipoles. Place test charges.", icon: Zap, categories: ["Electrostatics"] },
  { id: "van-de-graaff-generator-principle-g11", name: "G11: Van de Graaff Generator Principle", grade: "11", description: "Animation showing static charge accumulation on a metal sphere via a moving belt.", icon: Zap, categories: ["Electrostatics"]},
  { id: "gauss-law-animator-g11", name: "G11: Gauss's Law Conceptual Animator", grade: "11", description: "Visualize electric flux through Gaussian surfaces. Understand surface integrals and field calculations.", icon: FunctionSquare, categories: ["Electrostatics"] },
  { id: "electric-flux-calculation-conceptual-g11", name: "G11: Electric Flux Calculation (Conceptual)", grade: "11", description: "Visualizing field lines passing through a surface. Change surface area, orientation, field strength.", icon: AreaChart, categories: ["Electrostatics"]},
  { id: "electric-potential-point-charges-g11", name: "G11: Electric Potential (Point Charges/Dipole)", grade: "11", description: "Map equipotentials and field lines for point charges/dipoles. Calculate potential. Move test charge.", icon: BatteryCharging, categories: ["Electrostatics"] },
  { id: "dielectric-in-capacitor-g11", name: "G11: Dielectric in a Capacitor", grade: "11", description: "Effect of inserting dielectric material on capacitance, electric field, stored energy.", icon: Layers, categories: ["Electrostatics"] },
  { id: "capacitor-networks-g11", name: "G11: Capacitors in Series & Parallel", grade: "11", description: "Equivalent capacitance, charge/voltage distribution for series and parallel capacitor networks.", icon: Network, categories: ["Electrostatics", "Current Electricity"]},
  { id: "wheatstone-potentiometer-g11", name: "G11: Wheatstone Bridge & Potentiometer", grade: "11", description: "Balancing circuits to find unknown resistance or measure/compare EMFs. Show null deflection.", icon: Scale, categories: ["Current Electricity", "Lab Skills & Instruments"] },
  { id: "internal-resistance-terminal-voltage-g11", name: "G11: Internal Resistance & Terminal Voltage", grade: "11", description: "Measure terminal voltage with varying load. Plot V vs. I to find internal resistance and EMF.", icon: BatteryWarning, categories: ["Current Electricity"]},
  { id: "potentiometer-working-principle-g11", name: "G11: Potentiometer Working Principle", grade: "11", description: "Detailed animation of potentiometer circuit, balancing length for EMF measurement.", icon: SlidersHorizontal, categories: ["Current Electricity", "Lab Skills & Instruments"]},
  { id: "magnetic-field-loops-solenoids-g11", name: "G11: Magnetic Fields (Loops & Solenoids)", grade: "11", description: "Detailed 3D field visualization for current loops/solenoids. Apply right-hand rules.", icon: Magnet, categories: ["Magnetism & Electromagnetism"] },
  { id: "magnetic-field-of-earth-g11", name: "G11: Earth's Magnetic Field", grade: "11", description: "Conceptual diagram of Earth's magnetic field, poles, dip/declination. Compass alignment.", icon: Globe, categories: ["Magnetism & Electromagnetism"]},
  { id: "force-on-current-loop-g11", name: "G11: Force/Torque on Current Loop in B-Field", grade: "11", description: "Animated current loop rotating in B-field, visualizing forces and torque. Relate to DC motor.", icon: RefreshCw, categories: ["Magnetism & Electromagnetism"] },
  { id: "galvanometer-ammeter-voltmeter-g11", name: "G11: Galvanometer, Ammeter, Voltmeter Conversion", grade: "11", description: "Principle of moving coil galvanometer and its conversion into ammeter/voltmeter. Interactive circuit adjustments.", icon: Activity, categories: ["Magnetism & Electromagnetism", "Current Electricity", "Lab Skills & Instruments"] },
  { id: "em-induction-faraday-lenz-g11", name: "G11: EM Induction (Faraday's/Lenz's Law)", grade: "11", description: "Simulate changing magnetic flux. Visualize induced EMF/current (Lenz's Law). Factors affecting induced EMF.", icon: Magnet, categories: ["Magnetism & Electromagnetism"]},
  { id: "self-mutual-inductance-g11", name: "G11: Self & Mutual Inductance Animator", grade: "11", description: "Conceptual animations explaining self-inductance (back EMF) and mutual inductance.", icon: Link2, categories: ["Magnetism & Electromagnetism"]},
  { id: "ac-generator-dc-motor-g11", name: "G11: AC Generator & DC Motor Principles", grade: "11", description: "Detailed animations of AC generators (slip rings, sinusoidal EMF) and DC motors (split-ring commutator, torque, back EMF).", icon: Cog, categories: ["Magnetism & Electromagnetism"] },
  { id: "transformer-efficiency-g11", name: "G11: Transformer Principles & Efficiency", grade: "11", description: "Simulate step-up/down transformers. Turns ratio, voltage/current. Power losses and efficiency calculation.", icon: Network, categories: ["Magnetism & Electromagnetism"] },
  { id: "magnetic-hysteresis-loop-g11", name: "G11: Magnetic Hysteresis Loop (B-H Curve)", grade: "11", description: "Interactive B-H curve for ferromagnetic materials. Show retentivity, coercivity, energy loss.", icon: LineChart, categories: ["Magnetism & Electromagnetism", "Properties of Matter & Fluids"]},
  { id: "eddy-currents-demonstration-g11", name: "G11: Eddy Currents Demonstrator", grade: "11", description: "Conceptual animation of eddy current formation and their damping/heating effects. Applications.", icon: Recycle, categories: ["Magnetism & Electromagnetism"]},
  { id: "cro-principle-g11", name: "G11: Cathode Ray Oscilloscope (CRO) Principle", grade: "11", description: "Visualize electron gun, deflection plates, time base, waveform display. Basic V/div, time/div controls.", icon: Activity, categories: ["Electronics", "Lab Skills & Instruments"] },
  { id: "digital-multimeter-working-g11", name: "G11: Digital Multimeter (DMM) Working", grade: "11", description: "Conceptual animation of DMM internal logic for measuring V, I, R, including A/D conversion.", icon: Scale, categories: ["Electronics", "Current Electricity", "Lab Skills & Instruments"]},
  { id: "modulation-demodulation-g11", name: "G11: Modulation & Demodulation (AM/FM)", grade: "11", description: "Conceptual animations of AM/FM, showing carrier waves, modulating signals, encoding/decoding.", icon: RadioTower, categories: ["Communication Systems", "Waves & Oscillations"] },
  { id: "analog-vs-digital-signals-g11", name: "G11: Analog vs. Digital Signals", grade: "11", description: "Visual comparison of analog (continuous) and digital (discrete) waveforms. Highlight noise immunity.", icon: LineChart, categories: ["Communication Systems", "Electronics"]},
  { id: "sampling-quantization-encoding-g11", name: "G11: Analog-to-Digital Conversion (ADC)", grade: "11", description: "Animation of A/D conversion: sampling, quantizing, encoding into binary.", icon: BinaryIcon, categories: ["Communication Systems", "Electronics"]},
  { id: "optical-fiber-communication-g11", name: "G11: Optical Fiber Communication", grade: "11", description: "Animated light path demonstrating TIR in optical fibers. Principles, advantages, components.", icon: Cable, categories: ["Communication Systems", "Light & Optics"] },
  { id: "transmission-media-comparison-g11", name: "G11: Transmission Media Comparison", grade: "11", description: "Interactive comparison: Wire-pairs, Coaxial, Radio/Microwave, Optical Fibers, Satellites. Advantages/disadvantages.", icon: Route, categories: ["Communication Systems"]},
  { id: "satellite-communication-g11", name: "G11: Satellite Communication Systems", grade: "11", description: "Conceptual diagram: geostationary orbits, uplink/downlink, transponders, signal paths.", icon: Satellite, categories: ["Communication Systems", "Gravitation & Orbital Mechanics"]},

  // --- Grade 12 (Placeholders based on blueprint) ---
  { id: "ideal-gas-law-g12", name: "G12: Ideal Gas Law & Thermo Processes", grade: "12", description: "Microscopic view, macroscopic controls (V, T, n), real-time P-V-T display, interactive P-V diagram for processes, Work Done, First Law integration, Maxwell-Boltzmann distribution.", icon: Thermometer, categories: ["Heat & Thermodynamics", "Modern Physics"] },
  { id: "carnot-engine-g12", name: "G12: Carnot Engine Cycle Animator", grade: "12", description: "Step-by-step animation of Carnot cycle with synchronized piston, heat/work visuals, P-V diagram tracing, and efficiency calculation.", icon: Replace, categories: ["Heat & Thermodynamics"] },
  { id: "molecular-speeds-distribution-g12", name: "G12: Molecular Speeds & Distribution", grade: "12", description: "Interactive Maxwell-Boltzmann distribution curve. Adjust temperature, observe shifts in r.m.s, average, and most probable speeds.", icon: BarChart3, categories: ["Heat & Thermodynamics", "Modern Physics"]},
  { id: "entropy-change-calculation-g12", name: "G12: Entropy Change Calculation (Conceptual)", grade: "12", description: "Conceptual examples and calculator for entropy change in reversible/irreversible processes.", icon: SigmaSquare, categories: ["Heat & Thermodynamics"]},
  { id: "refrigerators-heat-pumps-g12", name: "G12: Refrigerators & Heat Pumps Cycle", grade: "12", description: "Conceptual animation of working cycle for refrigerators and heat pumps, energy flow, and COP calculation.", icon: ThermometerSnowflake, categories: ["Heat & Thermodynamics"]},
  { id: "electric-field-potential-g12", name: "G12: Electric Field & Potential Mapper (Adv)", grade: "12", description: "Drag & drop point charges, visualize field lines & equipotentials, move test charge to see force/potential/ΔPE. Presets for dipole, parallel plates.", icon: Zap, categories: ["Electrostatics"] },
  { id: "electric-dipole-in-electric-field-g12", name: "G12: Electric Dipole in an Electric Field", grade: "12", description: "Visualize torque, potential energy of a dipole in a uniform electric field. Animate alignment.", icon: Zap, categories: ["Electrostatics"]},
  { id: "dielectric-strength-breakdown-g12", name: "G12: Dielectric Strength & Breakdown", grade: "12", description: "Conceptual visualization of electric breakdown in insulators when field exceeds dielectric strength.", icon: Zap, categories: ["Electrostatics"]},
  { id: "capacitor-networks-g12", name: "G12: Capacitor Networks Analysis (Adv)", grade: "12", description: "Analyze complex series/parallel capacitor combinations, calculating equivalent capacitance, charge, and voltage distribution.", icon: Network, categories: ["Electrostatics", "Current Electricity"] },
  { id: "capacitor-energy-g12", name: "G12: Energy Stored in a Capacitor", grade: "12", description: "Calculate and visualize the energy stored in a capacitor (U = 1/2 CV^2) with interactive controls for C and V.", icon: BatteryCharging, categories: ["Electrostatics"] },
  { id: "ac-circuit-analyzer-g12", name: "G12: AC Circuit Analyzer (RLC)", grade: "12", description: "Simplified RLC circuit builder, real-time multi-trace oscilloscope, dynamic phasor diagram, Impedance/Reactance/Power Factor display, Resonance visualization.", icon: Activity, categories: ["Current Electricity", "Magnetism & Electromagnetism"] },
  { id: "growth-decay-current-lr-circuit-g12", name: "G12: Current in LR Circuit (Growth & Decay)", grade: "12", description: "Simulate current growth/decay in LR series circuit. Plot I vs. t graphs. Show time constant.", icon: LineChart, categories: ["Current Electricity", "Magnetism & Electromagnetism"]},
  { id: "ac-series-rlc-circuit-impedance-triangle-g12", name: "G12: AC Series RLC Impedance Triangle", grade: "12", description: "Dynamically draw impedance triangle (R, XL, XC, Z) and voltage triangle. Show phase angle.", icon: Triangle, categories: ["Current Electricity", "Magnetism & Electromagnetism"]},
  { id: "ac-power-g12", name: "G12: Power in AC Circuits", grade: "12", description: "Explore Real, Reactive, and Apparent Power in AC circuits. Calculate and visualize Power Factor and the power triangle.", icon: TrendingUp, categories: ["Current Electricity"] },
  { id: "em-induction-lenz-g12", name: "G12: Electromagnetic Induction & Lenz's Law (Adv)", grade: "12", description: "Drag magnet through coil. Real-time flux, induced EMF/current. Visualize Lenz's Law. Simplified AC generator.", icon: Magnet, categories: ["Magnetism & Electromagnetism"] },
  { id: "motional-emf-g12", name: "G12: Motional EMF Visualizer", grade: "12", description: "Simulate conductor moving in B-field. Show induced EMF (Blvsinθ) and current direction.", icon: Move, categories: ["Magnetism & Electromagnetism"]},
  { id: "magnetic-force-parallel-conductors-g12", name: "G12: Force Between Parallel Conductors", grade: "12", description: "Visualize magnetic fields and force (attraction/repulsion) between two parallel current-carrying conductors.", icon: Replace, categories: ["Magnetism & Electromagnetism"]},
  { id: "magnetic-flux-density-visualizer-g12", name: "G12: Magnetic Flux Density (B) Visualizer", grade: "12", description: "Interactive visualization of B-field for various current configurations (wire, loop, solenoid, toroid).", icon: Magnet, categories: ["Magnetism & Electromagnetism"]},
  { id: "mass-spectrometer-g12", name: "G12: Mass Spectrometer Simulator", grade: "12", description: "Visualize ion source, velocity selector, deflection chamber. Adjust m, q, v, E, B. Observe paths & detector hits. q/m ratio graph.", icon: Scale, categories: ["Magnetism & Electromagnetism", "Modern Physics"] },
  { id: "hall-effect-g12", name: "G12: Hall Effect Simulator", grade: "12", description: "Visualize force on charge carriers in a conductor in a magnetic field, leading to Hall voltage. Explore material properties.", icon: Magnet, categories: ["Magnetism & Electromagnetism", "Electronics"]},
  { id: "photoelectric-effect-g12", name: "G12: Photoelectric Effect (Enhanced)", grade: "12", description: "Control light frequency/intensity, metal work function. Visualize photons, emitted electrons, K.E. Plot K.E.max vs. Frequency and Current vs. Intensity. Stopping voltage.", icon: Sun, categories: ["Modern Physics", "Atomic Physics"] },
  { id: "compton-effect-g12", name: "G12: Compton Effect Animator", grade: "12", description: "Conceptual animation of photon-electron scattering, showing wavelength change and energy/momentum transfer.", icon: Sparkles, categories: ["Modern Physics"] },
  { id: "wave-particle-duality-g12", name: "G12: Wave-Particle Duality Visualizer", grade: "12", description: "Conceptual animation of electron diffraction through a crystal lattice or double slit, demonstrating the wave nature of particles.", icon: Waves, categories: ["Modern Physics"] },
  { id: "rutherfords-gold-foil-experiment-g12", name: "G12: Rutherford's Gold Foil Experiment", grade: "12", description: "Animation of alpha particles scattering from gold foil, demonstrating discovery of the nucleus.", icon: Atom, categories: ["Modern Physics", "Nuclear Physics"]},
  { id: "de-broglie-wavelength-matter-waves-g12", name: "G12: De Broglie Wavelength of Matter Waves", grade: "12", description: "Interactive calculator for De Broglie wavelength (λ = h/p). Conceptual illustration of matter waves.", icon: SigmaSquare, categories: ["Modern Physics"]},
  { id: "heisenbergs-uncertainty-principle-g12", name: "G12: Heisenberg's Uncertainty Principle", grade: "12", description: "Conceptual illustration of position-momentum and energy-time uncertainty.", icon: HelpCircle, categories: ["Modern Physics"]},
  { id: "blackbody-radiation-g12", name: "G12: Blackbody Radiation Curve Lab", grade: "12", description: "Interactive graph of blackbody radiation spectrum (Planck's Law). Adjust temperature, observe peak wavelength shift (Wien's Law), compare with Rayleigh-Jeans.", icon: LineChart, categories: ["Modern Physics", "Heat & Thermodynamics"] },
  { id: "atomic-spectra-bohr-g12", name: "G12: Atomic Spectra & Bohr Model Interactive", grade: "12", description: "Interactive energy level diagram for Hydrogen. Electron transitions (absorption/emission), photon visualization, spectrum display (Balmer, Lyman, Paschen series).", icon: Atom, categories: ["Atomic Physics", "Modern Physics"] },
  { id: "origin-of-xrays-g12", name: "G12: Origin of X-Rays", grade: "12", description: "Bremsstrahlung and characteristic X-rays from electron bombardment.", icon: Activity, categories: ["Atomic Physics", "Modern Physics"]},
  { id: "spectrometer-spectroscope-principle-g12", name: "G12: Spectrometer/Spectroscope Principle", grade: "12", description: "Animation showing how a spectrometer (prism or grating) disperses light to form a spectrum for analysis.", icon: Pipette, categories: ["Light & Optics", "Modern Physics", "Lab Skills & Instruments"]},
  { id: "xray-production-spectra-g12", name: "G12: X-Ray Production & Spectra", grade: "12", description: "Conceptual animation of X-ray production, continuous & characteristic X-rays, Bragg's Law. Control voltage/target.", icon: Activity, categories: ["Atomic Physics", "Modern Physics"] }, // Merged with origin-of-xrays-g12
  { id: "laser-principle-g12", name: "G12: Laser Principle Animator", grade: "12", description: "Animated explanation of population inversion, stimulated emission, and coherent light production in a laser.", icon: Zap, categories: ["Atomic Physics", "Modern Physics"] },
  { id: "radioactive-decay-g12", name: "G12: Radioactive Decay Chains Visualizer", grade: "12", description: "Select parent nucleus, animate alpha/beta/gamma decay to daughter. Trace decay chains. Simulate half-life with graph.", icon: Radiation, categories: ["Nuclear Physics", "Modern Physics"] },
  { id: "nuclear-fission-fusion-g12", name: "G12: Nuclear Fission & Fusion Animator", grade: "12", description: "Animated sequences of fission (chain reaction) and fusion. Energy release. Conceptual reactor.", icon: Atom, categories: ["Nuclear Physics", "Modern Physics"] },
  { id: "binding-energy-mass-defect-g12", name: "G12: Binding Energy & Mass Defect", grade: "12", description: "Binding energy per nucleon curve. Mass defect and binding energy calculator (E=mc^2). Nuclear stability.", icon: SigmaSquare, categories: ["Nuclear Physics", "Modern Physics"] },
  { id: "nuclear-forces-vs-electrostatic-forces-g12", name: "G12: Nuclear vs. Electrostatic Forces in Nucleus", grade: "12", description: "Conceptual comparison of strong nuclear force and electrostatic force within the nucleus, relating to nuclear stability.", icon: Atom, categories: ["Nuclear Physics", "Modern Physics"]},
  { id: "radioactive-dating-carbon14-g12", name: "G12: Radioactive Dating (Carbon-14)", grade: "12", description: "Explanation of Carbon-14 dating principle, half-life application for age determination of artifacts.", icon: CalendarClock, categories: ["Nuclear Physics", "Modern Physics"]},
  { id: "nuclear-fusion-in-stars-g12", name: "G12: Nuclear Fusion in Stars (Conceptual)", grade: "12", description: "Conceptual animation of proton-proton chain or CNO cycle in stars like the Sun, showing energy generation.", icon: Sun, categories: ["Nuclear Physics", "Modern Physics", "Gravitation & Orbital Mechanics"]},
  { id: "geiger-muller-counter-working-g12", name: "G12: Geiger-Müller Counter Animator", grade: "12", description: "Animation showing G-M tube detecting ionizing radiation: ionization, avalanche effect, and pulse generation.", icon: AlertTriangle, categories: ["Nuclear Physics", "Modern Physics", "Lab Skills & Instruments"]},
  { id: "cloud-bubble-chamber-g12", name: "G12: Cloud & Bubble Chamber Track Visualizer", grade: "12", description: "Conceptual visualization of particle tracks (alpha, beta, gamma, cosmic rays) in cloud or bubble chambers.", icon: Microscope, categories: ["Nuclear Physics", "Particle Physics", "Modern Physics"]},
  { id: "radioisotope-applications-g12", name: "G12: Applications of Radioisotopes", grade: "12", description: "Conceptual explanations/diagrams of radioisotope uses in medical imaging (tracers, PET), carbon dating, industry.", icon: TestTubeDiagonal, categories: ["Nuclear Physics", "Modern Physics"] },
  { id: "standard-model-explorer-g12", name: "G12: Standard Model Particle Explorer", grade: "12", description: "Interactive diagram of the Standard Model: quarks, leptons, bosons. Explore fundamental forces and particle properties.", icon: BrainCircuit, categories: ["Particle Physics", "Modern Physics"] },
  { id: "particle-accelerators-g12", name: "G12: Particle Accelerators (Conceptual)", grade: "12", description: "Conceptual animations explaining how cyclotrons and synchrotrons accelerate particles to high energies.", icon: Orbit, categories: ["Particle Physics", "Modern Physics"] },
  { id: "quark-confinement-g12", name: "G12: Quark Confinement Visualizer", grade: "12", description: "Conceptual illustration explaining why quarks are never observed in isolation. Hadron formation (mesons, baryons).", icon: Link2, categories: ["Particle Physics", "Modern Physics"]},
  { id: "particle-interactions-feynman-diagrams-g12", name: "G12: Particle Interactions (Feynman Diagrams - Simplified)", grade: "12", description: "Conceptual representation of fundamental particle interactions (e.g., electron-electron scattering via photon exchange) using simplified Feynman diagrams.", icon: GitFork, categories: ["Particle Physics", "Modern Physics"]},
  { id: "black-hole-spacetime-visualizer", name: "Black Hole / Spacetime Curvature Visualizer", grade: "12 / Advanced", description: "Visualizing how massive objects warp spacetime. Place masses, observe gravitational well and trajectories of light/objects.", icon: Orbit, categories: ["Gravitation & Orbital Mechanics", "Modern Physics"] },
  { id: "rocket-launch-rendezvous", name: "Rocket Launch & Orbital Rendezvous Simulator", grade: "11 / 12", description: "Launch rocket to orbit, attempt docking. Control thrust, maneuvers. Concepts: orbital/escape velocity, relative motion.", icon: Rocket, categories: ["Dynamics & Forces", "Kinematics", "Gravitation & Orbital Mechanics"] },
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
  // { term: "update", label: "Check for App Updates Setting", href: "/settings", icon: SettingsIcon },
  { term: "download materials", label: "Download All Materials for Grade", href: "/settings", icon: SettingsIcon },
];


/**
 * List of available quiz topics in the application.
 * This list populates the quizzes page.
 * @property {string} id - Unique identifier for the quiz topic.
 * @property {string} name - The display name for the quiz topic.
 * @property {string} description - A brief description of the quiz topic.
 */
export const QUIZ_TOPICS = [
  {
    id: 'kinematics',
    name: 'Kinematics Quiz',
    description: 'Test your understanding of motion, displacement, velocity, and acceleration.',
  },
  {
    id: 'forces-and-motion',
    name: 'Forces and Motion Quiz',
    description: 'Challenge yourself on Newton\'s laws, friction, and momentum.',
  },
  {
    id: 'work-energy-power',
    name: 'Work, Energy & Power Quiz',
    description: 'Assess your knowledge of work, energy types, conservation, and power.',
  },
  {
    id: 'waves-sound',
    name: 'Waves & Sound Quiz',
    description: 'Questions on wave properties, types of waves, sound characteristics, and phenomena.',
  },
  {
    id: 'light-optics',
    name: 'Light & Optics Quiz',
    description: 'Test your understanding of reflection, refraction, lenses, mirrors, and optical instruments.',
  },
  {
    id: 'electricity-magnetism',
    name: 'Electricity & Magnetism Quiz',
    description: 'Quizzes covering electrostatics, current electricity, and electromagnetism fundamentals.',
  },
  {
    id: 'modern-physics',
    name: 'Modern Physics Quiz',
    description: 'Explore concepts from modern physics including relativity, quantum mechanics, and nuclear physics.',
  }
];

/**
 * Curriculum board identifiers and names.
 * Used for filtering mind maps and potentially other curriculum-specific content.
 */
export const CURRICULUM_BOARDS = [
  { id: "stbb", name: "Sindh Textbook Board (STBB)" },
  { id: "ptbb", name: "Punjab Textbook Board (PTBB)" },
  { id: "national", name: "National Curriculum (Pakistan)" },
  { id: "ziauddin", name: "Ziauddin University Examination Board" },
  // Add more as needed
];

    