// src/components/simulations/BlackbodyRadiationSim.tsx
"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input"; // Using Input to display calculated values

interface BlackbodyRadiationSimProps {
  // Define any props if needed
}

// Physics constants (using standard SI units)
const h = 6.626e-34; // Planck's constant (Joule-seconds)
const c = 2.998e8;   // Speed of light (meters per second)
const k = 1.381e-23; // Boltzmann constant (Joules per Kelvin)
const b = 2.898e-3;  // Wien's displacement constant (meter-Kelvin)

// Planck's Law function: Returns spectral radiance (Intensity per unit area per unit solid angle per unit wavelength)
// B(lambda, T) = (2*h*c^2 / lambda^5) * (1 / (exp(h*c / (lambda*k*T)) - 1))
const plancksLaw = (lambda: number, T: number): number => {
    if (lambda <= 0 || T <= 0) return 0;
    const lambda_m = lambda * 1e-9; // Convert wavelength from nm to meters
    const exponent = (h * c) / (lambda_m * k * T);
    if (exponent > 100) return 0; // Avoid overflow for large exponents
    return (2 * h * c * c) / Math.pow(lambda_m, 5) / (Math.exp(exponent) - 1);
};

// Rayleigh-Jeans Law function: B(lambda, T) = (2*c*k*T) / lambda^4
const rayleighJeansLaw = (lambda: number, T: number): number => {
    if (lambda <= 0 || T <= 0) return 0;
     const lambda_m = lambda * 1e-9; // Convert wavelength from nm to meters
     return (2 * c * k * T) / Math.pow(lambda_m, 4);
};


// Wien's Displacement Law function: lambda_max = b / T
const wiensLaw = (T: number): number => {
    if (T <= 0) return 0;
    return (b / T) * 1e9; // Convert peak wavelength from meters to nm
};

