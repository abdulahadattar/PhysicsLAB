"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Magnet, Zap, Compass, Hand, Trash2, RefreshCcw, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

// --- Constants & Types ---
const SVG_WIDTH = 600;
const SVG_HEIGHT = 400;
const MU0_SCALED = 1; // Scaled permeability for visual field strength

interface Point { x: number; y: number; }

// Part 1: Field Visualization
type FieldSource = "barMagnet" | "straightWire" | "solenoid";
interface CompassObj {
  id: string;
  x: number;
  y: number;
  angleRad: number; // Angle of the needle in radians
}
interface BarMagnetProps {
  x: number; y: number; width: number; height: number; flipped: boolean;
}
interface StraightWireProps {
  currentI: number;
  direction: "into" | "out"; // 'into' = +Z, 'out' = -Z
  posX: number; posY: number;
}
interface SolenoidProps {
  currentI: number;
  winding: "cw" | "ccw"; // Viewed from left
  posX: number; posY: number; length: number; radius: number; turnsFactor: number;
}

// Part 2: Motor Principle
interface MotorForce {
  magnitude: number; // Scaled for visual
  direction: "up" | "down" | "none";
}


const MagneticFieldsForcesG10Page: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"fieldViz" | "motorPrinciple">("fieldViz");
  const svgRef = useRef<SVGSVGElement>(null);

  // --- Part 1: Field Visualization State & Logic ---
  const [fieldSource, setFieldSource] = useState<FieldSource>("barMagnet");
  const [barMagnet, setBarMagnet] = useState<BarMagnetProps>({ x: SVG_WIDTH/2 - 60, y: SVG_HEIGHT/2 - 15, width: 120, height: 30, flipped: false });
  const [straightWire, setStraightWire] = useState<StraightWireProps>({ currentI: 2, direction: "into", posX: SVG_WIDTH/2, posY: SVG_HEIGHT/2 });
  const [solenoid, setSolenoid] = useState<SolenoidProps>({ currentI: 2, winding: "cw", posX: SVG_WIDTH/2 - 75, posY: SVG_HEIGHT/2, length: 150, radius: 25, turnsFactor: 1 });
  const [compasses, setCompasses] = useState<CompassObj[]>([]);
  const [showFieldLines1, setShowFieldLines1] = useState<boolean>(true);
  const [addingCompass, setAddingCompass] = useState<boolean>(false);

  const calculateBFieldAtPoint = useCallback((px: number, py: number): {bx: number, by: number} => {
    let totalBx = 0;
    let totalBy = 0;

    if (fieldSource === "barMagnet") {
      const poleStrength = 5000 * MU0_SCALED; // Arbitrary strength
      const N_pole: Point = { x: barMagnet.x + (barMagnet.flipped ? barMagnet.width : 0), y: barMagnet.y + barMagnet.height / 2 };
      const S_pole: Point = { x: barMagnet.x + (barMagnet.flipped ? 0 : barMagnet.width), y: barMagnet.y + barMagnet.height / 2 };
      
      // Field from N pole
      let dxN = px - N_pole.x;
      let dyN = py - N_pole.y;
      let rN_sq = dxN * dxN + dyN * dyN;
      if (rN_sq > 1) {
        let rN = Math.sqrt(rN_sq);
        totalBx += poleStrength * dxN / (rN * rN_sq); // B ~ m/r^2, component is B * dx/r
        totalBy += poleStrength * dyN / (rN * rN_sq);
      }
      // Field from S pole (attracts N of compass, so field points towards S)
      let dxS = px - S_pole.x;
      let dyS = py - S_pole.y;
      let rS_sq = dxS * dxS + dyS * dyS;
      if (rS_sq > 1) {
        let rS = Math.sqrt(rS_sq);
        totalBx -= poleStrength * dxS / (rS * rS_sq);
        totalBy -= poleStrength * dyS / (rS * rS_sq);
      }
    } else if (fieldSource === "straightWire") {
      const dx = px - straightWire.posX;
      const dy = py - straightWire.posY;
      const r_sq = dx * dx + dy * dy;
      if (r_sq > 1) {
        const r = Math.sqrt(r_sq);
        const B_mag = MU0_SCALED * straightWire.currentI / (2 * Math.PI * r) * 100; // Scale for visuals
        // B is tangential. Direction from right hand rule.
        // If current "into" page (+Z), B is CW. If "out" (-Z), B is CCW.
        const factor = straightWire.direction === "into" ? 1 : -1;
        totalBx += factor * B_mag * (-dy / r); // -dy/r for x-comp of tangential CW vector
        totalBy += factor * B_mag * (dx / r);  //  dx/r for y-comp of tangential CW vector
      }
    } else if (fieldSource === "solenoid") {
      // Simplified: treat as bar magnet, N on left if CW current from left
      const poleStrength = 2000 * MU0_SCALED * solenoid.currentI * solenoid.turnsFactor;
      const N_x = solenoid.posX + (solenoid.winding === "cw" ? 0 : solenoid.length);
      const S_x = solenoid.posX + (solenoid.winding === "cw" ? solenoid.length : 0);
      
      const N_pole: Point = { x: N_x, y: solenoid.posY };
      const S_pole: Point = { x: S_x, y: solenoid.posY };

      let dxN = px - N_pole.x;
      let dyN = py - N_pole.y;
      let rN_sq = dxN * dxN + dyN * dyN;
      if (rN_sq > 1) {
        let rN = Math.sqrt(rN_sq);
        totalBx += poleStrength * dxN / (rN * rN_sq);
        totalBy += poleStrength * dyN / (rN * rN_sq);
      }
      let dxS = px - S_pole.x;
      let dyS = py - S_pole.y;
      let rS_sq = dxS * dxS + dyS * dyS;
      if (rS_sq > 1) {
        let rS = Math.sqrt(rS_sq);
        totalBx -= poleStrength * dxS / (rS * rS_sq);
        totalBy -= poleStrength * dyS / (rS * rS_sq);
      }
    }
    return {bx: totalBx, by: totalBy};
  }, [fieldSource, barMagnet, straightWire, solenoid]);

  useEffect(() => {
    // Update compass angles
    setCompasses(prevCompasses => prevCompasses.map(c => {
      const {bx, by} = calculateBFieldAtPoint(c.x, c.y);
      return { ...c, angleRad: Math.atan2(by, bx) };
    }));
  }, [calculateBFieldAtPoint, compasses.length]); // Re-calculate if B-field changes OR new compass added

  const handleSvgClickPart1 = (e: React.MouseEvent<SVGSVGElement>) => {
    if (addingCompass) {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const {bx, by} = calculateBFieldAtPoint(x,y);
      setCompasses(prev => [...prev, { id: `comp-${Date.now()}`, x, y, angleRad: Math.atan2(by, bx) }]);
      setAddingCompass(false);
    }
  };

  // --- Part 2: Motor Principle State & Logic ---
  const [motorBField, setMotorBField] = useState<number>(0.5); // T (relative)
  const [motorCurrentI, setMotorCurrentI] = useState<number>(2); // A (relative)
  const [motorWireDirection, setMotorWireDirection] = useState<"leftToRight" | "rightToLeft">("leftToRight");
  const [motorWireLength, setMotorWireLength] = useState<number>(0.5); // m (relative)
  const [showForceVector2, setShowForceVector2] = useState<boolean>(true);
  const [motorForce, setMotorForce] = useState<MotorForce>({ magnitude: 0, direction: "none" });

  // Motor principle: Fixed B-field downwards (from N above to S below)
  // Wire horizontal. Current Left-to-Right (+X) or Right-to-Left (-X)
  useEffect(() => {
    const B = motorBField;
    const I = motorCurrentI;
    const L = motorWireLength * 100; // Scale L for visual force magnitude
    
    let forceDirection: MotorForce['direction'] = "none";
    // Fleming's Left-Hand Rule:
    // Field (B): Downwards (-Y direction)
    // Current (I): motorWireDirection (+X or -X)
    // Force (F): F = I (L x B)
    // If I is +X, B is -Y: F = I (Lx i X -By j) = I * Lx * (-By) (i X j) = - I * Lx * By * k (Force is -Z, "into page")
    // For simplicity, let's show "up" or "down" on screen as if wire can move that way.
    // Let's redefine: B is into page (-Z). Current along X.
    // If I is +X, B is -Z: F = I (Lx i X -Bz k) = I * Lx * (-Bz) (i X k) = I * Lx * (-Bz) (-j) = I * Lx * Bz * j (Force is UP, +Y)
    // If I is -X, B is -Z: F = I (-Lx i X -Bz k) = I * (-Lx) * (-Bz) (i X k) = I * Lx * Bz (-j) = -I * Lx * Bz * j (Force is DOWN, -Y)

    // We'll simplify visuals: B-field fixed between N (top) and S (bottom) -> B is Down.
    // Current I along X.
    // F = I (L vec x B vec). If I is L-R (+x), B is Down (-y). (x cross -y = -z) -> Force into page.
    // If I is R-L (-x), B is Down (-y). (-x cross -y = +z) -> Force out of page.
    // For a 2D sim, this means the wire would move towards/away from viewer.
    // Let's instead visualize B into/out of page, current horizontal, force up/down.
    // B_dir: 1 for "into page", -1 for "out of page" (visual choice for demo)
    // I_dir: 1 for "L to R", -1 for "R to L"
    const B_dir_motor = 1; // Assume B is always "into page" for motor demo
    const I_dir_motor = motorWireDirection === "leftToRight" ? 1 : -1;
    
    // F is proportional to I * L * B. Direction:
    // B into page (+Z). I L-R (+X). F = I (Lx i X Bz k) = I*Lx*Bz (-j) -> DOWN
    // B into page (+Z). I R-L (-X). F = I (-Lx i X Bz k) = I*(-Lx)*Bz (-j) -> UP
    if (I_dir_motor * B_dir_motor > 0) { // Effective current * effective B points same Z-like direction (e.g. I_LR with B_Into, or I_RL with B_Out)
      forceDirection = "down"; // Based on standard LH rule if B is along Z, I along X
    } else if (I_dir_motor * B_dir_motor < 0) {
      forceDirection = "up";
    }

    const calculatedMag = B * Math.abs(I) * L * 20; // Scaled for visual
    setMotorForce({ magnitude: calculatedMag, direction: I === 0 ? "none" : forceDirection });

  }, [motorBField, motorCurrentI, motorWireDirection, motorWireLength]);

  const resetPart1 = () => {
    setFieldSource("barMagnet");
    setBarMagnet({ x: SVG_WIDTH/2 - 60, y: SVG_HEIGHT/2 - 15, width: 120, height: 30, flipped: false });
    setStraightWire({ currentI: 2, direction: "into", posX: SVG_WIDTH/2, posY: SVG_HEIGHT/2 });
    setSolenoid({ currentI: 2, winding: "cw", posX: SVG_WIDTH/2 - 75, posY: SVG_HEIGHT/2, length: 150, radius: 25, turnsFactor: 1 });
    setCompasses([]);
    setShowFieldLines1(true);
    setAddingCompass(false);
  };
  const resetPart2 = () => {
    setMotorBField(0.5);
    setMotorCurrentI(2);
    setMotorWireDirection("leftToRight");
    setMotorWireLength(0.5);
    setShowForceVector2(true);
  };
  
  // --- Drawing Functions ---
  const drawBarMagnetFieldLines = (ctx: CanvasRenderingContext2D | null) => { // For SVG, this is different
    if (!svgRef.current || !showFieldLines1) return;
    // Placeholder: In SVG this would be <path> elements.
    // For simplicity, we'll draw a few representative lines.
    const N_pole: Point = { x: barMagnet.x + (barMagnet.flipped ? barMagnet.width : 0), y: barMagnet.y + barMagnet.height / 2 };
    const S_pole: Point = { x: barMagnet.x + (barMagnet.flipped ? 0 : barMagnet.width), y: barMagnet.y + barMagnet.height / 2 };
    
    const paths = [];
    for (let i = 0; i < 5; i++) {
        const offsetY = (i - 2) * (barMagnet.height / 5); // Spread lines
        // Line from N pole, curving to S pole
        const d = `M ${N_pole.x} ${N_pole.y + offsetY} C ${N_pole.x + 50} ${N_pole.y + offsetY - 50}, ${S_pole.x - 50} ${S_pole.y + offsetY - 50}, ${S_pole.x} ${S_pole.y + offsetY}`;
        paths.push(<path key={`bmfl-${i}`} d={d} stroke="rgba(100,100,255,0.7)" strokeWidth="1.5" fill="none" markerEnd="url(#arrowBlue)"/>);
    }
    return paths;
  };
  
  const drawStraightWireFieldLines = () => {
    if (!svgRef.current || !showFieldLines1) return null;
    const paths = [];
    const numCircles = 4;
    for (let i = 1; i <= numCircles; i++) {
        const radius = i * 20 * Math.max(0.5, Math.abs(straightWire.currentI)/2); // Radius scales with current
        if (radius > SVG_WIDTH/2) continue; // Don't draw too large
        // Path for a circle. Need to use two arcs for SVG.
        const sweepFlag = straightWire.direction === "into" ? 1 : 0; // CW or CCW
        const d = `M ${straightWire.posX - radius} ${straightWire.posY} 
                   A ${radius} ${radius} 0 1 ${sweepFlag} ${straightWire.posX + radius} ${straightWire.posY}
                   A ${radius} ${radius} 0 1 ${sweepFlag} ${straightWire.posX - radius} ${straightWire.posY}`;
        paths.push(<path key={`swfl-${i}`} d={d} stroke="rgba(100,100,255,0.7)" strokeWidth="1.5" fill="none" markerEnd="url(#arrowBlue)"/>);
    }
    return paths;
  };

  const drawSolenoidFieldLines = () => {
    if (!svgRef.current || !showFieldLines1) return null;
    const paths = [];
    const N_x = solenoid.posX + (solenoid.winding === "cw" ? 0 : solenoid.length);
    const S_x = solenoid.posX + (solenoid.winding === "cw" ? solenoid.length : 0);

    // Lines through center
    for (let i = 0; i < 3; i++) {
        const offsetY = (i-1) * (solenoid.radius * 0.4);
        const d_inside = `M ${N_x} ${solenoid.posY + offsetY} L ${S_x} ${solenoid.posY + offsetY}`;
        paths.push(<path key={`solfl-in-${i}`} d={d_inside} stroke="rgba(100,100,255,0.7)" strokeWidth="1.5" fill="none" markerEnd="url(#arrowBlue)"/>);
        // Outer loops
        const d_outer = `M ${S_x} ${solenoid.posY + offsetY} 
                         C ${S_x + 60} ${solenoid.posY + offsetY - 80 * (solenoid.turnsFactor)}, 
                           ${N_x - 60} ${solenoid.posY + offsetY - 80 * (solenoid.turnsFactor)}, 
                           ${N_x} ${solenoid.posY + offsetY}`;
        paths.push(<path key={`solfl-out-${i}`} d={d_outer} stroke="rgba(100,100,255,0.7)" strokeWidth="1.5" fill="none" markerStart="url(#arrowBlueRev)"/>); // markerStart to show direction into N
    }
    return paths;
  };


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
          Magnetic Fields & Motor Principle
        </CardTitle>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="fieldViz">Field Visualization</TabsTrigger>
          <TabsTrigger value="motorPrinciple">Motor Principle</TabsTrigger>
        </TabsList>

        <TabsContent value="fieldViz">
          <div className="grid md:grid-cols-3 gap-4 mt-4">
            <Card className="md:col-span-1">
              <CardHeader><CardTitle className="text-lg">Field Source & Controls</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={fieldSource} onValueChange={(val) => setFieldSource(val as FieldSource)}>
                  {(["barMagnet", "straightWire", "solenoid"] as FieldSource[]).map(src => (
                    <div key={src} className="flex items-center space-x-2">
                      <RadioGroupItem value={src} id={`src-${src}`} />
                      <Label htmlFor={`src-${src}`}>{src.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</Label>
                    </div>
                  ))}
                </RadioGroup>
                <Separator/>
                {fieldSource === "barMagnet" && (<>
                  <Button onClick={() => setBarMagnet(b => ({...b, flipped: !b.flipped}))} variant="outline" className="w-full">Flip Polarity</Button>
                </>)}
                {fieldSource === "straightWire" && (<>
                  <div><Label>Current (I): {straightWire.currentI.toFixed(1)} A</Label><Slider min={0.1} max={5} step={0.1} value={[straightWire.currentI]} onValueChange={([val]) => setStraightWire(s => ({...s, currentI: val}))}/></div>
                  <div className="flex items-center justify-between">
                    <Label>Direction:</Label> <Switch checked={straightWire.direction === "out"} onCheckedChange={c => setStraightWire(s => ({...s, direction: c ? "out" : "into"}))}/> 
                    <span className="text-sm text-muted-foreground">{straightWire.direction === "out" ? "Out of Page (•)" : "Into Page (X)"}</span>
                  </div>
                </>)}
                {fieldSource === "solenoid" && (<>
                  <div><Label>Current (I): {solenoid.currentI.toFixed(1)} A</Label><Slider min={0.1} max={5} step={0.1} value={[solenoid.currentI]} onValueChange={([val]) => setSolenoid(s => ({...s, currentI: val}))}/></div>
                  <div className="flex items-center justify-between">
                    <Label>Winding:</Label> <Switch checked={solenoid.winding === "ccw"} onCheckedChange={c => setSolenoid(s => ({...s, winding: c ? "ccw" : "cw"}))}/> 
                    <span className="text-sm text-muted-foreground">{solenoid.winding === "ccw" ? "CCW (from L)" : "CW (from L)"}</span>
                  </div>
                  <div><Label>Turns Factor: {solenoid.turnsFactor.toFixed(1)}x</Label><Slider min={0.5} max={2} step={0.1} value={[solenoid.turnsFactor]} onValueChange={([val]) => setSolenoid(s => ({...s, turnsFactor: val}))}/></div>
                </>)}
                <Separator/>
                <Button onClick={() => setAddingCompass(true)} variant={addingCompass ? "secondary" : "outline"} className="w-full"><Compass className="mr-2 h-4 w-4"/>{addingCompass ? "Click on Canvas" : "Add Compass"}</Button>
                <Button onClick={() => setCompasses([])} variant="destructive" className="w-full"><Trash2 className="mr-2 h-4 w-4"/>Clear Compasses</Button>
                <div className="flex items-center space-x-2"> <Switch id="show-f1" checked={showFieldLines1} onCheckedChange={setShowFieldLines1}/> <Label htmlFor="show-f1">Show Field Lines</Label></div>
                <Button onClick={resetPart1} variant="outline" className="w-full"><RefreshCcw className="mr-2 h-4 w-4"/>Reset View</Button>
              </CardContent>
            </Card>
            <Card className="md:col-span-2">
              <CardHeader><CardTitle className="text-lg">Magnetic Field Visualization</CardTitle></CardHeader>
              <CardContent className="flex justify-center items-center p-2 md:p-4">
                <svg ref={svgRef} width={SVG_WIDTH} height={SVG_HEIGHT} className="border rounded-md bg-slate-100 cursor-crosshair" onClick={handleSvgClickPart1}>
                  <defs>
                    <marker id="arrowBlue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(100,100,255,0.7)" /></marker>
                    <marker id="arrowBlueRev" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 10 0 L 0 5 L 10 10 z" fill="rgba(100,100,255,0.7)" /></marker>
                  </defs>
                  {/* Draw Field Lines */}
                  {showFieldLines1 && fieldSource === "barMagnet" && drawBarMagnetFieldLines()}
                  {showFieldLines1 && fieldSource === "straightWire" && drawStraightWireFieldLines()}
                  {showFieldLines1 && fieldSource === "solenoid" && drawSolenoidFieldLines()}

                  {/* Draw Sources */}
                  {fieldSource === "barMagnet" && (<>
                    <rect x={barMagnet.x} y={barMagnet.y} width={barMagnet.width} height={barMagnet.height} fill={barMagnet.flipped ? "blue" : "red"} stroke="black"/>
                    <rect x={barMagnet.x + barMagnet.width/2 * (barMagnet.flipped ? 1:0) } y={barMagnet.y} width={barMagnet.width/2} height={barMagnet.height} fill={barMagnet.flipped ? "red" : "blue"} stroke="black"/>
                    <text x={barMagnet.x + barMagnet.width*0.25} y={barMagnet.y+barMagnet.height/2+5} fill="white" textAnchor="middle">{barMagnet.flipped ? "S" : "N"}</text>
                    <text x={barMagnet.x + barMagnet.width*0.75} y={barMagnet.y+barMagnet.height/2+5} fill="white" textAnchor="middle">{barMagnet.flipped ? "N" : "S"}</text>
                  </>)}
                  {fieldSource === "straightWire" && (<>
                    <circle cx={straightWire.posX} cy={straightWire.posY} r="10" fill="silver" stroke="black"/>
                    <text x={straightWire.posX} y={straightWire.posY+2} fontSize="20px" textAnchor="middle" dominantBaseline="middle">{straightWire.direction === "into" ? "X" : "•"}</text>
                  </>)}
                  {fieldSource === "solenoid" && (<>
                    {Array.from({length: 5}).map((_,i) => ( // Simple coil turns
                        <ellipse key={i} cx={solenoid.posX + solenoid.length * (i+0.5)/5} cy={solenoid.posY - solenoid.radius} rx="5" ry={solenoid.radius} stroke="darkgoldenrod" strokeWidth="3" fill="none" opacity="0.7"/>
                    ))}
                     <rect x={solenoid.posX} y={solenoid.posY - solenoid.radius} width={solenoid.length} height={solenoid.radius*2} fill="none" stroke="black" strokeDasharray="2 2" opacity="0.3"/>
                    {Array.from({length: 5}).map((_,i) => (
                        <ellipse key={i+5} cx={solenoid.posX + solenoid.length * (i+0.5)/5} cy={solenoid.posY + solenoid.radius} rx="5" ry={solenoid.radius} stroke="darkgoldenrod" strokeWidth="3" fill="none" opacity="0.7"/>
                    ))}
                     <text x={solenoid.posX - 10} y={solenoid.posY} fill="black" fontSize="10px" textAnchor="end">{solenoid.winding==="cw"? "N":"S"}</text>
                     <text x={solenoid.posX + solenoid.length + 10} y={solenoid.posY} fill="black" fontSize="10px" textAnchor="start">{solenoid.winding==="cw"? "S":"N"}</text>
                  </>)}
                  
                  {/* Draw Compasses */}
                  {compasses.map(c => (
                    <g key={c.id} transform={`translate(${c.x}, ${c.y}) rotate(${c.angleRad * 180 / Math.PI})`}>
                      <circle cx="0" cy="0" r="12" fill="white" stroke="black" strokeWidth="1"/>
                      <polygon points="-10,0 0,-3 10,0 0,3" fill="red"/> {/* Needle N part */}
                      <polygon points="-10,0 0,-3 -7,0 0,3" fill="blue"/> {/* Needle S part (overlap) */}
                      <circle cx="0" cy="0" r="1.5" fill="black"/>
                    </g>
                  ))}
                </svg>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="motorPrinciple">
          <div className="grid md:grid-cols-3 gap-4 mt-4">
            <Card className="md:col-span-1">
              <CardHeader><CardTitle className="text-lg">Motor Controls</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><Label>Magnetic Field (B): {motorBField.toFixed(2)} T</Label><Slider min={0.0} max={1.0} step={0.05} value={[motorBField]} onValueChange={([val]) => setMotorBField(val)}/></div>
                <div><Label>Current in Wire (I): {motorCurrentI.toFixed(1)} A</Label><Slider min={-5} max={5} step={0.1} value={[motorCurrentI]} onValueChange={([val]) => setMotorCurrentI(val)}/></div>
                <div className="flex items-center justify-between">
                  <Label>Current Direction:</Label> <Switch checked={motorWireDirection === "rightToLeft"} onCheckedChange={c => setMotorWireDirection(c ? "rightToLeft" : "leftToRight")}/>
                  <span className="text-sm text-muted-foreground">{motorWireDirection === "rightToLeft" ? "R to L" : "L to R"}</span>
                </div>
                <div><Label>Wire Length (L): {(motorWireLength*100).toFixed(0)} cm (relative)</Label><Slider min={0.1} max={1.0} step={0.05} value={[motorWireLength]} onValueChange={([val]) => setMotorWireLength(val)}/></div>
                <Separator/>
                <div className="flex items-center space-x-2"> <Switch id="show-f2" checked={showForceVector2} onCheckedChange={setShowForceVector2}/> <Label htmlFor="show-f2">Show Force Vector</Label></div>
                <Button onClick={resetPart2} variant="outline" className="w-full"><RefreshCcw className="mr-2 h-4 w-4"/>Reset View</Button>
              </CardContent>
            </Card>
            <Card className="md:col-span-2">
              <CardHeader><CardTitle className="text-lg">Motor Principle Demonstration</CardTitle></CardHeader>
              <CardContent className="flex justify-center items-center p-2 md:p-4">
                <svg ref={svgRef} width={SVG_WIDTH} height={SVG_HEIGHT} className="border rounded-md bg-slate-100">
                  <defs><marker id="arrowGreen" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="green" /></marker></defs>
                  {/* Magnetic Field (N above, S below -> B is downwards) */}
                  <rect x={SVG_WIDTH/2 - 100} y={SVG_HEIGHT/2 - 100 - 30} width="200" height="30" fill="red" />
                  <text x={SVG_WIDTH/2} y={SVG_HEIGHT/2 - 100 - 10} textAnchor="middle" fill="white">N</text>
                  <rect x={SVG_WIDTH/2 - 100} y={SVG_HEIGHT/2 + 100} width="200" height="30" fill="blue" />
                  <text x={SVG_WIDTH/2} y={SVG_HEIGHT/2 + 100 + 20} textAnchor="middle" fill="white">S</text>
                  {/* B-Field Lines (simplified vertical) */}
                  {Array.from({length: 7}).map((_,i)=>(
                    <line key={`bm-${i}`} x1={SVG_WIDTH/2 - 90 + i*30} y1={SVG_HEIGHT/2 - 100} x2={SVG_WIDTH/2 - 90 + i*30} y2={SVG_HEIGHT/2 + 100} stroke="rgba(0,0,150,0.3)" strokeWidth="1.5" markerEnd="url(#arrowBlue)"/>
                  ))}
                  
                  {/* Wire - current direction dependent */}
                  <line x1={SVG_WIDTH/2 - motorWireLength*100} y1={SVG_HEIGHT/2} x2={SVG_WIDTH/2 + motorWireLength*100} y2={SVG_HEIGHT/2} stroke="darkgoldenrod" strokeWidth="5"/>
                  <text x={SVG_WIDTH/2} y={SVG_HEIGHT/2 - 10} fill="black" textAnchor="middle" fontSize="14px">
                    {motorCurrentI !== 0 ? (motorWireDirection === "leftToRight" ? "I ➔" : "I ￩") : "I = 0"}
                  </text>

                  {/* Force Vector */}
                  {showForceVector2 && motorForce.magnitude > 0.1 && motorForce.direction !== "none" && (
                    <g transform={`translate(${SVG_WIDTH/2}, ${SVG_HEIGHT/2})`}>
                       <line x1="0" y1="0" x2="0" y2={motorForce.direction === "up" ? -motorForce.magnitude : motorForce.magnitude} stroke="green" strokeWidth="4" markerEnd="url(#arrowGreen)"/>
                       <text x="10" y={(motorForce.direction === "up" ? -motorForce.magnitude : motorForce.magnitude) /2} fill="green" fontSize="14px">F</text>
                    </g>
                  )}
                  <text x={SVG_WIDTH - 70} y={SVG_HEIGHT - 20} fontSize="12px" fill="#555" textAnchor="middle">B-Field (Visual): Top (N) to Bottom (S)</text>
                </svg>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MagneticFieldsForcesG10Page;