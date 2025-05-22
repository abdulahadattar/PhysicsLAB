
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, HelpCircle, Thermometer, Wind } from "lucide-react"; // Added Wind for pressure
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const CANVAS_WIDTH = 300;
const CANVAS_HEIGHT = 200;
const NUM_PARTICLES = 50;
const PARTICLE_RADIUS = 4;

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  initialX?: number; 
  initialY?: number; 
}

type MatterState = "solid" | "liquid" | "gas";

export default function StatesOfMatterPage() {
  const [matterState, setMatterState] = useState<MatterState>("solid");
  const [temperatureFactor, setTemperatureFactor] = useState(0.3); // 0 to 1, default lower
  const [pressureFactor, setPressureFactor] = useState(0.3); // 0 to 1, conceptual
  const [particles, setParticles] = useState<Particle[]>([]);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();

  const initializeParticles = useCallback(() => {
    const newParticles: Particle[] = [];
    const particlePadding = PARTICLE_RADIUS * 2.5; // Ensure particles don't start on edge

    for (let i = 0; i < NUM_PARTICLES; i++) {
      let p: Partial<Particle> = { id: i };
      if (matterState === "solid") {
        const cols = Math.floor(Math.sqrt(NUM_PARTICLES * (CANVAS_WIDTH / particlePadding) / (CANVAS_HEIGHT / particlePadding)));
        const rows = Math.ceil(NUM_PARTICLES / cols);
        const spacingX = (CANVAS_WIDTH - 2 * particlePadding) / Math.max(1, cols -1 );
        const spacingY = (CANVAS_HEIGHT - 2 * particlePadding) / Math.max(1, rows -1);
        
        p.initialX = particlePadding + (i % cols) * spacingX;
        p.initialY = particlePadding + Math.floor(i / cols) * spacingY;
        p.x = p.initialX;
        p.y = p.initialY;
        p.vx = 0;
        p.vy = 0;
      } else if (matterState === "liquid") {
        // Start liquids more clustered at the bottom
        p.x = Math.random() * (CANVAS_WIDTH - PARTICLE_RADIUS * 4) + PARTICLE_RADIUS * 2;
        p.y = CANVAS_HEIGHT * 0.6 + Math.random() * (CANVAS_HEIGHT * 0.4 - PARTICLE_RADIUS * 2);
        const angle = Math.random() * 2 * Math.PI;
        const speed = 0.3 + Math.random() * 0.2;
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
      } else { // Gas
        p.x = Math.random() * (CANVAS_WIDTH - PARTICLE_RADIUS * 2) + PARTICLE_RADIUS;
        p.y = Math.random() * (CANVAS_HEIGHT - PARTICLE_RADIUS * 2) + PARTICLE_RADIUS;
        const angle = Math.random() * 2 * Math.PI;
        let speed = 0.5 + Math.random() * 0.5;
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
      }
      newParticles.push(p as Particle);
    }
    setParticles(newParticles);
  }, [matterState]);

  useEffect(() => {
    initializeParticles();
  }, [initializeParticles]);

  const updateParticles = useCallback(() => {
    const tempEffect = 0.1 + temperatureFactor * 1.5; // Increased range for temperature effect
    const pressureEffect = 0.5 + pressureFactor * 1.5; // How "squished" or agitated they are by pressure

    // For liquids, calculate center of mass to apply cohesive force
    let centerX = 0, centerY = 0;
    if (matterState === 'liquid' && particles.length > 0) {
        particles.forEach(p => { centerX += p.x; centerY += p.y; });
        centerX /= particles.length;
        centerY /= particles.length;
    }

    setParticles(prevParticles => 
      prevParticles.map(p => {
        let newX = p.x, newY = p.y, newVx = p.vx, newVy = p.vy;

        if (matterState === "solid") {
          const vibStrength = 0.15 * tempEffect * (2 - pressureFactor); // Pressure dampens vibration
          newVx = (Math.random() - 0.5) * vibStrength;
          newVy = (Math.random() - 0.5) * vibStrength;
          newX = p.initialX! + newVx; 
          newY = p.initialY! + newVy;
          
          // Keep within small bounds of initial position
          const maxDisplacement = PARTICLE_RADIUS * 0.5 * tempEffect;
          newX = Math.max(p.initialX! - maxDisplacement, Math.min(newX, p.initialX! + maxDisplacement));
          newY = Math.max(p.initialY! - maxDisplacement, Math.min(newY, p.initialY! + maxDisplacement));

        } else if (matterState === "liquid") {
          // Gravity effect
          newVy += 0.03 * tempEffect; 

          // Cohesion: gentle pull towards center of mass of liquid particles
          const cohesionForce = 0.002 * tempEffect;
          newVx += (centerX - newX) * cohesionForce;
          newVy += (centerY - newY) * cohesionForce;
          
          // Pressure: increases agitation/jostling
          newVx += (Math.random() - 0.5) * 0.1 * pressureEffect * tempEffect;
          newVy += (Math.random() - 0.5) * 0.1 * pressureEffect * tempEffect;

          newX += newVx * tempEffect;
          newY += newVy * tempEffect;

          // Wall collisions
          if (newX < PARTICLE_RADIUS) { newVx *= -0.8; newX = PARTICLE_RADIUS; }
          if (newX > CANVAS_WIDTH - PARTICLE_RADIUS) { newVx *= -0.8; newX = CANVAS_WIDTH - PARTICLE_RADIUS; }
          if (newY < PARTICLE_RADIUS) { newVy *= -0.5; newY = PARTICLE_RADIUS; } // More damping on floor
          if (newY > CANVAS_HEIGHT - PARTICLE_RADIUS) { newVy *= -0.8; newY = CANVAS_HEIGHT - PARTICLE_RADIUS; }
          
          // Dampen overall velocity to simulate viscosity
          newVx *= 0.98; 
          newVy *= 0.98;

        } else { // Gas
          let effectiveCanvasWidth = CANVAS_WIDTH / (pressureEffect * 0.5 + 0.5); // Pressure reduces effective volume
          let effectiveCanvasHeight = CANVAS_HEIGHT / (pressureEffect * 0.5 + 0.5);
          let offsetX = (CANVAS_WIDTH - effectiveCanvasWidth) / 2;
          let offsetY = (CANVAS_HEIGHT - effectiveCanvasHeight) / 2;
          
          newX += newVx * tempEffect;
          newY += newVy * tempEffect;

          // Wall collisions with virtual container
          if (newX < offsetX + PARTICLE_RADIUS || newX > offsetX + effectiveCanvasWidth - PARTICLE_RADIUS) {
            newVx *= -1;
            newX = Math.max(offsetX + PARTICLE_RADIUS, Math.min(newX, offsetX + effectiveCanvasWidth - PARTICLE_RADIUS));
          }
          if (newY < offsetY + PARTICLE_RADIUS || newY > offsetY + effectiveCanvasHeight - PARTICLE_RADIUS) {
            newVy *= -1;
            newY = Math.max(offsetY + PARTICLE_RADIUS, Math.min(newY, offsetY + effectiveCanvasHeight - PARTICLE_RADIUS));
          }
        }
        return { ...p, x: newX, y: newY, vx: newVx, vy: newVy };
      })
    );
  }, [matterState, temperatureFactor, pressureFactor, particles]); // particles dependency for liquid CoM

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw virtual container for gas under pressure
      if (matterState === "gas") {
        const pressureEffect = 0.5 + pressureFactor * 1.5;
        let effectiveCanvasWidth = CANVAS_WIDTH / (pressureEffect * 0.5 + 0.5);
        let effectiveCanvasHeight = CANVAS_HEIGHT / (pressureEffect * 0.5 + 0.5);
        let offsetX = (CANVAS_WIDTH - effectiveCanvasWidth) / 2;
        let offsetY = (CANVAS_HEIGHT - effectiveCanvasHeight) / 2;

        ctx.strokeStyle = "hsl(var(--border))";
        ctx.lineWidth = 1;
        ctx.strokeRect(offsetX, offsetY, effectiveCanvasWidth, effectiveCanvasHeight);
      }
      
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, PARTICLE_RADIUS, 0, 2 * Math.PI);
        ctx.fillStyle = matterState === "solid" ? "hsl(var(--primary))" : matterState === "liquid" ? "hsl(var(--chart-2))" : "hsl(var(--chart-3))";
        if (matterState === "liquid" && p.y < PARTICLE_RADIUS + 2) { // Darker if near bottom for liquid
            ctx.fillStyle = "hsl(var(--chart-2) / 0.7)";
        }
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
  }, [particles, updateParticles, matterState, pressureFactor]); // Added pressureFactor for gas container drawing

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
              <CardTitle className="text-3xl">States of Matter - Particle Model</CardTitle>
              <CardDescription>Grade 9 - Visualize particle behavior in solids, liquids, and gases. Adjust temperature and conceptual pressure.</CardDescription>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon"><HelpCircle className="h-5 w-5"/></Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 text-sm">
                <p>Select a state of matter, adjust temperature, and conceptual pressure to see how particles behave.</p>
                <ul className="list-disc pl-5 mt-2">
                  <li><b>Solid:</b> Particles vibrate in fixed positions.</li>
                  <li><b>Liquid:</b> Particles move around, stay close, and take container shape.</li>
                  <li><b>Gas:</b> Particles move freely and fill the container. Pressure affects their available volume.</li>
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
                    <Label className="mb-2 block">State of Matter</Label>
                    <RadioGroup value={matterState} onValueChange={(val) => setMatterState(val as MatterState)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="solid" id="solid" />
                        <Label htmlFor="solid">Solid</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="liquid" id="liquid" />
                        <Label htmlFor="liquid">Liquid</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="gas" id="gas" />
                        <Label htmlFor="gas">Gas</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div>
                    <Label htmlFor="temperature" className="flex items-center"><Thermometer className="mr-1 h-4 w-4"/>Temperature: {(temperatureFactor * 100).toFixed(0)}%</Label>
                    <Slider id="temperature" min={0} max={1} step={0.05} value={[temperatureFactor]} onValueChange={(v) => setTemperatureFactor(v[0])} />
                  </div>
                  <div>
                    <Label htmlFor="pressure" className="flex items-center"><Wind className="mr-1 h-4 w-4"/>Pressure (Conceptual): {(pressureFactor * 100).toFixed(0)}%</Label>
                    <Slider id="pressure" min={0} max={1} step={0.05} value={[pressureFactor]} onValueChange={(v) => setPressureFactor(v[0])} />
                  </div>
                </CardContent>
              </Card>
                 <Card>
                    <CardHeader><CardTitle className="text-xl">Description</CardTitle></CardHeader>
                    <CardContent className="text-sm space-y-1">
                        {matterState === "solid" && <>
                            <p>Particles in a solid are tightly packed, often in a regular pattern, and vibrate about fixed positions. They have strong forces of attraction.</p>
                            <p>Higher temperature increases vibration. Higher pressure slightly constrains vibrations.</p>
                        </>}
                        {matterState === "liquid" && <>
                            <p>Particles in a liquid are close together but can move past each other, allowing liquids to flow and take the shape of their container (bottom part). Forces of attraction are weaker than solids but keep particles together.</p>
                            <p>Higher temperature increases particle speed. Higher pressure increases agitation in the confined space.</p>
                        </>}
                        {matterState === "gas" && <>
                            <p>Particles in a gas are far apart and move randomly at high speeds. They fill their container completely. Forces of attraction are very weak.</p>
                            <p>Higher temperature increases particle speed. Higher pressure reduces the effective volume particles occupy, increasing collision frequency.</p>
                        </>}
                        
                    </CardContent>
                </Card>
            </div>
            <div className="md:col-span-2">
              <Card className="h-full">
                <CardHeader><CardTitle className="text-lg">Particle Visualization</CardTitle></CardHeader>
                <CardContent className="flex items-center justify-center p-2">
                  <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="bg-muted rounded-md border"></canvas>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


    