
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Loader2, 
  ArrowRight,
  LogIn,
  ChevronLeft,
  Eye,
  EyeOff,
  Zap,
  Globe,
  Settings
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useUser, useAuth } from "@/firebase"
import { initiateEmailSignIn } from "@/firebase/non-blocking-login"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { Badge } from "@/components/ui/badge"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function LandingPage() {
  const { user, isUserLoading } = useUser()
  const router = useRouter()
  const auth = useAuth()
  const { toast } = useToast()

  const [view, setView] = useState<"hero" | "auth">("hero")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)

  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!auth || !email || !password) return
    
    setAuthLoading(true)
    try {
      await initiateEmailSignIn(auth, email, password)
    } catch (error: any) {
      console.error("Auth error:", error)
      let message = "System access denied. Please verify credentials."
      
      if (error.code === 'auth/invalid-credential') {
        message = "Authentication failed. Invalid work email or security PIN."
      } else if (error.code === 'auth/user-not-found') {
        message = "No registry entry found for this email address."
      }

      toast({
        variant: "destructive",
        title: "Security Violation",
        description: message,
      })
    } finally {
      setAuthLoading(false)
    }
  }

  if (isUserLoading) return null

  return (
    <div className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 z-0" />
      
      <div className="relative z-10 w-full max-w-6xl px-6 flex flex-col items-center gap-12">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/30 transform transition-transform hover:scale-105">
            <ShieldCheck className="w-12 h-12 text-primary-foreground" />
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl md:text-6xl font-headline font-bold text-foreground tracking-tighter">
              BioMedLink <span className="text-primary">2026</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
              Empowering Biomedical Excellence through Precision Data & Integrated Lifecycle Management.
            </p>
          </div>
        </div>

        {view === "hero" ? (
          <div className="w-full space-y-12 animate-in fade-in zoom-in-95 duration-1000">
            <div className="w-full max-w-5xl mx-auto px-4 md:px-12">
              <Carousel className="w-full" opts={{ loop: true }}>
                <CarouselContent>
                  {PlaceHolderImages.map((img) => (
                    <CarouselItem key={img.id}>
                      <div className="relative aspect-[21/8] rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/20">
                        <Image 
                          src={img.imageUrl} 
                          alt={img.description} 
                          fill 
                          className="object-cover"
                          priority
                          data-ai-hint={img.imageHint}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-10">
                          <div className="flex items-center gap-3 mb-4">
                            <Badge className="bg-primary/90 hover:bg-primary font-bold px-3 py-1">CERTIFIED SYSTEM</Badge>
                            <span className="text-white/60 text-xs font-mono uppercase tracking-widest">ISO 13485 Compliance</span>
                          </div>
                          <h2 className="text-2xl md:text-3xl font-headline font-bold text-white drop-shadow-lg max-w-2xl">{img.description}</h2>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="hidden md:flex -left-16 h-14 w-14 bg-background/80 backdrop-blur-md border-none shadow-xl hover:bg-background" />
                <CarouselNext className="hidden md:flex -right-16 h-14 w-14 bg-background/80 backdrop-blur-md border-none shadow-xl hover:bg-background" />
              </Carousel>
            </div>

            <div className="flex flex-col items-center gap-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl text-center mb-4">
                <div className="space-y-2">
                  <Zap className="w-6 h-6 text-primary mx-auto" />
                  <h3 className="font-bold">Real-time Telemetry</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">Instant visibility into hardware status across the entire facility network.</p>
                </div>
                <div className="space-y-2">
                  <Globe className="w-6 h-6 text-primary mx-auto" />
                  <h3 className="font-bold">Unified Ecosystem</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">Seamless integration of inventory, maintenance logs, and compliance reporting.</p>
                </div>
                <div className="space-y-2">
                  <Settings className="w-6 h-6 text-primary mx-auto" />
                  <h3 className="font-bold">Predictive AI</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">Advanced troubleshooting and preventive scheduling to eliminate critical downtime.</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 w-full max-w-sm justify-center">
                <Button 
                  size="lg" 
                  className="h-16 px-10 text-xl font-bold group shadow-2xl shadow-primary/30 rounded-2xl flex-1 transition-all hover:-translate-y-1"
                  onClick={() => setView("auth")}
                >
                  Access Staff Portal
                  <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
              
              <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground uppercase tracking-widest opacity-60">
                <span>Certified v4.2.0</span>
                <span className="w-1 h-1 bg-muted-foreground rounded-full" />
                <span>Encrypted 256-bit</span>
                <span className="w-1 h-1 bg-muted-foreground rounded-full" />
                <span>Authorized Personnel Only</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-12 duration-700">
            <Card className="border-none shadow-2xl rounded-[2rem] overflow-hidden bg-card/80 backdrop-blur-xl">
              <div className="h-3 bg-primary" />
              <CardContent className="p-10 space-y-8">
                <button 
                  onClick={() => setView("hero")}
                  className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-all group"
                >
                  <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  Back to Overview
                </button>

                <div className="space-y-2">
                  <h2 className="text-3xl font-headline font-bold tracking-tight">Staff Authentication</h2>
                  <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">Facility Node: HQ-Main-2026</p>
                </div>

                <form onSubmit={handleAuth} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="email" className="font-bold">Work Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="engineer@hospital.com" 
                        className="pl-12 h-14 bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary/50 text-base"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="password" className="font-bold">Security PIN</Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input 
                        id="password" 
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-12 pr-12 h-14 bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary/50 text-base"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-14 text-xl font-bold shadow-xl shadow-primary/20 rounded-2xl transition-all active:scale-95" disabled={authLoading}>
                    {authLoading ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : (
                      <>
                        <LogIn className="w-6 h-6 mr-2" />
                        Enter Facility
                      </>
                    )}
                  </Button>
                </form>

                <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10">
                  <p className="text-[10px] leading-relaxed text-muted-foreground text-center font-medium">
                    This system is monitored for 2026 security compliance. Unauthorized attempts are logged and reported to Federal IT Audits.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <div className="absolute top-1/4 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
    </div>
  )
}
