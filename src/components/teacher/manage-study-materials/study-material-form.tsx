typescriptreact
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useFirebase } from '@/lib/firebase'; // Assuming firebase functions are available here
import { httpsCallable } from 'firebase/functions';
import { doc, getDoc } from 'firebase/firestore';
import { ChapterContent } from '@/lib/types'; // Assuming ChapterContent type is defined
import { toast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import { PlusCircle, MinusCircle } from 'lucide-react';

interface StudyMaterialFormProps {
  chapterId: string | null;
}

// Define a basic schema for the form
const formSchema = z.object({
  keyPoints: z.string().optional(),
  summary: z.string().optional(),
  // Add other fields as needed, potentially using arrays for lists
  // philosophicalQuestions: z.array(z.object({ question: z.string(), hint: z.string().optional() })).optional(),
  // ... add more fields matching ChapterContent
});

type StudyMaterialFormValues = z.infer<typeof formSchema>;

const StudyMaterialForm: React.FC<StudyMaterialFormProps> = ({
  chapterId,
}) => {
  const { db, functions } = useFirebase(); // Assuming db and functions are exported
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [initialData, setInitialData] = useState<ChapterContent | null>(null);

  const form = useForm<StudyMaterialFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      keyPoints: '',
      summary: '',
      // Set default values for other fields
    },
  });

  const updateChapterMaterial = functions
    ? httpsCallable(functions, 'updateChapterMaterial')
    : null;

  useEffect(() => {
    const fetchStudyMaterial = async () => {
      if (!chapterId || !db) {
        setInitialData(null);
        form.reset(); // Reset form when no chapter is selected
        return;
      }

      setIsLoading(true);
      try {
        const docRef = doc(db, 'studyMaterials', chapterId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as ChapterContent;
          setInitialData(data);
          form.reset(data); // Populate form with fetched data
        } else {
          setInitialData(null);
          form.reset(); // Reset form if document doesn't exist
        }
      } catch (error) {
        console.error('Error fetching study material:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch study material.',
          variant: 'destructive',
        });
        setInitialData(null);
        form.reset();
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudyMaterial();
  }, [chapterId, db, form]);

  const onSubmit = async (values: StudyMaterialFormValues) => {
    if (!chapterId || !updateChapterMaterial) {
      toast({
        title: 'Error',
        description: 'Chapter not selected or functions not available.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      // Prepare data payload for the Cloud Function
      const payload = {
        chapterId,
        ...values,
      };
      await updateChapterMaterial(payload);

      toast({
        title: 'Success',
        description: 'Study material updated successfully.',
      });
    } catch (error: any) {
      console.error('Error saving study material:', error);
      toast({
        title: 'Error',
        description: `Failed to save study material: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!chapterId) {
    return (
      <div className="p-4 text-center text-gray-500">
        Select a grade and chapter to manage study materials.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        Loading study material...
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-medium mb-4">Edit Chapter Content</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Example Form Fields */}
          <FormField
            control={form.control}
            name="keyPoints"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Key Points (Markdown supported)</FormLabel>
                <FormControl>
                  <Textarea rows={10} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="summary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Summary</FormLabel>
                <FormControl>
                  <Textarea rows={5} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Add fields for other content types (formulas, MCQs, Q&A, etc.) here */}
          {/* This will likely require more complex UI components and form logic */}
          {/* Example for a list of philosophical questions (simplified) */}
           {/*
          <FormLabel>Philosophical Questions</FormLabel>
           {form.watch('philosophicalQuestions')?.map((q, index) => (
             <div key={index} className="flex space-x-2 mb-2">
               <Input
                 placeholder="Question"
                 value={q.question}
                 onChange={(e) => {
                   const newQuestions = [...form.getValues('philosophicalQuestions') || []];
                   newQuestions[index].question = e.target.value;
                   form.setValue('philosophicalQuestions', newQuestions);
                 }}
               />
                <Input
                 placeholder="Hint (Optional)"
                 value={q.hint || ''}
                 onChange={(e) => {
                   const newQuestions = [...form.getValues('philosophicalQuestions') || []];
                   newQuestions[index].hint = e.target.value;
                   form.setValue('philosophicalQuestions', newQuestions);
                 }}
               />
               <Button type="button" variant="outline" size="icon" onClick={() => {
                 const newQuestions = form.getValues('philosophicalQuestions')?.filter((_, i) => i !== index) || [];
                 form.setValue('philosophicalQuestions', newQuestions);
               }}>
                 <MinusCircle className="h-4 w-4" />
               </Button>
             </div>
           ))}
           <Button type="button" variant="outline" size="sm" onClick={() => {
             form.setValue('philosophicalQuestions', [...form.getValues('philosophicalQuestions') || [], { question: '', hint: '' }]);
           }}>
             <PlusCircle className="mr-2 h-4 w-4" /> Add Question
           </Button>
           */}


          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Content'}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default StudyMaterialForm;