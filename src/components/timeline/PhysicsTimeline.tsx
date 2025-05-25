"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import * as LucideIcons from 'lucide-react'; // Import all icons
import type { TimelineEventNode, TimelineEventDetail, PhysicsTimelineData } from '@/lib/types';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface PhysicsTimelineProps {
  data: PhysicsTimelineData;
}

// Helper to get a Lucide icon component by name string
const getIcon = (iconName?: string): React.ElementType => {
  if (!iconName) return LucideIcons.Zap; // Default icon
  const IconComponent = (LucideIcons as any)[iconName];
  return IconComponent || LucideIcons.Zap;
};

const TimelineNode: React.FC<{ event: TimelineEventNode; onClick: () => void; isSelected: boolean }> = ({ event, onClick, isSelected }) => {
  const Icon = getIcon(event.icon);
  const yearDisplay = event.year < 0 ? `${Math.abs(event.year)} BC` : `${event.year} AD`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "relative flex flex-col items-center w-40 md:w-48 mx-2 cursor-pointer group",
        "transition-all duration-300 ease-in-out transform hover:scale-105"
      )}
      onClick={onClick}
    >
      {/* Stem */}
      <div className="absolute top-1/2 left-1/2 w-1 h-1/2 bg-gray-300 dark:bg-gray-700 -translate-x-1/2 -translate-y-full z-0"></div>

      {/* Event Circle / Icon */}
      <motion.div
        className={cn(
          "relative z-10 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center border-4 mb-2",
          isSelected ? "bg-primary border-primary-foreground shadow-lg scale-110" : "bg-card border-card-foreground/50 group-hover:border-primary",
          "transition-all duration-300"
        )}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {event.image || event.cartoonImage ? (
          <Image
            src={event.image || event.cartoonImage || "/images/timeline/placeholder_event.png"}
            alt={event.title}
            width={80}
            height={80}
            className="rounded-full object-cover w-full h-full"
            onError={(e) => (e.currentTarget.src = "/images/timeline/placeholder_event.png")} // Fallback
          />
        ) : (
          <Icon className={cn("w-8 h-8 md:w-10 md:h-10", isSelected ? "text-primary-foreground" : "text-primary group-hover:text-primary-foreground")} />
        )}
      </motion.div>

      {/* Title and Year */}
      <div className={cn(
        "text-center p-2 rounded-lg",
        isSelected ? "bg-primary/10" : ""
      )}>
        <p className="text-xs font-semibold text-muted-foreground">{yearDisplay}</p>
        <p className="text-sm md:text-md font-bold mt-1 group-hover:text-primary transition-colors">{event.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{event.shortDescription}</p>
      </div>
    </motion.div>
  );
};

