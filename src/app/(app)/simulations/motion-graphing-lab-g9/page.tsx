// src/app/(app)/simulations/motion-graphing-lab-g9/page.tsx (Enhanced)
"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Play, Pause, RefreshCw, LineChart as LineChartIcon, HelpCircle, PersonStanding, TrendingUp, MoveHorizontal } from "lucide-react";
import Link from "next/link";
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine, DotProps } from 'recharts';
import { Badge } from '@/components/ui/badge';

// --- Constants ---
const CANVAS_HEIGHT = 100; // Increased for arrows and track details
const OBJECT_WIDTH = 25;
const OBJECT_HEIGHT = 15;
const MAX_SIM_TIME_GRAPH = 10; // seconds
const TRACK_Y_POSITION = CANVAS_HEIGHT * 0.65;
const TICK_MARK_HEIGHT = 5;
const VISUAL_POSITION_RANGE_METERS = 25; // Default visual range (+/- from initial for scaling)

// Colors
const PRIMARY_COLOR_HSL = "hsl(var(--primary))";
const VELOCITY_ARROW_COLOR = "hsl(var(--chart-2))";
const ACCELERATION_ARROW_COLOR = "hsl(var(--chart-3))";
const MUTED_FOREGROUND_HSL = "hsl(var(--muted-foreground))";
const BORDER_COLOR_HSL = "hsl(var(--border))";


interface MotionPoint {
  time: number;
  position: number;
  velocity: number;
  acceleration: number;
}

// --- Helper Functions ---
const formatNum = (num: number, precision = 1) => num.toFixed(precision);

