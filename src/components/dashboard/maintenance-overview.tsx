
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar,
  ChevronRight,
  MoreVertical
} from "lucide-react"
import { Button } from "@/components/ui/button"

const upcomingSchedules = [
  { id: '1', equipment: 'MRI Scanner', date: 'May 28', status: 'Priority', department: 'Radiology' },
  { id: '2', equipment: 'CT System', date: 'May 30', status: 'Scheduled', department: 'Radiology' },
  { id: '3', equipment: 'Ventilator PB980', date: 'Jun 02', status: 'Scheduled', department: 'ICU' },
  { id: '4', equipment: 'Infusion Pump', date: 'Jun 05', status: 'Routine', department: 'Maternity' },
]

export function MaintenanceOverview() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-headline">Maintenance Distribution</CardTitle>
          <Button variant="ghost" size="sm">View Calendar</Button>
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
                    {h} units
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

      <Card className="border-none shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-headline">Upcoming Schedules</CardTitle>
        </CardHeader>
        <CardContent className="px-2">
          <div className="space-y-1">
            {upcomingSchedules.map((item) => (
              <div 
                key={item.id} 
                className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold group-hover:text-primary transition-colors">{item.equipment}</h4>
                    <p className="text-xs text-muted-foreground">{item.department} • {item.date}</p>
                  </div>
                </div>
                <Badge variant={item.status === 'Priority' ? 'destructive' : 'secondary'} className="text-[10px]">
                  {item.status}
                </Badge>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4 text-xs h-9">
            View All Schedules
            <ChevronRight className="ml-2 w-4 h-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
