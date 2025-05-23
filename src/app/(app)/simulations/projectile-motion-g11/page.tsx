/**
 * @fileOverview Projectile Motion Simulation Page (Grade 11).
 * This component provides an interactive simulation for projectile motion,
 * allowing users to adjust initial velocity, launch angle, and initial height.
 * It visualizes the trajectory and calculates key parameters like range, max height, and time of flight.
 * Air resistance is ignored for simplicity.
 */
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

/**
 * Represents a point in the projectile's trajectory.
 */
interface TrajectoryPoint {
  x: number;
  y: number;
}

/**
 * Main component for the Projectile Motion simulation.
 */
export default function ProjectileMotionG11Page() {
  const [initialVelocity, setInitialVelocity] = useState(20); // m/s
  const [launchAngle, setLaunchAngle] = useState(45); // degrees
  const [initialHeight, setInitialHeight] = useState(0); // meters

  // Calculated values
  const [trajectory, setTrajectory] = useState<TrajectoryPoint[]>([]);
  const [timeOfFlight, setTimeOfFlight] = useState(0);
  const [maxHeight, setMaxHeight] = useState(0);
  const [range, setRange] = useState(0);

  // SVG canvas dimensions and scaling
  const [canvasWidth, setCanvasWidth] = useState(500); // SVG width, can be adjusted
  const [canvasHeight, setCanvasHeight] = useState(300); // SVG height
  const [scaleX, setScaleX] = useState(10); // Pixels per meter (horizontal)
  const [scaleY, setScaleY] = useState(10); // Pixels per meter (vertical)
  const [originX, setOriginX] = useState(30); // SVG origin X (padding from left)
  const [originY, setOriginY] = useState(canvasHeight - 30); // SVG origin Y (padding from bottom)


  /**
   * Calculates the projectile's motion parameters (trajectory, TOF, max height, range)
   * based on the current input values.
   * Memoized with useCallback to optimize re-renders.
   */
  const calculateProjectileMotion = useCallback(() => {
    const angleRad = launchAngle * (Math.PI / 180);
    const v0x = initialVelocity * Math.cos(angleRad);
    const v0y = initialVelocity * Math.sin(angleRad);

    let tof, currentMaxHeightVal, currentRangeVal;
    const nonNegativeInitialHeight = Math.max(0, initialHeight); // Ensure initial height is not negative

    if (Math.abs(initialVelocity) < 1e-6) { // Effectively zero initial velocity (e.g. dropping an object)
        if (nonNegativeInitialHeight === 0) {
            tof = 0;
            currentMaxHeightVal = 0;
            currentRangeVal = 0;
        } else { 
            tof = Math.sqrt((2 * nonNegativeInitialHeight) / G);
            currentMaxHeightVal = nonNegativeInitialHeight;
            currentRangeVal = 0; // No horizontal motion
        }
    } else {
        // Quadratic equation for time of flight when initialHeight is non-zero: 0 = y0 + v0y*t - 0.5*G*t^2
        const a_quad = -0.5 * G;
        const b_quad = v0y;
        const c_quad = nonNegativeInitialHeight;
        
        const discriminant = b_quad * b_quad - 4 * a_quad * c_quad;

        if (discriminant < 0) { // No real roots, means it never reaches y=0 (e.g. fired straight up and doesn't return to y0)
            // If fired upwards from a height, it will eventually come down to y0.
            // This case implies it's fired downwards from a height OR already below y0 (which our nonNegativeInitialHeight prevents)
            // OR it doesn't reach y=0 if fired perfectly horizontally from a height (but our TOF target is ground)
            // For simplicity, if it never reaches y=0 while going up (e.g. from below ground), TOF is 0.
            // However, if launched upwards from a height, discriminant will be positive.
            // The important TOF is time to hit y=0 (ground).
            if (nonNegativeInitialHeight > 0 && v0y < 0 && Math.abs(v0x) < 1e-6) { // Dropped/fired straight down
                 tof = Math.sqrt((2 * nonNegativeInitialHeight) / G); // Simplified for this case
            } else if (nonNegativeInitialHeight > 0 && Math.abs(v0x) < 1e-6 && v0y > 0) { // Fired straight up from height
                 const timeToPeak = v0y / G;
                 const peakHeightFromLaunch = nonNegativeInitialHeight + (v0y * v0y) / (2 * G);
                 tof = timeToPeak + Math.sqrt(2 * peakHeightFromLaunch / G);
            } else if (nonNegativeInitialHeight === 0 && v0y < 0) { // Fired into ground
                 tof = 0;
            }
             else { // This might happen if angle is 90deg and initialHeight=0 and it's already calculated as not returning to y=0
                 tof = (2 * v0y) / G; // Standard TOF if y0=0
                 if (tof < 0) tof = 0;
            }
        } else {
            const t1 = (-b_quad + Math.sqrt(discriminant)) / (2 * a_quad);
            const t2 = (-b_quad - Math.sqrt(discriminant)) / (2 * a_quad);
            tof = Math.max(0, t1, t2); // Physical TOF must be positive
        }
        
        tof = Math.max(0, tof); // Final check for non-negative TOF

        currentRangeVal = v0x * tof;

        // Max height calculation: relative to launch point, then add initial height.
        // Time to reach peak (vertical velocity becomes zero): t_peak_vy = v0y / G
        // Max height above launch point: H_above_launch = v0y * t_peak_vy - 0.5 * G * t_peak_vy^2 = (v0y^2) / (2G)
        if (v0y > 0) { // Only has a peak above launch if fired upwards
            currentMaxHeightVal = nonNegativeInitialHeight + (v0y * v0y) / (2 * G);
        } else { // Fired horizontally or downwards
            currentMaxHeightVal = nonNegativeInitialHeight;
        }
    }

    setTimeOfFlight(tof);
    setMaxHeight(currentMaxHeightVal);
    setRange(currentRangeVal);

    // Generate trajectory points
    const newTrajectory: TrajectoryPoint[] = [];
    const numPoints = 100; // Number of points to plot for the trajectory
    if (tof > 0.001) { // Only plot if there's a flight time
        const timeStep = tof / numPoints;
        for (let i = 0; i <= numPoints; i++) {
            const t = i * timeStep;
            const x = v0x * t;
            const y = nonNegativeInitialHeight + v0y * t - 0.5 * G * t * t;
            newTrajectory.push({ x, y: Math.max(0, y) }); // Ensure y doesn't go below ground visually
        }
    } else {
        // If no flight time, just plot the initial position and potentially landing if at height
        newTrajectory.push({ x: 0, y: nonNegativeInitialHeight });
        if (nonNegativeInitialHeight > 0) {
             newTrajectory.push({ x: 0, y: 0 }); // Show it landing if dropped from height
        }
    }
     // Ensure there are at least two points if initial height > 0 for a line to be drawn for dropping
    if (newTrajectory.length === 1 && nonNegativeInitialHeight > 0) { 
        newTrajectory.push({ x: 0, y: 0 }); // Add landing point
    }
    if (newTrajectory.length === 0 ) newTrajectory.push({x:0, y:0});


    setTrajectory(newTrajectory);

    // Dynamic scaling for SVG view
    const effectiveRange = Math.max(Math.abs(currentRangeVal), 1); // Avoid division by zero, min range of 1m for scaling
    const effectiveMaxHeight = Math.max(currentMaxHeightVal, nonNegativeInitialHeight, 1); // Min height of 1m for scaling

    const drawingWidth = canvasWidth - 2 * originX; // Available width for drawing trajectory
    const drawingHeight = originY - 30; // Available height (originY is bottom, 30 is top padding)

    const newScaleX = drawingWidth / effectiveRange;
    const newScaleY = drawingHeight / effectiveMaxHeight;

    setScaleX(Math.max(0.1, newScaleX)); // Ensure scale is not too small or zero
    setScaleY(Math.max(0.1, newScaleY));


  }, [initialVelocity, launchAngle, initialHeight, canvasWidth, canvasHeight, originX, originY]);

  // Recalculate motion when input parameters change
  useEffect(() => {
    calculateProjectileMotion();
  }, [calculateProjectileMotion, initialVelocity, launchAngle, initialHeight]); 
  
  // Update originY if canvasHeight changes (though canvasHeight is static here)
  useEffect(() => {
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
                  <h4 className="font-medium leading-none mb-2">How to Use</h4>
                  <p className="text-sm text-muted-foreground">
                      - Adjust Initial Velocity, Launch Angle, and Initial Height using sliders or input fields.
                      <br/>- The trajectory and calculated values (Time of Flight, Max Height, Range) will update automatically.
                      <br/>- Assumes motion in a vacuum (no air resistance).
                  </p>
                  <h4 className="font-medium leading-none mt-3 mb-1">Key Formulas (from y=0):</h4>
                  <ul className="text-xs text-muted-foreground list-disc pl-4">
                      <li>Time of Flight (T): (2 &middot; v₀ &middot; sin(θ)) / g</li>
                      <li>Max Height (H): (v₀² &middot; sin²(θ)) / (2 &middot; g)</li>
                      <li>Range (R): (v₀² &middot; sin(2θ)) / g</li>
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
                        onValueChange={(value) => setInitialHeight(Math.max(0, value[0]))} 
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
                  <p>Maximum Height (H_max): <span className="font-semibold">{maxHeight.toFixed(2)} m</span></p>
                  <p>Range (R): <span className="font-semibold">{range.toFixed(2)} m</span></p>
                </CardContent>
              </Card>
            </div>

            {/* Trajectory Visualization Column */}
            <div className="md:col-span-2">
              <Card className="h-full">
                <CardHeader>
                    <CardTitle className="text-xl">Trajectory Visualization</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-[calc(100%-4rem)] p-2">
                  {/* SVG for drawing trajectory */}
                  <svg width={canvasWidth} height={canvasHeight} className="bg-muted rounded-md border border-border overflow-visible">
                    {/* Ground line */}
                    <line x1="0" y1={originY} x2={canvasWidth} y2={originY} stroke="hsl(var(--foreground))" strokeWidth="1" />
                    {/* Y axis (Height indicator) */}
                    <line x1={originX} y1="0" x2={originX} y2={canvasHeight} stroke="hsl(var(--foreground))" strokeWidth="1" />
                    
                    {/* X axis labels - simple placeholder for range */}
                    {trajectory.length > 1 && range > 0.1 && [0.25, 0.5, 0.75, 1].map(factor => (
                        <text key={`x-label-${factor}`} x={originX + range * factor * scaleX} y={originY + 15} fontSize="10" fill="hsl(var(--muted-foreground))" textAnchor="middle">
                           {(range * factor).toFixed(1)}m
                        </text>
                    ))}
                    {/* Y axis labels - simple placeholder for max height */}
                     {maxHeight > 0.1 && [0.25, 0.5, 0.75, 1].map(factor => (
                        <text key={`y-label-${factor}`} x={originX - 5} y={originY - maxHeight * factor * scaleY} fontSize="10" fill="hsl(var(--muted-foreground))" textAnchor="end" alignmentBaseline="middle">
                           {(maxHeight * factor).toFixed(1)}m
                        </text>
                    ))}

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
                    {/* Mark initial position with a small circle */}
                    {trajectory.length > 0 && (
                         <circle 
                            cx={originX + trajectory[0].x * scaleX}
                            cy={originY - trajectory[0].y * scaleY}
                            r="4"
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
          <p className="text-xs text-muted-foreground">Note: Simulation uses simplified physics model (no air resistance). Calculations are based on ideal projectile motion equations.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
