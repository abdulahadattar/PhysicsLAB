import React, { useCallback, useState, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import studyMaterials from "@/data/study-materials.json";
import Link from "next/link";

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
  const [editableDraft, setEditableDraft] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");

  const selectedGrade = grades.find((g) => g.id === selectedGradeId);
  const chapters = selectedGrade ? selectedGrade.chapters : [];

  // Handler for AI Draft Generation
  const handleGenerateDraft = useCallback(async () => {
    setLoading(true);
    setError("");
    setAiDraft(null);
    try {
      // 1. Use full textbook PDF for the selected grade
      const grade = grades.find((g: any) => g.id === selectedGradeId);
      if (!grade) throw new Error("No grade selected.");
      // Use the local path for the full textbook PDF
      // Convention: /textbooks/fulltextbooks/STBB/PhysicsG<gradeNum>.pdf
      const gradeNum = grade.name.match(/\d+/)?.[0];
      if (!gradeNum) throw new Error("Could not determine grade number for PDF path.");
      const pdfPath = `/textbooks/fulltextbooks/STBB/PhysicsG${gradeNum}.pdf`;
      // 2. Call /api/pdf-to-text with the full PDF path
      const pdfTextRes = await fetch(`/api/pdf-proxy?pdfPath=${encodeURIComponent(pdfPath)}`);
      if (!pdfTextRes.ok) throw new Error("Failed to extract PDF text.");
      const { text: pdfTextContent } = await pdfTextRes.json();
      // 3. Call /api/extract-chapter-content (wraps extractChapterContentFlow)
      const aiRes = await fetch("/api/study-materials/extract-chapter-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapterName: chapters.find((c: any) => c.id === selectedChapterId)?.name,
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
  }, [selectedGradeId, selectedChapterId, chapters, grades]);

  // When AI draft is loaded, initialize editableDraft
  React.useEffect(() => {
    if (aiDraft) setEditableDraft(aiDraft);
  }, [aiDraft]);

  // Handler for editing fields
  function handleFieldChange(field: string, value: any) {
    setEditableDraft((prev: any) => ({ ...prev, [field]: value }));
  }

  // Handler for editing array fields (e.g., MCQs, formulas)
  function handleArrayFieldChange(field: string, idx: number, subfield: string, value: any) {
    setEditableDraft((prev: any) => {
      const arr = [...(prev[field] || [])];
      arr[idx] = { ...arr[idx], [subfield]: value };
      return { ...prev, [field]: arr };
    });
  }

  // Helper: get full textbook PDF path for selected grade
  function getFullTextbookPdfPath() {
    const gradeObj = grades.find((g: any) => g.id === selectedGradeId);
    if (!gradeObj) return undefined;
    const gradeNum = gradeObj.name.match(/\d+/)?.[0];
    if (!gradeNum) return undefined;
    return `/textbooks/fulltextbooks/STBB/PhysicsG${gradeNum}.pdf`;
  }

  // Handler for teacher PDF upload (future: connect to backend or storage API)
  async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadMsg("");
    try {
      const gradeObj = grades.find((g: any) => g.id === selectedGradeId);
      const gradeNum = gradeObj?.name.match(/\d+/)?.[0];
      if (!gradeNum) throw new Error("Could not determine grade number for upload.");
      const formData = new FormData();
      formData.append("file", file);
      // Add a simple teacher role header for demo (replace with real auth in production)
      const res = await fetch(`/api/upload-pdf?grade=${gradeNum}`, {
        method: "POST",
        headers: { "x-user-role": "teacher" },
        body: formData,
      } as any); // 'as any' to allow custom headers with FormData
      if (!res.ok) throw new Error("Upload failed");
      setUploadMsg("PDF uploaded and replaced successfully.");
    } catch (err) {
      setUploadMsg("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

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
      {aiDraft && editableDraft && (
        <div className="mt-8 space-y-6">
          <h2 className="text-xl font-semibold mb-2">Edit AI Drafted Content</h2>
          <div>
            <label className="font-semibold">Summary</label>
            <Textarea
              value={editableDraft.summary}
              onChange={e => handleFieldChange('summary', e.target.value)}
              className="mt-1 mb-4"
            />
          </div>
          <div>
            <label className="font-semibold">Key Points (Markdown)</label>
            <Textarea
              value={editableDraft.keyPoints}
              onChange={e => handleFieldChange('keyPoints', e.target.value)}
              className="mt-1 mb-4"
              rows={6}
            />
          </div>
          <div>
            <label className="font-semibold">Formulas (LaTeX)</label>
            {editableDraft.formulas?.map((f: any, idx: number) => (
              <div key={idx} className="mb-2 border rounded p-2">
                <Input
                  value={f.latex}
                  onChange={e => handleArrayFieldChange('formulas', idx, 'latex', e.target.value)}
                  className="mb-1"
                  placeholder="LaTeX formula (with $ or $$)"
                />
                <Textarea
                  value={f.description}
                  onChange={e => handleArrayFieldChange('formulas', idx, 'description', e.target.value)}
                  placeholder="Description"
                />
              </div>
            ))}
          </div>
          <div>
            <label className="font-semibold">MCQs</label>
            {editableDraft.mcqs?.map((mcq: any, idx: number) => (
              <div key={idx} className="mb-2 border rounded p-2">
                <Textarea
                  value={mcq.question}
                  onChange={e => handleArrayFieldChange('mcqs', idx, 'question', e.target.value)}
                  placeholder="Question"
                  className="mb-1"
                />
                {mcq.options?.map((opt: string, oidx: number) => (
                  <Input
                    key={oidx}
                    value={opt}
                    onChange={e => {
                      const opts = [...mcq.options];
                      opts[oidx] = e.target.value;
                      handleArrayFieldChange('mcqs', idx, 'options', opts);
                    }}
                    className="mb-1"
                    placeholder={`Option ${oidx + 1}`}
                  />
                ))}
                <Input
                  type="number"
                  value={mcq.correctAnswerIndex}
                  onChange={e => handleArrayFieldChange('mcqs', idx, 'correctAnswerIndex', Number(e.target.value))}
                  className="mb-1"
                  placeholder="Correct Answer Index"
                  min={0}
                  max={mcq.options?.length - 1}
                />
                <Textarea
                  value={mcq.explanation}
                  onChange={e => handleArrayFieldChange('mcqs', idx, 'explanation', e.target.value)}
                  placeholder="Explanation"
                />
              </div>
            ))}
          </div>
          {/* Add similar editable sections for shortAnswers, longAnswers, realWorldExamples, diagramDescriptions as needed */}
        </div>
      )}
      {selectedGradeId && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Full Textbook PDF</h3>
          <div className="flex gap-4 items-center">
            <Button asChild variant="secondary">
              <Link href={getFullTextbookPdfPath() || "#"} target="_blank" rel="noopener noreferrer">
                View Full Textbook
              </Link>
            </Button>
            <Button asChild variant="outline">
              <a href={getFullTextbookPdfPath() || "#"} download>
                Download PDF
              </a>
            </Button>
            {/* Teacher-only: Upload/replace PDF */}
            <Button
              variant="destructive"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Replace PDF (Teacher Only)"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setUploading(true);
                setUploadMsg("");
                try {
                  const gradeObj = grades.find((g: any) => g.id === selectedGradeId);
                  const gradeNum = gradeObj?.name.match(/\d+/)?.[0];
                  if (!gradeNum) throw new Error("Could not determine grade number for upload.");
                  const formData = new FormData();
                  formData.append("file", file);
                  // Add a simple teacher role header for demo (replace with real auth in production)
                  const res = await fetch(`/api/upload-pdf?grade=${gradeNum}`, {
                    method: "POST",
                    headers: { "x-user-role": "teacher" },
                    body: formData,
                  } as any); // 'as any' to allow custom headers with FormData
                  if (!res.ok) throw new Error("Upload failed");
                  setUploadMsg("PDF uploaded and replaced successfully.");
                } catch (err) {
                  setUploadMsg("Upload failed. Please try again.");
                } finally {
                  setUploading(false);
                }
              }}
              disabled={uploading}
            />
          </div>
          {uploadMsg && <div className="mt-2 text-green-600">{uploadMsg}</div>}
          {/* Optionally, embed PDF preview below for in-app reading */}
          <div className="mt-4 border rounded overflow-hidden" style={{height: 500}}>
            {getFullTextbookPdfPath() ? (
              <iframe
                src={getFullTextbookPdfPath()}
                title="Full Textbook PDF"
                width="100%"
                height="100%"
                style={{border: 0}}
                allowFullScreen
              />
            ) : (
              <div className="text-muted-foreground p-4">No PDF available for this grade.</div>
            )}
          </div>
        </div>
      )}
      {/* ...existing code... */}
    </div>
  );
}
