
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash2, FileArchive, Save, Loader2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ModelPaper } from '@/lib/types';

const MODEL_PAPERS_STORAGE_KEY = 'physicsLabModelPapers';

export default function ManageModelPapersPage() {
  const { toast } = useToast();
  const [modelPapers, setModelPapers] = useState<ModelPaper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [newPaperTitle, setNewPaperTitle] = useState("");
  const [newPaperDescription, setNewPaperDescription] = useState("");
  const [newPaperUrl, setNewPaperUrl] = useState("");

  const loadModelPapers = useCallback(() => {
    setIsLoading(true);
    try {
      const storedData = localStorage.getItem(MODEL_PAPERS_STORAGE_KEY);
      if (storedData) {
        setModelPapers(JSON.parse(storedData));
      } else {
        setModelPapers([]);
      }
    } catch (e) {
      console.error("Error loading model papers:", e);
      toast({ title: "Error", description: "Could not load saved model papers.", variant: "destructive"});
      setModelPapers([]);
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    loadModelPapers();
  }, [loadModelPapers]);

  const handleSaveModelPapers = useCallback(() => {
    setIsSaving(true);
    try {
      localStorage.setItem(MODEL_PAPERS_STORAGE_KEY, JSON.stringify(modelPapers));
      toast({ title: "Model Papers Saved", description: "Your changes have been saved locally." });
    } catch (e) {
      console.error("Error saving model papers:", e);
      toast({ title: "Save Failed", description: "Could not save model papers.", variant: "destructive" });
    }
    setIsSaving(false);
  }, [modelPapers, toast]);

  const handleAddModelPaper = () => {
    if (!newPaperTitle.trim() || !newPaperUrl.trim()) {
      toast({ title: "Missing Information", description: "Please provide a title and a URL for the model paper.", variant: "destructive" });
      return;
    }
    if (!newPaperUrl.startsWith('http://') && !newPaperUrl.startsWith('https://')) {
      toast({ title: "Invalid URL", description: "Please provide a valid URL starting with http:// or https://.", variant: "destructive" });
      return;
    }

    const newPaper: ModelPaper = {
      id: `mp-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,
      title: newPaperTitle,
      description: newPaperDescription,
      url: newPaperUrl,
    };
    setModelPapers(prev => [...prev, newPaper]);
    setNewPaperTitle("");
    setNewPaperDescription("");
    setNewPaperUrl("");
    toast({ title: "Model Paper Added", description: `"${newPaper.title}" is ready to be saved.` });
  };

  const handleDeleteModelPaper = (id: string) => {
    setModelPapers(prev => prev.filter(paper => paper.id !== id));
    toast({ title: "Model Paper Removed", description: "The paper has been removed from the list. Save changes to make it permanent." });
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileArchive className="h-7 w-7 text-primary"/>Manage Model Papers</CardTitle>
          <CardDescription>Add, edit, or remove links to model papers. These will be visible to students on the Model Papers page. Changes are saved to your browser's local storage.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-2 gap-6 items-start">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Add New Model Paper</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="new-paper-title">Title <span className="text-destructive">*</span></Label>
              <Input id="new-paper-title" value={newPaperTitle} onChange={e => setNewPaperTitle(e.target.value)} placeholder="E.g., Grade 10 Physics - Final Exam 2023" />
            </div>
            <div>
              <Label htmlFor="new-paper-description">Description (Optional)</Label>
              <Textarea id="new-paper-description" value={newPaperDescription} onChange={e => setNewPaperDescription(e.target.value)} placeholder="Briefly describe the paper" rows={2}/>
            </div>
            <div>
              <Label htmlFor="new-paper-url">Google Drive PDF Link <span className="text-destructive">*</span></Label>
              <Input id="new-paper-url" type="url" value={newPaperUrl} onChange={e => setNewPaperUrl(e.target.value)} placeholder="https://drive.google.com/..." />
            </div>
            <Button onClick={handleAddModelPaper} className="w-full">
              <PlusCircle className="mr-2 h-4 w-4"/> Add to List
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Current Model Papers</CardTitle>
            <CardDescription>Review and remove existing model papers. Click "Save All Changes" below to persist updates.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
            {isLoading && <div className="text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto"/></div>}
            {!isLoading && modelPapers.length === 0 && (
              <p className="text-muted-foreground text-center py-4">No model papers added yet.</p>
            )}
            {!isLoading && modelPapers.map((paper) => (
              <Card key={paper.id} className="p-3 bg-secondary/30">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{paper.title}</h4>
                    {paper.description && <p className="text-xs text-muted-foreground mb-1">{paper.description}</p>}
                    <a href={paper.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline truncate block max-w-xs">{paper.url}</a>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteModelPaper(paper.id)}>
                    <Trash2 className="h-4 w-4 text-destructive"/>
                  </Button>
                </div>
              </Card>
            ))}
          </CardContent>
          <CardFooter>
             <Button onClick={handleSaveModelPapers} disabled={isSaving} className="w-full mt-4">
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
              Save All Changes to Model Papers
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

