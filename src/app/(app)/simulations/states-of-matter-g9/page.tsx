/**
 * @fileOverview States of Matter Simulation Page (Grade 9).
 * This component provides an interactive simulation demonstrating particle behavior
 * in solid, liquid, and gas states, influenced by temperature and pressure.
 * It includes a visual particle animation and a conceptual P-V diagram.
 */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, HelpCircle, Thermometer, Wind, BarChart2 } from "lucide-react"; // Removed Loader2 as it's not used here
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils'; // Ensure cn is imported

// Simulation Constants
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 300;
const NUM_PARTICLES = 50;
const PARTICLE_RADIUS = 4;
const PARTICLE_DIAMETER = PARTICLE_RADIUS * 2;

// P-V Chart Constants
const PV_CHART_VOLUME_DOMAIN: [number, number] = [5, 25]; // Conceptual volume units
const PV_CHART_PRESSURE_DOMAIN: [number, number] = [0.5, 5]; // Conceptual pressure units

/**
 * Represents a single particle in the simulation.
 */
interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  initialX: number; // For solids, their lattice position
  initialY: number; // For solids, their lattice position
  colorStops: { offset: number; color: string }[]; // For radial gradient fill
}

type MatterState = "solid" | "liquid" | "gas";
type PredictedState = "Solid" | "Liquid" | "Gas" | "Supercritical Fluid" | "Melting" | "Boiling" | "Condensing" | "Freezing" | "Sublimating" | "Depositing" | "Near Triple Point";

interface PVDataPoint {
  volume: number;
  pressure: number;
  label: string; // Added for tooltip clarity
}

/**
 * Resolves 2D elastic collision between two particles.
 * Modifies particle velocities and positions to simulate bounce.
 * @param p1 - The first particle.
 * @param p2 - The second particle.
 */
function resolveElasticCollision(p1: Particle, p2: Particle) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  let distance = Math.sqrt(dx * dx + dy * dy);

  if (distance === 0) distance = 0.001; // Avoid division by zero

  if (distance < PARTICLE_DIAMETER) {
    const nx = dx / distance;
    const ny = dy / distance;
    const tx = -ny;
    const ty = nx;

    const dpTan1 = p1.vx * tx + p1.vy * ty;
    const dpTan2 = p2.vx * tx + p2.vy * ty;
    const dpNorm1 = p1.vx * nx + p1.vy * ny;
    const dpNorm2 = p2.vx * nx + p2.vy * ny;

    // Use 1D collision formula for normal direction (masses are equal)
    const v1PrimeNorm = dpNorm2;
    const v2PrimeNorm = dpNorm1;

    p1.vx = tx * dpTan1 + nx * v1PrimeNorm;
    p1.vy = ty * dpTan1 + ny * v1PrimeNorm;
    p2.vx = tx * dpTan2 + nx * v2PrimeNorm;
    p2.vy = ty * dpTan2 + ny * v2PrimeNorm;

    // Separate overlapping particles
    const overlap = 0.5 * (PARTICLE_DIAMETER - distance + 0.01); // Add small epsilon to prevent sticking
    p1.x -= overlap * nx;
    p1.y -= overlap * ny;
    p2.x += overlap * nx;
    p2.y += overlap * ny;
  }
}

/**
 * Main component for the States of Matter simulation.
 */
