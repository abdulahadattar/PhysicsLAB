// src/app/(app)/simulations/atomic-structure-canvas/page.tsx
"use client";
import { AtomCanvas } from '@/app/(app)/simulations/atomic-structure/AtomCanvas';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function AtomicStructureSimulationPage() {
  // Simple state for demo; could be expanded for interactive controls
  const [protons, setProtons] = useState(6);
  const [neutrons, setNeutrons] = useState(6);
  const [electrons, setElectrons] = useState(6);
  const electronShellRadii = [40, 70, 100, 130];
  const nucleusRadiusBase = 18;
  const particleRadius = 7;

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle>Atomic Structure Simulation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <AtomCanvas
              protons={protons}
              neutrons={neutrons}
              electrons={electrons}
              electronShellRadii={electronShellRadii}
              nucleusRadiusBase={nucleusRadiusBase}
              particleRadius={particleRadius}
            />
            <div className="flex flex-col gap-2 w-full max-w-xs">
              <label className="font-medium">Protons
                <Input type="number" min={1} max={20} value={protons} onChange={e => setProtons(Number(e.target.value))} />
              </label>
              <label className="font-medium">Neutrons
                <Input type="number" min={0} max={20} value={neutrons} onChange={e => setNeutrons(Number(e.target.value))} />
              </label>
              <label className="font-medium">Electrons
                <Input type="number" min={1} max={20} value={electrons} onChange={e => setElectrons(Number(e.target.value))} />
              </label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
