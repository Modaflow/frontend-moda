"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { startIntegrationConnection } from "@/lib/integrations"
import { Loader2 } from "lucide-react"

interface ConnectIntegrationButtonProps {
  integrationSlug: string
  integrationName: string
  onConnectionStart?: () => void
}

export function ConnectIntegrationButton({
  integrationSlug,
  integrationName,
  onConnectionStart,
}: ConnectIntegrationButtonProps) {
  const [loading, setLoading] = useState(false)
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

      // Store which integration we're connecting (for callback page)
      localStorage.setItem("connecting_integration", integrationSlug)

      // Notify parent component
      onConnectionStart?.()

      // Start connection (will redirect to OAuth)
      const result = await startIntegrationConnection(integrationSlug, session.access_token)

      if (result.success && result.auth_url) {
        // Redirect to OAuth page
        window.location.href = result.auth_url
      } else {
        throw new Error("No auth URL returned")
      }
    } catch (err) {
      console.error("Failed to connect:", err)
      setError(err instanceof Error ? err.message : "Failed to start connection")
      setLoading(false)
      localStorage.removeItem("connecting_integration")
    }
  }

  return (
    <div className="space-y-2">
      <Button onClick={handleConnect} disabled={loading} className="w-full" size="lg">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connecting...
          </>
        ) : (
          `Connect ${integrationName}`
        )}
      </Button>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}

