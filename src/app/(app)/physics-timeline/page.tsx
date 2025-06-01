// /home/user/PhysicsLAB/src/app/(app)/physics-timeline/page.tsx
"use client"; 

import DynamicFocusTimeline from '@/components/timeline/DynamicFocusTimeline';
import { physicsTimelineEventsData } from '@/components/timeline/physics-timeline-events';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Added CardHeader, CardTitle

export default function PhysicsTimelinePage() {
  if (!physicsTimelineEventsData || !physicsTimelineEventsData.events || physicsTimelineEventsData.events.length === 0) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Physics Timeline</CardTitle>
          </CardHeader>
          <CardContent className="p-10 text-center text-muted-foreground">
            Could not load timeline data. Please check the data source or ensure `physics-timeline-events-raw.ts` has events.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4"> {/* Added some padding */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {physicsTimelineEventsData.title}
          </CardTitle>
          {physicsTimelineEventsData.description && (
            <p className="text-sm text-muted-foreground text-center mt-1">
              {physicsTimelineEventsData.description}
            </p>
          )}
        </CardHeader>
        <CardContent className="p-2 sm:p-4"> {/* Reduced padding slightly for timeline to use space */}
          <DynamicFocusTimeline events={physicsTimelineEventsData.events} />
        </CardContent>
      </Card>
    </div>
  );
}