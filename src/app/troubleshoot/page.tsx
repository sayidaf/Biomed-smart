
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
  Save,
  Trash2
} from "lucide-react"
import { aiTroubleshoot, type AITroubleshootingOutput } from "@/ai/flows/ai-troubleshooting-assistant-flow"
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from "@/firebase"
import { collection, doc, query, where, serverTimestamp } from "firebase/firestore"
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

export default function TroubleshootPage() {
  const db = useFirestore()
  const { user: currentUser } = useUser()
  const { toast } = useToast()
  
  // Workflow State
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null)
  const [selectedEqId, setSelectedEqId] = useState<string | null>(null)
  const [problem, setProblem] = useState("")
  const [errorCode, setErrorCode] = useState("")
  
  // Results State
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [result, setResult] = useState<AITroubleshootingOutput | null>(null)

  // Auth Context
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
          modelNumber: eq.modelNumber,
          serialNumber: eq.serialNumber,
          status: eq.status,
          department: dept?.name || 'Unknown Department'
        }
      })
      setResult(response)
    } catch (error) {
      console.error("Troubleshooting failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveProtocol = async () => {
    if (!db || !result || !selectedEqId) return
    setIsSaving(true)

    const sessionData = {
      equipmentId: selectedEqId,
      engineerId: currentUser?.uid,
      startTime: serverTimestamp(),
      problemSummary: problem,
      resolutionSummary: result.diagnosis,
      protocol: result,
      status: 'SAVED',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    const sessionsRef = collection(db, "equipment", selectedEqId, "aiTroubleshootingSessions")
    addDocumentNonBlocking(sessionsRef, sessionData)

    toast({
      title: "Protocol Archived",
      description: "Repair guidance has been saved to the equipment history and compliance reports.",
    })
    
    setIsSaving(false)
    resetFlow()
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
              Context-aware hardware diagnostics for clinical engineering.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={resetFlow}>
              New Session
            </Button>
            <Button variant="ghost" size="sm" className="gap-2 hidden sm:flex">
              <History className="w-4 h-4" />
              Archive
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Sequential Selection */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="border-none shadow-sm overflow-hidden">
              <div className="h-1.5 bg-accent" />
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">Step {step} of 3</Badge>
                  {step > 1 && (
                    <Button variant="ghost" size="sm" onClick={() => setStep((s) => (s - 1) as any)} className="h-7 text-xs">
                      <ArrowLeft className="w-3 h-3 mr-1" />
                      Back
                    </Button>
                  )}
                </div>
                <CardTitle className="text-lg mt-2">
                  {step === 1 && "Select Department"}
                  {step === 2 && "Select Target Asset"}
                  {step === 3 && "Symptom Analysis"}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {step === 1 && (
                  <div className="grid grid-cols-1 gap-2">
                    {isDeptsLoading ? (
                      <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                    ) : departments?.map(dept => (
                      <button
                        key={dept.id}
                        onClick={() => { setSelectedDeptId(dept.id); setStep(2); }}
                        className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all text-left group"
                      >
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
                        <button
                          key={eq.id}
                          onClick={() => { setSelectedEqId(eq.id); setStep(3); }}
                          className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all text-left group"
                        >
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
                        <Button variant="link" onClick={() => setStep(1)}>Choose different department</Button>
                      </div>
                    )}
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-4 bg-muted/50 rounded-xl border border-border space-y-1">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase">
                        <Building2 className="w-3 h-3" />
                        {selectedDept?.name}
                      </div>
                      <div className="flex items-center gap-2 text-sm font-bold text-primary">
                        <Microscope className="w-4 h-4" />
                        {selectedEq?.name}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground">Error Code (Optional)</Label>
                      <Input 
                        placeholder="e.g. E-203, System Halt" 
                        value={errorCode}
                        onChange={(e) => setErrorCode(e.target.value)}
                        className="h-10 bg-muted/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground">Symptom Description</Label>
                      <Textarea 
                        placeholder="Provide specific details about the malfunction or irregular behavior..." 
                        className="min-h-[150px] bg-muted/20"
                        value={problem}
                        onChange={(e) => setProblem(e.target.value)}
                      />
                    </div>

                    <Button 
                      className="w-full h-12 shadow-lg shadow-primary/20 gap-2" 
                      disabled={isLoading || !problem.trim()}
                      onClick={handleTroubleshoot}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Synthesizing Diagnosis...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 fill-white" />
                          Generate Repair Protocol
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: AI Response */}
          <div className="lg:col-span-7">
            {result ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <Card className="border-none shadow-sm bg-primary/5 border-l-4 border-l-primary overflow-hidden">
                  <CardHeader className="p-6">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <Badge className="bg-primary hover:bg-primary text-[10px]">VERIFIED AI DIAGNOSIS</Badge>
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
                      <CardTitle className="text-sm flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                        Recommended Fixes
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <ul className="text-xs space-y-2 text-muted-foreground list-disc pl-4">
                        {result.recommendedActions.map((action, i) => (
                          <li key={i}>{action}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-sm bg-destructive/5 h-full">
                     <CardHeader className="pb-2 p-4">
                      <CardTitle className="text-sm flex items-center gap-2 text-destructive">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        Safety Critical
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <ul className="text-xs space-y-2 text-destructive/80 list-disc pl-4">
                        {result.warningsAndPrecautions?.map((warning, i) => (
                          <li key={i}>{warning}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-none shadow-sm">
                  <CardHeader className="p-6">
                    <CardTitle className="text-lg flex items-center gap-2 font-headline">
                      <FileSearch className="w-5 h-5 text-accent shrink-0" />
                      Engineering Step-by-Step
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 pb-6 pt-0">
                    <div className="space-y-5">
                      {result.stepByStepGuidance.map((step, i) => (
                        <div key={i} className="flex gap-4">
                          <div className="w-6 h-6 shrink-0 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center border border-primary/20">
                            {i + 1}
                          </div>
                          <p className="text-sm leading-relaxed text-foreground/90">{step}</p>
                        </div>
                      ))}
                    </div>
                    {result.estimatedRepairTime && (
                      <div className="mt-8 pt-4 border-t border-border flex items-center justify-between">
                        <span className="text-xs font-bold uppercase text-muted-foreground">Estimated Downtime Impact:</span>
                        <Badge variant="outline" className="text-primary border-primary text-[10px] px-3">{result.estimatedRepairTime}</Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={resetFlow} className="gap-2">
                    <Trash2 className="w-4 h-4" />
                    Discard Protocol
                  </Button>
                  <Button 
                    className="shadow-lg shadow-primary/20 gap-2" 
                    onClick={handleSaveProtocol}
                    disabled={isSaving}
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save to Archive
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-8 bg-muted/20 rounded-2xl border border-dashed border-border/50">
                <div className="w-20 h-20 rounded-full bg-background flex items-center justify-center mb-6 shadow-inner">
                  <BrainCircuit className="w-10 h-10 text-muted-foreground opacity-20" />
                </div>
                <h3 className="text-xl font-headline font-bold text-muted-foreground">Diagnostic Engine Offline</h3>
                <p className="text-sm text-muted-foreground max-w-sm mt-3 leading-relaxed">
                  Please complete the sequential selection on the left. Once an asset is identified and symptoms are logged, the diagnostic AI will synthesize a custom repair protocol.
                </p>
                
                <div className="mt-8 grid grid-cols-3 gap-8 opacity-20 grayscale">
                   <Microscope className="w-8 h-8 mx-auto" />
                   <Building2 className="w-8 h-8 mx-auto" />
                   <Zap className="w-8 h-8 mx-auto" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
