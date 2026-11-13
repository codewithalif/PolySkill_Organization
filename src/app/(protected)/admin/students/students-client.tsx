"use client";

import { useState } from "react";
import { updateStudentRoleAction } from "@/actions/admin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Search, ShieldAlert, ShieldCheck, GraduationCap, Loader2 } from "lucide-react";

interface StudentsClientProps {
  initialStudents: any[];
  currentUserId: string;
}

export function StudentsAdminClient({ initialStudents, currentUserId }: StudentsClientProps) {
  const [students, setStudents] = useState(initialStudents);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = students.filter(
    (s) =>
      s.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.institute?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.whatsapp_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  async function handleToggleRole(studentId: string, currentRole: string) {
    const newRole = currentRole === "admin" ? "student" : "admin";
    if (studentId === currentUserId && newRole !== "admin") {
      toast.error("You cannot demote yourself from admin.");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to change this user's role to ${newRole.toUpperCase()}?`
      )
    ) {
      return;
    }

    setLoadingId(studentId);
    try {
      const res = await updateStudentRoleAction(studentId, newRole);
      if (res.success) {
        toast.success(res.message);
        setStudents((prev) =>
          prev.map((s) => (s.id === studentId ? { ...s, role: newRole } : s))
        );
      } else {
        toast.error(res.message || "Failed to update role");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Management</h1>
          <p className="text-muted-foreground">
            View registered polytechnic students, institutes, and manage platform roles.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registered Accounts ({filtered.length})</CardTitle>
          <CardDescription>
            Admin roles grant access to moderation and curriculum editing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">
              No students found matching your search.
            </div>
          ) : (
            <div className="divide-y">
              {filtered.map((student) => {
                const isAdmin = student.role === "admin";
                const isMe = student.id === currentUserId;
                const isLoading = loadingId === student.id;

                return (
                  <div
                    key={student.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={student.avatar_url || ""} />
                        <AvatarFallback>
                          {(student.full_name || "S")[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">
                            {student.full_name}
                          </span>
                          {student.whatsapp_number && (
                            <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
                              WA: {student.whatsapp_number}
                            </Badge>
                          )}
                          {isAdmin ? (
                            <Badge variant="default" className="bg-purple-600 text-[10px]">
                              Admin
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px]">
                              Student
                            </Badge>
                          )}
                          {isMe && (
                            <Badge variant="outline" className="text-[10px]">
                              You
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {student.email} • {student.institute} ({student.department})
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={isAdmin ? "destructive" : "outline"}
                        disabled={isLoading || isMe}
                        onClick={() => handleToggleRole(student.id, student.role)}
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : isAdmin ? (
                          <ShieldAlert className="h-4 w-4 mr-1" />
                        ) : (
                          <ShieldCheck className="h-4 w-4 mr-1" />
                        )}
                        {isAdmin ? "Demote to Student" : "Promote to Admin"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
