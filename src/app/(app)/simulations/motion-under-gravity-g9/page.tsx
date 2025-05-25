
"use client";
import { useMemo } from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, HelpCircle, Play, Pause, RefreshCw, ArrowDown } from "lucide-react";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";

const G_ACCELERATION = 9.81; // m/s^2
const CANVAS_WIDTH = 150;
const CANVAS_HEIGHT = 400;
const OBJECT_RADIUS = 10;
const GROUND_Y = CANVAS_HEIGHT - 20;

export default function MotionUnderGravityG9Page() {
  const { toast } = useToast();

  // Simulation parameters
  const [initialHeight, setInitialHeight] = useState(50); // meters
  const [mass, setMass] = useState(1); // kg
  const [enableAirResistance, setEnableAirResistance] = useState(false);
  const [airResistanceFactor, setAirResistanceFactor] = useState(0.1); // Conceptual drag factor

  // Simulation state
  const [time, setTime] = useState(0); // seconds
  const [positionY, setPositionY] = useState(initialHeight); // m, height from ground (positive UP)
  const [velocityY, setVelocityY] = useState(0); // m/s (positive UP)
  const [accelerationY, setAccelerationY] = useState(-G_ACCELERATION); // m/s^2 (positive UP, gravity is negative)
  const [isRunning, setIsRunning] = useState(false);
  const [isObjectDropped, setIsObjectDropped] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Refs for use inside rAF loop
  const isRunningRef = useRef(isRunning);
  const isObjectDroppedRef = useRef(isObjectDropped);

  const animationFrameIdRef = useRef<number>();
  const lastFrameTimeRef = useRef<number>(performance.now());

  // Calculate visual position on canvas
  const getCanvasY = (metresFromGround: number) => {
    return GROUND_Y - (metresFromGround * PIXELS_PER_METER) - OBJECT_RADIUS;
  };

  // Dynamic scaling for visual representation
  const PIXELS_PER_METER = useMemo(() => {
    const availableHeight = GROUND_Y - 20 - OBJECT_RADIUS; // Usable canvas height for motion
    if (initialHeight <= 0.1) return 20; // Default scale for very small heights
    return Math.max(1, availableHeight / initialHeight);
  }, [initialHeight]);

  const resetSimulationState = useCallback(() => {
    setIsRunning(false);
    setTime(0);
    setPositionY(initialHeight);
    setVelocityY(0); // Start from rest when dropped
    setIsObjectDropped(false); // Not dropped until user clicks "Drop"
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
    }
  }, [initialHeight, enableAirResistance, mass, airResistanceFactor]); // Added mass, airResistanceFactor

  // Reset simulation if parameters change while not running
  useEffect(() => {
    if (!isRunning) {
      resetSimulationState();
    }
  }, [initialHeight, mass, enableAirResistance, airResistanceFactor, isRunning, resetSimulationState]);

  const calculateAcceleration = useCallback((currentVelocity: number): number => {
    let netAcc = -G_ACCELERATION; // Gravity always acts downwards (negative in positive-up convention)
    if (enableAirResistance && currentVelocity !== 0) {
      // Simplified drag: F_drag = C * v^2. Let C = airResistanceFactor.
      // Drag force opposes motion. If velocityY is positive (up), drag is down (negative).
      // If velocityY is negative (down), drag is up (positive).
      const dragMagnitude = airResistanceFactor * currentVelocity * currentVelocity;
      const dragDirection = currentVelocity > 0 ? -1 : 1; // Opposes velocity
      const dragForce = dragMagnitude * dragDirection;
      netAcc += (dragForce / mass); // Add drag acceleration (can be positive or negative)
    }
    return netAcc;
  }, [mass, enableAirResistance, airResistanceFactor]);

  // Update acceleration state whenever parameters that affect it change (except velocity)
  useEffect(() => {
     // When parameters change while not running, update the displayed acceleration
     if (!isRunning) {
       setAccelerationY(calculateAcceleration(0)); // Calculate initial acceleration (velocity is 0)
     }
  }, [initialHeight, mass, enableAirResistance, airResistanceFactor, isRunning, calculateAcceleration]);

  const gameLoop = useCallback((timestamp: number) => {
    if (!isObjectDroppedRef.current) { // Use ref here
      animationFrameIdRef.current = undefined;
      return;
    }

    const deltaTime = (timestamp - lastFrameTimeRef.current) / 1000; // seconds
    lastFrameTimeRef.current = timestamp;

    // Calculate current acceleration based on current velocity if air resistance is on
    const currentAccY = calculateAcceleration(velocityY);
    const newVelocityY = velocityY + currentAccY * deltaTime;
    // Using the standard kinematic equation s = ut + 0.5at^2 with positive Y up
    const newPositionY = positionY + velocityY * deltaTime + 0.5 * currentAccY * deltaTime * deltaTime;

    if (newPositionY <= 0) {
      // Landed
      setPositionY(0);
      setVelocityY(0); // Or some bounce logic if desired
      setAccelerationY(0);
      setIsRunning(false);
      setIsObjectDropped(false); // Reset for next drop
      toast({ title: "Landed!", description: `Time taken: ${(time + deltaTime).toFixed(2)}s` }); // Use time + deltaTime for more accurate final time
      animationFrameIdRef.current = undefined;
      return;
    }

    setPositionY(newPositionY);
    setVelocityY(newVelocityY);
    setTime(prevTime => prevTime + deltaTime);

     // Update acceleration state (done here to show instantaneous acceleration during fall)
    setAccelerationY(currentAccY);

    if (isRunningRef.current) { // Use ref for checking isRunning inside rAF
        animationFrameIdRef.current = requestAnimationFrame(gameLoop); // No need for second arg
    } else {
        animationFrameIdRef.current = undefined; // Ensure it's cleared if paused
    }
  }, [velocityY, positionY, calculateAcceleration, toast]); // Added timeRef if you create it

  // Update refs whenever the corresponding state changes
  useEffect(() => {
    isRunningRef.current = isRunning;
    isObjectDroppedRef.current = isObjectDropped;
  }, [isRunning, isObjectDropped]);

  useEffect(() => {
    if (isRunning && isObjectDropped) {
      lastFrameTimeRef.current = performance.now();
      animationFrameIdRef.current = requestAnimationFrame((ts) => gameLoop(ts, performance.now()));
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
  }, [isRunning, isObjectDropped, gameLoop]);

  // Drawing effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw ground
    ctx.fillStyle = "hsl(var(--muted-foreground))";
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);

    // Draw scale/height markers
    ctx.strokeStyle = "hsl(var(--border))";
    ctx.lineWidth = 0.5;
    ctx.font = "10px sans-serif";
    ctx.fillStyle = "hsl(var(--muted-foreground))";
    const maxDisplayHeight = Math.max(initialHeight, 20); // Ensure at least 20m scale for better visualization
    for (let h = 0; h <= maxDisplayHeight; h += 10) {
        if (h === 0 && initialHeight < 5) continue; // Avoid cluttering 0m if initial height is very low
        const yPos = getCanvasY(h) + OBJECT_RADIUS; // Center text on mark
        if (yPos < 10) continue; // Don't draw if off-canvas
        ctx.beginPath();
        ctx.moveTo(CANVAS_WIDTH / 2 - 5, yPos);
        ctx.lineTo(CANVAS_WIDTH / 2 + 5, yPos);
        ctx.stroke();
        ctx.fillText(`${h}m`, CANVAS_WIDTH / 2 + 10, yPos + 3);
    }


    // Draw object
    const objectCanvasY = getCanvasY(positionY);
    ctx.beginPath();
    ctx.arc(CANVAS_WIDTH / 2, objectCanvasY, OBJECT_RADIUS, 0, 2 * Math.PI);
    ctx.fillStyle = "hsl(var(--primary))";
    ctx.fill();
    ctx.strokeStyle = "hsl(var(--primary-foreground))";
    ctx.lineWidth = 1;
    ctx.stroke();

  }, [positionY, initialHeight, PIXELS_PER_METER]); // Added PIXELS_PER_METER as a dependency


  const handleDrop = () => {
    if (isRunning) return; // Prevent re-drop if already running
    resetSimulationState();
    setIsObjectDropped(true);
    setIsRunning(true);
  };

  const handlePauseResume = () => {
    if (!isObjectDropped) return; // Can't pause/resume if not dropped
    setIsRunning(!isRunning);
  };

  const handleResetClick = () => {
    resetSimulationState();
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
              <CardTitle className="text-3xl flex items-center gap-2">
                <ArrowDown className="h-8 w-8 text-primary" />
                G9: Motion Under Gravity (Free Fall)
              </CardTitle>
              <CardDescription>
                Simulate objects falling with/without air resistance. Observe changing velocity and the effect of air resistance leading to terminal velocity.
              </CardDescription>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon"><HelpCircle className="h-5 w-5" /></Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 text-sm space-y-2">
                <h4 className="font-medium leading-none mb-1">How to Use:</h4>
                <ul className="list-disc list-inside text-muted-foreground text-xs space-y-1">
                  <li>Set the Initial Height and Mass of the object.</li>
                  <li>Toggle Air Resistance and adjust its conceptual factor.</li>
                  <li>Click "Drop" to start the simulation.</li>
                  <li>Use "Pause/Resume" to control the animation.</li>
                  <li>"Reset" prepares for a new drop with current settings.</li>
                  <li>Observe the values for Time, Position, Velocity, and Acceleration.</li>
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
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="initialHeight">Initial Height: {initialHeight.toFixed(1)} m</Label>
                    <Slider id="initialHeight" min={10} max={200} step={5} value={[initialHeight]} onValueChange={(v) => setInitialHeight(v[0])} disabled={isRunning}/>
                  </div>
                  <div>
                    <Label htmlFor="mass">Mass: {mass.toFixed(1)} kg</Label>
                    <Slider id="mass" min={0.1} max={10} step={0.1} value={[mass]} onValueChange={(v) => setMass(v[0])} disabled={isRunning}/>
                  </div>
                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox id="enableAirResistance" checked={enableAirResistance} onCheckedChange={(checked) => setEnableAirResistance(!!checked)} disabled={isRunning}/>
                    <Label htmlFor="enableAirResistance" className="font-normal">Enable Air Resistance</Label>
                  </div>
                  {enableAirResistance && (
                    <div>
                      <Label htmlFor="airResistanceFactor">Air Resistance Factor: {airResistanceFactor.toFixed(2)}</Label>
                      <Slider id="airResistanceFactor" min={0.01} max={0.5} step={0.01} value={[airResistanceFactor]} onValueChange={(v) => setAirResistanceFactor(v[0])} disabled={isRunning}/>
                    </div>
                  )}
                  <div className="flex flex-col gap-2 pt-2">
                    <Button onClick={handleDrop} disabled={isObjectDropped && isRunning}>
                      <ArrowDown className="mr-2 h-4 w-4" /> Drop Object
                    </Button>
                    <div className="flex gap-2">
                        <Button onClick={handlePauseResume} disabled={!isObjectDropped} className="flex-1">
                        {isRunning ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                        {isRunning ? "Pause" : "Resume"}
                        </Button>
                        <Button onClick={handleResetClick} variant="outline" className="flex-1">
                            <RefreshCw className="mr-2 h-4 w-4" /> Reset
                        </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-lg">Current Values</CardTitle></CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <p>Time (t): <span className="font-semibold">{time.toFixed(2)} s</span></p>
                  <p>Position (y): <span className="font-semibold">{positionY.toFixed(2)} m</span> (from ground)</p>
                  <p>Velocity (v_y): <span className="font-semibold">{velocityY.toFixed(2)} m/s</span> (positive upwards)</p>
                  <p>Acceleration (a_y): <span className="font-semibold">{accelerationY.toFixed(2)} m/s²</span></p>
                </CardContent>
              </Card>
            </div>

            {/* Visualization Column */}
            <div className="md:col-span-2">
              <Card className="h-full">
                <CardHeader><CardTitle className="text-lg">Visual Simulation</CardTitle></CardHeader>
                <CardContent className="flex items-center justify-center p-2">
                  <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="bg-muted rounded-md border border-input shadow-inner"></canvas>
                </CardContent>
                <CardFooter>
                  <p className="text-xs text-muted-foreground">Watch the object fall. The markers indicate height in meters.</p>
                </CardFooter>
              </Card>
              {/* Future: Graphs for P-T, V-T can be added here */}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

