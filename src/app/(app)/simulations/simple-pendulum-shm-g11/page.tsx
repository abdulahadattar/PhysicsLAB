
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

const G_DEFAULT = 9.81; // m/s^2

export default function SimplePendulumSHMPage() {
  const [length, setLength] = useState(1); // meters
  const [gravity, setGravity] = useState(G_DEFAULT); // m/s^2
  const [initialAngle, setInitialAngle] = useState(15); // degrees, for small angle approximation

  const [period, setPeriod] = useState(0);
  const [angularFrequency, setAngularFrequency] = useState(0);

  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const requestRef = useRef<number>();
  const startTimeRef = useRef<number>(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasWidth = 300;
  const canvasHeight = 250;
  const pivotX = canvasWidth / 2;
  const pivotY = 30;
  const visualScale = 80; // pixels per meter for length

  const calculateSHMParameters = useCallback(() => {
    if (length > 0 && gravity > 0) {
      const T = 2 * Math.PI * Math.sqrt(length / gravity);
      const omega = Math.sqrt(gravity / length);
      setPeriod(T);
      setAngularFrequency(omega);
    } else {
      setPeriod(0);
      setAngularFrequency(0);
    }
  }, [length, gravity]);

  useEffect(() => {
    calculateSHMParameters();
  }, [calculateSHMParameters]);

  const drawPendulum = useCallback((ctx: CanvasRenderingContext2D, elapsedSeconds: number) => {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const currentAngleRad = (initialAngle * Math.PI / 180) * Math.cos(angularFrequency * elapsedSeconds);
    
    const bobX = pivotX + (length * visualScale) * Math.sin(currentAngleRad);
    const bobY = pivotY + (length * visualScale) * Math.cos(currentAngleRad);
    const bobRadius = 8;

    // Draw string
    ctx.beginPath();
    ctx.moveTo(pivotX, pivotY);
    ctx.lineTo(bobX, bobY);
    ctx.strokeStyle = "hsl(var(--primary))";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw pivot
    ctx.fillStyle = "hsl(var(--muted-foreground))";
    ctx.beginPath();
    ctx.arc(pivotX, pivotY, 3, 0, 2 * Math.PI);
    ctx.fill();

    // Draw bob
    ctx.fillStyle = "hsl(var(--accent))";
    ctx.beginPath();
    ctx.arc(bobX, bobY, bobRadius, 0, 2 * Math.PI);
    ctx.fill();

  }, [length, initialAngle, angularFrequency, visualScale]);


  const animate = (timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }
    const elapsedFromStart = (timestamp - startTimeRef.current) / 1000; // seconds since this animation segment started
    const newTime = time + elapsedFromStart; // total accumulated time

    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      drawPendulum(ctx, newTime);
    }
    
    if (isRunning) { // Continue if still running
        requestRef.current = requestAnimationFrame(animate);
    } else { // If paused, update accumulated time
        setTime(newTime); 
    }
  };
  
  useEffect(() => { // Handles initial draw and redraws if parameters change while paused
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) drawPendulum(ctx, time);
  },[drawPendulum, time]); // Redraw if pendulum parameters or current time (if paused) changes


  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = performance.now(); // Reset start time for this run segment
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        // Time is updated inside animate when isRunning becomes false.
      }
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning]); // Only re-trigger animation loop on isRunning change

  const handleToggleRun = () => {
    if (isRunning) { // about to pause
         // current elapsed time for this segment will be captured by animate() when isRunning becomes false
    } else { // about to play
        // time is already accumulated, startTimeRef will be set in animate()
    }
    setIsRunning(!isRunning);
  };

  const handleResetTime = () => {
    setTime(0);
    setIsRunning(false);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
        drawPendulum(ctx, 0);
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
              <CardTitle className="text-3xl">Simple Pendulum SHM</CardTitle>
              <CardDescription>
                Observe Simple Harmonic Motion of a simple pendulum (small angle approximation).
              </CardDescription>
            </div>
             <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="icon"><HelpCircle className="h-5 w-5"/></Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                    <h4 className="font-medium leading-none mb-2">How to Use</h4>
                    <p className="text-sm text-muted-foreground">
                        - Adjust Length (L), Gravity (g), and Initial Angle.
                        <br/>- Calculated Period (T) and Angular Frequency (ω) will update.
                        <br/>- Press Play/Pause to run or pause the animation.
                        <br/>- Reset sets time to 0.
                    </p>
                    <h4 className="font-medium leading-none mt-3 mb-1">Formulas (Small Angle):</h4>
                     <ul className="text-xs text-muted-foreground list-disc pl-4">
                        <li>Angular Frequency (ω): √(g/L)</li>
                        <li>Period (T): 2π / ω = 2π√(L/g)</li>
                     </ul>
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
                    <Label htmlFor="length">Length (L): {length.toFixed(2)} m</Label>
                    <Slider id="length" min={0.1} max={3} step={0.05} value={[length]} onValueChange={(v) => setLength(v[0])} />
                  </div>
                  <div>
                    <Label htmlFor="gravity">Gravity (g): {gravity.toFixed(2)} m/s²</Label>
                    <Slider id="gravity" min={1} max={25} step={0.1} value={[gravity]} onValueChange={(v) => setGravity(v[0])} />
                  </div>
                  <div>
                    <Label htmlFor="initialAngle">Initial Angle (θ₀): {initialAngle.toFixed(1)}°</Label>
                    <Slider id="initialAngle" min={1} max={30} step={0.5} value={[initialAngle]} onValueChange={(v) => setInitialAngle(v[0])} />
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
                  <p>Angular ω: <span className="font-semibold">{angularFrequency.toFixed(3)} rad/s</span></p>
                  <p className="text-xs text-muted-foreground pt-1">Time (t): {time.toFixed(2)}s</p>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-2">
              <Card className="h-full">
                <CardHeader><CardTitle className="text-xl">Visual Simulation</CardTitle></CardHeader>
                <CardContent className="flex items-center justify-center p-2 h-[300px]"> {/* Increased height for pendulum */}
                  <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight} className="bg-muted rounded-md border"></canvas>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
