"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from '@/components/ui/separator';

// --- Constants & Types ---
const SVG_WIDTH = 600;
const SVG_HEIGHT = 400;
const PRISM_APEX_ANGLE_DEG = 60; // Equilateral prism

// Refractive indices for common materials (approximate values for Red, Green, Blue light)
// Typically, n_blue > n_green > n_red
interface MaterialNValues {
  n_red: number;
  n_green: number;
  n_blue: number;
}
interface PrismMaterial extends MaterialNValues {
  name: string;
}

const MATERIALS_DATA: PrismMaterial[] = [
  { name: "Glass (Crown)", n_red: 1.514, n_green: 1.517, n_blue: 1.523 }, // Lower dispersion
  { name: "Glass (Flint)", n_red: 1.630, n_green: 1.642, n_blue: 1.665 }, // Higher dispersion
  { name: "Fused Quartz", n_red: 1.456, n_green: 1.458, n_blue: 1.463 }, // Very low dispersion
];

type LightSourceType = "White Light" | "Red Light" | "Green Light" | "Blue Light";
const N_AIR = 1.0;

interface Point { x: number; y: number; }
interface RaySegment {
  p1: Point;
  p2: Point;
  color: string;
  isTIR?: boolean; // Indicates if this segment is due to Total Internal Reflection
}
interface RayPath {
  colorName: 'red' | 'green' | 'blue' | 'white'; // For internal reference
  segments: RaySegment[];
  deviation?: number; // degrees
  incidentAngle1?: number; // degrees, on first surface
  emergentAngle2?: number; // degrees, from second surface (if not TIR)
  isTIR_at_exit?: boolean;
  finalEmergentRayAngleGlobal?: number; // Global angle of the ray exiting prism (or TIR ray)
}

interface OutputAngles {
  incident: number;
  dev_red?: number;
  dev_green?: number;
  dev_blue?: number;
  angular_dispersion_RB?: number; // |dev_blue - dev_red|
}

// Helper Functions
const degreesToRadians = (deg: number): number => deg * (Math.PI / 180);
const radiansToDegrees = (rad: number): number => rad * (180 / Math.PI);

// Prism Geometry (equilateral triangle, base down, apex up)
// Prism is centered horizontally, y-position adjusted for visibility
const PRISM_SIDE_LENGTH = 150;
const PRISM_HEIGHT = (Math.sqrt(3) / 2) * PRISM_SIDE_LENGTH;
const PRISM_CENTER_X = SVG_WIDTH / 2;
const PRISM_APEX_Y = SVG_HEIGHT / 2 - PRISM_HEIGHT / 2 + 20; // Adjusted for aesthetics

const PRISM_VERTICES: [Point, Point, Point] = [
  { x: PRISM_CENTER_X, y: PRISM_APEX_Y }, // Apex (V1)
  { x: PRISM_CENTER_X - PRISM_SIDE_LENGTH / 2, y: PRISM_APEX_Y + PRISM_HEIGHT }, // Bottom-left (V2)
  { x: PRISM_CENTER_X + PRISM_SIDE_LENGTH / 2, y: PRISM_APEX_Y + PRISM_HEIGHT }, // Bottom-right (V3)
];

// Normals (angles in degrees, 0 is horizontal right, positive is CCW)
// Face 1 (V1-V2, left face): normal angle is 30 deg (pointing up-left)
// Face 2 (V1-V3, right face): normal angle is 150 deg (pointing up-right)
// For Snell's law, we need the angle of the normal pointing *outwards* from the prism face.
// So for incident ray on left face (V1-V2): normal points left. Angle of face V1V2 is 240 deg. Normal is 240-90 = 150 deg.
// No, let's define faces and calculate normals:
// Face 1 (left, V1-V2): normal angle pointing outwards (left-upwards) = -30 degrees or 330 degrees from +x axis.
// Face 2 (right, V1-V3): normal angle pointing outwards (right-upwards) = 30 degrees from +x axis.
const NORMAL_FACE1_DEG = -30 + 180; // For incident ray entering from left. Angle is of normal pointing left.
const NORMAL_FACE2_DEG = 30;   // For emergent ray exiting to right. Angle is of normal pointing right.

