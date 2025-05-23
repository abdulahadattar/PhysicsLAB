
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Link as LinkIcon } from "lucide-react";

const universities = [
  { name: "University of Sindh, Jamshoro", department: "Department of Physics", link: "http://usindh.edu.pk/dept-of-physics/" },
  { name: "Quaid-e-Awam University of Engineering, Science & Technology (QUEST), Nawabshah", department: "Department of Basic Sciences & Related Studies (often includes Physics)", link: "https://www.quest.edu.pk/departments/basic-sciences-related-studies" },
  { name: "Mehran University of Engineering & Technology (MUET), Jamshoro", department: "Department of Basic Sciences & Related Studies (often includes Physics)", link: "https://muet.edu.pk/academics/departments/basic-sciences-related-studies" },
  { name: "Karachi University (KU)", department: "Department of Physics", link: "https://uok.edu.pk/faculties/physics/" },
  { name: "NED University of Engineering and Technology, Karachi", department: "Department of Physics", link: "https://www.neduet.edu.pk/physics" },
  // Add more universities and their physics department links
];

export default function UniversityProgramsPage() {
  return (
    <div className="space-y-6">
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <div className="inline-block mx-auto bg-primary/10 p-3 rounded-full mb-2">
             <GraduationCap className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl">Physics Universities & Programs in Sindh</CardTitle>
          <CardDescription>Explore universities in Sindh offering physics degrees and programs. (This is a sample list and may not be exhaustive).</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {universities.map((uni) => (
          <Card key={uni.name} className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-xl">{uni.name}</CardTitle>
              <CardDescription>{uni.department}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
              <Button asChild className="w-full">
                <a href={uni.link} target="_blank" rel="noopener noreferrer">
                  <LinkIcon className="mr-2 h-4 w-4" /> Visit Department
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Disclaimer</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            The university information provided here is for general guidance and may not be fully up-to-date or comprehensive. Students are strongly encouraged to visit the official university websites for the latest program details, admission criteria, and contact information.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
    