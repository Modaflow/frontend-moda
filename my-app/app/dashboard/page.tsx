"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Home, User, Settings, LogOut } from "lucide-react"

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-linear-to-br from-background via-secondary/30 to-accent/20">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="font-serif text-3xl font-semibold">Moda</h1>
          <Button variant="ghost" size="icon">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-2">
            <h2 className="text-4xl font-semibold text-balance">Welcome to Moda</h2>
            <p className="text-muted-foreground text-lg text-pretty">Your personalized dashboard is ready</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Home className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Home</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Access your main dashboard and overview</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Profile</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Manage your personal information</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Settings className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Settings</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Customize your preferences</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                  1
                </div>
                <div>
                  <h3 className="font-medium">Complete your profile</h3>
                  <p className="text-sm text-muted-foreground">Add more details to personalize your experience</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                  2
                </div>
                <div>
                  <h3 className="font-medium">Explore features</h3>
                  <p className="text-sm text-muted-foreground">Discover what Moda has to offer</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                  3
                </div>
                <div>
                  <h3 className="font-medium">Connect with others</h3>
                  <p className="text-sm text-muted-foreground">Start building your network</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
