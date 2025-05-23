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
import { ArrowLeft, HelpCircle, Thermometer, Wind, BarChart2, Loader2 } from "lucide-react";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

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

  if (distance === 0) distance = 0.001; // Avoid division by zero if perfectly overlapped

  if (distance < PARTICLE_DIAMETER) {
    // Normal and tangent vectors
    const nx = dx / distance;
    const ny = dy / distance;
    const tx = -ny;
    const ty = nx;

    // Dot products of velocities with normal/tangent vectors
    const dpTan1 = p1.vx * tx + p1.vy * ty;
    const dpTan2 = p2.vx * tx + p2.vy * ty;
    const dpNorm1 = p1.vx * nx + p1.vy * ny;
    const dpNorm2 = p2.vx * nx + p2.vy * ny;

    // Conservation of momentum in 1D (normal direction)
    const v1PrimeNorm = dpNorm2;
    const v2PrimeNorm = dpNorm1;

    // Update velocities
    p1.vx = tx * dpTan1 + nx * v1PrimeNorm;
    p1.vy = ty * dpTan1 + ny * v1PrimeNorm;
    p2.vx = tx * dpTan2 + nx * v2PrimeNorm;
    p2.vy = ty * dpTan2 + ny * v2PrimeNorm;

    // Separate overlapping particles slightly
    const overlap = 0.5 * (PARTICLE_DIAMETER - distance + 0.01);
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
  const [pvData, setPvData] = useState<PVDataPoint[]>([{ volume: 10, pressure: 1 }]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();

  /**
   * Determines a conceptual predicted state based on temperature and pressure factors.
   * @param temp - Temperature factor (0-1).
   * @param pres - Pressure factor (0-1).
   * @returns A string representing the predicted state.
   */
  const getPredictedState = useCallback((temp: number, pres: number): PredictedState => {
    // Simplified logic for state prediction
    if (temp > 0.28 && temp < 0.38 && pres > 0.33 && pres < 0.43) return "Near Triple Point"; // Conceptual
    
    // Solid-like conditions
    if (temp < 0.15) return "Solid";
    if (temp < 0.35 && pres > 0.7) return "Solid";
    if (temp < 0.30 && pres > 0.5) return "Solid";


    // Gas-like conditions
    if (temp > 0.80) return "Gas";
    if (temp > 0.6 && pres < 0.25) return "Gas";
    if (pres < 0.1) return "Gas";
    
    // Transition states
    if (temp > 0.25 && temp < 0.40 && pres > 0.2 && pres < 0.5) return "Melting"; // Solid -> Liquid
    if (temp > 0.45 && temp < 0.75 && pres > 0.25 && pres < 0.75) return "Boiling"; // Liquid -> Gas

    if (temp > 0.7 && pres > 0.7) return "Supercritical Fluid"; // High T, High P

    // Default to liquid if not clearly solid or gas under moderate conditions
    return "Liquid";
  }, []);

  /**
   * Generates color stops for particle gradients based on matter state and temperature.
   * @param currentMatterState - The selected primary matter state.
   * @param currentTempFactor - Current temperature factor.
   * @returns An array of color stops for a radial gradient.
   */
  const getParticleColorStops = useCallback((currentMatterState: MatterState, currentTempFactor: number): { offset: number; color: string }[] => {
    let baseHue: number;
    let saturation = 70;
    let lightness = 60;
    let alpha1 = 0.95;
    let alpha2 = 0.4;

    if (currentMatterState === 'gas') {
      baseHue = 30 + Math.min(1, currentTempFactor * 1.8) * 30; // Shifts from yellow-orange to red with temp
      saturation = 80 + currentTempFactor * 15;
      lightness = 55 + currentTempFactor * 10;
      alpha1 = 0.8 + currentTempFactor * 0.15;
      alpha2 = 0.2 + currentTempFactor * 0.2;
    } else if (currentMatterState === 'liquid') {
      baseHue = 200; // Blueish
      saturation = 65 + currentTempFactor * 10;
      lightness = 50 + currentTempFactor * 10;
    } else { // solid
      baseHue = 270; // Purplish
      saturation = 60 + currentTempFactor * 10;
      lightness = 45 + currentTempFactor * 10;
    }
    return [
      { offset: 0, color: `hsla(${baseHue}, ${saturation}%, ${lightness}%, ${alpha1})` },
      { offset: 1, color: `hsla(${baseHue}, ${saturation}%, ${Math.max(20, lightness - 25)}%, ${alpha2})` }
    ];
  }, []);


  /**
   * Initializes particle positions and velocities based on the selected matter state.
   * This is called when the `matterState` changes.
   */
  const initializeParticles = useCallback(() => {
    const newParticles: Particle[] = [];
    const initialTempFactorForColors = temperatureFactor; // Use current temp for initial coloring

    for (let i = 0; i < NUM_PARTICLES; i++) {
      let p: Partial<Particle> & { initialX?: number, initialY?: number } = {
        id: i,
        colorStops: getParticleColorStops(matterState, initialTempFactorForColors)
      };
      const jitter = PARTICLE_DIAMETER * 0.1; // Small random offset for solids

      if (matterState === "solid") {
        // Arrange in a grid-like lattice
        const particlesPerRow = Math.floor(Math.sqrt(NUM_PARTICLES * (CANVAS_WIDTH / Math.max(1,CANVAS_HEIGHT))));
        const particlesPerCol = Math.ceil(NUM_PARTICLES / Math.max(1,particlesPerRow));
        const spacingX = (CANVAS_WIDTH - PARTICLE_DIAMETER * 2) / Math.max(1, particlesPerRow > 1 ? particlesPerRow -1: 1);
        const spacingY = (CANVAS_HEIGHT - PARTICLE_DIAMETER * 2) / Math.max(1, particlesPerCol > 1 ? particlesPerCol -1: 1);
        
        const col = i % Math.max(1,particlesPerRow);
        const row = Math.floor(i / Math.max(1,particlesPerRow));

        p.initialX = PARTICLE_DIAMETER + col * spacingX + (Math.random() - 0.5) * jitter;
        p.initialY = PARTICLE_DIAMETER + row * spacingY + (Math.random() - 0.5) * jitter;
        p.x = p.initialX;
        p.y = p.initialY;
        // Initial small random velocities for vibration
        p.vx = (Math.random() - 0.5) * 0.05 * (1 + temperatureFactor);
        p.vy = (Math.random() - 0.5) * 0.05 * (1 + temperatureFactor);
      } else if (matterState === "liquid") {
        // Place particles somewhat randomly in the lower part of the container
        p.x = PARTICLE_RADIUS + Math.random() * (CANVAS_WIDTH - PARTICLE_DIAMETER);
        p.y = CANVAS_HEIGHT * 0.6 + Math.random() * (CANVAS_HEIGHT * 0.4 - PARTICLE_DIAMETER); // Start in lower ~40%
        const angle = Math.random() * 2 * Math.PI;
        const speed = 0.1 + Math.random() * 0.2 * (1 + temperatureFactor);
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
        p.initialX = p.x; // Store initial for reference, though not strictly used for liquids like solids
        p.initialY = p.y;
      } else { // gas
        // Distribute randomly within the canvas
        p.x = PARTICLE_RADIUS + Math.random() * (CANVAS_WIDTH - PARTICLE_DIAMETER);
        p.y = PARTICLE_RADIUS + Math.random() * (CANVAS_HEIGHT - PARTICLE_DIAMETER);
        const angle = Math.random() * 2 * Math.PI;
        const speedBase = 0.8; // Base speed for gas particles
        const speed = speedBase * (1 + temperatureFactor * 1.5) + (Math.random() - 0.5) * speedBase * 0.5; // Temp has stronger effect
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
        p.initialX = p.x;
        p.initialY = p.y;
      }
      newParticles.push(p as Particle);
    }
    setParticles(newParticles);
  }, [matterState, getParticleColorStops, temperatureFactor]); // This effect depends on matterState, getParticleColorStops, and initial temperatureFactor.

  // Effect to re-initialize particles when matterState changes.
  useEffect(() => {
    initializeParticles();
  }, [initializeParticles]); // initializeParticles reference changes when matterState changes.

  /**
   * Updates particle positions and velocities for each animation frame.
   * Implements physics logic for different states, including collisions and forces.
   */
  const updateParticles = useCallback(() => {
    // --- Factors derived from temperature and pressure ---
    const K_TEMP_EFFECT = 0.1 + temperatureFactor * 2.5; // General kinetic energy factor from temperature
    
    // Pressure factor for gas confinement: High pressure = smaller volume = higher K_PRESSURE_CONFINEMENT_FACTOR
    const K_PRESSURE_CONFINEMENT_FACTOR = 0.5 + (1 - pressureFactor) * 2.0; 

    // Solid-specific factors
    const K_SOLID_LATTICE_STRENGTH = 0.15 + pressureFactor * 0.3; // Higher pressure, stronger lattice
    const K_SOLID_VIBRATION_STRENGTH = 0.02 * K_TEMP_EFFECT + temperatureFactor * 0.2; // Vibration based on temp

    // Liquid-specific factors
    const K_LIQUID_GRAVITY = 0.015;
    const K_LIQUID_COHESION_STRENGTH = 0.005 * (1 - temperatureFactor * 0.7); // Weaker cohesion at high temp
    const K_LIQUID_REPULSION_STRENGTH = 0.2; // Strong repulsion on overlap
    const K_LIQUID_INTERACTION_RANGE = PARTICLE_DIAMETER * 2.5;
    const K_LIQUID_DAMPING = 0.99; // Simulates viscosity
    const K_LIQUID_TEMP_AGITATION = K_TEMP_EFFECT * 0.03 * (1 + pressureFactor * 0.5); // Pressure adds agitation

    setParticles(prevParticles => {
      const newParticleArray = prevParticles.map(p => ({ ...p })); // Create a new array of new particle objects

      // Particle-particle interactions
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
            
            if (distSq === 0) continue; // Skip if particles are exactly at the same spot
            const dist = Math.sqrt(distSq);

            if (dist < PARTICLE_DIAMETER) { // Repulsion on overlap
              const force = K_LIQUID_REPULSION_STRENGTH * (PARTICLE_DIAMETER - dist) / dist;
              const impulseFactor = 0.1; // Adjust for stable impulses
              p1.vx -= force * (dx / dist) * impulseFactor;
              p1.vy -= force * (dy / dist) * impulseFactor;
              p2.vx += force * (dx / dist) * impulseFactor;
              p2.vy += force * (dy / dist) * impulseFactor;
              // Separation
              const overlap = 0.5 * (PARTICLE_DIAMETER - dist + 0.01);
              p1.x -= overlap * (dx / dist);
              p1.y -= overlap * (dy / dist);
              p2.x += overlap * (dx / dist);
              p2.y += overlap * (dy / dist);
            } else if (dist < K_LIQUID_INTERACTION_RANGE) { // Cohesion within range
              const force = K_LIQUID_COHESION_STRENGTH * (dist - PARTICLE_DIAMETER) / dist;
              const impulseFactor = 0.05;
              p1.vx += force * (dx / dist) * impulseFactor;
              p1.vy += force * (dy / dist) * impulseFactor;
              p2.vx -= force * (dx / dist) * impulseFactor;
              p2.vy -= force * (dy / dist) * impulseFactor;
            }
          }
          // Solid particle-particle interaction is primarily through lattice, less direct collision
        }
      }

      // Update individual particle physics
      return newParticleArray.map(p => {
        let { x, y, vx, vy, initialX, initialY } = p;
        const newColorStops = getParticleColorStops(matterState, temperatureFactor); // Update color dynamically

        if (matterState === "solid") {
          // Force pulling back to lattice position
          vx += (initialX - x) * K_SOLID_LATTICE_STRENGTH;
          vy += (initialY - y) * K_SOLID_LATTICE_STRENGTH;
          // Random vibration based on temperature
          vx += (Math.random() - 0.5) * K_SOLID_VIBRATION_STRENGTH;
          vy += (Math.random() - 0.5) * K_SOLID_VIBRATION_STRENGTH;
          // Damping (influenced by pressure conceptually - tighter lattice = more damping)
          vx *= (0.80 - pressureFactor * 0.1); 
          vy *= (0.80 - pressureFactor * 0.1);
        } else if (matterState === "liquid") {
          vy += K_LIQUID_GRAVITY; // Gravity
          // Random agitation from temperature and pressure
          vx += (Math.random() - 0.5) * K_LIQUID_TEMP_AGITATION;
          vy += (Math.random() - 0.5) * K_LIQUID_TEMP_AGITATION;
          vx *= K_LIQUID_DAMPING; // Viscosity
          vy *= K_LIQUID_DAMPING;
        } else { // Gas
          // Speed primarily comes from initial setup and collisions.
          // Apply slight "air drag" or general damping.
          vx *= 0.999; 
          vy *= 0.999;
        }

        // Update positions based on velocity
        // For gases, temperature has a more direct scaling effect on movement per frame
        x += vx * (matterState === 'gas' ? K_TEMP_EFFECT * 0.15 : 1);
        y += vy * (matterState === 'gas' ? K_TEMP_EFFECT * 0.15 : 1);

        // Wall collision properties
        let restitution = matterState === 'gas' ? 0.95 : (matterState === 'liquid' ? 0.4 : 0.25);
        
        // Define boundaries
        let minX = PARTICLE_RADIUS;
        let maxX = CANVAS_WIDTH - PARTICLE_RADIUS;
        let minY = PARTICLE_RADIUS;
        let maxY = CANVAS_HEIGHT - PARTICLE_RADIUS;

        if (matterState === 'gas') {
          // Gas volume is confined by pressure
          const effectiveWidth = CANVAS_WIDTH / K_PRESSURE_CONFINEMENT_FACTOR;
          const effectiveHeight = CANVAS_HEIGHT / K_PRESSURE_CONFINEMENT_FACTOR;
          minX = (CANVAS_WIDTH - effectiveWidth) / 2 + PARTICLE_RADIUS;
          maxX = minX + effectiveWidth - PARTICLE_DIAMETER;
          minY = (CANVAS_HEIGHT - effectiveHeight) / 2 + PARTICLE_RADIUS;
          maxY = minY + effectiveHeight - PARTICLE_DIAMETER;
        }

        // Wall collision logic
        if (x < minX) { vx *= -restitution; x = minX + (minX - x) * restitution * 0.1; }
        if (x > maxX) { vx *= -restitution; x = maxX - (x - maxX) * restitution * 0.1; }
        if (y < minY) { vy *= -restitution; y = minY + (minY - y) * restitution * 0.1; if (matterState === 'liquid') vx *= 0.9; /* Floor friction */ }
        if (y > maxY) { vy *= -restitution; y = maxY - (y - maxY) * restitution * 0.1; }
        
        // Speed cap for non-gases to prevent explosion from accumulated forces
        if (matterState !== 'gas') {
          const MAX_SPEED_NON_GAS = 1.5 + K_TEMP_EFFECT * 0.5; // Slightly higher cap
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
  }, [matterState, temperatureFactor, pressureFactor, getParticleColorStops]); // Depends on these factors to recalculate forces

  /**
   * Draws the current state of the simulation on the canvas.
   * @param ctx - The 2D rendering context of the canvas.
   * @param currentParticles - Array of particles to draw.
   * @param currentMatterState - The current selected primary state.
   * @param currentPressureFactor - The current pressure factor.
   */
  const drawSimulation = useCallback((
    ctx: CanvasRenderingContext2D, 
    currentParticles: Particle[],
    currentMatterState: MatterState,
    currentPressureFactor: number
  ) => {
    const canvas = ctx.canvas;
    // Clear canvas with a subtle gradient
    const computedStyle = getComputedStyle(canvas);
    const mutedColorHSLVal = computedStyle.getPropertyValue('--muted').trim(); // e.g., "190 40% 80%"
    
    const bgGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    if (mutedColorHSLVal && mutedColorHSLVal.includes('%')) { // Check if it's a valid HSL string from CSS
        bgGradient.addColorStop(0, `hsla(${mutedColorHSLVal}, 0.6)`); // hsla(190 40% 80% / 0.6)
        bgGradient.addColorStop(1, `hsla(${mutedColorHSLVal}, 0.3)`);
    } else { // Fallback if CSS var isn't resolved as expected
        bgGradient.addColorStop(0, "rgba(220, 220, 230, 0.6)"); 
        bgGradient.addColorStop(1, "rgba(200, 200, 210, 0.3)");
    }
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw container for gas if pressure is applied
    if (currentMatterState === "gas") {
        const K_PRESSURE_CONFINEMENT_FACTOR = 0.5 + (1 - currentPressureFactor) * 2.0;
        const effectiveWidth = CANVAS_WIDTH / K_PRESSURE_CONFINEMENT_FACTOR;
        const effectiveHeight = CANVAS_HEIGHT / K_PRESSURE_CONFINEMENT_FACTOR;
        const offsetX = (CANVAS_WIDTH - effectiveWidth) / 2;
        const offsetY = (CANVAS_HEIGHT - effectiveHeight) / 2;
        ctx.strokeStyle = "hsl(var(--border))";
        ctx.lineWidth = 2;
        ctx.strokeRect(offsetX, offsetY, effectiveWidth, effectiveHeight);
    }

    // Draw each particle
    currentParticles.forEach(p => {
        const gradient = ctx.createRadialGradient(p.x, p.y, PARTICLE_RADIUS * 0.1, p.x, p.y, PARTICLE_RADIUS);
        if (p.colorStops && p.colorStops.length === 2) {
            gradient.addColorStop(p.colorStops[0].offset, p.colorStops[0].color);
            gradient.addColorStop(p.colorStops[1].offset, p.colorStops[1].color);
        } else { // Fallback gradient
            gradient.addColorStop(0, "rgba(120,120,120,0.95)");
            gradient.addColorStop(1, "rgba(80,80,80,0.4)");
        }
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, PARTICLE_RADIUS, 0, 2 * Math.PI);
        ctx.fill();
    });
  }, []); // No direct dependencies, uses passed arguments

  // Main animation loop effect
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const animate = () => {
      updateParticles(); // This will schedule a state update for `particles`
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [updateParticles]); // Re-run if updateParticles logic changes

  // Effect for drawing - runs whenever `particles` state (or other drawing-relevant states) change
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
        drawSimulation(ctx, particles, matterState, pressureFactor);
    }
  }, [particles, matterState, pressureFactor, drawSimulation]); // Redraw if these change

  // Effect for updating predicted state and P-V data when T or P changes
  useEffect(() => {
    const predState = getPredictedState(temperatureFactor, pressureFactor);
    setPredictedStateText(predState);

    // Calculate conceptual P and V for the graph
    let conceptualVolumeValue = PV_CHART_VOLUME_DOMAIN[0] + (PV_CHART_VOLUME_DOMAIN[1] - PV_CHART_VOLUME_DOMAIN[0]) * 0.15; // Default for solid/liquid
    let conceptualPressureValue = PV_CHART_PRESSURE_DOMAIN[0] + (PV_CHART_PRESSURE_DOMAIN[1] - PV_CHART_PRESSURE_DOMAIN[0]) * 0.3;

    if (matterState === "gas") {
      const K_PRESSURE_CONFINEMENT_FACTOR_FOR_PV = 0.5 + (1 - pressureFactor) * 2.0;
      // Volume is inversely related to pressure factor, temperature increases volume
      const baseVolume = PV_CHART_VOLUME_DOMAIN[1] * 0.7; 
      conceptualVolumeValue = (baseVolume / K_PRESSURE_CONFINEMENT_FACTOR_FOR_PV) * (1 + temperatureFactor * 0.25);
      
      // Pressure increases with temperature and pressure factor
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

    // Clamp values to chart domain
    conceptualVolumeValue = Math.max(PV_CHART_VOLUME_DOMAIN[0], Math.min(conceptualVolumeValue, PV_CHART_VOLUME_DOMAIN[1]));
    conceptualPressureValue = Math.max(PV_CHART_PRESSURE_DOMAIN[0], Math.min(conceptualPressureValue, PV_CHART_PRESSURE_DOMAIN[1]));

    setPvData([{ volume: conceptualVolumeValue, pressure: conceptualPressureValue }]);

  }, [temperatureFactor, pressureFactor, matterState, getPredictedState]);

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
                <Button variant="outline" size="icon"><HelpCircle className="h-5 w-5" /></Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 text-sm">
                <p>Select a primary state model (Solid, Liquid, Gas). Then, adjust Temperature and Pressure sliders to observe changes in particle behavior and the conceptual P-V diagram (most dynamic for gases).</p>
                <p className="mt-1">The "Predicted State" suggests the likely phase under the current T/P conditions.</p>
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Controls Column */}
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-xl">Controls</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="mb-2 block font-medium">Primary State Model</Label>
                    <RadioGroup value={matterState} onValueChange={(val) => setMatterState(val as MatterState)} className="flex space-x-2 sm:space-x-4">
                      {["solid", "liquid", "gas"].map(state => (
                        <div key={state} className="flex items-center space-x-1">
                          <RadioGroupItem value={state} id={`state-${state}`} />
                          <Label htmlFor={`state-${state}`} className="capitalize text-xs sm:text-sm">{state}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                  <div>
                    <Label htmlFor="temperature" className="flex items-center"><Thermometer className="mr-1 h-4 w-4 text-red-500" />Temperature: {(temperatureFactor * 100).toFixed(0)}%</Label>
                    <Slider id="temperature" min={0.01} max={1} step={0.01} value={[temperatureFactor]} onValueChange={(v) => setTemperatureFactor(v[0])} />
                  </div>
                  <div>
                    <Label htmlFor="pressure" className="flex items-center"><Wind className="mr-1 h-4 w-4 text-blue-500" />Pressure: {(pressureFactor * 100).toFixed(0)}%</Label>
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
                  <div className="pt-2 text-xs text-muted-foreground space-y-1">
                    {matterState === "solid" && <p><b>Solid Model:</b> Particles vibrate in fixed lattice positions. High T increases vibration amplitude. High P conceptually strengthens lattice bonds, slightly compressing.</p>}
                    {matterState === "liquid" && <p><b>Liquid Model:</b> Particles are close, cohesive, but mobile, taking container shape. High T increases fluidity/energy. High P increases internal agitation and resistance to flow.</p>}
                    {matterState === "gas" && <p><b>Gas Model:</b> Particles are far apart, move freely, filling available volume. High T increases particle speed. High P reduces volume, increasing collision frequency.</p>}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Visualization and Graph Column */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="h-full">
                <CardHeader><CardTitle className="text-lg">Particle Visualization</CardTitle></CardHeader>
                <CardContent className="flex items-center justify-center p-0">
                  <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="rounded-md border border-input shadow-inner"></canvas>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-lg flex items-center"><BarChart2 className="mr-2 h-5 w-5 text-green-500" />Conceptual P-V Diagram</CardTitle></CardHeader>
                <CardContent>
                  {(matterState === 'solid' || matterState === 'liquid') && predictedStateText !== 'Gas' && predictedStateText !== 'Boiling' && predictedStateText !== 'Supercritical Fluid' ? (
                    <div className="h-[200px] flex items-center justify-center text-center text-muted-foreground text-sm">
                      <p>P-V diagram is most illustrative for gases. <br /> Solids and liquids have minimal volume changes with pressure in this simplified model.</p>
                    </div>
                  ) : (
                    <ChartContainer config={pvChartConfig} className="h-[200px] w-full">
                      <ScatterChart margin={{ top: 5, right: 30, bottom: 25, left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          type="number"
                          dataKey="volume"
                          name="Volume"
                          domain={PV_CHART_VOLUME_DOMAIN}
                          tickFormatter={(val) => val.toFixed(1)}
                          label={{ value: "Conceptual Volume (V)", position: "insideBottom", offset: -15, fontSize: 10 }}
                        />
                        <YAxis
                          type="number"
                          dataKey="pressure"
                          name="Pressure"
                          domain={PV_CHART_PRESSURE_DOMAIN}
                          tickFormatter={(val) => val.toFixed(1)}
                          label={{ value: "Conceptual Pressure (P)", angle: -90, position: "insideLeft", offset: 0, fontSize: 10 }}
                        />
                        <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} content={<ChartTooltipContent />} />
                        <Scatter name="Current State (P,V)" data={pvData} fill="hsl(var(--primary))" />
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
