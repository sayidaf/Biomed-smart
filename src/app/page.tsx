
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { 
  ShieldCheck, 
  ArrowRight, 
  Wrench, 
  BrainCircuit, 
  Building2,
  Lock,
  Mail,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useUser, useCollection, useFirestore, useAuth, useMemoFirebase } from "@/firebase"
import { collection } from "firebase/firestore"
import { initiateEmailSignIn, initiateAnonymousSignIn } from "@/firebase/non-blocking-login"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { Badge } from "@/components/ui/badge"

export default function LandingPage() {
  const { user, isUserLoading } = useUser()
  const router = useRouter()
  const db = useFirestore()
  const auth = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [authLoading, setAuthLoading] = useState(false)

  // Fetch public equipment showcase from Firestore
  const showcaseQuery = useMemoFirebase(() => {
    if (!db) return null
    return collection(db, "publicEquipmentShowcase")
  }, [db])
  
  const { data: showcaseItems, isLoading: isShowcaseLoading } = useCollection(showcaseQuery)

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
    // Auth state is handled by useUser hook which will trigger the redirect
  }

  const handleGuestLogin = () => {
    if (!auth) return
    setAuthLoading(true)
    initiateAnonymousSignIn(auth)
  }

  if (isUserLoading) return null

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="h-20 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-headline font-bold text-primary tracking-tight">BioMedLink</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#showcase" className="text-sm font-medium hover:text-primary transition-colors">Showcase</a>
            <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</a>
            <Button variant="default" onClick={() => document.getElementById('login-section')?.scrollIntoView({ behavior: 'smooth' })}>
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <Badge variant="secondary" className="px-4 py-1 text-xs font-bold uppercase tracking-widest text-primary">
              The Future of Hospital Maintenance
            </Badge>
            <h1 className="text-5xl lg:text-7xl font-headline font-bold text-foreground leading-[1.1]">
              Intelligent Management for <span className="text-primary">Biomedical Assets</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
              BioMedLink combines AI diagnostics with real-time tracking to ensure your facility's critical equipment is always operational.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="h-14 px-8 text-lg font-bold gap-2 shadow-xl shadow-primary/20" onClick={() => document.getElementById('login-section')?.scrollIntoView({ behavior: 'smooth' })}>
                Get Started <ArrowRight className="w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-bold" onClick={() => document.getElementById('showcase')?.scrollIntoView({ behavior: 'smooth' })}>
                View Showcase
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-primary/10 blur-[100px] -z-10 rounded-full" />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4 pt-12">
                <Card className="overflow-hidden border-none shadow-2xl">
                  <Image src={PlaceHolderImages.find(img => img.id === 'mri-scanner')?.imageUrl || 'https://picsum.photos/seed/mri/600/400'} width={400} height={300} alt="MRI" className="object-cover h-48 w-full" data-ai-hint="mri scanner" />
                </Card>
                <Card className="overflow-hidden border-none shadow-2xl">
                  <Image src={PlaceHolderImages.find(img => img.id === 'patient-monitor')?.imageUrl || 'https://picsum.photos/seed/monitor/600/400'} width={400} height={300} alt="Monitor" className="object-cover h-48 w-full" data-ai-hint="patient monitor" />
                </Card>
              </div>
              <div className="space-y-4">
                <Card className="overflow-hidden border-none shadow-2xl">
                  <Image src={PlaceHolderImages.find(img => img.id === 'ventilator')?.imageUrl || 'https://picsum.photos/seed/ventilator/600/400'} width={400} height={300} alt="Ventilator" className="object-cover h-48 w-full" data-ai-hint="medical ventilator" />
                </Card>
                <Card className="overflow-hidden border-none shadow-2xl">
                  <Image src={PlaceHolderImages.find(img => img.id === 'ultrasound')?.imageUrl || 'https://picsum.photos/seed/ultrasound/600/400'} width={400} height={300} alt="Ultrasound" className="object-cover h-48 w-full" data-ai-hint="ultrasound machine" />
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Public Showcase Section */}
      <section id="showcase" className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-headline font-bold">Equipment Showcase</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Real-time records from our live hospital network. Explore the high-tech assets managed by BioMedLink.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {showcaseItems && showcaseItems.length > 0 ? (
              showcaseItems.map((item) => (
                <Card key={item.id} className="group overflow-hidden border-none shadow-md hover:shadow-xl transition-all">
                  <div className="relative h-64 overflow-hidden">
                    <Image 
                      src={item.imageUris?.[0] || 'https://picsum.photos/seed/biomed/600/400'} 
                      alt={item.name} 
                      fill 
                      className="object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-primary/90 backdrop-blur-sm">{item.status}</Badge>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-2">{item.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{item.manufacturer} • {item.modelNumber}</p>
                    <div className="flex items-center gap-2 text-xs font-medium text-primary">
                      <Building2 className="w-3 h-3" />
                      Managed in Cardiology Dept
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              // Fallback placeholder cards if Firestore is empty
              [1, 2, 3].map((i) => (
                <Card key={i} className="group overflow-hidden border-none shadow-md">
                   <div className="relative h-64 bg-muted animate-pulse" />
                   <CardContent className="p-6 space-y-4">
                     <div className="h-6 w-2/3 bg-muted animate-pulse rounded" />
                     <div className="h-4 w-full bg-muted animate-pulse rounded" />
                   </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Login Section */}
      <section id="login-section" className="py-24 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 blur-[120px] -z-10 rounded-full" />
        <div className="max-w-md mx-auto px-6">
          <Card className="border-none shadow-2xl overflow-hidden">
            <div className="h-2 bg-primary" />
            <CardHeader className="text-center space-y-2">
              <CardTitle className="text-3xl font-headline font-bold">Staff Access</CardTitle>
              <CardDescription>Enter your credentials to manage hospital assets</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Work Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="james.wilson@hospital.com" 
                      className="pl-10 h-12"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="password" 
                      type="password" 
                      className="pl-10 h-12"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20" disabled={authLoading}>
                  {authLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "Sign In"}
                </Button>
                
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground font-medium tracking-widest">Or continue with</span>
                  </div>
                </div>

                <Button variant="outline" type="button" className="w-full h-12 font-bold" onClick={handleGuestLogin} disabled={authLoading}>
                  {authLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Explore as Guest"}
                </Button>
              </form>
              <p className="text-center text-xs text-muted-foreground mt-8">
                Authorized Personnel Only. All actions are logged for security and compliance.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="space-y-4">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
            <Wrench className="w-6 h-6 text-accent" />
          </div>
          <h3 className="text-xl font-bold">Predictive Maintenance</h3>
          <p className="text-muted-foreground">Automated scheduling based on usage patterns and manufacturer guidelines to prevent failure.</p>
        </div>
        <div className="space-y-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <BrainCircuit className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-xl font-bold">AI Fault Diagnosis</h3>
          <p className="text-muted-foreground">Instantly identify equipment issues using our Genkit-powered troubleshooting assistant.</p>
        </div>
        <div className="space-y-4">
          <div className="w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-secondary-foreground" />
          </div>
          <h3 className="text-xl font-bold">Multi-Dept Sync</h3>
          <p className="text-muted-foreground">Seamlessly manage assets across Radiology, ICU, and surgical wards from a single pane of glass.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            <span className="text-lg font-headline font-bold text-primary">BioMedLink</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2024 BioMedLink Systems. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-primary">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
