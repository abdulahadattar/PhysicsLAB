
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, HelpCircle, Play, Pause, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const CANVAS_WIDTH = 400;
const OBJECT_SIZE = 20;
const MAX_SIMULATION_TIME = 10; // seconds for graph display limit

export default function MotionConstantAccelerationPage() {
  const [initialVelocity, setInitialVelocity] = useState(0); // m/s
  const [acceleration, setAcceleration] = useState(1); // m/s^2
  const [simulationTime, setSimulationTime] = useState(0); // current elapsed time
  const [isRunning, setIsRunning] = useState(false);

  const [finalVelocity, setFinalVelocity] = useState(0);
  const [displacement, setDisplacement] = useState(0);
  const [position, setPosition] = useState(0); // For canvas animation

  const [history, setHistory] = useState<{ time: number; velocity: number; displacement: number }[]>([]);

  const requestRef = useRef<number>();
  const lastFrameTimeRef = useRef<number>(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const calculateMotion = useCallback((t: number) => {
    const v = initialVelocity + acceleration * t;
    const s = initialVelocity * t + 0.5 * acceleration * t * t;
    setFinalVelocity(v);
    setDisplacement(s);
    setPosition(s); // Assuming motion starts from 0
    return { time: t, velocity: v, displacement: s };
  }, [initialVelocity, acceleration]);

  useEffect(() => {
    const initialData = calculateMotion(0);
    setHistory([initialData]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialVelocity, acceleration]); 

  const animate = useCallback((timestamp: number) => {
    if (!lastFrameTimeRef.current) {
      lastFrameTimeRef.current = timestamp;
    }
    const deltaTime = (timestamp - lastFrameTimeRef.current) / 1000; 
    lastFrameTimeRef.current = timestamp;

    setSimulationTime(prevTime => {
      let newTime = prevTime + deltaTime;
      if (newTime >= MAX_SIMULATION_TIME) {
        newTime = MAX_SIMULATION_TIME;
        setIsRunning(false); 
      }
      
      const motionData = calculateMotion(newTime);
      
      setHistory(prevHistory => {
        const newHistory = [...prevHistory, motionData];
        return newHistory.filter(p => p.time <= MAX_SIMULATION_TIME);
      });

      return newTime;
    });

    if (isRunningRef.current) {
      requestRef.current = requestAnimationFrame(animate);
    }
  }, [calculateMotion]);

  const isRunningRef = useRef(isRunning);
  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

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
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, CANVAS_WIDTH, 50);
      ctx.fillStyle = "hsl(var(--primary))";
      
      const maxPossibleDisplacement = Math.max(
        Math.abs(initialVelocity * MAX_SIMULATION_TIME + 0.5 * acceleration * MAX_SIMULATION_TIME * MAX_SIMULATION_TIME),
        Math.abs(initialVelocity * MAX_SIMULATION_TIME), // Case for a=0
        10 // Minimum display range to avoid division by zero or overly sensitive scaling
      );
      
      let drawX;
      if (acceleration >= 0 && initialVelocity >= 0) { // Moving right
        drawX = (position / maxPossibleDisplacement) * (CANVAS_WIDTH - OBJECT_SIZE);
      } else if (acceleration <= 0 && initialVelocity <= 0) { // Moving left
        drawX = (CANVAS_WIDTH - OBJECT_SIZE) - (Math.abs(position) / maxPossibleDisplacement) * (CANVAS_WIDTH - OBJECT_SIZE);
      } else { // Motion could be in either direction or change direction
        // Center the "zero" point and scale from there
        const neutralPoint = CANVAS_WIDTH / 2;
        const scaleFactor = (CANVAS_WIDTH / 2 - OBJECT_SIZE / 2) / maxPossibleDisplacement;
        drawX = neutralPoint + position * scaleFactor - OBJECT_SIZE / 2;
      }
      
      drawX = Math.max(0, Math.min(drawX, CANVAS_WIDTH - OBJECT_SIZE)); // Clamp within canvas
      ctx.fillRect(drawX, 15, OBJECT_SIZE, OBJECT_SIZE);
    }
  }, [position, initialVelocity, acceleration]);


  const handleToggleRun = () => {
    if (!isRunning && simulationTime >= MAX_SIMULATION_TIME - 0.01) {
      handleReset(); 
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSimulationTime(0);
    lastFrameTimeRef.current = 0;
    const initialData = calculateMotion(0);
    setHistory([initialData]);
    setPosition(0);
  };
  
  const chartConfig = {
    velocity: { label: "Velocity (m/s)", color: "hsl(var(--chart-1))" },
    displacement: { label: "Displacement (m)", color: "hsl(var(--chart-2))" },
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
              <CardTitle className="text-3xl">Motion with Constant Acceleration</CardTitle>
              <CardDescription>Grade 9 - Explore 1D motion: v = v₀ + at, s = v₀t + ½at²</CardDescription>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon"><HelpCircle className="h-5 w-5"/></Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 text-sm">
                <p>Adjust initial velocity, acceleration, and observe the motion.</p>
                <p className="mt-2">The object moves horizontally. Graphs show velocity and displacement over time.</p>
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-6">
              <Card>
                <CardHeader><CardTitle className="text-xl">Controls</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="initialVelocity">Initial Velocity (v₀): {initialVelocity.toFixed(1)} m/s</Label>
                    <Slider id="initialVelocity" min={-10} max={10} step={0.5} value={[initialVelocity]} onValueChange={(v) => {setInitialVelocity(v[0]); handleReset();}} />
                  </div>
                  <div>
                    <Label htmlFor="acceleration">Acceleration (a): {acceleration.toFixed(1)} m/s²</Label>
                    <Slider id="acceleration" min={-5} max={5} step={0.1} value={[acceleration]} onValueChange={(v) => {setAcceleration(v[0]); handleReset();}} />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button onClick={handleToggleRun} className="flex-1">
                      {isRunning ? <Pause className="mr-2 h-4 w-4"/> : <Play className="mr-2 h-4 w-4"/>}
                      {isRunning ? "Pause" : (simulationTime >= MAX_SIMULATION_TIME - 0.01 ? "Restart" : "Play")}
                    </Button>
                    <Button onClick={handleReset} variant="outline"><RefreshCw className="mr-2 h-4 w-4"/>Reset</Button>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-xl">Calculated Values</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>Time (t): <span className="font-semibold">{simulationTime.toFixed(2)} s</span></p>
                  <p>Final Velocity (v): <span className="font-semibold">{finalVelocity.toFixed(2)} m/s</span></p>
                  <p>Displacement (s): <span className="font-semibold">{displacement.toFixed(2)} m</span></p>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-2 space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-lg">Visual Motion</CardTitle></CardHeader>
                <CardContent className="flex items-center justify-center p-2 h-[80px]">
                  <canvas ref={canvasRef} width={CANVAS_WIDTH} height={50} className="bg-muted rounded-md border"></canvas>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-lg">Graphs</CardTitle></CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[200px] w-full">
                    <LineChart data={history} margin={{ top: 5, right: 20, left: -20, bottom: 5 }} isAnimationActive={false}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" type="number" domain={[0, MAX_SIMULATION_TIME]} tickFormatter={(val) => val.toFixed(1) + 's'} />
                      <YAxis yAxisId="left" tickFormatter={(val) => val.toFixed(1)} allowDataOverflow={true} />
                      <YAxis yAxisId="right" orientation="right" tickFormatter={(val) => val.toFixed(1)} allowDataOverflow={true} />
                      <RechartsTooltip content={<ChartTooltipContent />} />
                      <Line yAxisId="left" type="monotone" dataKey="velocity" stroke={chartConfig.velocity.color} strokeWidth={2} dot={false} name="Velocity" isAnimationActive={false} />
                      <Line yAxisId="right" type="monotone" dataKey="displacement" stroke={chartConfig.displacement.color} strokeWidth={2} dot={false} name="Displacement" isAnimationActive={false}/>
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    