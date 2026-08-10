"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Role } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { createUser, updateUser, deleteUser } from "@/actions/user.actions"

// Roles an ADMIN is allowed to assign (everything except SUPER_ADMIN)
const ADMIN_ASSIGNABLE_ROLES: Role[] = [
  Role.ADMIN,
  Role.CUSTOMER_SERVICE,
  Role.INVENTORY_MANAGER,
  Role.MARKETING_MANAGER,
  Role.CUSTOMER,
  Role.DEVELOPER,
]

const ALL_ROLES: Role[] = [
  Role.SUPER_ADMIN,
  ...ADMIN_ASSIGNABLE_ROLES,
]

interface UserRow {
  id: string
  name: string | null
  email: string
  role: Role
  createdAt: string
}

interface UserFormData {
  name: string
  email: string
  role: Role
}

const emptyForm: UserFormData = { name: "", email: "", role: Role.CUSTOMER }

export default function UsersPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const currentRole = (session?.user as any)?.role as Role | undefined
  const isSuperAdmin = currentRole === Role.SUPER_ADMIN

  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserRow | null>(null)
  const [form, setForm] = useState<UserFormData>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const assignableRoles = isSuperAdmin ? ALL_ROLES : ADMIN_ASSIGNABLE_ROLES

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/users")
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      }
    } catch {
      // silently fail — users table just shows empty
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Open dialog for create
  const openCreate = () => {
    setEditingUser(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  // Open dialog for edit
  const openEdit = (user: UserRow) => {
    setEditingUser(user)
    setForm({ name: user.name || "", email: user.email, role: user.role })
    setDialogOpen(true)
  }

  // Submit form
  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast({ title: "Name and email are required", variant: "destructive" })
      return
    }

    setSubmitting(true)
    try {
      if (editingUser) {
        await updateUser(editingUser.id, form)
        toast({ title: "User updated" })
      } else {
        const result = await createUser(form)
        toast({
          title: "User created",
          description: (
            <span>
              Reset link:{" "}
              <code className="text-xs break-all">{result.resetLink}</code>
            </span>
          ),
        })
      }
      setDialogOpen(false)
      router.refresh()
      fetchUsers()
    } catch (error: any) {
      toast({
        title: editingUser ? "Failed to update user" : "Failed to create user",
        description: error?.message || "An error occurred.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this user?")) return
    setDeletingId(id)
    try {
      await deleteUser(id)
      toast({ title: "User deleted" })
      router.refresh()
      fetchUsers()
    } catch (error: any) {
      toast({
        title: "Cannot delete user",
        description: error?.message || "An error occurred.",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-serif">All Users</h1>
        <Button onClick={openCreate}>Add User</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-center text-muted-foreground">Loading…</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name || "N/A"}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <span
                          className={
                            user.role === Role.SUPER_ADMIN
                              ? "text-purple-600 font-semibold"
                              : user.role === Role.ADMIN
                                ? "text-orange-600 font-medium"
                                : ""
                          }
                        >
                          {user.role.replace(/_/g, " ")}
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(user)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={
                              deletingId === user.id ||
                              // Non-super-admin can't delete super admins
                              (user.role === Role.SUPER_ADMIN && !isSuperAdmin)
                            }
                            onClick={() => handleDelete(user.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "Edit User" : "Add User"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={form.role}
                onValueChange={(val) => setForm({ ...form, role: val as Role })}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {assignableRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting
                ? "Saving…"
                : editingUser
                  ? "Save Changes"
                  : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}