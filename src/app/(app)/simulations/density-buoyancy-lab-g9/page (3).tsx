"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Info, ArrowDown, ArrowUp } from 'lucide-react'; // Add ArrowUp
import { cn } from '@/lib/utils'; // Assuming you have this utility

/**
 * Constants
 */
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 400;
const BEAKER_WIDTH = CANVAS_WIDTH * 0.8; // 80% of canvas width
const BEAKER_HEIGHT = CANVAS_HEIGHT * 0.7; // 70% of canvas height
const BEAKER_BASE_Y = CANVAS_HEIGHT - 20; // Position of the bottom of the beaker
const BEAKER_LEFT_X = (CANVAS_WIDTH - BEAKER_WIDTH) / 2;
const BEAKER_RIGHT_X = BEAKER_LEFT_X + BEAKER_WIDTH;
const BEAKER_WATER_LEVEL_RATIO = 0.7; // Water fills 70% of beaker height initially
const FLUID_TOP_SURFACE_Y_INITIAL = BEAKER_BASE_Y - BEAKER_HEIGHT * BEAKER_WATER_LEVEL_RATIO;

const OBJECT_BASE_WIDTH_CM = 5; // Base width of object in cm
const OBJECT_BASE_HEIGHT_CM = 5; // Base height of object in cm
const OBJECT_INITIAL_Y_ABOVE = 50; // Initial Y position when out of fluid

const G_ACCELERATION = 9.81; // m/s^2
const G_SCALED_FOR_GRAMS = G_ACCELERATION / 1000; // N/g (if density in g/cm^3 and volume in cm^3)

const PIXELS_PER_CM = 10; // Visual scale factor: 1 cm in simulation = 10 pixels on canvas

const MATERIALS = {
  custom: { name: "Custom", density: 0, color: "#94a3b8" }, // slate-400
  wood: { name: "Wood", density: 0.5, color: "#a16207" }, // amber-800
  plastic: { name: "Plastic", density: 1.1, color: "#065f46" }, // emerald-800
  aluminum: { name: "Aluminum", density: 2.7, color: "#a3a3a3" }, // neutral-400
  iron: { name: "Iron", density: 7.87, color: "#4b5563" }, // gray-700
  lead: { name: "Lead", density: 11.34, color: "#1f2937" }, // gray-900
  gold: { name: "Gold", density: 19.3, color: "#facc15" }, // yellow-400
};

const FLUIDS = {
  custom: { name: "Custom", density: 0, color: "#60a5fa" }, // blue-400
  water: { name: "Water", density: 1.0, color: "#60a5fa" }, // blue-400 (1 g/cm^3)
  oil: { name: "Oil", density: 0.9, color: "#fde047" }, // yellow-300
  glycerin: { name: "Glycerin", density: 1.26, color: "#a78bfa" }, // violet-400
  mercury: { name: "Mercury", density: 13.6, color: "#94a3b8" }, // slate-400
};

/**
 * Physics Calculations
 */
interface SimulationData {
  objectDensity: number; // g/cm^3
  objectVolumeCm3: number; // cm^3
  fluidDensity: number; // g/cm^3
  objectMassG: number; // grams
  weightInAirN: number; // Newtons
  buoyantForceN: number; // Newtons
  apparentWeightN: number; // Newtons
  isFloating: boolean;
  percentageSubmerged: number; // %
  objectPositionCanvasY: number; // Y coordinate on canvas (top of object)
  fluidTopSurfaceCanvasY: number; // Y coordinate of fluid surface on canvas
}

