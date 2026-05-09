
"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar,
  ChevronRight,
  Loader2,
  CheckCircle2,
  Monitor
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from "@/firebase"
import { collection, doc, query, orderBy, limit } from "firebase/firestore"
import Link from "next/link"
import { format, isAfter, parseISO, startOfDay } from "date-fns"

export function MaintenanceOverview() {
  const db = useFirestore()
  const { user: currentUser } = useUser()
  
  // Auth/Profile Context
  const profileRef = useMemoFirebase(() => {
    if (!db || !currentUser) return null
    return doc(db, "userProfiles", currentUser.uid)
  }, [db, currentUser])
  const { data: profile } = useDoc(profileRef)

  const roleString = profile?.role?.toString().toLowerCase() || ''
  const isStaff = roleString === 'admin' || roleString === 'biomedical engineer' || roleString === 'technician'

  // Data Fetching
  const eqQuery = useMemoFirebase(() => {
    if (!db || !isStaff) return null
    return collection(db, "equipment")
  }, [db, isStaff])
  const { data: equipment, isLoading: isEqLoading } = useCollection(eqQuery)

  const deptsQuery = useMemoFirebase(() => {
    if (!db || !isStaff) return null
    return collection(db, "departments")
  }, [db, isStaff])
  const { data: departments } = useCollection(deptsQuery)

  // Memoized Schedules
  const upcomingSchedules = useMemo(() => {
    if (!equipment) return []
    
    const today = startOfDay(new Date())
    
    return equipment
      .filter(eq => eq.nextServiceDate)
      .filter(eq => {
        try {
          const serviceDate = parseISO(eq.nextServiceDate)
          return isAfter(serviceDate, today) || eq.nextServiceDate === format(today, 'yyyy-MM-dd')
        } catch (e) {
          return false
        }
      })
      .sort((a, b) => a.nextServiceDate.localeCompare(b.nextServiceDate))
      .slice(0, 4)
  }, [equipment])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-headline">Service Cycle Distribution</CardTitle>
          <Link href="/maintenance">
            <Button variant="ghost" size="sm">Manage Terminal</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-end justify-between gap-4 pt-10 px-4">
            {[65, 40, 85, 30, 45, 90, 55].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                <div 
                  className="w-full bg-primary/20 hover:bg-primary transition-colors rounded-t-lg relative"
                  style={{ height: `${h}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-primary-foreground text-[10px] px-2 py-1 rounded">
                    {Math.round(h / 10)} active
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground font-medium uppercase">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-headline">Upcoming Schedules</CardTitle>
        </CardHeader>
        <CardContent className="px-2 flex-1">
          <div className="space-y-1">
            {isEqLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Accessing Registry</p>
              </div>
            ) : upcomingSchedules.length > 0 ? (
              upcomingSchedules.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                      <Monitor className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold group-hover:text-primary transition-colors truncate">{item.name}</h4>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {departments?.find(d => d.id === item.departmentId)?.name || 'Unknown Sector'} • {item.nextServiceDate}
                      </p>
                    </div>
                  </div>
                  <Badge variant={item.status === 'FAULTY' ? 'destructive' : 'secondary'} className="text-[9px] shrink-0">
                    {item.status === 'FAULTY' ? 'URGENT' : 'PLANNED'}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-500 opacity-50" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-muted-foreground">Registry Synchronized</h4>
                  <p className="text-[10px] text-muted-foreground px-4">No imminent maintenance protocols required.</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <div className="p-4 pt-0">
          <Link href="/equipment">
            <Button variant="outline" className="w-full text-xs h-9">
              View All Assets
              <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
