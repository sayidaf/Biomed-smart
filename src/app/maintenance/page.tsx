
"use client"

import { useState, useMemo } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Calendar as CalendarIcon, 
  Wrench, 
  ChevronRight, 
  ArrowLeft,
  Building2,
  Monitor,
  CheckCircle2,
  Clock,
  User,
  Loader2,
  AlertTriangle,
  History,
  Settings
} from "lucide-react"
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from "@/firebase"
import { collection, doc, serverTimestamp, query, where } from "firebase/firestore"
import { addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates"
import { useToast } from "@/hooks/use-toast"
import { format, addMonths } from "date-fns"

export default function MaintenancePage() {
  const db = useFirestore()
  const { user: currentUser } = useUser()
  const { toast } = useToast()

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null)
  const [selectedEqId, setSelectedEqId] = useState<string | null>(null)
  
  const [lastServiceDate, setLastServiceDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [interval, setInterval] = useState("6")
  const [logType, setLogType] = useState<'PREVENTIVE' | 'CORRECTIVE'>('PREVENTIVE')
  const [engineerName, setEngineerName] = useState("")
  const [description, setDescription] = useState("")
  const [updatedStatus, setUpdatedStatus] = useState<'OPERATIONAL' | 'FAULTY' | 'MAINTENANCE' | ''>('')
  const [isSaving, setIsSaving] = useState(false)

  const profileRef = useMemoFirebase(() => {
    if (!db || !currentUser) return null
    return doc(db, "userProfiles", currentUser.uid)
  }, [db, currentUser])
  const { data: profile } = useDoc(profileRef)

  const departmentsQuery = useMemoFirebase(() => {
    if (!db || !profile) return null
    return collection(db, "departments")
  }, [db, profile])
  const { data: departments, isLoading: isDeptsLoading } = useCollection(departmentsQuery)

  const equipmentQuery = useMemoFirebase(() => {
    if (!db || !profile || !selectedDeptId) return null
    return query(collection(db, "equipment"), where("departmentId", "==", selectedDeptId))
  }, [db, profile, selectedDeptId])
  const { data: equipment, isLoading: isEqLoading } = useCollection(equipmentQuery)

  const selectedDept = departments?.find(d => d.id === selectedDeptId)
  const selectedEq = equipment?.find(e => e.id === selectedEqId)

  const nextServiceDate = useMemo(() => {
    if (!lastServiceDate || logType !== 'PREVENTIVE') return ""
    try {
      const date = new Date(lastServiceDate)
      const next = addMonths(date, parseInt(interval))
      return format(next, 'yyyy-MM-dd')
    } catch (e) { return "" }
  }, [lastServiceDate, interval, logType])

  const handleSaveService = async () => {
    if (!db || !selectedEq || !engineerName) return
    setIsSaving(true)

    const logData = {
      equipmentId: selectedEq.id,
      performedById: currentUser?.uid || "unknown",
      engineerName: engineerName,
      logType: logType === 'PREVENTIVE' ? 'Preventive Maintenance' : 'Corrective Maintenance',
      serviceDate: lastServiceDate,
      description: description || (logType === 'PREVENTIVE' ? 'Routine service.' : 'Breakdown repair.'),
      nextServiceDate: nextServiceDate || selectedEq.nextServiceDate || "",
      createdAt: serverTimestamp()
    }

    const logsRef = collection(db, "equipment", selectedEq.id, "maintenanceLogs")
    addDocumentNonBlocking(logsRef, logData)

    const updatePayload: any = {
      lastServiceDate: lastServiceDate,
      updatedAt: serverTimestamp()
    }
    if (logType === 'PREVENTIVE' && nextServiceDate) updatePayload.nextServiceDate = nextServiceDate
    if (updatedStatus) updatePayload.status = updatedStatus

    const eqRef = doc(db, "equipment", selectedEq.id)
    updateDocumentNonBlocking(eqRef, updatePayload)

    toast({ title: "Protocol Logged", description: "Asset registry and history updated." })
    setIsSaving(false)
    resetFlow()
  }

  const resetFlow = () => {
    setStep(1)
    setSelectedDeptId(null)
    setSelectedEqId(null)
    setEngineerName("")
    setDescription("")
    setUpdatedStatus('')
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-headline font-bold text-primary flex items-center gap-3">
              <Wrench className="w-8 h-8 text-primary shrink-0" />
              Maintenance Terminal
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Professional service scheduling and breakdown registry updates.</p>
          </div>
          {step > 1 && (
            <Button variant="ghost" onClick={() => setStep((s) => (s - 1) as any)} className="gap-2">
              <ArrowLeft className="w-4 h-4" /> 
              Back
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6">
          {step === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {isDeptsLoading ? (
                <div className="col-span-full py-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
              ) : departments?.map(dept => (
                <Card 
                  key={dept.id} 
                  className="border-none shadow-sm hover:ring-2 hover:ring-primary transition-all cursor-pointer group" 
                  onClick={() => { setSelectedDeptId(dept.id); setStep(2); }}
                >
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg truncate">{dept.name}</h3>
                      <p className="text-xs text-muted-foreground">Select hospital sector</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {isEqLoading ? (
                <div className="col-span-full py-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
              ) : (
                <>
                  {equipment && equipment.length > 0 ? (
                    equipment.map(eq => (
                      <Card 
                        key={eq.id} 
                        className="border-none shadow-sm hover:ring-2 hover:ring-primary transition-all cursor-pointer group" 
                        onClick={() => { setSelectedEqId(eq.id); setStep(3); }}
                      >
                        <CardContent className="p-6 flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                            <Monitor className="w-6 h-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-sm truncate">{eq.name}</h3>
                            <Badge variant="outline" className="text-[10px] truncate">{eq.serialNumber}</Badge>
                          </div>
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-full py-10 text-center">
                      <p className="text-muted-foreground">No assets registered in this department.</p>
                      <Button variant="link" onClick={() => setStep(1)}>Return to Sectors</Button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {step === 3 && selectedEq && (
            <Card className="border-none shadow-lg overflow-hidden">
              <div className="h-2 bg-primary" />
              <CardHeader className="bg-muted/30 p-6">
                <CardTitle className="text-2xl">{selectedEq.name}</CardTitle>
                <CardDescription>
                  SN: {selectedEq.serialNumber} • Manufacturer: {selectedEq.manufacturer} • Current Status: {selectedEq.status}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground">1. Protocol Type</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Button 
                          variant={logType === 'PREVENTIVE' ? 'default' : 'outline'} 
                          className="h-12 gap-2 text-xs md:text-sm" 
                          onClick={() => setLogType('PREVENTIVE')}
                          title="Routine Service Cycle: Updates next service date and registry compliance status."
                        >
                          <History className="w-4 h-4" /> 
                          Service
                        </Button>
                        <Button 
                          variant={logType === 'CORRECTIVE' ? 'destructive' : 'outline'} 
                          className="h-12 gap-2 text-xs md:text-sm" 
                          onClick={() => setLogType('CORRECTIVE')}
                          title="Corrective Repair: Logs a breakdown event or power failure without resetting the main service cycle."
                        >
                          <AlertTriangle className="w-4 h-4" /> 
                          Breakdown
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground">2. Activity Date</Label>
                      <Input 
                        type="date" 
                        className="h-12" 
                        value={lastServiceDate} 
                        onChange={(e) => setLastServiceDate(e.target.value)} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground">3. Registry Status Update</Label>
                      <select 
                        className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" 
                        value={updatedStatus} 
                        onChange={(e) => setUpdatedStatus(e.target.value as any)}
                        title="Update the machine's operational status in the master inventory list."
                      >
                        <option value="">No Change (Keep {selectedEq.status})</option>
                        <option value="OPERATIONAL">Set to OPERATIONAL (Fixed)</option>
                        <option value="FAULTY">Flag as FAULTY (Unresolved)</option>
                        <option value="MAINTENANCE">Set to MAINTENANCE (In Progress)</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground">4. Performing Engineer</Label>
                      <Input 
                        placeholder="Full Name of Technical Staff" 
                        className="h-12" 
                        value={engineerName} 
                        onChange={(e) => setEngineerName(e.target.value)} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground">5. Technical Notes</Label>
                      <Textarea 
                        placeholder="Detail specific power problems, parts replaced, or breakdown causes..." 
                        className="min-h-[100px]" 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                  <Button variant="outline" className="flex-1 order-2 sm:order-1" onClick={() => setStep(2)}>Abort Protocol</Button>
                  <Button 
                    className="flex-1 h-12 font-bold shadow-lg shadow-primary/20 gap-2 order-1 sm:order-2" 
                    disabled={!engineerName || isSaving} 
                    onClick={handleSaveService}
                    title="Finalize Record: Permanently archive this technical activity to the equipment history and hospital audit registry."
                  >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                    Confirm Registry Entry
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  )
}
