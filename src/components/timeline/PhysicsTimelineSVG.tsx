"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription as ShadCNCardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import * as LucideIcons from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { getIcon } from '@/lib/getIcon';
import { useUserSession } from '@/contexts/user-session-context';
import { Input } from '@/components/ui/input';
import { LucideIcon } from 'lucide-react';

// --- TYPE DEFINITIONS ---
export interface TimelineEventDetail {
  title: string;
  type: 'context' | 'biography' | 'explanation' | 'formula' | 'impact' | 'experiment_setup';
  description: string;
  date?: string;
  image?: string;
  relatedFormula?: string;
  links?: Array<{ label: string; url: string }>;
}

export type EventCategory =
  | 'pre-science-milestone' | 'pre-science-period'
  | 'ancient-discovery' | 'ancient-model' | 'medieval-tech'
  | 'renaissance-discovery' | 'enlightenment-tech'
  | 'classical-theory' | 'classical-discovery'
  | 'modern-theory' | 'modern-discovery'
  | 'particle-discovery'
  | 'machine-experiment'
  | 'space-mission'
  | 'earth-cosmic-event'
  | 'technology-application';

export interface TimelineEvent {
  id: string;
  category: EventCategory;
  title: string;
  year?: number;
  startYear?: number;
  endYear?: number;
  shortDescription: string;
  icon?: string;
  image?: string;
  details: TimelineEventDetail[];
  laneKey: keyof typeof LANE_CONFIG_MAP;
  color?: string;
  scientist?: {
    name: string;
    birthYear: number;
    deathYear?: number;
  };
}

export interface PhysicsTimelineData {
  title: string;
  description: string;
  events: TimelineEvent[];
  minYear?: number;
  maxYear?: number;
}

export const LANE_CONFIG_MAP = {
  'pre-science': { name: "Pre-Science", targetCategories: ['pre-science-milestone', 'pre-science-period'] as EventCategory[], defaultColor: '#708090', description: "Early human ingenuity." },
  'ancient-medieval': { name: "Ancient & Medieval", targetCategories: ['ancient-discovery', 'ancient-model', 'medieval-tech'] as EventCategory[], defaultColor: '#CD853F', description: "Early philosophical understanding." },
  'renaissance-enlightenment': { name: "Renaissance & Enlightenment", targetCategories: ['renaissance-discovery', 'enlightenment-tech'] as EventCategory[], defaultColor: '#8B4513', description: "Dawn of the scientific method." },
  'classical-physics': { name: "Classical Physics", targetCategories: ['classical-theory', 'classical-discovery'] as EventCategory[], defaultColor: '#4682B4', description: "Mechanics, thermodynamics, electromagnetism." },
  'modern-physics': { name: "Modern Physics", targetCategories: ['modern-theory', 'modern-discovery'] as EventCategory[], defaultColor: '#2E8B57', description: "Relativity and quantum mechanics." },
  'particle-discoveries': { name: "Particle Discoveries", targetCategories: ['particle-discovery'] as EventCategory[], defaultColor: '#B8860B', description: "Fundamental constituents of matter." },
  'big-machines': { name: "Big Machines & Experiments", targetCategories: ['machine-experiment'] as EventCategory[], defaultColor: '#DC143C', description: "Large-scale experimental apparatus." },
  'space-missions': { name: "Space Missions & Observations", targetCategories: ['space-mission'] as EventCategory[], defaultColor: '#1E90FF', description: "Exploring the cosmos." },
  'earth-cosmic-events': { name: "Earth & Cosmic Events", targetCategories: ['earth-cosmic-event'] as EventCategory[], defaultColor: '#FF8C00', description: "Significant natural events." },
  'technology-applications': { name: "Technology & Applications", targetCategories: ['technology-application'] as EventCategory[], defaultColor: '#9932CC', description: "Inventions from physics principles." },
} as const;

export type LaneKey = keyof typeof LANE_CONFIG_MAP;

// --- CONSTANTS ---
const LANE_HEIGHT = 70;
const LANE_MARGIN_TOP = 15;
const EVENT_BAR_HEIGHT = 22;
const EVENT_NODE_RADIUS = 16;
const SVG_PADDING_TOP = 20;
const SVG_PADDING_BOTTOM = 30;
const SVG_PADDING_HORIZONTAL = 25;
const AXIS_HEIGHT = 30;
const LANE_LABEL_WIDTH = 180;

