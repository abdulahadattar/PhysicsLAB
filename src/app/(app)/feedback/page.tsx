
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send, MessageSquare, Phone, Mail, WifiOff, Save, HelpCircle } from "lucide-react";
import { useState, useEffect } from "react";
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
  const [pendingFeedbackCount, setPendingFeedbackCount] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const handleOnline = () => {
        setIsOnline(true);
        // Optionally, try to send pending feedback when online
        // sendPendingFeedback(); 
      };
      const handleOffline = () => setIsOnline(false);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // Load pending feedback count
      const stored = localStorage.getItem(LOCAL_STORAGE_FEEDBACK_KEY);
      if (stored) {
        setPendingFeedbackCount(JSON.parse(stored).length);
      }

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  const saveFeedbackLocally = (feedback: Omit<StoredFeedback, 'id' | 'timestamp'>) => {
    const newFeedback: StoredFeedback = {
        ...feedback,
        id: `feedback-${Date.now()}`,
        timestamp: new Date().toISOString()
    };
    const existingFeedback: StoredFeedback[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_FEEDBACK_KEY) || '[]');
    existingFeedback.push(newFeedback);
    localStorage.setItem(LOCAL_STORAGE_FEEDBACK_KEY, JSON.stringify(existingFeedback));
    setPendingFeedbackCount(existingFeedback.length);
  };

  // const sendPendingFeedback = async () => { /* ... placeholder for actual sync ... */ }

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

    // Simulate API call for online submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log("Online submission:", feedbackData);

    toast({
      title: "Submission Sent!",
      description: "Thank you! Your message has been sent and will be reviewed shortly.",
    });

    setName(""); setEmail(""); setSubject(""); setMessage("");
    setIsSubmitting(false);
  };

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
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <div className="inline-block mx-auto bg-primary/10 p-3 rounded-full mb-2">
             <HelpCircle className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl">Ask a Question or Submit Feedback</CardTitle>
          <CardDescription>
            Have academic questions, doubts about a topic, suggestions, or encountered an issue? Let us know!
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
              <Input id="subject" placeholder="E.g., Question about Newton's Laws, Doubt in Simulation X, Feedback on Notes" value={subject} onChange={e => setSubject(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="message">Message / Question Details <span className="text-destructive">*</span></Label>
              <Textarea id="message" placeholder="Describe your feedback, question, or doubt in detail here..." rows={6} value={message} onChange={e => setMessage(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isOnline ? <Send className={`mr-2 h-4 w-4 ${isSubmitting ? 'animate-spin' : ''}`} /> : <Save className="mr-2 h-4 w-4" />}
              {isSubmitting ? (isOnline ? "Submitting..." : "Saving...") : (isOnline ? "Send Message" : "Save Message Offline")}
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

