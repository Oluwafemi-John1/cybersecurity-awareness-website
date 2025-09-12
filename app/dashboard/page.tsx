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

      <main className="container px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="space-y-6 sm:space-y-8 lg:space-y-10">
          {/* Welcome Section */}
          <div className="space-y-2 sm:space-y-3">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-balance">
              Welcome back, {profile?.full_name || data.user.email?.split("@")[0]}!
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground text-pretty max-w-2xl">
              Continue your cybersecurity learning journey. You're making great progress!
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{stat.title}</p>
                      <p className="text-xl sm:text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`p-2 sm:p-3 rounded-lg ${stat.bgColor} flex-shrink-0 ml-3`}>
                      <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Continue Learning */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              <Card>
                <CardHeader className="pb-4 sm:pb-6">
                  <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Continue Learning</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  {recentModules?.map((module) => (
                    <div
                      key={module.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg space-y-3 sm:space-y-0 sm:space-x-4"
                    >
                      <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
                        <h3 className="font-medium text-sm sm:text-base text-balance">{module.title}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground text-pretty line-clamp-2">
                          {module.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {module.difficulty_level}
                          </Badge>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {module.estimated_duration} min
                          </div>
                        </div>
                      </div>
                      <Button size="sm" className="w-full sm:w-auto flex-shrink-0" asChild>
                        <Link href={`/modules/${module.id}`}>
                          <Play className="h-4 w-4 mr-1" />
                          Start
                        </Link>
                      </Button>
                    </div>
                  ))}

                  <div className="pt-2 sm:pt-4">
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
            <div className="space-y-4 sm:space-y-6">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-3">
                  <Button className="w-full justify-start h-auto py-3 px-4" asChild>
                    <Link href="/quizzes">
                      <Target className="mr-3 h-4 w-4 flex-shrink-0" />
                      <span className="text-sm sm:text-base">Take a Quiz</span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent h-auto py-3 px-4" asChild>
                    <Link href="/simulations">
                      <Brain className="mr-3 h-4 w-4 flex-shrink-0" />
                      <span className="text-sm sm:text-base">Try Simulation</span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent h-auto py-3 px-4" asChild>
                    <Link href="/progress">
                      <TrendingUp className="mr-3 h-4 w-4 flex-shrink-0" />
                      <span className="text-sm sm:text-base">View Progress</span>
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Learning Progress */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg sm:text-xl">Learning Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex justify-between text-sm sm:text-base">
                      <span>Overall Progress</span>
                      <span className="font-medium">65%</span>
                    </div>
                    <Progress value={65} className="h-2 sm:h-3" />
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex justify-between text-sm sm:text-base">
                      <span>This Week</span>
                      <span className="font-medium">3 modules</span>
                    </div>
                    <Progress value={75} className="h-2 sm:h-3" />
                  </div>

                  <div className="pt-2 text-xs sm:text-sm text-muted-foreground text-pretty">
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