function calculateSimulationData(
  objectDensity: number,
  objectVolumeCm3: number,
  fluidDensity: number,
  isObjectInFluid: boolean,
  beakerActualHeight: number, // actual height of beaker in pixels
  beakerBaseY: number,       // Y coordinate of beaker base
  pixelsPerCm: number,
  objectBaseWidthCm: number,
  objectBaseHeightCm: number,
): SimulationData {
  const objectMassG = objectDensity * objectVolumeCm3;
  const weightInAirN = objectMassG * G_SCALED_FOR_GRAMS; // Weight in Newtons

  let buoyantForceN = 0;
  let apparentWeightN = weightInAirN;
  let isFloating = false;
  let percentageSubmerged = 0;
  let objectPositionCanvasY = BEAKER_BASE_Y - OBJECT_INITIAL_Y_ABOVE; // Default position when out of fluid
  let fluidTopSurfaceCanvasY = beakerBaseY - beakerActualHeight * BEAKER_WATER_LEVEL_RATIO; // Initial level

  // Scale object dimensions for visual representation
  const volumeRatio = objectVolumeCm3 / (objectBaseWidthCm * objectBaseHeightCm * objectBaseWidthCm); // Assuming base object is a cube
  const scaleFactor = Math.pow(volumeRatio, 1/3); // Scale factor for linear dimensions
  const objectDisplayWidth = objectBaseWidthCm * scaleFactor * pixelsPerCm;
  const objectDisplayHeight = objectBaseHeightCm * scaleFactor * pixelsPerCm;

  if (isObjectInFluid) {
    // Calculate buoyant force if in fluid
    const maxBuoyantForceN = fluidDensity * objectVolumeCm3 * G_SCALED_FOR_GRAMS; // Max possible buoyant force (if fully submerged)

    if (weightInAirN <= maxBuoyantForceN) {
      // Object floats or is neutrally buoyant
      isFloating = true;
      buoyantForceN = weightInAirN; // Buoyant force equals weight
      apparentWeightN = 0; // Apparent weight is zero when floating

      // Calculate submerged volume and percentage
      const submergedVolume = weightInAirN / (fluidDensity * G_SCALED_FOR_GRAMS); // V_submerged = F_buoyant / (rho_fluid * g)
      percentageSubmerged = (submergedVolume / objectVolumeCm3) * 100;
      if (percentageSubmerged > 100) percentageSubmerged = 100; // Should not happen if floating

      // Position object based on submerged percentage
      const submergedDepthPixels = objectDisplayHeight * (percentageSubmerged / 100);
      // Position object so that the submerged depth is below the fluid surface
      fluidTopSurfaceCanvasY = beakerBaseY - beakerActualHeight * BEAKER_WATER_LEVEL_RATIO; // Still using initial water level
      objectPositionCanvasY = fluidTopSurfaceCanvasY - (objectDisplayHeight - submergedDepthPixels);


    } else {
      // Object sinks
      isFloating = false;
      buoyantForceN = maxBuoyantForceN; // Buoyant force is max possible (when fully submerged)
      apparentWeightN = weightInAirN - buoyantForceN; // Apparent weight is weight - buoyant force
      percentageSubmerged = 100; // Fully submerged

       // Position object at the bottom of the beaker
       fluidTopSurfaceCanvasY = beakerBaseY - beakerActualHeight * BEAKER_WATER_LEVEL_RATIO; // Still using initial water level
       objectPositionCanvasY = BEAKER_BASE_Y - objectDisplayHeight;
    }
  }

   // Adjust object position if out of fluid
   if (!isObjectInFluid) {
     objectPositionCanvasY = BEAKER_BASE_Y - objectDisplayHeight - OBJECT_INITIAL_Y_ABOVE;
   } else {
     // Ensure object doesn't go above the initial fluid level if it somehow calculated higher
     if (objectPositionCanvasY < fluidTopSurfaceCanvasY - objectDisplayHeight && isFloating) {
          objectPositionCanvasY = fluidTopSurfaceCanvasY - objectDisplayHeight; // Cap top position if floating
     }
   }


  return {
    objectDensity,
    objectVolumeCm3,
    fluidDensity,
    objectMassG,
    weightInAirN,
    buoyantForceN,
    apparentWeightN,
    isFloating,
    percentageSubmerged,
    objectPositionCanvasY,
    fluidTopSurfaceCanvasY,
  };
}


/**
 * Drawing Function
 */
interface DrawSimulationProps {
  ctx: CanvasRenderingContext2D;
  simulationData: SimulationData;
  selectedMaterial: typeof MATERIALS[keyof typeof MATERIALS];
  selectedFluid: typeof FLUIDS[keyof typeof FLUIDS];
  isObjectInFluid: boolean;
  beakerActualHeight: number;
  beakerBaseY: number;
  beakerLeftX: number;
  beakerRightX: number;
  pixelsPerCm: number;
  objectBaseWidthCm: number;
  objectBaseHeightCm: number;
  arrowLength: number; // Base length for force arrows
}


