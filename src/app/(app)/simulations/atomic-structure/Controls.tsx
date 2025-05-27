// src/components/atomic-structure/Controls.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PlusCircle, MinusCircle, RefreshCw } from 'lucide-react';

interface ControlsProps {
  protons: number;
  neutrons: number;
  electrons: number;
  onChange: (type: 'protons' | 'neutrons' | 'electrons', delta: number) => void;
  onReset: () => void;
  maxProtons: number;
  maxNeutrons: number;
  maxElectrons: number;
}

export function Controls({ protons, neutrons, electrons, onChange, onReset, maxProtons, maxNeutrons, maxElectrons }: ControlsProps) {
  return (
    <fieldset>
      <legend className="sr-only">Atom Controls</legend>
      <div className="space-y-3">
        {/* Protons */}
        <div className="flex items-center justify-between">
          <Label htmlFor="protons" className="text-base">Protons: {protons}</Label>
          <div className="flex gap-1.5">
            <Button size="icon" variant="outline" onClick={() => onChange('protons', -1)} disabled={protons <= 1} aria-label="Remove proton">
              <MinusCircle className="h-5 w-5" />
            </Button>
            <Button size="icon" variant="outline" onClick={() => onChange('protons', 1)} disabled={protons >= maxProtons} aria-label="Add proton">
              <PlusCircle className="h-5 w-5" />
            </Button>
          </div>
        </div>
        {/* Neutrons */}
        <div className="flex items-center justify-between">
          <Label htmlFor="neutrons" className="text-base">Neutrons: {neutrons}</Label>
          <div className="flex gap-1.5">
            <Button size="icon" variant="outline" onClick={() => onChange('neutrons', -1)} disabled={neutrons <= 0} aria-label="Remove neutron">
              <MinusCircle className="h-5 w-5" />
            </Button>
            <Button size="icon" variant="outline" onClick={() => onChange('neutrons', 1)} disabled={neutrons >= maxNeutrons} aria-label="Add neutron">
              <PlusCircle className="h-5 w-5" />
            </Button>
          </div>
        </div>
        {/* Electrons */}
        <div className="flex items-center justify-between">
          <Label htmlFor="electrons" className="text-base">Electrons: {electrons}</Label>
          <div className="flex gap-1.5">
            <Button size="icon" variant="outline" onClick={() => onChange('electrons', -1)} disabled={electrons <= 0} aria-label="Remove electron">
              <MinusCircle className="h-5 w-5" />
            </Button>
            <Button size="icon" variant="outline" onClick={() => onChange('electrons', 1)} disabled={electrons >= maxElectrons} aria-label="Add electron">
              <PlusCircle className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <Button onClick={onReset} variant="secondary" className="w-full mt-3">
          <RefreshCw className="mr-2 h-4 w-4" /> Reset Atom (to Hydrogen)
        </Button>
      </div>
    </fieldset>
  );
}
