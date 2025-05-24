
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, HelpCircle, Play, Pause, RefreshCw, Waves } from "lucide-react";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

// Simulation Constants
const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 200;
const Y_CENTER = CANVAS_HEIGHT / 2;

export default function PhetWaveOnAStringG10Page() {
  const [amplitude, setAmplitude] = useState(30); // pixels
  const [frequency, setFrequency] = useState(0.5); // Hz
  const [damping, setDamping] = useState(0.01); // Damping factor (0 to ~0.1)
  const [tension, setTension] = useState(1.5); // Conceptual tension (1=low, 2=medium, 3=high)

  const [time, setTime] = useState(0); // Animation time in seconds
  const [isRunning, setIsRunning] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const lastFrameTimeRef = useRef<number>(0);

  // Calculated wave properties
  const waveSpeed = useMemo(() => 50 + (tension - 1) * 50, [tension]); // pixels/second, scales with tension
  const wavelength = useMemo(() => (frequency > 0 ? waveSpeed / frequency : Infinity), [waveSpeed, frequency]);
  const angularFrequency = useMemo(() => 2 * Math.PI * frequency, [frequency]); // omega
  const waveNumber = useMemo(() => (wavelength > 0 && isFinite(wavelength) ? 2 * Math.PI / wavelength : 0), [wavelength]); // k

  const drawWave = useCallback((ctx: CanvasRenderingContext2D, currentTime: number) => {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw axis
    ctx.beginPath();
    ctx.moveTo(0, Y_CENTER);
    ctx.lineTo(CANVAS_WIDTH, Y_CENTER);
    ctx.strokeStyle = "hsl(var(--muted-foreground))";
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Draw wave
    ctx.beginPath();
    ctx.strokeStyle = "hsl(var(--primary))";
    ctx.lineWidth = 2;

    for (let x = 0; x < CANVAS_WIDTH; x++) {
      // Calculate damping effect: amplitude decreases as x increases
      // A simple exponential decay based on distance from the start of the wave
      const dampingEffect = Math.exp(-damping * (x / CANVAS_WIDTH) * 5); // Scaled damping
      const currentAmplitude = amplitude * dampingEffect;
      
      const yOffset = currentAmplitude * Math.sin(waveNumber * x - angularFrequency * currentTime);
      const y = Y_CENTER - yOffset;
      
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Draw oscillator (simple circle at x=0)
    const oscillatorY = Y_CENTER - amplitude * Math.sin(-angularFrequency * currentTime);
    ctx.beginPath();
    ctx.arc(0, oscillatorY, 5, 0, 2 * Math.PI);
    ctx.fillStyle = "hsl(var(--destructive))";
    ctx.fill();

  }, [amplitude, waveNumber, angularFrequency, damping]);

  const animate = useCallback((timestamp: number) => {
    if (!lastFrameTimeRef.current) {
      lastFrameTimeRef.current = timestamp;
    }
    const deltaTime = (timestamp - lastFrameTimeRef.current) / 1000; // seconds
    lastFrameTimeRef.current = timestamp;

    setTime(prevTime => prevTime + deltaTime);

    if (isRunningRef.current) {
      requestRef.current = requestAnimationFrame(animate);
    }
  }, []);
  
  const isRunningRef = useRef(isRunning);
  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      drawWave(ctx, time);
    }
  }, [time, drawWave, amplitude, frequency, damping, tension]); // Re-draw if parameters change too


  useEffect(() => {
    if (isRunning) {
      lastFrameTimeRef.current = performance.now(); 
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      // Draw static frame when paused
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx) {
        drawWave(ctx, time);
      }
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isRunning, animate, drawWave, time]);


  const handleToggleRun = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    lastFrameTimeRef.current = 0;
    // Initial draw at t=0
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      drawWave(ctx, 0);
    }
  };

  useEffect(handleReset, [amplitude, frequency, damping, tension]); // Reset if parameters change


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
              <CardTitle className="text-3xl flex items-center gap-2">
                <Waves className="h-8 w-8 text-primary" />
                G10: PhET: Wave on a String
              </CardTitle>
              <CardDescription>
                Create transverse waves. Adjust amplitude, frequency, damping, and tension.
                Observe wave properties like wavelength and speed. 
                (STBB Relevance: Transverse Waves, Wavelength, Frequency, Amplitude, Speed)
              </CardDescription>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon"><HelpCircle className="h-5 w-5"/></Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 text-sm">
                 <h4 className="font-medium leading-none mb-2">Wave on a String Simulator</h4>
                 <p className="text-muted-foreground">
                    - Use sliders to adjust Wave Amplitude, Frequency, Damping, and Tension.
                    <br/>- Observe the transverse wave on the canvas.
                    <br/>- Calculated Wave Speed and Wavelength will update.
                    <br/>- Use Play/Pause to control animation, Reset to start over.
                    <br/>- Currently simulates an infinitely long string (no reflections).
                 </p>
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Controls Column */}
            <div className="md:col-span-1 space-y-6">
              <Card>
                <CardHeader><CardTitle className="text-xl">Controls</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="amplitude-slider">Amplitude: {amplitude.toFixed(0)} px</Label>
                    <Slider 
                      id="amplitude-slider" 
                      min={5} 
                      max={Y_CENTER - 10} 
                      step={1} 
                      value={[amplitude]} 
                      onValueChange={(val) => setAmplitude(val[0])} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="frequency-slider">Frequency: {frequency.toFixed(2)} Hz</Label>
                    <Slider 
                      id="frequency-slider" 
                      min={0.1} 
                      max={2} 
                      step={0.05} 
                      value={[frequency]} 
                      onValueChange={(val) => setFrequency(val[0])} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="damping-slider">Damping: {(damping * 100).toFixed(0)}%</Label>
                    <Slider 
                      id="damping-slider" 
                      min={0} 
                      max={0.1} 
                      step={0.005} 
                      value={[damping]} 
                      onValueChange={(val) => setDamping(val[0])} 
                    />
                  </div>
                   <div>
                    <Label htmlFor="tension-slider">Tension: {tension.toFixed(1)} (Conceptual)</Label>
                    <Slider 
                      id="tension-slider" 
                      min={1} // Low
                      max={3} // High
                      step={0.1} 
                      value={[tension]} 
                      onValueChange={(val) => setTension(val[0])} 
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button onClick={handleToggleRun} className="flex-1">
                      {isRunning ? <Pause className="mr-2 h-4 w-4"/> : <Play className="mr-2 h-4 w-4"/>}
                      {isRunning ? "Pause" : "Play"}
                    </Button>
                    <Button onClick={handleReset} variant="outline"><RefreshCw className="mr-2 h-4 w-4"/>Reset</Button>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-xl">Wave Properties</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>Wave Speed (v): <span className="font-semibold">{waveSpeed.toFixed(0)} px/s</span></p>
                  <p>Wavelength (λ): <span className="font-semibold">{isFinite(wavelength) ? wavelength.toFixed(1) : "N/A"} px</span></p>
                  <p>Period (T): <span className="font-semibold">{frequency > 0 ? (1/frequency).toFixed(2) : "N/A"} s</span></p>
                  <Separator className="my-1"/>
                  <p className="text-xs text-muted-foreground">Anim. Time: {time.toFixed(2)}s</p>
                </CardContent>
              </Card>
            </div>

            {/* Visualization Column */}
            <div className="md:col-span-2">
              <Card className="h-full">
                <CardHeader><CardTitle className="text-xl">Wave Visualization</CardTitle></CardHeader>
                <CardContent className="flex items-center justify-center p-0">
                  <canvas 
                    ref={canvasRef} 
                    width={CANVAS_WIDTH} 
                    height={CANVAS_HEIGHT} 
                    className="bg-muted rounded-md border border-input shadow-inner"
                  ></canvas>
                </CardContent>
                 <CardFooter className="pt-4">
                    <p className="text-xs text-muted-foreground">
                        Observe how changing amplitude, frequency, damping, and tension affects the transverse wave. 
                        Currently simulates an infinitely long string (no end reflections).
                    </p>
                </CardFooter>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

