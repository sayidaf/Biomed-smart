
"use client"

import { useState } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  UserPlus, 
  Users, 
  Trash2, 
  Mail,
  User,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Lock,
  Stethoscope,
  Eye,
  EyeOff,
  Info
} from "lucide-react"
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from "@/firebase"
import { collection, doc, serverTimestamp } from "firebase/firestore"
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function UsersManagementPage() {
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()
  const { user: currentUser } = useUser()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)
  
  const currentUserProfileRef = useMemoFirebase(() => {
    if (!db || !currentUser) return null
    return doc(db, "userProfiles", currentUser.uid)
  }, [db, currentUser])

  const { data: profile, isLoading: isProfileLoading } = useDoc(currentUserProfileRef)

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    password: "" 
  })

  const roleString = profile?.role?.toString().toLowerCase() || ''
  const isAdmin = roleString === 'admin'

  const usersQuery = useMemoFirebase(() => {
    if (!db || !isAdmin) return null
    return collection(db, "userProfiles")
  }, [db, isAdmin])

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
      role: "Biomedical Engineer",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true })

    toast({
      title: "Profile Registered",
      description: "Note: You must also create this user in Firebase Console -> Auth tab for login to work.",
    })

    setIsDialogOpen(false)
    setFormData({ email: "", firstName: "", lastName: "", password: "" })
    setShowPassword(false)
  }

  const confirmDelete = () => {
    if (!db || !userToDelete) return
    const userRef = doc(db, "userProfiles", userToDelete)
    deleteDocumentNonBlocking(userRef)
    setUserToDelete(null)
    toast({
      title: "User Removed",
      description: "The staff registry entry has been deleted.",
    })
  }

  if (isProfileLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppShell>
    )
  }

  if (!isAdmin) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
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
            <p className="text-muted-foreground mt-1">Manage and initialize Biomedical Engineer profiles.</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-lg shadow-primary/20 h-11 px-6">
                <UserPlus className="w-5 h-5 mr-2" />
                Add New Engineer
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Engineer Registry Entry</DialogTitle>
                <DialogDescription>
                  Credentials will be initialized as a <strong>Biomedical Engineer</strong>.
                </DialogDescription>
              </DialogHeader>
              <div className="bg-orange-50 p-3 rounded-lg border border-orange-200 flex items-start gap-2 mb-2">
                <Info className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" />
                <p className="text-[10px] text-orange-800 leading-tight">
                  <strong>Protocol Note:</strong> After saving, manually add this email to the Firebase Console Authentication tab to enable login access.
                </p>
              </div>
              <form onSubmit={handleCreateUser} className="space-y-4 py-2">
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
                  <Label htmlFor="password">Initial Security PIN</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"}
                      className="pl-10 pr-10"
                      placeholder="••••••••" 
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required 
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 flex items-center gap-3">
                  <Stethoscope className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs font-bold text-primary uppercase">Assigned Role</p>
                    <p className="text-sm font-semibold">Biomedical Engineer</p>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full h-11 font-bold">Register Profile</Button>
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
                      <Badge variant={u.role?.toString().toLowerCase() === 'admin' ? 'default' : 'secondary'} className="text-[10px] uppercase font-bold">
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
                          onClick={() => setUserToDelete(u.id)}
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

      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the engineer's profile from the staff registry. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  )
}
