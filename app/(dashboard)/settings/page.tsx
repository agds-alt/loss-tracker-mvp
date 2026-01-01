import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p className="text-lg">{user.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Username</p>
            <p className="text-lg">{profile?.username || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Member Since</p>
            <p className="text-lg">
              {new Date(profile?.created_at || new Date()).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About This App</CardTitle>
          <CardDescription>Loss Tracker MVP v1.0</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Built to help you track gambling and crypto losses, visualize your spending patterns,
            and build better financial habits. Stay disciplined, stay focused, achieve financial freedom.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
