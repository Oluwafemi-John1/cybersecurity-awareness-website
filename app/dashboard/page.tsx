import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Target, Brain, Trophy, Clock, TrendingUp, Play, ArrowRight } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  // Get user progress stats
  const { data: moduleProgress } = await supabase.from("user_module_progress").select("*").eq("user_id", data.user.id)

  const { data: quizAttempts } = await supabase.from("user_quiz_attempts").select("*").eq("user_id", data.user.id)

  const { data: simulationAttempts } = await supabase
    .from("user_simulation_attempts")
    .select("*")
    .eq("user_id", data.user.id)

  // Get recent modules
  const { data: recentModules } = await supabase
    .from("modules")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(3)

  // Calculate stats
  const completedModules = moduleProgress?.filter((p) => p.completed).length || 0
  const totalQuizzes = quizAttempts?.length || 0
  const passedQuizzes = quizAttempts?.filter((q) => q.passed).length || 0
  const totalSimulations = simulationAttempts?.length || 0
  const completedSimulations = simulationAttempts?.filter((s) => s.completed).length || 0

  const stats = [
    {
      title: "Modules Completed",
      value: completedModules,
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      title: "Quizzes Passed",
      value: `${passedQuizzes}/${totalQuizzes}`,
      icon: Target,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/20",
    },
    {
      title: "Simulations Done",
      value: completedSimulations,
      icon: Brain,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
    },
    {
      title: "Learning Streak",
      value: "7 days",
      icon: Trophy,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950/50">
      <DashboardNav user={data.user} />

      <main className="container py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-balance">
              Welcome back, {profile?.full_name || data.user.email?.split("@")[0]}!
            </h1>
            <p className="text-muted-foreground text-pretty">
              Continue your cybersecurity learning journey. You're making great progress!
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Continue Learning */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Continue Learning</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentModules?.map((module) => (
                    <div key={module.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <h3 className="font-medium text-balance">{module.title}</h3>
                        <p className="text-sm text-muted-foreground text-pretty">{module.description}</p>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="text-xs">
                            {module.difficulty_level}
                          </Badge>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {module.estimated_duration} min
                          </div>
                        </div>
                      </div>
                      <Button size="sm" asChild>
                        <Link href={`/modules/${module.id}`}>
                          <Play className="h-4 w-4 mr-1" />
                          Start
                        </Link>
                      </Button>
                    </div>
                  ))}

                  <div className="pt-4">
                    <Button variant="outline" className="w-full bg-transparent" asChild>
                      <Link href="/modules">
                        View All Modules
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" asChild>
                    <Link href="/quizzes">
                      <Target className="mr-2 h-4 w-4" />
                      Take a Quiz
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                    <Link href="/simulations">
                      <Brain className="mr-2 h-4 w-4" />
                      Try Simulation
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                    <Link href="/progress">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      View Progress
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Learning Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Learning Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overall Progress</span>
                      <span>65%</span>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>This Week</span>
                      <span>3 modules</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>

                  <div className="pt-2 text-xs text-muted-foreground">
                    Keep up the great work! You're ahead of 78% of learners.
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
