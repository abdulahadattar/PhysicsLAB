"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle, PlayIcon, PauseIcon, RotateCcw } from 'lucide-react';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { cn } from "@/lib/utils";

/**
 * @fileOverview A simulation for visualizing a transverse wave on a string.
 * Allows control over amplitude, frequency, damping, and tension.
 * Simulates a traveling wave on an effectively infinite string.
 */

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;
const Y_CENTER = CANVAS_HEIGHT / 2;
const X_START = 0; // Start drawing wave from x=0

export default function PhetWaveOnAStringG10Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const isRunningRef = useRef<boolean>(false); // Ref for animation loop control

  // Simulation parameters
  const [amplitude, setAmplitude] = useState(50); // pixels
  const [frequency, setFrequency] = useState(1); // Hz
  const [damping, setDamping] = useState(0.01); // damping factor (conceptual)
  const [tension, setTension] = useState(1); // tension factor (conceptual)

  // Simulation state
  const [currentTime, setCurrentTime] = useState(0); // seconds
  const [isRunning, setIsRunning] = useState(false);


  // Derived wave properties (using pixel units for spatial properties)
  const angularFrequency = 2 * Math.PI * frequency; // rad/s
  // Conceptual wave speed related to tension
  const waveSpeed = 50 + (tension - 1) * 50; // pixels/second (ranges 50 to 150)
  // Wavelength (λ = v / f)
  const wavelength = frequency > 0 ? waveSpeed / frequency : 0; // pixels


  const drawWave = useCallback((ctx: CanvasRenderingContext2D, time: number) => {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.strokeStyle = 'hsl(var(--primary))'; // Use primary color for wave
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(X_START, Y_CENTER);

    for (let x = X_START; x < CANVAS_WIDTH; x++) {
      // y(x, t) = A * sin(k*x - ω*t) * e^(-α*x)
      // k = 2π / λ = 2π / (v/f) = 2πf / v = ω / v
      const k = angularFrequency / waveSpeed;
      const spatialPhase = k * x;
      const temporalPhase = angularFrequency * time;
      const dampingEffect = Math.exp(-damping * (x / CANVAS_WIDTH) * 5); // Damping over distance

      const y = Y_CENTER - amplitude * Math.sin(spatialPhase - temporalPhase) * dampingEffect;

      ctx.lineTo(x, y);
    }

    ctx.stroke();

    // Draw oscillator visual at the start
    const oscillatorRadius = 8;
    const oscillatorX = X_START;
    const oscillatorY = Y_CENTER - amplitude * Math.sin(-angularFrequency * time); // y position of the oscillator (at x=0)

    ctx.fillStyle = 'hsl(var(--foreground))'; // Use foreground color for oscillator
    ctx.beginPath();
    ctx.arc(oscillatorX, oscillatorY, oscillatorRadius, 0, Math.PI * 2);
    ctx.fill();

    // Draw equilibrium line
    ctx.strokeStyle = 'hsl(var(--muted-foreground))';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, Y_CENTER);
    ctx.lineTo(CANVAS_WIDTH, Y_CENTER);
    ctx.stroke();

  }, [amplitude, angularFrequency, damping, waveSpeed]);


  const animate = useCallback((timestamp: number) => {
    if (!isRunningRef.current) {
      animationFrameIdRef.current = undefined;
      lastFrameTimeRef.current = 0;
      return;
    }

    if (!lastFrameTimeRef.current) {
      lastFrameTimeRef.current = timestamp;
    }

    const deltaTime = (timestamp - lastFrameTimeRef.current) / 1000; // convert to seconds
    lastFrameTimeRef.current = timestamp;

    setCurrentTime(prevTime => prevTime + deltaTime);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        drawWave(ctx, currentTime + deltaTime); // Draw using the updated time for this frame
      }
    }

    animationFrameIdRef.current = requestAnimationFrame(animate);

  }, [drawWave, currentTime]);


  const handlePlayPause = useCallback(() => {
    setIsRunning(prev => !prev);
  }, []);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setCurrentTime(0);
    lastFrameTimeRef.current = 0; // Reset last frame time
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    // Redraw the initial state (time=0)
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        drawWave(ctx, 0);
      }
    }
  }, [drawWave]);


  // Effect to start/stop animation loop
  useEffect(() => {
    isRunningRef.current = isRunning;
    if (isRunning) {
      // Set initial lastFrameTime on starting the animation
       lastFrameTimeRef.current = performance.now();
      animationFrameIdRef.current = requestAnimationFrame(animate);
    } else {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      animationFrameIdRef.current = undefined;
      lastFrameTimeRef.current = 0; // Reset time reference when paused
    }

    // Cleanup function
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [isRunning, animate]);

   // Effect to redraw when parameters change while NOT running
   useEffect(() => {
    if (!isRunning) {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            drawWave(ctx, currentTime); // Redraw at current time with new parameters
          }
        }
    }
    // If isRunning is true, the animate loop handles drawing with new parameters
   }, [amplitude, frequency, damping, tension, isRunning, drawWave, currentTime]);


  // Initial draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        drawWave(ctx, 0); // Draw initial state
      }
    }
  }, [drawWave]); // Only run once on mount, drawWave is memoized


  const renderControls = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Parameter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Wave Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="amplitude">Amplitude (pixels)</Label>
            <Slider
              id="amplitude"
              min={10}
              max={Y_CENTER - 20} // Prevent drawing outside canvas vertically
              step={1}
              value={[amplitude]}
              onValueChange={(val) => setAmplitude(val[0])}
              disabled={isRunning}
            />
            <Input
              type="number"
              value={amplitude}
              onChange={e => {
                const val = parseFloat(e.target.value);
                 setAmplitude(isNaN(val) ? 10 : Math.max(10, Math.min(Y_CENTER - 20, val)));
              }}
              className="h-8 mt-2 text-sm"
              min={10}
              max={Y_CENTER - 20}
              step={1}
              disabled={isRunning}
            />
          </div>
          <div>
            <Label htmlFor="frequency">Frequency (Hz)</Label>
             <Slider
              id="frequency"
              min={0.1}
              max={5}
              step={0.1}
              value={[frequency]}
              onValueChange={(val) => setFrequency(val[0])}
              disabled={isRunning}
            />
            <Input
              type="number"
              value={frequency}
              onChange={e => {
                const val = parseFloat(e.target.value);
                setFrequency(isNaN(val) ? 0.1 : Math.max(0.1, Math.min(5, val)));
              }}
              className="h-8 mt-2 text-sm"
               min={0.1}
              max={5}
              step={0.1}
              disabled={isRunning}
            />
          </div>
           <div>
            <Label htmlFor="damping">Damping (Factor)</Label>
             <Slider
              id="damping"
              min={0}
              max={0.05} // Adjusted max for visual effect
              step={0.001}
              value={[damping]}
              onValueChange={(val) => setDamping(val[0])}
               disabled={isRunning}
            />
             <Input
              type="number"
              value={damping}
              onChange={e => {
                const val = parseFloat(e.target.value);
                setDamping(isNaN(val) ? 0 : Math.max(0, Math.min(0.05, val)));
              }}
              className="h-8 mt-2 text-sm"
               min={0}
              max={0.05}
              step={0.001}
              disabled={isRunning}
            />
          </div>
           <div>
            <Label htmlFor="tension">Tension (Factor)</Label>
             <Slider
              id="tension"
              min={1}
              max={3} // Conceptual factor
              step={0.1}
              value={[tension]}
              onValueChange={(val) => setTension(val[0])}
               disabled={isRunning}
            />
             <Input
              type="number"
              value={tension}
              onChange={e => {
                const val = parseFloat(e.target.value);
                setTension(isNaN(val) ? 1 : Math.max(1, Math.min(3, val)));
              }}
              className="h-8 mt-2 text-sm"
               min={1}
              max={3}
              step={0.1}
              disabled={isRunning}
            />
          </div>
        </CardContent>
      </Card>

      {/* Calculated Properties & Controls */}
       <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Wave Properties</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Angular Frequency (ω): <span className="font-semibold">{angularFrequency.toFixed(2)} rad/s</span></p>
            <p>Wave Speed (v): <span className="font-semibold">{waveSpeed.toFixed(2)} pixels/s</span></p>
            <p>Wavelength (λ): <span className="font-semibold">{wavelength > 0 ? wavelength.toFixed(2) : "N/A"} pixels</span></p>
             <p>Period (T): <span className="font-semibold">{frequency > 0 ? (1 / frequency).toFixed(2) : "N/A"} s</span></p>
              {damping > 0.001 && (
                 <p className="text-xs text-amber-600 dark:text-amber-400">Note: Visual damping applied over distance.</p>
              )}
             <p className="text-xs text-muted-foreground">Spatial properties (Amplitude, Wavelength, Speed) are displayed in canvas pixels.</p>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Controls</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-4 items-center">
                <Button onClick={handlePlayPause} size="lg">
                    {isRunning ? <PauseIcon className="mr-2 h-5 w-5" /> : <PlayIcon className="mr-2 h-5 w-5" />}
                    {isRunning ? "Pause" : "Play"}
                </Button>
                 <Button onClick={handleReset} variant="secondary" size="lg">
                    <RotateCcw className="mr-2 h-5 w-5" /> Reset
                </Button>
            </CardContent>
        </Card>
       </div>
    </div>
  );

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Wave on a String Simulation (G10)</h1>
         <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Help">
                    <HelpCircle className="h-5 w-5" />
                </Button>
            </PopoverTrigger>
             <PopoverContent className="w-80">
                <div className="grid gap-2">
                <h4 className="font-bold">Simulation Help: Wave on a String</h4>
                <Separator />
                <p className="text-sm text-muted-foreground">
                   Visualize a transverse wave traveling on a string. Adjust the parameters to see how they affect the wave's shape and motion.
                </p>
                <p className="text-sm text-muted-foreground font-semibold">Controls:</p>
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                    <li>Amplitude: Maximum displacement from equilibrium.</li>
                    <li>Frequency: How many oscillations per second (Hz).</li>
                    <li>Damping: Reduces amplitude over distance.</li>
                    <li>Tension: Conceptually affects wave speed (higher tension = faster wave).</li>
                </ul>
                 <p className="text-sm text-muted-foreground mt-2">
                   The simulation currently models a wave on an effectively infinite string (no reflections). Spatial values (Amplitude, Wavelength) are shown in canvas pixels.
                </p>
                </div>
            </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3 flex flex-col items-center">
           <div className="w-full max-w-[800px] bg-muted rounded-md border border-input shadow-inner aspect-[800/400] overflow-hidden">
             <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="w-full h-full" // Make canvas responsive within its container
                 role="img"
                 aria-label={`Animation of a transverse wave on a string. Amplitude ${amplitude} pixels, frequency ${frequency} Hz, damping factor ${damping.toFixed(2)}, tension factor ${tension.toFixed(1)}. Simulation is ${isRunning ? 'running' : 'paused'}.`}
            />
           </div>
           <div className="mt-4 text-sm text-muted-foreground text-center">
               Adjust parameters in the controls panel to the right.
           </div>
        </div>

        <div className="lg:w-1/3">
          {renderControls()}
        </div>
      </div>
    </div>
  );
}