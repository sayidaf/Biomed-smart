
"use client"

import { useState, useEffect } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  UserPlus, 
  Users, 
  ShieldCheck, 
  Trash2, 
  Mail,
  User,
  MoreVertical,
  CheckCircle2,
  Loader2,
  AlertCircle
} from "lucide-react"
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from "@/firebase"
import { collection, doc, serverTimestamp } from "firebase/firestore"
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { useRouter } from "next/navigation"

export default function UsersManagementPage() {
  const db = useFirestore()
  const router = useRouter()
  const { user: currentUser } = useUser()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  // Get current user's profile to check role
  const currentUserProfileRef = useMemoFirebase(() => {
    if (!db || !currentUser) return null
    return doc(db, "userProfiles", currentUser.uid)
  }, [db, currentUser])

  const { data: profile, isLoading: isProfileLoading } = useDoc(currentUserProfileRef)

  // Form State
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    role: "Biomedical Engineer"
  })

  // Only query if user is an Admin
  const usersQuery = useMemoFirebase(() => {
    if (!db || profile?.role !== 'Admin') return null
    return collection(db, "userProfiles")
  }, [db, profile?.role])

  const { data: users, isLoading: isUsersLoading } = useCollection(usersQuery)

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!db) return

    const newUserId = Math.random().toString(36).substring(2, 15)
    const userRef = doc(db, "userProfiles", newUserId)
    
    setDocumentNonBlocking(userRef, {
      id: newUserId,
      ...formData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true })

    setIsDialogOpen(false)
    setFormData({ email: "", firstName: "", lastName: "", role: "Biomedical Engineer" })
  }

  const handleDeleteUser = (userId: string) => {
    if (!db || userId === currentUser?.uid) return
    const userRef = doc(db, "userProfiles", userId)
    deleteDocumentNonBlocking(userRef)
  }

  if (isProfileLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppShell>
    )
  }

  if (profile?.role !== 'Admin') {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <h2 className="text-2xl font-headline font-bold">Unauthorized Access</h2>
          <p className="text-muted-foreground max-w-md">
            You do not have the required permissions to view or manage staff. 
            Please contact a System Administrator if you believe this is an error.
          </p>
          <Button onClick={() => router.push("/dashboard")}>Return to Dashboard</Button>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold text-primary flex items-center gap-3">
              <Users className="w-8 h-8" />
              Staff Management
            </h1>
            <p className="text-muted-foreground mt-1">Manage biomedical engineering personnel and system roles.</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-lg shadow-primary/20">
                <UserPlus className="w-4 h-4 mr-2" />
                Add New Engineer
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create Engineer Profile</DialogTitle>
                <DialogDescription>
                  Enter the details for the new biomedical engineer. They will be added to the registry.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      placeholder="Jane" 
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      placeholder="Doe" 
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Work Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="jane.doe@hospital.com" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">System Role</Label>
                  <select 
                    id="role"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                  >
                    <option>Biomedical Engineer</option>
                    <option>Technician</option>
                    <option>Admin</option>
                  </select>
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full">Create Registry Entry</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-none shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead>Engineer</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isUsersLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : users && users.length > 0 ? (
                users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-semibold">{u.firstName} {u.lastName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell>
                      <Badge variant={u.role === 'Admin' ? 'default' : 'secondary'} className="text-[10px] uppercase font-bold">
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-green-600 text-xs font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        Active
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                         <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteUser(u.id)}
                          disabled={u.id === currentUser?.uid}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    No engineers found in the registry.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </AppShell>
  )
}
