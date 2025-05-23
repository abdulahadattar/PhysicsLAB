
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SIMULATION_TOPICS, SIMULATION_CATEGORIES } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Search, Orbit, ChevronDown } from "lucide-react"; 
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


export default function SimulationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [studyGrades, setStudyGrades] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    // Extract unique grades from SIMULATION_TOPICS for the filter
    const uniqueGrades = Array.from(new Set(SIMULATION_TOPICS.map(topic => topic.grade.split('/')[0].trim())))
                             .sort((a,b) => parseInt(a) - parseInt(b)) // Sort numerically
                             .map(g => ({ id: g, name: `Grade ${g}` }));
    // Add "Advanced" if present
    if (SIMULATION_TOPICS.some(topic => topic.grade.toLowerCase().includes('advanced'))) {
        if (!uniqueGrades.find(ug => ug.id.toLowerCase() === 'advanced')) {
            uniqueGrades.push({id: "Advanced", name: "Advanced"});
        }
    }
    setStudyGrades(uniqueGrades);
  }, []);


  const filteredSimulations = useMemo(() => {
    return SIMULATION_TOPICS.filter(topic => {
      const matchesSearchTerm = topic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                topic.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Grade filtering logic needs to handle "9/10" or "11 / 12" style strings
      const topicGrades = topic.grade.split('/').map(g => g.trim().toLowerCase());
      const matchesGrade = selectedGrade === "all" || 
                           topicGrades.some(tg => tg === selectedGrade.toLowerCase()) ||
                           (selectedGrade.toLowerCase() === 'advanced' && topic.grade.toLowerCase().includes('advanced'));

      const matchesCategory = selectedCategory === "all" || 
                              (topic.categories && topic.categories.includes(selectedCategory));
      
      return matchesSearchTerm && matchesGrade && matchesCategory;
    }).sort((a,b) => { // Sort primarily by grade, then by name
        const gradeA = parseInt(a.grade.split('/')[0].trim());
        const gradeB = parseInt(b.grade.split('/')[0].trim());
        if (gradeA !== gradeB) {
            return gradeA - gradeB;
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
              placeholder="Search simulations by topic or keyword..."
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
                    <SelectItem key={grade.id} value={grade.id}>{grade.name}</SelectItem>
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
        {filteredSimulations.map((topic, index) => {
          const IconComponent = topic.icon || Orbit; 
          const isPlaceholderImage = !topic.image || topic.image.startsWith("https://placehold.co");
          return (
            <Card 
              key={topic.id} 
              className="flex flex-col overflow-hidden shadow-md hover:shadow-lg transition-shadow animate-in fade-in-0 slide-in-from-bottom-5 duration-500 ease-out"
              style={{ animationDelay: `${index * 50}ms` }} // Reduced delay
            >
              <div className="relative h-40 bg-secondary/30 flex items-center justify-center" data-ai-hint={topic.aiHint || "physics diagram"}>
                {isPlaceholderImage ? (
                  <IconComponent className="h-16 w-16 text-primary/70" strokeWidth={1.5}/>
                ) : (
                  <Image src={topic.image!} alt={topic.name} layout="fill" objectFit="cover" />
                )}
              </div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg"> {/* Smaller title */}
                   <IconComponent className="h-5 w-5 text-primary flex-shrink-0"/>
                   <span className="truncate">{topic.name}</span>
                </CardTitle>
                <CardDescription className="text-xs">Grade(s): {topic.grade}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <ScrollArea className="h-[60px] pr-3"> {/* Fixed height for description */}
                  <p className="text-xs text-muted-foreground">{topic.description}</p>
                </ScrollArea>
                <div className="mt-2 flex flex-wrap gap-1">
                    {topic.categories?.slice(0,2).map(cat => ( // Show max 2 categories initially
                        <Link key={cat} href={`/simulations?category=${encodeURIComponent(cat)}`} passHref>
                           <Button variant="outline" size="xs" className="text-xs px-1.5 py-0.5 h-auto rounded-sm" onClick={(e) => { e.stopPropagation(); setSelectedCategory(cat); setSelectedGrade("all"); setSearchTerm("");}}>
                                {cat}
                           </Button>
                        </Link>
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
         {filteredSimulations.length === 0 && searchTerm && (
          <p className="md:col-span-2 lg:col-span-3 xl:col-span-4 text-center text-muted-foreground py-10">
            No simulations found matching "{searchTerm}" for the selected filters.
          </p>
        )}
        {filteredSimulations.length === 0 && !searchTerm && (
          <p className="md:col-span-2 lg:col-span-3 xl:col-span-4 text-center text-muted-foreground py-10">
            No simulations found for the selected grade and category.
          </p>
        )}
      </div>
    </div>
  );
}
