
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"; // Added CardFooter
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SIMULATION_TOPICS, SIMULATION_CATEGORIES } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Search, Orbit, LineChart, Move, Archive, Atom, Waves, Projector, Zap, Network, Binary, Ruler, Weight, Replace, Sigma, BatteryCharging, MoveVertical, Timer, PersonStanding, Bug, Droplets, GripVertical, RefreshCw, Anchor, Pipette, Magnet, Activity, Radiation, SigmaSquare, Route, Combine, TestTube, RadioTower, Wind, Cable, Cog, Aperture, BrainCircuit, AlignCenter, Album, BookKey, FunctionSquare, Sparkles, Rocket, DraftingCompass, Microscope, SlidersHorizontal, Recycle, Milestone, SquareAsterisk, Dna, Bot, GitFork, BinaryIcon, AreaChart, ArrowDown, Box, Car, CircleDot, Hand, Heater, Leaf, Layers, Music2, MinusSquare, Plug, Radio, Satellite, BatteryWarning, Square, SquareRadical, StretchHorizontal, ThermometerSnowflake, Triangle, Users as UsersIcon, Scale } from "lucide-react";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from '@/components/ui/scroll-area';
import type { SimulationTopic } from '@/lib/types';


export default function SimulationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [studyGrades, setStudyGrades] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    // Extract unique grades from SIMULATION_TOPICS for the filter
    // Ensure "Advanced" is handled correctly if present and that sorting is numerical where possible
    const gradeOrder = ["9", "10", "11", "12", "Advanced"];
    const uniqueGrades = Array.from(new Set(SIMULATION_TOPICS.map(topic => {
        // Handle multi-grade strings like "9/10" or "11 / 12 / Advanced"
        const parts = topic.grade.split('/').map(g => g.trim());
        return parts;
    }).flat())).sort((a, b) => {
        const indexA = gradeOrder.indexOf(a);
        const indexB = gradeOrder.indexOf(b);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        const numA = parseInt(a);
        const numB = parseInt(b);
        if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
        if (!isNaN(numA)) return -1;
        if (!isNaN(numB)) return 1;
        return a.localeCompare(b);
    }).map(g => ({ id: g, name: g.toLowerCase() === 'advanced' ? "Advanced" : `Grade ${g}` }));
    
    setStudyGrades(uniqueGrades);
  }, []);


  const filteredSimulations = useMemo(() => {
    return SIMULATION_TOPICS.filter(topic => {
      const matchesSearchTerm = topic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                topic.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                (topic.categories && topic.categories.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase())));
      
      const topicGrades = topic.grade.split('/').map(g => g.trim().toLowerCase());
      const matchesGrade = selectedGrade === "all" || 
                           topicGrades.some(tg => tg === selectedGrade.toLowerCase());

      const matchesCategory = selectedCategory === "all" || 
                              (topic.categories && topic.categories.includes(selectedCategory));
      
      return matchesSearchTerm && matchesGrade && matchesCategory;
    }).sort((a,b) => { 
        const gradeA = parseInt(a.grade.split('/')[0].trim());
        const gradeB = parseInt(b.grade.split('/')[0].trim());
        if (!isNaN(gradeA) && !isNaN(gradeB) && gradeA !== gradeB) {
            return gradeA - gradeB;
        }
        if(!isNaN(gradeA) && isNaN(gradeB)) return -1; // Numbers before "Advanced"
        if(isNaN(gradeA) && !isNaN(gradeB)) return 1;  // "Advanced" after numbers
        if(isNaN(gradeA) && isNaN(gradeB)) { // Both might be "Advanced" or other non-numeric
            if (a.grade.toLowerCase().includes('advanced') && !b.grade.toLowerCase().includes('advanced')) return 1;
            if (!a.grade.toLowerCase().includes('advanced') && b.grade.toLowerCase().includes('advanced')) return -1;
        }
        return a.name.localeCompare(b.name);
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
            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Grade Level</SelectLabel>
                  <SelectItem value="all">All Grades</SelectItem>
                  {studyGrades.map(grade => (
                    <SelectItem key={grade.id} value={grade.id.toLowerCase()}>{grade.name}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Category</SelectLabel>
                  <SelectItem value="all">All Categories</SelectItem>
                  {SIMULATION_CATEGORIES.sort().map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredSimulations.map((topic: SimulationTopic, index: number) => {
          const IconComponent = topic.icon || Orbit; 
          const isPlaceholderImage = !topic.image || topic.image.startsWith("https://placehold.co");
          return (
            <Card 
              key={topic.id} 
              className="flex flex-col overflow-hidden shadow-md hover:shadow-lg transition-shadow animate-in fade-in-0 slide-in-from-bottom-5 duration-500 ease-out"
              style={{ animationDelay: `${index * 50}ms` }} 
            >
              <div className="relative h-40 bg-secondary/30 flex items-center justify-center" data-ai-hint={topic.aiHint || "physics diagram"}>
                {isPlaceholderImage ? (
                  <IconComponent className="h-16 w-16 text-primary/70" strokeWidth={1.5}/>
                ) : (
                  <Image src={topic.image!} alt={topic.name} layout="fill" objectFit="cover" />
                )}
              </div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg"> 
                   <IconComponent className="h-5 w-5 text-primary flex-shrink-0"/>
                   <span className="truncate">{topic.name}</span>
                </CardTitle>
                <CardDescription className="text-xs">Grade(s): {topic.grade}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <ScrollArea className="h-[60px] pr-3"> 
                  <p className="text-xs text-muted-foreground">{topic.description}</p>
                </ScrollArea>
                <div className="mt-2 flex flex-wrap gap-1">
                    {topic.categories?.slice(0,2).map(cat => ( 
                       <Button key={cat} variant="outline" size="xs" className="text-xs px-1.5 py-0.5 h-auto rounded-sm cursor-pointer" onClick={(e) => { e.stopPropagation(); setSelectedCategory(cat); setSelectedGrade("all"); setSearchTerm("");}}>
                            {cat}
                       </Button>
                    ))}
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
         {filteredSimulations.length === 0 && (
          <p className="md:col-span-2 lg:col-span-3 xl:col-span-4 text-center text-muted-foreground py-10">
            No simulations found matching your criteria.
          </p>
        )}
      </div>
    </div>
  );
}