export default function StatesOfMatterPage() {
  const [matterState, setMatterState] = useState<MatterState>("solid");
  const [temperatureFactor, setTemperatureFactor] = useState(0.3); // Range: 0.01 to 1
  const [pressureFactor, setPressureFactor] = useState(0.3);     // Range: 0.01 to 1
  const [particles, setParticles] = useState<Particle[]>([]);
  const [predictedStateText, setPredictedStateText] = useState<PredictedState>("Solid");
  const [pvData, setPvData] = useState<PVDataPoint[]>([{ volume: 10, pressure: 1, label: "Current State" }]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const isAnimatingRef = useRef(true); // To control animation loop independently

  const getPredictedState = useCallback((temp: number, pres: number): PredictedState => {
    if (temp > 0.28 && temp < 0.38 && pres > 0.33 && pres < 0.43) return "Near Triple Point";
    if (temp < 0.15) return "Solid";
    if (temp < 0.35 && pres > 0.7) return "Solid";
    if (temp < 0.30 && pres > 0.5) return "Solid";
    if (temp > 0.80) return "Gas";
    if (temp > 0.6 && pres < 0.25) return "Gas";
    if (pres < 0.1) return "Gas";
    if (temp > 0.25 && temp < 0.40 && pres > 0.2 && pres < 0.5) return "Melting";
    if (temp > 0.45 && temp < 0.75 && pres > 0.25 && pres < 0.75) return "Boiling";
    if (temp > 0.7 && pres > 0.7) return "Supercritical Fluid";
    return "Liquid";
  }, []);

  const getParticleColorStops = useCallback((currentMatterState: MatterState, currentTempFactor: number): { offset: number; color: string }[] => {
    let baseHue: number;
    let saturation = 70;
    let lightness = 60;
    let alpha1 = 0.95;
    let alpha2 = 0.4;

    if (currentMatterState === 'gas') {
      baseHue = 30 + Math.min(1, currentTempFactor * 1.8) * 30; 
      saturation = 80 + currentTempFactor * 15;
      lightness = 55 + currentTempFactor * 10;
      alpha1 = 0.8 + currentTempFactor * 0.15;
      alpha2 = 0.2 + currentTempFactor * 0.2;
    } else if (currentMatterState === 'liquid') {
      baseHue = 200; 
      saturation = 65 + currentTempFactor * 10;
      lightness = 50 + currentTempFactor * 10;
    } else { // solid
      baseHue = 270; 
      saturation = 60 + currentTempFactor * 10;
      lightness = 45 + currentTempFactor * 10;
    }
    return [
      { offset: 0, color: `hsla(${baseHue}, ${saturation}%, ${lightness}%, ${alpha1})` },
      { offset: 1, color: `hsla(${baseHue}, ${saturation}%, ${Math.max(20, lightness - 25)}%, ${alpha2})` }
    ];
  }, []);

  const initializeParticles = useCallback(() => {
    isAnimatingRef.current = false; // Pause animation during re-initialization
    const newParticles: Particle[] = [];
    const initialTempFactorForColors = temperatureFactor; 

    for (let i = 0; i < NUM_PARTICLES; i++) {
      let p: Partial<Particle> & { initialX?: number, initialY?: number } = {
        id: i,
        colorStops: getParticleColorStops(matterState, initialTempFactorForColors)
      };
      const jitter = PARTICLE_DIAMETER * 0.1;

      if (matterState === "solid") {
        const particlesPerRow = Math.floor(Math.sqrt(NUM_PARTICLES * (CANVAS_WIDTH / Math.max(1,CANVAS_HEIGHT))));
        const particlesPerCol = Math.ceil(NUM_PARTICLES / Math.max(1,particlesPerRow));
        const spacingX = (CANVAS_WIDTH - PARTICLE_DIAMETER * 2) / Math.max(1, particlesPerRow > 1 ? particlesPerRow -1 : 1);
        const spacingY = (CANVAS_HEIGHT - PARTICLE_DIAMETER * 2) / Math.max(1, particlesPerCol > 1 ? particlesPerCol -1 : 1);
        
        const col = i % Math.max(1, particlesPerRow);
        const row = Math.floor(i / Math.max(1, particlesPerRow));

        p.initialX = PARTICLE_DIAMETER + col * spacingX + (Math.random() - 0.5) * jitter;
        p.initialY = PARTICLE_DIAMETER + row * spacingY + (Math.random() - 0.5) * jitter;
        p.x = p.initialX;
        p.y = p.initialY;
        p.vx = (Math.random() - 0.5) * 0.05 * (1 + temperatureFactor);
        p.vy = (Math.random() - 0.5) * 0.05 * (1 + temperatureFactor);
      } else if (matterState === "liquid") {
        p.x = PARTICLE_RADIUS + Math.random() * (CANVAS_WIDTH - PARTICLE_DIAMETER);
        p.y = CANVAS_HEIGHT * 0.6 + Math.random() * (CANVAS_HEIGHT * 0.4 - PARTICLE_DIAMETER);
        const angle = Math.random() * 2 * Math.PI;
        const speed = 0.1 + Math.random() * 0.2 * (1 + temperatureFactor);
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
        p.initialX = p.x; 
        p.initialY = p.y;
      } else { // gas
        p.x = PARTICLE_RADIUS + Math.random() * (CANVAS_WIDTH - PARTICLE_DIAMETER);
        p.y = PARTICLE_RADIUS + Math.random() * (CANVAS_HEIGHT - PARTICLE_DIAMETER);
        const angle = Math.random() * 2 * Math.PI;
        const speedBase = 0.8; 
        const speed = speedBase * (1 + temperatureFactor * 1.5) + (Math.random() - 0.5) * speedBase * 0.5; 
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
        p.initialX = p.x;
        p.initialY = p.y;
      }
      newParticles.push(p as Particle);
    }
    setParticles(newParticles);
    requestAnimationFrame(() => { isAnimatingRef.current = true; }); // Resume animation after state update
  }, [matterState, getParticleColorStops, temperatureFactor]); 

  useEffect(() => {
    initializeParticles();
  }, [initializeParticles]); 

  const updateParticles = useCallback(() => {
    if (!isAnimatingRef.current) return;

    const K_TEMP_EFFECT = 0.1 + temperatureFactor * 2.5; 
    const K_PRESSURE_CONFINEMENT_FACTOR = 0.5 + (1 - pressureFactor) * 2.0; 
    const K_SOLID_LATTICE_STRENGTH = 0.15 + pressureFactor * 0.3;
    const K_SOLID_VIBRATION_STRENGTH = 0.02 * K_TEMP_EFFECT + temperatureFactor * 0.2;
    const K_LIQUID_GRAVITY = 0.015;
    const K_LIQUID_COHESION_STRENGTH = 0.005 * (1 - temperatureFactor * 0.7);
    const K_LIQUID_REPULSION_STRENGTH = 0.2;
    const K_LIQUID_INTERACTION_RANGE = PARTICLE_DIAMETER * 2.5;
    const K_LIQUID_DAMPING = 0.99;
    const K_LIQUID_TEMP_AGITATION = K_TEMP_EFFECT * 0.03 * (1 + pressureFactor * 0.5);

    setParticles(prevParticles => {
      const newParticleArray = prevParticles.map(p => ({ ...p })); 

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
            if (distSq === 0) continue;
            const dist = Math.sqrt(distSq);

            if (dist < PARTICLE_DIAMETER) { 
              const force = K_LIQUID_REPULSION_STRENGTH * (PARTICLE_DIAMETER - dist) / dist;
              const impulseFactor = 0.1; 
              p1.vx -= force * (dx / dist) * impulseFactor;
              p1.vy -= force * (dy / dist) * impulseFactor;
              p2.vx += force * (dx / dist) * impulseFactor;
              p2.vy += force * (dy / dist) * impulseFactor;
              const overlap = 0.5 * (PARTICLE_DIAMETER - dist + 0.01);
              p1.x -= overlap * (dx / dist);
              p1.y -= overlap * (dy / dist);
              p2.x += overlap * (dx / dist);
              p2.y += overlap * (dy / dist);
            } else if (dist < K_LIQUID_INTERACTION_RANGE) {
              const force = K_LIQUID_COHESION_STRENGTH * (dist - PARTICLE_DIAMETER) / dist;
              const impulseFactor = 0.05;
              p1.vx += force * (dx / dist) * impulseFactor;
              p1.vy += force * (dy / dist) * impulseFactor;
              p2.vx -= force * (dx / dist) * impulseFactor;
              p2.vy -= force * (dy / dist) * impulseFactor;
            }
          }
        }
      }

      return newParticleArray.map(p => {
        let { x, y, vx, vy, initialX, initialY } = p;
        const newColorStops = getParticleColorStops(matterState, temperatureFactor);

        if (matterState === "solid") {
          vx += (initialX - x) * K_SOLID_LATTICE_STRENGTH;
          vy += (initialY - y) * K_SOLID_LATTICE_STRENGTH;
          vx += (Math.random() - 0.5) * K_SOLID_VIBRATION_STRENGTH;
          vy += (Math.random() - 0.5) * K_SOLID_VIBRATION_STRENGTH;
          vx *= (0.80 - pressureFactor * 0.1); 
          vy *= (0.80 - pressureFactor * 0.1);
        } else if (matterState === "liquid") {
          vy += K_LIQUID_GRAVITY; 
          vx += (Math.random() - 0.5) * K_LIQUID_TEMP_AGITATION;
          vy += (Math.random() - 0.5) * K_LIQUID_TEMP_AGITATION;
          vx *= K_LIQUID_DAMPING; 
          vy *= K_LIQUID_DAMPING;
        } else { // Gas
          vx *= 0.999; 
          vy *= 0.999;
        }

        x += vx * (matterState === 'gas' ? K_TEMP_EFFECT * 0.15 : 1);
        y += vy * (matterState === 'gas' ? K_TEMP_EFFECT * 0.15 : 1);

        let restitution = matterState === 'gas' ? 0.95 : (matterState === 'liquid' ? 0.4 : 0.25);
        let minX = PARTICLE_RADIUS;
        let maxX = CANVAS_WIDTH - PARTICLE_RADIUS;
        let minY = PARTICLE_RADIUS;
        let maxY = CANVAS_HEIGHT - PARTICLE_RADIUS;

        if (matterState === 'gas') {
          const effectiveWidth = CANVAS_WIDTH / K_PRESSURE_CONFINEMENT_FACTOR;
          const effectiveHeight = CANVAS_HEIGHT / K_PRESSURE_CONFINEMENT_FACTOR;
          minX = (CANVAS_WIDTH - effectiveWidth) / 2 + PARTICLE_RADIUS;
          maxX = minX + effectiveWidth - PARTICLE_DIAMETER;
          minY = (CANVAS_HEIGHT - effectiveHeight) / 2 + PARTICLE_RADIUS;
          maxY = minY + effectiveHeight - PARTICLE_DIAMETER;
        }

        if (x < minX) { vx *= -restitution; x = minX + (minX - x) * restitution * 0.1; }
        if (x > maxX) { vx *= -restitution; x = maxX - (x - maxX) * restitution * 0.1; }
        if (y < minY) { vy *= -restitution; y = minY + (minY - y) * restitution * 0.1; if (matterState === 'liquid') vx *= 0.9; }
        if (y > maxY) { vy *= -restitution; y = maxY - (y - maxY) * restitution * 0.1; }
        
        if (matterState !== 'gas') {
          const MAX_SPEED_NON_GAS = 1.5 + K_TEMP_EFFECT * 0.5;
          const speedSq = vx * vx + vy * vy;
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

  const drawSimulation = useCallback((
    ctx: CanvasRenderingContext2D, 
    currentParticles: Particle[],
    currentMatterState: MatterState,
    currentPressureFactor: number
  ) => {
    const canvas = ctx.canvas;
    const computedStyle = getComputedStyle(canvas);
    let mutedColorHSLVal = computedStyle.getPropertyValue('--muted').trim();
    
    // Improved HSL parsing if it's in the new format like "240 3.7% 15.9%"
    const hslMatch = mutedColorHSLVal.match(/([\d.]+)\s+([\d.]+)%\s+([\d.]+)%/);
    if (hslMatch) {
        mutedColorHSLVal = `${hslMatch[1]}, ${hslMatch[2]}%, ${hslMatch[3]}%`; // Convert to "H, S%, L%"
    } else {
        // Fallback if CSS var isn't resolved as expected or is an old format
        mutedColorHSLVal = "220, 13%, 18%"; // A default dark muted color
    }

    const bgGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    bgGradient.addColorStop(0, `hsla(${mutedColorHSLVal}, 0.6)`); 
    bgGradient.addColorStop(1, `hsla(${mutedColorHSLVal}, 0.3)`);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (currentMatterState === "gas") {
        const K_PRESSURE_CONFINEMENT_FACTOR = 0.5 + (1 - currentPressureFactor) * 2.0;
        const effectiveWidth = CANVAS_WIDTH / K_PRESSURE_CONFINEMENT_FACTOR;
        const effectiveHeight = CANVAS_HEIGHT / K_PRESSURE_CONFINEMENT_FACTOR;
        const offsetX = (CANVAS_WIDTH - effectiveWidth) / 2;
        const offsetY = (CANVAS_HEIGHT - effectiveHeight) / 2;
        
        // Ensure border color is visible on current background
        const borderColor = computedStyle.getPropertyValue('--border').trim() || "hsl(210, 20%, 50%)";
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(offsetX, offsetY, effectiveWidth, effectiveHeight);
    }

    currentParticles.forEach(p => {
        const gradient = ctx.createRadialGradient(p.x, p.y, PARTICLE_RADIUS * 0.1, p.x, p.y, PARTICLE_RADIUS);
        if (p.colorStops && p.colorStops.length === 2) {
            gradient.addColorStop(p.colorStops[0].offset, p.colorStops[0].color);
            gradient.addColorStop(p.colorStops[1].offset, p.colorStops[1].color);
        } else { 
            gradient.addColorStop(0, "rgba(120,120,120,0.95)");
            gradient.addColorStop(1, "rgba(80,80,80,0.4)");
        }
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, PARTICLE_RADIUS, 0, 2 * Math.PI);
        ctx.fill();
    });
  }, []); 

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const animate = () => {
      if (isAnimatingRef.current) { // Check ref
        updateParticles(); 
        drawSimulation(ctx, particles, matterState, pressureFactor); // Draw after update
      }
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [updateParticles, drawSimulation, particles, matterState, pressureFactor]); // Added dependencies for drawing

  useEffect(() => {
    const predState = getPredictedState(temperatureFactor, pressureFactor);
    setPredictedStateText(predState);

    let conceptualVolumeValue = PV_CHART_VOLUME_DOMAIN[0] + (PV_CHART_VOLUME_DOMAIN[1] - PV_CHART_VOLUME_DOMAIN[0]) * 0.15; 
    let conceptualPressureValue = PV_CHART_PRESSURE_DOMAIN[0] + (PV_CHART_PRESSURE_DOMAIN[1] - PV_CHART_PRESSURE_DOMAIN[0]) * 0.3;

    if (matterState === "gas") {
      const K_PRESSURE_CONFINEMENT_FACTOR_FOR_PV = 0.5 + (1 - pressureFactor) * 2.0;
      const baseVolume = PV_CHART_VOLUME_DOMAIN[1] * 0.7; 
      conceptualVolumeValue = (baseVolume / K_PRESSURE_CONFINEMENT_FACTOR_FOR_PV) * (1 + temperatureFactor * 0.25);
      conceptualPressureValue = (PV_CHART_PRESSURE_DOMAIN[0] + 0.2) + 
                                (temperatureFactor * (PV_CHART_PRESSURE_DOMAIN[1] - PV_CHART_PRESSURE_DOMAIN[0]) * 0.6) +
                                (pressureFactor * (PV_CHART_PRESSURE_DOMAIN[1] - PV_CHART_PRESSURE_DOMAIN[0]) * 0.8);
    } else if (matterState === "liquid") {
      conceptualVolumeValue = PV_CHART_VOLUME_DOMAIN[0] + (PV_CHART_VOLUME_DOMAIN[1] - PV_CHART_VOLUME_DOMAIN[0]) * 0.20 * (1 + temperatureFactor * 0.01 - pressureFactor * 0.005);
      conceptualPressureValue = PV_CHART_PRESSURE_DOMAIN[0] + (pressureFactor * (PV_CHART_PRESSURE_DOMAIN[1] - PV_CHART_PRESSURE_DOMAIN[0]) * 0.5) + (temperatureFactor * (PV_CHART_PRESSURE_DOMAIN[1] - PV_CHART_PRESSURE_DOMAIN[0]) * 0.2);
    } else { // solid
      conceptualVolumeValue = PV_CHART_VOLUME_DOMAIN[0] + (PV_CHART_VOLUME_DOMAIN[1] - PV_CHART_VOLUME_DOMAIN[0]) * 0.10 * (1 + temperatureFactor * 0.005 - pressureFactor * 0.01);
      conceptualPressureValue = PV_CHART_PRESSURE_DOMAIN[0] + (pressureFactor * (PV_CHART_PRESSURE_DOMAIN[1] - PV_CHART_PRESSURE_DOMAIN[0]) * 0.4) + (temperatureFactor * (PV_CHART_PRESSURE_DOMAIN[1] - PV_CHART_PRESSURE_DOMAIN[0]) * 0.1);
    }

    conceptualVolumeValue = Math.max(PV_CHART_VOLUME_DOMAIN[0], Math.min(conceptualVolumeValue, PV_CHART_VOLUME_DOMAIN[1]));
    conceptualPressureValue = Math.max(PV_CHART_PRESSURE_DOMAIN[0], Math.min(conceptualPressureValue, PV_CHART_PRESSURE_DOMAIN[1]));

    setPvData([{ volume: conceptualVolumeValue, pressure: conceptualPressureValue, label: "State (V, P)" }]);

  }, [temperatureFactor, pressureFactor, matterState, getPredictedState]);

  const pvChartConfig = {
    pressure: { label: "Pressure", color: "hsl(var(--primary))" },
  };

  return (
    <div className="space-y-6 p-2 md:p-4">
      <Button variant="outline" asChild size="sm">
        <Link href="/simulations">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Simulations
        </Link>
      </Button>

      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl md:text-3xl">States of Matter - Particle Visualizer</CardTitle>
              <CardDescription>Grade 9 - Observe particle behavior, conceptual state transitions, and P-V relationships.</CardDescription>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8 md:h-9 md:w-9"><HelpCircle className="h-4 w-4 md:h-5 md:w-5" /></Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 text-sm">
                <p className="text-xs">Select a primary state model (Solid, Liquid, Gas). Then, adjust Temperature and Pressure sliders to observe changes in particle behavior and the conceptual P-V diagram (most dynamic for gases).</p>
                <p className="mt-1 text-xs">The "Predicted State" suggests the likely phase under the current T/P conditions.</p>
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 items-start">
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="mb-1.5 block font-medium text-sm">Primary State Model</Label>
                    <RadioGroup value={matterState} onValueChange={(val) => { isAnimatingRef.current = false; setMatterState(val as MatterState);}} className="flex space-x-2 sm:space-x-3">
                      {["solid", "liquid", "gas"].map(state => (
                        <div key={state} className="flex items-center space-x-1">
                          <RadioGroupItem value={state} id={`state-${state}`} />
                          <Label htmlFor={`state-${state}`} className="capitalize text-xs sm:text-sm font-normal">{state}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                  <div>
                    <Label htmlFor="temperature" className="flex items-center text-sm"><Thermometer className="mr-1 h-4 w-4 text-red-500" />Temperature: {(temperatureFactor * 100).toFixed(0)}%</Label>
                    <Slider id="temperature" min={0.01} max={1} step={0.01} value={[temperatureFactor]} onValueChange={(v) => setTemperatureFactor(v[0])} />
                  </div>
                  <div>
                    <Label htmlFor="pressure" className="flex items-center text-sm"><Wind className="mr-1 h-4 w-4 text-blue-500" />Pressure: {(pressureFactor * 100).toFixed(0)}%</Label>
                    <Slider id="pressure" min={0.01} max={1} step={0.01} value={[pressureFactor]} onValueChange={(v) => setPressureFactor(v[0])} />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">State Information</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1.5">
                  <p>Selected Model: <span className="font-semibold capitalize">{matterState}</span></p>
                  <p>Predicted State: <span className="font-semibold">{predictedStateText}</span></p>
                  {predictedStateText === "Near Triple Point" && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">Conceptual triple point: particles may show mixed behaviors.</p>
                  )}
                  <div className="pt-1.5 text-xs text-muted-foreground space-y-1">
                    {matterState === "solid" && <p><b>Solid:</b> Particles vibrate in fixed lattice positions. High T increases vibration. High P strengthens lattice.</p>}
                    {matterState === "liquid" && <p><b>Liquid:</b> Particles are close, cohesive, but mobile. High T increases fluidity. High P increases internal agitation.</p>}
                    {matterState === "gas" && <p><b>Gas:</b> Particles are far apart, move freely. High T increases speed. High P reduces volume, increasing collisions.</p>}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-2 space-y-4">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">Particle Visualization</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center p-0">
                  <canvas 
                    ref={canvasRef} 
                    width={CANVAS_WIDTH} 
                    height={CANVAS_HEIGHT} 
                    className="rounded-md border border-input shadow-inner bg-background"
                    role="img"
                    aria-label={`Particle simulation showing matter in ${matterState} state with temperature factor ${temperatureFactor.toFixed(2)} and pressure factor ${pressureFactor.toFixed(2)}.`}
                  ></canvas>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl flex items-center">
                    <BarChart2 className="mr-2 h-5 w-5 text-green-500" />Conceptual P-V Diagram
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(matterState === 'solid' || matterState === 'liquid') && predictedStateText !== 'Gas' && predictedStateText !== 'Boiling' && predictedStateText !== 'Supercritical Fluid' ? (
                    <div className="h-[180px] md:h-[200px] flex items-center justify-center text-center text-muted-foreground text-sm p-4">
                      <p>P-V diagram is most illustrative for gases. <br /> Solids and liquids show minimal volume changes with pressure in this simplified model.</p>
                    </div>
                  ) : (
                    <ChartContainer config={pvChartConfig} className="h-[180px] md:h-[200px] w-full">
                      <ScatterChart margin={{ top: 5, right: 25, bottom: 20, left: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis
                          type="number" dataKey="volume" name="Volume"
                          domain={PV_CHART_VOLUME_DOMAIN}
                          tickFormatter={(val) => val.toFixed(1)}
                          label={{ value: "Conceptual Volume (V)", position: "insideBottom", offset: -10, fontSize: 10, fill:"hsl(var(--muted-foreground))" }}
                          stroke="hsl(var(--muted-foreground))" fontSize={10}
                        />
                        <YAxis
                          type="number" dataKey="pressure" name="Pressure"
                          domain={PV_CHART_PRESSURE_DOMAIN}
                          tickFormatter={(val) => val.toFixed(1)}
                          label={{ value: "Conceptual Pressure (P)", angle: -90, position: "insideLeft", offset: 0, fontSize: 10, fill:"hsl(var(--muted-foreground))" }}
                          stroke="hsl(var(--muted-foreground))" fontSize={10}
                        />
                        <RechartsTooltip 
                            cursor={{ strokeDasharray: '3 3', stroke: 'hsl(var(--primary))' }} 
                            content={<ChartTooltipContent 
                                formatter={(value, name, entry) => [`${Number(value).toFixed(2)} (Conceptual Units)`, entry.payload.label]}
                             />}
                        />
                        <Scatter name="Current State (P,V)" data={pvData} fill="hsl(var(--primary))" r={8}/>
                      </ScatterChart>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground">Note: This is a conceptual model. Particle interactions and state transitions are simplified for educational visualization. Real phase diagrams are complex.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
