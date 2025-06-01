// src/components/study/UnitContentDisplay.tsx
"use client";

import type { UnitData, PdfResource } from '@/lib/types'; // Adjust path if needed
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, Download, FileText, Maximize } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

// Placeholder for react-pdf if you choose to use it for inline PDF viewing.
// For now, we'll use an iframe or direct link.
// import { Document, Page, pdfjs } from 'react-pdf';
// import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
// import 'react-pdf/dist/esm/Page/TextLayer.css';
// if (typeof window !== 'undefined') {
//   pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
// }


interface UnitContentDisplayProps {
  unitData: UnitData;
}

// Simple PDF Viewer using iframe or link
const EmbeddedPdfViewer = ({ resource }: { resource: PdfResource }) => {
  const [showFullScreen, setShowFullScreen] = useState(false);

  // Simple check if it's an external URL
  const isExternal = resource.url.startsWith('http://') || resource.url.startsWith('https://');

  if (showFullScreen) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-2 rounded-lg shadow-2xl w-full h-full max-w-4xl max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">{resource.label}</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowFullScreen(false)}>Close Fullscreen</Button>
          </div>
          <iframe
            src={isExternal ? resource.url : resource.url} // For local, it needs to be served, so /textbooks/... is fine
            title={resource.label}
            className="w-full h-full border-0"
          />
        </div>
      </div>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md flex items-center">
          {resource.icon === 'book-open' && <BookOpen className="mr-2 h-5 w-5 text-primary" />}
          {resource.icon !== 'book-open' && <FileText className="mr-2 h-5 w-5 text-primary" />}
          {resource.label}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFullScreen(true)} className="text-xs h-7 px-2">
            <Maximize className="mr-1 h-3 w-3"/> View Full
          </Button>
          {resource.downloadable !== false && (
            <Button variant="outline" size="sm" asChild className="text-xs h-7 px-2">
              <a href={resource.url} download={resource.label.replace(/[^a-zA-Z0-9]/g, '_') + '.pdf'} target="_blank" rel="noopener noreferrer">
                <Download className="mr-1 h-3 w-3"/> Download
              </a>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0 aspect-video max-h-[500px] overflow-hidden">
        <iframe
          src={isExternal ? resource.url : resource.url}
          title={resource.label}
          className="w-full h-full border-0 min-h-[400px]"
          loading="lazy"
        />
      </CardContent>
    </Card>
  );
};


export default function UnitContentDisplay({ unitData }: UnitContentDisplayProps) {
  const { toast } = useToast();
  const [currentMcqIndex, setCurrentMcqIndex] = useState(0);
  // Add more states for CRQs, ERQs, Numericals as you implement them

  if (!unitData) {
    return <p>Error: Unit data is not available.</p>;
  }
  
  // For react-latex-next (LaTeX rendering)
  // Ensure KaTeX CSS is imported globally (e.g., in your root layout.tsx)
  // import 'katex/dist/katex.min.css';
  // import Latex from 'react-latex-next';


  return (
    <div className="space-y-6 p-4 md:p-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl">{unitData.unitName}</CardTitle>
          <CardDescription>
            {unitData.gradeName} - {unitData.sectionName} {/* sectionName might be empty if not available in manifest */}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* PDF Resources */}
      {unitData.pdfResources && unitData.pdfResources.length > 0 && (
        <Accordion type="single" collapsible defaultValue="item-pdf-0">
          {unitData.pdfResources.map((resource, index) => (
             <AccordionItem value={`item-pdf-${index}`} key={resource.id}>
               <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                 <div className="flex items-center gap-2">
                   {resource.icon === 'book-open' && <BookOpen className="h-5 w-5 text-primary" />}
                   {resource.icon !== 'book-open' && <FileText className="h-5 w-5 text-primary" />}
                   View: {resource.label}
                 </div>
               </AccordionTrigger>
               <AccordionContent className="pt-0"> {/* Remove default padding */}
                 <EmbeddedPdfViewer resource={resource} />
               </AccordionContent>
             </AccordionItem>
          ))}
        </Accordion>
      )}

      {/* Summary */}
      {unitData.summary && (
        <Card>
          <CardHeader><CardTitle className="text-xl">Unit Summary</CardTitle></CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            {/* For LaTeX: <Latex>{unitData.summary}</Latex> */}
            <div dangerouslySetInnerHTML={{ __html: unitData.summary.replace(/\n/g, '<br />') }} />
          </CardContent>
        </Card>
      )}

      {/* Key Points */}
      {unitData.keyPoints && unitData.keyPoints.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-xl">Key Points</CardTitle></CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1 pl-5">
              {unitData.keyPoints.map((point, index) => (
                <li key={index}>
                  {/* For LaTeX: <Latex>{point}</Latex> */}
                  <span dangerouslySetInnerHTML={{ __html: point.replace(/\n/g, '<br />') }} />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      
      {/* Placeholder Sections - these will be expanded in later phases */}
      {unitData.mcqs && unitData.mcqs.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-xl">Multiple Choice Questions (MCQs)</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground">// Interactive MCQ Player will be here (Phase 3)</p>
          </CardContent>
        </Card>
      )}

      {unitData.conceptualQuestions && unitData.conceptualQuestions.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-xl">Conceptual Questions (CRQs)</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground">// CRQ display and interaction will be here</p>
          </CardContent>
        </Card>
      )}

      {unitData.extendedResponseQuestions && unitData.extendedResponseQuestions.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-xl">Extended Response Questions (ERQs)</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground">// ERQ display will be here</p>
          </CardContent>
        </Card>
      )}

      {unitData.numericalProblems && unitData.numericalProblems.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-xl">Numerical Problems</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground">// Numerical problems display will be here</p>
          </CardContent>
        </Card>
      )}

    </div>
  );
}