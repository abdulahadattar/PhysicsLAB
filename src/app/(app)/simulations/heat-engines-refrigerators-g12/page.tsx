// src/components/simulations/HeatEnginesRefrigeratorsSim.tsx
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle, RefreshCw, Thermometer, Zap, TrendingUp, ArrowDownNarrowWide, ArrowUpNarrowWide, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Helper function to convert Celsius to Kelvin
const celsiusToKelvin = (celsius: number): number => celsius + 273.15;
// Helper function to convert Kelvin to Celsius
const kelvinToCelsius = (kelvin: number): number => kelvin - 273.15;

// Constants for default values
const DEFAULT_T_HOT_C = 300; // °C
const DEFAULT_T_COLD_C = 25; // °C
const DEFAULT_Q_H_INPUT = 1000; // Joules for Heat Engine
const DEFAULT_W_IN_INPUT = 200; // Joules for Refrigerator

// Min/Max values for inputs
const MIN_T_HOT_C = 50;
const MAX_T_HOT_C = 500;
const MIN_T_COLD_C = -20;
const MAX_T_COLD_C = 100; // Will be dynamically constrained by T_HOT

const MIN_Q_H_J = 100;
const MAX_Q_H_J = 2000;
const MIN_W_IN_J = 50;
const MAX_W_IN_J = 1000;

interface EnergyFlowProps {
  value: number;
  maxValue: number;
  label: string;
  direction: 'in' | 'out' | 'up' | 'down';
  color?: string;
  showAnimation: boolean;
}

const EnergyArrow: React.FC<EnergyFlowProps> = ({ value, maxValue, label, direction, color = "bg-gray-500", showAnimation }) => {
  const thickness = Math.max(2, Math.min(20, (value / maxValue) * 20)); // Dynamic thickness

  const arrowClasses = "absolute transition-all duration-500 ease-out";
  const labelClasses = "absolute text-xs font-semibold p-1 bg-background/80 rounded";
  const packetClasses = `absolute w-2 h-2 ${color} rounded-full opacity-0`;

  let style: React.CSSProperties = {};
  let labelStyle: React.CSSProperties = {};
  let packetStyle: React.CSSProperties = {};

  if (direction === 'down') { // Q_H for engine, Q_H for refrigerator
    style = { width: `${thickness}px`, height: '60px', left: '50%', top: '60px', transform: 'translateX(-50%)' };
    labelStyle = { top: 'calc(50% - 20px)', left: `${thickness + 5}px` };
    if (showAnimation) packetStyle = { animation: 'flowDown 1s ease-out forwards', left: `${thickness/2 - 4}px`};
  } else if (direction === 'up') { // Q_L for refrigerator
    style = { width: `${thickness}px`, height: '60px', left: '50%', bottom: '60px', transform: 'translateX(-50%)' };
    labelStyle = { bottom: 'calc(50% - 20px)', left: `${thickness + 5}px` };
     if (showAnimation) packetStyle = { animation: 'flowUp 1s ease-out forwards', left: `${thickness/2 - 4}px`};
  } else if (direction === 'out') { // W_out for engine
    style = { height: `${thickness}px`, width: '60px', top: '50%', left: 'calc(100% + 5px)', transform: 'translateY(-50%)' };
    labelStyle = { top: `${thickness + 5}px`, left: '50%', transform: 'translateX(-50%)' };
     if (showAnimation) packetStyle = { animation: 'flowOut 1s ease-out forwards', top: `${thickness/2 - 4}px`};
  } else if (direction === 'in') { // W_in for refrigerator
    style = { height: `${thickness}px`, width: '60px', top: '50%', right: 'calc(100% + 5px)', transform: 'translateY(-50%)' };
    labelStyle = { top: `${thickness + 5}px`, right: '50%', transform: 'translateX(50%)' };
     if (showAnimation) packetStyle = { animation: 'flowIn 1s ease-out forwards', top: `${thickness/2 - 4}px`};
  }


  return (
    <div className={`${arrowClasses} ${color}`} style={style}>
      <span className={labelClasses}>{label}: {value.toFixed(0)} J</span>
      {showAnimation && value > 0 && Array.from({length: 3}).map((_, i) => (
         <div key={i} className={packetClasses} style={{ ...packetStyle, animationDelay: `${i * 0.2}s` }} />
      ))}
    </div>
  );
};


