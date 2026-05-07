
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
  Send, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle,
  History,
  FileSearch,
  Zap,
  Microscope
} from "lucide-react"
import { aiTroubleshoot, type AITroubleshootingOutput } from "@/ai/flows/ai-troubleshooting-assistant-flow"
import { equipment as mockEquipment } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function TroubleshootPage() {
  const [problem, setProblem] = useState("")
  const [errorCode, setErrorCode] = useState("")
  const [selectedEqId, setSelectedEqId] = useState("eq-102")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<AITroubleshootingOutput | null>(null)

  const handleTroubleshoot = async () => {
    if (!problem.trim()) return
    
    setIsLoading(true)
    try {
      const eq = mockEquipment.find(e => e.id === selectedEqId) || mockEquipment[0]
      const response = await aiTroubleshoot({
        equipmentId: eq.id,
        problemDescription: problem,
        errorCode: errorCode,
        equipmentDetails: {
          name: eq.name,
          manufacturer: eq.manufacturer,
          modelNumber: eq.modelNumber,
          serialNumber: eq.serialNumber,
          status: eq.status
        }
      })
      setResult(response)
    } catch (error) {
      console.error("Troubleshooting failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold text-primary flex items-center gap-3">
              <BrainCircuit className="w-8 h-8 text-accent" />
              AI Troubleshooting Assistant
            </h1>
            <p className="text-muted-foreground mt-1">
              Smart diagnostic guidance powered by Genkit AI and RAG.
            </p>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <History className="w-4 h-4" />
            Previous Sessions
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Input Side */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="border-none shadow-sm h-full">
              <CardHeader>
                <CardTitle className="text-lg">Device Diagnosis</CardTitle>
                <CardDescription>Enter problem details for AI analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Equipment Unit</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {mockEquipment.map(eq => (
                      <div 
                        key={eq.id}
                        onClick={() => setSelectedEqId(eq.id)}
                        className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                          selectedEqId === eq.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                           <Microscope className={`w-5 h-5 ${selectedEqId === eq.id ? 'text-primary' : 'text-muted-foreground'}`} />
                           <div className="flex flex-col">
                             <span className="text-sm font-semibold">{eq.name}</span>
                             <span className="text-[10px] text-muted-foreground font-mono">{eq.serialNumber}</span>
                           </div>
                        </div>
                        {selectedEqId === eq.id && <CheckCircle2 className="w-4 h-4 text-primary" />}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Error Code (Optional)</Label>
                  <Input 
                    placeholder="e.g. E-203" 
                    value={errorCode}
                    onChange={(e) => setErrorCode(e.target.value)}
                    className="h-10 bg-muted/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Problem Description</Label>
                  <Textarea 
                    placeholder="Describe the issue, symptoms, or what happened before the failure..." 
                    className="min-h-[150px] bg-muted/20"
                    value={problem}
                    onChange={(e) => setProblem(e.target.value)}
                  />
                </div>

                <Button 
                  className="w-full h-11 shadow-lg shadow-primary/20 gap-2" 
                  disabled={isLoading || !problem}
                  onClick={handleTroubleshoot}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing Hardware...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-white" />
                      Generate Solution
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Result Side */}
          <div className="lg:col-span-7">
            {result ? (
              <div className="space-y-6">
                <Card className="border-none shadow-sm bg-primary/5 border-l-4 border-l-primary">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge className="bg-primary hover:bg-primary">AI DIAGNOSIS</Badge>
                      <span className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Confidence: 94%</span>
                    </div>
                    <CardTitle className="text-2xl mt-2">{result.diagnosis}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {result.potentialCauses.map((cause, i) => (
                        <Badge key={i} variant="secondary" className="bg-white/80">{cause}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-none shadow-sm">
                     <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Recommended Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm space-y-2 text-muted-foreground list-disc pl-4">
                        {result.recommendedActions.map((action, i) => (
                          <li key={i}>{action}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-sm bg-destructive/5">
                     <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2 text-destructive">
                        <AlertTriangle className="w-4 h-4" />
                        Precautions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm space-y-2 text-muted-foreground list-disc pl-4">
                        {result.warningsAndPrecautions?.map((warning, i) => (
                          <li key={i}>{warning}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileSearch className="w-5 h-5 text-accent" />
                      Step-by-Step Resolution Guide
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {result.stepByStepGuidance.map((step, i) => (
                        <div key={i} className="flex gap-4">
                          <div className="w-6 h-6 shrink-0 rounded-full bg-secondary text-secondary-foreground text-xs font-bold flex items-center justify-center border border-primary/20">
                            {i + 1}
                          </div>
                          <p className="text-sm">{step}</p>
                        </div>
                      ))}
                    </div>
                    {result.estimatedRepairTime && (
                      <div className="mt-8 pt-4 border-t border-border flex items-center justify-between">
                        <span className="text-sm font-semibold">Est. Time to Repair:</span>
                        <Badge variant="outline" className="text-primary border-primary">{result.estimatedRepairTime}</Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex justify-end gap-3">
                  <Button variant="outline">Save to Log</Button>
                  <Button>Open Service Ticket</Button>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-muted/20 rounded-xl border border-dashed border-border">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                  <BrainCircuit className="w-10 h-10 text-muted-foreground opacity-40" />
                </div>
                <h3 className="text-xl font-headline font-bold text-muted-foreground">Ready to Assist</h3>
                <p className="text-sm text-muted-foreground max-w-sm mt-2">
                  Submit a problem description on the left to generate context-aware troubleshooting steps and hardware diagnosis.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
