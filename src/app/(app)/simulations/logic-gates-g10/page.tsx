// src/app/(app)/simulations/logic-gates-g10/page.tsx (or a new file if you prefer)
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Binary, HelpCircle, Lightbulb, LightbulbOff } from "lucide-react";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";


type LogicGateType = "AND" | "OR" | "NOT" | "NAND" | "NOR" | "XOR";

interface TruthTableRow {
  inputA: boolean;
  inputB?: boolean;
  output: boolean;
}

// --- SVG Gate Symbol Components ---
interface GateSymbolProps {
  inputAActive: boolean;
  inputBActive?: boolean;
  outputActive: boolean;
  gateType: LogicGateType; // To help style the gate body uniquely
  size?: number;
}

const GateSymbolDisplay: React.FC<GateSymbolProps> = ({ inputAActive, inputBActive, outputActive, gateType, size = 70 }) => {
  const highColor = "stroke-green-500";
  const lowColor = "stroke-red-500"; // Or a more neutral "off" color like stroke-gray-400
  const wireStrokeWidth = "4";
  const gateStrokeWidth = "3";
  const bubbleRadius = 7;

  // Base colors for gate bodies - can be themed further
  const gateColors: Record<LogicGateType, string> = {
    AND: "fill-sky-500 stroke-sky-700",
    OR: "fill-purple-500 stroke-purple-700",
    NOT: "fill-teal-500 stroke-teal-700",
    NAND: "fill-sky-500 stroke-sky-700", // Same as AND body
    NOR: "fill-purple-500 stroke-purple-700", // Same as OR body
    XOR: "fill-pink-500 stroke-pink-700",
  };
  const gateBodyClass = `${gateColors[gateType]} transition-all duration-300`;

  // Input coordinates
  const inAx = 0, inAy1 = size * 0.25, inAy2 = size * 0.75;
  const gateInX = size * 0.3;

  // Output coordinates
  const outXGate = size * 1.0; // Varies based on bubble
  const outXFinal = size * 1.3;

  const isTwoInput = gateType !== "NOT";

  return (
    <svg width={outXFinal + wireStrokeWidth} height={size} viewBox={`0 0 ${outXFinal + parseFloat(wireStrokeWidth)} ${size}`} className="overflow-visible">
      {/* Input A wire */}
      <line x1={inAx} y1={isTwoInput ? inAy1 : size / 2} x2={gateInX} y2={isTwoInput ? inAy1 : size / 2} className={`${inputAActive ? highColor : lowColor} transition-all duration-300`} strokeWidth={wireStrokeWidth} />
      {/* Input B wire (if applicable) */}
      {isTwoInput && (
        <line x1={inAx} y1={inAy2} x2={gateInX} y2={inAy2} className={`${inputBActive ? highColor : lowColor} transition-all duration-300`} strokeWidth={wireStrokeWidth} />
      )}

      {/* Gate specific shapes */}
      {gateType === "AND" && <path d={`M${gateInX} ${size*0.1} H${size*0.7} A${size*0.4} ${size*0.4} 0 0 1 ${size*0.7} ${size*0.9} H${gateInX} Z`} className={gateBodyClass} strokeWidth={gateStrokeWidth} />}
      {gateType === "NAND" && <path d={`M${gateInX} ${size*0.1} H${size*0.7} A${size*0.4} ${size*0.4} 0 0 1 ${size*0.7} ${size*0.9} H${gateInX} Z`} className={gateBodyClass} strokeWidth={gateStrokeWidth} />}

      {gateType === "OR" && <path d={`M${gateInX},${size*0.1} Q${size*0.7},${size*0.2} ${size*0.9},${size/2} Q${size*0.7},${size*0.8} ${gateInX},${size*0.9} Q${size*0.4},${size/2} ${gateInX},${size*0.1} Z`} className={gateBodyClass} strokeWidth={gateStrokeWidth} />}
      {gateType === "NOR" && <path d={`M${gateInX},${size*0.1} Q${size*0.7},${size*0.2} ${size*0.9},${size/2} Q${size*0.7},${size*0.8} ${gateInX},${size*0.9} Q${size*0.4},${size/2} ${gateInX},${size*0.1} Z`} className={gateBodyClass} strokeWidth={gateStrokeWidth} />}
      {gateType === "XOR" && <>
        <path d={`M${gateInX - size*0.1},${size*0.1} Q${gateInX + size*0.05},${size/2} ${gateInX - size*0.1},${size*0.9}`} fill="none" className={gateColors.XOR.split(' ')[1]} strokeWidth={gateStrokeWidth} />
        <path d={`M${gateInX},${size*0.1} Q${size*0.7},${size*0.2} ${size*0.9},${size/2} Q${size*0.7},${size*0.8} ${gateInX},${size*0.9} Q${size*0.4},${size/2} ${gateInX},${size*0.1} Z`} className={gateBodyClass} strokeWidth={gateStrokeWidth} />
      </>}

      {gateType === "NOT" && <polygon points={`${gateInX},${size*0.15} ${gateInX},${size*0.85} ${size*0.8},${size/2}`} className={gateBodyClass} strokeWidth={gateStrokeWidth} />}

      {/* Output line and bubble for inverting gates */}
      { (gateType === "NAND" || gateType === "NOR" || gateType === "NOT") ? (
        <>
          <circle cx={(gateType === "NOT" ? size*0.8 : size*0.9) + bubbleRadius} cy={size/2} r={bubbleRadius} fill="hsl(var(--background))" className={gateColors[gateType].split(' ')[1]} strokeWidth={gateStrokeWidth} />
          <line x1={(gateType === "NOT" ? size*0.8 : size*0.9) + 2*bubbleRadius} y1={size/2} x2={outXFinal} y2={size/2} className={`${outputActive ? highColor : lowColor} transition-all duration-300`} strokeWidth={wireStrokeWidth} />
        </>
      ) : (
        <line x1={gateType === "OR" || gateType === "XOR" ? size*0.9 : size*0.7} y1={size/2} x2={outXFinal} y2={size/2} className={`${outputActive ? highColor : lowColor} transition-all duration-300`} strokeWidth={wireStrokeWidth} />
      )}
    </svg>
  );
};

