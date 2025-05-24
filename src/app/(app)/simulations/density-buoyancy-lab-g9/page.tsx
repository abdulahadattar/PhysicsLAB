// src/app/(app)/simulations/density-buoyancy-lab-g9/page.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, HelpCircle, RefreshCw, Scale, Droplets, Anchor } from "lucide-react";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";

const G_ACCELERATION = 9.81; // m/s^2
const G_SCALED_FOR_GRAMS = 0.00981; // N/g (to work with grams for mass and cm³ for volume directly)

interface Material {
  name: string;
  density: number; // g/cm³
}
const MATERIALS: Material[] = [
  { name: "Wood (Pine)", density: 0.5 },
  { name: "Water (Ice)", density: 0.92 },
  { name: "Aluminium", density: 2.7 },
  { name: "Iron", density: 7.87 },
  { name: "Lead", density: 11.34 },
  { name: "Gold", density: 19.32 },
  { name: "Custom", density: 1.0 }, // Placeholder for custom input
];

interface Fluid {
  name: string;
  density: number; // g/cm³
}
const FLUIDS: Fluid[] = [
  { name: "Water", density: 1.0 },
  { name: "Olive Oil", density: 0.92 },
  { name: "Glycerine", density: 1.26 },
  { name: "Mercury", density: 13.56 },
];

const CANVAS_WIDTH = 300;
const CANVAS_HEIGHT = 350;
const BEAKER_WIDTH_RATIO = 0.7;
const FLUID_LEVEL_RATIO = 0.75;
const OBJECT_BASE_SIZE = 50; // Base visual size for volume of 100 cm³

