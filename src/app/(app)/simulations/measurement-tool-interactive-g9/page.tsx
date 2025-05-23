// src/app/(app)/simulations/measurement-tool-interactive-g9/page.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, HelpCircle, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const VERN_LEAST_COUNT_CM = 0.01; // Least count in cm
const VERN_MAIN_SCALE_DIV_CM = 0.1; // Smallest division on main scale in cm
const VERN_DIVISIONS = 10; // Number of divisions on Vernier scale

export default function MeasurementToolInteractiveG9Page() {
  const { toast } = useToast();
  const [objectSizeCm, setObjectSizeCm] = useState(2.34); // Actual size in cm
  
  const [userMainScaleCm, setUserMainScaleCm] = useState("");
  const [userVernierDivision, setUserVernierDivision] = useState("");
  
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);

  const generateNewObjectSize = useCallback(() => {
    // Generates a random size between 0.1 cm and 5.0 cm, with 2 decimal places
    const newSize = parseFloat((Math.random() * (5.0 - 0.1) + 0.1).toFixed(2));
    setObjectSizeCm(newSize);
    setUserMainScaleCm("");
    setUserVernierDivision("");
    setFeedback(null);
    setShowCorrectAnswer(false);
  }, []);

  useEffect(() => {
    generateNewObjectSize();
  }, [generateNewObjectSize]);

  const trueReadings = useMemo(() => {
    const mainScaleReading = Math.floor(objectSizeCm / VERN_MAIN_SCALE_DIV_CM) * VERN_MAIN_SCALE_DIV_CM;
    const vernierReadingValue = objectSizeCm - mainScaleReading;
    // Find the Vernier division that aligns.
    // Multiply by 100 to work with integers for precision with least count
    const vernierCoincidingDivision = Math.round((vernierReadingValue * 100) / (VERN_LEAST_COUNT_CM * 100)); 
    
    return {
      mainScaleCm: parseFloat(mainScaleReading.toFixed(2)),
      vernierCoincidingDivision: vernierCoincidingDivision,
      totalCm: parseFloat(objectSizeCm.toFixed(2)),
    };
  }, [objectSizeCm]);

  const handleCheckReading = () => {
    const mainScaleInput = parseFloat(userMainScaleCm);
    const vernierDivisionInput = parseInt(userVernierDivision, 10);

    if (isNaN(mainScaleInput) || isNaN(vernierDivisionInput)) {
      setFeedback("Please enter valid numbers for both readings.");
      setShowCorrectAnswer(false);
      return;
    }

    const calculatedUserReading = parseFloat((mainScaleInput + vernierDivisionInput * VERN_LEAST_COUNT_CM).toFixed(2));
    
    if (calculatedUserReading === trueReadings.totalCm) {
      setFeedback(`Correct! Your reading is ${calculatedUserReading.toFixed(2)} cm.`);
      toast({ title: "Correct!", description: "Well done!" });
    } else {
      setFeedback(`Not quite. Your reading: ${calculatedUserReading.toFixed(2)} cm. True reading: ${trueReadings.totalCm.toFixed(2)} cm.`);
      toast({ title: "Incorrect", description: `Try again or check the correct answer.`, variant: "destructive" });
    }
    setShowCorrectAnswer(true);
  };

  // Simplified visual representation of Vernier Caliper scales
  const renderVernierScales = () => {
    const mainScaleStart = Math.max(0, Math.floor(trueReadings.mainScaleCm / VERN_MAIN_SCALE_DIV_CM) * VERN_MAIN_SCALE_DIV_CM - VERN_MAIN_SCALE_DIV_CM * 2);
    const mainScaleEnd = mainScaleStart + VERN_MAIN_SCALE_DIV_CM * 15; // Show a few divisions
    const mainScaleDivisions = [];
    for (let i = mainScaleStart; i <= mainScaleEnd; i += VERN_MAIN_SCALE_DIV_CM) {
      mainScaleDivisions.push(parseFloat(i.toFixed(2)));
    }

    // Position of the Vernier scale zero relative to the start of the displayed main scale
    const vernierZeroOffsetPixels = ((objectSizeCm - mainScaleStart) / VERN_MAIN_SCALE_DIV_CM) * 30; // 30px per main scale division

    return (
      <div className="my-4 p-4 border rounded-lg bg-muted overflow-x-auto select-none">
        <p className="text-sm font-medium mb-2">Vernier Caliper Reading (Object Size: {objectSizeCm.toFixed(2)} cm)</p>
        {/* Main Scale */}
        <div className="relative h-10 bg-background border border-foreground/30 rounded mb-1 flex items-end" style={{ width: `${mainScaleDivisions.length * 30}px` }}>
          {mainScaleDivisions.map((val, index) => (
            <div key={`main-${index}`} className="relative h-full flex flex-col justify-end items-center" style={{ width: "30px" }}>
              <div className={`absolute top-0 h-3 w-px bg-foreground ${val % (VERN_MAIN_SCALE_DIV_CM * 5) === 0 ? 'h-5' : ''}`}></div>
              {val % (VERN_MAIN_SCALE_DIV_CM * 5) === 0 && <span className="text-xs absolute -top-4">{val.toFixed(1)}</span>}
            </div>
          ))}
           {/* Vernier Scale (Simplified visual) */}
          <div 
            className="absolute bottom-0 h-8 bg-secondary/50 border-t-2 border-l-2 border-primary rounded-tl-md flex items-end"
            style={{ left: `${vernierZeroOffsetPixels}px`, width: `${VERN_DIVISIONS * (VERN_LEAST_COUNT_CM / VERN_MAIN_SCALE_DIV_CM * 30) + 5}px` }} // +5 for some padding
          >
             {Array.from({ length: VERN_DIVISIONS + 1 }).map((_, vIndex) => (
              <div key={`vern-${vIndex}`} className="relative h-full flex flex-col justify-start items-center" style={{ width: `${(VERN_LEAST_COUNT_CM / VERN_MAIN_SCALE_DIV_CM * 30)}px` }}>
                <div className={`absolute bottom-0 h-2.5 w-px bg-primary ${vIndex % 5 === 0 ? 'h-4' : ''}`}></div>
                 {vIndex % 5 === 0 && <span className="text-xs absolute -bottom-4 text-primary">{vIndex}</span>}
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground text-center">Top: Main Scale (cm) | Bottom: Vernier Scale (divisions)</p>
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
              <CardTitle className="text-3xl">G9: Measurement Tool Interactive - Vernier Caliper</CardTitle>
              <CardDescription>
                Practice reading a Vernier Caliper. Least Count: {VERN_LEAST_COUNT_CM} cm.
                <br /> STBB Relevance: Measurements, Significant Figures, Precision and Accuracy, Measuring Instruments (G9, Unit 1).
              </CardDescription>
            </div>
            <Popover>
              <PopoverTrigger asChild><Button variant="outline" size="icon"><HelpCircle className="h-4 w-4"/></Button></PopoverTrigger>
              <PopoverContent className="w-72 text-sm">
                <p className="font-semibold mb-1">How to Use:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Observe the simulated Vernier Caliper scales for the current object.</li>
                  <li>Identify the Main Scale Reading (the mark on the main scale just before the Vernier scale's zero).</li>
                  <li>Find which Vernier Scale division aligns best with a Main Scale division.</li>
                  <li>Enter these values and click "Check My Reading".</li>
                  <li>Click "New Object" for a new measurement challenge.</li>
                </ol>
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {renderVernierScales()}

          <div className="grid md:grid-cols-2 gap-4 items-end">
            <div>
              <Label htmlFor="user-main-scale">Your Main Scale Reading (cm)</Label>
              <Input id="user-main-scale" type="number" placeholder="e.g., 2.3" value={userMainScaleCm} onChange={(e) => setUserMainScaleCm(e.target.value)} step="0.1"/>
            </div>
            <div>
              <Label htmlFor="user-vernier-div">Your Vernier Coinciding Division</Label>
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
              <p className="text-xs">True Object Size: {trueReadings.totalCm.toFixed(2)} cm</p>
              <p className="text-xs">Main Scale Reading: {trueReadings.mainScaleCm.toFixed(2)} cm</p>
              <p className="text-xs">Vernier Coinciding Division: {trueReadings.vernierCoincidingDivision}</p>
              <p className="text-xs">Vernier Scale Contribution: {(trueReadings.vernierCoincidingDivision * VERN_LEAST_COUNT_CM).toFixed(2)} cm</p>
            </Card>
          )}

          <Button onClick={generateNewObjectSize} variant="outline" className="w-full">
            <RefreshCw className="mr-2 h-4 w-4"/> New Measurement / Next Object
          </Button>

          <CardFooter className="text-xs text-muted-foreground p-0 pt-4">
             This simulation focuses on reading the Vernier Caliper. Future enhancements could include interactive micrometer screw gauge, ruler, and protractor simulations, as well as zero error adjustments.
          </CardFooter>
        </CardContent>
      </Card>
    </div>
  );
}

    