"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, HelpCircle, Atom as AtomIcon, PlusCircle, MinusCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { ELEMENTS_DATA, COMMON_ISOTOPES, ElementInfo, AUFBAU_SUBSHELLS } from '@/lib/elements-data';
import { debounce } from '@/lib/debounce';

// --- Element Data (Periodic Table) ---
const MAX_PROTONS = 118;
const MAX_NEUTRONS = 178;
const MAX_ELECTRONS = 118;

const NUCLEUS_RADIUS_BASE = 20;
const PARTICLE_RADIUS = 5; // For protons/neutrons in nucleus
const ELECTRON_SHELL_RADII = [45, 60, 75, 90, 105, 120, 135]; // 7 shells for all elements

// --- Utility: Dynamic Electron Configuration (aufbau principle, simplified) ---
function getElectronConfiguration(electronCount: number): string {
  let electrons = electronCount;
  let config = [];
  for (const sub of AUFBAU_SUBSHELLS) {
    if (electrons <= 0) break;
    const fill = Math.min(sub.max, electrons);
    config.push(`${sub.n}${sub.l}${fill}`);
    electrons -= fill;
  }
  return config.join(' ');
}

// --- Utility: Most Common Isotope Lookup (for stability indication) ---
function getStabilityText(protons: number, neutrons: number): string | null {
  if (!COMMON_ISOTOPES[protons]) return null;
  const common = COMMON_ISOTOPES[protons];
  if (neutrons === common) return 'This is the most common (stable) isotope.';
  if (Math.abs(neutrons - common) <= 2) return 'This is a less common but stable isotope.';
  return 'Likely radioactive/unstable isotope.';
}

// --- Element Selector Dropdown ---
function ElementSelector({ value, onChange }: { value: number, onChange: (atomicNumber: number) => void }) {
  return (
    <select
      className="border rounded px-2 py-1 text-base"
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      aria-label="Select element"
    >
      {Object.entries(ELEMENTS_DATA).map(([num, info]) => (
        <option key={num} value={num}>
          {info.symbol} - {info.name}
        </option>
      ))}
    </select>
  );
}

