typescriptreact
'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PlusCircledIcon, TrashIcon } from '@radix-ui/react-icons';

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

import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  DocumentData,
  QuerySnapshot,
} from 'firebase/firestore';
import { Question } from '@/lib/types'; // Assuming Question interface is defined here
import { useToast } from '@/components/ui/use-toast';

const questionSchema = z.object({
  questionText: z.string().min(1, 'Question text is required'),
  questionType: z.enum(['single-choice', 'multiple-choice', 'short-answer']), // Add other types as needed
  options: z.array(z.string().min(1, 'Option cannot be empty')).optional(),
  correctAnswers: z
    .array(z.string().min(1, 'Correct answer cannot be empty'))
    .min(1, 'At least one correct answer is required'),
  points: z.number().min(1, 'Points must be at least 1'),
  explanation: z.string().optional(),
  quizId: z.string(), // Link to the parent quiz
});

type QuestionFormValues = z.infer<typeof questionSchema>;

interface QuestionEditorFormProps {
  quizId: string;
}

const QuestionEditorForm: React.FC<QuestionEditorFormProps> = ({ quizId }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(
    null
  );
  const { toast } = useToast();

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      questionText: '',
      questionType: 'single-choice',
      options: [''],
      correctAnswers: [''],
      points: 1,
      explanation: '',
      quizId: quizId,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'options',
  });

  const {
    fields: correctAnswersFields,
    append: appendCorrectAnswer,
    remove: removeCorrectAnswer,
  } = useFieldArray({
    control: form.control,
    name: 'correctAnswers',
  });

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!quizId) return;
      try {
        const q = query(
          collection(db, 'questions'),
          where('quizId', '==', quizId)
        );
        const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q);
        const fetchedQuestions: Question[] = [];
        querySnapshot.forEach((doc) => {
          fetchedQuestions.push({ id: doc.id, ...doc.data() } as Question);
        });
        setQuestions(fetchedQuestions);
      } catch (error) {
        console.error('Error fetching questions:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch questions.',
          variant: 'destructive',
        });
      }
    };

    fetchQuestions();
  }, [quizId, toast]);

  const onSubmit = async (values: QuestionFormValues) => {
    try {
      if (editingQuestionId) {
        // Update existing question
        const questionRef = doc(db, 'questions', editingQuestionId);
        await updateDoc(questionRef, values as any); // Use any for now, type safety needs refinement with Firestore types
        setQuestions(
          questions.map((q) =>
            q.id === editingQuestionId ? { ...q, ...values } : q
          )
        );
        toast({
          title: 'Success',
          description: 'Question updated successfully.',
        });
      } else {
        // Add new question
        const docRef = await addDoc(collection(db, 'questions'), values);
        setQuestions([...questions, { id: docRef.id, ...values }]);
        toast({
          title: 'Success',
          description: 'Question added successfully.',
        });
      }
      form.reset();
      setEditingQuestionId(null);
    } catch (error) {
      console.error('Error saving question:', error);
      toast({
        title: 'Error',
        description: 'Failed to save question.',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (question: Question) => {
    form.reset(question as any); // Use any for now
    setEditingQuestionId(question.id);
  };

  const handleDelete = async (questionId: string) => {
    try {
      const questionRef = doc(db, 'questions', questionId);
      await deleteDoc(questionRef);
      setQuestions(questions.filter((q) => q.id !== questionId));
      toast({
        title: 'Success',
        description: 'Question deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting question:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete question.',
        variant: 'destructive',
      });
    }
  };

  const handleAddOption = () => {
    append('');
  };

  const handleRemoveOption = (index: number) => {
    remove(index);
  };

  const handleAddCorrectAnswer = () => {
    appendCorrectAnswer('');
  };

  const handleRemoveCorrectAnswer = (index: number) => {
    removeCorrectAnswer(index);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Manage Questions</h2>

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Existing Questions</h3>
        {questions.length === 0 ? (
          <p>No questions added yet.</p>
        ) : (
          <ul>
            {questions.map((question) => (
              <li
                key={question.id}
                className="border p-4 mb-2 rounded flex justify-between items-center"
              >
                <div>{question.questionText}</div>
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mr-2"
                    onClick={() => handleEdit(question)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(question.id)}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <h3 className="text-lg font-semibold mb-2">
        {editingQuestionId ? 'Edit Question' : 'Add New Question'}
      </h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="questionText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Question Text</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter question text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="questionType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Question Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a question type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="single-choice">Single Choice</SelectItem>
                    <SelectItem value="multiple-choice">
                      Multiple Choice
                    </SelectItem>
                    <SelectItem value="short-answer">Short Answer</SelectItem>
                    {/* Add other types here */}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {(form.watch('questionType') === 'single-choice' ||
            form.watch('questionType') === 'multiple-choice') && (
            <FormItem>
              <FormLabel>Options</FormLabel>
              {fields.map((item, index) => (
                <div key={item.id} className="flex space-x-2 mb-2">
                  <FormField
                    control={form.control}
                    name={`options.${index}`}
                    render={({ field }) => (
                      <FormItem className="flex-grow">
                        <FormControl>
                          <Input placeholder={`Option ${index + 1}`} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleRemoveOption(index)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddOption}
              >
                <PlusCircledIcon className="mr-2 h-4 w-4" /> Add Option
              </Button>
              <FormMessage />
            </FormItem>
          )}

          <FormItem>
            <FormLabel>Correct Answer(s)</FormLabel>
            {correctAnswersFields.map((item, index) => (
              <div key={item.id} className="flex space-x-2 mb-2">
                <FormField
                  control={form.control}
                  name={`correctAnswers.${index}`}
                  render={({ field }) => (
                    <FormItem className="flex-grow">
                      <FormControl>
                        <Input placeholder={`Correct Answer ${index + 1}`} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleRemoveCorrectAnswer(index)}
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddCorrectAnswer}
            >
              <PlusCircledIcon className="mr-2 h-4 w-4" /> Add Correct Answer
            </Button>
            <FormMessage />
          </FormItem>

          <FormField
            control={form.control}
            name="points"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Points</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Enter points" {...field} onChange={event => field.onChange(+event.target.value)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="explanation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Explanation (Optional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter explanation" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">
            {editingQuestionId ? 'Update Question' : 'Add Question'}
          </Button>
          {editingQuestionId && (
            <Button
              type="button"
              variant="outline"
              className="ml-2"
              onClick={() => {
                form.reset();
                setEditingQuestionId(null);
              }}
            >
              Cancel Edit
            </Button>
          )}
        </form>
      </Form>
    </div>
  );
};

export default QuestionEditorForm;