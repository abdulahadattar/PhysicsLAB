"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input"; // Using Input for numerical input
import { Play, Pause, RotateCcw } from "lucide-react";

// Physical constants (using approximate values for simplicity at this level)
const h = 6.626e-34; // Planck's constant (J s)
const c = 3.000e8; // Speed of light (m/s)
const m_e = 9.109e-31; // Electron rest mass (kg)
const eV_to_J = 1.602e-19; // Conversion from eV to Joules

// Compton wavelength of the electron (h / (m_e * c)) in meters
const lambda_c = h / (m_e * c); // Approximately 2.43e-12 meters

// Convert energy from keV to Joules
const energy_keV_to_J = (energy_keV: number) => energy_keV * 1000 * eV_to_J;

// Calculate wavelength from energy (in J)
const energy_J_to_wavelength_m = (energy_J: number) => h * c / energy_J;

// Calculate Compton scattered wavelength (in meters)
const calculateScatteredWavelength = (incidentWavelength_m: number, scatteringAngle_rad: number) => {
  return incidentWavelength_m + lambda_c * (1 - Math.cos(scatteringAngle_rad));
};

// Convert wavelength from meters to picometers
const wavelength_m_to_pm = (wavelength_m: number) => wavelength_m * 1e12;

// Convert angle from degrees to radians
const degrees_to_radians = (degrees: number) => degrees * Math.PI / 180;

// Calculate recoiling electron kinetic energy (in Joules)
const calculateElectronKineticEnergy_J = (incidentEnergy_J: number, scatteredEnergy_J: number) => {
  return incidentEnergy_J - scatteredEnergy_J;
};

interface PhotonState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  wavelength: number; // in pm
}

interface ElectronState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  kineticEnergy: number; // in keV
}

