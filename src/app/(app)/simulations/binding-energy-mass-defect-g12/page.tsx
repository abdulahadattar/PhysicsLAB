// src/app/(app)/simulations/binding-energy-mass-defect-g12/page.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, SigmaSquare } from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

// Source for atomic mass data: https://physics.nist.gov/cgi-bin/Compositions/live_ez.cgi
const atomicMassData: { [key: number]: { symbol: string, mass: number, abundance?: number } } = {
  1: { symbol: "H", mass: 1.00782503224 }, // Hydrogen-1
  2: { symbol: "He", mass: 4.00260325413 }, // Helium-4
  6: { symbol: "C", mass: 12.00000000000 }, // Carbon-12
  8: { symbol: "O", mass: 15.99491461961 }, // Oxygen-16
  26: { symbol: "Fe", mass: 55.93493748 }, // Iron-56 (most stable)
  92: { symbol: "U", mass: 238.05078826 }, // Uranium-238
};

// Source for neutron mass: https://physics.nist.gov/cgi-bin/cuu/Value?mnc2mev|search_for=neutron+mass
const neutronMass = 1.008664928; // in atomic mass units (u)
const protonMass = 1.007276466; // in atomic mass units (u)
const electronMass = 0.0005485799; // in atomic mass units (u) - needed for atomic mass to nuclear mass conversion

const energyConversionFactor = 931.494105; // MeV/u

// Placeholder for Binding Energy Curve Data - Actual data needed for full curve
const bindingEnergyCurveData = [
  { massNumber: 1, bindingEnergyPerNucleon: 0 },
  { massNumber: 4, bindingEnergyPerNucleon: 7.07 }, // Helium-4
  { massNumber: 12, bindingEnergyPerNucleon: 7.68 }, // Carbon-12
  { massNumber: 16, bindingEnergyPerNucleon: 7.98 }, // Oxygen-16
  { massNumber: 56, bindingEnergyPerNucleon: 8.79 }, // Iron-56
  { massNumber: 238, bindingEnergyPerNucleon: 7.57 }, // Uranium-238
  // Add more data points for a smoother curve
];


