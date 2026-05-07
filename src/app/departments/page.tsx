
"use client"

import { useState } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Building2, 
  Plus, 
  Stethoscope, 
  MoreVertical,
  ChevronRight,
  Loader2
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from "@/firebase"
import { collection, doc, serverTimestamp } from "firebase/firestore"
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function DepartmentsPage() {
  const db = useFirestore()
  const { user: currentUser } = useUser()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Check role
  const profileRef = useMemoFirebase(() => {
    if (!db || !currentUser) return null
    return doc(db, "userProfiles", currentUser.uid)
  }, [db, currentUser])
  const { data: profile } = useDoc(profileRef)

  const deptQuery = useMemoFirebase(() => {
    if (!db) return null
    return collection(db, "departments")
  }, [db])
  const { data: departments, isLoading } = useCollection(deptQuery)

  const [formData, setFormData] = useState({
    name: "",
    description: ""
  })

  const handleAddDept = (e: React.FormEvent) => {
    e.preventDefault()
    if (!db) return

    const newId = `dept-${Math.random().toString(36).substring(2, 9)}`
    const deptRef = doc(db, "departments", newId)

    setDocumentNonBlocking(deptRef, {
      ...formData,
      id: newId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true })

    setIsDialogOpen(false)
    setFormData({ name: "", description: "" })
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold text-primary">Hospital Departments</h1>
            <p className="text-muted-foreground mt-1">Organize and manage equipment inventory by facility location.</p>
          </div>
          {profile?.role === 'Admin' && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="shadow-lg shadow-primary/20">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Department
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Department</DialogTitle>
                  <DialogDescription>Define a new hospital sector.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddDept} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Department Name</Label>
                    <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="e.g. Radiology" />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required placeholder="Scope of medical services..." />
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="w-full">Create Department</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments?.map((dept) => (
              <Card key={dept.id} className="border-none shadow-sm hover:shadow-md transition-all group overflow-hidden">
                <div className="h-2 bg-primary/20 group-hover:bg-primary transition-colors" />
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-headline">{dept.name}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-6 line-clamp-2 min-h-[40px]">
                    {dept.description}
                  </p>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-accent" />
                      <span className="text-sm font-bold">Manage Assets</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 group-hover:text-primary">
                      Inventory
                      <ChevronRight className="ml-1 w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
