
"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, HelpCircle } from "lucide-react";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input"; 
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const G = 9.81; // Acceleration due to gravity (m/s^2)

interface TrajectoryPoint {
  x: number;
  y: number;
}

export default function ProjectileMotionG11Page() {
  const [initialVelocity, setInitialVelocity] = useState(20); // m/s
  const [launchAngle, setLaunchAngle] = useState(45); // degrees
  const [initialHeight, setInitialHeight] = useState(0); // meters

  const [trajectory, setTrajectory] = useState<TrajectoryPoint[]>([]);
  const [timeOfFlight, setTimeOfFlight] = useState(0);
  const [maxHeight, setMaxHeight] = useState(0);
  const [range, setRange] = useState(0);

  const [canvasWidth, setCanvasWidth] = useState(500); // SVG width
  const [canvasHeight, setCanvasHeight] = useState(300); // SVG height
  const [scaleX, setScaleX] = useState(10); // Pixels per meter
  const [scaleY, setScaleY] = useState(10); // Pixels per meter
  const [originX, setOriginX] = useState(30); // SVG origin X
  const [originY, setOriginY] = useState(canvasHeight - 30); // SVG origin Y (bottom left)


  const calculateProjectileMotion = useCallback(() => {
    const angleRad = launchAngle * (Math.PI / 180);
    const v0x = initialVelocity * Math.cos(angleRad);
    const v0y = initialVelocity * Math.sin(angleRad);

    let tof, currentMaxHeightVal, currentRangeVal;

    if (initialHeight < 0) { // Not physically realistic for this sim, treat as 0
        setInitialHeight(0); // Correct state if needed, then recalc will happen
        return;
    }

    if (initialVelocity === 0) {
        if (initialHeight === 0) {
            tof = 0;
            currentMaxHeightVal = 0;
            currentRangeVal = 0;
        } else { // Free fall from initialHeight
            tof = Math.sqrt((2 * initialHeight) / G);
            currentMaxHeightVal = initialHeight;
            currentRangeVal = 0;
        }
    } else {
        // Time to reach y=0 (ground)
        // initialHeight + v0y * t - 0.5 * G * t^2 = 0
        // 0.5 * G * t^2 - v0y * t - initialHeight = 0
        const a_quad = 0.5 * G;
        const b_quad = -v0y;
        const c_quad = -initialHeight;
        const discriminant = b_quad * b_quad - 4 * a_quad * c_quad;

        if (discriminant < 0 && Math.abs(discriminant) < 1e-9) { // Effectively zero discriminant
             tof = -b_quad / (2 * a_quad);
             if (tof < 0) tof = 0;
        } else if (discriminant < 0) {
            // Should not happen if initialHeight >= 0. Indicates an issue or projectile never returns to y=0 from above.
            // For visualization, if it's fired upwards from a height, it will come down.
            // This implies it would always be above y=0 if starting at y=0 and fired down (tof=0).
            tof = 0; // Default if calculation suggests no return to y=0
        } else {
            const t1 = (-b_quad + Math.sqrt(discriminant)) / (2 * a_quad);
            const t2 = (-b_quad - Math.sqrt(discriminant)) / (2 * a_quad);
            tof = Math.max(0, t1, t2); // Ensure positive time
        }
         if (initialHeight === 0 && v0y < 0 && Math.abs(v0x) < 1e-9) { // Fired straight down from ground
            tof = 0;
        }


        currentRangeVal = v0x * tof;

        // Max height calculation:
        // Time to reach peak vertical velocity = 0: t_peak_vy = v0y / G (if v0y > 0)
        // Height reached from initialHeight at t_peak_vy: y_peak = initialHeight + v0y*t_peak_vy - 0.5*G*t_peak_vy^2
        // y_peak = initialHeight + v0y*(v0y/G) - 0.5*G*(v0y/G)^2 = initialHeight + v0y^2/G - 0.5*v0y^2/G = initialHeight + v0y^2/(2G)
        if (v0y > 0) {
            currentMaxHeightVal = initialHeight + (v0y * v0y) / (2 * G);
        } else {
            currentMaxHeightVal = initialHeight; // If fired downwards or horizontally, max height is initial height
        }
    }

    setTimeOfFlight(tof);
    setMaxHeight(currentMaxHeightVal);
    setRange(currentRangeVal);

    const newTrajectory: TrajectoryPoint[] = [];
    const numPoints = 100;
    if (tof > 1e-3) { // Only generate trajectory if time of flight is meaningful
        const timeStep = tof / numPoints;
        for (let i = 0; i <= numPoints; i++) {
            const t = i * timeStep;
            const x = v0x * t;
            const y = initialHeight + v0y * t - 0.5 * G * t * t;
            newTrajectory.push({ x, y: Math.max(0, y) }); // Don't let y go below ground visually
        }
    } else {
        newTrajectory.push({ x: 0, y: initialHeight }); // Start point
        if (initialHeight > 0 || (initialVelocity === 0 && initialHeight === 0)) {
             newTrajectory.push({ x: 0, y: 0 }); // End point at ground if it started above or at origin with no motion
        }
    }
     if (newTrajectory.length === 1 && initialHeight > 0) { // If it's just a drop from rest, ensure start and end points
        newTrajectory.unshift({ x: 0, y: initialHeight }); // Ensure start point is there
        newTrajectory.push({ x: 0, y: 0 });
    }
    if (newTrajectory.length === 0 ) newTrajectory.push({x:0, y:0});


    setTrajectory(newTrajectory);

    // Dynamic scaling for SVG view
    const effectiveRange = Math.max(currentRangeVal, 0.1); // Avoid zero for scaling
    const effectiveMaxHeight = Math.max(currentMaxHeightVal, initialHeight, 0.1); // Consider initial height for y-scale

    const newScaleX = (canvasWidth - 2 * originX) / effectiveRange;
    const newScaleY = (originY - 30) / effectiveMaxHeight; // 30 is top padding for SVG

    setScaleX(Math.max(1, newScaleX)); // Avoid excessively large scales for tiny trajectories
    setScaleY(Math.max(1, newScaleY));


  }, [initialVelocity, launchAngle, initialHeight, canvasWidth, canvasHeight, originX, originY]);

  useEffect(() => {
    calculateProjectileMotion();
  }, [calculateProjectileMotion]); 
  
  useEffect(() => {
    // Adjust origin and effective drawing area if canvas size changes (e.g. responsive)
    setOriginY(canvasHeight - 30);
  }, [canvasHeight]);

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
              <CardTitle className="text-3xl">Projectile Motion Simulator</CardTitle>
              <CardDescription>
                Adjust parameters to observe the projectile's trajectory (g = {G} m/s², no air resistance).
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
                <CardHeader>
                  <CardTitle className="text-xl">Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="initialVelocity">Initial Velocity (v₀): {initialVelocity.toFixed(1)} m/s</Label>
                    <div className="flex items-center gap-2">
                        <Slider
                        id="initialVelocity"
                        min={0} max={100} step={0.5}
                        value={[initialVelocity]}
                        onValueChange={(value) => setInitialVelocity(value[0])}
                        className="flex-grow"
                        />
                        <Input type="number" value={initialVelocity} onChange={(e) => setInitialVelocity(parseFloat(e.target.value) || 0)} className="w-20 h-8"/>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="launchAngle">Launch Angle (θ): {launchAngle.toFixed(1)}°</Label>
                     <div className="flex items-center gap-2">
                        <Slider
                        id="launchAngle"
                        min={0} max={90} step={0.5}
                        value={[launchAngle]}
                        onValueChange={(value) => setLaunchAngle(value[0])}
                        className="flex-grow"
                        />
                        <Input type="number" value={launchAngle} onChange={(e) => setLaunchAngle(parseFloat(e.target.value) || 0)} className="w-20 h-8"/>
                    </div>
                  </div>
                   <div>
                    <Label htmlFor="initialHeight">Initial Height (y₀): {initialHeight.toFixed(1)} m</Label>
                     <div className="flex items-center gap-2">
                        <Slider
                        id="initialHeight"
                        min={0} max={50} step={0.5}
                        value={[initialHeight]}
                        onValueChange={(value) => setInitialHeight(value[0])}
                        className="flex-grow"
                        />
                        <Input type="number" value={initialHeight} onChange={(e) => setInitialHeight(Math.max(0, parseFloat(e.target.value) || 0))} className="w-20 h-8"/>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Calculated Values</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>Time of Flight (T): <span className="font-semibold">{timeOfFlight.toFixed(2)} s</span></p>
                  <p>Maximum Height (H_total): <span className="font-semibold">{maxHeight.toFixed(2)} m</span></p>
                  <p>Range (R): <span className="font-semibold">{range.toFixed(2)} m</span></p>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-2">
              <Card className="h-full">
                <CardHeader>
                    <CardTitle className="text-xl">Trajectory</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-[calc(100%-4rem)] p-2">
                  <svg width={canvasWidth} height={canvasHeight} className="bg-muted rounded-md border border-border overflow-visible">
                    {/* Ground line */}
                    <line x1="0" y1={originY} x2={canvasWidth} y2={originY} stroke="hsl(var(--foreground))" strokeWidth="1" />
                    {/* Y axis (Height) */}
                    <line x1={originX} y1="0" x2={originX} y2={canvasHeight} stroke="hsl(var(--foreground))" strokeWidth="1" />

                    {/* Trajectory path */}
                    {trajectory.length > 1 && (
                        <path
                        d={trajectory.map((p, i) => 
                            `${i === 0 ? 'M' : 'L'} ${originX + p.x * scaleX} ${originY - p.y * scaleY}`
                            ).join(' ')
                        }
                        stroke="hsl(var(--primary))"
                        strokeWidth="2"
                        fill="none"
                        />
                    )}
                    {/* Mark initial position */}
                    {trajectory.length > 0 && (
                         <circle 
                            cx={originX + trajectory[0].x * scaleX}
                            cy={originY - trajectory[0].y * scaleY}
                            r="3"
                            fill="hsl(var(--accent))"
                        />
                    )}
                  </svg>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground">Note: Simulation uses simplified physics model (no air resistance).</p>
        </CardFooter>
      </Card>
    </div>
  );
}
