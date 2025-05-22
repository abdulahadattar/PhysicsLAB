
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
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';


const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 300;
const NUM_PARTICLES = 50;
const PARTICLE_RADIUS = 4;
const PARTICLE_DIAMETER = PARTICLE_RADIUS * 2;

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  initialX: number; // For solids
  initialY: number; // For solids
  colorStops: { offset: number; color: string }[];
}

type MatterState = "solid" | "liquid" | "gas";
type PredictedState = "Solid" | "Liquid" | "Gas" | "Supercritical Fluid" | "Melting" | "Boiling" | "Condensing" | "Freezing" | "Sublimating" | "Depositing" | "Near Triple Point";

interface PVDataPoint {
  volume: number;
  pressure: number;
}

const PV_CHART_VOLUME_DOMAIN: [number, number] = [5, 25];
const PV_CHART_PRESSURE_DOMAIN: [number, number] = [0.5, 5];


// Helper function to resolve 2D elastic collisions
function resolveElasticCollision(p1: Particle, p2: Particle) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  let distance = Math.sqrt(dx * dx + dy * dy);

  if (distance === 0) distance = 0.001;

  if (distance < PARTICLE_DIAMETER) {
    const nx = dx / distance;
    const ny = dy / distance;
    const tx = -ny;
    const ty = nx;
    const dpTan1 = p1.vx * tx + p1.vy * ty;
    const dpTan2 = p2.vx * tx + p2.vy * ty;
    const dpNorm1 = p1.vx * nx + p1.vy * ny;
    const dpNorm2 = p2.vx * nx + p2.vy * ny;
    const v1PrimeNorm = dpNorm2;
    const v2PrimeNorm = dpNorm1;

    p1.vx = tx * dpTan1 + nx * v1PrimeNorm;
    p1.vy = ty * dpTan1 + ny * v1PrimeNorm;
    p2.vx = tx * dpTan2 + nx * v2PrimeNorm;
    p2.vy = ty * dpTan2 + ny * v2PrimeNorm;
    
    const overlap = 0.5 * (PARTICLE_DIAMETER - distance + 0.01);
    p1.x -= overlap * nx;
    p1.y -= overlap * ny;
    p2.x += overlap * nx;
    p2.y += overlap * ny;
  }
}


