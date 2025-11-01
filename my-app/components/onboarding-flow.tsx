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
import { ConnectIntegrationButton } from "@/components/ConnectIntegrationButton";
import { getIntegrations, getUserIntegrations, type Integration, type UserIntegration } from "@/lib/integrations";
import { getIntegrationIcon } from "@/lib/integration-icons";

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
  const [availableIntegrations, setAvailableIntegrations] = useState<Integration[]>([]);
  const [userIntegrations, setUserIntegrations] = useState<UserIntegration[]>([]);
  const [loadingIntegrations, setLoadingIntegrations] = useState(false);
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

      // Check if phone number is already in use
      const { data: existingPhone } = await supabase
        .from("user_profiles")
        .select("user_id")
        .eq("phone_number", phone)
        .neq("user_id", userId)
        .single();

      if (existingPhone) {
        throw new Error("This phone number is already registered to another account");
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

      if (updateError) {
        // Check if it's a unique constraint error
        if (updateError.code === "23505") {
          throw new Error("This phone number is already in use");
        }
        throw updateError;
      }

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
      
      // Load integrations when entering step 3
      loadIntegrationsForStep3();
    } catch (err: any) {
      console.error("Step 2 error:", err);
      setError(err.message || "Failed to verify phone");
    } finally {
      setLoading(false);
    }
  };

  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !hasAnyConnections()) return;

    setLoading(true);
    setError("");

    try {
      console.log("Completing onboarding for user:", userId);
      console.log("Connected integrations:", userIntegrations.length);

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

  const loadIntegrationsForStep3 = async () => {
    setLoadingIntegrations(true);
    try {
      const integrations = await getIntegrations();
      setAvailableIntegrations(integrations.filter(i => !i.coming_soon));
      
      // Get user's connected integrations
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const connected = await getUserIntegrations(session.access_token);
        setUserIntegrations(connected);
      }
    } catch (err) {
      console.error("Failed to load integrations:", err);
    } finally {
      setLoadingIntegrations(false);
    }
  };

  const isIntegrationConnected = (slug: string) => {
    return userIntegrations.some(ui => ui.integration.slug === slug && (ui.composio_connected || ui.hyperspell_connected));
  };

  const hasAnyConnections = () => {
    return userIntegrations.length > 0;
  };

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

                <form onSubmit={handleStep3Submit} className="space-y-4">
                  {error && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl">
                      {error}
                    </div>
                  )}

                  {loadingIntegrations ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                        {availableIntegrations.map((integration) => {
                          const isConnected = isIntegrationConnected(integration.slug);
                          return (
                            <div
                              key={integration.id}
                              className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                                isConnected
                                  ? "border-green-200 bg-green-50/50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <div className="flex items-center gap-4">
                                <div className="shrink-0">
                                  {getIntegrationIcon(integration.slug, '2x') || (
                                    <div className="h-8 w-8 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm">
                                      {integration.name.charAt(0)}
                                    </div>
                                  )}
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
                              <div className="min-w-[120px]">
                                {isConnected ? (
                                  <div className="flex items-center gap-2 text-green-600 font-medium text-sm">
                                    <Check className="h-4 w-4" />
                                    Connected
                                  </div>
                                ) : (
                                  <ConnectIntegrationButton
                                    integrationSlug={integration.slug}
                                    integrationName={integration.name}
                                    onConnectionComplete={loadIntegrationsForStep3}
                                  />
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-12 rounded-xl text-base mt-6"
                    disabled={!hasAnyConnections() || loading}
                  >
                    {loading ? "Completing..." : "Complete Setup"}
                    {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
                  </Button>
                  
                  {!hasAnyConnections() && !loadingIntegrations && (
                    <p className="text-xs text-center text-muted-foreground">
                      Connect at least one service to continue
                    </p>
                  )}
                </form>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
