
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
  Building2
} from "lucide-react"
import { aiTroubleshoot, type AITroubleshootingOutput } from "@/ai/flows/ai-troubleshooting-assistant-flow"
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from "@/firebase"
import { collection, doc } from "firebase/firestore"
import { Badge } from "@/components/ui/badge"

export default function TroubleshootPage() {
  const db = useFirestore()
  const { user: currentUser } = useUser()
  const [problem, setProblem] = useState("")
  const [errorCode, setErrorCode] = useState("")
  const [selectedEqId, setSelectedEqId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<AITroubleshootingOutput | null>(null)

  const profileRef = useMemoFirebase(() => {
    if (!db || !currentUser) return null
    return doc(db, "userProfiles", currentUser.uid)
  }, [db, currentUser])
  const { data: profile } = useDoc(profileRef)

  const equipmentQuery = useMemoFirebase(() => {
    if (!db || !profile) return null
    return collection(db, "equipment")
  }, [db, profile])
  const { data: equipment, isLoading: isEqLoading } = useCollection(equipmentQuery)

  const departmentsQuery = useMemoFirebase(() => {
    if (!db || !profile) return null
    return collection(db, "departments")
  }, [db, profile])
  const { data: departments } = useCollection(departmentsQuery)

  const handleTroubleshoot = async () => {
    if (!problem.trim() || !selectedEqId) return
    
    setIsLoading(true)
    try {
      const eq = equipment?.find(e => e.id === selectedEqId)
      if (!eq) return

      const dept = departments?.find(d => d.id === eq.departmentId)

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

  const selectedEq = equipment?.find(e => e.id === selectedEqId)
  const selectedDept = departments?.find(d => d.id === selectedEq?.departmentId)

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-6 md:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-headline font-bold text-primary flex items-center gap-3">
              <BrainCircuit className="w-8 h-8 text-accent shrink-0" />
              AI Assistant
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Context-aware diagnostic guidance for clinical hardware.
            </p>
          </div>
          <Button variant="outline" size="sm" className="gap-2 w-full sm:w-auto">
            <History className="w-4 h-4" />
            Sessions
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-6">
            <Card className="border-none shadow-sm">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-lg">System Diagnosis</CardTitle>
                <CardDescription>Select asset and describe technical symptoms</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-4 md:p-6 pt-0 md:pt-0">
                <div className="space-y-2">
                  <Label>Hardware Target</Label>
                  <div className="grid grid-cols-1 gap-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                    {isEqLoading ? (
                      <div className="flex justify-center p-4"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
                    ) : equipment && equipment.length > 0 ? (
                      equipment.map(eq => (
                        <div 
                          key={eq.id}
                          onClick={() => setSelectedEqId(eq.id)}
                          className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                            selectedEqId === eq.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                             <Microscope className={`w-4 h-4 shrink-0 ${selectedEqId === eq.id ? 'text-primary' : 'text-muted-foreground'}`} />
                             <div className="flex flex-col min-w-0">
                               <span className="text-xs font-semibold truncate">{eq.name}</span>
                               <span className="text-[10px] text-muted-foreground font-mono truncate">{eq.serialNumber}</span>
                             </div>
                          </div>
                          {selectedEqId === eq.id && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground text-center py-4">No assets registered.</p>
                    )}
                  </div>
                </div>

                {selectedEq && (
                  <div className="p-3 bg-secondary/30 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <Building2 className="w-4 h-4 text-primary" />
                    <div className="text-xs">
                      <span className="text-muted-foreground">Department:</span>{' '}
                      <span className="font-bold text-primary">{selectedDept?.name || 'N/A'}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Error Code</Label>
                  <Input 
                    placeholder="e.g. E-203, System Halt" 
                    value={errorCode}
                    onChange={(e) => setErrorCode(e.target.value)}
                    className="h-10 bg-muted/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Symptom Analysis</Label>
                  <Textarea 
                    placeholder="Describe exactly what the hardware is doing or failing to do..." 
                    className="min-h-[120px] bg-muted/20"
                    value={problem}
                    onChange={(e) => setProblem(e.target.value)}
                  />
                </div>

                <Button 
                  className="w-full h-12 shadow-lg shadow-primary/20 gap-2" 
                  disabled={isLoading || !problem || !selectedEqId}
                  onClick={handleTroubleshoot}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Synthesizing Response...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-white" />
                      Engage Diagnostic Flow
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-7">
            {result ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <Card className="border-none shadow-sm bg-primary/5 border-l-4 border-l-primary overflow-hidden">
                  <CardHeader className="p-4 md:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Badge className="bg-primary hover:bg-primary text-[10px]">AI DIAGNOSIS</Badge>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Context: {selectedDept?.name}</span>
                    </div>
                    <CardTitle className="text-xl md:text-2xl mt-2">{result.diagnosis}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
                    <div className="flex flex-wrap gap-2">
                      {result.potentialCauses.map((cause, i) => (
                        <Badge key={i} variant="secondary" className="bg-white/80 text-[10px]">{cause}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-none shadow-sm">
                     <CardHeader className="pb-2 p-4">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                        Recommended Actions
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

                  <Card className="border-none shadow-sm bg-destructive/5">
                     <CardHeader className="pb-2 p-4">
                      <CardTitle className="text-sm flex items-center gap-2 text-destructive">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        Safety Precautions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <ul className="text-xs space-y-2 text-muted-foreground list-disc pl-4">
                        {result.warningsAndPrecautions?.map((warning, i) => (
                          <li key={i}>{warning}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-none shadow-sm">
                  <CardHeader className="p-4 md:p-6">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileSearch className="w-5 h-5 text-accent shrink-0" />
                      Technical Step-by-Step
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
                    <div className="space-y-4">
                      {result.stepByStepGuidance.map((step, i) => (
                        <div key={i} className="flex gap-4">
                          <div className="w-6 h-6 shrink-0 rounded-full bg-secondary text-secondary-foreground text-xs font-bold flex items-center justify-center border border-primary/20">
                            {i + 1}
                          </div>
                          <p className="text-sm leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                    {result.estimatedRepairTime && (
                      <div className="mt-8 pt-4 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <span className="text-sm font-semibold">Projected Maintenance Time:</span>
                        <Badge variant="outline" className="text-primary border-primary text-[10px]">{result.estimatedRepairTime}</Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex flex-col sm:flex-row justify-end gap-3">
                  <Button variant="outline" className="w-full sm:w-auto">Log Session</Button>
                  <Button className="w-full sm:w-auto">Raise Service Ticket</Button>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-muted/20 rounded-xl border border-dashed border-border">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                  <BrainCircuit className="w-8 h-8 md:w-10 md:h-10 text-muted-foreground opacity-40" />
                </div>
                <h3 className="text-lg md:text-xl font-headline font-bold text-muted-foreground">Intelligence Terminal Idle</h3>
                <p className="text-sm text-muted-foreground max-w-sm mt-2">
                  Select a specific hardware asset and describe the failure to receive context-aware engineering support.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
