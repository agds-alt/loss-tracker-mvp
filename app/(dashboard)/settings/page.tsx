import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Pengaturan</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
          Kelola pengaturan dan preferensi akun kamu
        </p>
      </div>

      <Card>
        <CardHeader className="p-3 sm:p-4 md:p-6">
          <CardTitle className="text-base sm:text-lg md:text-xl">Informasi Profil</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Detail akun kamu</CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6 pt-0 sm:pt-0 md:pt-0 space-y-3 sm:space-y-4">
          <div>
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Email</p>
            <p className="text-sm sm:text-base md:text-lg">{user.email}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">User ID</p>
            <p className="text-xs sm:text-sm md:text-base font-mono break-all">{user.id}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Bergabung Sejak</p>
            <p className="text-sm sm:text-base md:text-lg">
              {new Date(user.created_at || new Date()).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-3 sm:p-4 md:p-6">
          <CardTitle className="text-base sm:text-lg md:text-xl">Tentang Aplikasi Ini</CardTitle>
          <CardDescription>Loss Tracker MVP v1.0</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Dibuat untuk membantu kamu melacak loss judi dan crypto, memvisualisasikan pola pengeluaran, dan membangun kebiasaan finansial yang lebih baik. Tetap disiplin, tetap fokus, raih kebebasan finansial.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