// --- End SVG Gate Symbol Components ---

const GATE_DEFINITIONS_ENHANCED: Record<LogicGateType, {
  inputs: number;
  logic: (a: boolean, b?: boolean) => boolean;
  description: string;
  isUniversal?: boolean;
  universalInfo?: string;
}> = {
  AND: {
    inputs: 2, logic: (a, b) => a && (b !== undefined ? b : false),
    description: "Output is TRUE (1) only if Input A AND Input B are both TRUE (1)."
  },
  OR: {
    inputs: 2, logic: (a, b) => a || (b !== undefined ? b : false),
    description: "Output is TRUE (1) if Input A OR Input B (or both) are TRUE (1)."
  },
  NOT: {
    inputs: 1, logic: (a) => !a,
    description: "Output is the opposite of Input A (Inverter)."
  },
  NAND: {
    inputs: 2, logic: (a, b) => !(a && (b !== undefined ? b : false)),
    description: "Output is FALSE (0) only if Input A AND Input B are both TRUE (1) (NOT AND).",
    isUniversal: true,
    universalInfo: "NAND gates are 'universal gates,' meaning any other logic gate (AND, OR, NOT, etc.) can be constructed using only NAND gates. This property is fundamental in digital circuit design for minimizing gate types."
  },
  NOR: {
    inputs: 2, logic: (a, b) => !(a || (b !== undefined ? b : false)),
    description: "Output is TRUE (1) only if Input A AND Input B are both FALSE (0) (NOT OR).",
    isUniversal: true,
    universalInfo: "NOR gates, like NAND gates, are 'universal.' Any logic function can be implemented using only NOR gates, offering flexibility in circuit design."
  },
  XOR: {
    inputs: 2, logic: (a, b) => a !== (b !== undefined ? b : false),
    description: "Output is TRUE (1) if Input A and Input B are different (one is TRUE and the other is FALSE)."
  },
};

function getBooleanExpressionString(gate: LogicGateType, a: boolean, b?: boolean, outputVal?: boolean): { expression: string, substituted: string } {
  const valA = a ? "1" : "0";
  const valB = b !== undefined ? (b ? "1" : "0") : "";
  const valOut = outputVal !== undefined ? (outputVal ? "1" : "0") : "?";
  const opB = GATE_DEFINITIONS_ENHANCED[gate].inputs === 1 ? "" : ` ${valB}`; // Handle NOT gate which has no B

  switch (gate) {
    case "AND": return { expression: "Y = A ⋅ B", substituted: `${valOut} = ${valA} ⋅${opB}` };
    case "OR":  return { expression: "Y = A + B", substituted: `${valOut} = ${valA} +${opB}` };
    case "NOT": return { expression: "Y = ¬A",    substituted: `${valOut} = ¬${valA}` }; // Could also use A̅
    case "NAND":return { expression: "Y = ¬(A ⋅ B)", substituted: `${valOut} = ¬(${valA} ⋅${opB})` };
    case "NOR": return { expression: "Y = ¬(A + B)", substituted: `${valOut} = ¬(${valA} +${opB})` };
    case "XOR": return { expression: "Y = A ⊕ B", substituted: `${valOut} = ${valA} ⊕${opB}` };
    default: return {expression: "", substituted: ""};
  }
}