function drawSimulation(props: DrawSimulationProps) {
  const {
    ctx,
    simulationData,
    selectedMaterial,
    selectedFluid,
    isObjectInFluid,
    beakerActualHeight,
    beakerBaseY,
    beakerLeftX,
    beakerRightX,
    pixelsPerCm,
    objectBaseWidthCm,
    objectBaseHeightCm,
    arrowLength,
  } = props;

  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Draw Beaker
  ctx.strokeStyle = '#4b5563'; // gray-700
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(beakerLeftX, beakerBaseY);
  ctx.lineTo(beakerLeftX, beakerBaseY - beakerActualHeight);
  ctx.lineTo(beakerRightX, beakerBaseY - beakerActualHeight);
  ctx.lineTo(beakerRightX, beakerBaseY);
  ctx.stroke();

  // Draw Fluid (up to the initial water level)
  const fluidTopSurfaceY = beakerBaseY - beakerActualHeight * BEAKER_WATER_LEVEL_RATIO;
  ctx.fillStyle = selectedFluid.color + 'cc'; // Add some transparency
  ctx.beginPath();
  ctx.rect(beakerLeftX, fluidTopSurfaceY, BEAKER_WIDTH, beakerBaseY - fluidTopSurfaceY);
  ctx.fill();

  // Scale object dimensions for visual representation
  const volumeRatio = simulationData.objectVolumeCm3 / (objectBaseWidthCm * objectBaseHeightCm * objectBaseWidthCm);
  const scaleFactor = Math.pow(volumeRatio, 1/3);
  const objectDisplayWidth = objectBaseWidthCm * scaleFactor * pixelsPerCm;
  const objectDisplayHeight = objectBaseHeightCm * scaleFactor * pixelsPerCm;

  // Draw Object
  const objectLeftX = (CANVAS_WIDTH - objectDisplayWidth) / 2; // Center the object horizontally
  const objectTopY = simulationData.objectPositionCanvasY;

  ctx.fillStyle = selectedMaterial.color;
  ctx.strokeStyle = selectedMaterial.color === "#facc15" ? '#b45309' : '#374151'; // darker stroke for gold
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.rect(objectLeftX, objectTopY, objectDisplayWidth, objectDisplayHeight);
  ctx.fill();
  ctx.stroke();

  // Draw Forces if object is in fluid
  if (isObjectInFluid) {
    const objectCenterX = objectLeftX + objectDisplayWidth / 2;
    const objectCenterY = objectTopY + objectDisplayHeight / 2;

    // Draw Weight Arrow (downwards from center)
    const weightArrowLength = arrowLength; // Base length for weight
    ctx.strokeStyle = '#dc2626'; // red-600
    ctx.fillStyle = '#dc2626';
    ctx.lineWidth = 2;
    drawArrow(ctx, objectCenterX, objectCenterY, objectCenterX, objectCenterY + weightArrowLength);
    ctx.fillText(`Weight: ${simulationData.weightInAirN.toFixed(2)} N`, objectCenterX + 15, objectCenterY + weightArrowLength + 5);


    // Draw Buoyant Force Arrow (upwards, scaled by magnitude relative to weight)
    const buoyantArrowScale = simulationData.weightInAirN > 0 ? Math.min(1, simulationData.buoyantForceN / simulationData.weightInAirN) : 0;
    const buoyantArrowLength = weightArrowLength * buoyantArrowScale;

    ctx.strokeStyle = '#059669'; // emerald-600
    ctx.fillStyle = '#059669';
    ctx.lineWidth = 2;
    drawArrow(ctx, objectCenterX, objectCenterY, objectCenterX, objectCenterY - buoyantArrowLength);
     // Adjust text position based on arrow direction
     if (buoyantArrowLength > 0) {
        ctx.fillText(`Buoyancy: ${simulationData.buoyantForceN.toFixed(2)} N`, objectCenterX + 15, objectCenterY - buoyantArrowLength - 5);
     } else {
        ctx.fillText(`Buoyancy: ${simulationData.buoyantForceN.toFixed(2)} N`, objectCenterX + 15, objectCenterY - 5);
     }


    // Draw Apparent Weight Arrow (downwards from center, only if sinking)
    if (!simulationData.isFloating && simulationData.apparentWeightN > 0) {
        const apparentWeightArrowLength = weightArrowLength * (simulationData.apparentWeightN / simulationData.weightInAirN); // Scale relative to weight

        ctx.strokeStyle = '#f97316'; // orange-500
        ctx.fillStyle = '#f97316';
        ctx.lineWidth = 2;
        // Draw slightly offset to avoid overlap with weight arrow if desired, or directly below.
        // Drawing directly below for simplicity here:
        drawArrow(ctx, objectCenterX, objectCenterY, objectCenterX, objectCenterY + apparentWeightArrowLength);
        ctx.fillText(`Apparent Wt: ${simulationData.apparentWeightN.toFixed(2)} N`, objectCenterX + 15, objectCenterY + apparentWeightArrowLength + 18);

    } else if (simulationData.isFloating) {
         // Indicate apparent weight is 0 when floating
         ctx.fillStyle = '#f97316'; // orange-500
         ctx.fillText(`Apparent Wt: 0 N (Floating)`, objectCenterX + 15, objectCenterY + 18);
    }


    // Draw Fluid Surface Level (potentially raised by submerged object)
    // This is more complex as it requires calculating displaced fluid volume and new level.
    // For simplicity, we'll keep the visual fluid surface at the initial level for now,
    // but show the submerged depth visually.
    // A more advanced version would recalculate fluidTopSurfaceY based on displaced volume.

    // Visual indicator of submerged depth for floating objects
     if (simulationData.isFloating && simulationData.percentageSubmerged < 100) {
        const submergedDepthPixels = objectDisplayHeight * (simulationData.percentageSubmerged / 100);
        const submergedLineY = objectTopY + submergedDepthPixels;
        ctx.strokeStyle = '#e2e8f0'; // blue-100 or similar light color
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(objectLeftX, submergedLineY);
        ctx.lineTo(objectLeftX + objectDisplayWidth, submergedLineY);
        ctx.stroke();
     }


  }

    // Add labels for fluid surface and ground if needed
     ctx.fillStyle = '#4b5563'; // gray-700
     ctx.font = '12px Arial';
     ctx.fillText(`Fluid Surface (Initial)`, BEAKER_LEFT_X + BEAKER_WIDTH + 5, fluidTopSurfaceY + 5);
     ctx.fillText(`Beaker Base`, BEAKER_LEFT_X + BEAKER_WIDTH + 5, BEAKER_BASE_Y - 5);

}

