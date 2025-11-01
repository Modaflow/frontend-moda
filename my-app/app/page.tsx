"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AuthModal } from "@/components/auth-modal"
import { OnboardingFlow } from "@/components/onboarding-flow"

export default function Home() {
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signup")
  const [showOnboarding, setShowOnboarding] = useState(false)

  const handleSignIn = () => {
    setAuthMode("signin")
    setAuthModalOpen(true)
  }

  const handleCreateAccount = () => {
    setAuthMode("signup")
    setAuthModalOpen(true)
  }

  const handleAuthSuccess = () => {
    setAuthModalOpen(false)
    setShowOnboarding(true)
  }

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
  }

  const handleModeSwitch = (newMode: "signin" | "signup") => {
    setAuthMode(newMode)
  }

  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      {/* Video Background - Always visible */}
      <div className="absolute inset-0 z-0">
        <iframe
          src="https://www.youtube.com/embed/AAAtyYMQHcs?autoplay=1&mute=1&loop=1&playlist=AAAtyYMQHcs&controls=0&showinfo=0&rel=0&modestbranding=1"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{
            width: "100vw",
            height: "100vh",
            transform: "scale(1.5)",
          }}
          allow="autoplay; encrypted-media"
          title="Background video"
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {!showOnboarding && (
        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4">
          <div className="flex flex-col items-center gap-8">
            {/* Logo */}
            <h1 className="font-serif text-7xl md:text-8xl lg:text-9xl text-white tracking-wider">Moda</h1>

            {/* Buttons */}
            <div className="flex flex-col gap-4 w-full max-w-sm">
              <Button
                onClick={handleSignIn}
                variant="outline"
                size="lg"
                className="w-full bg-white/95 hover:bg-white text-foreground border-2 border-white/50 backdrop-blur-sm text-lg h-14 rounded-xl"
              >
                Sign In
              </Button>
              <Button
                onClick={handleCreateAccount}
                variant="outline"
                size="lg"
                className="w-full bg-white/20 hover:bg-white/30 text-white border-2 border-white/50 backdrop-blur-sm text-lg h-14 rounded-xl"
              >
                Create Account
              </Button>
            </div>
          </div>
        </div>
      )}

      {showOnboarding && <OnboardingFlow onComplete={handleOnboardingComplete} />}

      {/* Auth Modal */}
      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        mode={authMode}
        onModeSwitch={handleModeSwitch}
        onSuccess={handleAuthSuccess}
      />
    </main>
  )
}
