"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// Interface for a Capacitor
interface Capacitor {
  id: number;
  capacitance: number;
}

// Helper function to calculate equivalent capacitance of capacitors in series
const calculateSeriesCapacitance = (capacitors: number[]): number => {
  if (capacitors.length === 0) return 0;
  const reciprocalSum = capacitors.reduce((sum, c) => sum + (c > 0 ? 1 / c : 0), 0);
  return reciprocalSum > 0 ? 1 / reciprocalSum : 0;
};

// Helper function to calculate equivalent capacitance of capacitors in parallel
const calculateParallelCapacitance = (capacitors: number[]): number => {
  return capacitors.reduce((sum, c) => sum + c, 0);
};

// Define the structure of a network element (either a single capacitor or a sub-network)
interface NetworkElement {
  type: 'capacitor' | 'series' | 'parallel';
  id: number;
  value?: number; // Capacitance for type 'capacitor'
  elements?: NetworkElement[]; // Sub-elements for 'series' or 'parallel'
}

// Define a simple default network (e.g., two capacitors in series, in parallel with a third)
const defaultNetwork: NetworkElement = {
  type: 'parallel',
  id: 1, // Unique ID for the main parallel branch
  elements: [
    {
      type: 'series',
      id: 2, // Unique ID for the series branch
      elements: [
        { type: 'capacitor', id: 3, value: 10 }, // Capacitor C1 (10 uF)
        { type: 'capacitor', id: 4, value: 20 }, // Capacitor C2 (20 uF)
      ],
    },
    { type: 'capacitor', id: 5, value: 30 }, // Capacitor C3 (30 uF)
  ],
};

// Recursive function to calculate the equivalent capacitance of a given network element
const calculateEquivalentCapacitance = (element: NetworkElement): number => {
  if (element.type === 'capacitor' && element.value !== undefined) {
    return element.value;
  } else if (element.type === 'series' && element.elements) {
    const capacitances = element.elements.map(calculateEquivalentCapacitance);
    return calculateSeriesCapacitance(capacitances);
  } else if (element.type === 'parallel' && element.elements) {
    const capacitances = element.elements.map(calculateEquivalentCapacitance);
    return calculateParallelCapacitance(capacitances);
  }
  return 0; // Should not happen in a valid network structure
};

// Recursive function to calculate charge and voltage for each capacitor in the network
const analyzeNetwork = (element: NetworkElement, totalVoltage: number, results: { [key: number]: { voltage: number; charge: number } }) => {
  if (element.type === 'capacitor' && element.value !== undefined) {
    // For a single capacitor within a branch, its voltage is the voltage across that branch.
    // Charge is Q = CV
    results[element.id] = { voltage: totalVoltage, charge: element.value * totalVoltage };
  } else if (element.type === 'series' && element.elements) {
    const equivalentCapacitance = calculateSeriesCapacitance(element.elements.map(calculateEquivalentCapacitance));
    // In series, total charge is the same across all components and equals Q = C_eq * V_total_across_series
    const totalCharge = equivalentCapacitance * totalVoltage; // totalVoltage here is the voltage across the entire series block

    element.elements.forEach(subElement => {
      // Voltage across each element in series is V = Q / C_eq_sub_element
      const subElementEquivalentCapacitance = calculateEquivalentCapacitance(subElement);
       if (subElementEquivalentCapacitance > 0) {
          analyzeNetwork(subElement, totalCharge / subElementEquivalentCapacitance, results);
       } else {
           // Handle cases where sub-element might have 0 capacitance (e.g., empty sub-network)
           analyzeNetwork(subElement, 0, results);
       }
    });
  } else if (element.type === 'parallel' && element.elements) {
     // In parallel, voltage is the same across all elements and equals the total voltage across the parallel combination
    element.elements.forEach(subElement => {
      analyzeNetwork(subElement, totalVoltage, results); // Pass the same totalVoltage to each parallel branch
    });
  }
};