export default function LogicGatesG10EnhancedPage() {
  const [selectedGate, setSelectedGate] = useState<LogicGateType>("AND");
  const [inputA, setInputA] = useState<boolean>(false);
  const [inputB, setInputB] = useState<boolean>(false);
  // Output is derived, no need for separate state if calculated in useEffect/useMemo
  // const [output, setOutput] = useState<boolean>(false);

  // Animation trigger states
  const [pulseA, setPulseA] = useState(0);
  const [pulseB, setPulseB] = useState(0);
  const [pulseOut, setPulseOut] = useState(0);

  const gateDefinition = useMemo(() => GATE_DEFINITIONS_ENHANCED[selectedGate], [selectedGate]);

  const output = useMemo(() => {
    if (gateDefinition.inputs === 1) {
      return gateDefinition.logic(inputA);
    }
    return gateDefinition.logic(inputA, inputB);
  }, [selectedGate, inputA, inputB, gateDefinition]);

  // Trigger pulse animation on input/output change
  const triggerPulse = useCallback((setter: React.Dispatch<React.SetStateAction<number>>) => {
    setter(prev => prev + 1); // Increment to trigger re-render/animation key change
  }, []);

  useEffect(() => triggerPulse(setPulseA), [inputA]);
  useEffect(() => { if (gateDefinition.inputs === 2) triggerPulse(setPulseB) }, [inputB, gateDefinition.inputs]);
  useEffect(() => triggerPulse(setPulseOut), [output]);


  const truthTable = useMemo((): TruthTableRow[] => {
    const table: TruthTableRow[] = [];
    if (gateDefinition.inputs === 1) {
      table.push({ inputA: false, output: gateDefinition.logic(false) });
      table.push({ inputA: true, output: gateDefinition.logic(true) });
    } else {
      for (const aVal of [false, true]) {
        for (const bVal of [false, true]) {
          table.push({ inputA: aVal, inputB: bVal, output: gateDefinition.logic(aVal, bVal) });
        }
      }
    }
    return table;
  }, [selectedGate, gateDefinition]);

  const booleanExpression = useMemo(() => {
    return getBooleanExpressionString(selectedGate, inputA, inputB, output);
  }, [selectedGate, inputA, inputB, output]);

  const renderBoolean = (val: boolean, type: 'input' | 'output' = 'input') => (
    <Badge
      variant={val ? "default" : "secondary"}
      className={`font-mono text-sm transition-all duration-300 ${val ? "bg-green-500 hover:bg-green-600 text-white" : "bg-red-500 hover:bg-red-600 text-white"}`}
    >
      {val ? "1 (TRUE)" : "0 (FALSE)"}
    </Badge>
  );

  const renderInputSwitch = (
    id: "inputA" | "inputB",
    label: string,
    value: boolean,
    setter: (val: boolean) => void,
    pulseKey: number
  ) => (
    <div className="flex flex-col items-center space-y-2 p-3 rounded-md border bg-card shadow-sm">
      <Label htmlFor={id} className="text-md font-semibold">{label}</Label>
      <Switch id={id} checked={value} onCheckedChange={setter} aria-label={`${label} ${value ? 'ON' : 'OFF'}`} />
      {renderBoolean(value)}
      <div key={pulseKey} className={`h-1 w-full rounded-full mt-1 ${value ? 'bg-green-500 animate-pulse-quick' : 'bg-red-500'}`}></div>
    </div>
  );

  return (
    <TooltipProvider>
    <div className="space-y-6 p-1 md:p-4"> {/* Added padding for smaller screens */}
      <style jsx global>{`
        @keyframes pulse-quick {
          0%, 100% { opacity: 0.7; transform: scaleX(1); }
          50% { opacity: 1; transform: scaleX(1.05); }
        }
        .animate-pulse-quick {
          animation: pulse-quick 0.5s ease-out;
        }
      `}</style>
      <div className="flex justify-between items-center">
        <Button variant="outline" asChild size="sm">
          <Link href="/simulations">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Link>
        </Button>
        <Popover>
          <PopoverTrigger asChild><Button variant="outline" size="icon"><HelpCircle className="h-5 w-5"/></Button></PopoverTrigger>
          <PopoverContent className="w-80 text-sm">
             {/* ... Help content ... */}
             <h4 className="font-medium leading-none mb-2">Logic Gate Simulator Help</h4>
            <p className="text-muted-foreground">
              - Select a gate, toggle inputs, and observe the SVG symbol, Boolean expression, output LED, and truth table.
              <br/>- Wires on symbols: <span className="text-green-500 font-semibold">Green</span> for HIGH (1), <span className="text-red-500 font-semibold">Red</span> for LOW (0).
              <br/>- Note special info for Universal Gates (NAND/NOR).
            </p>
          </PopoverContent>
        </Popover>
      </div>

      <Card className="shadow-xl overflow-hidden">
        <CardHeader className="bg-muted/30">
          <CardTitle className="text-2xl md:text-3xl flex items-center gap-2">
            <Binary className="h-8 w-8 text-primary" />
            Interactive Logic Gate Simulator
          </CardTitle>
          <CardDescription>
            Explore digital logic: Visualize gate operations, Boolean expressions, and truth tables. (Grades 10-12)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">1. Select Logic Gate</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={selectedGate} onValueChange={(value) => setSelectedGate(value as LogicGateType)}>
                <SelectTrigger className="w-full md:w-[280px] text-base py-2.5">
                  <SelectValue placeholder="Select a Logic Gate" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(GATE_DEFINITIONS_ENHANCED).map((gateKey) => (
                    <SelectItem key={gateKey} value={gateKey} className="text-base py-2.5">
                      {gateKey} Gate
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-sm text-muted-foreground p-3 border rounded-md bg-secondary/20 min-h-[70px]">
                <p><span className="font-semibold text-foreground">{selectedGate} Gate:</span> {gateDefinition.description}</p>
                {gateDefinition.isUniversal && gateDefinition.universalInfo && (
                  <p className="mt-2 pt-2 border-t border-border/50">
                    <span className="font-semibold text-primary">Universal Gate:</span> {gateDefinition.universalInfo}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">2. Set Inputs & Observe Output</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 md:gap-6 items-center justify-center p-2 md:p-4 rounded-lg bg-muted/40 border">
                {/* Inputs Column */}
                <div className="space-y-4 flex flex-col items-center md:items-end">
                  {renderInputSwitch("inputA", "Input A", inputA, setInputA, pulseA)}
                  {gateDefinition.inputs === 2 && renderInputSwitch("inputB", "Input B", inputB, setInputB, pulseB)}
                </div>

                {/* Gate Symbol Column */}
                <div className="flex justify-center items-center py-4 md:py-0">
                  <GateSymbolDisplay
                    inputAActive={inputA}
                    inputBActive={gateDefinition.inputs === 2 ? inputB : undefined}
                    outputActive={output}
                    gateType={selectedGate}
                    size={gateDefinition.inputs === 1 ? 60 : 80} // Smaller for NOT gate
                  />
                </div>

                {/* Output Column */}
                <div className="flex flex-col items-center md:items-start space-y-3">
                    <Label className="text-md font-semibold">Output (Y)</Label>
                    <div key={pulseOut} className={`w-16 h-16 md:w-20 md:h-20 rounded-full border-4 flex items-center justify-center text-2xl font-bold transition-all duration-300 shadow-lg
                      ${output ? 'bg-green-500 border-green-700 animate-pulse-quick' : 'bg-red-500 border-red-700'} text-white`}
                      role="status" aria-live="polite" aria-label={`Output is ${output ? '1 TRUE' : '0 FALSE'}`}
                    >
                      {output ? <Lightbulb size={36}/> : <LightbulbOff size={36}/>}
                    </div>
                    {renderBoolean(output, 'output')}
                </div>
              </div>
              {/* Boolean Expression */}
              <div className="text-center p-3 border rounded-md bg-secondary/20">
                <p className="text-sm text-muted-foreground">Boolean Expression:</p>
                <p className="text-lg font-mono font-semibold text-primary">{booleanExpression.expression}</p>
                <p className="text-sm text-muted-foreground mt-1">With current inputs:</p>
                <p className="text-lg font-mono font-semibold">{booleanExpression.substituted}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">3. Verify Truth Table: <span className="text-primary">{selectedGate}</span></CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[100px]">Input A</TableHead>
                      {gateDefinition.inputs === 2 && <TableHead className="min-w-[100px]">Input B</TableHead>}
                      <TableHead className="text-right min-w-[100px]">Output Y</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {truthTable.map((row, index) => (
                      <TableRow key={index}
                        className={`transition-colors duration-200 ${
                          inputA === row.inputA && (gateDefinition.inputs === 1 || inputB === row.inputB)
                          ? "bg-primary/10"
                          : "hover:bg-muted/50"
                        }`}
                      >
                        <TableCell>{renderBoolean(row.inputA)}</TableCell>
                        {gateDefinition.inputs === 2 && <TableCell>{renderBoolean(row.inputB!)}</TableCell>}
                        <TableCell className="text-right">{renderBoolean(row.output)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </CardContent>
        <CardFooter className="bg-muted/30 p-4">
          <p className="text-xs text-muted-foreground">This enhanced simulator demonstrates logic gate symbols, Boolean algebra, and truth tables. Toggling inputs updates the visualization in real-time.</p>
        </CardFooter>
      </Card>
    </div>
    </TooltipProvider>
  );
}