const ComptonEffectSim: React.FC = () => {
  const [incidentEnergyKeV, setIncidentEnergyKeV] = useState(50); // in keV
  const [scatteringAngleDeg, setScatteringAngleDeg] = useState(45); // in degrees
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationTime, setAnimationTime] = useState(0); // time in animation units

  const [incidentWavelengthPm, setIncidentWavelengthPm] = useState(0);
  const [scatteredWavelengthPm, setScatteredWavelengthPm] = useState(0);
  const [wavelengthShiftPm, setWavelengthShiftPm] = useState(0);
  const [electronKineticEnergyKeV, setElectronKineticEnergyKeV] = useState(0);

  const animationFrameId = useRef<number | null>(null);
  const startTime = useRef<number | null>(null);
  const electronRestPosition = { x: 200, y: 150 }; // Position of the stationary electron in SVG coordinates

  const [photonState, setPhotonState] = useState<PhotonState | null>(null);
  const [electronState, setElectronState] = useState<ElectronState | null>(null);
  const [isCollisionOccurred, setIsCollisionOccurred] = useState(false);

  // Recalculate values whenever energy or angle changes
  useEffect(() => {
    const incidentEnergyJ = energy_keV_to_J(incidentEnergyKeV);
    const incidentWavelengthM = energy_J_to_wavelength_m(incidentEnergyJ);
    const incidentWavelengthPm = wavelength_m_to_pm(incidentWavelengthM);
    setIncidentWavelengthPm(incidentWavelengthPm);

    const scatteringAngleRad = degrees_to_radians(scatteringAngleDeg);
    const scatteredWavelengthM = calculateScatteredWavelength(incidentWavelengthM, scatteringAngleRad);
    const scatteredWavelengthPm = wavelength_m_to_pm(scatteredWavelengthM);
    setScatteredWavelengthPm(scatteredWavelengthPm);

    const wavelengthShiftPm = scatteredWavelengthPm - incidentWavelengthPm;
    setWavelengthShiftPm(wavelengthShiftPm);

    // Calculate scattered energy to find electron energy
    const scatteredEnergyJ = h * c / scatteredWavelengthM;
    const electronKineticEnergyJ = calculateElectronKineticEnergy_J(incidentEnergyJ, scatteredEnergyJ);
    const electronKineticEnergyKeV = electronKineticEnergyJ / (1000 * eV_to_J);
    setElectronKineticEnergyKeV(electronKineticEnergyKeV);

    // Reset animation state on parameter change
    resetSimulation();

  }, [incidentEnergyKeV, scatteringAngleDeg]);

  const resetSimulation = useCallback(() => {
    cancelAnimationFrame(animationFrameId.current!);
    setIsPlaying(false);
    setAnimationTime(0);
    setIsCollisionOccurred(false);
    // Initial state: photon approaching electron
    setPhotonState({
      x: 0, // Starting off-screen left
      y: electronRestPosition.y,
      vx: 100, // Constant speed for visualization
      vy: 0,
      wavelength: incidentWavelengthPm,
    });
    // Initial state: electron at rest
    setElectronState({
      x: electronRestPosition.x,
      y: electronRestPosition.y,
      vx: 0,
      vy: 0,
      kineticEnergy: 0,
    });
    startTime.current = null;
  }, [incidentWavelengthPm, electronRestPosition.x, electronRestPosition.y]);

  useEffect(() => {
    resetSimulation(); // Initial reset when component mounts
  }, [resetSimulation]);


  // Simple animation update function
  const updateAnimation = useCallback((deltaTime: number) => {
    setAnimationTime(prevTime => prevTime + deltaTime);

    setPhotonState(prev => {
      if (!prev) return null;

      let nextX = prev.x + prev.vx * deltaTime;
      let nextY = prev.y + prev.vy * deltaTime;

      // Check for collision (simple x-position check for now)
      if (nextX >= electronRestPosition.x && !isCollisionOccurred) {
        setIsCollisionOccurred(true);
        nextX = electronRestPosition.x; // Stop at collision point for a moment

        // Calculate electron recoil velocity for visualization (not physics accurate velocity scale)
        // Using conservation of momentum for direction
        const incidentEnergyJ = energy_keV_to_J(incidentEnergyKeV);
        const scatteredEnergyJ = h * c / (wavelength_m_to_pm(scatteredWavelengthPm) / 1e12); // Convert back to meters
        const incidentMomentum = incidentEnergyJ / c;
        const scatteredMomentum = scatteredEnergyJ / c;
        const scatteringAngleRad = degrees_to_radians(scatteringAngleDeg);

        // Momentum conservation in x and y
        // p_incident_x = p_scattered_x + p_electron_x
        // p_incident_y = p_scattered_y + p_electron_y
        // Incident momentum is only in x direction initially

        const electronMomentumX = incidentMomentum - scatteredMomentum * Math.cos(scatteringAngleRad);
        const electronMomentumY = 0 - scatteredMomentum * Math.sin(scatteringAngleRad); // Incident y momentum is 0

        // For visualization purposes, use the angle derived from momentum
        // Note: The actual electron velocity calculation from kinetic energy and momentum is more complex,
        // this is a simplified approach for direction and proportional speed.
        const electronAngle = Math.atan2(electronMomentumY, electronMomentumX);

        // For visualization, let's just give the electron a fixed visual speed
        const electronVisualSpeed = 50; // visual units per second

        setElectronState(currentElectron => {
          if (!currentElectron) return null;
           return {
            ...currentElectron,
            vx: electronVisualSpeed * Math.cos(electronAngle),
            vy: electronVisualSpeed * Math.sin(electronAngle),
            kineticEnergy: electronKineticEnergyKeV,
          };
        });

        // Update scattered photon state
        // For visualization, give scattered photon a fixed visual speed
        const scatteredPhotonVisualSpeed = 100; // visual units per second
        return {
            ...prev,
            x: electronRestPosition.x, // Start from collision point
            y: electronRestPosition.y,
            vx: scatteredPhotonVisualSpeed * Math.cos(scatteringAngleRad),
            vy: scatteredPhotonVisualSpeed * Math.sin(scatteringAngleRad),
            wavelength: scatteredWavelengthPm,
        };


      } else if (isCollisionOccurred) {
        // After collision, photon moves at scattering angle
        // The vx and vy are set at collision
        return {
            ...prev,
             x: prev.x + prev.vx * deltaTime,
             y: prev.y + prev.vy * deltaTime,
        };
      }

       return { ...prev, x: nextX, y: nextY };
    });

     // Update electron position after collision
     if (isCollisionOccurred) {
         setElectronState(prev => {
             if (!prev) return null;
              return {
                 ...prev,
                 x: prev.x + prev.vx * deltaTime,
                 y: prev.y + prev.vy * deltaTime,
             };
         });
     }


  }, [isCollisionOccurred, electronRestPosition.x, electronRestPosition.y, incidentEnergyKeV, scatteredWavelengthPm, scatteringAngleDeg, electronKineticEnergyKeV]); // Added dependencies


  const animate = useCallback((currentTime: number) => {
    if (!startTime.current) startTime.current = currentTime;
    const deltaTime = (currentTime - startTime.current) / 1000; // delta time in seconds

    if (isPlaying) {
      updateAnimation(deltaTime);
    }

    startTime.current = currentTime;
    animationFrameId.current = requestAnimationFrame(animate);
  }, [isPlaying, updateAnimation]);


  useEffect(() => {
    if (isPlaying) {
      startTime.current = performance.now();
      animationFrameId.current = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(animationFrameId.current!);
    }
    return () => cancelAnimationFrame(animationFrameId.current!);
  }, [isPlaying, animate]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    resetSimulation();
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Compton Effect Simulation</CardTitle>
        <CardDescription>Visualize photon-electron scattering.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row gap-6">
        <div className="md:w-2/3 w-full">
          {/* Simulation Area */}
          <svg width="100%" height="300" viewBox="0 0 400 300" className="border rounded bg-gray-50">
            {/* Electron */}
            {electronState && (
              <circle cx={electronState.x} cy={electronState.y} r="10" fill="blue" />
            )}
             {/* Electron Recoil Path (simplified visual) */}
             {electronState && isCollisionOccurred && (
                <line
                  x1={electronRestPosition.x}
                  y1={electronRestPosition.y}
                  x2={electronState.x}
                  y2={electronState.y}
                  stroke="blue"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                />
             )}

            {/* Incident Photon */}
            {photonState && !isCollisionOccurred && (
               <>
                <line
                   x1={photonState.x - 20} // Draw a line segment behind for motion blur effect (optional)
                   y1={photonState.y}
                   x2={photonState.x}
                   y2={photonState.y}
                   stroke="red"
                   strokeWidth="3"
                   markerEnd="url(#arrowhead)"
                />
                 {/* Simple wave representation */}
                <path
                    d={`M ${photonState.x - 15} ${photonState.y}
                       q 5 -10 10 0
                       t 10 0
                       q 5 10 10 0
                       t 10 0`}
                    fill="none"
                    stroke="red"
                    strokeWidth="1"
                />
               </>
            )}

             {/* Scattered Photon */}
            {photonState && isCollisionOccurred && (
                 <>
                <line
                    x1={electronRestPosition.x}
                    y1={electronRestPosition.y}
                    x2={photonState.x}
                    y2={photonState.y}
                    stroke="green"
                    strokeWidth="3"
                    markerEnd="url(#arrowhead)"
                />
                 {/* Simple wave representation (suggesting longer wavelength) */}
                <path
                    d={`M ${electronRestPosition.x} ${electronRestPosition.y}
                       q ${10 * Math.cos(degrees_to_radians(scatteringAngleDeg))} ${10 * Math.sin(degrees_to_radians(scatteringAngleDeg))} ${20 * Math.cos(degrees_to_radians(scatteringAngleDeg))} ${20 * Math.sin(degrees_to_radians(scatteringAngleDeg))}
                       q ${10 * Math.cos(degrees_to_radians(scatteringAngleDeg))} ${10 * Math.sin(degrees_to_radians(scatteringAngleDeg))} ${20 * Math.cos(degrees_to_radians(scatteringAngleDeg))} ${20 * Math.sin(degrees_to_radians(scatteringAngleDeg))}`}
                    fill="none"
                    stroke="green"
                    strokeWidth="1"
                    style={{ transform: `rotate(${scatteringAngleDeg}deg)`, transformOrigin: `${electronRestPosition.x}px ${electronRestPosition.y}px` }}
                />
                 </>
            )}

            {/* Arrowhead definition for lines */}
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" />
              </marker>
            </defs>
          </svg>
        </div>

        <div className="md:w-1/3 w-full space-y-4">
          {/* Controls */}
          <div className="space-y-2">
            <Label htmlFor="incident-energy">Incident Photon Energy (keV)</Label>
             {/* Using Input for numerical precision */}
             <Input
                id="incident-energy"
                type="number"
                value={incidentEnergyKeV}
                onChange={(e) => setIncidentEnergyKeV(parseFloat(e.target.value) || 0)}
                min={10}
                max={200}
             />
            <Slider
              value={[incidentEnergyKeV]}
              onValueChange={(value) => setIncidentEnergyKeV(value[0])}
              min={10}
              max={200}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scattering-angle">Scattering Angle (degrees)</Label>
            <Slider
              id="scattering-angle"
              value={[scatteringAngleDeg]}
              onValueChange={(value) => setScatteringAngleDeg(value[0])}
              min={0}
              max={180}
              step={1}
            />
            <div className="text-sm text-muted-foreground">{scatteringAngleDeg}°</div>
          </div>

          {/* Animation Controls */}
          <div className="flex gap-2">
            <Button onClick={handlePlayPause}>
              {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              {isPlaying ? "Pause" : "Run"}
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" /> Reset
            </Button>
          </div>

          {/* Data Display */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Results:</h3>
            <div>
              <Label>Incident Wavelength:</Label> <span className="ml-2">{incidentWavelengthPm.toFixed(3)} pm</span>
            </div>
            <div>
              <Label>Scattered Wavelength:</Label> <span className="ml-2">{scatteredWavelengthPm.toFixed(3)} pm</span>
            </div>
            <div>
              <Label>Wavelength Shift (Δλ):</Label> <span className="ml-2">{wavelengthShiftPm.toFixed(3)} pm</span>
            </div>
            <div>
              <Label>Electron Kinetic Energy:</Label> <span className="ml-2">{electronKineticEnergyKeV.toFixed(3)} keV</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComptonEffectSim;