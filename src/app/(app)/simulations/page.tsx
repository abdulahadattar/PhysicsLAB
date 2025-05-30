
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SimulationMetadata } from '@/lib/types';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

export default function SimulationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [simulations, setSimulations] = useState<SimulationMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchSimulations = async () => {
      if (!db) {
        setError("Firestore is not initialized. Check Firebase configuration.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const querySnapshot = await getDocs(collection(db, "simulationsMeta"));
        const simulationsData: SimulationMetadata[] = [];
        querySnapshot.forEach((doc) => {
          simulationsData.push({ id: doc.id, ...doc.data() } as SimulationMetadata);
        });
        setSimulations(simulationsData);

        // Extract unique categories
        const uniqueCategories = Array.from(new Set(simulationsData.map(sim => sim.category).filter(Boolean) as string[]));
        setCategories(uniqueCategories.sort());

        setLoading(false);
      } catch (err) {
        console.error("Error fetching simulations metadata:", err);
        setError("Failed to load simulations. Please try again later.");
        setSimulations([]); // Clear simulations on error
        setCategories([]); // Clear categories on error
        setLoading(false);
      }
    };

    fetchSimulations();
  }, []);

  /**
   * Filters simulations based on the current search term and selected category.
   * The filter is case-insensitive.
   */
  const filteredSimulations = useMemo(() => {
    return simulations.filter(sim => {
      const matchesSearchTerm =
        sim.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sim.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === "all" || 
                              (sim.category && sim.category.toLowerCase() === selectedCategory.toLowerCase());
      return matchesSearchTerm && matchesCategory;
    });
  }, [searchTerm, selectedGrade, selectedCategory]);

  return (
    <div className="space-y-8">
      <Card className="animate-in fade-in-0 slide-in-from-top-5 duration-500 ease-out">
        <CardHeader>
          <CardTitle className="text-3xl">Interactive Physics Simulations</CardTitle>
          <CardDescription>Explore various physics concepts through hands-on simulations. Adjust parameters and observe the outcomes. Filter by grade or category.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search simulations by topic, keyword, or category..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading && Array.from({ length: 8 }).map((_, index) => (
           <Card key={index} className="flex flex-col overflow-hidden shadow-md animate-pulse">
             <Skeleton className="relative h-40 bg-gray-300" />
             <CardHeader>
               <Skeleton className="h-6 w-3/4 mb-2" />
               <Skeleton className="h-4 w-1/2" />
             </CardHeader>
             <CardContent className="flex-grow">
               <Skeleton className="h-12 w-full" />
             </CardContent>
             <div className="p-6 pt-0">
               <Skeleton className="h-10 w-full" />
             </div>
           </Card>
        ))}

        {error && (
          <p className="md:col-span-2 lg:col-span-3 xl:col-span-4 text-center text-destructive py-10">
            {error}
          </p>
        )}

        {!loading && !error && filteredSimulations.map((sim, index) => {
          return (
            <Card 
              key={sim.simId}
              className="flex flex-col overflow-hidden shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="relative h-40 w-full">
                 {/* Use Next.js Image with fill for thumbnails */}
                <Image src={sim.thumbnailUrl} alt={sim.title} fill style={{ objectFit: 'cover' }} />
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{sim.title}</CardTitle>
                <CardDescription>{sim.category}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                 <p className="text-sm text-muted-foreground">{sim.description}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                </div>
              </CardContent>
              <CardFooter className="mt-auto pt-3"> {/* Ensure footer is at bottom */}
                <Link href={`/simulations/${topic.id}`} passHref className="w-full">
                  <Button className="w-full text-sm">Launch Simulation</Button>
                </Link>
              </CardFooter>
            </Card>
          );
        })}

        {!loading && !error && filteredSimulations.length === 0 && (
          <p className="md:col-span-2 lg:col-span-3 xl:col-span-4 text-center text-muted-foreground py-10">
            No simulations found matching your criteria.
          </p>
        )}
      </div>
    </div>
  );
