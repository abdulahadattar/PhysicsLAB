
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const G_ACCELERATION = 9.81; // m/s^2
const G_SCALED_FOR_GRAMS = 0.00981; // N/g (to work with grams for mass and cm³ for volume directly)

interface Material {
  name: string;
  density: number; // g/cm³
  color: string; // hsla format for easy alpha adjustments
}
const MATERIALS: Material[] = [
  { name: "Wood (Pine)", density: 0.5, color: "hsla(30, 50%, 60%, 1)" }, // Light brown
  { name: "Water (Ice)", density: 0.92, color: "hsla(190, 60%, 85%, 1)" }, // Light icy blue
  { name: "Aluminium", density: 2.7, color: "hsla(210, 15%, 75%, 1)" }, // Silvery gray
  { name: "Iron", density: 7.87, color: "hsla(210, 10%, 50%, 1)" },    // Darker gray
  { name: "Lead", density: 11.34, color: "hsla(220, 10%, 35%, 1)" },   // Very dark blue-gray
  { name: "Gold", density: 19.32, color: "hsla(50, 80%, 60%, 1)" },    // Gold
  { name: "Custom", density: 1.0, color: "hsla(0, 0%, 50%, 1)" },      // Neutral gray for custom
];

interface Fluid {
  name: string;
  density: number; // g/cm³
  color: string; // hsla format for semi-transparency
}
const FLUIDS: Fluid[] = [
  { name: "Water", density: 1.0, color: "hsla(200, 70%, 60%, 0.5)" },  // Blue
  { name: "Olive Oil", density: 0.92, color: "hsla(60, 50%, 60%, 0.5)" },// Yellowish
  { name: "Glycerine", density: 1.26, color: "hsla(270, 40%, 70%, 0.5)" },// Light purple
  { name: "Mercury", density: 13.56, color: "hsla(0, 0%, 65%, 0.6)" },  // Silvery, slightly opaque
];

