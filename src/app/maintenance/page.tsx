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
  History
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
  const [isSaving, setIsSaving] = useState(false)

  // Auth/Profile
  const profileRef = useMemoFirebase(() => {
    if (!db || !currentUser) return null
    return doc(db, "userProfiles", currentUser.uid)
  }, [db, currentUser])
  const { data: profile } = useDoc(profileRef)

  // Data Fetching
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
    } catch (e) {
      return ""
    }
  }, [lastServiceDate, interval, logType])

  const handleSaveService = async () => {
    if (!db || !selectedEq || !engineerName) return
    setIsSaving(true)

    const finalDescription = description || (logType === 'PREVENTIVE' 
      ? `Routine service performed. Interval: ${interval} months.` 
      : 'Corrective maintenance / Breakdown repair performed.')

    const logData = {
      equipmentId: selectedEq.id,
      performedById: currentUser?.uid || "unknown",
      engineerName: engineerName,
      logType: logType === 'PREVENTIVE' ? 'Preventive Maintenance' : 'Corrective Maintenance',
      serviceDate: lastServiceDate,
      description: finalDescription,
      nextServiceDate: nextServiceDate || selectedEq.nextServiceDate || "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    // Save to Maintenance Logs subcollection
    const logsRef = collection(db, "equipment", selectedEq.id, "maintenanceLogs")
    addDocumentNonBlocking(logsRef, logData)

    // Update Equipment Master Record
    const updatePayload: any = {
      lastServiceDate: lastServiceDate,
      updatedAt: serverTimestamp()
    }

    if (logType === 'PREVENTIVE' && nextServiceDate) {
      updatePayload.nextServiceDate = nextServiceDate
    }

    const eqRef = doc(db, "equipment", selectedEq.id)
    updateDocumentNonBlocking(eqRef, updatePayload)

    toast({
      title: logType === 'PREVENTIVE' ? "Service Logged" : "Breakdown Repair Logged",
      description: logType === 'PREVENTIVE' 
        ? `Service history updated. Next scheduled: ${nextServiceDate}` 
        : `Corrective maintenance record archived for ${selectedEq.name}.`,
    })

    setIsSaving(false)
    setStep(1)
    setSelectedDeptId(null)
    setSelectedEqId(null)
    setEngineerName("")
    setDescription("")
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold text-primary flex items-center gap-3">
              <Wrench className="w-8 h-8 text-primary" />
              Service Terminal
            </h1>
            <p className="text-muted-foreground mt-1">Professional maintenance scheduling and compliance tracking.</p>
          </div>
          {step > 1 && (
            <Button variant="ghost" onClick={() => setStep((s) => (s - 1) as any)} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Step 1: Dept Selection */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Step 1: Select Facility Sector</h2>
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
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{dept.name}</h3>
                        <p className="text-xs text-muted-foreground">Select to view assets</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Equipment Selection */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-primary font-bold uppercase tracking-wider">
                <Building2 className="w-4 h-4" />
                Sector: {selectedDept?.name}
              </div>
              <h2 className="text-xl font-bold">Step 2: Choose Equipment</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {isEqLoading ? (
                  <div className="col-span-full py-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                ) : equipment && equipment.length > 0 ? (
                  equipment.map(eq => (
                    <Card 
                      key={eq.id} 
                      className="border-none shadow-sm hover:ring-2 hover:ring-primary transition-all cursor-pointer group"
                      onClick={() => { setSelectedEqId(eq.id); setStep(3); }}
                    >
                      <CardContent className="p-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                          <Monitor className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-sm">{eq.name}</h3>
                          <Badge variant="outline" className="text-[10px]">{eq.serialNumber}</Badge>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-center py-10 text-muted-foreground col-span-full">No equipment registered in this department.</p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Service Form */}
          {step === 3 && selectedEq && (
            <Card className="border-none shadow-lg overflow-hidden">
              <div className="h-2 bg-primary" />
              <CardHeader className="bg-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-primary/20 text-primary border-primary/20 uppercase tracking-widest">Technical Log Protocol</Badge>
                </div>
                <CardTitle className="text-2xl">{selectedEq.name}</CardTitle>
                <CardDescription>
                  SN: {selectedEq.serialNumber} • Location: {selectedDept?.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground">1. Protocol Type</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          variant={logType === 'PREVENTIVE' ? 'default' : 'outline'} 
                          className="h-12 gap-2"
                          onClick={() => setLogType('PREVENTIVE')}
                        >
                          <History className="w-4 h-4" />
                          Service (PM)
                        </Button>
                        <Button 
                          variant={logType === 'CORRECTIVE' ? 'destructive' : 'outline'} 
                          className="h-12 gap-2"
                          onClick={() => setLogType('CORRECTIVE')}
                        >
                          <AlertTriangle className="w-4 h-4" />
                          Regular (Breakdown)
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground">2. Activity Date</Label>
                      <div className="relative">
                        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                          type="date" 
                          className="pl-10 h-12"
                          value={lastServiceDate}
                          onChange={(e) => setLastServiceDate(e.target.value)}
                        />
                      </div>
                    </div>

                    {logType === 'PREVENTIVE' && (
                      <div className="space-y-2 animate-in fade-in duration-300">
                        <Label className="text-xs font-bold uppercase text-muted-foreground">3. Service Interval</Label>
                        <select 
                          className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                          value={interval}
                          onChange={(e) => setInterval(e.target.value)}
                        >
                          <option value="1">1 Month (High Frequency)</option>
                          <option value="3">3 Months (Quarterly)</option>
                          <option value="6">6 Months (Bi-Annual)</option>
                          <option value="12">12 Months (Annual)</option>
                          <option value="24">24 Months (Long Term)</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground">4. Engineer (Performed By)</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                          placeholder="Full Name of Engineer" 
                          className="pl-10 h-12"
                          value={engineerName}
                          onChange={(e) => setEngineerName(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground">5. Technical Notes</Label>
                      <Textarea 
                        placeholder="Detail specific power problems, parts replaced, or breakdown causes..."
                        className="min-h-[100px]"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>

                    {logType === 'PREVENTIVE' && (
                      <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-300">
                        <Clock className="w-8 h-8 text-primary mb-2 opacity-50" />
                        <span className="text-[10px] font-bold uppercase text-muted-foreground mb-1 tracking-widest">Calculated Next Service</span>
                        <span className="text-2xl font-headline font-bold text-primary">
                          {nextServiceDate ? format(new Date(nextServiceDate), 'MMMM dd, yyyy') : '---'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border">
                  <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>Abort Entry</Button>
                  <Button 
                    className={`flex-1 h-12 font-bold shadow-lg gap-2 ${logType === 'CORRECTIVE' ? 'shadow-destructive/20' : 'shadow-primary/20'}`}
                    disabled={!engineerName || isSaving}
                    onClick={handleSaveService}
                    variant={logType === 'CORRECTIVE' ? 'destructive' : 'default'}
                  >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                    Confirm & Update Asset Registry
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
