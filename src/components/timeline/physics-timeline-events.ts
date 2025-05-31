import type { PhysicsTimelineData, TimelineEvent } from './timeline-types';
import { rawPhysicsTimelineEvents } from './physics-timeline-events-raw'; // Import raw data

export const physicsTimelineEventsData: PhysicsTimelineData = {
  title: "Physics Timeline",
  description: "Explore the pivotal moments, brilliant minds, and groundbreaking discoveries that have shaped our understanding of the universe.",
  events: rawPhysicsTimelineEvents, // Assign the imported raw data
  // Optional: Define minYear and maxYear if you have specific ranges for this data source
  // minYear: -400,
  // maxYear: 2000,
};