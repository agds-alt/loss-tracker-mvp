"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"

const signupSchema = z.object({
  email: z.string().email("Email tidak valid"),
  username: z
    .string()
    .min(3, "Username minimal 3 karakter")
    .max(20, "Username maksimal 20 karakter")
    .regex(/^[a-zA-Z0-9_]+$/, "Username hanya boleh huruf, angka, dan underscore"),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .regex(/[A-Z]/, "Password harus mengandung minimal 1 huruf besar")
    .regex(/[0-9]/, "Password harus mengandung minimal 1 angka"),
  commitment: z.boolean().refine((val) => val === true, {
    message: "Kamu harus berkomitmen untuk tobat dari judol!",
  }),
})

export function SignupForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    commitment: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      // Validate form
      const validated = signupSchema.parse(formData)

      // Sign up with Supabase
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email: validated.email,
        password: validated.password,
        options: {
          data: {
            username: validated.username,
          },
        },
      })

      if (error) {
        toast({
          variant: "destructive",
          title: "Signup Gagal",
          description: error.message,
        })
        return
      }

      if (data.user) {
        toast({
          title: "Akun Berhasil Dibuat!",
          description: "Selamat datang! Mari mulai journey-mu menuju financial freedom.",
        })
        router.push("/dashboard")
        router.refresh()
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message
          }
        })
        setErrors(fieldErrors)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="nama@email.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          disabled={loading}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          type="text"
          placeholder="username_kamu"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          disabled={loading}
        />
        {errors.username && (
          <p className="text-sm text-destructive">{errors.username}</p>
        )}
        <p className="text-xs text-muted-foreground">
          3-20 karakter, hanya huruf, angka, dan underscore
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          disabled={loading}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Min 8 karakter, 1 huruf besar, 1 angka
        </p>
      </div>

      <div className="flex items-start space-x-2 pt-2">
        <Checkbox
          id="commitment"
          checked={formData.commitment}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, commitment: checked as boolean })
          }
        />
        <div className="space-y-1">
          <Label
            htmlFor="commitment"
            className="text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Saya berkomitmen untuk tobat dari judol
          </Label>
          {errors.commitment && (
            <p className="text-sm text-destructive">{errors.commitment}</p>
          )}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating account..." : "Create Account"}
      </Button>

      <div className="text-center text-sm">
        Sudah punya akun?{" "}
        <Link href="/login" className="text-primary hover:underline font-medium">
          Login di sini
        </Link>
      </div>
    </form>
  )
}
