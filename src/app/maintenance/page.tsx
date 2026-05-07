
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
  ChevronRight,
  Filter,
  FileText
} from "lucide-react"
import { equipment as mockEquipment } from "@/lib/mock-data"

export default function MaintenancePage() {
  const overdueCount = mockEquipment.filter(e => new Date(e.nextServiceDate) < new Date()).length
  const upcomingCount = mockEquipment.filter(e => {
    const next = new Date(e.nextServiceDate)
    const now = new Date()
    return next > now && next < new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  }).length

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
                <h3 className="text-3xl font-headline font-bold text-green-700">14</h3>
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
               <div className="flex gap-2">
                 <Badge variant="secondary" className="cursor-pointer">All</Badge>
                 <Badge variant="outline" className="cursor-pointer">High Priority</Badge>
                 <Badge variant="outline" className="cursor-pointer">Overdue</Badge>
               </div>
             </div>
             
             {mockEquipment.map((eq) => (
               <Card key={eq.id} className="border-none shadow-sm hover:shadow-md transition-shadow group overflow-hidden">
                 <CardContent className="p-0 flex flex-col md:flex-row items-stretch">
                   <div className="w-full md:w-48 bg-muted/30 flex flex-col items-center justify-center p-4">
                     <div className="text-xs font-bold uppercase text-muted-foreground mb-1">Next Service</div>
                     <div className="text-xl font-headline font-bold">{new Date(eq.nextServiceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                     <div className="text-[10px] text-muted-foreground mt-1">Est. 2 hours work</div>
                   </div>
                   <div className="flex-1 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                     <div>
                       <div className="flex items-center gap-2 mb-1">
                         <h4 className="font-bold text-lg group-hover:text-primary transition-colors">{eq.name}</h4>
                         <Badge variant={new Date(eq.nextServiceDate) < new Date() ? 'destructive' : 'secondary'} className="text-[10px]">
                           {new Date(eq.nextServiceDate) < new Date() ? 'Overdue' : 'Scheduled'}
                         </Badge>
                       </div>
                       <p className="text-sm text-muted-foreground">{eq.manufacturer} • Serial: {eq.serialNumber}</p>
                       <div className="flex items-center gap-4 mt-3">
                         <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                           <Wrench className="w-3 h-3" />
                           Standard PM Kit #42
                         </div>
                         <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                           <FileText className="w-3 h-3" />
                           Checklist: Bio-Safety
                         </div>
                       </div>
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
             ))}
          </div>

          <div className="space-y-6">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Service Reminders</CardTitle>
                <CardDescription>Automated system notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { msg: 'MRI Calibration due in 48 hours', type: 'urgent' },
                  { msg: 'Order PM Kit for CT System', type: 'info' },
                  { msg: 'Ventilator battery check overdue', type: 'urgent' },
                ].map((rem, i) => (
                  <div key={i} className={`p-4 rounded-xl border-l-4 ${rem.type === 'urgent' ? 'border-l-destructive bg-destructive/5' : 'border-l-primary bg-primary/5'}`}>
                    <p className="text-xs font-semibold">{rem.msg}</p>
                    <button className="text-[10px] uppercase font-bold text-muted-foreground mt-2 hover:text-primary">Dismiss</button>
                  </div>
                ))}
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
      </div>
    </AppShell>
  )
}
