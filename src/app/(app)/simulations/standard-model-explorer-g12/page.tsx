// src/app/(app)/simulations/standard-model-explorer-g12/page.tsx
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, HelpCircle, BrainCircuit, X } from "lucide-react";
import Link from "next/link";
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { cn } from '@/lib/utils';

interface ParticleProperty {
  label: string;
  value: string | number;
  unit?: string;
}

interface ParticleData {
  id: string;
  name: string;
  symbol: string;
  category: 'Quark' | 'Lepton' | 'Gauge Boson' | 'Scalar Boson';
  generation?: 1 | 2 | 3;
  properties: ParticleProperty[];
  description: string;
  colorClass: string;
  textColorClass?: string;
  gridArea: string;
  interactions?: ('Strong' | 'Weak' | 'Electromagnetic')[];
}

const STANDARD_MODEL_PARTICLES: ParticleData[] = [
  { id: "u", name: "Up Quark", symbol: "u", category: "Quark", generation: 1, gridArea: "q1", colorClass: "bg-purple-500", textColorClass: "text-purple-50", properties: [{ label: "Charge", value: "+2/3", unit: "e" }, { label: "Spin", value: "1/2" }, { label: "Mass", value: "~2.2", unit: "MeV/c²" }], description: "A fundamental constituent of protons and neutrons.", interactions: ["Strong", "Weak", "Electromagnetic"] },
  { id: "d", name: "Down Quark", symbol: "d", category: "Quark", generation: 1, gridArea: "q2", colorClass: "bg-purple-500", textColorClass: "text-purple-50", properties: [{ label: "Charge", value: "-1/3", unit: "e" }, { label: "Spin", value: "1/2" }, { label: "Mass", value: "~4.7", unit: "MeV/c²" }], description: "A fundamental constituent of protons and neutrons.", interactions: ["Strong", "Weak", "Electromagnetic"] },
  { id: "c", name: "Charm Quark", symbol: "c", category: "Quark", generation: 2, gridArea: "q3", colorClass: "bg-purple-600", textColorClass: "text-purple-50", properties: [{ label: "Charge", value: "+2/3", unit: "e" }, { label: "Spin", value: "1/2" }, { label: "Mass", value: "~1.27", unit: "GeV/c²" }], description: "A heavier version of the up quark.", interactions: ["Strong", "Weak", "Electromagnetic"] },
  { id: "s", name: "Strange Quark", symbol: "s", category: "Quark", generation: 2, gridArea: "q4", colorClass: "bg-purple-600", textColorClass: "text-purple-50", properties: [{ label: "Charge", value: "-1/3", unit: "e" }, { label: "Spin", value: "1/2" }, { label: "Mass", value: "~95", unit: "MeV/c²" }], description: "A heavier version of the down quark.", interactions: ["Strong", "Weak", "Electromagnetic"] },
  { id: "t", name: "Top Quark", symbol: "t", category: "Quark", generation: 3, gridArea: "q5", colorClass: "bg-purple-700", textColorClass: "text-purple-50", properties: [{ label: "Charge", value: "+2/3", unit: "e" }, { label: "Spin", value: "1/2" }, { label: "Mass", value: "~173", unit: "GeV/c²" }], description: "The most massive elementary particle discovered.", interactions: ["Strong", "Weak", "Electromagnetic"] },
  { id: "b", name: "Bottom Quark", symbol: "b", category: "Quark", generation: 3, gridArea: "q6", colorClass: "bg-purple-700", textColorClass: "text-purple-50", properties: [{ label: "Charge", value: "-1/3", unit: "e" }, { label: "Spin", value: "1/2" }, { label: "Mass", value: "~4.18", unit: "GeV/c²" }], description: "A very heavy quark.", interactions: ["Strong", "Weak", "Electromagnetic"] },
  { id: "e", name: "Electron", symbol: "e⁻", category: "Lepton", generation: 1, gridArea: "l1", colorClass: "bg-green-500", textColorClass: "text-green-50", properties: [{ label: "Charge", value: "-1", unit: "e" }, { label: "Spin", value: "1/2" }, { label: "Mass", value: "0.511", unit: "MeV/c²" }], description: "A stable lepton orbiting the nucleus of atoms.", interactions: ["Weak", "Electromagnetic"] },
  { id: "ve", name: "Electron Neutrino", symbol: "ν<sub>e</sub>", category: "Lepton", generation: 1, gridArea: "l2", colorClass: "bg-green-500", textColorClass: "text-green-50", properties: [{ label: "Charge", value: "0", unit: "e" }, { label: "Spin", value: "1/2" }, { label: "Mass", value: "< 1", unit: "eV/c²" }], description: "A very light neutral particle that interacts weakly.", interactions: ["Weak"] },
  { id: "mu", name: "Muon", symbol: "μ⁻", category: "Lepton", generation: 2, gridArea: "l3", colorClass: "bg-green-600", textColorClass: "text-green-50", properties: [{ label: "Charge", value: "-1", unit: "e" }, { label: "Spin", value: "1/2" }, { label: "Mass", value: "105.7", unit: "MeV/c²" }], description: "A heavier, unstable version of the electron.", interactions: ["Weak", "Electromagnetic"] },
  { id: "vmu", name: "Muon Neutrino", symbol: "ν<sub>μ</sub>", category: "Lepton", generation: 2, gridArea: "l4", colorClass: "bg-green-600", textColorClass: "text-green-50", properties: [{ label: "Charge", value: "0", unit: "e" }, { label: "Spin", value: "1/2" }, { label: "Mass", value: "< 0.17", unit: "MeV/c²" }], description: "Associated with the muon.", interactions: ["Weak"] },
  { id: "tau", name: "Tau", symbol: "τ⁻", category: "Lepton", generation: 3, gridArea: "l5", colorClass: "bg-green-700", textColorClass: "text-green-50", properties: [{ label: "Charge", value: "-1", unit: "e" }, { label: "Spin", value: "1/2" }, { label: "Mass", value: "1.777", unit: "GeV/c²" }], description: "An even heavier, unstable version of the electron.", interactions: ["Weak", "Electromagnetic"] },
  { id: "vtau", name: "Tau Neutrino", symbol: "ν<sub>τ</sub>", category: "Lepton", generation: 3, gridArea: "l6", colorClass: "bg-green-700", textColorClass: "text-green-50", properties: [{ label: "Charge", value: "0", unit: "e" }, { label: "Spin", value: "1/2" }, { label: "Mass", value: "< 18.2", unit: "MeV/c²" }], description: "Associated with the tau lepton.", interactions: ["Weak"] },
  { id: "photon", name: "Photon", symbol: "γ", category: "Gauge Boson", gridArea: "b1", colorClass: "bg-red-500", textColorClass: "text-red-50", properties: [{ label: "Charge", value: "0", unit: "e" }, { label: "Spin", value: "1" }, { label: "Mass", value: "0", unit: "MeV/c²" }], description: "Mediates the electromagnetic force.", interactions: ["Electromagnetic"] },
  { id: "gluon", name: "Gluon", symbol: "g", category: "Gauge Boson", gridArea: "b2", colorClass: "bg-red-500", textColorClass: "text-red-50", properties: [{ label: "Charge", value: "0", unit: "e" }, { label: "Spin", value: "1" }, { label: "Mass", value: "0", unit: "MeV/c²" }], description: "Mediates the strong nuclear force.", interactions: ["Strong"] },
  { id: "W", name: "W Boson", symbol: "W<sup>±</sup>", category: "Gauge Boson", gridArea: "b3", colorClass: "bg-red-600", textColorClass: "text-red-50", properties: [{ label: "Charge", value: "±1", unit: "e" }, { label: "Spin", value: "1" }, { label: "Mass", value: "80.4", unit: "GeV/c²" }], description: "Mediates the weak nuclear force (charged current).", interactions: ["Weak"] },
  { id: "Z", name: "Z Boson", symbol: "Z<sup>0</sup>", category: "Gauge Boson", gridArea: "b4", colorClass: "bg-red-600", textColorClass: "text-red-50", properties: [{ label: "Charge", value: "0", unit: "e" }, { label: "Spin", value: "1" }, { label: "Mass", value: "91.2", unit: "GeV/c²" }], description: "Mediates the weak nuclear force (neutral current).", interactions: ["Weak"] },
  { id: "higgs", name: "Higgs Boson", symbol: "H<sup>0</sup>", category: "Scalar Boson", gridArea: "h1", colorClass: "bg-yellow-500", textColorClass: "text-yellow-900", properties: [{ label: "Charge", value: "0", unit: "e" }, { label: "Spin", value: "0" }, { label: "Mass", value: "~125", unit: "GeV/c²" }], description: "Associated with the Higgs field, gives mass to fundamental particles." },
];

