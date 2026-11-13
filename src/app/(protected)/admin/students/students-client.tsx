"use client";

import { useState } from "react";
import { updateStudentRoleAction, removeStudentAction } from "@/actions/admin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Search,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  Loader2,
  UserCheck,
  UserX,
  AlertTriangle,
} from "lucide-react";

interface StudentsClientProps {
  initialStudents: any[];
  currentUserId: string;
}

export function StudentsAdminClient({ initialStudents, currentUserId }: StudentsClientProps) {
  const [students, setStudents] = useState(initialStudents);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Modal states for delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal states for role change confirmation
  const [roleTarget, setRoleTarget] = useState<{ student: any; targetRole: "student" | "sub-admin" } | null>(null);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  const filtered = students.filter(
    (s) =>
      s.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.institute?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.whatsapp_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  async function handleConfirmRoleChange() {
    if (!roleTarget) return;
    const { student, targetRole } = roleTarget;

    setIsUpdatingRole(true);
    setLoadingId(student.id);
    try {
      const res = await updateStudentRoleAction(student.id, targetRole);
      if (res.success) {
        toast.success(res.message);
        setStudents((prev) =>
          prev.map((s) => (s.id === student.id ? { ...s, role: targetRole } : s))
        );
        setRoleTarget(null);
      } else {
        toast.error(res.message || "Failed to update role");
      }
    } catch {
      toast.error("An error occurred while updating role");
    } finally {
      setIsUpdatingRole(false);
      setLoadingId(null);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;

    setIsDeleting(true);
    setLoadingId(deleteTarget.id);
    try {
      const res = await removeStudentAction(deleteTarget.id);
      if (res.success) {
        toast.success(res.message);
        setStudents((prev) => prev.filter((s) => s.id !== deleteTarget.id));
        setDeleteTarget(null);
      } else {
        toast.error(res.message || "Failed to remove student");
      }
    } catch {
      toast.error("An error occurred while removing student");
    } finally {
      setIsDeleting(false);
      setLoadingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Management</h1>
          <p className="text-muted-foreground">
            Manage polytechnic students, assign Sub-Admin moderators, or remove accounts.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, WhatsApp..."
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
            Assign <strong>Sub-Admin</strong> roles to trusted students for moderation, or remove inactive/violating users.
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
                const isMainAdmin = student.role === "admin";
                const isSubAdmin = student.role === "sub-admin";
                const isMe = student.id === currentUserId;
                const isLoading = loadingId === student.id;

                return (
                  <div
                    key={student.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={student.avatar_url || ""} />
                        <AvatarFallback>
                          {(student.full_name || "S")[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-sm truncate">
                            {student.full_name}
                          </span>
                          <span className="text-xs text-muted-foreground font-mono">
                            @{student.username}
                          </span>
                          {student.whatsapp_number && (
                            <Badge
                              variant="outline"
                              className="text-[10px] font-mono border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                            >
                              WA: {student.whatsapp_number}
                            </Badge>
                          )}
                          {isMainAdmin ? (
                            <Badge variant="default" className="bg-purple-600 text-[10px] font-semibold">
                              Main Admin
                            </Badge>
                          ) : isSubAdmin ? (
                            <Badge variant="default" className="bg-indigo-600 text-[10px] font-semibold">
                              Sub-Admin
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
                        <div className="text-xs text-muted-foreground mt-0.5 truncate">
                          {student.email} • {student.institute} ({student.department})
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons: 1) Assign Sub-Admin / Revoke, 2) Remove Student */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Option 1: Assign / Revoke Sub-Admin Role */}
                      {!isMainAdmin && !isMe && (
                        <>
                          {isSubAdmin ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30 border-amber-500/40"
                              disabled={isLoading}
                              onClick={() =>
                                setRoleTarget({ student, targetRole: "student" })
                              }
                            >
                              <UserX className="h-3.5 w-3.5 mr-1" />
                              Dismiss Sub-Admin
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 border-indigo-500/40"
                              disabled={isLoading}
                              onClick={() =>
                                setRoleTarget({ student, targetRole: "sub-admin" })
                              }
                            >
                              <ShieldCheck className="h-3.5 w-3.5 mr-1 text-indigo-600" />
                              Make Sub-Admin
                            </Button>
                          )}

                          {/* Option 2: Remove Student */}
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-8 text-xs"
                            disabled={isLoading}
                            onClick={() => setDeleteTarget(student)}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                            Remove
                          </Button>
                        </>
                      )}

                      {isMainAdmin && (
                        <span className="text-[11px] text-muted-foreground italic px-2">
                          Protected Account
                        </span>
                      )}

                      {isMe && !isMainAdmin && (
                        <span className="text-[11px] text-muted-foreground italic px-2">
                          Your Account
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Confirmation Dialog */}
      <Dialog open={!!roleTarget} onOpenChange={(open) => !open && setRoleTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-indigo-600" />
              <DialogTitle>
                {roleTarget?.targetRole === "sub-admin"
                  ? "Assign Sub-Admin Role"
                  : "Dismiss Sub-Admin Role"}
              </DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              {roleTarget?.targetRole === "sub-admin" ? (
                <>
                  Are you sure you want to promote{" "}
                  <strong>{roleTarget?.student?.full_name}</strong> to a{" "}
                  <strong className="text-indigo-600 dark:text-indigo-400">Sub-Admin</strong>?
                  <br />
                  <br />
                  <span className="text-xs text-muted-foreground block">
                    • Sub-Admins can access moderation tools, manage roadmaps, view reports, and monitor students.
                    <br />
                    • They <strong>cannot</strong> demote or delete Main Administrators.
                  </span>
                </>
              ) : (
                <>
                  Are you sure you want to dismiss Sub-Admin privileges from{" "}
                  <strong>{roleTarget?.student?.full_name}</strong>? They will return to a standard Student role.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setRoleTarget(null)}
              disabled={isUpdatingRole}
            >
              Cancel
            </Button>
            <Button
              className={
                roleTarget?.targetRole === "sub-admin"
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                  : "bg-amber-600 hover:bg-amber-700 text-white"
              }
              onClick={handleConfirmRoleChange}
              disabled={isUpdatingRole}
            >
              {isUpdatingRole ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : roleTarget?.targetRole === "sub-admin" ? (
                <ShieldCheck className="h-4 w-4 mr-1" />
              ) : (
                <UserX className="h-4 w-4 mr-1" />
              )}
              {roleTarget?.targetRole === "sub-admin"
                ? "Confirm Sub-Admin"
                : "Demote to Student"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Student Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <DialogTitle>Remove Student Account</DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              Are you sure you want to permanently remove{" "}
              <strong>{deleteTarget?.full_name}</strong> (
              <span className="font-mono text-xs">@{deleteTarget?.username}</span>)?
              <br />
              <br />
              <span className="text-xs text-destructive/90 block font-medium">
                Warning: This action will permanently remove this student profile, their created projects, catalog skills, and team memberships from the PolySkill database. This cannot be undone.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Trash2 className="h-4 w-4 mr-1" />
              )}
              Yes, Remove Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
