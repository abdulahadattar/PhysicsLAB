
"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, HelpCircle } from "lucide-react";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input"; // For direct input
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

  const [canvasWidth, setCanvasWidth] = useState(500);
  const [canvasHeight, setCanvasHeight] = useState(300);
  const [scaleX, setScaleX] = useState(1);
  const [scaleY, setScaleY] = useState(1);

  const calculateProjectileMotion = useCallback(() => {
    const angleRad = launchAngle * (Math.PI / 180);
    const v0x = initialVelocity * Math.cos(angleRad);
    const v0y = initialVelocity * Math.sin(angleRad);

    let currentMaxHeight = initialHeight;
    if (v0y > 0) {
      currentMaxHeight = initialHeight + (v0y * v0y) / (2 * G);
    } else if (initialHeight > 0 && v0y <= 0){ 
      currentMaxHeight = initialHeight;
    }
    setMaxHeight(currentMaxHeight);

    const a = 0.5 * G;
    const b_quad = -v0y; // Renamed to avoid conflict with 'b' if used elsewhere
    const c_quad = -initialHeight; // Renamed
    const discriminant = b_quad * b_quad - 4 * a * c_quad;

    let tof = 0;
    if (initialVelocity === 0 && initialHeight === 0) {
        tof = 0;
    } else if (discriminant >= 0) {
      const t1 = (-b_quad + Math.sqrt(discriminant)) / (2 * a);
      const t2 = (-b_quad - Math.sqrt(discriminant)) / (2 * a);
      tof = Math.max(t1, t2 > 0 ? t2 : 0); 
    } else {
      // If discriminant is negative (e.g. fired downwards from a height but never reaches y=0)
      // For this simulation, we'll consider time until y is significantly negative or some max time.
      // Simplified: if it won't hit y=0, perhaps limit to a few seconds or time to reach peak if y0 is high.
      // For now, this scenario might result in tof = 0, leading to minimal trajectory.
      // A more robust handling might involve calculating time to reach a certain negative y or a max simulation time.
      tof = 0; // Fallback if discriminant is negative and not initial drop
    }

    setTimeOfFlight(tof);

    const currentRange = v0x * tof;
    setRange(currentRange);

    const newTrajectory: TrajectoryPoint[] = [];
    if (tof > 0.001) { // Use a small threshold for time of flight
      const timeStep = Math.max(tof / 100, 0.01); // Ensure timeStep is reasonable
      for (let t = 0; t <= tof + timeStep / 2; t += timeStep) { // Iterate slightly past tof to ensure endpoint
        const x = v0x * t;
        const y = initialHeight + v0y * t - 0.5 * G * t * t;
        newTrajectory.push({ x, y: Math.max(0,y) }); // Ensure y doesn't go below ground visually
        if (y < 0 && t > 0) break; // Stop if it goes below ground
      }
      // Ensure the last point is exactly at landing if it hits ground
      if (newTrajectory.length > 0 && newTrajectory[newTrajectory.length -1].y <=0) {
        newTrajectory[newTrajectory.length -1].y = 0;
        newTrajectory[newTrajectory.length -1].x = v0x * tof; // Ensure x is also at landing point
      }

    } else if (initialHeight > 0 && initialVelocity === 0) { 
        const dropTime = Math.sqrt((2 * initialHeight) / G);
        setTimeOfFlight(dropTime);
        setMaxHeight(initialHeight);
        setRange(0);
        newTrajectory.push({x:0, y: initialHeight});
        newTrajectory.push({x:0, y:0}); 
    } else {
         newTrajectory.push({x:0, y:initialHeight}); // Start at initial height if no motion or very short motion
         if(initialHeight === 0) newTrajectory.push({x:0,y:0}); // Add origin if starting at ground with no motion
    }
    
    if(newTrajectory.length === 0) newTrajectory.push({x:0, y:0});


    setTrajectory(newTrajectory);

    const maxTrajX = newTrajectory.reduce((max, p) => Math.max(max, p.x), 0.1); // Avoid 0 for scaling
    const maxTrajY = newTrajectory.reduce((max, p) => Math.max(max, p.y), initialHeight > 0 ? initialHeight : 0.1); // Avoid 0
    
    const newScaleX = (canvasWidth * 0.9) / Math.max(maxTrajX, 1); // Prevent scale from being too large
    const newScaleY = (canvasHeight * 0.9) / Math.max(maxTrajY, 1);
    
    setScaleX(newScaleX);
    setScaleY(newScaleY);

  }, [initialVelocity, launchAngle, initialHeight, canvasWidth, canvasHeight]);

  useEffect(() => {
    calculateProjectileMotion();
  }, [initialVelocity, launchAngle, initialHeight, calculateProjectileMotion]); // Added direct dependencies
  
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
                Adjust initial velocity, launch angle, and initial height to observe the projectile's trajectory.
                (Assumes no air resistance, g = {G} m/s²)
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
                                - Use the sliders or input fields to set parameters.
                                <br/>- The trajectory and calculated values will update automatically.
                                <br/>- The graph scales dynamically based on the trajectory.
                            </p>
                        </div>
                        <div className="space-y-2">
                             <h4 className="font-medium leading-none">Formulas (y₀=0):</h4>
                             <ul className="text-xs text-muted-foreground list-disc pl-4">
                                <li>Range (R): (v₀² * sin(2θ)) / g</li>
                                <li>Max Height (H): (v₀² * sin²(θ)) / (2g)</li>
                                <li>Time of Flight (T): (2 * v₀ * sin(θ)) / g</li>
                             </ul>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Controls Column */}
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
                        <Input type="number" value={initialHeight} onChange={(e) => setInitialHeight(parseFloat(e.target.value) || 0)} className="w-20 h-8"/>
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
                  <p>Maximum Height (H): <span className="font-semibold">{maxHeight.toFixed(2)} m</span></p>
                  <p>Range (R): <span className="font-semibold">{range.toFixed(2)} m</span></p>
                </CardContent>
              </Card>
            </div>

            {/* Simulation Display Column */}
            <div className="md:col-span-2">
              <Card className="h-full">
                <CardHeader>
                    <CardTitle className="text-xl">Trajectory</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-[calc(100%-4rem)] p-2"> {/* Adjust height as needed */}
                  <svg width={canvasWidth} height={canvasHeight} className="bg-muted rounded-md border border-border">
                    {/* Ground line */}
                    <line x1="0" y1={canvasHeight} x2={canvasWidth} y2={canvasHeight} stroke="hsl(var(--foreground))" strokeWidth="1" />
                     {/* Y axis (Height) */}
                    <line x1="0" y1="0" x2="0" y2={canvasHeight} stroke="hsl(var(--foreground))" strokeWidth="1" />

                    {/* Trajectory path */}
                    {trajectory.length > 1 && (
                        <path
                        d={trajectory.map((p, i) => 
                            `${i === 0 ? 'M' : 'L'} ${p.x * scaleX} ${canvasHeight - p.y * scaleY}`
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
                            cx={ trajectory[0].x * scaleX}
                            cy={canvasHeight - trajectory[0].y * scaleY}
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

