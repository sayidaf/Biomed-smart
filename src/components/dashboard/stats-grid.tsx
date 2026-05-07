
"use client"

import { 
  Stethoscope, 
  Wrench, 
  AlertTriangle, 
  Activity,
  TrendingUp,
  Loader2
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from "@/firebase"
import { collection, doc } from "firebase/firestore"

export function StatsGrid() {
  const db = useFirestore()
  const { user: currentUser } = useUser()
  
  // Get user profile first to ensure staff access
  const profileRef = useMemoFirebase(() => {
    if (!db || !currentUser) return null
    return doc(db, "userProfiles", currentUser.uid)
  }, [db, currentUser])
  const { data: profile } = useDoc(profileRef)

  // Only query equipment if user is recognized as staff
  const eqQuery = useMemoFirebase(() => {
    if (!db || !profile) return null
    const staffRoles = ['Admin', 'Biomedical Engineer', 'Technician'];
    if (!staffRoles.includes(profile.role)) return null;
    return collection(db, "equipment")
  }, [db, profile])
  
  const { data: equipment, isLoading } = useCollection(eqQuery)

  const stats = [
    { 
      label: 'Total Equipment', 
      value: equipment?.length || 0, 
      trend: '+0%', 
      icon: Stethoscope, 
      color: 'text-primary' 
    },
    { 
      label: 'Faulty Units', 
      value: equipment?.filter(e => e.status === 'FAULTY').length || 0, 
      trend: 'Live', 
      icon: AlertTriangle, 
      color: 'text-destructive' 
    },
    { 
      label: 'Scheduled Service', 
      value: equipment?.filter(e => e.status === 'MAINTENANCE').length || 0, 
      trend: 'Queue', 
      icon: Wrench, 
      color: 'text-orange-500' 
    },
    { 
      label: 'Operational Rate', 
      value: equipment?.length ? `${Math.round((equipment.filter(e => e.status === 'OPERATIONAL').length / equipment.length) * 100)}%` : '0%', 
      trend: 'Avg', 
      icon: Activity, 
      color: 'text-green-500' 
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="overflow-hidden border-none shadow-sm bg-card hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={stat.color}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-green-500 bg-green-50 px-2 py-0.5 rounded-full">
                <TrendingUp className="w-3 h-3" />
                {stat.trend}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1 font-medium">{stat.label}</p>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              ) : (
                <h3 className="text-2xl font-headline font-bold">{stat.value}</h3>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
