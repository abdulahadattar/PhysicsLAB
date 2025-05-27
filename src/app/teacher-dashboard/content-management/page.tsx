import React, { useCallback, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import studyMaterials from "@/data/study-materials.json";

// Helper to get PDF URL for selected chapter
function getChapterPdfUrl(gradeId: string | undefined, chapterId: string | undefined) {
  const grade = studyMaterials.find((g) => g.id === gradeId);
  if (!grade) return undefined;
  const chapter = grade.chapters.find((c) => c.id === chapterId);
  if (!chapter) return undefined;
  const pdfRes = chapter.content?.pdfResources?.[0];
  return pdfRes?.url;
}

export default function TeacherContentManagementPage() {
  const grades = useMemo(() => studyMaterials.map((g) => ({ id: g.id, name: g.name, chapters: g.chapters })), []);
  const [selectedGradeId, setSelectedGradeId] = useState<string | undefined>();
  const [selectedChapterId, setSelectedChapterId] = useState<string | undefined>();
  const [aiDraft, setAiDraft] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedGrade = grades.find((g) => g.id === selectedGradeId);
  const chapters = selectedGrade ? selectedGrade.chapters : [];

  const handleGenerateDraft = useCallback(async () => {
    setLoading(true);
    setError("");
    setAiDraft(null);
    try {
      const pdfUrl = getChapterPdfUrl(selectedGradeId, selectedChapterId);
      if (!pdfUrl) throw new Error("No PDF resource found for this chapter.");
      const pdfPath = pdfUrl.startsWith("/") ? `public${pdfUrl}` : pdfUrl;
      const pdfTextRes = await fetch(`/api/pdf-proxy?pdfPath=${encodeURIComponent(pdfPath)}`);
      if (!pdfTextRes.ok) throw new Error("Failed to extract PDF text.");
      const { text: pdfTextContent } = await pdfTextRes.json();
      const aiRes = await fetch("/api/study-materials/extract-chapter-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapterName: chapters.find((c) => c.id === selectedChapterId)?.name,
          pdfTextContent,
        }),
      });
      if (!aiRes.ok) throw new Error("AI extraction failed.");
      const aiData = await aiRes.json();
      setAiDraft(aiData);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unknown error");
      }
    } finally {
      setLoading(false);
    }
  }, [selectedGradeId, selectedChapterId, chapters]);

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Teacher Content Management</h1>
      <p className="mb-6 text-muted-foreground">
        Generate, review, and edit AI-drafted chapter content. Select a chapter to begin.
      </p>
      <div className="flex gap-4 mb-6">
        <div className="w-1/2">
          <Select value={selectedGradeId} onValueChange={setSelectedGradeId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Grade" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Grade</SelectLabel>
                {grades.map((grade) => (
                  <SelectItem key={grade.id} value={grade.id}>{grade.name}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="w-1/2">
          <Select
            value={selectedChapterId}
            onValueChange={setSelectedChapterId}
            disabled={!selectedGradeId}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Chapter" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Chapter</SelectLabel>
                {chapters.map((ch) => (
                  <SelectItem key={ch.id} value={ch.id}>{ch.name}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button
        disabled={!selectedChapterId || loading}
        onClick={handleGenerateDraft}
      >
        {loading ? "Generating..." : "Generate AI Draft for this Chapter"}
      </Button>
      {error && <div className="text-red-500 mt-4">{error}</div>}
      {aiDraft && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2">AI Drafted Content</h2>
          <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
            {JSON.stringify(aiDraft, null, 2)}
          </pre>
          {/* TODO: Replace with editable fields for each section */}
        </div>
      )}
    </div>
  );
}
