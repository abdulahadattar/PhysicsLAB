import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, X, UserPlus, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const pendingAccounts = [
  { id: "std001", name: "Aisha Khan", studentId: "S1001", class: "10", date: "2024-07-20", avatar: "https://placehold.co/40x40.png" },
  { id: "std002", name: "Bilal Ahmed", studentId: "S1002", class: "9", date: "2024-07-19", avatar: "https://placehold.co/40x40.png" },
  { id: "std003", name: "Fatima Ali", studentId: "S1003", class: "11", date: "2024-07-21", avatar: "https://placehold.co/40x40.png" },
];

export default function TeacherAccountsPage() {
  // Placeholder actions
  const handleApprove = (id: string) => alert(`Approved account ${id}`);
  const handleDeny = (id: string) => alert(`Denied account ${id}`);

  return (
    <div className="space-y-6">
      <Button variant="outline" asChild size="sm">
        <Link href="/teacher-dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Teacher Dashboard
        </Link>
      </Button>

      <Card className="shadow-lg">
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle className="text-3xl flex items-center gap-2"><UserPlus className="h-7 w-7 text-primary"/>Student Account Approvals</CardTitle>
            <CardDescription>Review and manage pending student account registrations. Approved accounts will gain access to saved results and teacher messages.</CardDescription>
          </div>
          <Button variant="outline"><RefreshCw className="mr-2 h-4 w-4"/>Refresh List</Button>
        </CardHeader>
        <CardContent>
          {pendingAccounts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Avatar</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Registration Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingAccounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell>
                      <Avatar>
                        <AvatarImage src={account.avatar} alt={account.name} data-ai-hint="student avatar"/>
                        <AvatarFallback>{account.name.substring(0,1)}{account.name.split(" ")[1]?.substring(0,1) || ''}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{account.name}</TableCell>
                    <TableCell>{account.studentId}</TableCell>
                    <TableCell><Badge variant="secondary">Class {account.class}</Badge></TableCell>
                    <TableCell>{account.date}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="default" size="icon" onClick={() => handleApprove(account.id)} aria-label={`Approve ${account.name}`} className="bg-green-500 hover:bg-green-600">
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => handleDeny(account.id)} aria-label={`Deny ${account.name}`}>
                        <X className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-8">No pending account approvals at this time.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