// Helper function to draw an arrow
function drawArrow(ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number) {
  const headLength = 10;
  const dx = toX - fromX;
  const dy = toY - fromY;
  const angle = Math.atan2(dy, dx);

  // Draw line
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();

  // Draw arrowhead
  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
  ctx.moveTo(toX, toY);
  ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
  ctx.stroke();
}


/**
 * React Component
 */
export default function DensityBuoyancyLabG9Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // State for inputs
  const [selectedMaterialKey, setSelectedMaterialKey] = useState<keyof typeof MATERIALS>('wood');
  const [customObjectDensity, setCustomObjectDensity] = useState(1.0); // g/cm^3
  const [objectVolumeCm3, setObjectVolumeCm3] = useState(100); // cm^3

  const [selectedFluidKey, setSelectedFluidKey] = useState<keyof typeof FLUIDS>('water');
  const [customFluidDensity, setCustomFluidDensity] = useState(1.0); // g/cm^3

  // Simulation state
  const [isObjectInFluid, setIsObjectInFluid] = useState(false);
  const [simulationData, setSimulationData] = useState<SimulationData | null>(null);

  // Derived state for calculations
  const selectedMaterial = MATERIALS[selectedMaterialKey];
  const selectedFluid = FLUIDS[selectedFluidKey];

  const objectDensity = selectedMaterialKey === 'custom' ? customObjectDensity : selectedMaterial.density;
  const fluidDensity = selectedFluidKey === 'custom' ? customFluidDensity : selectedFluid.density;

    // UseMemo for beaker and fluid dimensions
    const beakerActualHeight = useMemo(() => BEAKER_HEIGHT, []); // Assuming fixed visual height for beaker
    const beakerBaseY = useMemo(() => BEAKER_BASE_Y, []);
    const beakerLeftX = useMemo(() => BEAKER_LEFT_X, []);
    const beakerRightX = useMemo(() => BEAKER_RIGHT_X, []);


  // Calculate simulation data whenever inputs or state change
  useEffect(() => {
    const data = calculateSimulationData(
      objectDensity,
      objectVolumeCm3,
      fluidDensity,
      isObjectInFluid,
      beakerActualHeight,
      beakerBaseY,
      PIXELS_PER_CM,
      OBJECT_BASE_WIDTH_CM,
      OBJECT_BASE_HEIGHT_CM,
    );
    setSimulationData(data);
  }, [objectDensity, objectVolumeCm3, fluidDensity, isObjectInFluid, beakerActualHeight, beakerBaseY]);


  // Draw simulation whenever simulationData changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !simulationData) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Determine arrow length based on object size - aim for arrow length proportional to obj height, capped.
    const volumeRatio = simulationData.objectVolumeCm3 / (OBJECT_BASE_WIDTH_CM * OBJECT_BASE_HEIGHT_CM * OBJECT_BASE_WIDTH_CM);
    const scaleFactor = Math.pow(volumeRatio, 1/3);
    const objectDisplayHeight = OBJECT_BASE_HEIGHT_CM * scaleFactor * PIXELS_PER_CM;
    const arrowLength = Math.max(30, Math.min(80, objectDisplayHeight * 0.8)); // Base arrow length

    drawSimulation({
      ctx,
      simulationData,
      selectedMaterial,
      selectedFluid,
      isObjectInFluid,
      beakerActualHeight,
      beakerBaseY,
      beakerLeftX,
      beakerRightX,
      pixelsPerCm: PIXELS_PER_CM,
      objectBaseWidthCm: OBJECT_BASE_WIDTH_CM,
      objectBaseHeightCm: OBJECT_BASE_HEIGHT_CM,
      arrowLength: arrowLength, // Pass calculated arrow length
    });
  }, [simulationData, selectedMaterial, selectedFluid, isObjectInFluid, beakerActualHeight, beakerBaseY]);


  // Handle button clicks
  const handlePlaceResetObject = () => {
    if (isObjectInFluid) {
      // If object is in fluid, remove and reset state
      setIsObjectInFluid(false);
      toast({ title: "Object Removed", description: "Object is now outside the fluid." });
    } else {
      // If object is out of fluid, place it in fluid
      setIsObjectInFluid(true);
       toast({ title: "Object Placed", description: "Object is now in the fluid." });
    }
  };


  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Density and Buoyancy Lab</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Simulation Canvas */}
        <Card className="flex flex-col items-center justify-center p-4">
           <CardHeader><CardTitle>Simulation View</CardTitle></CardHeader>
           <CardContent>
             <div className="relative w-[400px] h-[400px] border rounded-md overflow-hidden bg-white">
                 <canvas
                   ref={canvasRef}
                   width={CANVAS_WIDTH}
                   height={CANVAS_HEIGHT}
                   className="block"
                   role="img"
                   aria-label={`Simulation showing an object with density ${objectDensity.toFixed(2)} g/cm³ and volume ${objectVolumeCm3.toFixed(1)} cm³ placed in a fluid with density ${fluidDensity.toFixed(2)} g/cm³.`}
                 />
             </div>
           </CardContent>
        </Card>


        {/* Controls and Outputs */}
        <div className="space-y-6">
          {/* Object Properties */}
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    Object Properties
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="w-6 h-6"><Info className="w-4 h-4" /></Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 text-sm">
                            Adjust the material (density) and volume of the object. The visual size of the object scales with volume.
                        </PopoverContent>
                    </Popover>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label htmlFor="object-material">Material</Label>
                    <Select value={selectedMaterialKey} onValueChange={(value: keyof typeof MATERIALS) => setSelectedMaterialKey(value)}>
                        <SelectTrigger id="object-material">
                            <SelectValue placeholder="Select material" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(MATERIALS).map(([key, material]) => (
                                <SelectItem key={key} value={key}>{material.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                {selectedMaterialKey === 'custom' && (
                    <div>
                        <Label htmlFor="custom-object-density">Custom Density (g/cm³)</Label>
                         <Input
                            id="custom-object-density"
                            type="number"
                            step="0.1"
                            value={customObjectDensity}
                             onChange={e => setCustomObjectDensity(Math.max(0.01, parseFloat(e.target.value) || 0.01))}
                            min="0.01"
                            className="h-8 mt-1 text-sm"
                         />
                    </div>
                )}
                <div>
                    <Label htmlFor="object-volume">Volume (cm³)</Label>
                    <Input
                       id="object-volume"
                       type="number"
                       step="10"
                       value={objectVolumeCm3}
                        onChange={e => setObjectVolumeCm3(Math.max(1, parseFloat(e.target.value) || 1))}
                       min="1"
                       className="h-8 mt-1 text-sm"
                    />
                </div>
                 <p className="text-sm text-muted-foreground mt-2">Calculated Density: <span className="font-semibold">{objectDensity.toFixed(2)} g/cm³</span></p>
            </CardContent>
          </Card>

           {/* Fluid Properties */}
          <Card>
            <CardHeader>
                 <CardTitle className="flex items-center justify-between">
                    Fluid Properties
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="w-6 h-6"><Info className="w-4 h-4" /></Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 text-sm">
                            Select the fluid. The buoyancy depends on the fluid's density.
                        </PopoverContent>
                    </Popover>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div>
                    <Label htmlFor="fluid-material">Fluid</Label>
                    <Select value={selectedFluidKey} onValueChange={(value: keyof typeof FLUIDS) => setSelectedFluidKey(value)}>
                        <SelectTrigger id="fluid-material">
                            <SelectValue placeholder="Select fluid" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(FLUIDS).map(([key, fluid]) => (
                                <SelectItem key={key} value={key}>{fluid.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                {selectedFluidKey === 'custom' && (
                    <div>
                        <Label htmlFor="custom-fluid-density">Custom Density (g/cm³)</Label>
                         <Input
                            id="custom-fluid-density"
                            type="number"
                            step="0.1"
                            value={customFluidDensity}
                            onChange={e => setCustomFluidDensity(Math.max(0.01, parseFloat(e.target.value) || 0.01))}
                            min="0.01"
                            className="h-8 mt-1 text-sm"
                         />
                    </div>
                )}
                <p className="text-sm text-muted-foreground mt-2">Calculated Density: <span className="font-semibold">{fluidDensity.toFixed(2)} g/cm³</span></p>
            </CardContent>
          </Card>


          {/* Simulation Controls */}
          <Card>
            <CardHeader><CardTitle>Simulation Control</CardTitle></CardHeader>
            <CardContent>
              <Button onClick={handlePlaceResetObject} className="w-full">
                {isObjectInFluid ? 'Remove from Fluid & Reset' : 'Place Object in Fluid'}
              </Button>
            </CardContent>
          </Card>


          {/* Calculated Values */}
           {simulationData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Calculated Values
                   <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="w-6 h-6"><Info className="w-4 h-4" /></Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 text-sm">
                           Displays the calculated properties of the object and the forces acting on it based on the selected material, volume, and fluid.
                        </PopoverContent>
                    </Popover>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>Object Mass: <span className="font-semibold">{simulationData.objectMassG.toFixed(2)} g</span></p>
                 <p className={cn("flex items-center", simulationData.weightInAirN > 0 && "text-red-600 dark:text-red-500")}>
                    <ArrowDown className="w-4 h-4 mr-1"/>
                    Weight (W): <span className="font-semibold ml-1">{simulationData.weightInAirN.toFixed(2)} N</span>
                </p>
                 <p className={cn("flex items-center", simulationData.buoyantForceN > 0 && "text-emerald-600 dark:text-emerald-500")}>
                     <ArrowUp className="w-4 h-4 mr-1"/>
                     Buoyant Force (F<small>B</small>): <span className="font-semibold ml-1">{simulationData.buoyantForceN.toFixed(2)} N</span>
                 </p>
                 <p className={cn("flex items-center", simulationData.apparentWeightN > 0 ? "text-orange-600 dark:text-orange-500" : "text-gray-600 dark:text-gray-400")}>
                     {simulationData.apparentWeightN > 0 ? <ArrowDown className="w-4 h-4 mr-1"/> : <span className="w-4 h-4 mr-1"></span>}
                     Apparent Weight (W<small>apparent</small>): <span className="font-semibold ml-1">{simulationData.apparentWeightN.toFixed(2)} N</span>
                 </p>
                <p>Result: <span className="font-semibold">{simulationData.isFloating ? 'Object Floats' : 'Object Sinks'}</span></p>
                {simulationData.isFloating && (
                    <p>Percentage Submerged: <span className="font-semibold">{simulationData.percentageSubmerged.toFixed(1)} %</span></p>
                )}
              </CardContent>
            </Card>
           )}
        </div>
      </div>
    </div>
  );
}