const renderNetwork = (element: NetworkElement, analysisResults: { [key: number]: { voltage: number; charge: number } }): JSX.Element => {
  if (element.type === 'capacitor' && element.value !== undefined) {
    const result = analysisResults[element.id];
    return <div key={element.id} className="flex flex-col items-center mx-2">
      <svg width="50" height="50" viewBox="0 0 50 50" className="stroke-current text-blue-600">
         {/* Capacitor symbol */}
         <line x1="10" y1="25" x2="40" y2="25" strokeWidth="2" />
         <line x1="40" y1="15" x2="40" y2="35" strokeWidth="2" />
         <line x1="10" y1="15" x2="10" y2="35" strokeWidth="2" />
      </svg>
      <Label className="text-xs mt-1 text-center">{`C${element.id}: ${element.value} µF`}</Label>
      {result && (
         <div className="text-xs mt-1 text-center">
            <p>{`V: ${result.voltage.toFixed(2)} V`}</p>
            <p>{`Q: ${result.charge.toFixed(2)} µC`}</p>
         </div>
      )}
    </div>;
  } else if (element.type === 'series' && element.elements) {
    return <div key={element.id} className="flex items-center justify-center">
      {element.elements.map((el, index) => (
        <React.Fragment key={el.id}>
          {renderNetwork(el, analysisResults)}
          {index < element.elements!.length - 1 && <div className="w-4 h-1 bg-gray-400 mx-1"></div>} {/* Connecting line */}
        </React.Fragment>
      ))}
    </div>;
  } else if (element.type === 'parallel' && element.elements) {
     // Calculate the height needed for parallel lines based on the number of elements
     const elementHeight = 60; // Approximate height of a capacitor visual + labels
     const totalHeight = element.elements.length * elementHeight + (element.elements.length - 1) * 10; // Add spacing

    return <div key={element.id} className="flex items-center justify-center my-2">
        {/* Left parallel connection */}
        <div className="flex flex-col items-center">
           <div className="w-1 h-4 bg-gray-400"></div> {/* Short vertical line */}
            <div className="w-4 h-1 bg-gray-400"></div> {/* Horizontal stub */}
            <div className="flex-grow w-1 bg-gray-400"></div> {/* Vertical line connecting parallel branches */}
            <div className="w-4 h-1 bg-gray-400"></div> {/* Horizontal stub */}
             <div className="w-1 h-4 bg-gray-400"></div> {/* Short vertical line */}
        </div>
         <div className="flex flex-col justify-center items-center">
             {element.elements.map((el, index) => (
                <div key={el.id} className="flex items-center my-1"> {/* Added margin */}
                   {renderNetwork(el, analysisResults)}
                </div>
            ))}
         </div>
        {/* Right parallel connection */}
         <div className="flex flex-col items-center">
           <div className="w-1 h-4 bg-gray-400"></div> {/* Short vertical line */}
            <div className="w-4 h-1 bg-gray-400"></div> {/* Horizontal stub */}
            <div className="flex-grow w-1 bg-gray-400"></div> {/* Vertical line connecting parallel branches */}
            <div className="w-4 h-1 bg-gray-400"></div> {/* Horizontal stub */}
             <div className="w-1 h-4 bg-gray-400"></div> {/* Short vertical line */}
        </div>
    </div>;
  }
  return <></>;
};