export default function AtomicStructureExplorerPage() {
  const [protons, setProtons] = useState(1);
  const [neutrons, setNeutrons] = useState(0);
  const [electrons, setElectrons] = useState(1);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const atomicNumber = useMemo(() => protons, [protons]);
  const massNumber = useMemo(() => protons + neutrons, [protons, neutrons]);
  const charge = useMemo(() => protons - electrons, [protons, electrons]);
  const elementInfo = useMemo(() => ELEMENTS_DATA[atomicNumber] || { symbol: "?", name: "Unknown" }, [atomicNumber]);
  // --- Element Selector Handler ---
  const handleElementSelect = (atomicNumber: number) => {
    setProtons(atomicNumber);
    setElectrons(atomicNumber);
    setNeutrons(COMMON_ISOTOPES[atomicNumber] ?? 0);
  };

  const handleParticleChange = (particleType: 'protons' | 'neutrons' | 'electrons', delta: number) => {
    switch (particleType) {
      case 'protons':
        setProtons(p => Math.max(1, Math.min(p + delta, MAX_PROTONS)));
        break;
      case 'neutrons':
        setNeutrons(n => Math.max(0, Math.min(n + delta, MAX_NEUTRONS)));
        break;
      case 'electrons':
        setElectrons(e => Math.max(0, Math.min(e + delta, MAX_ELECTRONS)));
        break;
    }
  };

  const resetAtom = () => {
    setProtons(1);
    setNeutrons(0);
    setElectrons(1);
  };

  const drawAtom = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // --- Draw Electron Shells (Simplified Bohr Model) ---
    ctx.strokeStyle = "hsl(var(--muted-foreground) / 0.3)";
    ctx.lineWidth = 1;
    ELECTRON_SHELL_RADII.forEach(radius => {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.stroke();
    });

    // --- Draw Electrons ---
    ctx.fillStyle = "hsl(var(--blue-500, 221 83% 53%))";
    let electronsToPlace = electrons;
    for (let i = 0; i < ELECTRON_SHELL_RADII.length && electronsToPlace > 0; i++) {
      const shellRadius = ELECTRON_SHELL_RADII[i];
      const maxElectronsInShell = 2 * (i + 1) * (i + 1); // 2n^2 rule
      const electronsInThisShell = Math.min(electronsToPlace, maxElectronsInShell);
      for (let j = 0; j < electronsInThisShell; j++) {
        const angle = (j / electronsInThisShell) * 2 * Math.PI + (i * Math.PI/4);
        const ex = centerX + shellRadius * Math.cos(angle);
        const ey = centerY + shellRadius * Math.sin(angle);
        ctx.beginPath();
        ctx.arc(ex, ey, PARTICLE_RADIUS * 0.8, 0, 2 * Math.PI);
        ctx.fill();
      }
      electronsToPlace -= electronsInThisShell;
    }

    // --- Draw Nucleus ---
    const nucleusDisplayRadius = NUCLEUS_RADIUS_BASE + Math.sqrt(protons + neutrons) * 1.5;
    
    // Optional nucleus background
    ctx.beginPath();
    ctx.arc(centerX, centerY, nucleusDisplayRadius, 0, 2 * Math.PI);
    ctx.fillStyle = "hsl(var(--muted) / 0.2)";
    ctx.fill();
    ctx.strokeStyle = "hsl(var(--border) / 0.3)";
    ctx.stroke();

    // Draw Protons
    ctx.fillStyle = "hsl(var(--red-500, 0 84% 60%))";
    for (let i = 0; i < protons; i++) {
      const angle = i * (Math.PI * (3 - Math.sqrt(5)));
      const radius = Math.sqrt(i / (protons + neutrons + 1)) * (nucleusDisplayRadius - PARTICLE_RADIUS * 1.2);
      const px = centerX + radius * Math.cos(angle);
      const py = centerY + radius * Math.sin(angle);
      ctx.beginPath();
      ctx.arc(px, py, PARTICLE_RADIUS, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Draw Neutrons
    ctx.fillStyle = "hsl(var(--gray-500, 220 9% 46%))";
    for (let i = 0; i < neutrons; i++) {
      const angle = (i + protons) * (Math.PI * (3 - Math.sqrt(5)));
      const radius = Math.sqrt((i + protons) / (protons + neutrons + 1)) * (nucleusDisplayRadius - PARTICLE_RADIUS * 1.2);
      const nx = centerX + radius * Math.cos(angle);
      const ny = centerY + radius * Math.sin(angle);
      ctx.beginPath();
      ctx.arc(nx, ny, PARTICLE_RADIUS, 0, 2 * Math.PI);
      ctx.fill();
    }
  }, [protons, neutrons, electrons]);

  const debouncedDrawAtom = useMemo(() => debounce(drawAtom, 50), [drawAtom]);
  useEffect(() => {
    debouncedDrawAtom();
  }, [debouncedDrawAtom, protons, neutrons, electrons]);

  const dynamicElectronConfig = useMemo(() => getElectronConfiguration(electrons), [electrons]);
  const stabilityText = useMemo(() => getStabilityText(protons, neutrons), [protons, neutrons]);

  return (
    <div className="space-y-6 p-2 md:p-4">
      <div className="flex justify-between items-center">
        <Button variant="outline" asChild size="sm">
          <Link href="/simulations">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Simulations
          </Link>
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8 md:h-9 md:w-9">
              <HelpCircle className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 text-sm">
            <h4 className="font-medium leading-none mb-2">Atomic Structure Explorer</h4>
            <p className="text-muted-foreground text-xs">
              - Use the +/- buttons or the dropdown to change the number of Protons, Neutrons, and Electrons.<br />
              - Observe how the Atomic Number, Mass Number, Element, and Charge change.<br />
              - The visual shows a simplified Bohr-like model.<br />
              - Electron configuration is calculated dynamically.<br />
              - Isotope stability is indicated below.
            </p>
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <span className="font-medium">Element:</span>
        <ElementSelector value={protons} onChange={handleElementSelect} />
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl flex items-center gap-2">
            <AtomIcon className="h-7 w-7 md:h-8 md:w-8 text-primary" />
            Atomic Structure Explorer
          </CardTitle>
          <CardDescription>
            Grade 9/10 - STBB. Build atoms by adding or removing protons, neutrons, and electrons.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            {/* Controls Column */}
            <div className="md:col-span-1 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Protons */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="protons" className="text-base">Protons: {protons}</Label>
                    <div className="flex gap-1.5">
                      <Button size="icon" variant="outline" onClick={() => handleParticleChange('protons', -1)} disabled={protons <= 1} aria-label="Remove proton">
                        <MinusCircle className="h-5 w-5" />
                      </Button>
                      <Button size="icon" variant="outline" onClick={() => handleParticleChange('protons', 1)} disabled={protons >= MAX_PROTONS} aria-label="Add proton">
                        <PlusCircle className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                  {/* Neutrons */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="neutrons" className="text-base">Neutrons: {neutrons}</Label>
                    <div className="flex gap-1.5">
                      <Button size="icon" variant="outline" onClick={() => handleParticleChange('neutrons', -1)} disabled={neutrons <= 0} aria-label="Remove neutron">
                        <MinusCircle className="h-5 w-5" />
                      </Button>
                      <Button size="icon" variant="outline" onClick={() => handleParticleChange('neutrons', 1)} disabled={neutrons >= MAX_NEUTRONS} aria-label="Add neutron">
                        <PlusCircle className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                  {/* Electrons */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="electrons" className="text-base">Electrons: {electrons}</Label>
                    <div className="flex gap-1.5">
                      <Button size="icon" variant="outline" onClick={() => handleParticleChange('electrons', -1)} disabled={electrons <= 0} aria-label="Remove electron">
                        <MinusCircle className="h-5 w-5" />
                      </Button>
                      <Button size="icon" variant="outline" onClick={() => handleParticleChange('electrons', 1)} disabled={electrons >= MAX_ELECTRONS} aria-label="Add electron">
                        <PlusCircle className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                  <Button onClick={resetAtom} variant="secondary" className="w-full mt-3">
                    <RefreshCw className="mr-2 h-4 w-4" /> Reset Atom (to Hydrogen)
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">Atom Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1.5 text-sm">
                  <p>Element: <span className="font-semibold">{elementInfo.name} ({elementInfo.symbol})</span></p>
                  <p>Atomic Number (Z): <span className="font-semibold">{atomicNumber}</span></p>
                  <p>Mass Number (A): <span className="font-semibold">{massNumber}</span></p>
                  <p>Atomic Mass: <span className="font-semibold">{elementInfo.atomicMass || '—'}</span></p>
                  <p>Group: <span className="font-semibold">{elementInfo.group || '—'}</span></p>
                  <p>Period: <span className="font-semibold">{elementInfo.period || '—'}</span></p>
                  <p>Category: <span className="font-semibold">{elementInfo.category || '—'}</span></p>
                  <p>Electron Configuration (dynamic): <span className="font-mono">{dynamicElectronConfig}</span></p>
                  <p>Electron Configuration (ground state): <span className="font-mono">{elementInfo.electronConfiguration || '—'}</span></p>
                  <p>Overall Charge: 
                    <span className={cn("font-semibold", charge > 0 ? "text-red-600" : charge < 0 ? "text-blue-600" : "")}>{charge === 0 ? "0 (Neutral)" : `${charge > 0 ? '+' : ''}${charge}`}</span>
                  </p>
                  {stabilityText && (
                    <p className="text-xs" style={{ color: stabilityText.includes('unstable') ? '#dc2626' : stabilityText.includes('less') ? '#f59e42' : '#16a34a' }}>{stabilityText}</p>
                  )}
                  {neutrons !== atomicNumber && protons > 1 && ELEMENTS_DATA[atomicNumber]?.name !== "Unknown" && (
                    <p className="text-xs text-muted-foreground">(This is an isotope of {ELEMENTS_DATA[atomicNumber]?.name})</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Visualization Column */}
            <div className="md:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">Atom Visualizer (Simplified Model)</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center p-2 min-h-[300px] md:min-h-[350px]">
                  <canvas 
                    ref={canvasRef} 
                    width="250" 
                    height="250" 
                    className="bg-background rounded-md border border-input shadow-inner"
                    role="img"
                    aria-label={`Visual representation of an atom with ${protons} protons, ${neutrons} neutrons, and ${electrons} electrons.`}
                  ></canvas>
                  <div className="ml-4 text-xs text-muted-foreground hidden md:block">
                    <div><span className="inline-block w-3 h-3 rounded-full mr-1" style={{background:'#ef4444'}}></span>Proton</div>
                    <div><span className="inline-block w-3 h-3 rounded-full mr-1" style={{background:'#64748b'}}></span>Neutron</div>
                    <div><span className="inline-block w-3 h-3 rounded-full mr-1" style={{background:'#3b82f6'}}></span>Electron</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground">
            Note: This is a simplified model for educational purposes. Electron shells are illustrative. Nucleus particle packing is conceptual.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
