
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
  Database
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

  // Robust Case-Insensitive Role Check
  const roleString = profile?.role?.toString().toLowerCase() || ''
  const isAdmin = roleString === 'admin'
  const isEngineer = roleString === 'biomedical engineer' || roleString === 'technician'

  const equipmentQuery = useMemoFirebase(() => {
    // Only fetch if authenticated as staff and NOT admin (admin gets staff view)
    if (!db || !profile || !isEngineer) return null
    return collection(db, "equipment")
  }, [db, profile, isEngineer])
  
  const { data: equipment, isLoading: isEqLoading } = useCollection(equipmentQuery)

  const faultyEquipment = equipment?.filter(eq => eq.status === 'FAULTY').slice(0, 3)

  if (isUserLoading || isProfileLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-full py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppShell>
    )
  }

  // Handle case where user is logged in but Firestore profile doesn't exist
  if (!profile) {
    return (
      <AppShell>
        <div className="max-w-md mx-auto py-20 text-center space-y-6">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
            <Database className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold">Profile Not Found in Database</h2>
          <p className="text-muted-foreground">
            You are logged in, but your record in the <strong>userProfiles</strong> collection does not exist yet. 
            This happens if you were created manually in Authentication instead of using the app's signup form.
          </p>
          <div className="p-4 bg-muted rounded-lg text-left text-xs font-mono">
            <p>1. Go to Firebase Console {'->'} Firestore</p>
            <p>2. Create collection: <strong>userProfiles</strong></p>
            <p>3. Add document with ID: <strong>{user?.uid}</strong></p>
            <p>4. Add field: <strong>role</strong> (string) = "Admin"</p>
          </div>
          <Button onClick={() => window.location.reload()} variant="outline">Refresh Page after update</Button>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-headline font-bold text-primary">
                Welcome back, {profile?.firstName || user?.email?.split('@')[0]}
              </h1>
              {isAdmin && (
                <Badge variant="default" className="bg-primary hover:bg-primary gap-1 px-2 py-0.5">
                  <ShieldCheck className="w-3 h-3" />
                  System Administrator
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              {currentDate ? `Date: ${currentDate}. ` : ''}
              Protocol BioMedLink-2026 is fully active.
            </p>
          </div>
          {isEngineer && (
            <div className="flex items-center gap-2">
              <Link href="/equipment">
                <Button size="sm" className="shadow-lg shadow-primary/20">
                  <Plus className="w-4 h-4 mr-2" />
                  New Asset
                </Button>
              </Link>
            </div>
          )}
        </div>

        {isAdmin ? (
          <div className="space-y-6">
            <Card className="border-none shadow-sm bg-primary/5 border-l-4 border-l-primary">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div className="space-y-1">
                  <CardTitle className="text-xl flex items-center gap-2 text-primary">
                    <Users className="w-6 h-6" />
                    Administrative Control Center
                  </CardTitle>
                  <CardDescription className="text-base">
                    Authorized hub for personnel registry management and facility security oversight.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex gap-4 pt-4">
                <Link href="/users">
                  <Button size="lg" className="gap-2 px-8 shadow-xl shadow-primary/20">
                    <UserPlus className="w-5 h-5" />
                    Manage Staff Registry
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-none shadow-sm bg-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-accent" />
                    Security Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    All terminal interactions are logged under ISO-2026 security protocols. Use the Staff Registry to provision new accounts.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm bg-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-primary">
                    <ShieldCheck className="w-5 h-5" />
                    Network Integrity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Facility Node Node-01 is currently synchronized. System audit reports can be generated from the staff node.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <>
            <StatsGrid />
            <MaintenanceOverview />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-headline">Urgent Fault Reports</CardTitle>
                  <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
                    {faultyEquipment?.length || 0} Critical
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {isEqLoading ? (
                      <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                    ) : faultyEquipment && faultyEquipment.length > 0 ? (
                      faultyEquipment.map((eq) => (
                        <div key={eq.id} className="flex gap-4 p-4 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors group cursor-pointer">
                          <div className="w-10 h-10 shrink-0 rounded-lg bg-destructive/10 flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-destructive" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">{eq.name}</h4>
                              <span className="text-[10px] text-muted-foreground uppercase font-bold">URGENT</span>
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
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-headline">Recent Technical Activity</CardTitle>
                </CardHeader>
                <CardContent>
                   <div className="relative space-y-6 before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-[2px] before:bg-muted">
                    <div className="relative pl-10">
                      <div className="absolute left-0 top-1 w-9 h-9 rounded-full bg-card border-2 border-primary flex items-center justify-center z-10">
                        <Wrench className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm">
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
