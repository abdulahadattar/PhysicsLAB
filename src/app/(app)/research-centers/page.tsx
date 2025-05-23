
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Telescope, Link as LinkIcon } from "lucide-react";

const researchCenters = [
  { name: "CERN", description: "The European Organization for Nuclear Research, one of the world's largest and most respected centres for scientific research.", link: "https://home.cern" },
  { name: "LIGO Scientific Collaboration", description: "A group of international physicists focused on the direct detection of gravitational waves.", link: "https://www.ligo.org" },
  { name: "NASA (National Aeronautics and Space Administration)", description: "Leads an innovative program of space exploration, scientific discovery, and aeronautics research.", link: "https://www.nasa.gov" },
  { name: "Fermilab", description: "America's particle physics and accelerator laboratory.", link: "https://www.fnal.gov" },
  { name: "Max Planck Institute for Physics", description: "Focuses on particle physics, astroparticle physics, and cosmology.", link: "https://www.mpp.mpg.de/en/" },
  // Add more centers as needed
];

export default function ResearchCentersPage() {
  return (
    <div className="space-y-6">
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <div className="inline-block mx-auto bg-primary/10 p-3 rounded-full mb-2">
             <Telescope className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl">Physics Research Centers & Observatories</CardTitle>
          <CardDescription>Explore some of the world's leading institutions driving physics research and discovery.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {researchCenters.map((center) => (
          <Card key={center.name} className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-xl">{center.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground">{center.description}</p>
            </CardContent>
            <CardContent className="mt-auto">
              <Button asChild className="w-full">
                <a href={center.link} target="_blank" rel="noopener noreferrer">
                  <LinkIcon className="mr-2 h-4 w-4" /> Visit Website
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
       <Card>
        <CardHeader>
          <CardTitle>More to Explore</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This is just a small sample of the many incredible physics research centers and observatories around the globe. Students are encouraged to research further based on their interests! Topics like local university research departments or specific observatories (e.g., Mauna Kea Observatories, European Southern Observatory) can also be explored.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
    