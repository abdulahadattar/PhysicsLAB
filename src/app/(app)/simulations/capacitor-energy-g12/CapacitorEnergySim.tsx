"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { BatteryCharging, Play, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils"; // Assuming you have a utils file with cn

// Helper function for Tailwind CSS class merging
// import { cn } from "@/lib/utils";

const CapacitorEnergySim: React.FC = () => {
  const [capacitance, setCapacitance] = useState<number>(10); // in µF
  const [voltage, setVoltage] = useState<number>(5); // in V
  const [energy, setEnergy] = useState<number>(0); // in Joules
  const [charge, setCharge] = useState<number>(0); // in Coulombs
  const [isCharging, setIsCharging] = useState<boolean>(false);
  const [chargeProgress, setChargeProgress] = useState<number>(0); // 0 to 100%

  const animationFrameId = useRef<number | null>(null);
  const startTime = useRef<number | null>(null);
  const duration = 2000; // milliseconds for charging animation

  const calculateEnergyAndCharge = (c: number, v: number) => {
    // Convert capacitance from µF to F
    const cInFarads = c * 1e-6;
    const calculatedEnergy = 0.5 * cInFarads * v * v;
    const calculatedCharge = cInFarads * v;
    return { energy: calculatedEnergy, charge: calculatedCharge };
  };

  useEffect(() => {
    // Calculate initial values when component mounts or sliders change (before charging)
    if (!isCharging) {
      const { energy: initialEnergy, charge: initialCharge } = calculateEnergyAndCharge(capacitance, voltage);
      setEnergy(initialEnergy);
      setCharge(initialCharge);
    }
  }, [capacitance, voltage, isCharging]);

  const startCharging = () => {
    setIsCharging(true);
    setChargeProgress(0);
    startTime.current = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - (startTime.current || currentTime);
      const progress = Math.min(elapsed / duration, 1);

      setChargeProgress(progress * 100);

      if (progress < 1) {
        animationFrameId.current = requestAnimationFrame(animate);
      } else {
        setIsCharging(false);
        // Ensure final energy and charge are set after animation
        const { energy: finalEnergy, charge: finalCharge } = calculateEnergyAndCharge(capacitance, voltage);
        setEnergy(finalEnergy);
        setCharge(finalCharge);
      }
    };

    animationFrameId.current = requestAnimationFrame(animate);
  };

  const resetSimulation = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    setIsCharging(false);
    setCapacitance(10);
    setVoltage(5);
    setEnergy(0);
    setCharge(0);
    setChargeProgress(0);
    startTime.current = null;
  };

  useEffect(() => {
    // Cleanup animation frame on unmount
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  // Calculate energy and charge based on current progress during charging
  const currentEnergyDuringCharging = isCharging
    ? calculateEnergyAndCharge(capacitance, voltage).energy * (chargeProgress / 100)
    : energy;

  const currentChargeDuringCharging = isCharging
    ? calculateEnergyAndCharge(capacitance, voltage).charge * (chargeProgress / 100)
    : charge;


  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4">
      {/* Control Panel */}
      <Card className="w-full lg:w-1/3 shadow-lg">
        <CardHeader>
          <CardTitle>Controls</CardTitle>
          <CardDescription>Adjust parameters to see the effect on stored energy.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="capacitance-slider">Capacitance ({capacitance.toFixed(1)} µF)</Label>
            <Slider
              id="capacitance-slider"
              min={1}
              max={100}
              step={0.5}
              value={[capacitance]}
              onValueChange={(value) => !isCharging && setCapacitance(value[0])}
              disabled={isCharging}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="voltage-slider">Voltage ({voltage.toFixed(1)} V)</Label>
            <Slider
              id="voltage-slider"
              min={1}
              max={12}
              step={0.1}
              value={[voltage]}
              onValueChange={(value) => !isCharging && setVoltage(value[0])}
              disabled={isCharging}
            />
          </div>
          <div className="flex gap-4">
            <Button onClick={startCharging} disabled={isCharging}>
              <Play className="mr-2 h-4 w-4" /> Start Charging
            </Button>
            <Button onClick={resetSimulation} variant="outline">
              <RotateCcw className="mr-2 h-4 w-4" /> Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Simulation Area */}
      <Card className="w-full lg:w-1/3 shadow-lg flex flex-col items-center justify-center p-6">
        <CardHeader className="items-center text-center">
          <CardTitle>Simulation</CardTitle>
          <CardDescription>Visual representation of a charging capacitor.</CardDescription>
        </CardHeader>
        <CardContent className="relative w-full h-64 flex items-center justify-center">
          {/* Simple Circuit Visual */}
          <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            {/* Battery Symbol */}
            <line x1="10" y1="100" x2="30" y2="100" stroke="black" strokeWidth="2" />
            <line x1="30" y1="80" x2="30" y2="120" stroke="black" strokeWidth="2" /> {/* Positive plate */}
            <line x1="40" y1="90" x2="40" y2="110" stroke="black" strokeWidth="2" /> {/* Negative plate */}
            <line x1="40" y1="100" x2="60" y2="100" stroke="black" strokeWidth="2" />

            {/* Wires */}
            <line x1="60" y1="100" x2="80" y2="100" stroke="black" strokeWidth="2" />
            <line x1="170" y1="100" x2="190" y2="100" stroke="black" strokeWidth="2" />

            {/* Capacitor Symbol */}
            <line x1="80" y1="70" x2="80" y2="130" stroke="black" strokeWidth="4" /> {/* Plate 1 */}
            <line x1="90" y1="70" x2="90" y2="130" stroke="black" strokeWidth="4" /> {/* Plate 2 */}
            <line x1="80" y1="100" x2="90" y2="100" stroke="black" strokeWidth="2" /> {/* Connection between plates */}


            {/* Connecting wires to capacitor */}
            <line x1="60" y1="100" x2="80" y2="100" stroke="black" strokeWidth="2" />
            <line x1="90" y1="100" x2="170" y2="100" stroke="black" strokeWidth="2" />

             {/* Capacitor Fill - represents energy storage */}
            <rect
              x="80"
              y={70 + (1 - chargeProgress / 100) * 60} // Starts from top, fills downwards
              width="10"
              height={(chargeProgress / 100) * 60}
              fill="lightblue"
            />

          </svg>
           {isCharging && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
              <BatteryCharging className="h-12 w-12 animate-pulse text-primary" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Display */}
      <Card className="w-full lg:w-1/3 shadow-lg">
        <CardHeader>
          <CardTitle>Outputs</CardTitle>
          <CardDescription>Calculated values based on parameters.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Stored Energy (U):</Label>
            <p className="text-xl font-bold">{currentEnergyDuringCharging.toFixed(6)} J</p>
          </div>
          <div>
            <Label>Charge (Q):</Label>
            <p className="text-xl font-bold">{currentChargeDuringCharging.toFixed(6)} C</p>
          </div>
           {/* Optional: Add a placeholder for a graph here */}
           {/* <div>
             <Label>Energy vs. Voltage Graph (Placeholder):</Label>
             <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-muted-foreground text-sm">
               Graph area
             </div>
           </div> */}
        </CardContent>
      </Card>
    </div>
  );
};

export default CapacitorEnergySim;