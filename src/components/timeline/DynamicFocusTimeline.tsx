import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { Button } from '@/components/ui/button';
import { EventDetailModal } from './EventDetailModal';
import { TimelineEvent, LANE_CONFIG_MAP, CATEGORY_COLOR_MAP, EventCategory } from './timeline-types';

interface DynamicFocusTimelineProps {
  events: TimelineEvent[];
}

const DynamicFocusTimeline: React.FC<DynamicFocusTimelineProps> = ({ events }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 300 }); // Initial dimensions
  const [currentTransform, setCurrentTransform] = useState<d3.ZoomTransform>(d3.zoomIdentity);
  const [tooltip, setTooltip] = useState({
    visible: false,
    content: '',
    x: 0,
    y: 0,
  });

  // Define constants outside useEffect
  const MARGIN = { top: 20, right: 30, bottom: 50, left: 40 }; // Adjust as needed
  // Parameters for the focus effect (adjust as needed)
  const focusStrength = 0.8; // How strong the warping effect is
  const focusWidth = 200; // Pixel width around the focus point where the effect is applied (in pixels on the base scale)
  // Define a constant for minimum horizontal separation for stacking
  const minHorizontalSeparation = 15; // Minimum estimated horizontal space needed per event (in pixels on the base scale)

  const eventsWithDates: (TimelineEvent & { date: Date })[] = useMemo(() => {
    return events
      .map(event => {
        let date: Date | null = null;
        if (event.year) {
          date = new Date(event.year, 0, 1);
        } else if (event.startYear !== undefined) {
          date = new Date(event.startYear, 0, 1);
        }
        return { ...event, date: date };
      })
      .filter(event => event.date !== null) as (TimelineEvent & { date: Date })[];
  }, [events]);

  const [minDate, maxDate] = useMemo(() => {
    if (eventsWithDates.length === 0) {
      return [new Date(1800, 0, 1), new Date(2025, 0, 1)];
    }
    // Type parameter d in d3.extent
    return d3.extent(eventsWithDates, (d: TimelineEvent & { date: Date }) => d.date) as [Date, Date];
  }, [eventsWithDates]);

  useEffect(() => {
    if (!svgRef.current || !eventsWithDates || eventsWithDates.length === 0 || minDate === undefined || maxDate === undefined) {
      console.warn("No valid dates found in events or missing date bounds.");
      return;
    }

    const containerRect = containerRef.current?.getBoundingClientRect();

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = dimensions.width - MARGIN.left - MARGIN.right;
    const height = dimensions.height - MARGIN.top - MARGIN.bottom;

    const g = svg.append("g").attr("transform", `translate(${MARGIN.left},${MARGIN.top})`) as d3.Selection<SVGGElement, unknown, null, undefined>;

    const baseEventY = height - 30;
    const eventNodeRadius = 5;
    const verticalStackSpacing = 20;

    const createFocusScale = (baseScale: d3.ScaleTime<number, number, never>, focusDate: Date, strength: number, widthPx: number, width: number) => {
      return (date: Date): number => {
        const basePos = baseScale(date);
        const focusPos = baseScale(focusDate);
        const dist = Math.abs(basePos - focusPos);

        if (dist < widthPx) {
          const factor = (1 - dist / widthPx);
          const displacement = Math.sign(basePos - focusPos) * dist * factor * strength;
          return basePos + displacement * (width / widthPx);
        }
        return basePos;
      };
    };

    const xScale: d3.ScaleTime<number, number, never> = d3.scaleTime()
      .domain([minDate, maxDate] as [Date, Date])
      .range([0, width]);

    const currentBaseScale: d3.ScaleTime<number, number, never> = currentTransform.rescaleX(xScale);

    const focusPointX = width / 2;
    const currentFocusDate: Date = currentBaseScale.invert(focusPointX);

    const focusEnhancedScale = (date: Date): number => createFocusScale(currentBaseScale, currentFocusDate, focusStrength, focusWidth, width)(date);

    // --- Stacking Logic ---
    const stackedEvents = eventsWithDates.map(d => ({ ...d, yOffset: 0 }));

    // Type parameter d in d3.group
    const eventsByLane = d3.group(stackedEvents, (d: TimelineEvent & { date: Date; yOffset: number }) => d.laneKey);

    // Type parameter eventsInLane in eventsByLane.forEach
    eventsByLane.forEach((eventsInLane: (TimelineEvent & { date: Date; yOffset: number })[]) => {
        // Type parameters a and b in eventsInLane.sort
        eventsInLane.sort((a: TimelineEvent & { date: Date }, b: TimelineEvent & { date: Date }) => a.date.getTime() - b.date.getTime());

        const occupiedHorizontalSpace = new Map<number, Array<{ startX: number, endX: number }>>();
        const maxStackLevel = 10;
        // Type parameter event in eventsInLane.forEach (inner loop)
        eventsInLane.forEach((event: TimelineEvent & { date: Date; yOffset: number }) => {
            let currentYOffset = 0;
            let placed = false;

            let eventStartX, eventEndX;
            if (event.startYear && event.endYear) {
                eventStartX = currentBaseScale(new Date(event.startYear, 0, 1));
                eventEndX = currentBaseScale(new Date(event.endYear, 0, 1));
            } else {
                const eventPos = currentBaseScale(event.date);
                eventStartX = eventPos - minHorizontalSeparation / 2;
                eventEndX = eventPos + minHorizontalSeparation / 2;
            }

            while (!placed && currentYOffset < maxStackLevel) {
                 const occupied = occupiedHorizontalSpace.get(currentYOffset) || [];
                 const overlap = occupied.some(space => (eventStartX < space.endX && eventEndX > space.startX));

                if (!overlap) {
                    event.yOffset = currentYOffset;
                    occupiedHorizontalSpace.set(currentYOffset, [...occupied, { startX: eventStartX, endX: eventEndX }]);
                    placed = true;
                } else {
                    currentYOffset++;
                }
            }
             if (!placed) {
                 // Fallback: if cannot stack within maxStackLevel, place at a default high level
                 event.yOffset = maxStackLevel - 1; // Place it at the highest allowed level
             }
        });
    });

    const xAxis = d3.axisBottom(xScale)
      .ticks(d3.timeYear.every(5))
      .tickFormat(d3.timeFormat("%Y"));
      
    const xAxisGroup = g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${height})`) as d3.Selection<SVGGElement, unknown, null, undefined>;

    const eventsGroup = g.append("g").attr("class", "events-group") as d3.Selection<SVGGElement, unknown, null, undefined>;

    const eventNodes: d3.Selection<SVGCircleElement, TimelineEvent & { date: Date, yOffset: number }, SVGGElement, unknown> = eventsGroup.selectAll(".event-node")
      .data(stackedEvents, (d: TimelineEvent & { date: Date, yOffset: number }) => d.id)
      .enter()
      .append("circle")
      .attr("class", d => `event-node ${d.id === selectedEvent?.id ? 'selected' : ''}`)
      .attr("cx", d => focusEnhancedScale(d.date))
      .attr("cy", d => baseEventY - d.yOffset * verticalStackSpacing)
      .attr("r", d => d.id === selectedEvent?.id ? eventNodeRadius * 1.5 : eventNodeRadius)
      // Fix CATEGORY_COLOR_MAP access and type parameters d in eventNodes fill attribute
      .attr("fill", (d: TimelineEvent & { date: Date; yOffset: number }) =>
        d.color ||
        (d.category ? CATEGORY_COLOR_MAP[d.category as EventCategory] : undefined) ||
        (d.laneKey ? LANE_CONFIG_MAP[d.laneKey]?.defaultColor : undefined) || 'steelblue'
      )
      // Type this in eventNodes.on('mouseover', ...)
      .on('mouseover', function(this: SVGCircleElement, event: MouseEvent, d: TimelineEvent & { date: Date; yOffset: number }) {
        // Fix 'containerRef.current' is possibly 'null'
        if (!containerRef.current) return;

        const offsetX = 15;
        const offsetY = 15;
        const containerRect = containerRef.current.getBoundingClientRect();
        const estimatedTooltipWidth = 250;
        const estimatedTooltipHeight = 70;

        let relativeX = event.pageX - containerRect.left + offsetX;
        let relativeY = event.pageY - containerRect.top + offsetY;

        if (relativeX + estimatedTooltipWidth > containerRect.width) {
          relativeX = containerRect.width - estimatedTooltipWidth;
        }
        if (relativeY + estimatedTooltipHeight > containerRect.height) {
          relativeY = containerRect.height - estimatedTooltipHeight;
        }

        setTooltip({
          visible: true,
          content: `${d.title || 'Event'}: ${d.shortDescription || ''}`,
          x: relativeX,
          y: relativeY,
        });
      })
      // Type this in eventNodes.on('mouseout', ...)
      .on("mouseout", function(this: SVGCircleElement, event: MouseEvent, d: TimelineEvent & { date: Date; yOffset: number }) {
         d3.select(this).attr("r", d.id === selectedEvent?.id ? eventNodeRadius * 1.5 : eventNodeRadius);
         setTooltip({ ...tooltip, visible: false });
      })

    // Render Duration Events (Rectangles) - Filter for events with start and end years
    const durationEvents = stackedEvents.filter(d => d.startYear !== undefined && d.endYear !== undefined);

    const eventBars = eventsGroup.selectAll(".event-bar")
      .data(durationEvents, (d: TimelineEvent & { date: Date, yOffset: number }) => d.id)
      .enter()
      .append("rect")
      .attr("class", d => `event-bar ${d.id === selectedEvent?.id ? 'selected' : ''}`)
      .attr("x", (d: TimelineEvent & { date: Date; yOffset: number; startYear?: number; endYear?: number }) => focusEnhancedScale(new Date(d.startYear!, 0, 1)))
      .attr("width", (d: TimelineEvent & { date: Date; yOffset: number; startYear?: number; endYear?: number }) => {
          const startX = focusEnhancedScale(new Date(d.startYear!, 0, 1));
          const endX = focusEnhancedScale(new Date(d.endYear!, 0, 1));
          return Math.max(0, endX - startX);
      })
      // Adjusted y position to center the bar on the stem
      .attr("y", d => baseEventY - d.yOffset * verticalStackSpacing - 5) // Subtract half of bar height
      .attr("height", 10)
      // Type parameters d in eventBars fill attribute
      .attr("fill", (d: TimelineEvent & { date: Date; yOffset: number; startYear?: number; endYear?: number }) =>
        d.color ||
        (d.laneKey ? LANE_CONFIG_MAP[d.laneKey]?.defaultColor : undefined) ||
        'steelblue'
      )
      // Type this in eventBars.on('click', ...)
      .on('click', function(this: SVGRectElement, event: MouseEvent, d: TimelineEvent & { date: Date; yOffset: number; startYear?: number; endYear?: number }) {
         setSelectedEvent(d);
      })
      // Type this in eventBars.on('mouseover', ...)
      .on('mouseover', function(this: SVGRectElement, event: MouseEvent, d: TimelineEvent & { date: Date; yOffset: number; startYear?: number; endYear?: number }) {
        // Fix 'containerRef.current' is possibly 'null'
        if (!containerRef.current) return;

        const offsetX = 15;
        const offsetY = 15;
        const estimatedTooltipWidth = 200;
        const estimatedTooltipHeight = 50;
        const containerRect = containerRef.current.getBoundingClientRect();

        let relativeX = event.pageX - containerRect.left + offsetX;
        let relativeY = event.pageY - containerRect.top + offsetY;

        if (relativeX + estimatedTooltipWidth > containerRect.width) {
            relativeX = containerRect.width - estimatedTooltipWidth;
        }
        if (relativeY + estimatedTooltipHeight > containerRect.height) {
          relativeY = containerRect.height - estimatedTooltipHeight;
        }

        setTooltip({
            visible: true,
            content: `${d.title || 'Event'}: ${d.shortDescription || ''}`,
            x: relativeX,
            y: relativeY,
        });
      })
      // Type this in eventBars.on("mouseout", ...)
      .on("mouseout", function(this: SVGRectElement, event: MouseEvent, d: TimelineEvent & { date: Date; yOffset: number; startYear?: number; endYear?: number }) {
         setTooltip({ ...tooltip, visible: false });
      });

    // Render Stems (Lines from node/bar to axis)
    // Change data source and type parameters d in eventStems attributes
    const eventStems: d3.Selection<SVGLineElement, TimelineEvent & { date: Date, yOffset: number }, SVGGElement, unknown> = eventsGroup.selectAll(".event-stem")
      .data(stackedEvents, (d: TimelineEvent & { date: Date, yOffset: number }) => d.id) // Use stackedEvents
      .enter()
      .append("line")
      .attr("class", "event-stem")
      .attr("x1", (d: TimelineEvent & { date: Date; yOffset: number }) => focusEnhancedScale(d.date))
      .attr("x2", (d: TimelineEvent & { date: Date; yOffset: number }) => focusEnhancedScale(d.date))
      .attr("y1", (d: TimelineEvent & { date: Date; yOffset: number }) => baseEventY - d.yOffset * verticalStackSpacing)
      .attr("y2", baseEventY)
      .attr("stroke", "#ccc")
      .attr("stroke-width", 1);

    // Function to update ticks based on zoom
    const updateTicks = () => {
      // Declare ticks and tickFormat
      let ticks: any; // Using 'any' as per user note
      let tickFormat: (date: Date | number | { valueOf(): number }) => string; // Type as per d3.timeFormat

      const domain = currentBaseScale.domain();
      const timeSpanDays = (domain[1].getTime() - domain[0].getTime()) / (1000 * 60 * 60 * 24);

      // More granular tick control based on time span
      if (timeSpanDays < 30) { // Less than ~1 month visible, show ticks every 3 days
         ticks = d3.timeDay.every(3);
         tickFormat = d3.timeFormat("%b %d"); // e.g., "Jan 01"
      } else if (timeSpanDays < 180) { // Less than ~6 months visible, show monthly ticks
         ticks = d3.timeMonth.every(1);
         tickFormat = d3.timeFormat("%b %Y"); // e.g., "Jan 2023"
      } else if (timeSpanDays < 730) { // Less than ~2 years visible, show bi-monthly ticks
         ticks = d3.timeMonth.every(2);
         tickFormat = d3.timeFormat("%b %Y"); // e.g., "Jan 2023"
      } else if (timeSpanDays < 3650 * 2) { // Less than ~20 years visible, show yearly ticks
         ticks = d3.timeYear.every(1);
         tickFormat = d3.timeFormat("%Y"); // e.g., "2023"
      } else { // Greater than ~20 years visible, show ticks every 5 years
         ticks = d3.timeYear.every(5);
         tickFormat = d3.timeFormat("%Y"); // e.g., "2020"
      }

      xAxis.ticks(ticks).tickFormat(tickFormat);
      // Use the transition for smooth axis update, using the focusEnhancedScale for positioning
      xAxisGroup.transition().duration(300).call(xAxis.scale(focusEnhancedScale));
    };

    updateTicks(); // Initial tick update

    // D3 Zoom behavior
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 20])
      .extent([[0, 0], [dimensions.width, dimensions.height]])
      // Type parameter event in zoomBehavior.on("zoom", ...)
      .on("zoom", (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        setCurrentTransform(event.transform);
        const newBaseScale: d3.ScaleTime<number, number, never> = event.transform.rescaleX(xScale);
        const newFocusEnhancedScale = (date: Date): number => createFocusScale(newBaseScale, currentFocusDate, focusStrength, focusWidth, width)(date);

        // Update the positions of event nodes and bars
        // Type parameter d in eventNodes.transition()...attr("cx", ...)
        eventNodes.transition().duration(300).attr("cx", (d: TimelineEvent & { date: Date; yOffset: number }) => newFocusEnhancedScale(d.date));
        // Type parameters d in eventBars.transition()...
        eventBars.transition().duration(300)
           .attr("x", (d: TimelineEvent & { date: Date; yOffset: number; startYear?: number; endYear?: number }) => newFocusEnhancedScale(new Date(d.startYear!, 0, 1)))
           .attr("width", (d: TimelineEvent & { date: Date; yOffset: number; startYear?: number; endYear?: number }) => Math.max(0, newFocusEnhancedScale(new Date(d.endYear!, 0, 1)) - newFocusEnhancedScale(new Date(d.startYear!, 0, 1))));
        // Type parameter d in eventStems.transition()...
        eventStems
          .transition().duration(300)
          .attr("x1", (d: TimelineEvent & { date: Date; yOffset: number }) => newFocusEnhancedScale(d.date)) // Use new scale for stems too
          .attr("x2", (d: TimelineEvent & { date: Date; yOffset: number }) => newFocusEnhancedScale(d.date)) // Use new scale for stems too
          .attr("y1", (d: TimelineEvent & { date: Date; yOffset: number }) => baseEventY - d.yOffset * verticalStackSpacing);

        updateTicks(); // Update ticks on zoom
      });

    svg.call(zoomBehavior);

    if (svgRef.current) {
        // Correct way to store and access zoom behavior instance
        const svgElement = d3.select(svgRef.current);
        (svgElement.node() as any).__zoom = zoomBehavior; // Store on node for programmatic access
        zoomBehavior.transform(svg.transition().duration(0), currentTransform);
    }
  }, [dimensions, eventsWithDates, minDate, maxDate, currentTransform, selectedEvent]);

  // Resize observer for responsiveness (optional but good)
  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
      if (!entries || !entries.length) return;
      const { width, height } = entries[0].contentRect;
       if (Math.abs(dimensions.width - width) > 5 || Math.abs(dimensions.height - height) > 5) {
            setDimensions({ width, height });
       }
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    return () => resizeObserver.disconnect();
  }, [dimensions]);

  // Handlers for explicit zoom buttons
  const handleZoomIn = useCallback(() => {
    if (svgRef.current) {
      const svgElement = d3.select(svgRef.current);
      // Access the stored zoom behavior instance
      const currentZoomBehavior = (svgElement.node() as any)?.__zoom;
      if (currentZoomBehavior) {
        svgElement.transition().duration(300).call(currentZoomBehavior.scaleBy, 1.5);
      }
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (svgRef.current) {
      const svgElement = d3.select(svgRef.current);
      const currentZoomBehavior = (svgElement.node() as any)?.__zoom;
       if (currentZoomBehavior) {
        svgElement.transition().duration(300).call(currentZoomBehavior.scaleBy, 0.75);
      }
    }
  }, []);

  const handleResetZoom = useCallback(() => {
    if (svgRef.current) {
      const svgElement = d3.select(svgRef.current);
      const currentZoomBehavior = (svgElement.node() as any)?.__zoom;
       if (currentZoomBehavior) {
        svgElement.transition().duration(300).call(currentZoomBehavior.transform, d3.zoomIdentity);
      }
    }
  }, []);

  return (
    <div ref={containerRef} className="w-full h-[400px] border relative" style={{minHeight: '300px'}}>
        <div className="absolute top-2 left-2 z-10 space-x-2">
            <Button onClick={handleZoomIn} size="sm">Zoom In</Button>
            <Button onClick={handleZoomOut} size="sm">Zoom Out</Button>
            <Button onClick={handleResetZoom} size="sm" variant="outline">Reset</Button>
        </div>
      <svg ref={svgRef} width="100%" height="100%">
        {/* D3 will render here */}
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
          className="absolute"
          style={{
            top: tooltip.y,
            left: tooltip.x,
            zIndex: 1000,
            padding: '8px',
            borderRadius: '4px',
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            color: 'white',
            fontSize: '12px',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
            pointerEvents: 'none',
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
};

export default DynamicFocusTimeline;