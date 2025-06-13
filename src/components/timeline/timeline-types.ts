export type EventCategory =
  | 'pre-science-milestone'
  | 'pre-science-period'
  | 'ancient-discovery' | 'ancient-model' | 'medieval-tech'
  | 'renaissance-discovery' | 'enlightenment-tech'
  | 'classical-theory' | 'classical-discovery'
  | 'optics-electromagnetism' | 'measurement'
  | 'modern-theory' | 'modern-discovery' | 'modern-model' | 'quantum-mechanics' | 'relativity-cosmology'
  | 'particle-discovery' | 'particle-nuclear-physics' | 'experimental-discovery'
  | 'machine-experiment'
  | 'space-mission' | 'earth-cosmic-event'
  | 'technology-application'
  | 'technological-advancement'
  | 'theory-development' // General category for broad theories
  | 'quantum-discovery' // Specific quantum breakthroughs
  | 'relativity-discovery' // Specific relativity milestones
  | 'cosmology-discovery'; // Specific cosmology milestones

export interface TimelineEvent {
  id: string;
  category: EventCategory;
  title: string;
  year?: number;
  startYear?: number;
  endYear?: number;
  description?: string; // Add optional description property
  detailedDescription?: string; // Rich text/markdown for detailed view
  shortDescription: string;
  icon?: string; // Lucide icon name
  image?: string; // URL or data URL
  imageUrls?: string[]; // Multiple image URLs
  externalLinks?: Array<{ label: string; url: string }>; // Links to external resources
  relatedConcepts?: string[]; // Linking to glossary/study material concepts
  significanceRating?: number; // 1-5, for emphasis/filtering
  mediaUrls?: Array<{ type: 'video' | 'audio'; url: string }>; // Embedded media
  tags?: string[]; // Custom tags for filtering/categorization

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
  'modern-physics': { name: "Modern Physics", targetCategories: ['modern-theory', 'modern-discovery', 'modern-model', 'quantum-mechanics', 'relativity-cosmology', 'quantum-discovery', 'relativity-discovery'] as EventCategory[], defaultColor: '#2E8B57', description: "Relativity and quantum mechanics." },
  'particle-discoveries': { name: "Particle Discoveries", targetCategories: ['particle-discovery', 'experimental-discovery', 'particle-nuclear-physics'] as EventCategory[], defaultColor: '#B8860B', description: "Fundamental constituents of matter." },
  'big-machines': { name: "Big Machines & Experiments", targetCategories: ['machine-experiment', 'technological-advancement'] as EventCategory[], defaultColor: '#DC143C', description: "Large-scale experimental apparatus." },
  'space-missions': { name: "Space Missions & Observations", targetCategories: ['space-mission', 'cosmology-discovery'] as EventCategory[], defaultColor: '#1E90FF', description: "Exploring the cosmos." },
  'earth-cosmic-events': { name: "Earth & Cosmic Events", targetCategories: ['earth-cosmic-event'] as EventCategory[], defaultColor: '#FF8C00', description: "Significant natural events." },
  'technology-applications': { name: "Technology & Applications", targetCategories: ['technology-application'] as EventCategory[], defaultColor: '#9932CC', description: "Inventions from physics principles." }, 
} as const;

export type LaneKey = keyof typeof LANE_CONFIG_MAP;

// Updated to have distinct colors from LANE_CONFIG_MAP
export const CATEGORY_COLOR_MAP: Record<EventCategory, string> = {
  'pre-science-milestone': '#A9A9A9', // DarkGray
  'pre-science-period': '#C0C0C0', // Silver
  'ancient-discovery': '#DEB887', // BurlyWood
  'ancient-model': '#D2B48C', // Tan
  'medieval-tech': '#BC8F8F', // RosyBrown
  'renaissance-discovery': '#A0522D', // Sienna
  'enlightenment-tech': '#C34A2C', // Burnt Orange (Distinct from lane color)
  'classical-theory': '#6495ED', // CornflowerBlue
  'classical-discovery': '#5DADE2', // Pacific Blue (Distinct from lane color)
  'optics-electromagnetism': '#00CED1', // DarkTurquoise
  'measurement': '#DAF7A6', // Pale Lime Green (Distinct color)
  'modern-theory': '#3CB371', // MediumSeaGreen
  'modern-discovery': '#48C9B0', // Aqua Teal (Distinct from lane color)
  'modern-model': '#90EE90', // LightGreen
  'quantum-mechanics': '#20B2AA', // LightSeaGreen
  'relativity-cosmology': '#AFEEEE', // PaleTurquoise
  'particle-discovery': '#DAA520', // Goldenrod
  'particle-nuclear-physics': '#D68910', // Orange Peel (Distinct from lane color)
  'experimental-discovery': '#FF6347', // Tomato
  'machine-experiment': '#DB7093', // PaleVioletRed
  'space-mission': '#85C1E9', // Light Blue (Distinct from lane color)
  'earth-cosmic-event': '#F5B041', // Mustard Yellow (Distinct from lane color)
  'technology-application': '#AF7AC5', // Lavender (Distinct from lane color)
  'technological-advancement': '#CD5C5C', // IndianRed
  'theory-development': '#BA55D3', // MediumOrchid
  'quantum-discovery': '#48D1CC', // MediumTurquoise
  'relativity-discovery': '#C71585', // MediumVioletRed
  'cosmology-discovery': '#6A5ACD', // SlateBlue
};