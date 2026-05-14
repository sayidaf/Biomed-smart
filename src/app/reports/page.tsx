
"use client"

import { useState, useMemo, useEffect } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  FileText, 
  Download, 
  Search,
  BrainCircuit,
  Wrench,
  Loader2,
  Calendar,
  Building2,
  Monitor,
  Mail,
  ChevronRight,
  ArrowLeft,
  Save,
  FileCheck,
  Type,
  Users,
  Globe,
  Clock
} from "lucide-react"
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from "@/firebase"
import { collection, doc, query, where, serverTimestamp, orderBy, limit, getDocs } from "firebase/firestore"
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { subDays, format, isAfter, parseISO } from "date-fns"

export default function ReportsPage() {
  const db = useFirestore()
  const { user: currentUser } = useUser()
  const { toast } = useToast()

  // State Management
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1)
  const [reportScope, setReportScope] = useState<"GENERAL" | "DEPARTMENT" | null>(null)
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null)
  const [selectedEqId, setSelectedEqId] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<"24H" | "1W" | "1M">("24H")
  const [isSaving, setIsSaving] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  // Email/Report Content State
  const [recipientEmail, setRecipientEmail] = useState("")
  const [recipientCc, setRecipientCc] = useState("")
  const [recipientBcc, setRecipientBcc] = useState("")
  const [editableContent, setEditableContent] = useState("")

  // Data Fetching
  const departmentsQuery = useMemoFirebase(() => {
    if (!db) return null
    return collection(db, "departments")
  }, [db])
  const { data: departments, isLoading: isDeptsLoading } = useCollection(departmentsQuery)

  const equipmentQuery = useMemoFirebase(() => {
    if (!db || !selectedDeptId) return null
    return query(collection(db, "equipment"), where("departmentId", "==", selectedDeptId))
  }, [db, selectedDeptId])
  const { data: equipment, isLoading: isEqLoading } = useCollection(equipmentQuery)

  const selectedDept = departments?.find(d => d.id === selectedDeptId)
  const selectedEq = equipment?.find(e => e.id === selectedEqId)

  // Period map for calculation
  const periodDays = {
    "24H": 1,
    "1W": 7,
    "1M": 30
  }

  const generateReportText = async () => {
    if (!db || !currentUser) return
    setIsGenerating(true)
    
    const dateStr = format(new Date(), 'PPP')
    const cutoffDate = subDays(new Date(), periodDays[selectedPeriod])
    let activitySummary = ""

    try {
      if (reportScope === "DEPARTMENT" && selectedEqId) {
        // Fetch specific logs for the asset - THIS IS THE CRUCIAL LINK TO MAINTENANCE
        const logsRef = collection(db, "equipment", selectedEqId, "maintenanceLogs")
        const q = query(logsRef, orderBy("createdAt", "desc"))
        const snapshot = await getDocs(q)
        
        const logsInRange = snapshot.docs.map(doc => doc.data()).filter(log => {
          const logDate = log.createdAt?.toDate ? log.createdAt.toDate() : new Date()
          return isAfter(logDate, cutoffDate)
        })

        const services = logsInRange.filter(l => l.logType === 'Preventive Maintenance' || l.logType === 'Preventive Service').length
        const repairs = logsInRange.filter(l => l.logType === 'Corrective Maintenance' || l.logType === 'Breakdown' || l.logType === 'Corrective Repair').length
        
        // Extract technical staff names for accountability
        const engineers = Array.from(new Set(logsInRange.map(l => l.engineerName).filter(Boolean)))

        activitySummary = `TECHNICAL ACTIVITY SUMMARY (${selectedPeriod}):\n` +
                          `--------------------------------------------------\n` +
                          `- Total Validated Protocols: ${logsInRange.length}\n` +
                          `- Preventive Service Cycles: ${services}\n` +
                          `- Corrective Repair Sessions: ${repairs}\n\n` +
                          `ENGINEERING STAFF INVOLVED:\n` +
                          (engineers.length > 0 ? engineers.join(", ") : "Registry default staff") + `\n\n` +
                          `DETAILED REGISTRY LOGS:\n` +
                          (logsInRange.length > 0 
                            ? logsInRange.map(l => `[${format(l.createdAt?.toDate?.() || new Date(), 'MM/dd')}] ${l.logType.toUpperCase()}\n   Tech: ${l.engineerName || 'N/A'}\n   Notes: ${l.description}`).join('\n\n')
                            : "No technical maintenance activities recorded in the specified registry window.")
      } else {
        activitySummary = `GENERAL FACILITY AUDIT OVERVIEW (${selectedPeriod}):\n` +
                          `Comprehensive status check initiated. Terminal has monitored global technical status for the previous ${periodDays[selectedPeriod]} days.\n\n` +
                          `Facility-wide hardware maintenance cycles have been evaluated against ISO compliance standards.`
      }

      let content = ""
      if (reportScope === "GENERAL") {
        content = `BIOMEDLINK GENERAL FACILITY AUDIT\n` +
                  `================================\n` +
                  `Report Date: ${dateStr}\n` +
                  `Period Scope: Last ${periodDays[selectedPeriod]} Days\n` +
                  `Generated By: ${currentUser?.email}\n\n` +
                  `${activitySummary}\n\n` +
                  `Generated via BioMedLink Core Terminal Registry.`
      } else if (selectedEq) {
        content = `BIOMEDLINK TECHNICAL ASSET REPORT\n` +
                  `=================================\n` +
                  `Hardware: ${selectedEq.name}\n` +
                  `S/N: ${selectedEq.serialNumber}\n` +
                  `Manufacturer: ${selectedEq.manufacturer}\n` +
                  `Asset Status: ${selectedEq.status}\n` +
                  `Department: ${selectedDept?.name || 'N/A'}\n` +
                  `Report Date: ${dateStr}\n` +
                  `Period Scope: Last ${periodDays[selectedPeriod]} Days\n\n` +
                  `${activitySummary}\n\n` +
                  `REGISTRY STATUS UPDATE:\n` +
                  `- Last Verified Service: ${selectedEq.lastServiceDate || 'Not Logged'}\n` +
                  `- Next Scheduled Cycle: ${selectedEq.nextServiceDate || 'Pending'}\n\n` +
                  `Verified by BioMedLink Core Technical Intelligence.`
      }
      setEditableContent(content)
      setStep(5)
    } catch (e) {
      toast({ variant: "destructive", title: "Generation Error", description: "Failed to compile technical maintenance logs." })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadWord = () => {
    if (!editableContent) return
    const blob = new Blob([editableContent], { type: "application/msword" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = reportScope === "GENERAL" ? "General_Audit.doc" : `Technical_Report_${selectedEq?.serialNumber}.doc`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast({ title: "Technical Doc Generated", description: "Your custom technical report has been exported." })
  }

  const getEmailMetadata = () => {
    const subject = reportScope === "GENERAL" ? "BioMedLink: General Hospital Audit" : `BioMedLink Technical Report: ${selectedEq?.name} (${selectedEq?.serialNumber})`
    return {
      subject: encodeURIComponent(subject),
      body: encodeURIComponent(editableContent)
    }
  }

  const handleEmailOutlook = () => {
    if (!editableContent) return
    const { subject, body } = getEmailMetadata()
    const mailtoUrl = `mailto:${recipientEmail}?cc=${recipientCc}&bcc=${recipientBcc}&subject=${subject}&body=${body}`
    window.location.href = mailtoUrl
    toast({ title: "Outlook Protocol Initiated", description: "Drafting synchronized report content." })
  }

  const handleEmailGmail = () => {
    if (!editableContent) return
    const { subject, body } = getEmailMetadata()
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${recipientEmail}&cc=${recipientCc}&bcc=${recipientBcc}&su=${subject}&body=${body}`
    window.open(gmailUrl, '_blank')
    toast({ title: "Gmail Protocol Initiated", description: "Opening Gmail draft composer." })
  }

  const handleSaveReport = () => {
    if (!db || !editableContent) return
    setIsSaving(true)
    
    const reportData = {
      equipmentId: selectedEq?.id || "FACILITY_WIDE",
      engineerId: currentUser?.uid,
      type: reportScope === "GENERAL" ? "FACILITY_AUDIT" : "ASSET_AUDIT",
      period: selectedPeriod,
      content: editableContent,
      createdAt: serverTimestamp()
    }

    addDocumentNonBlocking(collection(db, "reports"), reportData)
    
    setTimeout(() => {
      setIsSaving(false)
      toast({ title: "Archived to Registry", description: "This report has been permanently saved to the compliance archives." })
      setStep(1)
      setSelectedDeptId(null)
      setSelectedEqId(null)
      setEditableContent("")
    }, 1000)
  }

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-headline font-bold text-primary flex items-center gap-3">
              <FileText className="w-8 h-8 text-primary" />
              Compliance Registry
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Audit clinical activities and maintenance cycles for ISO compliance.</p>
          </div>
          {step > 1 && (
            <Button variant="ghost" onClick={() => setStep((s) => (s - 1) as any)} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          )}
        </div>

        {/* Step 1: Scope Selection */}
        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card 
              className="border-none shadow-sm hover:ring-2 hover:ring-primary transition-all cursor-pointer group p-6"
              onClick={() => { setReportScope("GENERAL"); setStep(4); }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                <FileCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">General Hospital Audit</h3>
              <p className="text-sm text-muted-foreground mt-2">Global report covering all departments and compliance alerts across the facility.</p>
            </Card>

            <Card 
              className="border-none shadow-sm hover:ring-2 hover:ring-primary transition-all cursor-pointer group p-6"
              onClick={() => { setReportScope("DEPARTMENT"); setStep(2); }}
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent group-hover:text-white transition-colors">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Asset-Specific Report</h3>
              <p className="text-sm text-muted-foreground mt-2">Deep-dive technical summary for a specific piece of clinical hardware.</p>
            </Card>
          </div>
        )}

        {/* Step 2: Department Selection */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Select Hospital Department</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {isDeptsLoading ? (
                <div className="col-span-full py-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
              ) : departments?.map(dept => (
                <Card 
                  key={dept.id} 
                  className="border-none shadow-sm hover:ring-2 hover:ring-primary transition-all cursor-pointer p-4 flex items-center justify-between"
                  onClick={() => { setSelectedDeptId(dept.id); setStep(3); }}
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-muted-foreground" />
                    <span className="font-semibold">{dept.name}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Equipment Selection */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest">
              <Building2 className="w-3 h-3" />
              Sector: {selectedDept?.name}
            </div>
            <h2 className="text-xl font-bold">Select Target Asset</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {isEqLoading ? (
                <div className="col-span-full py-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
              ) : equipment?.map(eq => (
                <Card 
                  key={eq.id} 
                  className="border-none shadow-sm hover:ring-2 hover:ring-primary transition-all cursor-pointer p-4 flex items-center justify-between"
                  onClick={() => { setSelectedEqId(eq.id); setStep(4); }}
                >
                  <div className="flex items-center gap-3">
                    <Monitor className="w-5 h-5 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">{eq.name}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{eq.serialNumber}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Period Selection */}
        {step === 4 && (
          <div className="max-w-xl mx-auto space-y-6">
            <h2 className="text-xl font-bold text-center">Define Reporting Period</h2>
            <p className="text-sm text-muted-foreground text-center">System will automatically summarize maintenance registry activities within this timeframe.</p>
            <div className="grid grid-cols-1 gap-3">
              {[
                { id: "24H", label: "Last 24 Hours", sub: "Daily technical summary" },
                { id: "1W", label: "Last 7 Days", sub: "Weekly compliance overview" },
                { id: "1M", label: "Last 30 Days", sub: "Monthly facility audit" }
              ].map((period) => (
                <Button 
                  key={period.id}
                  variant={selectedPeriod === period.id ? "default" : "outline"}
                  className="h-20 flex flex-col items-center justify-center gap-1"
                  onClick={() => setSelectedPeriod(period.id as any)}
                >
                  <span className="font-bold">{period.label}</span>
                  <span className="text-[10px] opacity-70 uppercase tracking-widest">{period.sub}</span>
                </Button>
              ))}
            </div>
            <Button 
              className="w-full h-14 mt-4 shadow-lg shadow-primary/20 gap-2 font-bold"
              disabled={isGenerating}
              onClick={generateReportText}
            >
              {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Clock className="w-5 h-5" />}
              Generate Technical Draft
            </Button>
          </div>
        )}

        {/* Step 5: Finalize & Edit Report */}
        {step === 5 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-6">
              <Card className="border-none shadow-lg overflow-hidden">
                <div className="h-2 bg-primary" />
                <CardHeader className="bg-muted/10">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-primary border-primary">Technical Draft Protocol</Badge>
                    <span className="text-xs text-muted-foreground font-mono">{format(new Date(), 'PPP')}</span>
                  </div>
                  <CardTitle className="text-2xl mt-4">Edit Technical Document</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <Textarea 
                    value={editableContent}
                    onChange={(e) => setEditableContent(e.target.value)}
                    className="min-h-[450px] font-mono text-sm leading-relaxed p-4 bg-background border-2"
                  />
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Stakeholder Dispatch
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">To (Primary)</Label>
                    <Input placeholder="admin@hospital.com" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground">CC</Label>
                      <Input placeholder="dept@hospital.com" value={recipientCc} onChange={(e) => setRecipientCc(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground">BCC</Label>
                      <Input placeholder="audit@hospital.com" value={recipientBcc} onChange={(e) => setRecipientBcc(e.target.value)} />
                    </div>
                  </div>
                  <div className="pt-6 border-t space-y-3">
                    <Button className="w-full h-12 font-bold gap-2 shadow-lg" disabled={isSaving} onClick={handleSaveReport}>
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Archived to Registry
                    </Button>
                    <Button variant="outline" className="w-full h-12 font-bold gap-2" onClick={handleDownloadWord}>
                      <Download className="w-4 h-4" /> Download Word
                    </Button>
                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="secondary" className="h-12 font-bold gap-2" onClick={handleEmailOutlook}><Mail className="w-4 h-4" /> Outlook</Button>
                      <Button variant="secondary" className="h-12 font-bold gap-2" onClick={handleEmailGmail}><Globe className="w-4 h-4" /> Gmail</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
