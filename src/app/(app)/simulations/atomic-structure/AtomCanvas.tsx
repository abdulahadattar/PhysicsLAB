// src/components/atomic-structure/AtomCanvas.tsx
import React, { useRef, useEffect } from 'react';

interface AtomCanvasProps {
  protons: number;
  neutrons: number;
  electrons: number;
  electronShellRadii: number[];
  nucleusRadiusBase: number;
  particleRadius: number;
}

export const AtomCanvas: React.FC<AtomCanvasProps> = React.memo(({ protons, neutrons, electrons, electronShellRadii, nucleusRadiusBase, particleRadius }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    ctx.clearRect(0, 0, width, height);
    // Draw shells
    ctx.strokeStyle = "hsl(var(--muted-foreground) / 0.3)";
    ctx.lineWidth = 1;
    electronShellRadii.forEach(radius => {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.stroke();
    });
    // Draw electrons
    ctx.fillStyle = "hsl(var(--blue-500, 221 83% 53%))";
    let electronsToPlace = electrons;
    for (let i = 0; i < electronShellRadii.length && electronsToPlace > 0; i++) {
      const shellRadius = electronShellRadii[i];
      const maxElectronsInShell = 2 * (i + 1) * (i + 1);
      const electronsInThisShell = Math.min(electronsToPlace, maxElectronsInShell);
      for (let j = 0; j < electronsInThisShell; j++) {
        const angle = (j / electronsInThisShell) * 2 * Math.PI + (i * Math.PI/4);
        const ex = centerX + shellRadius * Math.cos(angle);
        const ey = centerY + shellRadius * Math.sin(angle);
        ctx.beginPath();
        ctx.arc(ex, ey, particleRadius * 0.8, 0, 2 * Math.PI);
        ctx.fill();
      }
      electronsToPlace -= electronsInThisShell;
    }
    // Draw nucleus
    const nucleusDisplayRadius = nucleusRadiusBase + Math.sqrt(protons + neutrons) * 1.5;
    ctx.beginPath();
    ctx.arc(centerX, centerY, nucleusDisplayRadius, 0, 2 * Math.PI);
    ctx.fillStyle = "hsl(var(--muted) / 0.2)";
    ctx.fill();
    ctx.strokeStyle = "hsl(var(--border) / 0.3)";
    ctx.stroke();
    // Draw protons
    ctx.fillStyle = "hsl(var(--red-500, 0 84% 60%))";
    for (let i = 0; i < protons; i++) {
      const angle = i * (Math.PI * (3 - Math.sqrt(5)));
      const radius = Math.sqrt(i / (protons + neutrons + 1)) * (nucleusDisplayRadius - particleRadius * 1.2);
      const px = centerX + radius * Math.cos(angle);
      const py = centerY + radius * Math.sin(angle);
      ctx.beginPath();
      ctx.arc(px, py, particleRadius, 0, 2 * Math.PI);
      ctx.fill();
    }
    // Draw neutrons
    ctx.fillStyle = "hsl(var(--gray-500, 220 9% 46%))";
    for (let i = 0; i < neutrons; i++) {
      const angle = (i + protons) * (Math.PI * (3 - Math.sqrt(5)));
      const radius = Math.sqrt((i + protons) / (protons + neutrons + 1)) * (nucleusDisplayRadius - particleRadius * 1.2);
      const nx = centerX + radius * Math.cos(angle);
      const ny = centerY + radius * Math.sin(angle);
      ctx.beginPath();
      ctx.arc(nx, ny, particleRadius, 0, 2 * Math.PI);
      ctx.fill();
    }
  }, [protons, neutrons, electrons, electronShellRadii, nucleusRadiusBase, particleRadius]);

  return (
    <div className="flex items-center">
      <canvas
        ref={canvasRef}
        width={250}
        height={250}
        className="bg-background rounded-md border border-input shadow-inner"
        role="img"
        aria-label={`Visual representation of an atom with ${protons} protons, ${neutrons} neutrons, and ${electrons} electrons.`}
      ></canvas>
      <div className="ml-4 text-xs text-muted-foreground hidden md:block">
        <div><span className="inline-block w-3 h-3 rounded-full mr-1" style={{background:'var(--proton-color, #ef4444)'}}></span>Proton</div>
        <div><span className="inline-block w-3 h-3 rounded-full mr-1" style={{background:'var(--neutron-color, #64748b)'}}></span>Neutron</div>
        <div><span className="inline-block w-3 h-3 rounded-full mr-1" style={{background:'var(--electron-color, #3b82f6)'}}></span>Electron</div>
      </div>
    </div>
  );
});
