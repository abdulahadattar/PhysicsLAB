"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Separator } from '@/components/ui/separator';

// Constants
const G_ACCELERATION = 9.81; // m/s^2
const G_SCALED_FOR_GRAMS = G_ACCELERATION / 1000; // To use with mass in grams for N

// --- Data Definitions ---
interface Material {
  name: string;
  density: number; // g/cm³
  color: string;
}

interface Fluid {
  name: string;
  density: number; // g/cm³
  color: string;
}

const MATERIALS: Material[] = [
  { name: "Wood (Pine)", density: 0.5, color: "rgba(210, 180, 140, 0.8)" },
  { name: "Ice", density: 0.92, color: "rgba(173, 216, 230, 0.7)" },
  { name: "Plastic (HDPE)", density: 0.95, color: "rgba(200, 200, 200, 0.8)" },
  { name: "Aluminium", density: 2.7, color: "rgba(169, 169, 169, 0.8)" },
  { name: "Steel", density: 7.85, color: "rgba(128, 128, 128, 0.8)" },
  { name: "Copper", density: 8.96, color: "rgba(184, 115, 51, 0.8)" },
  { name: "Lead", density: 11.34, color: "rgba(70, 70, 80, 0.8)" },
];

const FLUIDS: Fluid[] = [
  { name: "Water", density: 1.0, color: "rgba(135, 206, 250, 0.5)" }, // LightSkyBlue
  { name: "Olive Oil", density: 0.915, color: "rgba(218, 223, 112, 0.5)" }, // LightGoldenrodYellow-ish
  { name: "Glycerine", density: 1.26, color: "rgba(220, 220, 220, 0.5)" }, // Gainsboro
  { name: "Mercury", density: 13.55, color: "rgba(150, 150, 150, 0.6)" }, // Darker gray
];

// --- State & Types ---
interface ObjectProperties {
  materialName: string;
  volumeCm3: number; // cm³
  densityGcm3: number; // g/cm³
  massG: number; // g
}

interface FluidProperties {
  name: string;
  densityGcm3: number; // g/cm³
}

interface SimulationData {
  weightInAirN: number; // N
  buoyantForceN: number; // N
  apparentWeightN: number; // N
  percentageSubmerged: number; // %
  status: 'initial' | 'floating' | 'sinking' | 'neutral';
  volumeDisplacedCm3: number; // cm³
  weightDisplacedFluidN: number; // N
}

// Visual Constants
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 450;
const BEAKER_WIDTH_RATIO = 0.6; // Proportion of canvas width
const BEAKER_HEIGHT_RATIO = 0.8; // Proportion of canvas height
const FLUID_LEVEL_RATIO = 0.6; // Initial fill level of beaker height
const BEAKER_LINE_WIDTH = 4;
const FORCE_ARROW_MAX_LENGTH = 80; // Max pixels for largest force arrow

// Fluid displacement visual scaling
const REFERENCE_VOLUME_CM3_FOR_RISE = 100.0; // e.g., 100 cm³ submerged volume
const REFERENCE_RISE_PIXELS = 15.0; // causes a 15 pixel rise for REFERENCE_VOLUME_CM3_FOR_RISE

