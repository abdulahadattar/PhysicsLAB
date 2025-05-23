
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { APP_AUTHOR, APP_NAME } from "@/lib/constants";
import { Briefcase, GraduationCap, Lightbulb, Mail, Phone, ExternalLink, ShieldCheck } from "lucide-react"; // Added ShieldCheck
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function TeacherPortfolioPage() {
  return (
    <div className="space-y-6">
      <Card className="shadow-xl">
        <CardHeader className="text-center border-b pb-6">
          <Avatar className="w-24 h-24 mx-auto mb-4 ring-2 ring-primary ring-offset-2">
            <AvatarImage src="https://placehold.co/100x100.png?text=SA" alt={APP_AUTHOR} data-ai-hint="teacher portrait" />
            <AvatarFallback>SA</AvatarFallback>
          </Avatar>
          <CardTitle className="text-3xl">{APP_AUTHOR}</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">Physics Educator & Developer of {APP_NAME}</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-8">
          
          <section>
            <h2 className="text-xl font-semibold mb-3 flex items-center"><GraduationCap className="mr-2 h-5 w-5 text-primary"/>Teaching Philosophy</h2>
            <p className="text-muted-foreground leading-relaxed">
              My approach to teaching physics is centered on making complex concepts accessible and engaging through interactive learning, real-world applications, and fostering a deep curiosity in students. I believe in leveraging technology to create immersive educational experiences that cater to diverse learning styles. The goal is not just to impart knowledge, but to cultivate critical thinking and problem-solving skills that extend beyond the classroom.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 flex items-center"><Briefcase className="mr-2 h-5 w-5 text-primary"/>Professional Bio</h2>
            <p className="text-muted-foreground leading-relaxed">
              As a dedicated physics educator with [Number] years of experience, I have a passion for demystifying the laws that govern our universe. My journey in education has been driven by the desire to see students not only succeed academically but also develop a genuine appreciation for physics. This application, {APP_NAME}, is a culmination of that passion, aiming to provide a modern, effective, and accessible learning tool for students of the Sindh Textbook Board and beyond.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 flex items-center"><ShieldCheck className="mr-2 h-5 w-5 text-primary"/>Qualifications</h2>
            <p className="text-muted-foreground leading-relaxed">
              {/* Placeholder for teacher qualifications. Edit this directly in the code. */}
              Master of Science in Physics (University Name)
              <br />
              Bachelor of Education (University Name)
              <br />
              Certified Physics Teacher (Sindh Board)
              <br />
              [Any other relevant certifications or specializations]
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3 flex items-center"><Lightbulb className="mr-2 h-5 w-5 text-primary"/>Showcase & Achievements in {APP_NAME}</h2>
            <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-4">
                    <h3 className="font-semibold mb-1">Interactive Simulations Development</h3>
                    <p className="text-sm text-muted-foreground">
                        Developed over 10 interactive physics simulations within {APP_NAME}, covering topics from kinematics to states of matter, enhancing student understanding through hands-on virtual experiments.
                    </p>
                     <Button variant="link" asChild className="p-0 h-auto mt-1 text-xs">
                        <Link href="/simulations">Explore Simulations <ExternalLink className="ml-1 h-3 w-3"/></Link>
                    </Button>
                </Card>
                <Card className="p-4">
                    <h3 className="font-semibold mb-1">AI-Assisted Learning Integration</h3>
                    <p className="text-sm text-muted-foreground">
                        Integrated AI-powered tools for contextual fun facts and a learning assistant, providing personalized support and sparking curiosity in students.
                    </p>
                     <Button variant="link" asChild className="p-0 h-auto mt-1 text-xs">
                        <Link href="/learn-with-ai">Try the AI Assistant <ExternalLink className="ml-1 h-3 w-3"/></Link>
                    </Button>
                </Card>
                 <Card className="p-4">
                    <h3 className="font-semibold mb-1">Dynamic Content Management</h3>
                    <p className="text-sm text-muted-foreground">
                        Implemented a system for dynamic study material updates and teacher-managed content overrides, ensuring the app's curriculum remains current and adaptable.
                    </p>
                     <Button variant="link" asChild className="p-0 h-auto mt-1 text-xs">
                        <Link href="/study-material">View Study Materials <ExternalLink className="ml-1 h-3 w-3"/></Link>
                    </Button>
                </Card>
                 <Card className="p-4">
                    <h3 className="font-semibold mb-1">AI Lesson Planner (4A Model)</h3>
                    <p className="text-sm text-muted-foreground">
                        Created an AI-assisted tool for teachers to generate 4A's model lesson plans, streamlining planning and promoting effective teaching strategies.
                    </p>
                     <Button variant="link" asChild className="p-0 h-auto mt-1 text-xs">
                        <Link href="/teacher-dashboard/lesson-planner">Try Lesson Planner <ExternalLink className="ml-1 h-3 w-3"/></Link>
                    </Button>
                </Card>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 flex items-center"><Mail className="mr-2 h-5 w-5 text-primary"/>Contact Information</h2>
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4 text-primary"/>
                    <a href="tel:03451301907" className="hover:underline">0345-1301907</a>
                </div>
                 <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4 text-primary"/>
                     <a href="mailto:abdul7762ahad@gmail.com" className="hover:underline">abdul7762ahad@gmail.com</a>
                </div>
                {/* Add LinkedIn or other professional links if desired */}
            </div>
          </section>

        </CardContent>
        <CardFooter className="text-center justify-center text-xs text-muted-foreground border-t pt-4">
            This portfolio page is part of the {APP_NAME} application.
        </CardFooter>
      </Card>
    </div>
  );
}
    