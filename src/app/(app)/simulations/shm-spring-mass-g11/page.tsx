
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, HelpCircle, Play, Pause } from "lucide-react";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const MAX_AMPLITUDE = 50; // pixels for visualization

export default function SHMSpringMassG11Page() {
  const [mass, setMass] = useState(1); // kg
  const [springConstant, setSpringConstant] = useState(10); // N/m
  const [amplitude, setAmplitude] = useState(MAX_AMPLITUDE * 0.8); // Initial amplitude for visualization

  const [period, setPeriod] = useState(0);
  const [frequency, setFrequency] = useState(0);
  const [angularFrequency, setAngularFrequency] = useState(0);

  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const requestRef = useRef<number>();
  const startTimeRef = useRef<number>(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasWidth = 300;
  const canvasHeight = 150;
  const equilibriumY = canvasHeight / 2;
  const springWidth = 100; // Width of the spring part of visualization

  const calculateSHMParameters = useCallback(() => {
    if (mass > 0 && springConstant > 0) {
      const T = 2 * Math.PI * Math.sqrt(mass / springConstant);
      const f = 1 / T;
      const omega = 2 * Math.PI * f;
      setPeriod(T);
      setFrequency(f);
      setAngularFrequency(omega);
    } else {
      setPeriod(0);
      setFrequency(0);
      setAngularFrequency(0);
    }
  }, [mass, springConstant]);

  useEffect(() => {
    calculateSHMParameters();
  }, [calculateSHMParameters]);

  const draw = (ctx: CanvasRenderingContext2D, elapsedSeconds: number) => {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Calculate current displacement
    const displacement = amplitude * Math.cos(angularFrequency * elapsedSeconds);
    
    const massPositionX = springWidth + displacement; // Center mass after spring
    const massSize = 20; // Size of the mass block

    // Draw spring
    ctx.beginPath();
    ctx.moveTo(0, equilibriumY);
    // Simple zig-zag for spring (adjust number of zigs for springConstant or visual preference)
    const numZigs = 10;
    const zigLength = massPositionX / numZigs;
    for(let i = 0; i < numZigs; i++) {
        ctx.lineTo(i * zigLength, equilibriumY + (i%2 === 0 ? -5 : 5) );
    }
    ctx.lineTo(massPositionX - massSize / 2, equilibriumY); // Connect to mass
    ctx.strokeStyle = "hsl(var(--primary))";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw mass
    ctx.fillStyle = "hsl(var(--accent))";
    ctx.fillRect(massPositionX - massSize / 2, equilibriumY - massSize / 2, massSize, massSize);
    
    // Draw equilibrium line
    ctx.beginPath();
    ctx.moveTo(springWidth, 0);
    ctx.lineTo(springWidth, canvasHeight);
    ctx.strokeStyle = "hsl(var(--muted-foreground))";
    ctx.setLineDash([2,2]);
    ctx.lineWidth = 0.5;
    ctx.stroke();
    ctx.setLineDash([]);


  };

  const animate = (timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }
    const elapsedMilliseconds = timestamp - startTimeRef.current;
    const elapsedSeconds = (time + elapsedMilliseconds / 1000); // Add accumulated time

    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      draw(ctx, elapsedSeconds);
    }
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = 0; // Reset start time for this run segment
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
         // Persist the time when paused
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
          // If paused, draw one last frame at the current time
          draw(ctx, time);
        }
      }
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, angularFrequency, amplitude]); // Redraw if these change

  useEffect(() => { // Initial draw
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) draw(ctx, time);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[angularFrequency, amplitude]);


  const handleToggleRun = () => {
    if (isRunning) { // pausing
        if (startTimeRef.current) { // if it was running
            const now = performance.now();
            const elapsedSinceLastStart = (now - startTimeRef.current) / 1000;
            setTime(prevTime => prevTime + elapsedSinceLastStart);
        }
    } else { // starting
        startTimeRef.current = performance.now(); // set start time for this new run segment
    }
    setIsRunning(!isRunning);
  };

  const handleResetTime = () => {
    setTime(0);
    setIsRunning(false); // Stop animation
    startTimeRef.current = 0;
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
        draw(ctx, 0); // Redraw at initial state (t=0)
    }
  };

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
              <CardTitle className="text-3xl">SHM - Spring-Mass System (Grade 11)</CardTitle>
              <CardDescription>
                Observe Simple Harmonic Motion of a mass on a spring.
              </CardDescription>
            </div>
             <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="icon"><HelpCircle className="h-5 w-5"/></Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <h4 className="font-medium leading-none">How to Use</h4>
                            <p className="text-sm text-muted-foreground">
                                - Adjust mass (m) and spring constant (k) using sliders or inputs.
                                <br/>- Calculated Period (T), Frequency (f), and Angular Frequency (ω) will update.
                                <br/>- Press Play/Pause to run or pause the animation.
                                <br/>- Reset sets time to 0.
                            </p>
                        </div>
                         <div className="space-y-2">
                             <h4 className="font-medium leading-none">Formulas:</h4>
                             <ul className="text-xs text-muted-foreground list-disc pl-4">
                                <li>Angular Frequency (ω): √(k/m)</li>
                                <li>Period (T): 2π / ω = 2π√(m/k)</li>
                                <li>Frequency (f): 1 / T = ω / (2π)</li>
                             </ul>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-6">
              <Card>
                <CardHeader><CardTitle className="text-xl">Controls</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="mass">Mass (m): {mass.toFixed(2)} kg</Label>
                    <div className="flex items-center gap-2">
                      <Slider id="mass" min={0.1} max={5} step={0.1} value={[mass]} onValueChange={(v) => setMass(v[0])} />
                      <Input type="number" value={mass} onChange={(e) => setMass(parseFloat(e.target.value) || 0.1)} className="w-20 h-8"/>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="springConstant">Spring Constant (k): {springConstant.toFixed(1)} N/m</Label>
                     <div className="flex items-center gap-2">
                      <Slider id="springConstant" min={1} max={50} step={0.5} value={[springConstant]} onValueChange={(v) => setSpringConstant(v[0])} />
                      <Input type="number" value={springConstant} onChange={(e) => setSpringConstant(parseFloat(e.target.value) || 1)} className="w-20 h-8"/>
                    </div>
                  </div>
                   <div>
                    <Label htmlFor="amplitude">Visual Amplitude: {amplitude.toFixed(0)} (visual units)</Label>
                     <div className="flex items-center gap-2">
                      <Slider id="amplitude" min={10} max={MAX_AMPLITUDE} step={1} value={[amplitude]} onValueChange={(v) => setAmplitude(v[0])} />
                      <Input type="number" value={amplitude} onChange={(e) => setAmplitude(parseFloat(e.target.value) || 10)} className="w-20 h-8"/>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button onClick={handleToggleRun} className="flex-1">
                      {isRunning ? <Pause className="mr-2 h-4 w-4"/> : <Play className="mr-2 h-4 w-4"/>}
                      {isRunning ? "Pause" : "Play"}
                    </Button>
                     <Button onClick={handleResetTime} variant="outline">Reset Time</Button>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-xl">Calculated Values</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>Period (T): <span className="font-semibold">{period.toFixed(3)} s</span></p>
                  <p>Frequency (f): <span className="font-semibold">{frequency.toFixed(3)} Hz</span></p>
                  <p>Angular ω: <span className="font-semibold">{angularFrequency.toFixed(3)} rad/s</span></p>
                   <p className="text-xs text-muted-foreground pt-1">Time (t): {time.toFixed(2)}s</p>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-2">
              <Card className="h-full">
                <CardHeader><CardTitle className="text-xl">Visual Simulation</CardTitle></CardHeader>
                <CardContent className="flex items-center justify-center p-2 h-[200px]">
                  <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight} className="bg-muted rounded-md border"></canvas>
                </CardContent>
                 <CardFooter>
                    <p className="text-xs text-muted-foreground">The spring visualization is simplified. Motion is horizontal.</p>
                 </CardFooter>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
