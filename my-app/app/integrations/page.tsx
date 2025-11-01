"use client"

import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { X, Check, Sparkles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ConnectIntegrationButton } from "@/components/ConnectIntegrationButton"
import { supabase } from "@/lib/supabase"
import { getIntegrations, getUserIntegrations, disconnectIntegration, type Integration, type UserIntegration } from "@/lib/integrations"

// Icon components
const IntegrationIcons: Record<string, React.ReactNode> = {
  slack: (
    <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none">
      <path
        d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"
        fill="#E01E5A"
      />
    </svg>
  ),
  notion: (
    <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none">
      <path
        d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z"
        fill="currentColor"
      />
    </svg>
  ),
  gmail: (
    <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none">
      <path
        d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L12 9.366l8.073-5.873C21.69 2.28 24 3.434 24 5.457z"
        fill="#EA4335"
      />
    </svg>
  ),
  "google-drive": (
    <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none">
      <path d="M7.71 3.5L1.15 15l3.42 6.5L11.13 10 7.71 3.5z" fill="#0066DA" />
      <path d="M7.71 3.5L11.13 10l7.59-6.5H7.71z" fill="#00AC47" />
      <path d="M16.43 22l6.56-11-3.42-6.5-9.99 17.5h6.85z" fill="#EA4335" />
      <path d="M11.58 22l-3.42-6.5L1.15 15l3.42 6.5h7.01z" fill="#00832D" />
      <path d="M18.72 4.5l3.42 6.5L16.43 22l-4.85-12 7.14-5.5z" fill="#2684FC" />
      <path d="M11.58 22h4.85l-4.85-12-3.42 6.5 3.42 5.5z" fill="#FFBA00" />
    </svg>
  ),
  dropbox: (
    <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 1.807L0 5.629l6 3.822 6.001-3.822L6 1.807zM18 1.807l-6 3.822 6 3.822 6-3.822-6-3.822zM0 13.274l6 3.822 6.001-3.822L6 9.451l-6 3.823zM18 9.451l-6 3.823 6 3.822 6-3.822-6-3.823zM6 18.371l6.001 3.822 6-3.822-6-3.822L6 18.371z"
        fill="#0061FF"
      />
    </svg>
  ),
  zoom: (
    <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none">
      <path
        d="M4.5 0A4.5 4.5 0 000 4.5v15A4.5 4.5 0 004.5 24h15a4.5 4.5 0 004.5-4.5v-15A4.5 4.5 0 0019.5 0h-15z"
        fill="#2D8CFF"
      />
      <path d="M6.75 8.25h6.75v4.5l3.75-3v6l-3.75-3v4.5H6.75v-9z" fill="white" />
    </svg>
  ),
}

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
    return userIntegrations.some((ui) => ui.integration.slug === slug && ui.composio_connected)
  }

  const getConnectedIntegration = (slug: string): UserIntegration | undefined => {
    return userIntegrations.find((ui) => ui.integration.slug === slug && ui.composio_connected)
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-blue-50/50">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-blue-50/50">
      <Navbar />

      <main className="container mx-auto px-6 py-12 max-w-6xl">
        {isEmpty && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
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
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center">
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
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-xs font-medium text-green-700">Connected</span>
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
                      <div className="flex-shrink-0">{IntegrationIcons[integration.slug]}</div>
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
                          className={`flex-shrink-0 transition-opacity duration-300 ${
                            integration.coming_soon ? "opacity-40" : "opacity-30 group-hover:opacity-100"
                          }`}
                        >
                          {IntegrationIcons[integration.slug]}
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
