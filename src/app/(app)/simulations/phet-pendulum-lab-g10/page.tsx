
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, HelpCircle, Play, Pause, RefreshCw, MoveVertical } from "lucide-react";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const G_EARTH = 9.81;
const G_MOON = 1.62;
const G_JUPITER = 24.79;

const CANVAS_WIDTH = 300;
const CANVAS_HEIGHT = 250;
const PIVOT_X = CANVAS_WIDTH / 2;
const PIVOT_Y = 30;
const VISUAL_SCALE_FACTOR = 80; // pixels per meter for pendulum length
const BOB_RADIUS = 10;

export default function PhetPendulumLabG10Page() {
  const [length, setLength] = useState(1.0); // meters
  const [mass, setMass] = useState(1.0); // kg
  const [gravity, setGravity] = useState(G_EARTH); // m/s^2
  const [initialAngleDegrees, setInitialAngleDegrees] = useState(15); // degrees

  const [period, setPeriod] = useState(0);
  const [frequency, setFrequency] = useState(0);
  const [angularFrequency, setAngularFrequency] = useState(0);

  const [isRunning, setIsRunning] = useState(false);
  const [simulationTime, setSimulationTime] = useState(0); // elapsed simulation time

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const lastFrameTimeRef = useRef<number>(0);

  const calculatePendulumProperties = useCallback(() => {
    if (length > 0 && gravity > 0) {
      const T = 2 * Math.PI * Math.sqrt(length / gravity);
      const omega = 2 * Math.PI / T; // or Math.sqrt(gravity / length)
      const f = 1 / T;
      setPeriod(T);
      setAngularFrequency(omega);
      setFrequency(f);
    } else {
      setPeriod(0);
      setFrequency(0);
      setAngularFrequency(0);
    }
  }, [length, gravity]);

  useEffect(() => {
    calculatePendulumProperties();
  }, [calculatePendulumProperties]);

  const drawPendulum = useCallback((ctx: CanvasRenderingContext2D, currentAngleRad: number) => {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const bobX = PIVOT_X + (length * VISUAL_SCALE_FACTOR) * Math.sin(currentAngleRad);
    const bobY = PIVOT_Y + (length * VISUAL_SCALE_FACTOR) * Math.cos(currentAngleRad);

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

  }, [length]);

  const animate = useCallback((timestamp: number) => {
    if (!lastFrameTimeRef.current) {
      lastFrameTimeRef.current = timestamp;
    }
    const deltaTime = (timestamp - lastFrameTimeRef.current) / 1000; // seconds
    lastFrameTimeRef.current = timestamp;

    setSimulationTime(prevTime => {
      const newTime = prevTime + deltaTime;
      const initialAngleRad = initialAngleDegrees * (Math.PI / 180);
      const currentAngleRad = angularFrequency > 0 
        ? initialAngleRad * Math.cos(angularFrequency * newTime)
        : initialAngleRad; // If omega is 0, pendulum stays at initial angle

      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        drawPendulum(ctx, currentAngleRad);
      }
      return newTime;
    });
    
    if (isRunningRef.current) {
        requestRef.current = requestAnimationFrame(animate);
    }
  }, [initialAngleDegrees, angularFrequency, drawPendulum]);

  const isRunningRef = useRef(isRunning);
  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);

  useEffect(() => {
    if (isRunning) {
      lastFrameTimeRef.current = performance.now();
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      // Draw static frame when paused or parameters change
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        const initialAngleRad = initialAngleDegrees * (Math.PI / 180);
         const currentAngleRad = angularFrequency > 0 
          ? initialAngleRad * Math.cos(angularFrequency * simulationTime)
          : initialAngleRad;
        drawPendulum(ctx, currentAngleRad);
      }
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isRunning, animate, drawPendulum, initialAngleDegrees, angularFrequency, simulationTime]);
  
  // Initial draw when component mounts or parameters change (while paused)
  useEffect(() => {
    if (!isRunning) {
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            const initialAngleRad = initialAngleDegrees * (Math.PI / 180);
            const currentAngleRad = angularFrequency > 0 
            ? initialAngleRad * Math.cos(angularFrequency * simulationTime)
            : initialAngleRad;
            drawPendulum(ctx, currentAngleRad);
        }
    }
  }, [length, gravity, initialAngleDegrees, simulationTime, angularFrequency, drawPendulum, isRunning]);


  const handleToggleRun = () => setIsRunning(!isRunning);

  const handleReset = () => {
    setIsRunning(false);
    setSimulationTime(0);
    lastFrameTimeRef.current = 0; // Reset for next play
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      const initialAngleRad = initialAngleDegrees * (Math.PI / 180);
      drawPendulum(ctx, initialAngleRad); // Draw at initial position
    }
  };
  
  // Reset simulation if physics parameters change
  useEffect(() => {
    handleReset();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [length, mass, gravity, initialAngleDegrees, calculatePendulumProperties]);

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
              <CardTitle className="text-3xl flex items-center gap-2">
                <MoveVertical className="h-8 w-8 text-primary" />
                G10: PhET: Pendulum Lab
              </CardTitle>
              <CardDescription>
                Investigate pendulum period. Change length, mass, gravity, and initial angle.
                STBB Relevance: Simple Pendulum, Factors Affecting Period, SHM (G10, Unit 1).
              </CardDescription>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon"><HelpCircle className="h-5 w-5"/></Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 text-sm">
                 <h4 className="font-medium leading-none mb-2">Pendulum Lab Help</h4>
                 <ul className="list-disc pl-4 text-muted-foreground space-y-1">
                    <li>Adjust Length, Mass, Gravity, and Initial Angle using sliders or inputs.</li>
                    <li>Observe the pendulum's motion and the calculated Period.</li>
                    <li>Use Play/Pause to control the animation. Reset returns to t=0.</li>
                    <li>Note: The period calculation uses the small angle approximation (T ≈ 2π√(L/g)).</li>
                 </ul>
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6 items-start">
            {/* Controls Column */}
            <div className="md:col-span-1 space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-lg">Controls</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label htmlFor="length-slider">Length (L): {length.toFixed(2)} m</Label>
                    <Slider id="length-slider" min={0.1} max={2.0} step={0.05} value={[length]} onValueChange={(v) => setLength(v[0])} />
                    <Input type="number" value={length} onChange={e => setLength(parseFloat(e.target.value) || 0.1)} className="h-8 mt-1 text-sm" step="0.05"/>
                  </div>
                  <div>
                    <Label htmlFor="mass-slider">Mass (m): {mass.toFixed(2)} kg</Label>
                    <Slider id="mass-slider" min={0.1} max={2.0} step={0.05} value={[mass]} onValueChange={(v) => setMass(v[0])} />
                     <Input type="number" value={mass} onChange={e => setMass(parseFloat(e.target.value) || 0.1)} className="h-8 mt-1 text-sm" step="0.05"/>
                  </div>
                  <div>
                    <Label htmlFor="gravity-slider">Gravity (g): {gravity.toFixed(2)} m/s²</Label>
                    <Slider id="gravity-slider" min={1.0} max={25.0} step={0.1} value={[gravity]} onValueChange={(v) => setGravity(v[0])} />
                    <div className="flex gap-1 mt-1">
                        <Button size="xs" variant="outline" onClick={()=>setGravity(G_MOON)}>Moon</Button>
                        <Button size="xs" variant="outline" onClick={()=>setGravity(G_EARTH)}>Earth</Button>
                        <Button size="xs" variant="outline" onClick={()=>setGravity(G_JUPITER)}>Jupiter</Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="angle-slider">Initial Angle (θ₀): {initialAngleDegrees.toFixed(1)}°</Label>
                    <Slider id="angle-slider" min={1} max={45} step={0.5} value={[initialAngleDegrees]} onValueChange={(v) => setInitialAngleDegrees(v[0])} />
                     <Input type="number" value={initialAngleDegrees} onChange={e => setInitialAngleDegrees(parseFloat(e.target.value) || 1)} className="h-8 mt-1 text-sm" step="0.5"/>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button onClick={handleToggleRun} className="flex-1">
                      {isRunning ? <Pause className="mr-2 h-4 w-4"/> : <Play className="mr-2 h-4 w-4"/>}
                      {isRunning ? "Pause" : "Play"}
                    </Button>
                    <Button onClick={handleReset} variant="outline"><RefreshCw className="mr-2 h-4 w-4"/>Reset</Button>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-lg">Calculated Properties</CardTitle></CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <p>Period (T): <span className="font-semibold">{period > 0 ? period.toFixed(3) : "N/A"} s</span></p>
                  <p>Frequency (f): <span className="font-semibold">{frequency > 0 ? frequency.toFixed(3) : "N/A"} Hz</span></p>
                  <p>Angular Freq. (ω): <span className="font-semibold">{angularFrequency > 0 ? angularFrequency.toFixed(3) : "N/A"} rad/s</span></p>
                   <p className="text-xs text-muted-foreground pt-1">Sim. Time: {simulationTime.toFixed(2)}s</p>
                </CardContent>
              </Card>
            </div>

            {/* Visualization Column */}
            <div className="md:col-span-2">
              <Card className="h-full">
                <CardHeader><CardTitle className="text-lg">Pendulum Animation</CardTitle></CardHeader>
                <CardContent className="flex items-center justify-center p-2 h-[300px]"> {/* Increased height for pendulum */}
                  <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="bg-muted rounded-md border border-input shadow-inner"></canvas>
                </CardContent>
                <CardFooter>
                    <p className="text-xs text-muted-foreground">
                        Observe the simple pendulum's motion. The period shown is based on the small angle approximation.
                    </p>
                </CardFooter>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

