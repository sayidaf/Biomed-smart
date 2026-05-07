
"use client"

import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  History as HistoryIcon, 
  Search, 
  Loader2,
  Calendar,
  FileText,
  User,
  Activity
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from "@/firebase"
import { collection, doc } from "firebase/firestore"

export default function HistoryPage() {
  const db = useFirestore()
  const { user } = useUser()

  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return doc(db, "userProfiles", user.uid)
  }, [db, user])
  const { data: profile } = useDoc(profileRef)

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary flex items-center gap-3">
            <HistoryIcon className="w-8 h-8" />
            System History
          </h1>
          <p className="text-muted-foreground mt-1">Audit log of all maintenance activities, service cycles, and asset changes.</p>
        </div>

        <div className="flex items-center gap-4 bg-card p-4 rounded-xl shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search logs by asset ID or technician..." className="pl-10 h-10" />
          </div>
          <Badge variant="secondary" className="h-10 px-4">All Time</Badge>
        </div>

        <div className="space-y-4">
          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
               <div className="flex items-center justify-center py-20 text-center">
                  <div className="space-y-2">
                    <Activity className="w-12 h-12 text-muted-foreground opacity-20 mx-auto" />
                    <h3 className="text-lg font-bold text-muted-foreground">Historical Logs Loading...</h3>
                    <p className="text-sm text-muted-foreground">System is populating archives from global registry.</p>
                  </div>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
