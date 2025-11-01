"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { Sparkles, Loader2 } from "lucide-react"

export function HyperspellConnectButton() {
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

      // Get Hyperspell Connect URL
      const response = await fetch("http://localhost:8000/api/hyperspell/connect-url", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to get Hyperspell Connect URL")
      }

      const data = await response.json()

      if (!data.success || !data.connect_url) {
        throw new Error("No connect URL returned")
      }

      // Open Hyperspell Connect in new tab
      const hyperspellWindow = window.open(
        data.connect_url,
        "_blank",
        "width=800,height=700"
      )

      // Poll to check when connections are made
      let pollAttempts = 0
      const maxPollAttempts = 40 // 2 minutes max
      
      const pollConnections = async () => {
        if (pollAttempts >= maxPollAttempts) {
          setLoading(false)
          setError("Timeout. Please refresh the page to see your connections.")
          return
        }
        
        pollAttempts++
        
        try {
          const connectionsRes = await fetch("http://localhost:8000/api/hyperspell/connections", {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          })

          if (connectionsRes.ok) {
            const connectionsData = await connectionsRes.json()
            
            console.log(`Hyperspell poll ${pollAttempts}:`, connectionsData)
            
            if (connectionsData.success && connectionsData.has_connections) {
              setLoading(false)
              
              // Close the auth window if still open
              if (hyperspellWindow && !hyperspellWindow.closed) {
                hyperspellWindow.close()
              }
              
              // Reload page to show updated connections
              setTimeout(() => {
                window.location.reload()
              }, 500)
            } else {
              // Poll again
              setTimeout(pollConnections, 3000)
            }
          } else {
            // Continue polling even on errors
            setTimeout(pollConnections, 3000)
          }
        } catch (err) {
          console.error("Error checking Hyperspell connections:", err)
          // Continue polling
          setTimeout(pollConnections, 3000)
        }
      }

      // Start polling after a delay to give user time to connect
      setTimeout(pollConnections, 5000)
    } catch (err) {
      console.error("Failed to open Hyperspell Connect:", err)
      setError(err instanceof Error ? err.message : "Failed to connect")
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleConnect}
        disabled={loading}
        variant="outline"
        className="w-full border-purple-200 hover:bg-purple-50"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connecting to Hyperspell...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4 text-purple-600" />
            Connect Hyperspell (Data)
          </>
        )}
      </Button>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {loading && (
        <p className="text-xs text-purple-600">Complete the setup in the Hyperspell tab...</p>
      )}
    </div>
  )
}

