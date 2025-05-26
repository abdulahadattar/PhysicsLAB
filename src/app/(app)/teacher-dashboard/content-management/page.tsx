"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertTriangle, FileEdit, Link2, Trash2, Bot, PlusCircle, Save, BookCopy, Landmark, Globe, Notebook, NotebookText, BookOpen } from "lucide-react"; // Added BookOpen
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { StudyGrade, Chapter, TeacherChapterOverrides, ChapterContent, MCQ, QuestionAnswer, TeacherGradeOverrides, TeacherGradeOverride } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { extractChapterContent, type ExtractedChapterContentOutput } from '@/ai/flows/extractChapterContentFlow';

const TEACHER_CHAPTER_OVERRIDES_STORAGE_KEY = 'physicsLabTeacherChapterOverrides';
const TEACHER_GRADE_OVERRIDES_STORAGE_KEY = 'physicsLabTeacherGradeOverrides';


type ChapterPdfTypeKey = keyof Pick<ChapterContent, 'stbbChapterPdfLink' | 'teacherNotesPdfName' | 'alternativeChapterPdfLink' | 'punjabBoardPdfName' | 'nationalSyllabusPdfName' | 'ziauddinBoardPdfName'>;
interface ChapterPdfConfigItem {
  key: ChapterPdfTypeKey;
  label: string;
  placeholder: string;
  icon: React.ElementType;
}

type GradePdfTypeKey = keyof Pick<StudyGrade, 'completeTextbookPdfLink' | 'ziauddinBoardFullPdfLink' | 'punjabBoardFullPdfLink' | 'nationalSyllabusFullPdfLink'>;
interface GradePdfConfigItem {
    key: GradePdfTypeKey;
    label: string;
    placeholder: string;
    icon: React.ElementType;
}


