"use client"

import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { X, Check, Sparkles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ConnectIntegrationButton } from "@/components/ConnectIntegrationButton"
import { HyperspellConnectButton } from "@/components/HyperspellConnectButton"
import { supabase } from "@/lib/supabase"
import { getIntegrations, getUserIntegrations, disconnectIntegration, type Integration, type UserIntegration } from "@/lib/integrations"
import { getIntegrationIcon } from "@/lib/integration-icons"

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [userIntegrations, setUserIntegrations] = useState<UserIntegration[]>([])
  const [loading, setLoading] = useState(true)
  const [disconnecting, setDisconnecting] = useState<string | null>(null)

  useEffect(() => {
    loadIntegrations()
  }, [])

  async function loadIntegrations() {
    try {
      setLoading(true)

      // Get all available integrations (public endpoint)
      const allIntegrations = await getIntegrations()
      setIntegrations(allIntegrations)

      // Get user's connected integrations (requires auth)
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        try {
          const connected = await getUserIntegrations(session.access_token)
          setUserIntegrations(connected)
        } catch (error) {
          console.error("Failed to load user integrations:", error)
          // Continue even if this fails
        }
      }
    } catch (error) {
      console.error("Failed to load integrations:", error)
    } finally {
      setLoading(false)
    }
  }

  const isConnected = (slug: string): boolean => {
    // An integration is "connected" if either Composio OR Hyperspell is connected
    return userIntegrations.some((ui) => 
      ui.integration.slug === slug && 
      (ui.composio_connected || ui.hyperspell_connected)
    )
  }

  const getConnectedIntegration = (slug: string): UserIntegration | undefined => {
    return userIntegrations.find((ui) => 
      ui.integration.slug === slug && 
      (ui.composio_connected || ui.hyperspell_connected)
    )
  }

  const handleDisconnect = async (slug: string, name: string) => {
    if (!confirm(`Disconnect ${name}?`)) return

    setDisconnecting(slug)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        alert("Please sign in first")
        return
      }

      await disconnectIntegration(slug, session.access_token)

      // Reload integrations
      await loadIntegrations()

      alert(`${name} disconnected successfully`)
    } catch (error) {
      console.error("Failed to disconnect:", error)
      alert("Failed to disconnect integration")
    } finally {
      setDisconnecting(null)
    }
  }

  const enabledIntegrations = integrations.filter((i) => isConnected(i.slug))
  const availableIntegrations = integrations.filter((i) => !isConnected(i.slug))

  const isEmpty = enabledIntegrations.length === 0
  const isComplete = availableIntegrations.filter((i) => !i.coming_soon).length === 0

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50/30 via-white to-blue-50/50">
        <Navbar />
        <main className="container mx-auto px-6 py-12 max-w-6xl">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50/30 via-white to-blue-50/50">
      <Navbar />

      <main className="container mx-auto px-6 py-12 max-w-6xl">
        {/* Hyperspell Connect Button */}
        <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl border border-purple-100">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <h3 className="text-lg font-serif font-medium text-black mb-2">Hyperspell Data Access</h3>
              <p className="text-sm text-black/60 mb-4">
                Connect your accounts to Hyperspell to enable AI-powered data querying and memory features.
                This allows you to ask questions about your emails, documents, and more.
              </p>
            </div>
            <div className="w-64">
              <HyperspellConnectButton />
            </div>
          </div>
        </div>

        {isEmpty && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="h-20 w-20 rounded-full bg-linear-to-br from-blue-100 to-blue-200 flex items-center justify-center">
              <Sparkles className="h-10 w-10 text-blue-600" />
            </div>
            <h2 className="text-3xl font-serif font-semibold text-black text-balance text-center">Nothing here yet</h2>
            <p className="text-black/60 text-center text-pretty max-w-md leading-relaxed">
              Connect your first integration below to unlock the full potential of Moda
            </p>
          </div>
        )}

        {isComplete && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="h-20 w-20 rounded-full bg-linear-to-br from-green-100 to-emerald-200 flex items-center justify-center">
              <Check className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-serif font-semibold text-black text-balance text-center">You're all set</h2>
            <p className="text-black/60 text-center text-pretty max-w-md leading-relaxed">
              All integrations connected. You're fully equipped to make the most of Moda
            </p>
          </div>
        )}

        <div className="space-y-10">
          {!isEmpty && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-serif font-medium text-black">Connected</h2>
                <p className="text-black/50 text-sm leading-relaxed">Your active integrations</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {enabledIntegrations.map((integration) => (
                  <div
                    key={integration.id}
                    className="group relative border-2 border-green-500/20 rounded-2xl bg-white backdrop-blur-sm hover:bg-white hover:border-green-500/30 hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300 p-8"
                  >
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      {userIntegrations.find((ui) => ui.integration.slug === integration.slug)?.composio_connected && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                          <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                          <span className="text-xs font-medium text-green-700">Actions</span>
                        </div>
                      )}
                      {userIntegrations.find((ui) => ui.integration.slug === integration.slug)?.hyperspell_connected && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
                          <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                          <span className="text-xs font-medium text-purple-700">Data</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleDisconnect(integration.slug, integration.name)}
                      disabled={disconnecting === integration.slug}
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 p-1.5 rounded-lg hover:bg-black/5 disabled:opacity-50"
                      aria-label="Remove integration"
                    >
                      {disconnecting === integration.slug ? (
                        <Loader2 className="h-4 w-4 animate-spin text-black/40" />
                      ) : (
                        <X className="h-4 w-4 text-black/40 hover:text-black/70" />
                      )}
                    </button>

                      <div className="flex flex-col items-center gap-4 text-center pt-4">
                      <div className="shrink-0">
                        {getIntegrationIcon(integration.slug, '3x') || (
                          <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm">
                            {integration.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-base font-medium text-black">{integration.name}</h3>
                        <p className="text-xs text-black/40">{integration.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isComplete && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-serif font-medium text-black">Available</h2>
                <p className="text-black/50 text-sm leading-relaxed">Expand your toolkit</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {availableIntegrations.map((integration) => {
                  const connectedInfo = getConnectedIntegration(integration.slug)
                  const isCurrentlyConnected = !!connectedInfo

                  return (
                    <div
                      key={integration.id}
                      className={`group relative border border-black/5 rounded-2xl bg-white/40 backdrop-blur-sm transition-all duration-300 p-8 ${
                        integration.coming_soon ? "cursor-not-allowed opacity-60" : "hover:bg-white/80 hover:border-black/10 hover:shadow-lg hover:shadow-black/5"
                      }`}
                    >
                      {integration.coming_soon && (
                        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 backdrop-blur-sm">
                          <span className="text-xs font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Coming Soon
                          </span>
                        </div>
                      )}

                      <div className={`flex flex-col items-center gap-4 text-center ${integration.coming_soon ? "pt-4" : ""}`}>
                        <div
                        className={`shrink-0 transition-opacity duration-300 ${
                          integration.coming_soon ? "opacity-40" : "opacity-30 group-hover:opacity-100"
                        }`}
                      >
                        {getIntegrationIcon(integration.slug, '3x') || (
                          <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm">
                            {integration.name.charAt(0)}
                          </div>
                        )}
                      </div>
                        <div className="space-y-1">
                          <h3
                            className={`text-base font-medium transition-colors ${
                              integration.coming_soon ? "text-black/40" : "text-black/50 group-hover:text-black"
                            }`}
                          >
                            {integration.name}
                          </h3>
                          <p
                            className={`text-xs transition-colors ${
                              integration.coming_soon ? "text-black/30" : "text-black/30 group-hover:text-black/40"
                            }`}
                          >
                            {integration.description}
                          </p>
                        </div>

                        {!integration.coming_soon && !isCurrentlyConnected && (
                          <div className="w-full mt-2">
                            <ConnectIntegrationButton
                              integrationSlug={integration.slug}
                              integrationName={integration.name}
                              onConnectionComplete={loadIntegrations}
                            />
                          </div>
                        )}

                        {!integration.coming_soon && isCurrentlyConnected && (
                          <div className="w-full mt-2 space-y-2">
                            <div className="text-sm text-green-600 font-medium">✓ Already Connected</div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDisconnect(integration.slug, integration.name)}
                              disabled={disconnecting === integration.slug}
                              className="w-full"
                            >
                              {disconnecting === integration.slug ? (
                                <>
                                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                  Disconnecting...
                                </>
                              ) : (
                                "Disconnect"
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
