
"use client"

import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Building2, 
  Plus, 
  ArrowUpRight, 
  Stethoscope, 
  MoreVertical,
  ChevronRight
} from "lucide-react"
import { departments } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"

export default function DepartmentsPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold text-primary">Hospital Departments</h1>
            <p className="text-muted-foreground mt-1">Organize and manage equipment inventory by facility location.</p>
          </div>
          <Button size="sm" className="shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4 mr-2" />
            Add Department
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <Card key={dept.id} className="border-none shadow-sm hover:shadow-md transition-all group overflow-hidden">
              <div className="h-2 bg-primary/20 group-hover:bg-primary transition-colors" />
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-headline">{dept.name}</CardTitle>
                    <Badge variant="outline" className="mt-1 font-mono text-[10px] uppercase tracking-wider">{dept.code}</Badge>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-6 line-clamp-2 min-h-[40px]">
                  {dept.description}
                </p>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-accent" />
                    <span className="text-sm font-bold">{dept.equipmentCount} Assets</span>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 group-hover:text-primary">
                    Inventory
                    <ChevronRight className="ml-1 w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          <Card className="border-2 border-dashed border-border bg-transparent shadow-none hover:bg-muted/10 transition-colors flex items-center justify-center p-8 cursor-pointer group">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/10 transition-colors">
                <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="font-headline font-bold text-muted-foreground group-hover:text-primary transition-colors">Create New Department</h3>
              <p className="text-xs text-muted-foreground mt-1">Define a new hospital sector or unit</p>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