export default function DensityBuoyancyLabG9Page() {
  const { toast } = useToast();
  const [selectedMaterialName, setSelectedMaterialName] = useState<string>(MATERIALS[0].name);
  const [objectVolumeCm3, setObjectVolumeCm3] = useState<number>(100);
  const [customObjectDensity, setCustomObjectDensity] = useState<number>(1.0);

  const [selectedFluidName, setSelectedFluidName] = useState<string>(FLUIDS[0].name);

  const [isObjectInFluid, setIsObjectInFluid] = useState<boolean>(false);
  const [simulationData, setSimulationData] = useState({
    objectDensity: 0,
    objectMassGrams: 0,
    fluidDensity: 0,
    weightInAirN: 0,
    buoyantForceN: 0,
    apparentWeightInFluidN: 0,
    percentageSubmerged: 0,
    statusMessage: "Place object in fluid.",
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const objectProperties = useCallback(() => {
    let density = customObjectDensity;
    if (selectedMaterialName !== "Custom") {
      density = MATERIALS.find(m => m.name === selectedMaterialName)?.density || 1.0;
    }
    const mass = density * objectVolumeCm3;
    return { density, mass, volume: objectVolumeCm3 };
  }, [selectedMaterialName, objectVolumeCm3, customObjectDensity]);

  const fluidProperties = useCallback(() => {
    return FLUIDS.find(f => f.name === selectedFluidName) || FLUIDS[0];
  }, [selectedFluidName]);

  const calculateBuoyancy = useCallback(() => {
    const objProps = objectProperties();
    const fluidProps = fluidProperties();

    const weightInAir = objProps.mass * G_SCALED_FOR_GRAMS;
    let buoyantForce = 0;
    let apparentWeightInFluid = weightInAir;
    let percentageSubmerged = 0;
    let statusMessage = "";

    if (isObjectInFluid) {
      if (objProps.density <= fluidProps.density) { // Floats or neutrally buoyant
        buoyantForce = weightInAir; // Buoyant force equals weight
        const submergedVolume = objProps.mass / fluidProps.density;
        percentageSubmerged = Math.min(1, submergedVolume / objProps.volume) * 100;
        apparentWeightInFluid = 0; // Effectively
        statusMessage = objProps.density === fluidProps.density ? "Neutrally Buoyant" : "Floats";
      } else { // Sinks
        const submergedVolume = objProps.volume; // Fully submerged
        buoyantForce = fluidProps.density * submergedVolume * G_SCALED_FOR_GRAMS;
        percentageSubmerged = 100;
        apparentWeightInFluid = weightInAir - buoyantForce;
        statusMessage = "Sinks";
      }
    } else {
      statusMessage = "Place object in fluid.";
    }

    setSimulationData({
      objectDensity: objProps.density,
      objectMassGrams: objProps.mass,
      fluidDensity: fluidProps.density,
      weightInAirN: weightInAir,
      buoyantForceN: buoyantForce,
      apparentWeightInFluidN: apparentWeightInFluid,
      percentageSubmerged: percentageSubmerged,
      statusMessage: statusMessage,
    });
  }, [objectProperties, fluidProperties, isObjectInFluid]);

  useEffect(() => {
    calculateBuoyancy();
  }, [calculateBuoyancy]);

  const drawSimulation = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Beaker
    const beakerWidth = CANVAS_WIDTH * BEAKER_WIDTH_RATIO;
    const beakerX = (CANVAS_WIDTH - beakerWidth) / 2;
    const beakerBottomY = CANVAS_HEIGHT - 20;
    const beakerTopY = 50;
    ctx.strokeStyle = "hsl(var(--muted-foreground))";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(beakerX, beakerTopY);
    ctx.lineTo(beakerX, beakerBottomY);
    ctx.lineTo(beakerX + beakerWidth, beakerBottomY);
    ctx.lineTo(beakerX + beakerWidth, beakerTopY);
    ctx.stroke();

    // Fluid
    const fluidHeightPixels = (beakerBottomY - beakerTopY) * FLUID_LEVEL_RATIO;
    const fluidTopSurfaceY = beakerBottomY - fluidHeightPixels;
    ctx.fillStyle = "hsla(var(--primary) / 0.3)";
    ctx.fillRect(beakerX + ctx.lineWidth/2, fluidTopSurfaceY, beakerWidth - ctx.lineWidth, fluidHeightPixels);

    // Object
    if (isObjectInFluid) {
      const objProps = objectProperties();
      // Scale object visual size roughly with cube root of volume
      const visualSizeFactor = Math.pow(objProps.volume / 100, 1/3);
      const objectDisplayWidth = OBJECT_BASE_SIZE * visualSizeFactor * 0.8; // make it a bit cuboid
      const objectDisplayHeight = OBJECT_BASE_SIZE * visualSizeFactor * 1.2;

      let objectY; // Top of the object
      if (simulationData.statusMessage === "Sinks") {
        objectY = beakerBottomY - objectDisplayHeight - 2; // Sits at bottom
      } else { // Floats or neutrally buoyant
        const submergedDepth = objectDisplayHeight * (simulationData.percentageSubmerged / 100);
        objectY = fluidTopSurfaceY + (fluidHeightPixels * 0.1) - (objectDisplayHeight - submergedDepth); // Position based on submersion
      }
      objectY = Math.max(beakerTopY + 2, Math.min(objectY, beakerBottomY - objectDisplayHeight -2))


      const objectX = CANVAS_WIDTH / 2 - objectDisplayWidth / 2;
      
      ctx.fillStyle = "hsl(var(--accent))";
      ctx.fillRect(objectX, objectY, objectDisplayWidth, objectDisplayHeight);
      ctx.strokeStyle = "hsl(var(--accent-foreground))";
      ctx.strokeRect(objectX, objectY, objectDisplayWidth, objectDisplayHeight);

      // Force Arrows (Simplified)
      if (simulationData.weightInAirN > 0) {
        // Weight
        ctx.beginPath();
        ctx.moveTo(objectX + objectDisplayWidth / 2, objectY + objectDisplayHeight / 2);
        ctx.lineTo(objectX + objectDisplayWidth / 2, objectY + objectDisplayHeight / 2 + 30);
        ctx.strokeStyle = "hsl(var(--destructive))";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = "hsl(var(--destructive))";
        ctx.fillText("W", objectX + objectDisplayWidth / 2 + 5, objectY + objectDisplayHeight / 2 + 25);


        // Buoyant Force
        if (simulationData.buoyantForceN > 0.001) {
            ctx.beginPath();
            ctx.moveTo(objectX + objectDisplayWidth / 2, objectY + objectDisplayHeight / 2);
            ctx.lineTo(objectX + objectDisplayWidth / 2, objectY + objectDisplayHeight / 2 - 25);
            ctx.strokeStyle = "hsl(var(--primary))";
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = "hsl(var(--primary))";
            ctx.fillText("Fb", objectX + objectDisplayWidth / 2 + 5, objectY + objectDisplayHeight / 2 - 20);
        }
      }
    } else {
        ctx.fillStyle = "hsl(var(--muted-foreground))";
        ctx.textAlign = "center";
        ctx.font = "12px sans-serif";
        ctx.fillText("Object is out of fluid.", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);
    }

  }, [isObjectInFluid, simulationData, objectProperties, fluidProperties]);

  useEffect(() => {
    drawSimulation();
  }, [drawSimulation]);

  const handlePlaceResetObject = () => {
    setIsObjectInFluid(!isObjectInFluid);
  };
  
  const currentObjectProps = objectProperties();
  const currentFluidProps = fluidProperties();

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
              <CardTitle className="text-3xl flex items-center gap-2">
                <Anchor className="h-8 w-8 text-primary" />
                G9: Density & Buoyancy Lab
              </CardTitle>
              <CardDescription>
                Explore Archimedes' Principle. Observe if objects float or sink in different fluids.
                (STBB Relevance: Density, Archimedes' Principle, Buoyancy, Flotation - G9, Unit 7)
              </CardDescription>
            </div>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="icon"><HelpCircle className="h-5 w-5"/></Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 text-sm">
                    <h4 className="font-medium leading-none mb-2">How to Use</h4>
                    <ul className="list-disc pl-4 text-muted-foreground space-y-1">
                        <li>Select an object material and its volume.</li>
                        <li>If "Custom" material is selected, input the object's density.</li>
                        <li>Select a fluid type.</li>
                        <li>Click "Place in Fluid" to see what happens.</li>
                        <li>Observe the calculated values and the visual simulation.</li>
                        <li>Click "Remove from Fluid / Reset" to try new parameters.</li>
                    </ul>
                </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6 items-start">
            {/* Controls Column */}
            <div className="md:col-span-1 space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-lg flex items-center gap-1"><Scale className="h-5 w-5"/>Object Properties</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label htmlFor="object-material">Material</Label>
                    <Select value={selectedMaterialName} onValueChange={setSelectedMaterialName}>
                      <SelectTrigger id="object-material"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {MATERIALS.map(m => <SelectItem key={m.name} value={m.name}>{m.name} (ρ: {m.density} g/cm³)</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedMaterialName === "Custom" && (
                    <div>
                      <Label htmlFor="custom-density">Custom Density (g/cm³)</Label>
                      <Input id="custom-density" type="number" value={customObjectDensity} onChange={e => setCustomObjectDensity(parseFloat(e.target.value) || 1.0)} step="0.1" min="0.1"/>
                    </div>
                  )}
                  <div>
                    <Label htmlFor="object-volume">Volume: {objectVolumeCm3.toFixed(0)} cm³</Label>
                    <Slider id="object-volume" min={10} max={200} step={10} value={[objectVolumeCm3]} onValueChange={v => setObjectVolumeCm3(v[0])} />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-lg flex items-center gap-1"><Droplets className="h-5 w-5"/>Fluid Properties</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label htmlFor="fluid-type">Fluid Type</Label>
                    <Select value={selectedFluidName} onValueChange={setSelectedFluidName}>
                      <SelectTrigger id="fluid-type"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {FLUIDS.map(f => <SelectItem key={f.name} value={f.name}>{f.name} (ρ: {f.density} g/cm³)</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
               <Button onClick={handlePlaceResetObject} className="w-full">
                {isObjectInFluid ? "Remove from Fluid / Reset" : "Place in Fluid"}
              </Button>
            </div>

            {/* Visualization and Data Column */}
            <div className="md:col-span-2 space-y-4">
              <Card className="h-full">
                <CardHeader><CardTitle className="text-lg">Visual Simulation</CardTitle></CardHeader>
                <CardContent className="flex flex-col items-center justify-center p-2">
                  <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="bg-muted rounded-md border border-input shadow-inner"></canvas>
                  <p className="mt-2 text-lg font-semibold text-center h-6">{isObjectInFluid ? simulationData.statusMessage : " "}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-lg">Calculated Values</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <p>Object Mass: <span className="font-semibold">{currentObjectProps.mass.toFixed(2)} g</span></p>
                  <p>Object Density: <span className="font-semibold">{currentObjectProps.density.toFixed(2)} g/cm³</span></p>
                  <p>Fluid Density: <span className="font-semibold">{currentFluidProps.density.toFixed(2)} g/cm³</span></p>
                  <p>Weight in Air: <span className="font-semibold">{simulationData.weightInAirN.toFixed(3)} N</span></p>
                  <p>Buoyant Force: <span className="font-semibold">{simulationData.buoyantForceN.toFixed(3)} N</span></p>
                  <p>Apparent Weight: <span className="font-semibold">{simulationData.apparentWeightInFluidN.toFixed(3)} N</span></p>
                  <p>% Submerged: <span className="font-semibold">{simulationData.percentageSubmerged.toFixed(1)}%</span></p>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
        <CardFooter>
            <p className="text-xs text-muted-foreground">
              This simulation demonstrates the principles of density and buoyancy. Adjust parameters to observe how objects float or sink.
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}

    