const CapacitorNetworkSim: React.FC = () => {
  const [voltage, setVoltage] = useState<number[]>([12]); // Use array for slider value
  const [network, setNetwork] = useState<NetworkElement>(defaultNetwork);
   const [analysisResults, setAnalysisResults] = useState<{ [key: number]: { voltage: number; charge: number } }>({});

  // Function to update capacitor value by id
  const updateCapacitorValue = (id: number, newValue: number) => {
    // Prevent setting capacitance to zero or negative
    if (newValue <= 0) return;

    const updateElement = (element: NetworkElement): NetworkElement => {
      if (element.type === 'capacitor' && element.id === id) {
        return { ...element, value: newValue };
      } else if (element.elements) {
        return { ...element, elements: element.elements.map(updateElement) };
      }
      return element;
    };
    setNetwork(updateElement(network));
     // Clear results when network configuration changes
    setAnalysisResults({});
  };

  const handleCalculate = () => {
     const results: { [key: number]: { voltage: number; charge: number } } = {};
     // The total voltage is applied across the top-level element of the network
     analyzeNetwork(network, voltage[0], results);
     setAnalysisResults(results);
  };

   const handleReset = () => {
    setVoltage([12]);
    setNetwork(defaultNetwork); // Reset to the default structure and values
    setAnalysisResults({});
  };

  // Calculate equivalent capacitance using memoization to avoid recalculating unnecessarily
  const equivalentCapacitance = useMemo(() => calculateEquivalentCapacitance(network), [network]);

  // Function to find all capacitors in the network to generate controls dynamically
  const getAllCapacitors = (element: NetworkElement): Capacitor[] => {
      let capacitors: Capacitor[] = [];
      if (element.type === 'capacitor' && element.value !== undefined) {
          capacitors.push({ id: element.id, capacitance: element.value });
      } else if (element.elements) {
          element.elements.forEach(el => {
              capacitors = capacitors.concat(getAllCapacitors(el));
          });
      }
      return capacitors;
  };

  const capacitorsInNetwork = useMemo(() => getAllCapacitors(network), [network]);


  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Control Panel */}
      <Card className="w-full lg:w-1/3">
        <CardHeader>
          <CardTitle>Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="voltage-source">Voltage Source ({voltage[0].toFixed(1)} V)</Label>
            <Slider
              id="voltage-source"
              min={0}
              max={24}
              step={0.1}
              value={voltage}
              onValueChange={setVoltage}
            />
          </div>
           <Separator />
            <h4 className="font-semibold">Capacitor Values (µF):</h4>
           {/* Dynamically generate controls for each capacitor */}
           {capacitorsInNetwork.map(cap => (
                <div key={cap.id}>
                     <Label htmlFor={`capacitor-${cap.id}`}>Capacitor C{cap.id}</Label>
                     <Input
                        id={`capacitor-${cap.id}`}
                        type="number"
                         value={cap.capacitance}
                         onChange={(e) => updateCapacitorValue(cap.id, parseFloat(e.target.value))}
                         min={1}
                         step={1}
                      />
                </div>
           ))}


          <Button onClick={handleCalculate} className="w-full">Calculate</Button>
           <Button onClick={handleReset} variant="outline" className="w-full">Reset</Button>
        </CardContent>
      </Card>

      {/* Simulation Area */}
      <Card className="w-full lg:w-2/3">
        <CardHeader>
          <CardTitle>Capacitor Network Diagram</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center min-h-[300px] p-4 overflow-auto">
          {/* Render the network diagram */}
           <div className="flex items-center border p-4 rounded-md"> {/* Added border for clarity */}
              {/* Voltage Source Symbol */}
               <div className="flex flex-col items-center mr-4">
                 <svg width="40" height="60" viewBox="0 0 40 60" className="stroke-current text-red-600">
                    <line x1="20" y1="0" x2="20" y2="60" strokeWidth="2" />
                    <line x1="10" y1="15" x2="30" y2="15" strokeWidth="2" />
                    <line x1="10" y1="45" x2="30" y2="45" strokeWidth="2" />
                    <text x="25" y="35" fontSize="20" fill="red" textAnchor="middle">+</text>
                    <text x="15" y="35" fontSize="20" fill="red" textAnchor="middle">-</text>
                 </svg>
                 <Label className="text-xs mt-1">{`${voltage[0].toFixed(1)} V`}</Label>
               </div>

              {/* Connecting line to network */}
              <div className="w-8 h-1 bg-gray-400"></div>
               <div className="flex flex-col items-center">
                   {renderNetwork(network, analysisResults)}
               </div>
               {/* Connecting line back to source */}
               <div className="w-8 h-1 bg-gray-400"></div>

              {/* Closing connection (simplified loop) */}
               <div className="flex flex-col items-center ml-4">
                 <div className="w-1 h-full bg-gray-400"></div>
               </div>
            </div>
        </CardContent>
      </Card>

      {/* Data Display */}
      <Card className="w-full lg:w-1/3">
        <CardHeader>
          <CardTitle>Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <Label>Equivalent Capacitance (C_eq):</Label>
            <p>{equivalentCapacitance.toFixed(4)} µF</p>
          </div>
          <Separator />
           {/* Display results for individual capacitors */}
            {Object.keys(analysisResults).length > 0 && (
               <div className="space-y-2">
                 <h4 className="font-semibold">Individual Capacitor Analysis:</h4>
                 {capacitorsInNetwork.map(cap => {
                     const result = analysisResults[cap.id];
                     return result ? (
                        <div key={cap.id}>
                          <Label>{`Capacitor C${cap.id}:`}</Label>
                          <p className="text-sm">{`Voltage: ${result.voltage.toFixed(4)} V, Charge: ${result.charge.toFixed(4)} µC`}</p>
                        </div>
                     ) : null; // Don't render if no analysis result for this cap
                 })}
               </div>
            )}
             {Object.keys(analysisResults).length === 0 && (
                <p className="text-sm text-gray-500">Click "Calculate" to see results.</p>
             )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CapacitorNetworkSim;