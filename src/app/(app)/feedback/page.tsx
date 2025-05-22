
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send, MessageSquare, Phone, Mail } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

export default function FeedbackPage() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState(""); // Optional, if student accounts are used
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Basic validation
    if (!subject.trim() || !message.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in the subject and message fields.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Placeholder for actual submission logic
    // This would typically involve sending data to a backend endpoint
    // For now, we just show a success message.
    console.log({ name, email, subject, message });

    toast({
      title: "Feedback Submitted!",
      description: "Thank you for your feedback. We will review it shortly.",
    });

    // Reset form
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <div className="inline-block mx-auto bg-primary/10 p-3 rounded-full mb-2">
             <MessageSquare className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl">Submit Feedback or Query</CardTitle>
          <CardDescription>
            Have questions, suggestions, or encountered an issue? Let us know!
            Messages are sent when connected to the internet.
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
              <Input id="subject" placeholder="E.g., Issue with Simulation X, Suggestion for Topic Y" value={subject} onChange={e => setSubject(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="message">Message <span className="text-destructive">*</span></Label>
              <Textarea id="message" placeholder="Describe your feedback or query in detail..." rows={6} value={message} onChange={e => setMessage(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              <Send className={`mr-2 h-4 w-4 ${isSubmitting ? 'animate-spin' : ''}`} />
              {isSubmitting ? "Submitting..." : "Send Feedback"}
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
