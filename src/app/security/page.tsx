
"use client"

import { useState } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Lock, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Loader2, 
  CheckCircle2,
  AlertCircle
} from "lucide-react"
import { useAuth, useUser } from "@/firebase"
import { updateUserPassword } from "@/firebase/non-blocking-login"
import { useToast } from "@/hooks/use-toast"

export default function SecurityPage() {
  const { user } = useUser()
  const { toast } = useToast()
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "PIN Mismatch",
        description: "New PIN and confirmation must match exactly.",
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Weak Security",
        description: "Security PIN must be at least 6 characters long.",
      })
      return
    }

    setIsLoading(true)
    try {
      await updateUserPassword(user, newPassword)
      toast({
        title: "Security Updated",
        description: "Your terminal access PIN has been successfully changed.",
      })
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: any) {
      let message = "Could not update security credentials."
      if (error.code === 'auth/requires-recent-login') {
        message = "For security, please logout and log back in before changing your PIN."
      }
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary flex items-center gap-3">
            <Lock className="w-8 h-8 text-primary" />
            Terminal Security
          </h1>
          <p className="text-muted-foreground mt-1">Manage your terminal access credentials and security protocols.</p>
        </div>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Change Security PIN</CardTitle>
            <CardDescription>Update your personal password for system authentication.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Security PIN</Label>
                <div className="relative">
                  <Input 
                    id="new-password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New PIN</Label>
                <Input 
                  id="confirm-password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div className="p-4 bg-muted/30 rounded-xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Security Protocol</p>
                  <p className="text-sm text-muted-foreground">
                    Ensure your new PIN is unique and not used for other systems. PINs are encrypted and never stored in plain text.
                  </p>
                </div>
              </div>

              <Button type="submit" className="w-full h-11 font-bold" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                {isLoading ? "Updating Terminal..." : "Update Security PIN"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-orange-50 border-l-4 border-l-orange-500">
          <CardContent className="p-6 flex items-center gap-4">
            <AlertCircle className="w-6 h-6 text-orange-600 shrink-0" />
            <p className="text-sm text-orange-800">
              <strong>Note:</strong> If you receive a "requires recent login" error, please sign out and sign back in to verify your identity before updating your credentials.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
