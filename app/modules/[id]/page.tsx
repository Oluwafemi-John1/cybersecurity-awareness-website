import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { ModuleViewer } from "@/components/module-viewer"

interface ModulePageProps {
  params: Promise<{ id: string }>
}

export default async function ModulePage({ params }: ModulePageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get module details
  const { data: module } = await supabase.from("modules").select("*").eq("id", id).eq("is_published", true).single()

  if (!module) {
    redirect("/modules")
  }

  // Get user's progress for this module
  const { data: progress } = await supabase
    .from("user_module_progress")
    .select("*")
    .eq("user_id", data.user.id)
    .eq("module_id", id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950/50">
      <DashboardNav user={data.user} />
      <ModuleViewer module={module} userId={data.user.id} initialProgress={progress} />
    </div>
  )
}
