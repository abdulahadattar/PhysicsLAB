
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FlaskConical, Loader2, AlertTriangle } from "lucide-react";
import type { LabEquipmentItem } from '@/lib/types';
import Image from 'next/image'; // Import next/image

// Directly import the JSON data for client-side rendering
import labEquipmentData from '@/data/lab-equipment.json';


export default function LabEquipmentPage() {
  const [equipmentList, setEquipmentList] = useState<LabEquipmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEquipment = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate async fetch, but use imported data
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate small delay
      const data: LabEquipmentItem[] = labEquipmentData;
      if (!data || data.length === 0) {
        setError("No lab equipment data found. The data file might be empty.");
      }
      setEquipmentList(data);
    } catch (e) {
      console.error("Error loading lab equipment:", e);
      setError(e instanceof Error ? e.message : "Could not load lab equipment data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEquipment();
  }, [loadEquipment]);

  return (
    <div className="space-y-6">
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <div className="inline-block mx-auto bg-primary/10 p-3 rounded-full mb-2">
             <FlaskConical className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl">Common Physics Lab Equipment</CardTitle>
          <CardDescription>Explore common equipment used in physics laboratories, their purpose, and working principles.</CardDescription>
        </CardHeader>
      </Card>

      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-3">Loading lab equipment...</p>
        </div>
      )}
      {error && !isLoading && (
         <Card><CardContent className="pt-6"><Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert></CardContent></Card>
      )}

      {!isLoading && !error && equipmentList.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {equipmentList.map((item) => (
            <Card key={item.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl">{item.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow space-y-2">
                {item.imagePath && (
                  <div className="relative h-40 w-full mb-2 rounded-md overflow-hidden bg-muted">
                    <Image
                      src={item.imagePath}
                      alt={item.name}
                      layout="fill"
                      objectFit="contain" // 'contain' might be better for equipment images
                      data-ai-hint={`${item.name.toLowerCase()} physics equipment`}
                    />
                  </div>
                )}
                {!item.imagePath && item.imagePlaceholderText && (
                  <div className="h-40 w-full mb-2 rounded-md bg-secondary/30 flex items-center justify-center text-muted-foreground text-sm p-2">
                    {item.imagePlaceholderText}
                  </div>
                )}
                <p className="text-sm"><span className="font-semibold">Purpose:</span> {item.purpose}</p>
                <p className="text-sm"><span className="font-semibold">Principle:</span> {item.principle}</p>
                {item.typicalExperiments && item.typicalExperiments.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold">Typical Experiments:</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground pl-4">
                      {item.typicalExperiments.map((exp, idx) => <li key={idx}>{exp}</li>)}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {!isLoading && !error && equipmentList.length === 0 && (
         <Card><CardContent className="pt-6 text-center text-muted-foreground">No lab equipment data available.</CardContent></Card>
      )}
    </div>
  );
}
