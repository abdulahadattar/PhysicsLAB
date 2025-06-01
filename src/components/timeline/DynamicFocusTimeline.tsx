// /home/user/PhysicsLAB/src/components/timeline/DynamicFocusTimeline.tsx
import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { Button } from '@/components/ui/button';
import { EventDetailModal } from './EventDetailModal';
import { TimelineEvent, LANE_CONFIG_MAP, CATEGORY_COLOR_MAP, EventCategory, LaneKey } from './timeline-types';
import { Slider } from '@/components/ui/slider'; // Import the Slider component
import { ZoomInIcon, ZoomOutIcon, RotateCcwIcon } from 'lucide-react';

// D3 types can be verbose. This helps.
type D3ZoomEvent = d3.D3ZoomEvent<SVGSVGElement, unknown>;
type D3ZoomBehavior = d3.ZoomBehavior<SVGSVGElement, unknown>;
type D3ScaleTime = d3.ScaleTime<number, number, never>;

interface FormattedEvent extends TimelineEvent {
  date: Date;
  yOffset: number;
  calculatedX: number;
  isDurationEvent: boolean;
  durationStartX?: number;
  durationEndX?: number;
}

const DynamicFocusTimeline: React.FC<DynamicFocusTimelineProps> = ({ events }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 300 });
  const [currentTransform, setCurrentTransform] = useState<d3.ZoomTransform>(d3.zoomIdentity);
  const [tooltip, setTooltip] = useState({ visible: false, content: '', x: 0, y: 0 });
  const zoomBehaviorRef = useRef<D3ZoomBehavior | null>(null);

  // State for filtering and sorting
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterLane, setFilterLane] = useState<string | null>(null);
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [filterSignificance, setFilterSignificance] = useState<number | null>(null);
  const [filterStartDate, setFilterStartDate] = useState<Date | null>(null);
  const [filterEndDate, setFilterEndDate] = useState<Date | null>(null);

  const [focusStrength, setFocusStrength] = useState(0.7); // State for Focus Strength
  const MARGIN = useMemo(() => ({ top: 30, right: 30, bottom: 60, left: 50 }), []);
  const FOCUS_WIDTH_PX = 250;
  const MIN_HORIZONTAL_SEPARATION = 20;
  const EVENT_NODE_RADIUS = 6;
  const VERTICAL_STACK_SPACING = 25;
  const DURATION_EVENT_HEIGHT = 12;

  const [sortBy, setSortBy] = useState<'date' | 'significance'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const processedEvents = useMemo((): FormattedEvent[] => {
    return events
      .map(event => {
        let date: Date | null = null;
        if (event.year != null) {
          date = new Date(event.year, 0, 1);
        } else if (event.startYear != null) {
          date = new Date(event.startYear, 0, 1);
        }
        return {
            ...event,
            date: date,
            yOffset: 0,
            calculatedX: 0,
            isDurationEvent: event.startYear != null && event.endYear != null,
        };
      })
      .filter(event => event.date !== null) as FormattedEvent[];
  }, [events]);

  const [minDate, maxDate] = useMemo((): [Date, Date] => {
    if (processedEvents.length === 0) {
      return [new Date(1800, 0, 1), new Date(2025, 0, 1)];
    }
    const extent = d3.extent(processedEvents, (d: FormattedEvent) => d.date) as [Date, Date] | [undefined, undefined];
    return extent[0] && extent[1] ? extent : [new Date(1800, 0, 1), new Date(2025, 0, 1)];
  }, [processedEvents]);

  const createFocusScale = useCallback((
    baseScale: D3ScaleTime,
    focusDate: Date,
    strength: number,
    focusWidthInPixels: number
    // visualWidth: number // Parameter was removed from definition
  ): ((date: Date) => number) => {
    return (date: Date): number => {
      const basePos = baseScale(date);
      const focusPos = baseScale(focusDate);
      const dist = basePos - focusPos;

      if (Math.abs(dist) < focusWidthInPixels) {
        const relativeDist = dist / focusWidthInPixels;
        const warpedDist = Math.sign(relativeDist) * Math.pow(Math.abs(relativeDist), 1 - strength) * focusWidthInPixels;
        return focusPos + warpedDist;
      }
      return basePos;
    };
  }, []);

  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      if (!entries || !entries.length) return;
      const { width: newWidth, height: newHeight } = entries[0].contentRect; // Renamed to avoid conflict
      if (containerRef.current && (Math.abs(dimensions.width - newWidth) > 1 || Math.abs(dimensions.height - newHeight) > 1)) {
        setDimensions({ width: newWidth, height: newHeight });
      }
    });
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, [dimensions.width, dimensions.height]);

  useEffect(() => {
    if (!svgRef.current || processedEvents.length === 0 || !minDate || !maxDate || dimensions.width <= 0 || dimensions.height <= 0) {
      return;
    }

    const svg = d3.select(svgRef.current);
    const width = dimensions.width - MARGIN.left - MARGIN.right;
    const height = dimensions.height - MARGIN.top - MARGIN.bottom;

    if (width <=0 || height <=0) return;

    const baseXScale: D3ScaleTime = d3.scaleTime()
      .domain([minDate, maxDate])
      .range([0, width]);

    const currentZoomedBaseScale: D3ScaleTime = currentTransform.rescaleX(baseXScale);

    const visualFocusX = width / 2;
    const currentFocusDate: Date = currentZoomedBaseScale.invert(visualFocusX);

    // ***** THE FIX IS HERE *****
 const renderXScale = createFocusScale(currentZoomedBaseScale, currentFocusDate, focusStrength, FOCUS_WIDTH_PX);
    // ***** END OF FIX *****

    const eventsWithStacking = [...processedEvents];
    const eventsByLane = d3.group(eventsWithStacking, d => d.laneKey as LaneKey);

    eventsByLane.forEach((eventsInLane) => {
      eventsInLane.sort((a, b) => a.date.getTime() - b.date.getTime());
      const occupiedHorizontalSpace = new Map<number, Array<{ startX: number, endX: number }>>();
      const maxStackLevel = 10;

      eventsInLane.forEach(event => {
        let currentYOffset = 0;
        let placed = false;

        let eventVisualStartPx, eventVisualEndPx;
        if (event.isDurationEvent && event.startYear && event.endYear) {
          eventVisualStartPx = currentZoomedBaseScale(new Date(event.startYear, 0, 1));
          eventVisualEndPx = currentZoomedBaseScale(new Date(event.endYear, 11, 31));
        } else {
          const eventPosPx = currentZoomedBaseScale(event.date);
          eventVisualStartPx = eventPosPx - MIN_HORIZONTAL_SEPARATION / 2;
          eventVisualEndPx = eventPosPx + MIN_HORIZONTAL_SEPARATION / 2;
        }

        while (!placed && currentYOffset < maxStackLevel) {
          const occupied = occupiedHorizontalSpace.get(currentYOffset) || [];
          const overlap = occupied.some(space => (eventVisualStartPx < space.endX && eventVisualEndPx > space.startX));
          if (!overlap) {
            event.yOffset = currentYOffset;
            occupiedHorizontalSpace.set(currentYOffset, [...occupied, { startX: eventVisualStartPx, endX: eventVisualEndPx }]);
            placed = true;
          } else {
            currentYOffset++;
          }
        }
        if (!placed) event.yOffset = maxStackLevel -1;

        event.calculatedX = renderXScale(event.date);
        if (event.isDurationEvent && event.startYear && event.endYear) {
            event.durationStartX = renderXScale(new Date(event.startYear, 0, 1));
            event.durationEndX = renderXScale(new Date(event.endYear, 11, 31));
        }
      });
    });

    const baseEventY = height - 30;

    const g = svg.selectAll<SVGGElement, unknown>(".chart-group").data([null]);
    const gEnter = g.enter().append("g").attr("class", "chart-group");
    gEnter.merge(g).attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

    const xAxis = d3.axisBottom(currentZoomedBaseScale);

    const updateTicks = () => {
        const domain = currentZoomedBaseScale.domain();
        const timeSpanDays = (domain[1].getTime() - domain[0].getTime()) / (1000 * 60 * 60 * 24);
        let tickInterval: d3.TimeInterval | null = null;
        let tickFormatFunc: (date: Date | number | { valueOf(): number }) => string;

        const formatDate = (formatter: (date: Date) => string) => (d: Date | number | { valueOf(): number }) => formatter(new Date(d.valueOf()));

        if (timeSpanDays < 30) { tickInterval = d3.timeDay.every(3); tickFormatFunc = formatDate(d3.timeFormat("%b %d")); }
        else if (timeSpanDays < 180) { tickInterval = d3.timeMonth.every(1); tickFormatFunc = formatDate(d3.timeFormat("%b '%y")); }
        else if (timeSpanDays < 730) { tickInterval = d3.timeMonth.every(2); tickFormatFunc = formatDate(d3.timeFormat("%b '%y")); }
        else if (timeSpanDays < 3650 * 2) { tickInterval = d3.timeYear.every(1); tickFormatFunc = formatDate(d3.timeFormat("%Y")); }
        else { tickInterval = d3.timeYear.every(5); tickFormatFunc = formatDate(d3.timeFormat("%Y")); }

        xAxis.ticks(tickInterval).tickFormat(tickFormatFunc);
    };
    updateTicks();

    const xAxisGroup = g.merge(gEnter).selectAll<SVGGElement, unknown>(".x-axis").data([null]);
    xAxisGroup.enter().append("g").attr("class", "x-axis")
      .merge(xAxisGroup)
      .attr("transform", `translate(0, ${height})`)
      .transition().duration(selectedEvent ? 0 : 300)
      .call(xAxis);

    const eventsGroup = g.merge(gEnter).selectAll<SVGGElement, unknown>(".events-group").data([null]);
    eventsGroup.enter().append("g").attr("class", "events-group").merge(eventsGroup);

    const stems = eventsGroup.merge(gEnter.select(".events-group"))
      .selectAll<SVGLineElement, FormattedEvent>(".event-stem")
      .data(eventsWithStacking, d => d.id);

    stems.enter().append("line").attr("class", "event-stem")
      .merge(stems)
      .transition().duration(300)
      .attr("x1", d => d.calculatedX)
      .attr("x2", d => d.calculatedX)
      .attr("y1", d => baseEventY - d.yOffset * VERTICAL_STACK_SPACING - (d.isDurationEvent ? DURATION_EVENT_HEIGHT / 2 : EVENT_NODE_RADIUS))
      .attr("y2", baseEventY)
      .attr("stroke", "#ccc")
      .attr("stroke-width", 1);
    stems.exit().remove();

    const pointEvents = eventsWithStacking.filter(d => !d.isDurationEvent);
    const eventNodes = eventsGroup.merge(gEnter.select(".events-group"))
      .selectAll<SVGCircleElement, FormattedEvent>(".event-node")
      .data(pointEvents, d => d.id);

    eventNodes.enter().append("circle").attr("class", "event-node cursor-pointer")
      .on('click', (event: MouseEvent, d: FormattedEvent) => {
        setSelectedEvent(d);
        event.stopPropagation();
      })
      .on('mouseover', function(event: MouseEvent, d: FormattedEvent) {
        if (!containerRef.current) return;
        d3.select(this).transition().duration(100).attr("r", EVENT_NODE_RADIUS * 1.8);
        const [svgX, svgY] = d3.pointer(event, svgRef.current);
        setTooltip({ visible: true, content: `${d.title}: ${d.shortDescription}`, x: svgX + 10, y: svgY - 10 });
      })
      .on('mouseout', function(this: SVGCircleElement, event: MouseEvent, d: FormattedEvent) {
        d3.select(this).transition().duration(100).attr("r", d.id === selectedEvent?.id ? EVENT_NODE_RADIUS * 1.5 : EVENT_NODE_RADIUS).attr("fill", d.color || CATEGORY_COLOR_MAP[d.category as EventCategory] || LANE_CONFIG_MAP[d.laneKey]?.defaultColor || 'steelblue');
        setTooltip(prev => ({ ...prev, visible: false }));
      })
      .merge(eventNodes)
      .attr("class", d => `event-node cursor-pointer ${d.id === selectedEvent?.id ? 'selected-event-node' : ''}`)
      .transition().duration(300)
      .attr("cx", d => d.calculatedX)
      .attr("cy", d => baseEventY - d.yOffset * VERTICAL_STACK_SPACING - EVENT_NODE_RADIUS)
      .attr("r", d.id === selectedEvent?.id ? EVENT_NODE_RADIUS * 1.5 : EVENT_NODE_RADIUS)
      .attr("fill", d => d.color || CATEGORY_COLOR_MAP[d.category as EventCategory] || LANE_CONFIG_MAP[d.laneKey as LaneKey]?.defaultColor || 'steelblue')
      .attr("stroke", d => d.id === selectedEvent?.id ? "black" : "none")
      .attr("stroke-width", d => d.id === selectedEvent?.id ? 2 : 0);
    eventNodes.exit().remove();

    const durationEventsData = eventsWithStacking.filter(d => d.isDurationEvent);
    const eventBars = eventsGroup.merge(gEnter.select(".events-group"))
      .selectAll<SVGRectElement, FormattedEvent>(".event-bar")
      .data(durationEventsData, d => d.id);

    eventBars.enter().append("rect").attr("class", "event-bar cursor-pointer")
      .on('click', (event: MouseEvent, d: FormattedEvent) => {
        setSelectedEvent(d);
        event.stopPropagation();
      })
      .on('mouseover', function(event: MouseEvent, d: FormattedEvent) {
        if (!containerRef.current) return;
        d3.select(this).attr("filter", "url(#glow)");
        const [svgX, svgY] = d3.pointer(event, svgRef.current);
        setTooltip({ visible: true, content: `${d.title}: ${d.shortDescription}`, x: svgX + 10, y: svgY - 10 });
      })
      .on('mouseout', function(this: SVGRectElement, event: MouseEvent, d: FormattedEvent) {
        d3.select(this).attr("filter", null);
        setTooltip(prev => ({ ...prev, visible: false }));
      })
      .merge(eventBars)
      .attr("class", d => `event-bar cursor-pointer ${d.id === selectedEvent?.id ? 'selected-event-bar' : ''}`)
      .transition().duration(300)
      .attr("x", d => d.durationStartX!)
      .attr("y", d => baseEventY - d.yOffset * VERTICAL_STACK_SPACING - DURATION_EVENT_HEIGHT)
      .attr("width", d => Math.max(0, d.durationEndX! - d.durationStartX!))
      .attr("height", DURATION_EVENT_HEIGHT)
      .attr("rx", 3)
      .attr("ry", 3)
      .attr("fill", d => d.color || CATEGORY_COLOR_MAP[d.category as EventCategory] || LANE_CONFIG_MAP[d.laneKey]?.defaultColor || 'skyblue')
      .attr("stroke", d => d.id === selectedEvent?.id ? "black" : (d.color || CATEGORY_COLOR_MAP[d.category as EventCategory] || LANE_CONFIG_MAP[d.laneKey]?.defaultColor || 'skyblue'))
      .attr("stroke-width", d => d.id === selectedEvent?.id ? 2 : 1)
      .attr("opacity", d => d.id === selectedEvent?.id ? 1 : 0.85);
    eventBars.exit().remove();

    if (!zoomBehaviorRef.current) {
      const newZoomBehavior = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.05, 50])
        .extent([[0, 0], [dimensions.width - MARGIN.left - MARGIN.right, dimensions.height - MARGIN.top - MARGIN.bottom]]) // Use calculated width/height
        .on("zoom", (event: D3ZoomEvent) => {
          setCurrentTransform(event.transform);
        });
      svg.call(newZoomBehavior);
      zoomBehaviorRef.current = newZoomBehavior;
    } else {
      zoomBehaviorRef.current.extent([[0, 0], [dimensions.width - MARGIN.left - MARGIN.right, dimensions.height - MARGIN.top - MARGIN.bottom]]); // Use calculated width/height
    }

  }, [
 processedEvents, minDate, maxDate, dimensions, currentTransform, selectedEvent, focusStrength, // Add focusStrength to dependencies
    MARGIN, createFocusScale
  ]);

  const handleZoom = useCallback((scaleFactor: number) => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current)
        .transition().duration(300)
        .call(zoomBehaviorRef.current.scaleBy, scaleFactor);
    }
  }, []);

  const handleResetZoom = useCallback(() => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current)
        .transition().duration(500)
        .call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
    }
  }, []);

  return (
    <div ref={containerRef} className="w-full h-[450px] border rounded-md shadow-sm relative bg-gray-50" style={{ minHeight: '350px' }}>
      <div className="absolute top-3 left-3 z-10 space-x-2 flex flex-col items-start p-2 bg-white rounded-md shadow-md">
        <div className="flex items-center space-x-1 mb-2">
        <Button onClick={() => handleZoom(1.5)} size="sm" variant="outline" className="bg-white">
          <ZoomInIcon size={16} className="mr-1" /> Zoom In
        </Button>
        <Button onClick={() => handleZoom(0.75)} size="sm" variant="outline" className="bg-white">
          <ZoomOutIcon size={16} className="mr-1" /> Zoom Out
        </Button>
        </div>
        <div className="flex items-center space-x-2 w-48">
          <label className="text-xs font-medium w-20">Focus Strength:</label>
          <Slider
            value={[focusStrength]}
            min={0}
            max={1}
            step={0.05}
            onValueChange={(value) => setFocusStrength(value[0])}
            className="flex-grow"
          />
          <span className="text-xs w-6 text-right">{focusStrength.toFixed(2)}</span>
        </div>
        {/* Add Focus Width Slider Here (Future) */}
        {/* <div className="flex items-center space-x-2 w-48 mt-1">...</div> */}
        <Button onClick={handleResetZoom} size="sm" variant="outline" className="bg-white">
          <RotateCcwIcon size={16} className="mr-1" /> Reset
        </Button>
      </div>
      <svg ref={svgRef} width="100%" height="100%">
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <g className="chart-group"></g>
      </svg>
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
      {tooltip.visible && (
        <div
          className="absolute p-2 rounded-md shadow-lg text-xs pointer-events-none"
          style={{
            top: tooltip.y,
            left: tooltip.x,
            backgroundColor: 'rgba(20, 20, 20, 0.85)',
            color: 'white',
            transform: 'translate(10px, -10px)',
            zIndex: 2000,
          }}
        >
          {tooltip.content}
        </div>
      )}
       <div className="absolute bottom-2 right-3 text-xs text-gray-500 z-10">
        Scroll to zoom, Click & Drag to pan. Click events for details.
      </div>
    </div>
  );
};

export default DynamicFocusTimeline;

interface DynamicFocusTimelineProps {
  events: TimelineEvent[];
}