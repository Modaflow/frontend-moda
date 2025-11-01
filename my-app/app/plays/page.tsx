"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase"
import { getPlays, createPlay, executePlay, deletePlay, type Play } from "@/lib/plays"
import { Play as PlayIcon, Plus, Trash2, Loader2, Zap, CheckCircle, XCircle } from "lucide-react"

export default function PlaysPage() {
  const [plays, setPlays] = useState<Play[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showExecuteDialog, setShowExecuteDialog] = useState(false)
  const [selectedPlay, setSelectedPlay] = useState<Play | null>(null)
  const [executing, setExecuting] = useState(false)
  
  // Create play form
  const defaultTemplate = `{
  "play_name": "My Play",
  "variables": ["name", "email", "company"],
  "steps": [
    {
      "tool": "GMAIL_CREATE_EMAIL_DRAFT",
      "params": {
        "recipient_email": "{email}",
        "subject": "Hello {name}",
        "body": "Hi {name} from {company}!"
      }
    }
  ]
}`

  const [newPlayName, setNewPlayName] = useState("")
  const [newPlayDescription, setNewPlayDescription] = useState("")
  const [newPlayTemplate, setNewPlayTemplate] = useState(defaultTemplate)
  
  // Execute play form
  const [executeVariables, setExecuteVariables] = useState<Record<string, string>>({})
  const [executionResult, setExecutionResult] = useState<any>(null)

  useEffect(() => {
    loadPlays()
  }, [])

  async function loadPlays() {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const playsData = await getPlays(session.access_token)
      setPlays(playsData)
    } catch (error) {
      console.error("Failed to load plays:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreatePlay() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      // Validate template
      const templateStr = newPlayTemplate.trim() || defaultTemplate
      
      if (!templateStr) {
        alert("Please provide a template")
        return
      }

      let template
      try {
        template = JSON.parse(templateStr)
      } catch (e) {
        alert("Invalid JSON template. Please check the format.")
        return
      }
      
      await createPlay(newPlayName, newPlayDescription, template, session.access_token)
      
      setShowCreateDialog(false)
      setNewPlayName("")
      setNewPlayDescription("")
      setNewPlayTemplate(defaultTemplate)
      loadPlays()
      
      alert("Play created successfully!")
    } catch (error) {
      console.error("Failed to create play:", error)
      alert("Failed to create play. Check console for details.")
    }
  }

  async function handleExecutePlay() {
    if (!selectedPlay) return
    
    setExecuting(true)
    setExecutionResult(null)
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const result = await executePlay(selectedPlay.id, executeVariables, session.access_token)
      setExecutionResult(result)
      
      // Reset form after short delay
      setTimeout(() => {
        setShowExecuteDialog(false)
        setExecuteVariables({})
        setExecutionResult(null)
      }, 5000)
    } catch (error) {
      console.error("Failed to execute play:", error)
      alert("Failed to execute play")
    } finally {
      setExecuting(false)
    }
  }

  async function handleDeletePlay(playId: string, playName: string) {
    if (!confirm(`Delete play "${playName}"?`)) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      await deletePlay(playId, session.access_token)
      loadPlays()
      alert("Play deleted!")
    } catch (error) {
      console.error("Failed to delete play:", error)
      alert("Failed to delete play")
    }
  }

  function openExecuteDialog(play: Play) {
    setSelectedPlay(play)
    // Initialize variables
    const vars: Record<string, string> = {}
    play.template.variables.forEach(v => vars[v] = "")
    setExecuteVariables(vars)
    setShowExecuteDialog(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-blue-50/50">
        <Navbar />
        <main className="container mx-auto px-6 py-12">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-blue-50/50">
      <Navbar />

      <main className="container mx-auto px-6 py-12 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-serif font-semibold mb-2">Plays</h1>
            <p className="text-black/60">Multi-channel workflow orchestration</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Play
          </Button>
        </div>

        {plays.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <PlayIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold mb-2">No plays yet</h2>
              <p className="text-gray-600 mb-4">
                Create your first multi-channel workflow to automate tasks across integrations
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Play
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {plays.map(play => (
              <Card key={play.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-blue-600" />
                      <span>{play.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePlay(play.id, play.name)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {play.description && (
                    <p className="text-sm text-gray-600">{play.description}</p>
                  )}
                  
                  <div className="text-sm">
                    <div className="font-medium mb-1">Steps:</div>
                    <div className="text-gray-600">
                      {play.template.steps.length} actions across integrations
                    </div>
                  </div>
                  
                  <div className="text-sm">
                    <div className="font-medium mb-1">Variables:</div>
                    <div className="flex flex-wrap gap-1">
                      {play.template.variables.map(v => (
                        <span key={v} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => openExecuteDialog(play)}
                    className="w-full"
                    variant="default"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Execute Play
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create Play Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Play</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Play Name</Label>
                <Input
                  value={newPlayName}
                  onChange={(e) => setNewPlayName(e.target.value)}
                  placeholder="Post-demo follow-up"
                />
              </div>
              
              <div>
                <Label>Description</Label>
                <Input
                  value={newPlayDescription}
                  onChange={(e) => setNewPlayDescription(e.target.value)}
                  placeholder="Send email, update CRM, set reminder"
                />
              </div>
              
              <div>
                <Label>Template (JSON)</Label>
                <Textarea
                  value={newPlayTemplate}
                  onChange={(e) => setNewPlayTemplate(e.target.value)}
                  className="font-mono text-sm h-64"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Define steps with tool names and parameters. Use {'{variable}'} for substitution.
                </p>
              </div>
              
              <Button onClick={handleCreatePlay} className="w-full">
                Create Play
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Execute Play Dialog */}
        <Dialog open={showExecuteDialog} onOpenChange={setShowExecuteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Execute: {selectedPlay?.name}</DialogTitle>
            </DialogHeader>
            
            {!executionResult ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Fill in the variables for this play:
                </p>
                
                {selectedPlay?.template.variables.map(variable => (
                  <div key={variable}>
                    <Label>{variable}</Label>
                    <Input
                      value={executeVariables[variable] || ""}
                      onChange={(e) => setExecuteVariables(prev => ({
                        ...prev,
                        [variable]: e.target.value
                      }))}
                      placeholder={`Enter ${variable}`}
                    />
                  </div>
                ))}
                
                <Button 
                  onClick={handleExecutePlay} 
                  disabled={executing}
                  className="w-full"
                >
                  {executing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Execute Play
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${
                  executionResult.status === 'completed' ? 'bg-green-50' : 'bg-yellow-50'
                }`}>
                  {executionResult.status === 'completed' ? (
                    <CheckCircle className="h-6 w-6 text-green-600 mb-2" />
                  ) : (
                    <XCircle className="h-6 w-6 text-yellow-600 mb-2" />
                  )}
                  <h3 className="font-semibold mb-2">
                    {executionResult.summary.succeeded}/{executionResult.summary.total_steps} steps completed
                  </h3>
                </div>
                
                <div className="space-y-2">
                  {executionResult.results.map((result: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      {result.success ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span>{result.tool}</span>
                      {result.error && (
                        <span className="text-red-600 text-xs">({result.error})</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}

