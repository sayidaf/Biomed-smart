
"use client"

import { SidebarNav } from "./sidebar-nav"
import { 
  Bell, 
  User, 
  Search, 
  Menu,
  ShieldCheck,
  Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-background text-foreground font-body">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card">
        <div className="p-6 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-headline font-bold text-primary">BioMedLink</span>
        </div>
        <SidebarNav />
        <div className="mt-auto p-4 m-4 rounded-xl bg-secondary/50 border border-secondary">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-accent" />
            <span className="text-xs font-bold uppercase tracking-wider text-secondary-foreground">System Status</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-muted-foreground">All systems operational</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 md:px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4 flex-1">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <div className="p-6 flex items-center gap-2 border-b">
                   <ShieldCheck className="w-6 h-6 text-primary" />
                   <span className="text-xl font-headline font-bold text-primary">BioMedLink</span>
                </div>
                <SidebarNav />
              </SheetContent>
            </Sheet>
            
            <div className="relative w-full max-w-md hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search equipment by serial #..." 
                className="pl-9 h-9 bg-muted/30 border-none focus-visible:ring-1"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-destructive text-[10px]">
                3
              </Badge>
            </Button>
            <div className="flex items-center gap-3 pl-2 border-l border-border ml-2">
              <div className="hidden lg:flex flex-col items-end">
                <span className="text-sm font-semibold">Eng. James Wilson</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Sr. Biomedical Engineer</span>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full bg-secondary">
                <User className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  )
}