export default function StandardModelExplorerG12Page() {
  const [selectedParticle, setSelectedParticle] = useState<ParticleData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleParticleClick = (particle: ParticleData) => {
    setSelectedParticle(particle);
    setIsModalOpen(true);
  };

  const ParticleCard: React.FC<{ particle: ParticleData }> = ({ particle }) => (
    <Button
      variant="outline"
      className={cn(
        "h-24 w-full md:h-28 flex flex-col items-center justify-center p-2 text-center shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200",
        particle.colorClass,
        particle.textColorClass || "text-foreground"
      )}
      style={{ gridArea: particle.gridArea }}
      onClick={() => handleParticleClick(particle)}
      aria-label={`Select ${particle.name} particle`}
    >
      <span className="text-2xl md:text-3xl font-bold" dangerouslySetInnerHTML={{ __html: particle.symbol }} />
      <span className="text-xs md:text-sm mt-1 truncate">{particle.name}</span>
    </Button>
  );

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
                <Button variant="outline" size="icon" className="h-8 w-8 md:h-9 md:w-9"><HelpCircle className="h-4 w-4 md:h-5 md:w-5"/></Button>
            </PopoverTrigger>
             <PopoverContent className="w-80 text-sm">
                <h4 className="font-medium leading-none mb-2">Standard Model Explorer</h4>
                <p className="text-muted-foreground text-xs">
                   Click on any particle in the chart to view its properties, description, and the fundamental forces it interacts with.
                   The chart categorizes fundamental particles into Quarks, Leptons, Gauge Bosons (force carriers), and the Higgs Boson.
                </p>
            </PopoverContent>
        </Popover>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl flex items-center gap-2">
            <BrainCircuit className="h-7 w-7 md:h-8 md:w-8 text-primary" />
            The Standard Model of Particle Physics
          </CardTitle>
          <CardDescription>
            STBB Aligned: Unit 8 - Fundamental Particles. Click on a particle to learn more.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div 
            className="grid gap-2 md:gap-3 p-2 md:p-4 min-w-[700px] md:min-w-0"
            style={{
              gridTemplateAreas: `
                "qlabel qlabel .  blabel blabel"
                "q1     q3     q5 b1     b2"
                "q2     q4     q6 b3     b4"
                "llabel llabel .  hlabel ."
                "l1     l3     l5 h1     ."
                "l2     l4     l6 .      ."
              `,
              gridTemplateColumns: "repeat(5, minmax(100px, 1fr))",
              gridTemplateRows: "auto repeat(5, minmax(100px, auto))",
            }}
          >
            {/* Labels for sections */}
            <div style={{ gridArea: 'qlabel' }} className="flex items-center justify-center text-lg font-semibold text-purple-700 dark:text-purple-300 col-span-2">Quarks</div>
            <div style={{ gridArea: 'llabel' }} className="flex items-center justify-center text-lg font-semibold text-green-700 dark:text-green-300 col-span-2">Leptons</div>
            <div style={{ gridArea: 'blabel' }} className="flex items-center justify-center text-lg font-semibold text-red-700 dark:text-red-300 col-span-2">Gauge Bosons</div>
            <div style={{ gridArea: 'hlabel' }} className="flex items-center justify-center text-lg font-semibold text-yellow-600 dark:text-yellow-400">Scalar Boson</div>

            {STANDARD_MODEL_PARTICLES.map(p => <ParticleCard key={p.id} particle={p} />)}
          </div>
        </CardContent>
        <CardFooter>
            <p className="text-xs text-muted-foreground">
                This diagram shows the fundamental particles currently known. Quarks and Leptons are fermions (spin 1/2), while Gauge Bosons (spin 1) mediate forces. The Higgs Boson (spin 0) is related to the Higgs field.
            </p>
        </CardFooter>
      </Card>

      {selectedParticle && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className={cn("text-2xl flex items-center", selectedParticle.colorClass, selectedParticle.textColorClass || "text-primary-foreground", "p-2 -m-2 rounded-t-lg")}>                <span dangerouslySetInnerHTML={{ __html: selectedParticle.symbol}} className="mr-3 text-3xl font-mono"/> {selectedParticle.name}
              </DialogTitle>
              <DialogDescription className="pt-2">
                Category: {selectedParticle.category}
                {selectedParticle.generation && `, Generation: ${selectedParticle.generation}`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2 max-h-[60vh] overflow-y-auto text-sm">
              <p>{selectedParticle.description}</p>
              <div>
                <h4 className="font-semibold mb-1">Properties:</h4>
                <ul className="list-disc list-inside pl-4 space-y-0.5 text-xs">
                  {selectedParticle.properties.map(prop => (
                    <li key={prop.label}><strong>{prop.label}:</strong> {prop.value} {prop.unit || ""}</li>
                  ))}
                </ul>
              </div>
              {selectedParticle.interactions && selectedParticle.interactions.length > 0 && (
                <div>
                    <h4 className="font-semibold mb-1">Interacts via:</h4>
                    <div className="flex flex-wrap gap-1.5">
                        {selectedParticle.interactions.map(force => (
                            <span key={force} className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground">
                                {force}
                            </span>
                        ))}
                    </div>
                </div>
              )}
            </div>
            <DialogClose asChild>
                <Button type="button" variant="outline" className="mt-4 w-full">Close</Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
