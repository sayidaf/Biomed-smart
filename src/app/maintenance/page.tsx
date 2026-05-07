
"use client"

import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  Clock, 
  Wrench, 
  AlertTriangle, 
  CheckCircle2,
  Filter,
  FileText,
  Loader2
} from "lucide-react"
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from "@/firebase"
import { collection, doc } from "firebase/firestore"

export default function MaintenancePage() {
  const db = useFirestore()
  const { user: currentUser } = useUser()

  // Get user profile first to ensure staff access
  const profileRef = useMemoFirebase(() => {
    if (!db || !currentUser) return null
    return doc(db, "userProfiles", currentUser.uid)
  }, [db, currentUser])
  const { data: profile } = useDoc(profileRef)

  // Real-time Equipment
  const equipmentQuery = useMemoFirebase(() => {
    if (!db || !profile) return null
    const staffRoles = ['Admin', 'Biomedical Engineer', 'Technician'];
    if (!staffRoles.includes(profile.role)) return null;
    return collection(db, "equipment")
  }, [db, profile])
  
  const { data: equipment, isLoading } = useCollection(equipmentQuery)

  const now = new Date()
  const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  const overdueCount = equipment?.filter(e => e.nextServiceDate && new Date(e.nextServiceDate) < now).length || 0
  const upcomingCount = equipment?.filter(e => {
    if (!e.nextServiceDate) return false
    const next = new Date(e.nextServiceDate)
    return next > now && next < thirtyDaysLater
  }).length || 0

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold text-primary">Preventive Maintenance</h1>
            <p className="text-muted-foreground mt-1">Schedule and monitor routine service activities to ensure zero downtime.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button size="sm" className="shadow-lg shadow-primary/20">
              <Calendar className="w-4 h-4 mr-2" />
              Service Calendar
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
        ) : (
          <>
            {/* Maintenance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-none shadow-sm bg-destructive/10">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-destructive uppercase tracking-wider mb-1">Overdue Service</p>
                    <h3 className="text-3xl font-headline font-bold text-destructive">{overdueCount}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-destructive" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-none shadow-sm bg-orange-100/50">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-orange-600 uppercase tracking-wider mb-1">Due (30 Days)</p>
                    <h3 className="text-3xl font-headline font-bold text-orange-600">{upcomingCount}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-orange-200 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-green-100/50">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-green-700 uppercase tracking-wider mb-1">Completed (MTD)</p>
                    <h3 className="text-3xl font-headline font-bold text-green-700">0</h3>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-green-200 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                 <div className="flex items-center justify-between mb-4">
                   <h2 className="text-xl font-headline font-bold">Maintenance Queue</h2>
                 </div>
                 
                 {equipment && equipment.length > 0 ? (
                   equipment.map((eq) => {
                     const isOverdue = eq.nextServiceDate && new Date(eq.nextServiceDate) < now
                     return (
                       <Card key={eq.id} className="border-none shadow-sm hover:shadow-md transition-shadow group overflow-hidden">
                         <CardContent className="p-0 flex flex-col md:flex-row items-stretch">
                           <div className="w-full md:w-48 bg-muted/30 flex flex-col items-center justify-center p-4">
                             <div className="text-xs font-bold uppercase text-muted-foreground mb-1">Next Service</div>
                             <div className="text-xl font-headline font-bold">
                               {eq.nextServiceDate ? new Date(eq.nextServiceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                             </div>
                           </div>
                           <div className="flex-1 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                             <div>
                               <div className="flex items-center gap-2 mb-1">
                                 <h4 className="font-bold text-lg group-hover:text-primary transition-colors">{eq.name}</h4>
                                 <Badge variant={isOverdue ? 'destructive' : 'secondary'} className="text-[10px]">
                                   {isOverdue ? 'Overdue' : 'Scheduled'}
                                 </Badge>
                               </div>
                               <p className="text-sm text-muted-foreground">{eq.manufacturer} • Serial: {eq.serialNumber}</p>
                             </div>
                             <div className="flex flex-col sm:flex-row gap-2">
                               <Button variant="outline" size="sm">Reschedule</Button>
                               <Button size="sm" className="gap-2">
                                 <Wrench className="w-4 h-4" />
                                 Start Service
                               </Button>
                             </div>
                           </div>
                         </CardContent>
                       </Card>
                     )
                   })
                 ) : (
                   <p className="text-muted-foreground text-center py-10">No equipment in maintenance queue.</p>
                 )}
              </div>

              <div className="space-y-6">
                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Service Reminders</CardTitle>
                    <CardDescription>Automated system notifications</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-xs text-muted-foreground">No active reminders.</p>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-primary text-primary-foreground">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-headline font-bold">Generate Reports</h3>
                    </div>
                    <p className="text-sm opacity-90 mb-6">Create PDF maintenance compliance reports for hospital administration and audit.</p>
                    <Button variant="secondary" className="w-full font-bold">
                      Download Monthly Report
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  )
}