export default function MotionGraphingLabEnhancedPage() {
  const [initialPosition, setInitialPosition] = useState(0); // m
  const [initialVelocity, setInitialVelocity] = useState(1); // m/s
  const [acceleration, setAcceleration] = useState(0); // m/s^2

  const [simulationTime, setSimulationTime] = useState(0); // s
  const [currentPosition, setCurrentPosition] = useState(initialPosition);
  const [currentVelocity, setCurrentVelocity] = useState(initialVelocity);

  const [isRunning, setIsRunning] = useState(false);
  const [motionData, setMotionData] = useState<MotionPoint[]>([{ time: 0, position: initialPosition, velocity: initialVelocity, acceleration: acceleration }]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const lastFrameTimeRef = useRef<number>(performance.now());
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [canvasWidth, setCanvasWidth] = useState(500); // Default

  // --- Canvas Scaling ---
  useEffect(() => {
    const updateCanvasWidth = () => {
      if (canvasContainerRef.current) {
        setCanvasWidth(canvasContainerRef.current.offsetWidth > 0 ? canvasContainerRef.current.offsetWidth : 500);
      }
    };
    updateCanvasWidth();
    window.addEventListener('resize', updateCanvasWidth);
    return () => window.removeEventListener('resize', updateCanvasWidth);
  }, []);

  const pixelsPerMeter = useMemo(() => {
    // Scale based on the max displacement observed OR a fixed range, whichever is larger
    // to provide a relatively stable view around the initial position.
    const dynamicRange = motionData.reduce((max, p) => Math.max(max, Math.abs(p.position - initialPosition)), 0);
    const displayRange = Math.max(dynamicRange, VISUAL_POSITION_RANGE_METERS) * 2; // Total width of range
    return (canvasWidth - OBJECT_WIDTH - 40) / (displayRange || 1); // -40 for padding, || 1 to avoid div by zero
  }, [canvasWidth, motionData, initialPosition]);

  const canvasOriginX = useMemo(() => {
    // The "origin" on canvas is where initialPosition is drawn, typically center.
    return canvasWidth / 2 - (initialPosition * pixelsPerMeter);
  }, [canvasWidth, initialPosition, pixelsPerMeter]);


  // --- Physics Calculation & Simulation Loop ---
  const calculateInstantaneousValues = useCallback((t: number): Omit<MotionPoint, 'time'> => {
    const pos = initialPosition + initialVelocity * t + 0.5 * acceleration * t * t;
    const vel = initialVelocity + acceleration * t;
    return { position: pos, velocity: vel, acceleration: acceleration };
  }, [initialPosition, initialVelocity, acceleration]);

  // Update current display values immediately when parameters change & for initial state
  useEffect(() => {
    const { position, velocity } = calculateInstantaneousValues(0);
    setCurrentPosition(position);
    setCurrentVelocity(velocity);
    setMotionData([{ time: 0, position, velocity, acceleration }]);
    setSimulationTime(0); // Ensure time is reset
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPosition, initialVelocity, acceleration]); // `calculateInstantaneousValues` is stable

  const isRunningRef = useRef(isRunning);
  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);

  const animate = useCallback((timestamp: number) => {
    if (!isRunningRef.current) return;

    if (!lastFrameTimeRef.current) lastFrameTimeRef.current = timestamp;
    const deltaTime = (timestamp - lastFrameTimeRef.current) / 1000;
    lastFrameTimeRef.current = timestamp;

    setSimulationTime(prevTime => {
      let newTime = prevTime + deltaTime;
      let shouldStop = false;
      if (newTime >= MAX_SIM_TIME_GRAPH) {
        newTime = MAX_SIM_TIME_GRAPH;
        shouldStop = true;
      }

      const { position, velocity, acceleration: currentAccel } = calculateInstantaneousValues(newTime);
      setCurrentPosition(position);
      setCurrentVelocity(velocity);
      
      setMotionData(prevData => {
         // Add data point, ensuring time is progressive and unique for Recharts
        const lastPointTime = prevData.length > 0 ? prevData[prevData.length - 1].time : -1;
        if (newTime > lastPointTime) { // Add only if time has advanced
            return [...prevData, { time: newTime, position, velocity, acceleration: currentAccel }];
        }
        return prevData; // If time hasn't advanced enough, return previous data
      });

      if (shouldStop) setIsRunning(false);
      return newTime;
    });

    if (isRunningRef.current) requestRef.current = requestAnimationFrame(animate);
  }, [calculateInstantaneousValues]);

  useEffect(() => {
    if (isRunning) {
      lastFrameTimeRef.current = performance.now();
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [isRunning, animate]);

  // --- Canvas Drawing ---
  const drawArrow = (ctx: CanvasRenderingContext2D, x: number, y: number, isPositive: boolean, length: number, color: string, label: string) => {
    if (Math.abs(length) < 1) return; // Don't draw tiny arrows
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;
    const headSize = 6;
    const effectiveLength = isPositive ? length : -length; // Length is magnitude, direction by isPositive
    
    const startX = x;
    const endX = x + effectiveLength;

    ctx.beginPath();
    ctx.moveTo(startX, y);
    ctx.lineTo(endX, y);
    ctx.stroke();

    // Arrowhead
    ctx.beginPath();
    if (isPositive) {
      ctx.moveTo(endX, y); ctx.lineTo(endX - headSize, y - headSize / 2); ctx.lineTo(endX - headSize, y + headSize / 2);
    } else {
      ctx.moveTo(endX, y); ctx.lineTo(endX + headSize, y - headSize / 2); ctx.lineTo(endX + headSize, y + headSize / 2);
    }
    ctx.closePath();
    ctx.fill();
    if(label) ctx.fillText(label, endX + (isPositive ? 5 : -15), y + 4);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas || canvasWidth <= 0) return;

    ctx.clearRect(0, 0, canvasWidth, CANVAS_HEIGHT);
    ctx.font = "10px sans-serif";

    // Draw track
    ctx.strokeStyle = BORDER_COLOR_HSL;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, TRACK_Y_POSITION);
    ctx.lineTo(canvasWidth, TRACK_Y_POSITION);
    ctx.stroke();

    // Draw origin (0m) and other tick marks
    const numTicks = 10; // Approx number of ticks
    const meterStep = Math.max(1, Math.round(VISUAL_POSITION_RANGE_METERS * 2 / pixelsPerMeter / numTicks));

    for (let i = -Math.ceil(VISUAL_POSITION_RANGE_METERS * 2 / meterStep) * meterStep; i <= Math.ceil(VISUAL_POSITION_RANGE_METERS*2 / meterStep) * meterStep; i += meterStep) {
        const xPos = canvasOriginX + i * pixelsPerMeter;
        if (xPos > 0 && xPos < canvasWidth) {
            const isOrigin = Math.abs(i - initialPosition) < meterStep / 2; // Highlight tick near initial position if it's the origin
            ctx.fillStyle = isOrigin ? PRIMARY_COLOR_HSL : MUTED_FOREGROUND_HSL;
            ctx.fillRect(xPos - 1, TRACK_Y_POSITION - (isOrigin ? TICK_MARK_HEIGHT * 1.5 : TICK_MARK_HEIGHT), 2, isOrigin ? TICK_MARK_HEIGHT * 3 : TICK_MARK_HEIGHT * 2);
            if (isOrigin || i % (meterStep * 2) === 0 || meterStep === 1) { // Label origin, major ticks, or all if step is 1
                 ctx.textAlign = "center";
                 ctx.fillText(`${formatNum(i + initialPosition, 0)}m`, xPos, TRACK_Y_POSITION + TICK_MARK_HEIGHT + 12);
            }
        }
    }
    
    // Object's screen position relative to its initial position being at canvasOriginX
    const objectScreenX = canvasOriginX + (currentPosition - initialPosition) * pixelsPerMeter;
    const clampedObjectX = Math.max(OBJECT_WIDTH/2, Math.min(objectScreenX, canvasWidth - OBJECT_WIDTH/2));


    // Draw object (simple car)
    const carBodyY = TRACK_Y_POSITION - OBJECT_HEIGHT - 3;
    ctx.fillStyle = PRIMARY_COLOR_HSL;
    ctx.beginPath();
    ctx.roundRect(clampedObjectX - OBJECT_WIDTH/2, carBodyY, OBJECT_WIDTH, OBJECT_HEIGHT, [3,3,0,0]);
    ctx.fill();
    // Wheels
    ctx.fillStyle = "hsl(var(--foreground))";
    ctx.beginPath();
    ctx.arc(clampedObjectX - OBJECT_WIDTH * 0.25, TRACK_Y_POSITION - 3, 4, 0, 2 * Math.PI);
    ctx.arc(clampedObjectX + OBJECT_WIDTH * 0.25, TRACK_Y_POSITION - 3, 4, 0, 2 * Math.PI);
    ctx.fill();

    // Arrows
    const arrowBaseY = carBodyY - 10;
    const maxVelDisplay = Math.max(...motionData.map(p=>Math.abs(p.velocity)), Math.abs(initialVelocity), 5); // Max vel for arrow scaling
    const velArrowLength = (Math.abs(currentVelocity) / maxVelDisplay) * 30 + 5; // Min length 5, scaled up to 35
    if(Math.abs(currentVelocity) > 0.05) drawArrow(ctx, clampedObjectX, arrowBaseY, currentVelocity > 0, velArrowLength, VELOCITY_ARROW_COLOR, "v");

    const maxAccDisplay = Math.max(...motionData.map(p=>Math.abs(p.acceleration)), Math.abs(acceleration), 1);
    const accArrowLength = (Math.abs(acceleration) / maxAccDisplay) * 25 + 5;
    if(Math.abs(acceleration) > 0.01) drawArrow(ctx, clampedObjectX, arrowBaseY - 12, acceleration > 0, accArrowLength, ACCELERATION_ARROW_COLOR, "a");

  }, [currentPosition, currentVelocity, acceleration, initialPosition, canvasWidth, canvasOriginX, pixelsPerMeter, motionData]); // Added motionData for arrow scaling


  // --- UI Handlers & Configs ---
  const handleParamChange = (setter: React.Dispatch<React.SetStateAction<number>>, value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (!isNaN(numValue)) {
      setIsRunning(false); // Stop simulation
      setter(numValue);
      // Reset is handled by useEffect on param change
    }
  };
  
  const handleToggleRun = () => {
    if (!isRunning && simulationTime >= MAX_SIM_TIME_GRAPH - 0.01) {
      setIsRunning(false); // Ensure it's false
      // Reset is handled by useEffect on param change, simulate pressing reset then play
      const s0=initialPosition, v0=initialVelocity, a0=acceleration; // Store current
      setInitialPosition(s0-0.001); // Force useEffect to re-trigger reset
      setInitialVelocity(v0); setAcceleration(a0);
      setTimeout(() => {
          setInitialPosition(s0); // Restore and trigger again if needed
          setIsRunning(true);
      }, 50);
    } else {
      setIsRunning(!isRunning);
    }
  };

  const handleFullReset = () => {
    setIsRunning(false);
    // Trigger useEffect for params by slightly changing one then restoring
    const s0=0, v0=1, a0=0; // Default reset values
    setInitialPosition(s0 - 0.0001); // Temp change to ensure useEffect fires
    setInitialVelocity(v0);
    setAcceleration(a0);
    setTimeout(() => setInitialPosition(s0),0); // Restore
  };


  const chartConfig = {
    position: { label: "Position", color: "hsl(var(--chart-1))", unit: "m" },
    velocity: { label: "Velocity", color: "hsl(var(--chart-2))", unit: "m/s" },
    acceleration: { label: "Accel.", color: "hsl(var(--chart-3))", unit: "m/s²" },
  };

  const getStableGraphDomain = (key: keyof MotionPoint) => {
    const values = motionData.map(p => p[key]);
    if (values.length === 0) return [-1, 1];

    let min = Math.min(...values, key === 'position' ? initialPosition : (key === 'velocity' ? initialVelocity : acceleration));
    let max = Math.max(...values, key === 'position' ? initialPosition : (key === 'velocity' ? initialVelocity : acceleration));
    
    if (min === max) { min -= 1; max += 1; }
    const padding = (max - min) * 0.15 || 1; // 15% padding or at least 1 unit
    return [Math.floor((min - padding)*10)/10, Math.ceil((max + padding)*10)/10];
  };
  
  const CustomTooltipContent = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const time = parseFloat(label);
      // Find the closest data point in motionData for this time
      const dataPoint = motionData.reduce((prev, curr) => 
        Math.abs(curr.time - time) < Math.abs(prev.time - time) ? curr : prev
      );

      if (!dataPoint) return null;

      return (
        <Card className="text-sm shadow-lg">
          <CardHeader className="p-2 border-b">
            <CardTitle className="text-xs">Time: {formatNum(dataPoint.time, 2)}s</CardTitle>
          </CardHeader>
          <CardContent className="p-2 space-y-0.5">
            <p style={{ color: chartConfig.position.color }}>Pos: {formatNum(dataPoint.position, 2)}{chartConfig.position.unit}</p>
            <p style={{ color: chartConfig.velocity.color }}>Vel: {formatNum(dataPoint.velocity, 2)}{chartConfig.velocity.unit}</p>
            <p style={{ color: chartConfig.acceleration.color }}>Acc: {formatNum(dataPoint.acceleration, 2)}{chartConfig.acceleration.unit}</p>
          </CardContent>
        </Card>
      );
    }
    return null;
  };


  return (
    <div className="space-y-6 p-1 md:p-4">
       <div className="flex justify-between items-center">
        <Button variant="outline" asChild size="sm">
          <Link href="/simulations"> <ArrowLeft className="mr-2 h-4 w-4" /> Back </Link>
        </Button>
         <h1 className="text-xl sm:text-2xl font-semibold text-center flex items-center gap-2">
            <LineChartIcon className="h-7 w-7 text-primary" />
            G9: 1D Motion Graphing Lab
        </h1>
        <Popover>
          <PopoverTrigger asChild><Button variant="outline" size="icon"><HelpCircle className="h-5 w-5"/></Button></PopoverTrigger>
          <PopoverContent className="w-80 text-sm space-y-2">
            <p className="font-semibold">Explore 1D Motion Graphs!</p>
             <ul className="list-disc list-inside text-xs">
              <li>Adjust <strong>Initial Position (s₀)</strong>, <strong>Velocity (v₀)</strong>, and <strong>Acceleration (a)</strong>.</li>
              <li>The object on the track shows its current motion. Arrows indicate velocity (v) and acceleration (a).</li>
              <li>Observe P-T, V-T, and A-T graphs. Hover over graphs to inspect values at any time.</li>
              <li>Challenge: Try to create specific graph shapes (e.g., a V-T graph that crosses the time axis).</li>
            </ul>
             <p className="text-xs pt-2 border-t">Equations: <code className="text-primary">s = s₀ + v₀t + ½at²</code>, <code className="text-primary">v = v₀ + at</code></p>
          </PopoverContent>
        </Popover>
      </div>

      <Card className="shadow-xl">
        <CardContent className="p-4 md:p-6">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Controls Column */}
            <div className="md:col-span-1 space-y-4">
              <Card className="bg-background/70">
                <CardHeader><CardTitle className="text-lg">Setup Parameters</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { id: "s0", label: "Initial Position (s₀)", unit: "m", value: initialPosition, setter: setInitialPosition, min: -20, max: 20, step: 0.5 },
                    { id: "v0", label: "Initial Velocity (v₀)", unit: "m/s", value: initialVelocity, setter: setInitialVelocity, min: -10, max: 10, step: 0.1 },
                    { id: "a", label: "Acceleration (a)", unit: "m/s²", value: acceleration, setter: setAcceleration, min: -5, max: 5, step: 0.1 },
                  ].map(param => (
                    <div key={param.id}>
                      <Label htmlFor={param.id} className="flex justify-between text-xs mb-1">
                        <span>{param.label}</span> <span>{formatNum(param.value, param.step < 0.5 ? 2 : 1)} {param.unit}</span>
                      </Label>
                      <div className="flex items-center gap-2">
                        <Slider id={`${param.id}Slider`} min={param.min} max={param.max} step={param.step} value={[param.value]} onValueChange={(v) => handleParamChange(param.setter, v[0])} className="flex-grow"/>
                        <Input id={param.id} type="number" value={param.value.toString()} onChange={e => handleParamChange(param.setter, e.target.value)} min={param.min} max={param.max} step={param.step} className="w-24 h-9 text-sm" />
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-2 pt-3">
                    <Button onClick={handleToggleRun} className="flex-1">
                      {isRunning ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                      {isRunning ? "Pause" : (simulationTime >= MAX_SIM_TIME_GRAPH - 0.01 ? "Restart" : "Play")}
                    </Button>
                    <Button onClick={handleFullReset} variant="outline" className="flex-1"><RefreshCw className="mr-2 h-4 w-4"/>Reset All</Button>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-background/70">
                <CardHeader><CardTitle className="text-lg">Current Values</CardTitle></CardHeader>
                <CardContent className="space-y-1 text-sm">
                    <p>Time: <Badge variant="outline">{formatNum(simulationTime, 2)} s</Badge></p>
                    <p>Position: <Badge variant="outline" style={{borderColor: chartConfig.position.color, color:chartConfig.position.color}}>{formatNum(currentPosition, 2)} {chartConfig.position.unit}</Badge></p>
                    <p>Velocity: <Badge variant="outline" style={{borderColor: chartConfig.velocity.color, color:chartConfig.velocity.color}}>{formatNum(currentVelocity, 2)} {chartConfig.velocity.unit}</Badge></p>
                </CardContent>
              </Card>
            </div>

            {/* Visualization & Graphs Column */}
            <div className="md:col-span-2 space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-md flex items-center gap-1"><MoveHorizontal className="h-5 w-5 text-primary"/>Motion on Track</CardTitle></CardHeader>
                <CardContent ref={canvasContainerRef} className="flex items-center justify-center p-1 h-[140px]"> {/* Increased height */}
                  <canvas ref={canvasRef} width={canvasWidth} height={CANVAS_HEIGHT} className="bg-card rounded-md"></canvas>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-md flex items-center gap-1"><TrendingUp className="h-5 w-5 text-primary"/>Kinematic Graphs</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {([ 'position', 'velocity', 'acceleration'] as (keyof MotionPoint)[]).map((key) => (
                    <div className="h-[160px] border p-2 rounded-md bg-muted/30" key={key}>
                      <Label className="text-xs font-semibold" style={{color: chartConfig[key as keyof typeof chartConfig].color}}>
                        {chartConfig[key as keyof typeof chartConfig].label} ({chartConfig[key as keyof typeof chartConfig].unit})
                      </Label>
                      <ResponsiveContainer width="100%" height="calc(100% - 20px)">
                        <LineChart data={motionData} margin={{ top: 5, right: 15, left: -15, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="2 2" strokeOpacity={0.5}/>
                          <XAxis dataKey="time" type="number" domain={[0, MAX_SIM_TIME_GRAPH]} tickFormatter={(val) => formatNum(val,0)} fontSize={10} />
                          <YAxis 
                            domain={getStableGraphDomain(key)} 
                            tickFormatter={(val) => formatNum(val,1)} 
                            fontSize={10} 
                            allowDataOverflow={false} 
                            width={45}
                           />
                          <RechartsTooltip content={<CustomTooltipContent />} cursor={{stroke: PRIMARY_COLOR_HSL, strokeWidth: 1, strokeDasharray: "3 3"}}/>
                          <ReferenceLine x={simulationTime} stroke="hsl(var(--destructive))" strokeOpacity={0.7} strokeDasharray="4 4" />
                          <Line 
                            type="monotone" 
                            dataKey={key} 
                            stroke={chartConfig[key as keyof typeof chartConfig].color} 
                            strokeWidth={2.5} 
                            dot={false} 
                            isAnimationActive={false} 
                            name={key}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
         <CardFooter className="text-xs text-muted-foreground p-3 bg-muted/10 border-t">
            Premium simulation experience. Adjust parameters, observe motion, and analyze P-T, V-T, A-T graphs in detail.
        </CardFooter>
      </Card>
    </div>
  );
}