export default function HeatEnginesRefrigeratorsSim() {
  const [mode, setMode] = useState<'engine' | 'refrigerator'>('engine');
  const [tempHotC, setTempHotC] = useState<number>(DEFAULT_T_HOT_C);
  const [tempColdC, setTempColdC] = useState<number>(DEFAULT_T_COLD_C);

  const [heatInputQH, setHeatInputQH] = useState<number>(DEFAULT_Q_H_INPUT); // For engine
  const [workInputWin, setWorkInputWin] = useState<number>(DEFAULT_W_IN_INPUT); // For refrigerator

  const [animateFlow, setAnimateFlow] = useState<boolean>(false);

  // Derived Kelvin temperatures
  const tempHotK = useMemo(() => celsiusToKelvin(tempHotC), [tempHotC]);
  const tempColdK = useMemo(() => celsiusToKelvin(tempColdC), [tempColdC]);

  // Validation
  const isValidTemperatures = useMemo(() => tempHotK > tempColdK, [tempHotK, tempColdK]);

  // Calculations
  const carnotEfficiency = useMemo(() => {
    if (!isValidTemperatures || tempHotK === 0) return 0;
    return 1 - (tempColdK / tempHotK);
  }, [tempHotK, tempColdK, isValidTemperatures]);

  const carnotCopRefrigerator = useMemo(() => {
    if (!isValidTemperatures || (tempHotK - tempColdK) === 0) return 0;
    return tempColdK / (tempHotK - tempColdK);
  }, [tempHotK, tempColdK, isValidTemperatures]);

  // Outputs for Heat Engine
  const workOutput = useMemo(() => {
    if (mode !== 'engine' || !isValidTemperatures) return 0;
    return heatInputQH * carnotEfficiency;
  }, [mode, heatInputQH, carnotEfficiency, isValidTemperatures]);

  const heatRejectedQL_engine = useMemo(() => {
    if (mode !== 'engine' || !isValidTemperatures) return 0;
    return heatInputQH - workOutput;
  }, [mode, heatInputQH, workOutput, isValidTemperatures]);

  // Outputs for Refrigerator
  const heatExtractedQL_refrigerator = useMemo(() => {
    if (mode !== 'refrigerator' || !isValidTemperatures) return 0;
    return workInputWin * carnotCopRefrigerator;
  }, [mode, workInputWin, carnotCopRefrigerator, isValidTemperatures]);

  const heatRejectedQH_refrigerator = useMemo(() => {
    if (mode !== 'refrigerator' || !isValidTemperatures) return 0;
    return heatExtractedQL_refrigerator + workInputWin;
  }, [mode, heatExtractedQL_refrigerator, workInputWin, isValidTemperatures]);


  const triggerAnimation = useCallback(() => {
    setAnimateFlow(false); // Reset animation state
    setTimeout(() => setAnimateFlow(true), 50); // Trigger by setting to true after a short delay
    setTimeout(() => setAnimateFlow(false), 1050); // Animation duration + buffer
  }, []);

  useEffect(() => {
    triggerAnimation();
  }, [mode, tempHotC, tempColdC, heatInputQH, workInputWin, triggerAnimation]);


  const handleTempHotChange = (value: number) => {
    setTempHotC(value);
    if (celsiusToKelvin(value) <= tempColdK) {
      // If T_H becomes <= T_L, adjust T_L to be slightly less than new T_H
      // or clamp T_H to be slightly more than T_L
      // For now, allow invalid state and show warning
    }
  };

  const handleTempColdChange = (value: number) => {
    setTempColdC(value);
     if (celsiusToKelvin(value) >= tempHotK) {
      // If T_L becomes >= T_H, adjust T_H to be slightly more than new T_L
      // or clamp T_L to be slightly less than T_H
      // For now, allow invalid state and show warning
    }
  };

  const handleReset = () => {
    setMode('engine');
    setTempHotC(DEFAULT_T_HOT_C);
    setTempColdC(DEFAULT_T_COLD_C);
    setHeatInputQH(DEFAULT_Q_H_INPUT);
    setWorkInputWin(DEFAULT_W_IN_INPUT);
    triggerAnimation();
  };

  const maxEnergyValue = useMemo(() => {
    if (mode === 'engine') {
      return Math.max(heatInputQH, workOutput, heatRejectedQL_engine, 1); // Avoid division by zero if all are 0
    } else {
      return Math.max(workInputWin, heatExtractedQL_refrigerator, heatRejectedQH_refrigerator, 1);
    }
  }, [mode, heatInputQH, workOutput, heatRejectedQL_engine, workInputWin, heatExtractedQL_refrigerator, heatRejectedQH_refrigerator]);


  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4">
        {/* Column 1: Controls */}
        <Card className="lg:col-span-1 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Zap className="mr-2 h-6 w-6 text-primary" /> Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="deviceMode" className="text-md font-semibold">Device Type</Label>
              <RadioGroup
                id="deviceMode"
                value={mode}
                onValueChange={(value: string) => setMode(value as 'engine' | 'refrigerator')}
                className="mt-2 flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="engine" id="engine" />
                  <Label htmlFor="engine">Heat Engine</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="refrigerator" id="refrigerator" />
                  <Label htmlFor="refrigerator">Refrigerator</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Temperature Controls */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <Label htmlFor="tempHot" className="text-md font-semibold">Hot Reservoir (T<sub>H</sub>)</Label>
                  <span className="text-sm text-muted-foreground">{tempHotC}°C / {tempHotK.toFixed(2)} K</span>
                </div>
                <Input
                    type="number"
                    id="tempHotInput"
                    value={tempHotC}
                    onChange={(e) => handleTempHotChange(parseFloat(e.target.value))}
                    min={MIN_T_HOT_C}
                    max={MAX_T_HOT_C}
                    step={1}
                    className="w-full mb-2"
                />
                <Slider
                  id="tempHot"
                  min={MIN_T_HOT_C}
                  max={MAX_T_HOT_C}
                  step={1}
                  value={[tempHotC]}
                  onValueChange={(value) => handleTempHotChange(value[0])}
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <Label htmlFor="tempCold" className="text-md font-semibold">Cold Reservoir (T<sub>L</sub>)</Label>
                  <span className="text-sm text-muted-foreground">{tempColdC}°C / {tempColdK.toFixed(2)} K</span>
                </div>
                 <Input
                    type="number"
                    id="tempColdInput"
                    value={tempColdC}
                    onChange={(e) => handleTempColdChange(parseFloat(e.target.value))}
                    min={MIN_T_COLD_C}
                    max={Math.min(MAX_T_COLD_C, tempHotC -1)} // Dynamically adjust max for T_L
                    step={1}
                    className="w-full mb-2"
                />
                <Slider
                  id="tempCold"
                  min={MIN_T_COLD_C}
                  max={Math.min(MAX_T_COLD_C, tempHotC -1)} // T_L cannot exceed T_H-1
                  step={1}
                  value={[tempColdC]}
                  onValueChange={(value) => handleTempColdChange(value[0])}
                />
              </div>
            </div>

            {/* Mode-specific Inputs */}
            {mode === 'engine' && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <Label htmlFor="heatInputQH" className="text-md font-semibold">Heat Input (Q<sub>H</sub>)</Label>
                  <span className="text-sm text-muted-foreground">{heatInputQH} J</span>
                </div>
                <Input
                    type="number"
                    id="heatInputQHInput"
                    value={heatInputQH}
                    onChange={(e) => setHeatInputQH(parseFloat(e.target.value))}
                    min={MIN_Q_H_J}
                    max={MAX_Q_H_J}
                    step={10}
                    className="w-full mb-2"
                />
                <Slider
                  id="heatInputQH"
                  min={MIN_Q_H_J}
                  max={MAX_Q_H_J}
                  step={10}
                  value={[heatInputQH]}
                  onValueChange={(value) => setHeatInputQH(value[0])}
                />
              </div>
            )}

            {mode === 'refrigerator' && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <Label htmlFor="workInputWin" className="text-md font-semibold">Work Input (W<sub>in</sub>)</Label>
                  <span className="text-sm text-muted-foreground">{workInputWin} J</span>
                </div>
                 <Input
                    type="number"
                    id="workInputWinInput"
                    value={workInputWin}
                    onChange={(e) => setWorkInputWin(parseFloat(e.target.value))}
                    min={MIN_W_IN_J}
                    max={MAX_W_IN_J}
                    step={10}
                    className="w-full mb-2"
                />
                <Slider
                  id="workInputWin"
                  min={MIN_W_IN_J}
                  max={MAX_W_IN_J}
                  step={10}
                  value={[workInputWin]}
                  onValueChange={(value) => setWorkInputWin(value[0])}
                />
              </div>
            )}

            <Button onClick={handleReset} variant="outline" className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" /> Reset All
            </Button>
          </CardContent>
        </Card>

        {/* Column 2: Visualization & Outputs */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Thermometer className="mr-2 h-6 w-6 text-destructive" /> Thermodynamic Cycle Visual
              </CardTitle>
              {!isValidTemperatures && (
                <CardDescription className="text-destructive flex items-center">
                  <AlertCircle className="mr-1 h-4 w-4" /> T<sub>H</sub> must be greater than T<sub>L</sub> for meaningful operation.
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="h-[350px] flex justify-center items-center bg-muted/30 rounded-md p-4 relative overflow-hidden">
              {/* SVG Visualization Area */}
              <div className="w-full h-full relative">
                {/* Hot Reservoir */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-3/4 h-12 bg-red-500 rounded flex items-center justify-center text-white font-bold shadow-md">
                  Hot Reservoir (T<sub>H</sub>: {tempHotC}°C)
                </div>

                {/* Cold Reservoir */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-12 bg-blue-500 rounded flex items-center justify-center text-white font-bold shadow-md">
                  Cold Reservoir (T<sub>L</sub>: {tempColdC}°C)
                </div>

                {/* System (Engine/Refrigerator) */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-card border-2 border-primary rounded-full flex items-center justify-center text-center font-semibold shadow-xl">
                  {mode === 'engine' ? 'Heat Engine' : 'Refrigerator'}
                </div>
                
                {/* Energy Arrows - Render based on mode and validity */}
                {isValidTemperatures && mode === 'engine' && (
                  <>
                    <EnergyArrow label="Q_H" value={heatInputQH} maxValue={maxEnergyValue} direction="down" color="bg-red-400" showAnimation={animateFlow} />
                    <EnergyArrow label="W_out" value={workOutput} maxValue={maxEnergyValue} direction="out" color="bg-green-500" showAnimation={animateFlow} />
                    <EnergyArrow label="Q_L" value={heatRejectedQL_engine} maxValue={maxEnergyValue} direction="up" color="bg-blue-400" showAnimation={animateFlow} />
                  </>
                )}
                {isValidTemperatures && mode === 'refrigerator' && (
                  <>
                    <EnergyArrow label="Q_H" value={heatRejectedQH_refrigerator} maxValue={maxEnergyValue} direction="down" color="bg-red-400" showAnimation={animateFlow} />
                    <EnergyArrow label="W_in" value={workInputWin} maxValue={maxEnergyValue} direction="in" color="bg-yellow-500" showAnimation={animateFlow} />
                    <EnergyArrow label="Q_L" value={heatExtractedQL_refrigerator} maxValue={maxEnergyValue} direction="up" color="bg-blue-400" showAnimation={animateFlow} />
                  </>
                )}
              </div>
               <style jsx global>{`
                @keyframes flowDown {
                  0% { opacity: 0; transform: translateY(-10px); }
                  50% { opacity: 1; }
                  100% { opacity: 0; transform: translateY(50px); }
                }
                @keyframes flowUp {
                  0% { opacity: 0; transform: translateY(10px); }
                  50% { opacity: 1; }
                  100% { opacity: 0; transform: translateY(-50px); }
                }
                @keyframes flowOut {
                  0% { opacity: 0; transform: translateX(-10px); }
                  50% { opacity: 1; }
                  100% { opacity: 0; transform: translateX(50px); }
                }
                @keyframes flowIn {
                  0% { opacity: 0; transform: translateX(10px); }
                  50% { opacity: 1; }
                  100% { opacity: 0; transform: translateX(-50px); }
                }
              `}</style>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <TrendingUp className="mr-2 h-6 w-6 text-accent-foreground" /> Results & Performance
                 <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="ml-2 h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="w-64">
                      <p>Calculations are based on the ideal Carnot cycle, representing the maximum theoretical performance.</p>
                    </TooltipContent>
                  </Tooltip>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-lg">
              {!isValidTemperatures ? (
                <p className="md:col-span-2 text-destructive-foreground bg-destructive p-3 rounded-md">
                  Cannot calculate performance: Hot Reservoir Temperature (T<sub>H</sub>) must be strictly greater than Cold Reservoir Temperature (T<sub>L</sub>).
                </p>
              ) : mode === 'engine' ? (
                <>
                  <div><strong className="font-semibold text-primary">Work Output (W<sub>out</sub>):</strong> {workOutput.toFixed(2)} J</div>
                  <div><strong className="font-semibold">Heat Rejected (Q<sub>L</sub>):</strong> {heatRejectedQL_engine.toFixed(2)} J</div>
                  <div className="md:col-span-2"><strong className="font-semibold text-green-600">Carnot Efficiency (η):</strong> {(carnotEfficiency * 100).toFixed(2)}%</div>
                </>
              ) : (
                <>
                  <div><strong className="font-semibold text-primary">Heat Extracted (Q<sub>L</sub>):</strong> {heatExtractedQL_refrigerator.toFixed(2)} J</div>
                  <div><strong className="font-semibold">Heat Rejected (Q<sub>H</sub>):</strong> {heatRejectedQH_refrigerator.toFixed(2)} J</div>
                  <div className="md:col-span-2"><strong className="font-semibold text-green-600">Carnot COP (Refrigerator):</strong> {carnotCopRefrigerator.toFixed(2)}</div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
         {/* Keyframes for animations (if not using Tailwind animation classes) */}
      </div>
    </TooltipProvider>
  );
}