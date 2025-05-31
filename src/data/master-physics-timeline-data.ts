import type { PhysicsTimelineData } from '../components/timeline/timeline-types';

// Import the TS data from the single source
import { physicsTimelineEventsData } from '../components/timeline/physics-timeline-events';

// Use the imported data directly
const masterTitle = physicsTimelineEventsData.title || "Physics Timeline";
const masterDescription = physicsTimelineEventsData.description || "Explore the history of physics.";
const masterMinYear = physicsTimelineEventsData.minYear;
const masterMaxYear = physicsTimelineEventsData.maxYear;

export const masterPhysicsTimelineData: PhysicsTimelineData = {
  title: masterTitle,
  description: masterDescription,
 events: physicsTimelineEventsData.events, // Use events directly from the single source
  minYear: masterMinYear,
  maxYear: masterMaxYear,
};

// You would typically export masterPhysicsTimelineData here:
// export const masterPhysicsTimelineData: PhysicsTimelineData = {...};
// The above code block already does this.