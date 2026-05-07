
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
  Monitor
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from "@/firebase"
import { collection, doc } from "firebase/firestore"

export default function FaultsPage() {
  const db = useFirestore()
  const { user } = useUser()

  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return doc(db, "userProfiles", user.uid)
  }, [db, user])
  const { data: profile } = useDoc(profileRef)

  const equipmentQuery = useMemoFirebase(() => {
    if (!db || !profile) return null
    return collection(db, "equipment")
  }, [db, profile])
  const { data: equipment, isLoading } = useCollection(equipmentQuery)

  const faultyEquipment = equipment?.filter(e => e.status === 'FAULTY') || []

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold text-primary flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-destructive" />
              Fault Reports
            </h1>
            <p className="text-muted-foreground mt-1">Monitor and respond to critical hardware failures and technical issues.</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Active Only
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-none shadow-sm bg-destructive/10">
            <CardContent className="p-4">
              <p className="text-xs font-bold text-destructive uppercase tracking-widest mb-1">Active Faults</p>
              <h3 className="text-2xl font-bold text-destructive">{faultyEquipment.length}</h3>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-muted/50">
            <CardContent className="p-4">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Pending Review</p>
              <h3 className="text-2xl font-bold">0</h3>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
        ) : (
          <div className="space-y-4">
            {faultyEquipment.length > 0 ? (
              faultyEquipment.map((eq) => (
                <Card key={eq.id} className="border-none shadow-sm hover:shadow-md transition-shadow group">
                  <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center shrink-0">
                      <Monitor className="w-8 h-8 text-destructive" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-lg font-bold group-hover:text-primary transition-colors">{eq.name}</h4>
                        <Badge variant="destructive">CRITICAL</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">SN: {eq.serialNumber} • Reported in Radiologu</p>
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5" />
                          Last Update: Just now
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                      <Button variant="secondary" className="flex-1 md:flex-none">Analyze AI</Button>
                      <Button className="flex-1 md:flex-none gap-2">
                        <Wrench className="w-4 h-4" />
                        Assign Engineer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-2xl border border-dashed">
                <AlertCircle className="w-12 h-12 text-muted-foreground opacity-20 mb-4" />
                <h3 className="text-lg font-bold text-muted-foreground">All Systems Clear</h3>
                <p className="text-sm text-muted-foreground">No critical equipment faults reported.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  )
}