export default function BindingEnergyMassDefectG12Page() {
  const [atomicNumber, setAtomicNumber] = useState<number | undefined>(undefined);
  const [massNumber, setMassNumber] = useState<number | undefined>(undefined);
  const [massDefect, setMassDefect] = useState<number | undefined>(undefined);
  const [bindingEnergy, setBindingEnergy] = useState<number | undefined>(undefined);
  const [bindingEnergyPerNucleon, setBindingEnergyPerNucleon] = useState<number | undefined>(undefined);
  const [nuclideSymbol, setNuclideSymbol] = useState<string | undefined>(undefined);

  const calculateNuclearMass = (Z: number, A: number, atomicMass: number): number => {
    // Atomic mass includes electrons. Subtract the mass of Z electrons to get nuclear mass.
    return atomicMass - (Z * electronMass);
  };

  const calculate = () => {
    if (atomicNumber !== undefined && massNumber !== undefined && atomicNumber >= 0 && massNumber >= atomicNumber) {
      const Z = atomicNumber;
      const A = massNumber;
      const N = A - Z; // Number of neutrons

      // Get atomic mass from data
      const atomicData = atomicMassData[Z];

      if (atomicData) {
        setNuclideSymbol(atomicData.symbol);
        const experimentalAtomicMass = atomicData.mass;

        // Calculate the mass of the constituent nucleons (protons + neutrons)
        const massOfConstituentNucleons = (Z * protonMass) + (N * neutronMass);

        // Convert atomic mass to nuclear mass (approximately, by removing electron masses)
        const experimentalNuclearMass = calculateNuclearMass(Z, A, experimentalAtomicMass);

        // Calculate Mass Defect: (Mass of constituent nucleons) - (Experimental nuclear mass)
        const calculatedMassDefect = massOfConstituentNucleons - experimentalNuclearMass;
        setMassDefect(calculatedMassDefect);

        // Calculate Binding Energy: Mass Defect * c^2 (in MeV)
        const calculatedBindingEnergy = calculatedMassDefect * energyConversionFactor;
        setBindingEnergy(calculatedBindingEnergy);

        // Calculate Binding Energy Per Nucleon
        if (A > 0) {
            setBindingEnergyPerNucleon(calculatedBindingEnergy / A);
        } else {
            setBindingEnergyPerNucleon(undefined);
        }

      } else {
        setMassDefect(undefined);
        setBindingEnergy(undefined);
        setBindingEnergyPerNucleon(undefined);
        setNuclideSymbol(undefined);
        alert(`Atomic mass data not available for element with atomic number ${Z}.`);
      }
    } else {
        setMassDefect(undefined);
        setBindingEnergy(undefined);
        setBindingEnergyPerNucleon(undefined);
        setNuclideSymbol(undefined);
    }
  };

  // Memoize chart data to prevent unnecessary re-renders
  const chartData = useMemo(() => {
      // Combine fixed curve data with the currently calculated nuclide data
      const data = [...bindingEnergyCurveData];
      if (massNumber !== undefined && bindingEnergyPerNucleon !== undefined) {
          // Check if the calculated nuclide is already in the fixed data
          const existingIndex = data.findIndex(d => d.massNumber === massNumber);
          if (existingIndex > -1) {
              // Update if it exists (e.g., if the fixed data is just a sample)
              data[existingIndex] = { massNumber, bindingEnergyPerNucleon };
          } else {
              // Add if it's a new nuclide
              data.push({ massNumber, bindingEnergyPerNucleon });
          }
           // Sort data by massNumber for correct chart rendering
           data.sort((a, b) => a.massNumber - b.massNumber);
      }
      return data;
  }, [massNumber, bindingEnergyPerNucleon]);


  return (
    <div className="space-y-6 p-4">
      <Button variant="outline" asChild size="sm">
        <Link href="/simulations">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Simulations
        </Link>
      </Button>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl flex items-center gap-2">
            <SigmaSquare className="h-8 w-8 text-primary" />
            G12: Binding Energy & Mass Defect
          </CardTitle>
          <CardDescription>
            STBB Aligned: Unit 7 - Nuclear Physics. Explore the binding energy curve, calculate mass defect, and understand nuclear stability.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Interactive Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="atomic-number">Atomic Number (Z)</Label>
              <Input
                id="atomic-number"
                type="number"
                min="0"
                value={atomicNumber ?? ''}
                onChange={(e) => setAtomicNumber(parseInt(e.target.value) || undefined)}
                placeholder="e.g., 2 (He)"
              />
            </div>
            <div>
              <Label htmlFor="mass-number">Mass Number (A)</Label>
              <Input
                id="mass-number"
                type="number"
                 min={atomicNumber ?? 0} // Mass number cannot be less than atomic number
                value={massNumber ?? ''}
                onChange={(e) => setMassNumber(parseInt(e.target.value) || undefined)}
                placeholder="e.g., 4 (He-4)"
              />
            </div>
          </div>

          <Button onClick={calculate} disabled={atomicNumber === undefined || massNumber === undefined || atomicNumber < 0 || massNumber < atomicNumber}>
            Calculate Binding Energy
          </Button>

          <Separator />

          {/* Results Display */}
          {(massDefect !== undefined && bindingEnergy !== undefined && bindingEnergyPerNucleon !== undefined && nuclideSymbol !== undefined) ? (
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Results for {nuclideSymbol}-{massNumber} (Z={atomicNumber}, A={massNumber})</h3>
              <p>Mass of Constituents (Protons + Neutrons): {(atomicNumber * protonMass + (massNumber - atomicNumber) * neutronMass).toFixed(6)} u</p>
               <p>Experimental Atomic Mass: {atomicMassData[atomicNumber]?.mass.toFixed(6) ?? 'N/A'} u</p>
               <p>Approx. Experimental Nuclear Mass: {calculateNuclearMass(atomicNumber, massNumber, atomicMassData[atomicNumber]?.mass ?? 0).toFixed(6)} u</p>
              <p>Mass Defect (&Delta;m): <span className="font-semibold">{massDefect.toFixed(6)} u</span></p>
              <p>Binding Energy (E = &Delta;mc&sup2;): <span className="font-semibold">{bindingEnergy.toFixed(3)} MeV</span></p>
              <p>Binding Energy Per Nucleon: <span className={`font-semibold ${bindingEnergyPerNucleon > 8.7 ? 'text-green-600 dark:text-green-400' : ''}`}>{bindingEnergyPerNucleon.toFixed(3)} MeV/nucleon</span></p>
            </div>
          ) : (
            <p className="text-muted-foreground">Enter Atomic Number (Z) and Mass Number (A) and click Calculate.</p>
          )}

          <Separator />


          {/* Binding Energy Curve Visualization */}
          <div className="w-full">
             <h3 className="text-xl font-semibold mb-4">Binding Energy Per Nucleon Curve</h3>
             <ChartContainer
                config={{
                  bindingEnergy: {
                    label: "Binding Energy/Nucleon (MeV)",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="min-h-64 w-full"
              >
                <LineChart
                  accessibilityLayer
                  data={chartData}
                  margin={{
                    left: 12,
                    right: 12,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="massNumber"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.toString()}
                    label={{ value: "Mass Number (A)", position: "insideBottom", offset: -4 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    label={{ value: "Binding Energy/Nucleon (MeV)", angle: -90, position: "insideLeft" }}
                  />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Line
                    dataKey="bindingEnergyPerNucleon"
                    type="natural"
                    stroke="var(--color-bindingEnergy)"
                    strokeWidth={2}
                    dot={({ payload, ...props }) => {
                        // Highlight the calculated nuclide on the chart
                        if (payload.massNumber === massNumber && payload.bindingEnergyPerNucleon === bindingEnergyPerNucleon) {
                             return <circle {...props} r={5} fill="currentColor" stroke="white" strokeWidth={2} className="fill-primary" />;
                        }
                         // Optionally hide dots for other data points or style them differently
                        return null; // Hide dots for other data points
                    }}
                  />
                </LineChart>
              </ChartContainer>
               <p className="text-sm text-muted-foreground text-center mt-2">
                 The curve shows the average binding energy per nucleon. Higher values indicate greater stability. Iron-56 (Fe-56) is the most stable nucleus. Fusion occurs with light nuclei to move towards Fe-56, while fission occurs with heavy nuclei.
               </p>
          </div>


          {/* Explanations based on results */}
           {(massDefect !== undefined && bindingEnergy !== undefined && bindingEnergyPerNucleon !== undefined && massNumber !== undefined) && (
               <div className="space-y-2 mt-4">
                   <h3 className="text-xl font-semibold">Stability Analysis for {nuclideSymbol}-{massNumber}</h3>
                    {massNumber < 56 && (
                         <p className="text-sm text-muted-foreground">
                            {nuclideSymbol}-{massNumber} is relatively light. Nuclei lighter than Iron-56 can release energy through **nuclear fusion**, combining to form heavier, more stable nuclei closer to the peak of the binding energy curve.
                         </p>
                    )}
                    {massNumber > 56 && (
                        <p className="text-sm text-muted-foreground">
                             {nuclideSymbol}-{massNumber} is relatively heavy. Nuclei heavier than Iron-56 can release energy through **nuclear fission**, splitting into lighter, more stable nuclei closer to the peak of the binding energy curve.
                        </p>
                    )}
                    {massNumber === 56 && (
                         <p className="text-sm text-muted-foreground">
                            Iron-56 is at the peak of the binding energy curve, making it one of the most stable nuclei. It generally cannot release energy through either fusion or fission.
                         </p>
                    )}
               </div>
           )}

        </CardContent>
      </Card>
    </div>
  );
}
