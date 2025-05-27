"use client";

import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lightbulb, Minus, Plus, ToggleLeft, Network } from "lucide-react";
import Link from "next/link";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// --- Types and Interfaces ---
type ComponentType = "BATTERY" | "RESISTOR" | "WIRE" | "BULB" | "SWITCH";

interface CircuitComponent {
  id: string;
  type: ComponentType;
  x: number;
  y: number;
  width: number;
  height: number;
  value?: number; // e.g., Voltage for battery, Resistance for resistor
  isFlipped?: boolean; // For components like batteries
  isOpen?: boolean; // For switches
  terminals: { // Relative to component x,y
    t1: { x: number, y: number, connectedTo?: string }; // id of connected component terminal
    t2: { x: number, y: number, connectedTo?: string };
  };
  isPowered?: boolean; // For bulbs, to show if they light up
}

interface ConnectionPoint {
  componentId: string;
  terminalId: 't1' | 't2';
  x: number; // Absolute canvas coordinates
  y: number;
}

const COMPONENT_PALETTE: { type: ComponentType, label: string, icon: React.ElementType, defaultWidth: number, defaultHeight: number, defaultValue?: number }[] = [
  { type: "BATTERY", label: "Battery (9V)", icon: Plus, defaultWidth: 30, defaultHeight: 60, defaultValue: 9 },
  { type: "RESISTOR", label: "Resistor (10Ω)", icon: Minus, defaultWidth: 60, defaultHeight: 20, defaultValue: 10 },
  { type: "WIRE", label: "Wire", icon: Minus, defaultWidth: 80, defaultHeight: 10 },
  { type: "BULB", label: "Light Bulb", icon: Lightbulb, defaultWidth: 40, defaultHeight: 50 },
  { type: "SWITCH", label: "Switch", icon: ToggleLeft, defaultWidth: 50, defaultHeight: 20 },
];

const CANVAS_WIDTH = 700;
const CANVAS_HEIGHT = 450;
const SNAP_DISTANCE = 15; // pixels

export default function SimpleCircuitsG10Page() {
  const [components, setComponents] = useState<CircuitComponent[]>([]);
  const [connections, setConnections] = useState<ConnectionPoint[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<CircuitComponent | null>(null);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [isSnapping, setIsSnapping] = useState(false);
  // Removed unused isSnapping state
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();

  // --- Component Dragging ---
  const handleDrag = useCallback((e: React.MouseEvent, component: CircuitComponent) => {
    e.preventDefault();
    if (!selectedComponent) return;

    const updatedComponents = components.map(comp => {
      if (comp.id === component.id) {
        const newX = snapToGrid ? Math.round(e.clientX / SNAP_DISTANCE) * SNAP_DISTANCE : e.clientX;
        const newY = snapToGrid ? Math.round(e.clientY / SNAP_DISTANCE) * SNAP_DISTANCE : e.clientY;
        return { ...comp, x: newX, y: newY };
      }
      return comp;
    });

    setComponents(updatedComponents);
  }, [components, selectedComponent, snapToGrid]);

  // --- Component Selection ---
  const handleSelect = (component: CircuitComponent) => {
    if (selectedComponent?.id === component.id) {
      setSelectedComponent(null);
    } else {
      setSelectedComponent(component);
    }
  };
  // --- Canvas Click (for Deselecting) ---
  const handleCanvasClick = () => {
    setSelectedComponent(null);
  };

  // --- Toast Notifications ---
  const notify = (message: string) => {
    toast({
      title: "Notification",
      description: message,
      action: <Button onClick={() => {}}>Undo</Button>,
    });
  };

  // --- Component Rendering ---
  const renderComponent = (component: CircuitComponent) => {
  const renderComponent = (component: CircuitComponent) => {
    const commonProps = {
      key: component.id,
      onMouseDown: (e: React.MouseEvent) => handleSelect(component),
      onMouseUp: () => setSelectedComponent(null),
      onMouseMove: (e: React.MouseEvent) => handleDrag(e, component),
      style: { position: "absolute" as React.CSSProperties["position"], left: component.x, top: component.y, width: component.width, height: component.height },
    };

    switch (component.type) {
      case "BATTERY":
        return (
          <div {...commonProps} className="battery" onDoubleClick={() => notify("Battery voltage adjusted!")}>
            <div className={cn("terminals", { "flipped": component.isFlipped })}>
              <div className="terminal t1" />
              <div className="terminal t2" />
            </div>
            <div className="body">
              <div className="label">9V</div>
            </div>
          </div>
        );
      case "WIRE":
        return (
          <div {...commonProps} className="wire" onDoubleClick={() => notify("Wire length adjusted!")}>
            <div className="terminals">
              <div className="terminal t1" />
              <div className="terminal t2" />
            </div>
          </div>
        );
      case "BULB":
        return (
          <div {...commonProps} className="bulb" onDoubleClick={() => notify("Bulb brightness adjusted!")}>
            <div className="terminals">
              <div className="terminal t1" />
              <div className="terminal t2" />
            </div>
            <div className="body">
              <div className="filament" />
            </div>
          </div>
        );
      case "SWITCH":
        return (
          <div {...commonProps} className="switch" onDoubleClick={() => notify("Switch toggled!")}>
            <div className="terminals">
              <div className="terminal t1" />
              <div className="terminal t2" />
            </div>
            <div className="body">
              {component.isOpen ? "ON" : "OFF"}
            </div>
          </div>
        );
      case "RESISTOR":
        return (
          <div {...commonProps} className="resistor" onDoubleClick={() => notify("Resistor value adjusted!")}>
            <div className="terminals">
              <div className="terminal t1" />
              <div className="terminal t2" />
            </div>
            <div className="body">
              <div className="label">{component.value}Ω</div>
            </div>
          </div>
        );
      default:
        return null;
    }
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
          <CardTitle className="text-3xl flex items-center gap-2">
            <Network className="h-8 w-8 text-primary" />
            Simple Circuit Builder
          </CardTitle>
          <CardDescription>
            Grade 10 - STBB. Build and test simple series and parallel circuits to understand Ohm's law and current flow.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <div className="component-palette">
            {COMPONENT_PALETTE.map(comp => (
              <div key={comp.type} className="component" onClick={() => setComponents([...components, { id: Date.now().toString(), type: comp.type, x: 100, y: 100, width: comp.defaultWidth, height: comp.defaultHeight, value: comp.defaultValue, terminals: { t1: { x: 0, y: 0 }, t2: { x: 0, y: 0 } }, }])}>
                <comp.icon className="icon" />
                <span className="label">{comp.label}</span>
              </div>
            ))}
          </div>
          <div className="canvas" ref={canvasRef} onClick={handleCanvasClick} style={{ position: 'relative', width: CANVAS_WIDTH, height: CANVAS_HEIGHT, border: '1px solid #ccc', borderRadius: 8, overflow: 'hidden' }}>
            {components.map(comp => renderComponent(comp))}
            {connections.map((conn, index) => (
              <line key={index} x1={conn.x} y1={conn.y} x2={conn.x + 20} y2={conn.y + 20} stroke="black" />
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" size="sm" onClick={() => setSnapToGrid(!snapToGrid)}>
            {snapToGrid ? "Disable Snap to Grid" : "Enable Snap to Grid"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
