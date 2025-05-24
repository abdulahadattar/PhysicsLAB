
// src/app/(app)/simulations/thermal-expansion-g9/page.tsx
"use client";

import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, HelpCircle, Thermometer } from "lucide-react";
import Link from "next/link";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils"; // Added missing import

interface MaterialExpansion {
  name: string;
  alpha: number; // Coefficient of linear expansion (per °C)
  color: string; // hsl format for styling
}

const MATERIALS_EXPANSION: MaterialExpansion[] = [
  { name: "Aluminium", alpha: 23e-6, color: "hsl(210, 25%, 75%)" },
  { name: "Copper", alpha: 17e-6, color: "hsl(25, 70%, 60%)" },
  { name: "Steel (Carbon)", alpha: 12e-6, color: "hsl(220, 10%, 50%)" },
  { name: "Glass (Common)", alpha: 9e-6, color: "hsl(190, 30%, 80%)" },
  { name: "Brass", alpha: 19e-6, color: "hsl(45, 60%, 55%)" },
];

const VISUAL_BASE_LENGTH_PX = 200; // Base width for 1 meter representation on smaller screens
const VISUAL_EXPANSION_SCALE_FACTOR = 50000; // Increased for more noticeable visual change

export default function ThermalExpansionG9Page() {
  const [selectedMaterialName, setSelectedMaterialName] = useState<string>(MATERIALS_EXPANSION[0].name);
  const [initialLengthMeters, setInitialLengthMeters] = useState<number>(1.0);
  const [initialTemperatureCelsius, setInitialTemperatureCelsius] = useState<number>(20);
  const [finalTemperatureCelsius, setFinalTemperatureCelsius] = useState<number>(20);

  const selectedMaterial = useMemo(() => {
    return MATERIALS_EXPANSION.find(m => m.name === selectedMaterialName) || MATERIALS_EXPANSION[0];
  }, [selectedMaterialName]);

  const temperatureChange = useMemo(() => {
    return finalTemperatureCelsius - initialTemperatureCelsius;
  }, [finalTemperatureCelsius, initialTemperatureCelsius]);

  const changeInLengthMeters = useMemo(() => {
    return selectedMaterial.alpha * initialLengthMeters * temperatureChange;
  }, [selectedMaterial.alpha, initialLengthMeters, temperatureChange]);

  const finalLengthMeters = useMemo(() => {
    return initialLengthMeters + changeInLengthMeters;
  }, [initialLengthMeters, changeInLengthMeters]);

  const visualInitialLengthPx = Math.max(20, VISUAL_BASE_LENGTH_PX * initialLengthMeters);
  const visualChangeInLengthPx = changeInLengthMeters * VISUAL_EXPANSION_SCALE_FACTOR; // Corrected scaling
  const visualFinalLengthPx = visualInitialLengthPx + visualChangeInLengthPx;


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
                <Thermometer className="h-8 w-8 text-primary" />
                G9: Thermal Expansion Simulator
              </CardTitle>
              <CardDescription>
                Explore linear thermal expansion of different materials. Adjust initial length, temperatures, and material type to see how length changes.
                (STBB Relevance: Thermal Properties of Matter, Linear Expansion)
              </CardDescription>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon"><HelpCircle className="h-5 w-5"/></Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 text-sm space-y-2">
                <h4 className="font-medium leading-none mb-1">How to Use:</h4>
                <ul className="list-disc list-inside text-muted-foreground text-xs space-y-1">
                  <li>Select a material from the dropdown.</li>
                  <li>Set the Initial Length of the rod (in meters).</li>
                  <li>Set the Initial Temperature (in Celsius).</li>
                  <li>Use the slider to adjust the Final Temperature.</li>
                  <li>Observe the visual change in the rod's length and the calculated values.</li>
                  <li>The formula used is: ΔL = α * L₀ * ΔT.</li>
                </ul>
                <p className="text-xs text-muted-foreground pt-1">Note: The visual expansion/contraction is exaggerated for clarity.</p>
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6 items-start">
            {/* Controls Column */}
            <div className="md:col-span-1 space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-lg">Controls</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="material-select">Material (α: {selectedMaterial.alpha.toExponential(2)} /°C)</Label>
                    <Select value={selectedMaterialName} onValueChange={setSelectedMaterialName}>
                      <SelectTrigger id="material-select"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {MATERIALS_EXPANSION.map(m => <SelectItem key={m.name} value={m.name}>{m.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="initial-length">Initial Length (L₀): {initialLengthMeters.toFixed(2)} m</Label>
                    <Input id="initial-length" type="number" value={initialLengthMeters} onChange={e => setInitialLengthMeters(Math.max(0.1, parseFloat(e.target.value) || 0.1))} step="0.1" min="0.1" max="10"/>
                  </div>
                  <div>
                    <Label htmlFor="initial-temp">Initial Temperature (T₀): {initialTemperatureCelsius.toFixed(1)} °C</Label>
                    <Input id="initial-temp" type="number" value={initialTemperatureCelsius} onChange={e => setInitialTemperatureCelsius(parseFloat(e.target.value) || 0)} step="1" min="-100" max="300"/>
                  </div>
                   <div>
                    <Label htmlFor="final-temp-slider">Final Temperature (T): {finalTemperatureCelsius.toFixed(1)} °C</Label>
                    <Slider 
                      id="final-temp-slider" 
                      min={-50} 
                      max={250} 
                      step={0.5} 
                      value={[finalTemperatureCelsius]} 
                      onValueChange={(val) => setFinalTemperatureCelsius(val[0])} 
                    />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-lg">Calculated Results</CardTitle></CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <p>Temperature Change (ΔT): <span className="font-semibold">{temperatureChange.toFixed(1)} °C</span></p>
                  <p>Change in Length (ΔL): <span className={cn("font-semibold", changeInLengthMeters > 0 ? "text-green-600 dark:text-green-400" : changeInLengthMeters < 0 ? "text-red-600 dark:text-red-400" : "")}>
                    {(changeInLengthMeters * 100).toFixed(4)} cm 
                    </span> 
                    ({(changeInLengthMeters).toExponential(2)} m)
                  </p>
                  <p>Final Length (L): <span className="font-semibold">{finalLengthMeters.toFixed(4)} m</span></p>
                </CardContent>
              </Card>
            </div>

            {/* Visualization Column */}
            <div className="md:col-span-2">
              <Card className="h-full">
                <CardHeader><CardTitle className="text-lg">Visual Representation</CardTitle></CardHeader>
                <CardContent className="flex flex-col items-center justify-center p-4 min-h-[250px] bg-muted/30 rounded-md border relative overflow-hidden">
                  <div className="w-full max-w-md space-y-3 my-auto"> {/* Centering content vertically */}
                    {/* Initial Length Reference Bar */}
                    <div className="text-center text-xs text-muted-foreground mb-1">
                      Initial State (L₀ @ T₀)
                    </div>
                    <div 
                        className="relative h-8 bg-gray-400 dark:bg-gray-600 rounded flex items-center justify-center text-xs text-white transition-all duration-200 ease-out" 
                        style={{ 
                          width: `${Math.max(20, visualInitialLengthPx)}px`,
                          minWidth: '80px' // Ensure a minimum visible size for the reference bar
                        }}
                    >
                       L₀ = {initialLengthMeters.toFixed(2)}m @ {initialTemperatureCelsius.toFixed(1)}°C
                       <div className="absolute left-0 top-1/2 -translate-y-1/2 h-10 w-px bg-gray-500 dark:bg-gray-400"></div>
                       <div className="absolute right-0 top-1/2 -translate-y-1/2 h-10 w-px bg-gray-500 dark:bg-gray-400"></div>
                    </div>
                    
                    {/* Expanding/Contracting Bar */}
                     <div className="text-center text-xs text-muted-foreground mt-4 mb-1">
                      Final State (L @ T)
                    </div>
                    <div 
                      className="relative h-10 rounded transition-all duration-200 ease-out flex items-center justify-center text-white text-sm font-medium shadow-md"
                      style={{ 
                        width: `${Math.max(20, visualFinalLengthPx)}px`, 
                        minWidth: '80px', // Ensure a minimum visible size
                        backgroundColor: selectedMaterial.color,
                      }}
                    >
                      L = {finalLengthMeters.toFixed(4)}m @ {finalTemperatureCelsius.toFixed(1)}°C
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-12 w-px bg-current opacity-70"></div>
                       <div className="absolute right-0 top-1/2 -translate-y-1/2 h-12 w-px bg-current opacity-70"></div>
                    </div>
                    
                    {/* Change Indicator */}
                    {Math.abs(changeInLengthMeters) > 1e-9 && ( // Adjusted threshold for visibility
                      <div className={cn(
                        "text-sm font-semibold text-center mt-2",
                        changeInLengthMeters > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                      )}>
                        ΔL: {(changeInLengthMeters * 100).toFixed(4)} cm {changeInLengthMeters > 0 ? "(Expansion)" : "(Contraction)"}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-4 absolute bottom-2 left-1/2 -translate-x-1/2 w-full text-center">
                    Note: Visual change is exaggerated ({VISUAL_EXPANSION_SCALE_FACTOR}x) for clarity.
                  </p>
                </CardContent>
                 <CardFooter className="pt-4">
                    <p className="text-xs text-muted-foreground">
                        Observe how different materials expand or contract with temperature changes.
                    </p>
                </CardFooter>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

