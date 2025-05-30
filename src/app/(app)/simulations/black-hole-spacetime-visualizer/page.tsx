// src/app/(app)/simulations/black-hole-spacetime-visualizer-g12/page.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Construction, Orbit, RefreshCw, PlusCircle } from "lucide-react"; // Added RefreshCw, PlusCircle
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { useRef, useEffect, useState, useCallback } from "react"; // Added useCallback
import { Slider } from "@/components/ui/slider"; // Assuming ShadCN Slider component
import { Label } from "@/components/ui/label"; // Assuming ShadCN Label component


// Define types for the simulation objects
interface Mass {
  id: number; // Unique identifier for masses
  x: number;
  y: number;
  mass: number; // Represents the strength of spacetime distortion
}

interface Particle {
  id: number; // Unique identifier for particles
  x: number;
  y: number;
  vx: number; // Velocity in x direction
  vy: number; // Velocity in y direction
  color: string; // Particle color (optional)
}

export default function BlackHoleSpacetimeVisualizerPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null); // Ref to store animation frame ID

  const [masses, setMasses] = useState<Mass[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [currentMassValue, setCurrentMassValue] = useState<number>(100); // State for mass slider
  const [addMode, setAddMode] = useState<'mass' | 'particle'>('mass'); // State for adding mode

  // Unique ID counters (simple approach, could use UUIDs for robustness)
  const massIdCounter = useRef<number>(0);
  const particleIdCounter = useRef<number>(0);


  // Function to calculate displacement for a point based on all masses
  // This is the core "rubber sheet" logic
  const calculateDisplacement = useCallback((px: number, py: number): number => {
    let totalDisplacement = 0;
    masses.forEach(massObj => {
      const dx = px - massObj.x;
      const dy = py - massObj.y;
      const distanceSquared = dx * dx + dy * dy;
      // Use a small minimum distance to avoid extreme values at the mass location
      const distance = Math.max(Math.sqrt(distanceSquared), 10); // Increased minimum distance

      // Simplified inverse square law analogy for displacement
      // The power (e.g., 1.5) can be adjusted for different visual falloffs
      // The multiplier (10000) can be adjusted for the overall strength of the dip
      const displacement = (massObj.mass * 10000) / Math.pow(distance, 1.5);

      // Optional: Limit maximum displacement to prevent grid lines from collapsing too much
      const maxDisplacement = 150; // Adjust as needed
      totalDisplacement += Math.min(displacement, maxDisplacement);
    });
    return totalDisplacement;
  }, [masses]); // Recalculate only when masses change


  // Function to draw the grid
  const drawGrid = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = "#4A5568"; // text-muted-foreground/60
    ctx.lineWidth = 0.5;

    const gridSize = 20;

    // Draw vertical lines
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0 - calculateDisplacement(x, 0));
      for (let y = gridSize; y <= height; y += gridSize) {
           const currentDisplacement = calculateDisplacement(x, y);
           ctx.lineTo(x, y - currentDisplacement);
      }
      ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      const startX = 0;
      ctx.moveTo(startX, y - calculateDisplacement(startX, y));
      for (let x = gridSize; x <= width; x += gridSize) {
           const currentDisplacement = calculateDisplacement(x, y);
           ctx.lineTo(x, y - currentDisplacement);
      }
      ctx.stroke();
    }
  }, [calculateDisplacement]); // Recalculate only when calculateDisplacement changes


  // Function to draw masses and event horizons
  const drawMasses = useCallback((ctx: CanvasRenderingContext2D) => {
      masses.forEach(massObj => {
          // Draw mass point
          ctx.fillStyle = "red";
          ctx.beginPath();
          // Draw the mass at its calculated displaced position for consistency
          const displacedY = massObj.y - calculateDisplacement(massObj.x, massObj.y);
          ctx.arc(massObj.x, displacedY, 6, 0, Math.PI * 2); // Slightly larger dot for mass
          ctx.fill();

          // Draw Event Horizon (simplified) for large masses
          const eventHorizonThreshold = 300; // Mass value threshold for event horizon
          if (massObj.mass > eventHorizonThreshold) {
              const eventHorizonRadius = massObj.mass * 0.2; // Simplified radius calculation
              ctx.strokeStyle = "rgba(255, 165, 0, 0.7)"; // Orange, semi-transparent
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              // Draw the event horizon circle around the mass's displaced position
              ctx.arc(massObj.x, displacedY, eventHorizonRadius, 0, Math.PI * 2);
              ctx.stroke();
          }
      });
  }, [masses, calculateDisplacement]); // Recalculate only when masses or displacement changes


  // Function to draw particles
  const drawParticles = useCallback((ctx: CanvasRenderingContext2D) => {
    particles.forEach(particle => {
        ctx.fillStyle = particle.color || "blue"; // Default to blue
        ctx.beginPath();
        // Draw the particle at its calculated displaced position
        const displacedY = particle.y - calculateDisplacement(particle.x, particle.y);
        ctx.arc(particle.x, displacedY, 3, 0, Math.PI * 2); // Small dot for particle
        ctx.fill();
    });
  }, [particles, calculateDisplacement]); // Recalculate only when particles or displacement changes


   // Function to update particle positions based on simplified physics
   const updateParticles = useCallback(() => {
       const canvas = canvasRef.current;
       if (!canvas) return;
       const width = canvas.width;
       const height = canvas.height;


       setParticles(prevParticles =>
           prevParticles.map(particle => {
               let totalForceX = 0;
               let totalForceY = 0;

               masses.forEach(massObj => {
                   const dx = massObj.x - particle.x;
                   const dy = (massObj.y - calculateDisplacement(massObj.x, massObj.y)) - (particle.y - calculateDisplacement(particle.x, particle.y)); // Consider displaced y for force
                   const distanceSquared = dx * dx + dy * dy;
                   const distance = Math.max(Math.sqrt(distanceSquared), 20); // Minimum distance for force calculation

                   // Simplified gravitational force (inverse square)
                   const force = (massObj.mass * 5) / distanceSquared; // Adjust multiplier (5) as needed
                   const angle = Math.atan2(dy, dx);

                   totalForceX += force * Math.cos(angle);
                   totalForceY += force * Math.sin(angle);
               });

               // Apply force to velocity
               const accelerationX = totalForceX; // Assuming mass of particle is 1
               const accelerationY = totalForceY;
               let newVx = particle.vx + accelerationX;
               let newVy = particle.vy + accelerationY;

               // Optional: Add some damping to prevent excessive speed
               const damping = 0.99;
               newVx *= damping;
               newVy *= damping;


               // Apply velocity to position
               let newX = particle.x + newVx;
               let newY = particle.y + newVy;

               // Handle boundary conditions (wrap around)
               if (newX < 0) newX += width;
               if (newX > width) newX -= width;
               if (newY < 0) newY += height;
               if (newY > height) newY -= height;


               return {
                   ...particle,
                   x: newX,
                   y: newY,
                   vx: newVx,
                   vy: newVy,
               };
           })
           // Optional: Filter out particles that might have gone far off-screen or are stuck
           // .filter(particle => particle.x > -100 && particle.x < width + 100 && particle.y > -100 && particle.y < height + 100) // Example filter
       );
   }, [masses, calculateDisplacement]); // Recalculate when masses or displacement changes


  // The main animation loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    const container = canvas?.parentElement;

    if (!canvas || !context || !container) return;

    // Resize canvas if container size changed (basic check)
    if (canvas.width !== container.clientWidth || canvas.height !== container.clientHeight) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
    }

    // Clear and redraw
    drawGrid(context, canvas.width, canvas.height);
    drawMasses(context); // Draw masses before particles
    updateParticles(); // Update particle positions
    drawParticles(context); // Draw particles

    // Request the next frame
    animationFrameId.current = requestAnimationFrame(animate);

  }, [drawGrid, drawMasses, updateParticles, drawParticles]); // Depend on drawing/updating functions


  // Effect to start and stop the animation loop
  useEffect(() => {
      animate(); // Start the animation loop

      // Cleanup function to stop the animation
      return () => {
          if (animationFrameId.current) {
              cancelAnimationFrame(animationFrameId.current);
          }
      };
  }, [animate]); // Restart effect if animate function changes (due to useCallback dependencies)


  // Function to handle clicks on the canvas to add mass or particle
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (addMode === 'mass') {
      massIdCounter.current += 1;
      const newMass: Mass = { id: massIdCounter.current, x, y, mass: currentMassValue };
      setMasses(prevMasses => [...prevMasses, newMass]);
    } else { // addMode === 'particle'
        particleIdCounter.current += 1;
        const newParticle: Particle = {
            id: particleIdCounter.current,
            x, y,
            vx: (Math.random() - 0.5) * 5, // Random initial velocity
            vy: (Math.random() - 0.5) * 5,
            color: 'blue' // Default color
        };
        setParticles(prevParticles => [...prevParticles, newParticle]);
    }
  };

   // Function to reset the simulation
   const resetSimulation = () => {
       setMasses([]);
       setParticles([]);
       massIdCounter.current = 0;
       particleIdCounter.current = 0;
   };


  return (
    <div className="space-y-6 p-4">
      <Button variant="outline" asChild size="sm" className="mb-6">
        <Link href="/simulations">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Simulations
        </Link>
      </Button>

      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-3xl flex items-center gap-3">
            <Orbit className="h-9 w-9 text-primary" />
            Black Hole / Spacetime Curvature Visualizer
          </CardTitle>
          <CardDescription className="mt-2">
            Grade 12 / Advanced - A conceptual simulation to visualize the warping of spacetime by massive objects.
          </CardDescription>
        </CardHeader>
        <CardContent className="py-8 space-y-6">

          {/* Simulation Instructions */}
          <div className="flex flex-col items-center text-center space-y-4"> {/* Reduced space-y */}
             <h3 className="text-2xl font-semibold text-muted-foreground">Interactive Simulation</h3>
             <p className="text-md text-muted-foreground max-w-2xl">
               {addMode === 'mass'
                  ? "Click on the grid to place massive objects (Red). The grid will warp to show spacetime curvature."
                  : "Click on the grid to add test particles (Blue) and see how they move along the curved spacetime."
               }
             </p>
          </div>

          <Separator />

          {/* Planned Features Section - Still relevant for future enhancements */}
           <div className="space-y-4 max-w-3xl mx-auto">
             <h4 className="text-xl font-semibold text-center">Concepts Demonstrated & Future Features:</h4>
             <ul className="list-disc list-inside text-left space-y-2 text-muted-foreground">
               <li>**Gravity as Curvature:** *Visualized by the deforming grid.*</li> {/* Updated */}
               <li>**Object Placement:** *Interactive - Use controls below and click the grid.*</li> {/* Updated */}
               <li>**Curvature Visualization:** *Interactive - Observe the grid deformation.*</li> {/* Updated */}
               <li>**Particle/Light Trajectories:** *Interactive - Particles move along the simulated curvature.*</li> {/* Updated */}
               <li>**Event Horizon Concept:** *Simplified visualization around large masses.*</li> {/* Updated */}
               <li>**(Coming Soon):** More accurate physics, different particle types (light), boundary handling options, zoom/pan.</li> {/* Added future */}
             </ul>
             <p className="text-sm italic text-muted-foreground text-center pt-2">
                This simplified 2D model helps build an intuition for the complex ideas of General Relativity.
             </p>
           </div>

           <Separator />


          {/* Simulation Area */}
          <div className="space-y-4">
            <h4 className="text-xl font-semibold text-center">Simulation Grid:</h4>
             <div className="w-full aspect-video border border-muted-foreground rounded-lg overflow-hidden relative">
                {/* Canvas for the simulation */}
                <canvas
                   ref={canvasRef}
                   className={`absolute inset-0 w-full h-full ${addMode === 'mass' ? 'cursor-crosshair' : 'cursor-pointer'}`} // Change cursor based on mode
                   onClick={handleCanvasClick}
                ></canvas>
             </div>

             {/* Simulation Controls */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4"> {/* Use Card for control group */}
                    <h5 className="font-semibold mb-3 flex items-center gap-2"><PlusCircle className="h-5 w-5 text-blue-500"/> Add Objects</h5> {/* Added icon */}
                    <div className="space-y-4">
                         {/* Add Mode Toggle */}
                         <div className="flex items-center gap-4">
                             <Label>Mode:</Label>
                             <Button
                                 variant={addMode === 'mass' ? 'default' : 'outline'}
                                 size="sm"
                                 onClick={() => setAddMode('mass')}
                             >
                                 Add Mass
                             </Button>
                             <Button
                                 variant={addMode === 'particle' ? 'default' : 'outline'}
                                 size="sm"
                                 onClick={() => setAddMode('particle')}
                             >
                                 Add Particle
                             </Button>
                         </div>

                         {/* Mass Slider (only visible in mass mode) */}
                         {addMode === 'mass' && (
                             <div className="space-y-2">
                                 <Label htmlFor="mass-slider">Mass Value:</Label>
                                 <Slider
                                     id="mass-slider"
                                     min={10} // Minimum mass value
                                     max={500} // Maximum mass value
                                     step={10}
                                     value={[currentMassValue]}
                                     onValueChange={(value) => setCurrentMassValue(value[0])}
                                 />
                                 <div className="text-sm text-muted-foreground text-right">Value: {currentMassValue}</div>
                             </div>
                         )}
                    </div>
                </Card>

                 <Card className="p-4"> {/* Use Card for control group */}
                     <h5 className="font-semibold mb-3 flex items-center gap-2"><RefreshCw className="h-5 w-5 text-orange-500"/> Simulation Controls</h5> {/* Added icon */}
                      <div className="flex items-center justify-center h-full"> {/* Centered content */}
                         <Button variant="destructive" onClick={resetSimulation} className="w-full"> {/* Made button full width */}
                             Reset Simulation
                         </Button>
                     </div>
                 </Card>

             </div>
             {/* Add future controls here */}
          </div>


          {/* STBB Relevance */}
          <div className="text-center mt-8">
             <p className="text-sm text-muted-foreground">STBB Relevance: Gravitation, Concepts of General Relativity (conceptual introduction).</p>
          </div>


        </CardContent>
      </Card>
    </div>
  );
}
