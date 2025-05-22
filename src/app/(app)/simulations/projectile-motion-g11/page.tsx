
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

    // Ensure initialHeight is not negative from input
    const nonNegativeInitialHeight = Math.max(0, initialHeight);

    if (initialVelocity === 0) {
        if (nonNegativeInitialHeight === 0) {
            tof = 0;
            currentMaxHeightVal = 0;
            currentRangeVal = 0;
        } else { 
            tof = Math.sqrt((2 * nonNegativeInitialHeight) / G);
            currentMaxHeightVal = nonNegativeInitialHeight;
            currentRangeVal = 0;
        }
    } else {
        const a_quad = 0.5 * G;
        const b_quad = -v0y;
        const c_quad = -nonNegativeInitialHeight;
        const discriminant = b_quad * b_quad - 4 * a_quad * c_quad;

        if (discriminant < 0 && Math.abs(discriminant) < 1e-9) { 
             tof = -b_quad / (2 * a_quad);
             if (tof < 0) tof = 0;
        } else if (discriminant < 0) {
            tof = 0; 
        } else {
            const t1 = (-b_quad + Math.sqrt(discriminant)) / (2 * a_quad);
            const t2 = (-b_quad - Math.sqrt(discriminant)) / (2 * a_quad);
            tof = Math.max(0, t1, t2); 
        }
         if (nonNegativeInitialHeight === 0 && v0y < 0 && Math.abs(v0x) < 1e-9) {
            tof = 0;
        }
        
        // Ensure TOF is non-negative
        tof = Math.max(0, tof);

        currentRangeVal = v0x * tof;

        if (v0y > 0) {
            const timeToPeakVy = v0y / G;
            if (timeToPeakVy <= tof) { // Peak is reached within flight time
                currentMaxHeightVal = nonNegativeInitialHeight + (v0y * v0y) / (2 * G);
            } else { // Projectile is already coming down or fired downwards from a height
                currentMaxHeightVal = nonNegativeInitialHeight;
            }
        } else {
            currentMaxHeightVal = nonNegativeInitialHeight; 
        }
    }

    setTimeOfFlight(tof);
    setMaxHeight(currentMaxHeightVal);
    setRange(currentRangeVal);

    const newTrajectory: TrajectoryPoint[] = [];
    const numPoints = 100;
    if (tof > 0.001) { 
        const timeStep = tof / numPoints;
        for (let i = 0; i <= numPoints; i++) {
            const t = i * timeStep;
            const x = v0x * t;
            const y = nonNegativeInitialHeight + v0y * t - 0.5 * G * t * t;
            newTrajectory.push({ x, y: Math.max(0, y) }); 
        }
    } else {
        newTrajectory.push({ x: 0, y: nonNegativeInitialHeight });
        if (nonNegativeInitialHeight > 0 || (initialVelocity === 0 && nonNegativeInitialHeight === 0)) {
             newTrajectory.push({ x: 0, y: 0 });
        }
    }
     if (newTrajectory.length === 1 && nonNegativeInitialHeight > 0) { 
        newTrajectory.unshift({ x: 0, y: nonNegativeInitialHeight });
        newTrajectory.push({ x: 0, y: 0 });
    }
    if (newTrajectory.length === 0 ) newTrajectory.push({x:0, y:0});


    setTrajectory(newTrajectory);

    const effectiveRange = Math.max(Math.abs(currentRangeVal), 0.1);
    const effectiveMaxHeight = Math.max(currentMaxHeightVal, nonNegativeInitialHeight, 0.1); 

    const drawingWidth = canvasWidth - 2 * originX;
    const drawingHeight = originY - 30; // 30 is top padding

    const newScaleX = drawingWidth / effectiveRange;
    const newScaleY = drawingHeight / effectiveMaxHeight;

    setScaleX(Math.max(0.1, newScaleX)); 
    setScaleY(Math.max(0.1, newScaleY));


  }, [initialVelocity, launchAngle, initialHeight, canvasWidth, canvasHeight, originX, originY]);

  useEffect(() => {
    calculateProjectileMotion();
  }, [calculateProjectileMotion, initialVelocity, launchAngle, initialHeight]); 
  
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
                      - Adjust Initial Velocity, Launch Angle, and Initial Height.
                      <br/>- The trajectory and calculated values (Time of Flight, Max Height, Range) will update automatically.
                  </p>
                  <h4 className="font-medium leading-none mt-3 mb-1">Formulas (from y=0):</h4>
                  <ul className="text-xs text-muted-foreground list-disc pl-4">
                      <li>Time of Flight (T): (2 * v₀ * sin(θ)) / g</li>
                      <li>Max Height (H): (v₀² * sin²(θ)) / (2 * g)</li>
                      <li>Range (R): (v₀² * sin(2θ)) / g</li>
                  </ul>
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
                        onValueChange={(value) => setInitialHeight(value[0])} // No Math.max needed here, calculation handles it
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
                    {/* X axis labels - simple placeholder */}
                    {trajectory.length > 1 && range > 0.1 && [0.25, 0.5, 0.75, 1].map(factor => (
                        <text key={factor} x={originX + range * factor * scaleX} y={originY + 15} fontSize="10" fill="hsl(var(--muted-foreground))" textAnchor="middle">
                           {(range * factor).toFixed(1)}m
                        </text>
                    ))}
                    {/* Y axis labels - simple placeholder */}
                     {maxHeight > 0.1 && [0.25, 0.5, 0.75, 1].map(factor => (
                        <text key={factor} x={originX - 5} y={originY - maxHeight * factor * scaleY} fontSize="10" fill="hsl(var(--muted-foreground))" textAnchor="end" alignmentBaseline="middle">
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
                    {/* Mark initial position */}
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
          <p className="text-xs text-muted-foreground">Note: Simulation uses simplified physics model (no air resistance).</p>
        </CardFooter>
      </Card>
    </div>
  );
}

    