
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, HelpCircle, Play, Pause, RefreshCw, Waves } from "lucide-react";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

// Simulation Constants
const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 200;
const DEFAULT_WAVE_SPEED = 50; // pixels per second

export default function WaveGeneratorG10Page() {
  const [amplitude, setAmplitude] = useState(30); // pixels
  const [frequency, setFrequency] = useState(0.5); // Hz (cycles per second)
  const [waveSpeed] = useState(DEFAULT_WAVE_SPEED); // pixels/second
  
  const [time, setTime] = useState(0); // Animation time in seconds
  const [isRunning, setIsRunning] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const lastFrameTimeRef = useRef<number>(0);

  const wavelength = frequency > 0 ? waveSpeed / frequency : Infinity; // pixels
  const angularFrequency = 2 * Math.PI * frequency; // omega
  const waveNumber = frequency > 0 ? 2 * Math.PI / wavelength : 0; // k

  const drawWave = useCallback((ctx: CanvasRenderingContext2D, currentTime: number) => {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    const midY = CANVAS_HEIGHT / 2;

    // Draw axis
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(CANVAS_WIDTH, midY);
    ctx.strokeStyle = "hsl(var(--muted-foreground))";
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Draw wave
    ctx.beginPath();
    ctx.strokeStyle = "hsl(var(--primary))";
    ctx.lineWidth = 2;

    for (let x = 0; x < CANVAS_WIDTH; x++) {
      const y = midY - amplitude * Math.sin(waveNumber * x - angularFrequency * currentTime);
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  }, [amplitude, waveNumber, angularFrequency]);

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
  }, [time, drawWave]);


  useEffect(() => {
    if (isRunning) {
      lastFrameTimeRef.current = performance.now(); // Reset for accurate deltaTime
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isRunning, animate]);


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
                Wave Generator
              </CardTitle>
              <CardDescription>
                Grade 10 - STBB. Observe transverse wave motion. Adjust parameters like frequency and amplitude to see their effects.
              </CardDescription>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon"><HelpCircle className="h-5 w-5"/></Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 text-sm">
                 <h4 className="font-medium leading-none mb-2">Wave Generator Help</h4>
                 <p className="text-muted-foreground">
                    - Use sliders to adjust Wave Amplitude and Frequency.
                    <br/>- Observe the transverse wave on the canvas.
                    <br/>- Wave Speed is constant in this simulation. Wavelength is calculated (λ = v/f).
                    <br/>- Use Play/Pause to control animation, Reset to start over.
                    <br/>- Longitudinal waves will be added in a future update.
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
                      max={CANVAS_HEIGHT / 2 - 10} 
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
                  <p>Wave Speed (v): <span className="font-semibold">{waveSpeed.toFixed(0)} px/s</span> (Fixed)</p>
                  <p>Wavelength (λ): <span className="font-semibold">{isFinite(wavelength) ? wavelength.toFixed(1) : "N/A"} px</span></p>
                  <p>Angular Freq. (ω): <span className="font-semibold">{angularFrequency.toFixed(2)} rad/s</span></p>
                  <p>Wave Number (k): <span className="font-semibold">{waveNumber.toFixed(3)} rad/px</span></p>
                  <p className="text-xs text-muted-foreground pt-1">Anim. Time: {time.toFixed(2)}s</p>
                </CardContent>
              </Card>
            </div>

            {/* Visualization Column */}
            <div className="md:col-span-2">
              <Card className="h-full">
                <CardHeader><CardTitle className="text-xl">Transverse Wave Visualization</CardTitle></CardHeader>
                <CardContent className="flex items-center justify-center p-0">
                  <canvas 
                    ref={canvasRef} 
                    width={CANVAS_WIDTH} 
                    height={CANVAS_HEIGHT} 
                    className="bg-muted rounded-md border border-input shadow-inner"
                  ></canvas>
                </CardContent>
                <CardFooter>
                    <p className="text-xs text-muted-foreground">
                        This simulation shows a transverse wave. Adjust controls to see how amplitude and frequency affect its appearance and motion.
                    </p>
                </CardFooter>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader><CardTitle>Future Enhancements</CardTitle></CardHeader>
        <CardContent>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Add option for Longitudinal Waves visualization.</li>
                <li>Implement controls for Wave Speed or Medium Density/Tension.</li>
                <li>Show standing waves with fixed/loose end boundary conditions.</li>
                <li>Add visual superposition of two waves.</li>
            </ul>
        </CardContent>
      </Card>
    </div>
  );
}
