
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, HelpCircle, Thermometer, Wind } from "lucide-react";
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
  const [temperatureFactor, setTemperatureFactor] = useState(0.3); // 0 to 1
  const [pressureFactor, setPressureFactor] = useState(0.3); // 0 to 1
  const [particles, setParticles] = useState<Particle[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();

  const initializeParticles = useCallback(() => {
    const newParticles: Particle[] = [];
    const particlePadding = PARTICLE_RADIUS * 2.5;

    for (let i = 0; i < NUM_PARTICLES; i++) {
      let p: Partial<Particle> = { id: i };
      if (matterState === "solid") {
        const cols = Math.floor(Math.sqrt(NUM_PARTICLES * (CANVAS_WIDTH / particlePadding) / (CANVAS_HEIGHT / particlePadding))) || 1;
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
        p.x = Math.random() * (CANVAS_WIDTH - PARTICLE_RADIUS * 4) + PARTICLE_RADIUS * 2;
        p.y = CANVAS_HEIGHT * 0.7 + Math.random() * (CANVAS_HEIGHT * 0.3 - PARTICLE_RADIUS * 2); // Start lower
        const angle = Math.random() * 2 * Math.PI;
        const speed = 0.1 + Math.random() * 0.1; // Slower initial speed
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
    const tempEffect = 0.1 + temperatureFactor * 1.5; // Overall energy/speed scaling

    // For liquids, calculate center of mass
    let centerX = 0, centerY = 0;
    if (matterState === 'liquid' && particles.length > 0) {
        particles.forEach(p => { centerX += p.x; centerY += p.y; });
        centerX /= particles.length;
        centerY /= particles.length;
    }

    setParticles(prevParticles =>
      prevParticles.map(p => {
        let { x, y, vx, vy } = p; // Current position and velocity
        let ax = 0, ay = 0;   // Accumulate accelerations for this frame

        if (matterState === "solid") {
          if (p.initialX === undefined || p.initialY === undefined) { // Should not happen if initialized correctly
            return p; // Skip update if initial position is missing
          }
          const restoringForceFactor = 0.2 * (1 + pressureFactor); // Pressure increases stiffness
          const vibrationStrength = 0.05 * tempEffect;

          ax += (p.initialX - x) * restoringForceFactor; // Pull towards initialX
          ay += (p.initialY - y) * restoringForceFactor; // Pull towards initialY

          ax += (Math.random() - 0.5) * vibrationStrength; // Random vibration
          ay += (Math.random() - 0.5) * vibrationStrength;

          vx += ax;
          vy += ay;

          vx *= 0.8; // Damping for stability
          vy *= 0.8;

          x += vx * tempEffect;
          y += vy * tempEffect;

          // Clamp to small region around initial position to prevent drifting
          const maxDisplacement = PARTICLE_RADIUS * (0.3 + tempEffect * 0.7);
          x = Math.max(p.initialX - maxDisplacement, Math.min(x, p.initialX + maxDisplacement));
          y = Math.max(p.initialY - maxDisplacement, Math.min(y, p.initialY + maxDisplacement));


        } else if (matterState === "liquid") {
          // Gravity
          ay += 0.030 * tempEffect;

          // Cohesion (gentle pull towards average Y, very weak pull towards average X)
          const horizontalCohesionForce = 0.0001 * tempEffect;
          const verticalCohesionForce = 0.002 * tempEffect;
          ax += (centerX - x) * horizontalCohesionForce;
          ay += (centerY - y) * verticalCohesionForce;

          // Agitation from temperature & pressure
          const agitationStrength = 0.08 * (0.5 + tempEffect) * (0.5 + pressureFactor);
          ax += (Math.random() - 0.5) * agitationStrength;
          ay += (Math.random() - 0.5) * agitationStrength;

          vx += ax;
          vy += ay;

          x += vx * tempEffect;
          y += vy * tempEffect;

          // Wall collisions
          if (x < PARTICLE_RADIUS) { vx *= -0.4; x = PARTICLE_RADIUS; }
          if (x > CANVAS_WIDTH - PARTICLE_RADIUS) { vx *= -0.4; x = CANVAS_WIDTH - PARTICLE_RADIUS; }
          if (y < PARTICLE_RADIUS) { vy *= -0.2; y = PARTICLE_RADIUS; vx *= 0.9; } // Floor, less bounce, friction
          if (y > CANVAS_HEIGHT - PARTICLE_RADIUS) { vy *= -0.4; y = CANVAS_HEIGHT - PARTICLE_RADIUS; }

          // Damping (viscosity)
          vx *= 0.97;
          vy *= 0.97;

        } else { // Gas
          const effectivePressure = 0.5 + pressureFactor * 1.5; // Higher pressure = smaller volume/more energetic
          const effectiveCanvasWidth = CANVAS_WIDTH / (effectivePressure * 0.4 + 0.6);
          const effectiveCanvasHeight = CANVAS_HEIGHT / (effectivePressure * 0.4 + 0.6);
          const offsetX = (CANVAS_WIDTH - effectiveCanvasWidth) / 2;
          const offsetY = (CANVAS_HEIGHT - effectiveCanvasHeight) / 2;

          // No external forces like gravity or cohesion for gas in this simple model
          // Velocity is mainly changed by temperature and collisions

          x += vx * tempEffect;
          y += vy * tempEffect;

          if (x < offsetX + PARTICLE_RADIUS || x > offsetX + effectiveCanvasWidth - PARTICLE_RADIUS) {
            vx *= -0.95; // Slightly inelastic collision
            x = Math.max(offsetX + PARTICLE_RADIUS, Math.min(x, offsetX + effectiveCanvasWidth - PARTICLE_RADIUS));
          }
          if (y < offsetY + PARTICLE_RADIUS || y > offsetY + effectiveCanvasHeight - PARTICLE_RADIUS) {
            vy *= -0.95;
            y = Math.max(offsetY + PARTICLE_RADIUS, Math.min(y, offsetY + effectiveCanvasHeight - PARTICLE_RADIUS));
          }
           // Add slight random changes to velocity to simulate thermal energy
           vx += (Math.random() - 0.5) * 0.02 * tempEffect;
           vy += (Math.random() - 0.5) * 0.02 * tempEffect;

            // Speed limit for gas particles to prevent runaway velocities
            const maxSpeed = 2.5 * tempEffect;
            const speed = Math.sqrt(vx*vx + vy*vy);
            if (speed > maxSpeed) {
                vx = (vx / speed) * maxSpeed;
                vy = (vy / speed) * maxSpeed;
            }
        }
        return { ...p, x, y, vx, vy };
      })
    );
  }, [matterState, temperatureFactor, pressureFactor, particles]); // particles dependency for liquid CoM

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      if (matterState === "gas") {
        const effectivePressure = 0.5 + pressureFactor * 1.5;
        let effectiveCanvasWidth = CANVAS_WIDTH / (effectivePressure * 0.4 + 0.6);
        let effectiveCanvasHeight = CANVAS_HEIGHT / (effectivePressure * 0.4 + 0.6);
        let offsetX = (CANVAS_WIDTH - effectiveCanvasWidth) / 2;
        let offsetY = (CANVAS_HEIGHT - effectiveCanvasHeight) / 2;

        ctx.strokeStyle = "hsl(var(--border) / 0.7)";
        ctx.lineWidth = 2;
        ctx.strokeRect(offsetX, offsetY, effectiveCanvasWidth, effectiveCanvasHeight);
      }

      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, PARTICLE_RADIUS, 0, 2 * Math.PI);
        let particleColor = "hsl(var(--primary))";
        if (matterState === "liquid") particleColor = "hsl(var(--chart-2))";
        else if (matterState === "gas") particleColor = "hsl(var(--chart-3))";
        
        ctx.fillStyle = particleColor;
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
                  <li><b>Gas:</b> Particles move freely. Pressure affects their available volume and collision rate.</li>
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
                            <p>Particles in a solid are tightly packed and vibrate about fixed positions. They have strong forces of attraction.</p>
                            <p>Higher temperature increases vibration. Higher pressure constrains vibrations slightly and makes the structure more rigid.</p>
                        </>}
                        {matterState === "liquid" && <>
                            <p>Particles in a liquid are close together but can move past each other. Forces of attraction are weaker than solids but keep particles from flying apart. They take the shape of the bottom of their container.</p>
                            <p>Higher temperature increases particle speed and fluidity. Higher pressure increases agitation and interaction within the confined space.</p>
                        </>}
                        {matterState === "gas" && <>
                            <p>Particles in a gas are far apart and move randomly at high speeds. Forces of attraction are very weak. They fill their container.</p>
                            <p>Higher temperature increases particle speed. Higher pressure reduces the effective volume, leading to more frequent collisions with walls and each other.</p>
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