const EventDetailModal: React.FC<{ event: TimelineEventNode | null; isOpen: boolean; onClose: () => void }> = ({ event, isOpen, onClose }) => {
  if (!event) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary">{event.title}</DialogTitle>
          <DialogDescription>{event.shortDescription}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow pr-2">
          <div className="space-y-4 py-4">
            {event.details.map((detail, index) => (
              <Card key={index} className="overflow-hidden shadow-sm">
                <CardHeader className="bg-muted/50 p-4">
                  <CardTitle className="text-lg flex items-center">
                    {detail.type === 'scientist' && <LucideIcons.User className="mr-2 h-5 w-5 text-primary" />}
                    {detail.type === 'discovery' && <LucideIcons.FlaskConical className="mr-2 h-5 w-5 text-primary" />}
                    {detail.type === 'era' && <LucideIcons.Landmark className="mr-2 h-5 w-5 text-primary" />}
                    {detail.title}
                  </CardTitle>
                  {detail.date && <CardDescription className="text-xs">{detail.date}</CardDescription>}
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                  {(detail.image && detail.type !== 'scientist') && ( // Scientist main image is usually on the node
                    <div className="my-2 relative aspect-video">
                      <Image
                        src={detail.image || "/images/timeline/placeholder_detail.png"}
                        alt={detail.title}
                        layout="fill"
                        objectFit="contain"
                        className="rounded-md"
                        onError={(e) => (e.currentTarget.src = "/images/timeline/placeholder_detail.png")}
                      />
                    </div>
                  )}
                  <p className="text-sm text-foreground whitespace-pre-wrap">{detail.description}</p>
                  {detail.biography && <p className="text-sm text-foreground whitespace-pre-wrap mt-2"><strong>Biography:</strong> {detail.biography}</p>}
                  {detail.experimentDetails && <p className="text-sm text-foreground whitespace-pre-wrap mt-2"><strong>Experiment:</strong> {detail.experimentDetails}</p>}
                  {detail.relatedFormula && (
                    <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded text-center">
                      <p className="text-lg font-mono text-primary">{detail.relatedFormula}</p>
                    </div>
                  )}
                  {detail.links && detail.links.length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-sm font-semibold mb-1">Further Reading:</h4>
                      <ul className="space-y-1">
                        {detail.links.map((link, i) => (
                          <li key={i}>
                            <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center">
                              <LucideIcons.ExternalLink className="mr-1 h-3 w-3" /> {link.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
        <Button onClick={onClose} variant="outline" className="mt-4">Close</Button>
      </DialogContent>
    </Dialog>
  );
};


export const PhysicsTimeline: React.FC<PhysicsTimelineProps> = ({ data }) => {
  const [selectedEvent, setSelectedEvent] = useState<TimelineEventNode | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const sortedEvents = useMemo(() => data.events.sort((a, b) => a.year - b.year), [data.events]);

  const handleNodeClick = (event: TimelineEventNode) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Optional: Delay setting selectedEvent to null for smoother exit animation
    setTimeout(() => setSelectedEvent(null), 300);
  };

  // Function to scroll to a specific year (approximate)
  // This would need more sophisticated logic for precise scaling and positioning based on year differences
  const scrollToYear = (year: number) => {
    if (scrollContainerRef.current) {
      const targetNode = sortedEvents.find(event => event.year >= year);
      const nodeElement = targetNode ? document.getElementById(`timeline-node-${targetNode.id}`) : null;
      if (nodeElement) {
        nodeElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      } else {
        // Fallback or scroll to end if year is very late
        const scrollWidth = scrollContainerRef.current.scrollWidth;
        scrollContainerRef.current.scrollTo({ left: year > 0 ? scrollWidth : 0, behavior: 'smooth' });
      }
    }
  };


  if (!data || !data.events || data.events.length === 0) {
    return <Card><CardContent className="p-6 text-center text-muted-foreground">No timeline data available.</CardContent></Card>;
  }

  return (
    <div className="py-8 px-2 md:px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center mb-12"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">{data.title}</h1>
        <p className="text-md md:text-lg text-muted-foreground max-w-3xl mx-auto">{data.description}</p>
      </motion.div>

      {/* TODO: Add filter controls here (by category, era, search by scientist/discovery) */}
      {/* Example:
      <div className="mb-8 flex justify-center gap-2">
        <Button onClick={() => scrollToYear(1600)}>Go to 1600s</Button>
        <Button onClick={() => scrollToYear(1900)}>Go to 1900s</Button>
      </div>
      */}

      <ScrollArea ref={scrollContainerRef} className="w-full whitespace-nowrap rounded-md pb-4">
        <div className="relative flex items-end h-64 md:h-72 py-8 px-4">
          {/* Timeline Axis */}
          <motion.div
            className="absolute left-0 right-0 top-1/2 h-1 bg-gray-300 dark:bg-gray-700 -translate-y-1/2"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, ease: "circOut" }}
            style={{ originX: 0 }}
          />

          {sortedEvents.map((event, index) => (
            <div key={event.id} id={`timeline-node-${event.id}`} className="inline-block">
              <TimelineNode
                event={event}
                onClick={() => handleNodeClick(event)}
                isSelected={selectedEvent?.id === event.id}
              />
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <AnimatePresence>
        {isModalOpen && selectedEvent && (
          <EventDetailModal
            event={selectedEvent}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
          />
        )}
      </AnimatePresence>
    </div>
  );
};