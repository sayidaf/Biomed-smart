
"use client"

import { useState, useEffect } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { StatsGrid } from "@/components/dashboard/stats-grid"
import { MaintenanceOverview } from "@/components/dashboard/maintenance-overview"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Plus,
  Wrench,
  AlertCircle,
  Loader2,
  Users,
  ShieldCheck,
  UserPlus,
  UserCheck,
  Database,
  TrendingUp,
  Award
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase"
import { useRouter } from "next/navigation"
import { collection, doc } from "firebase/firestore"
import Link from "next/link"

export default function DashboardPage() {
  const { user, isUserLoading } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState<string | null>(null)

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/")
    }
  }, [user, isUserLoading, router])

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }))
  }, [])

  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return doc(db, "userProfiles", user.uid)
  }, [db, user])
  
  const { data: profile, isLoading: isProfileLoading } = useDoc(profileRef)

  const roleString = profile?.role?.toString().toLowerCase() || ''
  const isAdmin = roleString === 'admin'
  const isEngineer = roleString === 'biomedical engineer' || roleString === 'technician'

  const allUsersQuery = useMemoFirebase(() => {
    if (!db || !isAdmin) return null
    return collection(db, "userProfiles")
  }, [db, isAdmin])
  const { data: allUsers, isLoading: isAllUsersLoading } = useCollection(allUsersQuery)

  const equipmentQuery = useMemoFirebase(() => {
    if (!db || !profile || !isEngineer) return null
    return collection(db, "equipment")
  }, [db, profile, isEngineer])
  
  const { data: equipment, isLoading: isEqLoading } = useCollection(equipmentQuery)

  const faultyEquipment = equipment?.filter(eq => eq.status === 'FAULTY').slice(0, 3)
  const engineerCount = allUsers?.filter(u => u.role === 'Biomedical Engineer').length || 0

  if (isUserLoading || isProfileLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppShell>
    )
  }

  if (!profile) {
    return (
      <AppShell>
        <div className="max-w-md mx-auto py-12 text-center space-y-6 px-4">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
            <Database className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold">Profile Not Found</h2>
          <p className="text-muted-foreground">
            Your profile record does not exist in the <strong>userProfiles</strong> collection. 
          </p>
          <div className="p-4 bg-muted rounded-lg text-left text-xs font-mono break-words">
            <p>1. Go to Firebase Console &gt; Firestore</p>
            <p>2. Create collection: <strong>userProfiles</strong></p>
            <p>3. Add document with ID: <strong>{user?.uid}</strong></p>
            <p>4. Add field: <strong>role</strong> (string) = "Admin"</p>
          </div>
          <Button onClick={() => window.location.reload()} variant="outline" className="w-full">Refresh Page</Button>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="space-y-6 md:space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl md:text-3xl font-headline font-bold text-primary">
                Welcome, {profile?.firstName || user?.email?.split('@')[0]}
              </h1>
              {isAdmin && (
                <Badge variant="default" className="bg-primary hover:bg-primary gap-1 px-2 py-0.5 text-[10px]">
                  <ShieldCheck className="w-3 h-3" />
                  System Administrator
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {currentDate ? `Protocol Active: ${currentDate}. ` : ''}
              System status: Secure.
            </p>
          </div>
          {isEngineer && (
            <div className="flex items-center gap-2">
              <Link href="/equipment" className="w-full sm:w-auto">
                <Button size="sm" className="w-full shadow-lg shadow-primary/20">
                  <Plus className="w-4 h-4 mr-2" />
                  New Asset
                </Button>
              </Link>
            </div>
          )}
        </div>

        {isAdmin ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <Card className="border-none shadow-sm bg-primary/5 border-l-4 border-l-primary">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Users className="w-8 h-8 text-primary" />
                    <Badge variant="secondary" className="bg-primary/10 text-primary text-[10px]">Active Registry</Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Engineers</p>
                    <h3 className="text-3xl md:text-4xl font-headline font-bold mt-1">
                      {isAllUsersLoading ? <Loader2 className="w-6 h-6 animate-spin inline" /> : engineerCount}
                    </h3>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-accent/5 border-l-4 border-l-accent">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <TrendingUp className="w-8 h-8 text-accent" />
                    <Badge variant="secondary" className="bg-accent/10 text-accent text-[10px]">Efficiency</Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">System Performance</p>
                    <h3 className="text-3xl md:text-4xl font-headline font-bold mt-1">94%</h3>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-orange-50 border-l-4 border-l-orange-500 sm:col-span-2 lg:col-span-1">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Award className="w-8 h-8 text-orange-500" />
                    <Badge variant="secondary" className="bg-orange-100 text-orange-600 text-[10px]">Compliance</Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">SLA Status</p>
                    <h3 className="text-3xl md:text-4xl font-headline font-bold mt-1 text-orange-600">Stable</h3>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="bg-card px-4 py-6 md:px-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <UserCheck className="w-6 h-6 text-primary" />
                      Personnel Control
                    </CardTitle>
                    <CardDescription>Monitor engineer activity and system access.</CardDescription>
                  </div>
                  <Link href="/users">
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">Staff Registry</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-8 text-center bg-muted/20">
                   <p className="text-muted-foreground text-sm max-w-lg mx-auto">
                     Performance metrics for individual engineers are aggregated from troubleshooting logs and maintenance resolution times.
                   </p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            <StatsGrid />
            <MaintenanceOverview />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between px-4 md:px-6">
                  <CardTitle className="text-lg font-headline">Urgent Fault Reports</CardTitle>
                  <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 text-[10px]">
                    {faultyEquipment?.length || 0} Critical
                  </Badge>
                </CardHeader>
                <CardContent className="px-4 md:px-6">
                  <div className="space-y-4">
                    {isEqLoading ? (
                      <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                    ) : faultyEquipment && faultyEquipment.length > 0 ? (
                      faultyEquipment.map((eq) => (
                        <div key={eq.id} className="flex gap-4 p-3 md:p-4 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors group cursor-pointer">
                          <div className="w-10 h-10 shrink-0 rounded-lg bg-destructive/10 flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-destructive" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1 gap-2">
                              <h4 className="font-semibold text-sm group-hover:text-primary transition-colors truncate">{eq.name}</h4>
                              <span className="text-[10px] text-muted-foreground uppercase font-bold shrink-0">URGENT</span>
                            </div>
                            <Badge variant="secondary" className="text-[10px] font-mono">{eq.serialNumber}</Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <ShieldCheck className="w-8 h-8 text-green-500 mb-2 opacity-50" />
                        <p className="text-sm text-muted-foreground">Systems operational. No critical faults detected.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardHeader className="px-4 md:px-6">
                  <CardTitle className="text-lg font-headline">Recent Technical Activity</CardTitle>
                </CardHeader>
                <CardContent className="px-4 md:px-6">
                   <div className="relative space-y-6 before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-[2px] before:bg-muted">
                    <div className="relative pl-10">
                      <div className="absolute left-0 top-1 w-9 h-9 rounded-full bg-card border-2 border-primary flex items-center justify-center z-10">
                        <Wrench className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm leading-relaxed">
                          <span className="font-bold text-primary">System</span>{' '}
                          <span className="text-muted-foreground">Authenticated via terminal for</span>{' '}
                          <span className="font-semibold">{profile?.role || 'Staff'}</span>
                        </p>
                        <span className="text-[10px] text-muted-foreground uppercase font-medium">LIVE</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </AppShell>
  )
}
