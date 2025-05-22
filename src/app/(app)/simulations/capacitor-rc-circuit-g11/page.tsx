
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

const MAX_VOLTAGE_DISPLAY = 12; // Max voltage for graph y-axis
const TIME_STEPS = 100; // Number of points for graph

export default function CapacitorRCCircuitPage() {
  const [resistance, setResistance] = useState(1000); // Ohms
  const [capacitance, setCapacitance] = useState(100e-6); // Farads (100 uF)
  const [sourceVoltage, setSourceVoltage] = useState(10); // Volts

  const [timeConstant, setTimeConstant] = useState(0);
  const [mode, setMode] = useState<'charging' | 'discharging'>('charging');
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const startTimeRef = useRef<number>(0);

  const canvasWidth = 400;
  const canvasHeight = 250;

  const calculateTimeConstant = useCallback(() => {
    setTimeConstant(resistance * capacitance);
  }, [resistance, capacitance]);

  useEffect(() => {
    calculateTimeConstant();
  }, [calculateTimeConstant]);

  const drawGraph = useCallback((ctx: CanvasRenderingContext2D, currentElapsedTime: number) => {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw axes
    ctx.beginPath();
    ctx.moveTo(30, 10); ctx.lineTo(30, canvasHeight - 20); ctx.lineTo(canvasWidth - 10, canvasHeight - 20);
    ctx.strokeStyle = "hsl(var(--muted-foreground))";
    ctx.stroke();

    // Y-axis labels (Voltage)
    ctx.fillStyle = "hsl(var(--muted-foreground))";
    ctx.textAlign = "right";
    for (let i = 0; i <= MAX_VOLTAGE_DISPLAY; i += MAX_VOLTAGE_DISPLAY/4) {
      const y = canvasHeight - 20 - (i / MAX_VOLTAGE_DISPLAY) * (canvasHeight - 30);
      ctx.fillText(i.toFixed(0) + "V", 25, y + 3);
    }

    // X-axis labels (Time)
    const totalTimeForGraph = Math.max(5 * timeConstant, 1, currentElapsedTime * 1.2); // Ensure graph shows enough time
    ctx.textAlign = "center";
    for (let i = 0; i <= 4; i++) {
        const t = (totalTimeForGraph / 4) * i;
        const x = 30 + (t / totalTimeForGraph) * (canvasWidth - 40);
        ctx.fillText(t.toFixed(2) + "s", x, canvasHeight - 5);
    }
    ctx.fillText("Time (s)", canvasWidth / 2, canvasHeight + 5);


    // Plot capacitor voltage
    ctx.beginPath();
    ctx.strokeStyle = "hsl(var(--primary))";
    ctx.lineWidth = 2;

    let initialVoltage = 0;
    if (mode === 'discharging') {
      // Assume it was charged to sourceVoltage if discharging starts from a non-zero elapsed time or is reset.
      // For simplicity, if elapsedTime is 0 when switching to discharge, assume fully charged.
      initialVoltage = (elapsedTime === 0 || mode === 'discharging') ? sourceVoltage : 0;
    }


    for (let i = 0; i <= TIME_STEPS; i++) {
      const t = (currentElapsedTime / TIME_STEPS) * i; // Plot up to current elapsed time
      let Vc = 0;
      if (timeConstant > 0) {
        if (mode === 'charging') {
          Vc = sourceVoltage * (1 - Math.exp(-t / timeConstant));
        } else { // discharging
          Vc = initialVoltage * Math.exp(-t / timeConstant);
        }
      } else if (mode === 'charging') {
         Vc = sourceVoltage; // Instant charge if RC = 0
      } else {
         Vc = 0; // Instant discharge
      }


      const x = 30 + (t / totalTimeForGraph) * (canvasWidth - 40);
      const y = canvasHeight - 20 - (Vc / MAX_VOLTAGE_DISPLAY) * (canvasHeight - 30);
      
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Current point marker
    let Vc_current = 0;
    if (timeConstant > 0) {
        if (mode === 'charging') Vc_current = sourceVoltage * (1 - Math.exp(-currentElapsedTime / timeConstant));
        else Vc_current = initialVoltage * Math.exp(-currentElapsedTime / timeConstant);
    } else if (mode === 'charging') Vc_current = sourceVoltage;
    else Vc_current = 0;

    const currentX = 30 + (currentElapsedTime / totalTimeForGraph) * (canvasWidth - 40);
    const currentY = canvasHeight - 20 - (Vc_current / MAX_VOLTAGE_DISPLAY) * (canvasHeight - 30);
    ctx.fillStyle = "hsl(var(--accent))";
    ctx.beginPath();
    ctx.arc(currentX, currentY, 4, 0, 2 * Math.PI);
    ctx.fill();

  }, [sourceVoltage, timeConstant, mode]);

  const animate = (timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }
    const deltaTime = (timestamp - startTimeRef.current) / 1000; // seconds
    startTimeRef.current = timestamp;

    setElapsedTime(prevTime => {
        const newTime = prevTime + deltaTime;
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            drawGraph(ctx, newTime);
        }
        // Stop condition (e.g., after 5 time constants or max time)
        if (newTime >= 5 * timeConstant && timeConstant > 0) {
            setIsRunning(false);
            return 5 * timeConstant;
        }
        return newTime;
    });

    if (isRunning) { // Check isRunning inside to stop loop if it was set to false
        requestRef.current = requestAnimationFrame(animate);
    }
  };
  
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
        drawGraph(ctx, elapsedTime);
    }
  }, [drawGraph, elapsedTime]);


  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = performance.now();
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      // Draw final state when paused
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
          drawGraph(ctx, elapsedTime);
      }
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning]); // Keep drawGraph out of here or memoize it very carefully if included.

  const handleToggleRun = () => {
    if (!isRunning && ((mode === 'charging' && elapsedTime >= 5 * timeConstant && timeConstant > 0) || (mode === 'discharging' && elapsedTime >= 5 * timeConstant && timeConstant > 0))) {
        setElapsedTime(0); // Reset time if starting after full charge/discharge
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedTime(0);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      drawGraph(ctx, 0);
    }
  };

  const handleModeChange = (newMode: 'charging' | 'discharging') => {
    handleReset(); // Reset simulation when mode changes
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
                    <h4 className="font-medium leading-none mb-2">How to Use</h4>
                    <p className="text-sm text-muted-foreground">
                        - Adjust Resistance (R), Capacitance (C), and Source Voltage (Vs).
                        <br/>- Select Charging or Discharging mode.
                        <br/>- Press Play/Pause to run/pause. Reset to start over.
                        <br/>- The graph shows Capacitor Voltage (Vc) vs. Time.
                    </p>
                    <h4 className="font-medium leading-none mt-3 mb-1">Formulas:</h4>
                    <ul className="text-xs text-muted-foreground list-disc pl-4">
                        <li>Time Constant (τ): R * C</li>
                        <li>Charging Vc(t): Vs * (1 - e<sup>-t/τ</sup>)</li>
                        <li>Discharging Vc(t): V₀ * e<sup>-t/τ</sup></li>
                    </ul>
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
                    <Slider id="resistance" min={100} max={10000} step={100} value={[resistance]} onValueChange={(v) => setResistance(v[0])} />
                  </div>
                  <div>
                    <Label htmlFor="capacitance">Capacitance (C): {(capacitance * 1e6).toFixed(0)} µF</Label>
                    <Slider id="capacitance" min={10e-6} max={1000e-6} step={10e-6} value={[capacitance]} onValueChange={(v) => setCapacitance(v[0])} />
                  </div>
                  <div>
                    <Label htmlFor="sourceVoltage">Source Voltage (Vs): {sourceVoltage} V</Label>
                    <Slider id="sourceVoltage" min={1} max={MAX_VOLTAGE_DISPLAY} step={1} value={[sourceVoltage]} onValueChange={(v) => setSourceVoltage(v[0])} />
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
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-2">
              <Card className="h-full">
                <CardHeader><CardTitle className="text-xl flex items-center gap-2"><Zap className="h-5 w-5 text-primary"/>Capacitor Voltage (Vc) vs. Time</CardTitle></CardHeader>
                <CardContent className="flex items-center justify-center p-2">
                  <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight} className="bg-muted rounded-md border"></canvas>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
