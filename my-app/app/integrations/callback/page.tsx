"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { checkConnectionStatus } from "@/lib/integrations"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

export default function IntegrationsCallback() {
  const router = useRouter()
  const [status, setStatus] = useState("Connecting...")
  const [statusType, setStatusType] = useState<"loading" | "success" | "error">("loading")

  useEffect(() => {
    async function completeConnection() {
      try {
        // Get the integration slug from local storage
        const integrationSlug = localStorage.getItem("connecting_integration")

        if (!integrationSlug) {
          setStatus("Error: No integration found in progress")
          setStatusType("error")
          setTimeout(() => router.push("/integrations"), 3000)
          return
        }

        // Get user session
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          setStatus("Authentication required")
          setStatusType("error")
          setTimeout(() => router.push("/"), 2000)
          return
        }

        // Poll for connection status
        const maxAttempts = 30 // 30 attempts = 1 minute
        let attempts = 0

        const pollStatus = async () => {
          attempts++

          try {
            const result = await checkConnectionStatus(integrationSlug, session.access_token)

            if (result.status === "connected") {
              // Success!
              setStatus("Connected successfully! ✓")
              setStatusType("success")
              localStorage.removeItem("connecting_integration")

              // Redirect to integrations page
              setTimeout(() => {
                router.push("/integrations")
              }, 1500)
            } else if (result.status === "failed") {
              // Failed
              setStatus("Connection failed. Please try again.")
              setStatusType("error")
              localStorage.removeItem("connecting_integration")

              setTimeout(() => {
                router.push("/integrations")
              }, 3000)
            } else if (attempts < maxAttempts) {
              // Still pending, poll again
              setStatus(`Connecting${".".repeat((attempts % 3) + 1)}`)
              setTimeout(pollStatus, 2000) // Poll every 2 seconds
            } else {
              // Timeout
              setStatus("Connection timeout. Please try again.")
              setStatusType("error")
              localStorage.removeItem("connecting_integration")

              setTimeout(() => {
                router.push("/integrations")
              }, 3000)
            }
          } catch (error) {
            console.error("Error checking status:", error)
            setStatus("Error checking connection status")
            setStatusType("error")

            setTimeout(() => {
              router.push("/integrations")
            }, 3000)
          }
        }

        // Start polling
        pollStatus()
      } catch (error) {
        console.error("Connection error:", error)
        setStatus("An error occurred during connection")
        setStatusType("error")

        setTimeout(() => {
          router.push("/integrations")
        }, 3000)
      }
    }

    completeConnection()
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-blue-50/30 via-white to-blue-50/50">
      <div className="text-center space-y-6 p-8 bg-white rounded-2xl shadow-lg max-w-md w-full mx-4">
        <div className="flex justify-center">
          {statusType === "loading" && <Loader2 className="h-16 w-16 animate-spin text-blue-600" />}
          {statusType === "success" && <CheckCircle className="h-16 w-16 text-green-600" />}
          {statusType === "error" && <XCircle className="h-16 w-16 text-red-600" />}
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-serif font-semibold text-black">{status}</h2>
          <p className="text-black/60">
            {statusType === "loading" && "Please wait while we complete the connection..."}
            {statusType === "success" && "Redirecting you back to integrations..."}
            {statusType === "error" && "Taking you back to integrations..."}
          </p>
        </div>

        {statusType === "loading" && (
          <div className="flex justify-center space-x-1">
            <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce"></div>
          </div>
        )}
      </div>
    </div>
  )
}

