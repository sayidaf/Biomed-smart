"use client"

import { useState, useEffect } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Building2, 
  Plus, 
  Stethoscope, 
  ChevronRight,
  Loader2,
  Info,
  Edit2,
  Trash2,
  AlertTriangle
} from "lucide-react"
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from "@/firebase"
import { collection, doc, serverTimestamp } from "firebase/firestore"
import { setDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription
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
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

const DEPARTMENT_PRESETS: Record<string, string> = {
  "ICU": "Critical care unit specializing in life support and intensive monitoring for patients with life-threatening illnesses or injuries.",
  "Radiology": "Diagnostic imaging department utilizing X-rays, MRI, CT scans, and ultrasound to visualize internal body structures.",
  "Laboratory": "Clinical pathology laboratory for analyzing blood, tissue, and other body fluids to diagnose and monitor diseases.",
  "Cardiology": "Specialized unit for the diagnosis and treatment of heart conditions and cardiovascular diseases.",
  "Maternity": "Neonatal and maternal care unit providing comprehensive services for childbirth and postnatal care.",
  "Emergency": "Front-line medical service for acute illness and trauma requiring immediate specialized attention.",
  "Oncology": "Diagnostic and treatment center for cancer including chemotherapy and radiotherapy hardware.",
  "Operating Theatre": "Sterile surgical environment equipped with advanced monitoring and life-support systems."
}

export default function DepartmentsPage() {
  const db = useFirestore()
  const { user: currentUser } = useUser()
  const { toast } = useToast()
  
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [deptToDelete, setDeptToDelete] = useState<any | null>(null)
  const [editingDept, setEditingDept] = useState<any | null>(null)

  const profileRef = useMemoFirebase(() => {
    if (!db || !currentUser) return null
    return doc(db, "userProfiles", currentUser.uid)
  }, [db, currentUser])
  const { data: profile } = useDoc(profileRef)

  const deptQuery = useMemoFirebase(() => {
    if (!db || !profile) return null
    return collection(db, "departments")
  }, [db, profile])
  const { data: departments, isLoading } = useCollection(deptQuery)

  const [formData, setFormData] = useState({
    name: "",
    description: ""
  })

  // Prefill logic for Add
  useEffect(() => {
    if (isAddOpen) {
      const trimmedName = formData.name.trim()
      const presetKey = Object.keys(DEPARTMENT_PRESETS).find(
        key => trimmedName.toLowerCase().includes(key.toLowerCase())
      )
      if (presetKey && !formData.description) {
        setFormData(prev => ({ ...prev, description: DEPARTMENT_PRESETS[presetKey] }))
      }
    }
  }, [formData.name, isAddOpen])

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

    setIsAddOpen(false)
    setFormData({ name: "", description: "" })
    toast({ title: "Department Created", description: "Registry initialized successfully." })
  }

  const handleEditClick = (dept: any) => {
    setEditingDept(dept)
    setFormData({
      name: dept.name,
      description: dept.description || ""
    })
    setIsEditOpen(true)
  }

  const handleUpdateDept = (e: React.FormEvent) => {
    e.preventDefault()
    if (!db || !editingDept) return

    const deptRef = doc(db, "departments", editingDept.id)
    updateDocumentNonBlocking(deptRef, {
      ...formData,
      updatedAt: serverTimestamp()
    })

    setIsEditOpen(false)
    setEditingDept(null)
    setFormData({ name: "", description: "" })
    toast({ title: "Registry Updated", description: "Department details synchronized." })
  }

  const confirmDelete = () => {
    if (!db || !deptToDelete) return
    const deptRef = doc(db, "departments", deptToDelete.id)
    deleteDocumentNonBlocking(deptRef)
    setDeptToDelete(null)
    toast({ variant: "destructive", title: "Sector Purged", description: "Department removed from registry." })
  }

  const canManage = profile?.role === 'Admin' || profile?.role === 'Biomedical Engineer'

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold text-primary">Hospital Departments</h1>
            <p className="text-muted-foreground mt-1">Organize and manage equipment inventory by facility location.</p>
          </div>
          {canManage && (
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="shadow-lg shadow-primary/20">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Department
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Define New Department</DialogTitle>
                  <DialogDescription>Add a new sector to the hospital's engineering registry.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddDept} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Department Name</Label>
                    <Input 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                      required 
                      placeholder="e.g. ICU, Radiology, Cardiology" 
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Description (Optional)</Label>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        Prefilled based on name
                      </span>
                    </div>
                    <Textarea 
                      value={formData.description} 
                      onChange={e => setFormData({...formData, description: e.target.value})} 
                      placeholder="Specify the medical scope or technical focus..." 
                      className="min-h-[100px]"
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="w-full">Initialize Department</Button>
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
            {departments && departments.length > 0 ? (
              departments.map((dept, index) => (
                <Card key={dept.id} className="border-none shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                  <div className="h-2 bg-primary/20 group-hover:bg-primary transition-colors" />
                  <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {canManage && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() => handleEditClick(dept)}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => setDeptToDelete(dept)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                  <CardHeader className="flex flex-row items-start justify-between pb-2">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-primary" />
                        </div>
                        <Badge className="absolute -top-2 -left-2 h-5 w-5 p-0 flex items-center justify-center bg-primary text-[10px] border-2 border-background">
                          {index + 1}
                        </Badge>
                      </div>
                      <div>
                        <CardTitle className="text-lg font-headline">{dept.name}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-6 line-clamp-2 min-h-[40px]">
                      {dept.description || "No description provided."}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-2">
                          <Stethoscope className="w-4 h-4 text-accent" />
                          <span className="text-sm font-bold">Inventory</span>
                        </div>
                        <Link href={`/equipment?dept=${dept.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 group-hover:text-primary">
                            View Assets
                            <ChevronRight className="ml-1 w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                      {canManage && (
                        <Link href={`/equipment?dept=${dept.id}&add=true`} className="block w-full">
                          <Button variant="outline" size="sm" className="w-full border-dashed">
                            <Plus className="w-3 h-3 mr-2" />
                            Register Multiple Assets
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-20 bg-muted/20 rounded-2xl border border-dashed">
                <Building2 className="w-12 h-12 text-muted-foreground opacity-20 mb-4" />
                <h3 className="text-lg font-bold text-muted-foreground">Registry Empty</h3>
                <p className="text-sm text-muted-foreground">Define your first hospital department to start tracking assets.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Department</DialogTitle>
            <DialogDescription>Modify the details for the <strong>{editingDept?.name}</strong> sector.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateDept} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Department Name</Label>
              <Input 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                className="min-h-[100px]"
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deptToDelete} onOpenChange={(open) => !open && setDeptToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Purge Sector?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{deptToDelete?.name}</strong>? This action will not delete associated equipment but will disconnect them from this sector.
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
