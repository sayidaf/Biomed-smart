
"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
  Search, 
  Plus, 
  Monitor,
  Calendar,
  ChevronRight,
  Printer,
  Loader2,
  RefreshCw,
  Edit2,
  Trash2,
  AlertTriangle
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase"
import { collection, doc, serverTimestamp } from "firebase/firestore"
import { setDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates"
import { sanitizeInput } from "@/lib/utils"
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
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
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

function EquipmentContent() {
  const db = useFirestore()
  const searchParams = useSearchParams()
  const { user: currentUser } = useUser()
  const { toast } = useToast()
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [eqToDelete, setEqToDelete] = useState<any | null>(null)
  const [editingEq, setEditingEq] = useState<any | null>(null)
  
  const [searchTerm, setSearchTerm] = useState("")
  const [addAnother, setAddAnother] = useState(false)

  const deptParam = searchParams.get('dept')
  const autoAdd = searchParams.get('add') === 'true'

  const profileRef = useMemoFirebase(() => {
    if (!db || !currentUser) return null
    return doc(db, "userProfiles", currentUser.uid)
  }, [db, currentUser])
  const { data: profile } = useDoc(profileRef)

  const equipmentQuery = useMemoFirebase(() => {
    if (!db || !profile) return null
    return collection(db, "equipment")
  }, [db, profile])
  const { data: equipment, isLoading } = useCollection(equipmentQuery)

  const deptQuery = useMemoFirebase(() => {
    if (!db || !profile) return null
    return collection(db, "departments")
  }, [db, profile])
  const { data: departments } = useCollection(deptQuery)

  const [formData, setFormData] = useState({
    name: "",
    manufacturer: "",
    modelNumber: "",
    serialNumber: "",
    departmentId: deptParam || "",
    status: "OPERATIONAL",
    nextServiceDate: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    if (deptParam) setFormData(prev => ({ ...prev, departmentId: deptParam }))
  }, [deptParam])

  useEffect(() => {
    if (autoAdd) setIsDialogOpen(true)
  }, [autoAdd])

  const handleAddEquipment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!db) return

    const newId = `eq-${Math.random().toString(36).substring(2, 9)}`
    const eqRef = doc(db, "equipment", newId)

    setDocumentNonBlocking(eqRef, {
      ...formData,
      id: newId,
      purchaseDate: new Date().toISOString().split('T')[0],
      installationDate: new Date().toISOString().split('T')[0],
      warrantyExpiryDate: new Date(Date.now() + 31536000000).toISOString().split('T')[0],
      manualUris: [],
      imageUris: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true })

    if (!addAnother) setIsDialogOpen(false)
    setFormData(prev => ({ ...prev, name: "", modelNumber: "", serialNumber: "" }))
    toast({ title: "Asset Registered", description: "Equipment added to hospital registry." })
  }

  const handleEditClick = (eq: any) => {
    setEditingEq(eq)
    setFormData({
      name: eq.name,
      manufacturer: eq.manufacturer,
      modelNumber: eq.modelNumber || "",
      serialNumber: eq.serialNumber,
      departmentId: eq.departmentId,
      status: eq.status,
      nextServiceDate: eq.nextServiceDate || ""
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateEquipment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!db || !editingEq) return

    const eqRef = doc(db, "equipment", editingEq.id)
    updateDocumentNonBlocking(eqRef, {
      ...formData,
      updatedAt: serverTimestamp()
    })

    setIsEditDialogOpen(false)
    setEditingEq(null)
    toast({ title: "Registry Updated", description: "Equipment details synchronized." })
  }

  const confirmDelete = () => {
    if (!db || !eqToDelete) return
    const eqRef = doc(db, "equipment", eqToDelete.id)
    deleteDocumentNonBlocking(eqRef)
    setEqToDelete(null)
    toast({ variant: "destructive", title: "Asset Purged", description: "Equipment removed from registry." })
  }

  const filteredEquipment = equipment?.filter(eq => {
    const matchesSearch = eq.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          eq.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDept = deptParam ? eq.departmentId === deptParam : true
    return matchesSearch && matchesDept
  })

  const canManage = profile?.role === 'Admin' || profile?.role === 'Biomedical Engineer'

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-headline font-bold text-primary">Equipment Inventory</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and track all hospital biomedical assets across all facility sectors.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden xs:inline-flex">
            <Printer className="w-4 h-4 mr-2" />
            QR Labels
          </Button>
          {canManage && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="w-full sm:w-auto shadow-lg shadow-primary/20">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Equipment
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Register New Equipment</DialogTitle>
                  <DialogDescription>Input hardware details to add to the inventory.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddEquipment} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Equipment Name</Label>
                    <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="e.g. Ventilator PB980" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Manufacturer</Label>
                      <Input value={formData.manufacturer} onChange={e => setFormData({...formData, manufacturer: e.target.value})} required placeholder="e.g. Medtronic" />
                    </div>
                    <div className="space-y-2">
                      <Label>Model Number (Optional)</Label>
                      <Input value={formData.modelNumber} onChange={e => setFormData({...formData, modelNumber: e.target.value})} placeholder="e.g. PB-980-PLUS" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Serial Number</Label>
                      <Input value={formData.serialNumber} onChange={e => setFormData({...formData, serialNumber: e.target.value})} required placeholder="SN-XXXXXX" />
                    </div>
                    <div className="space-y-2">
                      <Label>Department</Label>
                      <select 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        value={formData.departmentId}
                        onChange={e => setFormData({...formData, departmentId: e.target.value})}
                        required
                      >
                        <option value="">Select Dept</option>
                        {departments?.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Initial Status</Label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value})}
                      required
                    >
                      <option value="OPERATIONAL">Operational</option>
                      <option value="FAULTY">Faulty</option>
                      <option value="MAINTENANCE">Maintenance</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox id="add-another" checked={addAnother} onCheckedChange={(val) => setAddAnother(!!val)} />
                    <Label htmlFor="add-another" className="text-xs text-muted-foreground">Keep dialog open to add multiple assets</Label>
                  </div>

                  <DialogFooter>
                    <Button type="submit" className="w-full">Initialize Asset</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4 border-b border-border bg-muted/10 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name, serial number..." 
                className="pl-9 bg-background h-10"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            {deptParam && (
              <Button variant="ghost" size="sm" onClick={() => window.history.pushState({}, '', '/equipment')} className="whitespace-nowrap">
                <RefreshCw className="w-3 h-3 mr-2" />
                Show All Depts
              </Button>
            )}
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="min-w-[200px]">Equipment Name</TableHead>
                  <TableHead className="min-w-[120px]">Serial Number</TableHead>
                  <TableHead className="min-w-[120px]">Department</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="min-w-[120px]">Next Service</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></TableCell></TableRow>
                ) : filteredEquipment && filteredEquipment.length > 0 ? (
                  filteredEquipment.map((eq) => (
                    <TableRow key={eq.id} className="group">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                            <Monitor className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-sm truncate">{eq.name}</span>
                            <span className="text-[10px] text-muted-foreground truncate">{eq.manufacturer}{eq.modelNumber ? ` • ${eq.modelNumber}` : ''}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{eq.serialNumber}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-medium text-[10px] whitespace-nowrap">
                          {departments?.find(d => d.id === eq.departmentId)?.name || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full shrink-0 ${
                            eq.status === 'OPERATIONAL' ? 'bg-green-500' :
                            eq.status === 'FAULTY' ? 'bg-destructive animate-pulse' :
                            'bg-orange-400'
                          }`} />
                          <span className="text-xs font-medium">{eq.status}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground whitespace-nowrap">
                          <Calendar className="w-3 h-3" />
                          {eq.nextServiceDate}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {canManage && (
                            <>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => handleEditClick(eq)}>
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setEqToDelete(eq)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">No equipment found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modify Asset Registry</DialogTitle>
            <DialogDescription>Update the master record for <strong>{editingEq?.name}</strong>.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateEquipment} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Equipment Name</Label>
              <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Manufacturer</Label>
                <Input value={formData.manufacturer} onChange={e => setFormData({...formData, manufacturer: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label>Model Number</Label>
                <Input value={formData.modelNumber} onChange={e => setFormData({...formData, modelNumber: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Operational Status</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                  required
                >
                  <option value="OPERATIONAL">Operational</option>
                  <option value="FAULTY">Faulty (Breakdown)</option>
                  <option value="MAINTENANCE">Under Maintenance</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={formData.departmentId}
                  onChange={e => setFormData({...formData, departmentId: e.target.value})}
                  required
                >
                  {departments?.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full">Synchronize Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!eqToDelete} onOpenChange={(open) => !open && setEqToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Purge Asset Record?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{eqToDelete?.name}</strong> (SN: {eqToDelete?.serialNumber})? This will permanently delete the asset from the hospital registry.
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
    </div>
  )
}

export default function EquipmentPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>}>
        <EquipmentContent />
      </Suspense>
    </AppShell>
  )
}
