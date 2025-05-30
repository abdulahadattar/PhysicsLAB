// Suggested code may be subject to a license. Learn more: ~LicenseLog:838056454.

// AI Instruction: The user wants to modify the AC Power simulation in a React component using Next.js and Tailwind CSS. here is simulation that you need to work on right now
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { ArrowLeft, TrendingUp } from "lucide-react";
import Link from "next/link";
  const defaultR = 100; // Ohms

export default function ACPowerSim() {
  const defaultL = 0.1; // Henrys
  const defaultC = 100; // Microfarads
  const defaultV = 120; // Volts
  const defaultF = 50; // Hertz

  const [resistance, setResistance] = useState(defaultR);
  const [inductance, setInductance] = useState(defaultL);
  const [capacitance, setCapacitance] = useState(defaultC);
  const [voltage, setVoltage] = useState(defaultV);
  const [frequency, setFrequency] = useState(defaultF);

  // Physics calculations
  const omega = 2 * Math.PI * frequency;
  const reactanceL = omega * inductance;
  const reactanceC = omega === 0 ? Infinity : 1 / (omega * (capacitance * 1e-6)); // Convert µF to F, handle f=0
  const netReactance = reactanceL - reactanceC;
  const impedance = Math.sqrt(resistance * resistance + netReactance * netReactance);
  const current = voltage / impedance;

  const realPower = current * current * resistance; // P = I^2 * R
  const apparentPower = voltage * current; // S = V * I
  const powerFactor = impedance !== 0 ? resistance / impedance : 0; // cos(phi) = R/Z
  const phaseAngleRad = impedance !== 0 && !isNaN(netReactance) ? Math.atan2(netReactance, resistance) : 0; // Use atan2 for correct quadrant, handle NaN
  const phaseAngleDeg = phaseAngleRad * (180 / Math.PI);
  const reactivePower = apparentPower * Math.sin(phaseAngleRad); // Q = S * sin(phi)

  const handleReset = () => {
    setResistance(defaultR);
    setInductance(defaultL);
    setCapacitance(defaultC);
    setVoltage(defaultV);
    setFrequency(defaultF);
  };

  return (
    <div className="space-y-6">
      <Button variant="outline" asChild size="sm">
        <Link href="/simulations">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Simulations
        </Link>
      </Button>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            G12: Power in AC Circuits
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-8">
          {/* Controls Panel */}
          <div className="md:w-1/3 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="resistance">Resistance (R): {resistance.toFixed(0)} Ω</Label>
              <Slider
                id="resistance"
                min={10}
                max={1000}
                step={10}
                value={[resistance]}
                onValueChange={(val) => setResistance(val[0])}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inductance">Inductance (L): {inductance.toFixed(2)} H</Label>
              <Slider
                id="inductance"
                min={0.01}
                max={1}
                step={0.01}
                value={[inductance]}
                onValueChange={(val) => setInductance(val[0])}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacitance">Capacitance (C): {capacitance.toFixed(0)} µF</Label>
              <Slider
                id="capacitance"
                min={1}
                max={1000}
                step={1}
                value={[capacitance]}
                onValueChange={(val) => setCapacitance(val[0])}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="voltage">Voltage (V): {voltage.toFixed(0)} V</Label>
              <Slider
                id="voltage"
                min={10}
                max={240}
                step={5}
                value={[voltage]}
                onValueChange={(val) => setVoltage(val[0])}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency (f): {frequency.toFixed(0)} Hz</Label>
              <Slider
                id="frequency"
                min={1}
                max={100}
                step={1}
                value={[frequency]}
                onValueChange={(val) => setFrequency(val[0])}
              />
            </div>
            <Button onClick={handleReset} className="w-full">Reset</Button>
          </div>

          {/* Simulation Area & Data Display */}
          <div className="md:w-2/3 space-y-6">
            {/* Circuit Diagram (Simplified) */}
            <div className="border p-4 rounded-md flex justify-center items-center">
              <svg width="300" height="100" viewBox="0 0 300 100" xmlns="http://www.w3.org/2000/svg">
                {/* Source */}
                <circle cx="20" cy="50" r="8" fill="none" stroke="currentColor" strokeWidth="2"/>
                <line x1="15" y1="50" x2="25" y2="50" stroke="currentColor" strokeWidth="2"/>
                <line x1="20" y1="45" x2="20" y2="55" stroke="currentColor" strokeWidth="2"/>
                <text x="10" y="68" fontSize="12">V</text>

                <line x1="28" y1="50" x2="80" y2="50" stroke="currentColor" strokeWidth="2"/>

                {/* Resistor */}
                {/* Using a simple rectangle for the resistor */}
                <rect x="80" y="45" width="20" height="10" stroke="currentColor" fill="none" strokeWidth="2"/>
                <text x="88" y="68" fontSize="12">R</text>
                <line x1="100" y1="50" x2="140" y2="50" stroke="currentColor" strokeWidth="2"/>

                {/* Inductor */}
                {/* Using coils for the inductor */}
                <path d="M140,50 C145,40 155,40 160,50 C165,60 175,60 180,50 C185,40 195,40 200,50" fill="none" stroke="currentColor" strokeWidth="2"/>
                <text x="148" y="68" fontSize="12">L</text>
                {/* Adjusting line after inductor based on new path */}
                <line x1="200" y1="50" x2="220" y2="50" stroke="currentColor" strokeWidth="2"/>

                {/* Capacitor */}
                {/* Using parallel lines for the capacitor */}
                {/* Adjusting capacitor position based on new inductor path */}
                <line x1="220" y1="40" x2="220" y2="60" stroke="currentColor" strokeWidth="2"/>
                <line x1="230" y1="40" x2="230" y2="60" stroke="currentColor" strokeWidth="2"/>
                 {/* Adjusting text position */}
                <text x="223" y="68" fontSize="12">C</text>
                {/* Adjusting line after capacitor */}
                <text x="208" y="68" fontSize="12">C</text>
                <line x1="220" y1="50" x2="280" y2="50" stroke="currentColor" strokeWidth="2"/>

                 {/* Closing the loop */}
                 <line x1="280" y1="50" x2="280" y2="90" stroke="currentColor" strokeWidth="2"/>
                 <line x1="280" y1="90" x2="20" y2="90" stroke="currentColor" strokeWidth="2"/>
                 <line x1="20" y1="90" x2="20" y2="58" stroke="currentColor" strokeWidth="2"/>

              </svg>
            </div>

            {/* Data Display */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Calculated Values:</h3>
              <p>Impedance (Z): {impedance.toFixed(2)} Ω</p>
              <p>Apparent Power (S): {apparentPower.toFixed(2)} VA</p>
              <p>Real Power (P): {realPower.toFixed(2)} W</p>
              <p>Reactive Power (Q): {reactivePower.toFixed(2)} VAR</p>
              <p>Power Factor (cos φ): {powerFactor.toFixed(3)}</p>
              <p>Phase Angle (φ): {phaseAngleDeg.toFixed(2)} °</p>
            </div>

             {/* Power Triangle (Simplified SVG) */}
             <div className="border p-4 rounded-md flex justify-center items-center">
              <svg width="200" height="150" viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
                {/* Base (P) */}
                <line x1="20" y1="130" x2={20 + Math.max(0, realPower * 0.5)} y2="130" stroke="blue" strokeWidth="2"/> {/* P is always positive */}
                <text x={20 + Math.max(0, realPower * 0.25)} y="145" fontSize="12" fill="blue">P ({realPower.toFixed(1)}W)</text>

                {/* Height (Q) - Adjusted for direction */}
                {reactivePower !== 0 && (
                  <>
                    <line x1={20 + realPower * 0.5} y1="130" x2={20 + realPower * 0.5} y2={130 - reactivePower * 0.5} stroke="red" strokeWidth="2"/>
                    <text x={20 + realPower * 0.5 + 5} y={130 - reactivePower * 0.25} fontSize="12" fill="red">Q ({reactivePower.toFixed(1)}VAR)</text>
                  </>
                )}

                {/* Hypotenuse (S) */}
                {impedance > 0 && ( // Avoid drawing S line if impedance is zero
                  <>
                    <line x1="20" y1="130" x2={20 + realPower * 0.5} y2={130 - reactivePower * 0.5} stroke="green" strokeWidth="2"/>
                     <text x={20 + realPower * 0.3} y={130 - reactivePower * 0.3 - 5} fontSize="12" fill="green">S ({apparentPower.toFixed(1)}VA)</text>
                  </>
                )}

                {/* Angle Phi */}
                 {impedance > 0 && Math.abs(phaseAngleDeg) > 1 && !isNaN(phaseAngleRad) && ( // Only draw angle if impedance is not zero, angle is not near zero, and angle is not NaN
                   <>
 {/* Adjusted arc path for different quadrants */} {/* Use <> to wrap multiple elements in conditional */}
 <path d={`M ${20 + realPower * 0.5 + 20 * Math.cos(phaseAngleRad * Math.sign(reactivePower))} ${130 - 20 * Math.sin(phaseAngleRad * Math.sign(reactivePower))} A 20 20 0 0 ${phaseAngleRad > 0 ? 0 : 1} ${20 + realPower * 0.5} 130`} fill="none" stroke="purple" strokeWidth="1" />
 <text x={20 + realPower * 0.5 + 25} y={130 - 10} fontSize="10" fill="purple">φ</text>
 </>
                 )}

                {/* Axes */}
                <line x1="10" y1="130" x2="190" y2="130" stroke="gray" strokeWidth="1"/> {/* Horizontal */}
                <line x1="20" y1="140" x2="20" y2="10" stroke="gray" strokeWidth="1"/> {/* Vertical */}
                <text x="185" y="125" fontSize="10" fill="gray">P</text>
                <text x="5" y="15" fontSize="10" fill="gray">Q</text>
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Basic SVG icons for R, L, C - You might want to move these to a separate file (e.g., icons.tsx)
/*const Ohm = ({ x, y, size, stroke, strokeWidth }: { x: number, y: number, size: number, stroke: string, strokeWidth: number }) => (
  <svg x={x} y={y} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18V3H3zm8 5v8h4V8h-4z"/>
  </svg>
);

const Inductance = ({ x, y, size, stroke, strokeWidth }: { x: number, y: number, size: number, stroke: string, strokeWidth: number }) => (
  <svg x={x} y={y} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v20M5 12h14"/>
    <circle cx="12" cy="12" r="8"/>
  </svg>
);

const Capacitor = ({ x, y, size, stroke, strokeWidth }: { x: number, y: number, size: number, stroke: string, strokeWidth: number }) => (
  <svg x={x} y={y} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="5" x2="8" y2="19" />
    <line x1="16" y1="5" x2="16" y2="19" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);*/
