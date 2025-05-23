/**
 * @fileOverview Simple Harmonic Motion (SHM) - Spring-Mass System Simulation (Grade 11).
 * This component allows users to observe SHM by adjusting mass, spring constant,
 * and visual amplitude. It displays calculated period, frequency, and animates
 * the oscillating mass.
 */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, HelpCircle, Play, Pause, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const MAX_VISUAL_AMPLITUDE = 50; // Base pixels for visualization of amplitude

/**
 * Main component for the SHM Spring-Mass simulation.
 */
export default function SHMSpringMassG11Page() {
  const [mass, setMass] = useState(1); // kg
  const [springConstant, setSpringConstant] = useState(10); // N/m
  const [amplitudeSetting, setAmplitudeSetting] = useState(0.8); // Factor for visual amplitude (0 to 1)

  // Calculated SHM parameters
  const [period, setPeriod] = useState(0);
  const [frequency, setFrequency] = useState(0);
  const [angularFrequency, setAngularFrequency] = useState(0);

  // Animation state
  const [isRunning, setIsRunning] = useState(false);
  const [simulationTime, setSimulationTime] = useState(0); // Total accumulated simulation time
  
  const requestRef = useRef<number>();
  const lastFrameTimeRef = useRef<number>(0); // To calculate deltaTime for smooth animation

  // Canvas setup
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasWidth = 300;
  const canvasHeight = 150;
  const equilibriumX = canvasWidth / 2; // Equilibrium position of mass center
  const springAttachX = 10; // Wall position where spring is attached

  // Calculate visual amplitude based on setting
  const visualAmplitude = MAX_VISUAL_AMPLITUDE * amplitudeSetting;

  /**
   * Calculates SHM parameters (period, frequency, angular frequency)
   * based on current mass and spring constant.
   * Memoized with useCallback.
   */
  const calculateSHMParameters = useCallback(() => {
    if (mass > 0 && springConstant > 0) {
      const omega = Math.sqrt(springConstant / mass);
      const T = 2 * Math.PI / omega;
      const f = 1 / T;
      setAngularFrequency(omega);
      setPeriod(T);
      setFrequency(f);
    } else {
      // Reset parameters if mass or spring constant is invalid
      setPeriod(0);
      setFrequency(0);
      setAngularFrequency(0);
    }
  }, [mass, springConstant]);

  // Effect to recalculate SHM parameters when mass or springConstant changes
  useEffect(() => {
    calculateSHMParameters();
  }, [calculateSHMParameters]);

  /**
   * Draws the spring-mass system on the canvas for a given simulation time.
   * @param ctx - The 2D rendering context of the canvas.
   * @param currentSimTime - The current elapsed simulation time.
   */
  const drawSpringMassSystem = useCallback((ctx: CanvasRenderingContext2D, currentSimTime: number) => {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    const equilibriumY = canvasHeight / 2;
    const massSize = 20; // Visual size of the mass

    // Calculate displacement based on SHM equation: x(t) = A * cos(ωt)
    const displacement = angularFrequency > 0 ? visualAmplitude * Math.cos(angularFrequency * currentSimTime) : 0;
    const massCenterX = equilibriumX + displacement;

    // Draw spring
    ctx.beginPath();
    ctx.moveTo(springAttachX, equilibriumY);
    const numTurns = 10; // Number of turns in the spring visual
    const springLength = massCenterX - massSize / 2 - springAttachX;
    if (springLength > 0) { // Only draw spring if there's length
      for (let i = 0; i <= numTurns; i++) {
        const x = springAttachX + (i / numTurns) * springLength;
        const yOffset = (i % 2 === 0) ? 7 : -7; // Creates zigzag pattern
        if (i === 0 || i === numTurns) {
          ctx.lineTo(x, equilibriumY);
        } else {
          ctx.lineTo(x, equilibriumY + yOffset);
        }
      }
    } else { // If compressed beyond attachment point, draw a straight line
        ctx.lineTo(massCenterX - massSize / 2, equilibriumY);
    }
    ctx.strokeStyle = "hsl(var(--primary))";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Draw mass
    ctx.fillStyle = "hsl(var(--accent))";
    ctx.fillRect(massCenterX - massSize / 2, equilibriumY - massSize / 2, massSize, massSize);
    
    // Draw equilibrium line guide
    ctx.beginPath();
    ctx.moveTo(equilibriumX, equilibriumY - massSize * 1.5);
    ctx.lineTo(equilibriumX, equilibriumY + massSize * 1.5);
    ctx.strokeStyle = "hsl(var(--muted-foreground))";
    ctx.setLineDash([2,2]);
    ctx.lineWidth = 0.5;
    ctx.stroke();
    ctx.setLineDash([]); // Reset line dash

  }, [angularFrequency, visualAmplitude, equilibriumX, springAttachX]);


  /**
   * Animation loop function.
   * Updates simulation time and triggers redraw.
   */
  const animate = useCallback((timestamp: number) => {
    if (!lastFrameTimeRef.current) { // Initialize lastFrameTimeRef on first call
      lastFrameTimeRef.current = timestamp;
    }
    const deltaTime = (timestamp - lastFrameTimeRef.current) / 1000; // Time elapsed since last frame in seconds
    lastFrameTimeRef.current = timestamp;

    setSimulationTime(prevSimTime => {
        const newSimTime = prevSimTime + deltaTime;
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            drawSpringMassSystem(ctx, newSimTime); // Draw with the new accumulated time
        }
        return newSimTime;
    });

    if (isRunningRef.current) { // Check ref for current running state
        requestRef.current = requestAnimationFrame(animate);
    }
  }, [drawSpringMassSystem]); // Depends on draw function, which depends on display parameters

  const isRunningRef = useRef(isRunning); // Ref to hold current isRunning status for requestAnimationFrame
  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  // Effect to manage the animation loop (start/stop)
  useEffect(() => {
    if (isRunning) {
      lastFrameTimeRef.current = performance.now(); // Reset for accurate deltaTime when starting/resuming
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      // Ensure final state is drawn when paused
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        drawSpringMassSystem(ctx, simulationTime);
      }
    }
    return () => { // Cleanup: cancel animation frame when component unmounts or isRunning changes
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isRunning, animate, drawSpringMassSystem, simulationTime]);


  /**
   * Handles toggling the play/pause state of the simulation.
   */
  const handleToggleRun = () => {
    setIsRunning(!isRunning);
  };

  /**
   * Resets the simulation time to zero and stops the animation.
   * Redraws the system at its initial state (t=0).
   */
  const handleResetTime = () => {
    setIsRunning(false); // Stop animation
    setSimulationTime(0); // Reset time
    lastFrameTimeRef.current = 0; // Reset last frame time
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
        drawSpringMassSystem(ctx, 0); // Draw initial state
    }
  };
  
  // Effect for initial draw and redrawing if parameters change while simulation is paused.
  useEffect(() => {
    if (!isRunning) { // Only redraw if paused and parameters change
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) drawSpringMassSystem(ctx, simulationTime);
    }
  // angularFrequency changes when mass/k changes (via calculateSHMParameters)
  // visualAmplitude changes when amplitudeSetting changes
  },[angularFrequency, visualAmplitude, drawSpringMassSystem, simulationTime, isRunning]);


  return (
    <div className="space-y-6">
      <Button variant="outline" asChild size="sm">
        <Link href="/simulations">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Simulations
        </Link>
      </Button>

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl">SHM - Spring-Mass System</CardTitle>
              <CardDescription>
                Grade 11 - Observe Simple Harmonic Motion of a mass on a horizontal spring.
              </CardDescription>
            </div>
             <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="icon"><HelpCircle className="h-5 w-5"/></Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 text-sm">
                    <h4 className="font-medium leading-none mb-2">How to Use</h4>
                    <p className="text-muted-foreground">
                        - Adjust Mass (m), Spring Constant (k), and Visual Amplitude.
                        <br/>- Calculated Period (T), Frequency (f), and Angular Frequency (ω) will update.
                        <br/>- Press Play/Pause to run or pause the animation.
                        <br/>- Reset Time sets the simulation time to 0.
                    </p>
                    <h4 className="font-medium leading-none mt-3 mb-1">Key Formulas:</h4>
                     <ul className="text-xs text-muted-foreground list-disc pl-4">
                        <li>Angular Frequency (ω): √(k/m)</li>
                        <li>Period (T): 2π / ω = 2π√(m/k)</li>
                        <li>Frequency (f): 1 / T</li>
                     </ul>
                </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Controls Column */}
            <div className="md:col-span-1 space-y-6">
              <Card>
                <CardHeader><CardTitle className="text-xl">Controls</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="mass">Mass (m): {mass.toFixed(2)} kg</Label>
                    <div className="flex items-center gap-2">
                      <Slider id="mass" min={0.1} max={5} step={0.1} value={[mass]} onValueChange={(v) => setMass(v[0])} />
                      <Input type="number" value={mass} onChange={(e) => setMass(Math.max(0.1, parseFloat(e.target.value) || 0.1))} className="w-20 h-8"/>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="springConstant">Spring Constant (k): {springConstant.toFixed(1)} N/m</Label>
                     <div className="flex items-center gap-2">
                      <Slider id="springConstant" min={1} max={50} step={0.5} value={[springConstant]} onValueChange={(v) => setSpringConstant(v[0])} />
                      <Input type="number" value={springConstant} onChange={(e) => setSpringConstant(Math.max(1, parseFloat(e.target.value) || 1))} className="w-20 h-8"/>
                    </div>
                  </div>
                   <div>
                    <Label htmlFor="amplitudeSetting">Visual Amplitude Scale: {(amplitudeSetting * 100).toFixed(0)}%</Label>
                     <div className="flex items-center gap-2">
                      <Slider id="amplitudeSetting" min={0.1} max={1} step={0.05} value={[amplitudeSetting]} onValueChange={(v) => setAmplitudeSetting(v[0])} />
                       <Input type="number" value={amplitudeSetting} onChange={(e) => setAmplitudeSetting(Math.max(0.1, Math.min(1, parseFloat(e.target.value) || 0.1)))} className="w-20 h-8" step="0.1" min="0.1" max="1"/>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button onClick={handleToggleRun} className="flex-1">
                      {isRunning ? <Pause className="mr-2 h-4 w-4"/> : <Play className="mr-2 h-4 w-4"/>}
                      {isRunning ? "Pause" : "Play"}
                    </Button>
                     <Button onClick={handleResetTime} variant="outline"><RefreshCw className="mr-2 h-4 w-4"/>Reset Time</Button>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-xl">Calculated Values</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>Period (T): <span className="font-semibold">{period > 0 ? period.toFixed(3) : "N/A"} s</span></p>
                  <p>Frequency (f): <span className="font-semibold">{frequency > 0 ? frequency.toFixed(3) : "N/A"} Hz</span></p>
                  <p>Angular ω: <span className="font-semibold">{angularFrequency > 0 ? angularFrequency.toFixed(3) : "N/A"} rad/s</span></p>
                   <p className="text-xs text-muted-foreground pt-1">Sim Time (t): {simulationTime.toFixed(2)}s</p>
                </CardContent>
              </Card>
            </div>

            {/* Visualization Column */}
            <div className="md:col-span-2">
              <Card className="h-full">
                <CardHeader><CardTitle className="text-xl">Visual Simulation</CardTitle></CardHeader>
                <CardContent className="flex items-center justify-center p-2 h-[200px]">
                  <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight} className="bg-muted rounded-md border"></canvas>
                </CardContent>
                 <CardFooter>
                    <p className="text-xs text-muted-foreground">Visual representation of a mass oscillating on a horizontal spring. The vertical dashed line indicates equilibrium position.</p>
                 </CardFooter>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
