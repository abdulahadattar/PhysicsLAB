
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Binary, HelpCircle } from "lucide-react";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

type LogicGateType = "AND" | "OR" | "NOT" | "NAND" | "NOR" | "XOR";

interface TruthTableRow {
  inputA: boolean;
  inputB?: boolean;
  output: boolean;
}

const GATE_DEFINITIONS: Record<LogicGateType, {
  inputs: number;
  logic: (a: boolean, b?: boolean) => boolean;
  description: string;
}> = {
  AND: {
    inputs: 2,
    logic: (a, b) => a && (b !== undefined ? b : false),
    description: "Output is TRUE (1) only if Input A AND Input B are both TRUE (1)."
  },
  OR: {
    inputs: 2,
    logic: (a, b) => a || (b !== undefined ? b : false),
    description: "Output is TRUE (1) if Input A OR Input B (or both) are TRUE (1)."
  },
  NOT: {
    inputs: 1,
    logic: (a) => !a,
    description: "Output is the opposite of Input A (Inverter)."
  },
  NAND: {
    inputs: 2,
    logic: (a, b) => !(a && (b !== undefined ? b : false)),
    description: "Output is FALSE (0) only if Input A AND Input B are both TRUE (1) (NOT AND)."
  },
  NOR: {
    inputs: 2,
    logic: (a, b) => !(a || (b !== undefined ? b : false)),
    description: "Output is TRUE (1) only if Input A AND Input B are both FALSE (0) (NOT OR)."
  },
  XOR: {
    inputs: 2,
    logic: (a, b) => a !== (b !== undefined ? b : false),
    description: "Output is TRUE (1) if Input A and Input B are different."
  },
};

export default function LogicGatesG10Page() {
  const [selectedGate, setSelectedGate] = useState<LogicGateType>("AND");
  const [inputA, setInputA] = useState<boolean>(false);
  const [inputB, setInputB] = useState<boolean>(false);
  const [output, setOutput] = useState<boolean>(false);

  const gateDefinition = useMemo(() => GATE_DEFINITIONS[selectedGate], [selectedGate]);

  useEffect(() => {
    if (gateDefinition.inputs === 1) {
      setOutput(gateDefinition.logic(inputA));
    } else {
      setOutput(gateDefinition.logic(inputA, inputB));
    }
  }, [selectedGate, inputA, inputB, gateDefinition]);

  const truthTable = useMemo((): TruthTableRow[] => {
    const table: TruthTableRow[] = [];
    if (gateDefinition.inputs === 1) {
      table.push({ inputA: false, output: gateDefinition.logic(false) });
      table.push({ inputA: true, output: gateDefinition.logic(true) });
    } else {
      for (const a of [false, true]) {
        for (const b of [false, true]) {
          table.push({ inputA: a, inputB: b, output: gateDefinition.logic(a, b) });
        }
      }
    }
    return table;
  }, [selectedGate, gateDefinition]);

  const renderBoolean = (val: boolean) => (
    <Badge variant={val ? "default" : "secondary"} className={val ? "bg-green-500 text-white" : "bg-red-500 text-white"}>
      {val ? "1 (TRUE)" : "0 (FALSE)"}
    </Badge>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" asChild size="sm">
          <Link href="/simulations">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Simulations
          </Link>
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon"><HelpCircle className="h-5 w-5"/></Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 text-sm">
            <h4 className="font-medium leading-none mb-2">Logic Gate Simulator Help</h4>
            <p className="text-muted-foreground">
              - Select a logic gate from the dropdown.
              <br/>- Toggle the input switches (A, and B if applicable) to change input values (0/FALSE or 1/TRUE).
              <br/>- Observe the output LED and the dynamically generated truth table.
              <br/>- Read the description for how each gate works.
            </p>
          </PopoverContent>
        </Popover>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl flex items-center gap-2">
            <Binary className="h-8 w-8 text-primary" />
            Logic Gate Simulator
          </CardTitle>
          <CardDescription>
            Grade 10/12 - STBB. Simulate basic logic gates and verify their truth tables.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Gate Selection and Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Select Gate & View Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedGate} onValueChange={(value) => setSelectedGate(value as LogicGateType)}>
                <SelectTrigger className="w-full md:w-[280px]">
                  <SelectValue placeholder="Select a Logic Gate" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(GATE_DEFINITIONS).map((gateKey) => (
                    <SelectItem key={gateKey} value={gateKey}>
                      {gateKey} Gate
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground p-3 border rounded-md bg-secondary/30 min-h-[60px]">
                <span className="font-semibold">{selectedGate} Gate:</span> {gateDefinition.description}
              </p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6 items-start">
            {/* Inputs and Output Visualization */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Inputs & Output</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4 justify-around">
                  <div className="flex flex-col items-center space-y-2">
                    <Label htmlFor="inputA" className="text-lg font-medium">Input A</Label>
                    <Switch id="inputA" checked={inputA} onCheckedChange={setInputA} />
                    {renderBoolean(inputA)}
                  </div>

                  {gateDefinition.inputs === 2 && (
                    <>
                      <div className="flex flex-col items-center space-y-2">
                        <Label htmlFor="inputB" className="text-lg font-medium">Input B</Label>
                        <Switch id="inputB" checked={inputB} onCheckedChange={setInputB} />
                        {renderBoolean(inputB)}
                      </div>
                    </>
                  )}
                </div>

                <Separator />

                <div className="flex flex-col items-center space-y-3">
                  <div className="text-2xl font-bold p-4 border-4 rounded-md bg-muted" style={{ borderColor: gateDefinition.inputs === 1 ? 'transparent' : 'hsl(var(--border))'}}>
                     {selectedGate}
                  </div>
                  <Label className="text-lg font-medium">Output</Label>
                  <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center text-xl font-bold transition-all
                    ${output ? 'bg-green-500 border-green-700 text-white shadow-lg' : 'bg-red-500 border-red-700 text-white shadow-md'}`}
                  >
                    {output ? "1" : "0"}
                  </div>
                  {renderBoolean(output)}
                </div>
              </CardContent>
            </Card>

            {/* Truth Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Truth Table: {selectedGate}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[30%]">Input A</TableHead>
                      {gateDefinition.inputs === 2 && <TableHead className="w-[30%]">Input B</TableHead>}
                      <TableHead className="text-right w-[40%]">Output</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {truthTable.map((row, index) => (
                      <TableRow key={index} 
                        className={
                          inputA === row.inputA && (gateDefinition.inputs === 1 || inputB === row.inputB)
                          ? "bg-primary/10"
                          : ""
                        }
                      >
                        <TableCell>{renderBoolean(row.inputA)}</TableCell>
                        {gateDefinition.inputs === 2 && <TableCell>{renderBoolean(row.inputB!)}</TableCell>}
                        <TableCell className="text-right">{renderBoolean(row.output)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground">This simulation helps verify the truth tables for common logic gates. Toggle inputs to see the output change.</p>
        </CardFooter>
      </Card>
    </div>
  );
}

