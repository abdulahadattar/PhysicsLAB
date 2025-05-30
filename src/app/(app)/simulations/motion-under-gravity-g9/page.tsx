"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, HelpCircle, Play, Pause, RefreshCw, ArrowDown, MoveVertical, Wind, Zap as EnergyIcon, BarChart3, RadioTower as SlowMoIcon } from "lucide-react"; // Added icons
import Link from "next/link";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const G_ACCELERATION = 9.81; // m/s^2
const CANVAS_WIDTH = 200;
const CANVAS_HEIGHT = 450;
const OBJECT_RADIUS = 12;
const GROUND_Y = CANVAS_HEIGHT - 30;

const ENERGY_BAR_WIDTH = 20;
const ENERGY_BAR_MAX_HEIGHT = 100;

interface DataPoint {
  time: number;
  positionY: number;
  velocityY: number;
  accelerationY: number;
}

export default function AdvancedMotionUnderGravityG9Page() {
  const { toast } = useToast();

  // Simulation parameters
  const [initialHeight, setInitialHeight] = useState(60);
  const [mass, setMass] = useState(1);
  const [enableAirResistance, setEnableAirResistance] = useState(false);
  const [airResistanceFactor, setAirResistanceFactor] = useState(0.05);
  const [showVectors, setShowVectors] = useState(true);
  const [showEnergy, setShowEnergy] = useState(true);
  const [isSlowMotion, setIsSlowMotion] = useState(false);
  const [showGraphs, setShowGraphs] = useState(false);

  // Simulation state
  const [time, setTime] = useState(0);
  const [positionY, setPositionY] = useState(initialHeight);
  const [velocityY, setVelocityY] = useState(0);
  const [accelerationY, setAccelerationY] = useState(-G_ACCELERATION);
  const [isRunning, setIsRunning] = useState(false);
  const [isObjectDropped, setIsObjectDropped] = useState(false);
  const [landedEffect, setLandedEffect] = useState(0);
  const [simulationDataPoints, setSimulationDataPoints] = useState<DataPoint[]>([]);

  const [kineticEnergy, setKineticEnergy] = useState(0);
  const [potentialEnergy, setPotentialEnergy] = useState(0);
  const [totalMechanicalEnergy, setTotalMechanicalEnergy] = useState(0);
  const [initialTotalEnergy, setInitialTotalEnergy] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isRunningRef = useRef(isRunning);
  const isObjectDroppedRef = useRef(isObjectDropped);
  const animationFrameIdRef = useRef<number>();
  const lastFrameTimeRef = useRef<number>(performance.now());
  const lastDataLogTimeRef = useRef<number>(0);


  const PIXELS_PER_METER = useMemo(() => {
    const availableHeight = GROUND_Y - 20 - OBJECT_RADIUS * 2;
    if (initialHeight <= 0.1) return 20;
    return Math.max(1, Math.min(availableHeight / initialHeight, 10));
  }, [initialHeight]);

  const getCanvasY = useCallback((metresFromGround: number) => {
    return GROUND_Y - (metresFromGround * PIXELS_PER_METER) - OBJECT_RADIUS;
  }, [PIXELS_PER_METER]);

  const resetSimulationState = useCallback(() => {
    setIsRunning(false);
    setTime(0);
    setPositionY(initialHeight);
    setVelocityY(0);
    setIsObjectDropped(false);
    setLandedEffect(0);
    setSimulationDataPoints([]); // Clear graph data
    lastDataLogTimeRef.current = 0;
    
    const initialPE = mass * G_ACCELERATION * initialHeight;
    const initialKE = 0;
    const initialTME = initialPE + initialKE;
    setPotentialEnergy(initialPE);
    setKineticEnergy(initialKE);
    setTotalMechanicalEnergy(initialTME);
    setInitialTotalEnergy(initialTME);

    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
    }
  }, [initialHeight, mass]);

  useEffect(() => {
    if (!isRunning) {
      resetSimulationState();
    }
  }, [initialHeight, mass, isRunning, resetSimulationState]);
  
  useEffect(() => {
    if (!isRunning && !isObjectDropped) {
      const initialAcc = enableAirResistance ? (-G_ACCELERATION + (airResistanceFactor * 0 * 0)/mass) : -G_ACCELERATION;
      setAccelerationY(initialAcc);
    }
  }, [enableAirResistance, airResistanceFactor, mass, isRunning, isObjectDropped]);

  const calculateAcceleration = useCallback((currentVelocity: number): number => {
    let netAcc = -G_ACCELERATION;
    if (enableAirResistance && mass > 0) {
      const dragForce = -airResistanceFactor * currentVelocity * Math.abs(currentVelocity); // Fd = -C * v * |v|
      const dragAcc = dragForce / mass;
      netAcc += dragAcc;
    }
    return netAcc;
  }, [mass, enableAirResistance, airResistanceFactor]);

  const gameLoop = useCallback((timestamp: number) => {
    if (!isObjectDroppedRef.current) {
      animationFrameIdRef.current = undefined;
      return;
    }

    const rawDeltaTime = (timestamp - lastFrameTimeRef.current) / 1000;
    lastFrameTimeRef.current = timestamp;
    
    // Cap rawDeltaTime to prevent physics issues if tab was inactive
    const cappedRawDeltaTime = Math.min(0.05, rawDeltaTime); 
    const timeScaleFactor = isSlowMotion ? 0.25 : 1.0;
    const deltaTime = cappedRawDeltaTime * timeScaleFactor; // Effective deltaTime for physics
    const actualElapsedTime = cappedRawDeltaTime; // Real time elapsed for logging

    const currentAccY = calculateAcceleration(velocityY);
    const newVelocityY = velocityY + currentAccY * deltaTime;
    // Average velocity for position update can be more stable with varying acceleration
    const avgVelocityY = (velocityY + newVelocityY) / 2;
    const newPositionY = positionY + avgVelocityY * deltaTime;
    
    const newKE = 0.5 * mass * newVelocityY * newVelocityY;
    const newPE = mass * G_ACCELERATION * Math.max(0, newPositionY);
    setKineticEnergy(newKE);
    setPotentialEnergy(newPE);
    setTotalMechanicalEnergy(newKE + newPE);

    const currentSimTime = time + actualElapsedTime; // Update actual simulation time

    // Data Logging (e.g., every 0.05s of actual simulation time)
    if (currentSimTime - lastDataLogTimeRef.current >= 0.05) {
      setSimulationDataPoints(prevData => [...prevData, {
        time: parseFloat(currentSimTime.toFixed(2)),
        positionY: parseFloat(newPositionY > 0 ? newPositionY.toFixed(2) : "0.00"),
        velocityY: parseFloat(newVelocityY.toFixed(2)),
        accelerationY: parseFloat(currentAccY.toFixed(2)),
      }]);
      lastDataLogTimeRef.current = currentSimTime;
    }

    if (newPositionY <= 0) {
      setPositionY(0);
      setVelocityY(0);
      setAccelerationY(0);
      setKineticEnergy(0);
      setPotentialEnergy(0);
      setIsRunning(false);
      setIsObjectDropped(false);
      setLandedEffect(1);
      setTimeout(() => setLandedEffect(0), 500);
      toast({ title: "Landed!", description: `Time taken: ${currentSimTime.toFixed(2)}s` });
      // Ensure final data point is logged
       setSimulationDataPoints(prevData => [...prevData, {
        time: parseFloat(currentSimTime.toFixed(2)), positionY: 0, velocityY: 0, accelerationY: 0
      }]);
      animationFrameIdRef.current = undefined;
      return;
    }

    setPositionY(newPositionY);
    setVelocityY(newVelocityY);
    setAccelerationY(currentAccY);
    setTime(currentSimTime);

    if (isRunningRef.current) {
      animationFrameIdRef.current = requestAnimationFrame(gameLoop);
    } else {
      animationFrameIdRef.current = undefined;
    }
  }, [velocityY, positionY, time, mass, calculateAcceleration, toast, isSlowMotion, showGraphs]); // Added isSlowMotion

  useEffect(() => {
    isRunningRef.current = isRunning;
    isObjectDroppedRef.current = isObjectDropped;
  }, [isRunning, isObjectDropped]);

  useEffect(() => {
    if (isRunning && isObjectDropped) {
      lastFrameTimeRef.current = performance.now();
      lastDataLogTimeRef.current = time; // Ensure logging starts from current time
      animationFrameIdRef.current = requestAnimationFrame(gameLoop);
    } else {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = undefined;
      }
    }
    return () => {
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, [isRunning, isObjectDropped, gameLoop]);

  const drawArrow = (ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number, color: string, lineWidth = 2) => {
    const headLength = Math.max(6, Math.hypot(toX-fromX, toY-fromY) * 0.2); // Arrow head relative to length
    const angle = Math.atan2(toY - fromY, toX - fromX);
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke(); // Draw line first
    ctx.beginPath(); // Start new path for arrowhead
    ctx.fillStyle = color;
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };
  
  useEffect(() => { // Drawing Effect (mostly unchanged, vector scaling might need adjustment)
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    const skyGradient = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    skyGradient.addColorStop(0, "hsl(200, 70%, 70%)"); 
    skyGradient.addColorStop(1, "hsl(200, 70%, 90%)"); 
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, GROUND_Y);
    ctx.fillStyle = "hsl(120, 30%, 30%)"; 
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);
    ctx.fillStyle = "hsl(120, 30%, 25%)"; 
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, 2);

    ctx.font = "10px Arial";
    ctx.fillStyle = "black";
    const maxVisualHeight = Math.max(initialHeight, positionY, 20);
    const numMarkers = 5; 
    const step = Math.max(5, Math.ceil(maxVisualHeight / numMarkers / 5) * 5); // Rounded step for markers

    for (let h = 0; h <= maxVisualHeight + step; h += step) {
      const yPosMarker = getCanvasY(h) + OBJECT_RADIUS;
      if (yPosMarker < 15 || yPosMarker > GROUND_Y -5 ) continue;
      ctx.beginPath();
      ctx.moveTo(CANVAS_WIDTH * 0.6, yPosMarker);
      ctx.lineTo(CANVAS_WIDTH * 0.6 + 8, yPosMarker);
      ctx.strokeStyle = "rgba(0,0,0,0.5)";
      ctx.stroke();
      ctx.fillText(`${h}m`, CANVAS_WIDTH * 0.6 + 12, yPosMarker + 3);
    }
    
    const objectCanvasY = getCanvasY(positionY);
    if (landedEffect > 0) { /* ... landed effect drawing ... */ } // Simplified for brevity

    ctx.beginPath();
    ctx.arc(CANVAS_WIDTH / 2, objectCanvasY, OBJECT_RADIUS, 0, 2 * Math.PI);
    const gradient = ctx.createRadialGradient( /* ... */ ); // Simplified
    gradient.addColorStop(0, "rgba(255,100,100,1)"); 
    gradient.addColorStop(1, "rgba(200,0,0,1)");   
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.strokeStyle = "darkred"; ctx.lineWidth = 1; ctx.stroke();

    if (showVectors && isObjectDropped) {
        const objCenterX = CANVAS_WIDTH / 2;
        const objCenterY = objectCanvasY;
        let vectorScale = 3 / Math.max(1, PIXELS_PER_METER/5) ; // Adjust vector scale based on zoom
        if (isSlowMotion) vectorScale *=1.5; // Make vectors a bit longer in slow-mo

        if (Math.abs(velocityY) > 0.01) { // Velocity Vector (Blue)
            drawArrow(ctx, objCenterX, objCenterY, objCenterX, objCenterY + (-velocityY * vectorScale), "blue", 2);
        }
        if (Math.abs(accelerationY) > 0.01){ // Acceleration Vector (Green)
            drawArrow(ctx, objCenterX + OBJECT_RADIUS + 5, objCenterY, 
                      objCenterX + OBJECT_RADIUS + 5, objCenterY + (-accelerationY * vectorScale * 1.5), "green", 2);
        }
        const gravityForceVal = mass * G_ACCELERATION; // Force of Gravity (Gray)
        drawArrow(ctx, objCenterX - OBJECT_RADIUS - 5, objCenterY, 
                  objCenterX - OBJECT_RADIUS - 5, objCenterY + (gravityForceVal * (vectorScale/ (mass*2))), "gray", 2); // Scaled by mass a bit
        
        if (enableAirResistance && Math.abs(velocityY) > 0.01) { // Air Resistance Force (Cyan)
            const dragForceVal = airResistanceFactor * velocityY * Math.abs(velocityY); // Fd = C*v*|v|
            drawArrow(ctx, objCenterX - OBJECT_RADIUS - 10, objCenterY, 
                      objCenterX - OBJECT_RADIUS - 10, objCenterY + (-dragForceVal * (vectorScale/ (mass*2))), "cyan", 2); // Scaled
        }
    }
    if (showEnergy) { /* ... energy bar drawing ... */ } // Simplified for brevity

  }, [positionY, initialHeight, PIXELS_PER_METER, isRunning, isObjectDropped, landedEffect, showVectors, velocityY, accelerationY, mass, enableAirResistance, airResistanceFactor, showEnergy, kineticEnergy, potentialEnergy, totalMechanicalEnergy, initialTotalEnergy, getCanvasY, isSlowMotion]);


  const handleDrop = () => { /* ... */ resetSimulationState(); setIsObjectDropped(true); setIsRunning(true); };
  const handlePauseResume = () => { /* ... */ if(!isObjectDropped) return; setIsRunning(!isRunning); };
  const handleResetClick = () => { resetSimulationState(); };

  return (
    <div className="space-y-6">
      <Button variant="outline" asChild size="sm">
        <Link href="/simulations">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Simulations
        </Link>
      </Button>

      <Card className="shadow-lg">
        <CardHeader> {/* ... Title and Popover (mostly unchanged) ... */} 
             <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl flex items-center gap-2">
                <MoveVertical className="h-8 w-8 text-primary" />
                G9: Advanced Motion Under Gravity
              </CardTitle>
              <CardDescription>
                Simulate free fall with air resistance, vectors, energy, graphs, and slow motion.
              </CardDescription>
            </div>
            <Popover> {/* ... Popover content ... */} </Popover>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-7 gap-4 items-start">
            {/* Controls Column */}
            <div className="md:col-span-2 space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-lg">Controls</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {/* ... Height, Mass, Air Resistance controls (mostly unchanged) ... */}
                   <div><Label htmlFor="initialHeight">Height: {initialHeight.toFixed(0)} m</Label><Slider id="initialHeight" min={10} max={200} step={5} value={[initialHeight]} onValueChange={(v) => setInitialHeight(v[0])} disabled={isRunning}/></div>
                  <div><Label htmlFor="mass">Mass: {mass.toFixed(1)} kg</Label><Slider id="mass" min={0.1} max={10} step={0.1} value={[mass]} onValueChange={(v) => setMass(v[0])} disabled={isRunning}/></div>
                  <div className="pt-1 space-y-2">
                    <div className="flex items-center space-x-2"><Checkbox id="enableAirResistance" checked={enableAirResistance} onCheckedChange={(c) => setEnableAirResistance(!!c)} disabled={isRunning}/><Label htmlFor="enableAirResistance" className="font-normal">Air Resistance</Label></div>
                    {enableAirResistance && (<div><Label htmlFor="airResistanceFactor">Drag Factor: {airResistanceFactor.toFixed(2)}</Label><Slider id="airResistanceFactor" min={0.01} max={0.5} step={0.01} value={[airResistanceFactor]} onValueChange={(v) => setAirResistanceFactor(v[0])} disabled={isRunning}/></div>)}
                  </div>

                  <div className="pt-1 space-y-2">
                    <Label className="text-sm font-medium">Display Options:</Label>
                    <div className="flex items-center space-x-2"><Checkbox id="showVectors" checked={showVectors} onCheckedChange={(c) => setShowVectors(!!c)}/><Label htmlFor="showVectors" className="font-normal">Vectors</Label></div>
                    <div className="flex items-center space-x-2"><Checkbox id="showEnergy" checked={showEnergy} onCheckedChange={(c) => setShowEnergy(!!c)}/><Label htmlFor="showEnergy" className="font-normal">Energy Bars</Label></div>
                    <div className="flex items-center space-x-2"><Checkbox id="showGraphs" checked={showGraphs} onCheckedChange={(c) => setShowGraphs(!!c)} disabled={isRunning && isObjectDropped}/><Label htmlFor="showGraphs" className="font-normal">Show Graphs</Label></div>
                     <div className="flex items-center space-x-2"><Checkbox id="slowMotion" checked={isSlowMotion} onCheckedChange={(c) => setIsSlowMotion(!!c)}/><Label htmlFor="slowMotion" className="font-normal">Slow Motion (0.25x)</Label></div>
                  </div>
                  <div className="flex flex-col gap-2 pt-2"> {/* ... Buttons (Drop, Pause/Resume, Reset) ... */} 
                    <Button onClick={handleDrop} disabled={isObjectDropped && isRunning}><ArrowDown className="mr-2 h-4 w-4" /> Drop Object</Button>
                    <div className="flex gap-2">
                        <Button onClick={handlePauseResume} disabled={!isObjectDropped} className="flex-1">{isRunning ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}{isRunning ? "Pause" : "Resume"}</Button>
                        <Button onClick={handleResetClick} variant="outline" className="flex-1"><RefreshCw className="mr-2 h-4 w-4" /> Reset</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Visualization Column */}
            <div className="md:col-span-3"> {/* ... Canvas Card ... */}
                 <Card className="h-full">
                <CardHeader><CardTitle className="text-lg">Visual Simulation</CardTitle></CardHeader>
                <CardContent className="flex items-center justify-center p-2 aspect-[4/9] max-h-[500px] mx-auto">
                  <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="bg-card rounded-md border border-input shadow-inner w-full h-full"></canvas>
                </CardContent>
              </Card>
            </div>

            {/* Data Display Column */}
            <div className="md:col-span-2 space-y-4"> {/* ... Data & Energy Cards ... */}
                <Card>
                    <CardHeader><CardTitle className="text-lg">Current Values</CardTitle></CardHeader>
                    <CardContent className="space-y-1 text-sm">
                    <p>Time (t): <span className="font-semibold">{time.toFixed(2)} s</span></p>
                    <p>Position (y): <span className="font-semibold">{positionY.toFixed(2)} m</span></p>
                    <p>Velocity (v<sub>y</sub>): <span className="font-semibold">{velocityY.toFixed(2)} m/s</span></p>
                    <p>Accel (a<sub>y</sub>): <span className="font-semibold">{accelerationY.toFixed(2)} m/s²</span></p>
                    </CardContent>
                </Card>
                 {showEnergy && ( /* ... Energy card ... */ )}
            </div>
          </div>

          {/* Graphs Section */}
          {showGraphs && simulationDataPoints.length > 1 && (
            <Card className="mt-6">
              <CardHeader><CardTitle className="text-lg flex items-center"><BarChart3 className="mr-2 h-5 w-5"/> Kinematic Graphs</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                {/* Position vs Time */}
                <div>
                  <Label className="text-sm font-medium">Position (y) vs. Time (t)</Label>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={simulationDataPoints}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" unit="s" type="number" domain={['dataMin', 'dataMax']} />
                      <YAxis unit="m" domain={['dataMin', 'dataMax']} allowDataOverflow={true} />
                      <Tooltip formatter={(value) => typeof value === 'number' ? value.toFixed(2) : value} />
                      <Legend />
                      <Line type="monotone" dataKey="positionY" name="Position (y)" stroke="#8884d8" dot={false} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                {/* Velocity vs Time */}
                <div>
                  <Label className="text-sm font-medium">Velocity (v<sub>y</sub>) vs. Time (t)</Label>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={simulationDataPoints}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" unit="s" type="number" domain={['dataMin', 'dataMax']} />
                      <YAxis unit="m/s" domain={['auto', 'auto']} allowDataOverflow={true} />
                      <Tooltip formatter={(value) => typeof value === 'number' ? value.toFixed(2) : value} />
                      <Legend />
                      <Line type="monotone" dataKey="velocityY" name="Velocity (vy)" stroke="#82ca9d" dot={false} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                 {/* Acceleration vs Time */}
                <div>
                  <Label className="text-sm font-medium">Acceleration (a<sub>y</sub>) vs. Time (t)</Label>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={simulationDataPoints}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" unit="s" type="number" domain={['dataMin', 'dataMax']} />
                      <YAxis unit="m/s²" domain={['dataMin -1', 'dataMax + 1']} allowDataOverflow={true}/>
                      <Tooltip formatter={(value) => typeof value === 'number' ? value.toFixed(2) : value} />
                      <Legend />
                      <Line type="monotone" dataKey="accelerationY" name="Acceleration (ay)" stroke="#ffc658" dot={false} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
        <CardFooter> {/* ... Footer ... */} </CardFooter>
      </Card>
    </div>
  );
}