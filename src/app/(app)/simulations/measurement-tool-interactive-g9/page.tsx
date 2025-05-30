"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { Slider } from "@/components/ui/slider"; // Not used in this version for user input
import { ArrowLeft, HelpCircle, RefreshCw, CheckCircle, XCircle, ZoomIn } from "lucide-react";
import Link from "next/link";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/components/ui/use-toast"; // Assuming this is from shadcn/ui
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const VERN_LEAST_COUNT_CM = 0.01; // Least count in cm
const VERN_MAIN_SCALE_SMALLEST_DIV_CM = 0.1; // Smallest division on main scale in cm (1 mm)
const VERN_DIVISIONS = 10; // Number of divisions on Vernier scale

// Visual scaling
const PIXELS_PER_CM = 80; // How many pixels represent 1 cm on the main scale
const MAIN_SCALE_TOTAL_LENGTH_CM = 7; // Visual length of the main scale to draw
const MAIN_SCALE_START_CM = 0;

const JAW_THICKNESS_PX = 10;
const BEAM_HEIGHT_PX = 25;
const VERNIER_SLIDER_HEIGHT_PX = 20;

export default function EnhancedMeasurementToolG9Page() {
  const { toast } = useToast();
  const [objectSizeCm, setObjectSizeCm] = useState(2.34); // Actual size in cm
  
  const [userMainScaleCm, setUserMainScaleCm] = useState("");
  const [userVernierDivision, setUserVernierDivision] = useState(""); // This is the coinciding division number
  
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const [vernierVisualOffsetXPx, setVernierVisualOffsetXPx] = useState(0); // For animation

  const svgContainerRef = useRef<HTMLDivElement>(null);

  const generateNewObjectSize = useCallback(() => {
    const newSize = parseFloat((Math.random() * (4.5 - 0.5) + 0.5).toFixed(2)); // Range 0.5 to 4.5 cm
    setObjectSizeCm(newSize);
    setUserMainScaleCm("");
    setUserVernierDivision("");
    setFeedback(null);
    setShowCorrectAnswer(false);
  }, []);

  useEffect(() => {
    generateNewObjectSize();
  }, [generateNewObjectSize]);
  
  useEffect(() => {
    // Update visual offset for animation
    setVernierVisualOffsetXPx(objectSizeCm * PIXELS_PER_CM);
  }, [objectSizeCm]);


  const trueReadings = useMemo(() => {
    // Main scale reading is the largest multiple of VERN_MAIN_SCALE_SMALLEST_DIV_CM less than or equal to objectSizeCm
    const mainScaleReadingCm = Math.floor(objectSizeCm / VERN_MAIN_SCALE_SMALLEST_DIV_CM) * VERN_MAIN_SCALE_SMALLEST_DIV_CM;
    
    // The remaining part is measured by the Vernier scale
    const vernierPartCm = objectSizeCm - mainScaleReadingCm;
    
    // Find which Vernier division coincides.
    // vernierPartCm = N * VERN_LEAST_COUNT_CM, so N = vernierPartCm / VERN_LEAST_COUNT_CM
    let vernierCoincidingDivision = Math.round(vernierPartCm / VERN_LEAST_COUNT_CM);

    // Ensure it's within bounds (0 to VERN_DIVISIONS). If objectSize is exact multiple of main scale, vernier part is 0.
    // If objectSizeCm is slightly less than mainScaleReadingCm + VERN_LEAST_COUNT_CM due to rounding,
    // vernierCoincidingDivision could become negative or too large.
    vernierCoincidingDivision = Math.max(0, Math.min(VERN_DIVISIONS, vernierCoincidingDivision));
    
    // Recalculate total based on these discrete readings to match how a user would sum it
    const totalFromReadings = mainScaleReadingCm + vernierCoincidingDivision * VERN_LEAST_COUNT_CM;

    return {
      mainScaleCm: parseFloat(mainScaleReadingCm.toFixed(2)),
      vernierCoincidingDivision: vernierCoincidingDivision,
      totalCm: parseFloat(totalFromReadings.toFixed(2)), // Use this for comparison
      actualObjectSizeCm: parseFloat(objectSizeCm.toFixed(2)) // Keep original for display
    };
  }, [objectSizeCm]);

  const handleCheckReading = () => {
    const mainScaleInput = parseFloat(userMainScaleCm);
    const vernierDivisionInput = parseInt(userVernierDivision, 10);

    if (isNaN(mainScaleInput) || isNaN(vernierDivisionInput)) {
      setFeedback("Please enter valid numbers for both readings.");
      setShowCorrectAnswer(false);
      toast({ title: "Invalid Input", description: "Please enter numbers.", variant: "destructive" });
      return;
    }
    if (vernierDivisionInput < 0 || vernierDivisionInput > VERN_DIVISIONS) {
      setFeedback(`Vernier division must be between 0 and ${VERN_DIVISIONS}.`);
      setShowCorrectAnswer(false);
      toast({ title: "Invalid Vernier Division", description: `Enter a value from 0 to ${VERN_DIVISIONS}.`, variant: "destructive" });
      return;
    }

    const calculatedUserReading = parseFloat((mainScaleInput + vernierDivisionInput * VERN_LEAST_COUNT_CM).toFixed(2));
    
    // Compare with totalCm from trueReadings, which is derived from discrete steps
    if (calculatedUserReading === trueReadings.totalCm) {
      setFeedback(`Correct! Your reading is ${calculatedUserReading.toFixed(2)} cm.`);
      toast({ title: "Correct!", description: `Object size is approx ${trueReadings.actualObjectSizeCm.toFixed(2)} cm.` });
      setShowCorrectAnswer(false); // Don't show correct if they got it right
    } else {
      setFeedback(`Not quite. Your reading: ${calculatedUserReading.toFixed(2)} cm. Correct reading: ${trueReadings.totalCm.toFixed(2)} cm.`);
      toast({ title: "Incorrect", description: `Object size is approx ${trueReadings.actualObjectSizeCm.toFixed(2)} cm. Try again or see details.`, variant: "destructive" });
      setShowCorrectAnswer(true);
    }
  };

  const renderEnhancedVernierScales = () => {
    const svgTotalWidth = (MAIN_SCALE_TOTAL_LENGTH_CM * PIXELS_PER_CM) + JAW_THICKNESS_PX + 50; // Extra space
    const mainScaleHeight = 10 * PIXELS_PER_CM / 80; // Scale based on PIXELS_PER_CM
    const vernierScaleHeight = 8 * PIXELS_PER_CM / 80;

    // Position of the Vernier scale's zero (left edge of its slider) on the SVG canvas
    // This is where the measurement is taken.
    const vernierZeroAbsoluteXPx = JAW_THICKNESS_PX + vernierVisualOffsetXPx;

    const mainScaleDivisions = [];
    const numMainDivs = Math.floor(MAIN_SCALE_TOTAL_LENGTH_CM / VERN_MAIN_SCALE_SMALLEST_DIV_CM);
    for (let i = 0; i <= numMainDivs; i++) {
      const valCm = MAIN_SCALE_START_CM + i * VERN_MAIN_SCALE_SMALLEST_DIV_CM;
      const xPos = JAW_THICKNESS_PX + valCm * PIXELS_PER_CM;
      let lineH = mainScaleHeight;
      if ( (i % 10) === 0) lineH *= 2; // Longer for cm marks
      else if ( (i % 5) === 0) lineH *= 1.5; // Medium for 0.5 cm marks
      
      mainScaleDivisions.push(
        <g key={`main-g-${i}`}>
          <line key={`main-l-${i}`} x1={xPos} y1={50} x2={xPos} y2={50 + lineH} stroke="black" strokeWidth="1"/>
          {(i % 10) === 0 && <text key={`main-t-${i}`} x={xPos} y={45} fontSize="10" textAnchor="middle">{valCm.toFixed(0)}</text>}
        </g>
      );
    }

    // Each Vernier division is 0.09 cm (for typical 0.01 LC). Visually, this is (0.09 * PIXELS_PER_CM)
    const vernierDivisionWidthPx = (VERN_MAIN_SCALE_SMALLEST_DIV_CM - VERN_LEAST_COUNT_CM) * PIXELS_PER_CM;
    const vernierScaleVisualWidthPx = VERN_DIVISIONS * vernierDivisionWidthPx;

    const vernierScaleDivisions = [];
    for (let i = 0; i <= VERN_DIVISIONS; i++) {
      const xPos = i * vernierDivisionWidthPx;
      let lineH = vernierScaleHeight;
      if ( (i % 5) === 0) lineH *= 1.5;
      
      vernierScaleDivisions.push(
        <g key={`vern-g-${i}`}>
          <line key={`vern-l-${i}`} x1={xPos} y1={0} x2={xPos} y2={-lineH} stroke="blue" strokeWidth="1"/>
          {(i % 5) === 0 && <text key={`vern-t-${i}`} x={xPos} y={10} fontSize="9" fill="blue" textAnchor="middle">{i}</text>}
        </g>
      );
    }
    
    const objectWidthPx = objectSizeCm * PIXELS_PER_CM;

    // Calculate viewBox for zoom
    let viewBox = `0 0 ${svgTotalWidth} 150`;
    if (isZoomed) {
        const zoomCenterX = vernierZeroAbsoluteXPx + (vernierScaleVisualWidthPx / 4); // Center zoom around vernier scale start
        const zoomWidth = PIXELS_PER_CM * 2.5; // Zoom to show about 2.5cm width
        const zoomHeight = 150 * (zoomWidth / svgTotalWidth); // Maintain aspect ratio for height
        viewBox = `${zoomCenterX - zoomWidth / 2} ${50 - zoomHeight /3} ${zoomWidth} ${zoomHeight}`;
    }

    return (
      <div className="my-4 p-2 border rounded-lg bg-slate-50 select-none relative" ref={svgContainerRef}>
        <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium">Object Size: {trueReadings.actualObjectSizeCm.toFixed(2)} cm (LC: {VERN_LEAST_COUNT_CM} cm)</p>
            <Button variant="outline" size="sm" onClick={() => setIsZoomed(!isZoomed)}>
                <ZoomIn className="h-4 w-4 mr-1"/> {isZoomed ? "Zoom Out" : "Zoom In"}
            </Button>
        </div>
        <svg width="100%" height="150" viewBox={viewBox} style={{ transition: 'transform 0.3s ease-out', transformOrigin: 'center center' }}>
          {/* Main Scale Beam */}
          <rect x="0" y="50" width={svgTotalWidth - 50} height={BEAM_HEIGHT_PX} fill="#E0E0E0" stroke="#757575" />
          {/* Fixed Jaw */}
          <rect x="0" y={50 - JAW_THICKNESS_PX * 2} width={JAW_THICKNESS_PX} height={JAW_THICKNESS_PX * 2 + BEAM_HEIGHT_PX} fill="#BDBDBD" stroke="#757575"/>
          {/* Main Scale Markings */}
          {mainScaleDivisions}

          {/* Vernier Slider Group - Positioned by objectSize */}
          <g 
            transform={`translate(${vernierVisualOffsetXPx}, ${50 + BEAM_HEIGHT_PX})`} 
            style={{ transition: 'transform 0.3s ease-out' }}
          >
            {/* Vernier Slider Body */}
            <rect x={JAW_THICKNESS_PX} y="-2" width={vernierScaleVisualWidthPx + 5} height={VERNIER_SLIDER_HEIGHT_PX + 4} fill="#CFD8DC" stroke="#78909C" rx="2"/>
            {/* Movable Jaw */}
            <rect x="0" y={-BEAM_HEIGHT_PX - JAW_THICKNESS_PX * 2 + 2} width={JAW_THICKNESS_PX} height={JAW_THICKNESS_PX * 2 + BEAM_HEIGHT_PX -2} fill="#B0BEC5" stroke="#78909C"/>
            {/* Vernier Scale Markings on slider */}
            <g transform={`translate(${JAW_THICKNESS_PX}, 0)`}>
                {vernierScaleDivisions}
            </g>
          </g>
          
          {/* Object Being Measured */}
          <rect 
            x={JAW_THICKNESS_PX} 
            y={50 - JAW_THICKNESS_PX - 5} 
            width={objectWidthPx} 
            height={JAW_THICKNESS_PX} 
            fill="rgba(255, 165, 0, 0.7)" 
            stroke="rgba(200, 100, 0, 0.8)"
            style={{ transition: 'width 0.3s ease-out' }}
          />
        </svg>
        <p className="text-xs text-muted-foreground text-center mt-1">Top: Main Scale (cm) | Bottom (on slider): Vernier Scale (divisions)</p>
         {isZoomed && <p className="text-xs text-center text-blue-600">Zoomed View: Focus on the Vernier scale alignment.</p>}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Button variant="outline" asChild size="sm">
        <Link href="/simulations">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Simulations
        </Link>
      </Button>

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl">G9: Interactive Vernier Caliper</CardTitle>
              <CardDescription>
                Practice reading a Vernier Caliper. Least Count: {VERN_LEAST_COUNT_CM} cm.
              </CardDescription>
            </div>
            <Popover>
              <PopoverTrigger asChild><Button variant="outline" size="icon"><HelpCircle className="h-4 w-4"/></Button></PopoverTrigger>
              <PopoverContent className="w-80 text-sm">
                <p className="font-semibold mb-1">How to Read a Vernier Caliper:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li><b>Main Scale Reading (MSR):</b> Note the reading on the main scale immediately to the left of the zero mark of the Vernier scale. This is your MSR in cm.</li>
                  <li><b>Vernier Coinciding Division (VCD):</b> Look closely at the Vernier scale. Find the division on the Vernier scale that aligns perfectly with any division on the main scale. This is your VCD (a whole number).</li>
                  <li><b>Calculate Vernier Reading:</b> Multiply VCD by the Least Count (LC). (LC = {VERN_LEAST_COUNT_CM} cm).</li>
                  <li><b>Total Reading:</b> Add MSR and Vernier Reading. Total = MSR + (VCD × LC).</li>
                </ol>
                <p className="mt-2 text-xs">Use the "Zoom In" button for a closer look at the scales!</p>
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {renderEnhancedVernierScales()}

          <div className="grid md:grid-cols-2 gap-4 items-end">
            <div>
              <Label htmlFor="user-main-scale">Your Main Scale Reading (cm)</Label>
              <Input id="user-main-scale" type="number" placeholder="e.g., 2.3" value={userMainScaleCm} onChange={(e) => setUserMainScaleCm(e.target.value)} step={VERN_MAIN_SCALE_SMALLEST_DIV_CM.toString()}/>
            </div>
            <div>
              <Label htmlFor="user-vernier-div">Your Vernier Coinciding Division (0-{VERN_DIVISIONS})</Label>
              <Input id="user-vernier-div" type="number" placeholder="e.g., 4" value={userVernierDivision} onChange={(e) => setUserVernierDivision(e.target.value)} step="1" min="0" max={VERN_DIVISIONS}/>
            </div>
          </div>

          <Button onClick={handleCheckReading} className="w-full">Check My Reading</Button>

          {feedback && (
            <Alert variant={feedback.startsWith("Correct") ? "default" : "destructive"} className={feedback.startsWith("Correct") ? "bg-green-50 border-green-300 text-green-700 dark:bg-green-900/30 dark:text-green-400" : ""}>
              {feedback.startsWith("Correct") ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              <AlertTitle>{feedback.startsWith("Correct") ? "Result" : "Feedback"}</AlertTitle>
              <AlertDescription>{feedback}</AlertDescription>
            </Alert>
          )}

          {showCorrectAnswer && !feedback?.startsWith("Correct") && (
            <Card className="bg-secondary/50 p-4">
              <CardTitle className="text-sm mb-1">Correct Reading Details:</CardTitle>
              <p className="text-xs">Object Size (Approx): {trueReadings.actualObjectSizeCm.toFixed(2)} cm</p>
              <p className="text-xs">Main Scale Reading (MSR): {trueReadings.mainScaleCm.toFixed(2)} cm</p>
              <p className="text-xs">Vernier Coinciding Division (VCD): {trueReadings.vernierCoincidingDivision}</p>
              <p className="text-xs">Vernier Scale Contribution (VCD × LC): {(trueReadings.vernierCoincidingDivision * VERN_LEAST_COUNT_CM).toFixed(2)} cm</p>
              <p className="text-xs font-semibold">Total Correct Reading: {trueReadings.totalCm.toFixed(2)} cm</p>
            </Card>
          )}

          <Button onClick={generateNewObjectSize} variant="outline" className="w-full">
            <RefreshCw className="mr-2 h-4 w-4"/> New Measurement / Next Object
          </Button>
          
          <CardFooter className="text-xs text-muted-foreground p-0 pt-4">
             Future: Micrometer screw gauge, interactive line selection, zero error.
          </CardFooter>
        </CardContent>
      </Card>
    </div>
  );
}