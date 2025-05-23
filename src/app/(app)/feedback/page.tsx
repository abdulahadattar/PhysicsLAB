
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send, MessageSquare, Phone, Mail, WifiOff, Save, HelpCircle, Notebook, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const LOCAL_STORAGE_FEEDBACK_KEY = 'physicsLabOfflineFeedback';

interface StoredFeedback {
  id: string;
  name?: string;
  email?: string;
  subject: string;
  message: string;
  timestamp: string;
}

export default function FeedbackPage() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [pendingFeedback, setPendingFeedback] = useState<StoredFeedback[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const loadPendingFeedback = useCallback(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LOCAL_STORAGE_FEEDBACK_KEY);
      if (stored) {
        setPendingFeedback(JSON.parse(stored));
      } else {
        setPendingFeedback([]);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      loadPendingFeedback();

      const handleOnline = () => {
        setIsOnline(true);
        toast({ title: "Back Online!", description: "Attempting to send pending messages." });
        sendPendingFeedback();
      };
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      if (navigator.onLine && pendingFeedback.length > 0) {
        sendPendingFeedback();
      }

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isOnline && pendingFeedback.length > 0) {
      sendPendingFeedback();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline, pendingFeedback.length]);

  const saveFeedbackLocally = (feedbackData: Omit<StoredFeedback, 'id' | 'timestamp'>) => {
    const newFeedbackItem: StoredFeedback = {
        ...feedbackData,
        id: `feedback-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        timestamp: new Date().toISOString()
    };
    setPendingFeedback(prev => {
        const updatedFeedback = [...prev, newFeedbackItem];
        localStorage.setItem(LOCAL_STORAGE_FEEDBACK_KEY, JSON.stringify(updatedFeedback));
        return updatedFeedback;
    });
  };

  const sendPendingFeedback = useCallback(async () => {
    if (isSyncing || !isOnline || pendingFeedback.length === 0) return;

    setIsSyncing(true);
    toast({
      title: "Syncing...",
      description: `Attempting to send ${pendingFeedback.length} pending message(s).`,
    });

    let successfulSends = 0;
    const remainingFeedback: StoredFeedback[] = [];

    for (const item of pendingFeedback) {
      try {
        console.log("Attempting to send feedback:", item);
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
        console.log("Successfully sent feedback:", item.id);
        successfulSends++;
      } catch (error) {
        console.error("Failed to send feedback item during sync:", item.id, error);
        remainingFeedback.push(item);
      }
    }

    localStorage.setItem(LOCAL_STORAGE_FEEDBACK_KEY, JSON.stringify(remainingFeedback));
    setPendingFeedback(remainingFeedback);
    setIsSyncing(false);

    if (successfulSends > 0) {
      toast({
        title: "Sync Complete!",
        description: `Successfully sent ${successfulSends} message(s). ${remainingFeedback.length > 0 ? `${remainingFeedback.length} remaining.` : ''}`,
      });
    } else if (pendingFeedback.length > 0 && remainingFeedback.length === pendingFeedback.length) {
      toast({
        title: "Sync Attempt Failed",
        description: "Could not send pending messages at this time. Will try again later.",
        variant: "destructive"
      });
    } else if (remainingFeedback.length === 0 && pendingFeedback.length > 0) {
         toast({
            title: "All Pending Messages Cleared!",
            description: "All locally saved messages have been successfully submitted.",
         });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline, pendingFeedback, toast, isSyncing]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!subject.trim() || !message.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in the subject and message fields.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    const feedbackData = { name, email, subject, message };

    if (!isOnline) {
      saveFeedbackLocally(feedbackData);
      toast({
        title: "Offline: Submission Saved Locally",
        description: "Your submission has been saved and will be sent when you're back online.",
        variant: "default",
      });
      setName(""); setEmail(""); setSubject(""); setMessage("");
      setIsSubmitting(false);
      return;
    }

    try {
      console.log("Online submission attempt:", feedbackData);
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: "Submission Sent!",
        description: "Thank you! Your message has been sent and will be reviewed shortly.",
      });
      setName(""); setEmail(""); setSubject(""); setMessage("");
    } catch (error) {
        console.error("Online submission failed:", error);
        toast({
            title: "Submission Failed",
            description: "Could not send your message. It has been saved locally and will be sent when you're back online.",
            variant: "destructive",
        });
        saveFeedbackLocally(feedbackData);
        setName(""); setEmail(""); setSubject(""); setMessage("");
    } finally {
        setIsSubmitting(false);
    }
  };

  const pendingFeedbackCount = pendingFeedback.length;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {!isOnline && (
        <Alert variant="default" className="bg-yellow-50 border-yellow-300 text-yellow-700 dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-300">
          <WifiOff className="h-4 w-4 !text-yellow-600 dark:!text-yellow-400" />
          <AlertTitle>You are currently offline</AlertTitle>
          <AlertDescription>
            Submissions will be saved locally and sent when you reconnect.
            {pendingFeedbackCount > 0 && ` You have ${pendingFeedbackCount} pending message(s).`}
          </AlertDescription>
        </Alert>
      )}
      {isOnline && pendingFeedbackCount > 0 && (
        <Alert variant="default" className="bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300">
          {isSyncing ? <Loader2 className="h-4 w-4 animate-spin !text-blue-600 dark:!text-blue-400" /> : <Save className="h-4 w-4 !text-blue-600 dark:!text-blue-400" />}
          <AlertTitle>{isSyncing ? "Syncing Offline Submissions..." : "Pending Offline Submissions"}</AlertTitle>
          <AlertDescription>
            {isSyncing ? `Attempting to send ${pendingFeedbackCount} message(s).` :
            `You have ${pendingFeedbackCount} message(s) saved offline. They will be sent automatically.`}
            {!isSyncing && <Button size="sm" variant="link" className="p-0 h-auto ml-1 text-blue-700 dark:text-blue-300 hover:underline" onClick={sendPendingFeedback}>Send now</Button>}
          </AlertDescription>
        </Alert>
      )}

      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <div className="inline-block mx-auto bg-primary/10 p-3 rounded-full mb-2">
             <HelpCircle className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl">Questions, Notes, Feedback & Error Reports</CardTitle>
          <CardDescription>
            Have academic questions, doubts, suggestions, want to submit your notes for review, or encountered an issue? Let us know!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                <Label htmlFor="name">Your Name (Optional)</Label>
                <Input id="name" placeholder="Enter your name" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div>
                <Label htmlFor="email">Your Email (Optional)</Label>
                <Input id="email" type="email" placeholder="Enter your email for a response" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
            </div>
            <div>
              <Label htmlFor="subject">Subject <span className="text-destructive">*</span></Label>
              <Input id="subject" placeholder="E.g., Question on Newton's Laws, Notes for Chapter 2, App Bug Report" value={subject} onChange={e => setSubject(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="message">Message / Question / Notes Details <span className="text-destructive">*</span></Label>
              <Textarea id="message" placeholder="Describe your question, feedback, notes content, or error in detail here..." rows={6} value={message} onChange={e => setMessage(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting || isSyncing}>
              {(isSubmitting && isOnline) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isOnline ? <Send className="mr-2 h-4 w-4"/> : <Save className="mr-2 h-4 w-4" />)}
              {isSubmitting ? (isOnline ? "Submitting..." : "Saving...") : (isOnline ? "Send Message / Notes" : "Save Message / Notes Offline")}
            </Button>
          </form>
        </CardContent>
        <Separator className="my-6" />
        <CardFooter className="flex flex-col items-start gap-4">
            <div>
                <h3 className="text-lg font-semibold mb-2">Direct Contact Information</h3>
                <p className="text-sm text-muted-foreground">
                    Alternatively, you can reach out directly via:
                </p>
            </div>
            <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary" />
                <a href="tel:03451301907" className="text-sm hover:underline">0345-1301907</a>
            </div>
            <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <a href="mailto:abdul7762ahad@gmail.com" className="text-sm hover:underline">abdul7762ahad@gmail.com</a>
            </div>
        </CardFooter>
      </Card>
    </div>
  );
}
