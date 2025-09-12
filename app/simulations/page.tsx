import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Brain, Clock, Trophy, Search, Filter, Play, CheckCircle } from "lucide-react"
import Link from "next/link"

export default async function SimulationsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get all published simulations
  const { data: simulations } = await supabase
    .from("simulations")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false })

  // Get user's simulation attempts
  const { data: userAttempts } = await supabase
    .from("user_simulation_attempts")
    .select("simulation_id, score, completed, completed_at")
    .eq("user_id", data.user.id)

  const attemptsBySimulation =
    userAttempts?.reduce(
      (acc, attempt) => {
        if (
          !acc[attempt.simulation_id] ||
          (attempt.completed_at &&
            new Date(attempt.completed_at) > new Date(acc[attempt.simulation_id].completed_at || 0))
        ) {
          acc[attempt.simulation_id] = attempt
        }
        return acc
      },
      {} as Record<string, any>,
    ) || {}

  const categories = [...new Set(simulations?.map((s) => s.category) || [])]
  const difficultyLevels = ["beginner", "intermediate", "advanced"]

  // Calculate stats
  const completedSimulations = userAttempts?.filter((a) => a.completed).length || 0
  const averageScore =
    userAttempts?.length > 0 && userAttempts.some((a) => a.score !== null)
      ? Math.round(
          userAttempts.filter((a) => a.score !== null).reduce((sum, a) => sum + (a.score || 0), 0) /
            userAttempts.filter((a) => a.score !== null).length,
        )
      : 0

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950/50">
      <DashboardNav user={data.user} />

      <main className="container py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold">Cybersecurity Simulations</h1>
            </div>
            <p className="text-muted-foreground text-pretty">
              Practice real-world cybersecurity scenarios in a safe environment. Make decisions, learn from outcomes,
              and build practical skills.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Available Simulations</p>
                    <p className="text-2xl font-bold">{simulations?.length || 0}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                    <Brain className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold">{completedSimulations}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/20">
                    <CheckCircle className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                    <p className="text-2xl font-bold">{averageScore}%</p>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                    <Trophy className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search simulations..." className="pl-10" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    All Categories
                  </Button>
                  <Button variant="outline" size="sm">
                    All Levels
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Simulations Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {simulations?.map((simulation) => {
              const userAttempt = attemptsBySimulation[simulation.id]
              const scenarioData = JSON.parse(simulation.scenario_data)

              return (
                <Card key={simulation.id} className="group hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="text-lg text-balance leading-tight">{simulation.title}</CardTitle>
                        <p className="text-sm text-muted-foreground text-pretty">{simulation.description}</p>
                      </div>
                      {userAttempt?.completed && (
                        <div className="flex flex-col items-end space-y-1">
                          <Badge variant="default" className="text-xs">
                            {userAttempt.score ? `${userAttempt.score}%` : "Completed"}
                          </Badge>
                          <Trophy className="h-4 w-4 text-yellow-500" />
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <Badge variant="secondary" className="text-xs capitalize">
                          {simulation.difficulty_level}
                        </Badge>
                        <div className="flex items-center text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {simulation.estimated_duration} min
                        </div>
                      </div>
                      <span className="text-muted-foreground capitalize">
                        {scenarioData.scenario?.replace("_", " ") || "Interactive"}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Category</span>
                        <span className="capitalize">{simulation.category.replace("-", " ")}</span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Type</span>
                        <span className="capitalize">{scenarioData.scenario?.replace("_", " ") || "Scenario"}</span>
                      </div>
                    </div>

                    <Button className="w-full" asChild>
                      <Link href={`/simulations/${simulation.id}`}>
                        <Play className="h-4 w-4 mr-2" />
                        {userAttempt?.completed ? "Replay Simulation" : "Start Simulation"}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {(!simulations || simulations.length === 0) && (
            <Card>
              <CardContent className="p-12 text-center">
                <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No simulations available</h3>
                <p className="text-muted-foreground">
                  Check back later for new cybersecurity simulations to practice your skills.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
