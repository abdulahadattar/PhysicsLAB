"use client"; // Keep if PhysicsTimeline uses client-side hooks, which it does

import DynamicFocusTimeline from '@/components/timeline/DynamicFocusTimeline'; // Import the dynamic timeline component
import { physicsTimelineEventsData } from '@/components/timeline/physics-timeline-events'; // Import the merged timeline data
import { Card, CardContent } from '@/components/ui/card'; // For error/loading


export default function PhysicsTimelinePage() {
  if (!physicsTimelineEventsData || !physicsTimelineEventsData.events || physicsTimelineEventsData.events.length === 0) {
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
    <div className="container mx-auto h-full"> {/* Adjust container as needed */}
      <DynamicFocusTimeline events={physicsTimelineEventsData.events} />
    </div>
  );
}