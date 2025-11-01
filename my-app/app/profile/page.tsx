"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Mail, Phone, Edit2, Check, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { PhoneInput } from "@/components/phone-input"

export default function ProfilePage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [tempPhone, setTempPhone] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          setUserId(user.id)
          setEmail(user.email || "")
          
          // Get profile data
          const { data: profile, error } = await supabase
            .from('user_profiles')
            .select('full_name, phone_number')
            .eq('user_id', user.id)
            .single()
          
          if (error) throw error
          
          if (profile) {
            setName(profile.full_name)
            setPhone(profile.phone_number)
            setTempPhone(profile.phone_number)
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadUserData()
  }, [])

  const handleSave = async () => {
    if (!userId) return
    
    setSaving(true)
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          phone_number: tempPhone,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
      
      if (error) throw error
      
      setPhone(tempPhone)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating phone:', error)
      alert('Failed to update phone number')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-blue-50/50">
        <Navbar />
        <main className="container mx-auto px-6 py-12 max-w-4xl flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-black/40" />
        </main>
      </div>
    )
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
                Phone
              </Label>
              <div className="relative">
                <PhoneInput
                  value={isEditing ? tempPhone : phone}
                  onChange={setTempPhone}
                  disabled={!isEditing}
                  className={isEditing ? "" : "opacity-60"}
                />
                <button
                  onClick={isEditing ? handleSave : handleEdit}
                  disabled={saving}
                  className={`absolute right-1.5 top-1.5 h-9 px-4 rounded-lg text-sm font-medium transition-all flex items-center gap-2 z-10 ${
                    isEditing
                      ? "bg-green-500 hover:bg-green-600 text-white disabled:opacity-50"
                      : "bg-black/5 hover:bg-black/10 text-black/60"
                  }`}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Saving
                    </>
                  ) : isEditing ? (
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
