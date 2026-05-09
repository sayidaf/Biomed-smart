
"use client"

import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  AlertCircle, 
  Search, 
  Filter, 
  Wrench,
  Loader2,
  Calendar,
  Monitor,
  Building2,
  BrainCircuit,
  ArrowRight
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from "@/firebase"
import { collection, doc } from "firebase/firestore"
import Link from "next/link"

export default function FaultsPage() {
  const db = useFirestore()
  const { user } = useUser()

  // Security: Memoize references to prevent unnecessary re-fetches
  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return doc(db, "userProfiles", user.uid)
  }, [db, user])
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

  // Logic: Filter equipment for "FAULTY" status only
  const faultyEquipment = equipment?.filter(e => e.status === 'FAULTY') || []

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold text-primary flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-destructive" />
              Critical Fault Registry
            </h1>
            <p className="text-muted-foreground mt-1">Real-time terminal monitoring clinical hardware failures across the network.</p>
          </div>
          <div className="flex gap-2">
             <Link href="/equipment">
               <Button variant="outline" size="sm" className="gap-2">
                <Monitor className="w-4 h-4" />
                Inventory Monitor
              </Button>
             </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-none shadow-sm bg-destructive/10 border-l-4 border-l-destructive">
            <CardContent className="p-4">
              <p className="text-[10px] font-bold text-destructive uppercase tracking-widest mb-1">Active Failures</p>
              <h3 className="text-3xl font-bold text-destructive">{faultyEquipment.length}</h3>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-muted/50">
            <CardContent className="p-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Pending Resolution</p>
              <h3 className="text-3xl font-bold">{faultyEquipment.length > 0 ? 'Protocol Pending' : 'None'}</h3>
            </CardContent>
          </Card>
        </div>

        {isEqLoading ? (
          <div className="flex flex-col items-center justify-center p-20 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Scanning Registry...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {faultyEquipment.length > 0 ? (
              faultyEquipment.map((eq) => {
                const deptName = departments?.find(d => d.id === eq.departmentId)?.name || 'Unknown Sector'
                return (
                  <Card key={eq.id} className="border-none shadow-sm hover:shadow-md transition-all group overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row items-stretch">
                        <div className="w-full md:w-2 bg-destructive shrink-0" />
                        <div className="flex-1 p-6 flex flex-col md:flex-row items-center gap-6">
                          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center shrink-0">
                            <Monitor className="w-8 h-8 text-destructive" />
                          </div>
                          <div className="flex-1 min-w-0 text-center md:text-left">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-1">
                              <h4 className="text-xl font-bold group-hover:text-primary transition-colors truncate">{eq.name}</h4>
                              <Badge variant="destructive" className="animate-pulse">CRITICAL FAILURE</Badge>
                            </div>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1.5">
                                <Building2 className="w-4 h-4" />
                                Sector: {deptName}
                              </span>
                              <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded border border-border">
                                SN: {eq.serialNumber}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                            <Link href="/troubleshoot" className="flex-1 md:flex-none">
                              <Button variant="secondary" className="w-full gap-2 font-bold">
                                <BrainCircuit className="w-4 h-4 text-accent" />
                                AI Diagnosis
                              </Button>
                            </Link>
                            <Link href="/maintenance" className="flex-1 md:flex-none">
                              <Button className="w-full gap-2 font-bold shadow-lg shadow-primary/20">
                                <Wrench className="w-4 h-4" />
                                Log Repair
                                <ArrowRight className="w-4 h-4" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-2xl border border-dashed border-border/50">
                <div className="w-20 h-20 rounded-full bg-background flex items-center justify-center mb-6 shadow-inner">
                  <Monitor className="w-10 h-10 text-muted-foreground opacity-20" />
                </div>
                <h3 className="text-xl font-bold text-muted-foreground">All Systems Operational</h3>
                <p className="text-sm text-muted-foreground max-w-sm text-center mt-2 leading-relaxed">
                  No critical equipment faults reported in the registry. The hospital infrastructure is currently operating at 100% capacity.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  )
}
