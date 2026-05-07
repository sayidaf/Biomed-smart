
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Building2, 
  Stethoscope, 
  Wrench, 
  AlertTriangle, 
  History, 
  Search, 
  FileText,
  Settings,
  BrainCircuit
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Departments', href: '/departments', icon: Building2 },
  { name: 'Equipment', href: '/equipment', icon: Stethoscope },
  { name: 'AI Troubleshoot', href: '/troubleshoot', icon: BrainCircuit },
  { name: 'Maintenance', href: '/maintenance', icon: Wrench },
  { name: 'Faults', href: '/faults', icon: AlertTriangle },
  { name: 'History', href: '/history', icon: History },
  { name: 'Reports', href: '/reports', icon: FileText },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1 px-2 py-4">
      {navItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
              isActive 
                ? "bg-primary text-primary-foreground" 
                : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
            )}
          >
            <item.icon className="w-4 h-4" />
            <span>{item.name}</span>
          </Link>
        )
      })}
      <div className="mt-auto pt-4 border-t border-border">
         <Link
            href="/settings"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
            )}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </Link>
      </div>
    </nav>
  )
}
