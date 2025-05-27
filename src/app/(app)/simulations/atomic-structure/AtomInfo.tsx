// src/components/atomic-structure/AtomInfo.tsx
import React from 'react';
import { ElementInfo } from '@/lib/elements-data';
import { cn } from '@/lib/utils';

interface AtomInfoProps {
  elementInfo: ElementInfo;
  atomicNumber: number;
  massNumber: number;
  charge: number;
  neutrons: number;
  protons: number;
  dynamicElectronConfig: string;
  stabilityText: string | null;
}

export function AtomInfo({ elementInfo, atomicNumber, massNumber, charge, neutrons, protons, dynamicElectronConfig, stabilityText }: AtomInfoProps) {
  return (
    <div className="space-y-1.5 text-sm">
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
      {neutrons !== atomicNumber && protons > 1 && elementInfo.name !== "Unknown" && (
        <p className="text-xs text-muted-foreground">(This is an isotope of {elementInfo.name})</p>
      )}
    </div>
  );
}