// Simplified normals (angles are of the normal vector itself)
// Left face normal (V1-V2): If prism face slopes down to left, normal points up-left. Angle = 150 deg.
// Right face normal (V1-V3): If prism face slopes down to right, normal points up-right. Angle = 30 deg.
const LEFT_FACE_NORMAL_ANGLE_DEG = 150; // Points "out" of the left face towards incident light side
const RIGHT_FACE_NORMAL_ANGLE_DEG = 30;  // Points "out" of the right face

// Entry point on the left face (fixed y for simplicity, x calculated by incidence angle)
// Or, fix entry point and vary incident angle relative to normal.
// Let's fix entry point: mid-point of left face
const INCIDENT_POINT_Y = PRISM_APEX_Y + PRISM_HEIGHT / 2;
const INCIDENT_POINT_X = PRISM_CENTER_X - PRISM_SIDE_LENGTH / 4;


const DispersionPrismSim: React.FC = () => {
  const [angleIncidenceDeg, setAngleIncidenceDeg] = useState<number>(50); // Angle of incidence on 1st face relative to normal
  const [prismMaterialName, setPrismMaterialName] = useState<string>(MATERIALS_DATA[0].name);
  const [isCustomMaterial, setIsCustomMaterial] = useState<boolean>(false);
  const [customN, setCustomN] = useState<MaterialNValues>({ ...MATERIALS_DATA[0] });
  const [lightSource, setLightSource] = useState<LightSourceType>("White Light");
  const [showNormals, setShowNormals] = useState<boolean>(true);

  const [rayPaths, setRayPaths] = useState<RayPath[]>([]);
  const [outputAngles, setOutputAngles] = useState<OutputAngles>({ incident: angleIncidenceDeg });
  const [feedbackMessage, setFeedbackMessage] = useState<string>("");

  const calculateRayPath = useCallback((
    initialAngleIncidenceDeg: number, // relative to normal of first face
    n_prism: number,
    color: 'red' | 'green' | 'blue' | 'white',
    lineColor: string
  ): RayPath | null => {

    const prismApexAngleRad = degreesToRadians(PRISM_APEX_ANGLE_DEG);

    // --- 1. Incident Ray and First Refraction (Air -> Prism) ---
    // Angle of incidence (theta_i1) on first face, relative to normal
    const theta_i1_rad = degreesToRadians(initialAngleIncidenceDeg);
    
    // Normal to the first face (left face V1-V2). Its angle with horizontal is 300 deg or -60 deg.
    // The normal for Snell's law points outwards. So angle is 300-90 = 210, or -60-90 = -150.
    // Let's use fixed prism orientation and calculate angles carefully.
    // Left face of equilateral prism makes 60deg with horizontal base. Normal to it is at 30 deg from horizontal.
    // The prism face itself is at angle (180+30)=210 deg from +x axis for the left face. Normal pointing outward is 210-90 = 120 deg.
    // If left face is V1-V2. Angle of line V1V2 is atan2(V2.y-V1.y, V2.x-V1.x). Normal is this angle - 90 deg.
    // V1 = (cx, ay), V2 = (cx-SL/2, ay+H)
    // Angle of V1V2 = atan2(H, -SL/2) = atan2(sqrt(3)/2 * SL, -SL/2) = atan2(sqrt(3), -1) = 150 deg.
    // Normal to V1V2 pointing "out" (leftwards) = 150 - 90 = 60 deg. This seems more intuitive.

    const normal1_global_rad = degreesToRadians(60); // Normal to left face (V1-V2)
    
    // Global angle of incident ray
    // If theta_i1_rad is angle from normal, and normal is at normal1_global_rad,
    // then incident ray global angle = normal1_global_rad + theta_i1_rad (if approaching from "above" normal)
    // or normal1_global_rad - theta_i1_rad (if approaching from "below" normal)
    // For standard setup, incident ray comes from left, hits left face.
    // If normal angle is 60 deg (pointing up-left), incident ray from left means global angle is > 90 deg.
    // Let incident ray global angle be `alpha_inc_global_rad`
    // `theta_i1_rad = alpha_inc_global_rad - normal1_global_rad` (assuming alpha_inc > normal_angle)
    // So, `alpha_inc_global_rad = normal1_global_rad + theta_i1_rad` (This assumes standard "positive" angle of incidence definition)
    // Let's use a fixed entry point and derive the incident ray line for visualization
    // Entry point on left face (V1-V2)
    const entryPoint: Point = {
      x: PRISM_VERTICES[0].x - (PRISM_VERTICES[0].x - PRISM_VERTICES[1].x) / 2,
      y: PRISM_VERTICES[0].y + (PRISM_VERTICES[1].y - PRISM_VERTICES[0].y) / 2,
    };

    // Angle of incident ray (global, 0 deg is horizontal right)
    // A bit tricky: initialAngleIncidenceDeg is relative to normal. Normal to left face V1V2 has global angle of 60 deg.
    // So, incident ray global angle is 60 + initialAngleIncidenceDeg
    // Wait, this is not standard. Standard angle of incidence means ray from 0 deg hits normal at 90 deg.
    // Let's define angle of incidence as deviation from a ray parallel to prism base from left.
    // Or, more simply, angle of incidence on first face.
    
    // Snell's Law: n_air * sin(theta_i1) = n_prism * sin(theta_r1)
    // theta_r1 is angle of refraction *inside prism*, relative to normal1.
    if (Math.sin(theta_i1_rad) * N_AIR / n_prism > 1 || Math.sin(theta_i1_rad) * N_AIR / n_prism < -1) {
        return { // Should not happen for air to prism
            colorName: color, segments: [], deviation: undefined, isTIR_at_exit: true, 
            incidentAngle1: initialAngleIncidenceDeg,
            finalEmergentRayAngleGlobal: undefined
        }; 
    }
    const theta_r1_rad = Math.asin((N_AIR / n_prism) * Math.sin(theta_i1_rad));
    
    // Global angle of refracted ray inside prism
    // If normal is at global angle N1, and incident ray makes angle I1 (w.r.t normal),
    // refracted ray makes R1 (w.r.t normal).
    // Global angle of incident ray: A_inc = N1 - I1 (if ray comes from "left" of normal vector)
    // Global angle of refracted ray: A_refr = N1 - R1
    const global_normal1_rad = degreesToRadians(60); // Normal to left face (V1V2)
    const global_inc_ray_rad = global_normal1_rad - theta_i1_rad; // Incident ray from "outside" the normal angle
    const global_refr_ray1_rad = global_normal1_rad - theta_r1_rad; // Refracted ray bends towards normal

    const incidentRayStart: Point = {
      x: entryPoint.x - 100 * Math.cos(global_inc_ray_rad),
      y: entryPoint.y - 100 * Math.sin(global_inc_ray_rad),
    };
    const segments: RaySegment[] = [{ p1: incidentRayStart, p2: entryPoint, color: lineColor }];

    // --- 2. Ray inside prism and Second Refraction (Prism -> Air) ---
    // Find intersection of this refracted ray with the second face (V1-V3)
    // Line V1V3: V1=(cx, ay), V3=(cx+SL/2, ay+H)
    // Ray: from entryPoint with angle global_refr_ray1_rad
    // Parametric ray: P(t) = entryPoint + t * (cos(global_refr_ray1_rad), sin(global_refr_ray1_rad))
    // Line V1V3: Q(s) = V1 + s * (V3-V1)
    const V1 = PRISM_VERTICES[0]; const V3 = PRISM_VERTICES[2];
    const dx_ray = Math.cos(global_refr_ray1_rad);
    const dy_ray = Math.sin(global_refr_ray1_rad);
    const dx_face2 = V3.x - V1.x;
    const dy_face2 = V3.y - V1.y;

    // Solve for t, s: entryPoint.x + t*dx_ray = V1.x + s*dx_face2
    //                 entryPoint.y + t*dy_ray = V1.y + s*dy_face2
    const det = dx_ray * dy_face2 - dy_ray * dx_face2;
    let exitPoint: Point | null = null;

    if (Math.abs(det) < 1e-6) { // Parallel lines, should not happen if ray enters
        return null; // Error case
    }

    const t = ((V1.x - entryPoint.x) * dy_face2 - (V1.y - entryPoint.y) * dx_face2) / det;
    const s = ((V1.x - entryPoint.x) * dy_ray - (V1.y - entryPoint.y) * dx_ray) / det;

    if (t > 0 && s >= 0 && s <= 1) { // Intersection is on the ray path and on the face segment
      exitPoint = {
        x: entryPoint.x + t * dx_ray,
        y: entryPoint.y + t * dy_ray,
      };
    } else { // Ray misses the second face (e.g. exits through base, or angle too steep)
        // Simplified: assume it always hits second face for typical angles, or handle as error/edge case
        // For now, let's make a long segment and see.
         exitPoint = { x: entryPoint.x + 200 * dx_ray, y: entryPoint.y + 200 * dy_ray };
         // This needs more robust handling for edge cases (e.g. hitting prism base)
    }
    segments.push({ p1: entryPoint, p2: exitPoint, color: lineColor });

    // Angle of incidence on second face (theta_i2), inside prism, relative to normal2
    // Normal to second face V1V3. Face angle atan2(H, SL/2) = 30 deg. Normal = 30+90 = 120 deg.
    const global_normal2_rad = degreesToRadians(120); // Normal to right face (V1V3) pointing "out" (rightwards)
    
    // theta_i2_rad is angle between ray (global_refr_ray1_rad) and normal (global_normal2_rad)
    // Important: ray direction vector is (cos(A), sin(A)). Normal vector is (cos(B), sin(B)).
    // Angle between them using dot product: cos(angle) = (v1 . v2) / (|v1||v2|)
    // Or, simpler: theta_i2_rad = global_normal2_rad - global_refr_ray1_rad (adjust for correct quadrant)
    // The angle of the ray inside the prism is global_refr_ray1_rad.
    // The angle of the normal to the second face (pointing "into" prism for the ray) is global_normal2_rad - PI or + PI.
    // The angle of incidence theta_i2 is the angle between the ray and the normal to the face.
    // Prism apex angle A. theta_i2 = A - theta_r1. (This is for angles *inside* the prism relative to face plane, not normal)
    // Correct geometric relation for prism: theta_i2_rad = prismApexAngleRad - theta_r1_rad;
    // This theta_i2 is the angle of the ray with the prism face.
    // Angle of incidence w.r.t. normal = PI/2 - (angle w.r.t. face)
    // No, standard prism equations: A = r1 + i2 (where r1 is angle of refraction at 1st surf, i2 is angle of incidence at 2nd surf, both w.r.t normals)
    // So, theta_i2_rad (incidence on 2nd face from inside) = prismApexAngleRad - theta_r1_rad;
    
    // This is where things get tricky. Let's use the prism formula A = r1 + i2_normal
    // where A is prism apex angle, r1 is refraction angle at 1st surface (theta_r1_rad here)
    // and i2_normal is incidence angle at 2nd surface. Both r1 and i2_normal are w.r.t their normals.
    const theta_i2_normal_rad = prismApexAngleRad - theta_r1_rad;


    // Check for TIR at second surface
    const critical_angle_rad = Math.asin(N_AIR / n_prism); // n_prism > N_AIR
    let isTIR = false;
    let global_emergent_ray_rad: number;
    let theta_e2_rad: number | undefined = undefined; // emergent angle from normal2

    if (theta_i2_normal_rad >= critical_angle_rad) {
      isTIR = true;
      // Reflection: angle of reflection = angle of incidence (theta_i2_normal_rad)
      // Reflected ray global angle: normal2_global_rad + theta_i2_normal_rad (if normal is "between" incident and reflected)
      // If normal is 120 deg, incident ray from left-down (e.g. 90 deg), reflected ray goes up-right (e.g. 150 deg).
      // Reflected ray's angle = global_normal2_rad + (global_normal2_rad - global_refr_ray1_rad) is WRONG.
      // Simpler: reflected angle = incoming_angle + 2 * (normal_angle - incoming_angle) for reflection about normal.
      // Angle of reflected ray = global_refr_ray1_rad + 2 * ( (global_normal2_rad - global_refr_ray1_rad) if normal is "ahead" )
      // Or angle of reflected ray = global_normal2_rad + theta_i2_normal_rad
      global_emergent_ray_rad = global_normal2_rad + theta_i2_normal_rad;

    } else {
      // Refraction: n_prism * sin(theta_i2_normal_rad) = n_air * sin(theta_e2_rad)
      // theta_e2_rad is angle of emergence *into air*, relative to normal2
      theta_e2_rad = Math.asin((n_prism / N_AIR) * Math.sin(theta_i2_normal_rad));
      // Global angle of emergent ray
      // Emergent ray bends away from normal: global_emergent_ray_rad = global_normal2_rad + theta_e2_rad
      global_emergent_ray_rad = global_normal2_rad + theta_e2_rad;
    }

    const emergentRayEnd: Point = {
      x: exitPoint.x + 200 * Math.cos(global_emergent_ray_rad),
      y: exitPoint.y + 200 * Math.sin(global_emergent_ray_rad),
    };
    segments.push({ p1: exitPoint, p2: emergentRayEnd, color: lineColor, isTIR });

    // --- 3. Calculate Total Deviation ---
    // Deviation (delta) = (theta_i1 + theta_e2) - PrismApexAngle
    // This formula holds if no TIR.
    let deviation_deg: number | undefined = undefined;
    if (!isTIR && theta_e2_rad !== undefined) {
      deviation_deg = radiansToDegrees(theta_i1_rad + theta_e2_rad - prismApexAngleRad);
    }
    
    return {
      colorName: color,
      segments,
      deviation: deviation_deg,
      isTIR_at_exit: isTIR,
      incidentAngle1: initialAngleIncidenceDeg,
      emergentAngle2: theta_e2_rad ? radiansToDegrees(theta_e2_rad) : undefined,
      finalEmergentRayAngleGlobal: radiansToDegrees(global_emergent_ray_rad),
    };
  }, []);


  useEffect(() => {
    const currentMaterialNValues: MaterialNValues = isCustomMaterial ? customN : MATERIALS_DATA.find(m => m.name === prismMaterialName) || MATERIALS_DATA[0];
    const newRayPaths: RayPath[] = [];
    let newFeedback = "";
    let tirCount = 0;

    const colorsToTrace: Array<{ name: 'red' | 'green' | 'blue'; n: number; lineColor: string }> = [];

    if (lightSource === "White Light") {
      colorsToTrace.push({ name: 'red', n: currentMaterialNValues.n_red, lineColor: 'red' });
      colorsToTrace.push({ name: 'green', n: currentMaterialNValues.n_green, lineColor: 'green' });
      colorsToTrace.push({ name: 'blue', n: currentMaterialNValues.n_blue, lineColor: 'blue' });
    } else if (lightSource === "Red Light") {
      colorsToTrace.push({ name: 'red', n: currentMaterialNValues.n_red, lineColor: 'red' });
    } else if (lightSource === "Green Light") {
      colorsToTrace.push({ name: 'green', n: currentMaterialNValues.n_green, lineColor: 'green' });
    } else if (lightSource === "Blue Light") {
      colorsToTrace.push({ name: 'blue', n: currentMaterialNValues.n_blue, lineColor: 'blue' });
    }
    
    const calculatedPaths: (RayPath | null)[] = colorsToTrace.map(ct => 
        calculateRayPath(angleIncidenceDeg, ct.n, ct.name, ct.lineColor)
    );

    const validPaths = calculatedPaths.filter(p => p !== null) as RayPath[];
    newRayPaths.push(...validPaths);
    
    const devAngles: {red?:number, green?:number, blue?:number} = {};
    validPaths.forEach(p => {
      if (p.colorName === 'red') devAngles.red = p.deviation;
      if (p.colorName === 'green') devAngles.green = p.deviation;
      if (p.colorName === 'blue') devAngles.blue = p.deviation;
      if (p.isTIR_at_exit) {
        newFeedback += `${p.colorName.charAt(0).toUpperCase() + p.colorName.slice(1)} light experiences TIR. `;
        tirCount++;
      }
    });

    if (tirCount === colorsToTrace.length && colorsToTrace.length > 0) {
        newFeedback = "All selected light experiences Total Internal Reflection.";
    } else if (tirCount > 0) {
        // Feedback already has individual TIR messages
    } else if (colorsToTrace.length > 0) {
        newFeedback = lightSource === "White Light" ? "Spectrum observed." : `${lightSource} path shown.`;
    }


    let angularDispersion: number | undefined = undefined;
    if (devAngles.blue !== undefined && devAngles.red !== undefined) {
      angularDispersion = Math.abs(devAngles.blue - devAngles.red);
    }
    
    setRayPaths(newRayPaths);
    setOutputAngles({
      incident: angleIncidenceDeg,
      dev_red: devAngles.red,
      dev_green: devAngles.green,
      dev_blue: devAngles.blue,
      angular_dispersion_RB: angularDispersion,
    });
    setFeedbackMessage(newFeedback);

  }, [angleIncidenceDeg, prismMaterialName, isCustomMaterial, customN, lightSource, calculateRayPath]);

  const handleMaterialChange = (value: string) => {
    if (value === "custom") {
      setIsCustomMaterial(true);
      // Optionally, set customN to the values of the previously selected material
      const prevMaterial = MATERIALS_DATA.find(m => m.name === prismMaterialName) || MATERIALS_DATA[0];
      setCustomN({...prevMaterial});
    } else {
      setIsCustomMaterial(false);
      setPrismMaterialName(value);
    }
  };
  
  const handleReset = () => {
    setAngleIncidenceDeg(50);
    setPrismMaterialName(MATERIALS_DATA[0].name);
    setIsCustomMaterial(false);
    setCustomN({...MATERIALS_DATA[0]});
    setLightSource("White Light");
    setShowNormals(true);
  };

  const renderNormals = () => {
    if (!showNormals || rayPaths.length === 0 || rayPaths[0].segments.length < 1) return null;

    const entryPoint = rayPaths[0].segments[0].p2; // Assuming all rays use same entry point for normal
    const normal1AngleRad = degreesToRadians(60); // Normal to left face
    const normal1End: Point = {
        x: entryPoint.x + 50 * Math.cos(normal1AngleRad),
        y: entryPoint.y + 50 * Math.sin(normal1AngleRad),
    };
    const normal1Start: Point = {
        x: entryPoint.x - 50 * Math.cos(normal1AngleRad),
        y: entryPoint.y - 50 * Math.sin(normal1AngleRad),
    };

    // For second normal, we need an exit point. Use the first valid ray's exit point.
    const firstValidPath = rayPaths.find(rp => rp.segments.length > 1);
    if (!firstValidPath) return null;
    
    const exitPoint = firstValidPath.segments[1].p2;
    const normal2AngleRad = degreesToRadians(120); // Normal to right face
    const normal2End: Point = {
        x: exitPoint.x + 50 * Math.cos(normal2AngleRad),
        y: exitPoint.y + 50 * Math.sin(normal2AngleRad),
    };
    const normal2Start: Point = {
        x: exitPoint.x - 50 * Math.cos(normal2AngleRad),
        y: exitPoint.y - 50 * Math.sin(normal2AngleRad),
    };
    
    return (
      <>
        <line x1={normal1Start.x} y1={normal1Start.y} x2={normal1End.x} y2={normal1End.y} stroke="grey" strokeWidth="1" strokeDasharray="4 2" />
        {firstValidPath.segments.length > 1 && (
            <line x1={normal2Start.x} y1={normal2Start.y} x2={normal2End.x} y2={normal2End.y} stroke="grey" strokeWidth="1" strokeDasharray="4 2" />
        )}
      </>
    );
  };


  return (
    <div className="container mx-auto p-4 space-y-6">
      <header className="text-center">
        <h1 className="text-3xl font-bold">Dispersion of Light by a Prism (Grade 10)</h1>
        <p className="text-muted-foreground">
          Observe how white light splits into a spectrum and explore factors affecting dispersion.
        </p>
      </header>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Controls Panel */}
        <Card className="md:col-span-1">
          <CardHeader><CardTitle>Controls</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="angle-slider">Angle of Incidence (θi): {angleIncidenceDeg}°</Label>
              <Slider id="angle-slider" min={25} max={80} step={1} defaultValue={[angleIncidenceDeg]} onValueChange={([val]) => setAngleIncidenceDeg(val)} />
              <p className="text-xs text-muted-foreground">Relative to the normal of the first prism face.</p>
            </div>
            <Separator />
            <div>
              <Label htmlFor="material-select">Prism Material</Label>
              <Select onValueChange={handleMaterialChange} defaultValue={prismMaterialName}>
                <SelectTrigger id="material-select"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MATERIALS_DATA.map(m => <SelectItem key={m.name} value={m.name}>{m.name}</SelectItem>)}
                  <SelectItem value="custom">Custom Material</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {isCustomMaterial && (
              <div className="pl-4 space-y-2 border-l-2 ml-2">
                <Label>Custom Refractive Indices:</Label>
                <div>
                  <Label htmlFor="n-red" className="text-xs">n (Red)</Label>
                  <Input id="n-red" type="number" value={customN.n_red} onChange={e => setCustomN(prev => ({...prev, n_red: parseFloat(e.target.value) || 1.0}))} step="0.001" min="1.0" />
                </div>
                <div>
                  <Label htmlFor="n-green" className="text-xs">n (Green)</Label>
                  <Input id="n-green" type="number" value={customN.n_green} onChange={e => setCustomN(prev => ({...prev, n_green: parseFloat(e.target.value) || 1.0}))} step="0.001" min="1.0" />
                </div>
                <div>
                  <Label htmlFor="n-blue" className="text-xs">n (Blue)</Label>
                  <Input id="n-blue" type="number" value={customN.n_blue} onChange={e => setCustomN(prev => ({...prev, n_blue: parseFloat(e.target.value) || 1.0}))} step="0.001" min="1.0" />
                </div>
              </div>
            )}
            <Separator />
            <div>
              <Label>Light Source</Label>
              <RadioGroup value={lightSource} onValueChange={(val: LightSourceType) => setLightSource(val)}>
                {(["White Light", "Red Light", "Green Light", "Blue Light"] as LightSourceType[]).map(src => (
                  <div key={src} className="flex items-center space-x-2">
                    <RadioGroupItem value={src} id={`light-${src.replace(/\s/g, '')}`} />
                    <Label htmlFor={`light-${src.replace(/\s/g, '')}`}>{src}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button onClick={() => setShowNormals(prev => !prev)} variant="outline" className="w-full">
              {showNormals ? "Hide Normals" : "Show Normals"}
            </Button>
            <Button onClick={handleReset} variant="destructive" className="w-full">Reset Simulation</Button>
          </CardFooter>
        </Card>

        {/* Simulation & Data Panel */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Prism Simulation</CardTitle></CardHeader>
            <CardContent className="flex flex-col items-center space-y-2">
              <svg width={SVG_WIDTH} height={SVG_HEIGHT} className="border rounded-md bg-slate-50 overflow-hidden">
                {/* Prism Body */}
                <polygon
                  points={`${PRISM_VERTICES[0].x},${PRISM_VERTICES[0].y} ${PRISM_VERTICES[1].x},${PRISM_VERTICES[1].y} ${PRISM_VERTICES[2].x},${PRISM_VERTICES[2].y}`}
                  fill="rgba(200, 220, 255, 0.4)"
                  stroke="rgba(100,100,150,0.8)"
                  strokeWidth="2"
                />
                {/* Rays */}
                {rayPaths.map((path, idx) => 
                  path.segments.map((seg, segIdx) => (
                    <line key={`${idx}-${segIdx}`} 
                          x1={seg.p1.x} y1={seg.p1.y} 
                          x2={seg.p2.x} y2={seg.p2.y} 
                          stroke={seg.color} 
                          strokeWidth={lightSource === "White Light" ? 1.5 : 2.5} />
                  ))
                )}
                {/* Normals */}
                {renderNormals()}
              </svg>
              <p className="text-sm text-muted-foreground font-semibold h-10 text-center p-1">{feedbackMessage}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Output Data</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <p>Incident Angle (θi): <span className="font-semibold">{outputAngles.incident?.toFixed(1) ?? 'N/A'}°</span></p>
              <p>Ang. Dispersion (R-B): <span className="font-semibold">{outputAngles.angular_dispersion_RB?.toFixed(1) ?? 'N/A'}°</span></p>
              <p className="text-red-600">Dev. (Red): <span className="font-semibold">{outputAngles.dev_red?.toFixed(1) ?? 'N/A'}°</span></p>
              <p className="text-green-600">Dev. (Green): <span className="font-semibold">{outputAngles.dev_green?.toFixed(1) ?? 'N/A'}°</span></p>
              <p className="text-blue-600">Dev. (Blue): <span className="font-semibold">{outputAngles.dev_blue?.toFixed(1) ?? 'N/A'}°</span></p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DispersionPrismSim;