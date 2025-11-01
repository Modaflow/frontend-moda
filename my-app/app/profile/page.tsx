"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Mail, Phone, Edit2, Check } from "lucide-react"

export default function ProfilePage() {
  const [name] = useState("John Doe")
  const [email] = useState("john.doe@example.com")
  const [phone, setPhone] = useState("+1 (555) 123-4567")
  const [isEditing, setIsEditing] = useState(false)
  const [tempPhone, setTempPhone] = useState(phone)

  const handleSave = () => {
    setPhone(tempPhone)
    setIsEditing(false)
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-blue-50/50">
      <Navbar />

      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="space-y-1 mb-10">
          <h2 className="text-4xl font-serif font-semibold text-black">Profile</h2>
          <p className="text-black/50 text-sm leading-relaxed">Manage your personal information</p>
        </div>

        <div className="border border-black/5 rounded-2xl bg-white/80 backdrop-blur-sm shadow-sm p-8 space-y-8">
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2 text-black/70">
                <User className="h-4 w-4 text-black/40" />
                Full Name
              </Label>
              <Input value={name} disabled className="h-12 bg-black/[0.02] border-black/5 text-black/50 rounded-xl" />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2 text-black/70">
                <Mail className="h-4 w-4 text-black/40" />
                Email Address
              </Label>
              <Input value={email} disabled className="h-12 bg-black/[0.02] border-black/5 text-black/50 rounded-xl" />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2 text-black/70">
                <Phone className="h-4 w-4 text-black/40" />
                Phone Number
              </Label>
              <div className="relative">
                <Input
                  value={isEditing ? tempPhone : phone}
                  onChange={(e) => setTempPhone(e.target.value)}
                  disabled={!isEditing}
                  className={`h-12 pr-24 rounded-xl transition-all ${
                    isEditing ? "bg-white border-black/10 text-black" : "bg-black/[0.02] border-black/5 text-black/50"
                  }`}
                />
                <button
                  onClick={isEditing ? handleSave : handleEdit}
                  className={`absolute right-1.5 top-1.5 h-9 px-4 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    isEditing
                      ? "bg-green-500 hover:bg-green-600 text-white"
                      : "bg-black/5 hover:bg-black/10 text-black/60"
                  }`}
                >
                  {isEditing ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Save
                    </>
                  ) : (
                    <>
                      <Edit2 className="h-3.5 w-3.5" />
                      Edit
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
