"use client"

import { useState, useEffect, useRef } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { Send, Loader2, Trash2, Sparkles } from "lucide-react"

interface Message {
  role: string
  message: string
  created_at?: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

  useEffect(() => {
    loadHistory()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  async function loadHistory() {
    setLoadingHistory(true)
    
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        return
      }

      const response = await fetch(`${API_URL}/chat/history`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      const data = await response.json()
      if (data.messages) {
        setMessages(data.messages)
      }
    } catch (error) {
      console.error("Failed to load history:", error)
    } finally {
      setLoadingHistory(false)
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput("")
    setLoading(true)

    // Optimistically add user message
    const tempUserMessage: Message = {
      role: "user",
      message: userMessage,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, tempUserMessage])

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        throw new Error("Please sign in first")
      }

      const response = await fetch(`${API_URL}/chat/message`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      })

      const data = await response.json()

      console.log("📥 Backend response:", data)
      
      if (data.success) {
        // Add assistant response (execution agent results are already included!)
        const assistantMessage: Message = {
          role: "assistant",
          message: data.response,
          created_at: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, assistantMessage])

        // Log if execution agents were used
        if (data.execution_agents_used > 0) {
          console.log(`✅ Response included results from ${data.execution_agents_used} execution agent(s)`)
        }
      } else {
        // Backend returned error
        console.error("❌ Backend returned error:", data.error)
        throw new Error(data.error || "Failed to get response")
      }
    } catch (error) {
      console.error("Failed to send message:", error)
      // Show error message
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          message: "Sorry, I encountered an error. Please try again.",
          created_at: new Date().toISOString(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  async function clearHistory() {
    if (!confirm("Clear all conversation history?")) return

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) return

      const response = await fetch(`${API_URL}/chat/history`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (response.ok) {
        setMessages([])
        alert("Chat history cleared!")
      }
    } catch (error) {
      console.error("Failed to clear history:", error)
      alert("Failed to clear history")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-blue-50/50">
      <Navbar />

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-serif font-semibold mb-2">Chat with Moda</h1>
            <p className="text-black/60">Your AI assistant powered by Composio & Hyperspell</p>
          </div>
          <Button variant="outline" size="sm" onClick={clearHistory}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear History
          </Button>
        </div>

        <Card className="h-[600px] flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {loadingHistory ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Sparkles className="h-12 w-12 text-blue-500 mb-4" />
                <h2 className="text-xl font-semibold mb-2">Start a conversation</h2>
                <p className="text-black/60 max-w-md">
                  Ask me to search your emails, manage your calendar, or help with any connected service.
                </p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-black text-white"
                        : msg.role === "assistant"
                        ? "bg-gray-100 text-black"
                        : "bg-blue-50 text-blue-900 border border-blue-200"
                    }`}
                  >
                    {msg.role === "agent" && (
                      <div className="text-xs font-medium mb-1 opacity-70">Execution Agent</div>
                    )}
                    <div className="whitespace-pre-wrap break-words">{msg.message}</div>
                    {msg.created_at && (
                      <div className="text-xs opacity-50 mt-1">
                        {new Date(msg.created_at).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl px-4 py-3 flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                  <span className="text-sm text-gray-600">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t p-4">
            <form onSubmit={sendMessage} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                disabled={loading}
                className="flex-1 h-12 rounded-xl"
                autoFocus
              />
              <Button type="submit" disabled={loading || !input.trim()} className="h-12 px-6 rounded-xl">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </Button>
            </form>
            <p className="text-xs text-black/50 mt-2">
              Powered by Claude Sonnet 4 • Uses Hyperspell for context & Composio for actions
            </p>
          </div>
        </Card>
      </main>
    </div>
  )
}

