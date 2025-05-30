"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Zap, Play, Pause, SkipForward, SkipBack, RotateCcw } from 'lucide-react';
import Link from 'next/link';

// --- Constants & Types ---
const SVG_WIDTH = 700;
const SVG_HEIGHT = 450;
const NUM_ATOMS = 15;

// Energy Levels (visual Y positions)
const LEVEL_Y = {
  GROUND: SVG_HEIGHT - 80,    // E0
  LOWER_LASING: SVG_HEIGHT - 180, // E1
  METASTABLE: SVG_HEIGHT - 280, // E2 (Upper Lasing)
  PUMP: SVG_HEIGHT - 350,       // E3
};

const ATOM_RADIUS = 8;
const PHOTON_RADIUS = 5;

// Laser Cavity Visuals
const CAVITY_X_START = 100;
const CAVITY_X_END = SVG_WIDTH - 100;
const CAVITY_Y_CENTER = (LEVEL_Y.METASTABLE + LEVEL_Y.LOWER_LASING) / 2;
const MIRROR_THICKNESS = 10;

enum EnergyLevel {
  GROUND,
  LOWER_LASING,
  METASTABLE,
  PUMP,
}

interface Atom {
  id: number;
  x: number;
  y: number; // Base y, for display on energy level line
  level: EnergyLevel;
  isTransitioning?: boolean; // For animation indication
  transitionTargetLevel?: EnergyLevel;
  transitionProgress?: number; // 0 to 1
}

interface Photon {
  id: string;
  x: number;
  y: number;
  dx: number; // Direction vector x
  dy: number; // Direction vector y
  color: string;
  type: 'pump' | 'spontaneous' | 'stimulated';
  isAbsorbed?: boolean;
  isExiting?: boolean;
}

enum AnimationStage {
  INTRO,
  PUMPING_START,
  PUMPING_PROCESS,
  POPULATION_INVERSION,
  SPONTANEOUS_EMISSION_START,
  SPONTANEOUS_EMISSION_TRAVEL,
  STIMULATED_EMISSION_TRIGGER,
  STIMULATED_EMISSION_AMPLIFY,
  RESONATOR_AMPLIFICATION,
  LASER_OUTPUT,
  PROPERTIES,
  END,
}

const STAGE_DESCRIPTIONS: Record<AnimationStage, string> = {
  [AnimationStage.INTRO]: "Atoms have discrete energy levels. Most atoms are in the ground state (E0). We will use a 3-level system (E0, E1, E2) for lasing, plus a pump band (E3). E2 is a metastable state.",
  [AnimationStage.PUMPING_START]: "To start, we need to 'pump' energy into the system to excite atoms.",
  [AnimationStage.PUMPING_PROCESS]: "Pump energy excites atoms from ground (E0) to a high pump level (E3). They quickly decay to the metastable state (E2).",
  [AnimationStage.POPULATION_INVERSION]: "Population inversion is achieved: More atoms are in the metastable state (E2) than in the lower lasing state (E1). This is crucial for lasing.",
  [AnimationStage.SPONTANEOUS_EMISSION_START]: "An atom in E2 spontaneously drops to E1, emitting a photon. This photon has random direction and phase.",
  [AnimationStage.SPONTANEOUS_EMISSION_TRAVEL]: "If this photon is aligned with the cavity and hits another atom in E2...",
  [AnimationStage.STIMULATED_EMISSION_TRIGGER]: "...it can trigger stimulated emission. The excited atom de-excites, emitting an identical photon (same energy, phase, direction).",
  [AnimationStage.STIMULATED_EMISSION_AMPLIFY]: "Now there are two identical photons. These can stimulate more emissions, leading to amplification.",
  [AnimationStage.RESONATOR_AMPLIFICATION]: "Mirrors in the optical resonator reflect photons back and forth through the medium, causing a cascade of stimulated emissions.",
  [AnimationStage.LASER_OUTPUT]: "One mirror is partially reflective, allowing some amplified light to escape as the laser beam.",
  [AnimationStage.PROPERTIES]: "Laser light is Monochromatic (single color), Coherent (in phase), Directional (narrow beam), and can be Intense.",
  [AnimationStage.END]: "This demonstrates the basic principle of laser operation. Reset to start over.",
};

