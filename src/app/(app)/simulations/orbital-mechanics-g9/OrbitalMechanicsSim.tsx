// src/components/simulations/OrbitalMechanicsSim.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Play, Pause, RefreshCw, Eye, EyeOff, Milestone, HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// --- Constants for Simulation ---
const G_SCALED = 1; // Gravitational constant (scaled)
const M_STAR_SCALED = 1000; // Mass of the central star (scaled)
const M_PLANET_SCALED = 0.1;  // Mass of the planet (scaled, small compared to star)
const STAR_RADIUS_VISUAL = 15; // Visual radius of the star on canvas
const PLANET_RADIUS_VISUAL = 5; // Visual radius of the planet on canvas
const DT = 0.01; // Time step for simulation (smaller = more accurate but slower)
const MAX_TRAIL_POINTS = 500; // Max points in orbit trail

// --- Helper Vector Class ---
class Vec2 {
  x: number;
  y: number;
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  add(v: Vec2) { return new Vec2(this.x + v.x, this.y + v.y); }
  sub(v: Vec2) { return new Vec2(this.x - v.x, this.y - v.y); }
  mul(s: number) { return new Vec2(this.x * s, this.y * s); }
  mag() { return Math.sqrt(this.x * this.x + this.y * this.y); }
  normalize() {
    const m = this.mag();
    return m === 0 ? new Vec2() : new Vec2(this.x / m, this.y / m);
  }
  dist(v: Vec2) { return this.sub(v).mag(); }
}

interface TrailPoint {
  x: number;
  y: number;
}

