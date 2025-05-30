"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from '@/components/ui/separator';
import { Magnet, Zap, Play, Pause, RotateCcw, Eye, EyeOff, ArrowLeft, Minus, Plus } from 'lucide-react';
import Link from 'next/link';

// --- Constants & Types ---
const ELEMENTARY_CHARGE = 1.602e-19; // C
const SVG_WIDTH = 600;
const SVG_HEIGHT = 350;
const CONDUCTOR_VISUAL_LENGTH = 300; // Visual length on SVG for current flow
const CONDUCTOR_VISUAL_WIDTH_MAX = 100; // Visual max width (d) on SVG
const NUM_ANIMATED_CARRIERS = 15;

interface MaterialProperties {
  name: string;
  carrierType: 'electron' | 'hole';
  carrierDensityN: number; // m^-3
  chargeQ: number; // C (signed)
  color: string;
}

const MATERIALS_DATA: MaterialProperties[] = [
  { name: "Copper (Metal)", carrierType: 'electron', carrierDensityN: 8.5e28, chargeQ: -ELEMENTARY_CHARGE, color: "rgba(184, 115, 51, 0.7)"}, // Electrons, high density
  { name: "n-type Si", carrierType: 'electron', carrierDensityN: 1.0e22, chargeQ: -ELEMENTARY_CHARGE, color: "rgba(100, 149, 237, 0.7)" }, // Electrons, medium density
  { name: "p-type Si", carrierType: 'hole', carrierDensityN: 5.0e21, chargeQ: ELEMENTARY_CHARGE, color: "rgba(255, 127, 80, 0.7)" },    // Holes, medium density
];

interface CalculatedValues {
  driftVelocityVd?: number;
  magneticForceFb?: number; // Magnitude on one carrier
  hallFieldEh?: number;
  hallVoltageVh?: number;
  hallCoefficientRh?: number;
}

interface AnimatedCarrier {
  id: number;
  x: number;
  y: number; // y position within the conductor's visual width
  initialY: number; // for deflection reference, though we might not explicitly deflect individuals much
}

