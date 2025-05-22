import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { STUDY_GRADES } from "@/lib/constants";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookText, ChevronRight } from "lucide-react";

export default function StudyMaterialPage() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Study Materials</CardTitle>
          <CardDescription>Chapter-wise notes and solved MCQs for Grades 9-12, aligned with the Sindh Textbook Board syllabus. Materials by Abdul Ahad Attar.</CardDescription>
        </CardHeader>
      </Card>

      <Accordion type="multiple" className="w-full space-y-4">
        {STUDY_GRADES.map((grade) => (
          <Card key={grade.id} className="overflow-hidden shadow-md">
            <AccordionItem value={`grade-${grade.id}`} className="border-none">
              <AccordionTrigger className="bg-secondary/30 hover:bg-secondary/50 px-6 py-4 text-xl font-semibold hover:no-underline">
                <div className="flex items-center gap-3">
                  <BookText className="h-6 w-6 text-primary" />
                  {grade.name}
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-0">
                <ul className="divide-y divide-border">
                  {grade.chapters.map((chapter) => (
                    <li key={chapter.id}>
                      <Link href={`/study-material/${grade.id}/${chapter.id}`} passHref>
                        <Button variant="ghost" className="w-full justify-between rounded-none px-6 py-4 h-auto">
                          <span className="text-left">{chapter.name}</span>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </Button>
                      </Link>
                    </li>
                  ))}
                  {grade.chapters.length === 0 && (
                     <li className="px-6 py-4 text-muted-foreground">No chapters available for this grade yet.</li>
                  )}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Card>
        ))}
      </Accordion>
    </div>
  );
}
