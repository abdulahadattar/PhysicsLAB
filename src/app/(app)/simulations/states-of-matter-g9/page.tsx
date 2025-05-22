
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, HelpCircle, Thermometer } from "lucide-react";
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
  x: number;
  y: number;
  vx: number;
  vy: number;
  initialX?: number; // For solids
  initialY?: number; // For solids
}

type MatterState = "solid" | "liquid" | "gas";

export default function StatesOfMatterPage() {
  const [matterState, setMatterState] = useState<MatterState>("solid");
  const [temperatureFactor, setTemperatureFactor] = useState(0.5); // 0 to 1
  const [particles, setParticles] = useState<Particle[]>([]);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();

  const initializeParticles = useCallback(() => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < NUM_PARTICLES; i++) {
      let p: Partial<Particle> = {};
      if (matterState === "solid") {
        const cols = Math.floor(Math.sqrt(NUM_PARTICLES * CANVAS_WIDTH / CANVAS_HEIGHT));
        const rows = Math.ceil(NUM_PARTICLES / cols);
        const spacingX = CANVAS_WIDTH / (cols + 1);
        const spacingY = CANVAS_HEIGHT / (rows + 1);
        p.initialX = ((i % cols) + 1) * spacingX;
        p.initialY = (Math.floor(i / cols) + 1) * spacingY;
        p.x = p.initialX;
        p.y = p.initialY;
        p.vx = 0;
        p.vy = 0;
      } else {
        p.x = Math.random() * (CANVAS_WIDTH - PARTICLE_RADIUS * 2) + PARTICLE_RADIUS;
        p.y = Math.random() * (CANVAS_HEIGHT - PARTICLE_RADIUS * 2) + PARTICLE_RADIUS;
        const angle = Math.random() * 2 * Math.PI;
        let speed = 0.5; // Base speed for liquid/gas
        if (matterState === "gas") speed = 1.5;
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
    setParticles(prevParticles => 
      prevParticles.map(p => {
        let newX = p.x, newY = p.y, newVx = p.vx, newVy = p.vy;
        const speedFactor = 0.2 + temperatureFactor * 2; // Base speed influenced by temp

        if (matterState === "solid") {
          const vibStrength = 0.2 * speedFactor;
          newVx = (Math.random() - 0.5) * vibStrength;
          newVy = (Math.random() - 0.5) * vibStrength;
          newX = p.initialX! + newVx; // Vibrate around initial position
          newY = p.initialY! + newVy;
           // Keep within bounds loosely
          if (newX < p.initialX! - PARTICLE_RADIUS*2) newX = p.initialX! - PARTICLE_RADIUS*2;
          if (newX > p.initialX! + PARTICLE_RADIUS*2) newX = p.initialX! + PARTICLE_RADIUS*2;
          if (newY < p.initialY! - PARTICLE_RADIUS*2) newY = p.initialY! - PARTICLE_RADIUS*2;
          if (newY > p.initialY! + PARTICLE_RADIUS*2) newY = p.initialY! + PARTICLE_RADIUS*2;

        } else { // Liquid or Gas
          newX += newVx * speedFactor;
          newY += newVy * speedFactor;

          // Wall collisions
          if (newX < PARTICLE_RADIUS || newX > CANVAS_WIDTH - PARTICLE_RADIUS) {
            newVx *= -1;
            newX = Math.max(PARTICLE_RADIUS, Math.min(newX, CANVAS_WIDTH - PARTICLE_RADIUS));
          }
          if (newY < PARTICLE_RADIUS || newY > CANVAS_HEIGHT - PARTICLE_RADIUS) {
            newVy *= -1;
            newY = Math.max(PARTICLE_RADIUS, Math.min(newY, CANVAS_HEIGHT - PARTICLE_RADIUS));
          }

          if (matterState === "liquid") {
             // Simple attraction to center for liquid feel (very basic)
            const centerPull = 0.005 * speedFactor;
            newVx += (CANVAS_WIDTH/2 - newX) * centerPull * 0.1;
            newVy += (CANVAS_HEIGHT/2 - newY) * centerPull * 0.1;
            // Dampen velocity
            newVx *= 0.99; 
            newVy *= 0.99;
          }
        }
        return { ...p, x: newX, y: newY, vx: newVx, vy: newVy };
      })
    );
  }, [matterState, temperatureFactor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, PARTICLE_RADIUS, 0, 2 * Math.PI);
        ctx.fillStyle = matterState === "solid" ? "hsl(var(--primary))" : matterState === "liquid" ? "hsl(var(--chart-2))" : "hsl(var(--chart-3))";
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
  }, [particles, updateParticles, matterState]);

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
              <CardDescription>Grade 9 - Visualize particle behavior in solids, liquids, and gases.</CardDescription>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon"><HelpCircle className="h-5 w-5"/></Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 text-sm">
                <p>Select a state of matter and adjust the temperature to see how particles behave.</p>
                <ul className="list-disc pl-5 mt-2">
                  <li><b>Solid:</b> Particles vibrate in fixed positions.</li>
                  <li><b>Liquid:</b> Particles move around but stay close.</li>
                  <li><b>Gas:</b> Particles move freely and fill the container.</li>
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
                    <Label htmlFor="temperature" className="flex items-center"><Thermometer className="mr-1 h-4 w-4"/>Temperature (Conceptual): {(temperatureFactor * 100).toFixed(0)}%</Label>
                    <Slider id="temperature" min={0} max={1} step={0.05} value={[temperatureFactor]} onValueChange={(v) => setTemperatureFactor(v[0])} />
                  </div>
                </CardContent>
              </Card>
                 <Card>
                    <CardHeader><CardTitle className="text-xl">Description</CardTitle></CardHeader>
                    <CardContent className="text-sm">
                        {matterState === "solid" && "Particles in a solid are tightly packed in a regular pattern and vibrate about fixed positions. They have strong forces of attraction."}
                        {matterState === "liquid" && "Particles in a liquid are close together but can move past each other. They take the shape of their container. Forces of attraction are weaker than solids."}
                        {matterState === "gas" && "Particles in a gas are far apart and move randomly at high speeds. They fill their container completely. Forces of attraction are very weak."}
                        <p className="mt-2">Increasing temperature generally increases the kinetic energy and speed of particles.</p>
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

