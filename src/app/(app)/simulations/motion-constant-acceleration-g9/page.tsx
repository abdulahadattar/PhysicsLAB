// src/app/(app)/simulations/motion-constant-acceleration/page.tsx (Enhanced)
"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, HelpCircle, Play, Pause, RefreshCw, Target, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Badge } from "@/components/ui/badge";

// --- Constants ---
const CANVAS_HEIGHT = 80; // Increased height for track and arrows
const OBJECT_WIDTH = 20;
const OBJECT_HEIGHT = 20;
const MAX_SIMULATION_TIME = 10; // seconds
const TRACK_Y_POSITION = CANVAS_HEIGHT * 0.6;
const TICK_MARK_HEIGHT = 5;

// Colors
const PRIMARY_COLOR_HSL = "hsl(var(--primary))";
const ACCENT_COLOR_HSL = "hsl(var(--chart-1))"; // For velocity arrow
const SECONDARY_ACCENT_COLOR_HSL = "hsl(var(--chart-2))"; // For acceleration arrow
const MUTED_FOREGROUND_HSL = "hsl(var(--muted-foreground))";

// --- Helper Functions ---
const formatNumber = (num: number, precision = 2) => num.toFixed(precision);

// --- Simulation Component ---
export default function MotionConstantAccelerationEnhancedPage() {
  const [initialVelocity, setInitialVelocity] = useState(0); // m/s
  const [acceleration, setAcceleration] = useState(1); // m/s^2
  const [simulationTime, setSimulationTime] = useState(0); // current elapsed time
  const [isRunning, setIsRunning] = useState(false);

  // Calculated outputs
  const [currentVelocity, setCurrentVelocity] = useState(0);
  const [currentDisplacement, setCurrentDisplacement] = useState(0);

  const [history, setHistory] = useState<{ time: number; velocity: number; displacement: number }[]>([]);

  const requestRef = useRef<number>();
  const lastFrameTimeRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Stable canvas dimensions and scaling factors
  const [canvasWidth, setCanvasWidth] = useState(400); // Default, will update
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateCanvasWidth = () => {
      if (canvasContainerRef.current) {
        setCanvasWidth(canvasContainerRef.current.offsetWidth);
      }
    };
    updateCanvasWidth();
    window.addEventListener('resize', updateCanvasWidth);
    return () => window.removeEventListener('resize', updateCanvasWidth);
  }, []);

  const maxDisplacementMagnitude = useMemo(() => {
    // Calculate displacement at t=MAX_SIMULATION_TIME
    const s_at_max_t = initialVelocity * MAX_SIMULATION_TIME + 0.5 * acceleration * MAX_SIMULATION_TIME * MAX_SIMULATION_TIME;
    // Calculate displacement at turning point (if it occurs within MAX_SIMULATION_TIME)
    let s_at_turning_point = 0;
    if (acceleration !== 0 && (initialVelocity / acceleration) < 0) { // Signs are opposite
      const t_turn = -initialVelocity / acceleration;
      if (t_turn > 0 && t_turn < MAX_SIMULATION_TIME) {
        s_at_turning_point = initialVelocity * t_turn + 0.5 * acceleration * t_turn * t_turn;
      }
    }
    // Consider initial displacement as 0. The displacement can be positive or negative.
    // The magnitude considers the farthest point reached from origin.
    return Math.max(Math.abs(s_at_max_t), Math.abs(s_at_turning_point), 10); // Min 10m range
  }, [initialVelocity, acceleration]);

  const pixelsPerMeter = useMemo(() => (canvasWidth - OBJECT_WIDTH - 20) / (2 * maxDisplacementMagnitude), [canvasWidth, maxDisplacementMagnitude]); // 2* for bi-directional
  const canvasOriginX = useMemo(() => canvasWidth / 2, [canvasWidth]);


  const calculateMotion = useCallback((t: number) => {
    const v = initialVelocity + acceleration * t;
    const s = initialVelocity * t + 0.5 * acceleration * t * t;
    return { time: t, velocity: v, displacement: s };
  }, [initialVelocity, acceleration]);

  // Effect to initialize/reset history when parameters change
  useEffect(() => {
    const { velocity, displacement } = calculateMotion(0);
    setCurrentVelocity(velocity);
    setCurrentDisplacement(displacement);
    setHistory([{ time: 0, velocity, displacement }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialVelocity, acceleration]); // Deliberately not including calculateMotion if its deps are v0, a

  const animate = useCallback((timestamp: number) => {
    if (!isRunningRef.current) return; // Check ref immediately

    if (!lastFrameTimeRef.current) {
      lastFrameTimeRef.current = timestamp;
    }
    const deltaTime = (timestamp - lastFrameTimeRef.current) / 1000;
    lastFrameTimeRef.current = timestamp;

    setSimulationTime(prevTime => {
      let newTime = prevTime + deltaTime;
      let shouldStop = false;
      if (newTime >= MAX_SIMULATION_TIME) {
        newTime = MAX_SIMULATION_TIME;
        shouldStop = true;
      }

      const motionData = calculateMotion(newTime);
      setCurrentVelocity(motionData.velocity);
      setCurrentDisplacement(motionData.displacement);

      setHistory(prevHistory => {
        const updatedHistory = [...prevHistory, motionData];
        // Optional: Could prune history if it gets too long, but for 10s it's fine
        return updatedHistory;
      });
      
      if (shouldStop) {
        setIsRunning(false);
      }
      return newTime;
    });

    if (isRunningRef.current) { // Check ref again before scheduling next frame
      requestRef.current = requestAnimationFrame(animate);
    }
  }, [calculateMotion]); // Removed isRunning from deps, using ref

  const isRunningRef = useRef(isRunning);
  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  useEffect(() => {
    if (isRunning) {
      lastFrameTimeRef.current = performance.now(); // Reset time anchor
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isRunning, animate]);


  // --- Canvas Drawing ---
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw track
    ctx.strokeStyle = MUTED_FOREGROUND_HSL;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, TRACK_Y_POSITION);
    ctx.lineTo(canvas.width, TRACK_Y_POSITION);
    ctx.stroke();

    // Draw origin marker
    ctx.fillStyle = MUTED_FOREGROUND_HSL;
    ctx.fillRect(canvasOriginX - 1, TRACK_Y_POSITION - TICK_MARK_HEIGHT * 1.5, 2, TICK_MARK_HEIGHT * 3);
    ctx.fillText("0m", canvasOriginX - 5, TRACK_Y_POSITION + TICK_MARK_HEIGHT + 10);

    // Draw tick marks (example: every meter if scale allows)
    const metersPerTickMajor = Math.max(1, Math.floor(maxDisplacementMagnitude / 5)); // Aim for ~5 major ticks
    for (let i = -Math.floor(maxDisplacementMagnitude); i <= Math.floor(maxDisplacementMagnitude); i += 1) {
        const xPos = canvasOriginX + i * pixelsPerMeter;
        if (i % metersPerTickMajor === 0 && i !== 0) {
            ctx.fillRect(xPos - 0.5, TRACK_Y_POSITION - TICK_MARK_HEIGHT, 1, TICK_MARK_HEIGHT * 2);
            ctx.fillText(`${i}m`, xPos - (i > 0 ? 5 : 10), TRACK_Y_POSITION + TICK_MARK_HEIGHT + 10);
        } else if (Math.abs(pixelsPerMeter) > 10) { // Minor ticks if space
             ctx.fillRect(xPos - 0.5, TRACK_Y_POSITION - TICK_MARK_HEIGHT/2, 1, TICK_MARK_HEIGHT);
        }
    }

    // Calculate object's screen position
    const objectScreenX = canvasOriginX + currentDisplacement * pixelsPerMeter - OBJECT_WIDTH / 2;
    
    // Draw object
    ctx.fillStyle = PRIMARY_COLOR_HSL;
    ctx.beginPath();
    // Simple car-like shape
    ctx.roundRect(objectScreenX, TRACK_Y_POSITION - OBJECT_HEIGHT - 2, OBJECT_WIDTH, OBJECT_HEIGHT, [5, 5, 0, 0]);
    ctx.fill();
    // Wheels
    ctx.beginPath();
    ctx.arc(objectScreenX + OBJECT_WIDTH * 0.25, TRACK_Y_POSITION - 2, 3, 0, 2*Math.PI);
    ctx.arc(objectScreenX + OBJECT_WIDTH * 0.75, TRACK_Y_POSITION - 2, 3, 0, 2*Math.PI);
    ctx.fill();


    // Draw velocity arrow
    const arrowOffsetY = TRACK_Y_POSITION - OBJECT_HEIGHT - 15;
    const minArrowLen = 10, maxArrowLen = 40;
    const velMagnitude = Math.abs(currentVelocity);
    const maxVelExpected = Math.abs(initialVelocity) + Math.abs(acceleration * MAX_SIMULATION_TIME) + 1; // +1 to avoid 0
    let velArrowLen = (velMagnitude / maxVelExpected) * maxArrowLen;
    velArrowLen = Math.max(minArrowLen, Math.min(velArrowLen, maxArrowLen));
    if (Math.abs(currentVelocity) > 0.01) { // Only draw if moving
        drawArrow(ctx, objectScreenX + OBJECT_WIDTH / 2, arrowOffsetY, currentVelocity > 0, velArrowLen, ACCENT_COLOR_HSL, "v");
    }

    // Draw acceleration arrow
    const accArrowOffsetY = arrowOffsetY - 15;
    if (Math.abs(acceleration) > 0.01) { // Only draw if accelerating
      drawArrow(ctx, objectScreenX + OBJECT_WIDTH / 2, accArrowOffsetY, acceleration > 0, maxArrowLen * 0.7, SECONDARY_ACCENT_COLOR_HSL, "a");
    }

  }, [currentDisplacement, currentVelocity, acceleration, initialVelocity, canvasOriginX, pixelsPerMeter, maxDisplacementMagnitude]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]); // Redraw whenever drawCanvas changes (due to its dependencies)


  function drawArrow(ctx: CanvasRenderingContext2D, x: number, y: number, isPositiveDirection: boolean, length: number, color: string, label: string) {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;
    const startX = x - (isPositiveDirection ? 0 : length);
    const endX = x + (isPositiveDirection ? length : 0);
    
    ctx.beginPath();
    ctx.moveTo(startX, y);
    ctx.lineTo(endX, y);
    ctx.stroke();

    // Arrowhead
    const headSize = 6;
    ctx.beginPath();
    if (isPositiveDirection) {
      ctx.moveTo(endX, y);
      ctx.lineTo(endX - headSize, y - headSize/2);
      ctx.lineTo(endX - headSize, y + headSize/2);
    } else {
      ctx.moveTo(startX, y);
      ctx.lineTo(startX + headSize, y - headSize/2);
      ctx.lineTo(startX + headSize, y + headSize/2);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = color;
    ctx.fillText(label, isPositiveDirection ? endX + 5 : startX - 15, y + 4);
  }


  // --- Event Handlers ---
  const handleToggleRun = () => {
    if (!isRunning && simulationTime >= MAX_SIMULATION_TIME - 0.01) {
      handleReset(); // Reset and then play
      setTimeout(() => setIsRunning(true), 50); // Start after reset takes effect
    } else {
      setIsRunning(!isRunning);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setSimulationTime(0);
    lastFrameTimeRef.current = 0;
    const { velocity, displacement } = calculateMotion(0);
    setCurrentVelocity(velocity);
    setCurrentDisplacement(displacement);
    setHistory([{ time: 0, velocity, displacement }]);
  };

  const handleParamChange = (setter: React.Dispatch<React.SetStateAction<number>>, value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (!isNaN(numValue)) {
      setter(numValue);
      handleReset(); // Reset simulation on parameter change
    }
  };

  // --- Calculated Info & Graph Config ---
  const timeToTurnAround = useMemo(() => {
    if (acceleration === 0 || (initialVelocity >= 0 && acceleration >= 0) || (initialVelocity <= 0 && acceleration <= 0)) {
      return null; // No turnaround or always moving in one direction / stopped
    }
    const tTurn = -initialVelocity / acceleration;
    return (tTurn > 0 && tTurn < MAX_SIMULATION_TIME) ? tTurn : null;
  }, [initialVelocity, acceleration]);

  const chartConfig = {
    velocity: { label: "Velocity (m/s)", color: ACCENT_COLOR_HSL },
    displacement: { label: "Displacement (m)", color: SECONDARY_ACCENT_COLOR_HSL },
  };

  const yAxisDomainVelocity = useMemo(() => {
    const v_at_max_t = initialVelocity + acceleration * MAX_SIMULATION_TIME;
    const extreme1 = initialVelocity;
    const extreme2 = v_at_max_t;
    const minV = Math.min(extreme1, extreme2, 0); // Ensure 0 is included if it crosses
    const maxV = Math.max(extreme1, extreme2, 0);
    const padding = Math.abs(maxV - minV) * 0.1 || 1; // Min padding of 1
    return [Math.floor(minV - padding), Math.ceil(maxV + padding)];
  }, [initialVelocity, acceleration]);

  const yAxisDomainDisplacement = useMemo(() => {
    const s_max_t = initialVelocity * MAX_SIMULATION_TIME + 0.5 * acceleration * MAX_SIMULATION_TIME * MAX_SIMULATION_TIME;
    let s_turn = 0;
    if(timeToTurnAround !== null) {
      s_turn = initialVelocity * timeToTurnAround + 0.5 * acceleration * timeToTurnAround * timeToTurnAround;
    }
    const minS = Math.min(0, s_max_t, s_turn);
    const maxS = Math.max(0, s_max_t, s_turn);
    const padding = Math.abs(maxS - minS) * 0.1 || 1;
    return [Math.floor(minS - padding), Math.ceil(maxS + padding)];
  }, [initialVelocity, acceleration, timeToTurnAround]);


  return (
    <div className="space-y-6 p-1 md:p-4">
      <div className="flex justify-between items-center">
        <Button variant="outline" asChild size="sm">
          <Link href="/simulations"> <ArrowLeft className="mr-2 h-4 w-4" /> Back </Link>
        </Button>
         <h1 className="text-xl sm:text-2xl font-semibold text-center">Motion with Constant Acceleration</h1>
        <Popover>
          <PopoverTrigger asChild><Button variant="outline" size="icon"><HelpCircle className="h-5 w-5"/></Button></PopoverTrigger>
          <PopoverContent className="w-80 text-sm space-y-2">
            <p className="font-semibold">Explore 1D Motion!</p>
            <ul className="list-disc list-inside text-xs">
              <li>Adjust <strong>Initial Velocity (v₀)</strong> and <strong>Acceleration (a)</strong> using sliders or input fields.</li>
              <li>The object moves on the track. Arrows show velocity (v) and acceleration (a) directions.</li>
              <li>Observe how final velocity and displacement change over time.</li>
              <li>Graphs plot velocity vs. time and displacement vs. time. A vertical line shows current time.</li>
              <li>Try: v₀ > 0, a < 0. When does it turn around?</li>
              <li>Try: v₀ = 0, a > 0 (starts from rest).</li>
            </ul>
            <p className="text-xs pt-2 border-t">Equations: <code className="text-primary">v = v₀ + at</code>, <code className="text-primary">s = v₀t + ½at²</code></p>
          </PopoverContent>
        </Popover>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Target className="h-6 w-6 text-primary"/> Simulation Controls & Data</CardTitle>
            <CardDescription>Set parameters, run the simulation, and observe real-time data.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-6">
              <div className="space-y-4 p-4 border rounded-lg bg-background">
                <div>
                  <Label htmlFor="initialVelocityInput" className="flex justify-between text-sm">
                    <span>Initial Velocity (v₀)</span> <span>{formatNumber(initialVelocity, 1)} m/s</span>
                  </Label>
                  <div className="flex items-center gap-2">
                    <Slider id="initialVelocitySlider" min={-10} max={10} step={0.5} value={[initialVelocity]} onValueChange={(v) => handleParamChange(setInitialVelocity, v[0])} className="flex-grow" />
                    <Input id="initialVelocityInput" type="number" value={initialVelocity} onChange={(e) => handleParamChange(setInitialVelocity, e.target.value)} min={-10} max={10} step={0.5} className="w-20 h-9" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="accelerationInput" className="flex justify-between text-sm">
                    <span>Acceleration (a)</span> <span>{formatNumber(acceleration, 1)} m/s²</span>
                  </Label>
                   <div className="flex items-center gap-2">
                    <Slider id="accelerationSlider" min={-5} max={5} step={0.1} value={[acceleration]} onValueChange={(v) => handleParamChange(setAcceleration, v[0])} className="flex-grow"/>
                    <Input id="accelerationInput" type="number" value={acceleration} onChange={(e) => handleParamChange(setAcceleration, e.target.value)} min={-5} max={5} step={0.1} className="w-20 h-9" />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button onClick={handleToggleRun} className="flex-1">
                    {isRunning ? <Pause className="mr-2 h-4 w-4"/> : <Play className="mr-2 h-4 w-4"/>}
                    {isRunning ? "Pause" : (simulationTime >= MAX_SIMULATION_TIME - 0.01 ? "Restart" : "Play")}
                  </Button>
                  <Button onClick={handleReset} variant="outline"><RefreshCw className="mr-2 h-4 w-4"/>Reset</Button>
                </div>
              </div>
              <div className="p-4 border rounded-lg bg-background space-y-1 text-sm">
                <h3 className="font-semibold text-md mb-2">Real-time Data:</h3>
                <p>Time (t): <Badge variant="secondary">{formatNumber(simulationTime)} s</Badge></p>
                <p>Current Velocity (v): <Badge variant="secondary">{formatNumber(currentVelocity)} m/s</Badge></p>
                <p>Displacement (s): <Badge variant="secondary">{formatNumber(currentDisplacement)} m</Badge></p>
                {timeToTurnAround !== null && (
                  <p className="text-blue-600 dark:text-blue-400">Turns around at: <Badge variant="outline" className="border-blue-500 text-blue-600">{formatNumber(timeToTurnAround)} s</Badge></p>
                )}
              </div>
            </div>

            <div className="md:col-span-2 space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-md">Visual Motion Track</CardTitle></CardHeader>
                <CardContent ref={canvasContainerRef} className="flex items-center justify-center p-1 h-[120px]"> {/* Increased height */}
                  <canvas ref={canvasRef} width={canvasWidth} height={CANVAS_HEIGHT} className="bg-muted rounded-md border"></canvas>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-md flex items-center gap-2"><TrendingUp className="h-5 w-5"/> Motion Graphs</CardTitle></CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[250px] w-full">
                    <LineChart data={history} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" type="number" domain={[0, MAX_SIMULATION_TIME]} tickFormatter={(val) => formatNumber(val,0) + 's'} />
                      <YAxis yAxisId="left" domain={yAxisDomainVelocity} tickFormatter={(val) => formatNumber(val,0)} allowDataOverflow={false} width={40}/>
                      <YAxis yAxisId="right" orientation="right" domain={yAxisDomainDisplacement} tickFormatter={(val) => formatNumber(val,0)} allowDataOverflow={false} width={40}/>
                      <RechartsTooltip
                        content={<ChartTooltipContent />}
                        formatter={(value, name) => (`${formatNumber(value as number)} ${name === 'velocity' ? 'm/s' : 'm'}`)}
                      />
                      <ReferenceLine x={simulationTime} stroke="hsl(var(--destructive))" strokeDasharray="3 3" yAxisId="left" />
                      <Line yAxisId="left" type="monotone" dataKey="velocity" stroke={chartConfig.velocity.color} strokeWidth={2.5} dot={false} name="Velocity" isAnimationActive={false} />
                      <Line yAxisId="right" type="monotone" dataKey="displacement" stroke={chartConfig.displacement.color} strokeWidth={2.5} dot={false} name="Displacement" isAnimationActive={false}/>
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground p-3 bg-muted/30">
          Key Equations: Velocity <code className="text-primary">v = v₀ + at</code>, Displacement <code className="text-primary">s = v₀t + ½at²</code>
        </CardFooter>
      </Card>
    </div>
  );
}