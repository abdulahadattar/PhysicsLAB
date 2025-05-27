"use client"; // Keep if PhysicsTimeline uses client-side hooks, which it does

import { PhysicsTimeline } from '@/components/timeline/PhysicsTimelineSVG';
import { physicsTimelineEventsData } from '@/data/physics-timeline-events'; // Import the new comprehensive dataset

export default function PhysicsTimelinePage() {
  return (
    <div className="container mx-auto py-10">
      <PhysicsTimeline data={physicsTimelineEventsData} />
    </div>
  );
}