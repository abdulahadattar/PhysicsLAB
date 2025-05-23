
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_NAME, APP_AUTHOR } from "@/lib/constants";
import { Info, Users, GraduationCap } from "lucide-react";

export default function AboutUsPage() {
  return (
    <div className="space-y-6">
      <Card className="shadow-xl">
        <CardHeader className="text-center border-b pb-6">
          <div className="inline-block mx-auto bg-primary/10 p-3 rounded-full mb-4">
             <Info className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl">About {APP_NAME}</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Your Interactive Companion for Mastering Physics.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-8">
          
          <section>
            <h2 className="text-xl font-semibold mb-3 flex items-center"><Users className="mr-2 h-5 w-5 text-primary"/>Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              At {APP_NAME}, our mission is to make learning physics engaging, accessible, and effective for students of all backgrounds, particularly those following the Sindh Textbook Board curriculum for Grades 9-12. We believe that understanding physics is key to understanding the world around us, and we strive to provide tools that foster curiosity, critical thinking, and a genuine passion for science.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 flex items-center"><GraduationCap className="mr-2 h-5 w-5 text-primary"/>Department & Vision</h2>
            <p className="text-muted-foreground leading-relaxed">
              This application is developed under the guidance of **{APP_AUTHOR}**, an experienced physics educator dedicated to leveraging technology for enhanced learning outcomes. Our vision is to create a comprehensive digital ecosystem that supports both students and teachers by providing high-quality interactive simulations, dynamic study materials, AI-powered assistance, and robust assessment tools. We aim to continuously evolve {APP_NAME} to meet the educational needs of the community and inspire the next generation of scientists and innovators.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              {/* Placeholder for more specific department information if applicable */}
              Future developments may include deeper integration with school curricula, collaborative features, and expanded content for advanced topics.
            </p>
          </section>

           <section>
            <h2 className="text-xl font-semibold mb-3 flex items-center"><Info className="mr-2 h-5 w-5 text-primary"/>Contact & Support</h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions, feedback, or support, please visit our <Link href="/feedback" className="text-primary hover:underline">Feedback & Questions</Link> page.
            </p>
          </section>

        </CardContent>
      </Card>
    </div>
  );
}
    