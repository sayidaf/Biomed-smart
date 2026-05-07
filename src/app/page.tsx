
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
  UserPlus,
  Zap,
  Cpu,
  BarChart,
  User
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useUser, useAuth, useFirestore } from "@/firebase"
import { initiateEmailSignIn, initiateEmailSignUp } from "@/firebase/non-blocking-login"
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
import { doc, setDoc, serverTimestamp } from "firebase/firestore"

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
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

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

      // Create UserProfile in Firestore immediately
      // This is the critical part that populates your database
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
        description: "Your staff profile has been created in the database.",
      })
      router.push("/dashboard")
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message || "Could not initialize account.",
      })
    } finally {
      setAuthLoading(false)
    }
  }

  if (isUserLoading) return null

  return (
    <div className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary),0.05),transparent)] z-0" />
      
      <div className="relative z-10 w-full max-w-6xl px-6 flex flex-col items-center gap-12">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/40">
            <ShieldCheck className="w-12 h-12 text-primary-foreground" />
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl md:text-6xl font-headline font-bold text-foreground tracking-tighter">
              BioMedLink <span className="text-primary">2026</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
              Precision Engineering. Absolute Reliability. 
            </p>
          </div>
        </div>

        {view === "hero" ? (
          <div className="w-full flex flex-col items-center gap-12">
            <div className="w-full max-w-4xl mx-auto">
              <Carousel className="w-full" opts={{ loop: true }}>
                <CarouselContent>
                  {PlaceHolderImages.slice(0, 3).map((img) => (
                    <CarouselItem key={img.id}>
                      <div className="relative aspect-[21/9] rounded-[2rem] overflow-hidden border border-border">
                        <Image 
                          src={img.imageUrl} 
                          alt={img.description} 
                          fill 
                          className="object-cover"
                          priority
                          data-ai-hint={img.imageHint}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                          <h2 className="text-2xl font-bold text-white">{img.description}</h2>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="h-14 px-8 font-bold" onClick={() => setView("auth")}>
                Access Terminal
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
            
            <button 
              onClick={() => setView("register")}
              className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
            >
              Initialize new staff account (Register)
            </button>
          </div>
        ) : view === "auth" ? (
          <div className="w-full max-w-md">
            <Card className="border-none shadow-2xl rounded-[2rem]">
              <CardContent className="p-10 space-y-8">
                <button onClick={() => setView("hero")} className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary">
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
                <div className="space-y-1">
                  <h2 className="text-3xl font-headline font-bold">Terminal Login</h2>
                  <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">Node ID: HQ-MAIN-2026</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Engineer ID (Email)</Label>
                    <Input id="email" type="email" placeholder="engineer@hospital.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Security PIN</Label>
                    <div className="relative">
                      <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-12 font-bold" disabled={authLoading}>
                    {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Authorize Session"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="w-full max-w-md">
            <Card className="border-none shadow-xl rounded-[2rem]">
              <CardContent className="p-10 space-y-6">
                <button onClick={() => setView("hero")} className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary">
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
                <div className="space-y-1">
                  <h2 className="text-3xl font-headline font-bold">Staff Registry</h2>
                  <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">Create Profile in Firestore</p>
                </div>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" placeholder="Jane" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Work Email</Label>
                    <Input id="reg-email" type="email" placeholder="engineer@hospital.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Security PIN (Password)</Label>
                    <Input id="reg-password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full h-12 font-bold" disabled={authLoading}>
                    {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Register & Create Profile"}
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
