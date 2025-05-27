// src/lib/physics-timeline-adapter.ts
// Adapter to convert legacy TimelineEventNode[] to new TimelineEvent[] for SVG timeline
// Accepts any event with a string category
import type { TimelineEventNode, TimelineEventDetail } from '@/lib/types';
import type { TimelineEvent, EventCategory, LaneKey } from '@/components/timeline/PhysicsTimelineSVG';

// Map legacy categories to new EventCategory and laneKey
const CATEGORY_LANE_MAP: Record<string, { category: EventCategory, laneKey: LaneKey }> = {
  'Early Discoveries': { category: 'pre-science-milestone', laneKey: 'pre-science' },
  'Classical Mechanics': { category: 'classical-theory', laneKey: 'classical-physics' },
  'Thermodynamics': { category: 'classical-discovery', laneKey: 'classical-physics' },
  'Electromagnetism': { category: 'classical-discovery', laneKey: 'classical-physics' },
  'Relativity': { category: 'modern-theory', laneKey: 'modern-physics' },
  'Quantum Mechanics': { category: 'modern-discovery', laneKey: 'modern-physics' },
  'Modern Physics': { category: 'modern-discovery', laneKey: 'modern-physics' },
  'Cosmology': { category: 'earth-cosmic-event', laneKey: 'earth-cosmic-events' },
};

// Map legacy detail types to new detail types
const DETAIL_TYPE_MAP: Record<string, 'biography' | 'explanation' | 'context' | 'formula' | 'impact' | 'experiment_setup'> = {
  'scientist': 'biography',
  'discovery': 'explanation',
  'era': 'context',
};

export function adaptTimelineData(
  legacyData: { title: string; description: string; events: Array<{ category: string; [key: string]: any }>; minYear?: number; maxYear?: number }
): { title: string; description: string; events: TimelineEvent[]; minYear?: number; maxYear?: number } {
  return {
    title: legacyData.title,
    description: legacyData.description,
    minYear: legacyData.minYear,
    maxYear: legacyData.maxYear,
    events: legacyData.events.map((event) => {
      const mapping = CATEGORY_LANE_MAP[event.category] || { category: 'modern-discovery', laneKey: 'modern-physics' };
      return {
        id: event.id,
        category: mapping.category,
        laneKey: mapping.laneKey,
        title: event.title,
        year: event.year,
        shortDescription: event.shortDescription,
        icon: event.icon,
        image: event.image || event.cartoonImage,
        details: Array.isArray(event.details)
          ? event.details.map((d: any) => ({
              ...d,
              type: DETAIL_TYPE_MAP[d.type] || 'explanation',
            }))
          : [],
      };
    }),
  };
}
