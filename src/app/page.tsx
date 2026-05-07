
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
  ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useUser, useAuth } from "@/firebase"
import { initiateEmailSignIn, initiateAnonymousSignIn } from "@/firebase/non-blocking-login"
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

export default function LandingPage() {
  const { user, isUserLoading } = useUser()
  const router = useRouter()
  const auth = useAuth()

  const [view, setView] = useState<"hero" | "login">("hero")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [authLoading, setAuthLoading] = useState(false)

  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!auth || !email || !password) return
    setAuthLoading(true)
    initiateEmailSignIn(auth, email, password)
  }

  const handleGuestLogin = () => {
    if (!auth) return
    setAuthLoading(true)
    initiateAnonymousSignIn(auth)
  }

  if (isUserLoading) return null

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 z-0" />
      <div className="absolute top-0 left-0 w-full h-1 bg-primary/20" />
      
      {/* Main Container */}
      <div className="relative z-10 w-full max-w-5xl px-6 py-12 flex flex-col items-center gap-12">
        {/* Logo & Header */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/30">
            <ShieldCheck className="w-10 h-10 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground tracking-tight">
              BioMedLink <span className="text-primary">2026</span>
            </h1>
            <p className="text-muted-foreground font-medium mt-2">Next-Gen Biomedical Inventory & AI Diagnostics</p>
          </div>
        </div>

        {view === "hero" ? (
          <div className="w-full space-y-12 animate-in fade-in zoom-in-95 duration-700">
            {/* Centered Carousel */}
            <div className="w-full max-w-4xl mx-auto px-12">
              <Carousel className="w-full" opts={{ loop: true }}>
                <CarouselContent>
                  {PlaceHolderImages.map((img) => (
                    <CarouselItem key={img.id}>
                      <div className="relative aspect-[21/9] rounded-3xl overflow-hidden shadow-2xl border border-white/20">
                        <Image 
                          src={img.imageUrl} 
                          alt={img.description} 
                          fill 
                          className="object-cover"
                          data-ai-hint={img.imageHint}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                          <Badge className="w-fit mb-2 bg-primary/90 hover:bg-primary/90">{img.id.replace('-', ' ').toUpperCase()}</Badge>
                          <h2 className="text-xl md:text-2xl font-headline font-bold text-white drop-shadow-md">{img.description}</h2>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="hidden md:flex -left-12 h-12 w-12 bg-background/80 backdrop-blur-sm border-none shadow-lg hover:bg-background" />
                <CarouselNext className="hidden md:flex -right-12 h-12 w-12 bg-background/80 backdrop-blur-sm border-none shadow-lg hover:bg-background" />
              </Carousel>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col items-center gap-6">
              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
                <Button 
                  size="lg" 
                  className="h-14 px-8 text-lg font-bold group shadow-xl shadow-primary/20 rounded-2xl flex-1"
                  onClick={() => setView("login")}
                >
                  Access Staff Portal
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="h-14 px-8 font-semibold rounded-2xl flex-1 border-primary/20 hover:bg-primary/5" 
                  onClick={handleGuestLogin} 
                  disabled={authLoading}
                >
                  {authLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Guest Walkthrough"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center max-w-xs leading-relaxed">
                Authorized hospital personnel only. System activities are logged and monitored under ISO 27001 standards.
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-500">
            <Card className="border-none shadow-2xl rounded-3xl overflow-hidden">
              <div className="h-2 bg-primary" />
              <CardContent className="p-8 space-y-6">
                <button 
                  onClick={() => setView("hero")}
                  className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors group"
                >
                  <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  Return Home
                </button>

                <div className="space-y-1">
                  <h2 className="text-3xl font-headline font-bold tracking-tight">Staff Login</h2>
                  <p className="text-sm text-muted-foreground italic">BioMedLink Secure Terminal v4.2</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Work Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="name@hospital.com" 
                        className="pl-10 h-12 bg-muted/20 border-none focus-visible:ring-1"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Security PIN</Label>
                      <a href="#" className="text-xs text-primary font-bold hover:underline">Forgot?</a>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="password" 
                        type="password" 
                        placeholder="••••••••"
                        className="pl-10 h-12 bg-muted/20 border-none focus-visible:ring-1"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20 rounded-xl" disabled={authLoading}>
                    {authLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : (
                      <>
                        <LogIn className="w-5 h-5 mr-2" />
                        Enter Facility
                      </>
                    )}
                  </Button>
                </form>

                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <p className="text-[10px] leading-relaxed text-muted-foreground text-center">
                    © 2026 BioMedLink Systems. Certified Medical Compliance. All rights reserved.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />
    </div>
  )
}
