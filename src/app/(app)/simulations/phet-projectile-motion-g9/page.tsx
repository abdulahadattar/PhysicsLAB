
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, HelpCircle, Play, RefreshCw, Orbit, Target } from "lucide-react";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const G = 9.81; // m/s^2
const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 300;
const PROJECTILE_RADIUS = 5;
const LAUNCHER_BASE_X = 30;
const LAUNCHER_BASE_Y = CANVAS_HEIGHT - 30;

interface Point {
  x: number;
  y: number;
}

interface ProjectileState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  time: number;
}

export default function PhetProjectileMotionG9Page() {
  const [launchAngle, setLaunchAngle] = useState(45); // degrees
  const [initialSpeed, setInitialSpeed] = useState(20); // m/s
  // const [mass, setMass] = useState(1); // kg - Not used in physics without air resistance yet
  // const [airResistance, setAirResistance] = useState(false);

  const [projectile, setProjectile] = useState<ProjectileState | null>(null);
  const [trajectory, setTrajectory] = useState<Point[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const [maxHeight, setMaxHeight] = useState(0);
  const [range, setRange] = useState(0);
  const [timeOfFlight, setTimeOfFlight] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameIdRef = useRef<number>();

  const scale = 5; // pixels per meter

  // Calculate derived values for display and physics
  const angleRad = launchAngle * (Math.PI / 180);
  const v0x = initialSpeed * Math.cos(angleRad);
  const v0y = initialSpeed * Math.sin(angleRad);

  const calculateMetrics = useCallback(() => {
    if (initialSpeed <= 0) {
      setMaxHeight(0);
      setRange(0);
      setTimeOfFlight(0);
      return;
    }
    const tof = (2 * v0y) / G;
    const r = v0x * tof;
    const hMax = (v0y * v0y) / (2 * G);

    setTimeOfFlight(tof > 0 ? tof : 0);
    setRange(r > 0 ? r : 0);
    setMaxHeight(hMax > 0 ? hMax : 0);
  }, [v0x, v0y, initialSpeed]);

  useEffect(() => {
    calculateMetrics();
  }, [calculateMetrics]);

  const resetSimulation = useCallback(() => {
    setIsRunning(false);
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
    }
    setProjectile(null);
    setTrajectory([]);
    calculateMetrics(); // Recalculate metrics based on current slider values
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        drawLauncher(ctx, angleRad);
        drawGround(ctx);
      }
    }
  }, [calculateMetrics, angleRad]);

  const drawLauncher = (ctx: CanvasRenderingContext2D, currentAngleRad: number) => {
    const cannonLength = 30;
    const cannonWidth = 10;
    ctx.save();
    ctx.translate(LAUNCHER_BASE_X, LAUNCHER_BASE_Y);
    ctx.rotate(-currentAngleRad); // Negative for typical canvas rotation
    ctx.fillStyle = "hsl(var(--primary))";
    ctx.fillRect(0, -cannonWidth / 2, cannonLength, cannonWidth);
    ctx.beginPath();
    ctx.arc(0,0, cannonWidth * 0.7, 0, 2*Math.PI);
    ctx.fill();
    ctx.restore();
  };

  const drawGround = (ctx: CanvasRenderingContext2D) => {
    ctx.beginPath();
    ctx.moveTo(0, LAUNCHER_BASE_Y);
    ctx.lineTo(CANVAS_WIDTH, LAUNCHER_BASE_Y);
    ctx.strokeStyle = "hsl(var(--muted-foreground))";
    ctx.lineWidth = 2;
    ctx.stroke();
  };
  
  const drawProjectile = (ctx: CanvasRenderingContext2D, p: ProjectileState) => {
    ctx.beginPath();
    ctx.arc(LAUNCHER_BASE_X + p.x * scale, LAUNCHER_BASE_Y - p.y * scale, PROJECTILE_RADIUS, 0, 2 * Math.PI);
    ctx.fillStyle = "hsl(var(--destructive))";
    ctx.fill();
  };

  const drawTrajectory = (ctx: CanvasRenderingContext2D, points: Point[]) => {
    if (points.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(LAUNCHER_BASE_X + points[0].x * scale, LAUNCHER_BASE_Y - points[0].y * scale);
    points.forEach(p => {
      ctx.lineTo(LAUNCHER_BASE_X + p.x * scale, LAUNCHER_BASE_Y - p.y * scale);
    });
    ctx.strokeStyle = "hsla(var(--primary) / 0.5)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  };
  
  // Initial draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        drawLauncher(ctx, angleRad);
        drawGround(ctx);
        if (projectile) drawProjectile(ctx, projectile);
        if (trajectory.length > 0) drawTrajectory(ctx, trajectory);
      }
    }
  }, [angleRad, projectile, trajectory]); // Redraw launcher if angle changes

  const launchProjectile = () => {
    if (initialSpeed <= 0) {
      alert("Please set a positive initial speed.");
      return;
    }
    resetSimulation(); // Reset before new launch
    
    const newProjectile: ProjectileState = {
      x: 0,
      y: 0, // Launching from ground level (0,0) relative to launcher base
      vx: v0x,
      vy: v0y,
      time: 0,
    };
    setProjectile(newProjectile);
    setTrajectory([{ x: 0, y: 0 }]);
    setIsRunning(true);
  };

  const gameLoop = useCallback((timestamp: number, lastTimestamp: number) => {
    if (!isRunning || !projectile) {
      animationFrameIdRef.current = undefined;
      return;
    }

    const deltaTime = (timestamp - lastTimestamp) / 1000; // seconds

    let newX = projectile.x + projectile.vx * deltaTime;
    let newVy = projectile.vy - G * deltaTime;
    let newY = projectile.y + projectile.vy * deltaTime - 0.5 * G * deltaTime * deltaTime;
    const newTime = projectile.time + deltaTime;

    if (newY < 0) { // Hit the ground
      // Simple impact adjustment - can be refined
      const tToGround = projectile.y / projectile.vy; // Approximate remaining time to hit ground from last positive Y
      newX = projectile.x + projectile.vx * tToGround;
      newY = 0;
      setIsRunning(false);
      setProjectile(prev => prev ? {...prev, x: newX, y: newY, vy: 0, time: newTime } : null);
      setTrajectory(prev => [...prev, { x: newX, y: newY }]);
      animationFrameIdRef.current = undefined;
      return;
    }
    
    setProjectile({ x: newX, y: newY, vx: projectile.vx, vy: newVy, time: newTime });
    setTrajectory(prev => [...prev, { x: newX, y: newY }]);

    animationFrameIdRef.current = requestAnimationFrame((newTimestamp) => gameLoop(newTimestamp, timestamp));
  }, [isRunning, projectile]);


  useEffect(() => {
    if (isRunning && projectile) {
      animationFrameIdRef.current = requestAnimationFrame((timestamp) => gameLoop(timestamp, timestamp));
    } else {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = undefined;
      }
    }
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [isRunning, projectile, gameLoop]);


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
                <Orbit className="h-8 w-8 text-primary" />
                PhET: Projectile Motion
              </CardTitle>
              <CardDescription>
                Grade 9 - Launch objects and explore their trajectories. Adjust launch angle and initial speed. (Air resistance not simulated yet).
              </CardDescription>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon"><HelpCircle className="h-5 w-5"/></Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 text-sm">
                 <h4 className="font-medium leading-none mb-2">Projectile Motion Simulator</h4>
                 <p className="text-muted-foreground">
                    Set the launch angle and initial speed. Click "Fire" to launch the projectile.
                    Observe its trajectory. The simulation calculates range, max height, and time of flight (for launch from ground level, no air resistance).
                    Use "Reset" to clear the simulation.
                 </p>
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
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="launchAngle">Launch Angle: {launchAngle.toFixed(1)}°</Label>
                    <Slider id="launchAngle" min={0} max={90} step={1} value={[launchAngle]} onValueChange={(v) => {setLaunchAngle(v[0]); if(!isRunning) resetSimulation();}} />
                  </div>
                  <div>
                    <Label htmlFor="initialSpeed">Initial Speed: {initialSpeed.toFixed(1)} m/s</Label>
                    <Slider id="initialSpeed" min={1} max={50} step={0.5} value={[initialSpeed]} onValueChange={(v) => {setInitialSpeed(v[0]); if(!isRunning) resetSimulation();}} />
                  </div>
                  {/* Placeholder for mass and air resistance later
                  <div>
                    <Label htmlFor="mass">Mass: {mass} kg</Label>
                    <Slider id="mass" min={0.1} max={10} step={0.1} value={[mass]} onValueChange={(v) => setMass(v[0])} />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="airResistance" checked={airResistance} onCheckedChange={setAirResistance} />
                    <Label htmlFor="airResistance">Air Resistance</Label>
                  </div>
                  */}
                  <div className="flex gap-2 pt-2">
                    <Button onClick={launchProjectile} disabled={isRunning} className="flex-1 bg-green-600 hover:bg-green-700">
                      <Play className="mr-2 h-4 w-4"/> Fire
                    </Button>
                    <Button onClick={resetSimulation} variant="outline" className="flex-1">
                      <RefreshCw className="mr-2 h-4 w-4"/>Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-lg">Calculated Metrics</CardTitle></CardHeader>
                <CardContent className="space-y-1 text-sm">
                    <p>Max Height (H): <span className="font-semibold">{maxHeight.toFixed(2)} m</span></p>
                    <p>Range (R): <span className="font-semibold">{range.toFixed(2)} m</span></p>
                    <p>Time of Flight (T): <span className="font-semibold">{timeOfFlight.toFixed(2)} s</span></p>
                </CardContent>
              </Card>
            </div>

            {/* Visualization Column */}
            <div className="md:col-span-2">
              <Card className="h-full">
                <CardHeader><CardTitle className="text-lg">Trajectory Visualization</CardTitle></CardHeader>
                <CardContent className="flex items-center justify-center p-0">
                  <canvas 
                    ref={canvasRef} 
                    width={CANVAS_WIDTH} 
                    height={CANVAS_HEIGHT} 
                    className="bg-muted rounded-md border border-input shadow-inner"
                  />
                </CardContent>
                 <CardFooter className="pt-4">
                    <p className="text-xs text-muted-foreground">
                        Visual representation of projectile motion. The orange line shows the trajectory path.
                    </p>
                </CardFooter>
              </Card>
              {/* Placeholder for target game mode later
              <Card className="mt-4">
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Target className="h-5 w-5 text-destructive" /> Hit the Target!</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Target at X: 100m, Y: 20m. Try to hit it!</p>
                </CardContent>
              </Card>
              */}
            </div>
          </div>
        </CardContent>
         <CardFooter>
            <p className="text-xs text-muted-foreground">
              Inspired by PhET Interactive Simulations, University of Colorado Boulder.
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}

