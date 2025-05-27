"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, HelpCircle, Play, Pause, RefreshCw, MoveVertical } from "lucide-react";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const G_DEFAULT = 9.81; // m/s^2
const G_MOON = 1.62;
const G_JUPITER = 24.79;

const CANVAS_WIDTH = 300;
const CANVAS_HEIGHT = 250;
const PIVOT_X = CANVAS_WIDTH / 2;
const PIVOT_Y = 30;
const BOB_RADIUS = 8;
const VISUAL_SCALE_FACTOR_INITIAL = 80;

export default function SimplePendulumSHMPage() {
  const [length, setLength] = useState(1.0); // meters
  const [gravity, setGravity] = useState(G_DEFAULT); // m/s^2
  const [initialAngle, setInitialAngle] = useState(15); // degrees

  const [period, setPeriod] = useState(0);
  const [angularFrequency, setAngularFrequency] = useState(0);
  const [frequencyHz, setFrequencyHz] = useState(0);

  const [isRunning, setIsRunning] = useState(false);
  const [simulationTime, setSimulationTime] = useState(0);
  const requestRef = useRef<number>();
  const lastFrameTimeRef = useRef<number>(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const visualScale = Math.min(VISUAL_SCALE_FACTOR_INITIAL, (CANVAS_HEIGHT - PIVOT_Y - BOB_RADIUS - 10) / Math.max(0.1, length));

  const calculateSHMParameters = useCallback(() => {
    if (length > 0 && gravity > 0) {
      const T = 2 * Math.PI * Math.sqrt(length / gravity);
      const omega = 2 * Math.PI / T;
      const f = 1 / T;
      setPeriod(T);
      setAngularFrequency(omega);
      setFrequencyHz(f);
    } else {
      setPeriod(0);
      setAngularFrequency(0);
      setFrequencyHz(0);
    }
  }, [length, gravity]);

  useEffect(() => {
    calculateSHMParameters();
  }, [calculateSHMParameters]);

  const drawPendulum = useCallback((ctx: CanvasRenderingContext2D, elapsedSeconds: number) => {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    const initialAngleRad = initialAngle * (Math.PI / 180);
    const currentAngleRad = angularFrequency > 0 
      ? initialAngleRad * Math.cos(angularFrequency * elapsedSeconds)
      : initialAngleRad;
    const pendulumArmVisualLength = length * visualScale;
    const bobX = PIVOT_X + pendulumArmVisualLength * Math.sin(currentAngleRad);
    const bobY = PIVOT_Y + pendulumArmVisualLength * Math.cos(currentAngleRad);
    // Draw string
    ctx.beginPath();
    ctx.moveTo(PIVOT_X, PIVOT_Y);
    ctx.lineTo(bobX, bobY);
    ctx.strokeStyle = "hsl(var(--primary))";
    ctx.lineWidth = 2;
    ctx.stroke();
    // Draw pivot
    ctx.fillStyle = "hsl(var(--muted-foreground))";
    ctx.beginPath();
    ctx.arc(PIVOT_X, PIVOT_Y, 4, 0, 2 * Math.PI);
    ctx.fill();
    // Draw bob
    ctx.fillStyle = "hsl(var(--accent))";
    ctx.beginPath();
    ctx.arc(bobX, bobY, BOB_RADIUS, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = "hsl(var(--accent-foreground))";
    ctx.lineWidth = 1;
    ctx.stroke();
  }, [length, initialAngle, angularFrequency, visualScale]);

  const isRunningRef = useRef(isRunning);
  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);

  const animate = useCallback((timestamp: number) => {
    if (!lastFrameTimeRef.current) {
      lastFrameTimeRef.current = timestamp;
    }
    const deltaTime = (timestamp - lastFrameTimeRef.current) / 1000;
    lastFrameTimeRef.current = timestamp;
    setSimulationTime(prevTime => {
      const newTime = prevTime + deltaTime;
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) drawPendulum(ctx, newTime);
      return newTime;
    });
    if (isRunningRef.current) {
      requestRef.current = requestAnimationFrame(animate);
    }
  }, [drawPendulum]);

  useEffect(() => {
    if (isRunning) {
      lastFrameTimeRef.current = performance.now();
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) drawPendulum(ctx, simulationTime);
    }
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [isRunning, animate, drawPendulum, simulationTime]);

  useEffect(() => {
    if (!isRunning) {
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) drawPendulum(ctx, simulationTime);
    }
  }, [length, initialAngle, gravity, simulationTime, drawPendulum, isRunning, calculateSHMParameters]);

  const handleToggleRun = () => setIsRunning(!isRunning);
  const handleResetTime = () => {
    setIsRunning(false);
    setSimulationTime(0);
    lastFrameTimeRef.current = 0;
  };
  useEffect(() => { handleResetTime(); }, [length, gravity, initialAngle, calculateSHMParameters]);

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
                <MoveVertical className="h-7 w-7 md:h-8 md:w-8 text-primary" />Simple Pendulum SHM (Class 10/11)
              </CardTitle>
              <CardDescription>
                Observe Simple Harmonic Motion of a simple pendulum (small angle approximation).
              </CardDescription>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8 md:h-9 md:w-9"><HelpCircle className="h-4 w-4 md:h-5 md:w-5"/></Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 text-sm">
                <h4 className="font-medium leading-none mb-2">How to Use</h4>
                <p className="text-muted-foreground text-xs">
                  - Adjust Length (L), Gravity (g), and Initial Angle (θ₀).
                  <br/>- Calculated Period (T), Frequency (f), and Angular Frequency (ω) will update.
                  <br/>- Press Play/Pause to run or pause the animation.
                  <br/>- Reset Time sets the simulation time to 0.
                  <br/>- The visual scale adapts to keep the pendulum on screen.
                </p>
                <h4 className="font-medium leading-none mt-3 mb-1">Formulas (Small Angle):</h4>
                <ul className="text-xs text-muted-foreground list-disc pl-4">
                  <li>Angular Frequency (ω): √(g/L)</li>
                  <li>Period (T): 2π / ω = 2π√(L/g)</li>
                  <li>Frequency (f): 1 / T</li>
                </ul>
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            <div className="md:col-span-1 space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-lg md:text-xl">Controls</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label htmlFor="length">Length (L): {length.toFixed(2)} m</Label>
                    <Slider id="length" min={0.1} max={2.5} step={0.05} value={[length]} onValueChange={(v) => setLength(v[0])} />
                  </div>
                  <div>
                    <Label htmlFor="gravity">Gravity (g): {gravity.toFixed(2)} m/s²</Label>
                    <Slider id="gravity" min={1} max={25} step={0.1} value={[gravity]} onValueChange={(v) => setGravity(v[0])} />
                    <div className="flex gap-1 mt-1.5">
                      <Button size="sm" variant="outline" onClick={()=>setGravity(G_MOON)}>Moon</Button>
                      <Button size="sm" variant="outline" onClick={()=>setGravity(G_DEFAULT)}>Earth</Button>
                      <Button size="sm" variant="outline" onClick={()=>setGravity(G_JUPITER)}>Jupiter</Button>
                    </div>
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
                    <Button onClick={handleResetTime} variant="outline" className="flex-1">
                      <RefreshCw className="mr-2 h-4 w-4"/> Reset Time
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-lg md:text-xl">Calculated Values</CardTitle></CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <p>Period (T): <span className="font-semibold">{period > 0 ? period.toFixed(3) : "N/A"} s</span></p>
                  <p>Frequency (f): <span className="font-semibold">{frequencyHz > 0 ? frequencyHz.toFixed(3) : "N/A"} Hz</span></p>
                  <p>Angular ω: <span className="font-semibold">{angularFrequency > 0 ? angularFrequency.toFixed(3) : "N/A"} rad/s</span></p>
                  <p className="text-xs text-muted-foreground pt-1">Anim. Time (t): {simulationTime.toFixed(2)}s</p>
                </CardContent>
              </Card>
            </div>
            <div className="md:col-span-2">
              <Card className="h-full">
                <CardHeader><CardTitle className="text-lg md:text-xl">Visual Simulation</CardTitle></CardHeader>
                <CardContent className="flex items-center justify-center p-2 min-h-[280px]">
                  <canvas 
                    ref={canvasRef} 
                    width={CANVAS_WIDTH} 
                    height={CANVAS_HEIGHT} 
                    className="bg-muted rounded-md border border-input shadow-inner"
                    role="img"
                    aria-label={`Animation of a simple pendulum. Length ${length.toFixed(2)}m, initial angle ${initialAngle.toFixed(1)} degrees. Simulation is ${isRunning ? 'running' : 'paused'}.`}
                  ></canvas>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground">
            This simulation uses the small angle approximation (sin(θ) ≈ θ) for calculating the period. The animation accurately reflects SHM.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
