
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, HelpCircle, Thermometer, Wind, BarChart2 } from "lucide-react";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LabelList } from 'recharts';


const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 300;
const NUM_PARTICLES = 50;
const PARTICLE_RADIUS = 5; // Slightly larger for better visibility

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  initialX?: number;
  initialY?: number;
  colorStops?: { offset: number; color: string }[];
}

type MatterState = "solid" | "liquid" | "gas";
type PredictedState = "Solid" | "Liquid" | "Gas" | "Supercritical Fluid" | "Melting" | "Boiling" | "Condensing" | "Freezing" | "Sublimating" | "Depositing";

interface PVDataPoint {
  volume: number;
  pressure: number;
}

export default function StatesOfMatterPage() {
  const [matterState, setMatterState] = useState<MatterState>("solid");
  const [temperatureFactor, setTemperatureFactor] = useState(0.3); // 0 to 1
  const [pressureFactor, setPressureFactor] = useState(0.3); // 0 to 1
  const [particles, setParticles] = useState<Particle[]>([]);
  const [predictedStateText, setPredictedStateText] = useState<PredictedState>("Solid");
  const [triplePointHint, setTriplePointHint] = useState<string | null>(null);
  const [pvData, setPvData] = useState<PVDataPoint[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();

  const getPredictedState = useCallback((temp: number, pres: number): PredictedState => {
    // Simplified thresholds for conceptual prediction
    if (temp < 0.25) { // Low temp
      if (pres > 0.4) return "Solid";
      return "Solid"; // Default to solid at very low temp
    } else if (temp < 0.65) { // Medium temp
      if (pres > 0.75) return "Liquid"; // High pressure can keep it liquid
      if (pres < 0.25) return "Gas"; // Low pressure allows gas
      if (temp > 0.4 && temp < 0.55 && pres > 0.4 && pres < 0.6) return "Liquid"; // "Triple point like" region
      return "Liquid"; // Default to liquid
    } else { // High temp
      if (pres > 0.8 && temp < 0.8) return "Supercritical Fluid"; // Conceptual
      return "Gas";
    }
  }, []);
  
  const getParticleColorStops = useCallback((baseHue: number, tempFactor: number, state: MatterState) => {
    let saturation = 70;
    let lightness = 60;
    let alpha1 = 0.9;
    let alpha2 = 0.3;

    if (state === "gas") {
        const tempEffect = Math.min(1, tempFactor * 1.5); // More pronounced effect for gas
        baseHue = 20 + tempEffect * 40; // Shift from blueish (cold gas) to orange/red (hot gas)
        saturation = 80 + tempEffect * 20;
        lightness = 50 + tempEffect * 15;
        alpha1 = 0.7 + tempEffect * 0.2;
        alpha2 = 0.1 + tempEffect * 0.2;
    } else if (state === "liquid") {
        baseHue = 200; // Consistent blue for liquid
        saturation = 70 + tempFactor * 10;
        lightness = 55 + tempFactor * 5;
    } else { // Solid
        baseHue = 280; // Consistent purple/magenta for solid
        saturation = 60 + tempFactor * 10;
        lightness = 50 + tempFactor * 5;
    }
    
    return [
        { offset: 0, color: `hsla(${baseHue}, ${saturation}%, ${lightness}%, ${alpha1})` },
        { offset: 1, color: `hsla(${baseHue}, ${saturation}%, ${Math.max(20, lightness - 20)}%, ${alpha2})` }
    ];
  }, []);


  const initializeParticles = useCallback(() => {
    const newParticles: Particle[] = [];
    const particlePadding = PARTICLE_RADIUS * 2.5;
    const baseHue = matterState === "solid" ? 280 : matterState === "liquid" ? 200 : 30;

    for (let i = 0; i < NUM_PARTICLES; i++) {
      let p: Partial<Particle> = { 
        id: i,
        colorStops: getParticleColorStops(baseHue, temperatureFactor, matterState)
      };
      if (matterState === "solid") {
        const numCols = Math.floor(Math.sqrt(NUM_PARTICLES * (CANVAS_WIDTH / (particlePadding * 1.5)) / (CANVAS_HEIGHT / (particlePadding*1.5)))) || 5;
        const numRows = Math.ceil(NUM_PARTICLES / numCols);
        const spacingX = (CANVAS_WIDTH - 2 * particlePadding) / Math.max(1, numCols -1 + (numCols > 1 ? 1 : 0) );
        const spacingY = (CANVAS_HEIGHT - 2 * particlePadding) / Math.max(1, numRows -1 + (numRows > 1 ? 1 : 0));
        
        const col = i % numCols;
        const row = Math.floor(i / numCols);

        p.initialX = particlePadding + col * spacingX;
        p.initialY = particlePadding + row * spacingY;
        p.x = p.initialX;
        p.y = p.initialY;
        p.vx = (Math.random() - 0.5) * 0.1; // Tiny initial kick
        p.vy = (Math.random() - 0.5) * 0.1;
      } else if (matterState === "liquid") {
        p.x = Math.random() * (CANVAS_WIDTH - PARTICLE_RADIUS * 4) + PARTICLE_RADIUS * 2;
        p.y = CANVAS_HEIGHT * 0.6 + Math.random() * (CANVAS_HEIGHT * 0.4 - PARTICLE_RADIUS * 2); // Start lower
        const angle = Math.random() * 2 * Math.PI;
        const speed = 0.1 + Math.random() * 0.2; 
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
      } else { // Gas
        p.x = Math.random() * (CANVAS_WIDTH - PARTICLE_RADIUS * 2) + PARTICLE_RADIUS;
        p.y = Math.random() * (CANVAS_HEIGHT - PARTICLE_RADIUS * 2) + PARTICLE_RADIUS;
        const angle = Math.random() * 2 * Math.PI;
        let speed = 0.8 + Math.random() * 0.8;
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
      }
      newParticles.push(p as Particle);
    }
    setParticles(newParticles);
  }, [matterState, temperatureFactor, getParticleColorStops]);

  useEffect(() => {
    initializeParticles();
  }, [initializeParticles]);

  const updateParticles = useCallback(() => {
    const tempEffect = 0.1 + temperatureFactor * 2.5; 

    let centerX = 0, centerY = 0;
    if (matterState === 'liquid' && particles.length > 0) {
        particles.forEach(p => { centerX += p.x; centerY += p.y; });
        centerX /= particles.length;
        centerY /= particles.length;
    }

    setParticles(prevParticles =>
      prevParticles.map(p => {
        let { x, y, vx, vy } = p; 
        let ax = 0, ay = 0;   
        
        const newColorStops = getParticleColorStops(
            matterState === "solid" ? 280 : matterState === "liquid" ? 200 : 30, // baseHue depends on selected state for primary color
            temperatureFactor, // tempFactor for color intensity/shift
            matterState
        );

        if (matterState === "solid") {
          if (p.initialX === undefined || p.initialY === undefined) return {...p, colorStops: newColorStops };
          
          const restoringForceFactor = 0.15 + pressureFactor * 0.15; 
          const vibrationStrength = 0.02 * tempEffect + temperatureFactor * 0.1;

          ax += (p.initialX - x) * restoringForceFactor; 
          ay += (p.initialY - y) * restoringForceFactor; 

          ax += (Math.random() - 0.5) * vibrationStrength; 
          ay += (Math.random() - 0.5) * vibrationStrength;

          vx += ax; vy += ay;
          vx *= (0.85 - pressureFactor * 0.05); 
          vy *= (0.85 - pressureFactor * 0.05);

          x += vx * tempEffect * 0.5; // Solids move less overall
          y += vy * tempEffect * 0.5;

          const maxDisplacement = PARTICLE_RADIUS * (0.2 + tempEffect * 0.5);
          x = Math.max(p.initialX - maxDisplacement, Math.min(x, p.initialX + maxDisplacement));
          y = Math.max(p.initialY - maxDisplacement, Math.min(y, p.initialY + maxDisplacement));
          x = Math.max(PARTICLE_RADIUS, Math.min(x, CANVAS_WIDTH - PARTICLE_RADIUS));
          y = Math.max(PARTICLE_RADIUS, Math.min(y, CANVAS_HEIGHT - PARTICLE_RADIUS));

        } else if (matterState === "liquid") {
          ay += 0.025 * tempEffect; // Gravity

          const cohesionFactor = 0.001 * (1 - temperatureFactor); // Weaker cohesion at high temp
          const horizontalCohesionForce = cohesionFactor * 0.1;
          const verticalCohesionForce = cohesionFactor * 0.8; // Stronger vertical pull to settle
          ax += (centerX - x) * horizontalCohesionForce;
          ay += (centerY - y) * verticalCohesionForce;
          
          const agitationStrength = 0.05 * tempEffect * (1 + pressureFactor * 0.5);
          ax += (Math.random() - 0.5) * agitationStrength;
          ay += (Math.random() - 0.5) * agitationStrength;

          vx += ax; vy += ay;
          x += vx * tempEffect; y += vy * tempEffect;

          if (x < PARTICLE_RADIUS) { vx *= -0.3; x = PARTICLE_RADIUS; }
          if (x > CANVAS_WIDTH - PARTICLE_RADIUS) { vx *= -0.3; x = CANVAS_WIDTH - PARTICLE_RADIUS; }
          if (y < PARTICLE_RADIUS) { vy *= -0.1; y = PARTICLE_RADIUS; vx *= 0.85; } 
          if (y > CANVAS_HEIGHT - PARTICLE_RADIUS) { vy *= -0.3; y = CANVAS_HEIGHT - PARTICLE_RADIUS; }

          vx *= 0.96; vy *= 0.96; // Viscosity

        } else { // Gas
          const effectivePressureInfluence = 0.3 + pressureFactor * 1.7; 
          const effectiveVolumeWidth = CANVAS_WIDTH / (effectivePressureInfluence * 0.4 + 0.6);
          const effectiveVolumeHeight = CANVAS_HEIGHT / (effectivePressureInfluence * 0.4 + 0.6);
          const offsetX = (CANVAS_WIDTH - effectiveVolumeWidth) / 2;
          const offsetY = (CANVAS_HEIGHT - effectiveVolumeHeight) / 2;

          x += vx * tempEffect; y += vy * tempEffect;

          if (x < offsetX + PARTICLE_RADIUS || x > offsetX + effectiveVolumeWidth - PARTICLE_RADIUS) {
            vx *= -0.9; 
            x = Math.max(offsetX + PARTICLE_RADIUS, Math.min(x, offsetX + effectiveVolumeWidth - PARTICLE_RADIUS));
          }
          if (y < offsetY + PARTICLE_RADIUS || y > offsetY + effectiveVolumeHeight - PARTICLE_RADIUS) {
            vy *= -0.9;
            y = Math.max(offsetY + PARTICLE_RADIUS, Math.min(y, offsetY + effectiveVolumeHeight - PARTICLE_RADIUS));
          }
          
           vx += (Math.random() - 0.5) * 0.03 * tempEffect;
           vy += (Math.random() - 0.5) * 0.03 * tempEffect;

            const maxSpeed = 1.5 * tempEffect; // Adjusted max speed for gas
            const speed = Math.sqrt(vx*vx + vy*vy);
            if (speed > maxSpeed) {
                vx = (vx / speed) * maxSpeed;
                vy = (vy / speed) * maxSpeed;
            }
        }
        return { ...p, x, y, vx, vy, colorStops: newColorStops };
      })
    );
  }, [matterState, temperatureFactor, pressureFactor, particles, getParticleColorStops]); // particles dependency for liquid CoM

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = "hsl(var(--muted) / 0.5)"; // Slightly transparent background for canvas
      ctx.fillRect(0,0,CANVAS_WIDTH, CANVAS_HEIGHT);


      if (matterState === "gas") {
        const effectivePressureInfluence = 0.3 + pressureFactor * 1.7;
        let effectiveVolumeWidth = CANVAS_WIDTH / (effectivePressureInfluence * 0.4 + 0.6);
        let effectiveVolumeHeight = CANVAS_HEIGHT / (effectivePressureInfluence * 0.4 + 0.6);
        let offsetX = (CANVAS_WIDTH - effectiveVolumeWidth) / 2;
        let offsetY = (CANVAS_HEIGHT - effectiveVolumeHeight) / 2;

        ctx.strokeStyle = "hsl(var(--border))";
        ctx.lineWidth = 3;
        ctx.strokeRect(offsetX, offsetY, effectiveVolumeWidth, effectiveVolumeHeight);
      }

      particles.forEach(p => {
        const gradient = ctx.createRadialGradient(p.x, p.y, PARTICLE_RADIUS * 0.2, p.x, p.y, PARTICLE_RADIUS);
        if (p.colorStops && p.colorStops.length >=2) {
            gradient.addColorStop(p.colorStops[0].offset, p.colorStops[0].color);
            gradient.addColorStop(p.colorStops[1].offset, p.colorStops[1].color);
        } else { // Fallback if colorStops are not defined
            gradient.addColorStop(0, "hsla(200, 70%, 70%, 0.9)");
            gradient.addColorStop(1, "hsla(200, 70%, 50%, 0.3)");
        }
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, PARTICLE_RADIUS, 0, 2 * Math.PI);
        ctx.fill();
      });
    };

    const animate = () => {
      updateParticles();
      draw();
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [particles, updateParticles, matterState, pressureFactor]);

  useEffect(() => {
    const predState = getPredictedState(temperatureFactor, pressureFactor);
    setPredictedStateText(predState);

    if (temperatureFactor > 0.42 && temperatureFactor < 0.58 && pressureFactor > 0.38 && pressureFactor < 0.62) {
        setTriplePointHint("Conditions are near a conceptual triple point: particles may exhibit mixed behaviors or rapid transitions.");
    } else {
        setTriplePointHint(null);
    }
    
    // Update PV Data
    let conceptualVolume = 1.0; // Arbitrary units
    let conceptualPressure = 1.0; // Arbitrary units

    if (matterState === "gas") {
        const effectivePressureInfluence = 0.3 + pressureFactor * 1.7; 
        const invVolumeFactor = (effectivePressureInfluence * 0.4 + 0.6);
        conceptualVolume = 1 / invVolumeFactor; // Volume is inversely related to pressure factor
        conceptualPressure = (0.5 + temperatureFactor * 1.5) * invVolumeFactor ; // P is related to T and 1/V
    } else if (matterState === "liquid") {
        conceptualVolume = 0.2 + (0.1 * temperatureFactor); // Liquids slightly expand with temp
        conceptualPressure = 1.0 + pressureFactor * 2 + temperatureFactor; // Pressure builds in confined liquid
    } else { // Solid
        conceptualVolume = 0.15; // Solids are dense
        conceptualPressure = 1.5 + pressureFactor * 2; // High conceptual pressure for solids
    }
     setPvData([{ volume: Math.max(0.1, conceptualVolume * 10), pressure: Math.max(0.1, conceptualPressure) }]);


  }, [temperatureFactor, pressureFactor, getPredictedState, matterState]);
  
  const pvChartConfig = {
    pressure: { label: "Pressure", color: "hsl(var(--primary))" },
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
              <CardTitle className="text-3xl">States of Matter - Advanced Visualizer</CardTitle>
              <CardDescription>Grade 9 - Observe particle behavior, conceptual state transitions, and P-V relationships.</CardDescription>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon"><HelpCircle className="h-5 w-5"/></Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 text-sm">
                <p>Select a primary state, then adjust Temperature and Pressure to observe changes. The "Predicted State" indicates likely phase based on T & P. The P-V diagram is most relevant for gases.</p>
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6 items-start">
            <div className="md:col-span-1 space-y-4"> {/* Controls Column */}
              <Card>
                <CardHeader><CardTitle className="text-xl">Controls</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="mb-2 block font-medium">Primary State Model</Label>
                    <RadioGroup value={matterState} onValueChange={(val) => setMatterState(val as MatterState)} className="flex space-x-4">
                      {["solid", "liquid", "gas"].map(state => (
                        <div key={state} className="flex items-center space-x-1">
                          <RadioGroupItem value={state} id={state} />
                          <Label htmlFor={state} className="capitalize">{state}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                  <div>
                    <Label htmlFor="temperature" className="flex items-center"><Thermometer className="mr-1 h-4 w-4 text-red-500"/>Temperature: {(temperatureFactor * 100).toFixed(0)}%</Label>
                    <Slider id="temperature" min={0.01} max={1} step={0.01} value={[temperatureFactor]} onValueChange={(v) => setTemperatureFactor(v[0])} />
                  </div>
                  <div>
                    <Label htmlFor="pressure" className="flex items-center"><Wind className="mr-1 h-4 w-4 text-blue-500"/>Pressure: {(pressureFactor * 100).toFixed(0)}%</Label>
                    <Slider id="pressure" min={0.01} max={1} step={0.01} value={[pressureFactor]} onValueChange={(v) => setPressureFactor(v[0])} />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-xl">State Information</CardTitle></CardHeader>
                <CardContent className="text-sm space-y-2">
                    <p>Selected Model: <span className="font-semibold capitalize">{matterState}</span></p>
                    <p>Predicted State: <span className="font-semibold">{predictedStateText}</span></p>
                    {triplePointHint && <p className="text-xs text-primary italic">{triplePointHint}</p>}
                    <div className="pt-2 text-xs text-muted-foreground">
                        {matterState === "solid" && "Particles vibrate in fixed positions. High T increases vibration. High P constrains structure."}
                        {matterState === "liquid" && "Particles are close but mobile. High T increases fluidity/energy. High P increases agitation."}
                        {matterState === "gas" && "Particles are far apart, move freely. High T increases speed. High P reduces volume, increases collisions."}
                    </div>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-2 space-y-4"> {/* Visualization & Graph Column */}
              <Card className="h-full">
                <CardHeader><CardTitle className="text-lg">Particle Visualization</CardTitle></CardHeader>
                <CardContent className="flex items-center justify-center p-0">
                  <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="rounded-md border border-input"></canvas>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-lg flex items-center"><BarChart2 className="mr-2 h-5 w-5 text-green-500" />Conceptual P-V Diagram</CardTitle></CardHeader>
                <CardContent>
                  {matterState === "gas" ? (
                    <ChartContainer config={pvChartConfig} className="h-[200px] w-full">
                      <ScatterChart margin={{ top: 5, right: 20, bottom: 20, left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" dataKey="volume" name="Volume" unit=" (arb.)" domain={['dataMin - 1', 'dataMax + 1']} label={{ value: "Conceptual Volume", position: "insideBottom", offset: -10, fontSize: 10 }}/>
                        <YAxis type="number" dataKey="pressure" name="Pressure" unit=" (arb.)" domain={['dataMin - 0.5', 'dataMax + 0.5']} label={{ value: "Conceptual Pressure", angle: -90, position: "insideLeft", offset: 0, fontSize: 10 }}/>
                        <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} content={<ChartTooltipContent />} />
                        <Scatter name="Current State" data={pvData} fill="hsl(var(--primary))" />
                      </ScatterChart>
                    </ChartContainer>
                  ) : (
                    <p className="text-sm text-muted-foreground p-4 text-center">P-V diagram is most illustrative for the 'Gas' state model. Volume changes for solids and liquids are not significantly modeled here.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
        <CardFooter>
            <p className="text-xs text-muted-foreground">Note: This is a conceptual model. Particle interactions and state transitions are simplified.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
