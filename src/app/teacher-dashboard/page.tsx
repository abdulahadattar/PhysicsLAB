'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { useUserSession } from '@/contexts/user-session-context';
import { TeacherModeProvider } from '@/contexts/teacher-mode-context';

const teacherDashboardItems = [
  { title: 'Accounts', description: 'Manage student and teacher accounts.', link: '/teacher-dashboard/accounts' },
  { title: 'Analytics', description: 'View student progress and performance data.', link: '/teacher-dashboard/analytics' },
  { title: 'Announcements', description: 'Create and manage announcements for students.', link: '/teacher-dashboard/announcements' },
  { title: 'Assignments', description: 'Create, assign, and grade assignments.', link: '/teacher-dashboard/assignments' },
  { title: 'Content Management', description: 'Manage study materials, quizzes, and other content.', link: '/teacher-dashboard/content-management' },
  { title: 'Daily Diary', description: 'Manage daily tasks and schedules.', link: '/teacher-dashboard/daily-diary' },
  { title: 'Lesson Planner', description: 'Plan and organize lessons.', link: '/teacher-dashboard/lesson-planner' },
  { title: 'Manage Study Materials', description: 'Add, edit, and delete study materials.', link: '/teacher-dashboard/manage-study-materials' },
  { title: 'Manage Model Papers', description: 'Add, edit, and delete model papers.', link: '/teacher-dashboard/manage-model-papers' },
  { title: 'My Portfolio', description: 'Manage your professional portfolio.', link: '/teacher-dashboard/my-portfolio' },
  { title: 'Quizzes', description: 'Create, administer, and review quizzes.', link: '/teacher-dashboard/quizzes' },
  { title: 'Scheme of Study', description: 'Manage the scheme of study.', link: '/teacher-dashboard/scheme-of-study' },
  { title: 'Timetable', description: 'Manage the timetable.', link: '/teacher-dashboard/timetable' },

];

export default function TeacherDashboardPage() {
  const { user } = useUserSession();

  if (!user || user.role !== 'teacher') {
    // Optionally redirect to a different page or show an access denied message
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Access Denied. You must be a teacher to view this page.</p>
      </div>
    );
  }

  return (
    <TeacherModeProvider>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Teacher Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teacherDashboardItems.map((item, index) => (
            <Link href={item.link} key={index}>
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </TeacherModeProvider>
  );
}