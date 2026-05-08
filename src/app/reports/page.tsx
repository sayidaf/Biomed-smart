
"use client"

import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  FileText, 
  Download, 
  Plus, 
  TrendingUp, 
  PieChart, 
  BarChart3,
  Search,
  BrainCircuit,
  Wrench,
  Loader2,
  Calendar
} from "lucide-react"
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from "@/firebase"
import { collection, doc, query, collectionGroup, getDocs } from "firebase/firestore"
import { Badge } from "@/components/ui/badge"

export default function ReportsPage() {
  const db = useFirestore()
  const { user } = useUser()

  // We use collectionGroup to fetch all sessions/logs across all equipment for the report
  const sessionsQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(collectionGroup(db, "aiTroubleshootingSessions"))
  }, [db])
  const { data: sessions, isLoading: isSessionsLoading } = useCollection(sessionsQuery)

  const logsQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(collectionGroup(db, "maintenanceLogs"))
  }, [db])
  const { data: logs, isLoading: isLogsLoading } = useCollection(logsQuery)

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold text-primary flex items-center gap-3">
              <FileText className="w-8 h-8" />
              Compliance Reports
            </h1>
            <p className="text-muted-foreground mt-1">Generate ISO-certified hardware audit and maintenance compliance documents.</p>
          </div>
          <Button className="shadow-lg shadow-primary/20 gap-2">
            <Plus className="w-4 h-4" />
            Generate Custom Audit
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-none shadow-sm hover:border-primary/20 border-2 transition-all cursor-pointer">
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <PieChart className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-lg">Inventory Audit</CardTitle>
              <CardDescription>Full asset listing by department and status.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" className="w-full gap-2">
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm hover:border-primary/20 border-2 transition-all cursor-pointer">
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center mb-2">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <CardTitle className="text-lg">Downtime Analysis</CardTitle>
              <CardDescription>Impact of equipment failures on hospital operations.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" className="w-full gap-2">
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm hover:border-primary/20 border-2 transition-all cursor-pointer">
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-2">
                <BarChart3 className="w-5 h-5 text-accent" />
              </div>
              <CardTitle className="text-lg">Maintenance ROI</CardTitle>
              <CardDescription>Cost analysis of preventive vs corrective service.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" className="w-full gap-2">
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-accent" />
                Archived AI Protocols
              </CardTitle>
              <CardDescription>Recently saved AI troubleshooting repair guides.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isSessionsLoading ? (
                  <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin" /></div>
                ) : sessions && sessions.length > 0 ? (
                  sessions.map((session: any) => (
                    <div key={session.id} className="p-4 rounded-xl border border-border/50 hover:bg-muted/30 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-bold text-sm truncate max-w-[200px]">{session.problemSummary}</h4>
                        <Badge variant="secondary" className="text-[10px]">AI VERIFIED</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1 mb-3">{session.resolutionSummary}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold">
                          {session.createdAt?.toDate ? session.createdAt.toDate().toLocaleDateString() : 'Recent'}
                        </span>
                        <Button variant="ghost" size="sm" className="h-7 text-[10px]">View Detail</Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-10">No saved AI sessions found.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-primary" />
                Maintenance History
              </CardTitle>
              <CardDescription>Audit of performed preventive and corrective services.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                 {isLogsLoading ? (
                  <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin" /></div>
                ) : logs && logs.length > 0 ? (
                  logs.map((log: any) => (
                    <div key={log.id} className="p-4 rounded-xl border border-border/50 hover:bg-muted/30 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm">Routine Service</h4>
                          <Badge variant="outline" className="text-[10px]">SLA OK</Badge>
                        </div>
                        <span className="text-xs font-bold text-primary">{log.nextServiceDate}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">Performed by: {log.engineerName || 'Staff Engineer'}</p>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">Log Date: {log.serviceDate}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-10">No maintenance logs found.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
