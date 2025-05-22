
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

    // Time to reach max height (from initialHeight)
    // v_y = v0y - gt => 0 = v0y - gt_peak => t_peak = v0y / G
    const t_peak_from_v0y = v0y / G;
    
    // Max height calculation from initial height
    // H = y0 + v0y*t_peak_from_v0y - 0.5*G*t_peak_from_v0y^2
    // OR simpler: H = y0 + (v0y^2) / (2*G) (if v0y > 0 or peak is above initial height)
    let currentMaxHeight = initialHeight;
    if (v0y > 0) {
      currentMaxHeight = initialHeight + (v0y * v0y) / (2 * G);
    } else if (initialHeight > 0 && v0y <= 0){ // Fired downwards or horizontally from a height
      currentMaxHeight = initialHeight;
    }
    setMaxHeight(currentMaxHeight);


    // Time of flight: y(t) = initialHeight + v0y*t - 0.5*G*t^2 = 0
    // Solve quadratic equation: 0.5*G*t^2 - v0y*t - initialHeight = 0
    // a = 0.5*G, b = -v0y, c = -initialHeight
    // t = (-b +/- sqrt(b^2 - 4ac)) / 2a
    const a = 0.5 * G;
    const b = -v0y;
    const c = -initialHeight;
    const discriminant = b * b - 4 * a * c;

    let tof = 0;
    if (discriminant >= 0) {
      const t1 = (-b + Math.sqrt(discriminant)) / (2 * a);
      const t2 = (-b - Math.sqrt(discriminant)) / (2 * a);
      tof = Math.max(t1, t2 > 0 ? t2 : 0); // Ensure t is positive
      if (initialVelocity === 0 && initialHeight === 0) tof = 0;
    }
     // Special case: if initial velocity is 0 and initial height is 0, TOF is 0
    if (initialVelocity === 0 && initialHeight === 0) {
        tof = 0;
    } else if (initialHeight > 0 && v0y <= 0 && discriminant < 0 && initialVelocity > 0) { 
        // This edge case means it never hits y=0 if fired downwards from height without enough speed
        // For simulation purposes, let's just calculate time until it would pass y=0 if it could
        // Or handle it by saying it lands immediately at y=initialHeight if v0y <= 0 (simpler for now)
        // For a trajectory visual, we might still want to show some path.
        // This needs careful consideration based on desired simulation realism vs simplicity.
        // For now, if discriminant is negative, means no real roots for y=0,
        // if initialHeight > 0.
        // Let's take tof for maximum range up to G.
        // This part is tricky if we don't allow y < 0. For this simple viz, we'll stick to positive TOF.
        // If it never reaches y=0 (e.g. fired downwards and doesn't reach origin) tof would be based on some other criteria
        // Let's assume it always "lands" or calculation is for y=0 crossing
    }

    setTimeOfFlight(tof);

    const currentRange = v0x * tof;
    setRange(currentRange);

    const newTrajectory: TrajectoryPoint[] = [];
    if (tof > 0) {
      const timeStep = tof / 100; // 100 points for the trajectory
      for (let t = 0; t <= tof; t += timeStep) {
        const x = v0x * t;
        const y = initialHeight + v0y * t - 0.5 * G * t * t;
        newTrajectory.push({ x, y });
      }
      // Ensure the last point is exactly at landing
      if (newTrajectory.length > 0 && newTrajectory[newTrajectory.length-1].y !== 0 && initialHeight === 0) {
         newTrajectory.push({x: currentRange, y: 0});
      } else if (newTrajectory.length > 0 && initialHeight > 0) {
         const finalX = v0x * tof;
         const finalY = initialHeight + v0y * tof - 0.5 * G * tof * tof;
         newTrajectory.push({x: finalX, y: Math.max(0, finalY)}); // Ensure y doesn't go negative if it 'lands' above 0
      }
    } else if (initialHeight > 0 && initialVelocity === 0) { // Just dropping
        newTrajectory.push({x:0, y: initialHeight});
        newTrajectory.push({x:0, y:0}); // Simplistic drop line
        setMaxHeight(initialHeight);
        setRange(0);
        setTimeOfFlight(Math.sqrt((2 * initialHeight) / G)); // time to drop
    } else {
         newTrajectory.push({x:0, y:0}); // Start at origin if no motion
    }

    setTrajectory(newTrajectory);

    // Auto-scaling for canvas
    const maxTrajX = newTrajectory.reduce((max, p) => Math.max(max, p.x), 0);
    const maxTrajY = newTrajectory.reduce((max, p) => Math.max(max, p.y), 0);
    
    const newScaleX = maxTrajX > 0 ? (canvasWidth * 0.9) / maxTrajX : 1; // 90% width
    const newScaleY = maxTrajY > 0 ? (canvasHeight * 0.9) / maxTrajY : 1; // 90% height
    
    setScaleX(newScaleX);
    setScaleY(newScaleY);


  }, [initialVelocity, launchAngle, initialHeight, canvasWidth, canvasHeight]);

  useEffect(() => {
    calculateProjectileMotion();
  }, [calculateProjectileMotion]);
  
  // Handle canvas resize (optional, could be fixed size)
  // For simplicity, let's use a fixed size defined by state.

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
              <CardTitle className="text-3xl">Projectile Motion Simulator (Grade 11)</CardTitle>
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
                    <line x1="0" y1={canvasHeight} x2={canvasWidth} y2={canvasHeight} stroke="hsl(var(--foreground))" strokeWidth="2" />
                    
                    {/* Trajectory path */}
                    <path
                      d={trajectory.map((p, i) => 
                          `${i === 0 ? 'M' : 'L'} ${p.x * scaleX} ${canvasHeight - p.y * scaleY}`
                        ).join(' ')
                      }
                      stroke="hsl(var(--primary))"
                      strokeWidth="2"
                      fill="none"
                    />
                    {/* Optional: Mark max height point */}
                    {maxHeight > 0 && trajectory.length > 0 && (
                        <circle 
                            cx={ (range / 2) * scaleX } // Approximate for symmetric trajectory from y0=0
                            cy={canvasHeight - maxHeight * scaleY}
                            r="3"
                            fill="hsl(var(--destructive))"
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

// Helper function to generate static params if needed in future
export async function generateStaticParams() {
  // If you had multiple G11 specific simulations, you could list their IDs here.
  // For now, this page is specific enough.
  return [{ topicId: "projectile-motion-g11" }]; 
}