const getAtomY = (level: EnergyLevel): number => {
  switch (level) {
    case EnergyLevel.GROUND: return LEVEL_Y.GROUND;
    case EnergyLevel.LOWER_LASING: return LEVEL_Y.LOWER_LASING;
    case EnergyLevel.METASTABLE: return LEVEL_Y.METASTABLE;
    case EnergyLevel.PUMP: return LEVEL_Y.PUMP;
    default: return LEVEL_Y.GROUND;
  }
};
const getAtomColor = (level: EnergyLevel): string => {
  switch (level) {
    case EnergyLevel.GROUND: return "gray";
    case EnergyLevel.LOWER_LASING: return "lightblue";
    case EnergyLevel.METASTABLE: return "orange";
    case EnergyLevel.PUMP: return "red";
    default: return "gray";
  }
};


const LaserPrincipleSim: React.FC = () => {
  const [currentStage, setCurrentStage] = useState<AnimationStage>(AnimationStage.INTRO);
  const [atoms, setAtoms] = useState<Atom[]>([]);
  const [photons, setPhotons] = useState<Photon[]>([]);
  const [pumpActive, setPumpActive] = useState<boolean>(false);
  const [resonatorPhotonCount, setResonatorPhotonCount] = useState(0);


  const animationFrameId = useRef<number | null>(null);
  const stageActionTimeoutId = useRef<NodeJS.Timeout | null>(null);


  const initializeAtoms = useCallback(() => {
    const newAtoms: Atom[] = [];
    const atomSpacing = (CAVITY_X_END - CAVITY_X_START - 20) / (NUM_ATOMS -1);
    for (let i = 0; i < NUM_ATOMS; i++) {
      newAtoms.push({
        id: i,
        x: CAVITY_X_START + 10 + i * atomSpacing,
        y: getAtomY(EnergyLevel.GROUND),
        level: EnergyLevel.GROUND,
      });
    }
    setAtoms(newAtoms);
    setPhotons([]);
    setPumpActive(false);
    setResonatorPhotonCount(0);
  }, []);

  useEffect(() => {
    initializeAtoms();
  }, [initializeAtoms]);

  // Stage-specific logic and animations
  useEffect(() => {
    if (stageActionTimeoutId.current) clearTimeout(stageActionTimeoutId.current);
    setPhotons([]); // Clear photons on most stage changes, unless specifically handled

    switch (currentStage) {
      case AnimationStage.INTRO:
        initializeAtoms(); // Ensure atoms are reset
        break;

      case AnimationStage.PUMPING_START:
        setPumpActive(true);
        // Stage auto-advances or waits for user
        stageActionTimeoutId.current = setTimeout(() => setCurrentStage(AnimationStage.PUMPING_PROCESS), 1500);
        break;

      case AnimationStage.PUMPING_PROCESS:
        setPumpActive(true);
        // Animate atoms moving to metastable state
        setAtoms(prevAtoms => prevAtoms.map((atom, i) => 
            // Excite ~70% of atoms
            i < NUM_ATOMS * 0.7 ? { ...atom, level: EnergyLevel.METASTABLE, y: getAtomY(EnergyLevel.METASTABLE) } : atom
        ));
        stageActionTimeoutId.current = setTimeout(() => setCurrentStage(AnimationStage.POPULATION_INVERSION), 2000);
        break;

      case AnimationStage.POPULATION_INVERSION:
        setPumpActive(false);
        // Verification: atoms should be mostly in metastable
        break;

      case AnimationStage.SPONTANEOUS_EMISSION_START:
        // One atom spontaneously emits
        setAtoms(prevAtoms => {
            const excitedAtoms = prevAtoms.filter(a => a.level === EnergyLevel.METASTABLE);
            if (excitedAtoms.length > 0) {
                const emittingAtom = excitedAtoms[Math.floor(Math.random() * excitedAtoms.length)];
                const newPhotons: Photon[] = [{
                    id: `spont-${Date.now()}`,
                    x: emittingAtom.x,
                    y: emittingAtom.y,
                    dx: 1, dy: 0, // Travels right initially
                    color: 'cyan', type: 'spontaneous'
                }];
                setPhotons(newPhotons);
                return prevAtoms.map(a => a.id === emittingAtom.id ? 
                    { ...a, level: EnergyLevel.LOWER_LASING, y: getAtomY(EnergyLevel.LOWER_LASING) } : a
                );
            }
            return prevAtoms;
        });
        stageActionTimeoutId.current = setTimeout(() => setCurrentStage(AnimationStage.SPONTANEOUS_EMISSION_TRAVEL), 500);
        break;
      
      case AnimationStage.SPONTANEOUS_EMISSION_TRAVEL:
        // Photon moves, if hits another atom in E2...
        // This is a simplified trigger for next stage. Real sim needs collision.
        // Auto-advance after photon travels a bit
        break; // Animation handled in main loop

      case AnimationStage.STIMULATED_EMISSION_TRIGGER:
        // Assume the spontaneous photon (if present) triggers one stimulated emission
        const firstPhoton = photons.find(p => p.type === 'spontaneous');
        if (firstPhoton) {
            setAtoms(prevAtoms => {
                const targetableAtoms = prevAtoms.filter(a => a.level === EnergyLevel.METASTABLE && Math.abs(a.y - firstPhoton.y) < 10 && a.x > firstPhoton.x);
                if (targetableAtoms.length > 0) {
                    const stimulatedAtom = targetableAtoms[0]; // Simplistic: pick first one in path
                    setPhotons(prevPhotons => [...prevPhotons, {
                        id: `stim-${Date.now()}`,
                        x: stimulatedAtom.x, y: stimulatedAtom.y,
                        dx: 1, dy: 0, color: 'cyan', type: 'stimulated'
                    }]);
                    return prevAtoms.map(a => a.id === stimulatedAtom.id ? 
                        { ...a, level: EnergyLevel.LOWER_LASING, y: getAtomY(EnergyLevel.LOWER_LASING) } : a
                    );
                }
                return prevAtoms;
            });
        }
        stageActionTimeoutId.current = setTimeout(() => setCurrentStage(AnimationStage.STIMULATED_EMISSION_AMPLIFY), 1000);
        break;

      case AnimationStage.STIMULATED_EMISSION_AMPLIFY:
      case AnimationStage.RESONATOR_AMPLIFICATION:
      case AnimationStage.LASER_OUTPUT:
        // More photons created, bouncing, some exit.
        // These stages primarily rely on the animation loop updating photon positions and numbers.
        // For simplicity, resonatorPhotonCount state will just increase.
        if (currentStage === AnimationStage.RESONATOR_AMPLIFICATION) setResonatorPhotonCount(5); // Show some photons
        if (currentStage === AnimationStage.LASER_OUTPUT) setResonatorPhotonCount(10); // Show more
        break;
    }

  }, [currentStage, initializeAtoms]);

  // Main Animation Loop (for photons, transitions etc.)
  useEffect(() => {
    const loop = () => {
      if (currentStage >= AnimationStage.SPONTANEOUS_EMISSION_TRAVEL && currentStage < AnimationStage.PROPERTIES) {
        setPhotons(prevPhotons => 
          prevPhotons.map(p => {
            let newX = p.x + p.dx * 5; // Photon speed
            let newY = p.y + p.dy * 5;
            let newDx = p.dx;
            let newDy = p.dy;
            let absorbed = p.isAbsorbed;
            let exiting = p.isExiting;

            if (exiting) {
                if (newX > SVG_WIDTH + 20) absorbed = true; // Disappear after exiting
            } else {
                 // Mirror reflections
                if (newX > CAVITY_X_END - PHOTON_RADIUS) {
                    if (p.type === 'stimulated' || p.type === 'spontaneous') { // Check if it's a lasing photon
                        const shouldExit = Math.random() < 0.3; // 30% chance to exit right mirror
                        if (currentStage === AnimationStage.LASER_OUTPUT && shouldExit) {
                            exiting = true; // Exits through partial mirror
                        } else {
                            newDx = -p.dx; // Reflect
                            newX = CAVITY_X_END - PHOTON_RADIUS;
                        }
                    } else {
                        newDx = -p.dx; // Pump photons might also reflect for demo
                        newX = CAVITY_X_END - PHOTON_RADIUS;
                    }
                }
                if (newX < CAVITY_X_START + PHOTON_RADIUS) {
                    newDx = -p.dx; // Reflect off left mirror
                    newX = CAVITY_X_START + PHOTON_RADIUS;
                }

                // Simple stimulated emission check
                if (!absorbed && !exiting && (p.type === 'stimulated' || p.type === 'spontaneous')) {
                    atoms.forEach(atom => {
                        if (atom.level === EnergyLevel.METASTABLE && 
                            Math.abs(newX - atom.x) < ATOM_RADIUS + PHOTON_RADIUS &&
                            Math.abs(newY - atom.y) < ATOM_RADIUS + PHOTON_RADIUS &&
                            Math.random() < 0.1) { // Probability of stimulation per frame
                            
                            setAtoms(prev => prev.map(a => a.id === atom.id ? 
                                { ...a, level: EnergyLevel.LOWER_LASING, y: getAtomY(EnergyLevel.LOWER_LASING) } : a
                            ));
                            // Add a new photon. Need to push to a temporary array or use setPhotons with a function.
                            // This simplified loop doesn't easily add new photons inside map.
                            // For a real sim, photon creation needs careful handling to avoid issues.
                            // Here, we'll just visually increase resonatorPhotonCount
                            if (currentStage >= AnimationStage.STIMULATED_EMISSION_AMPLIFY && currentStage <= AnimationStage.LASER_OUTPUT) {
                                setResonatorPhotonCount(c => Math.min(20, c + 1));
                            }
                        }
                    });
                }
            }
            
            return { ...p, x: newX, y: newY, dx: newDx, dy: newDy, isAbsorbed: absorbed, isExiting: exiting };
          }).filter(p => !p.isAbsorbed)
        );
      }
      animationFrameId.current = requestAnimationFrame(loop);
    };
    animationFrameId.current = requestAnimationFrame(loop);
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [currentStage, atoms]); // atoms dependency for stimulated emission check

  const handleNextStage = () => setCurrentStage(prev => Math.min(prev + 1, AnimationStage.END));
  const handlePrevStage = () => setCurrentStage(prev => Math.max(prev - 1, AnimationStage.INTRO));
  const handleReset = () => {
    setCurrentStage(AnimationStage.INTRO);
    initializeAtoms(); // This also clears photons and pumpActive
  };

  return (
    <div className="space-y-6 p-1">
      <div className="flex items-center justify-between">
        <Button variant="outline" asChild size="sm">
          <Link href="/simulations">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Simulations
          </Link>
        </Button>
        <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
          <Zap className="h-6 w-6 md:h-8 md:w-8 text-primary" />
          G12: Laser Principle Animator
        </CardTitle>
      </div>

      <Card>
        <CardHeader>
            <CardTitle className="text-lg text-center">Stage: {AnimationStage[currentStage].replace(/_/g, ' ')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-2">
          <svg width={SVG_WIDTH} height={SVG_HEIGHT} className="border rounded-md bg-slate-800 overflow-hidden">
            {/* Energy Level Lines & Labels */}
            <line x1="50" y1={LEVEL_Y.GROUND} x2={SVG_WIDTH - 50} y2={LEVEL_Y.GROUND} stroke="lightgray" strokeDasharray="4 2"/>
            <text x="30" y={LEVEL_Y.GROUND + 5} fill="lightgray" fontSize="12">E0</text>
            <line x1="50" y1={LEVEL_Y.LOWER_LASING} x2={SVG_WIDTH - 50} y2={LEVEL_Y.LOWER_LASING} stroke="lightgray" strokeDasharray="4 2"/>
            <text x="30" y={LEVEL_Y.LOWER_LASING + 5} fill="lightgray" fontSize="12">E1</text>
            <line x1="50" y1={LEVEL_Y.METASTABLE} x2={SVG_WIDTH - 50} y2={LEVEL_Y.METASTABLE} stroke="orange" strokeWidth="2"/>
            <text x="30" y={LEVEL_Y.METASTABLE + 5} fill="orange" fontSize="12">E2 (Metastable)</text>
            <line x1="50" y1={LEVEL_Y.PUMP} x2={SVG_WIDTH - 50} y2={LEVEL_Y.PUMP} stroke="red" strokeDasharray="4 2"/>
            <text x="30" y={LEVEL_Y.PUMP + 5} fill="red" fontSize="12">E3 (Pump)</text>

            {/* Laser Cavity Mirrors */}
            <rect x={CAVITY_X_START - MIRROR_THICKNESS} y={CAVITY_Y_CENTER - 80} width={MIRROR_THICKNESS} height="160" fill="silver" />
            <rect x={CAVITY_X_END} y={CAVITY_Y_CENTER - 80} width={MIRROR_THICKNESS} height="160" fill="rgba(192,192,192,0.7)" />
            <text x={CAVITY_X_START - MIRROR_THICKNESS - 35} y={CAVITY_Y_CENTER} fill="white" fontSize="10">Mirror (100%)</text>
            <text x={CAVITY_X_END + MIRROR_THICKNESS + 5} y={CAVITY_Y_CENTER} fill="white" fontSize="10">Mirror (Partial)</text>


            {/* Atoms */}
            {atoms.map(atom => (
              <circle key={atom.id} cx={atom.x} cy={getAtomY(atom.level)} r={ATOM_RADIUS} fill={getAtomColor(atom.level)} stroke="white" strokeWidth="0.5"/>
            ))}

            {/* Pump Animation Visual */}
            {pumpActive && Array.from({length: 5}).map((_, i) => (
                <path key={`pump-${i}`} 
                    d={`M ${SVG_WIDTH/2 - 50 + i*20} ${LEVEL_Y.PUMP + 50} Q ${SVG_WIDTH/2 - 40 + i*20} ${LEVEL_Y.PUMP + 20}, ${SVG_WIDTH/2 - 50 + i*20} ${LEVEL_Y.PUMP - 10}`}
                    stroke="yellow" strokeWidth="2" fill="none" opacity={Math.random()}>
                    <animate attributeName="opacity" values="0;1;0" dur="1s" repeatCount="indefinite" />
                </path>
            ))}
            
            {/* Photons */}
            {photons.map(p => (
              <circle key={p.id} cx={p.x} cy={p.y} r={PHOTON_RADIUS} fill={p.color} opacity={p.isAbsorbed || (p.isExiting && p.x > CAVITY_X_END + MIRROR_THICKNESS)? 0 : 1}/>
            ))}
            {/* Simplified representation of amplified photons in cavity */}
            {currentStage >= AnimationStage.RESONATOR_AMPLIFICATION && currentStage < AnimationStage.PROPERTIES &&
             Array.from({length: resonatorPhotonCount}).map((_, i) => (
                <circle key={`res-p-${i}`} 
                    cx={CAVITY_X_START + 10 + Math.random()*(CAVITY_X_END - CAVITY_X_START - 20)}
                    cy={CAVITY_Y_CENTER - 10 + Math.random()*20}
                    r={PHOTON_RADIUS-1} fill="cyan" opacity="0.7"
                />
            ))}
            {/* Output Laser Beam */}
            {currentStage === AnimationStage.LASER_OUTPUT && (
                <rect x={CAVITY_X_END + MIRROR_THICKNESS} y={CAVITY_Y_CENTER - 5} width="150" height="10" fill="rgba(0,255,255,0.7)">
                    <animate attributeName="width" from="0" to="150" dur="0.5s" fill="freeze" />
                </rect>
            )}

          </svg>
          <CardDescription className="h-24 text-center p-2 border rounded-md w-full md:w-3/4 text-sm bg-background">
            {STAGE_DESCRIPTIONS[currentStage]}
          </CardDescription>
        </CardContent>
      </Card>

      <div className="flex justify-center items-center gap-2 md:gap-4">
        <Button onClick={handlePrevStage} disabled={currentStage === AnimationStage.INTRO} variant="outline" size="sm">
            <SkipBack className="mr-1 h-4 w-4" /> Prev
        </Button>
        <Button onClick={handleReset} variant="destructive" size="sm">
            <RotateCcw className="mr-1 h-4 w-4" /> Reset
        </Button>
        <Button onClick={handleNextStage} disabled={currentStage === AnimationStage.END} variant="outline" size="sm">
            Next <SkipForward className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default function LaserPrincipleG12PageWrapper() {
    return <LaserPrincipleSim />;
}