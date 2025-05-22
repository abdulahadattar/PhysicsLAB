
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

const MAX_VISUAL_AMPLITUDE = 50; // pixels for visualization base

export default function SHMSpringMassG11Page() {
  const [mass, setMass] = useState(1); // kg
  const [springConstant, setSpringConstant] = useState(10); // N/m
  const [amplitudeSetting, setAmplitudeSetting] = useState(0.8); // Factor for visual amplitude (0 to 1)

  const [period, setPeriod] = useState(0);
  const [frequency, setFrequency] = useState(0);
  const [angularFrequency, setAngularFrequency] = useState(0);

  const [isRunning, setIsRunning] = useState(false);
  const [simulationTime, setSimulationTime] = useState(0); // Total accumulated simulation time
  
  const requestRef = useRef<number>();
  const lastFrameTimeRef = useRef<number>(0); // To calculate deltaTime

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasWidth = 300;
  const canvasHeight = 150;
  const equilibriumX = 50; // Spring attaches to wall on left, equilibrium position of mass center
  const springAttachX = 10; // Wall position

  const visualAmplitude = MAX_VISUAL_AMPLITUDE * amplitudeSetting;


  const calculateSHMParameters = useCallback(() => {
    if (mass > 0 && springConstant > 0) {
      const omega = Math.sqrt(springConstant / mass);
      const T = 2 * Math.PI / omega;
      const f = 1 / T;
      setAngularFrequency(omega);
      setPeriod(T);
      setFrequency(f);
    } else {
      setPeriod(0);
      setFrequency(0);
      setAngularFrequency(0);
    }
  }, [mass, springConstant]);

  useEffect(() => {
    calculateSHMParameters();
  }, [calculateSHMParameters]);

  const draw = useCallback((ctx: CanvasRenderingContext2D, currentSimTime: number) => {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    const equilibriumY = canvasHeight / 2;

    const displacement = visualAmplitude * Math.cos(angularFrequency * currentSimTime);
    const massCenterX = equilibriumX + displacement;
    const massSize = 20;

    // Draw spring
    ctx.beginPath();
    ctx.moveTo(springAttachX, equilibriumY);
    const numTurns = 10;
    const springLength = massCenterX - massSize / 2 - springAttachX;
    for (let i = 0; i <= numTurns; i++) {
      const x = springAttachX + (i / numTurns) * springLength;
      const yOffset = (i % 2 === 0) ? 7 : -7;
      if (i === 0 || i === numTurns) {
        ctx.lineTo(x, equilibriumY);
      } else {
        ctx.lineTo(x, equilibriumY + yOffset);
      }
    }
    ctx.lineTo(massCenterX - massSize / 2, equilibriumY);
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
    ctx.setLineDash([]);

  }, [angularFrequency, visualAmplitude, equilibriumX, springAttachX]);


  const animate = useCallback((timestamp: number) => {
    if (!lastFrameTimeRef.current) {
      lastFrameTimeRef.current = timestamp;
    }
    const deltaTime = (timestamp - lastFrameTimeRef.current) / 1000; // seconds
    lastFrameTimeRef.current = timestamp;

    setSimulationTime(prevSimTime => {
        const newSimTime = prevSimTime + deltaTime;
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            draw(ctx, newSimTime);
        }
        return newSimTime;
    });

    if (isRunningRef.current) { // Use ref for isRunning check in rAF
        requestRef.current = requestAnimationFrame(animate);
    }
  }, [draw]);

  const isRunningRef = useRef(isRunning); // Ref to hold current isRunning status for rAF
  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  useEffect(() => {
    if (isRunning) {
      lastFrameTimeRef.current = performance.now(); // Important to reset for accurate deltaTime
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      // Draw final state when paused
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        draw(ctx, simulationTime);
      }
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isRunning, animate, draw, simulationTime]);


  const handleToggleRun = () => {
    setIsRunning(!isRunning);
  };

  const handleResetTime = () => {
    setIsRunning(false);
    setSimulationTime(0);
    lastFrameTimeRef.current = 0; 
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
        draw(ctx, 0); 
    }
  };
  
  useEffect(() => { // Initial draw and redraw on parameter change when not running
    if (!isRunning) {
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) draw(ctx, simulationTime);
    }
  },[angularFrequency, visualAmplitude, draw, simulationTime, isRunning, calculateSHMParameters]);


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
                Observe Simple Harmonic Motion of a mass on a horizontal spring.
              </CardDescription>
            </div>
             <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="icon"><HelpCircle className="h-5 w-5"/></Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                    {/* ... (popover content unchanged) ... */}
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
                    <Label htmlFor="amplitudeSetting">Visual Amplitude Scale: {(amplitudeSetting * 100).toFixed(0)}%</Label>
                     <div className="flex items-center gap-2">
                      <Slider id="amplitudeSetting" min={0.1} max={1} step={0.05} value={[amplitudeSetting]} onValueChange={(v) => setAmplitudeSetting(v[0])} />
                       <Input type="number" value={amplitudeSetting} onChange={(e) => setAmplitudeSetting(parseFloat(e.target.value) || 0.1)} className="w-20 h-8" step="0.1" min="0.1" max="1"/>
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
                   <p className="text-xs text-muted-foreground pt-1">Sim Time (t): {simulationTime.toFixed(2)}s</p>
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
                    <p className="text-xs text-muted-foreground">Motion is horizontal. Spring fixed on the left.</p>
                 </CardFooter>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
