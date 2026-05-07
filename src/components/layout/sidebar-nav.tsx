
"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { 
  LayoutDashboard, 
  Building2, 
  Stethoscope, 
  Wrench, 
  AlertTriangle, 
  History, 
  FileText,
  Settings,
  BrainCircuit,
  LogOut,
  Users
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth, useUser, useDoc, useFirestore, useMemoFirebase } from "@/firebase"
import { signOut } from "firebase/auth"
import { doc } from "firebase/firestore"

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
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
  const router = useRouter()
  const auth = useAuth()
  const db = useFirestore()
  const { user } = useUser()

  const userProfileRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return doc(db, "userProfiles", user.uid)
  }, [db, user])

  const { data: profile } = useDoc(userProfileRef)

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth)
      router.push("/")
    }
  }

  return (
    <nav className="flex flex-col h-full gap-1 px-2 py-4">
      <div className="flex-1 flex flex-col gap-1 overflow-y-auto">
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

        {/* Admin only User Management */}
        {(profile?.role === 'Admin' || !user?.isAnonymous) && (
          <Link
            href="/users"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
              pathname === "/users"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
            )}
          >
            <Users className="w-4 h-4" />
            <span>Staff Mgmt</span>
          </Link>
        )}
      </div>
      
      <div className="mt-auto pt-4 border-t border-border flex flex-col gap-1">
         <Link
            href="/settings"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
              pathname === "/settings"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
            )}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium text-destructive hover:bg-destructive/10 text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
      </div>
    </nav>
  )
}
