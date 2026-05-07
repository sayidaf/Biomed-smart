
"use client"

import { useState, useEffect } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { StatsGrid } from "@/components/dashboard/stats-grid"
import { MaintenanceOverview } from "@/components/dashboard/maintenance-overview"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowUpRight,
  Plus,
  Filter,
  MoreHorizontal,
  Wrench,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUser } from "@/firebase"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const { user, isUserLoading } = useUser()
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState<string | null>(null)

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/")
    }
  }, [user, isUserLoading, router])

  useEffect(() => {
    // Avoid hydration errors by setting date only on the client
    setCurrentDate(new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }))
  }, [])

  if (isUserLoading) return null

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold text-primary mb-1">Welcome back, {user?.displayName || 'Engineer'}</h1>
            <p className="text-muted-foreground">
              {currentDate ? `Today is ${currentDate}. ` : ''}
              Here's what's happening in your facility today.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button size="sm" className="shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" />
              New Report
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <StatsGrid />

        {/* Charts & Lists */}
        <MaintenanceOverview />

        {/* Recent Activities & Urgent Faults */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-headline">Recent Fault Reports</CardTitle>
              <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">5 New Today</Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { id: '1', eq: 'Patient Monitor PM-20', time: '10 mins ago', desc: 'Screen display flickering', code: 'DISP-FAIL' },
                  { id: '2', eq: 'Ventilator Servo-u', time: '1 hour ago', desc: 'Battery backup error', code: 'PWR-BATT' },
                  { id: '3', eq: 'Infusion Pump Volumat', time: '3 hours ago', desc: 'Occlusion alarm persisting', code: 'ALM-OCC' },
                ].map((fault) => (
                  <div key={fault.id} className="flex gap-4 p-4 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors group cursor-pointer">
                    <div className="w-10 h-10 shrink-0 rounded-lg bg-destructive/10 flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-destructive" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">{fault.eq}</h4>
                        <span className="text-[10px] text-muted-foreground uppercase">{fault.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{fault.desc}</p>
                      <Badge variant="secondary" className="text-[10px] font-mono">{fault.code}</Badge>
                    </div>
                    <Button variant="ghost" size="icon" className="shrink-0 self-center">
                      <ArrowUpRight className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-headline">Service Log Activity</CardTitle>
              <Button variant="ghost" size="sm">History</Button>
            </CardHeader>
            <CardContent>
               <div className="relative space-y-6 before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-[2px] before:bg-muted">
                {[
                  { id: '1', user: 'Eng. Sarah K.', action: 'Completed maintenance on', item: 'MRI Scanner', date: '08:45 AM' },
                  { id: '2', user: 'Tech. Mike R.', action: 'Replaced sensor on', item: 'Ultrasonics Pro', date: '09:30 AM' },
                  { id: '3', user: 'AI Assistant', action: 'Generated diagnostic for', item: 'Ventilator PB980', date: '11:15 AM' },
                  { id: '4', user: 'Admin', action: 'Added new equipment to', item: 'Radiology Dept', date: '12:00 PM' },
                ].map((log) => (
                  <div key={log.id} className="relative pl-10">
                    <div className="absolute left-0 top-1 w-9 h-9 rounded-full bg-card border-2 border-primary flex items-center justify-center z-10">
                      <Wrench className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm">
                        <span className="font-bold text-primary">{log.user}</span>{' '}
                        <span className="text-muted-foreground">{log.action}</span>{' '}
                        <span className="font-semibold">{log.item}</span>
                      </p>
                      <span className="text-[10px] text-muted-foreground uppercase font-medium">{log.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
