"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Orbit, Play, Pause, SkipForward, SkipBack, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { Label } from '@/components/ui/label'; // For potential future controls
import { Slider } from '@/components/ui/slider';   // For potential future controls


// --- Constants & Types ---
const SVG_WIDTH = 700;
const SVG_HEIGHT = 450;
const PARTICLE_RADIUS = 5;

// Cyclotron Specific
const DEE_RADIUS = 150;
const DEE_GAP = 20;
const CYCLO_CENTER_X = SVG_WIDTH / 2;
const CYCLO_CENTER_Y = SVG_HEIGHT / 2 - 20;

enum CycloStage {
  INTRO, ACCEL_1, BEND_1, FLIP_VOLTAGE_1, ACCEL_2, BEND_2, REPEAT_CYCLE, EXTRACTION, INFO
}
const CYCLO_DESCRIPTIONS: Record<CycloStage, string> = {
  [CycloStage.INTRO]: "A Cyclotron uses a magnetic field (into page 'X') to bend charged particles and an alternating electric field across the gap between two 'Dees' to accelerate them.",
  [CycloStage.ACCEL_1]: "Initially, Dee1 is positive, Dee2 negative. A positive particle (e.g., proton) is accelerated across the gap towards Dee2.",
  [CycloStage.BEND_1]: "Inside Dee2 (no E-field), the magnetic field bends the particle in a semi-circular path.",
  [CycloStage.FLIP_VOLTAGE_1]: "As the particle approaches the gap, the AC voltage flips. Now Dee2 is positive, Dee1 negative.",
  [CycloStage.ACCEL_2]: "The particle is accelerated again, this time towards Dee1, gaining more energy.",
  [CycloStage.BEND_2]: "Moving faster, the particle follows a larger semi-circular path inside Dee1.",
  [CycloStage.REPEAT_CYCLE]: "This process repeats. The particle spirals outwards, gaining energy with each gap crossing.",
  [CycloStage.EXTRACTION]: "Eventually, the high-energy particle is extracted from the cyclotron for experiments.",
  [CycloStage.INFO]: "Cyclotrons are limited by relativistic effects at very high speeds as particle mass increases."
};

// Synchrotron Specific
const SYNCHRO_RING_RADIUS = 160;
const SYNCHRO_CENTER_X = SVG_WIDTH / 2;
const SYNCHRO_CENTER_Y = SVG_HEIGHT / 2;
const SYNCHRO_MAGNET_SIZE = 30;
const SYNCHRO_RF_CAVITY_SIZE = 40;

enum SynchroStage {
  INTRO, INJECTION, GUIDANCE_1, RF_ACCEL_1, GUIDANCE_2, MAGNET_ADJUST, MULTIPLE_LAPS, EXTRACTION_COLLISION, INFO
}
const SYNCHRO_DESCRIPTIONS: Record<SynchroStage, string> = {
  [SynchroStage.INTRO]: "A Synchrotron accelerates particles in a fixed circular path using guiding magnets and RF accelerating cavities.",
  [SynchroStage.INJECTION]: "A bunch of particles is injected from a pre-accelerator into the main ring.",
  [SynchroStage.GUIDANCE_1]: "Guiding magnets (dipoles) bend the particle bunch, keeping it on the circular path.",
  [SynchroStage.RF_ACCEL_1]: "The bunch passes through an RF (Radio Frequency) cavity, receiving an energy boost from an oscillating electric field.",
  [SynchroStage.GUIDANCE_2]: "The bunch continues along the path, guided by more magnets.",
  [SynchroStage.MAGNET_ADJUST]: "As particles gain energy, the strength of the guiding magnets must increase to maintain the same orbital radius (r = mv/qB).",
  [SynchroStage.MULTIPLE_LAPS]: "This process repeats over many laps. Particles gain energy incrementally with each pass through an RF cavity.",
  [SynchroStage.EXTRACTION_COLLISION]: "High-energy beams can be extracted for fixed-target experiments or made to collide with other beams.",
  [SynchroStage.INFO]: "Synchrotrons can achieve much higher energies than cyclotrons and are crucial for particle physics research."
};

