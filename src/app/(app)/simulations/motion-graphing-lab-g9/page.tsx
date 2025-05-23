// src/app/(app)/simulations/motion-graphing-lab-g9/page.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Play, Pause, RefreshCw, LineChart as LineChartIcon, HelpCircle, PersonStanding } from "lucide-react";
import Link from "next/link";
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 80;
const OBJECT_VISUAL_SIZE = 20;
const MAX_SIM_TIME_GRAPH = 10; // seconds, for graph x-axis extent
const VISUAL_POSITION_RANGE_METERS = 50; // Max displacement to scale on canvas (+/- from center)

interface MotionPoint {
  time: number;
  position: number;
  velocity: number;
  acceleration: number;
}

export default function MotionGraphingLabG9Page() {
  const [initialPosition, setInitialPosition] = useState(0); // m
  const [initialVelocity, setInitialVelocity] = useState(1); // m/s
  const [acceleration, setAcceleration] = useState(0); // m/s^2

  const [simulationTime, setSimulationTime] = useState(0); // s
  const [currentPosition, setCurrentPosition] = useState(initialPosition); // m
  const [currentVelocity, setCurrentVelocity] = useState(initialVelocity); // m/s

  const [isRunning, setIsRunning] = useState(false);
  const [motionData, setMotionData] = useState<MotionPoint[]>([{ time: 0, position: initialPosition, velocity: initialVelocity, acceleration: acceleration }]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const lastFrameTimeRef = useRef<number>(performance.now());

  const calculateMotion = useCallback((t: number) => {
    const newPosition = initialPosition + initialVelocity * t + 0.5 * acceleration * t * t;
    const newVelocity = initialVelocity + acceleration * t;
    setCurrentPosition(newPosition);
    setCurrentVelocity(newVelocity);
    return { time: t, position: newPosition, velocity: newVelocity, acceleration: acceleration };
  }, [initialPosition, initialVelocity, acceleration]);

  useEffect(() => {
    handleReset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPosition, initialVelocity, acceleration]);
  
  const animate = useCallback((timestamp: number) => {
    if (!lastFrameTimeRef.current) {
      lastFrameTimeRef.current = timestamp;
    }
    const deltaTime = (timestamp - lastFrameTimeRef.current) / 1000; 
    lastFrameTimeRef.current = timestamp;

    setSimulationTime(prevTime => {
      let newTime = prevTime + deltaTime;
      if (newTime >= MAX_SIM_TIME_GRAPH) {
        newTime = MAX_SIM_TIME_GRAPH;
        setIsRunning(false); 
      }
      const currentDataPoint = calculateMotion(newTime);
      setMotionData(prevData => [...prevData, currentDataPoint].filter(p => p.time <= MAX_SIM_TIME_GRAPH + 0.01)); // Filter to keep data within graph bounds
      return newTime;
    });

    if (isRunningRef.current && simulationTimeRef.current < MAX_SIM_TIME_GRAPH) {
      requestRef.current = requestAnimationFrame(animate);
    } else if (simulationTimeRef.current >= MAX_SIM_TIME_GRAPH) {
        setIsRunning(false); 
    }
  }, [calculateMotion]);

  const isRunningRef = useRef(isRunning);
  const simulationTimeRef = useRef(simulationTime);

  useEffect(() => {
    isRunningRef.current = isRunning;
    simulationTimeRef.current = simulationTime;
  }, [isRunning, simulationTime]);

  useEffect(() => {
    if (isRunning) {
      lastFrameTimeRef.current = performance.now(); 
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

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw track
    ctx.fillStyle = "hsl(var(--muted))";
    ctx.fillRect(0, CANVAS_HEIGHT / 2 - 2, CANVAS_WIDTH, 4);
    
    // Draw origin line
    ctx.strokeStyle = "hsl(var(--muted-foreground)/0.5)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 10);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);
    ctx.stroke();


    const scaleFactor = (CANVAS_WIDTH - OBJECT_VISUAL_SIZE) / (2 * VISUAL_POSITION_RANGE_METERS);
    const canvasObjectX = (CANVAS_WIDTH / 2) + (currentPosition * scaleFactor) - (OBJECT_VISUAL_SIZE / 2);
    
    const clampedX = Math.max(0, Math.min(canvasObjectX, CANVAS_WIDTH - OBJECT_VISUAL_SIZE));

    ctx.fillStyle = "hsl(var(--primary))";
    ctx.fillRect(clampedX, CANVAS_HEIGHT / 2 - OBJECT_VISUAL_SIZE / 2, OBJECT_VISUAL_SIZE, OBJECT_VISUAL_SIZE);
    
    ctx.fillStyle = "hsl(var(--foreground))";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("0m", CANVAS_WIDTH/2, CANVAS_HEIGHT - 5);
    ctx.fillText(`-${VISUAL_POSITION_RANGE_METERS}m`, OBJECT_VISUAL_SIZE/2, CANVAS_HEIGHT - 5);
    ctx.fillText(`${VISUAL_POSITION_RANGE_METERS}m`, CANVAS_WIDTH - OBJECT_VISUAL_SIZE/2, CANVAS_HEIGHT - 5);

  }, [currentPosition]);

  const handleToggleRun = () => {
    if (!isRunning && simulationTime >= MAX_SIM_TIME_GRAPH - 0.01) {
      handleReset(); 
      // setIsRunning(true); // Decide if reset should auto-play
    } else {
       setIsRunning(!isRunning);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setSimulationTime(0);
    lastFrameTimeRef.current = 0;
    const initialDataPoint = { time: 0, position: initialPosition, velocity: initialVelocity, acceleration: acceleration };
    setMotionData([initialDataPoint]);
    setCurrentPosition(initialPosition);
    setCurrentVelocity(initialVelocity);
  };

  const chartConfig = {
    position: { label: "Position (m)", color: "hsl(var(--chart-1))" },
    velocity: { label: "Velocity (m/s)", color: "hsl(var(--chart-2))" },
    acceleration: { label: "Acceleration (m/s²)", color: "hsl(var(--chart-3))" },
  };
  
  const getGraphDomain = (dataKey: keyof MotionPoint) => {
    if (motionData.length === 0) return ['auto', 'auto'];
    const values = motionData.map(p => p[dataKey]);
    let min = Math.min(...values);
    let max = Math.max(...values);

    if (min === max) { // Handle flat lines or single point
        min = min - Math.abs(min*0.1) - 1; // Add some padding
        max = max + Math.abs(max*0.1) + 1;
    }
     if(min === 0 && max === 0){ // Special case for all zeros
        min = -1; max = 1;
    }
    const padding = (max - min) * 0.1 || 1; 
    return [Math.floor(min - padding), Math.ceil(max + padding)];
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
                <LineChartIcon className="h-8 w-8 text-primary" />
                G9: 1D Motion Graphing Lab
              </CardTitle>
              <CardDescription>
                Explore position, velocity, and acceleration. Observe how changing initial conditions and acceleration affects motion and their corresponding graphs.
              </CardDescription>
            </div>
             <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon"><HelpCircle className="h-5 w-5"/></Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 text-sm">
                 <h4 className="font-medium leading-none mb-2">1D Motion Graphing Lab</h4>
                 <p className="text-muted-foreground">
                    Set initial position, velocity, and constant acceleration.
                    Press Play to observe the object's motion and the generated P-T, V-T, and A-T graphs.
                    Use Reset to start over. Focus on how the shapes of the graphs relate to the motion.
                 </p>
                 <h4 className="font-medium leading-none mt-3 mb-1">Key Equations:</h4>
                 <ul className="text-xs text-muted-foreground list-disc pl-4">
                     <li>s = s₀ + v₀t + ½at²</li>
                     <li>v = v₀ + at</li>
                 </ul>
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-lg">Controls</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label htmlFor="initialPos">Initial Position (s₀): {initialPosition.toFixed(1)} m</Label>
                    <Input id="initialPos" type="number" value={initialPosition} onChange={e => setInitialPosition(parseFloat(e.target.value) || 0)} step="0.5" />
                  </div>
                  <div>
                    <Label htmlFor="initialVel">Initial Velocity (v₀): {initialVelocity.toFixed(1)} m/s</Label>
                    <Input id="initialVel" type="number" value={initialVelocity} onChange={e => setInitialVelocity(parseFloat(e.target.value) || 0)} step="0.5" />
                  </div>
                  <div>
                    <Label htmlFor="accel">Acceleration (a): {acceleration.toFixed(1)} m/s²</Label>
                    <Input id="accel" type="number" value={acceleration} onChange={e => setAcceleration(parseFloat(e.target.value) || 0)} step="0.1" />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button onClick={handleToggleRun} className="flex-1">
                      {isRunning ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                      {isRunning ? "Pause" : (simulationTime >= MAX_SIM_TIME_GRAPH - 0.01 ? "Restart" : "Play")}
                    </Button>
                    <Button onClick={handleReset} variant="outline"><RefreshCw className="mr-2 h-4 w-4"/>Reset</Button>
                  </div>
                </CardContent>
              </Card>
               <Card>
                <CardHeader><CardTitle className="text-lg">Current Values</CardTitle></CardHeader>
                <CardContent className="space-y-1 text-sm">
                    <p>Time: <span className="font-semibold">{simulationTime.toFixed(2)} s</span></p>
                    <p>Position: <span className="font-semibold">{currentPosition.toFixed(2)} m</span></p>
                    <p>Velocity: <span className="font-semibold">{currentVelocity.toFixed(2)} m/s</span></p>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-2 space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-lg flex items-center gap-1"><PersonStanding className="h-5 w-5"/>Motion Visualization</CardTitle></CardHeader>
                <CardContent className="flex items-center justify-center p-2 h-[120px]">
                  <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="bg-card rounded-md border"></canvas>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-lg">Graphs</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {['position', 'velocity', 'acceleration'].map((key) => (
                    <div className="h-[150px]" key={key}>
                      <Label className="text-xs text-muted-foreground">{chartConfig[key as keyof typeof chartConfig].label}</Label>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={motionData} margin={{ top: 5, right: 20, left: -25, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))"/>
                          <XAxis dataKey="time" type="number" domain={[0, MAX_SIM_TIME_GRAPH]} tickFormatter={(val) => val.toFixed(1)} stroke="hsl(var(--muted-foreground))" fontSize={10} />
                          <YAxis 
                            domain={getGraphDomain(key as keyof MotionPoint)} 
                            tickFormatter={(val) => val.toFixed(1)} 
                            stroke="hsl(var(--muted-foreground))" 
                            fontSize={10} 
                            allowDataOverflow={true}
                           />
                          <ChartTooltip
                            content={<ChartTooltipContent 
                              labelFormatter={(value) => `Time: ${Number(value).toFixed(2)}s`}
                              formatter={(value, name) => ([`${Number(value).toFixed(2)} ${name === 'position' ? 'm' : name === 'velocity' ? 'm/s' : 'm/s²'}`, chartConfig[name as keyof typeof chartConfig]?.label])}
                            />}
                            cursor={{stroke: 'hsl(var(--primary))', strokeDasharray: '3 3'}}
                          />
                          <Line 
                            type="monotone" 
                            dataKey={key} 
                            stroke={chartConfig[key as keyof typeof chartConfig].color} 
                            strokeWidth={2} 
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
        <CardFooter>
            <p className="text-xs text-muted-foreground">
                This simulation demonstrates 1D kinematics. Focus on how input changes affect the shape of P-T, V-T, and A-T graphs.
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