const BlackbodyRadiationSim: React.FC<BlackbodyRadiationSimProps> = () => {
    const [temperature, setTemperature] = useState<number>(3000);
    const [peakWavelength, setPeakWavelength] = useState<number>(wiensLaw(3000));

    const svgRef = useRef<SVGSVGElement>(null);
    const graphWidth = 600;
    const graphHeight = 400;
    const padding = 40;

    // Wavelength range for the graph in nm
    const minWavelength = 1;
    const maxWavelength = 2000; // Extend range to see curves clearly

    // Recalculate peak wavelength when temperature changes
    useEffect(() => {
        setPeakWavelength(wiensLaw(temperature));
    }, [temperature]);

    // Calculate the maximum intensity for scaling the graph
    const maxIntensity = useMemo(() => {
         // Find max intensity by sampling Planck's law around the peak wavelength
        const peakLambda = wiensLaw(temperature);
        let max = plancksLaw(peakLambda, temperature);

        // Also check a few points around the peak and a high temperature reference
         for(let i = -200; i <= 200; i += 50) {
             max = Math.max(max, plancksLaw(peakLambda + i, temperature));
         }
        // Consider a high temp value to set a reasonable max Y scale
        max = Math.max(max, plancksLaw(wiensLaw(6000), 6000) * 1.2); // Add some buffer


        return Math.max(max, 1); // Ensure max is at least 1
    }, [temperature]); // Recalculate when temperature changes

    // Generate points for the Planck's Law curve
    const planckPoints = useMemo(() => {
        const points = [];
        for (let lambda = minWavelength; lambda <= maxWavelength; lambda += 5) { // Sample points
            const intensity = plancksLaw(lambda, temperature);
             // Scale to SVG coordinates
            const x = padding + (lambda - minWavelength) / (maxWavelength - minWavelength) * (graphWidth - 2 * padding);
            const y = graphHeight - padding - (intensity / maxIntensity) * (graphHeight - 2 * padding);
            points.push(`${x},${y}`);
        }
        return points.join(' ');
    }, [temperature, maxIntensity]);

     // Generate points for the Rayleigh-Jeans Law curve
     const rayleighJeansPoints = useMemo(() => {
        const points = [];
        for (let lambda = minWavelength + 1; lambda <= maxWavelength; lambda += 5) { // Start slightly above 0 to avoid division by zero
            const intensity = rayleighJeansLaw(lambda, temperature);
             // Scale to SVG coordinates
            const x = padding + (lambda - minWavelength) / (maxWavelength - minWavelength) * (graphWidth - 2 * padding);
            const y = graphHeight - padding - (intensity / maxIntensity) * (graphHeight - 2 * padding);
            points.push(`${x},${y}`);
        }
        return points.join(' ');
    }, [temperature, maxIntensity]);

    const handleReset = () => {
        setTemperature(3000);
    };

    // SVG Axis and Label calculations
    const xScale = (lambda: number) => padding + (lambda - minWavelength) / (maxWavelength - minWavelength) * (graphWidth - 2 * padding);
    const yScale = (intensity: number) => graphHeight - padding - (intensity / maxIntensity) * (graphHeight - 2 * padding);

    const wavelengthLabels = [minWavelength, maxWavelength / 4, maxWavelength / 2, maxWavelength * 3 / 4, maxWavelength];
    // Dynamically determine intensity labels based on maxIntensity
    const intensityLabels = useMemo(() => {
         const numLabels = 5;
         const labels = [];
         for(let i = 0; i <= numLabels; i++) {
             labels.push((maxIntensity / numLabels) * i);
         }
         return labels;
    }, [maxIntensity]);


    return (
        <Card className="w-full max-w-4xl mx-auto shadow-lg">
            <CardHeader>
                <CardTitle>Blackbody Radiation Simulation</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-6">
                {/* Controls Panel */}
                <div className="md:w-1/3 space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="temperature">Temperature (K): {temperature}</Label>
                        <Slider
                            id="temperature"
                            min={500}
                            max={10000}
                            step={50}
                            value={[temperature]}
                            onValueChange={(val) => setTemperature(val[0])}
                        />
                    </div>

                    <div className="space-y-2">
                         <Label htmlFor="peak-wavelength">Peak Wavelength (nm):</Label>
                         <Input
                             id="peak-wavelength"
                             value={peakWavelength.toFixed(2)}
                             readOnly
                             className="font-mono"
                         />
                    </div>

                    <Button onClick={handleReset} variant="outline">Reset</Button>
                </div>

                {/* Simulation Area - Graph */}
                <div className="md:w-2/3">
                    <svg ref={svgRef} width={graphWidth} height={graphHeight} viewBox={`0 0 ${graphWidth} ${graphHeight}`}>
                        {/* Axes */}
                        <line x1={padding} y1={graphHeight - padding} x2={graphWidth - padding} y2={graphHeight - padding} stroke="currentColor" /> {/* X-axis */}
                        <line x1={padding} y1={graphHeight - padding} x2={padding} y2={padding} stroke="currentColor" /> {/* Y-axis */}

                        {/* X-axis labels (Wavelength) */}
                        {wavelengthLabels.map((lambda, index) => (
                            <text
                                key={index}
                                x={xScale(lambda)}
                                y={graphHeight - padding + 15}
                                textAnchor={index === 0 ? "start" : index === wavelengthLabels.length - 1 ? "end" : "middle"}
                                fontSize="12"
                                fill="currentColor"
                            >
                                {lambda}
                            </text>
                        ))}
                        <text x={graphWidth / 2} y={graphHeight - padding + 35} textAnchor="middle" fontSize="14" fill="currentColor">
                            Wavelength (nm)
                        </text>

                         {/* Y-axis labels (Intensity) - Simplified for display */}
                         {intensityLabels.map((intensity, index) => (
                             <text
                                 key={index}
                                 x={padding - 10}
                                 y={yScale(intensity)}
                                 textAnchor="end"
                                 dominantBaseline="middle"
                                 fontSize="12"
                                 fill="currentColor"
                             >
                                 {(intensity / maxIntensity).toFixed(1)} {/* Display as fraction of max */}
                             </text>
                         ))}
                         <text
                            x={padding - 30}
                            y={graphHeight / 2}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize="14"
                            fill="currentColor"
                            transform={`rotate(-90, ${padding - 30}, ${graphHeight / 2})`}
                         >
                            Relative Intensity
                         </text>


                        {/* Planck's Law Curve */}
                        <polyline
                            fill="none"
                            stroke="hsl(var(--primary))"
                            strokeWidth="2"
                            points={planckPoints}
                        />

                         {/* Rayleigh-Jeans Law Curve */}
                         <polyline
                            fill="none"
                            stroke="hsl(var(--destructive))"
                            strokeWidth="1"
                            points={rayleighJeansPoints}
                            strokeDasharray="4"
                        />

                        {/* Peak Wavelength Indicator (Wien's Law) */}
                         {peakWavelength > minWavelength && peakWavelength < maxWavelength && (
                             <>
                                 <line
                                     x1={xScale(peakWavelength)}
                                     y1={graphHeight - padding}
                                     x2={xScale(peakWavelength)}
                                     y2={yScale(plancksLaw(peakWavelength, temperature))}
                                     stroke="hsl(var(--muted-foreground))"
                                     strokeDasharray="4"
                                 />
                                  <circle
                                      cx={xScale(peakWavelength)}
                                      y={yScale(plancksLaw(peakWavelength, temperature))}
                                      r="4"
                                      fill="hsl(var(--muted-foreground))"
                                  />
                             </>
                         )}

                         {/* Legend */}
                         <g transform={`translate(${graphWidth - padding - 120}, ${padding + 20})`}>
                             <rect x="0" y="0" width="110" height="50" fill="hsl(var(--background))" stroke="currentColor" rx="4"/>
                             <line x1="10" y1="15" x2="30" y2="15" stroke="hsl(var(--primary))" strokeWidth="2"/>
                             <text x="40" y="18" fontSize="12" fill="currentColor">Planck's Law</text>
                             <line x1="10" y1="35" x2="30" y2="35" stroke="hsl(var(--destructive))" strokeWidth="1" strokeDasharray="4"/>
                             <text x="40" y="38" fontSize="12" fill="currentColor">Rayleigh-Jeans</text>
                         </g>


                    </svg>
                     <p className="text-center text-sm text-muted-foreground mt-2">
                        Graph shows spectral radiance (relative intensity) vs. wavelength.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};

export default BlackbodyRadiationSim;