"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "signin" | "signup";
  onModeSwitch: (mode: "signin" | "signup") => void;
  onSuccess: (needsOnboarding: boolean) => void;
}

export function AuthModal({
  open,
  onOpenChange,
  mode,
  onModeSwitch,
  onSuccess,
}: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setEmail("");
    setPassword("");
    setError("");
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Basic validation
    if (!email || !password) {
      setError("Email and password are required");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      if (mode === "signup") {
        console.log("Attempting signup with:", {
          email,
          passwordLength: password.length,
        });

        // Sign up new user
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        console.log("Signup response:", { data, error: signUpError });

        if (signUpError) {
          console.error("Signup error:", signUpError);
          throw signUpError;
        }

        if (data.user) {
          console.log("User created, now signing them in...");

          // Sign the user in immediately after signup
          const { data: signInData, error: signInError } =
            await supabase.auth.signInWithPassword({
              email,
              password,
            });

          if (signInError) {
            console.error("Auto sign-in error:", signInError);
            throw signInError;
          }

          console.log("User signed in successfully");
          onSuccess(true); // Needs onboarding
        }
      } else {
        console.log("Attempting signin with:", {
          email,
          passwordLength: password.length,
        });

        // Sign in existing user
        const { data, error: signInError } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        console.log("Signin response:", { data, error: signInError });

        if (signInError) {
          console.error("Signin error:", signInError);
          throw signInError;
        }

        if (data.user) {
          console.log("User signed in, checking profile...");
          // Check if user has completed onboarding
          const { data: profile, error: profileError } = await supabase
            .from("user_profiles")
            .select("onboarding_completed")
            .eq("user_id", data.user.id)
            .single();

          if (profileError) {
            console.error("Profile check error:", profileError);
            throw profileError;
          }

          console.log("Profile check result:", profile);
          onSuccess(!profile?.onboarding_completed); // Needs onboarding if not completed
        }
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

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
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl">
                {error}
              </div>
            )}

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
                disabled={loading}
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
                disabled={loading}
                className="h-12 rounded-xl"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl text-base bg-primary hover:bg-primary/90"
            >
              {loading
                ? "Loading..."
                : mode === "signin"
                ? "Sign In"
                : "Continue"}
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
  );
}
