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

const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password harus diisi"),
})

export function LoginForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      // Validate form
      const validated = loginSchema.parse(formData)

      // Login with Supabase
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email: validated.email,
        password: validated.password,
      })

      if (error) {
        toast({
          variant: "destructive",
          title: "Login Gagal",
          description: error.message === "Invalid login credentials"
            ? "Email atau password salah"
            : error.message,
        })
        return
      }

      if (data.user) {
        toast({
          title: "Login Berhasil!",
          description: "Selamat datang kembali!",
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
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember"
            checked={formData.remember}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, remember: checked as boolean })
            }
          />
          <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
            Remember me
          </Label>
        </div>
        <Link
          href="/forgot-password"
          className="text-sm text-primary hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Loading..." : "Login"}
      </Button>

      <div className="text-center text-sm">
        Belum punya akun?{" "}
        <Link href="/signup" className="text-primary hover:underline font-medium">
          Sign up sekarang
        </Link>
      </div>
    </form>
  )
}
