"use client"; // Keep if PhysicsTimeline uses client-side hooks, which it does

import { PhysicsTimeline } from '@/components/timeline/PhysicsTimeline';
import timelineDataJson from '@/data/physics-timeline.json'; // Import the JSON data
import type { PhysicsTimelineData } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card'; // For error/loading

// Cast the imported JSON to the defined type
const timelineData: PhysicsTimelineData = timelineDataJson as PhysicsTimelineData;

export default function PhysicsTimelinePage() {
  if (!timelineData || !timelineData.events || timelineData.events.length === 0) {
    // This check can also be inside the PhysicsTimeline component
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">
            Could not load timeline data. Please check the data source.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto"> {/* Adjust container as needed */}
      <PhysicsTimeline data={timelineData} />
    </div>
  );
}