"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Check, ArrowLeft, Loader2, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getPhoneValidationError, formatPhoneNumber } from "@/lib/phone-utils";
import { PhoneInput } from "@/components/phone-input";

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [resendState, setResendState] = useState<
    "idle" | "loading" | "success"
  >("idle");
  const [connectedIntegrations, setConnectedIntegrations] = useState<
    Set<string>
  >(new Set());
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Get current user and ensure profile exists
    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);

        // Check if profile exists, create if not
        const { data: profile, error: profileError } = await supabase
          .from("user_profiles")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (profileError && profileError.code === "PGRST116") {
          // Profile doesn't exist, create it using upsert to avoid duplicates
          console.log("Creating user profile...");
          const { error: createError } = await supabase
            .from("user_profiles")
            .upsert(
              {
                user_id: user.id,
                full_name: "",
                phone_number: "",
                onboarding_completed: false,
              },
              {
                onConflict: "user_id",
              }
            );

          if (createError) {
            console.error("Failed to create profile:", createError);
            setError("Failed to initialize user profile");
          } else {
            console.log("Profile created successfully");
          }
        } else if (profileError) {
          console.error("Error checking profile:", profileError);
          setError("Failed to check user profile");
        }
      }
    };
    getCurrentUser();
  }, []);

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setLoading(true);
    setError("");

    try {
      console.log("Updating profile with:", { name, phone, userId });

      // Validate phone number format
      const phoneError = getPhoneValidationError(phone);
      if (phoneError) {
        throw new Error(phoneError);
      }

      // Update user profile with name and phone
      const { data, error: updateError } = await supabase
        .from("user_profiles")
        .update({
          full_name: name,
          phone_number: phone,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .select();

      console.log("Update result:", { data, error: updateError });

      if (updateError) throw updateError;

      if (!data || data.length === 0) {
        throw new Error("No profile found to update");
      }

      console.log("Profile updated successfully:", data[0]);

      // Send verification code via backend
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("No active session");
      }

      const response = await fetch('/api/phone/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ phone_number: phone }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send verification code');
      }

      console.log("Verification code sent:", result);

      setIsTransitioning(true);
      await new Promise((resolve) => setTimeout(resolve, 300));
      setStep(2);
      setIsTransitioning(false);
    } catch (err: any) {
      console.error("Step 1 error:", err);
      setError(err.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setLoading(true);
    setError("");

    try {
      console.log("Verifying phone code for user:", userId);

      // Validate code format
      if (verificationCode.length !== 6) {
        throw new Error("Please enter a 6-digit verification code");
      }

      // Verify code via backend
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("No active session");
      }

      const response = await fetch('/api/phone/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ code: verificationCode }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Invalid or expired verification code');
      }

      console.log("Phone verified successfully:", result);

      // Update local profile state
      const { data, error: updateError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (updateError) {
        console.error("Error fetching updated profile:", updateError);
      }

      setIsTransitioning(true);
      await new Promise((resolve) => setTimeout(resolve, 300));
      setStep(3);
      setIsTransitioning(false);
    } catch (err: any) {
      console.error("Step 2 error:", err);
      setError(err.message || "Failed to verify phone");
    } finally {
      setLoading(false);
    }
  };

  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || connectedIntegrations.size === 0) return;

    setLoading(true);
    setError("");

    try {
      console.log("Completing onboarding for user:", userId);
      console.log("Connected integrations:", Array.from(connectedIntegrations));

      // Mark onboarding as completed
      const { data, error: updateError } = await supabase
        .from("user_profiles")
        .update({
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .select();

      console.log("Onboarding completion result:", {
        data,
        error: updateError,
      });

      if (updateError) throw updateError;

      if (!data || data.length === 0) {
        throw new Error("No profile found to update");
      }

      console.log("Onboarding completed successfully:", data[0]);

      // In a real app, you'd save the connected integrations to user_integrations table
      // For now, we'll just complete the onboarding

      console.log("Redirecting to integrations page...");

      onComplete();
      window.location.href = "/integrations";
    } catch (err: any) {
      console.error("Step 3 error:", err);
      setError(err.message || "Failed to complete onboarding");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendState("loading");
    setError("");

    try {
      // Get session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("No active session");
      }

      // Resend verification code
      const response = await fetch('/api/phone/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ phone_number: phone }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to resend verification code');
      }

      console.log("Verification code resent:", result);
      setResendState("success");
      setTimeout(() => setResendState("idle"), 2000);
    } catch (err: any) {
      console.error("Resend error:", err);
      setError(err.message || "Failed to resend code");
      setResendState("idle");
    }
  };

  const handleConnectIntegration = (integration: string) => {
    setConnectedIntegrations((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(integration)) {
        newSet.delete(integration);
      } else {
        newSet.add(integration);
      }
      return newSet;
    });
  };

  const integrations = [
    {
      id: "slack",
      name: "Slack",
      description: "Team communication platform",
      icon: (
        <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none">
          <path
            d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"
            fill="#E01E5A"
          />
        </svg>
      ),
    },
    {
      id: "gmail",
      name: "Gmail",
      description: "Email and communication",
      icon: (
        <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none">
          <path
            d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L12 9.366l8.073-5.873C21.69 2.28 24 3.434 24 5.457z"
            fill="#EA4335"
          />
        </svg>
      ),
    },
    {
      id: "notion",
      name: "Notion",
      description: "Notes and documentation",
      icon: (
        <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none">
          <path
            d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z"
            fill="currentColor"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardContent className="p-8 md:p-12">
          <div className="text-center mb-8"></div>

          {step > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-4 rounded-xl"
              onClick={() => setStep(step - 1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}

          <div className="flex items-center justify-center gap-2 mb-10">
            <div
              className={`h-1.5 w-24 rounded-full transition-all duration-500 ${
                step >= 1 ? "bg-black" : "bg-gray-200"
              }`}
            />
            <div
              className={`h-1.5 w-24 rounded-full transition-all duration-500 ${
                step >= 2 ? "bg-black" : "bg-gray-200"
              }`}
            />
            <div
              className={`h-1.5 w-24 rounded-full transition-all duration-500 ${
                step >= 3 ? "bg-black" : "bg-gray-200"
              }`}
            />
          </div>

          <div
            className={`transition-opacity duration-300 ${
              isTransitioning ? "opacity-0" : "opacity-100"
            }`}
            key={step}
          >
            {/* Step 1: Name and Phone */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-semibold text-balance">
                    Tell us about yourself
                  </h2>
                  <p className="text-muted-foreground text-pretty">
                    We'll need a few details to personalize your experience
                  </p>
                </div>

                <form onSubmit={handleStep1Submit} className="space-y-5">
                  {error && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl">
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={loading}
                      className="h-12 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Phone
                    </Label>
                    <PhoneInput
                      value={phone}
                      onChange={setPhone}
                      disabled={loading}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-xl text-base mt-6"
                  >
                    {loading ? "Saving..." : "Continue"}
                    {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
                  </Button>
                </form>
              </div>
            )}

            {/* Step 2: Phone Verification */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-semibold text-balance">
                    Verify your phone
                  </h2>
                  <p className="text-muted-foreground text-pretty">
                    We've sent a verification code to{" "}
                    <span className="font-medium text-foreground">{formatPhoneNumber(phone)}</span>
                  </p>
                </div>

                <form onSubmit={handleStep2Submit} className="space-y-5">
                  {error && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl">
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="code" className="text-sm font-medium">
                        Verification Code
                      </Label>
                      <button
                        type="button"
                        className="text-sm text-primary hover:underline font-medium flex items-center gap-1.5"
                        onClick={handleResend}
                        disabled={resendState !== "idle" || loading}
                      >
                        {resendState === "loading" && (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        )}
                        {resendState === "success" && (
                          <Check className="h-3.5 w-3.5" />
                        )}
                        {resendState === "idle" && "Resend"}
                        {resendState === "loading" && "Sending..."}
                        {resendState === "success" && "Sent!"}
                      </button>
                    </div>
                    <Input
                      id="code"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      required
                      maxLength={6}
                      disabled={loading}
                      className="h-12 rounded-xl text-center text-2xl tracking-widest"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-xl text-base mt-6"
                  >
                    {loading ? "Verifying..." : "Verify & Continue"}
                    {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
                  </Button>
                </form>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-semibold text-balance">
                    Connect your tools
                  </h2>
                  <p className="text-muted-foreground text-pretty">
                    Connect at least one integration to continue
                  </p>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                  <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-blue-900">
                      Secure & Private
                    </p>
                    <p className="text-xs text-blue-700 leading-relaxed">
                      Your data is encrypted and we never store your
                      credentials. You can disconnect anytime.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleStep3Submit} className="space-y-4">
                  {error && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl">
                      {error}
                    </div>
                  )}

                  <div className="space-y-3">
                    {integrations.map((integration) => {
                      const isConnected = connectedIntegrations.has(
                        integration.id
                      );
                      return (
                        <div
                          key={integration.id}
                          className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                            isConnected
                              ? "border-green-200 bg-green-50/50"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                              {integration.icon}
                            </div>
                            <div>
                              <h3 className="font-semibold text-base">
                                {integration.name}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {integration.description}
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            onClick={() =>
                              handleConnectIntegration(integration.id)
                            }
                            variant={isConnected ? "ghost" : "default"}
                            disabled={loading}
                            className={`min-w-[100px] rounded-xl transition-all ${
                              isConnected
                                ? "bg-green-500 hover:bg-green-600 text-white pointer-events-none"
                                : "hover:scale-105"
                            }`}
                          >
                            {isConnected ? (
                              <>
                                <Check className="h-4 w-4 mr-2" />
                                Connected
                              </>
                            ) : (
                              "Sign in"
                            )}
                          </Button>
                        </div>
                      );
                    })}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 rounded-xl text-base mt-6"
                    disabled={connectedIntegrations.size === 0 || loading}
                  >
                    {loading ? "Completing..." : "Complete Setup"}
                    {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
                  </Button>
                </form>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
