
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, HelpCircle, Play, Pause, Zap } from "lucide-react";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MAX_VOLTAGE_DISPLAY = 12; 
const TIME_STEPS_GRAPH = 200; // Number of points for drawing the full graph curve

export default function CapacitorRCCircuitPage() {
  const [resistance, setResistance] = useState(1000); 
  const [capacitance, setCapacitance] = useState(100e-6); 
  const [sourceVoltage, setSourceVoltage] = useState(10); 

  const [timeConstant, setTimeConstant] = useState(0);
  const [mode, setMode] = useState<'charging' | 'discharging'>('charging');
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0); // Simulation time

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const lastFrameTimeRef = useRef<number>(performance.now());


  const calculateTimeConstant = useCallback(() => {
    setTimeConstant(resistance * capacitance);
  }, [resistance, capacitance]);

  useEffect(() => {
    calculateTimeConstant();
  }, [calculateTimeConstant]);

  const drawGraph = useCallback((ctx: CanvasRenderingContext2D, currentSimElapsedTime: number) => {
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const padding = 30;
    const graphWidth = canvasWidth - padding * 1.5;
    const graphHeight = canvasHeight - padding * 1.5;
    const originX = padding;
    const originY = canvasHeight - padding;

    // Draw axes
    ctx.beginPath();
    ctx.moveTo(originX, padding / 2); ctx.lineTo(originX, originY); 
    ctx.lineTo(canvasWidth - padding / 2, originY);
    ctx.strokeStyle = "hsl(var(--muted-foreground))";
    ctx.stroke();

    // Y-axis labels (Voltage)
    ctx.fillStyle = "hsl(var(--muted-foreground))";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (let i = 0; i <= MAX_VOLTAGE_DISPLAY; i += MAX_VOLTAGE_DISPLAY / 4) {
      const yPos = originY - (i / MAX_VOLTAGE_DISPLAY) * graphHeight;
      ctx.fillText(i.toFixed(0) + "V", originX - 5, yPos);
    }

    // X-axis labels (Time)
    const maxTimeForGraph = Math.max(5 * timeConstant, 1, currentSimElapsedTime * 1.1, 0.1); // Ensure graph shows enough time, avoid 0
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    for (let i = 0; i <= 4; i++) {
        const t = (maxTimeForGraph / 4) * i;
        const xPos = originX + (t / maxTimeForGraph) * graphWidth;
        ctx.fillText(t.toFixed(Math.max(0, 2 - Math.floor(Math.log10(maxTimeForGraph/4||1)))) + "s", xPos, originY + 5);
    }
    // ctx.fillText("Time (s)", originX + graphWidth / 2, originY + padding/1.5);


    // Plot theoretical capacitor voltage curve
    ctx.beginPath();
    ctx.strokeStyle = "hsl(var(--primary))";
    ctx.lineWidth = 2;

    const V_initial_for_curve = (mode === 'discharging') ? sourceVoltage : 0;
    
    for (let i = 0; i <= TIME_STEPS_GRAPH; i++) {
      const t_plot = (maxTimeForGraph / TIME_STEPS_GRAPH) * i;
      let Vc_plot = 0;
      if (timeConstant > 0.000001) { // Check for non-zero time constant
        if (mode === 'charging') {
          Vc_plot = sourceVoltage * (1 - Math.exp(-t_plot / timeConstant));
        } else { 
          Vc_plot = V_initial_for_curve * Math.exp(-t_plot / timeConstant);
        }
      } else if (mode === 'charging') {
         Vc_plot = sourceVoltage; 
      } else {
         Vc_plot = 0; 
      }

      const x = originX + (t_plot / maxTimeForGraph) * graphWidth;
      const y = originY - (Vc_plot / MAX_VOLTAGE_DISPLAY) * graphHeight;
      
      if (i === 0) ctx.moveTo(x, Math.min(originY, Math.max(padding/2, y))); // Clamp to graph bounds
      else ctx.lineTo(x, Math.min(originY, Math.max(padding/2, y)));
    }
    ctx.stroke();

    // Current simulation point marker
    let Vc_current_sim = 0;
    if (timeConstant > 0.000001) {
        if (mode === 'charging') Vc_current_sim = sourceVoltage * (1 - Math.exp(-currentSimElapsedTime / timeConstant));
        else Vc_current_sim = sourceVoltage * Math.exp(-currentSimElapsedTime / timeConstant); // Assumes discharge from Vs
    } else if (mode === 'charging') Vc_current_sim = sourceVoltage;
    else Vc_current_sim = 0;

    const currentX = originX + (currentSimElapsedTime / maxTimeForGraph) * graphWidth;
    const currentY = originY - (Vc_current_sim / MAX_VOLTAGE_DISPLAY) * graphHeight;
    
    if (currentSimElapsedTime <= maxTimeForGraph && Vc_current_sim >=0 && Vc_current_sim <= MAX_VOLTAGE_DISPLAY + 0.1) { // allow slight overshoot for marker
        ctx.fillStyle = "hsl(var(--accent))";
        ctx.beginPath();
        ctx.arc(currentX, currentY, 5, 0, 2 * Math.PI);
        ctx.fill();
    }

  }, [sourceVoltage, timeConstant, mode]);

  const animate = useCallback((timestamp: number) => {
    if (!lastFrameTimeRef.current) { // Should be set before starting animation
        lastFrameTimeRef.current = timestamp;
    }
    const deltaTime = (timestamp - lastFrameTimeRef.current) / 1000; // seconds
    lastFrameTimeRef.current = timestamp;

    setElapsedTime(prevTime => {
        let newTime = prevTime + deltaTime;
        let shouldContinueRunning = isRunningRef.current;

        if (timeConstant > 0 && newTime >= 5 * timeConstant) {
            newTime = 5 * timeConstant; // Cap at 5 tau
            if(isRunningRef.current) setIsRunning(false); // Auto-stop
            shouldContinueRunning = false;
        }
         if (timeConstant <= 0 && newTime > 0.01) { // Instant charge/discharge done
            newTime = (mode === 'charging' && sourceVoltage > 0) ? 0.01 : 0; // show a brief moment or reset
            if(isRunningRef.current) setIsRunning(false);
            shouldContinueRunning = false;
        }


        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            drawGraph(ctx, newTime);
        }
        
        if (shouldContinueRunning) {
            requestRef.current = requestAnimationFrame(animate);
        }
        return newTime;
    });
  }, [drawGraph, timeConstant, mode, sourceVoltage]);
  
  const isRunningRef = useRef(isRunning);
  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  useEffect(() => {
    if (isRunning) {
      lastFrameTimeRef.current = performance.now(); // Reset for current animation segment
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      // Draw final state when paused explicitly
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
          drawGraph(ctx, elapsedTime);
      }
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isRunning, animate, drawGraph, elapsedTime]);

  // Initial draw and redraw on parameter changes when not running
  useEffect(() => {
    if (!isRunning) {
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            drawGraph(ctx, elapsedTime);
        }
    }
  }, [resistance, capacitance, sourceVoltage, mode, elapsedTime, isRunning, drawGraph, calculateTimeConstant]);


  const handleToggleRun = () => {
    if (!isRunning && timeConstant > 0 && elapsedTime >= 5 * timeConstant - 0.01) { // check with tolerance
        setElapsedTime(0); 
    } else if (!isRunning && timeConstant <=0 && elapsedTime > 0) {
        setElapsedTime(0);
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedTime(0);
    lastFrameTimeRef.current = 0;
    // useEffect will trigger redraw
  };

  const handleModeChange = (newMode: 'charging' | 'discharging') => {
    handleReset(); 
    setMode(newMode);
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
              <CardTitle className="text-3xl">Capacitor RC Circuit Simulator</CardTitle>
              <CardDescription>
                Visualize charging and discharging of a capacitor in an RC circuit.
              </CardDescription>
            </div>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="icon"><HelpCircle className="h-5 w-5"/></Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                   {/* ... (popover content unchanged) ... */}
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
                    <Label htmlFor="resistance">Resistance (R): {resistance} Ω</Label>
                    <Slider id="resistance" min={100} max={10000} step={100} value={[resistance]} onValueChange={(v) => {setResistance(v[0]); handleReset();}} />
                  </div>
                  <div>
                    <Label htmlFor="capacitance">Capacitance (C): {(capacitance * 1e6).toFixed(0)} µF</Label>
                    <Slider id="capacitance" min={10e-6} max={1000e-6} step={10e-6} value={[capacitance]} onValueChange={(v) => {setCapacitance(v[0]); handleReset();}} />
                  </div>
                  <div>
                    <Label htmlFor="sourceVoltage">Source Voltage (Vs): {sourceVoltage} V</Label>
                    <Slider id="sourceVoltage" min={1} max={MAX_VOLTAGE_DISPLAY} step={1} value={[sourceVoltage]} onValueChange={(v) => {setSourceVoltage(v[0]); handleReset();}} />
                  </div>
                  <div>
                    <Label htmlFor="mode-select">Mode</Label>
                    <Select value={mode} onValueChange={(v: 'charging' | 'discharging') => handleModeChange(v)}>
                        <SelectTrigger id="mode-select"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="charging">Charging</SelectItem>
                            <SelectItem value="discharging">Discharging</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button onClick={handleToggleRun} className="flex-1">
                      {isRunning ? <Pause className="mr-2 h-4 w-4"/> : <Play className="mr-2 h-4 w-4"/>}
                      {isRunning ? "Pause" : "Play"}
                    </Button>
                     <Button onClick={handleReset} variant="outline">Reset</Button>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-xl">Calculated Values</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>Time Constant (τ): <span className="font-semibold">{timeConstant.toFixed(3)} s</span></p>
                  <p>Elapsed Time (t): <span className="font-semibold">{elapsedTime.toFixed(2)} s</span></p>
                  <p>Vc (approx): <span className="font-semibold">
                    {
                      (mode === 'charging' ? sourceVoltage * (1 - Math.exp(-elapsedTime/Math.max(timeConstant, 1e-9))) : sourceVoltage * Math.exp(-elapsedTime/Math.max(timeConstant,1e-9))).toFixed(2)
                    } V
                    </span></p>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-2">
              <Card className="h-full">
                <CardHeader><CardTitle className="text-xl flex items-center gap-2"><Zap className="h-5 w-5 text-primary"/>Capacitor Voltage (Vc) vs. Time</CardTitle></CardHeader>
                <CardContent className="flex items-center justify-center p-2">
                  {/* Ensure canvas dimensions are explicitly set here or via props to avoid 0x0 */}
                  <canvas ref={canvasRef} width="400" height="250" className="bg-muted rounded-md border"></canvas>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