export default function TeacherContentManagementPage() {
  const { toast } = useToast();
  const [studyGrades, setStudyGrades] = useState<StudyGrade[]>([]);
  const [isLoadingGrades, setIsLoadingGrades] = useState(true);
  const [gradesError, setGradesError] = useState<string | null>(null);
  
  const [selectedGradeId, setSelectedGradeId] = useState<string | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  
  const [editableChapterContent, setEditableChapterContent] = useState<Partial<ChapterContent>>({});
  const [editableGradeOverrides, setEditableGradeOverrides] = useState<Partial<TeacherGradeOverride>>({});
  const [isGeneratingAiContent, setIsGeneratingAiContent] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // PDF resource icons
  const pdfResourceIcons = [
    { value: 'book', label: 'Book', icon: BookCopy },
    { value: 'notes', label: 'Notes', icon: NotebookText },
    { value: 'alternative', label: 'Alternative', icon: BookOpen },
    { value: 'syllabus', label: 'Syllabus', icon: Globe },
    { value: 'custom', label: 'Custom', icon: FileEdit },
  ];


  const fetchGrades = useCallback(async () => {
    setIsLoadingGrades(true);
    setGradesError(null);
    try {
      const res = await fetch('/api/study-materials');
      if (!res.ok) throw new Error(`Failed to fetch grades: ${res.statusText}`);
      let data: StudyGrade[] = await res.json();
      
      // Apply teacher overrides for full textbook links at the grade level
      const gradeOverridesRaw = localStorage.getItem(TEACHER_GRADE_OVERRIDES_STORAGE_KEY);
      if (gradeOverridesRaw) {
        const allGradeOverrides: TeacherGradeOverrides = JSON.parse(gradeOverridesRaw);
        data = data.map(grade => {
          const override = allGradeOverrides[grade.id];
          return override ? { ...grade, ...override } : grade;
        });
      }
      setStudyGrades(data);
    } catch (error) {
      console.error("Error fetching study grades:", error);
      const errorMsg = error instanceof Error ? error.message : "Could not load grade information.";
      setGradesError(errorMsg);
      toast({title: "Error", description: errorMsg, variant: "destructive"});
    } finally {
      setIsLoadingGrades(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

  const loadChapterContentForEditing = useCallback(() => {
    if (!selectedChapterId || !selectedGradeId) {
      setEditableChapterContent({});
      return;
    }
    const grade = studyGrades.find(g => g.id === selectedGradeId);
    const chapter = grade?.chapters.find(c => c.id === selectedChapterId);
    
    let contentToEdit: Partial<ChapterContent> = chapter?.content || {};

    try {
      const overridesRaw = localStorage.getItem(TEACHER_CHAPTER_OVERRIDES_STORAGE_KEY);
      if (overridesRaw) {
        const allOverrides: TeacherChapterOverrides = JSON.parse(overridesRaw);
        const chapterOverride = allOverrides[selectedChapterId];
        if (chapterOverride) {
          contentToEdit = { ...contentToEdit, ...chapterOverride };
        }
      }
    } catch (e) {
      console.error("Failed to load or parse teacher chapter overrides for editing:", e);
    }
    setEditableChapterContent(contentToEdit);
  }, [selectedChapterId, selectedGradeId, studyGrades]);

  const loadGradeOverridesForEditing = useCallback(() => {
    if (!selectedGradeId) {
        setEditableGradeOverrides({});
        return;
    }
    const grade = studyGrades.find(g => g.id === selectedGradeId);
    let overridesToEdit: Partial<TeacherGradeOverride> = {
        gradeId: selectedGradeId,
        completeTextbookPdfLink: grade?.completeTextbookPdfLink,
        ziauddinBoardFullPdfLink: grade?.ziauddinBoardFullPdfLink,
        punjabBoardFullPdfLink: grade?.punjabBoardFullPdfLink,
        nationalSyllabusFullPdfLink: grade?.nationalSyllabusFullPdfLink,
    };
     try {
      const gradeOverridesRaw = localStorage.getItem(TEACHER_GRADE_OVERRIDES_STORAGE_KEY);
      if (gradeOverridesRaw) {
        const allGradeOverrides: TeacherGradeOverrides = JSON.parse(gradeOverridesRaw);
        const gradeOverride = allGradeOverrides[selectedGradeId];
        if (gradeOverride) {
            overridesToEdit = { ...overridesToEdit, ...gradeOverride };
        }
      }
    } catch (e) {
      console.error("Failed to load or parse teacher grade overrides for editing:", e);
    }
    setEditableGradeOverrides(overridesToEdit);
  }, [selectedGradeId, studyGrades]);


  useEffect(() => {
    loadChapterContentForEditing();
  }, [selectedChapterId, loadChapterContentForEditing]);

  useEffect(() => {
    if (selectedGradeId) {
        loadGradeOverridesForEditing();
        setSelectedChapterId(null); 
        setEditableChapterContent({});
    } else {
        setEditableGradeOverrides({});
    }
  }, [selectedGradeId, loadGradeOverridesForEditing]);


  const handleChapterPdfLinkChange = (pdfType: ChapterPdfTypeKey, link: string) => {
    setEditableChapterContent(prev => ({ ...prev, [pdfType]: link }));
  };

  const handleGradePdfLinkChange = (pdfType: GradePdfTypeKey, link: string) => {
    setEditableGradeOverrides(prev => ({ ...prev, [pdfType]: link }));
  };


  const handleAiGenerate = async () => {
    let primaryPdfForAi: string | undefined;
    const potentialPdfKeys: ChapterPdfTypeKey[] = ['teacherNotesPdfName', 'stbbChapterPdfLink', 'alternativeChapterPdfLink', 'punjabBoardPdfName', 'nationalSyllabusPdfName', 'ziauddinBoardPdfName'];
    
    for (const key of potentialPdfKeys) {
        if ((editableChapterContent as any)[key]?.trim()) {
            primaryPdfForAi = (editableChapterContent as any)[key];
            break;
        }
    }

    if (!primaryPdfForAi || !primaryPdfForAi.startsWith('http')) {
      toast({ title: "No PDF Link for AI", description: "Please provide at least one valid Google Drive PDF link for the selected chapter to generate content from.", variant: "destructive" });
      return;
    }
    setIsGeneratingAiContent(true);
    try {
      const result: ExtractedChapterContentOutput = await extractChapterContent({ 
        pdfTextContent: `Simulated content from PDF link: ${primaryPdfForAi}`, 
        chapterName: studyGrades.find(g=>g.id === selectedGradeId)?.chapters.find(c=>c.id === selectedChapterId)?.name || "Selected Chapter"
      });
      
      setEditableChapterContent(prev => ({
        ...prev,
        keyPoints: result.keyPoints,
        mcqs: result.mcqs.map((mcq, i) => ({ ...mcq, id: `mcq-${Date.now()}-${i}`})),
        shortAnswers: result.shortAnswers.map((qa, i) => ({ ...qa, id: `sa-${Date.now()}-${i}`})),
        longAnswers: result.longAnswers.map((qa, i) => ({...qa, id: `la-${Date.now()}-${i}`})),
      }));
      toast({ title: "AI Content Generated (Simulated)", description: "Review and save the generated content." });
    } catch (error) {
      console.error("AI generation error:", error);
      const errorMsg = error instanceof Error ? error.message : "Could not generate content.";
      toast({ title: "AI Generation Failed", description: errorMsg, variant: "destructive" });
    } finally {
      setIsGeneratingAiContent(false);
    }
  };
  
  const handleContentChange = (field: keyof ChapterContent | 'mcqs' | 'shortAnswers' | 'longAnswers', value: any, index?: number, subField?: keyof MCQ | keyof QuestionAnswer | 'options') => {
    setEditableChapterContent(prev => {
      const updatedContent = { ...prev };
      if ((field === 'mcqs' || field === 'shortAnswers' || field === 'longAnswers') && typeof index === 'number' && subField) {
        const items = [...(updatedContent[field as 'mcqs' | 'shortAnswers' | 'longAnswers'] || [])] as any[];
        if(items[index] === undefined && (field === 'mcqs' || field === 'shortAnswers' || field === 'longAnswers')) {
             items[index] = field === 'mcqs' ? { id: `new-${Date.now()}`, question: "", options: ["", "", "", ""], correctAnswerIndex: 0, explanation: "" } : { id: `new-${Date.now()}`, question: "", answer: "" };
        }
        if (field === 'mcqs' && subField === 'options') {
            const options = [...(items[index].options || ["", "", "", ""])];
            options[value.optionIndex] = value.optionValue; 
            items[index] = { ...items[index], options };
        } else if (field === 'mcqs' && subField === 'correctAnswerIndex') {
            items[index] = { ...items[index], correctAnswerIndex: parseInt(value, 10) };
        } else {
            items[index] = { ...items[index], [subField]: value };
        }
        return { ...updatedContent, [field]: items };
      }
      return { ...updatedContent, [field as keyof ChapterContent]: value };
    });
  };

  const addMcq = () => {
    setEditableChapterContent(prev => ({
      ...prev,
      mcqs: [...(prev.mcqs || []), { id: `new-mcq-${Date.now()}`, question: "", options: ["", "", "", ""], correctAnswerIndex: 0, explanation: "" }]
    }));
  };
  const removeMcq = (index: number) => {
    setEditableChapterContent(prev => ({
      ...prev,
      mcqs: prev.mcqs?.filter((_, i) => i !== index)
    }));
  };
  
  const addQuestionAnswer = (type: 'shortAnswers' | 'longAnswers') => {
    setEditableChapterContent(prev => ({
      ...prev,
      [type]: [...(prev[type] || []), { id: `new-${type}-${Date.now()}`, question: "", answer: "" }]
    }));
  };
  const removeQuestionAnswer = (type: 'shortAnswers' | 'longAnswers', index: number) => {
     setEditableChapterContent(prev => ({
      ...prev,
      [type]: (prev[type] as QuestionAnswer[])?.filter((_, i) => i !== index)
    }));
  };

  const saveChapterContent = () => {
    if (!selectedChapterId || !selectedGradeId) {
      toast({ title: "Error", description: "No chapter selected.", variant: "destructive" });
      return;
    }
    try {
      const overridesRaw = localStorage.getItem(TEACHER_CHAPTER_OVERRIDES_STORAGE_KEY);
      const allOverrides: TeacherChapterOverrides = overridesRaw ? JSON.parse(overridesRaw) : {};
      
      const contentToSave: Partial<ChapterContent> = { ...editableChapterContent };
      // chapterPdfConfig.forEach(pdf => {
      //   if (!(contentToSave as any)[pdf.key]?.trim()) delete (contentToSave as any)[pdf.key];
      // });

      allOverrides[selectedChapterId] = {
        ...contentToSave,
        chapterId: selectedChapterId, 
        gradeId: selectedGradeId,    
        lastUpdated: new Date().toISOString(),
      };
      
      localStorage.setItem(TEACHER_CHAPTER_OVERRIDES_STORAGE_KEY, JSON.stringify(allOverrides));
      toast({ title: "Chapter Content Saved Locally!", description: `Changes for chapter ${selectedChapterId} saved to your browser.` });

       setStudyGrades(prevGrades => prevGrades.map(g => {
        if (g.id === selectedGradeId) {
          return {
            ...g,
            chapters: g.chapters.map(c => {
              if (c.id === selectedChapterId) {
                const baseContent = c.content || {};
                const updatedChapterContent = { ...baseContent, ...allOverrides[selectedChapterId] };
                return { ...c, content: updatedChapterContent };
              }
              return c;
            })
          };
        }
        return g;
      }));

    } catch (e) {
      console.error("Failed to save chapter overrides:", e);
      toast({ title: "Save Failed", description: "Could not save chapter changes to local storage.", variant: "destructive" });
    }
  };

  const saveGradeOverrides = () => {
    if (!selectedGradeId) {
        toast({ title: "Error", description: "No grade selected to save overrides for.", variant: "destructive" });
        return;
    }
    try {
        const gradeOverridesRaw = localStorage.getItem(TEACHER_GRADE_OVERRIDES_STORAGE_KEY);
        const allGradeOverrides: TeacherGradeOverrides = gradeOverridesRaw ? JSON.parse(gradeOverridesRaw) : {};

        const gradeContentToSave: Partial<TeacherGradeOverride> = { ...editableGradeOverrides, gradeId: selectedGradeId };
        gradeContentToSave.lastUpdated = new Date().toISOString();
        
        allGradeOverrides[selectedGradeId] = gradeContentToSave as TeacherGradeOverride;
        localStorage.setItem(TEACHER_GRADE_OVERRIDES_STORAGE_KEY, JSON.stringify(allGradeOverrides));
        toast({ title: "Grade PDF Links Saved Locally!", description: `Full textbook links for ${studyGrades.find(g => g.id === selectedGradeId)?.name} saved to your browser.` });
        
        setStudyGrades(prevGrades => prevGrades.map(g => {
            if (g.id === selectedGradeId) {
                return { ...g, ...gradeContentToSave };
            }
            return g;
        }));

    } catch (e) {
        console.error("Failed to save grade overrides:", e);
        toast({ title: "Save Failed", description: "Could not save grade PDF links to local storage.", variant: "destructive" });
    }
  };
  
  const selectedGradeObject = studyGrades.find(g => g.id === selectedGradeId);
  const selectedGradeName = selectedGradeObject?.name;
  const selectedChapterName = selectedGradeObject?.chapters.find(c => c.id === selectedChapterId)?.name;


  if (isLoadingGrades && studyGrades.length === 0) return <div className="flex justify-center items-center p-10"><Loader2 className="h-10 w-10 animate-spin text-primary"/> <span className="ml-2">Loading grades...</span></div>;
  

  // --- PDF Upload Handler ---
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    setUploadSuccess(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (!selectedGradeId || !selectedChapterId) {
      setUploadError('Please select a grade and chapter first.');
      return;
    }
    setUploading(true);
    try {
      // Build the upload path: public/textbooks/{gradeId}/{chapterId}.pdf
      const uploadPath = `/textbooks/${selectedGradeId}/${selectedChapterId}.pdf`;
      // Use a backend API to handle the upload (not client-side, but UI is ready)
      const formData = new FormData();
      formData.append('file', file);
      formData.append('gradeId', selectedGradeId);
      formData.append('chapterId', selectedChapterId);
      formData.append('uploadPath', uploadPath);
      const res = await fetch('/api/upload-pdf', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed.');
      setUploadSuccess('PDF uploaded successfully!');
      // Optionally, update the chapter's stbbChapterPdfLink in study-materials.json via API
      // (Or instruct teacher to refresh to see the new link)
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileEdit className="h-6 w-6 text-primary"/>Content Management</CardTitle>
          <CardDescription>Manage study material structure, PDF links, key points, and exercises. 
            <span className="font-semibold text-destructive block mt-1">Note: Your changes here are saved to your browser's local storage. To make these changes permanent for all users, you'll need to manually copy this data from local storage and update the <code>src/data/study-materials.json</code> file in the project code.</span>
          </CardDescription>
        </CardHeader>
      </Card>
       {gradesError && (
            <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{gradesError}</AlertDescription>
            </Alert>
        )}

      <div className="grid md:grid-cols-3 gap-6 items-start">
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">Select Grade</CardTitle></CardHeader>
            <CardContent>
              <Select onValueChange={(value) => {setSelectedGradeId(value);}} value={selectedGradeId || undefined} disabled={isLoadingGrades || studyGrades.length === 0}>
                <SelectTrigger><SelectValue placeholder="Select Grade" /></SelectTrigger>
                <SelectContent>
                  {studyGrades.map(grade => <SelectItem key={grade.id} value={grade.id}>{grade.name}</SelectItem>)}
                </SelectContent>
              </Select>
               {studyGrades.length === 0 && !isLoadingGrades && <p className="text-xs text-muted-foreground mt-1">No grades found. Check API or data source.</p>}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          {selectedGradeId ? (
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Chapters for {selectedGradeName}</CardTitle>
                    <CardDescription>Select a chapter below to edit its specific content (PDF links, key points, exercises).</CardDescription>
                </CardHeader>
                <CardContent className="max-h-[calc(100vh-250px)] overflow-y-auto pr-2"> {/* Added scroll for long chapter lists */}
                    <Accordion type="single" collapsible onValueChange={setSelectedChapterId} value={selectedChapterId || undefined} className="w-full">
                        {(selectedGradeObject?.chapters || []).map(chapter => (
                            <AccordionItem value={chapter.id} key={chapter.id} className="border-b last:border-b-0">
                                <AccordionTrigger className="text-base py-3 hover:bg-muted/50 px-2 rounded-md">{chapter.name}</AccordionTrigger>
                                <AccordionContent className="pt-4 space-y-6 bg-muted/10 p-4 rounded-b-md mt-[-1px] border-t">
                                  <div className="space-y-4 p-4 border rounded-md bg-background shadow-sm">
                                    <h3 className="font-semibold text-lg border-b pb-2 mb-3">PDF Resources for "{chapter.name}"</h3>
                                    {(editableChapterContent['pdfResources'] as any[] || []).map((res, idx) => (
                                      <div key={idx} className="flex flex-col md:flex-row gap-2 items-center border-b pb-3 last:border-b-0 last:pb-0">
                                        <Select
                                          value={res.icon || 'book'}
                                          onValueChange={icon => {
                                            const updated = [...(editableChapterContent['pdfResources'] as any[] || [])];
                                            updated[idx] = { ...updated[idx], icon };
                                            handleContentChange('pdfResources' as keyof ChapterContent, updated);
                                          }}
                                        >
                                          <SelectTrigger className="w-32">
                                            <SelectValue placeholder="Icon" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {pdfResourceIcons.map(opt => (
                                              <SelectItem key={opt.value} value={opt.value}><opt.icon className="inline h-4 w-4 mr-1" />{opt.label}</SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                        <Input
                                          type="text"
                                          placeholder="Label (e.g. Academy Notes, Alternate Textbook)"
                                          value={res.label || ''}
                                          onChange={e => {
                                            const updated = [...(editableChapterContent['pdfResources'] as any[] || [])];
                                            updated[idx] = { ...updated[idx], label: e.target.value };
                                            handleContentChange('pdfResources' as keyof ChapterContent, updated);
                                          }}
                                          className="flex-grow"
                                        />
                                        <Input
                                          type="url"
                                          placeholder="PDF URL or upload below"
                                          value={res.url || ''}
                                          onChange={e => {
                                            const updated = [...(editableChapterContent['pdfResources'] as any[] || [])];
                                            updated[idx] = { ...updated[idx], url: e.target.value };
                                            handleContentChange('pdfResources' as keyof ChapterContent, updated);
                                          }}
                                          className="flex-grow"
                                        />
                                        <Button variant="ghost" size="icon" onClick={() => {
                                          const updated = [...(editableChapterContent['pdfResources'] as any[] || [])];
                                          updated.splice(idx, 1);
                                          handleContentChange('pdfResources' as keyof ChapterContent, updated);
                                        }} className="h-8 w-8"><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                      </div>
                                    ))}
                                    <Button variant="outline" size="sm" onClick={() => handleContentChange('pdfResources' as keyof ChapterContent, [...(editableChapterContent['pdfResources'] as any[] || []), { label: '', icon: 'book', url: '' }])} className="h-9"><PlusCircle className="mr-2 h-4 w-4"/>Add PDF Resource</Button>
                                    <div className="flex flex-col md:flex-row gap-2 items-center mt-2">
                                      <input ref={fileInputRef} type="file" accept="application/pdf" onChange={async (e) => {
                                        setUploadError(null);
                                        setUploadSuccess(null);
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        if (!selectedGradeId || !selectedChapterId) {
                                          setUploadError('Please select a grade and chapter first.');
                                          return;
                                        }
                                        setUploading(true);
                                        try {
                                          const uploadPath = `/textbooks/${selectedGradeId}/${selectedChapterId}-${Date.now()}.pdf`;
                                          const formData = new FormData();
                                          formData.append('file', file);
                                          formData.append('gradeId', selectedGradeId);
                                          formData.append('chapterId', selectedChapterId);
                                          formData.append('uploadPath', uploadPath);
                                          const res = await fetch('/api/upload-pdf', { method: 'POST', body: formData });
                                          if (!res.ok) throw new Error('Upload failed.');
                                          setUploadSuccess('PDF uploaded successfully!');
                                          // Add new resource with uploaded file URL
                                          const updated = [...(editableChapterContent['pdfResources'] as any[] || []), { label: file.name, icon: 'book', url: uploadPath }];
                                          handleContentChange('pdfResources' as keyof ChapterContent, updated);
                                        } catch (err: any) {
                                          setUploadError(err.message || 'Upload failed.');
                                        } finally {
                                          setUploading(false);
                                          if (fileInputRef.current) fileInputRef.current.value = '';
                                        }
                                      }} className="block" disabled={uploading || !selectedGradeId || !selectedChapterId} />
                                      {uploading && <Loader2 className="animate-spin h-5 w-5 text-primary" />}
                                      {uploadError && <Alert variant="destructive" className="mt-2"><AlertDescription>{uploadError}</AlertDescription></Alert>}
                                      {uploadSuccess && <Alert variant="default" className="mt-2"><AlertDescription>{uploadSuccess}</AlertDescription></Alert>}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">You can upload a PDF or paste a link. Both are supported and optional.</p>
                                  </div>

                                  <Button 
                                    onClick={handleAiGenerate} 
                                    disabled={isGeneratingAiContent || !Array.isArray(editableChapterContent.pdfResources) || editableChapterContent.pdfResources.length === 0 || editableChapterContent.pdfResources.every(r => !r.url?.trim())}
                                    className="w-full"
                                    variant="outline"
                                    >
                                    {isGeneratingAiContent ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Bot className="mr-2 h-4 w-4"/>}
                                    Generate Key Points &amp; Exercises from PDF (AI - Simulated)
                                  </Button>
                                  
                                  <div className="space-y-2 p-4 border rounded-md bg-background shadow-sm">
                                    <h3 className="font-semibold text-lg border-b pb-2 mb-3">Key Points &amp; Summary</h3>
                                    <Textarea 
                                      value={editableChapterContent.keyPoints || ""}
                                      onChange={(e) => handleContentChange('keyPoints', e.target.value)}
                                      placeholder="Enter key points and summary... (AI can help generate this)"
                                      rows={8}
                                    />
                                  </div>

                                  {/* --- NEW: Summary field --- */}
                                  <div className="space-y-2 p-4 border rounded-md bg-background shadow-sm">
                                    <h3 className="font-semibold text-lg border-b pb-2 mb-3">Chapter Summary</h3>
                                    <Textarea
                                      value={editableChapterContent.summary || ""}
                                      onChange={e => handleContentChange('summary', e.target.value)}
                                      placeholder="Enter a 2-4 sentence summary of the chapter... (AI can help generate this)"
                                      rows={4}
                                    />
                                  </div>

                                  {/* --- NEW: Formulas (LaTeX) --- */}
                                  <Card>
                                    <CardHeader><CardTitle className="text-md">Important Formulas (LaTeX)</CardTitle></CardHeader>
                                    <CardContent className="space-y-4">
                                      {(editableChapterContent.formulas || []).map((f, index) => (
                                        <Card key={index} className="p-3 bg-secondary/30 shadow-inner">
                                          <Label className="font-semibold">Formula {index + 1}:</Label>
                                          <Input
                                            placeholder="LaTeX formula (no $ or $$)"
                                            value={f.formula}
                                            onChange={e => {
                                              const updated = [...(editableChapterContent.formulas || [])];
                                              updated[index] = { ...updated[index], formula: e.target.value };
                                              handleContentChange('formulas', updated);
                                            }}
                                            className="mb-1 text-sm bg-white h-9"
                                          />
                                          <Textarea
                                            placeholder="Description/context for this formula"
                                            value={f.description}
                                            onChange={e => {
                                              const updated = [...(editableChapterContent.formulas || [])];
                                              updated[index] = { ...updated[index], description: e.target.value };
                                              handleContentChange('formulas', updated);
                                            }}
                                            className="mb-1 text-sm bg-white"
                                            rows={2}
                                          />
                                          <Button variant="ghost" size="sm" onClick={() => {
                                            const updated = [...(editableChapterContent.formulas || [])];
                                            updated.splice(index, 1);
                                            handleContentChange('formulas', updated);
                                          }} className="mt-1 text-destructive hover:bg-destructive/10 h-8 px-2"><Trash2 className="mr-1 h-3 w-3"/>Remove Formula</Button>
                                        </Card>
                                      ))}
                                      <Button variant="outline" size="sm" onClick={() => handleContentChange('formulas', [...(editableChapterContent.formulas || []), { formula: '', description: '' }])} className="h-9"><PlusCircle className="mr-2 h-4 w-4"/>Add Formula</Button>
                                    </CardContent>
                                  </Card>

                                  {/* --- NEW: Real-World Examples --- */}
                                  <Card>
                                    <CardHeader><CardTitle className="text-md">Real-World Examples</CardTitle></CardHeader>
                                    <CardContent className="space-y-4">
                                      {(editableChapterContent.realWorldExamples || []).map((ex, index) => (
                                        <div key={index} className="flex gap-2 items-center">
                                          <Input
                                            placeholder={`Example ${index + 1}`}
                                            value={ex}
                                            onChange={e => {
                                              const updated = [...(editableChapterContent.realWorldExamples || [])];
                                              updated[index] = e.target.value;
                                              handleContentChange('realWorldExamples', updated);
                                            }}
                                            className="flex-grow text-sm bg-white h-9"
                                          />
                                          <Button variant="ghost" size="icon" onClick={() => {
                                            const updated = [...(editableChapterContent.realWorldExamples || [])];
                                            updated.splice(index, 1);
                                            handleContentChange('realWorldExamples', updated);
                                          }} className="h-8 w-8"><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                        </div>
                                      ))}
                                      <Button variant="outline" size="sm" onClick={() => handleContentChange('realWorldExamples', [...(editableChapterContent.realWorldExamples || []), ''])} className="h-9"><PlusCircle className="mr-2 h-4 w-4"/>Add Example</Button>
                                    </CardContent>
                                  </Card>

                                  {/* --- NEW: Diagram Descriptions --- */}
                                  <Card>
                                    <CardHeader><CardTitle className="text-md">Diagram Descriptions</CardTitle></CardHeader>
                                    <CardContent className="space-y-4">
                                      {(editableChapterContent.diagramDescriptions || []).map((d, index) => (
                                        <Card key={index} className="p-3 bg-secondary/30 shadow-inner">
                                          <Input
                                            placeholder="Diagram Title"
                                            value={d.title}
                                            onChange={e => {
                                              const updated = [...(editableChapterContent.diagramDescriptions || [])];
                                              updated[index] = { ...updated[index], title: e.target.value };
                                              handleContentChange('diagramDescriptions', updated);
                                            }}
                                            className="mb-1 text-sm bg-white h-9"
                                          />
                                          <Textarea
                                            placeholder="Diagram description/explanation"
                                            value={d.description}
                                            onChange={e => {
                                              const updated = [...(editableChapterContent.diagramDescriptions || [])];
                                              updated[index] = { ...updated[index], description: e.target.value };
                                              handleContentChange('diagramDescriptions', updated);
                                            }}
                                            className="mb-1 text-sm bg-white"
                                            rows={2}
                                          />
                                          <Button variant="ghost" size="sm" onClick={() => {
                                            const updated = [...(editableChapterContent.diagramDescriptions || [])];
                                            updated.splice(index, 1);
                                            handleContentChange('diagramDescriptions', updated);
                                          }} className="mt-1 text-destructive hover:bg-destructive/10 h-8 px-2"><Trash2 className="mr-1 h-3 w-3"/>Remove Diagram</Button>
                                        </Card>
                                      ))}
                                      <Button variant="outline" size="sm" onClick={() => handleContentChange('diagramDescriptions', [...(editableChapterContent.diagramDescriptions || []), { title: '', description: '' }])} className="h-9"><PlusCircle className="mr-2 h-4 w-4"/>Add Diagram</Button>
                                    </CardContent>
                                  </Card>

                                  <Button onClick={saveChapterContent} className="w-full mt-6">
                                    <Save className="mr-2 h-4 w-4"/> Save Content for {selectedChapterName}
                                  </Button>
                                   {editableChapterContent.lastUpdated && <p className="text-xs text-muted-foreground text-center mt-1">Chapter content last saved: {new Date(editableChapterContent.lastUpdated).toLocaleString()}</p>}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                         {(selectedGradeObject?.chapters.length === 0) && <p className="text-muted-foreground p-4 text-center">No chapters found for this grade.</p>}
                    </Accordion>
                </CardContent>
            </Card>
          ) : (
            <p className="text-center text-muted-foreground py-10 md:col-span-2">Select a grade to view and manage its chapters and content.</p>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileEdit className="h-6 w-6 text-primary"/>PDF Upload (Easy Teacher Tool)</CardTitle>
          <CardDescription>
            Select a grade and chapter, then upload a PDF. The file will be saved automatically and linked for students. No code editing needed!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <Select onValueChange={setSelectedGradeId} value={selectedGradeId || undefined}>
              <SelectTrigger><SelectValue placeholder="Select Grade" /></SelectTrigger>
              <SelectContent>
                {studyGrades.map(grade => <SelectItem key={grade.id} value={grade.id}>{grade.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select onValueChange={setSelectedChapterId} value={selectedChapterId || undefined}>
              <SelectTrigger><SelectValue placeholder="Select Chapter" /></SelectTrigger>
              <SelectContent>
                {(selectedGradeObject?.chapters || []).map(chapter => <SelectItem key={chapter.id} value={chapter.id}>{chapter.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handlePdfUpload} className="block" disabled={uploading || !selectedGradeId || !selectedChapterId} />
            {uploading && <Loader2 className="animate-spin h-5 w-5 text-primary" />}
          </div>
          {uploadError && <Alert variant="destructive" className="mt-2"><AlertDescription>{uploadError}</AlertDescription></Alert>}
          {uploadSuccess && <Alert variant="default" className="mt-2"><AlertDescription>{uploadSuccess}</AlertDescription></Alert>}
        </CardContent>
      </Card>
    </div>
  );
}


