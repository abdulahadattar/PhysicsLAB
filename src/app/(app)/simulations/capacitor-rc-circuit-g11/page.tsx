/**
 * @fileOverview Capacitor RC Circuit Simulation Page (Grade 11).
 * This component allows users to simulate the charging and discharging
 * of a capacitor in an RC circuit. Users can adjust resistance, capacitance,
 * and source voltage, and observe the voltage across the capacitor over time
 * via an animated graph.
 */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, HelpCircle, Play, Pause, RefreshCw, Zap } from "lucide-react"; // Added RefreshCw
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Constants
const MAX_VOLTAGE_DISPLAY = 12; // Max voltage for y-axis of the graph
const TIME_STEPS_GRAPH = 200; // Number of points for drawing the full theoretical graph curve

/**
 * Main component for the Capacitor RC Circuit simulation.
 */
export default function CapacitorRCCircuitPage() {
  // State for circuit parameters
  const [resistance, setResistance] = useState(1000); // Ohms
  const [capacitance, setCapacitance] = useState(100e-6); // Farads (100 µF)
  const [sourceVoltage, setSourceVoltage] = useState(10); // Volts 

  // State for calculated and simulation values
  const [timeConstant, setTimeConstant] = useState(0); // Tau = R * C
  const [mode, setMode] = useState<'charging' | 'discharging'>('charging'); // Simulation mode
  const [isRunning, setIsRunning] = useState(false); // Is the animation playing?
  const [elapsedTime, setElapsedTime] = useState(0); // Current simulation time in seconds

  // Refs for animation and canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(); // Stores the requestAnimationFrame ID
  const lastFrameTimeRef = useRef<number>(performance.now()); // Timestamp of the last animation frame

  /**
   * Calculates the time constant (τ = RC) of the circuit.
   * Memoized with useCallback.
   */
  const calculateTimeConstant = useCallback(() => {
    setTimeConstant(resistance * capacitance);
  }, [resistance, capacitance]);

  // Effect to recalculate time constant when R or C changes
  useEffect(() => {
    calculateTimeConstant();
  }, [calculateTimeConstant]); // Dependency: calculateTimeConstant (which depends on R and C)

  /**
   * Draws the capacitor voltage vs. time graph on the canvas.
   * @param ctx - The 2D rendering context of the canvas.
   * @param currentSimElapsedTime - The current elapsed time in the simulation.
   */
  const drawGraph = useCallback((ctx: CanvasRenderingContext2D, currentSimElapsedTime: number) => {
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Graph padding and dimensions
    const padding = 30;
    const graphWidth = canvasWidth - padding * 1.5;
    const graphHeight = canvasHeight - padding * 1.5;
    const originX = padding;
    const originY = canvasHeight - padding; // Y-axis origin at bottom-left

    // --- Draw Axes ---
    ctx.beginPath();
    ctx.moveTo(originX, padding / 2); ctx.lineTo(originX, originY); // Y-axis
    ctx.lineTo(canvasWidth - padding / 2, originY); // X-axis
    ctx.strokeStyle = "hsl(var(--muted-foreground))";
    ctx.stroke();

    // --- Y-axis labels (Voltage) ---
    ctx.fillStyle = "hsl(var(--muted-foreground))";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (let i = 0; i <= MAX_VOLTAGE_DISPLAY; i += MAX_VOLTAGE_DISPLAY / 4) {
      const yPos = originY - (i / MAX_VOLTAGE_DISPLAY) * graphHeight;
      ctx.fillText(i.toFixed(0) + "V", originX - 5, yPos);
    }

    // --- X-axis labels (Time) ---
    // Determine max time for graph display: ensure it shows at least 5*tau or current elapsed time
    const maxTimeVisibleOnGraph = Math.max(5 * timeConstant, 1, currentSimElapsedTime * 1.1, 0.1); 
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    for (let i = 0; i <= 4; i++) {
        const t_label = (maxTimeVisibleOnGraph / 4) * i;
        const xPos = originX + (t_label / maxTimeVisibleOnGraph) * graphWidth;
        // Format time labels to be readable (e.g., "0.5s", "1.00s")
        const precision = Math.max(0, 2 - Math.floor(Math.log10(Math.max(1e-3,maxTimeVisibleOnGraph/4))));
        ctx.fillText(t_label.toFixed(precision) + "s", xPos, originY + 5);
    }
    // ctx.fillText("Time (s)", originX + graphWidth / 2, originY + padding/1.5); // Optional axis title

    // --- Plot theoretical capacitor voltage curve ---
    ctx.beginPath();
    ctx.strokeStyle = "hsl(var(--primary))";
    ctx.lineWidth = 2;

    // V_initial_for_curve depends on whether we are discharging from a fully charged state (Vs)
    // or charging from 0 (or discharging from a partially charged state, not modeled here for simplicity).
    const V_initial_for_discharging_curve = sourceVoltage; 
    
    for (let i = 0; i <= TIME_STEPS_GRAPH; i++) {
      const t_plot = (maxTimeVisibleOnGraph / TIME_STEPS_GRAPH) * i; // Time point for plotting
      let Vc_plot = 0; // Capacitor voltage at t_plot

      if (timeConstant > 1e-9) { // Avoid division by zero for very small/zero time constant
        if (mode === 'charging') {
          Vc_plot = sourceVoltage * (1 - Math.exp(-t_plot / timeConstant));
        } else { // discharging
          Vc_plot = V_initial_for_discharging_curve * Math.exp(-t_plot / timeConstant);
        }
      } else if (mode === 'charging' && sourceVoltage > 0) { // Instant charge if TC is negligible
         Vc_plot = sourceVoltage; 
      } else { // Instant discharge or zero voltage
         Vc_plot = 0; 
      }

      const x_canvas = originX + (t_plot / maxTimeVisibleOnGraph) * graphWidth;
      const y_canvas = originY - (Vc_plot / MAX_VOLTAGE_DISPLAY) * graphHeight;
      
      // Clamp y_canvas to graph boundaries to prevent drawing outside
      const clamped_y_canvas = Math.min(originY, Math.max(padding / 2, y_canvas));

      if (i === 0) ctx.moveTo(x_canvas, clamped_y_canvas);
      else ctx.lineTo(x_canvas, clamped_y_canvas);
    }
    ctx.stroke();

    // --- Current simulation point marker ---
    let Vc_current_sim = 0; // Capacitor voltage at currentSimElapsedTime
    if (timeConstant > 1e-9) {
        if (mode === 'charging') Vc_current_sim = sourceVoltage * (1 - Math.exp(-currentSimElapsedTime / timeConstant));
        else Vc_current_sim = V_initial_for_discharging_curve * Math.exp(-currentSimElapsedTime / timeConstant);
    } else if (mode === 'charging' && sourceVoltage > 0) Vc_current_sim = sourceVoltage;
    else Vc_current_sim = 0;

    const currentX_canvas = originX + (currentSimElapsedTime / maxTimeVisibleOnGraph) * graphWidth;
    const currentY_canvas = originY - (Vc_current_sim / MAX_VOLTAGE_DISPLAY) * graphHeight;
    
    // Draw marker only if it's within reasonable bounds of the graph display
    if (currentSimElapsedTime <= maxTimeVisibleOnGraph && Vc_current_sim >=0 && Vc_current_sim <= MAX_VOLTAGE_DISPLAY + 0.1) {
        ctx.fillStyle = "hsl(var(--accent))"; // Use accent color for the marker
        ctx.beginPath();
        ctx.arc(currentX_canvas, currentY_canvas, 5, 0, 2 * Math.PI); // Draw a circle marker
        ctx.fill();
    }

  }, [sourceVoltage, timeConstant, mode]); // Dependencies for redrawing the graph structure

  /**
   * Animation loop function called by requestAnimationFrame.
   * Updates elapsed time and triggers redraw of the graph.
   */
  const animate = useCallback((timestamp: number) => {
    if (!lastFrameTimeRef.current) { 
        lastFrameTimeRef.current = timestamp; // Initialize on first call for this animation segment
    }
    const deltaTime = (timestamp - lastFrameTimeRef.current) / 1000; // Delta time in seconds
    lastFrameTimeRef.current = timestamp;

    setElapsedTime(prevTime => {
        let newTime = prevTime + deltaTime;
        let shouldContinueRunning = isRunningRef.current; // Check current running state via ref

        // Auto-stop conditions
        if (timeConstant > 0 && newTime >= 5 * timeConstant) { // Stop after 5 time constants
            newTime = 5 * timeConstant;
            if(isRunningRef.current) setIsRunning(false); // Update state to stop if it was running
            shouldContinueRunning = false;
        }
         if (timeConstant <= 1e-9 && newTime > 0.02) { // Stop quickly for (near) instant charge/discharge
            newTime = (mode === 'charging' && sourceVoltage > 0 && timeConstant <= 1e-9) ? 0.02 : 0; 
            if(isRunningRef.current) setIsRunning(false);
            shouldContinueRunning = false;
        }

        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            drawGraph(ctx, newTime); // Redraw graph with the new elapsed time
        }
        
        if (shouldContinueRunning) { // If still supposed to be running, request next frame
            requestRef.current = requestAnimationFrame(animate);
        }
        return newTime; // Update state for elapsedTime
    });
  }, [drawGraph, timeConstant, mode, sourceVoltage]); // Dependencies for the animation logic
  
  const isRunningRef = useRef(isRunning); // Ref to hold current isRunning status for use inside rAF
  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  // Effect to manage the animation loop (start/stop)
  useEffect(() => {
    if (isRunning) {
      lastFrameTimeRef.current = performance.now(); // Reset for accurate deltaTime when starting/resuming
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      // Draw final state when paused explicitly or when simulation auto-stops
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
          drawGraph(ctx, elapsedTime);
      }
    }
    return () => { // Cleanup: cancel animation frame
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isRunning, animate, drawGraph, elapsedTime]); // Dependencies to restart/stop animation

  // Effect for initial draw and redrawing if parameters change while simulation is paused.
  useEffect(() => {
    if (!isRunning) { // Only redraw if paused and parameters change
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            drawGraph(ctx, elapsedTime); // Use current elapsedTime for paused state
        }
    }
  // This effect ensures that if parameters (R, C, Vs, mode) change while paused, the graph updates.
  // elapsedTime is included so if it's manually reset, it redraws.
  }, [resistance, capacitance, sourceVoltage, mode, elapsedTime, isRunning, drawGraph, calculateTimeConstant]);


  /**
   * Toggles the play/pause state of the simulation.
   * If simulation had completed (5*tau), it resets time before playing again.
   */
  const handleToggleRun = () => {
    if (!isRunning && timeConstant > 0 && elapsedTime >= 5 * timeConstant - 0.01) { // Tolerance for float comparison
        setElapsedTime(0); // Reset time if restarting a completed simulation
    } else if (!isRunning && timeConstant <= 1e-9 && elapsedTime > 0) { // Reset for instant charge/discharge
        setElapsedTime(0);
    }
    setIsRunning(!isRunning);
  };

  /**
   * Resets the simulation: stops animation, resets elapsed time, and redraws initial state.
   */
  const handleReset = () => {
    setIsRunning(false);
    setElapsedTime(0);
    lastFrameTimeRef.current = 0; // Important to reset for next play
    // The useEffect for parameter changes will trigger a redraw with elapsedTime = 0.
  };

  /**
   * Handles change in simulation mode (charging/discharging).
   * Resets the simulation before switching mode.
   * @param newMode - The new mode to switch to.
   */
  const handleModeChange = (newMode: 'charging' | 'discharging') => {
    handleReset(); // Reset simulation before changing mode
    setMode(newMode);
  };

  // Calculate current Vc for display
  const Vc_display = (mode === 'charging' ? sourceVoltage * (1 - Math.exp(-elapsedTime/Math.max(timeConstant, 1e-9))) : sourceVoltage * Math.exp(-elapsedTime/Math.max(timeConstant,1e-9)));


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
                Grade 11 - Visualize charging and discharging of a capacitor in an RC circuit.
              </CardDescription>
            </div>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="icon"><HelpCircle className="h-5 w-5"/></Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 text-sm">
                   <h4 className="font-medium leading-none mb-2">How to Use</h4>
                    <p className="text-muted-foreground">
                        - Adjust Resistance (R), Capacitance (C), and Source Voltage (Vs).
                        <br/>- Select Charging or Discharging mode.
                        <br/>- Press Play/Pause to run or pause the animation. The graph shows capacitor voltage (Vc) over time.
                        <br/>- Reset sets time to 0 and redraws.
                    </p>
                    <h4 className="font-medium leading-none mt-3 mb-1">Key Formulas:</h4>
                     <ul className="text-xs text-muted-foreground list-disc pl-4">
                        <li>Time Constant (τ): R &times; C</li>
                        <li>Charging Vc(t): Vs &middot; (1 - e<sup>-t/τ</sup>)</li>
                        <li>Discharging Vc(t): Vs &middot; e<sup>-t/τ</sup></li>
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
                <CardHeader><CardTitle className="text-xl">Controls</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="resistance">Resistance (R): {resistance} Ω</Label>
                    {/* Set a sensible step for resistance, e.g., 100 Ohms */}
                    <Slider id="resistance" min={100} max={10000} step={100} value={[resistance]} onValueChange={(v) => {setResistance(v[0]); handleReset();}} />
                  </div>
                  <div>
                    <Label htmlFor="capacitance">Capacitance (C): {(capacitance * 1e6).toFixed(0)} µF</Label>
                    {/* Step for capacitance, e.g., 10 µF */}
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
                      {isRunning ? "Pause" : ( (timeConstant > 0 && elapsedTime >= 5 * timeConstant - 0.01) || (timeConstant <= 1e-9 && elapsedTime > 0) ? "Restart" : "Play")}
                    </Button>
                     <Button onClick={handleReset} variant="outline"><RefreshCw className="mr-2 h-4 w-4"/>Reset</Button>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-xl">Calculated Values</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>Time Constant (τ): <span className="font-semibold">{timeConstant > 0 ? timeConstant.toFixed(3) : "N/A"} s</span></p>
                  <p>Elapsed Time (t): <span className="font-semibold">{elapsedTime.toFixed(2)} s</span></p>
                  <p>Vc (approx): <span className="font-semibold">{Vc_display.toFixed(2)} V</span></p>
                </CardContent>
              </Card>
            </div>

            {/* Visualization Column */}
            <div className="md:col-span-2">
              <Card className="h-full">
                <CardHeader><CardTitle className="text-xl flex items-center gap-2"><Zap className="h-5 w-5 text-primary"/>Capacitor Voltage (Vc) vs. Time</CardTitle></CardHeader>
                <CardContent className="flex items-center justify-center p-2">
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
