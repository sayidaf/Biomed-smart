
"use client"

import { useState } from "react"
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
  CheckCircle2,
  Loader2,
  AlertCircle,
  Lock
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
  
  const currentUserProfileRef = useMemoFirebase(() => {
    if (!db || !currentUser) return null
    return doc(db, "userProfiles", currentUser.uid)
  }, [db, currentUser])

  const { data: profile, isLoading: isProfileLoading } = useDoc(currentUserProfileRef)

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    role: "Biomedical Engineer",
    password: "" // Registry reference only
  })

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
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      role: formData.role,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true })

    setIsDialogOpen(false)
    setFormData({ email: "", firstName: "", lastName: "", role: "Biomedical Engineer", password: "" })
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
            Only Administrators can access the Staff Registry.
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
              Staff Registry
            </h1>
            <p className="text-muted-foreground mt-1">Initialize and monitor biomedical engineer profiles for the 2026 terminal.</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-lg shadow-primary/20 h-11 px-6">
                <UserPlus className="w-5 h-5 mr-2" />
                Register New Engineer
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Staff Registry Entry</DialogTitle>
                <DialogDescription>
                  Enter credentials to initialize a new engineer.
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
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="email" 
                      type="email" 
                      className="pl-10"
                      placeholder="name@hospital.com" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Assigned Security PIN</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="password" 
                      type="password"
                      className="pl-10"
                      placeholder="••••••••" 
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required 
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground italic">Note: Staff should use the 'Initialize account' link on login to set their permanent PIN.</p>
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
                  <Button type="submit" className="w-full h-11 font-bold">Initialize Registry Entry</Button>
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
                        Registry Active
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
