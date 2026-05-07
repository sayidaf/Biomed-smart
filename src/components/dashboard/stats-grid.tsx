
"use client"

import { 
  Stethoscope, 
  Wrench, 
  AlertTriangle, 
  Clock,
  TrendingUp,
  Activity
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const stats = [
  { label: 'Total Equipment', value: '1,284', trend: '+12%', icon: Stethoscope, color: 'text-primary' },
  { label: 'Pending Service', value: '24', trend: '-2', icon: Wrench, color: 'text-orange-500' },
  { label: 'Active Faults', value: '8', trend: '+1', icon: AlertTriangle, color: 'text-destructive' },
  { label: 'Up-time', value: '98.4%', trend: '+0.4%', icon: Activity, color: 'text-green-500' },
]

export function StatsGrid() {
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
              <h3 className="text-2xl font-headline font-bold">{stat.value}</h3>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
