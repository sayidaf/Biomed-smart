
"use client"

import { useState } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { Card } from "@/components/ui/card"
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
  Info,
  Edit2,
  ExternalLink
} from "lucide-react"
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from "@/firebase"
import { collection, doc, serverTimestamp } from "firebase/firestore"
import { setDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates"
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
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function UsersManagementPage() {
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()
  const { user: currentUser } = useUser()
  
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)
  const [editingUser, setEditingUser] = useState<any | null>(null)
  
  const [showPassword, setShowPassword] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  
  const currentUserProfileRef = useMemoFirebase(() => {
    if (!db || !currentUser) return null
    return doc(db, "userProfiles", currentUser.uid)
  }, [db, currentUser])

  const { data: profile, isLoading: isProfileLoading } = useDoc(currentUserProfileRef)

  const [createData, setCreateData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    password: "" 
  })

  const [editData, setEditData] = useState({
    firstName: "",
    lastName: "",
    email: ""
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

    // For pre-provisioning, we use the email as a temporary ID.
    // The Auto-Link logic in the Dashboard will link it to their Auth UID on first login.
    const tempId = createData.email.toLowerCase().replace(/[^a-z0-9]/g, '_')
    const userRef = doc(db, "userProfiles", tempId)
    
    setDocumentNonBlocking(userRef, {
      id: tempId,
      email: createData.email.toLowerCase(),
      firstName: createData.firstName,
      lastName: createData.lastName,
      role: "Biomedical Engineer",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true })

    setRegistrationSuccess(true)
    toast({
      title: "Profile Created",
      description: "Database entry saved. Please complete the Authentication step.",
    })
  }

  const handleEditClick = (user: any) => {
    setEditingUser(user)
    setEditData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || ""
    })
    setIsEditOpen(true)
  }

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!db || !editingUser) return

    const userRef = doc(db, "userProfiles", editingUser.id)
    
    updateDocumentNonBlocking(userRef, {
      firstName: editData.firstName,
      lastName: editData.lastName,
      email: editData.email.toLowerCase(),
      updatedAt: serverTimestamp()
    })

    toast({
      title: "Registry Updated",
      description: "Staff records have been synchronized.",
    })

    setIsEditOpen(false)
    setEditingUser(null)
  }

  const confirmDelete = () => {
    if (!db || !userToDelete) return
    const userRef = doc(db, "userProfiles", userToDelete)
    deleteDocumentNonBlocking(userRef)
    setUserToDelete(null)
    toast({
      title: "User Purged",
      description: "Profile removed from system registry.",
    })
  }

  const resetCreateForm = () => {
    setIsCreateOpen(false)
    setRegistrationSuccess(false)
    setCreateData({ email: "", firstName: "", lastName: "", password: "" })
    setShowPassword(false)
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
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4 px-4">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <h2 className="text-2xl font-headline font-bold">Access Denied</h2>
          <p className="text-muted-foreground max-w-md">
            Staff Management requires System Administrator privileges.
          </p>
          <Button onClick={() => router.push("/dashboard")}>Return to Secure Dashboard</Button>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-headline font-bold text-primary flex items-center gap-3">
              <Users className="w-8 h-8" />
              Staff Management
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Provision and manage professional Biomedical Engineering accounts.</p>
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={(open) => {
            if (!open) resetCreateForm();
            else setIsCreateOpen(true);
          }}>
            <DialogTrigger asChild>
              <Button className="shadow-lg shadow-primary/20 h-11 px-6 w-full md:w-auto">
                <UserPlus className="w-5 h-5 mr-2" />
                Initialize New Staff
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
              {!registrationSuccess ? (
                <>
                  <DialogHeader>
                    <DialogTitle>BME Registry Setup</DialogTitle>
                    <DialogDescription>
                      Initialize a new profile. Role defaults to <strong>Biomedical Engineer</strong>.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateUser} className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input 
                          id="firstName" 
                          placeholder="Jane" 
                          value={createData.firstName}
                          onChange={(e) => setCreateData({...createData, firstName: e.target.value})}
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input 
                          id="lastName" 
                          placeholder="Doe" 
                          value={createData.lastName}
                          onChange={(e) => setCreateData({...createData, lastName: e.target.value})}
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
                          placeholder="engineer@hospital.com" 
                          value={createData.email}
                          onChange={(e) => setCreateData({...createData, email: e.target.value})}
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
                          value={createData.password}
                          onChange={(e) => setCreateData({...createData, password: e.target.value})}
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
                    <Alert className="bg-primary/5 border-primary/20">
                      <Stethoscope className="h-4 w-4 text-primary" />
                      <AlertTitle className="text-xs font-bold uppercase text-primary">Assigned Role</AlertTitle>
                      <AlertDescription className="text-sm font-semibold">
                        Biomedical Engineer
                      </AlertDescription>
                    </Alert>
                    <DialogFooter>
                      <Button type="submit" className="w-full h-11 font-bold">Register Profile</Button>
                    </DialogFooter>
                  </form>
                </>
              ) : (
                <div className="space-y-6 py-4">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-2">
                      <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold">Database Record Saved</h3>
                    <p className="text-sm text-muted-foreground px-4">
                      The professional profile for <strong>{createData.firstName} {createData.lastName}</strong> is now in the system.
                    </p>
                  </div>
                  
                  <Alert variant="destructive" className="border-orange-500 bg-orange-50 text-orange-900">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <AlertTitle className="font-bold">Final Step Required</AlertTitle>
                    <AlertDescription className="text-xs space-y-2">
                      <p>For the user to log in, you must now manually add them to the Firebase Console:</p>
                      <ol className="list-decimal pl-4 space-y-1 font-medium">
                        <li>Open Firebase Console &gt; Authentication</li>
                        <li>Click "Add User"</li>
                        <li>Email: <span className="font-bold underline">{createData.email.toLowerCase()}</span></li>
                        <li>Password: <span className="font-bold underline">{createData.password}</span></li>
                      </ol>
                    </AlertDescription>
                  </Alert>

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={resetCreateForm}>Close</Button>
                    <Button className="flex-1 gap-2" asChild>
                       <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer">
                         Go to Console
                         <ExternalLink className="w-3 h-3" />
                       </a>
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Staff Profile</DialogTitle>
              <DialogDescription>
                Update the professional registry details for this account.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateUser} className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editFirstName">First Name</Label>
                  <Input 
                    id="editFirstName" 
                    value={editData.firstName}
                    onChange={(e) => setEditData({...editData, firstName: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editLastName">Last Name</Label>
                  <Input 
                    id="editLastName" 
                    value={editData.lastName}
                    onChange={(e) => setEditData({...editData, lastName: e.target.value})}
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editEmail">Work Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="editEmail" 
                    type="email" 
                    className="pl-10"
                    value={editData.email}
                    onChange={(e) => setEditData({...editData, email: e.target.value})}
                    required 
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full h-11 font-bold">Confirm Updates</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Card className="border-none shadow-sm overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="min-w-[150px]">Engineer</TableHead>
                  <TableHead className="hidden sm:table-cell min-w-[200px]">Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isUsersLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-20">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                      <p className="text-xs text-muted-foreground mt-2">Accessing Registry Archives...</p>
                    </TableCell>
                  </TableRow>
                ) : users && users.length > 0 ? (
                  users.map((u) => (
                    <TableRow key={u.id} className="group">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                            <User className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold truncate text-sm md:text-base">{u.firstName} {u.lastName}</span>
                            <span className="text-[10px] text-muted-foreground sm:hidden truncate">{u.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground hidden sm:table-cell text-xs md:text-sm">{u.email}</TableCell>
                      <TableCell>
                        <Badge variant={u.role?.toString().toLowerCase() === 'admin' ? 'default' : 'secondary'} className="text-[10px] uppercase font-bold px-2">
                          {u.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2 text-green-600 text-[10px] md:text-xs font-medium">
                          <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4" />
                          Registry Active
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1 md:gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                            onClick={() => handleEditClick(u)}
                            disabled={u.id === currentUser?.uid}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
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
                    <TableCell colSpan={5} className="text-center py-20 text-muted-foreground">
                      No staff records found in the registry.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanent Profile Deletion?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the engineer's professional profile from the database. This action is irreversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abort</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Confirm Purge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  )
}
