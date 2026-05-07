
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Loader2,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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

export default function LandingPage() {
  const { user, isUserLoading } = useUser()
  const router = useRouter()
  const auth = useAuth()

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
    <div className="h-screen w-full flex flex-col md:flex-row overflow-hidden bg-background">
      {/* Left Side: Image Carousel (Hidden on mobile small screens if needed, but here responsive) */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 bg-muted relative items-center justify-center p-8 lg:p-12">
        <div className="absolute top-8 left-8 z-20 flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg">
            <ShieldCheck className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-headline font-bold text-foreground tracking-tight drop-shadow-sm">BioMedLink</span>
        </div>
        
        <div className="w-full max-w-3xl">
          <Carousel className="w-full" opts={{ loop: true }}>
            <CarouselContent>
              {PlaceHolderImages.map((img) => (
                <CarouselItem key={img.id}>
                  <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10">
                    <Image 
                      src={img.imageUrl} 
                      alt={img.description} 
                      fill 
                      className="object-cover"
                      data-ai-hint={img.imageHint}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-end p-8">
                      <div className="mt-auto">
                        <Badge className="mb-2 bg-primary/90">{img.id.replace('-', ' ').toUpperCase()}</Badge>
                        <h2 className="text-2xl font-headline font-bold text-white">{img.description}</h2>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex gap-4">
              <CarouselPrevious className="static translate-y-0 h-10 w-10 bg-background/50 hover:bg-background" />
              <CarouselNext className="static translate-y-0 h-10 w-10 bg-background/50 hover:bg-background" />
            </div>
          </Carousel>
        </div>
        
        <div className="absolute bottom-8 left-8 text-xs text-muted-foreground font-medium">
          © 2026 BioMedLink Systems. Certified Medical Compliance.
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex items-center justify-center p-6 bg-card">
        <div className="w-full max-w-sm space-y-8">
          <div className="md:hidden flex items-center gap-2 mb-8">
            <ShieldCheck className="w-8 h-8 text-primary" />
            <span className="text-2xl font-headline font-bold text-primary">BioMedLink</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-headline font-bold tracking-tight">Staff Access</h1>
            <p className="text-muted-foreground">Welcome back. Please enter your credentials to access the terminal.</p>
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
                  className="pl-10 h-12 bg-muted/20"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="password" 
                  type="password" 
                  className="pl-10 h-12 bg-muted/20"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20" disabled={authLoading}>
              {authLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "Sign In to Terminal"}
            </Button>
            
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Demo Access</span>
              </div>
            </div>

            <Button variant="outline" type="button" className="w-full h-12 font-bold" onClick={handleGuestLogin} disabled={authLoading}>
              Explore as Guest
            </Button>
          </form>

          <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-[10px] leading-relaxed text-muted-foreground text-center">
              This system is protected by 256-bit encryption. Unauthorized access attempts are automatically reported to facility security.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