export default function OrbitalMechanicsSim() {
  // --- State ---
  const [initialVelocityY, setInitialVelocityY] = useState(15); // Tangential velocity (along Y-axis initially)
  const [initialDistanceX, setInitialDistanceX] = useState(100); // Radial distance (along X-axis initially)

  const [planetPos, setPlanetPos] = useState(new Vec2(initialDistanceX, 0));
  const [planetVel, setPlanetVel] = useState(new Vec2(0, initialVelocityY));
  const [orbitTrail, setOrbitTrail] = useState<TrailPoint[]>([]);

  const [isRunning, setIsRunning] = useState(false);
  const [showVectors, setShowVectors] = useState(true);
  const [tracePath, setTracePath] = useState(true);

  const [simulationTime, setSimulationTime] = useState(0);
  const [orbitalPeriod, setOrbitalPeriod] = useState<number | null>(null);
  const [orbitType, setOrbitType] = useState<string>("Calculating...");
  const [minDistance, setMinDistance] = useState<number | null>(null);
  const [maxDistance, setMaxDistance] = useState<number | null>(null);
  const [crossedPositiveXAxisTime, setCrossedPositiveXAxisTime] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const [viewScale, setViewScale] = useState(1.0); // For zooming
  const [viewOffset, setViewOffset] = useState(new Vec2(0, 0)); // For panning

  const starPos = useMemo(() => new Vec2(0, 0), []); // Star is at the origin of simulation space

  // --- Simulation Logic ---
  const resetSimulation = useCallback(() => {
    setIsRunning(false);
    if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
    
    const newPlanetPos = new Vec2(initialDistanceX, 0);
    const newPlanetVel = new Vec2(0, initialVelocityY);

    setPlanetPos(newPlanetPos);
    setPlanetVel(newPlanetVel);
    setOrbitTrail(tracePath ? [{ x: newPlanetPos.x, y: newPlanetPos.y }] : []);
    setSimulationTime(0);
    setOrbitalPeriod(null);
    setOrbitType("N/A");
    setMinDistance(newPlanetPos.dist(starPos));
    setMaxDistance(newPlanetPos.dist(starPos));
    setCrossedPositiveXAxisTime(null); // Reset period calculation flag
    lastUpdateTimeRef.current = 0;

    // Auto-adjust viewScale based on initial distance for better initial framing
    const initialScale = Math.min(2, Math.max(0.2, 200 / (initialDistanceX * 1.5 || 200))); // Heuristic
    setViewScale(initialScale);
    setViewOffset(new Vec2(0,0)); // Reset pan
  }, [initialDistanceX, initialVelocityY, starPos, tracePath]);

  useEffect(() => {
    resetSimulation();
  }, [resetSimulation]); // Reset when initial params change via useCallback dependency

  
  const simulationStep = useCallback(() => {
    setPlanetPos(prevPos => {
      let currentPos = prevPos;
      let currentVel = planetVel; // Get latest velocity from state (updated via its own setter)

      const rVec = starPos.sub(currentPos); // Vector from planet to star
      const rMag = rVec.mag();

      if (rMag < (STAR_RADIUS_VISUAL / viewScale + PLANET_RADIUS_VISUAL / viewScale)) { // Collision (use scaled radius for check)
        setIsRunning(false);
        setOrbitType("Collision with Star!");
        return currentPos; // Stop updating position
      }
      
      if (rMag === 0) return currentPos; // Avoid division by zero

      const forceMag = (G_SCALED * M_STAR_SCALED * M_PLANET_SCALED) / (rMag * rMag);
      const forceVec = rVec.normalize().mul(forceMag);
      const acceleration = forceVec.mul(1 / M_PLANET_SCALED);

      // Euler-Cromer integration
      const newVel = currentVel.add(acceleration.mul(DT));
      const newPos = currentPos.add(newVel.mul(DT)); // Use new velocity for position update

      setPlanetVel(newVel); // Update velocity state here for next step

      // Update trail
      if (tracePath) {
        setOrbitTrail(prevTrail => {
          const newTrail = [...prevTrail, { x: newPos.x, y: newPos.y }];
          return newTrail.length > MAX_TRAIL_POINTS ? newTrail.slice(-MAX_TRAIL_POINTS) : newTrail;
        });
      }
      
      // Update min/max distances
      setMinDistance(prev => Math.min(prev !== null ? prev : rMag, rMag));
      setMaxDistance(prev => Math.max(prev !== null ? prev : rMag, rMag));

      // Orbital Period Calculation (simple: time to cross positive x-axis again after first pass)
      if (currentPos.y < 0 && newPos.y >= 0 && newPos.x > 0) { // Crossed positive X-axis upwards
        if(crossedPositiveXAxisTime === null && simulationTime > DT*5){ // Initial crossing after some time
            setCrossedPositiveXAxisTime(simulationTime);
        } else if (crossedPositiveXAxisTime !== null && orbitalPeriod === null) {
            setOrbitalPeriod(simulationTime - crossedPositiveXAxisTime);
            setCrossedPositiveXAxisTime(simulationTime); // For next period if stable
        }
      }
      
      // Orbit Type (simplified heuristic)
      const totalEnergy = 0.5 * M_PLANET_SCALED * newVel.mag() * newVel.mag() - (G_SCALED * M_STAR_SCALED * M_PLANET_SCALED) / rMag;
      if (totalEnergy >= -1e-3 && totalEnergy <= 1e-3 && orbitTrail.length > 100) { // Approx zero for parabolic, need tuning
          // Check eccentricity or if rMag keeps increasing
          if (rMag > (maxDistance || initialDistanceX) * 1.5 && (maxDistance||0) > (minDistance||0) * 1.1) {
             setOrbitType("Escape Trajectory (Parabolic/Hyperbolic)");
             // setIsRunning(false); // Option to stop if escapes far
          }
      } else if (totalEnergy < 0 && orbitTrail.length > 100) {
          const eVecX = (newVel.y * (currentPos.x * newVel.y - currentPos.y * newVel.x)) / (G_SCALED * M_STAR_SCALED) - (currentPos.x / rMag);
          const eVecY = (-newVel.x * (currentPos.x * newVel.y - currentPos.y * newVel.x)) / (G_SCALED * M_STAR_SCALED) - (currentPos.y / rMag);
          const eccentricity = Math.sqrt(eVecX*eVecX + eVecY*eVecY);

          if (eccentricity < 0.1) setOrbitType("Near Circular");
          else if (eccentricity < 1) setOrbitType("Elliptical");
          else {
            setOrbitType("Escape Trajectory (Hyperbolic)");
            // setIsRunning(false);
          }

      } else if (orbitTrail.length <= 100) {
          setOrbitType("Calculating...");
      }
       if(rMag > initialDistanceX * 5) { // If it goes too far, likely escape
           if(orbitType === "Calculating..." || orbitType === "Near Circular" || orbitType === "Elliptical") {
             setOrbitType("Likely Escape");
           }
        }


      return newPos;
    });
    setSimulationTime(prev => prev + DT);
  }, [starPos, planetVel, tracePath, simulationTime, crossedPositiveXAxisTime, orbitalPeriod, initialDistanceX, maxDistance, minDistance, orbitTrail.length]);


  // --- Animation Loop ---
  useEffect(() => {
    if (isRunning) {
      lastUpdateTimeRef.current = performance.now();
      const animate = (currentTime: number) => {
        // Frame-rate independent update logic could be added here if DT is dynamic
        simulationStep();
        animationFrameIdRef.current = requestAnimationFrame(animate);
      };
      animationFrameIdRef.current = requestAnimationFrame(animate);
    } else {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    }
    return () => {
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, [isRunning, simulationStep]);


  // --- Canvas Drawing ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    // Apply transformations for pan and zoom
    ctx.save();
    ctx.translate(width / 2 + viewOffset.x, height / 2 + viewOffset.y);
    ctx.scale(viewScale, viewScale);
    
    // Draw Star
    ctx.beginPath();
    ctx.arc(starPos.x, starPos.y, STAR_RADIUS_VISUAL, 0, 2 * Math.PI);
    ctx.fillStyle = 'orange';
    ctx.fill();

    // Draw Orbit Trail
    if (tracePath && orbitTrail.length > 1) {
      ctx.beginPath();
      ctx.moveTo(orbitTrail[0].x, orbitTrail[0].y);
      for (let i = 1; i < orbitTrail.length; i++) {
        ctx.lineTo(orbitTrail[i].x, orbitTrail[i].y);
      }
      ctx.strokeStyle = 'rgba(150, 150, 200, 0.5)';
      ctx.lineWidth = 1 / viewScale; // Keep line width consistent visually
      ctx.stroke();
    }

    // Draw Planet
    ctx.beginPath();
    ctx.arc(planetPos.x, planetPos.y, PLANET_RADIUS_VISUAL, 0, 2 * Math.PI);
    ctx.fillStyle = 'royalblue';
    ctx.fill();

    // Draw Vectors
    if (showVectors) {
      // Velocity Vector
      const velDisplayScale = 2 / viewScale; // Scale vector length for visibility
      ctx.beginPath();
      ctx.moveTo(planetPos.x, planetPos.y);
      ctx.lineTo(planetPos.x + planetVel.x * velDisplayScale, planetPos.y + planetVel.y * velDisplayScale);
      ctx.strokeStyle = 'green';
      ctx.lineWidth = 2 / viewScale;
      ctx.stroke();
      // Arrowhead for velocity
      drawVectorArrowhead(ctx, planetPos.x + planetVel.x * velDisplayScale, planetPos.y + planetVel.y * velDisplayScale, Math.atan2(planetVel.y, planetVel.x), 5 / viewScale, 'green');


      // Force/Acceleration Vector
      const rVec = starPos.sub(planetPos);
      const rMag = rVec.mag();
      if (rMag > 0) {
        const forceMag = (G_SCALED * M_STAR_SCALED * M_PLANET_SCALED) / (rMag * rMag);
        const forceDir = rVec.normalize();
        const forceDisplayScale = 0.05 / viewScale; // Scale for visibility
        ctx.beginPath();
        ctx.moveTo(planetPos.x, planetPos.y);
        ctx.lineTo(planetPos.x + forceDir.x * forceMag * forceDisplayScale, planetPos.y + forceDir.y * forceMag * forceDisplayScale);
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2 / viewScale;
        ctx.stroke();
        // Arrowhead for force
        drawVectorArrowhead(ctx, planetPos.x + forceDir.x * forceMag * forceDisplayScale, planetPos.y + forceDir.y * forceMag * forceDisplayScale, Math.atan2(forceDir.y, forceDir.x), 5 / viewScale, 'red');
      }
    }
    ctx.restore(); // Restore transform state
  }, [planetPos, planetVel, starPos, orbitTrail, showVectors, tracePath, viewScale, viewOffset]);

  const drawVectorArrowhead = (ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, size: number, color: string) => {
    ctx.save();
    ctx.translate(x,y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.lineTo(-size, -size/2);
    ctx.lineTo(-size, size/2);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  // --- UI Handlers ---
  const handleParamChange = (setter: React.Dispatch<React.SetStateAction<number>>, value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (!isNaN(numValue)) {
      setter(numValue);
      // Reset is handled by useEffect on initialDistanceX/initialVelocityY
    }
  };

  // Simple mouse drag for pan, wheel for zoom on canvas
  const dragStartPos = useRef<Vec2 | null>(null);
  const initialViewOffset = useRef<Vec2>(new Vec2(0,0));

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    dragStartPos.current = new Vec2(e.clientX, e.clientY);
    initialViewOffset.current = viewOffset; // Store current offset at drag start
    canvasRef.current?.setPointerCapture(e.pointerId);
  };
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (dragStartPos.current && e.buttons === 1) { // If dragging
      const dx = e.clientX - dragStartPos.current.x;
      const dy = e.clientY - dragStartPos.current.y;
      setViewOffset(initialViewOffset.current.add(new Vec2(dx, dy)));
    }
  };
  const handleMouseUpOrLeave = (e: React.MouseEvent<HTMLCanvasElement>) => {
    dragStartPos.current = null;
    canvasRef.current?.releasePointerCapture(e.pointerId);
  };
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const scaleAmount = 1.1;
    const newScale = e.deltaY < 0 ? viewScale * scaleAmount : viewScale / scaleAmount;
    setViewScale(Math.min(10, Math.max(0.05, newScale))); // Clamp scale
  };


  return (
    <div className="flex flex-col lg:flex-row gap-4 p-2 md:p-4 items-start">
      {/* Controls Column */}
      <Card className="w-full lg:w-1/3 xl:w-1/4 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl">Orbital Parameters</CardTitle>
          <CardDescription>Adjust initial conditions for the planet.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <Label htmlFor="initDist" className="flex justify-between text-sm">
              <span>Initial Distance (r₀)</span> <span>{initialDistanceX.toFixed(0)} units</span>
            </Label>
            <div className="flex items-center gap-2 mt-1">
              <Slider id="initDistSlider" min={20} max={300} step={5} value={[initialDistanceX]} onValueChange={(v) => handleParamChange(setInitialDistanceX, v[0])} className="flex-grow"/>
              <Input id="initDist" type="number" value={initialDistanceX.toString()} onChange={e => handleParamChange(setInitialDistanceX, e.target.value)} min={20} max={300} step={5} className="w-24 h-9 text-sm" />
            </div>
          </div>
          <div>
            <Label htmlFor="initVel" className="flex justify-between text-sm">
              <span>Initial Velocity (v₀)</span> <span>{initialVelocityY.toFixed(1)} units/s</span>
            </Label>
             <div className="flex items-center gap-2 mt-1">
                <Slider id="initVelSlider" min={1} max={40} step={0.5} value={[initialVelocityY]} onValueChange={(v) => handleParamChange(setInitialVelocityY, v[0])} className="flex-grow"/>
                <Input id="initVel" type="number" value={initialVelocityY.toString()} onChange={e => handleParamChange(setInitialVelocityY, e.target.value)} min={1} max={40} step={0.5} className="w-24 h-9 text-sm" />
            </div>
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <Switch id="tracePath" checked={tracePath} onCheckedChange={setTracePath} />
            <Label htmlFor="tracePath" className="text-sm">Trace Orbit Path</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="showVectors" checked={showVectors} onCheckedChange={setShowVectors} />
            <Label htmlFor="showVectors" className="text-sm">Show Force/Velocity Vectors</Label>
          </div>
          <div className="flex gap-2 pt-3">
            <Button onClick={() => setIsRunning(!isRunning)} className="flex-1">
              {isRunning ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
              {isRunning ? "Pause" : "Start"}
            </Button>
            <Button onClick={resetSimulation} variant="outline" className="flex-1"><RefreshCw className="mr-2 h-4 w-4"/>Reset</Button>
          </div>
            <Popover>
              <PopoverTrigger asChild><Button variant="ghost" size="sm" className="text-xs w-full mt-2"><HelpCircle className="mr-2 h-3 w-3"/>Simulation Tips</Button></PopoverTrigger>
              <PopoverContent className="w-72 text-xs space-y-1">
                <p>Zoom: Mouse wheel on canvas.</p>
                <p>Pan: Click and drag on canvas.</p>
                <p>Units are scaled. G = {G_SCALED}, Star Mass = {M_STAR_SCALED}.</p>
                <p>Try low velocity for a close orbit, or high velocity to escape!</p>
                <p>A circular orbit requires a specific velocity for a given distance.</p>
              </PopoverContent>
            </Popover>
        </CardContent>
      </Card>

      {/* Visualization & Data Column */}
      <div className="flex-grow space-y-4">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2"><Milestone className="h-5 w-5 text-primary"/>Orbital Visualization</CardTitle>
            <CardDescription>Observe the planet's motion around the central star. Scroll to zoom, drag to pan.</CardDescription>
          </CardHeader>
          <CardContent className="aspect-[16/10] md:aspect-[16/9] bg-muted/30 rounded-md overflow-hidden border">
            <canvas 
                ref={canvasRef} 
                className="w-full h-full cursor-grab active:cursor-grabbing"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUpOrLeave}
                onMouseLeave={handleMouseUpOrLeave} // To stop dragging if mouse leaves canvas
                onWheel={handleWheel}
                width={800} // Set a base render width
                height={500} // Set a base render height (aspect ratio maintained by parent)
            />
          </CardContent>
        </Card>
        <Card className="shadow-xl">
            <CardHeader>
                <CardTitle className="text-lg">Orbital Data</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                <p>Time: <Badge variant="secondary">{simulationTime.toFixed(2)} s</Badge></p>
                <p>Speed: <Badge variant="secondary">{planetVel.mag().toFixed(2)} u/s</Badge></p>
                <p>Distance: <Badge variant="secondary">{planetPos.dist(starPos).toFixed(2)} u</Badge></p>
                <p>Min Dist: <Badge variant="outline">{minDistance !== null ? minDistance.toFixed(2) : 'N/A'} u</Badge></p>
                <p>Max Dist: <Badge variant="outline">{maxDistance !== null ? maxDistance.toFixed(2) : 'N/A'} u</Badge></p>
                <p>Period: <Badge variant="outline" className={orbitalPeriod ? "text-green-600 border-green-500" : ""}>{orbitalPeriod ? orbitalPeriod.toFixed(2) + ' s' : 'N/A'}</Badge></p>
                <p className="col-span-2 sm:col-span-3">Orbit Type: <Badge variant={orbitType.includes("Escape") || orbitType.includes("Collision") ? "destructive" : "default"}>{orbitType}</Badge></p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}