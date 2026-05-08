
"use client"

import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Bell, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Mail, 
  Zap, 
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, doc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

export default function NotificationsPage() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()

  const notificationsQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(
      collection(db, "userProfiles", user.uid, "notifications"),
      orderBy("createdAt", "desc")
    )
  }, [db, user])

  const { data: notifications, isLoading } = useCollection(notificationsQuery)

  const markAsRead = async (id: string) => {
    if (!db || !user) return
    const notifRef = doc(db, "userProfiles", user.uid, "notifications", id)
    await updateDoc(notifRef, { status: "READ" })
  }

  const deleteNotification = async (id: string) => {
    if (!db || !user) return
    const notifRef = doc(db, "userProfiles", user.uid, "notifications", id)
    await deleteDoc(notifRef)
    toast({
      title: "Notification Purged",
      description: "Record removed from terminal memory."
    })
  }

  const markAllAsRead = async () => {
    if (!db || !user || !notifications) return
    const unread = notifications.filter(n => n.status === "UNREAD")
    for (const n of unread) {
      const notifRef = doc(db, "userProfiles", user.uid, "notifications", n.id)
      updateDoc(notifRef, { status: "READ" })
    }
    toast({ title: "All Marked Read", description: "Communication channel cleared." })
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold text-primary flex items-center gap-3">
              <Bell className="w-8 h-8" />
              Notification Center
            </h1>
            <p className="text-muted-foreground mt-1">Manage system alerts, service protocols, and advance warnings.</p>
          </div>
          {notifications && notifications.length > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              Mark All as Read
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : notifications && notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((n) => (
              <Card key={n.id} className={`border-none shadow-sm transition-all ${n.status === 'UNREAD' ? 'bg-primary/5 ring-1 ring-primary/20' : 'bg-card'}`}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className={`w-12 h-12 rounded-xl shrink-0 flex items-center justify-center ${
                      n.type === 'SERVICE_DUE' ? 'bg-orange-100 text-orange-600' : 'bg-primary/10 text-primary'
                    }`}>
                      {n.type === 'SERVICE_DUE' ? <Zap className="w-6 h-6" /> : <Mail className="w-6 h-6" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1 gap-2">
                        <div className="space-y-1">
                          <h4 className={`font-bold ${n.status === 'UNREAD' ? 'text-primary' : ''}`}>
                            {n.title}
                          </h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {n.message}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {n.status === 'UNREAD' && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => markAsRead(n.id)}>
                              <CheckCircle2 className="w-4 h-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteNotification(n.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-border/50">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase">
                          <Clock className="w-3.5 h-3.5" />
                          {n.createdAt?.toDate ? format(n.createdAt.toDate(), 'MMM dd, HH:mm') : 'Just now'}
                        </div>
                        <Badge variant="outline" className="text-[10px] gap-1 border-green-200 bg-green-50 text-green-700">
                          <Mail className="w-3 h-3" />
                          Email Dispatched to {user?.email}
                        </Badge>
                        {n.type === 'SERVICE_DUE' && (
                          <Badge variant="secondary" className="text-[10px] bg-orange-100 text-orange-700 hover:bg-orange-100">
                            Maintenance Priority
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-none shadow-sm py-20">
            <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-muted-foreground opacity-20" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold">Clear Channel</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  No pending notifications or system alerts at this time.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  )
}
