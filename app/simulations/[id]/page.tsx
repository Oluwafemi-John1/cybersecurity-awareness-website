import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { SimulationInterface } from "@/components/simulation-interface"

interface SimulationPageProps {
  params: Promise<{ id: string }>
}

export default async function SimulationPage({ params }: SimulationPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get simulation details
  const { data: simulation } = await supabase
    .from("simulations")
    .select("*")
    .eq("id", id)
    .eq("is_published", true)
    .single()

  if (!simulation) {
    redirect("/simulations")
  }

  // Get user's previous attempts
  const { data: attempts } = await supabase
    .from("user_simulation_attempts")
    .select("*")
    .eq("user_id", data.user.id)
    .eq("simulation_id", id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950/50">
      <DashboardNav user={data.user} />
      <SimulationInterface simulation={simulation} userId={data.user.id} previousAttempts={attempts || []} />
    </div>
  )
}
