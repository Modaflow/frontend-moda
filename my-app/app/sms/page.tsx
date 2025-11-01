"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { Phone, Send, CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function SMSPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [testMessage, setTestMessage] = useState("");
  const [testPhone, setTestPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  async function loadStatus() {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    try {
      const response = await fetch(`${API_URL}/sms/status`);
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error("Failed to load SMS status:", error);
    }
  }

  async function handleRegister() {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        alert("Please sign in first");
        return;
      }

      const response = await fetch(`${API_URL}/sms/register`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone_number: phoneNumber }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        setRegistered(true);
        loadStatus();
      } else {
        alert(`Error: ${data.detail || "Registration failed"}`);
      }
    } catch (error) {
      console.error("Failed to register:", error);
      alert("Failed to register phone number");
    } finally {
      setLoading(false);
    }
  }

  async function handleSendTest() {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        alert("Please sign in first");
        return;
      }

      const response = await fetch(`${API_URL}/sms/send`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to_number: testPhone,
          body: testMessage,
        }),
      });

      const data = await response.json();

      if (data.ok) {
        alert("SMS sent successfully!");
        setTestMessage("");
        setTestPhone("");
      } else {
        alert(`Error: ${data.error || "Failed to send"}`);
      }
    } catch (error) {
      console.error("Failed to send SMS:", error);
      alert("Failed to send SMS");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50/30 via-white to-blue-50/50">
      <Navbar />

      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-serif font-semibold mb-2">
              SMS Settings
            </h1>
            <p className="text-black/60">
              Connect your phone to receive SMS notifications and chat with Moda
            </p>
          </div>

          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {status?.configured ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                SMS Service Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>
                <span className="font-medium">Status:</span>{" "}
                {status?.configured ? "✅ Configured" : "❌ Not Configured"}
              </p>
              {status?.phone_number && (
                <p>
                  <span className="font-medium">Moda Number:</span>{" "}
                  {status.phone_number}
                </p>
              )}
              <p>
                <span className="font-medium">Registered Users:</span>{" "}
                {status?.registered_phones || 0}
              </p>
            </CardContent>
          </Card>

          {/* Register Phone */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Register Your Phone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 234 567 8900"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="h-12 rounded-xl"
                />
                <p className="text-sm text-black/60">
                  Include country code (e.g., +1 for US)
                </p>
              </div>

              <Button
                onClick={handleRegister}
                disabled={loading || !phoneNumber}
                className="w-full h-12 rounded-xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : registered ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Registered
                  </>
                ) : (
                  "Register Phone"
                )}
              </Button>

              {registered && (
                <p className="text-sm text-green-600">
                  ✅ Check your phone for a welcome message!
                </p>
              )}
            </CardContent>
          </Card>

          {/* Test SMS */}
          {status?.configured && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Test SMS
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="testPhone">To Number</Label>
                  <Input
                    id="testPhone"
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    className="h-12 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="testMessage">Message</Label>
                  <Input
                    id="testMessage"
                    type="text"
                    placeholder="Test message"
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    className="h-12 rounded-xl"
                  />
                </div>

                <Button
                  onClick={handleSendTest}
                  disabled={loading || !testPhone || !testMessage}
                  className="w-full h-12 rounded-xl"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Test SMS"
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>How to Use</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="font-medium">1. Register Your Phone</p>
                <p className="text-black/60">
                  Enter your phone number and click Register
                </p>
              </div>
              <div>
                <p className="font-medium">2. Receive Welcome Message</p>
                <p className="text-black/60">
                  You'll get a welcome SMS from Moda
                </p>
              </div>
              <div>
                <p className="font-medium">3. Start Chatting</p>
                <p className="text-black/60">
                  Text the Moda number to interact with your AI assistant
                </p>
              </div>
              <div>
                <p className="font-medium">Commands:</p>
                <p className="text-black/60">
                  - Send "clear" to reset conversation context
                  <br />- Ask about emails, calendar, or any connected service
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
