import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, BarChart3, MessageSquarePlus, ShieldCheck } from "lucide-react";
import { APP_AUTHOR } from "@/lib/constants";
import Image from "next/image";

export default function TeacherDashboardPage() {
  const dashboardSections = [
    {
      title: "Student Account Approvals",
      description: "Review and manage pending student account registrations.",
      href: "/teacher-dashboard/accounts",
      icon: Users,
      image: "https://placehold.co/600x400.png",
      aiHint: "people connection"
    },
    {
      title: "View Results & Analytics",
      description: "Access student performance data, quiz results, and identify weak topics.",
      href: "/teacher-dashboard/analytics",
      icon: BarChart3,
      image: "https://placehold.co/600x400.png",
      aiHint: "data chart"
    },
    {
      title: "Send Announcements",
      description: "Broadcast messages, reminders, or updates to all registered students.",
      href: "/teacher-dashboard/announcements",
      icon: MessageSquarePlus,
      image: "https://placehold.co/600x400.png",
      aiHint: "megaphone communication"
    },
  ];

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl flex items-center gap-2"><ShieldCheck className="h-8 w-8 text-primary"/>Teacher Dashboard</CardTitle>
          <CardDescription>Welcome, {APP_AUTHOR}. Manage student accounts, view analytics, and send announcements. This panel is designed for local, offline use.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground">
                All data management for this dashboard is intended to be handled locally on your device. For optional online sync features (like fetching MCQs), an internet connection may be required periodically.
            </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {dashboardSections.map((section) => (
          <Card key={section.title} className="flex flex-col overflow-hidden shadow-md hover:shadow-lg transition-shadow">
             <div className="relative h-48 w-full">
                <Image 
                    src={section.image} 
                    alt={section.title} 
                    layout="fill" 
                    objectFit="cover"
                    data-ai-hint={section.aiHint}
                />
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <section.icon className="h-6 w-6 text-primary" /> 
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-muted-foreground">{section.description}</p>
            </CardContent>
            <CardContent>
              <Link href={section.href} passHref>
                <Button className="w-full">Manage {section.title.split(" ")[0]}</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
