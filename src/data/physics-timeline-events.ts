// src/data/physics-timeline-events.ts
import type { PhysicsTimelineData } from '@/components/timeline/PhysicsTimelineSVG';

export const physicsTimelineEventsData: PhysicsTimelineData = {
  title: "A Journey Through Physics History",
  description: "Explore pivotal moments, groundbreaking theories, and technological marvels from ancient discoveries to modern physics.",
  events: [
    // == 1. Pre-Science ==
    {
      id: 'stone-tools',
      laneKey: 'pre-science',
      category: 'pre-science-milestone',
      title: 'Stone Tools (Oldowan)',
      year: -2500000,
      shortDescription: 'Earliest widely recognized stone tool industry.',
      icon: 'Hammer',
      details: [
        { type: 'context', title: 'Significance', description: 'Marked a crucial cognitive and technological leap for early hominins, enabling new food sources and processing techniques.' },
        { type: 'explanation', title: 'Characteristics', description: 'Simple choppers, scrapers, and pounders made by striking flakes off a core stone.' },
      ],
    },
    {
      id: 'control-of-fire',
      laneKey: 'pre-science',
      category: 'pre-science-milestone',
      title: 'Control of Fire',
      year: -400000,
      shortDescription: 'Harnessing fire for warmth, cooking, protection, and tool making.',
      icon: 'Flame',
      details: [
        { type: 'impact', title: 'Transformative Impact', description: 'Provided warmth, light, protection from predators, enabled cooking (making food safer and more digestible), and later used in pottery and metallurgy.' },
      ],
    },
    {
      id: 'invention-wheel',
      laneKey: 'pre-science',
      category: 'pre-science-milestone',
      title: 'Invention of the Wheel',
      year: -3500,
      shortDescription: 'First used for potter\'s wheels, later adapted for transportation.',
      icon: 'CircleDot',
      details: [
        { type: 'explanation', title: 'Early Use', description: 'The earliest evidence of wheeled vehicles appears slightly later, around 3200 BC, in Mesopotamia and the Indus Valley.' },
      ],
    },
    {
      id: 'bronze-age',
      laneKey: 'pre-science',
      category: 'pre-science-period',
      title: 'Bronze Age',
      startYear: -3300,
      endYear: -1200,
      shortDescription: 'Period characterized by the use of bronze for tools and weapons.',
      icon: 'Sword',
      details: [
        { type: 'explanation', title: 'Metallurgy', description: 'Bronze (an alloy of copper and tin) offered significant advantages over stone and copper, leading to advancements in agriculture, warfare, and art.' },
      ],
    },
    // ... Continue populating with ALL events from your blueprint and more ...
  ],
};