const CANVAS_WIDTH = 350; // Slightly increased width
const CANVAS_HEIGHT = 400; // Increased height for better vertical scale
const BEAKER_WIDTH_RATIO = 0.7;
const FLUID_LEVEL_RATIO = 0.7; // Percentage of beaker height filled with fluid
const OBJECT_BASE_WIDTH_CM = 5; // Conceptual width of object at 100cm3 volume
const OBJECT_BASE_HEIGHT_CM = 5; // Conceptual height

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
    const material = MATERIALS.find(m => m.name === selectedMaterialName) || MATERIALS.find(m=>m.name==="Custom")!;
    let density = material.name === "Custom" ? customObjectDensity : material.density;
    density = Math.max(0.01, density); // Prevent zero or negative density
    const volume = Math.max(1, objectVolumeCm3); // Prevent zero or negative volume
    const mass = density * volume;
    return { density, mass, volume, color: material.color };
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
        buoyantForce = weightInAir;
        const submergedVolume = objProps.mass / fluidProps.density;
        percentageSubmerged = Math.min(1, submergedVolume / objProps.volume) * 100;
        apparentWeightInFluid = Math.max(0, weightInAir - buoyantForce); // Should be close to 0
        statusMessage = objProps.density === fluidProps.density ? "Neutrally Buoyant" : "Floats";
      } else { // Sinks
        const submergedVolume = objProps.volume;
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

    // Beaker styling
    const beakerColor = "hsl(var(--border))"; // Using border color for beaker lines
    const beakerLineWidth = 2;
    const beakerWallPadding = 20; // Padding from canvas edge
    const beakerWidth = CANVAS_WIDTH - 2 * beakerWallPadding;
    const beakerBottomY = CANVAS_HEIGHT - 30;
    const beakerTopY = 50;
    const beakerActualHeight = beakerBottomY - beakerTopY;

    ctx.strokeStyle = beakerColor;
    ctx.lineWidth = beakerLineWidth;

    // Draw beaker walls and base
    ctx.beginPath();
    ctx.moveTo(beakerWallPadding, beakerTopY);
    ctx.lineTo(beakerWallPadding, beakerBottomY);
    ctx.lineTo(beakerWallPadding + beakerWidth, beakerBottomY);
    ctx.lineTo(beakerWallPadding + beakerWidth, beakerTopY);
    // ctx.closePath(); // Don't close path if you want an open top
    ctx.stroke();
    
    // Fluid
    const fluidProps = fluidProperties();
    const fluidHeightPixels = beakerActualHeight * FLUID_LEVEL_RATIO;
    const fluidTopSurfaceY = beakerBottomY - fluidHeightPixels;
    ctx.fillStyle = fluidProps.color;
    ctx.fillRect(beakerWallPadding + beakerLineWidth / 2, fluidTopSurfaceY, beakerWidth - beakerLineWidth, fluidHeightPixels);
    
    // Fluid surface line
    ctx.beginPath();
    ctx.moveTo(beakerWallPadding, fluidTopSurfaceY);
    ctx.lineTo(beakerWallPadding + beakerWidth, fluidTopSurfaceY);
    ctx.strokeStyle = "hsla(var(--foreground), 0.5)"; // Darker line for surface
    ctx.lineWidth = 1;
    ctx.stroke();

    // Object
    const objProps = objectProperties();
    // Visual size scaling: cube root of volume ratio, then apply to base dimensions
    const volumeRatio = objProps.volume / 100; // Assuming 100cm³ is a "standard" size
    const scaleFactor = Math.pow(volumeRatio, 1/3);
    const objectDisplayWidth = Math.min(beakerWidth * 0.6, OBJECT_BASE_WIDTH_CM * scaleFactor * 10); // Scale by 10 for pixels, cap at 60% beaker width
    const objectDisplayHeight = Math.min(beakerActualHeight * 0.8, OBJECT_BASE_HEIGHT_CM * scaleFactor * 10); // Cap at 80% beaker height

    if (isObjectInFluid) {
      let objectTopY; // Top edge of the object

      if (simulationData.statusMessage === "Sinks") {
        objectTopY = beakerBottomY - objectDisplayHeight - beakerLineWidth; // Sits at bottom
      } else { // Floats or neutrally buoyant
        const submergedDepthPixels = objectDisplayHeight * (simulationData.percentageSubmerged / 100);
        objectTopY = fluidTopSurfaceY - (objectDisplayHeight - submergedDepthPixels);
      }
      // Ensure object is within beaker vertical bounds
      objectTopY = Math.max(beakerTopY, Math.min(objectTopY, beakerBottomY - objectDisplayHeight));
      
      const objectX = CANVAS_WIDTH / 2 - objectDisplayWidth / 2;
      
      ctx.fillStyle = objProps.color;
      ctx.fillRect(objectX, objectTopY, objectDisplayWidth, objectDisplayHeight);
      ctx.strokeStyle = "hsl(var(--foreground))"; // Black outline for object
      ctx.lineWidth = 1.5;
      ctx.strokeRect(objectX, objectTopY, objectDisplayWidth, objectDisplayHeight);

      // Force Arrows (Simplified with labels)
      const arrowStartX = objectX + objectDisplayWidth / 2;
      const arrowStartY = objectTopY + objectDisplayHeight / 2;
      const arrowLength = 30; // Max arrow length
      
      ctx.font = "10px sans-serif";
      ctx.textAlign = "left";

      // Weight Arrow (W) - always present if mass > 0
      if (simulationData.weightInAirN > 0.001) {
        ctx.beginPath();
        ctx.moveTo(arrowStartX, arrowStartY);
        ctx.lineTo(arrowStartX, arrowStartY + arrowLength);
        ctx.strokeStyle = "hsl(var(--destructive))"; // Red
        ctx.lineWidth = 2;
        ctx.stroke();
        // Arrowhead
        ctx.beginPath();
        ctx.moveTo(arrowStartX, arrowStartY + arrowLength);
        ctx.lineTo(arrowStartX - 3, arrowStartY + arrowLength - 6);
        ctx.lineTo(arrowStartX + 3, arrowStartY + arrowLength - 6);
        ctx.closePath();
        ctx.fillStyle = "hsl(var(--destructive))";
        ctx.fill();
        ctx.fillText("W", arrowStartX + 5, arrowStartY + arrowLength - 5);
      }

      // Buoyant Force Arrow (Fb) - present if buoyant force > 0
      if (simulationData.buoyantForceN > 0.001) {
        const buoyantArrowScale = Math.min(1, simulationData.buoyantForceN / Math.max(0.001, simulationData.weightInAirN)); // Scale Fb relative to W
        const buoyantArrowActualLength = arrowLength * buoyantArrowScale;
        ctx.beginPath();
        ctx.moveTo(arrowStartX, arrowStartY);
        ctx.lineTo(arrowStartX, arrowStartY - buoyantArrowActualLength);
        ctx.strokeStyle = "hsl(var(--primary))"; // Blue
        ctx.lineWidth = 2;
        ctx.stroke();
        // Arrowhead
        ctx.beginPath();
        ctx.moveTo(arrowStartX, arrowStartY - buoyantArrowActualLength);
        ctx.lineTo(arrowStartX - 3, arrowStartY - buoyantArrowActualLength + 6);
        ctx.lineTo(arrowStartX + 3, arrowStartY - buoyantArrowActualLength + 6);
        ctx.closePath();
        ctx.fillStyle = "hsl(var(--primary))";
        ctx.fill();
        ctx.fillText("Fb", arrowStartX + 5, arrowStartY - buoyantArrowActualLength + 5);
      }
    } else {
        // Draw object outside fluid (e.g., above beaker)
        const objectX = CANVAS_WIDTH / 2 - objectDisplayWidth / 2;
        const objectY = beakerTopY - objectDisplayHeight - 10; // Position above beaker
        ctx.fillStyle = objProps.color;
        ctx.fillRect(objectX, objectY, objectDisplayWidth, objectDisplayHeight);
        ctx.strokeStyle = "hsl(var(--foreground))";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(objectX, objectY, objectDisplayWidth, objectDisplayHeight);

        ctx.fillStyle = "hsl(var(--muted-foreground))";
        ctx.textAlign = "center";
        ctx.font = "12px sans-serif";
        ctx.fillText("Object ready.", CANVAS_WIDTH / 2, beakerTopY / 2);
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
                G9: Density &amp; Buoyancy Lab
              </CardTitle>
              <CardDescription>
                Explore Archimedes' Principle. Observe if objects float or sink in different fluids.
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
                      <Input id="custom-density" type="number" value={customObjectDensity} onChange={e => setCustomObjectDensity(parseFloat(e.target.value) || 1.0)} step="0.01" min="0.01"/>
                    </div>
                  )}
                  <div>
                    <Label htmlFor="object-volume">Volume: {objectVolumeCm3.toFixed(0)} cm³</Label>
                    <Slider id="object-volume" min={10} max={500} step={10} value={[objectVolumeCm3]} onValueChange={v => setObjectVolumeCm3(v[0])} />
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
               <Button onClick={handlePlaceResetObject} className="w-full text-lg py-6">
                {isObjectInFluid ? "Remove from Fluid & Reset" : "Place in Fluid"}
              </Button>
            </div>

            {/* Visualization and Data Column */}
            <div className="md:col-span-2 space-y-4">
              <Card className="h-full">
                <CardHeader><CardTitle className="text-lg">Visual Simulation</CardTitle></CardHeader>
                <CardContent className="flex flex-col items-center justify-center p-2">
                  <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="bg-muted rounded-md border border-input shadow-inner"></canvas>
                  <p className={cn(
                    "mt-3 text-xl font-bold text-center h-8",
                    simulationData.statusMessage === "Floats" && "text-green-600",
                    simulationData.statusMessage === "Sinks" && "text-red-600",
                    simulationData.statusMessage === "Neutrally Buoyant" && "text-blue-600"
                  )}>
                    {isObjectInFluid ? simulationData.statusMessage : " "}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-lg">Calculated Values</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <p>Object Mass: <span className="font-semibold">{currentObjectProps.mass.toFixed(2)} g</span></p>
                  <p>Object Density: <span className="font-semibold">{currentObjectProps.density.toFixed(2)} g/cm³</span></p>
                  <p>Fluid Density: <span className="font-semibold">{currentFluidProps.density.toFixed(2)} g/cm³</span></p>
                  <p>Weight in Air: <span className="font-semibold">{simulationData.weightInAirN.toFixed(3)} N</span></p>
                  <p>Buoyant Force (Fb): <span className="font-semibold">{simulationData.buoyantForceN.toFixed(3)} N</span></p>
                  <p>Apparent Wt. in Fluid: <span className="font-semibold">{simulationData.apparentWeightInFluidN.toFixed(3)} N</span></p>
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

    