interface ParticleState {
  x: number; y: number;
  angleDeg: number; // For circular/spiral motion
  radius: number;   // Current orbital radius (cyclotron) or fixed (synchrotron)
  speedFactor: number; // Affects animation speed, represents energy conceptually
  pathPoints?: string; // For drawing cyclotron spiral
}


const ParticleAcceleratorsG12Page: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"cyclotron" | "synchrotron">("cyclotron");
  
  // Cyclotron State
  const [cycloStage, setCycloStage] = useState<CycloStage>(CycloStage.INTRO);
  const [cycloParticle, setCycloParticle] = useState<ParticleState>({ x: CYCLO_CENTER_X, y: CYCLO_CENTER_Y - DEE_GAP/2, angleDeg: 0, radius: DEE_GAP/2, speedFactor: 0.5, pathPoints: `${CYCLO_CENTER_X},${CYCLO_CENTER_Y - DEE_GAP/2}` });
  const [cycloDeePolarity, setCycloDeePolarity] = useState<1 | -1>(1); // 1: D1 pos, D2 neg. -1: D1 neg, D2 pos

  // Synchrotron State
  const [synchroStage, setSynchroStage] = useState<SynchroStage>(SynchroStage.INTRO);
  const [synchroParticleBunch, setSynchroParticleBunch] = useState<ParticleState>({ x: 0, y: 0, angleDeg: 0, radius: SYNCHRO_RING_RADIUS, speedFactor: 0.5 });
  const [synchroMagnetStrength, setSynchroMagnetStrength] = useState(0.5); // 0 to 1
  const [synchroRFCavityActive, setSynchroRFCavityActive] = useState(false);

  const animationFrameIdRef = useRef<number | null>(null);
  const stageTimeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  const resetCyclo = useCallback(() => {
    setCycloStage(CycloStage.INTRO);
    setCycloParticle({ x: CYCLO_CENTER_X, y: CYCLO_CENTER_Y - DEE_GAP/2, angleDeg: 180, radius: DEE_GAP/2, speedFactor: 0.5, pathPoints: `${CYCLO_CENTER_X},${CYCLO_CENTER_Y - DEE_GAP/2}` });
    setCycloDeePolarity(1);
    if (stageTimeoutIdRef.current) clearTimeout(stageTimeoutIdRef.current);
  }, []);

  const resetSynchro = useCallback(() => {
    setSynchroStage(SynchroStage.INTRO);
    // Initial position at rightmost point (angle 0)
    setSynchroParticleBunch({ 
        x: SYNCHRO_CENTER_X + SYNCHRO_RING_RADIUS, 
        y: SYNCHRO_CENTER_Y, 
        angleDeg: 0, 
        radius: SYNCHRO_RING_RADIUS, 
        speedFactor: 0.5 
    });
    setSynchroMagnetStrength(0.5);
    setSynchroRFCavityActive(false);
    if (stageTimeoutIdRef.current) clearTimeout(stageTimeoutIdRef.current);
  }, []);

  useEffect(() => {
    if (activeTab === "cyclotron") resetCyclo();
    else resetSynchro();
  }, [activeTab, resetCyclo, resetSynchro]);

  // Cyclotron Stage Logic & Animation Trigger
  useEffect(() => {
    if (activeTab !== "cyclotron") return;
    if (stageTimeoutIdRef.current) clearTimeout(stageTimeoutIdRef.current);

    let nextStageDelay = 2500; // Default delay

    switch (cycloStage) {
      case CycloStage.INTRO:
        setCycloParticle(prev => ({...prev, x: CYCLO_CENTER_X, y: CYCLO_CENTER_Y - DEE_GAP/2, radius: DEE_GAP/2, angleDeg: 180, speedFactor: 0.5, pathPoints: `${CYCLO_CENTER_X},${CYCLO_CENTER_Y - DEE_GAP/2}`}));
        setCycloDeePolarity(1);
        break;
      case CycloStage.ACCEL_1: // Particle moves across gap
        setCycloParticle(prev => ({...prev, speedFactor: prev.speedFactor + 0.2 }));
        // Animation will move it; then auto-advance
        nextStageDelay = 1000 / (cycloParticle.speedFactor || 0.1); // Faster particle, shorter delay
        break;
      case CycloStage.BEND_1: // Particle completes semi-circle
        setCycloParticle(prev => ({...prev, radius: prev.radius + 15 * prev.speedFactor, angleDeg: prev.angleDeg + 180}));
        nextStageDelay = 2000 / (cycloParticle.speedFactor || 0.1);
        break;
      case CycloStage.FLIP_VOLTAGE_1:
        setCycloDeePolarity(prev => prev * -1 as (1 | -1));
        nextStageDelay = 500;
        break;
       case CycloStage.ACCEL_2:
        setCycloParticle(prev => ({...prev, speedFactor: prev.speedFactor + 0.2 }));
        nextStageDelay = 1000 / (cycloParticle.speedFactor || 0.1);
        break;
      case CycloStage.BEND_2:
        setCycloParticle(prev => ({...prev, radius: prev.radius + 15 * prev.speedFactor, angleDeg: prev.angleDeg + 180}));
        nextStageDelay = 2000 / (cycloParticle.speedFactor || 0.1);
        break;
      case CycloStage.REPEAT_CYCLE: // Show a few more cycles quickly
         setCycloParticle(prev => ({
            ...prev, 
            speedFactor: Math.min(2.5, prev.speedFactor + 0.3), 
            radius: Math.min(DEE_RADIUS - 10, prev.radius + 20 * prev.speedFactor),
            angleDeg: prev.angleDeg + 180
        }));
        setCycloDeePolarity(prev => prev * -1 as (1 | -1));
        // If radius is large enough, move to extraction
        if (cycloParticle.radius > DEE_RADIUS * 0.8) {
            stageTimeoutIdRef.current = setTimeout(() => setCycloStage(CycloStage.EXTRACTION), 1500);
            return;
        }
        nextStageDelay = 1000 / (cycloParticle.speedFactor || 0.1);
        break;
      case CycloStage.EXTRACTION:
        // Particle moves out (visual effect)
        nextStageDelay = 2000;
        break;
    }
    if (cycloStage < CycloStage.INFO && cycloStage !== CycloStage.REPEAT_CYCLE || (cycloStage === CycloStage.REPEAT_CYCLE && cycloParticle.radius <= DEE_RADIUS * 0.8)) {
      stageTimeoutIdRef.current = setTimeout(() => {
        setCycloStage(prev => Math.min(prev + 1, CycloStage.INFO) as CycloStage);
      }, nextStageDelay);
    } else if (cycloStage === CycloStage.REPEAT_CYCLE && cycloParticle.radius > DEE_RADIUS * 0.8) {
        // Handled by specific transition to EXTRACTION
    }


  }, [cycloStage, activeTab, cycloParticle.speedFactor, cycloParticle.radius]); // Added speedFactor, radius

  // Synchrotron Stage Logic
  useEffect(() => {
    if (activeTab !== "synchrotron") return;
    if (stageTimeoutIdRef.current) clearTimeout(stageTimeoutIdRef.current);
    let nextStageDelay = 2500;

    switch (synchroStage) {
      case SynchroStage.INJECTION:
        setSynchroParticleBunch(prev => ({...prev, angleDeg: 45, speedFactor: 0.6})); // Injected and moving
        break;
      case SynchroStage.GUIDANCE_1: // Pass one magnet
        setSynchroParticleBunch(prev => ({...prev, angleDeg: prev.angleDeg + 45}));
        break;
      case SynchroStage.RF_ACCEL_1:
        setSynchroRFCavityActive(true);
        setSynchroParticleBunch(prev => ({...prev, speedFactor: Math.min(2.0, prev.speedFactor + 0.3), angleDeg: prev.angleDeg + 45}));
        nextStageDelay = 1000;
        break;
      case SynchroStage.GUIDANCE_2:
        setSynchroRFCavityActive(false);
        setSynchroParticleBunch(prev => ({...prev, angleDeg: prev.angleDeg + 45}));
        break;
      case SynchroStage.MAGNET_ADJUST:
        setSynchroMagnetStrength(prev => Math.min(1, prev + 0.2));
        nextStageDelay = 1000;
        break;
      case SynchroStage.MULTIPLE_LAPS:
        setSynchroParticleBunch(prev => ({
            ...prev, 
            speedFactor: Math.min(2.5, prev.speedFactor + 0.1),
            angleDeg: (prev.angleDeg + 30 * prev.speedFactor) % 360 // Continuous motion
        }));
        setSynchroMagnetStrength(prev => Math.min(1, prev + 0.05));
        if (synchroParticleBunch.angleDeg > 350 && synchroParticleBunch.angleDeg < 30) setSynchroRFCavityActive(true); else setSynchroRFCavityActive(false); // Activate RF near 0 deg
        // If speed factor is high, move to extraction
        if (synchroParticleBunch.speedFactor > 2.0) {
             stageTimeoutIdRef.current = setTimeout(() => setSynchroStage(SynchroStage.EXTRACTION_COLLISION), 1500);
             return;
        }
        nextStageDelay = 300; // Faster laps
        break;
      case SynchroStage.EXTRACTION_COLLISION:
        setSynchroRFCavityActive(false);
        // Particle exits or collides (visual effect)
        break;
    }
    if (synchroStage < SynchroStage.INFO && synchroStage !== SynchroStage.MULTIPLE_LAPS || (synchroStage === SynchroStage.MULTIPLE_LAPS && synchroParticleBunch.speedFactor <= 2.0)) {
       stageTimeoutIdRef.current = setTimeout(() => {
        setSynchroStage(prev => Math.min(prev + 1, SynchroStage.INFO) as SynchroStage);
      }, nextStageDelay);
    }

  }, [synchroStage, activeTab, synchroParticleBunch.speedFactor, synchroParticleBunch.angleDeg]); // Added dependencies

  // Main Animation Loop (for smooth particle movement)
  useEffect(() => {
    const loop = (timestamp: number) => {
      if (activeTab === "cyclotron") {
        if (cycloStage >= CycloStage.ACCEL_1 && cycloStage < CycloStage.EXTRACTION) {
          setCycloParticle(prev => {
            let { x, y, angleDeg, radius, speedFactor, pathPoints } = prev;
            const angularSpeed = speedFactor * 2; // Degrees per frame
            const linearSpeedGap = speedFactor * 5;

            if (cycloStage === CycloStage.ACCEL_1 || cycloStage === CycloStage.ACCEL_2 || (cycloStage === CycloStage.REPEAT_CYCLE && (Math.abs(y - CYCLO_CENTER_Y) < DEE_GAP))) { // Accelerating in gap
              // Polarity 1 means D1 (+), D2 (-). Particle moves towards D2 (-y direction if D2 is bottom).
              // Here, D1 is left, D2 is right.
              // Polarity 1: D1 left (+), D2 right (-). Proton moves right (+x).
              // Polarity -1: D1 left (-), D2 right (+). Proton moves left (-x).
              x += cycloDeePolarity * linearSpeedGap;
              // Check if crossed gap
              if ((cycloDeePolarity === 1 && x >= CYCLO_CENTER_X + DEE_GAP/2) || (cycloDeePolarity === -1 && x <= CYCLO_CENTER_X - DEE_GAP/2)) {
                // Transition to bending stage, path point needs to be where it *enters* the dee
                 if (cycloStage !== CycloStage.REPEAT_CYCLE) setCycloStage(s => s + 1 as CycloStage);
              }
            } else { // Bending in Dee
              angleDeg += angularSpeed * (cycloDeePolarity); // Direction of bend depends on which Dee it's in conceptually
              x = CYCLO_CENTER_X + radius * Math.cos(angleDeg * Math.PI / 180);
              y = CYCLO_CENTER_Y + radius * Math.sin(angleDeg * Math.PI / 180);
              // Check if completed semi-circle
              if ( (cycloDeePolarity === 1 && angleDeg % 360 >= 180 && angleDeg % 360 <= 180 + angularSpeed*2 && x < CYCLO_CENTER_X) || // Exiting D2 (right)
                   (cycloDeePolarity === -1 && angleDeg % 360 >= 0 && angleDeg % 360 <= angularSpeed*2 && x > CYCLO_CENTER_X) ) {    // Exiting D1 (left)
                 if (cycloStage !== CycloStage.REPEAT_CYCLE) setCycloStage(s => s + 1 as CycloStage);
              }
            }
            pathPoints += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
            if (pathPoints.length > 1000) pathPoints = pathPoints.substring(pathPoints.length-1000); // Keep path length manageable

            return { ...prev, x, y, angleDeg, pathPoints };
          });
        }
      } else if (activeTab === "synchrotron") {
        if (synchroStage >= SynchroStage.INJECTION && synchroStage < SynchroStage.EXTRACTION_COLLISION) {
          setSynchroParticleBunch(prev => {
            let newAngleDeg = (prev.angleDeg + prev.speedFactor * 1.5) % 360; // Adjust speed factor for visuals
            const newX = SYNCHRO_CENTER_X + prev.radius * Math.cos(newAngleDeg * Math.PI / 180);
            const newY = SYNCHRO_CENTER_Y + prev.radius * Math.sin(newAngleDeg * Math.PI / 180);
            return { ...prev, x: newX, y: newY, angleDeg: newAngleDeg };
          });
        }
      }
      animationFrameIdRef.current = requestAnimationFrame(loop);
    };
    animationFrameIdRef.current = requestAnimationFrame(loop);
    return () => {
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, [activeTab, cycloStage, synchroStage, cycloDeePolarity]); // Dependencies that control animation behavior

  // Navigation handlers
  const handleNext = () => {
    if (activeTab === "cyclotron") setCycloStage(prev => Math.min(prev + 1, CycloStage.INFO) as CycloStage);
    else setSynchroStage(prev => Math.min(prev + 1, SynchroStage.INFO) as SynchroStage);
  };
  const handlePrev = () => {
    if (activeTab === "cyclotron") setCycloStage(prev => Math.max(prev - 1, CycloStage.INTRO) as CycloStage);
    else setSynchroStage(prev => Math.max(prev - 1, SynchroStage.INTRO) as SynchroStage);
  };
  const handleReset = () => {
    if (activeTab === "cyclotron") resetCyclo();
    else resetSynchro();
  };

  const currentDescription = activeTab === "cyclotron" ? CYCLO_DESCRIPTIONS[cycloStage] : SYNCHRO_DESCRIPTIONS[synchroStage];
  const currentMaxStage = activeTab === "cyclotron" ? CycloStage.INFO : SynchroStage.INFO;
  const currentActualStage = activeTab === "cyclotron" ? cycloStage : synchroStage;

  // Function to render RF Cavities for Synchrotron
  const renderRFCavities = () => {
    const numCavities = 2;
    const cavities = [];
    for (let i = 0; i < numCavities; i++) {
        const angle = (i * 360 / numCavities) + 45; // Position cavities (e.g., at 45 and 225 deg)
        const x = SYNCHRO_CENTER_X + SYNCHRO_RING_RADIUS * Math.cos(angle * Math.PI / 180);
        const y = SYNCHRO_CENTER_Y + SYNCHRO_RING_RADIUS * Math.sin(angle * Math.PI / 180);
        const isActive = synchroRFCavityActive && 
                       Math.abs(synchroParticleBunch.angleDeg - angle) < 15; // Activate if bunch is close

        cavities.push(
            <g key={`rf-${i}`} transform={`translate(${x}, ${y}) rotate(${angle + 90})`}>
                <rect x={-SYNCHRO_RF_CAVITY_SIZE/2} y={-10} width={SYNCHRO_RF_CAVITY_SIZE} height="20" fill={isActive ? "rgba(255,255,0,0.7)" : "rgba(100,100,200,0.7)"} stroke="black"/>
                {isActive && <text x="0" y="5" fontSize="10" textAnchor="middle" fill="black">E➔</text>}
            </g>
        );
    }
    return cavities;
  };
  // Function to render Guiding Magnets for Synchrotron
  const renderGuidingMagnets = () => {
    const numMagnets = 8;
    const magnets = [];
    for (let i = 0; i < numMagnets; i++) {
        const angle = (i * 360 / numMagnets);
        const x = SYNCHRO_CENTER_X + SYNCHRO_RING_RADIUS * Math.cos(angle * Math.PI / 180);
        const y = SYNCHRO_CENTER_Y + SYNCHRO_RING_RADIUS * Math.sin(angle * Math.PI / 180);
        magnets.push(
            <g key={`mag-${i}`} transform={`translate(${x}, ${y}) rotate(${angle + 90})`}>
                <rect x={-SYNCHRO_MAGNET_SIZE/2} y={-10} width={SYNCHRO_MAGNET_SIZE} height="20" fill={`rgba(255,0,0,${0.3 + synchroMagnetStrength * 0.7})`} stroke="darkred"/>
                 <text x="0" y="0" dy="0.3em" fontSize="10" textAnchor="middle" fill="white">B</text>
            </g>
        );
    }
    return magnets;
  };


  return (
    <div className="space-y-6 p-1">
       <div className="flex items-center justify-between">
        <Button variant="outline" asChild size="sm">
          <Link href="/simulations"> <ArrowLeft className="mr-2 h-4 w-4" /> Back </Link>
        </Button>
        <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
          <Orbit className="h-6 w-6 md:h-8 md:w-8 text-primary" />
          G12: Particle Accelerators
        </CardTitle>
      </div>

      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="cyclotron">Cyclotron</TabsTrigger>
          <TabsTrigger value="synchrotron">Synchrotron</TabsTrigger>
        </TabsList>

        <TabsContent value="cyclotron">
          <Card>
            <CardHeader><CardTitle className="text-lg text-center">Cyclotron Stage: {CycloStage[cycloStage].replace(/_/g, ' ')}</CardTitle></CardHeader>
            <CardContent className="flex flex-col items-center space-y-2">
              <svg width={SVG_WIDTH} height={SVG_HEIGHT} className="border rounded-md bg-slate-800 overflow-hidden">
                {/* B-Field for Cyclotron */}
                {Array.from({ length: Math.floor(SVG_WIDTH/40) }).map((_, i) =>
                  Array.from({ length: Math.floor(SVG_HEIGHT/40) }).map((_, j) => (
                    <text key={`b-${i}-${j}`} x={i*40+20} y={j*40+20} fill="rgba(0,100,255,0.3)" fontSize="12px" textAnchor="middle">X</text>
                )))}
                {/* Dees */}
                <path d={`M ${CYCLO_CENTER_X - DEE_GAP/2} ${CYCLO_CENTER_Y - DEE_RADIUS} A ${DEE_RADIUS} ${DEE_RADIUS} 0 0 ${cycloDeePolarity === 1 ? 0:1} ${CYCLO_CENTER_X - DEE_GAP/2} ${CYCLO_CENTER_Y + DEE_RADIUS} L ${CYCLO_CENTER_X - DEE_GAP/2} ${CYCLO_CENTER_Y} Z`}
                      fill={cycloDeePolarity === 1 ? "rgba(255,0,0,0.3)" : "rgba(0,0,255,0.3)"} stroke="silver"/>
                <path d={`M ${CYCLO_CENTER_X + DEE_GAP/2} ${CYCLO_CENTER_Y - DEE_RADIUS} A ${DEE_RADIUS} ${DEE_RADIUS} 0 0 ${cycloDeePolarity === -1 ? 0:1} ${CYCLO_CENTER_X + DEE_GAP/2} ${CYCLO_CENTER_Y + DEE_RADIUS} L ${CYCLO_CENTER_X + DEE_GAP/2} ${CYCLO_CENTER_Y} Z`}
                      fill={cycloDeePolarity === -1 ? "rgba(255,0,0,0.3)" : "rgba(0,0,255,0.3)"} stroke="silver"/>
                <text x={CYCLO_CENTER_X - DEE_RADIUS/2 - DEE_GAP/2} y={CYCLO_CENTER_Y} fill="white" fontSize="14px" textAnchor="middle">D1</text>
                <text x={CYCLO_CENTER_X + DEE_RADIUS/2 + DEE_GAP/2} y={CYCLO_CENTER_Y} fill="white" fontSize="14px" textAnchor="middle">D2</text>
                {/* E-Field in Gap */}
                {(cycloStage === CycloStage.ACCEL_1 || cycloStage === CycloStage.ACCEL_2 || (cycloStage === CycloStage.REPEAT_CYCLE && Math.abs(cycloParticle.y - CYCLO_CENTER_Y) < DEE_GAP*2)) &&
                    <line x1={CYCLO_CENTER_X} y1={CYCLO_CENTER_Y - DEE_GAP*1.5} x2={CYCLO_CENTER_X} y2={CYCLO_CENTER_Y + DEE_GAP*1.5} stroke="yellow" strokeWidth="2" markerEnd={cycloDeePolarity === 1 ? "url(#arrowYellowFwd)" : "url(#arrowYellowRev)"}/>
                }
                {/* Particle Path */}
                <path d={cycloParticle.pathPoints} stroke="lime" strokeWidth="2" fill="none" />
                {/* Particle */}
                <circle cx={cycloParticle.x} cy={cycloParticle.y} r={PARTICLE_RADIUS} fill="rgba(255, 165, 0, 0.9)" stroke="darkorange"/>
                 {/* Extraction Path */}
                {cycloStage === CycloStage.EXTRACTION && 
                    <line x1={cycloParticle.x} y1={cycloParticle.y} x2={SVG_WIDTH-20} y2={cycloParticle.y - 50} stroke="lime" strokeWidth="2" strokeDasharray="5 5"/>}

                <defs>
                    <marker id="arrowYellowFwd" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="yellow" /></marker>
                    <marker id="arrowYellowRev" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 10 0 L 0 5 L 10 10 z" fill="yellow" /></marker>
                </defs>
              </svg>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="synchrotron">
          <Card>
            <CardHeader><CardTitle className="text-lg text-center">Synchrotron Stage: {SynchroStage[synchroStage].replace(/_/g, ' ')}</CardTitle></CardHeader>
            <CardContent className="flex flex-col items-center space-y-2">
              <svg width={SVG_WIDTH} height={SVG_HEIGHT} className="border rounded-md bg-slate-800 overflow-hidden">
                {/* Beam Pipe */}
                <circle cx={SYNCHRO_CENTER_X} cy={SYNCHRO_CENTER_Y} r={SYNCHRO_RING_RADIUS} stroke="rgba(150,150,150,0.5)" strokeWidth="10" fill="none"/>
                {/* Guiding Magnets */}
                {renderGuidingMagnets()}
                {/* RF Cavities */}
                {renderRFCavities()}
                {/* Particle Bunch */}
                <circle cx={synchroParticleBunch.x} cy={synchroParticleBunch.y} r={PARTICLE_RADIUS + 2} fill="rgba(0,255,255,0.8)" stroke="cyan"/>
                {/* Extraction/Collision visual */}
                {synchroStage === SynchroStage.EXTRACTION_COLLISION && 
                    <line x1={synchroParticleBunch.x} y1={synchroParticleBunch.y} x2={SVG_WIDTH - 50} y2={SYNCHRO_CENTER_Y - 100} stroke="cyan" strokeWidth="3" strokeDasharray="5 5"/>}
              </svg>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CardDescription className="h-20 text-center p-2 border rounded-md w-full md:w-3/4 mx-auto text-sm bg-background">
        {currentDescription}
      </CardDescription>
      <div className="flex justify-center items-center gap-2 md:gap-4">
        <Button onClick={handlePrev} disabled={currentActualStage === 0} variant="outline" size="sm">
            <SkipBack className="mr-1 h-4 w-4" /> Prev
        </Button>
        <Button onClick={handleReset} variant="destructive" size="sm">
            <RotateCcw className="mr-1 h-4 w-4" /> Reset
        </Button>
        <Button onClick={handleNext} disabled={currentActualStage === currentMaxStage} variant="outline" size="sm">
            Next <SkipForward className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ParticleAcceleratorsG12Page;