"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from '@/components/ui/separator';
import { Zap, Trash2, PlusCircle, MinusCircle, RefreshCcw, Eye, EyeOff, Construction } from 'lucide-react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';


// --- Constants & Types ---
const CANVAS_WIDTH = 700;
const CANVAS_HEIGHT = 500;
const CHARGE_RADIUS = 8; // Visual radius
const K_CONSTANT = 1000; // Affects field strength, adjust for visual appeal of lines/vectors
const FIELD_LINE_STEP_SIZE = 5; // ds for field line tracing
const MAX_FIELD_LINE_SEGMENTS = 200; // Max steps for a single field line
const LINES_PER_UNIT_CHARGE = 4; // Base, will be scaled by density slider

interface PointCharge {
  id: string;
  x: number;
  y: number;
  magnitude: number; // Positive for positive, negative for negative
}

interface Vector {
  x: number;
  y: number;
}

const ElectricFieldSim: React.FC = () => {
  const [charges, setCharges] = useState<PointCharge[]>([]);
  const [selectedChargeId, setSelectedChargeId] = useState<string | null>(null);
  const [draggingChargeId, setDraggingChargeId] = useState<string | null>(null);
  const [placementMode, setPlacementMode] = useState<'positive' | 'negative' | null>(null);
  
  const [fieldLineDensityFactor, setFieldLineDensityFactor] = useState<number>(2); // Multiplier for LINES_PER_UNIT_CHARGE
  const [showEFieldVectors, setShowEFieldVectors] = useState<boolean>(false);
  const [vectorGridSpacing, setVectorGridSpacing] = useState<number>(30);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);

  // --- Physics Calculation ---
  const calculateFieldAtPoint = useCallback((px: number, py: number, excludeChargeId: string | null = null): Vector => {
    let netEx = 0;
    let netEy = 0;

    charges.forEach(charge => {
      if (charge.id === excludeChargeId) return;

      const dx = px - charge.x;
      const dy = py - charge.y;
      const rSquared = dx * dx + dy * dy;
      
      if (rSquared < 1e-4) return; // Avoid division by zero if point is exactly on charge
      const r = Math.sqrt(rSquared);
      
      const E_magnitude = K_CONSTANT * charge.magnitude / rSquared;
      
      netEx += E_magnitude * (dx / r);
      netEy += E_magnitude * (dy / r);
    });
    return { x: netEx, y: netEy };
  }, [charges]);

  // --- Drawing Logic ---
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 1. Draw E-Field Vectors (if enabled)
    if (showEFieldVectors) {
      for (let x = 0; x < CANVAS_WIDTH; x += vectorGridSpacing) {
        for (let y = 0; y < CANVAS_HEIGHT; y += vectorGridSpacing) {
          const field = calculateFieldAtPoint(x, y);
          const magnitude = Math.sqrt(field.x * field.x + field.y * field.y);
          if (magnitude < 0.1) continue; // Don't draw tiny vectors

          const angle = Math.atan2(field.y, field.x);
          // Scale vector length, cap at a max length
          const maxLength = vectorGridSpacing * 0.6;
          let length = magnitude * 0.2; // Adjust scaling factor as needed
          length = Math.min(length, maxLength);


          ctx.beginPath();
          ctx.strokeStyle = `rgba(0, 100, 0, ${Math.min(1, magnitude / 50)})`; // Opacity based on strength
          ctx.lineWidth = 1;
          ctx.moveTo(x, y);
          ctx.lineTo(x + length * Math.cos(angle), y + length * Math.sin(angle));
          ctx.stroke();
          // Arrowhead
          ctx.beginPath();
          ctx.moveTo(x + length * Math.cos(angle), y + length * Math.sin(angle));
          ctx.lineTo(
            x + length * Math.cos(angle) - 3 * Math.cos(angle + Math.PI / 6),
            y + length * Math.sin(angle) - 3 * Math.sin(angle + Math.PI / 6)
          );
          ctx.lineTo(
            x + length * Math.cos(angle) - 3 * Math.cos(angle - Math.PI / 6),
            y + length * Math.sin(angle) - 3 * Math.sin(angle - Math.PI / 6)
          );
          ctx.closePath();
          ctx.fillStyle = `rgba(0, 100, 0, ${Math.min(1, magnitude / 50)})`;
          ctx.fill();
        }
      }
    }

    // 2. Draw Field Lines
    charges.forEach(charge => {
      if (charge.magnitude > 0) { // Lines emanate from positive charges
        const numLines = Math.max(1, Math.round(Math.abs(charge.magnitude) * LINES_PER_UNIT_CHARGE * fieldLineDensityFactor));
        for (let i = 0; i < numLines; i++) {
          const startAngle = (2 * Math.PI * i) / numLines;
          let px = charge.x + (CHARGE_RADIUS + 1) * Math.cos(startAngle);
          let py = charge.y + (CHARGE_RADIUS + 1) * Math.sin(startAngle);

          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.strokeStyle = "rgba(50, 50, 50, 0.6)";
          ctx.lineWidth = 1;

          for (let s = 0; s < MAX_FIELD_LINE_SEGMENTS; s++) {
            const field = calculateFieldAtPoint(px, py, charge.id); // Exclude self when starting very close
            const magnitude = Math.sqrt(field.x * field.x + field.y * field.y);
            if (magnitude < 0.01) break; // Field too weak

            const dirX = field.x / magnitude;
            const dirY = field.y / magnitude;

            px += dirX * FIELD_LINE_STEP_SIZE;
            py += dirY * FIELD_LINE_STEP_SIZE;
            ctx.lineTo(px, py);

            // Arrowhead mid-line (e.g., every 20 segments)
            if (s > 0 && s % 30 === 0) {
                const arrowAngle = Math.atan2(dirY, dirX);
                ctx.moveTo(px,py); // lift pen
                ctx.lineTo(px - 5 * Math.cos(arrowAngle - Math.PI / 6), py - 5 * Math.sin(arrowAngle - Math.PI / 6));
                ctx.moveTo(px,py);
                ctx.lineTo(px - 5 * Math.cos(arrowAngle + Math.PI / 6), py - 5 * Math.sin(arrowAngle + Math.PI / 6));
                ctx.moveTo(px,py); // back to current point to continue the line
            }

            // Check if line entered another charge or went off-screen
            let absorbed = false;
            for (const otherCharge of charges) {
              if (otherCharge.id === charge.id) continue;
              const distToOther = Math.sqrt((px - otherCharge.x) ** 2 + (py - otherCharge.y) ** 2);
              if (distToOther < CHARGE_RADIUS + FIELD_LINE_STEP_SIZE) {
                if (otherCharge.magnitude < 0) { // Terminate on negative charges
                    ctx.lineTo(otherCharge.x, otherCharge.y); // Draw line to center of charge
                }
                absorbed = true;
                break;
              }
            }
            if (absorbed || px < 0 || px > CANVAS_WIDTH || py < 0 || py > CANVAS_HEIGHT) {
              break;
            }
          }
          ctx.stroke();
        }
      }
    });
    
    // 3. Draw Charges
    charges.forEach(charge => {
      ctx.beginPath();
      ctx.arc(charge.x, charge.y, CHARGE_RADIUS + Math.abs(charge.magnitude)*0.5, 0, 2 * Math.PI); // Size slightly by magnitude
      ctx.fillStyle = charge.magnitude > 0 ? 'rgba(255, 0, 0, 0.8)' : 'rgba(0, 0, 255, 0.8)';
      ctx.fill();
      ctx.strokeStyle = selectedChargeId === charge.id ? 'gold' : (charge.magnitude > 0 ? 'darkred' : 'darkblue');
      ctx.lineWidth = selectedChargeId === charge.id ? 3 : 2;
      ctx.stroke();

      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `bold ${10 + Math.abs(charge.magnitude)*0.3}px Arial`;
      ctx.fillText(charge.magnitude > 0 ? '+' : '-', charge.x, charge.y);
    });

  }, [charges, calculateFieldAtPoint, fieldLineDensityFactor, showEFieldVectors, vectorGridSpacing, selectedChargeId]);

  useEffect(() => {
    const renderLoop = () => {
      draw();
      animationFrameId.current = requestAnimationFrame(renderLoop);
    };
    animationFrameId.current = requestAnimationFrame(renderLoop);
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [draw]);


  // --- Event Handlers ---
  const getMousePos = (e: React.MouseEvent): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const pos = getMousePos(e);
    if (placementMode) {
      const newCharge: PointCharge = {
        id: `charge-${Date.now()}`,
        x: pos.x,
        y: pos.y,
        magnitude: placementMode === 'positive' ? 5 : -5, // Default magnitude
      };
      setCharges(prev => [...prev, newCharge]);
      setSelectedChargeId(newCharge.id);
      setPlacementMode(null); // Exit placement mode after placing one
    } else {
      let chargeClicked = false;
      for (let i = charges.length - 1; i >= 0; i--) { // Iterate backwards for z-index
        const charge = charges[i];
        const dist = Math.sqrt((pos.x - charge.x) ** 2 + (pos.y - charge.y) ** 2);
        if (dist < CHARGE_RADIUS + Math.abs(charge.magnitude)*0.5 + 5) { // +5 for easier clicking
          setSelectedChargeId(charge.id);
          setDraggingChargeId(charge.id);
          chargeClicked = true;
          break;
        }
      }
      if (!chargeClicked) {
        setSelectedChargeId(null);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingChargeId) {
      const pos = getMousePos(e);
      setCharges(prev => prev.map(c => 
        c.id === draggingChargeId ? { ...c, x: pos.x, y: pos.y } : c
      ));
    }
  };

  const handleMouseUp = () => {
    setDraggingChargeId(null);
  };
  
  const handleMouseLeave = () => {
    setDraggingChargeId(null); // Stop dragging if mouse leaves canvas
  };

  // --- UI Actions ---
  const togglePlacementMode = (mode: 'positive' | 'negative') => {
    setPlacementMode(prev => (prev === mode ? null : mode));
    setSelectedChargeId(null); // Deselect if changing mode
  };

  const handleDeleteSelectedCharge = () => {
    if (selectedChargeId) {
      setCharges(prev => prev.filter(c => c.id !== selectedChargeId));
      setSelectedChargeId(null);
    }
  };

  const handleClearAll = () => {
    setCharges([]);
    setSelectedChargeId(null);
    setPlacementMode(null);
  };
  
  const handleReset = () => {
    handleClearAll();
    setFieldLineDensityFactor(2);
    setShowEFieldVectors(false);
  };

  const handleMagnitudeChange = (value: number[]) => {
    if (selectedChargeId) {
      setCharges(prev => prev.map(c =>
        c.id === selectedChargeId ? { ...c, magnitude: value[0] } : c
      ));
    }
  };
  
  const selectedCharge = charges.find(c => c.id === selectedChargeId);

  return (
    <div className="space-y-6 p-1">
      <div className="flex items-center justify-between">
        <Button variant="outline" asChild size="sm">
          <Link href="/simulations">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Simulations
          </Link>
        </Button>
        <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
          <Zap className="h-6 w-6 md:h-8 md:w-8 text-primary" />
          Electric Field Visualizer
        </CardTitle>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        {/* Controls Panel */}
        <Card className="md:col-span-1">
          <CardHeader><CardTitle className="text-lg">Controls</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => togglePlacementMode('positive')} variant={placementMode === 'positive' ? "secondary" : "outline"} className="w-full justify-start">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Positive Charge
            </Button>
            <Button onClick={() => togglePlacementMode('negative')} variant={placementMode === 'negative' ? "secondary" : "outline"} className="w-full justify-start">
              <MinusCircle className="mr-2 h-4 w-4" /> Add Negative Charge
            </Button>
            <Separator />
            <div>
              <Label htmlFor="density-slider">Field Line Density ({fieldLineDensityFactor}x)</Label>
              <Slider id="density-slider" min={1} max={5} step={0.5} value={[fieldLineDensityFactor]} onValueChange={([val]) => setFieldLineDensityFactor(val)} />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="show-vectors" checked={showEFieldVectors} onCheckedChange={setShowEFieldVectors} />
              <Label htmlFor="show-vectors">Show E-Field Vectors</Label>
            </div>
            {showEFieldVectors && (
                 <div>
                    <Label htmlFor="vector-spacing-slider">Vector Spacing ({vectorGridSpacing}px)</Label>
                    <Slider id="vector-spacing-slider" min={15} max={50} step={5} value={[vectorGridSpacing]} onValueChange={([val]) => setVectorGridSpacing(val)} />
                 </div>
            )}
            <Separator />
            {selectedCharge && (
              <div className="space-y-3 p-3 border rounded-md bg-muted/30">
                <h4 className="font-semibold">Selected Charge:</h4>
                <p className="text-sm">Type: {selectedCharge.magnitude > 0 ? "Positive" : "Negative"}</p>
                <div>
                  <Label htmlFor="mag-slider">Magnitude: {selectedCharge.magnitude} q</Label>
                  <Slider 
                    id="mag-slider" 
                    min={selectedCharge.magnitude > 0 ? 1 : -10} 
                    max={selectedCharge.magnitude > 0 ? 10 : -1} 
                    step={1} 
                    value={[selectedCharge.magnitude]} 
                    onValueChange={handleMagnitudeChange} 
                  />
                </div>
                <Button onClick={handleDeleteSelectedCharge} variant="destructive" size="sm" className="w-full">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Selected
                </Button>
              </div>
            )}
             <Separator />
            <Button onClick={handleClearAll} variant="outline" className="w-full">
              <Trash2 className="mr-2 h-4 w-4" /> Clear All Charges
            </Button>
            <Button onClick={handleReset} variant="outline" className="w-full">
                <RefreshCcw className="mr-2 h-4 w-4" /> Reset All
            </Button>
          </CardContent>
        </Card>

        {/* Simulation Canvas */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg">Visualization</CardTitle>
            <CardDescription>Click buttons to enter placement mode, then click on canvas. Drag charges to move them.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center p-2 md:p-4 overflow-hidden">
            <canvas 
              ref={canvasRef} 
              width={CANVAS_WIDTH} 
              height={CANVAS_HEIGHT} 
              className="border rounded-md bg-slate-50 cursor-crosshair max-w-full"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
            />
          </CardContent>
        </Card>
      </div>
       {/* Placeholder for Induction (Future) */}
       <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Construction className="h-6 w-6 text-amber-500" />
            Future: Electrostatic Induction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Coming soon: Add neutral conductors to the simulation and observe how charges redistribute on their surface (electrostatic induction) when other charges are brought nearby.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default function ElectricFieldG10PageWrapper() {
    // This wrapper can provide context or be the actual page component
    // that then renders ElectricFieldSim if it's not directly the page.
    return <ElectricFieldSim />;
}