const DensityBuoyancyLabG9Page: React.FC = () => {
  const [selectedMaterialName, setSelectedMaterialName] = useState<string>(MATERIALS[0].name);
  const [isCustomMaterial, setIsCustomMaterial] = useState<boolean>(false);
  const [customDensity, setCustomDensity] = useState<number>(1.0);
  const [objectVolumeCm3, setObjectVolumeCm3] = useState<number>(100); // cm³

  const [selectedFluidName, setSelectedFluidName] = useState<string>(FLUIDS[0].name);

  const [objectProperties, setObjectProperties] = useState<ObjectProperties>(() => {
    const initialMaterial = MATERIALS.find(m => m.name === MATERIALS[0].name)!;
    return {
      materialName: initialMaterial.name,
      volumeCm3: 100,
      densityGcm3: initialMaterial.density,
      massG: initialMaterial.density * 100,
    };
  });

  const [fluidProperties, setFluidProperties] = useState<FluidProperties>(() => {
    const initialFluid = FLUIDS.find(f => f.name === FLUIDS[0].name)!;
    return {
      name: initialFluid.name,
      densityGcm3: initialFluid.density,
    };
  });

  const [simulationData, setSimulationData] = useState<SimulationData>({
    weightInAirN: 0,
    buoyantForceN: 0,
    apparentWeightN: 0,
    percentageSubmerged: 0,
    status: 'initial',
    volumeDisplacedCm3: 0,
    weightDisplacedFluidN: 0,
  });

  const [isObjectInFluid, setIsObjectInFluid] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Update Object Properties
  useEffect(() => {
    let density: number;
    let materialName: string;

    if (isCustomMaterial) {
      density = customDensity > 0 ? customDensity : 0.01; // Prevent non-positive density
      materialName = "Custom Material";
    } else {
      const material = MATERIALS.find(m => m.name === selectedMaterialName) || MATERIALS[0];
      density = material.density;
      materialName = material.name;
    }

    setObjectProperties({
      materialName: materialName,
      volumeCm3: objectVolumeCm3,
      densityGcm3: density,
      massG: density * objectVolumeCm3,
    });
  }, [selectedMaterialName, objectVolumeCm3, isCustomMaterial, customDensity]);

  // Update Fluid Properties
  useEffect(() => {
    const fluid = FLUIDS.find(f => f.name === selectedFluidName) || FLUIDS[0];
    setFluidProperties({
      name: fluid.name,
      densityGcm3: fluid.density,
    });
  }, [selectedFluidName]);

  // Calculate Buoyancy and related values
  const calculateBuoyancy = useCallback(() => {
    if (!isObjectInFluid) {
      const weightInAirN = objectProperties.massG * G_SCALED_FOR_GRAMS;
      setSimulationData({
        weightInAirN: weightInAirN,
        buoyantForceN: 0,
        apparentWeightN: weightInAirN, // In air, apparent weight is weight
        percentageSubmerged: 0,
        status: 'initial',
        volumeDisplacedCm3: 0,
        weightDisplacedFluidN: 0,
      });
      return;
    }

    const objDensity = objectProperties.densityGcm3;
    const fluidDensity = fluidProperties.densityGcm3;
    const objVolume = objectProperties.volumeCm3;
    const objMassG = objectProperties.massG;

    const weightInAirN = objMassG * G_SCALED_FOR_GRAMS;
    let buoyantForceN: number;
    let percentageSubmerged: number;
    let status: SimulationData['status'];
    let volumeDisplacedCm3: number;

    if (objDensity < fluidDensity) { // Floats
      // Object is partially submerged. Buoyant force equals weight.
      buoyantForceN = weightInAirN;
      // V_submerged = mass_object / density_fluid
      volumeDisplacedCm3 = objMassG / fluidDensity;
      percentageSubmerged = (volumeDisplacedCm3 / objVolume) * 100;
      status = 'floating';
    } else if (objDensity > fluidDensity) { // Sinks
      // Object is fully submerged. Buoyant force is based on full object volume.
      buoyantForceN = objVolume * fluidDensity * G_SCALED_FOR_GRAMS;
      volumeDisplacedCm3 = objVolume;
      percentageSubmerged = 100;
      status = 'sinking';
    } else { // Neutrally buoyant (objDensity === fluidDensity)
      buoyantForceN = weightInAirN; // or objVolume * fluidDensity * G_SCALED_FOR_GRAMS, they are equal
      volumeDisplacedCm3 = objVolume;
      percentageSubmerged = 100;
      status = 'neutral';
    }

    const apparentWeightN = weightInAirN - buoyantForceN;
    // Ensure apparent weight isn't negative for floating objects (due to precision)
    const finalApparentWeightN = status === 'floating' ? Math.max(0, apparentWeightN) : apparentWeightN;
    
    const weightDisplacedFluidN = volumeDisplacedCm3 * fluidProperties.densityGcm3 * G_SCALED_FOR_GRAMS;

    setSimulationData({
      weightInAirN,
      buoyantForceN,
      apparentWeightN: finalApparentWeightN,
      percentageSubmerged,
      status,
      volumeDisplacedCm3,
      weightDisplacedFluidN,
    });
  }, [objectProperties, fluidProperties, isObjectInFluid]);

  useEffect(() => {
    calculateBuoyancy();
  }, [calculateBuoyancy]);

  // --- Drawing Logic ---
  const drawSimulation = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Beaker dimensions
    const beakerWidth = CANVAS_WIDTH * BEAKER_WIDTH_RATIO;
    const beakerHeight = CANVAS_HEIGHT * BEAKER_HEIGHT_RATIO;
    const beakerX = (CANVAS_WIDTH - beakerWidth) / 2;
    const beakerY = CANVAS_HEIGHT - beakerHeight - 20; // 20px padding from bottom
    const beakerWallThickness = BEAKER_LINE_WIDTH;

    // Fluid initial dimensions (before displacement)
    const initialFluidHeightPixels = beakerHeight * FLUID_LEVEL_RATIO - beakerWallThickness;
    const initialFluidTopSurfaceY = beakerY + beakerHeight - initialFluidHeightPixels - beakerWallThickness;
    
    let currentFluidHeightPixels = initialFluidHeightPixels;
    let currentFluidTopSurfaceY = initialFluidTopSurfaceY;

    if (isObjectInFluid && simulationData.volumeDisplacedCm3 > 0) {
      const fluidRisePixels = (simulationData.volumeDisplacedCm3 / REFERENCE_VOLUME_CM3_FOR_RISE) * REFERENCE_RISE_PIXELS;
      
      let newFluidHeight = initialFluidHeightPixels + fluidRisePixels;
      // Cap fluid height to not exceed beaker capacity (minus wall thickness)
      const maxFluidHeightInBeaker = beakerHeight - 2 * beakerWallThickness; // Space between bottom and top rim inner edge
      
      if (newFluidHeight > maxFluidHeightInBeaker) {
        newFluidHeight = maxFluidHeightInBeaker;
      }
      currentFluidHeightPixels = newFluidHeight;
      currentFluidTopSurfaceY = beakerY + beakerHeight - currentFluidHeightPixels - beakerWallThickness;
    }

    // Draw Beaker
    ctx.strokeStyle = 'grey';
    ctx.lineWidth = beakerWallThickness;
    ctx.beginPath();
    ctx.moveTo(beakerX, beakerY);
    ctx.lineTo(beakerX, beakerY + beakerHeight);
    ctx.lineTo(beakerX + beakerWidth, beakerY + beakerHeight);
    ctx.lineTo(beakerX + beakerWidth, beakerY);
    ctx.stroke();

    // Draw Fluid
    const fluidColor = FLUIDS.find(f => f.name === fluidProperties.name)?.color || 'rgba(0,0,255,0.5)';
    ctx.fillStyle = fluidColor;
    ctx.fillRect(
      beakerX + beakerWallThickness / 2,
      currentFluidTopSurfaceY,
      beakerWidth - beakerWallThickness,
      currentFluidHeightPixels
    );

    // Object Visuals
    const objMaterial = MATERIALS.find(m => m.name === objectProperties.materialName && !isCustomMaterial) || 
                      (isCustomMaterial ? {name: "Custom", density: customDensity, color: "rgba(100,100,100,0.8)"} : MATERIALS[0]);
    const objectColor = objMaterial.color;

    // Scale object visually: base size for 100cm³, then scale by cube root of volume
    const baseDimension = 50; // Pixels for a 100cm³ cube-like object
    const volumeScaleFactor = Math.cbrt(objectProperties.volumeCm3 / 100);
    const objectDisplayHeight = baseDimension * volumeScaleFactor;
    const objectDisplayWidth = baseDimension * volumeScaleFactor;
    
    let objectX = CANVAS_WIDTH / 2 - objectDisplayWidth / 2;
    let objectTopY;

    if (!isObjectInFluid) {
      objectTopY = beakerY - objectDisplayHeight - 30; // Above beaker
    } else {
      const submergedDepthRatio = simulationData.percentageSubmerged / 100;
      const submergedDepthPixels = objectDisplayHeight * submergedDepthRatio;

      if (simulationData.status === 'floating' || simulationData.status === 'neutral') {
         // For neutral, it can be anywhere, this places it as if just barely submerged if 100%
         // For floating, its bottom is 'submergedDepthPixels' below the fluid surface
        objectTopY = currentFluidTopSurfaceY - (objectDisplayHeight - submergedDepthPixels);
        // Ensure it doesn't float above the fluid surface visually if it's supposed to be in contact
        if (objectTopY + objectDisplayHeight < currentFluidTopSurfaceY) {
             objectTopY = currentFluidTopSurfaceY - objectDisplayHeight; // Sits on surface if 0% submerged effectively
        }
        // Ensure it doesn't visually go above the beaker top if fluid level is very high
        if (objectTopY < beakerY + beakerWallThickness) {
            objectTopY = beakerY + beakerWallThickness;
        }

      } else { // Sinking
        objectTopY = currentFluidTopSurfaceY + currentFluidHeightPixels - objectDisplayHeight - beakerWallThickness / 2;
         // Ensure it doesn't go below beaker bottom
        if (objectTopY + objectDisplayHeight > beakerY + beakerHeight - beakerWallThickness) {
           objectTopY = beakerY + beakerHeight - objectDisplayHeight - beakerWallThickness;
        }
      }
    }

    // Draw Object
    ctx.fillStyle = objectColor;
    ctx.fillRect(objectX, objectTopY, objectDisplayWidth, objectDisplayHeight);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.strokeRect(objectX, objectTopY, objectDisplayWidth, objectDisplayHeight);

    // Draw Force Arrows (if in fluid)
    if (isObjectInFluid) {
      const objectCenterX = objectX + objectDisplayWidth / 2;
      const objectCenterY = objectTopY + objectDisplayHeight / 2;

      const maxWeight = Math.max(1, ...MATERIALS.map(m => m.density * 500 * G_SCALED_FOR_GRAMS)); // Estimate max possible weight for scaling

      // Weight Arrow (Downward, Red)
      const weightArrowLength = (simulationData.weightInAirN / maxWeight) * FORCE_ARROW_MAX_LENGTH;
      ctx.beginPath();
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 3;
      ctx.moveTo(objectCenterX, objectCenterY);
      ctx.lineTo(objectCenterX, objectCenterY + weightArrowLength);
      ctx.stroke();
      // Arrowhead for weight
      ctx.beginPath();
      ctx.moveTo(objectCenterX, objectCenterY + weightArrowLength);
      ctx.lineTo(objectCenterX - 5, objectCenterY + weightArrowLength - 5);
      ctx.lineTo(objectCenterX + 5, objectCenterY + weightArrowLength - 5);
      ctx.closePath();
      ctx.fillStyle = 'red';
      ctx.fill();

      // Buoyant Force Arrow (Upward, Blue)
      const buoyantForceArrowLength = (simulationData.buoyantForceN / maxWeight) * FORCE_ARROW_MAX_LENGTH; // Scale similarly
      if (buoyantForceArrowLength > 0.1) { // Only draw if significant
        ctx.beginPath();
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 3;
        ctx.moveTo(objectCenterX, objectCenterY);
        ctx.lineTo(objectCenterX, objectCenterY - buoyantForceArrowLength);
        ctx.stroke();
        // Arrowhead for buoyancy
        ctx.beginPath();
        ctx.moveTo(objectCenterX, objectCenterY - buoyantForceArrowLength);
        ctx.lineTo(objectCenterX - 5, objectCenterY - buoyantForceArrowLength + 5);
        ctx.lineTo(objectCenterX + 5, objectCenterY - buoyantForceArrowLength + 5);
        ctx.closePath();
        ctx.fillStyle = 'blue';
        ctx.fill();
      }
    }
  }, [isObjectInFluid, objectProperties, fluidProperties, simulationData, customDensity, isCustomMaterial]); // Include all dependencies

  useEffect(() => {
    drawSimulation();
  }, [drawSimulation]); // Redraw when drawSimulation function itself changes (due to its dependencies)

  const handleMaterialChange = (value: string) => {
    if (value === "custom") {
      setIsCustomMaterial(true);
    } else {
      setIsCustomMaterial(false);
      setSelectedMaterialName(value);
    }
  };

  const handleFluidChange = (value: string) => {
    setSelectedFluidName(value);
  };

  const handlePlaceRemoveObject = () => {
    setIsObjectInFluid(prev => !prev);
  };

  const getStatusMessage = (): { text: string; color: string } => {
    if (!isObjectInFluid) return { text: "Object is above the fluid. Place it in?", color: "text-gray-600" };
    switch (simulationData.status) {
      case 'floating': return { text: "Object is FLOATING!", color: "text-green-600" };
      case 'sinking': return { text: "Object SINKS.", color: "text-red-600" };
      case 'neutral': return { text: "Object is NEUTRALLY BUOYANT.", color: "text-blue-600" };
      default: return { text: "Calculating...", color: "text-yellow-600" };
    }
  };
  const statusMessage = getStatusMessage();

  return (
    <div className="container mx-auto p-4 space-y-6">
      <header className="text-center">
        <h1 className="text-3xl font-bold">Density & Buoyancy Lab (Grade 9-12)</h1>
        <p className="text-muted-foreground">
          Explore how density and buoyancy determine if an object floats or sinks.
        </p>
      </header>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Controls Panel */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Object Properties */}
            <div className="space-y-3 p-4 border rounded-md">
              <h3 className="font-semibold text-lg">Object Properties</h3>
              <div>
                <Label htmlFor="material-select">Material</Label>
                <Select onValueChange={handleMaterialChange} defaultValue={selectedMaterialName}>
                  <SelectTrigger id="material-select">
                    <SelectValue placeholder="Select material" />
                  </SelectTrigger>
                  <SelectContent>
                    {MATERIALS.map(m => (
                      <SelectItem key={m.name} value={m.name}>{m.name} ({m.density.toFixed(2)} g/cm³)</SelectItem>
                    ))}
                    <SelectItem value="custom">Custom Density</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isCustomMaterial && (
                <div>
                  <Label htmlFor="custom-density">Custom Density (g/cm³)</Label>
                  <Input
                    id="custom-density"
                    type="number"
                    value={customDensity}
                    onChange={e => setCustomDensity(Math.max(0.01, parseFloat(e.target.value)))}
                    min="0.01"
                    step="0.01"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="object-volume">Volume: {objectVolumeCm3} cm³</Label>
                <Slider
                  id="object-volume"
                  min={10} max={500} step={10}
                  value={[objectVolumeCm3]}
                  onValueChange={([val]) => setObjectVolumeCm3(val)}
                />
              </div>
            </div>

            {/* Fluid Properties */}
            <div className="space-y-3 p-4 border rounded-md">
              <h3 className="font-semibold text-lg">Fluid Properties</h3>
              <div>
                <Label htmlFor="fluid-select">Fluid Type</Label>
                <Select onValueChange={handleFluidChange} defaultValue={selectedFluidName}>
                  <SelectTrigger id="fluid-select">
                    <SelectValue placeholder="Select fluid" />
                  </SelectTrigger>
                  <SelectContent>
                    {FLUIDS.map(f => (
                      <SelectItem key={f.name} value={f.name}>{f.name} ({f.density.toFixed(2)} g/cm³)</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Separator />

            <Button onClick={handlePlaceRemoveObject} className="w-full">
              {isObjectInFluid ? "Remove Object from Fluid" : "Place Object in Fluid"}
            </Button>

          </CardContent>
        </Card>

        {/* Simulation and Data Panel */}
        <div className="md:col-span-2 space-y-6">
          {/* Visual Simulation */}
          <Card>
            <CardHeader>
              <CardTitle>Visual Simulation</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-2">
              <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="border rounded-md bg-slate-50"></canvas>
              <p className={`text-lg font-semibold ${statusMessage.color}`}>{statusMessage.text}</p>
            </CardContent>
          </Card>

          {/* Calculated Values */}
          <Card>
            <CardHeader>
              <CardTitle>Calculated Values</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm md:text-base grid grid-cols-2 gap-x-4 gap-y-1">
              <p>Obj. Density: <span className="font-semibold">{objectProperties.densityGcm3.toFixed(3)} g/cm³</span></p>
              <p>Obj. Mass: <span className="font-semibold">{objectProperties.massG.toFixed(2)} g</span></p>
              
              <p>Fluid Density: <span className="font-semibold">{fluidProperties.densityGcm3.toFixed(3)} g/cm³</span></p>
              <p>Wt. in Air: <span className="font-semibold">{simulationData.weightInAirN.toFixed(3)} N</span></p>
              
              <p className="text-blue-600">Buoyant Force (F<sub>b</sub>): <span className="font-semibold">{simulationData.buoyantForceN.toFixed(3)} N</span></p>
              <p className="text-red-600">Apparent Wt.: <span className="font-semibold">{simulationData.apparentWeightN.toFixed(3)} N</span></p>
              
              <p>Submerged: <span className="font-semibold">{simulationData.percentageSubmerged.toFixed(1)}%</span></p>
              <p>Vol. Displaced Fluid: <span className="font-semibold">{simulationData.volumeDisplacedCm3.toFixed(2)} cm³</span></p>
              
              <p className="col-span-2 text-green-700">Wt. Displaced Fluid: <span className="font-semibold">{simulationData.weightDisplacedFluidN.toFixed(3)} N</span></p>
            </CardContent>
            <CardFooter>
                <CardDescription>
                    Note: Weight of Displaced Fluid should equal Buoyant Force (Archimedes' Principle).
                </CardDescription>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DensityBuoyancyLabG9Page;