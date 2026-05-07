
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { 
  ShieldCheck, 
  Loader2, 
  ArrowRight,
  ChevronLeft,
  Eye,
  EyeOff,
  Activity,
  Zap,
  Microscope,
  UserPlus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useUser, useAuth, useFirestore } from "@/firebase"
import { initiateEmailSignIn, initiateEmailSignUp } from "@/firebase/non-blocking-login"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { doc, serverTimestamp, setDoc } from "firebase/firestore"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"

export default function LandingPage() {
  const { user, isUserLoading } = useUser()
  const router = useRouter()
  const auth = useAuth()
  const db = useFirestore()
  const { toast } = useToast()

  const [view, setView] = useState<"hero" | "auth" | "register">("hero")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)

  useEffect(() => {
    if (user && !isUserLoading) {
      router.push("/dashboard")
    }
  }, [user, isUserLoading, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!auth || !email || !password) return
    
    setAuthLoading(true)
    try {
      await initiateEmailSignIn(auth, email, password)
    } catch (error: any) {
      let message = "System access denied. Please verify credentials."
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!auth || !db || !email || !password || !firstName || !lastName) return
    
    setAuthLoading(true)
    try {
      const userCredential = await initiateEmailSignUp(auth, email, password)
      const newUser = userCredential.user
      
      // Create Firestore Profile immediately
      await setDoc(doc(db, "userProfiles", newUser.uid), {
        id: newUser.uid,
        email: email,
        firstName: firstName,
        lastName: lastName,
        role: "Biomedical Engineer", // Default role
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      toast({
        title: "Registry Initialized",
        description: "Professional profile created. Redirecting to terminal...",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Initialization Failed",
        description: error.message || "Could not create system profile.",
      })
    } finally {
      setAuthLoading(false)
    }
  }

  if (isUserLoading) return (
    <div className="h-screen w-full flex items-center justify-center bg-background">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
    </div>
  )

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-x-hidden bg-background py-12 md:py-0 px-4">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      
      <div className="relative z-10 w-full max-w-6xl flex flex-col items-center gap-8 md:gap-12">
        <div className="flex flex-col items-center gap-4 md:gap-6 text-center">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/40 border border-primary/20">
            <ShieldCheck className="w-10 h-10 md:w-12 md:h-12 text-primary-foreground" />
          </div>
          <div className="space-y-2 md:space-y-4">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-headline font-bold text-foreground tracking-tighter">
              BioMedLink <span className="text-primary">Core</span>
            </h1>
            <p className="text-base md:text-xl lg:text-2xl text-muted-foreground font-medium max-w-3xl mx-auto leading-relaxed">
              Advancing Healthcare through <span className="text-foreground font-bold italic">Precision Engineering</span> and <span className="text-foreground font-bold italic">Absolute Reliability</span>.
            </p>
          </div>
        </div>

        {view === "hero" ? (
          <div className="w-full flex flex-col items-center gap-8 md:gap-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 w-full max-w-5xl">
              {[
                { icon: Zap, title: "Operational Excellence", desc: "Maximizing hardware uptime with intelligent predictive maintenance." },
                { icon: Activity, title: "Diagnostic Precision", desc: "Real-time performance monitoring and ISO-compliant calibration." },
                { icon: Microscope, title: "BME Intelligence", desc: "AI-driven troubleshooting for clinical hardware." }
              ].map((feature, i) => (
                <div key={i} className="p-6 rounded-2xl bg-card border border-border shadow-sm flex flex-col items-center text-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>

            <div className="w-full max-w-4xl mx-auto hidden md:block">
              <Carousel className="w-full" opts={{ loop: true }}>
                <CarouselContent>
                  {PlaceHolderImages.slice(0, 3).map((img) => (
                    <CarouselItem key={img.id}>
                      <div className="relative aspect-[21/9] rounded-[2rem] overflow-hidden border border-border shadow-2xl">
                        <Image 
                          src={img.imageUrl} 
                          alt={img.description} 
                          fill 
                          className="object-cover brightness-[0.85]"
                          priority
                          data-ai-hint={img.imageHint}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-10">
                          <div className="space-y-2 text-left">
                            <Badge className="bg-primary/20 text-white border-white/20 backdrop-blur-md mb-2">Standard Protocol</Badge>
                            <h2 className="text-3xl font-bold text-white tracking-tight">{img.description}</h2>
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>

            <div className="flex flex-col items-center gap-6 w-full max-w-xs md:max-w-none">
              <Button size="lg" className="w-full md:w-auto h-14 md:h-16 px-12 text-lg font-bold shadow-2xl shadow-primary/40 group" onClick={() => setView("auth")}>
                Access Management Terminal
                <ArrowRight className="ml-2 w-5 h-5 md:w-6 md:h-6 transition-transform group-hover:translate-x-1" />
              </Button>
              <button 
                onClick={() => setView("register")}
                className="text-[10px] font-mono text-muted-foreground hover:text-primary transition-colors uppercase tracking-[0.2em]"
              >
                Initialize New Profile
              </button>
            </div>
          </div>
        ) : view === "auth" ? (
          <div className="w-full max-w-md animate-in fade-in zoom-in duration-300">
            <Card className="border-none shadow-2xl rounded-[1.5rem] md:rounded-[2.5rem] bg-card/50 backdrop-blur-xl border border-border overflow-hidden">
              <CardContent className="p-8 md:p-12 space-y-6 md:space-y-8">
                <button onClick={() => setView("hero")} className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                  Return to Overview
                </button>
                <div className="space-y-1 md:space-y-2">
                  <h2 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">Terminal Login</h2>
                  <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Secure Gateway: HQ-MAIN-BME
                  </p>
                </div>
                <form onSubmit={handleLogin} className="space-y-5 md:space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-bold uppercase text-muted-foreground">Engineer Credentials</Label>
                    <Input id="email" type="email" placeholder="id@biomedlink.sys" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12 bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-xs font-bold uppercase text-muted-foreground">Security PIN</Label>
                    <div className="relative">
                      <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-12 bg-background/50 pr-12" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/20" disabled={authLoading}>
                    {authLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Authorize Session"}
                  </Button>
                </form>
                <p className="text-[10px] text-center text-muted-foreground uppercase leading-relaxed tracking-wider">
                  By accessing this terminal, you agree to comply with medical equipment safety protocols.
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="w-full max-w-md animate-in fade-in zoom-in duration-300">
            <Card className="border-none shadow-2xl rounded-[1.5rem] md:rounded-[2.5rem] bg-card/50 backdrop-blur-xl border border-border overflow-hidden">
              <CardContent className="p-8 md:p-10 space-y-6">
                <button onClick={() => setView("hero")} className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                  Return
                </button>
                <div className="space-y-1">
                  <h2 className="text-2xl md:text-3xl font-headline font-bold tracking-tight">System Registry</h2>
                  <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">Initialize Professional Account</p>
                </div>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground">First Name</Label>
                      <Input placeholder="Jane" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="h-11 bg-background/50" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground">Last Name</Label>
                      <Input placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="h-11 bg-background/50" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-muted-foreground">Work Email</Label>
                    <Input type="email" placeholder="jane@hospital.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11 bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-muted-foreground">Security PIN</Label>
                    <div className="relative">
                      <Input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-11 bg-background/50 pr-12" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-12 font-bold shadow-lg shadow-primary/20" disabled={authLoading}>
                    {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Register Profile"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

function Badge({ children, className, ...props }: any) {
  return (
    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`} {...props}>
      {children}
    </div>
  )
}
