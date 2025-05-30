typescriptreact
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

// Define a schema for the form using Zod
const formSchema = z.object({
  title: z.string().min(2, {
    message: 'Title must be at least 2 characters.',
  }),
  description: z.string().optional(),
  gradeId: z.string().min(1, {
    message: 'Please select a grade.',
  }),
  chapterId: z.string().min(1, {
    message: 'Please select a chapter.',
  }),
  timeLimit: z.coerce.number().int().positive().optional(),
});

type QuizFormValues = z.infer<typeof formSchema>;

interface QuizFormProps {
  initialData?: QuizFormValues; // Optional initial data for editing
  onSubmit: (data: QuizFormValues) => void;
  isLoading: boolean;
}

const QuizForm: React.FC<QuizFormProps> = ({
  initialData,
  onSubmit,
  isLoading,
}) => {
  const form = useForm<QuizFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      title: '',
      description: '',
      gradeId: '',
      chapterId: '',
      timeLimit: undefined,
    },
  });

  // Placeholder state for grades and chapters - replace with Firestore fetching
  const [grades, setGrades] = useState<{ id: string; name: string }[]>([]);
  const [chapters, setChapters] = useState<{ id: string; name: string; gradeId: string }[]>([]);

  useEffect(() => {
    // TODO: Fetch grades from Firestore and update grades state
    // Example placeholder data:
    setGrades([
      { id: 'grade9', name: 'Grade 9' },
      { id: 'grade10', name: 'Grade 10' },
    ]);
  }, []);

  useEffect(() => {
    // TODO: Fetch chapters from Firestore (filtered by selected grade) and update chapters state
    // Example placeholder data:
    const selectedGrade = form.watch('gradeId');
    if (selectedGrade === 'grade9') {
        setChapters([
            { id: 'chapter1-g9', name: 'Chapter 1 (G9)', gradeId: 'grade9' },
            { id: 'chapter2-g9', name: 'Chapter 2 (G9)', gradeId: 'grade9' },
        ]);
    } else if (selectedGrade === 'grade10') {
        setChapters([
            { id: 'chapter1-g10', name: 'Chapter 1 (G10)', gradeId: 'grade10' },
            { id: 'chapter2-g10', name: 'Chapter 2 (G10)', gradeId: 'grade10' },
        ]);
    } else {
        setChapters([]);
    }
  }, [form.watch('gradeId')]); // Re-run when gradeId changes

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quiz Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter quiz title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter quiz description"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="gradeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Grade</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a grade" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {grades.map((grade) => (
                    <SelectItem key={grade.id} value={grade.id}>
                      {grade.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="chapterId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chapter</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a chapter" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {chapters
                    .filter(chapter => chapter.gradeId === form.watch('gradeId')) // Filter chapters by selected grade
                    .map((chapter) => (
                    <SelectItem key={chapter.id} value={chapter.id}>
                      {chapter.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="timeLimit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Time Limit (Minutes - Optional)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 30" {...field} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {initialData ? 'Save Changes' : 'Create Quiz'}
        </Button>
      </form>
    </Form>
  );
};

export default QuizForm;