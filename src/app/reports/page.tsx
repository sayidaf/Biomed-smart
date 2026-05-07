
"use client"

import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  FileText, 
  Download, 
  Plus, 
  TrendingUp, 
  PieChart, 
  BarChart3,
  Search
} from "lucide-react"

export default function ReportsPage() {
  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold text-primary flex items-center gap-3">
              <FileText className="w-8 h-8" />
              Compliance Reports
            </h1>
            <p className="text-muted-foreground mt-1">Generate ISO-certified hardware audit and maintenance compliance documents.</p>
          </div>
          <Button className="shadow-lg shadow-primary/20 gap-2">
            <Plus className="w-4 h-4" />
            Generate New Report
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-none shadow-sm hover:border-primary/20 border-2 transition-all cursor-pointer">
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <PieChart className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-lg">Inventory Audit</CardTitle>
              <CardDescription>Full asset listing by department and status.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" className="w-full gap-2">
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm hover:border-primary/20 border-2 transition-all cursor-pointer">
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center mb-2">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <CardTitle className="text-lg">Downtime Analysis</CardTitle>
              <CardDescription>Impact of equipment failures on hospital operations.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" className="w-full gap-2">
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm hover:border-primary/20 border-2 transition-all cursor-pointer">
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-2">
                <BarChart3 className="w-5 h-5 text-accent" />
              </div>
              <CardTitle className="text-lg">Maintenance ROI</CardTitle>
              <CardDescription>Cost analysis of preventive vs corrective service.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" className="w-full gap-2">
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Recent Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Monthly Maintenance Compliance - April 2026', date: 'May 01, 2026', size: '2.4 MB' },
                { name: 'Radiology Equipment Safety Audit', date: 'April 15, 2026', size: '1.1 MB' },
                { name: 'Quarterly Bio-Med Inventory Report', date: 'April 02, 2026', size: '5.8 MB' },
              ].map((doc, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <h4 className="font-semibold text-sm">{doc.name}</h4>
                      <p className="text-xs text-muted-foreground">{doc.date} • {doc.size}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
