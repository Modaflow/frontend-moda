"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { startIntegrationConnection, checkConnectionStatus } from "@/lib/integrations"
import { Loader2, CheckCircle } from "lucide-react"

interface ConnectIntegrationButtonProps {
  integrationSlug: string
  integrationName: string
  onConnectionComplete?: () => void
}

export function ConnectIntegrationButton({
  integrationSlug,
  integrationName,
  onConnectionComplete,
}: ConnectIntegrationButtonProps) {
  const [loading, setLoading] = useState(false)
  const [polling, setPolling] = useState(false)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConnect = async () => {
    setLoading(true)
    setError(null)

    try {
      // Get user session
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        setError("Please sign in first")
        setLoading(false)
        return
      }

      // Start connection
      const result = await startIntegrationConnection(integrationSlug, session.access_token)

      if (!result.success || !result.auth_url) {
        throw new Error(result.message || "No auth URL returned")
      }

      setLoading(false)
      setPolling(true)

      // Open OAuth in new tab
      const authWindow = window.open(result.auth_url, "_blank", "width=600,height=700")

      // Start polling for connection status
      const maxAttempts = 60 // 60 attempts = 2 minutes
      const maxConsecutiveErrors = 5 // Stop after 5 consecutive errors
      let attempts = 0
      let consecutiveErrors = 0

      const pollStatus = async () => {
        if (attempts >= maxAttempts) {
          setPolling(false)
          setError("Connection timeout. Please try again.")
          return
        }

        if (consecutiveErrors >= maxConsecutiveErrors) {
          setPolling(false)
          setError("Connection check failed. Please try again.")
          return
        }

        attempts++

        try {
          const statusResult = await checkConnectionStatus(integrationSlug, session.access_token)

          if (statusResult.status === "connected") {
            // Success!
            consecutiveErrors = 0
            setPolling(false)
            setConnected(true)

            // Close the auth window if still open
            if (authWindow && !authWindow.closed) {
              authWindow.close()
            }

            // Notify parent to reload
            onConnectionComplete?.()

            // Reset after 2 seconds
            setTimeout(() => {
              setConnected(false)
            }, 2000)
          } else if (statusResult.status === "failed") {
            // Failed
            setPolling(false)
            setError("Connection failed. Please try again.")

            if (authWindow && !authWindow.closed) {
              authWindow.close()
            }
          } else {
            // Still pending, poll again
            consecutiveErrors = 0 // Reset on successful response
            setTimeout(pollStatus, 2000)
          }
        } catch (err) {
          console.error("Error checking status:", err)
          consecutiveErrors++
          console.warn(`Poll error ${consecutiveErrors}/${maxConsecutiveErrors}`)
          // Stop polling after too many errors
          setTimeout(pollStatus, 2000)
        }
      }

      // Start polling after a short delay
      setTimeout(pollStatus, 3000)
    } catch (err) {
      console.error("Failed to connect:", err)
      setError(err instanceof Error ? err.message : "Failed to start connection")
      setLoading(false)
      setPolling(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button onClick={handleConnect} disabled={loading || polling || connected} className="w-full" size="lg">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Starting...
          </>
        ) : polling ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Waiting for authorization...
          </>
        ) : connected ? (
          <>
            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
            Connected!
          </>
        ) : (
          `Connect ${integrationName}`
        )}
      </Button>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {polling && (
        <p className="text-xs text-blue-600">Complete the authorization in the new tab...</p>
      )}
    </div>
  )
}