export default function StatesOfMatterPage() {
  const [matterState, setMatterState] = useState<MatterState>("solid");
  const [temperatureFactor, setTemperatureFactor] = useState(0.3); // 0 to 1
  const [pressureFactor, setPressureFactor] = useState(0.3); // 0 to 1
  const [particles, setParticles] = useState<Particle[]>([]);
  const [predictedStateText, setPredictedStateText] = useState<PredictedState>("Solid");
  const [pvData, setPvData] = useState<PVDataPoint[]>([{ volume: 10, pressure: 1 }]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();

  const getPredictedState = useCallback((temp: number, pres: number): PredictedState => {
    if (temp > 0.28 && temp < 0.38 && pres > 0.33 && pres < 0.43) return "Near Triple Point";
    if (temp < 0.15) return pres > 0.1 ? "Solid" : "Solid";
    if (temp < 0.35) {
        if (pres > 0.6) return "Solid";
        if (pres < 0.15 && temp > 0.25) return "Gas";
        return "Melting";
    }
    if (temp < 0.7) {
        if (pres > 0.8) return "Liquid"; 
        if (pres < 0.2) return "Gas";
        if (pres > 0.3 && pres < 0.7) return "Boiling";
        return "Liquid";
    }
    if (pres > 0.65 && temp < 0.85) return "Supercritical Fluid";
    return "Gas";
  }, []);
  
  const getParticleColorStops = useCallback((baseHue: number, tempFactor: number) => {
    let saturation = 70;
    let lightness = 60;
    let alpha1 = 0.95;
    let alpha2 = 0.4;

    if (matterState === 'gas') {
        baseHue = 30 + Math.min(1, tempFactor * 1.8) * 30;
        saturation = 80 + tempFactor * 15;
        lightness = 55 + tempFactor * 10;
        alpha1 = 0.8 + tempFactor * 0.15;
        alpha2 = 0.2 + tempFactor * 0.2;
    } else if (matterState === 'liquid') {
        baseHue = 200;
        saturation = 65 + tempFactor * 10;
        lightness = 50 + tempFactor * 10;
    } else {
        baseHue = 270;
        saturation = 60 + tempFactor * 10;
        lightness = 45 + tempFactor * 10;
    }
    
    return [
        { offset: 0, color: `hsla(${baseHue}, ${saturation}%, ${lightness}%, ${alpha1})` },
        { offset: 1, color: `hsla(${baseHue}, ${saturation}%, ${Math.max(20, lightness - 25)}%, ${alpha2})` }
    ];
  }, [matterState]);


  const initializeParticles = useCallback(() => {
    const newParticles: Particle[] = [];
    const baseHue = matterState === "solid" ? 270 : matterState === "liquid" ? 200 : 30;

    for (let i = 0; i < NUM_PARTICLES; i++) {
      let p: Partial<Particle> & {initialX?:number, initialY?:number} = { 
        id: i,
        colorStops: getParticleColorStops(baseHue, temperatureFactor)
      };
      if (matterState === "solid") {
        const numCols = Math.floor(Math.sqrt(NUM_PARTICLES * (CANVAS_WIDTH / (PARTICLE_DIAMETER * 1.2)) / (CANVAS_HEIGHT / (PARTICLE_DIAMETER*1.2)))) || 5;
        const numRows = Math.ceil(NUM_PARTICLES / numCols);
        const spacingX = (CANVAS_WIDTH - PARTICLE_DIAMETER*2) / Math.max(1, numCols > 1 ? numCols -1 : 1 );
        const spacingY = (CANVAS_HEIGHT - PARTICLE_DIAMETER*2) / Math.max(1, numRows > 1 ? numRows -1 : 1);
        
        const col = i % numCols;
        const row = Math.floor(i / numCols);

        p.initialX = PARTICLE_DIAMETER + col * spacingX;
        p.initialY = PARTICLE_DIAMETER + row * spacingY;
        p.x = p.initialX;
        p.y = p.initialY;
        p.vx = (Math.random() - 0.5) * 0.05; 
        p.vy = (Math.random() - 0.5) * 0.05;
      } else if (matterState === "liquid") {
        p.x = PARTICLE_RADIUS + Math.random() * (CANVAS_WIDTH - PARTICLE_DIAMETER);
        p.y = CANVAS_HEIGHT * 0.6 + Math.random() * (CANVAS_HEIGHT * 0.4 - PARTICLE_DIAMETER); 
        const angle = Math.random() * 2 * Math.PI;
        const speed = 0.05 + Math.random() * 0.1; 
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
        p.initialX = p.x;
        p.initialY = p.y;
      } else { 
        p.x = PARTICLE_RADIUS + Math.random() * (CANVAS_WIDTH - PARTICLE_DIAMETER);
        p.y = PARTICLE_RADIUS + Math.random() * (CANVAS_HEIGHT - PARTICLE_DIAMETER);
        const angle = Math.random() * 2 * Math.PI;
        const speedBase = 0.5 + temperatureFactor * 1.5;
        const speed = speedBase + (Math.random() - 0.5) * speedBase * 0.5;
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
        p.initialX = p.x;
        p.initialY = p.y;
      }
      newParticles.push(p as Particle);
    }
    setParticles(newParticles);
  }, [matterState, temperatureFactor, getParticleColorStops]);

  useEffect(() => {
    initializeParticles();
  }, [initializeParticles]);

  const updateParticles = useCallback(() => {
    const K_TEMP_EFFECT = 0.1 + temperatureFactor * 2.5; 
    const K_PRESSURE_CONFINEMENT = 0.5 + (1 - pressureFactor) * 1.5; 
    const K_SOLID_LATTICE = 0.15 + pressureFactor * 0.3; 
    const K_SOLID_VIBRATION = 0.01 * K_TEMP_EFFECT + temperatureFactor * 0.1;
    const K_LIQUID_GRAVITY = 0.015 * K_TEMP_EFFECT;
    const K_LIQUID_COHESION_STRENGTH = 0.005 * (1 - temperatureFactor * 0.7); 
    const K_LIQUID_REPULSION_STRENGTH = 0.1;
    const K_LIQUID_INTERACTION_RANGE = PARTICLE_DIAMETER * 2.5;


    setParticles(prevParticles => {
      const newParticleArray = prevParticles.map(p => ({...p})); 

      for (let i = 0; i < newParticleArray.length; i++) {
        for (let j = i + 1; j < newParticleArray.length; j++) {
          const p1 = newParticleArray[i];
          const p2 = newParticleArray[j];

          if (matterState === 'gas') {
            resolveElasticCollision(p1, p2);
          } else if (matterState === 'liquid') {
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const distSq = dx * dx + dy * dy;
            const dist = Math.sqrt(distSq);

            if (dist < PARTICLE_DIAMETER && dist > 0.01) { 
              const force = K_LIQUID_REPULSION_STRENGTH * (PARTICLE_DIAMETER - dist) / dist;
              p1.vx -= force * (dx / dist) * 0.5; 
              p1.vy -= force * (dy / dist) * 0.5;
              p2.vx += force * (dx / dist) * 0.5;
              p2.vy += force * (dy / dist) * 0.5;
            } else if (dist < K_LIQUID_INTERACTION_RANGE && dist > PARTICLE_DIAMETER) { 
              const force = K_LIQUID_COHESION_STRENGTH * (dist - PARTICLE_DIAMETER) / dist;
              p1.vx += force * (dx / dist) * 0.5;
              p1.vy += force * (dy / dist) * 0.5;
              p2.vx -= force * (dx / dist) * 0.5;
              p2.vy -= force * (dy / dist) * 0.5;
            }
          }
        }
      }
      
      return newParticleArray.map(p => {
        let { x, y, vx, vy, initialX, initialY } = p;
        const newColorStops = getParticleColorStops(
            matterState === "solid" ? 270 : matterState === "liquid" ? 200 : (30 + Math.min(1, temperatureFactor * 1.8) * 30), 
            temperatureFactor
        );

        if (matterState === "solid") {
          vx += (initialX - x) * K_SOLID_LATTICE;
          vy += (initialY - y) * K_SOLID_LATTICE;
          vx += (Math.random() - 0.5) * K_SOLID_VIBRATION;
          vy += (Math.random() - 0.5) * K_SOLID_VIBRATION;
          vx *= (0.9 - pressureFactor * 0.1); 
          vy *= (0.9 - pressureFactor * 0.1);
        } else if (matterState === "liquid") {
          vy += K_LIQUID_GRAVITY; 
          vx *= 0.98; 
          vy *= 0.98;
        }

        x += vx * (matterState === 'gas' ? K_TEMP_EFFECT * 0.8 : 1); 
        y += vy * (matterState === 'gas' ? K_TEMP_EFFECT * 0.8 : 1);

        let restitution = matterState === 'gas' ? 0.85 : 0.3; 

        let minX = PARTICLE_RADIUS;
        let maxX = CANVAS_WIDTH - PARTICLE_RADIUS;
        let minY = PARTICLE_RADIUS;
        let maxY = CANVAS_HEIGHT - PARTICLE_RADIUS;

        if (matterState === 'gas') {
            const effectiveWidth = CANVAS_WIDTH / K_PRESSURE_CONFINEMENT;
            const effectiveHeight = CANVAS_HEIGHT / K_PRESSURE_CONFINEMENT;
            minX = (CANVAS_WIDTH - effectiveWidth) / 2 + PARTICLE_RADIUS;
            maxX = minX + effectiveWidth - PARTICLE_DIAMETER;
            minY = (CANVAS_HEIGHT - effectiveHeight) / 2 + PARTICLE_RADIUS;
            maxY = minY + effectiveHeight - PARTICLE_DIAMETER;
        }

        if (x < minX) { vx *= -restitution; x = minX; }
        if (x > maxX) { vx *= -restitution; x = maxX; }
        if (y < minY) { vy *= -restitution; y = minY; if(matterState === 'liquid') vx *= 0.9; } 
        if (y > maxY) { vy *= -restitution; y = maxY; }
        
        if (matterState !== 'gas') {
            const MAX_SPEED_NON_GAS = 1.5 + K_TEMP_EFFECT * 2;
            const speedSq = vx*vx + vy*vy;
            if (speedSq > MAX_SPEED_NON_GAS * MAX_SPEED_NON_GAS) {
                const speed = Math.sqrt(speedSq);
                vx = (vx / speed) * MAX_SPEED_NON_GAS;
                vy = (vy / speed) * MAX_SPEED_NON_GAS;
            }
        }
        return { ...p, x, y, vx, vy, colorStops: newColorStops };
      })
    });
  }, [matterState, temperatureFactor, pressureFactor, getParticleColorStops]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const draw = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      const computedStyle = getComputedStyle(canvas);
      const mutedColorHSL = computedStyle.getPropertyValue('--muted').trim(); // e.g., "190 40% 80%"

      const bgGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      bgGradient.addColorStop(0, `hsla(${mutedColorHSL}, 0.6)`);
      bgGradient.addColorStop(1, `hsla(${mutedColorHSL}, 0.3)`);
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0,0,CANVAS_WIDTH, CANVAS_HEIGHT);


      if (matterState === "gas") {
        const K_PRESSURE_CONFINEMENT = 0.5 + (1 - pressureFactor) * 1.5;
        const effectiveWidth = CANVAS_WIDTH / K_PRESSURE_CONFINEMENT;
        const effectiveHeight = CANVAS_HEIGHT / K_PRESSURE_CONFINEMENT;
        const offsetX = (CANVAS_WIDTH - effectiveWidth) / 2;
        const offsetY = (CANVAS_HEIGHT - effectiveHeight) / 2;

        ctx.strokeStyle = "hsl(var(--border))"; // Use CSS variable for border
        ctx.lineWidth = 2;
        ctx.strokeRect(offsetX, offsetY, effectiveWidth, effectiveHeight);
      }

      particles.forEach(p => {
        const gradient = ctx.createRadialGradient(p.x, p.y, PARTICLE_RADIUS * 0.1, p.x, p.y, PARTICLE_RADIUS);
        gradient.addColorStop(p.colorStops[0].offset, p.colorStops[0].color);
        gradient.addColorStop(p.colorStops[1].offset, p.colorStops[1].color);
        
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
    
    let conceptualVolumeValue = 10; 
    let conceptualPressureValue = 1;

    if (matterState === "gas") {
        const K_PRESSURE_CONFINEMENT = 0.5 + (1 - pressureFactor) * 1.5;
        const baseVolume = PV_CHART_VOLUME_DOMAIN[1] * 0.9; 
        conceptualVolumeValue = (baseVolume / K_PRESSURE_CONFINEMENT) * (1 + temperatureFactor * 0.1);
        conceptualPressureValue = (PV_CHART_PRESSURE_DOMAIN[0] + 0.2) + (temperatureFactor * (PV_CHART_PRESSURE_DOMAIN[1] - PV_CHART_PRESSURE_DOMAIN[0]) * 0.6) + (pressureFactor * (PV_CHART_PRESSURE_DOMAIN[1] - PV_CHART_PRESSURE_DOMAIN[0]) * 0.8);
    } else if (matterState === "liquid") {
        conceptualVolumeValue = PV_CHART_VOLUME_DOMAIN[0] + (PV_CHART_VOLUME_DOMAIN[1] - PV_CHART_VOLUME_DOMAIN[0]) * 0.15 * (1 + temperatureFactor * 0.03); 
        conceptualPressureValue = PV_CHART_PRESSURE_DOMAIN[0] + (pressureFactor * (PV_CHART_PRESSURE_DOMAIN[1] - PV_CHART_PRESSURE_DOMAIN[0]) * 0.5) + (temperatureFactor * (PV_CHART_PRESSURE_DOMAIN[1] - PV_CHART_PRESSURE_DOMAIN[0]) * 0.2);
    } else { 
        conceptualVolumeValue = PV_CHART_VOLUME_DOMAIN[0] + (PV_CHART_VOLUME_DOMAIN[1] - PV_CHART_VOLUME_DOMAIN[0]) * 0.05 * (1 + temperatureFactor * 0.01); 
        conceptualPressureValue = PV_CHART_PRESSURE_DOMAIN[0] + (pressureFactor * (PV_CHART_PRESSURE_DOMAIN[1] - PV_CHART_PRESSURE_DOMAIN[0]) * 0.4) + (temperatureFactor * (PV_CHART_PRESSURE_DOMAIN[1] - PV_CHART_PRESSURE_DOMAIN[0]) * 0.1);
    }
     
    conceptualVolumeValue = Math.max(PV_CHART_VOLUME_DOMAIN[0], Math.min(conceptualVolumeValue, PV_CHART_VOLUME_DOMAIN[1]));
    conceptualPressureValue = Math.max(PV_CHART_PRESSURE_DOMAIN[0], Math.min(conceptualPressureValue, PV_CHART_PRESSURE_DOMAIN[1]));

    setPvData([{ volume: conceptualVolumeValue, pressure: conceptualPressureValue }]);

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

      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl">States of Matter - Particle Visualizer</CardTitle>
              <CardDescription>Grade 9 - Observe particle behavior, conceptual state transitions, and P-V relationships.</CardDescription>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon"><HelpCircle className="h-5 w-5"/></Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 text-sm">
                <p>Select a primary state model, then adjust Temperature and Pressure to observe changes. The "Predicted State" indicates a likely phase. The P-V diagram shows conceptual pressure-volume relationships (most dynamic for gases).</p>
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-xl">Controls</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="mb-2 block font-medium">Primary State Model</Label>
                    <RadioGroup value={matterState} onValueChange={(val) => setMatterState(val as MatterState)} className="flex space-x-2 sm:space-x-4">
                      {["solid", "liquid", "gas"].map(state => (
                        <div key={state} className="flex items-center space-x-1">
                          <RadioGroupItem value={state} id={state} />
                          <Label htmlFor={state} className="capitalize text-xs sm:text-sm">{state}</Label>
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
                     {predictedStateText === "Near Triple Point" && (
                      <p className="text-xs text-amber-600 dark:text-amber-400">Conceptual triple point conditions: particles may exhibit mixed behaviors.</p>
                    )}
                    <div className="pt-2 text-xs text-muted-foreground">
                        {matterState === "solid" && "Particles vibrate in fixed positions. High T increases vibration. High P constrains structure, slightly compressing."}
                        {matterState === "liquid" && "Particles are close, cohesive but mobile. High T increases fluidity/energy. High P increases internal agitation."}
                        {matterState === "gas" && "Particles are far apart, move freely. High T increases speed. High P reduces volume, increases collisions."}
                    </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2 space-y-4"> 
              <Card className="h-full">
                <CardHeader><CardTitle className="text-lg">Particle Visualization</CardTitle></CardHeader>
                <CardContent className="flex items-center justify-center p-0">
                  <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="rounded-md border border-input bg-transparent shadow-inner"></canvas>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-lg flex items-center"><BarChart2 className="mr-2 h-5 w-5 text-green-500" />Conceptual P-V Diagram</CardTitle></CardHeader>
                <CardContent>
                {(matterState === 'solid' || matterState === 'liquid') ? (
                    <div className="h-[200px] flex items-center justify-center text-center text-muted-foreground text-sm">
                        <p>P-V diagram is most illustrative for gases. <br /> Solids and liquids have minimal volume changes with pressure in this model.</p>
                    </div>
                ) : (
                  <ChartContainer config={pvChartConfig} className="h-[200px] w-full">
                    <ScatterChart margin={{ top: 5, right: 20, bottom: 20, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        type="number" 
                        dataKey="volume" 
                        name="Volume" 
                        domain={PV_CHART_VOLUME_DOMAIN}
                        tickFormatter={(val) => val.toFixed(1)}
                        label={{ value: "Conceptual Volume", position: "insideBottom", offset: -10, fontSize: 10 }}
                       />
                      <YAxis 
                        type="number" 
                        dataKey="pressure" 
                        name="Pressure" 
                        domain={PV_CHART_PRESSURE_DOMAIN}
                        tickFormatter={(val) => val.toFixed(1)}
                        label={{ value: "Conceptual Pressure", angle: -90, position: "insideLeft", offset: 0, fontSize: 10 }}
                       />
                      <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} content={<ChartTooltipContent />} />
                      <Scatter name="Current State" data={pvData} fill="hsl(var(--primary))" />
                    </ScatterChart>
                  </ChartContainer>
                )}
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
        <CardFooter>
            <p className="text-xs text-muted-foreground">Note: This is a conceptual model. Particle interactions and state transitions are simplified for educational visualization.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
    

