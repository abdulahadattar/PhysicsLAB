// src/components/atomic-structure/ElementSelector.tsx
import React from 'react';
import { ELEMENTS_DATA } from '@/lib/elements-data';

export function ElementSelector({ value, onChange }: { value: number, onChange: (atomicNumber: number) => void }) {
  return (
    <div>
      <label htmlFor="element-select" className="font-medium mr-2">Element:</label>
      <select
        id="element-select"
        className="border rounded px-2 py-1 text-base"
        value={value}
        onChange={e => onChange(Number(e.target.value))}
      >
        {Object.entries(ELEMENTS_DATA).map(([num, info]) => (
          <option key={num} value={num}>
            {info.symbol} - {info.name}
          </option>
        ))}
      </select>
    </div>
  );
}
