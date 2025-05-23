
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Play, Pause, RefreshCw, PersonStanding, HelpCircle } from "lucide-react";
import Link from "next/link";
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend as RechartsLegend } from 'recharts';

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 80;
const MAN_SIZE = 20;
const MAX_SIM_TIME_GRAPH = 10; // seconds, for graph x-axis extent

interface MotionPoint {
  time: number;
  position: number;
  velocity: number;
  acceleration: number;
}

export default function PhetMovingManG9Page() {
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
    // Reset simulation when initial parameters change
    handleReset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPosition, initialVelocity, acceleration]);
  
  const animate = useCallback((timestamp: number) => {
    if (!lastFrameTimeRef.current) {
      lastFrameTimeRef.current = timestamp;
    }
    const deltaTime = (timestamp - lastFrameTimeRef.current) / 1000; // seconds
    lastFrameTimeRef.current = timestamp;

    setSimulationTime(prevTime => {
      let newTime = prevTime + deltaTime;
      if (newTime >= MAX_SIM_TIME_GRAPH) {
        newTime = MAX_SIM_TIME_GRAPH;
        setIsRunning(false); // Stop simulation at max time
      }
      const currentDataPoint = calculateMotion(newTime);
      setMotionData(prevData => [...prevData, currentDataPoint]);
      return newTime;
    });

    if (isRunningRef.current && simulationTimeRef.current < MAX_SIM_TIME_GRAPH) {
      requestRef.current = requestAnimationFrame(animate);
    } else if (simulationTimeRef.current >= MAX_SIM_TIME_GRAPH) {
        setIsRunning(false); // Ensure it stops
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
      lastFrameTimeRef.current = performance.now(); // Reset for accurate deltaTime
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

  // Canvas Drawing Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw track
    ctx.fillStyle = "hsl(var(--muted))";
    ctx.fillRect(0, CANVAS_HEIGHT / 2 - 2, CANVAS_WIDTH, 4);

    // Scale position to canvas. Max display range for position could be dynamic or fixed.
    // For simplicity, let's assume a max visual range for position, e.g., -50m to 50m.
    const visualPositionRange = 50; // m
    const canvasPosition = (currentPosition / visualPositionRange) * (CANVAS_WIDTH / 2) + (CANVAS_WIDTH / 2);
    const manDrawX = Math.max(MAN_SIZE/2, Math.min(canvasPosition - MAN_SIZE / 2, CANVAS_WIDTH - MAN_SIZE*1.5));

    // Draw "man" (a rectangle)
    ctx.fillStyle = "hsl(var(--primary))";
    ctx.fillRect(manDrawX, CANVAS_HEIGHT / 2 - MAN_SIZE / 2, MAN_SIZE, MAN_SIZE);
    
    // Position labels (basic)
    ctx.fillStyle = "hsl(var(--foreground))";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("0m", CANVAS_WIDTH/2, CANVAS_HEIGHT - 5);
    ctx.fillText(`-${visualPositionRange/2}m`, CANVAS_WIDTH/4, CANVAS_HEIGHT - 5);
    ctx.fillText(`${visualPositionRange/2}m`, CANVAS_WIDTH*3/4, CANVAS_HEIGHT - 5);


  }, [currentPosition]);

  const handleToggleRun = () => {
    if (!isRunning && simulationTime >= MAX_SIM_TIME_GRAPH - 0.01) {
      handleReset(); // Reset and then play if at end
      // setIsRunning(true) will be handled by the reset potentially, or trigger play after reset.
      // For now, let reset also start it if desired, or require a separate play click.
      // Let's make it reset then user has to click play again.
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
  
  // Determine dynamic Y-axis domains for graphs
  const getDomain = (dataKey: keyof MotionPoint) => {
    if (motionData.length === 0) return [0, 1];
    const values = motionData.map(p => p[dataKey]);
    let min = Math.min(...values);
    let max = Math.max(...values);
    if (min === max) { // Handle flat lines
        min = min - Math.abs(min*0.1) - 0.5;
        max = max + Math.abs(max*0.1) + 0.5;
    }
    const padding = (max - min) * 0.1 || 0.5; // Add padding or default if range is 0
    return [min - padding, max + padding];
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
                <PersonStanding className="h-8 w-8 text-primary" />
                PhET: The Moving Man (Kinematics)
              </CardTitle>
              <CardDescription>
                Grade 9 - Explore position, velocity, and acceleration relationships. Observe motion and corresponding graphs.
              </CardDescription>
            </div>
             <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon"><HelpCircle className="h-5 w-5"/></Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 text-sm">
                 <h4 className="font-medium leading-none mb-2">Moving Man Simulation</h4>
                 <p className="text-muted-foreground">
                    Set the initial position, velocity, and acceleration of the 'man'.
                    Press Play to start the simulation. Observe the man's motion on the track and the synchronized P-T, V-T, and A-T graphs.
                    Use Reset to start over with current settings.
                 </p>
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Controls */}
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

            {/* Visualization & Graphs */}
            <div className="md:col-span-2 space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-lg">Motion Visualization</CardTitle></CardHeader>
                <CardContent className="flex items-center justify-center p-2 h-[120px]">
                  <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="bg-card rounded-md border"></canvas>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-lg">Graphs</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {/* Position-Time Graph */}
                  <div className="h-[150px]">
                    <Label className="text-xs text-muted-foreground">Position vs. Time</Label>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={motionData} margin={{ top: 5, right: 20, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))"/>
                        <XAxis dataKey="time" type="number" domain={[0, MAX_SIM_TIME_GRAPH]} tickFormatter={(val) => val.toFixed(1)} stroke="hsl(var(--muted-foreground))" fontSize={10} />
                        <YAxis domain={getDomain('position')} tickFormatter={(val) => val.toFixed(1)} stroke="hsl(var(--muted-foreground))" fontSize={10} />
                        <ChartTooltip
                          content={<ChartTooltipContent 
                            labelFormatter={(value) => `Time: ${Number(value).toFixed(2)}s`}
                            formatter={(value, name) => ([`${Number(value).toFixed(2)} ${name === 'position' ? 'm' : ''}`, chartConfig[name as keyof typeof chartConfig]?.label])}
                          />}
                          cursor={{stroke: 'hsl(var(--primary))', strokeDasharray: '3 3'}}
                        />
                        <Line type="monotone" dataKey="position" stroke={chartConfig.position.color} strokeWidth={2} dot={false} isAnimationActive={false} name="position"/>
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Velocity-Time Graph */}
                  <div className="h-[150px]">
                     <Label className="text-xs text-muted-foreground">Velocity vs. Time</Label>
                     <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={motionData} margin={{ top: 5, right: 20, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))"/>
                        <XAxis dataKey="time" type="number" domain={[0, MAX_SIM_TIME_GRAPH]} tickFormatter={(val) => val.toFixed(1)} stroke="hsl(var(--muted-foreground))" fontSize={10} />
                        <YAxis domain={getDomain('velocity')} tickFormatter={(val) => val.toFixed(1)} stroke="hsl(var(--muted-foreground))" fontSize={10} />
                         <ChartTooltip
                          content={<ChartTooltipContent 
                            labelFormatter={(value) => `Time: ${Number(value).toFixed(2)}s`}
                            formatter={(value, name) => ([`${Number(value).toFixed(2)} ${name === 'velocity' ? 'm/s' : ''}`, chartConfig[name as keyof typeof chartConfig]?.label])}
                          />}
                          cursor={{stroke: 'hsl(var(--primary))', strokeDasharray: '3 3'}}
                        />
                        <Line type="monotone" dataKey="velocity" stroke={chartConfig.velocity.color} strokeWidth={2} dot={false} isAnimationActive={false} name="velocity"/>
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Acceleration-Time Graph */}
                  <div className="h-[150px]">
                     <Label className="text-xs text-muted-foreground">Acceleration vs. Time</Label>
                     <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={motionData} margin={{ top: 5, right: 20, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))"/>
                        <XAxis dataKey="time" type="number" domain={[0, MAX_SIM_TIME_GRAPH]} tickFormatter={(val) => val.toFixed(1)} stroke="hsl(var(--muted-foreground))" fontSize={10} />
                        <YAxis domain={getDomain('acceleration')} tickFormatter={(val) => val.toFixed(1)} stroke="hsl(var(--muted-foreground))" fontSize={10} allowDecimals={true}/>
                        <ChartTooltip
                          content={<ChartTooltipContent 
                            labelFormatter={(value) => `Time: ${Number(value).toFixed(2)}s`}
                            formatter={(value, name) => ([`${Number(value).toFixed(2)} ${name === 'acceleration' ? 'm/s²' : ''}`, chartConfig[name as keyof typeof chartConfig]?.label])}
                          />}
                          cursor={{stroke: 'hsl(var(--primary))', strokeDasharray: '3 3'}}
                        />
                        <Line type="monotone" dataKey="acceleration" stroke={chartConfig.acceleration.color} strokeWidth={2} dot={false} isAnimationActive={false} name="acceleration"/>
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
        <CardFooter>
            <p className="text-xs text-muted-foreground">
                Inspired by PhET's "The Moving Man". This simulation demonstrates 1D kinematics.
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}

