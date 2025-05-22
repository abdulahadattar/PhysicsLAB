
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Brain, Camera, FileImage, Send, Sparkles, Loader2, WifiOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';
import { aiLearningAssistant, type AiLearningAssistantInput, type AiLearningAssistantOutput } from '@/ai/flows/ai-learning-assistant-flow';

export default function LearnWithAiPage() {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  
  const [textQuery, setTextQuery] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  // const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null); // Keep if needed for other processing
  const [aiResponse, setAiResponse] = useState<AiLearningAssistantOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  const getCameraPermission = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast({
        variant: 'destructive',
        title: 'Camera Not Supported',
        description: 'Your browser does not support camera access.',
      });
      setHasCameraPermission(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setHasCameraPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
             setIsStreaming(true);
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera permissions in your browser settings to use this feature.',
      });
    }
  }, [toast]);

  useEffect(() => {
    if (hasCameraPermission === null) {
       getCameraPermission();
    }
    
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [hasCameraPermission, getCameraPermission]);


  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // setUploadedImageFile(file); // Keep if file object needed elsewhere
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const captureFromCamera = () => {
    if (videoRef.current && isStreaming && videoRef.current.readyState >= videoRef.current.HAVE_METADATA) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUri = canvas.toDataURL('image/png');
        setUploadedImage(dataUri);
      }
       toast({ title: "Image Captured", description: "Image from camera has been captured." });
    } else {
       toast({ title: "Camera Not Ready", description: "Please enable and start the camera stream first, or wait for it to initialize.", variant: "destructive" });
    }
  };

  const handleSubmitToAI = async () => {
    if (!isOnline) {
      toast({
        title: "Offline",
        description: "AI features require an internet connection. Please connect and try again.",
        variant: "destructive",
      });
      return;
    }
    if (!textQuery.trim() && !uploadedImage) {
      toast({
        title: "Input Required",
        description: "Please provide a question or an image for the AI.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    setAiResponse(null);

    try {
      const input: AiLearningAssistantInput = {
        userQuery: textQuery,
        imageDataUri: uploadedImage || undefined,
      };
      const response = await aiLearningAssistant(input);
      setAiResponse(response);
    } catch (error) {
      console.error("Error getting AI assistance:", error);
      toast({
        title: "AI Error",
        description: "Could not get a response from the AI. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <div className="inline-block mx-auto bg-primary/10 p-3 rounded-full mb-2">
            <Brain className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl">Learn with AI</CardTitle>
          <CardDescription>
            Ask physics questions, get explanations, or analyze images with our AI assistant.
          </CardDescription>
        </CardHeader>
      </Card>

      {!isOnline && (
        <Alert variant="destructive">
          <WifiOff className="h-4 w-4" />
          <AlertTitle>You are currently offline</AlertTitle>
          <AlertDescription>
            The AI learning assistant requires an internet connection to function. Please connect to the internet to use this feature.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Camera className="h-5 w-5 text-primary"/>Camera & Image Input</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-video bg-muted rounded-md overflow-hidden relative">
              <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
              {hasCameraPermission === false && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 p-4">
                    <Alert variant="destructive" className="w-full">
                        <AlertTitle>Camera Access Required</AlertTitle>
                        <AlertDescription>
                            Please allow camera access to use this feature.
                             <Button onClick={getCameraPermission} size="sm" className="mt-2">Try Again</Button>
                        </AlertDescription>
                    </Alert>
                </div>
              )}
               {hasCameraPermission === true && !isStreaming && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-sm text-muted-foreground p-2 bg-background/80 rounded-md">Initializing camera...</p>
                </div>
              )}
            </div>
            <div className="flex gap-2">
                 <Button onClick={captureFromCamera} disabled={!isStreaming || hasCameraPermission !== true} className="flex-1">
                    Capture from Camera
                </Button>
                <Label htmlFor="image-upload" className="flex-1">
                    <Button asChild className="w-full cursor-pointer">
                        <span><FileImage className="mr-2 h-4 w-4" /> Upload Image</span>
                    </Button>
                    <Input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </Label>
            </div>
            
            {uploadedImage && (
              <div className="mt-4 space-y-2">
                <Label>Preview:</Label>
                <Image src={uploadedImage} alt="Uploaded preview" width={200} height={150} className="rounded-md border object-contain" />
                <Button variant="outline" size="sm" onClick={() => { setUploadedImage(null); /* setUploadedImageFile(null); */ }}>Clear Image</Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary"/>AI Interaction</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="ai-query">Your Question or Prompt</Label>
              <Textarea
                id="ai-query"
                placeholder="Ask about a physics concept, explain this diagram, what formula applies here?..."
                rows={5}
                value={textQuery}
                onChange={(e) => setTextQuery(e.target.value)}
              />
            </div>
            <Button onClick={handleSubmitToAI} disabled={isLoading || !isOnline} className="w-full">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              {isLoading ? "Thinking..." : (isOnline ? "Ask AI" : "Offline - AI Disabled")}
            </Button>
            
            {aiResponse && (
              <div className="mt-4 p-4 border rounded-md bg-secondary/30 space-y-3">
                <h3 className="font-semibold text-lg">AI Response:</h3>
                <p className="text-sm whitespace-pre-wrap">{aiResponse.explanation}</p>
                {aiResponse.relatedConcepts && aiResponse.relatedConcepts.length > 0 && (
                    <div>
                        <h4 className="font-medium">Related Concepts:</h4>
                        <ul className="list-disc list-inside text-sm text-muted-foreground">
                            {aiResponse.relatedConcepts.map((concept, index) => <li key={index}>{concept}</li>)}
                        </ul>
                    </div>
                )}
                 {aiResponse.confidence && (
                    <p className="text-xs text-muted-foreground">Confidence: {aiResponse.confidence}</p>
                 )}
              </div>
            )}
             {!isLoading && !aiResponse && (
                <div className="mt-4 p-4 border rounded-md border-dashed text-center text-muted-foreground">
                    <Brain className="mx-auto h-8 w-8 mb-2"/>
                    {isOnline ? "The AI's response will appear here." : "AI is offline. Connect to the internet to ask questions."}
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
