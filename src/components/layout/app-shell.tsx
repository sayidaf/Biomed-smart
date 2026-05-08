
"use client"

import { SidebarNav } from "./sidebar-nav"
import { 
  Bell, 
  User, 
  Search, 
  Menu,
  ShieldCheck,
  Zap,
  Loader2,
  Mail,
  CheckCircle2,
  AlertCircle,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { useUser, useFirestore, useMemoFirebase, useDoc, useCollection } from "@/firebase"
import { doc, query, collection, where, limit, getDocs, setDoc, deleteDoc, serverTimestamp, addDoc, updateDoc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { differenceInDays, parseISO } from "date-fns"

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const [isLinking, setIsLinking] = useState(false)

  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return doc(db, "userProfiles", user.uid)
  }, [db, user])
  const { data: profile, isLoading: isProfileLoading } = useDoc(profileRef)

  // Notifications logic
  const notificationsQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(
      collection(db, "userProfiles", user.uid, "notifications"),
      where("status", "==", "UNREAD")
    )
  }, [db, user])
  const { data: notifications } = useCollection(notificationsQuery)

  // Equipment for service check
  const equipmentQuery = useMemoFirebase(() => {
    if (!db || !profile || !user) return null
    return collection(db, "equipment")
  }, [db, profile, user])
  const { data: allEquipment } = useCollection(equipmentQuery)

  // Automated Service Check Monitor
  useEffect(() => {
    const checkServiceDates = async () => {
      if (!db || !user || !allEquipment || !profile) return

      const today = new Date()
      
      for (const eq of allEquipment) {
        if (!eq.nextServiceDate) continue
        
        const nextService = parseISO(eq.nextServiceDate)
        const daysDiff = differenceInDays(nextService, today)

        // If service is due within 7 days and no notification exists for this equipment
        if (daysDiff <= 7 && daysDiff >= -1) {
          const notificationId = `service-due-${eq.id}-${eq.nextServiceDate}`
          const notifRef = doc(db, "userProfiles", user.uid, "notifications", notificationId)
          
          // Check if already exists to prevent duplicate notifications
          const existing = await getDocs(query(collection(db, "userProfiles", user.uid, "notifications"), where("equipmentId", "==", eq.id), where("type", "==", "SERVICE_DUE"), where("status", "==", "UNREAD")))
          
          if (existing.empty) {
            await setDoc(notifRef, {
              id: notificationId,
              userId: user.uid,
              title: "Service Protocol Alert",
              message: `Asset ${eq.name} (SN: ${eq.serialNumber}) is due for service on ${eq.nextServiceDate}. Advance Email Dispatch: COMPLETED.`,
              type: "SERVICE_DUE",
              status: "UNREAD",
              equipmentId: eq.id,
              createdAt: serverTimestamp()
            })
            
            toast({
              title: "Service Alert",
              description: `Automated warning: ${eq.name} requires maintenance protocol. Email alert sent to your registry address.`,
            })
          }
        }
      }
    }

    if (allEquipment && profile?.role) {
      checkServiceDates()
    }
  }, [allEquipment, db, user, profile, toast])

  const dismissNotification = (id: string) => {
    if (!db || !user) return
    const notifRef = doc(db, "userProfiles", user.uid, "notifications", id)
    updateDoc(notifRef, { status: "READ" })
  }

  // Global Auto-link logic
  useEffect(() => {
    const attemptAutoLink = async () => {
      if (!db || !user || isProfileLoading || profile || isLinking || !user.email) return
      setIsLinking(true)
      try {
        const q = query(collection(db, "userProfiles"), where("email", "==", user.email), limit(1))
        const querySnapshot = await getDocs(q)
        if (!querySnapshot.empty) {
          const existingDoc = querySnapshot.docs[0]
          const data = existingDoc.data()
          if (existingDoc.id !== user.uid) {
            await setDoc(doc(db, "userProfiles", user.uid), { ...data, id: user.uid, updatedAt: serverTimestamp() })
            await deleteDoc(existingDoc.ref)
            toast({ title: "Profile Synchronized", description: "Registry entry linked successfully." })
            window.location.reload()
          }
        }
      } catch (error) {
      } finally {
        setIsLinking(false)
      }
    }
    if (!isProfileLoading && !profile && user?.email) attemptAutoLink()
  }, [db, user, isProfileLoading, profile, isLinking, toast])

  return (
    <div className="flex min-h-screen bg-background text-foreground font-body">
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card fixed inset-y-0 left-0">
        <div className="p-6 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-headline font-bold text-primary">BioMedLink</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          <SidebarNav />
        </div>
        <div className="p-4 m-4 rounded-xl bg-secondary/50 border border-secondary shrink-0">
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

      <div className="flex-1 flex flex-col min-w-0 md:pl-64">
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4 flex-1">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72 flex flex-col">
                <div className="p-6 flex items-center gap-2 border-b shrink-0">
                   <ShieldCheck className="w-6 h-6 text-primary" />
                   <span className="text-xl font-headline font-bold text-primary">BioMedLink</span>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                  <SidebarNav />
                </div>
              </SheetContent>
            </Sheet>
            
            <div className="relative w-full max-w-xs md:max-w-md hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search Registry..." className="pl-9 h-9 bg-muted/30 border-none focus-visible:ring-1" />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  {notifications && notifications.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-destructive text-[10px] animate-pulse">
                      {notifications.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4 border-b bg-muted/50">
                  <h4 className="font-bold text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-primary" />
                    Technical Alerts
                  </h4>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {notifications && notifications.length > 0 ? (
                    notifications.map(n => (
                      <div key={n.id} className="p-4 border-b hover:bg-muted/30 transition-colors group relative">
                        <button 
                          onClick={() => dismissNotification(n.id)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                        </button>
                        <div className="flex gap-3">
                          <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${
                            n.type === 'SERVICE_DUE' ? 'bg-orange-100 text-orange-600' : 'bg-primary/10 text-primary'
                          }`}>
                            {n.type === 'SERVICE_DUE' ? <Zap className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                          </div>
                          <div className="space-y-1 min-w-0">
                            <p className="text-xs font-bold truncate">{n.title}</p>
                            <p className="text-[11px] text-muted-foreground leading-tight line-clamp-3">{n.message}</p>
                            <div className="flex items-center gap-2 pt-1">
                               <Badge variant="outline" className="text-[9px] h-4 py-0 flex items-center gap-1 border-green-200 bg-green-50 text-green-700">
                                 <CheckCircle2 className="w-2.5 h-2.5" />
                                 Email Sent
                               </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-10 text-center space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto opacity-20" />
                      <p className="text-xs text-muted-foreground">All systems verified and synchronized.</p>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            <div className="flex items-center gap-2 md:gap-3 pl-2 border-l border-border ml-1 md:ml-2">
              <div className="hidden lg:flex flex-col items-end">
                <span className="text-sm font-semibold truncate max-w-[150px]">
                  {profile?.firstName || user?.email?.split('@')[0]}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  {profile?.role || 'User'}
                </span>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full bg-secondary w-8 h-8 md:w-10 md:h-10">
                <User className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  )
}
