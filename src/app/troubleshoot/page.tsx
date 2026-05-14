
"use client"

import { useState } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  BrainCircuit, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle,
  History,
  FileSearch,
  Zap,
  Microscope,
  Building2,
  ChevronRight,
  ArrowLeft,
  Settings,
  RefreshCw
} from "lucide-react"
import { aiTroubleshoot, type AITroubleshootingOutput } from "@/ai/flows/ai-troubleshooting-assistant-flow"
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from "@/firebase"
import { collection, doc, query, where, serverTimestamp } from "firebase/firestore"
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function TroubleshootPage() {
  const db = useFirestore()
  const { user: currentUser } = useUser()
  const { toast } = useToast()
  
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null)
  const [selectedEqId, setSelectedEqId] = useState<string | null>(null)
  const [problem, setProblem] = useState("")
  const [errorCode, setErrorCode] = useState("")
  
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [result, setResult] = useState<AITroubleshootingOutput | null>(null)

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

  const handleTroubleshoot = async () => {
    if (!problem.trim() || !selectedEqId) return
    setIsLoading(true)
    try {
      const eq = equipment?.find(e => e.id === selectedEqId)
      if (!eq) return
      const dept = departments?.find(d => d.id === selectedDeptId)

      const response = await aiTroubleshoot({
        equipmentId: eq.id,
        problemDescription: problem,
        errorCode: errorCode,
        equipmentDetails: {
          name: eq.name,
          manufacturer: eq.manufacturer,
          modelNumber: eq.modelNumber || "",
          serialNumber: eq.serialNumber,
          status: eq.status,
          department: dept?.name || 'Unknown Department'
        }
      })
      setResult(response)
    } catch (error) {
      console.error("Diagnostic synthesis failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateEqStatus = (status: 'OPERATIONAL' | 'FAULTY' | 'MAINTENANCE') => {
    if (!db || !selectedEqId) return
    setIsUpdatingStatus(true)
    const eqRef = doc(db, "equipment", selectedEqId)
    updateDocumentNonBlocking(eqRef, { status, updatedAt: serverTimestamp() })
    
    setTimeout(() => {
      setIsUpdatingStatus(false)
      toast({ title: "Registry Updated", description: `Asset status set to ${status}.` })
    }, 500)
  }

  const selectedDept = departments?.find(d => d.id === selectedDeptId)
  const selectedEq = equipment?.find(e => e.id === selectedEqId)

  const resetFlow = () => {
    setStep(1)
    setSelectedDeptId(null)
    setSelectedEqId(null)
    setProblem("")
    setErrorCode("")
    setResult(null)
  }

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-headline font-bold text-primary flex items-center gap-3">
              <BrainCircuit className="w-8 h-8 text-accent shrink-0" />
              Intelligence Terminal
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Context-aware diagnostic synthesis and professional knowledge base.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={resetFlow}>New Session</Button>
            {selectedEqId && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="sm" className="gap-2" disabled={isUpdatingStatus}>
                    {isUpdatingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <Settings className="w-4 h-4" />}
                    Update Status
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Registry Controls</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => updateEqStatus('OPERATIONAL')} className="text-green-600 font-bold">
                    Mark as OPERATIONAL
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateEqStatus('FAULTY')} className="text-destructive font-bold">
                    Flag as FAULTY
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateEqStatus('MAINTENANCE')} className="text-orange-600 font-bold">
                    Set to MAINTENANCE
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-6">
            <Card className="border-none shadow-sm overflow-hidden">
              <div className="h-1.5 bg-accent" />
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">Protocol Stage {step}</Badge>
                  {step > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => setStep((s) => (s - 1) as any)} className="h-7 w-7">
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <CardTitle className="text-lg mt-2">
                  {step === 1 && "Select Department"}
                  {step === 2 && "Identify Target Asset"}
                  {step === 3 && "Technical Analysis"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {step === 1 && (
                  <div className="grid grid-cols-1 gap-2">
                    {isDeptsLoading ? (
                      <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                    ) : departments?.map(dept => (
                      <button key={dept.id} onClick={() => { setSelectedDeptId(dept.id); setStep(2); }} className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all text-left group">
                        <div className="flex items-center gap-3">
                          <Building2 className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                          <span className="font-semibold text-sm">{dept.name}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                )}
                {step === 2 && (
                  <div className="grid grid-cols-1 gap-2">
                    {isEqLoading ? (
                      <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                    ) : equipment && equipment.length > 0 ? (
                      equipment.map(eq => (
                        <button key={eq.id} onClick={() => { setSelectedEqId(eq.id); setStep(3); }} className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all text-left group">
                          <div className="flex items-center gap-3">
                            <Microscope className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                            <div className="flex flex-col">
                              <span className="font-semibold text-sm">{eq.name}</span>
                              <span className="text-[10px] text-muted-foreground font-mono">{eq.serialNumber}</span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </button>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-sm text-muted-foreground">No assets found in {selectedDept?.name}.</p>
                        <Button variant="link" onClick={() => setStep(1)}>Return to Departments</Button>
                      </div>
                    )}
                  </div>
                )}
                {step === 3 && (
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-xl border border-border space-y-1">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase"><Building2 className="w-3 h-3" />{selectedDept?.name}</div>
                      <div className="flex items-center gap-2 text-sm font-bold text-primary"><Microscope className="w-4 h-4" />{selectedEq?.name}</div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground">Error Code (Optional)</Label>
                      <Input placeholder="e.g. E-203" value={errorCode} onChange={(e) => setErrorCode(e.target.value)} className="h-10 bg-muted/20" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground">Malfunction Details</Label>
                      <Textarea placeholder="Describe the observed symptoms and breakdown circumstances..." className="min-h-[150px] bg-muted/20" value={problem} onChange={(e) => setProblem(e.target.value)} />
                    </div>
                    <Button className="w-full h-12 shadow-lg shadow-primary/20 gap-2 font-bold" disabled={isLoading || !problem.trim()} onClick={handleTroubleshoot}>
                      {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Synthesizing Protocol...</> : <><Zap className="w-4 h-4 fill-white" /> Synthesize Protocol</>}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-7">
            {result ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <Card className="border-none shadow-sm bg-primary/5 border-l-4 border-l-primary overflow-hidden">
                  <CardHeader className="p-6">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <Badge className="bg-primary hover:bg-primary text-[10px]">VERIFIED DIAGNOSIS</Badge>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Target: {selectedEq?.name}</span>
                    </div>
                    <CardTitle className="text-xl md:text-2xl">{result.diagnosis}</CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 pb-6 pt-0">
                    <div className="flex flex-wrap gap-2">
                      {result.potentialCauses.map((cause, i) => (
                        <Badge key={i} variant="secondary" className="bg-white/80 border-primary/10 text-[10px]">{cause}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-none shadow-sm h-full">
                     <CardHeader className="pb-2 p-4">
                      <CardTitle className="text-sm flex items-center gap-2 font-bold"><CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />Expert Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <ul className="text-xs space-y-2 text-muted-foreground list-disc pl-4">{result.recommendedActions.map((action, i) => <li key={i}>{action}</li>)}</ul>
                    </CardContent>
                  </Card>
                  <Card className="border-none shadow-sm bg-destructive/5 h-full">
                     <CardHeader className="pb-2 p-4">
                      <CardTitle className="text-sm flex items-center gap-2 text-destructive font-bold"><AlertTriangle className="w-4 h-4 shrink-0" />Safety Protocol</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <ul className="text-xs space-y-2 text-destructive/80 list-disc pl-4">{result.warningsAndPrecautions?.map((warning, i) => <li key={i}>{warning}</li>)}</ul>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-none shadow-sm">
                  <CardHeader className="p-6">
                    <CardTitle className="text-lg flex items-center gap-2 font-headline font-bold"><FileSearch className="w-5 h-5 text-accent shrink-0" />Technical Guidance</CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 pb-6 pt-0">
                    <div className="space-y-5">
                      {result.stepByStepGuidance.map((step, i) => (
                        <div key={i} className="flex gap-4">
                          <div className="w-6 h-6 shrink-0 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center border border-primary/20">{i + 1}</div>
                          <p className="text-sm leading-relaxed text-foreground/90">{step}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end pt-4">
                  <Button variant="outline" onClick={resetFlow} className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    New Diagnostic Session
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-8 bg-muted/20 rounded-2xl border border-dashed border-border/50">
                <div className="w-20 h-20 rounded-full bg-background flex items-center justify-center mb-6 shadow-inner"><BrainCircuit className="w-10 h-10 text-muted-foreground opacity-20" /></div>
                <h3 className="text-xl font-headline font-bold text-muted-foreground">Expert System Standby</h3>
                <p className="text-sm text-muted-foreground max-w-sm mt-3 leading-relaxed">Complete the asset selection and analysis stage to synthesize a professional diagnostic protocol.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