const HallEffectSim: React.FC = () => {
  const [currentI, setCurrentI] = useState<number>(1.0); // A
  const [magneticFieldB, setMagneticFieldB] = useState<number>(0.5); // T
  const [bFieldDirection, setBFieldDirection] = useState<'into' | 'out'>('into');
  const [selectedMaterialName, setSelectedMaterialName] = useState<string>(MATERIALS_DATA[1].name);
  const [conductorThicknessT_mm, setConductorThicknessT_mm] = useState<number>(1.0); // mm (dimension along B field)
  const [conductorWidthD_mm, setConductorWidthD_mm] = useState<number>(5.0); // mm (dimension for V_H)

  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [showForces, setShowForces] = useState<boolean>(true);
  const [calculatedValues, setCalculatedValues] = useState<CalculatedValues>({});
  
  const [animatedCarriers, setAnimatedCarriers] = useState<AnimatedCarrier[]>([]);

  const svgRef = useRef<SVGSVGElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const lastTimestamp = useRef<number>(0);

  const material = MATERIALS_DATA.find(m => m.name === selectedMaterialName) || MATERIALS_DATA[0];
  const conductorThicknessT_m = conductorThicknessT_mm / 1000;
  const conductorWidthD_m = conductorWidthD_mm / 1000;

  // Physics Calculations
  useEffect(() => {
    // Drift velocity: I = n * A * vd * q => vd = I / (n * A * q)
    // A = width * thickness (cross-section for current flow)
    // Here, current I flows along 'length', V_H across 'width (d)', B-field along 'thickness (t)'
    // So, cross-sectional area for current I is A = d * t
    const area_m2 = conductorWidthD_m * conductorThicknessT_m;
    const driftVelocityVd = currentI / (material.carrierDensityN * area_m2 * Math.abs(material.chargeQ));
    
    // Hall Electric Field: E_H = vd * B
    const hallFieldEh = driftVelocityVd * magneticFieldB;
    
    // Hall Voltage: V_H = E_H * d
    // Sign convention: If B is into page (positive Z), current I along positive X.
    // Electrons (q<0, vd opposite to I) move along -X. F_B = q(vd x B) = (-e)(-vx i x Bz k) = -e (-vx Bz) (-j) = -e * vx * Bz j. (Force is +y)
    // Holes (q>0, vd same as I) move along +X. F_B = q(vd x B) = (+e)(vx i x Bz k) = +e (-vx Bz) (-j) = +e * vx * Bz j. (Force is +y)
    // So, for B into page, positive charges accumulate on +y side (top).
    // If B is out of page (negative Z), F_B direction flips.
    // V_H = V_top - V_bottom.
    let hallVoltageVh = hallFieldEh * conductorWidthD_m;
    
    // Adjust sign of V_H based on carrier type and B-field direction.
    // If electrons, they move up (for B into page), so top is negative, bottom is positive. V_H (V_top - V_bottom) is negative.
    // R_H = 1 / (n*q). If q is negative, R_H is negative. V_H = R_H * (I * B) / t
    const hallCoefficientRh = 1 / (material.carrierDensityN * material.chargeQ);
    hallVoltageVh = (hallCoefficientRh * currentI * magneticFieldB) / conductorThicknessT_m;

    // Magnetic Force on one carrier: F_B = |q| * vd * B
    const magneticForceFb = Math.abs(material.chargeQ) * driftVelocityVd * magneticFieldB;

    setCalculatedValues({
      driftVelocityVd,
      magneticForceFb,
      hallFieldEh,
      hallVoltageVh,
      hallCoefficientRh,
    });

  }, [currentI, magneticFieldB, material, conductorThicknessT_m, conductorWidthD_m]);

  // Initialize animated carriers
  useEffect(() => {
    const newCarriers: AnimatedCarrier[] = [];
    const visualWidth = (conductorWidthD_mm / 10) * CONDUCTOR_VISUAL_WIDTH_MAX; // Scale visual width
    for (let i = 0; i < NUM_ANIMATED_CARRIERS; i++) {
      const initialY = (SVG_HEIGHT / 2 - visualWidth / 2) + (Math.random() * visualWidth);
      newCarriers.push({
        id: i,
        x: Math.random() * CONDUCTOR_VISUAL_LENGTH,
        y: initialY,
        initialY: initialY,
      });
    }
    setAnimatedCarriers(newCarriers);
  }, [conductorWidthD_mm]); // Re-init if width changes significantly for visual

  // Animation Loop
  const animationLoop = useCallback((timestamp: number) => {
    if (!isRunning) {
      lastTimestamp.current = timestamp; // Store to resume correctly
      animationFrameId.current = requestAnimationFrame(animationLoop);
      return;
    }
    if (lastTimestamp.current === 0) lastTimestamp.current = timestamp;
    const deltaTime = (timestamp - lastTimestamp.current) / 1000; // seconds
    lastTimestamp.current = timestamp;

    // Visual drift speed - scale actual vd for better animation
    const visualDriftSpeedFactor = 5e4; // Adjust for good visual speed
    let visual_vd = (calculatedValues.driftVelocityVd || 0) * visualDriftSpeedFactor;
    
    // Current direction is +X. Electrons drift -X, Holes drift +X.
    if (material.carrierType === 'electron') {
      visual_vd = -visual_vd;
    }

    setAnimatedCarriers(prevCarriers => 
      prevCarriers.map(carrier => {
        let newX = carrier.x + visual_vd * deltaTime;
        if (newX > CONDUCTOR_VISUAL_LENGTH + 20) newX = -20; // Loop around
        if (newX < -20) newX = CONDUCTOR_VISUAL_LENGTH + 20;
        // For Hall effect, main y deflection is shown by charge accumulation, not individual paths much.
        // We can add a slight "wobble" or tendency based on F_B for visual hint.
        return { ...carrier, x: newX };
      })
    );
    animationFrameId.current = requestAnimationFrame(animationLoop);
  }, [isRunning, calculatedValues.driftVelocityVd, material.carrierType]);

  useEffect(() => {
    lastTimestamp.current = 0; // Reset timestamp when isRunning changes to avoid large jump
    animationFrameId.current = requestAnimationFrame(animationLoop);
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [animationLoop]); // Re-subscribe if animationLoop itself changes (e.g. isRunning changes)

  // SVG Drawing elements
  const conductorOriginX = (SVG_WIDTH - CONDUCTOR_VISUAL_LENGTH) / 2;
  const visualConductorWidth = Math.min(CONDUCTOR_VISUAL_WIDTH_MAX, (conductorWidthD_mm / 5) * CONDUCTOR_VISUAL_WIDTH_MAX * 0.4); // Scale d for visual
  const conductorOriginY = (SVG_HEIGHT - visualConductorWidth) / 2;

  // Calculate force directions for visuals
  // Assume current I along +x. B along +z (into page) or -z (out of page).
  // vd for electrons is -x, for holes is +x.
  const vd_dir = material.carrierType === 'electron' ? -1 : 1; // -1 for -x, +1 for +x
  const b_dir = bFieldDirection === 'into' ? 1 : -1; // +1 for +z, -1 for -z
  // F_B = q (vd_x i X B_z k) = q * vd_x * B_z (i X k) = q * vd_x * B_z (-j)
  // So, y-component of F_B is -material.chargeQ * vd_dir * b_dir
  const fb_y_direction = -Math.sign(material.chargeQ) * vd_dir * b_dir; // Gives -1 for down, +1 for up for F_B

  // E_H balances F_B. So E_H points opposite to F_B for that charge carrier.
  // If F_B is up (+y), E_H is down (-y).
  const eh_y_direction = -fb_y_direction;


  const handleReset = () => {
    setCurrentI(1.0);
    setMagneticFieldB(0.5);
    setBFieldDirection('into');
    setSelectedMaterialName(MATERIALS_DATA[1].name);
    setConductorThicknessT_mm(1.0);
    setConductorWidthD_mm(5.0);
    setIsRunning(true);
    setShowForces(true);
    // Re-initialize carriers if needed, or physics useEffect will update calculations
  };
  
  const voltageBarHeight = Math.max(1, Math.min(visualConductorWidth / 2, Math.abs(calculatedValues.hallVoltageVh || 0) * 2e4)); // Scale Vh for visual bar

  return (
    <div className="space-y-6 p-1">
       <div className="flex items-center justify-between">
        <Button variant="outline" asChild size="sm">
          <Link href="/simulations">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Simulations
          </Link>
        </Button>
        <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
          <Magnet className="h-6 w-6 md:h-8 md:w-8 text-primary" />
          G12: Hall Effect Simulator
        </CardTitle>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Controls Panel */}
        <Card className="md:col-span-1">
          <CardHeader><CardTitle className="text-lg">Experiment Setup</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="current-slider">Current (I): {currentI.toFixed(1)} A</Label>
              <Slider id="current-slider" min={0.1} max={5} step={0.1} value={[currentI]} onValueChange={([val]) => setCurrentI(val)} />
            </div>
            <div>
              <Label htmlFor="bfield-slider">Magnetic Field (B): {magneticFieldB.toFixed(2)} T</Label>
              <Slider id="bfield-slider" min={0.01} max={1.0} step={0.01} value={[magneticFieldB]} onValueChange={([val]) => setMagneticFieldB(val)} />
            </div>
            <div className="flex items-center justify-between">
              <Label>B-Field Direction:</Label>
              <Switch checked={bFieldDirection === 'out'} onCheckedChange={(checked) => setBFieldDirection(checked ? 'out' : 'into')} />
              <span className="text-sm text-muted-foreground">{bFieldDirection === 'out' ? 'Out of Page (•)' : 'Into Page (X)'}</span>
            </div>
             <Separator />
            <div>
              <Label htmlFor="material-select">Material:</Label>
              <Select value={selectedMaterialName} onValueChange={setSelectedMaterialName}>
                <SelectTrigger id="material-select"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MATERIALS_DATA.map(m => <SelectItem key={m.name} value={m.name}>{m.name} ({m.carrierType})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="thickness-slider">Thickness (t): {conductorThicknessT_mm.toFixed(1)} mm</Label>
              <Slider id="thickness-slider" min={0.1} max={2.0} step={0.1} value={[conductorThicknessT_mm]} onValueChange={([val]) => setConductorThicknessT_mm(val)} />
            </div>
            <div>
              <Label htmlFor="width-slider">Width (d): {conductorWidthD_mm.toFixed(1)} mm</Label>
              <Slider id="width-slider" min={1.0} max={10.0} step={0.1} value={[conductorWidthD_mm]} onValueChange={([val]) => setConductorWidthD_mm(val)} />
            </div>
            <Separator />
            <div className="flex space-x-2">
                <Button onClick={() => setIsRunning(prev => !prev)} variant="outline" className="flex-1">
                    {isRunning ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                    {isRunning ? "Pause" : "Run"}
                </Button>
                <Button onClick={() => setShowForces(prev => !prev)} variant="outline" className="flex-1">
                    {showForces ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                    Forces
                </Button>
            </div>
            <Button onClick={handleReset} variant="destructive" className="w-full"><RotateCcw className="mr-2 h-4 w-4" /> Reset All</Button>
          </CardContent>
        </Card>

        {/* Simulation & Data Panel */}
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">Visualization</CardTitle></CardHeader>
            <CardContent className="flex flex-col items-center space-y-2">
              <svg ref={svgRef} width={SVG_WIDTH} height={SVG_HEIGHT} className="border rounded-md bg-slate-50 overflow-hidden">
                {/* Conductor body */}
                <rect x={conductorOriginX} y={conductorOriginY} width={CONDUCTOR_VISUAL_LENGTH} height={visualConductorWidth} fill={material.color} stroke="#555" strokeWidth="1"/>
                
                {/* B-Field symbols */}
                {Array.from({ length: 15 }).map((_, i) => 
                  Array.from({ length: 6 }).map((_, j) => (
                    <text 
                      key={`b-${i}-${j}`} 
                      x={conductorOriginX + (i * CONDUCTOR_VISUAL_LENGTH/14) -5 } 
                      y={conductorOriginY + (j * visualConductorWidth/5) + 5}
                      fontSize="14px" fill="#777" textAnchor="middle" dominantBaseline="middle"
                    >
                      {bFieldDirection === 'into' ? 'X' : '•'}
                    </text>
                  ))
                )}

                {/* Accumulated Charges Visualization */}
                {/* Top Side */}
                <rect x={conductorOriginX} y={conductorOriginY - 5} width={CONDUCTOR_VISUAL_LENGTH} height={5} 
                      fill={ calculatedValues.hallVoltageVh && calculatedValues.hallVoltageVh > 0 ? "rgba(255,0,0,0.5)" : "rgba(0,0,255,0.5)"} 
                      opacity={Math.min(1, Math.abs(calculatedValues.hallVoltageVh || 0) * 1e3)} />
                {/* Bottom Side */}
                 <rect x={conductorOriginX} y={conductorOriginY + visualConductorWidth} width={CONDUCTOR_VISUAL_LENGTH} height={5} 
                      fill={ calculatedValues.hallVoltageVh && calculatedValues.hallVoltageVh < 0 ? "rgba(255,0,0,0.5)" : "rgba(0,0,255,0.5)"} 
                      opacity={Math.min(1, Math.abs(calculatedValues.hallVoltageVh || 0) * 1e3)} />


                {/* Animated Charge Carriers */}
                {animatedCarriers.map(carrier => (
                  <g key={carrier.id} transform={`translate(${conductorOriginX + carrier.x}, ${carrier.y})`}>
                    <circle r="4" fill={material.carrierType === 'electron' ? "blue" : "red"} />
                    <text fontSize="8px" fill="white" textAnchor="middle" dominantBaseline="central">
                      {material.carrierType === 'electron' ? <Minus size={6}/> : <Plus size={6}/>}
                    </text>
                  </g>
                ))}

                {/* Force vectors on a central carrier (example) */}
                {showForces && animatedCarriers.length > 0 && calculatedValues.magneticForceFb && (
                  <g transform={`translate(${conductorOriginX + CONDUCTOR_VISUAL_LENGTH / 2}, ${SVG_HEIGHT / 2})`}>
                    {/* Magnetic Force F_B */}
                    <line x1="0" y1="0" x2="0" y2={fb_y_direction * -20} stroke="green" strokeWidth="2" markerEnd="url(#arrowGreen)" />
                    <text x="5" y={fb_y_direction * -20 - 5} fill="green" fontSize="10px">Fₙ</text>
                    {/* Electric Force F_E (Hall) */}
                    <line x1="0" y1="0" x2="0" y2={eh_y_direction * -20} stroke="orange" strokeWidth="2" markerEnd="url(#arrowOrange)" />
                     <text x="5" y={eh_y_direction * -20 - 5} fill="orange" fontSize="10px">Fₑ</text>
                  </g>
                )}
                
                {/* Voltmeter Visual */}
                <g transform={`translate(${conductorOriginX + CONDUCTOR_VISUAL_LENGTH + 10}, ${SVG_HEIGHT/2})`}>
                    <rect x="0" y={-visualConductorWidth/2 -10} width="30" height={visualConductorWidth + 20} fill="#ddd" rx="3" />
                    <line x1="15" y1={-visualConductorWidth/2} x2="15" y2={visualConductorWidth/2} stroke="#333" strokeWidth="1"/>
                    {/* Voltmeter needle/bar based on Vh */}
                    <rect x="10" y={-(calculatedValues.hallVoltageVh || 0) * 2e3 } width="10" height={Math.abs(calculatedValues.hallVoltageVh || 0) * 4e3 } fill="red" opacity="0.7"/>
                    <text x="15" y="0" fontSize="10px" textAnchor="middle" dominantBaseline="middle">V</text>
                    <text x="15" y={visualConductorWidth/2 + 20} fontSize="10px" textAnchor="middle">
                        {(calculatedValues.hallVoltageVh !== undefined ? (calculatedValues.hallVoltageVh * 1000).toFixed(3) : "0.000")} mV
                    </text>
                    {/* Probes */}
                    <line x1="-10" y1={conductorOriginY - SVG_HEIGHT/2} x2="0" y2={-visualConductorWidth/2 -5} stroke="#555" strokeWidth="1"/>
                    <line x1="-10" y1={conductorOriginY + visualConductorWidth - SVG_HEIGHT/2} x2="0" y2={visualConductorWidth/2 + 5} stroke="#555" strokeWidth="1"/>
                </g>

                <defs>
                  <marker id="arrowGreen" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="green" />
                  </marker>
                  <marker id="arrowOrange" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="orange" />
                  </marker>
                </defs>
              </svg>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg">Measured & Calculated Values</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <p>Drift Velocity (v<sub>d</sub>): <span className="font-semibold">{(calculatedValues.driftVelocityVd !== undefined ? calculatedValues.driftVelocityVd.toExponential(2) : 'N/A')} m/s</span></p>
              <p>Hall E-Field (E<sub>H</sub>): <span className="font-semibold">{(calculatedValues.hallFieldEh !== undefined ? calculatedValues.hallFieldEh.toExponential(2) : 'N/A')} V/m</span></p>
              <p>Hall Voltage (V<sub>H</sub>): <span className="font-semibold">{(calculatedValues.hallVoltageVh !== undefined ? (calculatedValues.hallVoltageVh * 1000).toFixed(4) : 'N/A')} mV</span></p>
              <p>Hall Coeff. (R<sub>H</sub>): <span className="font-semibold">{(calculatedValues.hallCoefficientRh !== undefined ? calculatedValues.hallCoefficientRh.toExponential(2) : 'N/A')} m³/C</span></p>
              <p>Carrier Density (n): <span className="font-semibold">{material.carrierDensityN.toExponential(2)} m⁻³</span></p>
              <p>Carrier Charge (q): <span className="font-semibold">{material.chargeQ.toExponential(2)} C</span></p>
              <p>F<sub>B</sub> (one carrier): <span className="font-semibold">{(calculatedValues.magneticForceFb !== undefined ? calculatedValues.magneticForceFb.toExponential(2) : 'N/A')} N</span></p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default function HallEffectG12PageWrapper() {
    return <HallEffectSim />;
}