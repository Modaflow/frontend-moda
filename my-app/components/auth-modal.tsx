"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "signin" | "signup"
  onModeSwitch: (mode: "signin" | "signup") => void
  onSuccess: () => void
}

export function AuthModal({ open, onOpenChange, mode, onModeSwitch, onSuccess }: AuthModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  useEffect(() => {
    setEmail("")
    setPassword("")
  }, [mode])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate authentication
    onSuccess()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden [&>button]:hidden">
        <div className="relative p-8">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 rounded-xl h-10 w-10"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" />
          </Button>

          <DialogHeader className="space-y-3 mb-8">
            <DialogTitle className="text-3xl font-semibold text-center">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </DialogTitle>
            <p className="text-muted-foreground text-center text-base">
              {mode === "signin"
                ? "Sign in to continue to Moda"
                : "Welcome! Please fill in the details to get started."}
            </p>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 rounded-xl"
              />
            </div>

            <Button type="submit" className="w-full h-12 rounded-xl text-base bg-primary hover:bg-primary/90">
              {mode === "signin" ? "Sign In" : "Continue"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {mode === "signin" ? (
                <>
                  Don't have an account?{" "}
                  <button
                    type="button"
                    className="text-primary font-medium hover:underline"
                    onClick={() => onModeSwitch("signup")}
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="text-primary font-medium hover:underline"
                    onClick={() => onModeSwitch("signin")}
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
