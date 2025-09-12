import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { QuizInterface } from "@/components/quiz-interface"

interface QuizPageProps {
  params: Promise<{ id: string }>
}

export default async function QuizPage({ params }: QuizPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get quiz details
  const { data: quiz } = await supabase.from("quizzes").select("*").eq("id", id).eq("is_published", true).single()

  if (!quiz) {
    redirect("/quizzes")
  }

  // Get user's previous attempts
  const { data: attempts } = await supabase
    .from("user_quiz_attempts")
    .select("*")
    .eq("user_id", data.user.id)
    .eq("quiz_id", id)
    .order("completed_at", { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950/50">
      <DashboardNav user={data.user} />
      <QuizInterface quiz={quiz} userId={data.user.id} previousAttempts={attempts || []} />
    </div>
  )
}
