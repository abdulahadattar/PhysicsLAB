"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, HelpCircle, Play, Pause, RefreshCw, Speaker, CornerDownLeft } from "lucide-react";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch'; // For enabling echo barrier
import { cn } from '@/lib/utils';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 250;
const PARTICLE_AREA_HEIGHT = 150; // Height for particle animation
const WAVEFORM_AREA_HEIGHT = CANVAS_HEIGHT - PARTICLE_AREA_HEIGHT; // Height for sine wave graph

const NUM_PARTICLES = 60;
const PARTICLE_RADIUS = 3;
const EQUILIBRIUM_SPACING = CANVAS_WIDTH / (NUM_PARTICLES + 1); // Spacing when at rest

const DEFAULT_WAVE_SPEED = 100; // pixels per second, conceptual speed in the medium

export default function SoundWaveG10Page() {
  const [amplitude, setAmplitude] = useState(15); // Max displacement of particles in pixels
  const [frequency, setFrequency] = useState(1); // Hz (cycles per second for the source)
  
  const [time, setTime] = useState(0); // Animation time in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [showEchoBarrier, setShowEchoBarrier] = useState(false);
  const [barrierPosition, setBarrierPosition] = useState(CANVAS_WIDTH * 0.8); // 80% of canvas width

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const lastFrameTimeRef = useRef<number>(0);

  // Derived wave properties
  const waveSpeed = DEFAULT_WAVE_SPEED; // For this simulation, speed is constant
  const wavelength = frequency > 0 ? waveSpeed / frequency : Infinity; // pixels
  const angularFrequency = 2 * Math.PI * frequency; // omega (ω = 2πf)
  const waveNumber = wavelength > 0 && isFinite(wavelength) ? 2 * Math.PI / wavelength : 0; // k (k = 2π/λ)

  const equilibriumParticlePositions = React.useMemo(() => {
    return Array.from({ length: NUM_PARTICLES }, (_, i) => (i + 1) * EQUILIBRIUM_SPACING);
  }, []);

  const drawSimulation = useCallback((ctx: CanvasRenderingContext2D, currentTime: number) => {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    const particleY = PARTICLE_AREA_HEIGHT / 2;

    // --- Draw Particles (Longitudinal Wave) ---
    ctx.fillStyle = "hsl(var(--primary))";
    equilibriumParticlePositions.forEach((eqX, index) => {
      // Calculate displacement: s(x,t) = A * sin(kx - ωt)
      let displacement = amplitude * Math.sin(waveNumber * eqX - angularFrequency * currentTime);
      let currentX = eqX + displacement;

      // Handle reflection if barrier is active
      if (showEchoBarrier && currentX > barrierPosition - PARTICLE_RADIUS) {
        // Simple reflection: phase inversion and wave travels back
        // The reflected wave can be thought of as originating from a "virtual source"
        // For a hard boundary, reflected displacement is opposite.
        // Reflected wave: s_reflected(x,t) = -A * sin(k(2*barrierX - x) - ωt) -- more complex to do perfectly
        // Simplified: If particle hits barrier, its "effective" wave propagation for displacement calculation reverses
        const timeToBarrier = (barrierPosition - eqX) / waveSpeed; // Approx time for this particle's phase to reach barrier
        const timeAfterReflection = currentTime - timeToBarrier;
        
        if (timeAfterReflection > 0) {
           // Phase of the wave at the barrier when this particle's *original* phase would have hit it
           const phaseAtBarrier = waveNumber * barrierPosition - angularFrequency * (currentTime - timeAfterReflection);
           // Reflected wave effectively travels from barrier backwards
           const distanceFromBarrier = barrierPosition - eqX; // This particle's distance *behind* the barrier if it passed
           displacement = -amplitude * Math.sin(waveNumber * distanceFromBarrier + phaseAtBarrier); // Reflected displacement
                                    // This could also be simplified as: phase of reflected wave is k*x_reflected + w*t.
                                    // x_reflected effectively counts from the barrier backwards.
                                    // A simpler model: reflect the displacement if x would have gone past barrier.
           // displacement = -amplitude * Math.sin(waveNumber * (barrierPosition - (eqX - barrierPosition)) - angularFrequency * currentTime);
            currentX = eqX + displacement;

            // Simple reflection: Invert displacement direction for particles that would pass the barrier
            const overshoot = (eqX + amplitude * Math.sin(waveNumber * eqX - angularFrequency * currentTime)) - barrierPosition;
            if (overshoot > 0) {
                 // A basic reflection: particles that would go past the barrier are "pushed back"
                 // This is a conceptual visual and not perfectly physical for wave superposition.
                 currentX = barrierPosition - overshoot;
                 // More simply: reflect the particle's current intended displacement
                 const originalDisplacement = amplitude * Math.sin(waveNumber * eqX - angularFrequency * currentTime);
                 if(eqX + originalDisplacement > barrierPosition) {
                    currentX = barrierPosition - ( (eqX + originalDisplacement) - barrierPosition );
                 }
            }
        }
      }
      
      // Boundary checks for particles (prevent them from going off-screen or too bunched)
      currentX = Math.max(PARTICLE_RADIUS, Math.min(CANVAS_WIDTH - PARTICLE_RADIUS, currentX));
      if (index > 0) { // Prevent overlap with previous particle
        const prevParticleDrawnX = equilibriumParticlePositions[index-1] + amplitude * Math.sin(waveNumber * equilibriumParticlePositions[index-1] - angularFrequency * currentTime);
        currentX = Math.max(currentX, prevParticleDrawnX + PARTICLE_RADIUS * 1.5); // Ensure min spacing
      }


      ctx.beginPath();
      ctx.arc(currentX, particleY, PARTICLE_RADIUS, 0, 2 * Math.PI);
      ctx.fill();
    });

    // --- Draw Echo Barrier ---
    if (showEchoBarrier) {
      ctx.strokeStyle = "hsl(var(--destructive))";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(barrierPosition, 0);
      ctx.lineTo(barrierPosition, PARTICLE_AREA_HEIGHT);
      ctx.stroke();
    }

    // --- Draw Transverse Waveform Representation (Optional) ---
    const waveformYBase = PARTICLE_AREA_HEIGHT + WAVEFORM_AREA_HEIGHT / 2;
    ctx.beginPath();
    ctx.strokeStyle = "hsl(var(--muted-foreground))";
    ctx.lineWidth = 1;
    ctx.moveTo(0, waveformYBase); // Axis line
    ctx.lineTo(CANVAS_WIDTH, waveformYBase);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = "hsl(var(--accent-foreground))";
    ctx.lineWidth = 1.5;
    for (let x_graph = 0; x_graph < CANVAS_WIDTH; x_graph++) {
      let y_offset_graph = (amplitude / 2) * Math.sin(waveNumber * x_graph - angularFrequency * currentTime); // Scale amplitude for graph
      
      // Conceptual reflection in graph
      if (showEchoBarrier && x_graph > barrierPosition) {
         // Phase inversion upon reflection on graph too
         const timeToBarrierForGraphX = (barrierPosition - x_graph) / waveSpeed;
         const timeAfterReflectionForGraphX = currentTime - timeToBarrierForGraphX;
         if (timeAfterReflectionForGraphX > 0) {
            // y_offset_graph = -(amplitude/2) * Math.sin(waveNumber * (barrierPosition - (x_graph - barrierPosition)) - angularFrequency * currentTime);
            // Simplification for graph: just make it look like a reflection
            const distFromBarrierGraph = x_graph - barrierPosition;
            const reflectedXEquivalent = barrierPosition - distFromBarrierGraph;
            y_offset_graph = -(amplitude/2) * Math.sin(waveNumber * reflectedXEquivalent - angularFrequency * currentTime);

         } else {
             y_offset_graph = 0; // No wave beyond barrier yet
         }
      }

      const y_graph = waveformYBase - y_offset_graph;
      if (x_graph === 0) ctx.moveTo(x_graph, y_graph);
      else ctx.lineTo(x_graph, y_graph);
    }
    ctx.stroke();

  }, [amplitude, waveNumber, angularFrequency, equilibriumParticlePositions, showEchoBarrier, barrierPosition, waveSpeed]);

  const animate = useCallback((timestamp: number) => {
    if (!lastFrameTimeRef.current) {
      lastFrameTimeRef.current = timestamp;
    }
    const deltaTime = (timestamp - lastFrameTimeRef.current) / 1000; // seconds
    lastFrameTimeRef.current = timestamp;

    setTime(prevTime => prevTime + deltaTime);

    if (isRunningRef.current) {
      requestRef.current = requestAnimationFrame(animate);
    }
  }, []); 
  
  const isRunningRef = useRef(isRunning);
  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  // Effect to draw based on time (for animation)
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      drawSimulation(ctx, time);
    }
  }, [time, drawSimulation]);

  // Effect to manage animation loop start/stop
  useEffect(() => {
    if (isRunning) {
      lastFrameTimeRef.current = performance.now(); 
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      // Draw static frame when paused
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx) {
        drawSimulation(ctx, time);
      }
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isRunning, animate, drawSimulation, time]);

  // Effect for initial draw and redraw if parameters change (while paused)
  useEffect(() => {
    if (!isRunning) {
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx) {
            drawSimulation(ctx, time); // Use current time for paused state
        }
    }
  }, [amplitude, frequency, showEchoBarrier, barrierPosition, drawSimulation, time, isRunning]);


  const handleToggleRun = () => setIsRunning(!isRunning);

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    lastFrameTimeRef.current = 0;
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) { // Draw initial frame at t=0
      drawSimulation(ctx, 0);
    }
  };
  
  // Call reset if parameters that define the wave itself change.
  useEffect(() => {
    handleReset();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amplitude, frequency, showEchoBarrier, barrierPosition]);


  return (
    <div className="space-y-6 p-2 md:p-4">
      <Button variant="outline" asChild size="sm">
        <Link href="/simulations">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Simulations
        </Link>
      </Button>

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl md:text-3xl flex items-center gap-2">
                <Speaker className="h-7 w-7 md:h-8 md:w-8 text-primary" />
                Sound Wave Viewer & Echo
              </CardTitle>
              <CardDescription>
                Grade 10 - STBB. Visualize longitudinal sound waves, compressions, rarefactions, and simulate echo phenomena.
              </CardDescription>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8 md:h-9 md:w-9"><HelpCircle className="h-4 w-4 md:h-5 md:w-5"/></Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 text-sm">
                 <h4 className="font-medium leading-none mb-2">Sound Wave Simulator</h4>
                 <p className="text-muted-foreground text-xs">
                    - Adjust Amplitude and Frequency to see their effect on the particle motion and waveform.
                    <br/>- Particles visualize the longitudinal nature of sound (compressions & rarefactions).
                    <br/>- The sine wave below is a common transverse representation of the sound wave.
                    <br/>- Toggle "Echo Barrier" to see a conceptual reflection. Adjust barrier position.
                    <br/>- Wave Speed is constant. Wavelength (λ = v/f) is calculated.
                 </p>
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            {/* Controls Column */}
            <div className="md:col-span-1 space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-lg md:text-xl">Wave Controls</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label htmlFor="amplitude-slider">Amplitude: {(amplitude / EQUILIBRIUM_SPACING * 100).toFixed(0)}% of spacing</Label>
                    <Slider 
                      id="amplitude-slider" 
                      min={1} 
                      max={EQUILIBRIUM_SPACING * 0.8} // Max amplitude related to particle spacing
                      step={1} 
                      value={[amplitude]} 
                      onValueChange={(val) => setAmplitude(val[0])} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="frequency-slider">Frequency: {frequency.toFixed(2)} Hz</Label>
                    <Slider 
                      id="frequency-slider" 
                      min={0.2} 
                      max={2.5} 
                      step={0.05} 
                      value={[frequency]} 
                      onValueChange={(val) => setFrequency(val[0])} 
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch id="echo-barrier-toggle" checked={showEchoBarrier} onCheckedChange={setShowEchoBarrier} />
                    <Label htmlFor="echo-barrier-toggle" className="text-sm">Show Echo Barrier</Label>
                  </div>
                  {showEchoBarrier && (
                    <div>
                        <Label htmlFor="barrier-position-slider">Barrier Position: {(barrierPosition / CANVAS_WIDTH * 100).toFixed(0)}%</Label>
                        <Slider
                            id="barrier-position-slider"
                            min={CANVAS_WIDTH * 0.2}
                            max={CANVAS_WIDTH * 0.95}
                            step={5}
                            value={[barrierPosition]}
                            onValueChange={(val) => setBarrierPosition(val[0])}
                        />
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button onClick={handleToggleRun} className="flex-1">
                      {isRunning ? <Pause className="mr-2 h-4 w-4"/> : <Play className="mr-2 h-4 w-4"/>}
                      {isRunning ? "Pause" : "Play"}
                    </Button>
                    <Button onClick={handleReset} variant="outline" className="flex-1">
                        <RefreshCw className="mr-2 h-4 w-4"/>Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-lg md:text-xl">Wave Properties</CardTitle></CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <p>Wave Speed (v): <span className="font-semibold">{waveSpeed.toFixed(0)} px/s</span> (Fixed)</p>
                  <p>Wavelength (λ): <span className="font-semibold">{isFinite(wavelength) ? wavelength.toFixed(1) : "N/A"} px</span></p>
                  <p>Ang. Freq. (ω): <span className="font-semibold">{angularFrequency.toFixed(2)} rad/s</span></p>
                  <p className="text-xs text-muted-foreground pt-1">Anim. Time: {time.toFixed(2)}s</p>
                </CardContent>
              </Card>
            </div>

            {/* Visualization Column */}
            <div className="md:col-span-2">
              <Card className="h-full">
                <CardHeader><CardTitle className="text-lg md:text-xl">Sound Wave Visualization</CardTitle></CardHeader>
                <CardContent className="flex flex-col items-center justify-center p-2">
                  <canvas 
                    ref={canvasRef} 
                    width={CANVAS_WIDTH} 
                    height={CANVAS_HEIGHT} 
                    className="bg-background rounded-md border border-input shadow-inner" // Changed bg to background for theme adapt
                    role="img"
                    aria-label={`Animation of sound waves. Amplitude factor ${(amplitude / EQUILIBRIUM_SPACING * 100).toFixed(0)}%, frequency ${frequency.toFixed(2)} Hz. Echo barrier is ${showEchoBarrier ? 'on' : 'off'}. Simulation is ${isRunning ? 'running' : 'paused'}.`}
                  ></canvas>
                   <p className="text-xs text-muted-foreground mt-2 text-center">
                        Top: Particle motion (longitudinal). Bottom: Waveform representation (transverse).
                    </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
        <CardFooter>
            <p className="text-xs text-muted-foreground">
                This conceptual simulation shows how sound waves propagate. The particle motion represents compressions and rarefactions. The echo is a simplified visual.
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