function simpleScaleLinear(domain: [number, number], range: [number, number]) {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const domainLength = d1 - d0;
  const rangeLength = r1 - r0;
  if (domainLength === 0) return (value: number) => (value <= d0 ? r0 : r1);
  return (value: number) => r0 + ((value - d0) / domainLength) * rangeLength;
}

interface SvgTimelineEventProps {
  event: TimelineEvent;
  xScale: (year: number) => number;
  laneInnerY: number;
  onEventClick: (event: TimelineEvent) => void;
  isSelected: boolean;
}

const SvgTimelineEvent: React.FC<SvgTimelineEventProps & { editMode?: boolean; onEditClick?: (event: TimelineEvent) => void }> = ({ event, xScale, laneInnerY, onEventClick, isSelected, editMode, onEditClick }) => {
  const Icon = getIcon(event.icon);
  const laneConfig = LANE_CONFIG_MAP[event.laneKey];
  const color = event.color || laneConfig.defaultColor;
  const isEditable = !!editMode;

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEditClick) onEditClick(event);
  };

  const commonProps = {
    onClick: () => onEventClick(event),
    style: { cursor: 'pointer' },
    className: cn('transition-opacity duration-200 hover:opacity-80', isSelected ? 'event-selected' : 'event-default'),
  };

  if (event.startYear !== undefined && event.endYear !== undefined) {
    const x1 = xScale(event.startYear);
    const x2 = xScale(event.endYear);
    const width = Math.max(3, x2 - x1);
    const barY = laneInnerY - EVENT_BAR_HEIGHT / 2;
    const showTextOnBar = width > 60 && event.title.length * 6 < width;

    return (
      <g {...commonProps} transform={`translate(${x1}, ${barY})`}>
        <rect
          width={width}
          height={EVENT_BAR_HEIGHT}
          fill={color}
          rx={4} ry={4}
          stroke={isSelected ? 'hsl(var(--primary-foreground))' : 'hsl(var(--border))'}
          strokeWidth={isSelected ? 1.5 : 0.5}
        />
        {event.image && (
          <image href={event.image} x={0} y={0} width={width} height={EVENT_BAR_HEIGHT} preserveAspectRatio="xMidYMid slice" clipPath={`url(#clip-rect-${event.id})`} />
        )}
        {isEditable && (
          <foreignObject x={width - 28} y={2} width={24} height={24} style={{ pointerEvents: 'auto' }}>
            <button onClick={handleEdit} aria-label="Edit icon/image" className="bg-white/80 rounded-full border border-gray-300 shadow p-0.5 hover:bg-primary/80 transition">
              <LucideIcons.Pencil size={16} className="text-primary" />
            </button>
          </foreignObject>
        )}
        <clipPath id={`clip-rect-${event.id}`}><rect width={width} height={EVENT_BAR_HEIGHT} rx={4} ry={4} /></clipPath>
        {showTextOnBar && (
          <text x={width / 2} y={EVENT_BAR_HEIGHT / 2} dy=".35em" textAnchor="middle" fill="white" fontSize="10px" fontWeight="medium" className="pointer-events-none select-none">
            {event.title}
          </text>
        )}
        <title>{`${event.title} (${event.startYear} - ${event.endYear}): ${event.shortDescription}`}</title>
      </g>
    );
  } else if (event.year !== undefined) {
    const cx = xScale(event.year);
    const nodeY = laneInnerY;

    return (
      <g {...commonProps} transform={`translate(${cx}, ${nodeY})`}>
        <circle
          r={EVENT_NODE_RADIUS}
          fill={color}
          stroke={isSelected ? 'hsl(var(--primary-foreground))' : 'hsl(var(--border))'}
          strokeWidth={isSelected ? 2 : 1}
        />
        {event.image ? (
          <image href={event.image} x={-EVENT_NODE_RADIUS} y={-EVENT_NODE_RADIUS} width={EVENT_NODE_RADIUS * 2} height={EVENT_NODE_RADIUS * 2} clipPath={`url(#clip-circle-${event.id})`} />
        ) : (
          Icon && <Icon x={-EVENT_NODE_RADIUS * 0.6} y={-EVENT_NODE_RADIUS * 0.6} width={EVENT_NODE_RADIUS * 1.2} height={EVENT_NODE_RADIUS * 1.2} color="white" />
        )}
        {isEditable && (
          <foreignObject x={EVENT_NODE_RADIUS - 12} y={-EVENT_NODE_RADIUS - 8} width={24} height={24} style={{ pointerEvents: 'auto' }}>
            <button onClick={handleEdit} aria-label="Edit icon/image" className="bg-white/80 rounded-full border border-gray-300 shadow p-0.5 hover:bg-primary/80 transition">
              <LucideIcons.Pencil size={16} className="text-primary" />
            </button>
          </foreignObject>
        )}
        <clipPath id={`clip-circle-${event.id}`}><circle r={EVENT_NODE_RADIUS} /></clipPath>
        <text y={EVENT_NODE_RADIUS + 12} textAnchor="middle" fontSize="10px" fill="hsl(var(--foreground))" className="pointer-events-none select-none">
          {event.title} ({event.year < 0 ? `${Math.abs(event.year)} BC` : event.year})
        </text>
        <title>{`${event.title} (${event.year}): ${event.shortDescription}`}</title>
      </g>
    );
  }
  return null;
};

const EventDetailModal: React.FC<{ event: TimelineEvent | null; isOpen: boolean; onClose: () => void }> = ({ event, isOpen, onClose }) => {
  if (!event) return null;

  const getDetailIcon = (type: TimelineEventDetail['type']) => {
    switch (type) {
      case 'biography': return <LucideIcons.User className="mr-2 h-5 w-5 text-primary" />;
      case 'explanation': return <LucideIcons.Lightbulb className="mr-2 h-5 w-5 text-primary" />;
      case 'context': return <LucideIcons.BookOpenText className="mr-2 h-5 w-5 text-primary" />;
      case 'formula': return <LucideIcons.Sigma className="mr-2 h-5 w-5 text-primary" />;
      case 'impact': return <LucideIcons.TrendingUp className="mr-2 h-5 w-5 text-primary" />;
      case 'experiment_setup': return <LucideIcons.Beaker className="mr-2 h-5 w-5 text-primary" />;
      default: return <LucideIcons.Info className="mr-2 h-5 w-5 text-primary" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] flex flex-col bg-card">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">{event.title}</DialogTitle>
          <DialogDescription className="text-muted-foreground">{event.shortDescription}</DialogDescription>
          <div className="text-xs text-muted-foreground pt-1">
            {event.year !== undefined && `Year: ${event.year < 0 ? `${Math.abs(event.year)} BC` : event.year}`}
            {event.startYear !== undefined && event.endYear !== undefined && `Period: ${event.startYear < 0 ? `${Math.abs(event.startYear)} BC` : event.startYear} - ${event.endYear < 0 ? `${Math.abs(event.endYear)} BC` : event.endYear}`}
          </div>
        </DialogHeader>
        <ScrollArea className="flex-grow pr-3 -mr-1">
          <div className="space-y-4 py-4">
            {event.image && (
                 <div className="my-3 relative aspect-video rounded-md overflow-hidden border">
                   <Image src={event.image} alt={event.title} layout="fill" objectFit="contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                 </div>
            )}
            {event.details.map((detail, index) => (
              <Card key={index} className="overflow-hidden shadow-sm bg-background">
                <CardHeader className="bg-muted/30 p-4">
                  <CardTitle className="text-lg flex items-center">
                    {getDetailIcon(detail.type)}
                    {detail.title}
                  </CardTitle>
                  {detail.date && <ShadCNCardDescription className="text-xs text-muted-foreground mt-1">{detail.date}</ShadCNCardDescription>}
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                  {detail.image && (
                    <div className="my-2 relative aspect-[16/10] rounded-md overflow-hidden border">
                      <Image src={detail.image} alt={detail.title} layout="fill" objectFit="contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    </div>
                  )}
                  <p className="text-sm text-foreground/90 whitespace-pre-wrap">{detail.description}</p>
                  {detail.relatedFormula && (
                    <div className="mt-3 p-3 bg-muted/50 rounded text-center">
                       <p className="text-lg font-mono text-primary">{detail.relatedFormula}</p>
                       <p className="text-xs text-muted-foreground">(Formula display requires react-latex-next)</p>
                    </div>
                  )}
                  {detail.links && detail.links.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold mb-1.5 text-foreground/80">Further Reading:</h4>
                      <ul className="space-y-1">
                        {detail.links.map((link, i) => (
                          <li key={i}>
                            <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center">
                              <LucideIcons.ExternalLink className="mr-1.5 h-3.5 w-3.5" /> {link.label}
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
        <Button onClick={onClose} variant="outline" className="mt-4 w-full sm:w-auto sm:self-end">Close</Button>
      </DialogContent>
    </Dialog>
  );
};

interface PhysicsTimelineProps {
  data: PhysicsTimelineData;
}

export const PhysicsTimeline: React.FC<PhysicsTimelineProps> = ({ data }) => {
  const { userRole } = useUserSession();
  const [editMode, setEditMode] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Add a modal for editing icons/images in edit mode
  const [editEvent, setEditEvent] = useState<TimelineEvent | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [iconInput, setIconInput] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  const laneKeys = useMemo(() => Object.keys(LANE_CONFIG_MAP) as LaneKey[], []);

  const { minYear, maxYear, eventsByLane } = useMemo(() => {
    if (!data.events || data.events.length === 0) {
      return { minYear: 0, maxYear: new Date().getFullYear(), eventsByLane: new Map<LaneKey, TimelineEvent[]>() };
    }

    let LminYear = data.minYear, LmaxYear = data.maxYear;

    if (LminYear === undefined || LmaxYear === undefined) {
        let tempMin = Infinity, tempMax = -Infinity;
        data.events.forEach(event => {
            const start = event.year ?? event.startYear;
            const end = event.year ?? event.endYear;
            if (start !== undefined) tempMin = Math.min(tempMin, start);
            if (end !== undefined) tempMax = Math.max(tempMax, end);
        });
        
        LminYear = (tempMin === Infinity) ? 0 : tempMin;
        LmaxYear = (tempMax === -Infinity) ? new Date().getFullYear() : tempMax;

        const yearSpan = LmaxYear - LminYear;
        if (yearSpan > 0) {
            const paddingFactor = yearSpan > 20000 ? 0.01 : (yearSpan > 2000 ? 0.02 : 0.05);
            LminYear = Math.floor(LminYear - yearSpan * paddingFactor);
            LmaxYear = Math.ceil(LmaxYear + yearSpan * paddingFactor);
        } else if (yearSpan === 0) {
            LminYear = LminYear -1;
            LmaxYear = LmaxYear +1;
        }
    }
    
    const groupedByLane = new Map<LaneKey, TimelineEvent[]>();
    laneKeys.forEach(key => groupedByLane.set(key, []));
    data.events.forEach(event => {
      if (groupedByLane.has(event.laneKey)) {
        groupedByLane.get(event.laneKey)!.push(event);
      }
    });

    return { minYear: LminYear, maxYear: LmaxYear, eventsByLane: groupedByLane };
  }, [data, laneKeys]);

  const estimatedSvgWidth = useMemo(() => {
    const span = maxYear - minYear;
    if (span <= 0) return LANE_LABEL_WIDTH + 1200;

    let pxPerYear;
    if (span > 100000) pxPerYear = 0.05; 
    else if (span > 20000) pxPerYear = 0.15;
    else if (span > 5000) pxPerYear = 0.5;   
    else if (span > 1000) pxPerYear = 2;    
    else if (span > 200) pxPerYear = 5;    
    else pxPerYear = 10;                   

    const contentWidth = span * pxPerYear;
    const cappedContentWidth = Math.max(800, Math.min(60000, contentWidth));
    return LANE_LABEL_WIDTH + SVG_PADDING_HORIZONTAL * 2 + cappedContentWidth;
  }, [minYear, maxYear]);

  const totalSvgHeight = SVG_PADDING_TOP + (laneKeys.length * (LANE_HEIGHT + LANE_MARGIN_TOP)) - LANE_MARGIN_TOP + AXIS_HEIGHT + SVG_PADDING_BOTTOM;

  const xScale = useMemo(() => {
    const drawableWidth = estimatedSvgWidth - LANE_LABEL_WIDTH - 2 * SVG_PADDING_HORIZONTAL;
    return simpleScaleLinear(
      [minYear, maxYear],
      [LANE_LABEL_WIDTH + SVG_PADDING_HORIZONTAL, LANE_LABEL_WIDTH + SVG_PADDING_HORIZONTAL + drawableWidth]
    );
  }, [minYear, maxYear, estimatedSvgWidth]);

  const handleEventClick = (event: TimelineEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedEvent(null), 300);
  };

  const handleEditClick = (event: TimelineEvent) => {
    setEditEvent(event);
    setShowEditModal(true);
  };

  const axisTicks = useMemo(() => {
    const ticks = [];
    const span = maxYear - minYear;
    if (span <= 0) return [minYear, maxYear];

    let interval;
    const targetTicks = Math.max(5, Math.min(20, Math.floor( (estimatedSvgWidth - LANE_LABEL_WIDTH) / 100) ) );

    interval = Math.max(1, Math.pow(10, Math.floor(Math.log10(span / targetTicks))));
    
    if (span / interval > targetTicks * 2) interval *= 5;
    else if (span / interval > targetTicks * 1.5) interval *= 2;

    if (interval === 0) interval = 1;

    const startTickYear = Math.ceil(minYear / interval) * interval;
    for (let year = startTickYear; year <= maxYear; year += interval) {
      ticks.push(year);
    }
    if (ticks.length === 0 && minYear !== Infinity) ticks.push(minYear);
    return ticks;
  }, [minYear, maxYear, estimatedSvgWidth]);

  // --- Icon Picker and Image Upload logic ---
  const isValidLucideIcon = (iconName: string) => {
    return Boolean((LucideIcons as any)[iconName]);
  };

  const handleIconInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIconInput(e.target.value);
    setEditError(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setEditError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEdit = () => {
    if (!editEvent) return;
    let updatedIcon = editEvent.icon;
    let updatedImage = editEvent.image;
    if (iconInput) {
      if (!isValidLucideIcon(iconInput)) {
        setEditError('Invalid Lucide icon name.');
        return;
      }
      updatedIcon = iconInput;
      updatedImage = undefined;
    }
    if (imagePreview) {
      updatedImage = imagePreview;
      updatedIcon = undefined;
    }
    // Update event in data.events (in-memory only)
    const idx = data.events.findIndex(ev => ev.id === editEvent.id);
    if (idx !== -1) {
      data.events[idx] = { ...editEvent, icon: updatedIcon, image: updatedImage };
      setEditEvent({ ...editEvent, icon: updatedIcon, image: updatedImage });
      setShowEditModal(false);
      setIconInput('');
      setImagePreview(null);
      setEditError(null);
    }
  };

  if (!data || !data.events || data.events.length === 0) {
    return <Card><CardContent className="p-6 text-center text-muted-foreground">No timeline data available.</CardContent></Card>;
  }

  return (
    <div className="py-8 px-1 sm:px-2 md:px-4 bg-background text-foreground">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center mb-8 sm:mb-12"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">{data.title}</h1>
        <p className="text-md md:text-lg text-muted-foreground max-w-3xl mx-auto">{data.description}</p>
        {userRole === 'teacher' && (
          <Button
            variant={editMode ? 'destructive' : 'outline'}
            className="mt-4"
            onClick={() => setEditMode((v) => !v)}
            aria-pressed={editMode}
          >
            {editMode ? 'Exit Edit Mode' : 'Edit Timeline Icons/Images'}
          </Button>
        )}
      </motion.div>

      <ScrollArea className="w-full whitespace-nowrap rounded-md border dark:border-neutral-800 shadow-md">
        <svg
          width={estimatedSvgWidth}
          height={totalSvgHeight}
          className="font-sans select-none bg-card"
        >
          {laneKeys.map((laneKey, index) => {
            const laneConfig = LANE_CONFIG_MAP[laneKey];
            const laneYPosition = SVG_PADDING_TOP + index * (LANE_HEIGHT + LANE_MARGIN_TOP);

            return (
              <g key={`lane-group-${laneKey}`} transform={`translate(0, ${laneYPosition})`}>
                <rect x="5" y="0" width={LANE_LABEL_WIDTH - 10} height={LANE_HEIGHT} fill="hsl(var(--muted))" rx="3"/>
                <text
                  x={LANE_LABEL_WIDTH / 2} y={LANE_HEIGHT / 2} dy=".35em"
                  textAnchor="middle" fontWeight="600" fontSize="13px" fill="hsl(var(--muted-foreground))"
                >
                  {laneConfig.name}
                  <title>{laneConfig.description}</title>
                </text>
                <line x1={LANE_LABEL_WIDTH} y1="0" x2={LANE_LABEL_WIDTH} y2={LANE_HEIGHT} stroke="hsl(var(--border))" strokeWidth="0.5" />

                {(eventsByLane.get(laneKey) || []).sort((a,b) => (a.year ?? a.startYear ?? 0) - (b.year ?? b.startYear ?? 0)).map(event => (
                  <SvgTimelineEvent
                    key={event.id}
                    event={event}
                    xScale={xScale}
                    laneInnerY={LANE_HEIGHT / 2}
                    onEventClick={handleEventClick}
                    isSelected={selectedEvent?.id === event.id}
                    editMode={editMode}
                    onEditClick={editMode ? handleEditClick : undefined}
                  />
                ))}
              </g>
            );
          })}

          <g transform={`translate(0, ${totalSvgHeight - SVG_PADDING_BOTTOM - AXIS_HEIGHT})`}>
            <line
              x1={LANE_LABEL_WIDTH + SVG_PADDING_HORIZONTAL / 2}
              x2={estimatedSvgWidth - SVG_PADDING_HORIZONTAL / 2}
              y1={AXIS_HEIGHT / 2} y2={AXIS_HEIGHT / 2}
              stroke="hsl(var(--muted-foreground))" strokeWidth="1.5"
            />
            {axisTicks.map(year => (
              <g key={`tick-${year}`} transform={`translate(${xScale(year)}, 0)`}>
                <line y1={(AXIS_HEIGHT/2)-4} y2={(AXIS_HEIGHT/2)+4} stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
                <text y={(AXIS_HEIGHT/2) + 15} textAnchor="middle" fontSize="10px" fill="hsl(var(--muted-foreground))">
                  {year < 0 ? `${Math.abs(year)}\u00A0BC` : (year === 0 ? '0' : `${year}\u00A0AD`)}
                </text>
              </g>
            ))}
          </g>

          <style jsx>{`
            .event-default {}
            .event-selected circle, .event-selected rect {
              filter: drop-shadow(0px 0px 6px hsl(var(--primary) / 0.8));
              stroke: hsl(var(--primary));
            }
          `}</style>
        </svg>
      </ScrollArea>
      {/* Edit Modal (UI only, not yet saving) */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Icon or Image</DialogTitle>
            <DialogDescription>
              Choose a new icon or upload an image for this event. (This only updates in-memory for now.)
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block font-medium mb-1">Current Icon/Image:</label>
              <div className="flex items-center gap-2">
                {editEvent?.image ? (
                  <img src={editEvent.image} alt="Current" className="w-8 h-8 rounded object-cover border" />
                ) : editEvent?.icon && getIcon(editEvent.icon) && React.createElement(getIcon(editEvent.icon), { size: 28 })}
                <span className="text-sm">{editEvent?.icon}</span>
              </div>
            </div>
            <div>
              <label className="block font-medium mb-1">Change Icon (Lucide name):</label>
              <Input type="text" value={iconInput} onChange={handleIconInputChange} placeholder="e.g. Atom, Flame, BookOpen" />
              <div className="text-xs text-muted-foreground mt-1">See <a href="https://lucide.dev/icons" target="_blank" rel="noopener noreferrer" className="underline">Lucide Icons</a></div>
              {iconInput && isValidLucideIcon(iconInput) && (
                <div className="mt-1">Preview: {React.createElement((LucideIcons as any)[iconInput] as LucideIcon, { size: 24 })}</div>
              )}
            </div>
            <div>
              <label className="block font-medium mb-1">Or Upload Image:</label>
              <Input type="file" accept="image/*" onChange={handleImageUpload} />
              {imagePreview && (
                <div className="mt-2"><img src={imagePreview} alt="Preview" className="w-16 h-16 rounded object-cover border" /></div>
              )}
            </div>
            {editError && <div className="text-red-500 text-xs mt-1">{editError}</div>}
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleSaveEdit} className="flex-1" disabled={!iconInput && !imagePreview}>Save</Button>
            <Button onClick={() => { setShowEditModal(false); setIconInput(''); setImagePreview(null); setEditError(null); }} variant="outline" className="flex-1">Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>

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
